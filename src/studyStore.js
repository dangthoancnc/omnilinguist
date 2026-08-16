import { initCard, scheduleCard, isDue, daysUntilDue, State } from './fsrs.js';
import { supabase } from './lib/supabaseClient.js';
import { db } from './db.js';
import { getActiveUserId, setActiveUser, isGuest, getStorageKey, onUserChange, checkGuestQuota, cleanupExpiredGuestData } from './identityManager.js';

// ---- OFFLINE QUEUE WORKER ----
let isSyncing = false;
export async function processSyncQueue() {
  if (isSyncing || !navigator.onLine) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  
  isSyncing = true;
  try {
    // Chỉ xử lý tasks thuộc về user đang active (phân tách sync queue)
    const activeId = getActiveUserId();
    const queue = await db.syncQueue.orderBy('timestamp').toArray();
    const userQueue = queue.filter(t => !t.owner_id || t.owner_id === activeId || t.owner_id === session.user.id);
    if (userQueue.length === 0) {
      isSyncing = false;
      return;
    }
    
    console.log(`🔄 Bắt đầu đồng bộ ${userQueue.length} tác vụ từ hàng đợi Offline...`);
    
    // Ensure profile exists for FK constraints
    try {
      await supabase.from('omni_profiles').upsert({ id: session.user.id }, { onConflict: 'id', ignoreDuplicates: true });
    } catch (e) {}
    
    for (const task of userQueue) {
      const { table, payload, id } = task;
      // Add user_id to payload if missing
      if (!payload.user_id && table !== 'omni_profiles') payload.user_id = session.user.id;
      if (!payload.id && table === 'omni_profiles') payload.id = session.user.id;
      
      const { error } = await supabase.from(table).upsert(payload);
      if (!error) {
        await db.syncQueue.delete(id);
      } else {
        console.error(`❌ Lỗi đồng bộ bảng ${table}:`, error);
        if (error.code === 'PGRST204' || error.code === '42P01' || error.code === '23503' || error.status === 400 || (error.message && error.message.includes('Could not find'))) {
          console.warn(`⚠️ Đã tự động dọn dẹp tác vụ không tương thích sơ đồ DB (Bảng: ${table}, Lỗi: ${error.message})`);
          await db.syncQueue.delete(id);
        } else {
          break;
        }
      }
    }
  } catch (err) {
    console.error("Queue Processor Error:", err);
  }
  isSyncing = false;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', processSyncQueue);
  // Dọn dẹp dữ liệu Guest đã hết hạn backup khi app khởi động
  cleanupExpiredGuestData();
}

async function enqueueSync(table, payload) {
  const ownerId = getActiveUserId();
  await db.syncQueue.add({ table, payload, owner_id: ownerId, status: 'pending', timestamp: new Date().toISOString() });
  processSyncQueue();
}

// ── User ID Management (delegated to identityManager) ──
let memoryStore = null;

// Backward-compat: components that call setUserId() will now delegate to identityManager
export function setUserId(id) {
  setActiveUser(id);
  memoryStore = null; // Reset memory store when user changes
}

// Listen for user changes from identityManager
onUserChange(() => {
  memoryStore = null;
});

// ── Đọc toàn bộ store ──
function loadStore() {
  if (memoryStore) return memoryStore;
  try {
    memoryStore = JSON.parse(localStorage.getItem(getStorageKey('fsrs_store')) || '{}');
  } catch { memoryStore = {}; }
  return memoryStore;
}

// ── Ghi store ──
function saveStore(store) {
  memoryStore = store;
  localStorage.setItem(getStorageKey('fsrs_store'), JSON.stringify(store));
}

// ── Lấy card ──
export function getCard(cardId) {
  const store = loadStore();
  return store[cardId] || null;
}

// ── Cập nhật card lộ trình (Push to Cloud) ──
export function reviewRoadmapCard(cardId, rating) {
  const store = loadStore();
  const card = store[cardId] || initCard(cardId);
  const scheduledCard = scheduleCard(card, rating);
  scheduledCard.updated_at = new Date().toISOString();
  scheduledCard.last_rating = rating; // Lưu lại đánh giá cuối
  store[cardId] = scheduledCard;
  saveStore(store);

  // Đẩy vào hàng đợi Offline
  enqueueSync('omni_fsrs_cards', {
    card_id: cardId,
    state: scheduledCard.state,
    due: scheduledCard.due ? new Date(scheduledCard.due).toISOString() : null,
    stability: scheduledCard.stability,
    difficulty: scheduledCard.difficulty,
    reps: scheduledCard.reps,
    updated_at: scheduledCard.updated_at
  });

  // Ghi log review (SRS)
  logReview(cardId, 'vocab_srs', rating);

  return store[cardId];
}

// ── Lịch sử lật thẻ hôm nay (Review Logs) ──
export function logReview(cardId, moduleType, rating) {
  const dateStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const key = getStorageKey(`review_logs_${dateStr}`);
  try {
    const logs = JSON.parse(localStorage.getItem(key) || '[]');
    logs.push({ cardId, moduleType, rating, time: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(logs));
  } catch(e) {}
  
  // Push to cloud (dùng crypto.randomUUID() để làm ID giả cho lệnh upsert)
  enqueueSync('omni_review_logs', {
    id: crypto.randomUUID(),
    card_id: cardId,
    module_type: moduleType,
    rating: rating,
    review_time: new Date().toISOString()
  });
}

export function getTodayStats() {
  const dateStr = new Date().toLocaleDateString('en-CA');
  const key = getStorageKey(`review_logs_${dateStr}`);
  try {
    const logs = JSON.parse(localStorage.getItem(key) || '[]');
    const cardMap = {};
    logs.forEach(l => {
      cardMap[l.cardId] = l.rating;
    });
    const uniqueCardIds = Object.keys(cardMap);
    const total = uniqueCardIds.length;
    let correct = 0;
    let incorrect = 0;
    uniqueCardIds.forEach(id => {
      const rating = cardMap[id];
      if (rating <= 2) incorrect++;
      else correct++;
    });
    return { total, correct, incorrect };
  } catch {
    return { total: 0, correct: 0, incorrect: 0 };
  }
}

export function getTodayReviewedCardIds() {
  const dateStr = new Date().toLocaleDateString('en-CA');
  const key = getStorageKey(`review_logs_${dateStr}`);
  try {
    const logs = JSON.parse(localStorage.getItem(key) || '[]');
    return [...new Set(logs.map(l => l.cardId))];
  } catch {
    return [];
  }
}

// ── Cập nhật thẻ Học Tự Do (Free Study) ──
export function reviewFreeStudyCard(cardId, isCorrect, moduleType = 'vocab') {
  try {
    const key = getStorageKey('freestudy');
    const history = JSON.parse(localStorage.getItem(key) || '{}');
    const item = history[cardId] || { correct: 0, incorrect: 0 };
    
    if (isCorrect) item.correct++;
    else item.incorrect++;
    
    item.last_practiced = new Date().toISOString();
    history[cardId] = item;
    
    localStorage.setItem(key, JSON.stringify(history));

    enqueueSync('omni_freestudy_history', {
      module_type: moduleType,
      item_id: cardId,
      correct_count: item.correct,
      incorrect_count: item.incorrect,
      last_practiced: item.last_practiced
    });
    
    // Ghi log review
    logReview(cardId, moduleType, isCorrect ? 3 : 1);
    
    return item;
  } catch (err) {
    console.error('Free Study review error:', err);
    return null;
  }
}

// ── Bookmarks ──
export function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey('bookmarks')) || '[]');
  } catch { return []; }
}
export function toggleBookmark(cardId) {
  let marks = getBookmarks();
  if (marks.includes(cardId)) {
    marks = marks.filter(id => id !== cardId);
  } else {
    marks.push(cardId);
  }
  localStorage.setItem(getStorageKey('bookmarks'), JSON.stringify(marks));
  return marks.includes(cardId);
}
export function isBookmarked(cardId) {
  return getBookmarks().includes(cardId);
}

// ── Lấy tất cả cards đến hạn hôm nay theo level ──
export function getDueCards(allVocabIds) {
  const store = loadStore();
  const now = new Date();
  return allVocabIds.filter(id => {
    const card = store[id];
    if (!card) return true; // New card, luôn due
    return isDue(card, now);
  });
}

export function getFreeStudyHistory() {
  try {
    const key = getStorageKey('freestudy');
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch { return {}; }
}

// ── Thống kê tổng hợp ──
export function getStats(allVocabIds, learningMode = 'roadmap') {
  const store = loadStore();
  const freeStudyHist = getFreeStudyHistory();
  const now = new Date();
  let newCount = 0, dueCount = 0, learnedCount = 0;

  allVocabIds.forEach(id => {
    const card = store[id];
    const fsHist = freeStudyHist[id];
    if (learningMode === 'freestudy') {
      if (fsHist && (fsHist.correct > 0 || fsHist.incorrect > 0)) {
        learnedCount++;
      } else {
        newCount++;
      }
    } else {
      if (!card || card.state === State.New) {
        newCount++;
      } else if (isDue(card, now)) {
        dueCount++;
      } else {
        learnedCount++;
      }
    }
  });

  return { newCount, dueCount, learnedCount, total: allVocabIds.length };
}

// ── Lấy thông tin ngày ôn tiếp theo ──
export function getNextDueInfo(cardId) {
  const store = loadStore();
  const card = store[cardId];
  if (!card || card.state === State.New) return { label: 'Mới', days: 0 };
  const days = daysUntilDue(card);
  if (days <= 0) return { label: 'Đến hạn hôm nay!', days: 0 };
  if (days === 1) return { label: 'Ôn lại ngày mai', days: 1 };
  return { label: `Ôn lại sau ${days} ngày`, days };
}

// ── User Profile & Roadmap Progress ──
export function getUserProfile() {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey('profile')) || 'null');
  } catch { return null; }
}

export function saveUserProfile(profile) {
  const current = getUserProfile() || {};
  const updatedProfile = {
    ...current,
    ...profile,
    startDate: current.startDate || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(getStorageKey('profile'), JSON.stringify(updatedProfile));

  // Đẩy vào hàng đợi Offline
  enqueueSync('omni_profiles', {
    current_level: updatedProfile.currentLevel,
    target_level: updatedProfile.targetLevel,
    current_phase: updatedProfile.currentPhase,
    updated_at: updatedProfile.updatedAt
  });
}

export function advancePhase() {
  const p = getUserProfile();
  if (p) {
    saveUserProfile({ currentPhase: (p.currentPhase || 0) + 1 });
  }
}

// ── Streak tracking ──
export function updateStreak() {
  try {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem(getStorageKey('streak')) || '{"streak":0,"lastDate":""}');
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDate === today) return data.streak;
    if (data.lastDate === yesterday) {
      const updated = { streak: data.streak + 1, lastDate: today, updated_at: new Date().toISOString() };
      localStorage.setItem(getStorageKey('streak'), JSON.stringify(updated));
      syncStreakToCloud(updated);
      return updated.streak;
    }
    const reset = { streak: 1, lastDate: today, updated_at: new Date().toISOString() };
    localStorage.setItem(getStorageKey('streak'), JSON.stringify(reset));
    syncStreakToCloud(reset);
    return 1;
  } catch {
    // localStorage bị corrupt — reset về 0
    const reset = { streak: 1, lastDate: new Date().toDateString(), updated_at: new Date().toISOString() };
    localStorage.setItem(getStorageKey('streak'), JSON.stringify(reset));
    return 1;
  }
}

function syncStreakToCloud(streakData) {
  enqueueSync('omni_streaks', {
    current_streak: streakData.streak,
    last_study_date: streakData.lastDate,
    updated_at: streakData.updated_at
  });
}

export function getStreak() {
  try {
    const data = JSON.parse(localStorage.getItem(getStorageKey('streak')) || '{"streak":0}');
    return data?.streak || 0;
  } catch { return 0; }
}

// ── Custom Flashcards (added from Immersion Reader) ──

export function getCustomCards() {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey('custom_cards')) || '[]');
  } catch { return []; }
}

export function addCustomCard(card) {
  const cards = getCustomCards();
  // Ensure we don't add duplicate words
  if (!cards.some(c => c.word === card.word)) {
    localStorage.setItem(getStorageKey('custom_cards'), JSON.stringify([...cards, card]));
    
    // Đẩy vào hàng đợi Offline
    enqueueSync('omni_custom_cards', {
      word: card.word,
      reading: card.reading || '',
      meaning: card.meaning || ''
    });

    return true;
  }
  return false;
}

/**
 * Đẩy hết sync queue của một user cụ thể trước khi đăng xuất.
 * Đảm bảo không mất dữ liệu khi chuyển tài khoản.
 */
export async function flushSyncQueueForUser(userId) {
  if (!navigator.onLine) {
    console.warn('⚠️ Không thể flush sync queue: offline');
    return false;
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  try {
    const queue = await db.syncQueue.orderBy('timestamp').toArray();
    const userTasks = queue.filter(t => t.owner_id === userId || (!t.owner_id && userId === session.user.id));
    
    for (const task of userTasks) {
      const { table, payload, id } = task;
      if (!payload.user_id && table !== 'omni_profiles') payload.user_id = session.user.id;
      if (!payload.id && table === 'omni_profiles') payload.id = session.user.id;
      
      const { error } = await supabase.from(table).upsert(payload);
      if (!error) {
        await db.syncQueue.delete(id);
      } else {
        console.error(`❌ Flush sync lỗi bảng ${table}:`, error);
        // Xóa tác vụ không tương thích
        if (error.code === 'PGRST204' || error.code === '42P01' || error.code === '23503' || error.status === 400) {
          await db.syncQueue.delete(id);
        }
      }
    }
    console.log(`✅ Đã flush ${userTasks.length} tác vụ sync cho user ${userId}`);
    return true;
  } catch (err) {
    console.error('Flush sync queue error:', err);
    return false;
  }
}

// ── Background Pull Sync (Down from Cloud) ──
export async function pullCloudData() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  try {
    let hasAnyUpdates = false;

    // 1. Pull Profile
    const { data: profile } = await supabase.from('omni_profiles').select('*').maybeSingle();
    if (profile) {
      const localProfile = getUserProfile() || {};
      if (!localProfile.updatedAt || new Date(profile.updated_at) > new Date(localProfile.updatedAt)) {
        const target = profile.target_level || 'N3';
        localStorage.setItem(getStorageKey('profile'), JSON.stringify({
          currentLevel: profile.current_level || 'N4',
          targetLevel: target,
          goal: target,
          goalLabel: target,
          currentPhase: profile.current_phase || 0,
          updatedAt: profile.updated_at
        }));
        hasAnyUpdates = true;
      }
    }

    // 2. Pull Streaks
    const { data: streak } = await supabase.from('omni_streaks').select('*').maybeSingle();
    if (streak) {
      const localStreak = JSON.parse(localStorage.getItem(getStorageKey('streak')) || '{"streak":0}');
      if (!localStreak.updated_at || new Date(streak.updated_at) > new Date(localStreak.updated_at)) {
        localStorage.setItem(getStorageKey('streak'), JSON.stringify({
          streak: streak.current_streak || 0,
          lastDate: streak.last_study_date || '',
          updated_at: streak.updated_at
        }));
        hasAnyUpdates = true;
      }
    }

    // 3. Pull FSRS Cards
    const { data: cards } = await supabase.from('omni_fsrs_cards').select('*');
    if (cards && cards.length > 0) {
      const store = loadStore();
      let hasUpdates = false;
      cards.forEach(c => {
        const localCard = store[c.card_id];
        if (!localCard || !localCard.updated_at || new Date(c.updated_at) > new Date(localCard.updated_at)) {
          store[c.card_id] = {
            state: c.state,
            due: c.due,
            stability: c.stability,
            difficulty: c.difficulty,
            reps: c.reps,
            last_review: c.updated_at, // Use updated_at as proxy for last_review
            updated_at: c.updated_at
          };
          hasUpdates = true;
          hasAnyUpdates = true;
        }
      });
      if (hasUpdates) {
        saveStore(store);
      }
    }

    // 4. Pull Free Study History
    try {
      const { data: freeStudy, error: fsErr } = await supabase.from('omni_freestudy_history').select('*');
      if (!fsErr && freeStudy && freeStudy.length > 0) {
        const localHistory = JSON.parse(localStorage.getItem(getStorageKey('freestudy')) || '{}');
        let fsUpdates = false;
        freeStudy.forEach(fs => {
          const localItem = localHistory[fs.item_id];
          if (!localItem || !localItem.last_practiced || new Date(fs.last_practiced) > new Date(localItem.last_practiced)) {
            localHistory[fs.item_id] = {
              correct: fs.correct_count || 0,
              incorrect: fs.incorrect_count || 0,
              last_practiced: fs.last_practiced
            };
            fsUpdates = true;
            hasAnyUpdates = true;
          }
        });
        if (fsUpdates) {
          localStorage.setItem(getStorageKey('freestudy'), JSON.stringify(localHistory));
        }
      }
    } catch (e) { console.warn('Pull free study history skipped:', e.message); }

    // 5. Pull Custom Cards
    try {
      const { data: customCards, error: ccErr } = await supabase.from('omni_custom_cards').select('*');
      if (!ccErr && customCards && customCards.length > 0) {
        const localCards = JSON.parse(localStorage.getItem(getStorageKey('custom_cards')) || '[]');
        const localWords = new Set(localCards.map(c => c.word));
        let newCards = false;
        customCards.forEach(cc => {
          if (!localWords.has(cc.word)) {
            localCards.push({ word: cc.word, reading: cc.reading || '', meaning: cc.meaning || '' });
            newCards = true;
            hasAnyUpdates = true;
          }
        });
        if (newCards) {
          localStorage.setItem(getStorageKey('custom_cards'), JSON.stringify(localCards));
        }
      }
    } catch (e) { console.warn('Pull custom cards skipped:', e.message); }

    // 6. Pull Bookmarks
    try {
      const { data: bookmarks, error: bmErr } = await supabase.from('omni_bookmarks').select('*');
      if (!bmErr && bookmarks && bookmarks.length > 0) {
        const localBookmarks = JSON.parse(localStorage.getItem(getStorageKey('bookmarks')) || '[]');
        const merged = [...new Set([...localBookmarks, ...bookmarks.map(b => b.card_id)])];
        if (merged.length > localBookmarks.length) {
          localStorage.setItem(getStorageKey('bookmarks'), JSON.stringify(merged));
          hasAnyUpdates = true;
        }
      }
    } catch (e) { console.warn('Pull bookmarks skipped:', e.message); }

    return hasAnyUpdates;
  } catch (err) {
    console.error('Pull Cloud Data Failed:', err);
    return false;
  }
}

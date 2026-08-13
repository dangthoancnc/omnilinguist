import { initCard, scheduleCard, isDue, daysUntilDue, State } from './fsrs.js';
import { supabase } from './lib/supabaseClient.js';
import { db } from './db.js';

// ---- OFFLINE QUEUE WORKER ----
let isSyncing = false;
export async function processSyncQueue() {
  if (isSyncing || !navigator.onLine) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  
  isSyncing = true;
  try {
    const queue = await db.syncQueue.orderBy('timestamp').toArray();
    if (queue.length === 0) {
      isSyncing = false;
      return;
    }
    
    console.log(`🔄 Bắt đầu đồng bộ ${queue.length} tác vụ từ hàng đợi Offline...`);
    
    // Ensure profile exists for FK constraints
    try {
      await supabase.from('omni_profiles').upsert({ id: session.user.id }, { onConflict: 'id', ignoreDuplicates: true });
    } catch (e) {}
    
    for (const task of queue) {
      const { table, payload, id } = task;
      // Add user_id to payload if missing
      if (!payload.user_id && table !== 'omni_profiles') payload.user_id = session.user.id;
      if (!payload.id && table === 'omni_profiles') payload.id = session.user.id;
      
      const { error } = await supabase.from(table).upsert(payload);
      if (!error) {
        await db.syncQueue.delete(id);
      } else {
        console.error(`❌ Lỗi đồng bộ bảng ${table}:`, error);
        // Nếu lỗi do cột/bảng không tồn tại (PGRST204, 42P01) hoặc lỗi 400 bad request -> Xóa tác vụ hỏng để không làm tắc nghẽn toàn bộ hàng đợi sync!
        if (error.code === 'PGRST204' || error.code === '42P01' || error.code === '23503' || error.status === 400 || (error.message && error.message.includes('Could not find'))) {
          console.warn(`⚠️ Đã tự động dọn dẹp tác vụ không tương thích sơ đồ DB (Bảng: ${table}, Lỗi: ${error.message})`);
          await db.syncQueue.delete(id);
        } else {
          break; // Dừng lại ở đây nếu là lỗi mạng để chờ kết nối lại
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
}

async function enqueueSync(table, payload) {
  await db.syncQueue.add({ table, payload, status: 'pending', timestamp: new Date().toISOString() });
  processSyncQueue();
}

let currentUserId = null;

export function setUserId(id) {
  currentUserId = id;
  memoryStore = null; // Reset memory store when user changes
}

const getStoreKey = () => currentUserId ? `omnilinguist_study_store_${currentUserId}` : 'omnilinguist_study_store_guest';
const getProfileKey = () => currentUserId ? `omnilinguist_user_profile_${currentUserId}` : 'omnilinguist_user_profile_guest';
const getStreakKey = () => currentUserId ? `omnilinguist_streak_${currentUserId}` : 'omnilinguist_streak_guest';
const getBookmarksKey = () => currentUserId ? `omnilinguist_bookmarks_${currentUserId}` : 'omnilinguist_bookmarks_guest';
const getCustomCardsKey = () => currentUserId ? `omnilinguist_custom_cards_${currentUserId}` : 'omnilinguist_custom_cards_guest';
const getFreeStudyKey = () => currentUserId ? `omnilinguist_freestudy_history_${currentUserId}` : 'omnilinguist_freestudy_history_guest';

// ── Đọc toàn bộ store ──
let memoryStore = null;

function loadStore() {
  if (memoryStore) return memoryStore;
  try {
    memoryStore = JSON.parse(localStorage.getItem(getStoreKey()) || '{}');
  } catch { memoryStore = {}; }
  return memoryStore;
}

// ── Ghi store ──
function saveStore(store) {
  memoryStore = store;
  localStorage.setItem(getStoreKey(), JSON.stringify(store));
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

  return store[cardId];
}

// ── Cập nhật thẻ Học Tự Do (Free Study) ──
export function reviewFreeStudyCard(cardId, isCorrect, moduleType = 'vocab') {
  try {
    const key = getFreeStudyKey();
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
    return item;
  } catch (err) {
    console.error('Free Study review error:', err);
    return null;
  }
}

// ── Bookmarks ──
export function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(getBookmarksKey()) || '[]');
  } catch { return []; }
}
export function toggleBookmark(cardId) {
  let marks = getBookmarks();
  if (marks.includes(cardId)) {
    marks = marks.filter(id => id !== cardId);
  } else {
    marks.push(cardId);
  }
  localStorage.setItem(getBookmarksKey(), JSON.stringify(marks));
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
    const key = getFreeStudyKey();
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
    return JSON.parse(localStorage.getItem(getProfileKey()) || 'null');
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
  localStorage.setItem(getProfileKey(), JSON.stringify(updatedProfile));

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
  const today = new Date().toDateString();
  const data = JSON.parse(localStorage.getItem(getStreakKey()) || '{"streak":0,"lastDate":""}');
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (data.lastDate === today) return data.streak;
  if (data.lastDate === yesterday) {
    const updated = { streak: data.streak + 1, lastDate: today, updated_at: new Date().toISOString() };
    localStorage.setItem(getStreakKey(), JSON.stringify(updated));
    syncStreakToCloud(updated);
    return updated.streak;
  }
  const reset = { streak: 1, lastDate: today, updated_at: new Date().toISOString() };
  localStorage.setItem(getStreakKey(), JSON.stringify(reset));
  syncStreakToCloud(reset);
  return 1;
}

function syncStreakToCloud(streakData) {
  enqueueSync('omni_streaks', {
    current_streak: streakData.streak,
    last_study_date: streakData.lastDate,
    updated_at: streakData.updated_at
  });
}

export function getStreak() {
  const data = JSON.parse(localStorage.getItem(getStreakKey()) || '{"streak":0}');
  return data.streak;
}

// ── Custom Flashcards (added from Immersion Reader) ──

export function getCustomCards() {
  try {
    return JSON.parse(localStorage.getItem(getCustomCardsKey()) || '[]');
  } catch { return []; }
}

export function addCustomCard(card) {
  const cards = getCustomCards();
  // Ensure we don't add duplicate words
  if (!cards.some(c => c.word === card.word)) {
    localStorage.setItem(getCustomCardsKey(), JSON.stringify([...cards, card]));
    
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
        localStorage.setItem(getProfileKey(), JSON.stringify({
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
      const localStreak = JSON.parse(localStorage.getItem(getStreakKey()) || '{"streak":0}');
      if (!localStreak.updated_at || new Date(streak.updated_at) > new Date(localStreak.updated_at)) {
        localStorage.setItem(getStreakKey(), JSON.stringify({
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
    
    return hasAnyUpdates;
  } catch (err) {
    console.error('Pull Cloud Data Failed:', err);
    return false;
  }
}

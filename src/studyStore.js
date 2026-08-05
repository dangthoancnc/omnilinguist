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
        break; // Dừng lại ở đây để bảo toàn thứ tự thực thi
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


const STORE_KEY = 'omnilinguist_study_store';
const PROFILE_KEY = 'omnilinguist_user_profile';

// ── Đọc toàn bộ store ──
let memoryStore = null;

function loadStore() {
  if (memoryStore) return memoryStore;
  try {
    memoryStore = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  } catch { memoryStore = {}; }
  return memoryStore;
}

// ── Ghi store ──
function saveStore(store) {
  memoryStore = store;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

// ── Lấy card ──
export function getCard(cardId) {
  const store = loadStore();
  return store[cardId] || null;
}

// ── Cập nhật card sau review (Push to Cloud) ──
export function reviewCard(cardId, rating) {
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

// ── Bookmarks ──
const BOOKMARKS_KEY = 'omnilinguist_bookmarks';
export function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
  } catch { return []; }
}
export function toggleBookmark(cardId) {
  let marks = getBookmarks();
  if (marks.includes(cardId)) {
    marks = marks.filter(id => id !== cardId);
  } else {
    marks.push(cardId);
  }
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(marks));
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

// ── Thống kê tổng hợp ──
export function getStats(allVocabIds) {
  const store = loadStore();
  const now = new Date();
  let newCount = 0, dueCount = 0, learnedCount = 0;

  allVocabIds.forEach(id => {
    const card = store[id];
    if (!card || card.state === State.New) {
      newCount++;
    } else if (isDue(card, now)) {
      dueCount++;
    } else {
      learnedCount++;
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
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
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
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));

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
const STREAK_KEY = 'omnilinguist_streak';
export function updateStreak() {
  const today = new Date().toDateString();
  const data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"streak":0,"lastDate":""}');
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (data.lastDate === today) return data.streak;
  if (data.lastDate === yesterday) {
    const updated = { streak: data.streak + 1, lastDate: today, updated_at: new Date().toISOString() };
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
    syncStreakToCloud(updated);
    return updated.streak;
  }
  const reset = { streak: 1, lastDate: today, updated_at: new Date().toISOString() };
  localStorage.setItem(STREAK_KEY, JSON.stringify(reset));
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
  const data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"streak":0}');
  return data.streak;
}

// ── Custom Flashcards (added from Immersion Reader) ──
const CUSTOM_CARDS_KEY = 'omnilinguist_custom_cards';

export function getCustomCards() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_CARDS_KEY) || '[]');
  } catch { return []; }
}

export function addCustomCard(card) {
  const cards = getCustomCards();
  // Ensure we don't add duplicate words
  if (!cards.some(c => c.word === card.word)) {
    localStorage.setItem(CUSTOM_CARDS_KEY, JSON.stringify([...cards, card]));
    
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
        localStorage.setItem(PROFILE_KEY, JSON.stringify({
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
      const localStreak = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"streak":0}');
      if (!localStreak.updated_at || new Date(streak.updated_at) > new Date(localStreak.updated_at)) {
        localStorage.setItem(STREAK_KEY, JSON.stringify({
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

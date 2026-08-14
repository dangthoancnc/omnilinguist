/**
 * identityManager.js — Central Identity & Namespace Manager
 * 
 * Quản lý toàn bộ lifecycle của Identity trong OmniLinguist:
 * - Guest UUID tự động tạo (Progressive Engagement à la Duolingo)
 * - Namespace phân tách 100% dữ liệu giữa các user
 * - Atomic Migration: Guest → Registered (giữ 7 ngày backup)
 * - An toàn khi chuyển đổi tài khoản giữa chừng
 */

const GUEST_UUID_KEY = 'omni_guest_uuid';
const GUEST_BACKUP_EXPIRY_KEY = 'omni_guest_backup_expiry';
const GUEST_CARD_LIMIT = 500; // Giới hạn free study history cho Guest → khuyến khích đăng ký
const BACKUP_DAYS = 7;

let activeUserId = null;
const listeners = new Set();

// ─── Guest UUID Management ─────────────────────────────────────────

/**
 * Tạo hoặc đọc Guest UUID đã có.
 * Guest UUID bền vững trên thiết bị (không mất khi đóng app).
 */
export function getOrCreateGuestId() {
  let guestId = localStorage.getItem(GUEST_UUID_KEY);
  if (!guestId) {
    // Tạo UUID ngắn 8 ký tự cho gọn (đủ unique cho single-device)
    const uuid = crypto.randomUUID ? crypto.randomUUID() : 
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    guestId = `guest_${uuid.split('-')[0]}`;
    localStorage.setItem(GUEST_UUID_KEY, guestId);
  }
  return guestId;
}

/**
 * Kiểm tra xem Guest UUID đã tồn tại chưa (không tạo mới).
 */
export function getExistingGuestId() {
  return localStorage.getItem(GUEST_UUID_KEY);
}

// ─── Active User Management ────────────────────────────────────────

/**
 * Thiết lập userId đang active.
 * Gọi khi: app khởi động, đăng nhập, đăng xuất, migration.
 * @param {string|null} userId - Supabase user.id hoặc null (chuyển về Guest)
 */
export function setActiveUser(userId) {
  if (userId) {
    activeUserId = userId;
  } else {
    activeUserId = getOrCreateGuestId();
  }
  // Thông báo cho tất cả listeners (studyStore, Settings, v.v.)
  listeners.forEach(fn => {
    try { fn(activeUserId); } catch(e) { console.error('[IdentityManager] Listener error:', e); }
  });
  return activeUserId;
}

/**
 * Lấy userId đang active. Không bao giờ trả null.
 */
export function getActiveUserId() {
  if (!activeUserId) {
    activeUserId = getOrCreateGuestId();
  }
  return activeUserId;
}

/**
 * Kiểm tra user hiện tại có phải Guest không.
 */
export function isGuest() {
  return getActiveUserId().startsWith('guest_');
}

/**
 * Đăng ký listener khi userId thay đổi.
 * @returns {Function} unsubscribe function
 */
export function onUserChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// ─── Storage Key Namespace ─────────────────────────────────────────

/**
 * Tạo storage key có namespace theo user hiện tại.
 * @param {string} feature - Tên feature (profile, streak, bookmarks, settings, fsrs_store, freestudy, custom_cards)
 * @returns {string} - "omni_{userId}_{feature}"
 */
export function getStorageKey(feature) {
  return `omni_${getActiveUserId()}_${feature}`;
}

/**
 * Tạo storage key cho một userId cụ thể (dùng trong migration).
 * @param {string} userId 
 * @param {string} feature 
 * @returns {string}
 */
export function getStorageKeyFor(userId, feature) {
  return `omni_${userId}_${feature}`;
}

// ─── Danh sách các feature keys ────────────────────────────────────

export const FEATURES = [
  'profile',
  'streak',
  'bookmarks',
  'custom_cards',
  'fsrs_store',
  'freestudy',
  'settings',
];

// ─── Guest Quota ───────────────────────────────────────────────────

/**
 * Kiểm tra Guest đã đạt giới hạn free study chưa.
 * @returns {{ isLimited: boolean, current: number, limit: number }}
 */
export function checkGuestQuota() {
  if (!isGuest()) return { isLimited: false, current: 0, limit: Infinity };
  
  try {
    const historyRaw = localStorage.getItem(getStorageKey('freestudy'));
    const history = historyRaw ? JSON.parse(historyRaw) : {};
    const current = Object.keys(history).length;
    return { isLimited: current >= GUEST_CARD_LIMIT, current, limit: GUEST_CARD_LIMIT };
  } catch {
    return { isLimited: false, current: 0, limit: GUEST_CARD_LIMIT };
  }
}

// ─── Atomic Migration: Guest → Registered ──────────────────────────

/**
 * Chuyển toàn bộ dữ liệu từ Guest namespace sang User namespace.
 * Giữ dữ liệu Guest làm backup 7 ngày.
 * 
 * @param {string} newUserId - Supabase user.id sau khi đăng ký thành công
 * @returns {{ migratedFeatures: string[], totalItems: number }}
 */
export function migrateGuestToUser(newUserId) {
  const guestId = getExistingGuestId();
  if (!guestId) {
    console.warn('[IdentityManager] No guest data to migrate.');
    return { migratedFeatures: [], totalItems: 0 };
  }

  const migratedFeatures = [];
  let totalItems = 0;

  FEATURES.forEach(feature => {
    const guestKey = getStorageKeyFor(guestId, feature);
    const userKey = getStorageKeyFor(newUserId, feature);
    const data = localStorage.getItem(guestKey);

    if (data) {
      // Chỉ ghi đè nếu user chưa có dữ liệu cho feature này
      const existingUserData = localStorage.getItem(userKey);
      if (!existingUserData) {
        localStorage.setItem(userKey, data);
        migratedFeatures.push(feature);
        try {
          const parsed = JSON.parse(data);
          totalItems += typeof parsed === 'object' ? Object.keys(parsed).length : 1;
        } catch {
          totalItems += 1;
        }
      }
    }
  });

  // Đặt thời hạn xóa backup Guest = 7 ngày
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + BACKUP_DAYS);
  localStorage.setItem(GUEST_BACKUP_EXPIRY_KEY, JSON.stringify({
    guestId,
    expiresAt: expiryDate.toISOString(),
    migratedTo: newUserId,
    migratedAt: new Date().toISOString(),
  }));

  // Cập nhật active user
  setActiveUser(newUserId);

  console.log(`✅ [IdentityManager] Migrated ${migratedFeatures.length} features (${totalItems} items) from ${guestId} → ${newUserId}`);
  return { migratedFeatures, totalItems };
}

/**
 * Dọn dẹp dữ liệu Guest đã hết hạn backup (gọi khi app khởi động).
 */
export function cleanupExpiredGuestData() {
  try {
    const backupRaw = localStorage.getItem(GUEST_BACKUP_EXPIRY_KEY);
    if (!backupRaw) return;

    const backup = JSON.parse(backupRaw);
    const now = new Date();
    const expiry = new Date(backup.expiresAt);

    if (now > expiry) {
      // Xóa toàn bộ dữ liệu Guest đã hết hạn
      const guestId = backup.guestId;
      FEATURES.forEach(feature => {
        localStorage.removeItem(getStorageKeyFor(guestId, feature));
      });
      localStorage.removeItem(GUEST_UUID_KEY);
      localStorage.removeItem(GUEST_BACKUP_EXPIRY_KEY);
      console.log(`🧹 [IdentityManager] Cleaned up expired guest data for ${guestId}`);
    }
  } catch (e) {
    console.warn('[IdentityManager] Error cleaning up guest data:', e);
  }
}

// ─── Account Switch Helpers ────────────────────────────────────────

/**
 * Lấy danh sách tất cả localStorage keys thuộc về một userId.
 * @param {string} userId 
 * @returns {string[]}
 */
export function getKeysForUser(userId) {
  const prefix = `omni_${userId}_`;
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Kiểm tra thiết bị có dữ liệu local của userId này không.
 * @param {string} userId 
 * @returns {boolean}
 */
export function hasLocalData(userId) {
  return getKeysForUser(userId).length > 0;
}

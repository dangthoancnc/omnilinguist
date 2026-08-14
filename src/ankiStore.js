/**
 * ankiStore.js — Anki Universal Sandbox Directory Handle Persistence
 * 
 * Lưu trữ và khôi phục FileSystemDirectoryHandle của Anki Workspace vào IndexedDB.
 * Tự động nhớ thư mục mặc định (apps/omnilinguist/anki_universal_sandbox).
 */

const DB_NAME = 'OmniLinguist_AnkiStore';
const STORE_NAME = 'handles';
export const DEFAULT_ANKI_FOLDER = 'apps/omnilinguist/anki_universal_sandbox';

function openAnkiDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Lưu FileSystemDirectoryHandle vào IndexedDB
 */
export async function saveAnkiWorkspaceHandle(handle, pathName = null) {
  try {
    const db = await openAnkiDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(handle, 'workspace_handle');
    const nameToSave = pathName || handle.name || DEFAULT_ANKI_FOLDER;
    store.put(nameToSave, 'workspace_path');
    await new Promise((res) => { tx.oncomplete = res; });
    localStorage.setItem('omni_anki_workspace_name', nameToSave);
    console.log('✅ [AnkiStore] Saved workspace handle:', nameToSave);
    return true;
  } catch (err) {
    console.error('❌ [AnkiStore] Error saving handle:', err);
    return false;
  }
}

/**
 * Đọc FileSystemDirectoryHandle từ IndexedDB
 */
export async function getAnkiWorkspaceHandle() {
  try {
    const db = await openAnkiDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    const handleReq = store.get('workspace_handle');
    const pathReq = store.get('workspace_path');

    const handle = await new Promise((res) => { handleReq.onsuccess = () => res(handleReq.result); });
    const path = await new Promise((res) => { pathReq.onsuccess = () => res(pathReq.result); });

    const savedName = path || localStorage.getItem('omni_anki_workspace_name') || DEFAULT_ANKI_FOLDER;
    return { handle: handle || null, path: savedName };
  } catch (err) {
    console.error('❌ [AnkiStore] Error getting handle:', err);
    return { handle: null, path: localStorage.getItem('omni_anki_workspace_name') || DEFAULT_ANKI_FOLDER };
  }
}

/**
 * Kiểm tra và yêu cầu quyền truy cập thư mục từ trình duyệt
 */
export async function verifyHandlePermission(handle, readWrite = true) {
  if (!handle) return false;
  const options = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  try {
    if ((await handle.queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await handle.requestPermission(options)) === 'granted') {
      return true;
    }
  } catch (e) {
    console.warn('[AnkiStore] Permission query/request error:', e);
  }
  return false;
}

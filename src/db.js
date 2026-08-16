import Dexie from 'dexie';

// Khởi tạo cơ sở dữ liệu IndexedDB trên trình duyệt
export const db = new Dexie('OmniLinguistDB');

// Khai báo cấu trúc các bảng (chỉ cần định nghĩa Primary Key và Index)
db.version(1).stores({
  vocab: 'id, level, word',     // Có thể tìm kiếm nhanh theo level hoặc word
  grammar: 'id, level',
  kanji: 'id, level, kanji',
  shadowing: 'id, level, cat'
});

// Version 2: Hàng đợi đồng bộ Offline và nâng cấp Index
// QUAN TRỌNG: Mỗi version phải khai báo lại TẤT CẢ bảng, nếu không Dexie sẽ xóa bảng bị thiếu
db.version(2).stores({
  vocab: 'id, level, word, kanji',
  grammar: 'id, level',
  kanji: 'id, level, kanji',
  shadowing: 'id, level, cat',
  syncQueue: '++id, table, status, timestamp'
});

// Version 3: Playlists và Lưu file Media Offline cho Shadowing
db.version(3).stores({
  vocab: 'id, level, word, kanji',
  grammar: 'id, level',
  kanji: 'id, level, kanji',
  shadowing: 'id, level, cat',
  syncQueue: '++id, table, status, timestamp',
  playlists: 'id, title, createdAt',
  mediaFiles: 'id, name, type, date'
});

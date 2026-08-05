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
db.version(2).stores({
  vocab: 'id, level, word, kanji', 
  syncQueue: '++id, table, status, timestamp'
});

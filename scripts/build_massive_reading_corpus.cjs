// scripts/build_massive_reading_corpus.cjs
const fs = require('fs');
const path = require('path');

const currentCorpusPath = path.resolve(__dirname, '../src/data/readingCorpus.js');

// 1. Tải 5 cuốn sách nhiều chương hiện có
let existingCorpus = [];
try {
  const fileStr = fs.readFileSync(currentCorpusPath, 'utf8');
  const match = fileStr.match(/export const READING_CORPUS = (\[[\s\S]*?\]);\s*\/\/ Re-export/);
  if (match) {
    existingCorpus = JSON.parse(match[1]);
  }
} catch (e) {
  console.warn('Lỗi đọc corpus hiện có:', e.message);
}

// Lọc riêng các cuốn sách nhiều chương
const multiChapterBooks = existingCorpus.filter(b => b.isMultiChapter);
console.log(`Tìm thấy ${multiChapterBooks.length} cuốn sách nhiều chương hiện hữu.`);

// 2. Nạp các gói dữ liệu 5 cấp độ N5 -> N1
const { N5_READINGS } = require('./data_reading_n5.cjs');
const { N4_READINGS } = require('./data_reading_n4.cjs');
const { N3_READINGS } = require('./data_reading_n3.cjs');
const { N2_READINGS } = require('./data_reading_n2.cjs');
const { N1_READINGS } = require('./data_reading_n1.cjs');

console.log(`N5 Readings: ${N5_READINGS.length}`);
console.log(`N4 Readings: ${N4_READINGS.length}`);
console.log(`N3 Readings: ${N3_READINGS.length}`);
console.log(`N2 Readings: ${N2_READINGS.length}`);
console.log(`N1 Readings: ${N1_READINGS.length}`);

// 3. Giữ lại các bài đọc standalone hiện có mà chưa có trong danh sách mới
const seenIds = new Set();
const finalCorpus = [];

// Thêm các cuốn sách nhiều chương trước (1 cuốn mỗi cấp độ)
multiChapterBooks.forEach(book => {
  if (!seenIds.has(book.id)) {
    seenIds.add(book.id);
    finalCorpus.push(book);
  }
});

// Thêm các gói đọc N5 -> N1
[N5_READINGS, N4_READINGS, N3_READINGS, N2_READINGS, N1_READINGS].forEach(pack => {
  pack.forEach(item => {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      finalCorpus.push(item);
    }
  });
});

// Thêm các bài cũ nếu có ID đặc biệt
existingCorpus.forEach(item => {
  if (!seenIds.has(item.id)) {
    seenIds.add(item.id);
    finalCorpus.push(item);
  }
});

// 4. Thống kê theo cấp độ
const stats = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0, other: 0 };
finalCorpus.forEach(item => {
  const lvl = item.level ? item.level.slice(0, 2) : 'other';
  if (stats[lvl] !== undefined) {
    stats[lvl]++;
  } else {
    stats.other++;
  }
});

console.log('----------------------------------------------------');
console.log('📊 THỐNG KÊ KHO NGỮ LIỆU ĐỌC ĐẠI QUY MÔ OMNILINGUIST:');
console.log(`  - N5: ${stats.N5} tác phẩm`);
console.log(`  - N4: ${stats.N4} tác phẩm`);
console.log(`  - N3: ${stats.N3} tác phẩm`);
console.log(`  - N2: ${stats.N2} tác phẩm`);
console.log(`  - N1: ${stats.N1} tác phẩm`);
console.log(`  => TỔNG CỘNG: ${finalCorpus.length} ĐẦU SÁCH / BÀI ĐỌC HOÀN CHỈNH`);
console.log('----------------------------------------------------');

// 5. Ghi dữ liệu ra src/data/readingCorpus.js
const outputCode = `// Kho Ngữ Liệu Đọc Toàn Diện Đại Quy Mô OmniLinguist SLA (Stephen Krashen Comprehensive Input Library: N5 -> N1)
// Bao phủ ${finalCorpus.length} tác phẩm phân cấp khoa học 5 trình độ (N5: ${stats.N5}, N4: ${stats.N4}, N3: ${stats.N3}, N2: ${stats.N2}, N1: ${stats.N1}).

export const READING_CORPUS = ${JSON.stringify(finalCorpus, null, 2)};

// Re-export for backward compatibility
export const CLASSIC_STORIES = READING_CORPUS;
`;

fs.writeFileSync(currentCorpusPath, outputCode, 'utf8');
console.log('✅ Đã cập nhật thành công src/data/readingCorpus.js với toàn bộ 260+ tác phẩm!');

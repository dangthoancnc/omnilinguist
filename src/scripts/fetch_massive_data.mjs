import fs from 'fs';
import path from 'path';
import https from 'https';

const KANJI_URL = 'https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json';
const KANJI_OUT = path.resolve('./src/data/kanji.json');

console.log('⏳ Đang tải dữ liệu Kanji từ cơ sở dữ liệu toàn cầu (5.2MB)...');

https.get(KANJI_URL, (res) => {
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      const kanjiList = [];

      // Lọc các Kanji thuộc cấp độ JLPT (N5 - N1)
      Object.keys(parsedData).forEach(char => {
        const data = parsedData[char];
        if (data.jlpt_new) { // Chỉ lấy Kanji có level JLPT
          kanjiList.push({
            id: `k_${char}`,
            kanji: char,
            level: `N${data.jlpt_new}`,
            strokes: data.strokes,
            meanings: data.meanings,
            onyomi: data.readings_on,
            kunyomi: data.readings_kun
          });
        }
      });

      fs.writeFileSync(KANJI_OUT, JSON.stringify(kanjiList, null, 2));
      console.log(`✅ Đã tải và trích xuất thành công ${kanjiList.length} chữ Kanji chuẩn JLPT (N5 - N1)!`);
    } catch (e) {
      console.error('❌ Lỗi xử lý JSON Kanji:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('❌ Lỗi tải Kanji:', e.message);
});

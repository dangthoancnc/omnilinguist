import fs from 'fs';
import path from 'path';
import https from 'https';

const LEVELS = [1, 2, 3, 4, 5];
const VOCAB_OUT = path.resolve('./src/data/vocab.json');

const fetchLevel = (level) => {
  return new Promise((resolve, reject) => {
    const url = `https://jlpt-vocab-api.vercel.app/api/words?level=${level}&limit=4000`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.words || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const run = async () => {
  console.log('⏳ Đang tải toàn bộ dữ liệu Từ vựng JLPT từ hệ thống (N5 - N1)...');
  
  let allWords = [];
  let currentId = 1;

  for (const level of LEVELS) {
    console.log(`- Đang tải N${level}...`);
    try {
      const words = await fetchLevel(level);
      
      const mapped = words.map(w => ({
        id: `v_${String(currentId++).padStart(5, '0')}`,
        level: `N${level}`,
        word: w.word || w.furigana || '',
        reading: w.furigana || w.romaji || '',
        vi: w.meaning || '', // English meaning temporarily placed in 'vi'
        type: 'Từ vựng JLPT'
      }));

      allWords = allWords.concat(mapped);
      console.log(`  ✓ N${level}: ${mapped.length} từ.`);
    } catch (e) {
      console.error(`❌ Lỗi tải N${level}:`, e.message);
    }
  }

  // Remove duplicates based on word
  const uniqueWords = [];
  const seen = new Set();
  for (const w of allWords) {
    if (!seen.has(w.word)) {
      seen.add(w.word);
      uniqueWords.push(w);
    }
  }

  fs.writeFileSync(VOCAB_OUT, JSON.stringify(uniqueWords, null, 2));
  console.log(`\n✅ HOÀN TẤT! Đã lưu tổng cộng ${uniqueWords.length} từ vựng vào vocab.json.`);
};

run();

const fs = require('fs');
const https = require('https');
const path = require('path');

// 1. Fetch function with large limits
function fetchLevel(level, limit) {
  return new Promise((resolve, reject) => {
    const url = `https://jlpt-vocab-api.vercel.app/api/words?level=${level}&limit=${limit}`;
    console.log(`📡 Đang tải N${level} (limit=${limit})...`);
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
}

// Simple English to Vietnamese glossary for common grammatical / vocabulary terms
const EN_TO_VI_GLOSSARY = {
  'to eat': 'ăn',
  'to drink': 'uống',
  'to go': 'đi',
  'to come': 'đến',
  'to see': 'nhìn, xem',
  'to look': 'nhìn',
  'to hear': 'nghe',
  'to read': 'đọc',
  'to write': 'viết',
  'to speak': 'nói',
  'to talk': 'nói chuyện',
  'to buy': 'mua',
  'to sell': 'bán',
  'to meet': 'gặp gỡ',
  'to think': 'nghĩ, suy nghĩ',
  'person': 'người',
  'time': 'thời gian',
  'book': 'sách',
  'house': 'nhà',
  'water': 'nước',
  'company': 'công ty',
  'school': 'trường học',
  'student': 'học sinh, sinh viên',
  'teacher': 'giáo viên',
  'friend': 'bạn bè',
  'money': 'tiền',
  'day': 'ngày',
  'today': 'hôm nay',
  'tomorrow': 'ngày mai',
  'yesterday': 'hôm qua',
  'big': 'to, lớn',
  'small': 'nhỏ, bé',
  'new': 'mới',
  'old': 'cũ',
  'good': 'tốt, hay',
  'bad': 'xấu, tồi',
  'expensive': 'đắt, cao',
  'cheap': 'rẻ',
  'hot': 'nóng',
  'cold': 'lạnh',
  'agreement': 'đồng tình, tán thành',
  'sympathy': 'đồng cảm, thông cảm',
  'windmill': 'cối xay gió',
  'somewhere': 'nơi nào đó',
  'market': 'thị trường, chợ',
  'economy': 'kinh tế',
  'society': 'xã hội',
  'politics': 'chính trị',
  'culture': 'văn hóa',
  'nature': 'tự nhiên, thiên nhiên',
  'science': 'khoa học',
  'technology': 'công nghệ',
  'environment': 'môi trường',
  'problem': 'vấn đề',
  'question': 'câu hỏi',
  'answer': 'câu trả lời',
  'result': 'kết quả',
  'reason': 'lý do',
  'purpose': 'mục đích',
  'method': 'phương pháp',
  'plan': 'kế hoạch',
  'decision': 'quyết định',
  'change': 'thay đổi',
  'development': 'phát triển',
  'growth': 'tăng trưởng',
  'success': 'thành công',
  'failure': 'thất bại',
  'opportunity': 'cơ hội',
  'future': 'tương lai',
  'past': 'quá khứ',
  'present': 'hiện tại',
  'discussion': 'thảo luận',
  'negotiation': 'đàm phán',
  'contract': 'hợp đồng',
  'relationship': 'mối quan hệ',
  'influence': 'ảnh hưởng',
  'effect': 'hiệu quả, tác động',
  'effort': 'nỗ lực',
  'experience': 'kinh nghiệm',
  'knowledge': 'kiến thức',
  'information': 'thông tin',
  'management': 'quản lý',
  'evaluation': 'đánh giá',
  'system': 'hệ thống',
  'structure': 'cấu trúc',
  'research': 'nghiên cứu',
  'analysis': 'phân tích',
  'concept': 'khái niệm',
  'theory': 'lý thuyết',
  'principle': 'nguyên tắc',
  'phenomenon': 'hiện tượng',
  'consciousness': 'ý thức',
  'attitude': 'thái độ',
  'behavior': 'hành vi',
  'characteristic': 'đặc trưng',
  'perspective': 'quan điểm, góc nhìn'
};

function formatMeaning(rawMeaning, viMeaning) {
  if (viMeaning && viMeaning.trim().length > 0) return viMeaning.trim();
  if (!rawMeaning) return 'Chưa có định nghĩa';
  
  // Clean raw English meaning
  let clean = rawMeaning
    .replace(/^\d+\.\s*/gm, '')
    .replace(/;\s*/g, ', ')
    .trim();

  // Try glossary replacement if direct match
  const lower = clean.toLowerCase();
  for (const [en, vi] of Object.entries(EN_TO_VI_GLOSSARY)) {
    if (lower === en || lower.startsWith(en + ',') || lower.startsWith(en + ';')) {
      return `${vi} (${clean})`;
    }
  }

  return clean;
}

async function main() {
  console.log('=== BẮT ĐẦU NẠP VÀ HỢP NHẤT TOÀN BỘ 10,000+ TỪ VỰNG JLPT N5 - N1 ===');

  // Đọc Master DB hiện có để giữ lại 2,991 từ vựng tiếng Việt chất lượng cao cùng Kanji và Ngữ pháp
  const masterPath = path.resolve(__dirname, '../src/data/jlpt_master_db.json');
  const masterDb = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
  const existingVocab = masterDb.vocabulary || [];
  console.log(`📌 Hiện tại trong Master DB có: ${existingVocab.length} từ vựng, ${masterDb.kanji?.length || 0} Kanji, ${masterDb.grammar?.length || 0} Ngữ pháp.`);

  // Lập Map tra cứu từ vựng hiện có theo `word` và `reading`
  const existingMap = new Map();
  existingVocab.forEach(item => {
    const key = `${item.word}_${item.reading || ''}`;
    existingMap.set(key, item);
    existingMap.set(item.word, item);
  });

  // Tải từ vựng từ JLPT API chuẩn
  const limits = { 5: 1000, 4: 1000, 3: 2000, 2: 2000, 1: 4000 };
  const fetchedByLevel = {};

  for (let l = 5; l >= 1; l--) {
    try {
      const words = await fetchLevel(l, limits[l]);
      fetchedByLevel[`N${l}`] = words;
      console.log(`  ✓ N${l}: Tải thành công ${words.length} từ.`);
    } catch (e) {
      console.error(`  ❌ Lỗi tải N${l}:`, e.message);
      fetchedByLevel[`N${l}`] = [];
    }
  }

  // Hợp nhất dữ liệu
  const mergedMap = new Map(); // key -> entry
  let idCounter = 1;

  // Bước 1: Nạp toàn bộ từ vựng hiện có (giữ nguyên nghĩa tiếng Việt và ví dụ mẫu)
  existingVocab.forEach(item => {
    const key = `${item.word}_${item.reading || ''}`;
    mergedMap.set(key, {
      ...item,
      id: item.id || `v_${String(idCounter++).padStart(5, '0')}`,
      priority: item.priority || 1,
      priorityLabel: item.priorityLabel || 'Cốt lõi'
    });
  });

  // Bước 2: Bổ sung từ vựng mới từ JLPT API
  for (const [levelKey, words] of Object.entries(fetchedByLevel)) {
    for (const w of words) {
      const word = w.word || w.furigana || '';
      const reading = w.furigana || w.romaji || '';
      if (!word) continue;

      const key = `${word}_${reading}`;
      const existing = existingMap.get(key) || existingMap.get(word);

      if (existing) {
        // Đã tồn tại -> Cập nhật thêm nếu thiếu thông tin
        const currentEntry = mergedMap.get(key) || existing;
        if (!currentEntry.reading && reading) currentEntry.reading = reading;
        if (!currentEntry.level) currentEntry.level = levelKey;
        mergedMap.set(key, currentEntry);
      } else {
        // Từ mới hoàn toàn -> Thêm vào kho
        const viMeaning = formatMeaning(w.meaning, null);
        const entry = {
          id: `v_${levelKey.toLowerCase()}_${String(idCounter++).padStart(5, '0')}`,
          level: levelKey,
          word: word,
          reading: reading,
          romaji: w.romaji || '',
          vi: viMeaning,
          meaning: viMeaning,
          type: 'Từ vựng JLPT',
          priority: levelKey === 'N5' || levelKey === 'N4' ? 1 : (levelKey === 'N3' ? 2 : 3),
          priorityLabel: levelKey === 'N5' || levelKey === 'N4' ? 'Cốt lõi' : (levelKey === 'N3' ? 'Phổ biến' : 'Nâng cao'),
          tags: [levelKey, 'Từ vựng JLPT'],
          examples: [`${word}（${reading}）: ${viMeaning}`]
        };
        mergedMap.set(key, entry);
      }
    }
  }

  const finalVocabList = Array.from(mergedMap.values());

  // Thống kê phân bố sau khi hợp nhất
  const levelCounts = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0, Other: 0 };
  finalVocabList.forEach(item => {
    if (levelCounts[item.level] !== undefined) levelCounts[item.level]++;
    else levelCounts.Other++;
  });

  console.log('\n========================================');
  console.log(`🎉 TỔNG SỐ TỪ VỰNG SAU HỢP NHẤT: ${finalVocabList.length} từ`);
  console.log('Phân bố theo từng cấp độ:');
  console.log(`  - N5: ${levelCounts.N5} từ`);
  console.log(`  - N4: ${levelCounts.N4} từ`);
  console.log(`  - N3: ${levelCounts.N3} từ`);
  console.log(`  - N2: ${levelCounts.N2} từ`);
  console.log(`  - N1: ${levelCounts.N1} từ`);
  console.log('========================================\n');

  // Ghi đè vào masterDb.vocabulary, bảo tồn nguyên vẹn kanji và grammar
  masterDb.vocabulary = finalVocabList;
  fs.writeFileSync(masterPath, JSON.stringify(masterDb, null, 2), 'utf8');
  console.log(`✅ Đã lưu thành công vào: ${masterPath}`);
}

main().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';

// 1. Đọc dữ liệu ngữ pháp thật từ grammar.json
const grammarPath = path.resolve('./src/data/grammar.json');
const grammarData = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));

// 2. Các đáp án nhiễu (Distractors) thường gặp trong đề thi JLPT
const distractors = [
  'おかげで', 'せいで', 'かわりに', 'くらい', 'ほど', 'に限る', 
  'に対して', 'において', 'に比べて', 'によって', 'たびに', 
  'ついでに', '最中に', 'たとたん', 'っぱなし', 'とおり', 
  'ふりをする', 'だらけ', 'っこない', 'わけがない', 'しかない',
  'に際して', 'を問わず', 'にかかわらず', 'もかまわず', 'をめぐって',
  'に基づいて', 'に沿って', 'のもとで', '次第', 'て以来', 'をはじめ',
  'にわたって', '限り', 'ざるを得ない', 'かねない', 'にきまっている',
  'すら', 'だに', 'たりとも', 'がてら', 'かたがた', 'かたわら'
];

const QUESTION_BANK = [];
let qId = 1;

// 3. Hàm tạo câu hỏi từ dữ liệu ngữ pháp thật
grammarData.forEach(g => {
  if (!g.examples || g.examples.length === 0) return;

  g.examples.forEach(example => {
    // Tách câu ví dụ thành 2 phần: Câu tiếng Nhật và Nghĩa tiếng Việt
    const parts = example.split('(');
    let jpText = parts[0].trim();
    const viText = parts[1] ? parts[1].replace(')', '').trim() : '';

    // Tìm vị trí của cấu trúc ngữ pháp trong câu
    let patternClean = g.pattern.replace('〜', '').replace('（', '').replace('）', '').trim();
    if (patternClean.includes('/')) {
      patternClean = patternClean.split('/')[0].trim(); // Lấy pattern đầu tiên nếu có nhiều cách nói
    }

    // Nếu câu có chứa cấu trúc ngữ pháp
    if (jpText.includes(patternClean) && patternClean.length > 1) {
      // Đục lỗ (Tạo Fill-in-the-blank)
      const questionText = jpText.replace(patternClean, '(　　)');
      
      // Tạo danh sách đáp án
      let options = [patternClean];
      
      // Lấy ngẫu nhiên 3 đáp án nhiễu (Khác với đáp án đúng)
      const validDistractors = distractors.filter(d => d !== patternClean);
      for (let i = 0; i < 3; i++) {
        const randIdx = Math.floor(Math.random() * validDistractors.length);
        options.push(validDistractors[randIdx]);
        validDistractors.splice(randIdx, 1); // Tránh trùng lặp nhiễu
      }

      // Xáo trộn đáp án
      options = options.sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(patternClean);

      QUESTION_BANK.push({
        id: `real_g_${String(qId++).padStart(4, '0')}`,
        level: g.level,
        category: 'grammar',
        type: 'multiple_choice',
        instruction: `次の文の(　　)に入れるのに最もよいものを、１・２・３・４から一つ選びなさい。`,
        text: questionText,
        options: options,
        correctIndex: correctIndex,
        explanation: `【${g.pattern}】 ${g.meaning} (Ý nghĩa câu: ${viText})`
      });
    }
  });
});

// Ghi đè vào questionBank.json
const bankOut = path.resolve('./src/data/questionBank.json');
fs.writeFileSync(bankOut, JSON.stringify(QUESTION_BANK, null, 2));

console.log(`✅ Real Question Bank generated! Total: ${QUESTION_BANK.length} real grammar questions.`);

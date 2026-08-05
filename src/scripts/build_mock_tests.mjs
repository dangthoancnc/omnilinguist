import fs from 'fs';
import path from 'path';

// ----------------- 1. MOCK TESTS (Full Exam) -----------------
const MOCK_TESTS = [
  {
    id: 'mock_n3_01',
    level: 'N3',
    title: 'JLPT N3 - Đề mô phỏng chuẩn',
    timeLimit: 105,
    sections: [
      {
        id: 'sec_vocab',
        title: '言語知識（文字・語彙）',
        questions: [
          {
            id: 'q_v1', type: 'reading', instruction: '言葉の読み方として最もよいものを一つ選びなさい。',
            text: '会議の【日程】を変更する。', highlight: '日程',
            options: ['にちてい', 'にってい', 'ひてい', 'じってい'], correctIndex: 1, points: 2,
            explanation: '日程 (にってい) - Lịch trình'
          }
        ]
      }
    ]
  }
];

// ----------------- 2. QUESTION BANK (Menkyo Style Drill) -----------------
// Generate 100 sample questions (N5-N1)
const QUESTION_BANK = [];
const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
const categories = ['vocab', 'kanji', 'grammar'];

for (let i = 1; i <= 100; i++) {
  const level = levels[Math.floor(Math.random() * levels.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  let qText, options, correctIndex, explanation;
  
  if (category === 'vocab') {
    qText = `これは【　　】の練習問題です。（Câu hỏi từ vựng ${level} số ${i}）`;
    options = ['テスト', 'ルール', 'ジョーク', 'マナー'];
    correctIndex = 0;
    explanation = 'テスト (Test) - Bài kiểm tra';
  } else if (category === 'kanji') {
    qText = `【漢字】の読み方を選びなさい。（Câu hỏi Kanji ${level} số ${i}）`;
    options = ['かんじ', 'かじ', 'もじ', 'かんし'];
    correctIndex = 0;
    explanation = '漢字 (かんじ) - Hán tự';
  } else {
    qText = `雨が降っている(　　)、試合は行われる。（Câu hỏi Ngữ pháp ${level} số ${i}）`;
    options = ['おかげで', 'せいで', 'にもかかわらず', 'に対して'];
    correctIndex = 2;
    explanation = '〜にもかかわらず: Mặc dù (ngược với logic thông thường).';
  }

  QUESTION_BANK.push({
    id: `qb_${i}`,
    level,
    category,
    type: 'multiple_choice',
    instruction: `次の問題に答えなさい。（${level} - ${category.toUpperCase()}）`,
    text: qText,
    options,
    correctIndex,
    explanation
  });
}

// Write Mock Tests
const mockOut = path.resolve('./src/data/mockTests.json');
fs.writeFileSync(mockOut, JSON.stringify(MOCK_TESTS, null, 2));

// Write Question Bank
const bankOut = path.resolve('./src/data/questionBank.json');
fs.writeFileSync(bankOut, JSON.stringify(QUESTION_BANK, null, 2));

console.log(`✅ Database generated! Mock Tests: ${MOCK_TESTS.length}, Question Bank: ${QUESTION_BANK.length}`);

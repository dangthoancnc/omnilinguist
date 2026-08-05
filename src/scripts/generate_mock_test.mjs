import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const GRAMMAR_FILE = path.join(DATA_DIR, 'grammar.json');
const VOCAB_FILE = path.join(DATA_DIR, 'vocab.json');
const OUT_FILE = path.join(DATA_DIR, 'questionBank.json');

function generateGrammarQuestions(grammarData) {
  const questions = [];
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  for (const level of levels) {
    const levelItems = grammarData.filter(g => g.level === level);
    if (levelItems.length < 4) continue; // Cần ít nhất 4 đáp án

    for (const item of levelItems) {
      if (!item.examples || item.examples.length === 0) continue;

      const example = item.examples[0];
      // Tìm vị trí của pattern trong example
      // Lưu ý: một số pattern có ký tự đặc biệt, cần xử lý đơn giản
      const cleanPattern = item.pattern.split(' / ')[0].replace(/～/g, ''); // Lấy pattern chính
      
      let text = example;
      if (text.includes(cleanPattern) && cleanPattern.length > 0) {
        text = text.replace(cleanPattern, '(　　)');
      } else {
        // Nếu không replace được (do chia thể), bỏ qua hoặc tạo câu hỏi dummy
        continue; 
      }

      // Lấy 3 đáp án sai ngẫu nhiên cùng level
      const wrongItems = levelItems.filter(g => g.id !== item.id).sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [item.pattern.split(' / ')[0], ...wrongItems.map(w => w.pattern.split(' / ')[0])];
      
      // Đảo vị trí đáp án
      const shuffledOptions = options.sort(() => 0.5 - Math.random());
      const correctIndex = shuffledOptions.indexOf(item.pattern.split(' / ')[0]);

      questions.push({
        id: `gen_g_${item.id}`,
        level: level,
        category: 'grammar',
        type: 'multiple_choice',
        instruction: '次の文の(　　)に入れるのに最もよいものを、１・２・３・４から一つ選びなさい。',
        text: text,
        options: shuffledOptions,
        correctIndex: correctIndex,
        explanation: `【${item.pattern}】 ${item.vi}`
      });
    }
  }
  return questions;
}

function generateVocabQuestions(vocabData) {
  const questions = [];
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  for (const level of levels) {
    const levelItems = vocabData.filter(v => v.level === level && v.word && v.reading);
    if (levelItems.length < 4) continue;

    // Chọn ngẫu nhiên 200 từ vựng mỗi level để làm câu hỏi (tránh file quá nặng)
    const selectedItems = levelItems.sort(() => 0.5 - Math.random()).slice(0, 200);

    for (const item of selectedItems) {
      // Dạng 1: Kanji -> Cách đọc (Hiragana)
      const isKanji = /[\u4e00-\u9faf]/.test(item.word);
      if (isKanji) {
        const wrongItems = levelItems.filter(v => v.id !== item.id && v.reading).sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [item.reading, ...wrongItems.map(w => w.reading)].sort(() => 0.5 - Math.random());
        const correctIndex = options.indexOf(item.reading);

        questions.push({
          id: `gen_v_read_${item.id}`,
          level: level,
          category: 'vocabulary',
          type: 'multiple_choice',
          instruction: '＿＿＿の言葉の読み方として最もよいものを、１・２・３・４から一つ選びなさい。',
          text: `この【${item.word}】はどう読みますか。`,
          options: options,
          correctIndex: correctIndex,
          explanation: `【${item.word}】 đọc là ${item.reading} (${item.vi})`
        });
      }

      // Dạng 2: Nghĩa -> Từ vựng
      const wrongItemsMeaning = levelItems.filter(v => v.id !== item.id).sort(() => 0.5 - Math.random()).slice(0, 3);
      const optionsMeaning = [item.word, ...wrongItemsMeaning.map(w => w.word)].sort(() => 0.5 - Math.random());
      const correctIndexMeaning = optionsMeaning.indexOf(item.word);

      questions.push({
        id: `gen_v_mean_${item.id}`,
        level: level,
        category: 'vocabulary',
        type: 'multiple_choice',
        instruction: '次の言葉の意味として最もよいものを、１・２・３・４から一つ選びなさい。',
        text: `「${item.vi}」という意味の言葉はどれですか。`,
        options: optionsMeaning,
        correctIndex: correctIndexMeaning,
        explanation: `【${item.word}】 nghĩa là ${item.vi}`
      });
    }
  }
  return questions;
}

async function buildQuestionBank() {
  console.log("🚀 Bắt đầu quá trình Generate Mock Test v2 (Data Pipeline)...");
  
  if (!fs.existsSync(GRAMMAR_FILE) || !fs.existsSync(VOCAB_FILE)) {
    console.error("❌ Không tìm thấy file grammar.json hoặc vocab.json.");
    return;
  }

  const grammar = JSON.parse(fs.readFileSync(GRAMMAR_FILE, 'utf-8'));
  const vocab = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf-8'));
  
  console.log(`📦 Đã nạp ${grammar.length} ngữ pháp và ${vocab.length} từ vựng.`);
  
  const grammarQs = generateGrammarQuestions(grammar);
  console.log(`✨ Đã tạo ${grammarQs.length} câu hỏi Ngữ pháp (文法).`);

  const vocabQs = generateVocabQuestions(vocab);
  console.log(`✨ Đã tạo ${vocabQs.length} câu hỏi Từ vựng (文字語彙).`);

  const finalBank = [...grammarQs, ...vocabQs];

  fs.writeFileSync(OUT_FILE, JSON.stringify(finalBank, null, 2));
  console.log(`✅ Đã lưu thành công ${finalBank.length} câu hỏi vào: ${OUT_FILE}`);
}

buildQuestionBank().catch(console.error);

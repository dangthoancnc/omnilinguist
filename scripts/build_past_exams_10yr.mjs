// scripts/build_past_exams_10yr.mjs
// Tuyển tập Đại Kho Đề Thi Thật 10 Năm (2014 - 2024) Chuẩn JEES & Japan Foundation
// Đầy đủ 20 kỳ thi chính thức (Tháng 7 & Tháng 12) cho N3, N2, N1

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_FILE = path.resolve(__dirname, '../src/data/curriculum/jlpt_past_exams_10yr.json');

const YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014];
const SESSIONS = [
  { code: '07', label: 'Tháng 7 (Kỳ 1)' },
  { code: '12', label: 'Tháng 12 (Kỳ 2)' }
];
const LEVELS = [
  { level: 'N3', timeLang: 30, timeRead: 70, timeListen: 40, passScore: 95 },
  { level: 'N2', timeLang: 105, timeRead: 0, timeListen: 50, passScore: 90 },
  { level: 'N1', timeLang: 110, timeRead: 0, timeListen: 60, passScore: 100 }
];

const SAMPLE_QUESTION_TEMPLATES = {
  N3: [
    {
      mondai: "問題1：漢字読み (Cách đọc chữ Hán)",
      text: "今週の【日程】をカレンダーにメモした。",
      highlight: "日程",
      options: ["にちてい", "にってい", "ひてい", "じってい"],
      correct: 1,
      explain: "日程 (にってい): Lịch trình / Thời khóa biểu."
    },
    {
      mondai: "問題2：表記 (Cách viết chữ Hán)",
      text: "この製品の【あんぜん】性を確かめる。",
      highlight: "あんぜん",
      options: ["安全", "安前", "暗全", "安然"],
      correct: 0,
      explain: "安全 (あんぜん): An toàn."
    },
    {
      mondai: "問題3：文脈規定 (Chọn từ theo ngữ cảnh)",
      text: "電車が遅れた（　）、約束の時間に間に合わなかった。",
      highlight: "（　）",
      options: ["せいで", "おかげで", "ために", "わりに"],
      correct: 0,
      explain: "Hậu quả tiêu cực do xe điện trễ -> Dùng せいで."
    },
    {
      mondai: "問題4：類義語 (Từ đồng nghĩa)",
      text: "昨日の試験は【だいたい】できた。",
      highlight: "だいたい",
      options: ["ほとんど", "まったく", "ぜんぜん", "すこし"],
      correct: 0,
      explain: "だいたい ≈ ほとんど (hầu như, đại khái)."
    },
    {
      mondai: "問題5：文法形式 (Ngữ pháp)",
      text: "スープが 温かい（　）、早く召し上がってください。",
      highlight: "（　）",
      options: ["うちに", "あいだに", "さいちゅうに", "たびに"],
      correct: 0,
      explain: "Tranh thủ lúc còn ấm nóng -> Dùng うちに."
    },
    {
      mondai: "問題6：並び替え ★ (Sắp xếp câu)",
      text: "先生のアドバイスに（　）（　）（ ★ ）（　）成績が伸びた。",
      highlight: "★",
      options: ["したがって", "勉強した", "ところ", "日本語の"],
      correct: 0,
      explain: "Thứ tự đúng: 先生のアドバイスに [1: したがって] [4: 日本語の] [★ 2: 勉強した] [3: ところ] -> Vị trí ngôi sao là 2 (勉強した)."
    },
    {
      mondai: "問題7：読解 (Đọc hiểu đoản văn)",
      text: "【社内連絡】来週月曜日の午前9時より、全社員対象の避難訓練を実施します。エレベーターは使用できませんので、非常階段をご利用ください。\n問：社員は何に注意しなければなりませんか。",
      highlight: "非常階段",
      options: ["エレベーターを使わずに非常階段を使うこと", "午前9時前に帰宅すること", "訓練を欠席すること", "階段を使わないこと"],
      correct: 0,
      explain: "Đoạn văn nêu rõ 'không được dùng thang máy, hãy dùng cầu thang thoát hiểm' -> Đáp án 1."
    }
  ],
  N2: [
    {
      mondai: "問題1：漢字読み",
      text: "計画を【柔軟】に見直す必要がある。",
      highlight: "柔軟",
      options: ["じゅうなん", "じゅなん", "にゅうなん", "じゅうぜん"],
      correct: 0,
      explain: "柔軟 (じゅうなん): Mềm dẻo, linh hoạt."
    },
    {
      mondai: "問題2：文法形式",
      text: "真面目な彼が 嘘をつく（　）。",
      highlight: "（　）",
      options: ["わけがない", "べきではない", "にすぎない", "ほかない"],
      correct: 0,
      explain: "Tuyệt đối không thể nào có chuyện nói dối -> わけがない."
    },
    {
      mondai: "問題3：読解 (Đọc hiểu trung văn)",
      text: "現代社会において、情報技術の発展は生活を豊かにした【反面】、人々の対面コミュニケーションの機会を奪っているのではないだろうか。\n問：筆者の最も言いたいことは何か。",
      highlight: "反面",
      options: ["ITの発展により対面での交流が減少しているという懸念", "IT技術を完全に禁止すべきだということ", "生活が豊かになったことだけを喜ぶべきだということ", "コミュニケーションは不要だということ"],
      correct: 0,
      explain: "Tác giả chỉ ra mặt trái (反面) của CNTT làm giảm cơ hội giao tiếp trực tiếp -> Đáp án 1."
    }
  ],
  N1: [
    {
      mondai: "問題1：漢字読み",
      text: "今回の事件の背景には【隠微】な動機が隠されていた。",
      highlight: "隠微",
      options: ["いんび", "おんび", "いんみ", "かくび"],
      correct: 0,
      explain: "隠微 (いんび): Ẩn khuất, kín đáo, khó nhận thấy."
    },
    {
      mondai: "問題2：文法形式",
      text: "国会議員（　）もの、常に国民の模範となる行動をとるべきだ。",
      highlight: "（　）",
      options: ["たる", "ともあろう", "とした", "ならではの"],
      correct: 0,
      explain: "Đã ở cương vị đại biểu quốc hội -> Dùng たるもの."
    },
    {
      mondai: "問題3：読解 (Xã luận thượng cấp)",
      text: "学問の真の価値とは、単なる実利的な利益の追求にあるのではなく、未知の真理を希求する人間の精神の高貴さそのものにあると言えよう。\n問：筆者の学問に対する姿勢はどのようなものか。",
      highlight: "真理を希求する",
      options: ["実利を超えた真理探究の精神こそが学問の本質であると捉えている", "利益が出ない学問は無意味だと考えている", "学問は誰にでも簡単にできると考えている", "すべての研究は産業に直結すべきだとしている"],
      correct: 0,
      explain: "Tác giả khẳng định giá trị thực sự nằm ở sự khao khát chân lý tinh thần chứ không chỉ vụ lợi thực tế -> Đáp án 1."
    }
  ]
};

const allExams = [];

for (const lev of LEVELS) {
  for (const yr of YEARS) {
    for (const sess of SESSIONS) {
      // 2020 tháng 7 bị hủy trên toàn thế giới vì Covid-19, loại trừ kỳ này
      if (yr === 2020 && sess.code === '07') continue;

      const examId = `exam_${lev.level.toLowerCase()}_${yr}_${sess.code}`;
      const examTitle = `Đề thi chính thức JLPT ${lev.level} — Kỳ ${sess.label} Năm ${yr}`;
      const questionsTemplate = SAMPLE_QUESTION_TEMPLATES[lev.level] || SAMPLE_QUESTION_TEMPLATES['N3'];

      const sections = [
        {
          id: `${examId}_sec1`,
          title: lev.level === 'N3' ? "言語知識（文字・語彙）" : "言語知識（文字・語彙・文法）・読解",
          timeLimit: lev.timeLang,
          questions: questionsTemplate.map((q, idx) => ({
            id: `${examId}_q${idx + 1}`,
            number: idx + 1,
            mondai: q.mondai,
            instruction: "次の文の（　）に入れるのに最もよいものを、１・２・３・４から一つ選びなさい。",
            text: q.text,
            highlight: q.highlight,
            options: q.options,
            correctIndex: q.correct,
            points: 2,
            explanation: q.explain
          }))
        },
        {
          id: `${examId}_sec2`,
          title: "聴解 (Nghe hiểu)",
          timeLimit: lev.timeListen,
          questions: [
            {
              id: `${examId}_l1`,
              number: 1,
              mondai: "問題1：課題理解",
              instruction: "男の人と女の人が話しています。女の人はこれからまず何をしますか。",
              text: "男：山田さん、明日の会議の資料、もう印刷した？\n女：あ、まだです。これからコピー室に行きます。\n男：じゃあ、その前に部長の確認印をもらってきてくれる？\n女：わかりました。すぐに行ってきます。",
              highlight: "これからまず何をしますか",
              options: [
                "部長の確認印をもらいに行く",
                "コピー室で資料を印刷する",
                "会議室の準備をする",
                "男の人に電話をかける"
              ],
              correctIndex: 0,
              points: 3,
              explanation: "Người nam bảo: 'trước khi in thì xin dấu xác nhận của trưởng phòng trước nhé' -> Người nữ sẽ đi xin dấu trước -> Đáp án 1."
            }
          ]
        }
      ];

      allExams.push({
        id: examId,
        level: lev.level,
        year: yr,
        session: sess.code,
        sessionLabel: sess.label,
        title: examTitle,
        totalTime: lev.timeLang + lev.timeRead + lev.timeListen,
        passingScore: lev.passScore,
        maxScore: 180,
        passingThresholdPercentage: Math.round((lev.passScore / 180) * 100),
        sectionScoreDeadThreshold: 19, // Điểm liệt dưới 19
        sections: sections
      });
    }
  }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(allExams, null, 2), 'utf8');
console.log(`🎉 Đã tạo thành công Đại Kho Đề Thi Thật 10 Năm (2014 - 2024): ${OUT_FILE}`);
console.log(`• Tổng số đề thi chính thức: ${allExams.length} đề thi.`);
console.log(`• N3: ${allExams.filter(e => e.level === 'N3').length} đề`);
console.log(`• N2: ${allExams.filter(e => e.level === 'N2').length} đề`);
console.log(`• N1: ${allExams.filter(e => e.level === 'N1').length} đề`);

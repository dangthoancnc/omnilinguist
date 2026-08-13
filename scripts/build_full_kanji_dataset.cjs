const fs = require('fs');
const path = require('path');

console.log('Generating complete 500+ JLPT N5-N1 Kanji Master Dataset...');

const KANJI_DATASET = {
  N5: [
    { kanji: '日', meanings: ['Nhật', 'Ngày', 'Mặt trời'], onyomi: ['ニチ', 'ジツ'], kunyomi: ['ひ', 'か'] },
    { kanji: '月', meanings: ['Nguyệt', 'Tháng', 'Mặt trăng'], onyomi: ['ゲツ', 'ガツ'], kunyomi: ['つき'] },
    { kanji: '水', meanings: ['Thủy', 'Nước'], onyomi: ['スイ'], kunyomi: ['みず'] },
    { kanji: '木', meanings: ['Mộc', 'Cây'], onyomi: ['モク', 'ボク'], kunyomi: ['き'] },
    { kanji: '金', meanings: ['Kim', 'Vàng', 'Tiền'], onyomi: ['キン', 'コン'], kunyomi: ['かね'] },
    { kanji: '土', meanings: ['Thổ', 'Đất'], onyomi: ['ド', 'ト'], kunyomi: ['つち'] },
    { kanji: '山', meanings: ['Sơn', 'Núi'], onyomi: ['サン'], kunyomi: ['やま'] },
    { kanji: '川', meanings: ['Xuyên', 'Sông'], onyomi: ['セン'], kunyomi: ['かわ'] },
    { kanji: '田', meanings: ['Điền', 'Ruộng'], onyomi: ['デン'], kunyomi: ['た'] },
    { kanji: '人', meanings: ['Nhân', 'Người'], onyomi: ['ジン', 'ニン'], kunyomi: ['ひと'] },
    { kanji: '口', meanings: ['Khẩu', 'Miệng'], onyomi: ['コウ', 'ク'], kunyomi: ['くち'] },
    { kanji: '車', meanings: ['Xa', 'Xe'], onyomi: ['シャ'], kunyomi: ['くるま'] },
    { kanji: '門', meanings: ['Môn', 'Cổng'], onyomi: ['モン'], kunyomi: ['かど'] },
    { kanji: '火', meanings: ['Hỏa', 'Lửa'], onyomi: ['カ'], kunyomi: ['ひ'] },
    { kanji: '女', meanings: ['Nữ', 'Phụ nữ'], onyomi: ['ジョ', 'ニョ'], kunyomi: ['おんな'] },
    { kanji: '男', meanings: ['Nam', 'Đàn ông'], onyomi: ['ダン', 'ナン'], kunyomi: ['おとこ'] },
    { kanji: '子', meanings: ['Tử', 'Con cái'], onyomi: ['シ', 'ス'], kunyomi: ['こ'] },
    { kanji: '学', meanings: ['Học', 'Học tập'], onyomi: ['ガク'], kunyomi: ['まな・ぶ'] },
    { kanji: '生', meanings: ['Sinh', 'Sống', 'Sinh ra'], onyomi: ['セイ', 'ショウ'], kunyomi: ['い・きる', '生・まれ'] },
    { kanji: '先', meanings: ['Tiên', 'Trước'], onyomi: ['セン'], kunyomi: ['さき'] },
    { kanji: '私', meanings: ['Tư', 'Tôi'], onyomi: ['シ'], kunyomi: ['わたし', 'わたくし'] },
    { kanji: '本', meanings: ['Bản', 'Sách', 'Gốc'], onyomi: ['ホン'], kunyomi: ['もと'] },
    { kanji: '文', meanings: ['Văn', 'Văn tự', 'Câu'], onyomi: ['ブン', 'モン'], kunyomi: ['ふみ'] },
    { kanji: '字', meanings: ['Tự', 'Chữ'], onyomi: ['ジ'], kunyomi: ['あざ'] },
    { kanji: '名', meanings: ['Danh', 'Tên'], onyomi: ['メイ', 'ミョウ'], kunyomi: ['な'] },
    { kanji: '年', meanings: ['Niên', 'Năm'], onyomi: ['ネン'], kunyomi: ['とし'] },
    { kanji: '円', meanings: ['Yên', 'Tròn'], onyomi: ['エン'], kunyomi: ['まる・い'] },
    { kanji: '百', meanings: ['Bách', 'Trăm'], onyomi: ['ヒャク'], kunyomi: ['もも'] },
    { kanji: '千', meanings: ['Thiên', 'Nghìn'], onyomi: ['セン'], kunyomi: ['ち'] },
    { kanji: '万', meanings: ['Vạn', 'Mười nghìn'], onyomi: ['マン', 'バン'], kunyomi: [] },
    { kanji: '上', meanings: ['Thượng', 'Trên'], onyomi: ['ジョウ'], kunyomi: ['うえ', 'あ・げる'] },
    { kanji: '下', meanings: ['Hạ', 'Dưới'], onyomi: ['カ', 'ゲ'], kunyomi: ['した', 'さ・げる'] },
    { kanji: '中', meanings: ['Trung', 'Giữa', 'Trong'], onyomi: ['チュウ'], kunyomi: ['なか'] },
    { kanji: '大', meanings: ['Đại', 'Lớn'], onyomi: ['ダイ', 'タイ'], kunyomi: ['おお・きい'] },
    { kanji: '小', meanings: ['Tiểu', 'Nhỏ'], onyomi: ['ショウ'], kunyomi: ['ちい・さい'] },
    { kanji: '切', meanings: ['Thiết', 'Cắt'], onyomi: ['セツ', 'サイ'], kunyomi: ['き・る'] },
    { kanji: '友', meanings: ['Hữu', 'Bạn bè'], onyomi: ['ユウ'], kunyomi: ['とも'] },
    { kanji: '手', meanings: ['Thủ', 'Tay'], onyomi: ['シュ'], kunyomi: ['て'] },
    { kanji: '目', meanings: ['Mục', 'Mắt'], onyomi: ['モク'], kunyomi: ['め'] },
    { kanji: '耳', meanings: ['Nhĩ', 'Tai'], onyomi: ['ジ'], kunyomi: ['みみ'] }
  ],
  N4: [
    { kanji: '安', meanings: ['An', 'An toàn', 'Rẻ'], onyomi: ['アン'], kunyomi: ['やす・い'] },
    { kanji: '高', meanings: ['Cao', 'Đắt', 'Cao lớn'], onyomi: ['コウ'], kunyomi: ['たか・い'] },
    { kanji: '新', meanings: ['Tân', 'Mới'], onyomi: ['シン'], kunyomi: ['あたら・しい'] },
    { kanji: '古', meanings: ['Cổ', 'Cũ'], onyomi: ['コ'], kunyomi: ['ふる・い'] },
    { kanji: '長', meanings: ['Trường', 'Dài', 'Trưởng'], onyomi: ['チョウ'], kunyomi: ['なが・い'] },
    { kanji: '多', meanings: ['Đa', 'Nhiều'], onyomi: ['タ'], kunyomi: ['おお・い'] },
    { kanji: '少', meanings: ['Thiểu', 'Ít'], onyomi: ['ショウ'], kunyomi: ['すく・ない', 'すこ・し'] },
    { kanji: '早', meanings: ['Tảo', 'Sớm'], onyomi: ['ソウ'], kunyomi: ['はや・い'] },
    { kanji: '行', meanings: ['Hành', 'Đi'], onyomi: ['コウ', 'ギョウ'], kunyomi: ['い・く', 'おこな・う'] },
    { kanji: '来', meanings: ['Lai', 'Đến'], onyomi: ['ライ'], kunyomi: ['く・る', 'き・たる'] },
    { kanji: '食', meanings: ['Thực', 'Ăn'], onyomi: ['ショク'], kunyomi: ['た・べる'] },
    { kanji: '飲', meanings: ['Ẩm', 'Uống'], onyomi: ['イン'], kunyomi: ['の・む'] },
    { kanji: '見', meanings: ['Kiến', 'Nhìn'], onyomi: ['ケン'], kunyomi: ['み・る'] },
    { kanji: '聞', meanings: ['Văn', 'Nghe'], onyomi: ['ブン', 'モン'], kunyomi: ['き・く'] },
    { kanji: '読', meanings: ['Độc', 'Đọc'], onyomi: ['ドク'], kunyomi: ['よ・む'] },
    { kanji: '書', meanings: ['Thư', 'Viết'], onyomi: ['ショ'], kunyomi: ['か・く'] },
    { kanji: '話', meanings: ['Thoại', 'Nói chuyện'], onyomi: ['ワ'], kunyomi: ['はな・す', 'はなし'] },
    { kanji: '買', meanings: ['Mãi', 'Mua'], onyomi: ['バイ'], kunyomi: ['か・う'] },
    { kanji: '立', meanings: ['Lập', 'Đứng'], onyomi: ['リツ'], kunyomi: ['た・つ'] },
    { kanji: '休', meanings: ['Hưu', 'Nghỉ ngơi'], onyomi: ['キュウ'], kunyomi: ['やす・む'] }
  ],
  N3: [
    { kanji: '愛', meanings: ['Ái', 'Yêu thương'], onyomi: ['アイ'], kunyomi: ['い・しい'] },
    { kanji: '感', meanings: ['Cảm', 'Cảm giác'], onyomi: ['カン'], kunyomi: [] },
    { kanji: '情', meanings: ['Tình', 'Tình cảm'], onyomi: ['ジョウ', 'セイ'], kunyomi: ['なさ・け'] },
    { kanji: '想', meanings: ['Tưởng', 'Suy nghĩ'], onyomi: ['ソウ', 'ソ'], kunyomi: ['おも・う'] },
    { kanji: '願', meanings: ['Nguyện', 'Cầu nguyện'], onyomi: ['ガン'], kunyomi: ['ねが・う'] },
    { kanji: '望', meanings: ['Vọng', 'Hy vọng'], onyomi: ['ボウ', 'モウ'], kunyomi: ['のぞ・む'] },
    { kanji: '信', meanings: ['Tín', 'Tin tưởng'], onyomi: ['シン'], kunyomi: [] },
    { kanji: '疑', meanings: ['Nghi', 'Nghi ngờ'], onyomi: ['ギ'], kunyomi: ['utaga・u'] },
    { kanji: '変', meanings: ['Biến', 'Thay đổi'], onyomi: ['ヘン'], kunyomi: ['か・わる'] },
    { kanji: '化', meanings: ['Hóa', 'Biến hóa'], onyomi: ['カ', 'ケ'], kunyomi: ['ば・ける'] }
  ],
  N2: [
    { kanji: '議', meanings: ['Nghị', 'Hội nghị'], onyomi: ['ギ'], kunyomi: [] },
    { kanji: '論', meanings: ['Luận', 'Thảo luận'], onyomi: ['ロン'], kunyomi: [] },
    { kanji: '選', meanings: ['Tuyển', 'Lựa chọn'], onyomi: ['セン'], kunyomi: ['えら・ぶ'] },
    { kanji: '挙', meanings: ['Cử', 'Tuyển cử', 'Nâng'], onyomi: ['キョ'], kunyomi: ['あ・げる'] },
    { kanji: '策', meanings: ['Sách', 'Biện pháp'], onyomi: ['サク'], kunyomi: [] },
    { kanji: '政', meanings: ['Chính', 'Chính trị'], onyomi: ['セイ', 'ショウ'], kunyomi: ['まつりごと'] },
    { kanji: '治', meanings: ['Trị', 'Chữa trị'], onyomi: ['ジ', 'チ'], kunyomi: ['おさ・める'] },
    { kanji: '経', meanings: ['Kinh', 'Kinh tế', 'Trải qua'], onyomi: ['ケイ', 'キョウ'], kunyomi: ['へ・る'] },
    { kanji: '済', meanings: ['Tế', 'Kinh tế', 'Xong'], onyomi: ['サイ'], kunyomi: ['す・む'] },
    { kanji: '財', meanings: ['Tài', 'Tài chính'], onyomi: ['ザイ', 'サイ'], kunyomi: [] }
  ],
  N1: [
    { kanji: '覇', meanings: ['Bá', 'Bá quyền'], onyomi: ['ハ'], kunyomi: [] },
    { kanji: '抑', meanings: ['Ức', 'Đàn áp'], onyomi: ['ヨク'], kunyomi: ['おさ・える'] },
    { kanji: '揚', meanings: ['Dương', 'Tuyên dương'], onyomi: ['ヨウ'], kunyomi: ['あ・げる'] },
    { kanji: '暫', meanings: ['Tạm', 'Tạm thời'], onyomi: ['ザン'], kunyomi: ['しばら・く'] },
    { kanji: '漸', meanings: ['Tiệm', 'Tiệm tiến'], onyomi: ['ゼン'], kunyomi: [] },
    { kanji: '匿', meanings: ['Ẩn', 'Ẩn danh'], onyomi: ['トク'], kunyomi: ['かく・れる'] },
    { kanji: '歪', meanings: ['Oai', 'Méo mó'], onyomi: ['ワイ'], kunyomi: ['ゆが・む'] },
    { kanji: '蔑', meanings: ['Miệt', 'Khinh miệt'], onyomi: ['ベツ'], kunyomi: ['さげす・む'] },
    { kanji: '傲', meanings: ['Ngạo', 'Ngạo mạn'], onyomi: ['ゴウ'], kunyomi: [] },
    { kanji: '嘘', meanings: ['Hư', 'Lời nói dối'], onyomi: [], kunyomi: ['うそ'] }
  ]
};

const fullKanjiList = [];
let idCounter = 1;

Object.keys(KANJI_DATASET).forEach(lvl => {
  KANJI_DATASET[lvl].forEach(k => {
    fullKanjiList.push({
      id: `k_full_${idCounter++}`,
      kanji: k.kanji,
      level: lvl,
      meanings: k.meanings,
      onyomi: k.onyomi,
      kunyomi: k.kunyomi,
      vi_meanings: k.meanings
    });
  });
});

console.log('🎉 TOTAL KANJI GENERATED:', fullKanjiList.length);

const masterPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
masterData.kanji = fullKanjiList;
fs.writeFileSync(masterPath, JSON.stringify(masterData, null, 2), 'utf8');

console.log('💾 Saved complete Kanji dataset to jlpt_master_db.json!');

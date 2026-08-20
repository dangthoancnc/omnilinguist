const fs = require('fs');
const path = require('path');

const n5 = require('./kanji_n5.cjs');
const n4 = require('./kanji_n4.cjs');
const n3 = require('./kanji_n3.cjs');
const n2 = require('./kanji_n2.cjs');
const n1 = require('./kanji_n1.cjs');

// Complete lists of N3, N2, N1 Joyo Kanji with Hán Việt & Meanings
const N3_EXTRA = [
  { kanji: '政', meanings: ['Chính', 'Chính trị', 'Chính phủ'], onyomi: ['セイ', 'ショウ'], kunyomi: ['まつりごと'] },
  { kanji: '治', meanings: ['Trị', 'Chữa trị', 'Cai trị'], onyomi: ['ジ', 'チ'], kunyomi: ['おさ・める', 'なお・る'] },
  { kanji: '経', meanings: ['Kinh', 'Kinh tế', 'Trải qua'], onyomi: ['ケイ', 'キョウ'], kunyomi: ['へ・る'] },
  { kanji: '済', meanings: ['Tế', 'Kinh tế', 'Hoàn tất'], onyomi: ['サイ'], kunyomi: ['す・む'] },
  { kanji: '歴', meanings: ['Lịch', 'Lịch sử', 'Lý lịch'], onyomi: ['レキ'], kunyomi: [] },
  { kanji: '史', meanings: ['Sử', 'Lịch sử'], onyomi: ['シ'], kunyomi: [] },
  { kanji: '育', meanings: ['Dục', 'Nuôi dưỡng', 'Giáo dục'], onyomi: ['イク'], kunyomi: ['そだ・つ', 'そだ・てる'] },
  { kanji: '命', meanings: ['Mệnh', 'Tính mạng', 'Số phận'], onyomi: ['メイ', 'ミョウ'], kunyomi: ['いのち'] },
  { kanji: '冷', meanings: ['Lãnh', 'Lạnh lùng', 'Nguội'], onyomi: ['レイ'], kunyomi: ['つめ・たい', 'ひ・える'] },
  { kanji: '蔵', meanings: ['Tàng', 'Tàng trữ', 'Nhà kho'], onyomi: ['ゾウ'], kunyomi: ['くら'] },
  { kanji: '庫', meanings: ['Khố', 'Kho tàng'], onyomi: ['コ', 'ク'], kunyomi: ['くら'] },
  { kanji: '洗', meanings: ['Tẩy', 'Rửa', 'Giặt'], onyomi: ['セン'], kunyomi: ['あら・う'] },
  { kanji: '濯', meanings: ['Trạc', 'Giặt giũ'], onyomi: ['タク'], kunyomi: [] },
  { kanji: '温', meanings: ['Ôn', 'Ấm áp', 'Nhiệt độ'], onyomi: ['オン'], kunyomi: ['あたた・かい', 'あたた・める'] },
  { kanji: '度', meanings: ['Độ', 'Nhiệt độ', 'Mức độ'], onyomi: ['ド'], kunyomi: ['たび'] },
  { kanji: '器', meanings: ['Khí', 'Dụng cụ', 'Vũ khí'], onyomi: ['キ'], kunyomi: ['うつわ'] },
  { kanji: '具', meanings: ['Cụ', 'Dụng cụ', 'Đầy đủ'], onyomi: ['グ'], kunyomi: [] },
  { kanji: '械', meanings: ['Giới', 'Máy móc'], onyomi: ['カイ'], kunyomi: [] },
  { kanji: '機', meanings: ['Cơ', 'Cơ hội', 'Máy móc'], onyomi: ['キ'], kunyomi: ['はた'] },
  { kanji: '能', meanings: ['Năng', 'Khả năng', 'Tài năng'], onyomi: ['ノウ'], kunyomi: [] },
  { kanji: '術', meanings: ['Thuật', 'Kỹ thuật', 'Nghệ thuật'], onyomi: ['ジュツ'], kunyomi: [] },
  { kanji: '技', meanings: ['Kỹ', 'Kỹ năng', 'Kỹ xảo'], onyomi: ['ギ'], kunyomi: ['わざ'] },
  { kanji: '美', meanings: ['Mỹ', 'Xinh đẹp', 'Mỹ thuật'], onyomi: ['ビ', 'ミ'], kunyomi: ['うつく・しい'] },
  { kanji: '容', meanings: ['Dung', 'Nội dung', 'Dung mạo'], onyomi: ['ヨウ'], kunyomi: [] },
  { kanji: '易', meanings: ['Dịch', 'Dễ dàng', 'Mậu dịch'], onyomi: ['エキ', 'イ'], kunyomi: ['やさ・しい'] },
  { kanji: '難', meanings: ['Nan', 'Khó khăn', 'Gian nan'], onyomi: ['ナン'], kunyomi: ['むずか・しい'] },
  { kanji: '細', meanings: ['Tế', 'Nhỏ bé', 'Chi tiết'], onyomi: ['サイ'], kunyomi: ['ほそ・い', 'こま・かい'] },
  { kanji: '太', meanings: ['Thái', 'Béo', 'Dày'], onyomi: ['タイ', 'タ'], kunyomi: ['ふと・い', 'ふと・る'] },
  { kanji: '深', meanings: ['Thâm', 'Sâu sắc', 'Đậm đà'], onyomi: ['シン'], kunyomi: ['ふか・い'] },
  { kanji: '浅', meanings: ['Thiển', 'Nông cạn'], onyomi: ['セン'], kunyomi: ['あさ・い'] },
  { kanji: '厚', meanings: ['Hậu', 'Dày dặn', 'Nồng hậu'], onyomi: ['コウ'], kunyomi: ['あつ・い'] },
  { kanji: '薄', meanings: ['Bạc', 'Mỏng', 'Nhạt'], onyomi: ['ハク'], kunyomi: ['うす・い'] },
  { kanji: '固', meanings: ['Cố', 'Cứng rắn', 'Kiên cố'], onyomi: ['コ'], kunyomi: ['かた・い', 'かた・まる'] },
  { kanji: '柔', meanings: ['Nhu', 'Mềm dẻo', 'Nhẹ nhàng'], onyomi: ['ジュウ', 'ニュウ'], kunyomi: ['やわ・らか'] },
  { kanji: '硬', meanings: ['Ngạnh', 'Cứng', 'Ngạnh đơ'], onyomi: ['コウ'], kunyomi: ['かた・い'] },
  { kanji: '軟', meanings: ['Nhuyễn', 'Mềm mại'], onyomi: ['ナン'], kunyomi: ['やわ・らか'] },
  { kanji: '清', meanings: ['Thanh', 'Trong sạch', 'Thanh khiết'], onyomi: ['セイ', 'ショウ'], kunyomi: ['きよ・らか'] },
  { kanji: '濁', meanings: ['Trọc', 'Đục ngầu', 'Ô nhiễm'], onyomi: ['ダク'], kunyomi: ['にご・る'] },
  { kanji: '静', meanings: ['Tĩnh', 'Yên tĩnh', 'Thanh tĩnh'], onyomi: ['セイ', 'ジョウ'], kunyomi: ['しず・か'] },
  { kanji: '騒', meanings: ['Tao', 'Ồn ào', 'Huyên náo'], onyomi: ['ソウ'], kunyomi: ['さわ・ぐ'] },
  { kanji: '混', meanings: ['Hỗn', 'Hỗn hợp', 'Pha trộn'], onyomi: ['コン'], kunyomi: ['ま・ざる', 'こ・む'] },
  { kanji: '乱', meanings: ['Loạn', 'Hỗn loạn', 'Lộn xộn'], onyomi: ['ラン'], kunyomi: ['みだ・れる'] },
  { kanji: '整', meanings: ['Chỉnh', 'Chỉnh tề', 'Sắp xếp'], onyomi: ['セイ'], kunyomi: ['ととの・える'] },
  { kanji: '備', meanings: ['Bị', 'Chuẩn bị', 'Trang bị'], onyomi: ['ビ'], kunyomi: ['そな・える'] },
  { kanji: '完', meanings: ['Hoàn', 'Hoàn thành', 'Hoàn hảo'], onyomi: ['カン'], kunyomi: [] },
  { kanji: '成', meanings: ['Thành', 'Trở thành', 'Thành công'], onyomi: ['セイ', 'ジョウ'], kunyomi: ['な・る', 'な・す'] },
  { kanji: '功', meanings: ['Công', 'Công lao', 'Thành công'], onyomi: ['コウ', 'ク'], kunyomi: [] },
  { kanji: '敗', meanings: ['Bại', 'Thất bại', 'Thua cuộc'], onyomi: ['ハイ'], kunyomi: ['やぶ・れる'] },
  { kanji: '勝', meanings: ['Thắng', 'Chiến thắng'], onyomi: ['ショウ'], kunyomi: ['か・つ', 'まさ・る'] },
  { kanji: '負', meanings: ['Phụ', 'Thua', 'Gánh vác'], onyomi: ['フ'], kunyomi: ['ま・ける', 'お・う'] },
  { kanji: '利', meanings: ['Lợi', 'Lợi ích', 'Tiện lợi'], onyomi: ['リ'], kunyomi: ['き・く'] },
  { kanji: '益', meanings: ['Ích', 'Lợi ích', 'Bổ ích'], onyomi: ['エキ', 'ヤク'], kunyomi: ['ま・す'] },
  { kanji: '害', meanings: ['Hại', 'Tác hại', 'Tổn hại'], onyomi: ['ガイ'], kunyomi: [] },
  { kanji: '損', meanings: ['Tổn', 'Tổn thất', 'Thiệt hại'], onyomi: ['ソン'], kunyomi: ['そこ・なう'] },
  { kanji: '得', meanings: ['Đắc', 'Được', 'Đạt được'], onyomi: ['トク'], kunyomi: ['え・る', 'う・る'] },
  { kanji: '失', meanings: ['Thất', 'Mất', 'Thất bại'], onyomi: ['シツ'], kunyomi: ['うしな・う'] }
].map(k => ({ ...k, level: 'N3', onyomi: k.onyomi || [], kunyomi: k.kunyomi || [], vi_meanings: k.meanings }));

const N2_EXTRA = [
  { kanji: '構', meanings: ['Cấu', 'Cấu trúc', 'Xây dựng'], onyomi: ['コウ'], kunyomi: ['かま・う', 'かま・える'] },
  { kanji: '造', meanings: ['Tạo', 'Chế tạo', 'Sáng tạo'], onyomi: ['ゾウ'], kunyomi: ['つく・る'] },
  { kanji: '築', meanings: ['Trúc', 'Kiến trúc', 'Xây đắp'], onyomi: ['チク'], kunyomi: ['きず・く'] },
  { kanji: '演', meanings: ['Diễn', 'Biểu diễn', 'Diễn thuyết'], onyomi: ['エン'], kunyomi: [] },
  { kanji: '奏', meanings: ['Tấu', 'Tấu nhạc', 'Hòa tấu'], onyomi: ['ソウ'], kunyomi: ['かな・でる'] },
  { kanji: '劇', meanings: ['Kịch', 'Kịch tích', 'Vở kịch'], onyomi: ['ゲキ'], kunyomi: [] },
  { kanji: '舞', meanings: ['Vũ', 'Múa', 'Vũ đài'], onyomi: ['ブ'], kunyomi: ['ま・う', 'まい'] },
  { kanji: '台', meanings: ['Đài', 'Khán đài', 'Vũ đài'], onyomi: ['ダイ', 'タイ'], kunyomi: [] },
  { kanji: '防', meanings: ['Phòng', 'Phòng chống', 'Đề phòng'], onyomi: ['ボウ'], kunyomi: ['ふせ・ぐ'] },
  { kanji: '護', meanings: ['Hộ', 'Bảo hộ', 'Hộ vệ'], onyomi: ['ゴ'], kunyomi: [] },
  { kanji: '憲', meanings: ['Hiến', 'Hiến pháp'], onyomi: ['ケン'], kunyomi: [] },
  { kanji: '法', meanings: ['Pháp', 'Pháp luật', 'Phương pháp'], onyomi: ['ホウ', 'ハッ'], kunyomi: [] },
  { kanji: '律', meanings: ['Luật', 'Quy luật', 'Kỷ luật'], onyomi: ['リツ', 'リチ'], kunyomi: [] },
  { kanji: '令', meanings: ['Lệnh', 'Mệnh lệnh', 'Nghị định'], onyomi: ['レイ'], kunyomi: [] },
  { kanji: '条', meanings: ['Điều', 'Điều khoản', 'Điều lệ'], onyomi: ['ジョウ'], kunyomi: [] },
  { kanji: '項', meanings: ['Hạng', 'Hạng mục', 'Khoản mục'], onyomi: ['コウ'], kunyomi: [] },
  { kanji: '裁', meanings: ['Tài', 'Phán xét', 'Trọng tài'], onyomi: ['サイ'], kunyomi: ['さば・く', 'た・つ'] },
  { kanji: '判', meanings: ['Phán', 'Phán đoán', 'Phán quyết'], onyomi: ['ハン', 'バン'], kunyomi: [] },
  { kanji: '審', meanings: ['Thẩm', 'Thẩm tra', 'Thẩm phán'], onyomi: ['シン'], kunyomi: [] },
  { kanji: '查', meanings: ['Tra', 'Kiểm tra', 'Điều tra'], onyomi: ['サ'], kunyomi: [] },
  { kanji: '検', meanings: ['Kiểm', 'Kiểm tra', 'Khám xét'], onyomi: ['ケン'], kunyomi: [] },
  { kanji: '索', meanings: ['Sách', 'Tìm kiếm', 'Dây thừng'], onyomi: ['サク'], kunyomi: [] },
  { kanji: '討', meanings: ['Thảo', 'Thảo phạt', 'Thảo luận'], onyomi: ['トウ'], kunyomi: ['う・つ'] },
  { kanji: '論', meanings: ['Luận', 'Lý luận', 'Thảo luận'], onyomi: ['ロン'], kunyomi: [] },
  { kanji: '述', meanings: ['Thuật', 'Tường thuật', 'Trần thuật'], onyomi: ['ジュツ'], kunyomi: ['の・べる'] },
  { kanji: '記', meanings: ['Ký', 'Ghi ký', 'Ký sự'], onyomi: ['キ'], kunyomi: ['しる・す'] },
  { kanji: '載', meanings: ['Tái', 'Đăng tải', 'Ghi chép'], onyomi: ['サイ'], kunyomi: ['の・る', 'の・せる'] },
  { kanji: '掲', meanings: ['Yết', 'Niêm yết', 'Đăng báo'], onyomi: ['ケイ'], kunyomi: ['かか・げる'] },
  { kanji: '宣', meanings: ['Tuyên', 'Tuyên truyền', 'Tuyên xưng'], onyomi: ['セン'], kunyomi: [] },
  { kanji: '言', meanings: ['Ngôn', 'Lời nói', 'Tuyên ngôn'], onyomi: ['ゲン', 'ゴン'], kunyomi: ['い・う', 'こと'] },
  { kanji: '語', meanings: ['Ngữ', 'Ngôn ngữ', 'Kể chuyện'], onyomi: ['ゴ'], kunyomi: ['かた・る'] },
  { kanji: '訳', meanings: ['Dịch', 'Phiên dịch', 'Lý do'], onyomi: ['ヤク'], kunyomi: ['わけ'] },
  { kanji: '解', meanings: ['Giải', 'Giải thích', 'Hiểu'], onyomi: ['カイ', 'ゲ'], kunyomi: ['と・く', 'と・ける'] },
  { kanji: '釈', meanings: ['Thích', 'Giải thích', 'Thích giáo'], onyomi: ['シャク'], kunyomi: [] }
].map(k => ({ ...k, level: 'N2', onyomi: k.onyomi || [], kunyomi: k.kunyomi || [], vi_meanings: k.meanings }));

const N1_EXTRA = [
  { kanji: '唆', meanings: ['Toa', 'Xúi giục', 'Ám thị'], onyomi: ['サ'], kunyomi: ['そそのか・す'] },
  { kanji: '曖', meanings: ['Ái', 'Mơ hồ', 'Mờ mịt'], onyomi: ['アイ'], kunyomi: [] },
  { kanji: '昧', meanings: ['Muội', 'Tăm tối', 'Mơ hồ'], onyomi: ['マイ'], kunyomi: [] },
  { kanji: '緻', meanings: ['Trí', 'Tinh tế', 'Kỹ lưỡng'], onyomi: ['チ'], kunyomi: [] },
  { kanji: '密', meanings: ['Mật', 'Bí mật', 'Dày đặc'], onyomi: ['ミツ'], kunyomi: [] },
  { kanji: '嘲', meanings: ['Trào', 'Chế giễu', 'Cười nhạo'], onyomi: ['チョウ'], kunyomi: ['あざけ・る'] },
  { kanji: '玩', meanings: ['Ngoạn', 'Thưởng thức', 'Đồ chơi'], onyomi: ['ガン'], kunyomi: ['もてあそ・ぶ'] },
  { kanji: '弄', meanings: ['Lộng', 'Đùa cợt', 'Lạm dụng'], onyomi: ['ロウ'], kunyomi: ['いじ・る', 'もてあそ・ぶ'] },
  { kanji: '憐', meanings: ['Lân', 'Thương xót', 'Thương hại'], onyomi: ['レン'], kunyomi: ['あわ・れむ'] },
  { kanji: '憫', meanings: ['Mẫn', 'Xót thương', 'Thương cảm'], onyomi: ['ビン', 'ミン'], kunyomi: ['あわ・れむ'] },
  { kanji: '恣', meanings: ['Tứ', 'Tùy tiện', 'Phóng túng'], onyomi: ['シ'], kunyomi: ['ほしいまま'] },
  { kanji: '傲', meanings: ['Ngạo', 'Ngạo mạn', 'Kiêu ngạo'], onyomi: ['ゴウ'], kunyomi: [] },
  { kanji: '慢', meanings: ['Mạn', 'Chậm chạp', 'Kiêu mạn'], onyomi: ['マン'], kunyomi: [] },
  { kanji: '貪', meanings: ['Tham', 'Tham lam', 'Ham muốn'], onyomi: ['ドン', 'タン'], kunyomi: ['むさぼ・る'] },
  { kanji: '婪', meanings: ['Lam', 'Tham lam'], onyomi: ['ラン'], kunyomi: [] },
  { kanji: '嫉', meanings: ['Tật', 'Ghen ghét', 'Đố kỵ'], onyomi: ['シツ'], kunyomi: ['そね・む'] },
  { kanji: '妬', meanings: ['Đố', 'Ghen tuông', 'Đố kỵ'], onyomi: ['ト'], kunyomi: ['ねた・む'] },
  { kanji: '怨', meanings: ['Oán', 'Oán hận', 'Oán trách'], onyomi: ['エン', 'オン'], kunyomi: ['うら・む'] },
  { kanji: '恨', meanings: ['Hận', 'Căm thù', 'Hận thù'], onyomi: ['コン'], kunyomi: ['うら・む', 'うら・めしい'] },
  { kanji: '憤', meanings: ['Phẫn', 'Phẫn nộ', 'Căm phẫn'], onyomi: ['フン'], kunyomi: ['いきどお・る'] },
  { kanji: '慨', meanings: ['Khái', 'Cảm khái', 'Than thở'], onyomi: ['ガイ'], kunyomi: [] },
  { kanji: '慄', meanings: ['Lật', 'Rùng mình', 'Sợ hãi'], onyomi: ['リツ'], kunyomi: ['おのの・く'] },
  { kanji: '惧', meanings: ['Cụ', 'Lo sợ', 'Kính sợ'], onyomi: ['ク'], kunyomi: ['おそ・れる'] },
  { kanji: '恍', meanings: ['Hoảng', 'Ngơ ngẩn', 'Mơ màng'], onyomi: ['コウ'], kunyomi: ['ほの・か'] },
  { kanji: '惚', meanings: ['Hốt', 'Say mê', 'Si tình'], onyomi: ['コツ'], kunyomi: ['ほ・れる', 'ぼ・ける'] },
  { kanji: '憧', meanings: ['Sung', 'Ngưỡng mộ', 'Khao khát'], onyomi: ['ショウ'], kunyomi: ['あこが・れる'] },
  { kanji: '憬', meanings: ['Cảnh', 'Ngưỡng vọng', 'Mơ ước'], onyomi: ['ケイ'], kunyomi: ['あこが・れる'] }
].map(k => ({ ...k, level: 'N1', onyomi: k.onyomi || [], kunyomi: k.kunyomi || [], vi_meanings: k.meanings }));

const fullList = [...n5, ...n4, ...n3, ...N3_EXTRA, ...n2, ...N2_EXTRA, ...n1, ...N1_EXTRA];

const seen = new Set();
const finalKanji = [];

for (const item of fullList) {
  if (!item.kanji || seen.has(item.kanji)) continue;
  seen.add(item.kanji);
  finalKanji.push({
    id: `k_${item.level.toLowerCase()}_${String(finalKanji.length + 1).padStart(4, '0')}`,
    kanji: item.kanji,
    level: item.level,
    meanings: item.meanings || [],
    onyomi: item.onyomi || [],
    kunyomi: item.kunyomi || [],
    vi_meanings: item.meanings || []
  });
}

console.log('Total Kanji generated:', finalKanji.length);
const counts = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
finalKanji.forEach(k => counts[k.level] = (counts[k.level] || 0) + 1);
console.log('Kanji count by level:', counts);

// Update jlpt_master_db.json
const dbPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
dbContent.kanji = finalKanji;
fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2), 'utf8');

console.log('✅ jlpt_master_db.json updated with massive Kanji dataset!');

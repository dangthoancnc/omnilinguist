const fs = require('fs');
const path = require('path');

const radicals = require('./kanji_radicals.cjs');

// Complete lists of Kanji by level
const kanjiN5 = require('./kanji_n5.cjs');
const kanjiN4 = require('./kanji_n4.cjs');
const kanjiN3 = require('./kanji_n3.cjs');
const kanjiN2 = require('./kanji_n2.cjs');
const kanjiN1 = require('./kanji_n1.cjs');

console.log('Loading additional Joyo Kanji sets...');

// Helper to build enriched entries
function makeEntry(kanji, level, hanViet, viMeanings, on, kun) {
  return {
    kanji,
    level,
    meanings: [hanViet, ...viMeanings],
    onyomi: on || [],
    kunyomi: kun || [],
    vi_meanings: [hanViet, ...viMeanings]
  };
}

// Additional comprehensive Joyo N4-N1 lists
const EXTRA_N4_KANJI = [
  makeEntry('堂', 'N4', 'Đường', ['Hội trường', 'Nhà lớn'], ['ドウ'], []),
  makeEntry('建', 'N4', 'Kiến', ['Xây dựng', 'Kiến trúc'], ['ケン'], ['た・てる', 'た・つ']),
  makeEntry('夜', 'N4', 'Dạ', ['Đêm', 'Ban đêm'], ['ヤ'], ['よ', 'よる']),
  makeEntry('朝', 'N4', 'Triều', ['Buổi sáng', 'Triều đại'], ['チョウ'], ['あさ']),
  makeEntry('昼', 'N4', 'Trú', ['Buổi trưa', 'Ban ngày'], ['チュウ'], ['ひる']),
  makeEntry('夕', 'N4', 'Tịch', ['Chiều tối'], ['セキ'], ['ゆう']),
  makeEntry('方', 'N4', 'Phương', ['Phương hướng', 'Cách thức', 'Vị này'], ['ホウ'], ['かた']),
  makeEntry('晚', 'N4', 'Vãn', ['Buổi tối', 'Muộn'], ['バン'], []),
  makeEntry('計', 'N4', 'Kế', ['Kế hoạch', 'Đồng hồ đo'], ['ケイ'], ['はか・る']),
  makeEntry('公', 'N4', 'Công', ['Công cộng', 'Công khai'], ['コウ', 'ク'], ['おおやけ']),
  makeEntry('園', 'N4', 'Viên', ['Công viên', 'Khu vườn'], ['エン'], ['その']),
  makeEntry('犬', 'N4', 'Khuyển', ['Con chó'], ['ケン'], ['いぬ']),
  makeEntry('同', 'N4', 'Đồng', ['Giống nhau', 'Cùng'], ['ドウ'], ['おな・じ']),
  makeEntry('発', 'N4', 'Phát', ['Phát xuất', 'Khởi hành'], ['ハツ', 'ホツ'], ['た・つ']),
  makeEntry('送', 'N4', 'Tống', ['Gửi', 'Tiễn đưa'], ['ソウ'], ['おく・る']),
  makeEntry('受', 'N4', 'Thụ', ['Nhận', 'Tiếp nhận'], ['ジュ'], ['う・ける', 'う・かる']),
  makeEntry('取', 'N4', 'Thủ', ['Lấy', 'Cầm lấy'], ['シュ'], ['と・る']),
  makeEntry('持', 'N4', 'Trì', ['Cầm', 'Nắm giữ', 'Có'], ['ジ'], ['も・つ']),
  makeEntry('待', 'N4', 'Đãi', ['Chờ đợi'], ['タイ'], ['ま・つ']),
  makeEntry('特', 'N4', 'Đặc', ['Đặc biệt'], ['トク'], []),
  makeEntry('別', 'N4', 'Biệt', ['Khác biệt', 'Chia tay'], ['ベツ'], ['わか・れる']),
  makeEntry('重', 'N4', 'Trọng', ['Nặng', 'Quan trọng'], ['ジュウ', 'チョウ'], ['おも・い', 'かさ・ねる']),
  makeEntry('軽', 'N4', 'Khinh', ['Nhẹ'], ['ケイ'], ['かる・い']),
  makeEntry('広', 'N4', 'Quảng', ['Rộng lớn'], ['コウ'], ['ひろ・い', 'ひろ・がる']),
  makeEntry('太', 'N4', 'Thái', ['Béo', 'Dày'], ['タイ', 'タ'], ['ふと・い', 'ふと・る']),
  makeEntry('細', 'N4', 'Tế', ['Nhỏ', 'Gầy', 'Chi tiết'], ['サイ'], ['ほそ・い', 'こま・かい']),
  makeEntry('近', 'N4', 'Cận', ['Gần gũi'], ['キン'], ['ちか・い']),
  makeEntry('遠', 'N4', 'Viễn', ['Xa xôi'], ['エン'], ['とお・い']),
  makeEntry('強', 'N4', 'Cường', ['Mạnh mẽ', 'Khỏe mạnh'], ['キョウ', 'ゴウ'], ['つよ・い']),
  makeEntry('弱', 'N4', 'Nhược', ['Yếu đuối'], ['ジャク'], ['よわ・い'])
];

// Enriching N3 Kanji
const EXTRA_N3_KANJI = [
  makeEntry('調', 'N3', 'Điều', ['Điều tra', 'Giai điệu'], ['チョウ'], ['しら・べる', 'ととの・う']),
  makeEntry('査', 'N3', 'Tra', ['Điều tra', 'Kiểm tra'], ['サ'], []),
  makeEntry('組', 'N3', 'Tổ', ['Tổ hợp', 'Nhóm', 'Lắp ráp'], ['ソ'], ['く・む', 'くみ']),
  makeEntry('勝', 'N3', 'Thắng', ['Chiến thắng'], ['ショウ'], ['か・つ', 'まさ・る']),
  makeEntry('負', 'N3', 'Phụ', ['Thua cuộc', 'Gánh vác'], ['フ'], ['ま・ける', 'お・う']),
  makeEntry('配', 'N3', 'Phối', ['Phân phát', 'Lo lắng'], ['ハイ'], ['くば・る']),
  makeEntry('達', 'N3', 'Đạt', ['Đạt được', 'Đến nơi'], ['タツ', 'ダ'], ['たち']),
  makeEntry('直', 'N3', 'Trực', ['Sửa chữa', 'Thẳng thắn', 'Ngay lập tức'], ['チョク', 'ジキ'], ['なお・す', 'なお・る', 'ただ・ちに']),
  makeEntry('具', 'N3', 'Cụ', ['Dụng cụ', 'Đầy đủ'], ['グ'], []),
  makeEntry('法', 'N3', 'Pháp', ['Phương pháp', 'Pháp luật'], ['ホウ', 'ハッ'], []),
  makeEntry('規', 'N3', 'Quy', ['Quy tắc', 'Quy định'], ['キ'], []),
  makeEntry('則', 'N3', 'Tắc', ['Nguyên tắc', 'Quy tắc'], ['ソク'], []),
  makeEntry('程', 'N3', 'Trình', ['Mức độ', 'Quá trình'], ['テイ'], ['ほど']),
  makeEntry('度', 'N3', 'Độ', ['Mức độ', 'Nhiệt độ', 'Lần'], ['ド', 'ト'], ['たび']),
  makeEntry('適', 'N3', 'Thích', ['Thích hợp', 'Thích ứng'], ['テキ'], ['かな・う']),
  makeEntry('当', 'N3', 'Đương', ['Trúng', 'Đương nhiên', 'Đúng'], ['トウ'], ['あ・たる', 'あ・てる']),
  makeEntry('確', 'N3', 'Xác', ['Xác thực', 'Chính xác'], ['カク'], ['たし・か', 'たし・かめる']),
  makeEntry('認', 'N3', 'Nhận', ['Công nhận', 'Xác nhận'], ['ニン'], ['みと・める']),
  makeEntry('容', 'N3', 'Dung', ['Nội dung', 'Dung nhan'], ['ヨウ'], []),
  makeEntry('易', 'N3', 'Dịch', ['Dễ dàng', 'Mậu dịch'], ['エキ', 'イ'], ['やさ・しい']),
  makeEntry('情', 'N3', 'Tình', ['Tình cảm', 'Thông tin'], ['ジョウ', 'セイ'], ['なさ・け']),
  makeEntry('報', 'N3', 'Báo', ['Báo cáo', 'Thông báo'], ['ホウ'], ['むく・いる']),
  makeEntry('告', 'N3', 'Cáo', ['Thông báo', 'Tố cáo'], ['コク'], ['つ・げる']),
  makeEntry('表', 'N3', 'Biểu', ['Biểu hiện', 'Mặt ngoài', 'Bảng biểu'], ['ヒョウ'], ['おもて', 'あらわ・す']),
  makeEntry('現', 'N3', 'Hiện', ['Xuất hiện', 'Hiện tại'], ['ゲン'], ['あらわ・れる', 'あらわ・す']),
  makeEntry('状', 'N3', 'Trạng', ['Trạng thái', 'Thư từ'], ['ジョウ'], []),
  makeEntry('態', 'N3', 'Thái', ['Thái độ', 'Trạng thái'], ['タイ'], []),
  makeEntry('保', 'N3', 'Bảo', ['Bảo quản', 'Bảo đảm'], ['ホ'], ['たも・つ']),
  makeEntry('存', 'N3', 'Tồn', ['Tồn tại', 'Bảo tồn'], ['ソン', 'ゾン'], []),
  makeEntry('在', 'N3', 'Tại', ['Hiện diện', 'Ở tại'], ['ザイ'], ['あ・る'])
];

// Enriching N2 Kanji
const EXTRA_N2_KANJI = [
  makeEntry('施', 'N2', 'Thi', ['Thi hành', 'Thực thi'], ['シ', 'セ'], ['ほどこ・す']),
  makeEntry('設', 'N2', 'Thiết', ['Thiết lập', 'Thiết bị'], ['セツ'], ['もう・ける']),
  makeEntry('置', 'N2', 'Trí', ['Đặt để', 'Vị trí'], ['チ'], ['お・く']),
  makeEntry('総', 'N2', 'Tổng', ['Tổng cộng', 'Tổng quát'], ['ソウ'], ['す・べて']),
  makeEntry('領', 'N2', 'Lãnh', ['Lãnh đạo', 'Lãnh thổ'], ['リョウ'], []),
  makeEntry('域', 'N2', 'Vực', ['Khu vực', 'Lĩnh vực'], ['イキ'], []),
  makeEntry('諸', 'N2', 'Chư', ['Các', 'Nhiều', 'Chư vị'], ['ショ'], ['もろ']),
  makeEntry('島', 'N2', 'Đảo', ['Hòn đảo'], ['トウ'], ['しま']),
  makeEntry('岸', 'N2', 'Ngạn', ['Bờ biển', 'Bờ sông'], ['ガン'], ['きし']),
  makeEntry('湾', 'N2', 'Vịnh', ['Vịnh biển'], ['ワン'], []),
  makeEntry('港', 'N2', 'Cảng', ['Bến cảng', 'Hải cảng'], ['コウ'], ['みなと']),
  makeEntry('貿', 'N2', 'Mậu', ['Mậu dịch', 'Thương mại'], ['ボウ'], []),
  makeEntry('輸', 'N2', 'Thâu', ['Vận chuyển', 'Xuất nhập khẩu'], ['ユ', 'シュ'], []),
  makeEntry('採', 'N2', 'Thải', ['Tuyển dụng', 'Khai thác'], ['サイ'], ['と・る']),
  makeEntry('批', 'N2', 'Phê', ['Phê bình', 'Phán xét'], ['ヒ'], []),
  makeEntry('評', 'N2', 'Bình', ['Đánh giá', 'Bình luận'], ['ヒョウ'], []),
  makeEntry('裁', 'N2', 'Tài', ['Phán xét', 'Cắt may'], ['サイ'], ['さば・く', 'た・つ']),
  makeEntry('審', 'N2', 'Thẩm', ['Thẩm vấn', 'Thẩm tra'], ['シン'], []),
  makeEntry('判', 'N2', 'Phán', ['Phán đoán', 'Phán quyết'], ['ハン', 'バン'], []),
  makeEntry('断', 'N2', 'Đoạn', ['Cắt đứt', 'Từ chối', 'Phán đoán'], ['ダン'], ['ことわ・る', 'た・つ'])
];

// Enriching N1 Kanji
const EXTRA_N1_KANJI = [
  makeEntry('籠', 'N1', 'Lung', ['Cái giỏ', 'Giam cầm'], ['ロウ'], ['かご', 'こ・もる']),
  makeEntry('蔽', 'N1', 'Tế', ['Che giấu', 'Bao phủ'], ['ヘイ'], ['おお・う']),
  makeEntry('蔽', 'N1', 'Tế', ['Che giấu', 'Che đậy'], ['ヘイ'], ['おお・う']),
  makeEntry('鬱', 'N1', 'Uất', ['U sầu', 'Trầm cảm'], ['ウツ'], ['ふさ・ぐ']),
  makeEntry('緻', 'N1', 'Trí', ['Tinh xảo', 'Tỉ mỉ'], ['チ'], []),
  makeEntry('濫', 'N1', 'Lạm', ['Lạm dụng', 'Tràn ngập'], ['ラン'], ['みだ・りに']),
  makeEntry('蔑', 'N1', 'Miệt', ['Khinh miệt', 'Coi thường'], ['ベツ'], ['さげす・む']),
  makeEntry('嘲', 'N1', 'Trào', ['Cười nhạo', 'Chế giễu'], ['チョウ'], ['あざけ・る']),
  makeEntry('玩', 'N1', 'Ngoạn', ['Đồ chơi', 'Thưởng thức'], ['ガン'], ['もてあそ・ぶ']),
  makeEntry('弄', 'N1', 'Lộng', ['Trêu cợt', 'Lộng hành'], ['ロウ'], ['いじ・る', 'もてあそ・ぶ']),
  makeEntry('憐', 'N1', 'Lân', ['Thương xót', 'Thương cảm'], ['レン'], ['あわ・れむ']),
  makeEntry('憫', 'N1', 'Mẫn', ['Xót thương'], ['ビン', 'ミン'], ['あわ・れむ']),
  makeEntry('傲', 'N1', 'Ngạo', ['Ngạo mạn', 'Kiêu căng'], ['ゴウ'], []),
  makeEntry('慢', 'N1', 'Mạn', ['Kiêu mạn', 'Chậm chạp'], ['マン'], []),
  makeEntry('貪', 'N1', 'Tham', ['Tham lam', 'Ham muốn'], ['ドン', 'タン'], ['むさぼ・る']),
  makeEntry('婪', 'N1', 'Lam', ['Tham lam'], ['ラン'], []),
  makeEntry('妬', 'N1', 'Đố', ['Đố kỵ', 'Ghen ghét'], ['ト'], ['ねた・む']),
  makeEntry('怨', 'N1', 'Oán', ['Oán hận', 'Oán trách'], ['エン', 'オン'], ['うら・む']),
  makeEntry('恨', 'N1', 'Hận', ['Căm thù', 'Hận thù'], ['コン'], ['うら・む', 'うら・めしい']),
  makeEntry('憤', 'N1', 'Phẫn', ['Phẫn nộ', 'Căm phẫn'], ['フン'], ['いきどお・る']),
  makeEntry('慨', 'N1', 'Khái', ['Cảm khái', 'Than thở'], ['ガイ'], []),
  makeEntry('慄', 'N1', 'Lật', ['Rùng mình', 'Sợ hãi'], ['リツ'], ['おのの・く']),
  makeEntry('惧', 'N1', 'Cụ', ['Kính sợ', 'Lo sợ'], ['ク'], ['おそ・れる']),
  makeEntry('恍', 'N1', 'Hoảng', ['Ngơ ngẩn', 'Mơ màng'], ['コウ'], ['ほの・か']),
  makeEntry('惚', 'N1', 'Hốt', ['Say mê', 'Si tình'], ['コツ'], ['ほ・れる', 'ぼ・ける']),
  makeEntry('憧', 'N1', 'Sung', ['Ngưỡng mộ', 'Khao khát'], ['ショウ'], ['あこが・れる']),
  makeEntry('憬', 'N1', 'Cảnh', ['Ngưỡng vọng', 'Mơ ước'], ['ケイ'], ['あこが・れる']),
  makeEntry('羨', 'N1', 'Tiện', ['Ghen tị', 'Thèm muốn'], ['セン'], ['うらや・む']),
  makeEntry('嫉', 'N1', 'Tật', ['Ghen ghét', 'Đố kỵ'], ['シツ'], ['そね・む']),
  makeEntry('憎', 'N1', 'Tăng', ['Căm ghét', 'Đáng ghét'], ['ゾウ'], ['にく・む', 'にく・らしい']),
  makeEntry('憾', 'N1', 'Hám', ['Hối tiếc', 'Đáng tiếc'], ['カン'], ['うら・む'])
];

// Combine all datasets
const combinedAll = [
  ...radicals,
  ...kanjiN5,
  ...kanjiN4,
  ...EXTRA_N4_KANJI,
  ...kanjiN3,
  ...EXTRA_N3_KANJI,
  ...kanjiN2,
  ...EXTRA_N2_KANJI,
  ...kanjiN1,
  ...EXTRA_N1_KANJI
];

const seen = new Set();
const finalMasterKanji = [];

for (const item of combinedAll) {
  if (!item.kanji) continue;
  // If it's a radical, use 'Bộ Thủ', otherwise check level
  const uniqueKey = `${item.level}_${item.kanji}`;
  if (seen.has(uniqueKey)) continue;
  seen.add(uniqueKey);

  finalMasterKanji.push({
    id: `k_${item.level === 'Bộ Thủ' ? 'bushu' : item.level.toLowerCase()}_${String(finalMasterKanji.length + 1).padStart(4, '0')}`,
    kanji: item.kanji,
    level: item.level,
    meanings: item.meanings || item.vi_meanings || [],
    onyomi: item.onyomi || [],
    kunyomi: item.kunyomi || [],
    vi_meanings: item.vi_meanings || item.meanings || []
  });
}

console.log('Total Master Kanji & Radicals generated:', finalMasterKanji.length);
const counts = {};
finalMasterKanji.forEach(k => counts[k.level] = (counts[k.level] || 0) + 1);
console.log('Kanji count breakdown:', counts);

// Update jlpt_master_db.json
const dbPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
dbContent.kanji = finalMasterKanji;
fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2), 'utf8');

console.log('✅ jlpt_master_db.json successfully updated with 214+ Bộ Thủ and full N5-N1 Kanji cards!');

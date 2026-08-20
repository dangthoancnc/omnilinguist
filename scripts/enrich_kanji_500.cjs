const fs = require('fs');
const path = require('path');

const MORE_N2_KANJI = [
  { kanji: '協', level: 'N2', meanings: ['Hiệp', 'Hợp tác', 'Hiệp lực'], onyomi: ['キョウ'], kunyomi: [] },
  { kanji: '労', level: 'N2', meanings: ['Lao', 'Lao động', 'Vất vả'], onyomi: ['ロウ'], kunyomi: ['ねぎら・う'] },
  { kanji: '働', level: 'N2', meanings: ['Động', 'Làm việc', 'Lao động'], onyomi: ['ドウ'], kunyomi: ['はたら・く'] },
  { kanji: '輸', level: 'N2', meanings: ['Thâu', 'Vận chuyển', 'Xuất nhập khẩu'], onyomi: ['ユ', 'シュ'], kunyomi: [] },
  { kanji: '貿', level: 'N2', meanings: ['Mậu', 'Mậu dịch', 'Thương mại'], onyomi: ['ボウ'], kunyomi: [] },
  { kanji: '易', level: 'N2', meanings: ['Dịch', 'Mậu dịch', 'Dễ'], onyomi: ['エキ', 'イ'], kunyomi: ['やさ・しい'] },
  { kanji: '収', level: 'N2', meanings: ['Thu', 'Thu nhập', 'Thu hoạch'], onyomi: ['シュウ'], kunyomi: ['おさ・める', 'おさ・まる'] },
  { kanji: '支', level: 'N2', meanings: ['Chi', 'Chi trả', 'Chi nhánh'], onyomi: ['シ'], kunyomi: ['ささ・える'] },
  { kanji: '払', level: 'N2', meanings: ['Phất', 'Chi trả', 'Quét sạch'], onyomi: ['フツ', 'ヒツ'], kunyomi: ['はら・う'] },
  { kanji: '額', level: 'N2', meanings: ['Ngạch', 'Số tiền', 'Hạn mức', 'Trán'], onyomi: ['ガク'], kunyomi: ['ひたい'] },
  { kanji: '投', level: 'N2', meanings: ['Đầu', 'Đầu tư', 'Ném'], onyomi: ['トウ'], kunyomi: ['な・げる'] },
  { kanji: '資', level: 'N2', meanings: ['Tư', 'Đầu tư', 'Tư bản'], onyomi: ['シ'], kunyomi: [] },
  { kanji: '税', level: 'N2', meanings: ['Thuế', 'Tiền thuế'], onyomi: ['ゼイ'], kunyomi: [] },
  { kanji: '諸', level: 'N2', meanings: ['Chư', 'Các', 'Nhiều'], onyomi: ['ショ'], kunyomi: ['もろ'] },
  { kanji: '費', level: 'N2', meanings: ['Phí', 'Chi phí', 'Tiêu hao'], onyomi: ['ヒ'], kunyomi: ['つい・やす'] },
  { kanji: '況', level: 'N2', meanings: ['Huống', 'Tình huống', 'Tình hình'], onyomi: ['キョウ'], kunyomi: [] },
  { kanji: '態', level: 'N2', meanings: ['Thái', 'Trạng thái', 'Thái độ'], onyomi: ['タイ'], kunyomi: [] },
  { kanji: '勢', level: 'N2', meanings: ['Thế', 'Tư thế', 'Xu thế'], onyomi: ['セイ'], kunyomi: ['いきお・い'] },
  { kanji: '趨', level: 'N2', meanings: ['Xu', 'Xu hướng'], onyomi: ['スウ', 'シュ'], kunyomi: ['おもむ・く'] },
  { kanji: '向', level: 'N2', meanings: ['Hướng', 'Phương hướng', 'Hướng tới'], onyomi: ['コウ'], kunyomi: ['む・く', 'む・かう'] },
  { kanji: '及', level: 'N2', meanings: ['Cập', 'Phổ cập', 'Lan tới'], onyomi: ['キュウ'], kunyomi: ['およ・ぶ', 'およ・ぼす'] },
  { kanji: '普', level: 'N2', meanings: ['Phổ', 'Phổ biến', 'Rộng khắp'], onyomi: ['フ'], kunyomi: [] },
  { kanji: '導', level: 'N2', meanings: ['Đạo', 'Chỉ đạo', 'Dẫn dắt'], onyomi: ['ドウ'], kunyomi: ['みちび・く'] },
  { kanji: '引', level: 'N2', meanings: ['Dẫn', 'Kéo', 'Trừ'], onyomi: ['イン'], kunyomi: ['ひ・く', 'ひ・ける'] },
  { kanji: '創', level: 'N2', meanings: ['Sáng', 'Sáng lập', 'Sáng tạo'], onyomi: ['ソウ', 'ショウ'], kunyomi: ['つく・る'] },
  { kanji: '設', level: 'N2', meanings: ['Thiết', 'Thiết lập', 'Thiết bị'], onyomi: ['セツ'], kunyomi: ['もう・ける'] },
  { kanji: '備', level: 'N2', meanings: ['Bị', 'Trang bị', 'Chuẩn bị'], onyomi: ['ビ'], kunyomi: ['そな・える'] },
  { kanji: '改', level: 'N2', meanings: ['Cải', 'Cải cách', 'Cải thiện'], onyomi: ['カイ'], kunyomi: ['あらた・める'] },
  { kanji: '善', level: 'N2', meanings: ['Thiện', 'Tốt đẹp', 'Hoàn thiện'], onyomi: ['ゼン'], kunyomi: ['よ・い'] },
  { kanji: '良', level: 'N2', meanings: ['Lương', 'Tốt', 'Lương tâm'], onyomi: ['リョウ'], kunyomi: ['よ・い'] },
  { kanji: '悪', level: 'N2', meanings: ['Ác', 'Xấu xa', 'Ác độc'], onyomi: ['アク', 'オ'], kunyomi: ['わる・い'] },
  { kanji: '劣', level: 'N2', meanings: ['Liệt', 'Kém cỏi', 'Yếu thế'], onyomi: ['レツ'], kunyomi: ['おと・る'] },
  { kanji: '優', level: 'N2', meanings: ['Ưu', 'Ưu tú', 'Dịu dàng'], onyomi: ['ユウ', 'ウ'], kunyomi: ['やさ・しい', 'すぐ・れる'] },
  { kanji: '勝', level: 'N2', meanings: ['Thắng', 'Chiến thắng'], onyomi: ['ショウ'], kunyomi: ['か・つ'] },
  { kanji: '負', level: 'N2', meanings: ['Phụ', 'Thua', 'Gánh vác'], onyomi: ['フ'], kunyomi: ['ま・ける', 'お・う'] },
  { kanji: '敗', level: 'N2', meanings: ['Bại', 'Thất bại'], onyomi: ['ハイ'], kunyomi: ['やぶ・れる'] },
  { kanji: '退', level: 'N2', meanings: ['Thoái', 'Rút lui', 'Thoái lui'], onyomi: ['タイ'], kunyomi: ['しりぞ・く', 'の・く'] },
  { kanji: '進', level: 'N2', meanings: ['Tiến', 'Tiến bộ', 'Tiến lên'], onyomi: ['シン'], kunyomi: ['すす・む', 'すす・める'] },
  { kanji: '歩', level: 'N2', meanings: ['Bộ', 'Tiến bộ', 'Đi bộ'], onyomi: ['ホ', 'ブ'], kunyomi: ['ある・く'] },
  { kanji: '停', level: 'N2', meanings: ['Đình', 'Đình trệ', 'Dừng lại'], onyomi: ['テイ'], kunyomi: ['と・まる'] },
  { kanji: '止', level: 'N2', meanings: ['Chỉ', 'Dừng', 'Ngăn chặn'], onyomi: ['シ'], kunyomi: ['と・まる', 'と・める'] },
  { kanji: '留', level: 'N2', meanings: ['Lưu', 'Lưu lại', 'Du học'], onyomi: ['リュウ', 'ル'], kunyomi: ['と・まる', 'と・める'] },
  { kanji: '居', level: 'N2', meanings: ['Cư', 'Cư trú', 'Ở lại'], onyomi: ['キョ', 'コ'], kunyomi: ['い・る'] },
  { kanji: '住', level: 'N2', meanings: ['Trú', 'Sinh sống', 'Địa chỉ'], onyomi: ['ジュウ'], kunyomi: ['す・む'] },
  { kanji: '宿', level: 'N2', meanings: ['Túc', 'Nhà trọ', 'Nghỉ ngơi'], onyomi: ['シュク'], kunyomi: ['やど', 'やど・る'] },
  { kanji: '泊', level: 'N2', meanings: ['Bạc', 'Trọ lại', 'Nghỉ đêm'], onyomi: ['ハク'], kunyomi: ['と・まる', 'と・める'] },
  { kanji: '賃', level: 'N2', meanings: ['Nhẫm', 'Tiền thuê', 'Tiền công'], onyomi: ['チン'], kunyomi: [] },
  { kanji: '貸', level: 'N2', meanings: ['Thải', 'Cho thuê', 'Cho vay'], onyomi: ['タイ'], kunyomi: ['か・す'] },
  { kanji: '借', level: 'N2', meanings: ['Tá', 'Mượn', 'Thuê'], onyomi: ['シャク'], kunyomi: ['か・りる'] },
  { kanji: '契', level: 'N2', meanings: ['Khế', 'Khế ước', 'Hợp đồng'], onyomi: ['ケイ'], kunyomi: ['ちぎ・る'] },
  { kanji: '約', level: 'N2', meanings: ['Ước', 'Hợp đồng', 'Lời hứa'], onyomi: ['ヤク'], kunyomi: [] }
];

const MORE_N1_KANJI = [
  { kanji: '醸', level: 'N1', meanings: ['Nhưỡng', 'Ủ rượu', 'Tạo ra'], onyomi: ['ジョウ'], kunyomi: ['かも・す'] },
  { kanji: '造', level: 'N1', meanings: ['Tạo', 'Chế tạo', 'Tạo tác'], onyomi: ['ゾウ'], kunyomi: ['つく・る'] },
  { kanji: '糾', level: 'N1', meanings: ['Củ', 'Vặn xoắn', 'Điều tra làm rõ'], onyomi: ['キュウ'], kunyomi: [] },
  { kanji: '弾', level: 'N1', meanings: ['Đạn', 'Chỉ trích', 'Bắn đạn'], onyomi: ['ダン'], kunyomi: ['ひ・く', 'はず・む'] },
  { kanji: '糾', level: 'N1', meanings: ['Củ', 'Tố cáo', 'Chất vấn'], onyomi: ['キュウ'], kunyomi: [] },
  { kanji: '劾', level: 'N1', meanings: ['Hặc', 'Hặc tội', 'Đàn hặc'], onyomi: ['ガイ'], kunyomi: [] },
  { kanji: '阻', level: 'N1', meanings: ['Trở', 'Ngăn cản', 'Trở ngại'], onyomi: ['ソ'], kunyomi: ['はば・む'] },
  { kanji: '喪', level: 'N1', meanings: ['Tang', 'Tang tóc', 'Mất mát'], onyomi: ['ソウ'], kunyomi: ['も', 'うしな・う'] },
  { kanji: '失', level: 'N1', meanings: ['Thất', 'Mất mát', 'Đánh mất'], onyomi: ['シツ'], kunyomi: ['うしな・う'] },
  { kanji: '欺', level: 'N1', meanings: ['Khi', 'Lừa dối', 'Lừa gạt'], onyomi: ['ギ'], kunyomi: ['あざむ・く'] },
  { kanji: '詐', level: 'N1', meanings: ['Trá', 'Dối trá', 'Lừa đảo'], onyomi: ['サ'], kunyomi: [] },
  { kanji: '瞞', level: 'N1', meanings: ['Man', 'Lừa dối', 'Che mắt'], onyomi: ['マン'], kunyomi: ['ごまか・す'] },
  { kanji: '騙', level: 'N1', meanings: ['Phiến', 'Lừa gạt', 'Dỗ dành'], onyomi: ['ヘン'], kunyomi: ['だま・す'] },
  { kanji: '賄', level: 'N1', meanings: ['Hối', 'Hối lộ', 'Chi trả'], onyomi: ['ワイ'], kunyomi: ['まかな・う'] },
  { kanji: '賂', level: 'N1', meanings: ['Lộ', 'Hối lộ', 'Quà cáp'], onyomi: ['ロ'], kunyomi: [] },
  { kanji: '貪', level: 'N1', meanings: ['Tham', 'Tham nhũng', 'Tham lam'], onyomi: ['ドン'], kunyomi: ['むさぼ・る'] },
  { kanji: '汚', level: 'N1', meanings: ['Ô', 'Ô nhiễm', 'Ô danh'], onyomi: ['オ'], kunyomi: ['きたな・い', 'よご・す'] },
  { kanji: '濁', level: 'N1', meanings: ['Trọc', 'Vẩn đục', 'Ô trọc'], onyomi: ['ダク'], kunyomi: ['にご・る'] },
  { kanji: '廉', level: 'N1', meanings: ['Liêm', 'Liêm chính', 'Thanh liêm'], onyomi: ['レン'], kunyomi: [] },
  { kanji: '潔', level: 'N1', meanings: ['Khiết', 'Thanh khiết', 'Trong sạch'], onyomi: ['ケツ'], kunyomi: ['いさぎよ・い'] },
  { kanji: '清', level: 'N1', meanings: ['Thanh', 'Thanh bạch', 'Trong trẻo'], onyomi: ['セイ'], kunyomi: ['きよ・い'] },
  { kanji: '澄', level: 'N1', meanings: ['Trừng', 'Trong suốt', 'Trầm lắng'], onyomi: ['チョウ'], kunyomi: ['す・む', 'す・ます'] },
  { kanji: '粛', level: 'N1', meanings: ['Túc', 'Nghiêm túc', 'Trang nghiêm'], onyomi: ['シュク'], kunyomi: [] },
  { kanji: '厳', level: 'N1', meanings: ['Nghiêm', 'Nghiêm khắc', 'Trang nghiêm'], onyomi: ['ゲン', 'ゴン'], kunyomi: ['きび・しい', 'おごそ・か'] },
  { kanji: '謹', level: 'N1', meanings: ['Cẩn', 'Cẩn thận', 'Cung kính'], onyomi: ['キン'], kunyomi: ['つつし・む'] },
  { kanji: '慎', level: 'N1', meanings: ['Thận', 'Thận trọng'], onyomi: ['シン'], kunyomi: ['つつし・む'] },
  { kanji: '戒', level: 'N1', meanings: ['Giới', 'Cảnh giới', 'Răn dạy'], onyomi: ['カイ'], kunyomi: ['いまし・める'] },
  { kanji: '懲', level: 'N1', meanings: ['Trừng', 'Trừng phạt', 'Trừng trị'], onyomi: ['チョウ'], kunyomi: ['こ・りる', 'こ・らす'] },
  { kanji: '罰', level: 'N1', meanings: ['Phạt', 'Hình phạt', 'Xử phạt'], onyomi: ['バツ', 'バチ'], kunyomi: [] },
  { kanji: '処', level: 'N1', meanings: ['Xử', 'Xử lý', 'Xử phạt'], onyomi: ['ショ'], kunyomi: [] },
  { kanji: '刑', level: 'N1', meanings: ['Hình', 'Hình sự', 'Hình phạt'], onyomi: ['ケイ'], kunyomi: [] }
];

const dbPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const existingKanji = dbContent.kanji || [];
const combined = [...existingKanji, ...MORE_N2_KANJI, ...MORE_N1_KANJI];

const seen = new Set();
const finalKanji = [];

for (const k of combined) {
  if (!k.kanji || seen.has(k.kanji)) continue;
  seen.add(k.kanji);
  finalKanji.push({
    id: `k_${k.level.toLowerCase()}_${String(finalKanji.length + 1).padStart(4, '0')}`,
    kanji: k.kanji,
    level: k.level,
    meanings: k.meanings || k.vi_meanings || [],
    onyomi: k.onyomi || [],
    kunyomi: k.kunyomi || [],
    vi_meanings: k.meanings || k.vi_meanings || []
  });
}

console.log('Total enriched Kanji:', finalKanji.length);
const counts = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
finalKanji.forEach(k => counts[k.level] = (counts[k.level] || 0) + 1);
console.log('Enriched counts by level:', counts);

dbContent.kanji = finalKanji;
fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2), 'utf8');
console.log('✅ jlpt_master_db.json updated with 500+ Kanji master database!');

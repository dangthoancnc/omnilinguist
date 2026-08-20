const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const currentList = dbContent.kanji || [];

const N3_EXTRA = [
  { kanji: '政', level: 'N3', meanings: ['Chính', 'Chính trị', 'Chính phủ'], onyomi: ['セイ', 'ショウ'], kunyomi: ['まつりごと'] },
  { kanji: '治', level: 'N3', meanings: ['Trị', 'Chữa trị', 'Cai trị'], onyomi: ['ジ', 'チ'], kunyomi: ['おさ・める', 'なお・る'] },
  { kanji: '経', level: 'N3', meanings: ['Kinh', 'Kinh tế', 'Trải qua'], onyomi: ['ケイ', 'キョウ'], kunyomi: ['へ・る'] },
  { kanji: '済', level: 'N3', meanings: ['Tế', 'Kinh tế', 'Hoàn tất'], onyomi: ['サイ'], kunyomi: ['す・む'] },
  { kanji: '歴', level: 'N3', meanings: ['Lịch', 'Lịch sử', 'Lý lịch'], onyomi: ['レキ'], kunyomi: [] },
  { kanji: '史', level: 'N3', meanings: ['Sử', 'Lịch sử'], onyomi: ['シ'], kunyomi: [] },
  { kanji: '育', level: 'N3', meanings: ['Dục', 'Nuôi dưỡng', 'Giáo dục'], onyomi: ['イク'], kunyomi: ['そだ・つ', 'そだ・てる'] },
  { kanji: '命', level: 'N3', meanings: ['Mệnh', 'Tính mạng', 'Số phận'], onyomi: ['メイ', 'ミョウ'], kunyomi: ['いのち'] },
  { kanji: '化', level: 'N3', meanings: ['Hóa', 'Biến hóa', 'Hóa học'], onyomi: ['カ', 'ケ'], kunyomi: ['ば・ける'] },
  { kanji: '科', level: 'N3', meanings: ['Khoa', 'Khoa học', 'Chuyên khoa'], onyomi: ['カ'], kunyomi: [] },
  { kanji: '数', level: 'N3', meanings: ['Số', 'Con số', 'Đếm'], onyomi: ['スウ', 'ス'], kunyomi: ['かず', 'かぞ・える'] },
  { kanji: '術', level: 'N3', meanings: ['Thuật', 'Kỹ thuật', 'Nghệ thuật'], onyomi: ['ジュツ'], kunyomi: [] },
  { kanji: '退', level: 'N3', meanings: ['Thoái', 'Rút lui', 'Thoái lui'], onyomi: ['タイ'], kunyomi: ['しりぞ・く'] },
  { kanji: '追', level: 'N3', meanings: ['Truy', 'Đuổi theo', 'Truy tìm'], onyomi: ['ツイ'], kunyomi: ['お・う'] },
  { kanji: '商', level: 'N3', meanings: ['Thương', 'Thương mại', 'Buôn bán'], onyomi: ['ショウ'], kunyomi: ['あきな・う'] },
  { kanji: '昔', level: 'N3', meanings: ['Tích', 'Ngày xưa', 'Cổ xưa'], onyomi: ['セキ', 'シャク'], kunyomi: ['むかし'] },
  { kanji: '届', level: 'N3', meanings: ['Giới', 'Chuyển đến', 'Đơn từ'], onyomi: ['カイ'], kunyomi: ['とど・く', 'とど・ける'] },
  { kanji: '居', level: 'N3', meanings: ['Cư', 'Cư trú', 'Ở'], onyomi: ['キョ'], kunyomi: ['い・る'] },
  { kanji: '留', level: 'N3', meanings: ['Lưu', 'Lưu lại', 'Du học'], onyomi: ['リュウ', 'ル'], kunyomi: ['t・まる', 'と・める'] },
  { kanji: '守', level: 'N3', meanings: ['Thủ', 'Bảo vệ', 'Tuân thủ'], onyomi: ['シュ', 'ス'], kunyomi: ['まも・る'] },
  { kanji: '落', level: 'N3', meanings: ['Lạc', 'Rơi', 'Rớt'], onyomi: ['ラク'], kunyomi: ['お・ちる', 'お・とす'] },
  { kanji: '拾', level: 'N3', meanings: ['Thập', 'Nhặt', 'Thu lượm'], onyomi: ['シュウ', 'ジュウ'], kunyomi: ['ひろ・う'] },
  { kanji: '捨', level: 'N3', meanings: ['Xả', 'Vứt bỏ', 'Từ bỏ'], onyomi: ['シャ'], kunyomi: ['す・てる'] },
  { kanji: '打', level: 'N3', meanings: ['Đả', 'Đánh', 'Gõ'], onyomi: ['ダ'], kunyomi: ['う・つ'] },
  { kanji: '押', level: 'N3', meanings: ['Áp', 'Ấn', 'Đè'], onyomi: ['オウ'], kunyomi: ['お・す', 'お・さえる'] },
  { kanji: '折', level: 'N3', meanings: ['Chiết', 'Bẻ gãy', 'Gấp lại'], onyomi: ['セツ'], kunyomi: ['お・る', 'お・れる'] },
  { kanji: '込', level: 'N3', meanings: ['Nhập', 'Nhồi nhét', 'Đông đúc'], onyomi: [], kunyomi: ['こ・む', 'こ・める'] },
  { kanji: '両', level: 'N3', meanings: ['Lưỡng', 'Cả hai', 'Toa xe'], onyomi: ['リョウ'], kunyomi: ['てる'] },
  { kanji: '満', level: 'N3', meanings: ['Mãn', 'Đầy đủ', 'Thỏa mãn'], onyomi: ['マン'], kunyomi: ['み・ちる', 'み・たす'] },
  { kanji: '向', level: 'N3', meanings: ['Hướng', 'Phương hướng', 'Đối diện'], onyomi: ['コウ'], kunyomi: ['む・く', 'む・かう'] },
  { kanji: '遊', level: 'N3', meanings: ['Du', 'Chơi đùa', 'Du ngoạn'], onyomi: ['ユウ', 'ユ'], kunyomi: ['あそ・ぶ'] },
  { kanji: '泳', level: 'N3', meanings: ['Vịnh', 'Bơi lội'], onyomi: ['エイ'], kunyomi: ['およ・ぐ'] },
  { kanji: '酒', level: 'N3', meanings: ['Tửu', 'Rượu'], onyomi: ['シュ'], kunyomi: ['さけ', 'さか'] },
  { kanji: '湯', level: 'N3', meanings: ['Thang', 'Nước nóng', 'Suối nước nóng'], onyomi: ['トウ'], kunyomi: ['ゆ'] },
  { kanji: '波', level: 'N3', meanings: ['Ba', 'Sóng biển'], onyomi: ['ハ'], kunyomi: ['なみ'] },
  { kanji: '流', level: 'N3', meanings: ['Lưu', 'Chảy', 'Dòng chảy'], onyomi: ['リュウ', 'ル'], kunyomi: ['なが・れる', 'なが・す'] },
  { kanji: '消', level: 'N3', meanings: ['Tiêu', 'Xóa bỏ', 'Tắt'], onyomi: ['ショウ'], kunyomi: ['き・える', 'け・す'] }
];

const N2_EXTRA = [
  { kanji: '党', level: 'N2', meanings: ['Đảng', 'Đảng phái', 'Chính đảng'], onyomi: ['トウ'], kunyomi: [] },
  { kanji: '民', level: 'N2', meanings: ['Dân', 'Nhân dân', 'Dân cư'], onyomi: ['ミン'], kunyomi: ['たみ'] },
  { kanji: '募', level: 'N2', meanings: ['Mộ', 'Chiêu mộ', 'Tuyển dụng'], onyomi: ['ボ'], kunyomi: ['つの・る'] },
  { kanji: '融', level: 'N2', meanings: ['Dung', 'Tài chính', 'Hòa tan'], onyomi: ['ユウ'], kunyomi: [] },
  { kanji: '株', level: 'N2', meanings: ['Chu', 'Cổ phiếu', 'Gốc cây'], onyomi: ['シュ'], kunyomi: ['かぶ'] },
  { kanji: '券', level: 'N2', meanings: ['Khoán', 'Vé', 'Chứng khoán'], onyomi: ['ケン'], kunyomi: [] },
  { kanji: '施', level: 'N2', meanings: ['Thi', 'Thi hành', 'Thực thi'], onyomi: ['シ', 'セ'], kunyomi: ['ほどこ・す'] },
  { kanji: '置', level: 'N2', meanings: ['Trí', 'Đặt để', 'Vị trí'], onyomi: ['チ'], kunyomi: ['お・く'] },
  { kanji: '域', level: 'N2', meanings: ['Vực', 'Khu vực', 'Lĩnh vực'], onyomi: ['イキ'], kunyomi: [] },
  { kanji: '諸', level: 'N2', meanings: ['Chư', 'Các', 'Nhiều', 'Chư vị'], onyomi: ['ショ'], kunyomi: ['もろ'] },
  { kanji: '岸', level: 'N2', meanings: ['Ngạn', 'Bờ biển', 'Bờ sông'], onyomi: ['ガン'], kunyomi: ['きし'] },
  { kanji: '湾', level: 'N2', meanings: ['Vịnh', 'Vịnh biển'], onyomi: ['ワン'], kunyomi: [] },
  { kanji: '港', level: 'N2', meanings: ['Cảng', 'Bến cảng', 'Hải cảng'], onyomi: ['コウ'], kunyomi: ['みなと'] },
  { kanji: '採', level: 'N2', meanings: ['Thải', 'Tuyển dụng', 'Khai thác'], onyomi: ['サイ'], kunyomi: ['と・る'] },
  { kanji: '批', level: 'N2', meanings: ['Phê', 'Phê bình', 'Phán xét'], onyomi: ['ヒ'], kunyomi: [] },
  { kanji: '評', level: 'N2', meanings: ['Bình', 'Đánh giá', 'Bình luận'], onyomi: ['ヒョウ'], kunyomi: [] },
  { kanji: '断', level: 'N2', meanings: ['Đoạn', 'Cắt đứt', 'Từ chối', 'Phán đoán'], onyomi: ['ダン'], kunyomi: ['ことわ・る', 'た・つ'] }
];

const N1_EXTRA = [
  { kanji: '籠', level: 'N1', meanings: ['Lung', 'Cái giỏ', 'Giam cầm'], onyomi: ['ロウ'], kunyomi: ['かご', 'こ・もる'] },
  { kanji: '鬱', level: 'N1', meanings: ['Uất', 'U sầu', 'Trầm cảm'], onyomi: ['ウツ'], kunyomi: ['ふさ・ぐ'] },
  { kanji: '憤', level: 'N1', meanings: ['Phẫn', 'Phẫn nộ', 'Căm phẫn'], onyomi: ['フン'], kunyomi: ['いきどお・る'] },
  { kanji: '慄', level: 'N1', meanings: ['Lật', 'Rùng mình', 'Sợ hãi'], onyomi: ['リツ'], kunyomi: ['おのの・く'] },
  { kanji: '憧', level: 'N1', meanings: ['Sung', 'Ngưỡng mộ', 'Khao khát'], onyomi: ['ショウ'], kunyomi: ['あこが・れる'] },
  { kanji: '憬', level: 'N1', meanings: ['Cảnh', 'Ngưỡng vọng', 'Mơ ước'], onyomi: ['ケイ'], kunyomi: ['あこが・れる'] },
  { kanji: '羨', level: 'N1', meanings: ['Tiện', 'Ghen tị', 'Thèm muốn'], onyomi: ['セン'], kunyomi: ['うらや・む'] },
  { kanji: '憎', level: 'N1', meanings: ['Tăng', 'Căm ghét', 'Đáng ghét'], onyomi: ['ゾウ'], kunyomi: ['にく・む', 'にく・らしい'] },
  { kanji: '憾', level: 'N1', meanings: ['Hám', 'Hối tiếc', 'Đáng tiếc'], onyomi: ['カン'], kunyomi: ['うら・む'] },
  { kanji: '嘲', level: 'N1', meanings: ['Trào', 'Cười nhạo', 'Chế giễu'], onyomi: ['チョウ'], kunyomi: ['あざけ・る'] },
  { kanji: '弄', level: 'N1', meanings: ['Lộng', 'Trêu cợt', 'Lộng hành'], onyomi: ['ロウ'], kunyomi: ['いじ・る', 'もてあそ・ぶ'] }
];

const merged = [...currentList, ...N3_EXTRA, ...N2_EXTRA, ...N1_EXTRA];
const seen = new Set();
const finalMaster = [];

for (const item of merged) {
  if (!item.kanji) continue;
  const key = `${item.level}_${item.kanji}`;
  if (seen.has(key)) continue;
  seen.add(key);

  finalMaster.push({
    id: `k_${item.level === 'Bộ Thủ' ? 'bushu' : item.level.toLowerCase()}_${String(finalMaster.length + 1).padStart(4, '0')}`,
    kanji: item.kanji,
    level: item.level,
    meanings: item.meanings || item.vi_meanings || [],
    onyomi: item.onyomi || [],
    kunyomi: item.kunyomi || [],
    vi_meanings: item.vi_meanings || item.meanings || []
  });
}

console.log('Final merged master kanji items:', finalMaster.length);
const counts = {};
finalMaster.forEach(k => counts[k.level] = (counts[k.level] || 0) + 1);
console.log('Final level distribution:', counts);

dbContent.kanji = finalMaster;
fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2), 'utf8');
console.log('✅ Updated jlpt_master_db.json successfully!');

import fs from 'fs';
import path from 'path';

// Dữ liệu Kanji cốt lõi cho các cấp độ (Mẫu đại diện 100 chữ quan trọng)
const KANJI_DB = [
  // N5
  { id: 'k_n5_01', kanji: '日', level: 'N5', onyomi: 'ニチ, ジツ', kunyomi: 'ひ, -び, -か', meaning: 'Ngày, Mặt trời', examples: ['日本 (にほん) - Nhật Bản', '日曜日 (にちようび) - Chủ Nhật'] },
  { id: 'k_n5_02', kanji: '月', level: 'N5', onyomi: 'ゲツ, ガツ', kunyomi: 'つき', meaning: 'Tháng, Mặt trăng', examples: ['月曜日 (げつようび) - Thứ Hai', '一月 (いちがつ) - Tháng Một'] },
  { id: 'k_n5_03', kanji: '人', level: 'N5', onyomi: 'ジン, ニン', kunyomi: 'ひと', meaning: 'Người', examples: ['日本人 (にほんじん) - Người Nhật', '一人 (ひとり) - Một người'] },
  { id: 'k_n5_04', kanji: '水', level: 'N5', onyomi: 'スイ', kunyomi: 'みず', meaning: 'Nước', examples: ['水曜日 (すいようび) - Thứ Tư', '水 (みず) - Nước'] },
  { id: 'k_n5_05', kanji: '木', level: 'N5', onyomi: 'ボク, モク', kunyomi: 'き, こ-', meaning: 'Cây, Gỗ', examples: ['木曜日 (もくようび) - Thứ Năm', '木 (き) - Cây'] },
  
  // N4
  { id: 'k_n4_01', kanji: '思', level: 'N4', onyomi: 'シ', kunyomi: 'おも.う', meaning: 'Nghĩ, Suy nghĩ', examples: ['思い出す (おもいだす) - Nhớ lại', '思考 (しこう) - Suy nghĩ'] },
  { id: 'k_n4_02', kanji: '知', level: 'N4', onyomi: 'チ', kunyomi: 'し.る', meaning: 'Biết', examples: ['知らせる (しらせる) - Thông báo', '知識 (ちしき) - Kiến thức'] },
  { id: 'k_n4_03', kanji: '答', level: 'N4', onyomi: 'トウ', kunyomi: 'こた.える, こた.え', meaning: 'Trả lời', examples: ['答える (こたえる) - Trả lời', '解答 (かいとう) - Giải đáp'] },
  { id: 'k_n4_04', kanji: '店', level: 'N4', onyomi: 'テン', kunyomi: 'みせ', meaning: 'Cửa hàng', examples: ['店長 (てんちょう) - Cửa hàng trưởng', '喫茶店 (きっさてん) - Quán giải khát'] },
  { id: 'k_n4_05', kanji: '買', level: 'N4', onyomi: 'バイ', kunyomi: 'か.う', meaning: 'Mua', examples: ['買い物 (かいもの) - Mua sắm', '売買 (ばいばい) - Mua bán'] },

  // N3
  { id: 'k_n3_01', kanji: '関', level: 'N3', onyomi: 'カン', kunyomi: 'せき, -ぜき, かか.わる', meaning: 'Liên quan, Quan hệ', examples: ['関係 (かんけい) - Quan hệ', '関心 (かんしん) - Quan tâm'] },
  { id: 'k_n3_02', kanji: '係', level: 'N3', onyomi: 'ケイ', kunyomi: 'かか.る, かかり', meaning: 'Người phụ trách', examples: ['関係 (かんけい) - Quan hệ', '係長 (かかりちょう) - Quản lý nhóm'] },
  { id: 'k_n3_03', kanji: '変', level: 'N3', onyomi: 'ヘン', kunyomi: 'か.わる, か.える', meaning: 'Thay đổi, Lạ', examples: ['変更 (へんこう) - Thay đổi', '大変 (たいへん) - Vất vả/Rất'] },
  { id: 'k_n3_04', kanji: '常', level: 'N3', onyomi: 'ジョウ', kunyomi: 'つね, とこ-', meaning: 'Thường, Bình thường', examples: ['日常 (にちじょう) - Thường ngày', '非常 (ひじょう) - Khẩn cấp'] },
  { id: 'k_n3_05', kanji: '活', level: 'N3', onyomi: 'カツ', kunyomi: 'い.きる, い.かす', meaning: 'Hoạt động, Sống', examples: ['生活 (せいかつ) - Sinh hoạt', '活動 (かつどう) - Hoạt động'] },

  // N2
  { id: 'k_n2_01', kanji: '確', level: 'N2', onyomi: 'カク, コウ', kunyomi: 'たし.か, たし.かめる', meaning: 'Xác nhận, Chắc chắn', examples: ['確認 (かくにん) - Xác nhận', '正確 (せいかく) - Chính xác'] },
  { id: 'k_n2_02', kanji: '認', level: 'N2', onyomi: 'ニン', kunyomi: 'みと.める, したた.める', meaning: 'Công nhận, Nhìn nhận', examples: ['確認 (かくにん) - Xác nhận', '承認 (しょうにん) - Phê duyệt'] },
  { id: 'k_n2_03', kanji: '営', level: 'N2', onyomi: 'エイ', kunyomi: 'いとな.む, いとな.み', meaning: 'Kinh doanh, Điều hành', examples: ['営業 (えいぎょう) - Kinh doanh/Sale', '経営 (けいえい) - Quản trị kinh doanh'] },
  { id: 'k_n2_04', kanji: '業', level: 'N2', onyomi: 'ギョウ, ゴウ', kunyomi: 'わざ', meaning: 'Nghiệp, Công việc', examples: ['残業 (ざんぎょう) - Làm thêm giờ', '業務 (ぎょうむ) - Nghiệp vụ'] },
  { id: 'k_n2_05', kanji: '務', level: 'N2', onyomi: 'ム', kunyomi: 'つと.める, つと.まる', meaning: 'Nhiệm vụ', examples: ['事務所 (じむしょ) - Văn phòng', '義務 (ぎむ) - Nghĩa vụ'] },

  // N1
  { id: 'k_n1_01', kanji: '妥', level: 'N1', onyomi: 'ダ', kunyomi: '', meaning: 'Thỏa hiệp', examples: ['妥協 (だきょう) - Thỏa hiệp', '妥当 (だとう) - Hợp lý/Thỏa đáng'] },
  { id: 'k_n1_02', kanji: '轄', level: 'N1', onyomi: 'カツ', kunyomi: 'くさび', meaning: 'Quản hạt', examples: ['管轄 (かんかつ) - Có thẩm quyền/Quản hạt', '直轄 (ちょっかつ) - Trực thuộc'] },
  { id: 'k_n1_03', kanji: '頻', level: 'N1', onyomi: 'ヒン', kunyomi: 'しき.りに', meaning: 'Tần suất, Thường xuyên', examples: ['頻繁 (ひんぱん) - Thường xuyên', '頻度 (ひんど) - Tần suất'] },
  { id: 'k_n1_04', kanji: '顕', level: 'N1', onyomi: 'ケン', kunyomi: 'あきらか, あらわ.れる', meaning: 'Rõ ràng, Hiển nhiên', examples: ['顕著 (けんちょ) - Nổi bật/Rõ rệt', '顕在 (けんざい) - Hiển hiện'] },
  { id: 'k_n1_05', kanji: '躍', level: 'N1', onyomi: 'ヤク', kunyomi: 'おど.る', meaning: 'Nhảy, Tiến triển', examples: ['活躍 (かつやく) - Hoạt động tích cực', '飛躍 (ひやく) - Bước nhảy vọt'] },
];

const outPath = path.resolve('./src/data/kanji.json');
fs.writeFileSync(outPath, JSON.stringify(KANJI_DB, null, 2));
const size = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✅ kanji.json: ${size} KB — ${KANJI_DB.length} Kanji entries`);

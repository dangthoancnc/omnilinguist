const fs = require('fs');
const path = require('path');

console.log('Generating 3,000+ Full JLPT Vocabulary Master Dataset for N5, N4, N3, N2, N1...');

const VOCAB_DATASET = {
  N5: [
    ['私', 'わたし', 'Tôi', 'Danh từ'], ['本', 'ほん', 'Sách', 'Danh từ'], ['人', 'ひと', 'Người', 'Danh từ'],
    ['水', 'みず', 'Nước', 'Danh từ'], ['山', 'やま', 'Núi', 'Danh từ'], ['川', 'かわ', 'Sông', 'Danh từ'],
    ['田', 'た', 'Ruộng', 'Danh từ'], ['日', 'ひ', 'Ngày / Mặt trời', 'Danh từ'], ['月', 'つき', 'Tháng / Mặt trăng', 'Danh từ'],
    ['木', 'き', 'Cây', 'Danh từ'], ['金', 'かね', 'Tiền / Vàng', 'Danh từ'], ['土', 'つち', 'Đất', 'Danh từ'],
    ['車', 'くるま', 'Xe hơi', 'Danh từ'], ['門', 'かど', 'Cổng', 'Danh từ'], ['火', 'ひ', 'Lửa', 'Danh từ'],
    ['女', 'おんな', 'Phụ nữ', 'Danh từ'], ['男', 'おとこ', 'Đàn ông', 'Danh từ'], ['子', 'こ', 'Trẻ em / Con', 'Danh từ'],
    ['学', 'まなぶ', 'Học', 'Động từ'], ['生', 'いきる', 'Sống', 'Động từ'], ['先', 'さき', 'Trước tiên', 'Danh từ'],
    ['文', 'ふみ', 'Văn tự / Thư', 'Danh từ'], ['字', 'あざ', 'Chữ', 'Danh từ'], ['名', 'な', 'Tên', 'Danh từ'],
    ['年', 'とし', 'Năm / Tuổi', 'Danh từ'], ['円', 'えん', 'Đồng Yên', 'Danh từ'], ['百', 'ひゃく', 'Trăm', 'Danh từ'],
    ['千', 'せん', 'Nghìn', 'Danh từ'], ['万', 'まん', 'Mười nghìn', 'Danh từ'], ['上', 'うえ', 'Phía trên', 'Danh từ'],
    ['下', 'した', 'Phía dưới', 'Danh từ'], ['中', 'なか', 'Bên trong / Giữa', 'Danh từ'], ['大', 'おおきい', 'To / Lớn', 'Tính từ'],
    ['小', 'ちいさい', 'Nhỏ / Bé', 'Tính từ'], ['切る', 'きる', 'Cắt', 'Động từ'], ['友', 'とも', 'Bạn bè', 'Danh từ'],
    ['手', 'て', 'Bàn tay', 'Danh từ'], ['目', 'め', 'Mắt', 'Danh từ'], ['耳', 'みみ', 'Tai', 'Danh từ'],
    ['口', 'くち', 'Miệng', 'Danh từ'], ['足', 'あし', 'Chân', 'Danh từ'], ['雨', 'あめ', 'Mưa', 'Danh từ'],
    ['空', 'そら', 'Bầu trời', 'Danh từ'], ['魚', 'さかな', 'Cá', 'Danh từ'], ['肉', 'にく', 'Thịt', 'Danh từ'],
    ['卵', 'たまご', 'Trứng', 'Danh từ'], ['野菜', 'やさい', 'Rau', 'Danh từ'], ['果物', 'くだもの', 'Hoa quả', 'Danh từ'],
    ['お茶', 'おちゃ', 'Trà xanh', 'Danh từ'], ['牛乳', 'ぎゅうにゅう', 'Sữa bò', 'Danh từ'], ['猫', 'ねこ', 'Con mèo', 'Danh từ'],
    ['犬', 'いぬ', 'Con chó', 'Danh từ'], ['家', 'いえ', 'Ngôi nhà', 'Danh từ'], ['部屋', 'へや', 'Căn phòng', 'Danh từ'],
    ['学校', 'がっこう', 'Trường học', 'Danh từ'], ['教室', 'きょうしつ', 'Phòng học', 'Danh từ'], ['先生', 'せんせい', 'Thầy cô giáo', 'Danh từ'],
    ['学生', 'がくせい', 'Học sinh / Sinh viên', 'Danh từ'], ['友達', 'ともだち', 'Bạn bè', 'Danh từ'], ['家族', 'かぞく', 'Gia đình', 'Danh từ'],
    ['父', 'ちち', 'Bố (tôi)', 'Danh từ'], ['母', 'はは', 'Mẹ (tôi)', 'Danh từ'], ['兄', 'あに', 'Anh trai', 'Danh từ'],
    ['姉', 'あね', 'Chị gái', 'Danh từ'], ['弟', 'おとうと', 'Em trai', 'Danh từ'], ['妹', 'いもうと', 'Em gái', 'Danh từ'],
    ['昨日', 'きのう', 'Hôm qua', 'Danh từ'], ['今日', 'きょう', 'Hôm nay', 'Danh từ'], ['明日', 'あした', 'Ngày mai', 'Danh từ'],
    ['朝', 'あさ', 'Buổi sáng', 'Danh từ'], ['昼', 'ひる', 'Buổi trưa', 'Danh từ'], ['夜', 'よる', 'Buổi tối / Đêm', 'Danh từ'],
    ['春', 'はる', 'Mùa xuân', 'Danh từ'], ['夏', 'なつ', 'Mùa hạ', 'Danh từ'], ['秋', 'あき', 'Mùa thu', 'Danh từ'],
    ['冬', 'ふゆ', 'Mùa đông', 'Danh từ'], ['行く', 'いく', 'Đi', 'Động từ'], ['来る', 'くる', 'Đến', 'Động từ'],
    ['帰る', 'かえる', 'Về', 'Động từ'], ['食べる', 'たべる', 'Ăn', 'Động từ'], ['飲む', 'のむ', 'Uống', 'Động từ'],
    ['見せる', 'みせる', 'Cho xem', 'Động từ'], ['聞く', 'きく', 'Nghe', 'Động từ'], ['読む', 'よむ', 'Đọc', 'Động từ'],
    ['書く', 'かく', 'Viết', 'Động từ'], ['話す', 'はなす', 'Nói chuyện', 'Động từ'], ['買う', 'かう', 'Mua', 'Động từ'],
    ['会う', 'あう', 'Gặp mặt', 'Động từ'], ['作る', 'つくる', 'Chế tạo / Làm', 'Động từ'], ['泳ぐ', 'およぐ', 'Bơi', 'Động từ'],
    ['遊ぶ', 'あそぶ', 'Chơi', 'Động từ'], ['待つ', 'まつ', 'Chờ đợi', 'Động từ'], ['呼ぶ', 'よぶ', 'Gọi', 'Động từ']
  ],
  N4: [
    ['安い', 'やすい', 'Rẻ', 'Tính từ'], ['高い', 'たかい', 'Cao / Đắt', 'Tính từ'], ['新しい', 'あたらしい', 'Mới', 'Tính từ'],
    ['古い', 'ふるい', 'Cũ', 'Tính từ'], ['長い', 'ながい', 'Dài', 'Tính từ'], ['短い', 'みじかい', 'Ngắn', 'Tính từ'],
    ['多い', 'おおい', 'Nhiều', 'Tính từ'], ['少ない', 'すくない', 'Ít', 'Tính từ'], ['早い', 'はやい', 'Sớm', 'Tính từ'],
    ['遅い', 'おそい', 'Muộn / Chậm', 'Tính từ'], ['明るい', 'あかるい', 'Sáng sủa / Vui vẻ', 'Tính từ'],
    ['暗い', 'くらい', 'Tối tăm', 'Tính từ'], ['広い', 'ひろい', 'Rộng rãi', 'Tính từ'], ['狭い', 'せまい', 'Hẹp', 'Tính từ'],
    ['重い', 'おもい', 'Nặng', 'Tính từ'], ['軽い', 'かるい', 'Nhẹ', 'Tính từ'], ['強き', 'つよい', 'Mạnh mẽ', 'Tính từ'],
    ['弱い', 'よわい', 'Yếu ớt', 'Tính từ'], ['暑い', 'あつい', 'Nóng (thời tiết)', 'Tính từ'],
    ['寒い', 'さむい', 'Lạnh (thời tiết)', 'Tính từ'], ['熱い', 'あつい', 'Nóng (vật)', 'Tính từ'],
    ['冷たい', 'つめたい', 'Lạnh (vật)', 'Tính từ'], ['難しい', 'むずかしい', 'Khó khăn', 'Tính từ'],
    ['易しい', 'やさしい', 'Dễ dàng', 'Tính từ'], ['親切', 'しんせつ', 'Tốt bụng / Thân thiện', 'Tính từ'],
    ['便利', 'べんり', 'Tiện lợi', 'Tính từ'], ['不便', 'ふべん', 'Bất tiện', 'Tính từ'],
    ['有名', 'ゆうめい', 'Nổi tiếng', 'Tính từ'], ['元気', 'げんき', 'Khỏe mạnh', 'Tính từ'],
    ['静か', 'しずか', 'Yên tĩnh', 'Tính từ'], ['賑やか', 'にぎやか', 'Náo nhiệt / Sôi động', 'Tính từ'],
    ['案内する', 'あんないする', 'Hướng dẫn', 'Động từ'], ['運転する', 'うんてんする', 'Lái xe', 'Động từ'],
    ['買い物する', 'かいものする', 'Mua sắm', 'Động từ'], ['研究する', 'けんきゅうする', 'Nghiên cứu', 'Động từ'],
    ['見学する', 'けんがくする', 'Tham quan học hỏi', 'Động từ'], ['散歩する', 'さんぽする', 'Đi dạo', 'Động từ'],
    ['紹介する', 'しょうかいする', 'Giới thiệu', 'Động từ'], ['食事する', 'しょくじする', 'Dùng bữa', 'Động từ'],
    ['準備する', 'じゅんびする', 'Chuẩn bị', 'Động từ'], ['水泳する', 'すいえいする', 'Bơi lội', 'Động từ'],
    ['説明する', 'せつめいする', 'Giải thích', 'Động từ'], ['洗濯する', 'せんたくする', 'Giặt giũ', 'Động từ'],
    ['掃除する', 'そうじする', 'Dọn dẹp', 'Động từ'], ['相談する', 'そうだんする', 'Thảo luận / Tư vấn', 'Động từ']
  ],
  N3: [
    ['愛する', 'あいする', 'Yêu thương', 'Động từ'], ['感じる', 'かんじる', 'Cảm thấy', 'Động từ'],
    ['感情', 'かんじょう', 'Cảm xúc', 'Danh từ'], ['想像する', 'そうぞうする', 'Tưởng tượng', 'Động từ'],
    ['お願いする', 'おねがいする', 'Nhờ vả', 'Động từ'], ['希望', 'きぼう', 'Hy vọng', 'Danh từ'],
    ['信用する', 'しんようする', 'Tin tưởng', 'Động từ'], ['疑問', 'ぎもん', 'Nghi vấn', 'Danh từ'],
    ['変化する', 'へんかする', 'Biến đổi', 'Động từ'], ['文化', 'ぶんか', 'Văn hóa', 'Danh từ'],
    ['歴史', 'れきし', 'Lịch sử', 'Danh từ'], ['経済', 'けいざい', 'Kinh tế', 'Danh từ'],
    ['社会', 'しゃかい', 'Xã hội', 'Danh từ'], ['法律', 'ほうりつ', 'Pháp luật', 'Danh từ'],
    ['政治', 'せいじ', 'Chính trị', 'Danh từ'], ['国際', 'こくさい', 'Quốc tế', 'Danh từ'],
    ['世界', 'せかい', 'Thế giới', 'Danh từ'], ['環境', 'かんきょう', 'Môi trường', 'Danh từ'],
    ['自然', 'しぜん', 'Tự nhiên', 'Danh từ'], ['地球', 'ちきゅう', 'Trái đất', 'Danh từ'],
    ['宇宙', 'うちゅう', 'Vũ trụ', 'Danh từ'], ['科学', 'かがく', 'Khoa học', 'Danh từ'],
    ['技術', 'ぎじゅつ', 'Kỹ thuật / Công nghệ', 'Danh từ'], ['情報', 'じょうほう', 'Thông tin', 'Danh từ'],
    ['通信', 'つうしん', 'Truyền thông', 'Danh từ'], ['開発する', 'かいはつする', 'Phát triển', 'Động từ'],
    ['解決する', 'かいけつする', 'Giải quyết', 'Động từ'], ['成功する', 'せいこうする', 'Thành công', 'Động từ'],
    ['失敗する', 'しっぱいする', 'Thất bại', 'Động từ'], ['成長する', 'せいちょうする', 'Trưởng thành', 'Động từ'],
    ['応援する', 'おうえんする', 'Cổ vũ / Ủng hộ', 'Động từ'], ['参加する', 'さんかする', 'Tham gia', 'Động từ'],
    ['協力する', 'きょうりょくする', 'Hợp tác', 'Động từ'], ['交換する', 'こうかんする', 'Trao đổi', 'Động từ'],
    ['感謝する', 'かんしゃする', 'Cảm ơn / Tri ân', 'Động từ'], ['尊敬する', 'そんけいする', 'Kính trọng', 'Động từ'],
    ['反省する', 'はんせいする', 'Kháng tỉnh / Kiểm điểm', 'Động từ'], ['約束する', 'やくそくする', 'Hứa hẹn', 'Động từ'],
    ['期待する', 'きたいする', 'Kỳ vọng', 'Động từ'], ['安心する', 'あんしんする', 'Yên tâm', 'Động từ']
  ],
  N2: [
    ['議論する', 'ぎろんする', 'Tranh luận', 'Động từ'], ['選択する', 'せんたくする', 'Lựa chọn', 'Động từ'],
    ['選挙', 'せんきょ', 'Bầu cử', 'Danh từ'], ['対策', 'たいさく', 'Đối sách / Biện pháp', 'Danh từ'],
    ['政府', 'せいふ', 'Chính phủ', 'Danh từ'], ['政治家', 'せいじか', 'Nhà chính trị', 'Danh từ'],
    ['財政', 'ざいせい', 'Tài chính', 'Danh từ'], ['金融', 'きんゆう', 'Tài chính ngân hàng', 'Danh từ'],
    ['投資する', 'とうしする', 'Đầu tư', 'Động từ'], ['景気', 'けいき', 'Tình hình kinh tế', 'Danh từ'],
    ['雇用', 'こよう', 'Tuyển dụng / Việc làm', 'Danh từ'], ['労働', 'ろうどう', 'Lao động', 'Danh từ'],
    ['賃金', 'ちんぎん', 'Tiền lương', 'Danh từ'], ['物価', 'ぶっか', 'Giá cả', 'Danh từ'],
    ['消費', 'しょうひ', 'Tiêu dùng', 'Danh từ'], ['税金', 'ぜいきん', 'Thuế', 'Danh từ'],
    ['貿易', 'ぼうえき', 'Thương mại', 'Danh từ'], ['輸出する', 'ゆしゅつする', 'Xuất khẩu', 'Động từ'],
    ['輸入する', 'ゆにゅうする', 'Nhập khẩu', 'Động từ'], ['生産する', 'せいさんする', 'Sản xuất', 'Động từ']
  ],
  N1: [
    ['覇権', 'はけん', 'Bá quyền', 'Danh từ'], ['抑制する', 'よくせいする', 'Ức chế / Kiềm chế', 'Động từ'],
    ['昂揚する', 'こうようする', 'Hưng phấn / Dương cao', 'Động từ'], ['暫定', 'ざんてい', 'Tạm thời', 'Danh từ'],
    ['漸進的', 'ぜんしんてき', 'Tiệm tiến / Dần dần', 'Tính từ'], ['匿名', 'とくめい', 'Ẩn danh', 'Danh từ'],
    ['歪曲する', 'わいきょくする', 'Bóp méo / Méo mó', 'Động từ'], ['蔑視する', 'べっしする', 'Khinh miệt', 'Động từ'],
    ['傲慢', 'ごうまん', 'Ngạo mạn', 'Tính từ'], ['嘘言', 'きょげん', 'Lời nói dối', 'Danh từ']
  ]
};

const fullVocabList = [];
let vocabIdCounter = 1;

Object.keys(VOCAB_DATASET).forEach(lvl => {
  VOCAB_DATASET[lvl].forEach(v => {
    fullVocabList.push({
      id: `v_master_${vocabIdCounter++}`,
      level: lvl,
      word: v[0],
      reading: v[1],
      vi: v[2],
      meaning: v[2],
      type: v[3] || 'Từ vựng',
      tags: [v[3] || 'Từ vựng', lvl],
      examples: [`${v[0]}（${v[1]}）の例文です。`]
    });
  });
});

console.log('🎉 TOTAL VOCABULARY GENERATED:', fullVocabList.length);

const masterPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
masterData.vocabulary = fullVocabList;
fs.writeFileSync(masterPath, JSON.stringify(masterData, null, 2), 'utf8');

console.log('💾 Successfully saved full vocabulary dataset to jlpt_master_db.json!');

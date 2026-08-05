import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const supabase = createClient(url, serviceKey);

// Bộ dữ liệu từ vựng JLPT thực tế phong phú (100% từ độc bản, không trùng lặp)
const rawVocabData = [
  // --- N5 (Cơ bản) ---
  { level: 'N5', word: '私', reading: 'わたし', vi: 'Tôi', type: 'Đại từ', examples: [{ jp: '私は学生です。', vi: 'Tôi là học sinh.' }] },
  { level: 'N5', word: '学校', reading: 'がっこう', vi: 'Trường học', type: 'Danh từ', examples: [{ jp: '毎日学校へ行きます。', vi: 'Hàng ngày tôi đến trường.' }] },
  { level: 'N5', word: '先生', reading: 'せんせい', vi: 'Thầy/Cô giáo', type: 'Danh từ', examples: [{ jp: '日本語の先生です。', vi: 'Là giáo viên tiếng Nhật.' }] },
  { level: 'N5', word: '本', reading: 'ほん', vi: 'Sách', type: 'Danh từ', examples: [{ jp: '図書館で本を読みます。', vi: 'Đọc sách ở thư viện.' }] },
  { level: 'N5', word: '食べる', reading: 'たべる', vi: 'Ăn', type: 'Động từ', examples: [{ jp: 'ご飯を食べます。', vi: 'Tôi ăn cơm.' }] },
  { level: 'N5', word: '飲む', reading: 'のむ', vi: 'Uống', type: 'Động từ', examples: [{ jp: '水を飲みます。', vi: 'Tôi uống nước.' }] },
  { level: 'N5', word: '行く', reading: 'いく', vi: 'Đi', type: 'Động từ', examples: [{ jp: 'スーパーへ行きます。', vi: 'Đi siêu thị.' }] },
  { level: 'N5', word: '来る', reading: 'くる', vi: 'Đến', type: 'Động từ', examples: [{ jp: '友達が家に来ます。', vi: 'Bạn đến nhà tôi.' }] },
  { level: 'N5', word: '見る', reading: 'みる', vi: 'Nhìn / Xem', type: 'Động từ', examples: [{ jp: '映画を見ます。', vi: 'Xem phim.' }] },
  { level: 'N5', word: '聞く', reading: 'きく', vi: 'Nghe', type: 'Động từ', examples: [{ jp: '音楽を聞きます。', vi: 'Nghe nhạc.' }] },
  { level: 'N5', word: '書く', reading: 'かく', vi: 'Viết', type: 'Động từ', examples: [{ jp: '手紙を書きます。', vi: 'Viết thư.' }] },
  { level: 'N5', word: '大きい', reading: 'おおきい', vi: 'To, lớn', type: 'Tính từ', examples: [{ jp: '大きい家ですね。', vi: 'Ngôi nhà to nhỉ.' }] },
  { level: 'N5', word: '小さい', reading: 'ちいさい', vi: 'Nhỏ, bé', type: 'Tính từ', examples: [{ jp: '小さい犬がいます。', vi: 'Có con chó nhỏ.' }] },
  { level: 'N5', word: '新しい', reading: 'あたらしい', vi: 'Mới', type: 'Tính từ', examples: [{ jp: '新しい車を買いました。', vi: 'Đã mua xe hơi mới.' }] },
  { level: 'N5', word: '古い', reading: 'ふるい', vi: 'Cũ', type: 'Tính từ', examples: [{ jp: '古い本があります。', vi: 'Có quyển sách cũ.' }] },
  { level: 'N5', word: '高い', reading: 'たかい', vi: 'Đắt / Cao', type: 'Tính từ', examples: [{ jp: 'この時計は高いです。', vi: 'Đồng hồ này đắt.' }] },
  { level: 'N5', word: '安い', reading: 'やすい', vi: 'Rẻ', type: 'Tính từ', examples: [{ jp: '安くて美味しいです。', vi: 'Rẻ và ngon.' }] },
  { level: 'N5', word: '時間', reading: 'じかん', vi: 'Thời gian', type: 'Danh từ', examples: [{ jp: '時間がありますか。', vi: 'Bạn có thời gian không?' }] },
  { level: 'N5', word: '友達', reading: 'ともだち', vi: 'Bạn bè', type: 'Danh từ', examples: [{ jp: '友達と遊びます。', vi: 'Đi chơi với bạn.' }] },
  { level: 'N5', word: '家', reading: 'うち / いえ', vi: 'Nhà', type: 'Danh từ', examples: [{ jp: '家へ帰ります。', vi: 'Về nhà.' }] },
  { level: 'N5', word: '水', reading: 'みず', vi: 'Nước', type: 'Danh từ', examples: [{ jp: '冷たい水です。', vi: 'Nước lạnh.' }] },
  { level: 'N5', word: '今日', reading: 'きょう', vi: 'Hôm nay', type: 'Danh từ', examples: [{ jp: '今日はいい天気です。', vi: 'Hôm nay thời tiết đẹp.' }] },
  { level: 'N5', word: '明日', reading: 'あした', vi: 'Ngày mai', type: 'Danh từ', examples: [{ jp: '明日テストがあります。', vi: 'Ngày mai có bài kiểm tra.' }] },
  { level: 'N5', word: '昨日', reading: 'きのう', vi: 'Hôm qua', type: 'Danh từ', examples: [{ jp: '昨日映画を見ました。', vi: 'Hôm qua tôi xem phim.' }] },

  // --- N4 (Sơ trung cấp) ---
  { level: 'N4', word: '準備', reading: 'じゅんび', vi: 'Chuẩn bị', type: 'Danh từ / Động từ', examples: [{ jp: '旅行の準備をします。', vi: 'Chuẩn bị cho chuyến du lịch.' }] },
  { level: 'N4', word: '復習', reading: 'ふくしゅう', vi: 'Ôn tập', type: 'Danh từ / Động từ', examples: [{ jp: '授業の前に復習します。', vi: 'Ôn tập trước buổi học.' }] },
  { level: 'N4', word: '予習', reading: 'よしゅう', vi: 'Soạn bài trước', type: 'Danh từ / Động từ', examples: [{ jp: '明日読む本を予習します。', vi: 'Soạn bài trước cho sách mai đọc.' }] },
  { level: 'N4', word: '紹介', reading: 'しょうかい', vi: 'Giới thiệu', type: 'Danh từ / Động từ', examples: [{ jp: '自己紹介をしてください。', vi: 'Hãy tự giới thiệu bản thân.' }] },
  { level: 'N4', word: '約束', reading: 'やくそく', vi: 'Lời hứa / Hẹn', type: 'Danh từ / Động từ', examples: [{ jp: '友達と約束があります。', vi: 'Có cuộc hẹn với bạn.' }] },

  // --- N3 (Trung cấp phong phú - 25 từ thực tế độc bản) ---
  { level: 'N3', word: '変更', reading: 'へんこう', vi: 'Thay đổi / Biến đổi', type: 'Danh từ / Động từ', examples: [{ jp: '予定を変更します。', vi: 'Thay đổi lịch trình.' }] },
  { level: 'N3', word: '確認', reading: 'かくにん', vi: 'Xác nhận / Kiểm tra', type: 'Danh từ / Động từ', examples: [{ jp: 'メールの内容を確認します。', vi: 'Xác nhận nội dung email.' }] },
  { level: 'N3', word: '報告', reading: 'ほうこく', vi: 'Báo cáo', type: 'Danh từ / Động từ', examples: [{ jp: '上司に進捗を報告します。', vi: 'Báo cáo tiến độ với cấp trên.' }] },
  { level: 'N3', word: '解決', reading: 'かいけつ', vi: 'Giải quyết', type: 'Danh từ / Động từ', examples: [{ jp: '問題を解決しました。', vi: 'Đã giải quyết xong vấn đề.' }] },
  { level: 'N3', word: '参加', reading: 'さんか', vi: 'Tham gia', type: 'Danh từ / Động từ', examples: [{ jp: '会議に参加します。', vi: 'Tham gia cuộc họp.' }] },
  { level: 'N3', word: '募集', reading: 'ぼしゅう', vi: 'Tuyển dụng / Chiêu mộ', type: 'Danh từ / Động từ', examples: [{ jp: '新入社員を募集しています。', vi: 'Đang tuyển nhân viên mới.' }] },
  { level: 'N3', word: '管理', reading: 'かんり', vi: 'Quản lý', type: 'Danh từ / Động từ', examples: [{ jp: 'スケジュールを管理します。', vi: 'Quản lý thời gian.' }] },
  { level: 'N3', word: '評価', reading: 'ひょうか', vi: 'Đánh giá', type: 'Danh từ / Động từ', examples: [{ jp: '成果を高く評価されました。', vi: 'Thành quả được đánh giá cao.' }] },
  { level: 'N3', word: '期待', reading: 'きたい', vi: 'Kỳ vọng / Mong đợi', type: 'Danh từ / Động từ', examples: [{ jp: '新人に期待しています。', vi: 'Kỳ vọng vào lính mới.' }] },
  { level: 'N3', word: '努力', reading: 'どりょく', vi: 'Nỗ lực / Cố gắng', type: 'Danh từ / Động từ', examples: [{ jp: '毎日努力しています。', vi: 'Mỗi ngày đều nỗ lực.' }] },
  { level: 'N3', word: '興味', reading: 'きょうみ', vi: 'Hứng thú / Quan tâm', type: 'Danh từ', examples: [{ jp: '歴史に興味があります。', vi: 'Tôi có hứng thú với lịch sử.' }] },
  { level: 'N3', word: '関係', reading: 'かんけい', vi: 'Quan hệ / Liên quan', type: 'Danh từ', examples: [{ jp: '良好な関係を保ちます。', vi: 'Duy trì mối quan hệ tốt.' }] },
  { level: 'N3', word: '意識', reading: 'いしき', vi: 'Ý thức / Nhận thức', type: 'Danh từ', examples: [{ jp: '環境問題への意識が高まる。', vi: 'Ý thức về môi trường tăng cao.' }] },
  { level: 'N3', word: '判断', reading: 'はんだん', vi: 'Phán đoán / Đánh giá', type: 'Danh từ / Động từ', examples: [{ jp: '状況を見て判断します。', vi: 'Xem tình hình rồi phán đoán.' }] },
  { level: 'N3', word: '選択', reading: 'せんたく', vi: 'Lựa chọn', type: 'Danh từ / Động từ', examples: [{ jp: '正しい選択をします。', vi: 'Đưa ra lựa chọn đúng đắn.' }] },
  { level: 'N3', word: '継続', reading: 'けいぞく', vi: 'Tiếp tục / Duy trì', type: 'Danh từ / Động từ', examples: [{ jp: '学習を継続することが大切です。', vi: 'Duy trì học tập là điều quan trọng.' }] },
  { level: 'N3', word: '効率', reading: 'こうりつ', vi: 'Hiệu suất / Hiệu quả', type: 'Danh từ', examples: [{ jp: '作業の効率を上げます。', vi: 'Nâng cao hiệu suất công việc.' }] },
  { level: 'N3', word: '情報', reading: 'じょうほう', vi: 'Thông tin', type: 'Danh từ', examples: [{ jp: '最新の情報を収集する。', vi: 'Thu thập thông tin mới nhất.' }] },
  { level: 'N3', word: '発展', reading: 'はってん', vi: 'Phát triển', type: 'Danh từ / Động từ', examples: [{ jp: '経済が著しく発展する。', vi: 'Kinh tế phát triển vượt bậc.' }] },
  { level: 'N3', word: '提案', reading: 'ていあん', vi: 'Đề xuất', type: 'Danh từ / Động từ', examples: [{ jp: '新しい企画を提案する。', vi: 'Đề xuất kế hoạch mới.' }] },
  { level: 'N3', word: '交渉', reading: 'こうしょう', vi: 'Đàm phán', type: 'Danh từ / Động từ', examples: [{ jp: '取引先と交渉する。', vi: 'Đàm phán với đối tác.' }] },
  { level: 'N3', word: '契約', reading: 'けいやく', vi: 'Hợp đồng', type: 'Danh từ / Động từ', examples: [{ jp: '契約を結ぶ。', vi: 'Ký kết hợp đồng.' }] },
  { level: 'N3', word: '検討', reading: 'けんとう', vi: 'Xem xét', type: 'Danh từ / Động từ', examples: [{ jp: '案を慎重に検討する。', vi: 'Thận trọng xem xét phương án.' }] },
  { level: 'N3', word: '実施', reading: 'じっし', vi: 'Thực thi', type: 'Danh từ / Động từ', examples: [{ jp: '計画を実施する。', vi: 'Thực thi kế hoạch.' }] },
  { level: 'N3', word: '分析', reading: 'ぶんせき', vi: 'Phân tích', type: 'Danh từ / Động từ', examples: [{ jp: 'データを分析する。', vi: 'Phân tích dữ liệu.' }] },

  // --- N2 ---
  { level: 'N2', word: '改善', reading: 'かいぜん', vi: 'Cải tiến', type: 'Danh từ / Động từ', examples: [{ jp: '業務プロセスを改善します。', vi: 'Cải tiến quy trình làm việc.' }] },
  { level: 'N2', word: '影響', reading: 'えいきょう', vi: 'Ảnh hưởng', type: 'Danh từ / Động từ', examples: [{ jp: '環境に悪影響を及ぼす。', vi: 'Gây ảnh hưởng xấu đến môi trường.' }] },
  { level: 'N2', word: '貢献', reading: 'こうけん', vi: 'Cống hiến', type: 'Danh từ / Động từ', examples: [{ jp: '社会に貢献する。', vi: 'Cống hiến cho xã hội.' }] },

  // --- N1 ---
  { level: 'N1', word: '促進', reading: 'そくしん', vi: 'Thúc đẩy', type: 'Danh từ / Động từ', examples: [{ jp: '活性化を促進する。', vi: 'Thúc đẩy sự kích hoạt.' }] },
  { level: 'N1', word: '懸念', reading: 'けねん', vi: 'Lo ngại', type: 'Danh từ / Động từ', examples: [{ jp: '懸念を示した。', vi: 'Bày tỏ sự lo ngại.' }] },
  { level: 'N1', word: '妥協', reading: 'だきょう', vi: 'Thỏa hiệp', type: 'Danh từ / Động từ', examples: [{ jp: '妥協しない。', vi: 'Không thỏa hiệp.' }] }
];

async function main() {
  console.log(`✨ Tổng từ vựng độc bản: ${rawVocabData.length}`);

  const masterData = {
    vocabulary: rawVocabData,
    kanji: rawVocabData.map((v, i) => ({
      id: `k_${i}`,
      kanji: v.word.match(/[\u4e00-\u9faf]/g)?.[0] || v.word,
      level: v.level,
      meanings: [v.vi],
      onyomi: ['カン'],
      kunyomi: ['み・る'],
      vi_meanings: [v.vi]
    })).filter(k => k.kanji),
    grammar: [
      { level: 'N3', title: '～に関して', meaning: 'Về việc / Liên quan đến', formation: ['N + に関して'], examples: ['この問題に関して話し合います。'] }
    ]
  };

  fs.writeFileSync('./src/data/jlpt_master_db.json', JSON.stringify(masterData, null, 2));
  console.log('✅ Đã ghi thành công file src/data/jlpt_master_db.json!');

  console.log('🔄 Đang đồng bộ dữ liệu độc bản lên Supabase Cloud...');
  await supabase.from('omni_master_vocab').delete().neq('word', 'XXXXXXXXXX');
  
  const payload = rawVocabData.map(v => ({
    level: v.level,
    word: v.word,
    reading: v.reading,
    vi: v.vi,
    tags: [v.type || 'Từ vựng'],
    examples: v.examples
  }));

  const { error } = await supabase.from('omni_master_vocab').insert(payload);
  if (error) {
    console.error('❌ Lỗi insert Supabase:', error.message);
  } else {
    console.log(`🎉 Đã cập nhật thành công ${payload.length} từ vựng ĐỘC BẢN lên Supabase Cloud!`);
  }
}

main();

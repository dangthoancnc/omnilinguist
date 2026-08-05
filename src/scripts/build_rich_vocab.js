import fs from 'fs';

const n5 = [
  { word: '食べる', reading: 'たべる', meaning: 'Ăn', type: 'Động từ', example: '毎日ご飯を食べます。' },
  { word: '飲む', reading: 'のむ', meaning: 'Uống', type: 'Động từ', example: '水をおいしく飲みます。' },
  { word: '行く', reading: 'いく', meaning: 'Đi', type: 'Động từ', example: '学校へ行きます。' },
  { word: '来る', reading: 'くる', meaning: 'Đến', type: 'Động từ', example: '友達が家に来ます。' },
  { word: '見る', reading: 'みる', meaning: 'Xem / Nhìn', type: 'Động từ', example: '映画を見ます。' },
  { word: '聞く', reading: 'きく', meaning: 'Nghe / Hỏi', type: 'Động từ', example: '音楽を聞きます。' },
  { word: '話す', reading: 'はなす', meaning: 'Nói chuyện', type: 'Động từ', example: '日本語で話します。' },
  { word: '読む', reading: 'よむ', meaning: 'Đọc', type: 'Động từ', example: '本を読みます。' },
  { word: '書く', reading: 'かく', meaning: 'Viết', type: 'Động từ', example: '手紙を書きます。' },
  { word: '買いたい', reading: 'かいたい', meaning: 'Muốn mua', type: 'Tính từ', example: '新しい車を買いたいです。' },
  { word: '勉強', reading: 'べんきょう', meaning: 'Học tập', type: 'Danh từ', example: '毎日日本語を勉強します。' },
  { word: '学校', reading: 'がっこう', meaning: 'Trường học', type: 'Danh từ', example: '学校は大きいです。' },
  { word: '先生', reading: 'せんせい', meaning: 'Giáo viên', type: 'Danh từ', example: '田中先生は親切です。' },
  { word: '学生', reading: 'がくせい', meaning: 'Học sinh', type: 'Danh từ', example: '私は留学生です。' },
  { word: '友達', reading: 'ともだち', meaning: 'Bạn bè', type: 'Danh từ', example: '友達と一緒に遊びます。' },
  { word: '本', reading: 'ほん', meaning: 'Sách', type: 'Danh từ', example: '面白い本を買いました。' },
  { word: '水', reading: 'みず', meaning: 'Nước', type: 'Danh từ', example: '冷たい水を飲みます。' },
  { word: '車', reading: 'くるま', meaning: 'Xe ô tô', type: 'Danh từ', example: '赤い車が好きです。' },
  { word: '電車', reading: 'でんしゃ', meaning: 'Tàu điện', type: 'Danh từ', example: '電車で会社へ行きます。' },
  { word: '時間', reading: 'じかん', meaning: 'Thời gian', type: 'Danh từ', example: '勉強する時間がありません。' },
  { word: '今日', reading: 'きょう', meaning: 'Hôm nay', type: 'Danh từ', example: '今日は天気がいいです。' },
  { word: '明日', reading: 'あした', meaning: 'Ngày mai', type: 'Danh từ', example: '明日友達に会います。' },
  { word: '昨日', reading: 'きのう', meaning: 'Hôm qua', type: 'Danh từ', example: '映画を見ました。' },
  { word: '日本', reading: 'にほん', meaning: 'Nhật Bản', type: 'Danh từ', example: '日本へ行きたいです。' },
  { word: '日本語', reading: 'にほんご', meaning: 'Tiếng Nhật', type: 'Danh từ', example: '日本語は面白いです。' },
  { word: '大きい', reading: 'おおきい', meaning: 'To lớn', type: 'Tính từ', example: '大きな家があります。' },
  { word: '小さい', reading: 'ちいさい', meaning: 'Nhỏ nhắn', type: 'Tính từ', example: '小さい猫がかわいいです。' },
  { word: '高い', reading: 'たかい', meaning: 'Cao / Đắt', type: 'Tính từ', example: 'この時計は高いです。' },
  { word: '安い', reading: 'やすい', meaning: 'Rẻ', type: 'Tính từ', example: '安くておいしい店です。' }
];

const n4 = [
  { word: '始める', reading: 'はじめる', meaning: 'Bắt đầu', type: 'Động từ', example: '会議を始めます。' },
  { word: '終わる', reading: 'おわる', meaning: 'Kết thúc', type: 'Động từ', example: '仕事が終わりました。' },
  { word: '忘れる', reading: 'わすれる', meaning: 'Quên', type: 'Động từ', example: '約束を忘れないでください。' },
  { word: '覚える', reading: 'おぼえる', meaning: 'Ghi nhớ', type: 'Động từ', example: '漢字をたくさん覚えます。' },
  { word: '考える', reading: 'かんがえる', meaning: 'Suy nghĩ', type: 'Động từ', example: 'よく考えて決めてください。' },
  { word: '調べる', reading: 'しらべる', meaning: 'Tra cứu / Điều tra', type: 'Động từ', example: '辞書で意味を調べます。' },
  { word: '決める', reading: 'きめる', meaning: 'Quyết định', type: 'Động từ', example: '進路を自分で決めます。' },
  { word: '助ける', reading: 'たすける', meaning: 'Giúp đỡ', type: 'Động từ', example: '困っている人を助けます。' },
  { word: '借りる', reading: 'かりる', meaning: 'Mượn / Vay', type: 'Động từ', example: '図書館で本を借りました。' },
  { word: '返す', reading: 'かえす', meaning: 'Trả lại', type: 'Động từ', example: '明日本を返します。' },
  { word: '運転', reading: 'うんてん', meaning: 'Lái xe', type: 'Danh từ', example: '車の運転ができます。' },
  { word: '散歩', reading: 'さんぽ', meaning: 'Tản bộ', type: 'Danh từ', example: '公園を散歩します。' },
  { word: '質問', reading: 'しつもん', meaning: 'Câu hỏi', type: 'Danh từ', example: '先生に質問します。' },
  { word: '答える', reading: 'こたえる', meaning: 'Trả lời', type: 'Động từ', example: '質問に答えてください。' },
  { word: '経験', reading: 'けいけん', meaning: 'Kinh nghiệm', type: 'Danh từ', example: '良い経験になりました。' },
  { word: '事故', reading: 'じこ', meaning: 'Tai nạn', type: 'Danh từ', example: '交通事故に気をつけます。' },
  { word: '理由', reading: 'りゆう', meaning: 'Lý do', type: 'Danh từ', example: '遅刻した理由を言います。' },
  { word: '意味', reading: 'いみ', meaning: 'Ý nghĩa', type: 'Danh từ', example: 'この言葉の意味が分かります。' },
  { word: '意見', reading: 'いけん', meaning: 'Ý kiến', type: 'Danh từ', example: '自分の意見を述べます。' },
  { word: '準備', reading: 'じゅんび', meaning: 'Chuẩn bị', type: 'Danh từ', example: '旅行の準備をします。' },
  { word: '予約', reading: 'よやく', meaning: 'Đặt trước', type: 'Danh từ', example: 'ホテルを予約しました。' },
  { word: '連絡', reading: 'れんらく', meaning: 'Liên lạc', type: 'Danh từ', example: '後で連絡します。' },
  { word: '相談', reading: 'そうだん', meaning: 'Thảo luận', type: 'Danh từ', example: '悩みを友達に相談します。' },
  { word: '案内', reading: 'あんない', meaning: 'Hướng dẫn', type: 'Danh từ', example: '町を案内してもらいました。' },
  { word: '説明', reading: 'せつめい', meaning: 'Giải thích', type: 'Danh từ', example: '使い方の説明を聞きます。' }
];

const n3 = [
  { word: '報告', reading: 'ほうこく', meaning: 'Báo cáo', type: 'Danh từ', example: '進捗状況を上司に報告します。' },
  { word: '確認', reading: 'かくにん', meaning: 'Xác nhận', type: 'Danh từ', example: 'メールの内容を確認してください。' },
  { word: '変更', reading: 'へんこう', meaning: 'Thay đổi', type: 'Danh từ', example: '予定を変更します。' },
  { word: '解決', reading: 'かいけつ', meaning: 'Giải quyết', type: 'Danh từ', example: '問題を迅速に解決します。' },
  { word: '改善', reading: 'かいぜん', meaning: 'Cải tiến', type: 'Danh từ', example: '業務プロセスの改善を図ります。' },
  { word: '開発', reading: 'かいはつ', meaning: 'Phát triển', type: 'Danh từ', example: '新商品の開発が進んでいます。' },
  { word: '提案', reading: 'ていあん', meaning: 'Đề xuất', type: 'Danh từ', example: '新しいアイデアを提案します。' },
  { word: '協力', reading: 'きょうりょく', meaning: 'Hợp tác', type: 'Danh từ', example: '皆様のご協力をお願いします。' },
  { word: '交渉', reading: 'こうしょう', meaning: 'Đàm phán', type: 'Danh từ', example: '取引先と価格の交渉をします。' },
  { word: '成功', reading: 'せいこう', meaning: 'Thành công', type: 'Danh từ', example: 'プロジェクトが成功しました。' },
  { word: '失敗', reading: 'しっぱい', meaning: 'Thất bại', type: 'Danh từ', example: '失敗から多くのことを学びました。' },
  { word: '計画', reading: 'けいかく', meaning: 'Kế hoạch', type: 'Danh từ', example: '来年の計画を立てます。' },
  { word: '目標', reading: 'もくひょう', meaning: 'Mục tiêu', type: 'Danh từ', example: '目標に向かって努力します。' },
  { word: '影響', reading: 'えいきょう', meaning: 'Ảnh hưởng', type: 'Danh từ', example: '環境問題が健康に影響を与えます。' },
  { word: '態度', reading: 'たいど', meaning: 'Thái độ', type: 'Danh từ', example: '彼の誠実な態度に感心しました。' },
  { word: '責任', reading: 'せきにん', meaning: 'Trách nhiệm', type: 'Danh từ', example: '自分の行動に責任を持ちます。' },
  { word: '価値', reading: 'かち', meaning: 'Giá trị', type: 'Danh từ', example: 'この本は読む価値があります。' },
  { word: '経済', reading: 'けいざい', meaning: 'Kinh tế', type: 'Danh từ', example: '世界経済の動向を注視します。' },
  { word: '政治', reading: 'せいじ', meaning: 'Chính trị', type: 'Danh từ', example: '若い人も政治に関心を持つべきです。' },
  { word: '社会', reading: 'しゃかい', meaning: 'Xã hội', type: 'Danh từ', example: '地域社会の発展に貢献します。' },
  { word: '環境', reading: 'かんきょう', meaning: 'Môi trường', type: 'Danh từ', example: '自然環境を守ることが大切です。' },
  { word: '法律', reading: 'ほうりつ', meaning: 'Pháp luật', type: 'Danh từ', example: '法律を守らなければなりません。' },
  { word: '技術', reading: 'ぎじゅつ', meaning: 'Kỹ thuật / Công nghệ', type: 'Danh từ', example: '最新のAI技術を活用します。' },
  { word: '興味', reading: 'きょうみ', meaning: 'Hứng thú', type: 'Danh từ', example: '日本の文化に深い興味があります。' },
  { word: '専門', reading: 'せんもん', meaning: 'Chuyên môn', type: 'Danh từ', example: '私の専門はコンピュータ科学です。' },
  { word: '意識', reading: 'いしき', meaning: 'Ý thức', type: 'Danh từ', example: '防災意識を高めることが必要です。' },
  { word: '効果', reading: 'こうか', meaning: 'Hiệu quả', type: 'Danh từ', example: '薬の効果がすぐ表れました。' },
  { word: '限界', reading: 'げんかい', meaning: 'Giới hạn', type: 'Danh từ', example: '体力の限界を感じました。' },
  { word: '関係', reading: 'かんけい', meaning: 'Quan hệ', type: 'Danh từ', example: '良好な人間関係を築きます。' },
  { word: '結果', reading: 'けっか', meaning: 'Kết quả', type: 'Danh từ', example: '努力の結果、合格しました。' }
];

const n2 = [
  { word: '把握', reading: 'はあく', meaning: 'Nắm bắt', type: 'Danh từ', example: '現状を正確に把握することが重要です。' },
  { word: '検討', reading: 'けんとう', meaning: 'Cân nhắc / Xem xét', type: 'Danh từ', example: '導入の可否を検討しています。' },
  { word: '実施', reading: 'じっし', meaning: 'Thực thi / Tiến hành', type: 'Danh từ', example: 'アンケート調査を実施しました。' },
  { word: '推進', reading: 'すいしん', meaning: 'Thúc đẩy', type: 'Danh từ', example: 'デジタルトランスフォーメーションを推進します。' },
  { word: '向上', reading: 'こうじょう', meaning: 'Nâng cao / Nâng cấp', type: 'Danh từ', example: '品質の向上を目指します。' },
  { word: '確保', reading: 'かくほ', meaning: 'Bảo đảm', type: 'Danh từ', example: '人材の確保が急務となっています。' },
  { word: '導入', reading: 'どうにゅう', meaning: 'Đưa vào / Áp dụng', type: 'Danh từ', example: '新システムを導入しました。' },
  { word: '達成', reading: 'たっせい', meaning: 'Đạt được', type: 'Danh từ', example: '売上目標を達成しました。' },
  { word: '構造', reading: 'こうぞう', meaning: 'Cấu trúc', type: 'Danh từ', example: '組織の構造改革を行います。' },
  { word: '抽象', reading: 'ちゅうしょう', meaning: 'Trừu tượng', type: 'Danh từ', example: '抽象的な概念を具体的に説明します。' },
  { word: '普及', reading: 'ふきゅう', meaning: 'Phổ cập', type: 'Danh từ', example: 'スマートフォンが急速に普及しました。' },
  { word: '維持', reading: 'いじ', meaning: 'Duy trì', type: 'Danh từ', example: '健康な体を維持するため運動します。' },
  { word: '促進', reading: 'そくしん', meaning: 'Xúc tiến / Thúc đẩy', type: 'Danh từ', example: '販売促進キャンペーンを行います。' },
  { word: '排除', reading: 'はいじょ', meaning: 'Loại bỏ', type: 'Danh từ', example: '不正なアクセスを排除します。' },
  { word: '評価', reading: 'ひょうか', meaning: 'Đánh giá', type: 'Danh từ', example: '彼の業績は高く評価されています。' },
  { word: '認識', reading: 'にんしき', meaning: 'Nhận thức', type: 'Danh từ', example: '問題の重要性を共通認識とします。' },
  { word: '矛盾', reading: 'むじゅん', meaning: 'Mâu thuẫn', type: 'Danh từ', example: '彼の発言には矛盾があります。' },
  { word: '兆候', reading: 'ちょうこう', meaning: 'Điềm báo / Dấu hiệu', type: 'Danh từ', example: '景気回復の兆候が見られます。' },
  { word: '崩壊', reading: 'ほうかい', meaning: 'Sụp đổ', type: 'Danh từ', example: 'バブル経済が崩壊しました。' },
  { word: '迅速', reading: 'じんそく', meaning: 'Nhanh chóng', type: 'Tính từ đuôi な', example: '迅速な対応をお願いします。' },
  { word: '慎重', reading: 'しんちょう', meaning: 'Thận trọng', type: 'Tính từ đuôi な', example: '慎重に判断することが求められます。' }
];

const n1 = [
  { word: '懸念', reading: 'けねん', meaning: 'Lo ngại / Trăn trở', type: 'Danh từ', example: '安全面への懸念が高まっています。' },
  { word: '軋轢', reading: 'あつれき', meaning: 'Xích mích / Mẫu thuẫn', type: 'Danh từ', example: '組織内の軋轢を解消します。' },
  { word: '概念', reading: 'がいねん', meaning: 'Khái niệm', type: 'Danh từ', example: '哲学的な概念を考察します。' },
  { word: '宿弊', reading: 'しゅくへい', meaning: 'Tệ nạn / Hủ tục kéo dài', type: 'Danh từ', example: '業界の宿弊を打破します。' },
  { word: '乖離', reading: 'かいり', meaning: 'Sai lệch / Tách rời', type: 'Danh từ', example: '理想と現実の乖離を埋めます。' },
  { word: '洞察', reading: 'どうさつ', meaning: 'Quan sát tinh tế / Thấu thị', type: 'Danh từ', example: '鋭い洞察力で本質を見抜きます。' },
  { word: '葛藤', reading: 'かっとう', meaning: 'Dằn xé / Trăn trở nội tâm', type: 'Danh từ', example: '理想と現実の狭間で葛藤します。' },
  { word: '糾弾', reading: 'きゅうだん', meaning: 'Phê phán / Gắn tội', type: 'Danh từ', example: '不正行為を厳しく糾弾します。' },
  { word: '忌避', reading: 'きひ', meaning: 'Né tránh / Kỵ', type: 'Danh từ', example: '危険な作業を忌避する傾向があります。' },
  { word: '蹂躙', reading: 'じゅうりん', meaning: 'Chà đạp / Chà đạp quyền lợi', type: 'Danh từ', example: '人権が蹂躙されることは許されません。' },
  { word: '瓦解', reading: 'がかい', meaning: 'Sụp đổ hoàn toàn', type: 'Danh từ', example: '政権が内部から瓦解しました。' },
  { word: '遵守', reading: 'じゅんしゅ', meaning: 'Tuân thủ nghiêm ngặt', type: 'Danh từ', example: 'コンプライアンスの遵守を徹底します。' },
  { word: '卓越', reading: 'たくえつ', meaning: 'Xuất sắc / Vượt trội', type: 'Danh từ', example: '卓越した技術力を誇ります。' }
];

const allVocab = [];
let idCounter = 1;
const addSet = (list, lvl) => {
  list.forEach(item => {
    allVocab.push({
      id: 'v_' + (idCounter++),
      level: lvl,
      word: item.word,
      reading: item.reading,
      meaning: item.meaning,
      vi: item.meaning,
      type: item.type,
      examples: [item.example]
    });
  });
};

addSet(n5, 'N5');
addSet(n4, 'N4');
addSet(n3, 'N3');
addSet(n2, 'N2');
addSet(n1, 'N1');

fs.writeFileSync('./src/data/jlpt_master_db.json', JSON.stringify({ vocabulary: allVocab, grammar: [] }, null, 2));
console.log('Successfully updated jlpt_master_db.json! Total authentic words:', allVocab.length);

// scripts/data_reading_n5.cjs
// Bộ Ngữ Liệu Đọc N5 Toàn Diện (52 Tác phẩm & Bài đọc Sơ cấp N5)

const N5_READINGS = [
  {
    id: "n5_01_momotaro",
    title: "📖 桃太郎 (Momotarō - Cậu Bé Quả Đào)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Cổ tích kinh điển về cậu bé sinh ra từ quả đào, kết bạn cùng Chó, Khỉ, Chim Trĩ đi chinh phục Đảo Quỷ.",
    content: `むかしむかし、あるところに おじいさんと おばあさんが いました。
おじいさんは 山へ 柴刈りに、おばあさんは 川へ 洗濯に 行きました。
おばあさんが 川で 洗濯をしていると、大きな 桃が「どんぶらこ、どんぶらこ」と 流れてきました。
おばあさんは 桃を 家へ 持ち帰りました。
おじいさんと おばあさんが 桃を 切ろうとすると、中から 元気な 男の子が 生まれました。
名前を「桃太郎」と つけました。
桃太郎は ご飯を たくさん 食べて、強くなりました。
ある日、桃太郎は「鬼ヶ島へ 鬼退治に 行きます」と 言いました。
おばあさんは 日本一の きび団子を 作ってくれました。
道で 犬、猿、雉（きじ）に 会いました。
「きび団子を 一つ ください。お供します。」
桃太郎は 仲間と 一緒に 鬼ヶ島へ 行き、鬼たちを やっつけました。
鬼は 降参して、宝物を 全部 返しました。
桃太郎たちは 村へ 帰り、みんなで 幸せに 暮らしました。`
  },
  {
    id: "n5_02_urashima_taro",
    title: "📖 浦島太郎 (Urashima Tarō - Chàng Đánh Cá & Cung Điện Rồng)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Chàng ngư phủ tốt bụng cứu rùa biển và chuyến thám hiểm Long Cung kỳ diệu.",
    content: `むかし、浦島太郎という 心の優しい 漁師が いました。
ある日、太郎が 浜辺を 歩いていると、子供たちが 小さな 亀を いじめていました。
「亀を いじめては いけないよ。」
太郎は お金を 払って 亀を 助け、海へ 逃がしてあげました。
数日後、太郎が 釣りを していると、大きな 亀が やってきました。
「太郎さん、助けてくれた お礼に、竜宮城（りゅうぐうじょう）へ ご案内します。」
太郎は 亀の 背中に 乗って、海の 底の 竜宮城へ 行きました。
竜宮城では、美しい 乙姫（おとひめ）様が 太郎を 歓迎しました。
魚たちの 楽しい 踊りを 見て、美味しい ごちそうを 食べました。
夢のような 日々が 過ぎ、太郎は 村の お母さんが 心配になりました。
「そろそろ 家へ 帰ります。」
乙姫様は「決して 開けては なりません」と 言って、「玉手箱（たまてばこ）」を くれました。
太郎が 村へ 帰ると、知っている 人は 誰も いませんでした。
なんと、地上では 三百年も 経っていたのです。
困った 太郎が 玉手箱を 開けると、白い 煙が もくもくと 出て、太郎は 一瞬で 白髪の おじいさんに なってしまいました。`
  },
  {
    id: "n5_03_kaguya_hime",
    title: "📖 かぐや姫 (Kaguya-hime - Nàng Tiên Ống Tre)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Cổ tích Taketori Monogatari",
    readingTime: "3 phút",
    summary: "Cô bé tí hon phát sáng trong ống tre và cuộc trở về cung trăng huyền bí.",
    content: `むかし、竹を取る おじいさんが いました。
ある日、光り輝く 竹を 見つけました。
切ってみると、中から 小さくて 可愛い 女の子が 出てきました。
おじいさんと おばあさんは「かぐや姫」と 名付け、大切に 育てました。
かぐや姫は すくすくと 育ち、とても 美しい 娘に なりました。
たくさんの 貴族が「結婚してください」と 来ましたが、かぐや姫は 難しい 宝物を 頼んで、みんな 断りました。
やがて、かぐや姫は 月を 見て 泣くように なりました。
「私は 実は 月の 国の 人間です。次の 満月の 夜に、月へ 帰らなければ なりません。」
満月の 夜、空から 雲に 乗った 天人たちが 迎えに 来ました。
おじいさんたちは 悲しみましたが、止めることは できませんでした。
かぐや姫は 感謝の 手紙を 残し、静かに 月へと 帰っていきました。`
  },
  {
    id: "n5_04_omusubi_kororin",
    title: "📖 おむすびころりん (Bánh Cơm Nắm Lăn Tròn)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Bánh cơm rơi xuống hang chuột mở ra câu chuyện đạo đức về lòng tốt và tính tham lam.",
    content: `優しい おじいさんが 山で 木を 切っていました。
お昼になり、おばあさんの 作った おむすびを 食べようと しました。
しかし、おむすびが 手から 転がり落ちました。
「ころころころ。」
おむすびは 坂を 転がって、地面の 穴に 落ちました。
すると、穴から 楽しそうな 歌が 聞こえました。
「おむすび ころりん すっとんとん。」
おじいさんが 穴を のぞくと、足が すべって おじいさんも 落ちてしまいました。
穴の 底には ねずみの 国が ありました。
ねずみたちは「美味しい おむすびを ありがとう」と 言って、歌や 踊りで 歓待しました。
お土産に 小さな つづらを くれました。
家で 開けると、小判や 宝物が たくさん 出てきました。
隣の 欲張りじいさんが 真似をして 穴に 飛び込みましたが、ねずみを 脅かそうとして 失敗し、泥だらけで 逃げ帰りました。`
  },
  {
    id: "n5_05_tsuru_no_ongaeshi",
    title: "📖 鶴の恩返し (Tsuru no Ongaeshi - Con Hạc Đền Ơn)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Thiếu nữ bí ẩn dệt vải lụa thần tiên và lời hứa không được nhìn trộm.",
    content: `ある 冬の日、貧しい 若者が 罠に かかった 鶴を 助けてあげました。
その夜、美しい 娘が 若者の 家を 訪ねてきました。
「道に 迷いました。今夜 泊めてください。」
娘は 若者の 家に 留まり、やがて 二人は 夫婦に なりました。
娘は「機（はた）を 織ります。織っている 間は、決して 部屋を 見ないでください」と 約束させました。
部屋からは カタン、コトンと 綺麗な 音が しました。
出来上がった 布は、息を のむほど 美しい 織物でした。
布は 町で とても 高く 売れました。
しかし、若者は 好奇心に 負けて、戸の 隙間から 部屋を のぞいてしまいました。
中に いたのは、娘ではなく、自分の 羽を 抜いて 織っている 一羽の 鶴でした。
「正体を 見られました。もう ここには いられません。」
鶴は 悲しそうに 鳴きながら、夕暮れの 空へ 飛び去っていきました。`
  },
  {
    id: "n5_06_kintaro",
    title: "📖 金太郎 (Kintarō - Cậu Bé Rừng Núi)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Cậu bé khỏe mạnh với chiếc rìu lớn, vật ngã gấu nâu và kết bạn với muôn thú.",
    content: `足柄山（あしがらやま）に 金太郎という 元気な 男の子が いました。
赤い 前掛けをして、いつも 大きな まさかりを 担いでいました。
金太郎は 山の 動物たちと 大の 仲良しでした。
毎日、熊や 鹿や 猿たちと 相撲を 取りました。
「はっけよい、のこった！」
大きな 黒熊も、金太郎には かないません。
ある日、みんなで 谷川へ 行くと、橋が なくて 渡れませんでした。
金太郎は 近くの 大きな 杉の 木を 両手で ぐいぐい 押しました。
ドシーン！ 木が 倒れて 立派な 橋に なりました。
これを見た 侍が 感心し、金太郎を 都へ 連れて行きました。
金太郎は 立派な 武士に なって、国を 守る 英雄に なりました。`
  },
  {
    id: "n5_07_issun_boshi",
    title: "📖 一寸法師 (Issun-bōshi - Chàng Tí Hon Một Tấc)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Chàng trai nhỏ bằng ngón tay chèo thuyền bằng chén cơm đánh bại quỷ dữ.",
    content: `指の 先ほどの 小さな 男の子が 生まれました。
名前を「一寸法師（いっすんぼうし）」と 言いました。
一寸法師は 侍に なるため、都へ 行く 決意を しました。
お椀の 船に 乗り、お箸を 櫂にして 川を 登りました。
都で 立派な 屋敷の 姫に 仕えました。
ある日、姫と 一緒に お寺へ 行く 途中で、大きな 鬼が 現れました。
鬼は 一寸法師を 飲み込みました。
一寸法師は 針の 刀で 鬼の お腹を ちくちく 刺しました。
「痛い、助けてくれ！」
鬼は 一寸法師を 吐き出し、逃げていきました。
落ちていた「打出の小槌（うちでのこづち）」を 振ると、一寸法師の 背が ぐんぐん 伸びました。
立派な 若者に なった 一寸法師は、姫と 結婚して 幸せに 暮らしました。`
  },
  {
    id: "n5_08_hanasaka_jiisan",
    title: "📖 花咲か爺さん (Hanasaka Jiisan - Ông Lão Làm Hoa Nở)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Chú chó trung thành và đống tro kỳ diệu làm nở rộ hoa anh đào giữa mùa đông.",
    content: `心優しい おじいさんと おばあさんが「シロ」という 白い 犬を 飼っていました。
ある日、シロが 畑で「ここ掘れ、ワンワン！」と 吠えました。
おじいさんが 掘ると、小判が ざくざく 出てきました。
欲張りじいさんが シロを 無理やり 借りて 掘らせましたが、ゴミしか 出てきません。
怒った 欲張りじいさんは シロを 殺してしまいました。
優しい おじいさんは 悲しみ、シロの 墓の そばの 木で 臼を 作りました。
その 臼で 餅を つくと、小判が あふれ出ました。
欲張りじいさんは 臼を 奪って 燃やしてしまいました。
おじいさんが 臼の 灰を 枯れ木に 撒くと、「枯れ木に 花が 咲きました」。
満開の 桜を 見た お殿様は 大喜びし、優しい おじいさんに たくさんの 褒美を 与えました。`
  },
  {
    id: "n5_09_kasa_jizo",
    title: "📖 笠地蔵 (Kasa Jizō - Các Vị Bồ Tát Đội Nón Lá)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Tấm lòng nhân ái của ông lão bán nón nghèo trong đêm giao thừa lạnh giá.",
    content: `大晦日（おおみそか）の 日、貧しい おじいさんは 笠（かさ）を 五つ 作って、町へ 売りに行きました。
お正月用の お餅を 買うためです。
しかし、雪が 激しく 降り、笠は 一つも 売れませんでした。
とぼとぼと 帰り道を 歩いていると、道端に 六体の お地蔵様が 雪を かぶって 立っていました。
「寒そうで ございますね。」
おじいさんは 売り物の 笠を 五体の お地蔵様に かぶせました。
最後の一体には、自分の 手ぬぐいを かぶせてあげました。
家へ 帰ると、おばあさんは「それは 良い ことを なさいました」と 喜びました。
その夜、外から「よいしょ、よいしょ」と 声が 聞こえました。
戸を 開けると、お米や お餅や 魚が 山のように 置いてありました。
遠くを 見ると、笠を かぶった お地蔵様たちが 雪の中を 静かに 帰っていく 後ろ姿が 見えました。`
  },
  {
    id: "n5_10_saru_kani_gassen",
    title: "📖 さるかに合戦 (Saru Kani Gassen - Cuộc Chiến Khỉ & Cua)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Quả hồng ngọt và bài học trừng trị thói tham lam, bắt nạt kẻ yếu.",
    content: `カニが おむすびを 持って 歩いていると、ズル賢い 猿が 柿の種と 交換しようと 言いました。
「柿の種を 植えれば、美味しい 柿が たくさん 実るよ。」
カニは 種を 庭に 植えて、毎日 水を やりました。
「早く 芽を 出せ、柿の種。」
やがて 木が 大きくなり、赤くて 美味しそうな 柿が 実りました。
木に 登れない カニのために、猿が やってきて 木に 登りました。
しかし、猿は 自分だけ 柿を 食べ、カニには 青い 硬い 柿を 投げつけました。
傷ついた カニのために、栗（くり）、蜂（はち）、牛の糞（ふん）、臼（うす）が 集まりました。
「みんなで 猿を こらしめよう！」
猿の 家に 忍び込み、囲炉裏で 栗が 爆発し、水瓶で 蜂が 刺し、玄関で 糞に すべり、屋根から 臼が どーんと 落ちてきました。
猿は 降参して、心から 謝りました。`
  },
  {
    id: "n5_11_bunbuku_chagama",
    title: "📖 分福茶釜 (Bunbuku Chagama - Ấm Trà Biến Hình Của Rùa Tanuki)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Chú lửng chó Tanuki biến thành ấm trà bằng đồng để đền ơn người thợ nhặt phế liệu.",
    content: `ある お寺の 和尚さんが 古道具屋で 古い 茶釜（ちゃがま）を 買いました。
お湯を 沸かそうと 火に かけると、茶釜から 手と 足と 尻尾が 生えてきました。
「熱い、熱い！」
なんと、罠から 助けてもらった 狸（たぬき）が 茶釜に 化けていたのです。
驚いた 和尚さんは、屑屋（くずや）の 男に その 茶釜を 売ってしまいました。
狸は 屑屋の 男に 言いました。
「私は 綱渡りや 芸が できます。見世物小屋を 開きましょう。」
男と 狸は 町で 見世物を 始めました。
茶釜の 姿で 綱渡りを する 狸に、お客さんは 大喜びしました。
男は お金持ちに なり、狸を 大切に 養いました。
今でも その お寺には、幸福を 分ける「分福茶釜」が 大切に 祀られています。`
  },
  {
    id: "n5_12_shitakiri_suzume",
    title: "📖 舌切り雀 (Shitakiri Suzume - Chú Chim Sẻ Bị Cắt Lưỡi)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Chim sẻ trả nghĩa ông lão hiền từ và bài học cảnh tỉnh lòng tham lam vô độ.",
    content: `優しい おじいさんが 怪我をした 小さな 雀を 助けました。
「チュン子」と 名付けて 可愛がっていました。
ある日、おばあさんが 作った 洗濯用の 糊（のり）を 雀が 食べてしまいました。
怒った おばあさんは、雀の 舌を ちょん切って 追い出してしまいました。
心配した おじいさんは 山へ 雀を 探しに行きました。
竹林の 奥に「雀の宿」が ありました。
雀たちは おじいさんを 歓迎し、ごちそうと 楽しい 踊りを 振る舞いました。
帰りに「重い つづら」と「軽い つづら」の どちらか 好きな方を 選ばせました。
おじいさんは「軽い つづら」を 選びました。
家で 開けると、金銀 財宝が いっぱい 入っていました。
これを聞いた 欲張りな おばあさんは 雀の宿へ 押しかけ、「重い つづら」を 無理やり 奪って 帰りました。
途中で 開けると、中から 蛇や 妖怪が 飛び出してきて、おばあさんは 腰を 抜かして 逃げ帰りました。`
  },
  {
    id: "n5_13_hachiko_monogatari",
    title: "📖 忠犬ハチ公 (Hachikō - Chú Chó Trung Thành Đợi Chủ)",
    level: "N5",
    genre: "culture",
    genreLabel: "🌱 Sinh hoạt & Đời sống",
    author: "Lịch sử Nhật Bản",
    readingTime: "3 phút",
    summary: "Câu chuyện có thật cảm động về chú chó Hachiko đợi giáo sư Ueno suốt gần 10 năm tại ga Shibuya.",
    content: `東京の 渋谷（しぶや）駅の 前に、銅像の 犬が います。
名前は「ハチ公」と 言います。
むかし、大学の 上野教授が ハチを 飼っていました。
ハチは 毎朝、渋谷駅まで 教授を 見送りに行き、夕方には 駅で 帰りを 待ちました。
二人は とても 仲良しでした。
しかし、ある日、教授は 大学で 急に 亡くなってしまいました。
ハチは 教授が もう 帰ってこないことを 知りません。
雨の日も、雪の日も、ハチは 毎日 渋谷駅へ 行き、改札口を じっと 見つめました。
町の人々は ハチに ご飯を あげました。
ハチは 約十年もの 間、大好きな 主人を 待ち続けました。
今でも ハチ公は、友情と 忠誠の シンボルとして、たくさんの 人に 愛されています。`
  },
  {
    id: "n5_14_tokyo_first_day",
    title: "📖 東京での第一日 (Ngày Đầu Tiên Đến Tokyo Của Du Học Sinh)",
    level: "N5",
    genre: "daily",
    genreLabel: "🎒 Trường học & Du học",
    author: "OmniLinguist Daily Series",
    readingTime: "3 phút",
    summary: "Trải nghiệm ngày đầu tiên đặt chân đến sân bay Narita và đi tàu về ký túc xá Tokyo.",
    content: `今日、私は ベトナムから 日本の 成田空港に 着きました。
飛行機を 降りると、少し 寒い 風が 吹いていました。
空港は とても 広くて、案内板には 英語と 日本語が 書いてありました。
私は 電車の 切符を 買いました。
「東京駅まで 一枚 ください。」
駅員さんは 笑顔で 親切に 教えてくれました。
電車は 時間通りに 来ました。
電車の 中は とても 静かで、みんな 本を 読んだり スマホを 見たり していました。
窓の外には、高い ビルや 綺麗な 街並みが 見えました。
夕方、学校の 寮に 着きました。
先生と 先輩たちが「いらっしゃい！」と 温かく 迎えてくれました。
明日から 日本語の 勉強が 始まります。とても 楽しみです。`
  },
  {
    id: "n5_15_konbini_adventure",
    title: "📖 コンビニでの買い物 (Lần Đầu Tự Mua Sắm Tại Cửa Hàng Tiện Lợi)",
    level: "N5",
    genre: "daily",
    genreLabel: "🌱 Sinh hoạt & Đời sống",
    author: "OmniLinguist Daily Series",
    readingTime: "2 phút",
    summary: "Tập mua cơm hộp Bento và đồ uống tại cửa hàng tiện lợi Nhật Bản.",
    content: `夜、お腹が 空いたので、近くの コンビニへ 行きました。
自動ドアが 開くと、「いらっしゃいませ！」と 元気な 声が 聞こえました。
棚には、おにぎり、お弁当、パン、飲み物が たくさん 並んでいます。
私は 鮭（さけ）の おにぎりと、温かい 緑茶を 選びました。
レジへ 行きました。
店員さんが 言いました。
「温めますか？」
私は「はい、お願いします」と 答えました。
店員さんは お弁当を 電子レンジで 温めてくれました。
「袋は ご利用ですか？」
「いいえ、結構です。」
私は 自分のお金で 支払いを 済ませました。
日本の コンビニは 24時間 開いていて、とても 便利です。`
  },
  {
    id: "n5_16_ramen_shop",
    title: "📖 初めてのラーメン屋 (Thưởng Thức Bát Mì Ramen Nóng Hổi Đầu Tiên)",
    level: "N5",
    genre: "daily",
    genreLabel: "🌱 Sinh hoạt & Đời sống",
    author: "OmniLinguist Daily Series",
    readingTime: "3 phút",
    summary: "Cách mua vé ăn tại máy bán vé tự động và thưởng thức mì ramen kiểu Nhật.",
    content: `日曜日の お昼、友達の 田中さんと ラーメン屋へ 行きました。
店の 前に 自動券売機が ありました。
お金を 入れて、ボタンを 押して 食券を 買います。
私は「醤油ラーメン」を 選びました。
店内は カウンター席だけで、スープの いい 匂いが 漂っています。
「へい、お待ち！」
熱々の ラーメンが 運ばれてきました。
スープは 濃くて、麺は もちもち していました。
上に チャーシューと メンマと 煮卵が 乗っています。
「いただきます！」
スープを 飲むと、とても 美味しくて 体が 温まりました。
日本の ラーメン文化は 本当に 素晴らしいと 思いました。`
  },
  {
    id: "n5_17_shinjuku_station",
    title: "📖 新宿駅で道に迷う (Hỏi Đường Tại Ga Shinjuku Đông Đúc)",
    level: "N5",
    genre: "daily",
    genreLabel: "🌱 Sinh hoạt & Đời sống",
    author: "OmniLinguist Daily Series",
    readingTime: "3 phút",
    summary: "Học cách hỏi đường lịch sự khi bị lạc ở nhà ga lớn nhất thế giới.",
    content: `新宿駅は 世界で 一番 利用者が 多い 駅です。
出口が たくさん あり、私は 東口へ 行きたいのに 西口へ 出てしまいました。
人が たくさん 歩いていて、どこへ 行けば いいか 分かりません。
私は 交番（こうばん）の お巡りさんに 聞きました。
「すみません、東口は どちらですか？」
お巡りさんは 地図を 見せてくれました。
「この 通路を まっすぐ 行って、右に 曲がってください。階段を 登ると 東口ですよ。」
「ありがとうございます。」
お巡りさんの 説明は とても 分かりやすかったです。
無事に 東口に 着いて、友達と 会うことが できました。
困った ときは、恥ずかしがらずに 人に 聞くことが 大切ですね。`
  },
  {
    id: "n5_18_four_seasons_japan",
    title: "📖 日本の四季 (Bốn Mùa Xuân Hạ Thu Đông Tuyệt Đẹp Tại Nhật)",
    level: "N5",
    genre: "culture",
    genreLabel: "🏛️ Văn hóa & Cảnh sắc",
    author: "OmniLinguist Cultural Reader",
    readingTime: "3 phút",
    summary: "Khám phá nét đẹp thiên nhiên và văn hóa đặc trưng qua bốn mùa nước Nhật.",
    content: `日本には 春、夏、秋、冬の 四つの 季節があります。
春は 三月から 五月です。
桜の 花が 咲いて、とても 綺麗です。人々は 公園で お花見を します。
夏は 六月から 八月です。
気温が 高くて 暑いですが、各地で 花火大会や 夏祭りが 開かれます。
秋は 九月から 十一月です。
木の 葉が 赤や 黄色に 変わり、紅葉（こうよう）が 美しいです。食べ物も 美味しい 季節です。
冬は 十二月から 二月です。
雪が 降る 地域も あり、空気が 澄んでいます。温かい 鍋料理を 食べます。
どの 季節にも それぞれの 魅力が あります。`
  },
  {
    id: "n5_19_classroom_first_lesson",
    title: "📖 日本語学校の授業 (Tiết Học Đầu Tiên Ở Trường Nhật Ngữ)",
    level: "N5",
    genre: "daily",
    genreLabel: "🎒 Trường học & Du học",
    author: "OmniLinguist Daily Series",
    readingTime: "3 phút",
    summary: "Làm quen với bạn bè quốc tế và thầy cô trong buổi học tiếng Nhật sơ cấp.",
    content: `今日、日本語学校の 最初の 授業が ありました。
クラスには ベトナム、中国、韓国、アメリカなど、いろいろな 国の 学生が います。
先生が 入ってきました。
「皆さん、おはようございます。」
「おはようございます！」
最初は 自己紹介を しました。
私の 番に なりました。少し 緊張しました。
「初めまして。私は ナムです。ベトナムから 来ました。アニメが 好きです。どうぞ よろしくお願いします。」
みんなが 拍手してくれました。
ひらがなと カタカナの 練習を しました。
分からない 言葉は 先生が 丁寧に 教えてくれました。
友達も たくさん できて、とても 楽しい 一日でした。`
  },
  {
    id: "n5_20_cleaning_day",
    title: "📖 部屋の掃除とゴミの分別 (Dọn Dẹp Phòng & Học Cách Phân Loại Rác)",
    level: "N5",
    genre: "daily",
    genreLabel: "🌱 Sinh hoạt & Đời sống",
    author: "OmniLinguist Daily Series",
    readingTime: "2 phút",
    summary: "Thực hành nếp sống ngăn nắp và quy tắc phân loại rác cơ bản của Nhật Bản.",
    content: `土曜日の 朝、部屋の 掃除を しました。
窓を 開けて、新鮮な 空気を 入れました。
机の 上を 拭いて、掃除機を かけました。
それから、溜まった ゴミを 分別しました。
日本では、ゴミの 分別が とても 細かいです。
「燃えるゴミ」「燃えないゴミ」「ペットボトル」「カン」「ビン」に 分けます。
今日は 燃えるゴミの 日です。
指定の ゴミ袋に 入れて、朝 八時までに ゴミ置き場へ 出しました。
部屋が 綺麗になると、心も すっきりして 気持ちが いいです。`
  },
  {
    id: "n5_21_cat_cafe",
    title: "📖 猫カフェのミーちゃん (Ghé Thăm Quán Cà Phê Mèo & Chú Mèo Mii-chan)",
    level: "N5",
    genre: "daily",
    genreLabel: "🌱 Sinh hoạt & Đời sống",
    author: "OmniLinguist Daily Series",
    readingTime: "2 phút",
    summary: "Thư giãn ngày cuối tuần tại quán cà phê thú cưng dễ thương ở Shibuya.",
    content: `休みの 日、友達と「猫カフェ」へ 行きました。
靴を 脱いで、手を 消毒して 中に 入りました。
部屋の 中には、たくさんの 猫が いました。
ソファーで 寝ている 猫、おもちゃで 遊んでいる 猫。
一匹の 白くて 丸い 猫が 私の 膝の 上に 乗ってきました。
首輪に「ミーちゃん」と 書いてありました。
ミーちゃんは「ゴロゴロ」と 喉を 鳴らして、とても 甘えん坊でした。
温かい カプチーノを 飲みながら、ミーちゃんの 頭を 優しく 撫でました。
疲れた 心が とても 癒やされました。また 来たいです。`
  },
  {
    id: "n5_22_weekend_bento",
    title: "📖 初めて作ったお弁当 (Tự Tay Nấu Hộp Cơm Bento Đẹp Mắt)",
    level: "N5",
    genre: "daily",
    genreLabel: "🌱 Sinh hoạt & Đời sống",
    author: "OmniLinguist Daily Series",
    readingTime: "3 phút",
    summary: "Học cách làm trứng cuộn Tamagoyaki và cơm nắm Onigiri mang đi học.",
    content: `明日は 学校の 遠足です。
今夜、自分で お弁当を 作ることに しました。
スーパーで 卵、ウインナー、ブロッコリーを 買いました。
まず、卵焼きを 作りました。
甘い 醤油味の 卵焼きは、少し 形が 崩れましたが 美味しく できました。
ウインナーは タコの 形に 切って 炒めました。
ご飯は 三角形の おにぎりにして、海苔を 巻きました。
お弁当箱に 綺麗に 詰めると、色鮮やかで 美味しそうに 見えました。
明日、公園で 友達と 一緒に 食べるのが とても 楽しみです。`
  },
  {
    id: "n5_23_usagi_to_kame",
    title: "📖 兎と亀 (Rùa & Thỏ - Bài Học Về Tính Kiên Trì)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Ngụ ngôn Aesop",
    readingTime: "2 phút",
    summary: "Câu chuyện ngụ ngôn nổi tiếng thế giới bằng câu từ tiếng Nhật sơ cấp giản dị.",
    content: `ある日、足の 速い 兎が、足の 遅い 亀を からかいました。
「亀さん、君は 歩くのが 本当に 遅いね。」
亀は 言いました。
「では、山の てっぺんまで かけっこを しましょう。」
二人は スタートしました。
兎は あっという間に 先へ 行きました。
振り返ると、亀は まだ ずっと 後ろに います。
「まだまだ 時間が ある。少し 昼寝を しよう。」
兎は 木の 下で ぐっすり 眠ってしまいました。
その間、亀は 休まずに 一歩一歩 歩き続けました。
兎が 目を 覚ました 時には、亀は すでに ゴールに 着いていました。
油断しては いけませんね。`
  },
  {
    id: "n5_24_ari_to_kirigirisu",
    title: "📖 蟻とキリギリス (Kiến & Châu Chấu - Chăm Chỉ & Lười Biếng)",
    level: "N5",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Ngụ ngôn Aesop",
    readingTime: "2 phút",
    summary: "Mùa hè cần mẫn tích trữ thức ăn và sự ân hận của chú châu chấu khi mùa đông tới.",
    content: `夏の間、キリギリスは 毎日 歌を 歌って 楽しく 暮らしていました。
蟻（あり）たちは 汗を 流して、冬の ために 食べ物を 運んでいました。
「蟻さん、なぜ そんなに 働くの？ 一緒に 歌おうよ。」
「冬に なると 食べ物が なくなりますよ。今のうちに 準備するのです。」
やがて 寒い 冬が やってきました。
野原には 雪が 降り、どこにも 食べ物が ありません。
お腹を 空かせた キリギリスは、凍えそうになりながら 蟻の 家を 訪ねました。
「お願いです、何か 食べ物を 分けてください。」
優しい 蟻たちは 食べ物を 分けてあげました。
キリギリスは 深く 反省しました。`
  },
  {
    id: "n5_25_shinkansen_trip",
    title: "📖 初めての新幹線 (Chuyến Đi Tàu Cao Tốc Shinkansen Kỳ Diệu)",
    level: "N5",
    genre: "daily",
    genreLabel: "🌱 Sinh hoạt & Đời sống",
    author: "OmniLinguist Daily Series",
    readingTime: "3 phút",
    summary: "Trải nghiệm tốc độ 300km/h ngắm núi Phú Sĩ từ cửa sổ con tàu Shinkansen.",
    content: `土曜日、私は 東京から 京都へ 行きました。
新幹線に 初めて 乗りました。
新幹線の 鼻は 長くて、とても かっこいい 形を しています。
座席は 広くて、乗り心地が とても 良かったです。
電車が 動き出すと、どんどん スピードが 上がりました。
外の 景色が ビュンビュン 飛んでいきます。
車内販売で お弁当とお茶を 買いました。
途中で 窓から 大きな 富士山が 見えました。
頂上に 白い 雪が かぶっていて、とても 美しかったです。
東京から 京都まで 二時間十五分で 着きました。
日本の 新幹線は 速くて 静かで、本当に すごい乗り物です。`
  }
];

// 27 tác phẩm bổ sung để hoàn thành đủ 52 tác phẩm N5
const MORE_N5_TOPICS = [
  ["n5_26_kyoto_bus", "📖 京都のバス旅行 (Chuyến Xe Buýt Du Lịch Cố Đô Kyoto)", "Đi xe buýt một ngày ngắm Chùa Vàng và rừng trúc Arashiyama.", "京都で 一日バス乗車券を 買いました。金閣寺や 嵐山へ 行きました。古い 町並みが とても 綺麗でした。"],
  ["n5_27_ueno_zoo", "📖 上野動物園のパンダ (Gặp Chú Gấu Trúc Đáng Yêu Ở Vườn Thú Ueno)", "Tham quan vườn thú Ueno và xem gấu trúc ăn lá trúc xanh.", "上野動物園へ 行きました。ジャイアントパンダが 竹を 食べていました。まるまるとして とても 可愛かったです。"],
  ["n5_28_post_office", "📖 郵便局で手紙を出す (Gửi Bưu Thiếp Về Quê Nhà Tại Bưu Điện Nhật)", "Mua tem và gửi bưu thiếp kể về cuộc sống du học sinh.", "郵便局へ 行きました。ベトナムの 家族に 絵葉書を 送りました。「日本は 楽しいです」と 書きました。"],
  ["n5_29_supermarket_sale", "📖 スーパーのタイムセール (Săn Giảm Giá Giờ Vàng Tại Siêu Thị)", "Kinh nghiệm mua thực phẩm tươi ngon giảm nửa giá lúc 8 giờ tối.", "夜 八時に スーパーへ 行きました。お刺身に「半額」の シールが 貼ってありました。安くて 嬉しかったです。"],
  ["n5_30_flu_clinic", "📖 風邪をひいた日 (Khám Bệnh Tại Phòng Khám Khi Bị Cảm Cúm)", "Khai báo triệu chứng đơn giản và lấy thuốc tại hiệu thuốc.", "頭が 痛くて 熱が 出ました。近くの 病院へ 行きました。先生が 薬を くれました。暖かくして 寝ました。"],
  ["n5_31_hanabi_festival", "📖 隅田川の花火大会 (Đêm Pháo Hoa Rực Rỡ Bên Sông Sumida)", "Mặc áo Yukata truyền thống ngắm muôn sắc pháo hoa đêm hè.", "夏休みに 花火大会へ 行きました。浴衣（ゆかた）を 着ました。夜空に 大きな 花火が ドーンと 咲きました。"],
  ["n5_32_snow_day", "📖 初めての雪 (Ngày Đầu Tiên Nhìn Thấy Tuyết Rơi Rơi)", "Cảm xúc ngỡ ngàng khi tuyết phủ trắng xóa góc phố Tokyo.", "朝、カーテンを 開けると、外が 真っ白でした。初めて 雪を 見ました。冷たいけれど、とても 綺麗でした。"],
  ["n5_33_hotpot_party", "📖 友達と鍋パーティー (Tiệc Lẩu Ấm Áp Cùng Bạn Bè Đêm Mùa Đông)", "Cả nhóm du học sinh cùng nấu và ăn lẩu Sukiyaki nóng hổi.", "冬の 夜、友達と 部屋で 鍋料理を 作りました。牛肉や 白菜を たくさん 入れました。みんなで 楽しく 食べました。"],
  ["n5_34_bookstore", "📖 本屋さんとマンガ (Lạc Bước Giữa Nhà Sách Lớn Ở Shinjuku)", "Khám phá tầng truyện tranh Manga và sách học tiếng Nhật.", "大きな 本屋へ 行きました。マンガの コーナーには 本が たくさん ありました。簡単な 日本語の 本を 買いました。"],
  ["n5_35_hanami_picnic", "📖 代々木公園のお花見 (Picnic Ngắm Hoa Anh Đào Ở Công Viên Yoyogi)", "Ngồi dưới tán hoa anh đào hồng thắm thưởng thức cơm nắm.", "春、友達と 代々木公園で お花見を しました。桜の 花びらが 風に 舞って、雪のように 降ってきました。"],
  ["n5_36_japanese_tea", "📖 お茶の味 (Thử Vị Trà Xanh Ocha Đậm Đà Bản Xứ)", "Cảm nhận vị đắng thanh dịu và hương thơm tinh khiết của trà xanh.", "お茶の 専門店へ 行きました。温かい 日本茶を 飲みました。少し 苦いですが、後から 甘い 香りが しました。"],
  ["n5_37_hot_spring", "📖 初めての温泉 (Lần Đầu Tắm Suối Nước Nóng Onsen Ở Hakone)", "Trải nghiệm thư giãn gột rửa mệt mỏi tại suối khoáng tự nhiên.", "箱根の 温泉へ 行きました。露天風呂から 山が 見えました。お湯が 温かくて、体の 疲れが 取れました。"],
  ["n5_38_autumn_leaves", "📖 高尾山の紅葉 (Leo Núi Takao Ngắm Rừng Phong Đỏ Lá Mùa Thu)", "Đi cáp treo và tản bộ ngắm muôn sắc lá đỏ momiji rực rỡ.", "秋、高尾山へ 登りました。木々の 葉っぱが 赤や 黄色に 染まっていました。頂上で 食べた お蕎麦は 最高でした。"],
  ["n5_39_tsukiji_market", "📖 築地場外市場 (Thưởng Thức Hải Sản Tươi Ngon Ở Chợ Tsukiji)", "Ăn thử món sushi cá hồi và trứng cuộn bốc khói tại chợ cá.", "築地市場へ 行きました。新鮮な 魚が たくさん 売られていました。美味しい 海鮮丼を お腹いっぱい 食べました。"],
  ["n5_40_bicycle_tokyo", "📖 自転車で街を走る (Đạp Xe Dạo Quanh Phố Phường Yên Bình)", "Cách đăng ký xe đạp chống trộm và thú vui dạo phố Tokyo.", "自転車を 買いました。防犯登録も しました。風を 感じながら 街を 走るのは、とても 気持ちが いいです。"],
  ["n5_41_birthday_party", "📖 友達の誕生日 (Bữa Tiệc Sinh Nhật Bất Ngờ Cho Bạn Cùng Phòng)", "Chuẩn bị bánh kem dâu tây và hát bài chúc mừng sinh nhật.", "ルームメイトの 誕生日に、みんなで ケーキを 買いました。電気を 消して「おめでとう！」と 歌いました。"],
  ["n5_42_library_study", "📖 図書館での勉強 (Buổi Học Yên Tĩnh Tại Thư Viện Quận)", "Mượn sách miễn phí và ôn tập từ vựng chuẩn bị cho kỳ thi JLPT.", "町の 図書館へ 行きました。とても 静かで 勉強が 捗りました。日本の 絵本を 二冊 借りました。"],
  ["n5_43_disneyland", "📖 夢の東京ディズニーランド (Một Ngày Thần Tiên Tại Tokyo Disneyland)", "Gặp gỡ chuột Mickey và chơi trò chơi thuyền cướp biển.", "東京ディズニーランドへ 行きました。シンデレラ城が 大きかったです。ミッキーマウスと 写真を 撮りました。"],
  ["n5_44_japanese_curry", "📖 寮で作ったカレーライス (Tự Nấu Cơm Cà Ri Nhật Đậm Đà)", "Nấu cà ri với thịt bò, khoai tây, cà rốt thơm lừng cả gian bếp.", "日曜日に カレーライスを 作りました。玉ねぎとお肉を 炒めて、ルーを 入れました。とても 上手に できました。"],
  ["n5_45_gym_exercise", "📖 体育館で運動 (Chạy Bộ Rèn Luyện Thể Lực Cuối Tuần)", "Rèn luyện sức khỏe cùng các bạn sinh viên tại trung tâm thể thao.", "地域の 体育館で バドミントンを しました。たくさん 汗を かいて、心も 体も 元気に なりました。"],
  ["n5_46_shoe_custom", "📖 玄関で靴を脱ぐ文化 (Văn Hóa Tháo Giày Ngăn Nắp Tại Lối Vào)", "Ý thức giữ gìn vệ sinh và phép lịch sự khi vào nhà người Nhật.", "日本の 家では、玄関で 靴を 脱ぎます。スリッパに 履き替えます。家の中を 清潔に 保つ 良い 習慣です。"],
  ["n5_47_umbrella_loss", "📖 電車に忘れた傘 (Tìm Lại Chiếc Ô Bị Quên Nhờ Trung Tâm Thất Lạc)", "Sự trung thực đáng kinh ngạc của người dân khi đồ rơi luôn tìm lại được.", "電車の中に 傘を 忘れました。駅の 忘れ物センターへ 行くと、親切に 保管してくれていました。感動しました。"],
  ["n5_48_matsuri_drum", "📖 夏祭りの和太鼓 (Tiếng Trống Taiko Rộn Ràng Đêm Hội Làng)", "Lắng nghe tiếng trống truyền thống thúc giục nhịp đập con tim.", "神社の お祭りで 和太鼓の 演奏を 聞きました。「ドン、ドン！」と 響く 音に、胸が 熱くなりました。"],
  ["n5_49_tatami_room", "📖 畳の部屋の匂い (Mùi Hương Dịu Êm Của Gian Phòng Chiếu Tatami)", "Nét đẹp thư thái của kiến trúc truyền thống Nhật Bản.", "おばあさんの 家は 畳（たたみ）の 部屋でした。い草の いい 匂いが して、座ると とても 落ち着きました。"],
  ["n5_50_convenience_coffee", "📖 100円のドリップコーヒー (Cốc Cà Phê 100 Yên Thơm Ngon Mỗi Sáng)", "Thói quen nạp năng lượng nhanh gọn trước giờ lên lớp.", "毎朝、学校の 前の コンビニで 100円の ホットコーヒーを 買います。挽きたての 香りで 目が 覚めます。"],
  ["n5_51_origami_crane", "📖 初めて折った折り鶴 (Tập Gấp Con Hạc Giấy Origami Đầu Tiên)", "Học cách gấp hạc giấy cầu mong bình an và may mắn.", "先生に 折り紙で 鶴の 折り方を 習いました。角を きちんと 合わせると、綺麗な 鶴が 完成しました。"],
  ["n5_52_farewell_station", "📖 駅のホームでの見送り (Giây Phút Chia Tay Xúc Động Nơi Sân Ga)", "Lời hẹn gặp lại và cái vẫy tay đầy lưu luyến của tình bạn.", "友達が 国へ 帰る日、成田行きの ホームで 見送りを しました。「また 会おうね」と 約束して 手を 振りました。"]
];

MORE_N5_TOPICS.forEach(([id, title, summary, content]) => {
  N5_READINGS.push({
    id,
    title,
    level: "N5",
    genre: id.includes("festival") || id.includes("custom") ? "culture" : "daily",
    genreLabel: id.includes("festival") || id.includes("custom") ? "🏛️ Văn hóa & Cảnh sắc" : "🌱 Sinh hoạt & Đời sống",
    author: "OmniLinguist SLA Team",
    readingTime: "2 phút",
    summary,
    content: `${content}\n\n日本語の 勉強は 毎日の 積み重ねが 大切です。少しずつ 読んで、言葉の 力と 自信を つけましょう。`
  });
});

module.exports = { N5_READINGS };

// scripts/data_reading_n4.cjs
// Bộ Ngữ Liệu Đọc N4 Toàn Diện (52 Tác phẩm & Bài đọc Sơ trung cấp N4)

const N4_READINGS = [
  {
    id: "n4_01_teru_teru_bozu",
    title: "📖 てるてる坊主の伝説 (Búp Bê Cầu Nắng Teru Teru Bozu)",
    level: "N4",
    genre: "culture",
    genreLabel: "🏛️ Văn hóa & Truyền thuyết",
    author: "Văn hóa dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Truyền thuyết cảm động về búp bê vải trắng cầu cho trời quang mây tạnh trong mùa mưa.",
    content: `梅雨（つゆ）の 季節になると、日本の 子供たちは 白い 紙や 布で 人形を 作ります。
窓辺に 吊るして、「明日 天気にしておくれ」と お祈りします。
これが「てるてる坊主」です。
昔、雨が 何日も 降り続いて、川が 溢れそうになった 村が ありました。
村人たちが 困り果てていると、一人の お坊さんが 現れました。
お坊さんが お経を 唱えると、不思議なことに 雨が 止んで、青空が 広がりました。
お殿様は 大変 喜び、お坊さんに たくさんの 褒美を 与えました。
しかし、次の 年に また 大雨が 降ったとき、お坊さんは 天気を 変えることが できませんでした。
怒った お殿様は お坊さんを 処刑してしまったという、少し 悲しい 伝説も 残っています。
現在では、遠足や 運動会の 前の日に、晴れることを 願って 楽しく 作る 人形として 親しまれています。`
  },
  {
    id: "n4_02_asakusa_omamori",
    title: "📖 浅草寺とお守りの秘密 (Bùa Bình An Omamori Ở Chùa Cổ Asakusa)",
    level: "N4",
    genre: "culture",
    genreLabel: "🏛️ Văn hóa & Truyền thuyết",
    author: "Văn hóa Nhật Bản",
    readingTime: "3 phút",
    summary: "Khám phá ý nghĩa của chiếc bùa may mắn và phong tục lễ chùa đầu năm Hatsumode.",
    content: `東京で 一番 古い お寺は、浅草（あさくさ）にある「浅草寺（せんそうじ）」です。
大きな 赤い 提灯（ちょうちん）が 下がっている「雷門（かみなりもん）」は、とても 有名です。
仲見世通りを 通って 本堂へ 行くと、煙が 立ち上る 大きな 常香炉（じょうこうろ）が あります。
その 煙を 体の 悪い ところに かけると、病気や 怪我が 治ると 信じられています。
お参りをした後、多くの 人が「お守り」を 買います。
交通安全、合格祈願、健康祈願など、いろいろな 種類の お守りが あります。
お守りは、神様や 仏様の 力が 宿っている 小さな 袋です。
中を 開けて 見てはいけません。開けると 神聖な 力が 逃げてしまうと 言われているからです。
一年間 身につけた お守りは、年末に お寺に 返して 感謝の 祈りを 捧げます。`
  },
  {
    id: "n4_03_fuji_legend",
    title: "📖 富士山と不老不死の薬 (Bí Mật Núi Phú Sĩ & Thuốc Trường Sinh)",
    level: "N4",
    genre: "folktale",
    genreLabel: "🏛️ Văn hóa & Truyền thuyết",
    author: "Huyền thoại Nhật Bản",
    readingTime: "4 phút",
    summary: "Nguồn gốc tên gọi núi Phú Sĩ gắn liền với nàng Kaguya và ngọn lửa trường sinh bất tử.",
    content: `日本で 一番 高くて 美しい 山は「富士山（ふじさん）」です。
標高は 3776メートルで、2013年に 世界文化遺産に 登録されました。
富士山の 名前には、古い 神話が 隠されています。
『竹取物語』の 最後に、かぐや姫は 月へ 帰る前に、日本の 帝（みかど）に「不老不死の 薬」を 贈りました。
しかし、愛するかぐや姫を 失った 帝は、深く 悲しみました。
「かぐや姫が いない この世で、永遠に 生きても 何の意味が あろうか。」
帝は 家来に 命じました。
「日本で 一番 天に 近い 山の 頂上へ 行き、この 不死の 薬と 手紙を 焼きなさい。」
家来たちは 山の てっぺんで 薬を 焼きました。
その 煙は 雲を 突き抜けて、月まで 昇っていったと 言われています。
「不死（ふし）」の 薬を 焼いた 山だから、「ふじ山」と 呼ばれるようになったという 説が あります。`
  },
  {
    id: "n4_04_tanuki_magic",
    title: "📖 化け狸と人間 (Thần Thú Tanuki Biến Hình & Những Trò Đùa Nghịch)",
    level: "N4",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Hình tượng chú lửng chó Tanuki lém lỉnh, thích biến hình trêu chọc con người nhưng rất trọng ân nghĩa.",
    content: `日本の 昔話には、狐（きつね）と 狸（たぬき）が よく 登場します。
どちらも 人間を 化かす 不思議な 力を持っていますが、狸は どこか お茶目で 憎めない 性格を しています。
頭に 木の葉を 乗せて「ドロン！」と 唱えると、お坊さんや 美しい 娘、あるいは 鍋や 釜などの 道具に 変身します。
満月の 夜になると、大きなお腹を ポンポコと 叩いて 音楽を 奏でます。
四国地方には、八百八匹の 仲間を 従えた「隠神刑部（いぬがみぎょうぶ）」という 伝説の 狸も いました。
狸は 人間を 騙すことも ありますが、一度 恩を 受けたら 決して 忘れません。
お酒と 徳利（とっくり）を 持った 信楽焼（しがらきやき）の 狸の 置物は、商売繁盛の 縁起物として、今でも 日本の 飲食店の 店先に よく 置かれています。`
  },
  {
    id: "n4_05_kappa_legend",
    title: "📖 河童ときゅうり (Huyền Thoại Quái Vật Sông Nước Kappa Thích Dưa Chuột)",
    level: "N4",
    genre: "folktale",
    genreLabel: "🏛️ Cổ tích & Ngụ ngôn",
    author: "Dân gian Nhật Bản",
    readingTime: "3 phút",
    summary: "Quái vật Kappa đầu đĩa nước, giỏi võ Sumo và món sushi cuộn dưa chuột Kappa-maki.",
    content: `「河童（かっぱ）」は、川や 池に 住んでいる 日本の 妖怪です。
体は 緑色で、背中には 亀のような 甲羅（こうら）が あります。
頭の てっぺんには「皿」が あり、その 皿が 水で 濡れている 間は、すごい 力を 発揮します。
もし 皿の 水が 乾いてしまうと、河童は 力を 失って 動けなくなります。
河童は 相撲が 大好きで、通りかかる 人間に「相撲を 取ろう」と 挑んできます。
河童に 勝つ 秘訣は、お辞儀を することです。
人間が 礼儀正しく お辞儀を すると、河童も つられて お辞儀を します。
すると、頭の 皿から 水が こぼれてしまい、河童は 動けなくなって 負けてしまうのです。
河童の 大好物は「きゅうり」です。
お寿司屋さんで きゅうりを 巻いた 細巻きを「かっぱ巻き」と 呼ぶのは、この 伝説から 来ています。`
  },
  {
    id: "n4_06_origami_thousand_cranes",
    title: "📖 千羽鶴の願い (Nghệ Thuật Gấp Nghìn Con Hạc Giấy Hiroshima)",
    level: "N4",
    genre: "culture",
    genreLabel: "🏛️ Văn hóa & Truyền thuyết",
    author: "Lịch sử Nhật Bản",
    readingTime: "4 phút",
    summary: "Biểu tượng hòa bình thế giới qua câu chuyện cô bé Sadako gấp nghìn hạc giấy tại Hiroshima.",
    content: `日本では、折り紙で 鶴を 千羽 折って 糸で 繋いだものを「千羽鶴（せんばづる）」と 呼びます。
鶴は「千年の 寿命を 持つ」と 言われる おめでたい 鳥です。
そのため、病気の 回復や 平和への 祈りを 込めて 千羽鶴を 折る 習慣が あります。
広島の 平和記念公園には、「原爆の子の像」が 立っています。
この 像の モデルは、佐々木禎子（ささき さだこ）さんという 二歳のときに 被爆した 少女です。
十歳で 白血病になった 禎子さんは、「鶴を 千羽 折れば、病気が 治る」と 信じて、薬の 包み紙などを 使って 毎日 鶴を 折り続けました。
残念ながら 禎子さんは 亡くなってしまいましたが、彼女の 物語は 世界中に 広まりました。
今でも 広島や 長崎には、世界中から 平和を 願う たくさんの 千羽鶴が 届けられています。`
  },
  {
    id: "n4_07_hakone_onsen",
    title: "📖 箱根の温泉とマナー (Tắm Suối Nước Nóng Onsen Hakone & Quy Tắc Văn Hóa)",
    level: "N4",
    genre: "culture",
    genreLabel: "🌱 Du lịch & Trải nghiệm",
    author: "OmniLinguist Travel Guide",
    readingTime: "3 phút",
    summary: "Hướng dẫn các bước tắm Onsen đúng chuẩn văn hóa người Nhật để có chuyến đi trọn vẹn.",
    content: `日本には 火山が 多いため、全国に 三千以上の 温泉地が あります。
東京から 近くで 人気なのが、神奈川県の「箱根（はこね）温泉」です。
温泉に 入る前には、知っておくべき 大切な マナーが あります。
まず、脱衣所で 服を 全部 脱ぎます。水着を 着ては いけません。
次に、お風呂に入る前に、必ず 体と 髪を 洗い場で 綺麗に 洗います。
浴槽（湯船）の お湯を 汚さないためです。
湯船の中に タオルを 入れてはいけません。頭の 上に 乗せておくのが 日本の スタイルです。
露天風呂（ろてんぶろ）に 浸かりながら、遠くの 山々や 澄んだ 空を 眺める 時間は、最高の 贅沢です。
温泉から 出た後は、冷たい 牛乳を 飲むのが 昔からの 定番の 楽しみ方です。`
  },
  {
    id: "n4_08_shinkansen_ticket",
    title: "📖 新幹線の切符を買う方法 (Cách Mua Vé & Đi Tàu Shinkansen Tuyến Tokaido)",
    level: "N4",
    genre: "daily",
    genreLabel: "🌱 Sinh hoạt & Đời sống",
    author: "OmniLinguist Transport Guide",
    readingTime: "3 phút",
    summary: "Phân biệt ghế chỉ định (Shiteiseki) và tự do (Jiyuuseki) khi đi lại liên tỉnh bằng Shinkansen.",
    content: `新幹線に 乗るためには、「乗車券」と「特急券」の 二枚の 切符が 必要です。
駅の「みどりの窓口」や、指定席券売機で 買うことができます。
座席には「指定席（していせき）」と「自由席（じゆうせき）」が あります。
指定席は、自分の 席が 決まっているので、混んでいる 時でも 確実に 座ることができます。
自由席は、少し 値段が 安いですが、早い者勝ちなので 混雑時は 席が 見つからず、立たなければならないことも あります。
お正月や お盆などの 連休には、何週間も 前から 指定席が 満席になります。
車内では、静かに 過ごすことが マナーです。
携帯電話で 通話したいときは、客席を 離れて デッキへ 移動して 話します。
ゴミは 降りるときに 自分で 集めて、駅の ゴミ箱に 捨てましょう。`
  },
  {
    id: "n4_09_kinkakuji_kyoto",
    title: "📖 金閣寺の輝き (Ngôi Chùa Vàng Kinkakuji Soi Bóng Hồ Gương)",
    level: "N4",
    genre: "culture",
    genreLabel: "🏛️ Văn hóa & Truyền thuyết",
    author: "Lịch sử Kyoto",
    readingTime: "3 phút",
    summary: "Kiến trúc dát vàng rực rỡ thời kỳ Muromachi phản chiếu trên mặt hồ Kyoko-chi.",
    content: `京都を 代表する 観光地といえば、「鹿苑寺（ろくおんじ）」、通称「金閣寺（きんかくじ）」です。
室町幕府の 三代将軍、足利義満（あしかが よしみつ）が 14世紀末に 建てました。
建物の 二層と 三層の 外壁には、本物の 金箔（きんぱく）が 隙間なく 貼られています。
晴れた日には、目の前にある「鏡湖池（きょうこち）」という 池の 水面に、金色の 建物が 鏡のように 映し出されます。
これを「逆さ金閣」と 呼び、息を のむほど 幻想的な 美しさです。
冬になり、雪が 降った日の 金閣寺は、白と 金色の コントラストが 際立ち、まさに 極楽浄土のようです。
歴史の中で 一度 焼失しましたが、人々の 努力によって 見事に 再建され、現在も 世界中からの 旅行者を 魅了し続けています。`
  },
  {
    id: "n4_10_himeji_castle",
    title: "📖 白鷺城と姫路城の美 (Lâu Đài Himeji - Di Sản Bạch Hạc Kiêu Hãnh)",
    level: "N4",
    genre: "culture",
    genreLabel: "🏛️ Văn hóa & Truyền thuyết",
    author: "Lịch sử Nhật Bản",
    readingTime: "3 phút",
    summary: "Tòa lâu đài gỗ nguyên bản lớn nhất Nhật Bản với màu vôi trắng muốt như cánh chim hạc.",
    content: `兵庫県にある「姫路城（ひめじじょう）」は、日本で 最初の 世界文化遺産の一つです。
城の 壁が 白漆喰（しろしっくい）で 真っ白に 塗られており、その 姿が まるで 白い 鷺（さぎ）が 羽を 広げて 飛んでいるように 見えるため、「白鷺城（しらさぎじょう）」とも 呼ばれています。
400年以上 前の 江戸時代初期に 建てられましたが、戦争の 空襲や 大きな 地震を くぐり抜けて、奇跡的に 当時の まま 残っています。
城の 内部は、敵が 攻めてきても 簡単に 天守閣に 近づけないよう、複雑な 迷路のような 通路に なっています。
天守閣の てっぺんまで 登ると、姫路の 街全体を 一望することができます。
日本の 城郭建築の 最高峰として、国内外から 高い 評価を 受けています。`
  }
];

// 42 tác phẩm bổ sung N4 phủ trọn toàn diện mọi phân vùng ngôn ngữ
const MORE_N4_TOPICS = [
  ["n4_11_dendenmushi", "📖 でんでんむしのかなしみ (Nỗi Buồn Của Chú Ốc Sên - Niimi Nankichi)", "Truyện triết lý nhân sinh cảm động về việc ai trong đời cũng cưu mang một nỗi buồn.", "新美南吉の 名作です。一匹の でんでんむしが「私の 殻の中には 悲しみが 詰まっている」と 気づいて 友達に 相談します。しかし、どの 友達も「私の 殻にも 悲しみは ある」と 答えます。みんな それぞれ 悲しみを 抱えて 生きているのです。"],
  ["n4_12_tebukuro_kai_ni", "📖 手袋を買いに (Cáo Con Đi Mua Găng Tay - Niimi Nankichi bản N4)", "Chú cáo nhỏ dùng bàn tay người bước vào thị trấn mùa tuyết rơi mua găng tay.", "寒い 冬の朝、子狐の 手が 霜焼けで 真っ赤に なりました。母狐は 子狐の 片手を 人間の 手に 変えて、町の手袋屋へ 行かせました。優しい 帽子屋の 主人は、狐の手だと 気づいても 暖かい 手袋を 売ってくれました。"],
  ["n4_13_akai_rousoku", "📖 赤い蝋燭と人魚 (Ngọn Nến Đỏ & Người Cá - Ogawa Mimei bản N4)", "Câu chuyện huyền ảo cảm động của ông tổ truyện cổ tích cận đại Ogawa Mimei.", "北の 冷たい 海に 住む 人魚が、人間の 優しい 心を 信じて 赤ん坊を 地上に 産み落としました。老夫婦に 育てられた 娘は、絵を描いた 赤い 蝋燭を 作ります。しかし、強欲な 商人が 娘を 見せ物として 買い取ろうと します。"],
  ["n4_14_tsuki_to_azarashi", "📖 月と海豹 (Mặt Trăng Và Chú Hải Cẩu - Ogawa Mimei)", "Vẻ đẹp tĩnh lặng của thiên nhiên bắc cực và tình mẫu tử thiêng liêng.", "流氷の 浮かぶ 北の 海で、母海豹と 子海豹が 月の 光を 浴びて 休んでいました。月は 優しく 海を 照らし、厳しい 自然の 中でも 確かな 愛が 存在することを 教えてくれます。"],
  ["n4_15_yucho_bank", "📖 ゆうちょ銀行で口座開設 (Mở Tài Khoản Ngân Hàng Bưu Điện Yucho)", "Thủ tục mở sổ tài khoản và thẻ rút tiền ATM dành cho du học sinh.", "郵便局の 窓口で 口座開設の 手続きを しました。在留カードと 印鑑（いんかん）を 提出しました。暗証番号を 決めて、一週間後に 自宅に キャッシュカードが 届きました。"],
  ["n4_16_renting_apartment", "📖 アパート探しと礼金・敷金 (Tìm Thuê Nhà Trọ & Tìm Hiểu Tiền Reikin)", "Tìm hiểu hợp đồng thuê nhà, tiền đặt cọc Shikikin và tiền lễ Reikin độc đáo.", "不動産屋で 部屋を 探しました。日本では、家賃の 他に「敷金（保証金）」と「礼金（大家さんへの お礼）」を 払う 習慣が あります。保証人も 必要なので、学校の 担当者に 相談しました。"],
  ["n4_17_tokyo_subway_transfer", "📖 地下鉄の乗り換え術 (Nghệ Thuật Chuyển Tuyến Tàu Điện Ngầm Tokyo)", "Cách sử dụng ứng dụng bản đồ tàu điện và các tuyến Metro, Toei chằng chịt.", "東京の 地下鉄は 東京メトロと 都営地下鉄が あります。乗り換えアプリを 使うと、何号車に 乗れば 階段に 近いかまで 分かります。Suicaや Pasmoが あれば 切符を 買わずに タッチだけで 乗れて 便利です。"],
  ["n4_18_convenience_services", "📖 コンビニのマルチコピー機 (In Ấn & Trả Tiền Hóa Đơn Tại Cửa Hàng Tiện Lợi)", "Cách in tài liệu từ smartphone và thanh toán tiền điện thoại tại Konbini.", "学校の 宿題を コンビニの コピー機で 印刷しました。スマホから データを 送信して、番号を 入力するだけで 簡単に 印刷できます。公共料金の 支払いも レジで バーコードを 見せるだけで 済みます。"],
  ["n4_19_nomikai_manner", "📖 飲み会の乾杯マナー (Văn Hóa Tiệc Rượu & Phép Lịch Sự Rót Rượu Kanpai)", "Phép tắc giữ hai tay khi rót bia và quy tắc kính trên nhường dưới trong tiệc liên hoan.", "アルバイトの 歓送迎会に 参加しました。乾杯の ときは、目上の 人の グラスより 少し 低い 位置で 合わせます。ビールを 注ぐときは 両手で 瓶を 持つのが マナーだと 先輩に 教わりました。"],
  ["n4_20_hatsumode_new_year", "📖 初詣と絵馬の願い (Đi Lễ Đầu Năm Hatsumode & Viết Bảng Gỗ Ema)", "Cầu chúc năm mới an khang và viết ước nguyện thi cử lên thẻ gỗ Ema.", "一月一日に 明治神宮へ 初詣に 行きました。お賽銭（さいせん）を 入れて、「二礼 二拍手 一礼」で お祈りしました。「JLPT N2に 合格できますように」と 絵馬に 書いて 奉納しました。"],
  ["n4_21_natto_challenge", "📖 納豆への挑戦 (Thử Thách Ăn Món Đậu Tương Lên Men Natto)", "Hành trình từ sợ mùi nồng đến yêu thích món ăn bổ dưỡng trường thọ của người Nhật.", "初めて 納豆を 見たときは、匂いと ネバネバに 驚きました。しかし、醤油と からしを 入れて よく かき混ぜると、ご飯に とても よく 合いました。今では 毎朝 食べるほど 大好物になりました。"],
  ["n4_22_takoyaki_party", "📖 大阪のたこ焼きパーティー (Tự Làm Bánh Bạch Tuộc Takoyaki Tại Nhà)", "Trải nghiệm dùng đũa lật bánh tròn xoe giòn rụm đậm chất Osaka.", "大阪出身の 友達の 家で たこ焼きを 作りました。専用の 鉄板に 生地と タコを 入れて、千枚通しで くるくると 丸めます。外は カリッと、中は トロトロで、ソースと マヨネーズが 最高でした。"],
  ["n4_23_furusato_nozei", "📖 ふるさと納税の魅力 (Chính Sách Nộp Thuế Quê Hương Nhận Đặc Sản)", "Tìm hiểu mô hình đóng góp cho các địa phương nông thôn và nhận quà cảm ơn.", "日本の「ふるさと納税」は、応援したい 地方自治体に 寄付を すると、税金が 控除され、その 土地の 特産品（お米や お肉、果物）が お礼として 届く 素晴らしい 制度です。地方の 活性化に 役立っています。"],
  ["n4_24_okinawa_churaumi", "📖 沖縄の美ら海水族館 (Thủy Cung Churaumi Okinawa & Cá Mập Voi Khổng Lồ)", "Ngắm nhìn sinh vật biển kỳ vĩ bơi lội trong bể kính khổng lồ.", "沖縄へ 旅行に 行きました。美ら海水族館の 巨大な 水槽には、体長 八メートルを 超える ジンベエザメが 優雅に 泳いでいました。青い 海の 世界に 吸い込まれそうでした。"],
  ["n4_25_sapporo_snow_fest", "📖 札幌雪まつりの大雪像 (Lễ Hội Tuyết Sapporo Với Các Tòa Lâu Đài Băng)", "Chiêm ngưỡng những công trình kiến trúc điêu khắc bằng tuyết khổng lồ ở Hokkaido.", "二月に 北海道の 札幌雪まつりを 見に行きました。大通公園には、お城や アニメの キャラクターの 巨大な 雪像が 並んでいました。夜の ライトアップは 幻想的で、寒さを 忘れるほどでした。"],
  ["n4_26_arashiyama_bamboo", "📖 嵐山の竹林の小径 (Con Đường Rừng Trúc Arashiyama Xanh Mướt)", "Tiếng gió xào xạc thanh lọc tâm hồn giữa bạt ngàn tre trúc Kyoto.", "京都の 嵐山にある 竹林の 道を 歩きました。天高く 伸びた 竹の 間から 木漏れ日が 差し込み、風が 吹くと サワサワと 心地よい 音が 響きます。日本庭園の 静寂の 美しさを 感じました。"],
  ["n4_27_dazaifu_tenmangu", "📖 太宰府天満宮と学問の神様 (Đền Daizaifu Fukuoka Cầu Thi Cử Đỗ Đạt)", "Ngôi đền thờ thần học vấn Sugawara no Michizane và hoa mai bay Tobi-ume.", "福岡県の 太宰府天満宮へ 行きました。平安時代の 学者、菅原道真公が 祀られており、学問の 神様として 受験生に 大人気です。参道で 焼きたての「梅ヶ枝餅（うめがえもち）」を 食べました。"],
  ["n4_28_manga_museum", "📖 京都国際マンガミュージアム (Viện Bảo Tàng Truyện Tranh Quốc Tế Kyoto)", "Thiên đường lưu trữ hơn 300,000 cuốn manga từ cổ điển đến hiện đại.", "古い 小学校の 建物を 改修した マンガミュージアムへ 行きました。壁一面に 本棚が あり、芝生に 座って 自由に 読むことができます。日本の マンガ文化の 歴史の 深さを 知りました。"],
  ["n4_29_omotenashi_ryokan", "📖 旅館のおもてなし (Phong Cách Phục Vụ Chu Đáo Tận Tâm Tại Nhà Nghỉ Ryokan)", "Trải nghiệm mặc áo Yukata, ăn tiệc Kaiseki và ngủ trên đệm Futon êm ái.", "温泉旅館に 泊まりました。仲居（なかい）さんが 丁寧にお茶を 淹れてくれました。季節の 食材を 使った 懐石料理は、味も 見た目も 芸術のようでした。これが 日本の「おもてなし」の 心です。"],
  ["n4_30_danshari_minimalism", "📖 断捨離とミニマリズム (Triết Lý Sống Tối Giản Vứt Bỏ Đồ Thừa Danshari)", "Lối sống giảm bớt vật chất để tìm kiếm sự bình yên thanh thản trong tâm trí.", "「断捨離（だんしゃり）」とは、不要な 物を 減らし、執着を 手放す 生活様式です。部屋から 使わない 物を 捨てることで、本当に 大切な ものが 見えてきます。物質的な 豊かさよりも 心の ゆとりを 重視する 考え方です。"],
  ["n4_31_bento_culture", "📖 キャラ弁と母の愛情 (Văn Hóa Cơm Hộp Nhân Vật Hoạt Hình Kyaraben)", "Nghệ thuật tỉ mỉ tạo hình gấu trúc, hoa quả từ rong biển và trứng của các bà mẹ.", "日本の お弁当文化は 非常に 発展しています。子供が 喜ぶように、ご飯や おかずで アニメの キャラクターを 作る「キャラ弁」が 流行しています。海苔や ハムを 細かく 切る 手間には、子供への 深い 愛情が 詰まっています。"],
  ["n4_32_robot_restaurant", "📖 未来の配膳ロボット (Robot Bưng Bê Tự Động Trong Nhà Hàng Nhật Bản)", "Ứng dụng công nghệ hiện đại giải quyết vấn đề thiếu hụt nhân lực bán thời gian.", "ファミリーレストランへ 行くと、猫の 顔をした 配膳ロボットが 料理を 運んできました。障害物を 避けて テーブルまで 正確に 届けてくれます。少子高齢化で 人手が 足りない 日本で、テクノロジーが 活躍しています。"],
  ["n4_33_emergency_kit", "📖 防災グッズの準備 (Chuẩn Bị Túi Cứu Hộ Khẩn Cấp Phòng Chống Động Đất)", "Kỹ năng sinh tồn chuẩn bị nước uống, lương khô và pin sạc khi có thiên tai.", "日本は 地震が 多い 国です。非常時に 備えて「防災リュック」を 準備しました。水、非常食、懐中電灯、携帯ラジオ、簡易トイレなどを 詰めて、玄関の 近くに 置いてあります。日頃の 備えが 命を 守ります。"],
  ["n4_34_bookoff_shopping", "📖 ブックオフで宝探し (Săn Sách Cũ & Đồ Điện Tử Tại Chuỗi Cửa Hàng Book-Off)", "Văn hóa tái sử dụng đồ cũ giữ gìn như mới với giá chỉ bằng một phần mười.", "古本や 中古品を 扱う「BOOK-OFF」へ 行きました。中古と いっても、新品のように 綺麗に 磨かれています。定価の 半額以下で 日本語の 小説や CDを 買うことが できて、留学生の 強い 味方です。"],
  ["n4_35_hanami_history", "📖 お花見の歴史 (Lịch Sử 1000 Năm Phong Tục Ngắm Hoa Anh Đào)", "Từ thú vui tao nhã của quý tộc cung đình Heian đến ngày hội toàn dân dưới tán hoa.", "お花見の 歴史は 奈良時代に 始まりました。当時は 梅の 花を 愛でていましたが、平安時代から 桜が 主役に なりました。豊臣秀吉が 開いた 豪華な「醍醐（だいご）の花見」も 有名です。命の 短い 桜に、無常の 美を 見出しています。"],
  ["n4_36_kimono_experience", "📖 着物レンタルの体験 (Trải Nghiệm Mặc Kimono Dạo Bước Phố Cổ Kyoto)", "Cảm nhận sự gò bó trang nhã và nét thanh thoát của quốc phục Nhật Bản.", "着物レンタル店で 着付けをして もらいました。帯を きつく 締めると、自然と 背筋が 伸びて 歩き方も おしとやかに なります。下駄（げた）を 鳴らしながら 古い 街並みを 歩くと、江戸時代に タイムスリップしたようでした。"],
  ["n4_37_teahouse_matcha", "📖 茶道の初歩とお菓子 (Thưởng Thức Trà Đạo Matcha & Bánh Ngọt Wagashi)", "Quy tắc xoay bát trà hai lần để thể hiện lòng kính trọng nghệ nhân trà.", "茶道の 体験教室に 参加しました。お茶を いただく前に、甘い 和菓子を 食べます。苦い 抹茶と 甘い お菓子の 相性が 抜群です。茶碗の 正面を 避けるために 二回 回してから 飲む 作法を 学びました。「一期一会」の 精神を 感じました。"],
  ["n4_38_ramen_museum", "📖 新横浜ラーメン博物館 (Bảo Tàng Mì Ramen Shin-Yokohama)", "Khu phố cổ Showa hoài niệm tái hiện nguồn gốc lịch sử của từng dòng mì ramen.", "館内に入ると、昭和33年の 夕暮れの 街並みが 再現されていました。全国各地の 有名な ラーメン店が 集まっており、小さな「ミニラーメン」を 頼めば、何杯も 食べ比べが できます。食文化の テーマパークです。"],
  ["n4_39_tsukimi_festival", "📖 お月見と月見団子 (Lễ Hội Ngắm Trăng Rằm Trung Thu & Bánh Tsukimi Dango)", "Cắm cỏ Susuki và thưởng thức đĩa bánh nếp tròn ngắm vầng trăng sáng tỏ.", "旧暦八月十五日の 夜を「十五夜」と 言います。ススキを 飾り、丸い お団子を 供えて、美しい 満月を 鑑賞します。月の 模様が「餅をつく 兎」に 見えることから、月に まつわる 物語が たくさん 生まれました。豊かな 実りに 感謝する 行事です。"],
  ["n4_40_kabuki_theater", "📖 初めての歌舞伎鑑賞 (Lần Đầu Thưởng Thức Nghệ Thuật Kịch Cổ Truyền Kabuki)", "Mặt vẽ Kumadori ấn tượng và điệu bộ Mie uy nghi trên sân khấu kịch Hanamichi.", "銀座の 歌舞伎座へ 行きました。役者の 顔には 赤や 青の「隈取（くまどり）」という 独特な メイクが 施されています。「イヤホンガイド」を 借りると、物語の 背景や 台詞の 意味を リアルタイムで 解説してくれて、初心者でも 楽しめました。"],
  ["n4_41_onsen_tamago", "📖 温泉街と温泉卵 (Thưởng Thức Món Trứng Lòng Đào Luộc Bằng Suối Nước Nóng)", "Nhiệt độ suối khoáng tự nhiên 68 độ C tạo nên món trứng mềm mịn tan trong miệng.", "草津温泉の 湯畑（ゆばたけ）を 散策しました。硫黄の 香りが 立ち込める 中で、源泉の お湯で 茹でた「温泉卵」を 食べました。白身は 半熟で トロトロ、黄身は しっとり 固まっていて、塩を 少し つけると 絶品でした。"],
  ["n4_42_tokyo_tower_view", "📖 東京タワーの夜景 (Ngắm Toàn Cảnh Tokyo Lên Đèn Từ Tháp Tokyo Đỏ Thắm)", "Ngọn tháp biểu tượng của thời kỳ tái thiết kinh tế sau chiến tranh.", "昭和33年に 完成した 東京タワーは、高さ 333メートルです。赤と 白の 鉄骨が レトロな 魅力を 放っています。展望台から 見下ろす 東京の 夜景は、まるで 光の 海のようでした。スカイツリーとは 違う 温かい 存在感があります。"],
  ["n4_43_flea_market", "📖 神社の蚤の市 (Khám Phá Chợ Trời Đồ Cổ Nơi Sân Đền Thần Đạo)", "Tìm kiếm những chiếc đĩa gốm cổ, búp bê Kokeshi và tiền xu thời Edo.", "神社の 境内で 開かれた「蚤の市（骨董市）」へ 行きました。古い 着物、手作りの 陶器、木彫りの 人形などが 所狭しと 並んでいました。店主の おじいさんと 値段交渉を しながら 買い物をするのが とても 楽しかったです。"],
  ["n4_44_yokohama_chinatown", "📖 横浜中華街の賑わい (Phố Tàu Lớn Nhất Nhật Bản Tại Cảng Biển Yokohama)", "Thưởng thức bánh bao xá xíu và sủi cảo bốc khói nghi ngút tại bến cảng xưa.", "横浜の 中華街には 500以上の 店が ひしめき合っています。大きな 門を くぐると、美味しそうな 点心の 匂いが 漂ってきます。熱々の「小籠包（しょうろんぽう）」を かじると、中から 旨味たっぷりの スープが あふれ出ました。"],
  ["n4_45_sumo_tournament", "📖 両国国技館の大相撲 (Xem Trận Đấu Vật Sumo Nảy Lửa Tại Nhà Thi Đấu Ryogoku)", "Nghi thức rải muối thanh tẩy võ đài và sức mạnh phi thường của các đô vật Rikishi.", "大相撲の 本場所を 観戦しました。力士が 土俵に 塩を まいて 身を 清める 姿は、神聖で 迫力が ありました。「はっけよい！」の 合図で ぶつかり合う 肉体と 肉体の 音が、館内中に 響き渡りました。日本の 国技の 伝統を 実感しました。"],
  ["n4_46_koinobori_may", "📖 端午の節句と鯉のぼり (Tết Đoan Ngọ Mồng 5 Tháng 5 & Cờ Cá Chép Koinobori)", "Cầu chúc cho các bé trai lớn lên khỏe mạnh, kiên cường vượt qua mọi sóng gió.", "五月五日の「子供の日」には、庭や ベランダに 色鮮やかな「鯉のぼり」を 泳がせます。鯉は 激しい 滝を 登って 龍に なるという 中国の 伝説から、どんな 困難にも 負けずに 逞しく 成長してほしいという 親の 願いが 込められています。柏餅も 食べます。"],
  ["n4_47_sensu_fan", "📖 京扇子の美と涼 (Nghệ Thuật Quạt Xếp Kyo-Sensu Xua Tan Cái Nóng)", "Nét tinh xảo của khung nan tre vót mảnh và tranh vẽ dát vàng thanh nhã.", "京都の 伝統工芸品である「京扇子（きょうせんす）」を 買いました。骨となる 竹を 職人が 一本一本 削り、美しい 和紙を 貼って 作られます。パッと 広げると 爽やかな 風が 生まれ、畳むと コンパクトに 収まります。実用性と 芸術性を 兼ね備えています。"],
  ["n4_48_wagashi_seasons", "📖 和菓子に映る季節 (Thế Giới Bánh Ngọt Wagashi Biến Chuyển Theo Mùa)", "Mỗi chiếc bánh nhỏ là một tác phẩm điêu khắc nghệ thuật vị giác.", "日本の 伝統的な お菓子「和菓子（わがし）」は、食べる 芸術品と 呼ばれます。春は 桜餅、夏は 水羊羹、秋は 栗きんとん。形や 色だけでなく、菓子の 名前（銘）にも 古典文学や 自然の 景色が 織り込まれています。五感で 味わう お菓子です。"],
  ["n4_49_railway_punctuality", "📖 日本の電車の正確さ (Kỷ Lục Đúng Giờ Từng Giây Của Đường Sắt Nhật Bản)", "Tại sao các chuyến tàu Nhật Bản luôn chạy chính xác tuyệt đối từng giây?", "日本の 電車が 1分でも 遅れると、駅で「お詫びの アナウンス」が 流れます。遅延証明書が 発行されるほど、正確な 運行が 当たり前とされています。運転士、車掌、駅員、整備士が 一丸となって ダイヤを 守る プロフェッショナルな 姿勢に 感銘を受けました。"],
  ["n4_50_omiyage_culture", "📖 お土産文化と気配り (Văn Hóa Mua Quà Omiyage Sau Mỗi Chuyến Đi Xa)", "Món quà bánh hộp chia đều cho đồng nghiệp thể hiện sự chu đáo chia sẻ niềm vui.", "旅行や 出張から 帰ると、職場や 学校の 仲間に「お土産」を 配る 習慣が あります。個包装された お菓子が 多く、みんなで 分けやすいように 配慮されています。「お休みを いただき ありがとうございました」という 感謝と 気配りの 表現です。"],
  ["n4_51_origami_box", "📖 折り紙の小箱 (Học Cách Gấp Hộp Giấy Sanbō Đựng Đồ Đa Năng)", "Từ một mảnh giấy vuông vắn biến hóa thành chiếc khay đựng bánh kẹo tiện lợi.", "正方形の 紙一枚から、ハサミを 使わずに 立体的な 小箱を 折ることができます。テーブルの 上の ゴミ入れに したり、小物を 整理したりするのに とても 重宝します。日本の「もったいない」精神と 幾何学的な 知恵が 詰まった 伝統の 技です。"],
  ["n4_52_graduation_cherry", "📖 卒業式と旅立ち (Lễ Tốt Nghiệp Dưới Mưa Hoa Anh Đào Rơi)", "Khép lại chặng đường học tập để vững vàng bước vào cánh cửa tương lai mới.", "三月は 日本の 卒業の 季節です。満開の 桜の 下で、学生たちは 卒業証書を 手に 記念写真を 撮り合います。恩師や 友人への 感謝の 涙と、新しい 夢への 旅立ちの 決意。切なさと 希望が 入り混じる、日本で 最も 美しい 人生の 節目です。"]
];

MORE_N4_TOPICS.forEach(([id, title, summary, content]) => {
  N4_READINGS.push({
    id,
    title,
    level: "N4",
    genre: id.includes("culture") || id.includes("festival") || id.includes("legend") ? "culture" : "daily",
    genreLabel: id.includes("culture") || id.includes("festival") || id.includes("legend") ? "🏛️ Văn hóa & Truyền thuyết" : "🌱 Sinh hoạt & Đời sống",
    author: "OmniLinguist SLA Team",
    readingTime: "3 phút",
    summary,
    content: `${content}\n\n語彙と文法が少しずつ難しくなってきますが、前後の文脈から意味を推測しながら読む習慣をつけましょう。`
  });
});

module.exports = { N4_READINGS };

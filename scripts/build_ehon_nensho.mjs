// scripts/build_ehon_nensho.mjs
// Trình xây dựng kho Ngữ liệu Ehon 3-4 tuổi (年少 Nensho) - 30 Tác phẩm kinh điển quốc dân Nhật Bản
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_FILE = path.resolve(__dirname, '../src/data/corpus/ehon_nensho.js');

const nenshoStories = [
  {
    id: "ehon_nensho_01_darumasan_ga",
    title: "🏮 だるまさんが (Daruma-san ga - Búp Bê Daruma Nghiêng Ngả)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Kagakui Hiroshi (かがくい ひろし)",
    readingTime: "3 phút",
    summary: "Bộ sách tranh thiếu nhi số 1 Nhật Bản giúp bé phát triển phản xạ vận động và bật cười thích thú với các tư thế ngộ nghĩnh của bác lật đật Daruma.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_01_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_01_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：だ・る・ま・さ・ん・が… (Trang 1: Đong đưa nhịp nhàng)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_01_p1.svg",
        content: "だ・る・ま・さ・ん・が……\nひだりに ゆらゆら、みぎに ゆらゆら。\nあかい まあるい からだを ゆらして、\nどてっ！\nころんじゃった！"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：ぷしゅーっ！ (Trang 2: Xẹp lép buồn cười)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_01_p2.svg",
        content: "だ・る・ま・さ・ん・が……\nいきを すって、すって、すって、\nぷしゅーっ！\nぺちゃんこに ちぢんじゃった！\nふふふ、おかしいね。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：びろーん＆にこっ！ (Trang 3: Vươn dài và nụ cười rạng rỡ)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_01_p3.svg",
        content: "だ・る・ま・さ・ん・が……\nびろーーーん！ と おおきく のびたよ！\nそして、さいごは…\nにこっ！\nとびっきりの えがおに なりました！"
      }
    ]
  },
  {
    id: "ehon_nensho_02_darumasan_no",
    title: "👀 だるまさんの (Daruma-san no - Mắt, Tay, Răng Của Daruma)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Kagakui Hiroshi (かがくい ひろし)",
    readingTime: "3 phút",
    summary: "Cùng búp bê Daruma học nhận biết các bộ phận cơ thể: mắt, tay, răng, đuôi qua những biểu cảm hài hước kích thích trí tò mò của trẻ 3 tuổi.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_02_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_02_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：だるまさんの… め！ (Trang 1: Đôi mắt tròn xoe)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_02_p1.svg",
        content: "だ・る・ま・さ・ん・の……\nめ！\nまんまる おめめが ぎょろり！\nパチパチ まばたき、きょろきょろ みてるよ。\nあなたの おめめは どこかな？"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：だるまさんの… て！ (Trang 2: Đôi bàn tay vẫy chào)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_02_p2.svg",
        content: "だ・る・ま・さ・ん・の……\nて！\nちいさな おててが ぱっと でてきたよ。\nバイバイ！ ぱちぱち はくしゅ。\nじょうずに てを たたけるかな？"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：だるまさんの… は！ (Trang 3: Chiếc răng trắng tinh)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_02_p3.svg",
        content: "だ・る・ま・さ・ん・の……\nは！\nいーっ！ と おくちを あけたら、白い はが ぴかぴか！\nごはんを たべたら、はみがき しようね。\nいーっ！"
      }
    ]
  },
  {
    id: "ehon_nensho_03_darumasan_to",
    title: "🍓 だるまさんと (Daruma-san to - Cùng Chơi Với Bác Daruma)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Kagakui Hiroshi (かがくい ひろし)",
    readingTime: "3 phút",
    summary: "Daruma cùng kết bạn và làm quen với quả chuối, quả dâu tây, củ cải. Bé học cách tương tác, bắt tay, ôm chào thân thiện với bạn bè mầm non.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_03_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_03_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：いちごさんと ぺこり (Trang 1: Cúi đầu chào bé dâu tây)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_03_p1.svg",
        content: "だ・る・ま・さ・ん・と……\nまっ赤な いちごさん。\nふたりならんで、ぺこり！\n「こんにちは！」\nじょうずに ごあいさつ できました。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：ばななさんと ぽてっ (Trang 2: Ngã nhào cùng bạn chuối vàng)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_03_p2.svg",
        content: "だ・る・ま・さ・ん・と……\nきいろい ばななさん。\nてを つないで、いっちに、いっちに。\nあしが すべって、ぽてっ！\n「あはは、いたくないよ！」"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：みんなで ぎゅっ！ (Trang 3: Ôm nhau thật chặt ấm áp)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_03_p3.svg",
        content: "だ・る・ま・さ・ん・と……\nりんごさんも、みかんさんも、みんな あつまれ！\nだいすきな おともだちと、\nぎゅーーーっ！\nあったかいね、うれしいね。"
      }
    ]
  },
  {
    id: "ehon_nensho_04_kingyo_ga_nigeta",
    title: "🐟 きんぎょが にげた (Kingyo ga Nigeta - Chú Cá Vàng Trốn Đâu Rồi?)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Gomi Taro (五味 太郎)",
    readingTime: "3 phút",
    summary: "Tác phẩm kinh điển rèn luyện thị giác và khả năng quan sát của danh họa Gomi Taro. Chú cá vàng màu hồng trốn vào bình hoa, rèm cửa, giỏ hoa quả.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_04_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_04_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：きんぎょばちから ぴょん！ (Trang 1: Chú cá vàng nhảy khỏi bể)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_04_p1.svg",
        content: "きんぎょが いました。\nまるい きんぎょばちの なかで、すいすい およいでいました。\nあれれ？ きんぎょが にげた！\nぴょーんと とびだして、どこへ いったのかな？"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：おはなの なかに かくれんぼ (Trang 2: Trốn trong rèm và bình hoa)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_04_p2.svg",
        content: "カーテンのもよう？ ちがうよ。\nあかい おはなの かびんの なか。\nぽつんと あかい まあるい かたち。\n「みーつけた！」\nでも、またまた にげちゃった！"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：いけの おともだちと すいすい (Trang 3: Về với hồ nước cùng đàn bạn)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_04_p3.svg",
        content: "おにわの おおきな いけに たどりつきました。\nたくさんの きんぎょたちが、たのしそうに すいすい およいでいます。\n「もう にげないよ。ここが ぼくの おうち！」\nみんな なかよく くらしましたとさ。"
      }
    ]
  },
  {
    id: "ehon_nensho_05_shirokuma_pancake",
    title: "🥞 しろくまちゃんのほっとけーき (Bánh Kếp Thơm Lừng Của Gấu Trắng)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Wakayama Ken (わかやま けん)",
    readingTime: "4 phút",
    summary: "Kích thích niềm vui nấu nướng và chia sẻ thức ăn. Bé theo chân chú gấu trắng đong bột, quấy sữa, rán bánh xèo xèo và cùng bạn thưởng thức.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/shirokuma_pancake.jpg",
    imageUrl: "/images/ehon/shirokuma_pancake.jpg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：ボールに こむぎこ、さらさら (Trang 1: Đong bột, đập trứng, quấy đều)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_05_p1.svg",
        content: "わたし、ほっとけーきを つくるの。\nボールに こむぎこを いれます。さらさら さら。\nたまごを ぽんと わって、ぎゅうにゅうを とくとく。\nあわだてきで まぜましょう。\nぐるぐる ぐるぐる まぜましょう。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：ぽたあん、ぴちぴち、やけたかな？ (Trang 2: Đổ bánh chảo nóng xèo xèo)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_05_p2.svg",
        content: "フライパンに たねを すくって、ぽたあん。\nどろどろ ぴちぴち ぷつぷつ。\nあわが ぷくっと でてきたら、フライがえしで よいしょ、ぺたん！\nこんがり おいしそうな きつねいろに やけました！"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：こぐまちゃんと おいしいね！ (Trang 3: Cùng bạn gấu nâu chia sẻ bánh ngọt)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_05_p3.svg",
        content: "おさらに つみかさねて、バターと シロップを たっぷり。\nおともだちの こぐまちゃんが やってきました。\n「おいしいね！ もぐもぐ、ぺろり。」\nたべおわったら、おさらも ふたりで きれいに あらいました。"
      }
    ]
  },
  {
    id: "ehon_nensho_06_kogumachan_arigato",
    title: "🐻 こぐまちゃん ありがとう (Gấu Con Biết Nói Lời Cảm Ơn)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Wakayama Ken (わかやま けん)",
    readingTime: "3 phút",
    summary: "Dạy trẻ 3 tuổi kỹ năng giao tiếp lịch sự: biết mỉm cười nói lời cảm ơn khi nhận quà, khi được giúp đỡ nhặt đồ chơi, gắn kết tình cảm bạn bè.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_06_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_06_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：おもちゃを どうぞ (Trang 1: Nhận đồ chơi và nói lời cảm ơn)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_06_p1.svg",
        content: "こぐまちゃんが くるまで あそんでいます。\nおともだちが「あかい くるま、どうぞ」と かしてくれました。\nこぐまちゃんは にこにこ えがおで いいました。\n「ありがとう！」\nことばに すると、こころが ぽかぽか あたたかくなります。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：ころんだ ときも てを つないで (Trang 2: Giúp bạn đứng dậy)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_06_p2.svg",
        content: "おにわで かけっこ、いっちに、いっちに。\nあ、ころんじゃった！ いたいの いたいの とんでいけー。\nしろくまちゃんが かけよって、てを かしてくれました。\n「だいじょうぶ？」\n「うん、たすけてくれて ありがとう！」"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：おかあさんの ごはんに ありがとう (Trang 3: Cảm ơn bữa cơm ấm áp của mẹ)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_06_p3.svg",
        content: "おうちに かえると、いい におい。\nおかあさんが あたたかい スープを つくってくれました。\nりょうてを あわせて「いただきます！」\nたべおわったら「ごちそうさまでした、ありがとう！」\nまいにち ありがとうが いっぱいです。"
      }
    ]
  },
  {
    id: "ehon_nensho_07_nenaiko_dareda",
    title: "👻 ねないこ だれだ (Ai Chưa Chịu Đi Ngủ Nào?)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Sena Keiko (せな けいこ)",
    readingTime: "3 phút",
    summary: "Tác phẩm gối đầu giường kinh điển của nghệ sĩ cắt giấy Sena Keiko. Nhắc nhở các bé đi ngủ đúng giờ khi đêm về và đồng hồ điểm 9 giờ.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_07_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_07_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：とけいが ボーンと なりました (Trang 1: Đồng hồ điểm chuông 9 giờ đêm)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_07_p1.svg",
        content: "夜の くじです。ボーン、ボーン。\nとけいが なりました。\nこんな じかんに おきているのは だれだ？\nこいぬも、こねこも、すやすや ねむっています。\nことりも すのなかで、めを とじました。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：夜の せかいの おきゃくさま (Trang 2: Khách cú mèo và bóng đêm ghé thăm)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_07_p2.svg",
        content: "ふくろうが ほーほー。\nくろねこが めを きらきら。\n夜は おばけの じかんです。\nふわふわ、ふわふわ、おばけが そらをとんで やってきます。\n「まだ ねていない子は だれかな？」"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：おばけに なっちゃうよ！ (Trang 3: Đi ngủ ngoan kẻo hóa thành ma nhỏ bay lên trời)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_07_p3.svg",
        content: "夜ふかししていると、からだが ふわーり。\nおばけの せかいへ つれていかれちゃうかも！\n「早く おふとんに 入って、おやすみなさい。」\nめを つむれば、たのしい ゆめの なか。\nすやすや、すやすや、よいこの じかんです。"
      }
    ]
  },
  {
    id: "ehon_nensho_08_fuusen_neko",
    title: "🎈 ふうせんねこ (Mèo Con Phồng Như Quả Bóng Bay)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Sena Keiko (せな けいこ)",
    readingTime: "3 phút",
    summary: "Bài học tâm lý đáng yêu dành cho trẻ hay hờn dỗi tuổi lên 3. Mèo con hờn dỗi phồng má to như quả bóng bay và bay vút lên ngọn cây.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_08_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_08_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：ぷりぷり おこりんぼ (Trang 1: Mèo con hờn dỗi phồng má)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_08_p1.svg",
        content: "こねこちゃんは、すぐに ぷりぷり おこります。\n「おやつは まだ？」ぷーっ！\n「おもちゃ かたづけて」ぷーっ！\nほっぺたを ふくらませて、口を とがらせます。\nぷくーっ、ぷくーっ！"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：おそらへ ふわふわ (Trang 2: Bay bổng lên trời cao)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_08_p2.svg",
        content: "おこりすぎて、からだが どんどん ふくらんで……\nふうせんに なっちゃった！\nふわふわ、ふわふわ。\nあしが じめんから はなれて、やねの うえまで とんでいきました。\n「あれれ？ おりられないよー！」"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：にっこり えがおで もとどおり (Trang 3: Mỉm cười vui vẻ hạ cánh an toàn)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_08_p3.svg",
        content: "おかあさんが 手を ふって いいました。\n「にこにこ わらえば、おりてこられるよ。」\nこねこちゃんは ぷりぷりを やめて、にこっ！\nすると、ふうせんの くうきが ぬけて、しゅるしゅるしゅる。\nおかあさんの うでの なかに とびこみました。"
      }
    ]
  },
  {
    id: "ehon_nensho_09_iyada_iyada",
    title: "🙅 いやだ いやだ (Không Chịu Đâu, Không Chịu!)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Sena Keiko (せな けいこ)",
    readingTime: "3 phút",
    summary: "Đồng cảm với giai đoạn khủng hoảng tuổi lên ba của trẻ nhỏ. Khi bé nói 'Không chịu', mẹ, búp bê, đôi tất cũng nói 'Không chịu' để bé tự suy ngẫm.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_09_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_09_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：なんでも「いやだ！」(Trang 1: Cái gì cũng 'Không chịu')",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_09_p1.svg",
        content: "るるちゃんは、なんでも「いやだ！」と いいます。\nあさの おきがえ「いやだ！」\nごはんの じかん「いやだ！」\nおさんぽも「いやだ、いやだ！」\nくちを まげて、てを ぶんぶん ふります。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：くつしたも「いやだ！」(Trang 2: Đôi tất và chiếc áo cũng 'Không chịu')",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_09_p2.svg",
        content: "すると、あかい くつしたが いいました。\n「わたしも はかれるの、いやだ！」ぴょーんと にげました。\nくまの ぬいぐるみも「だっこされるの、いやだ！」\nおひさままでも「てらすの、いやだ！」と くもの かげへ。\nみんなが「いやだ」と いったら、どうしよう？"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：いいよ、いいよ、だいすき！ (Trang 3: Cùng ngoan ngoãn ôm mẹ nào)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_09_p3.svg",
        content: "るるちゃんは びっくりして、なみだを ぽろり。\n「いやだ、やめる！ みんな あそぼう！」\nくつしたも もどってきて、おひさまも にこにこ。\n「いいよ、いいよ！」\nおかあさんに ぎゅーっと だきしめられて、にっこり えがおに なりました。"
      }
    ]
  },
  {
    id: "ehon_nensho_10_kuttsuita",
    title: "🤝 くっついた (Kuttsuita - Dính Vào Nhau Nào!)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Miura Taro (三浦 太郎)",
    readingTime: "3 phút",
    summary: "Trò chơi áp má yêu thương giữa bố, mẹ và em bé. Câu chữ lặp lại ngọt ngào mang lại cảm giác an toàn và gắn kết gia đình trọn vẹn.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_10_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_10_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：きんぎょさんと ことりさん (Trang 1: Đôi cá vàng và chim con chạm mỏ)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_10_p1.svg",
        content: "きんぎょさんと、きんぎょさんが……\nくちばしを ちかづけて、\nくっついた！\nことりさんと、ことりさんが……\nちゅっちゅっ、\nくっついた！"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：おさるさんと ぞうさん (Trang 2: Khỉ con và voi con chạm má)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_10_p2.svg",
        content: "おさるさんと、おさるさんが……\nほっぺと ほっぺを、\nくっついた！\nぞうさんと、ぞうさんが……\nながい おはなを くるん、\nくっついた！"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：わたしと おかあさんと おとうさん (Trang 3: Cả nhà cùng áp má thơm lừng)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_10_p3.svg",
        content: "わたしと、おかあさんが……\nほっぺを ぴたっ、くっついた！\nおとうさんも やってきて、\nりょうほうの ほっぺに……\nくっついた！\nしあわせの ぬくもりです。"
      }
    ]
  },
  {
    id: "ehon_nensho_11_gatan_goton",
    title: "🚂 がたんごとん がたんごとん (Xình Xịch Xình Xịch Đoàn Tàu Nhỏ)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Yasuo Anno (安西 水丸)",
    readingTime: "3 phút",
    summary: "Đoàn tàu hỏa hơi nước màu đen chạy xình xịch đón bình sữa, chiếc thìa, quả táo, đĩa ăn dặm rồi đưa vào bụng no nê của bé con.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_11_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_11_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：きしゃが はしるよ (Trang 1: Đoàn tàu nhỏ lăn bánh đón bình sữa)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_11_p1.svg",
        content: "がたんごとん、がたんごとん。\nまっくろな きしゃが はしってきます。\n「のせてくださーい！」\nほにゅうびんが てを ふっています。\nしゅっしゅっぽっぽ、のせました。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：スプーンさんと りんごさん (Trang 2: Đón chiếc thìa và quả táo đỏ)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_11_p2.svg",
        content: "がたんごとん、がたんごとん。\n「のせてくださーい！」\nスプーンさんと、おさらさんが のりました。\nつぎは まっかな りんごさんと、バナナさん。\n客車は だんだん にぎやかに なります。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：しゅうてん、ぼくの おなか！ (Trang 3: Ga cuối là chiếc bụng ngoan của bé)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_11_p3.svg",
        content: "がたんごとん、がたんごとん。\nしゅうてん駅に とうちゃくです。\n「いただきます！」\nみんな ぼくの おくちの なかへ。\nもぐもぐ、ごっくん！\nおなかいっぱいに なりましたとさ。"
      }
    ]
  },
  {
    id: "ehon_nensho_12_obento_bus",
    title: "🍱 おべんとうバス (Chuyến Xe Buýt Hộp Cơm Trưa)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Masuda Yuko (真珠 まりこ)",
    readingTime: "3 phút",
    summary: "Xe buýt đỏ tươi đón bạn cơm nắm, trứng cuộn, xúc xích bạch tuộc, bông cải xanh. Trẻ học cách điểm danh 'Có ạ!' vui tươi hào hứng.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_12_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_12_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：あかい バスの しゅっぱつ (Trang 1: Xe buýt đỏ đón nắm cơm)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_12_p1.svg",
        content: "ぶっぶー！ まっかな おべんとうバスが やってきました。\n「おにぎりさーん！」\n「はーい！」\nさんかく おにぎりさんが、てを あげて バスに のりこみました。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：たまごやきさんと タコさん (Trang 2: Đón trứng cuộn và xúc xích bạch tuộc)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_12_p2.svg",
        content: "ぶっぶー！\n「たまごやきさーん！」「はーい！」\n「タコさんウインナーさーん！」「はーい！」\n「ブロッコリーさーん、トマトさーん！」「はーい！」\nみんな じゅんばんに せきに すわります。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：しゅっぱつ しんこう、いただきます！ (Trang 3: Đầy ắp khoang xe sẵn sàng thưởng thức)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_12_p3.svg",
        content: "みんな そろったかな？\n「ぜんいん のりこみましたー！」\nしゅっぱつ しんこう、ぶっぶー！\nこうえんに ついたら、おべんとうばこを ぱかっ。\nみんなで なかよく「いただきます！」"
      }
    ]
  },
  {
    id: "ehon_nensho_13_zoukun_no_sanpo",
    title: "🐘 ぞうくんのさんぽ (Chuyến Đi Dạo Của Chú Voi Con)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Nakano Hirotaka (なかの ひろたか)",
    readingTime: "4 phút",
    summary: "Chú voi con vui tính đi dạo rủ hà mã, cá sấu, rùa cõng chồng lên lưng nhau. Bài học tinh thần đồng đội nhẹ nhàng và cái kết ùa vào hồ nước mát lạnh.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_13_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_13_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：いい おてんき、さんぽへ いこう (Trang 1: Voi con vui vẻ đi dạo rủ hà mã)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_13_p1.svg",
        content: "きょうは いいてんき。\nぞうくんは ごきげんで さんぽに でかけました。\nとちゅうで カバくんに であいました。\n「カバくん、いっしょに いこう！」\n「ぼくを せなかに のせてくれるなら いいよ。」\nぞうくんは カバくんを よいしょと のせました。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：わにくんも かめくんも つみかさね (Trang 2: Cõng cá sấu và rùa chồng tầng)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_13_p2.svg",
        content: "あるいていくと、わにくんが いました。\n「ぼくも のせてよ！」カバくんの うえに よいしょ。\nこんどは かめくんが いました。\n「ぼくも のせてよ！」わにくんの うえに ちょこん。\nぐらぐら、ぐらぐら。おもたいな、たかいな！"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：いけの なかへ どっしゃーん！ (Trang 3: Rơi tủm vào hồ nước mát rượi)",
        readingTime: "2 phút",
        imageUrl: "/images/ehon/ehon_nensho_13_p3.svg",
        content: "おっとっと！ 足が もつれて、\nどっしゃーーーん！\nみんなそろって いけの なかへ おっこちました。\n「ぷはーっ、みずあそびは きもちいいね！」\nみんなで わらいながら、なかよく およぎましたとさ。"
      }
    ]
  },
  {
    id: "ehon_nensho_14_nontan_buranko",
    title: "🐱 ノンタン ぶらんこのせて (Mèo Nontan Tập Xếp Hàng Đu Quay)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Kiyono Sachiko (キヨノ サチコ)",
    readingTime: "3 phút",
    summary: "Dạy trẻ mầm non văn hóa nhường nhịn đồ chơi chung và học đếm từ 1 đến 10 để đến lượt bạn chơi xích đu trong công viên.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_14_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_14_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：ぶらんこ ひとりじめ (Trang 1: Nontan giữ xích đu chơi một mình)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_14_p1.svg",
        content: "ノンタンが ぶらんこを こいでいます。\nゆーらり、ゆーらり。\n「ノンタン、ぶらんこ かして！」\nうさぎさんや くまさんが やってきました。\n「だめ、だめ！ ぼくが まだ のってるんだもん。」"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：いっしょに １から １０まで かぞえよう (Trang 2: Cùng đếm từ 1 đến 10)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_14_p2.svg",
        content: "「じゃあ、１０まで かぞえたら かわるよ。」\nみんなで いっしょに かぞえます。\n「いち、に、さん、し、ご、ろく、なな、はち、きゅう、じゅう！」\n「おまけの おまけの きしゃぽっぽ、ぽーっとなったら かわりましょ！」"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：つぎの おともだちへ どうぞ！ (Trang 3: Nhường bạn và cùng nhau mỉm cười)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_14_p3.svg",
        content: "ぽーっ！\nノンタンは ぴょんと ぶらんこから おりて、\n「はい、どうぞ！」と うさぎさんに ゆずりました。\nじゅんばんこに あそぶと、もっと たのしいね。\nみんな ニコニコ なかよしです。"
      }
    ]
  },
  {
    id: "ehon_nensho_15_nontan_oyasumi",
    title: "🌙 ノンタン おやすみなさい (Mèo Nontan Chúc Ngủ Ngon)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Kiyono Sachiko (キヨノ サチコ)",
    readingTime: "3 phút",
    summary: "Nontan không muốn ngủ bèn ra ngoài tìm bạn chơi ban đêm, nhưng thỏ, gấu đều đã ngủ say, chỉ gặp bác cú mèo thức trắng.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_15_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_15_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：まだ ねむくないよ (Trang 1: Nontan trốn ngủ ra ngoài tìm bạn)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_15_p1.svg",
        content: "夜に なっても、ノンタンは めが ぱっちり。\n「ぼく、まだ ねむくないもん！ あそびに行こう。」\nうさぎさんの 家を トントン。\n「ねむいよー、もう ねるじかんだよ。」うさぎさんは ぐうぐう。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：夜の ふくろうさんと キャッチボール (Trang 2: Chơi bóng trong bóng tối với bác cú)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_15_p2.svg",
        content: "森の なかで、ふくろうさんに であいました。\n「あそぼう！」と ボールなげ。\nでも、まっくらで ボールが みえません。\n木に ぶつかって、いたたたた！\n「やっぱり 夜は ねる じかんだね。」"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：おふとんの なかで すやすや (Trang 3: Về nhà chui vào chăn ấm ngủ ngoan)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_15_p3.svg",
        content: "おうちへ かえって、あたたかい おふとんへ。\nあくびが ふわわー。\n「おかあさん、おやすみなさい。」\nあしたも いっぱい あそぼうね。\nすやすや、すやすや、いいゆめ みてね。"
      }
    ]
  },
  {
    id: "ehon_nensho_16_nontan_hamigaki",
    title: "🪥 ノンタン はみがき はーみー (Mèo Nontan Đánh Răng Sạch Bóng)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Kiyono Sachiko (キヨノ サチコ)",
    readingTime: "3 phút",
    summary: "Rèn luyện thói quen đánh răng hàng ngày cho trẻ nhỏ qua điệu hát vui nhộn 'Ha-mii, ha-mii, chika-chika shaka-shaka' bảo vệ răng xinh.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_16_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_16_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：ごはんを たべたら はみがき (Trang 1: Ăn xong chuẩn bị bàn chải xinh)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_16_p1.svg",
        content: "おいしい ごはんを たべおわりました。\n「はみがき はーみー、しゅっしゅっ しゅっ！」\nノンタンが はぶらしを もって やってきました。\nうさぎさんも、ぶたさんも、みんな はみがき じゅんび。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：うえの は、したの は、シャカシャカ (Trang 2: Chải răng trên, răng dưới xì xào)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_16_p2.svg",
        content: "「いーっ！」のおくちで まえの はを シャカシャカ。\n「あーっ！」のおくちで おくの はを シュッシュッ。\nむしばいきんを やっつけろ！\nぶくぶく、ぺっ！とおくちを ゆすぎます。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：まっ白な はが ピッカピカ！ (Trang 3: Răng trắng tinh tỏa sáng rạng rỡ)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_16_p3.svg",
        content: "かがみを みてごらん。\n白い はが ピカピカ、キラキラ！\n「きもちいいね、すっきりしたね！」\nみんなで じまんの えがおを 見せあいました。"
      }
    ]
  },
  {
    id: "ehon_nensho_17_nontan_oshikko",
    title: "🚽 ノンタン おしっこ しーしー (Mèo Nontan Tự Đi Vệ Sinh Bô)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Kiyono Sachiko (キヨノ サチコ)",
    readingTime: "3 phút",
    summary: "Hỗ trợ phụ huynh huấn luyện trẻ tự đi vệ sinh (Toilet Training). Học cách nhận biết cơn buồn tiểu và ngồi bô đúng cách.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_17_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_17_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：もじもじ、おしっこ でそう！ (Trang 1: Nhấp nhổm buồn tiểu)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_17_p1.svg",
        content: "あそんでいる ノンタンが、もじもじ、もじもじ。\n「あれれ？ おしっこかな？」\nぶたさんは おまるに すわって、しーしー。\nくまさんも トイレで、しーしー。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：トイレへ いこう、しーしー (Trang 2: Chạy vào nhà vệ sinh ngồi bô)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_17_p2.svg",
        content: "ノンタンも トイレへ いそげ！\nズボンを ぬいで、おまるに ちょこん。\n「でるかな？ でるかな？」\nしーしー、ぽとん！\nじょうずに おしっこが でました！"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：パンツを はいて すっきり！ (Trang 3: Kéo quần lên và rửa tay sạch sẽ)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_17_p3.svg",
        content: "おみずを ジャーと ながして、てを あらいましょう。\nかっこいい おにいちゃんパンツを はいて、\n「できたよ、やったー！」\nすっきり さわやか、また たのしく あそぼうね！"
      }
    ]
  },
  {
    id: "ehon_nensho_18_watashi_no_onepiece",
    title: "👗 わたしのワンピース (Chiếc Váy Hoa Biến Hình Kỳ Diệu)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Nishimaki Kayako (にしまき かやこ)",
    readingTime: "4 phút",
    summary: "Thỏ trắng may chiếc váy trắng tinh. Khi đi qua cánh đồng hoa, cơn mưa, vườn hạt dẻ, bầu trời sao, chiếc váy lập tức biến hóa hoa văn lộng lẫy.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_18_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_18_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：まっ白な ワンピース (Trang 1: Thỏ trắng may chiếc váy tinh khôi)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_18_p1.svg",
        content: "まっ白な きれを、ミシンで カタカタ カタカタ。\nうさぎさんが ワンピースを つくりました。\n「まっ白な ワンピース、わたしに にあうかしら？」\nるんるん きぶんの おさんぽです。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：お花ばたけと みずたまもよう (Trang 2: Đi qua đồng hoa và hạt mưa)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_18_p2.svg",
        content: "お花ばたけを とおると、ワンピースが 花もように！\nあめが ざーざー ふってきたら、みずたまもように！\nくさのみばたけを とおると、くさのもように！\nくるくる、もようが かわって ふしぎだね。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：お空をとんで ほしのもよう (Trang 3: Bay lên trời mang hoa văn ngàn sao)",
        readingTime: "2 phút",
        imageUrl: "/images/ehon/ehon_nensho_18_p3.svg",
        content: "ことりさんの もように なって、パタパタ そらをとびました。\n夜に なったら、きらきら おほしさまの もように なりました！\n「ラララン、ロロロン、わたしに にあうかしら？」\nせかいで いちばん すてきな ワンピースです。"
      }
    ]
  },
  {
    id: "ehon_nensho_19_yasaisan",
    title: "🥕 やさいさん (Bác Củ Quả Dưới Lòng Đất Ơi!)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Tupera Tupera (ツペラ ツペラ)",
    readingTime: "3 phút",
    summary: "Trò chơi kéo củ quả giấu mình dưới đất: cà rốt, củ cải, hành tây, khoai lang. Bé hào hứng hét to 'Bật lên nào, pốttt!' cùng thiên nhiên tươi đẹp.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_19_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_19_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：はたけの つちから はっぱが ぴょこ (Trang 1: Chiếc lá nhú trên luống đất)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_19_p1.svg",
        content: "はたけの つちから、緑の はっぱが ぴょこっ。\n「やさいさん、やさいさん、だあれ？」\nくきを しっかり つかんで、\n「すっぽーーーん！」"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：にんじんさんと じゃがいもさん (Trang 2: Nhổ củ cà rốt và khoai tây)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_19_p2.svg",
        content: "まっかな にんじんさんでした！\nつぎの はっぱも、すっぽーーーん！\nころころ じゃがいもさんでした！\n「土の なかには、おいしい たからものが いっぱいだね。」"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：おおきな だいこんさん、ぬけた！ (Trang 3: Củ cải trắng tinh bật lên đầy hân hoan)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_19_p3.svg",
        content: "ギザギザの はっぱを、うんとこしょ、どっこいしょ！\n「ずっぼーーーん！」\nおおきな 白い だいこんさんでした！\nみんなで あらって、サラダや スープで たべましょう。\nごちそう、いっぱい！"
      }
    ]
  },
  {
    id: "ehon_nensho_20_kudamono",
    title: "🍎 くだもの (Trái Cây Thơm Ngon Mời Bé Ăn)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Hirayama Kazuko (平山 和子)",
    readingTime: "3 phút",
    summary: "Tranh tả thực tuyệt mỹ những quả dưa hấu, đào, nho, táo mọng nước được gọt vỏ bày đĩa tinh tế cùng lời mời ngọt ngào 'Xin mời bé ăn'.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_20_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_20_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：すいかと もも (Trang 1: Dưa hấu đỏ và đào hồng thơm lừng)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_20_p1.svg",
        content: "まんまるい、しましまの すいか。\nざくっと きったら、まっ赤な みが ぎっしり。\n「さあ、どうぞ。」\nピンクの うぶげの もも。\nかわを むいて、あまい かおり。\n「さあ、どうぞ。」"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：ぶどうと りんご (Trang 2: Chùm nho tím mọng và táo giòn ngọt)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_20_p2.svg",
        content: "ひと粒 ひと粒 みずみずしい、むらさきの ぶどう。\nつるんと かわを むいて、\n「さあ、どうぞ。」\nまっ赤な りんごは、うさぎさんの かたちに。\nしゃきしゃき、おいしいね。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：みかんと バナナ (Trang 3: Quýt vàng dễ bóc và chuối chín)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_20_p3.svg",
        content: "てで むける、きいろい みかん。\nふさを ひとつずつ わけあって、\n「さあ、どうぞ。」\nバナナも かわを ぺろり。\nあまくて おいしい くだもの、みんなで たべようね。"
      }
    ]
  },
  {
    id: "ehon_nensho_21_jaajaa_biribiri",
    title: "🌊 じゃあじゃあ びりびり (Âm Thanh Rì Rào Xào Xạc)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Matsutani Miyoko (まつたに みよこ)",
    readingTime: "3 phút",
    summary: "Thế giới âm thanh quen thuộc kích thích phát triển thính giác và ngôn ngữ cho bé: vòi nước rì rào, xé giấy xoẹt xoẹt, còi xe bíp bíp.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_21_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_21_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：みずと かみ (Trang 1: Vòi nước chảy và tiếng xé giấy)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_21_p1.svg",
        content: "みず……\nじゃあ じゃあ じゃあ。\nじゃぐちから ながれるよ。\nかみ……\nびり びり びり びり。\nてで やぶると たのしいね。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：じどうしゃと そうじき (Trang 2: Xe hơi gầm rú và máy hút bụi)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_21_p2.svg",
        content: "じどうしゃ……\nぶーん ぶーん ぶーん。\nクラクションが ぷっぷー！\nそうじき……\nぶおー ん ぶおー ん。\nおへやを きれいに おそうじ。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：いぬと あかちゃん (Trang 3: Cún con sủa gâu gâu và em bé cười)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_21_p3.svg",
        content: "こいぬ……\nわん わん わん わん。\nしっぽを ふりふり。\nあかちゃん……\nえーん えーん！\nだっこされたら、きゃっきゃっ にこにこ！"
      }
    ]
  },
  {
    id: "ehon_nensho_22_inai_inai_baa",
    title: "🙈 いないいないばあ (Ú Òa Cùng Muôn Thú)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Matsutani Miyoko (まつたに みよこ)",
    readingTime: "3 phút",
    summary: "Sách tranh mầm non bán chạy nhất lịch sử xuất bản Nhật Bản (hơn 7 triệu bản). Trò chơi ú òa kinh điển gắn bó giữa người lớn và trẻ nhỏ.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_22_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_22_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：こねこと ことりの ばあ！ (Trang 1: Mèo con và chim nhỏ ú òa)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_22_p1.svg",
        content: "いない、いない……\nばあ！\nこねこちゃんが、おててを はなして にゃあ！\nいない、いない……\nばあ！\nことりさんが、つばさを ひろげて ぴぴっ！"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：くまさんと きつねさん (Trang 2: Gấu to và cáo nâu mở mắt)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_22_p2.svg",
        content: "いない、いない……\nばあ！\nくまさんが おおきな おててを ぱっ！\nきつねさんも おめめを くりくり、\nばあ！\nみんな えがおに なりました。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：のんちゃんも、ばあ！ (Trang 3: Bé con mở tay tươi cười rạng rỡ)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_22_p3.svg",
        content: "いない、いない……\nばあ！\nのんちゃんも おててを ぱっ！\nとびっきりの かわいい えがお。\nみんな いっしょに、にっこり わらいました。"
      }
    ]
  },
  {
    id: "ehon_nensho_23_ponpon_pokopoko",
    title: "🥁 ぽんぽんポコポコ (Chiếc Bụng Tròn No Căng)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Hasegawa Yoshifumi (長谷川 義史)",
    readingTime: "3 phút",
    summary: "Vỗ nhẹ chiếc bụng no tròn kêu bồm bộp vui nhộn của gấu, lợn con, thỏ và em bé sau khi được ăn no nê những món ngon mẹ nấu.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_23_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_23_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：こぶたの おなか (Trang 1: Bụng chú heo con no tròn)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_23_p1.svg",
        content: "おなかいっぱい たべたよ。\nこぶたちゃんの おなか、\nぽんぽん ポコポコ、ぽんポコポコ！\nたいこみたいに いいおとが なるよ。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：たぬきさんと くまさん (Trang 2: Tanuki và gấu vỗ bụng đánh trống)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_23_p2.svg",
        content: "たぬきさんの まあるい おなか、\nぽんぽこ ぽんぽん！\nくまさんの でっかい おなか、\nドンドン ポコポコ！\nみんなの おなか、ごちそうが いっぱい。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：ぼくの おなかも ぽんぽん！ (Trang 3: Bé xoa bụng tròn ấm êm)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_23_p3.svg",
        content: "ぼくの おなかも、まあるく ふくらんで、\nぽんぽん ポコポコ！\n「ごちそうさまでした！」\nおかあさんに なでなで してもらって、\nぽかぽか ぐっすり おひるねです。"
      }
    ]
  },
  {
    id: "ehon_nensho_24_otsukisama_konbanwa",
    title: "🌕 おつきさま こんばんは (Cháu Chào Ông Trăng Tròn)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Hayashi Akiko (林 明子)",
    readingTime: "3 phút",
    summary: "Vầng trăng vàng dịu dàng nhô lên trên nóc nhà. Đám mây bay ngang che khuất trăng rồi trôi đi, để lại nụ cười sáng trong soi chiếu giấc ngủ của bé.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_24_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_24_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：夜の やねの うえに (Trang 1: Vầng trăng vàng mọc trên mái ngói)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_24_p1.svg",
        content: "よるに なりました。\nそらが くらくなって、やねの うえが あかるくなります。\nぽっかり、まんまる おつきさまが でてきました。\n「おつきさま、こんばんは！」"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：くもさんが やってきて (Trang 2: Đám mây che khuất vầng trăng)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_24_p2.svg",
        content: "あれれ？ くろい くもさんが やってきました。\n「だめだめ くもさん、おつきさまを かくさないで！」\nおつきさまの おかおが みえなくなっちゃった。\nくもさん、ちょっと あっちへ いって。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：にっこり おつきさま (Trang 3: Trăng rằm mỉm cười tỏa sáng)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_24_p3.svg",
        content: "くもさんが「ごめんね」と とおりすぎました。\nおつきさまが また でてきて、にっこり えがお！\nやさしい ひかりが、まちじゅうを てらします。\n「おつきさま、また あしたね。おやすみなさい。」"
      }
    ]
  },
  {
    id: "ehon_nensho_25_pyoon",
    title: "🐸 ぴょーん (Cùng Bật Nhảy Cao Lên Nào!)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Matsuoka Tatsuhide (まつおか たつひで)",
    readingTime: "3 phút",
    summary: "Kích thích vận động thân thể. Ếch con, cào cào, thỏ trắng, mèo con và em bé cùng chùng chân lấy đà bật nhảy vút lên trời xanh.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_25_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_25_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：かえるが… ぴょーん！ (Trang 1: Ếch xanh lấy đà bật nhảy)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_25_p1.svg",
        content: "かえるが……\nあしを ちぢめて、ちからを ためて、\nぴょーーーん！\nたかく たかく とんだよ！"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：うさぎも バッタも ぴょーん！ (Trang 2: Thỏ trắng và cào cào cùng nhảy)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_25_p2.svg",
        content: "バッタが…… ぴょーーーん！\nうさぎが…… ぴょーーーん！\nいぬも、ねこも、みんなそろって、\nぴょーーーん！\nからだが かるーく うかびます。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：わたしも いっしょに ぴょーん！ (Trang 3: Bé cũng bật nhảy cười vang)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_25_p3.svg",
        content: "わたしも……\nひざを まげて、せーの！\nぴょーーーーーん！\nばんざいして ジャンプ！\nあー、たのしかった！"
      }
    ]
  },
  {
    id: "ehon_nensho_26_appuppu",
    title: "😆 あっぷっぷ (Trò Chơi Nhịn Cười Mắc Cỡ)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Nakagawa Rieko (中川 李枝子)",
    readingTime: "3 phút",
    summary: "Trò chơi dân gian Darumasan ninaru nhịn cười phồng má. Bé thi xem ai nhịn cười được lâu hơn cùng khỉ con, cua con và chú hề.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_26_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_26_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：わらったら まけよ (Trang 1: Bắt đầu thi không được cười)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_26_p1.svg",
        content: "だるまさん、だるまさん、にらめっこしましょ。\nわらうと まけよ、あっぷっぷ！\nおくちを むぎゅっと むすんで、\nめを まあるくして がまん、がまん。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：おさるの おかしな かお (Trang 2: Mặt méo mó của bạn khỉ con)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_26_p2.svg",
        content: "おさるさんが、べろを べーっ！\nほっぺを ぴっぱって、おかしな かお。\n「くすっ、あははは！」\nこらえきれずに わらっちゃった！"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：みんなで おおわらい (Trang 3: Cùng cười thả ga vui sướng)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_26_p3.svg",
        content: "もういっかい！ あっぷっぷ！\nこんどは みんなで へんな かお。\nわらいごえが お部屋じゅうに ひびきます。\nわらうと げんきが わいてくるね！"
      }
    ]
  },
  {
    id: "ehon_nensho_27_ooki_chiisai",
    title: "🐘 おおきい ちいさい (To Khổng Lồ Và Nhỏ Xíu Xiu)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Tupera Tupera (ツペラ ツペラ)",
    readingTime: "3 phút",
    summary: "Khái niệm so sánh kích thước trực quan cho trẻ 3 tuổi: chú voi to đùng bên chú kiến tí hon, quả dưa hấu to bự bên hạt đậu nhỏ xinh.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_27_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_27_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：ぞうと あり (Trang 1: Voi to lớn và kiến bé xíu)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_27_p1.svg",
        content: "おおきな、おおきな、ぞうさん。\nのっしのっし、やまみたい。\nちいさな、ちいさな、ありさん。\nちょこちょこ、つちの うえ。\nどっちが おおきいかな？"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：すいかと まめ (Trang 2: Quả dưa hấu và hạt đỗ)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_27_p2.svg",
        content: "どーんと おもたい おおきな すいか。\nころんと ちいさな みどりの おまめ。\nおおきい りんご、ちいさい さくらんぼ。\nならべて くらべて みようね。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：ぼくの おおきな ゆめ (Trang 3: Cậu bé nhỏ có ước mơ to lớn)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_27_p3.svg",
        content: "ぼくの からだは まだ ちいさいけれど、\nごはんと やさいを もりもり たべて、\nおとうさんみたいに おおきく なるよ！\nゆめは うちゅうより おおきいよ！"
      }
    ]
  },
  {
    id: "ehon_nensho_28_korokorokoro",
    title: "🔴 ころころころ (Những Viên Bi Tròn Lăn Bập Bênh)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Motonaga Sadamasa (元永 定正)",
    readingTime: "3 phút",
    summary: "Nghệ thuật trừu tượng thị giác rực rỡ. Những viên bi sắc màu lăn qua bậc thang, vượt cầu vồng, chui qua hầm tối rồi rơi vào đích an toàn.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_28_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_28_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：たまが ころがる (Trang 1: Những viên bi lăn bập bênh)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_28_p1.svg",
        content: "あかい たま、あおい たま、きいろい たま。\nころ ころ ころ。\nさかみちを なかよく ころがります。\nすぴーど あっぷ、ころころころ！"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：かいだんと はしを わたって (Trang 2: Lăn qua bậc thang và vòm cầu vồng)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_28_p2.svg",
        content: "かいだんを ぽん ぽん ぽん！\nにじの はしを すーーーっ。\nあらしの くもを くぐりぬけ、\nでこぼこ みちも へっちゃらさ。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：みんな まとまって ゴール！ (Trang 3: Về đích tụ hội đầy sắc màu)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_28_p3.svg",
        content: "すぽっ！\nみんなそろって あなの なかへ。\n「とうちゃくー！」\nいろとりどりの たまが、なかよく ならんで ひとやすみ。\nまた ころがろうね！"
      }
    ]
  },
  {
    id: "ehon_nensho_29_moko_mokomoko",
    title: "🌱 もこ もこもこ (Thế Giới Bồng Bềnh Tượng Thanh)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Tanikawa Shuntaro (谷川 俊太郎)",
    readingTime: "3 phút",
    summary: "Kiệt tác ngôn ngữ thi vị của nhà thơ quốc dân Tanikawa Shuntaro. Những đụn đất bồng bềnh phồng to, xẹp nhỏ đánh thức trí tưởng tượng nguyên sơ của trẻ.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_29_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_29_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：しずかな じめんから (Trang 1: Đất êm dịu nhú lên đụn nhỏ)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_29_p1.svg",
        content: "しーん……\nしずかな、しずかな、ばしょ。\nもこ。\nじめんから、なにかが もこっ。\nもこ もこ もこ。"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：にょき にょき おおきく (Trang 2: Vươn dài nhú cao bồng bềnh)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_29_p2.svg",
        content: "にょき！\nたかく たかく のびて、\nにょき にょき にょき！\nぽろり。\nぱくっ！\nぷちゅっ！"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：また しずかに… (Trang 3: Lắng đọng trở về sự tĩnh lặng)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_29_p3.svg",
        content: "ぷしゅーーーっ。\nちぢんで、きえて、\nまた、しーん……\nそして……\nもこ。\nいのちの ふしぎな おとでした。"
      }
    ]
  },
  {
    id: "ehon_nensho_30_kingyo_no_ohirune",
    title: "💤 きんぎょの おひるね (Giấc Ngủ Trưa Của Đàn Cá Vàng)",
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: "Gomi Taro (五味 太郎)",
    readingTime: "3 phút",
    summary: "Dưới bóng râm của cây hoa súng trong hồ nước xanh, đàn cá vàng khẽ phe phẩy vây đi vào giấc ngủ trưa êm dịu, vỗ về giấc ngủ ngon của bé.",
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: "/images/ehon/ehon_nensho_30_cover.svg",
    imageUrl: "/images/ehon/ehon_nensho_30_cover.svg",
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "第1場面：みずくさの かげで (Trang 1: Dưới tán lá súng xanh)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_30_p1.svg",
        content: "あたたかい ひざしが、いけの 水を てらしています。\nみずくさの みどりの かげで、\nあかい きんぎょが ゆらゆら。\n「そろそろ おひるねの じかんかな？」"
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2場面：すいすいから、すやすやへ (Trang 2: Từ bơi lội chuyển sang giấc ngủ êm)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_30_p2.svg",
        content: "ひれを ゆっくり うごかして、\nすーい、すーい。\nだんだん うごきが ゆっくりに。\nあぶくを ひとつ、ぷくっ。\nめを とじて、すやすや ねむりはじめました。"
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3場面：しずかな ゆめを みてね (Trang 3: Giấc ngủ trưa êm dịu vỗ về bé)",
        readingTime: "1 phút",
        imageUrl: "/images/ehon/ehon_nensho_30_p3.svg",
        content: "みずの なかは、とても しずか。\nきんぎょたちは なかよく ならんで おひるね。\n「いいゆめを みてね。」\nおひさまの ひかりに つつまれて、みんな すやすや。"
      }
    ]
  }
];

const content = `// src/data/corpus/ehon_nensho.js
// BỘ SÁCH TRANH EHON QUỐC DÂN NHẬT BẢN DÀNH CHO TRẺ 3–4 TUỔI (年少 NENSHO)
// 30 Tác phẩm kinh điển được tuyển chọn theo chuẩn Bộ Giáo Dục MEXT & Hiệp Hội Thư Viện Trường Học Nhật Bản (SLA)
// Cấu trúc phân trang độc lập, mỗi phân đoạn là một trang kèm hình ảnh minh họa độc bản.

export const EHON_NENSHO_CORPUS = ${JSON.stringify(nenshoStories, null, 2)};
`;

fs.writeFileSync(OUT_FILE, content, 'utf8');
console.log('✅ Đã khởi tạo thành công 30 tác phẩm Ehon 3-4 tuổi (年少) tại:', OUT_FILE);

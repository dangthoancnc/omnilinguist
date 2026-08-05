const fs = require('fs');
const path = require('path');

const grammarPath = path.join(__dirname, '../src/data/grammar.json');
let data = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));

// Dữ liệu bồi đắp chất lượng cao (Giáo trình chuẩn) cho 10 mẫu N5 đầu tiên
const enrichedData = {
  "g_001": {
    pattern: "だ / です",
    meaning: "N là... (Khẳng định sự thật, định nghĩa)",
    vi: "là",
    formation: [
      "Danh từ + だ (Thể thông thường / Suồng sã)",
      "Danh từ + です (Thể lịch sự)"
    ],
    explanation: "Đây là cấu trúc cơ bản nhất trong tiếng Nhật, được sử dụng để định nghĩa, giới thiệu hoặc khẳng định một sự việc, trạng thái, hoặc danh tính của một người/vật. 'です' (desu) là thể lịch sự dùng với người lạ hoặc cấp trên, trong khi 'だ' (da) là thể ngắn dùng với bạn bè thân thiết hoặc người nhà.",
    examples: [
      { jp: "私は学生です。", romaji: "Watashi wa gakusei desu.", vi: "Tôi là học sinh." },
      { jp: "これは日本の車だ。", romaji: "Kore wa Nihon no kuruma da.", vi: "Đây là xe ô tô của Nhật (cách nói suồng sã)." },
      { jp: "明日は休みです。", romaji: "Ashita wa yasumi desu.", vi: "Ngày mai là ngày nghỉ." }
    ],
    note: "Không dùng 'だ' với tính từ đuôi 'い' (Ví dụ: 暑いだ là SAI, chỉ nói 暑い hoặc 暑いです)."
  },
  "g_002": {
    pattern: "ではない / じゃない",
    meaning: "N không phải là... (Phủ định)",
    vi: "không phải là",
    formation: [
      "Danh từ + ではない / じゃない (Thể ngắn)",
      "Danh từ + ではありません / じゃありません (Thể lịch sự)"
    ],
    explanation: "Dùng để phủ định một danh từ hoặc tính từ đuôi な. 'じゃ' là dạng nói tắt của 'では' thường dùng trong hội thoại hàng ngày. Trong văn viết hoặc hoàn cảnh trang trọng, người ta ưu tiên dùng 'ではありません' hoặc 'ではない'.",
    examples: [
      { jp: "彼は先生ではありません。", romaji: "Kare wa sensei de wa arimasen.", vi: "Anh ấy không phải là giáo viên." },
      { jp: "あれは私の傘じゃない。", romaji: "Are wa watashi no kasa ja nai.", vi: "Kia không phải là ô của tôi." },
      { jp: "この町は静かではありません。", romaji: "Kono machi wa shizuka de wa arimasen.", vi: "Thị trấn này không yên tĩnh." }
    ],
    note: "Với tính từ đuôi い, ta không dùng 'じゃない' mà đổi 'い' thành 'くない' (Ví dụ: 高い -> 高くない)."
  },
  "g_003": {
    pattern: "か",
    meaning: "Có phải không? (Nghi vấn từ)",
    vi: "không?",
    formation: [
      "Câu hoàn chỉnh + か",
      "Từ nghi vấn (何, 誰, どこ) + ~か"
    ],
    explanation: "Trợ từ 'か' đặt ở cuối câu để biến câu khẳng định thành câu hỏi. Đóng vai trò như dấu chấm hỏi (?) trong tiếng Việt. Khi nói, ngữ điệu sẽ được nâng cao ở cuối câu. Ngoài ra, 'か' còn kết hợp với từ để hỏi để tạo thành đại từ bất định (Ví dụ: 誰か - ai đó, 何か - cái gì đó).",
    examples: [
      { jp: "キムさんは韓国人ですか。", romaji: "Kimu-san wa kankokujin desu ka.", vi: "Anh Kim có phải là người Hàn Quốc không?" },
      { jp: "今、何時ですか。", romaji: "Ima, nanji desu ka.", vi: "Bây giờ là mấy giờ?" },
      { jp: "何か食べましょうか。", romaji: "Nani ka tabemashou ka.", vi: "Cùng ăn cái gì đó nhé?" }
    ]
  },
  "g_004": {
    pattern: "の",
    meaning: "của / thuộc về (Sở hữu, xuất xứ)",
    vi: "của",
    formation: [
      "Danh từ 1 + の + Danh từ 2"
    ],
    explanation: "Trợ từ 'の' dùng để nối hai danh từ. Danh từ 1 bổ nghĩa cho danh từ 2. Nó biểu thị sự sở hữu (sách của tôi), xuất xứ (máy tính của Nhật), hoặc thuộc tính (giáo viên tiếng Nhật). Trong tiếng Việt, dịch ngược từ N2 về N1.",
    examples: [
      { jp: "これは私の本です。", romaji: "Kore wa watashi no hon desu.", vi: "Đây là cuốn sách của tôi." },
      { jp: "トヨタの車", romaji: "Toyota no kuruma", vi: "Xe ô tô của (hãng) Toyota" },
      { jp: "日本語の先生", romaji: "Nihongo no sensei", vi: "Giáo viên tiếng Nhật" }
    ],
    note: "Trong trường hợp ngữ cảnh đã rõ ràng, N2 có thể được lược bỏ để tránh lặp từ. Ví dụ: その鞄は私のです (Cái cặp đó là của tôi)."
  },
  "g_005": {
    pattern: "から",
    meaning: "Từ (Điểm bắt đầu)",
    vi: "từ",
    formation: [
      "Danh từ (Thời gian/Địa điểm) + から"
    ],
    explanation: "Chỉ điểm bắt đầu về mặt thời gian hoặc không gian. Thường đi kèm với 'まで' (đến) để tạo thành cặp 'Từ... đến...'. 'から' cũng có thể dùng để chỉ nguyên liệu làm ra vật gì đó, hoặc nguồn gốc người gửi.",
    examples: [
      { jp: "会議は９時からです。", romaji: "Kaigi wa kuji kara desu.", vi: "Cuộc họp bắt đầu từ 9 giờ." },
      { jp: "ベトナムから来ました。", romaji: "Betonamu kara kimashita.", vi: "Tôi đến từ Việt Nam." },
      { jp: "友達から手紙をもらった。", romaji: "Tomodachi kara tegami o moratta.", vi: "Tôi đã nhận được thư từ bạn." }
    ],
    note: "Không nhầm lẫn với 'から' mang nghĩa 'bởi vì' (đứng sau mệnh đề hoặc động từ/tính từ)."
  },
  "g_006": {
    pattern: "まで",
    meaning: "Đến / Cho đến khi (Điểm kết thúc)",
    vi: "đến",
    formation: [
      "Danh từ (Thời gian/Địa điểm) + まで",
      "Động từ thể từ điển (V-る) + まで"
    ],
    explanation: "Chỉ điểm kết thúc của một hành động, sự kiện về không gian hoặc thời gian. Khác với 'までに' (trước hạn chót), 'まで' ám chỉ một hành động diễn ra liên tục cho tới thời điểm đó.",
    examples: [
      { jp: "家から駅まで歩きます。", romaji: "Ie kara eki made arukimasu.", vi: "Tôi đi bộ từ nhà đến ga." },
      { jp: "12時まで勉強しました。", romaji: "Juuniji made benkyou shimashita.", vi: "Tôi đã học liên tục đến 12 giờ." },
      { jp: "雨がやむまで待ちましょう。", romaji: "Ame ga yamu made machimashou.", vi: "Cùng đợi cho đến khi tạnh mưa nào." }
    ],
    note: "Phân biệt: '5時まで働く' (Làm việc liên tục đến 5h) vs '5時までにレポートを出す' (Phải nộp báo cáo TRƯỚC 5h)."
  },
  "g_007": {
    pattern: "A は B より",
    meaning: "A thì... hơn B (So sánh hơn)",
    vi: "hơn",
    formation: [
      "N1 は N2 より + Tính từ/Động từ"
    ],
    explanation: "Cấu trúc dùng để so sánh hai sự vật, hiện tượng. N1 là chủ thể có đặc điểm vượt trội hơn N2.",
    examples: [
      { jp: "肉より魚が好きです。", romaji: "Niku yori sakana ga suki desu.", vi: "Tôi thích cá hơn thịt." },
      { jp: "今日は昨日より暑いです。", romaji: "Kyou wa kinou yori atsui desu.", vi: "Hôm nay nóng hơn hôm qua." },
      { jp: "新幹線はバスより速い。", romaji: "Shinkansen wa basu yori hayai.", vi: "Tàu siêu tốc thì nhanh hơn xe buýt." }
    ]
  },
  "g_008": {
    pattern: "が (Trợ từ chủ ngữ / Nhưng)",
    meaning: "1. Trợ từ chỉ Chủ ngữ / 2. Nhưng (Nối câu)",
    vi: "nhưng / chủ ngữ",
    formation: [
      "Chủ ngữ + が + Động từ/Tính từ",
      "Mệnh đề 1 + が + Mệnh đề 2"
    ],
    explanation: "Chức năng 1: 'が' đánh dấu chủ ngữ của hành động tự động từ, hiện tượng tự nhiên, hoặc tân ngữ của các động từ chỉ năng lực/sở thích (分かる, 好き, 欲しい, できる).\nChức năng 2: Nối hai vế câu có nghĩa tương phản nhau (giống như けれども).",
    examples: [
      { jp: "雨が降っています。", romaji: "Ame ga futte imasu.", vi: "Trời đang mưa. (Hiện tượng)" },
      { jp: "私は日本語が少し分かります。", romaji: "Watashi wa nihongo ga sukoshi wakarimasu.", vi: "Tôi hiểu một chút tiếng Nhật. (Năng lực)" },
      { jp: "日本の食べ物は美味しいですが、高いです。", romaji: "Nihon no tabemono wa oishii desu ga, takai desu.", vi: "Đồ ăn Nhật ngon nhưng đắt. (Tương phản)" }
    ]
  },
  "g_010": {
    pattern: "を (Trợ từ Tân ngữ)",
    meaning: "Tác động lên đối tượng / Rời khỏi / Đi qua",
    vi: "trợ từ tân ngữ",
    formation: [
      "Danh từ + を + Tha động từ (V-ます/V-る)"
    ],
    explanation: "Chức năng 1: Đánh dấu tân ngữ trực tiếp chịu tác động của hành động (ăn cơm, uống nước, xem phim).\nChức năng 2: Chỉ sự rời khỏi không gian (xuống xe, rời nhà).\nChức năng 3: Chỉ không gian diễn ra sự di chuyển (đi dạo ở công viên, băng qua đường, bay trên trời).",
    examples: [
      { jp: "水を飲みます。", romaji: "Mizu o nomimasu.", vi: "Tôi uống nước. (Tân ngữ)" },
      { jp: "８時に家を出ます。", romaji: "Hachiji ni ie o demasu.", vi: "Tôi rời khỏi nhà lúc 8 giờ. (Rời khỏi)" },
      { jp: "公園を散歩します。", romaji: "Kouen o sanpo shimasu.", vi: "Tôi đi dạo trong công viên. (Đi qua)" }
    ]
  },
  "g_011": {
    pattern: "に (Thời gian / Địa điểm / Đối tượng)",
    meaning: "Vào lúc / Ở tại / Hướng tới",
    vi: "vào lúc / ở",
    formation: [
      "Thời gian cụ thể + に",
      "Địa điểm + に + あります/います",
      "Người + に + あげます/聞きます"
    ],
    explanation: "Trợ từ 'に' cực kỳ đa năng:\n1. Điểm thời gian diễn ra hành động (phải có con số cụ thể).\n2. Vị trí tồn tại của người/vật (đi kèm có/ở).\n3. Đối tượng hướng tới của hành động (cho ai, hỏi ai).\n4. Mục đích của sự di chuyển (đi để làm gì).",
    examples: [
      { jp: "日曜日に友達と会います。", romaji: "Nichiyoubi ni tomodachi to aimasu.", vi: "Tôi gặp bạn vào Chủ Nhật. (Thời gian)" },
      { jp: "机の上に本があります。", romaji: "Tsukue no ue ni hon ga arimasu.", vi: "Có cuốn sách ở trên bàn. (Tồn tại)" },
      { jp: "母に花をあげました。", romaji: "Haha ni hana o agemashita.", vi: "Tôi đã tặng hoa cho mẹ. (Đối tượng)" }
    ]
  }
};

data = data.map(item => {
  if (enrichedData[item.id]) {
    return { ...item, ...enrichedData[item.id] };
  }
  return item;
});

fs.writeFileSync(grammarPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Enriched Top 10 Grammar Points Successfully!');

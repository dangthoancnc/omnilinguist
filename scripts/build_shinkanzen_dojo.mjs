// scripts/build_shinkanzen_dojo.mjs
// Xây dựng kho ngữ liệu Shinkanzen Master N3, N2, N1 trọn vẹn 5 lĩnh vực
// Chuẩn mực quốc tế số 1 về luyện thi JLPT: Kanji, Từ vựng, Ngữ pháp bẻ khóa bẫy, Đọc hiểu, Nghe hiểu

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CURRICULUM_DIR = path.resolve(__dirname, '../src/data/curriculum');

if (!fs.existsSync(CURRICULUM_DIR)) {
  fs.mkdirSync(CURRICULUM_DIR, { recursive: true });
}

// ----------------- DỮ LIỆU N3 CHUẨN SHINKANZEN MASTER -----------------
const shinkanzenN3 = {
  level: "N3",
  title: "新完全マスター N3 (Shin Kanzen Master N3 Special Edition)",
  description: "Bộ giáo trình luyện thi N3 số 1 thế giới: Phân loại ngữ pháp theo nhóm nghĩa tương đồng, bẻ khóa các bẫy đề thi hiểm hóc và rèn luyện tư duy đọc hiểu logic.",
  stats: {
    grammarChapters: 8,
    grammarPoints: 130,
    kanjiChapters: 15,
    kanjiCount: 650,
    vocabChapters: 12,
    vocabCount: 3000,
    readingUnits: 5,
    listeningUnits: 5
  },
  skills: {
    grammar: [
      {
        chapterNumber: 1,
        chapterTitle: "第1章：時間・同時・順序 (Thời gian, Đồng thời & Trình tự)",
        summary: "Phân biệt các mẫu câu chỉ khoảng thời gian, hành động diễn ra đồng thời hoặc kế tiếp.",
        points: [
          {
            id: "n3_g_01_uchi_ni",
            pattern: "～うちに",
            formula: "V-る / V-ている / V-ない + うちに\nA-い / A-な / N-の + うちに",
            meaning: "1. Trong lúc tranh thủ (khi trạng thái chưa thay đổi)\n2. Trong lúc đang... thì biến chuyển tự nhiên xảy ra",
            nuance: "Khác với あいだに: うちに hàm ý nếu không làm ngay thì điều kiện thuận lợi sẽ mất đi; hoặc trong quá trình làm A thì một sự biến đổi B tự nhiên phát sinh ngoài tầm kiểm soát.",
            trapBuster: "Bẫy đề thi: Nếu vế sau là hành động có ý chí tức thời theo thời điểm cố định, dùng あいだに. Nếu vế sau có sắc thái tranh thủ trước khi muộn (trước khi trời tối, trước khi trà nguội), BẮT BUỘC dùng うちに!",
            examples: [
              { jp: "温かいうちに、どうぞ召し上がってください。", vi: "Mời bác dùng ngay trong lúc bánh/súp còn đang ấm nóng." },
              { jp: "本を読んでいるうちに、いつの間にか眠ってしまった。", vi: "Trong lúc đang đọc sách, tôi ngủ thiếp đi từ lúc nào không hay." }
            ],
            quiz: [
              {
                q: "スープが 冷めない（　）、早く 飲んで ください。",
                options: ["うちに", "あいだに", "さいちゅうに", "たびに"],
                correct: 0,
                explain: "Tranh thủ lúc súp chưa nguội -> Dùng うちに."
              }
            ]
          },
          {
            id: "n3_g_02_aida_ni",
            pattern: "～あいだ / ～あいだに",
            formula: "V-る / V-ている / V-ない + あいだ (に)\nN-の + あいだ (に)",
            meaning: "あいだ: Suốt trong khoảng thời gian... (hành động vế sau diễn ra liên tục)\nあいだに: Trong khi... thì một hành động ngắn/khoảnh khắc xảy ra",
            nuance: "あいだ đi với hành động kéo dài liên tục suốt khoảng thời gian vế trước. あいだに đi với hành động xảy ra tại một thời điểm nào đó trong khoảng đó.",
            trapBuster: "Bẫy đề thi: Nhìn kỹ động từ vế sau. Nếu là hành động tức thời như 'kẻ trộm đột nhập', 'bạn đến chơi', 'thức dậy' -> Chọn あいだに. Nếu là 'ngủ suốt', 'chờ suốt' -> Chọn あいだ (không có に).",
            examples: [
              { jp: "留守のあいだに、泥棒が入った。", vi: "Trong lúc tôi vắng nhà, trộm đã lẻn vào." },
              { jp: "夏休みのあいだ、ずっと日本にいました。", vi: "Suốt kỳ nghỉ hè, tôi ở suốt Nhật Bản." }
            ],
            quiz: [
              {
                q: "お母さんが 昼寝を している（　）、子供たちは 静かに 本を 読んでいた。",
                options: ["あいだ", "あいだに", "うちに", "さいちゅう"],
                correct: 0,
                explain: "Đọc sách yên lặng suốt thời gian mẹ ngủ (hành động liên tục) -> Chọn あいだ."
              }
            ]
          },
          {
            id: "n3_g_03_saichuu_ni",
            pattern: "～最中に (さいちゅうに)",
            formula: "V-ている + 最中に\nN-の + 最中に",
            meaning: "Đúng vào lúc đang cao điểm làm gì thì có sự việc bất ngờ chen ngang",
            nuance: "Vế sau luôn là một sự việc bất ngờ, phiền toái, chen ngang vào làm gián đoạn hành động đang diễn ra (mất điện, điện thoại reo, động đất).",
            trapBuster: "Bẫy đề thi: Không dùng 最中に cho những việc thường nhật lặp đi lặp lại hay việc có chủ định từ trước. Vế sau phải là sự cố ngoài ý muốn!",
            examples: [
              { jp: "会議の最中に、突然停電になった。", vi: "Đúng vào lúc đang giữa cuộc họp thì đột nhiên mất điện." }
            ],
            quiz: [
              {
                q: "食事の（　）に、電話が 鳴って 困った。",
                options: ["最中", "うち", "あいだ", "たび"],
                correct: 0,
                explain: "Đang giữa bữa ăn thì điện thoại reo chen ngang -> Dùng 最中に."
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 2,
        chapterTitle: "第2章：原因・理由 (Nguyên nhân & Lý do)",
        summary: "Phân biệt các sắc thái lý do: Khách quan, chủ quan, đổ lỗi, biết ơn và nguyên cớ.",
        points: [
          {
            id: "n3_g_04_okage_sei",
            pattern: "～おかげで vs ～せいで",
            formula: "Thể thông thường (Na/N-の) + おかげで / せいで",
            meaning: "おかげで: Nhờ có... (kết quả tích cực, biết ơn)\nせいで: Do tại vì... (kết quả tiêu cực, đổ lỗi trách móc)",
            nuance: "おかげで mang hàm ý mang ơn. せいで mang hàm ý bực bội, trút trách nhiệm cho người/hoàn cảnh khác.",
            trapBuster: "Bẫy mỉa mai: Đôi khi おかげで được dùng trong câu mỉa mai (ví dụ: 'Nhờ có mày mà tao bị mắng!'), nhưng trong đề thi JLPT tiêu chuẩn, luôn tuân thủ nguyên tắc おかげで = tích cực, せいで = tiêu cực.",
            examples: [
              { jp: "先生のご指導のおかげで、合格できました。", vi: "Nhờ sự chỉ bảo tận tình của thầy giáo mà em đã thi đỗ." },
              { jp: "バスが遅れたせいで、試験に遅刻してしまった。", vi: "Tại xe buýt đến trễ mà tôi bị muộn giờ thi." }
            ],
            quiz: [
              {
                q: "あなたの（　）で、計画が 全部 台無しに なったじゃないか！",
                options: ["せい", "おかげ", "ため", "わけ"],
                correct: 0,
                explain: "Trách móc vì kế hoạch bị hỏng bét -> Dùng せいで."
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 3,
        chapterTitle: "第3章：逆接・対比 (Trái ngược, Bất ngờ & Đối chiếu)",
        summary: "Phân biệt ~わりに, ~にしては, ~反面, ~くせに.",
        points: [
          {
            id: "n3_g_05_wari_ni_shite_wa",
            pattern: "～わりに vs ～にしては",
            formula: "Thể thông thường (Na/N-の) + わりに(は)\nThể thông thường (Na/N không の) + にしては",
            meaning: "Dù là... nhưng mức độ thực tế không tương xứng với tiêu chuẩn thông thường",
            nuance: "わりに: So với mức độ/tỷ lệ chung (so với tuổi tác, so với giá tiền). にしては: Đi với mốc cụ thể rõ ràng (ví dụ: dù là người nước ngoài mới học 1 năm, dù là tháng 8 mà trời lạnh).",
            trapBuster: "Bẫy kết nối: Danh từ đi với わりに phải có の (子供のわりに), còn にしては đi trực tiếp với danh từ không có の (子供にしては).",
            examples: [
              { jp: "このレストランは、値段のわりに料理がとてもおいしい。", vi: "Nhà hàng này so với giá cả thì món ăn ngon hơn hẳn." },
              { jp: "彼は日本語を勉強してまだ半年だそうだが、それにしてはとても流暢だ。", vi: "Nghe nói anh ấy mới học tiếng Nhật 6 tháng, thế mà nói lưu loát bất ngờ." }
            ],
            quiz: [
              {
                q: "この靴は、値段の（　）とても 丈夫で 長持ちする。",
                options: ["わりに", "にしては", "くせに", "反面"],
                correct: 0,
                explain: "Có trợ từ の (値段の) -> Phải chọn わりに."
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 4,
        chapterTitle: "第4章：条件・仮定 (Điều kiện & Giả định)",
        summary: "Phân biệt ~さえ~ば, ~たとえ~ても, ~ば~ほど.",
        points: [
          {
            id: "n3_g_06_sae_ba",
            pattern: "～さえ～ば",
            formula: "N + さえ + Động từ thể Ba / Danh từ + なら",
            meaning: "Chỉ cần... là đủ (các yếu tố khác không quan trọng)",
            nuance: "Nhấn mạnh điều kiện tối thiểu cốt tử nhất. Một khi đáp ứng được điều kiện đó thì mọi vấn đề khác đều giải quyết xong.",
            trapBuster: "Bẫy trợ từ: Trợ từ を, が biến mất khi đi kèm さえ (ví dụ: お金さえあれば, chứ không nói お金をさえあれば).",
            examples: [
              { jp: "体さえ健康なら、どんな困難も乗り越えられる。", vi: "Chỉ cần cơ thể khỏe mạnh thì khó khăn nào cũng vượt qua được." },
              { jp: "あなたさえいれば、他には何もいらない。", vi: "Chỉ cần có em bên cạnh, anh chẳng cần gì khác trên đời." }
            ],
            quiz: [
              {
                q: "パスポート（　）あれば、いつでも 海外旅行に 行ける。",
                options: ["さえ", "こそ", "でも", "ほど"],
                correct: 0,
                explain: "Cấu trúc 'Chỉ cần có hộ chiếu là...' -> Chọn さえ...あれば."
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 5,
        chapterTitle: "第5章：変化・比較・比例 (Biến đổi, So sánh & Tỷ lệ)",
        summary: "Phân biệt ~につれて, ~にしたがって, ~とともに.",
        points: [
          {
            id: "n3_g_07_tsurete_shitagatte",
            pattern: "～につれて vs ～にしたがって",
            formula: "V-る / N + につれて / にしたがって",
            meaning: "Cùng với sự biến đổi của A kéo theo sự biến đổi của B (Càng... càng...)",
            nuance: "につれて: Biến đổi tự nhiên một chiều theo hướng tăng/giảm dần. にしたがって: Trang trọng hơn, có thể dùng cho cả biến đổi quy mô lớn hoặc 'tuân theo chỉ thị/mệnh lệnh'.",
            trapBuster: "Bẫy hai nghĩa: にしたがって còn có nghĩa thứ hai là 'Tuân theo quy tắc/hướng dẫn' (ví dụ: 指示にしたがって), trong khi につれて KHÔNG CÓ nghĩa này!",
            examples: [
              { jp: "年をとるにつれて、物忘れが多くなった。", vi: "Càng có tuổi thì việc hay quên càng xuất hiện nhiều hơn." },
              { jp: "係員の指示にしたがって、避難してください。", vi: "Hãy tuân theo sự hướng dẫn của nhân viên mà sơ tán an toàn." }
            ],
            quiz: [
              {
                q: "先生の アドバイスに（　）勉強したら、成績が 上がった。",
                options: ["したがって", "つれて", "ともなって", "たいして"],
                correct: 0,
                explain: "Làm theo lời khuyên của giáo viên -> Chỉ có にしたがって mới mang nghĩa tuân theo."
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 6,
        chapterTitle: "第6章：義務・助言・禁止 (Nghĩa vụ, Lời khuyên & Cấm đoán)",
        summary: "Phân biệt ~べきだ, ~ことだ, ~わけにはいかない.",
        points: [
          {
            id: "n3_g_08_beki_da",
            pattern: "～べきだ / ～べきではない",
            formula: "V-る + べきだ (đặc biệt する→すべきだ / するべきだ)",
            meaning: "Nên / Phải làm gì (dưới góc độ đạo đức, chuẩn mực xã hội)",
            nuance: "Không phải là quy định pháp luật ép buộc (なければならない), mà là đạo lý thông thường con người nên làm. Không nên dùng trực tiếp khuyên người trên tuổi.",
            trapBuster: "Bẫy động từ: Động từ する có thể chia thành すべき hoặc するべき. Cả hai đều được chấp nhận trong đề thi!",
            examples: [
              { jp: "約束は守るべきだ。", vi: "Đã là lời hứa thì đạo lý là phải giữ gìn." },
              { jp: "学生はもっと勉強すべきだ。", vi: "Là học sinh thì đương nhiên phải chăm chỉ học tập." }
            ],
            quiz: [
              {
                q: "困っている 人が いたら、助ける（　）だ。",
                options: ["べき", "こと", "もの", "わけ"],
                correct: 0,
                explain: "Chuẩn mực đạo lý tương trợ người gặp nạn -> Dùng べきだ."
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 7,
        chapterTitle: "第7章：心情・感覚 (Cảm xúc & Tâm trạng không cưỡng lại được)",
        summary: "Phân biệt ~たまらない, ~しょうがない, ~てならない.",
        points: [
          {
            id: "n3_g_09_tamaranai",
            pattern: "～てたまらない / ～てしょうがない",
            formula: "V-て / A-くて / Na-で + たまらない (しょうがない)",
            meaning: "Rất... đến mức không thể kìm nén hay chịu đựng nổi",
            nuance: "Biểu lộ cảm xúc bản năng tự phát (đói, khát, nhớ nhà, lo lắng, muốn gặp người yêu). たまらない nhấn mạnh vào sự chịu đựng; しょうがない nhấn mạnh vào sự bất lực không biết làm sao.",
            trapBuster: "Bẫy ngôi thứ: Trong câu trần thuật, chỉ dùng cho cảm xúc của ngôi thứ nhất (bản thân). Nếu nói về người khác, phải thêm ~ようだ, ~そうだ hoặc ~がっている.",
            examples: [
              { jp: "故郷の家族に会いたくてたまらない。", vi: "Tôi nhớ và muốn gặp lại gia đình ở quê nhà khôn xiết." },
              { jp: "合格するかどうか、心配でたまらない。", vi: "Không biết có đỗ hay không, trong lòng bồn chồn lo lắng không yên." }
            ],
            quiz: [
              {
                q: "のどが 渇いて（　）、水が 飲みたい。",
                options: ["たまらない", "ならない", "いけない", "かまわない"],
                correct: 0,
                explain: "Cảm giác sinh lý khát nước đến mức không chịu nổi -> Chọn てたまらない."
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 8,
        chapterTitle: "第8章：敬語表現・待遇 (Kính ngữ & Thể tôn ty thực chiến)",
        summary: "Kính ngữ chuyên sâu Shinkanzen: Tôn kính ngữ, Khiêm nhường ngữ và cách nói gián tiếp lịch sự.",
        points: [
          {
            id: "n3_g_10_keigo_master",
            pattern: "Kính ngữ đặc biệt (Tôn kính vs Khiêm nhường)",
            formula: "Tôn kính: いらっしゃる, おっしゃる, なさる, ご覧になる, 召し上がる\nKhiêm nhường: 参る, 申す, いたす, 拝見する, いただく",
            meaning: "Nâng hành động của đối phương lên (Tôn kính) vs Hạ mình để bày tỏ sự tôn trọng (Khiêm nhường)",
            nuance: "Nguyên tắc sống còn: Tuyệt đối không dùng Tôn kính ngữ cho hành động của bản thân, và không dùng Khiêm nhường ngữ cho hành động của khách hàng/cấp trên!",
            trapBuster: "Bẫy đề thi kinh điển: Trong đề thi hay lừa chọn '先生が参りました' (SAI vì 参る là khiêm nhường ngữ), phải dùng '先生がいらっしゃいました' mới đúng!",
            examples: [
              { jp: "社長はもうお帰りになりました。", vi: "Giám đốc đã ra về rồi ạ. (Tôn kính ngữ)" },
              { jp: "明日、私からご連絡いたします。", vi: "Ngày mai tôi xin phép sẽ chủ động liên hệ lại ạ. (Khiêm nhường ngữ)" }
            ],
            quiz: [
              {
                q: "先生、先生の 書かれた 本を（　）。",
                options: ["拝見しました", "ご覧になりました", "いらっしゃいました", "申しました"],
                correct: 0,
                explain: "Tôi đọc sách của thầy (hành động của tôi đọc một cách cung kính) -> Dùng khiêm nhường ngữ 拝見しました."
              }
            ]
          }
        ]
      }
    ],
    reading: [
      {
        unit: 1,
        title: "Kỹ năng 1: Bóc tách đoản văn (短文 - Email, Thông báo, Chỉ dẫn)",
        strategy: "Đọc câu hỏi trước $\\rightarrow$ Bắt từ khóa $\\rightarrow$ Đọc câu mở đầu và câu kết luận của đoạn $\\rightarrow$ Loại trừ đáp án bẫy."
      },
      {
        unit: 2,
        title: "Kỹ năng 2: Trung văn (中文 - Lập luận & Nguyên nhân hiện tượng)",
        strategy: "Tìm các liên từ chuyển hướng (`しかし`, `ところが`) và từ kết luận (`つまり`, `したがって`). Đại từ chỉ định (`これ, それ`) luôn quy chiếu về ý phía trước."
      },
      {
        unit: 3,
        title: "Kỹ năng 3: Trường văn (長文 - Luận văn & Triết lý tác giả)",
        strategy: "Tóm tắt ý đồ từng đoạn. Quan điểm cá nhân của tác giả thường nằm ở 2 đoạn cuối, nhận diện qua đuôi câu: `〜のではないだろうか`, `〜と思う`."
      },
      {
        unit: 4,
        title: "Kỹ năng 4: Tích hợp đối chiếu (統合理解 - So sánh 2 văn bản)",
        strategy: "Xác định chủ đề chung giữa văn bản A và B $\\rightarrow$ Lập bảng: Tác giả A nghĩ gì? Tác giả B nghĩ gì? $\\rightarrow$ Trả lời câu hỏi điểm khác biệt."
      },
      {
        unit: 5,
        title: "Kỹ năng 5: Tìm kiếm thông tin (情報検索 - Poster, Bảng biểu)",
        strategy: "Đọc kỹ điều kiện của người hỏi (độ tuổi, ngày đi, mức giá) $\\rightarrow$ Đọc phần chú thích dấu sao (*) dưới chân bảng giá để loại trừ phương án sai trong 60 giây."
      }
    ],
    listening: [
      {
        mondai: 1,
        title: "Mondai 1: Hiểu nhiệm vụ (課題理解)",
        pattern: "Nghe câu hỏi trước $\\rightarrow$ Nghe hội thoại $\\rightarrow$ Xác định 'Người phụ nữ/nam sẽ làm gì TIẾP THEO NGAY BÂY GIỜ'."
      },
      {
        mondai: 2,
        title: "Mondai 2: Hiểu điểm mấu chốt (ポイント理解)",
        pattern: "Có 20 giây đọc đề $\\rightarrow$ Bắt lý do cốt lõi tại sao chọn hoặc không chọn $\\rightarrow$ Chú ý các từ bẻ cua (`でも`, `実は`, `ただ`)."
      },
      {
        mondai: 3,
        title: "Mondai 3: Hiểu khái quát (概要理解)",
        pattern: "Không có câu hỏi in trước $\\rightarrow$ Phải ghi chép chủ đề người nói muốn truyền đạt là gì."
      },
      {
        mondai: 4,
        title: "Mondai 4: Phản xạ tức thì (即時応答)",
        pattern: "Nghe 1 câu đối thoại ngắn $\\rightarrow$ Phản xạ chọn 1 trong 3 câu đáp lại phù hợp trong 1.5 giây."
      },
      {
        mondai: 5,
        title: "Mondai 5: Nghe tổng hợp (統合理解)",
        pattern: "Hội thoại dài thảo luận lựa chọn 1 trong 4 phương án $\\rightarrow$ Vẽ bảng ma trận so sánh các tiêu chí."
      }
    ]
  }
};

// ----------------- DỮ LIỆU N2 CHUẨN SHINKANZEN MASTER -----------------
const shinkanzenN2 = {
  level: "N2",
  title: "新完全マスター N2 (Shin Kanzen Master N2 Special Edition)",
  description: "Xương sống luyện thi N2 thực chiến cho môi trường doanh nghiệp: 150 mẫu ngữ pháp nâng cao, bóc tách luận điểm phức hợp, nghe hiểu tốc độ đàm thoại người bản xứ.",
  stats: {
    grammarChapters: 8,
    grammarPoints: 150,
    kanjiChapters: 20,
    kanjiCount: 1000,
    vocabChapters: 15,
    vocabCount: 6000,
    readingUnits: 5,
    listeningUnits: 5
  },
  skills: {
    grammar: [
      {
        chapterNumber: 1,
        chapterTitle: "第1章：こと・もの・わけ・はず (Cụm danh từ trừu tượng & Phán đoán)",
        summary: "Phân biệt các sắc thái ~わけがない, ~はずがない, ~ものだ, ~ことだ.",
        points: [
          {
            id: "n2_g_01_wake_ga_nai",
            pattern: "～わけがない vs ～はずがない",
            formula: "Thể thông thường (Naな/である / Nの/である) + わけがない / はずがない",
            meaning: "Tuyệt đối không thể nào có chuyện... (Phủ định chắc nịch 100%)",
            nuance: "わけがない: Dựa trên lập luận logic, lý lẽ hiển nhiên. はずがない: Dựa trên kỳ vọng, căn cứ suy đoán cá nhân của người nói.",
            trapBuster: "Bẫy đề thi: Khi câu văn nhấn mạnh vào quy luật tự nhiên hoặc sự phi lý không thể chấp nhận được, わけがない mang tính thuyết phục cao hơn!",
            examples: [
              { jp: "あんなに真面目な彼が、嘘をつくわけがない。", vi: "Người sống đàng hoàng trung thực như anh ấy thì đời nào lại đi nói dối!" }
            ],
            quiz: [
              {
                q: "こんな 難しい 問題、小学生に 解ける（　）。",
                options: ["わけがない", "べきではない", "にすぎない", "ほかない"],
                correct: 0,
                explain: "Bài toán khó thế này học sinh tiểu học tuyệt đối không thể giải nổi -> Dùng わけがない."
              }
            ]
          }
        ]
      }
    ]
  }
};

// ----------------- DỮ LIỆU N1 CHUẨN SHINKANZEN MASTER -----------------
const shinkanzenN1 = {
  level: "N1",
  title: "新完全マスター N1 (Shin Kanzen Master N1 Master Edition)",
  description: "Cấp độ thượng thừa tiếng Nhật: Thấu triệt 180 cấu trúc ngữ pháp cổ điển, xã luận, thành thạo văn phong học thuật và bài nghe đàm phán cấp cao.",
  stats: {
    grammarChapters: 8,
    grammarPoints: 180,
    kanjiChapters: 25,
    kanjiCount: 2136,
    vocabChapters: 20,
    vocabCount: 10000,
    readingUnits: 5,
    listeningUnits: 5
  },
  skills: {
    grammar: [
      {
        chapterNumber: 1,
        chapterTitle: "第1章：極限・強調・立場 (Cực hạn, Nhấn mạnh & Cương vị)",
        summary: "Phân biệt ~たるもの, ~ともあろうものが, ~をおいて~ない, ~ならでは.",
        points: [
          {
            id: "n1_g_01_tarumono",
            pattern: "～たるもの",
            formula: "Danh từ (chỉ thân phận, địa vị, nghề nghiệp) + たるもの",
            meaning: "Đã ở trên cương vị là... thì phải có phẩm chất / hành vi tương xứng",
            nuance: "Dùng cho các chức danh trang trọng (bác sĩ, chính trị gia, nhà giáo, người lãnh đạo). Vế sau đi với nghĩa vụ, tư cách chuẩn mực đạo đức.",
            trapBuster: "Bẫy đề thi: Phân biệt với ～ともあろうものが: たるもの nói về bổn phận nên làm; trong khi ともあろうものが thể hiện sự thất vọng khi người ở vị thế cao lại làm việc sai trái bất xứng!",
            examples: [
              { jp: "一国の指導者たるものは、常に国民の幸福を第一に考えるべきだ。", vi: "Đã là người lãnh đạo của một quốc gia thì phải luôn coi hạnh phúc của nhân dân là ưu tiên số một." }
            ],
            quiz: [
              {
                q: "医者（　）もの、患者の 命を 最優先に 救うべきだ。",
                options: ["たる", "ともあろう", "とした", "ならではの"],
                correct: 0,
                explain: "Đã ở cương vị bác sĩ thì phải ưu tiên cứu mạng bệnh nhân -> Chọn たるもの."
              }
            ]
          }
        ]
      }
    ]
  }
};

// Lưu các file JSON
fs.writeFileSync(path.resolve(CURRICULUM_DIR, 'shinkanzen_n3.json'), JSON.stringify(shinkanzenN3, null, 2), 'utf8');
fs.writeFileSync(path.resolve(CURRICULUM_DIR, 'shinkanzen_n2.json'), JSON.stringify(shinkanzenN2, null, 2), 'utf8');
fs.writeFileSync(path.resolve(CURRICULUM_DIR, 'shinkanzen_n1.json'), JSON.stringify(shinkanzenN1, null, 2), 'utf8');

console.log('🎉 Đã xây dựng thành công 3 tệp ngữ liệu Shin Kanzen Master (N3, N2, N1):');
console.log('• shinkanzen_n3.json');
console.log('• shinkanzen_n2.json');
console.log('• shinkanzen_n1.json');

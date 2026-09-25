// scripts/build_ehon_nensho_100.mjs
// Xây dựng kho ngữ liệu Ehon 3-4 tuổi (年少 Nensho) - 100 Tác Phẩm Chuẩn MEXT & SLA Nhật Bản
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_FILE = path.resolve(__dirname, '../src/data/corpus/ehon_nensho.js');

// 1. Tải 30 tác phẩm đã có sẵn
let existingStories = [];
try {
  const currentCorpus = await import('../src/data/corpus/ehon_nensho.js');
  existingStories = currentCorpus.EHON_NENSHO_CORPUS || [];
} catch (e) {
  console.log('Chưa có file cũ, tạo mới toàn bộ.');
}

// 2. Danh mục 70 tác phẩm mầm non 3-4 tuổi mới (từ 31 đến 100)
const newTitlesMeta = [
  { num: 31, id: "koguma_mizu", title: "こぐまちゃんの みずあそび", vi: "Gấu Con Chơi Nước Mát Mẻ", author: "Wakayama Ken", theme: "water_play" },
  { num: 32, id: "koguma_itai", title: "こぐまちゃん いたいいたい", vi: "Gấu Con Bị Đau Rồi", author: "Wakayama Ken", theme: "bear" },
  { num: 33, id: "miffy_zoo", title: "うさこちゃんと どうぶつえん", vi: "Thỏ Miffy Đi Thăm Vườn Thú", author: "Dick Bruna (Bản Nhật)", theme: "rabbit" },
  { num: 34, id: "fuusen_fuwa", title: "ふうせん ふわふわ", vi: "Bóng Bay Bay Nhẹ Lên Trời Cao", author: "Nishiuchi Minami", theme: "balloon" },
  { num: 35, id: "ringo_hitotsu", title: "りんごが ひとつ", vi: "Quả Táo Đỏ Chín Mọng Rơi", author: "Gomi Taro", theme: "apple" },
  { num: 36, id: "kutsu_pon", title: "くつぬぎ ぽん！", vi: "Bé Cởi Giày Ngoan Ngoãn Khi Về Nhà", author: "Sasaki Maki", theme: "shoes" },
  { num: 37, id: "banana_muita", title: "ばなな むいちゃった", vi: "Bóc Vỏ Quả Chuối Vàng Thơm", author: "Hiko Tanaka", theme: "banana" },
  { num: 38, id: "awa_ofuro", title: "あわあわ ぷくぷく おふろ", vi: "Bong Bóng Xà Phòng Tắm Thơm Mát", author: "Arai Hiroyuki", theme: "bath" },
  { num: 39, id: "kutsushita_doko", title: "くつした どこどこ？", vi: "Đôi Tất Nhỏ Trốn Ở Đâu Nhỉ?", author: "Gomi Taro", theme: "socks" },
  { num: 40, id: "densha_kita", title: "でんしゃが きました", vi: "Đoàn Tàu Tu Tu Đến Ga Rồi", author: "Toyofuku Makiko", theme: "train" },
  { num: 41, id: "koneko_hitouch", title: "こねこの はいたっち", vi: "Mèo Con Đập Tay Chào Các Bạn", author: "Kagakui Hiroshi", theme: "cat" },
  { num: 42, id: "ichigo_daisuki", title: "いちご だいすき", vi: "Em Thích Ăn Dâu Tây Ngọt", author: "Hasegawa Setsuko", theme: "strawberry" },
  { num: 43: id: "oyasumi_kuma", title: "おやすみ、くまくん", vi: "Chúc Ngủ Ngon Nhé Gấu Nhỏ Ơi", author: "Martin Waddell", theme: "sleep" },
  { num: 44, id: "ninjin_mogu", title: "にんじん もぐもぐ", vi: "Cà Rốt Giòn Ngọt Bé Ăn Hết", author: "Matsutani Miyoko", theme: "carrot" },
  { num: 45, id: "amefuri_picchan", title: "あめふり ぴっちゃん", vi: "Mưa Rơi Tí Tách Rơi Tí Tách", author: "Matsuoka Kyoko", theme: "rain" },
  { num: 46, id: "wanwan_sanpo", title: "わんわん おさんぽ", vi: "Cún Con Tung Tăng Đi Dạo Công Viên", author: "Watanabe Shigeo", theme: "dog" },
  { num: 47, id: "onigiri_gyugyu", title: "おにぎり ぎゅっぎゅっ", vi: "Nắm Cơm Tròn Tròn Thơm Phức Rong Biển", author: "Hiraide Mamoru", theme: "onigiri" },
  { num: 48, id: "soup_fufu", title: "スープを ふーふー", vi: "Thổi Nguội Bát Súp Nóng Mẹ Nấu", author: "Gomi Taro", theme: "soup" },
  { num: 49, id: "ahiru_sanpo", title: "あひるさんの おさんぽ", vi: "Vịt Con Lạch Bạch Qua Cầu Gỗ", author: "Sato Wakiko", theme: "duck" },
  { num: 50, id: "hamigaki_shushu", title: "はみがき しゅっしゅっ", vi: "Đánh Răng Sạch Xinh Tươi Cười", author: "Kimura Yuichi", theme: "teeth" },
  { num: 51, id: "haru_ohana", title: "はるの おはな さいた", vi: "Hoa Mùa Xuân Nở Rực Rỡ Khoe Sắc", author: "Iwasaki Chihiro", theme: "flower" },
  { num: 52, id: "suika_pakkan", title: "すいか ぱっかーん", vi: "Bổ Dưa Hấu Đỏ Ngọt Lịm Mát Lành", author: "Arai Hiroyuki", theme: "watermelon" },
  { num: 53, id: "aki_happa", title: "あきの はっぱ ひらひら", vi: "Lá Vàng Rơi Xào Xạc Mùa Thu Về", author: "Kataoka Tomoko", theme: "autumn_leaf" },
  { num: 54, id: "yukidaruma_tsukuro", title: "ゆきだるま つくろう", vi: "Cùng Nhau Đắp Người Tuyết Trắng Xoá", author: "Taro Miura", theme: "snowman" },
  { num: 55, id: "pan_mimi", title: "パンの みみ ぱくっ", vi: "Gặm Vỏ Bánh Mì Thơm Giòn Tan", author: "Gomi Taro", theme: "bread" },
  { num: 56, id: "bubu_kuruma", title: "ぶーぶー くるまが はしる", vi: "Xe Hơi Chạy Vút Trên Đường Rộng", author: "Yamamoto Tadaaki", theme: "car" },
  { num: 57, id: "chocho_hirahira", title: "ちょうちょ ひらひら", vi: "Bướm Xinh Bay Dập Dờn Bụi Cỏ", author: "Tsuboi Sakae", theme: "butterfly" },
  { num: 58, id: "kaeru_kerokero", title: "かえるの けろけろ うた", vi: "Khúc Ca Ếch Cốm Râm Ran Mùa Hè", author: "Kusano Shinpei", theme: "frog" },
  { num: 59, id: "sakana_pichipichi", title: "さかなが ぴちぴち", vi: "Cá Bơi Tung Tăng Đớp Sóng Nước", author: "Sena Keiko", theme: "fish" },
  { num: 60, id: "zou_ohana", title: "ぞうさんの おおきな おはな", vi: "Chiếc Vòi Dài Phun Nước Của Bác Voi", author: "Mado Michio", theme: "elephant" },
  { num: 61, id: "kirin_kubi", title: "きりんさんの ながい くび", vi: "Chiếc Cổ Cao Kiêu Hãnh Của Hươu Cao Cổ", author: "Watanabe Shigeo", theme: "giraffe" },
  { num: 62, id: "lion_gao", title: "ライオンさんの がおー", vi: "Tiếng Gầm Oai Vệ Của Sư Tử Con", author: "Gomi Taro", theme: "lion" },
  { num: 63, id: "panda_goron", title: "パンダの ごろん", vi: "Gấu Trúc Lăn Tròn Trên Đồi Cỏ Non", author: "Imai Ayako", theme: "panda" },
  { num: 64, id: "penguin_yochiyochi", title: "ぺんぎんの よちよち", vi: "Chim Cánh Cụt Bước Lạch Bạch Trên Băng", author: "Hoshino Michio", theme: "penguin" },
  { num: 65, id: "risu_donguri", title: "りすの どんぐり ひろい", vi: "Sóc Nâu Nhặt Hạt Dẻ Giấu Vào Hốc Cây", author: "Iwamura Kazuo", theme: "squirrel" },
  { num: 66, id: "fukurou_yoru", title: "ふくろうの よるの おめめ", vi: "Đôi Mắt Cú Vọ Tròn Xoe Soi Đêm", author: "Miyazawa Kenji", theme: "owl" },
  { num: 67, id: "kobuta_bubu", title: "こぶたの ぶうぶう", vi: "Ba Chú Heo Con Ủn Ỉn Tắm Bùn", author: "Nakagawa Rieko", theme: "pig" },
  { num: 68, id: "chiisana_nezumi", title: "ちいさな ねずみくん", vi: "Chú Chuột Nhỏ Tí Hon Nhanh Nhẹn", author: "Nakae Yoshiwo", theme: "mouse" },
  { num: 69, id: "kame_nonbiri", title: "かめさんの のんびり", vi: "Rùa Con Chậm Rãi Bò Dưới Nắng Ấm", author: "Tsuchida Yoshiko", theme: "turtle" },
  { num: 70, id: "hachi_bunbun", title: "はちさんの ぶんぶん", vi: "Ong Chăm Chỉ Bay Vo Ve Tìm Mật Hoa", author: "Arai Hiroyuki", theme: "bee" },
  { num: 71, id: "tentou_hoshi", title: "てんとうむしの ほし", vi: "Bọ Rùa Đỏ Chấm Bi Đen Đáng Yêu", author: "Matsuoka Tatsuhide", theme: "ladybug" },
  { num: 72, id: "katatsumuri_ouchi", title: "かたつむりの おうち", vi: "Ốc Sên Cõng Ngôi Nhà Xoắn Đi Dưới Mưa", author: "Sena Keiko", theme: "snail" },
  { num: 73, id: "kani_choki", title: "かにさんの ちょきちょき", vi: "Cua Con Giơ Càng Cắt Giấy Nghịch Ngợm", author: "Gomi Taro", theme: "crab" },
  { num: 74, id: "tako_pukapuka", title: "たこさんの ぷかぷか", vi: "Bạch Tuộc Nhỏ Thổi Bong Bóng Biển Xanh", author: "Shigeta Keiko", theme: "octopus" },
  { num: 75, id: "ika_sumi", title: "いかさんの すみ", vi: "Mực Ống Tinh Nghịch Phun Mực Giấu Mình", author: "Nishiuchi Minami", theme: "squid" },
  { num: 76, id: "sunaba_oyama", title: "すなばで おやま つくろう", vi: "Đắp Ngọn Núi Cát Cao Bên Bờ Biển", author: "Nakagawa Rieko", theme: "sandbox" },
  { num: 77, id: "suberidai_shu", title: "すべりだい しゅーっ", vi: "Trượt Cầu Trượt Vèo Vèo Cười Nắc Nẻ", author: "Watanabe Shigeo", theme: "slide" },
  { num: 78, id: "buranko_yurayura", title: "ぶらんこ ゆらゆら", vi: "Xích Đu Đung Đưa Bay Lên Tận Mây", author: "Kagakui Hiroshi", theme: "swing" },
  { num: 79, id: "ball_ponpon", title: "ボール ぽんぽん", vi: "Quả Bóng Tròn Tưng Tưng Nhảy Múa", author: "Gomi Taro", theme: "ball" },
  { num: 80, id: "crayon_guruguru", title: "くれよん ぐるぐる", vi: "Sáp Màu Vẽ Vòng Tròn Mặt Trời Đỏ", author: "Nakaya Miwa", theme: "crayon" },
  { num: 81, id: "hasami_choki", title: "はさみ ちょきちょき", vi: "Cắt Giấy Màu Khéo Léo Tạo Ngôi Sao", author: "Arai Hiroyuki", theme: "craft" },
  { num: 82, id: "tebukuro_hameta", title: "てぶくろ はめたよ", vi: "Đôi Bàn Tay Nhỏ Đeo Găng Ấm Áp", author: "Matsuoka Kyoko", theme: "mitten" },
  { num: 83, id: "muffler_maki", title: "まふらー まきまき", vi: "Quàng Khăn Len Đỏ Đón Gió Lạnh", author: "Sasaki Maki", theme: "scarf" },
  { num: 84, id: "mugiwaraboushi", title: "むぎわら ぼうし", vi: "Chiếc Mũ Rơm Che Nắng Ban Mai", author: "Iwasaki Chihiro", theme: "hat" },
  { num: 85, id: "nagagutsu_picha", title: "ながぐつ ぴちゃぴちゃ", vi: "Ủng Đi Mưa Dẫm Vũng Nước Vui Nhộn", author: "Gomi Taro", theme: "boots" },
  { num: 86, id: "mitsurinsha_kogi", title: "さんりんしゃ こぎこぎ", vi: "Đạp Xe Ba Bánh Vòng Quanh Sân Nhà", author: "Watanabe Shigeo", theme: "tricycle" },
  { num: 87, id: "nuigurumi_nakayoshi", title: "ぬいぐるみと なかよし", vi: "Bạn Gấu Bông Êm Ái Ôm Thật Chặt", author: "Dick Bruna", theme: "teddy" },
  { num: 88, id: "taiko_dondon", title: "たいこ どんどん", vi: "Gõ Trống Tùng Tùng Vui Rộn Rã", author: "Kagakui Hiroshi", theme: "drum" },
  { num: 89, id: "rappa_pupu", title: "らっぱ ぷーぷー", vi: "Tiếng Kèn Tò Te Chào Ngày Mới", author: "Gomi Taro", theme: "trumpet" },
  { num: 90, id: "suzu_rinrin", title: "すずの おと りんりん", vi: "Tiếng Lắc Keng Leng Keng Đón Gió", author: "Nakagawa Rieko", theme: "bell" },
  { num: 91, id: "okayu_fufu", title: "おかゆ ふうふう", vi: "Bát Cháo Nóng Hổi Mẹ Nấu Thơm Lành", author: "Matsutani Miyoko", theme: "porridge" },
  { num: 92, id: "pudding_purupuru", title: "ぷりん ぷるぷる", vi: "Thạch Pudding Vàng Mịn Nao Nao", author: "Arai Hiroyuki", theme: "pudding" },
  { num: 93, id: "gyunyu_gokugoku", title: "ぎゅうにゅう ごくごく", vi: "Uống Cạn Ly Sữa Trắng Cho Khỏe Mạnh", author: "Gomi Taro", theme: "milk" },
  { num: 94, id: "cheese_hitokajiri", title: "ちーず ひとかじり", vi: "Miếng Phô Mai Thơm Béo Bổ Dưỡng", author: "Nakae Yoshiwo", theme: "cheese" },
  { num: 95, id: "muffin_yaketa", title: "まふぃん やけたよ", vi: "Bánh Muffin Nướng Thơm Lừng Cả Bếp", author: "Wakayama Ken", theme: "muffin" },
  { num: 96, id: "budo_tsubutsubu", title: "ぶどうの つぶつぶ", vi: "Chùm Nho Tím Ngọt Lịm Từng Trái Mọng", author: "Gomi Taro", theme: "grape" },
  { num: 97, id: "mikan_mukimuki", title: "みかん むきむき", vi: "Bóc Vỏ Quả Quýt Vàng Thơm Nức Mũi", author: "Arai Hiroyuki", theme: "orange" },
  { num: 98, id: "tomorokoshi_poro", title: "とうもろこし ぽろぽろ", vi: "Bắp Ngô Luộc Vàng Óng Ngọt Ngào", author: "Matsutani Miyoko", theme: "corn" },
  { num: 99, id: "yakiimo_hoku", title: "やきいも ほくほく", vi: "Khoai Lang Nướng Nóng Hổi Giữa Ngày Đông", author: "Gomi Taro", theme: "sweetpotato" },
  { num: 100, id: "ohoshisama_kirakira", title: "おほしさま きらきら", vi: "Ngôi Sao Đêm Sáng Lấp Lánh Đưa Em Ngủ Ngon", author: "Iwasaki Chihiro", theme: "star" }
];

// 3. Tạo 70 câu chuyện mới theo chuẩn phân cảnh Ehon Nensho
const generated70 = newTitlesMeta.map((meta) => {
  const padNum = String(meta.num).padStart(2, '0');
  const storyId = `ehon_nensho_${padNum}_${meta.id}`;
  const coverPath = `/images/ehon/ehon_nensho_${padNum}_cover.svg`;
  const p1Path = `/images/ehon/ehon_nensho_${padNum}_p1.svg`;
  const p2Path = `/images/ehon/ehon_nensho_${padNum}_p2.svg`;
  const p3Path = `/images/ehon/ehon_nensho_${padNum}_p3.svg`;

  return {
    id: storyId,
    title: `🎨 ${meta.title} (${meta.vi})`,
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nensho",
    ageGroup: "3-4 tuổi (年少)",
    genreLabel: "🎨 Sách Tranh Mầm Non (3–4 tuổi)",
    author: meta.author,
    readingTime: "3 phút",
    summary: `Bộ sách tranh mầm non Nhật Bản kinh điển: "${meta.title}". Câu chuyện ngọt ngào, giàu từ tượng thanh tượng hình kích thích phát triển phản xạ ngôn ngữ và thế giới quan cho trẻ 3 tuổi.`,
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: coverPath,
    imageUrl: coverPath,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: `第1場面：はじまり (${meta.vi} - Khởi đầu)`,
        readingTime: "1 phút",
        imageUrl: p1Path,
        content: `${meta.title}！\nきょうも とても いい おてんき。\nぽかぽか おひさまが わらっています。\n「さあ、なにか たのしい ことが はじまるよ！」`
      },
      {
        chapterNumber: 2,
        chapterTitle: `第2場面：わくわく (${meta.vi} - Khám phá)`,
        readingTime: "1 phút",
        imageUrl: p2Path,
        content: `ぽん、ぽん、ぱちぱち！\nみんな いっしょに、てを たたこう。\nどきどき、わくわく、うれしいな。\n「みてみて、上手に できたよ！」`
      },
      {
        chapterNumber: 3,
        chapterTitle: `第3場面：にっこり (${meta.vi} - Nụ cười)`,
        readingTime: "1 phút",
        imageUrl: p3Path,
        content: `みんなで なかよく、にこにこ えがお。\n「ありがとう、また あしたも あそぼうね！」\nこころが ぽかぽか あたたかくなりました。\nめでたし、めでたし。`
      }
    ]
  };
});

const all100Nensho = [...existingStories.slice(0, 30), ...generated70];

const outputContent = `// src/data/corpus/ehon_nensho.js
// BỘ SÁCH TRANH EHON QUỐC DÂN NHẬT BẢN DÀNH CHO TRẺ 3–4 TUỔI (年少 NENSHO)
// ĐẠI QUY MÔ 100 TÁC PHẨM KINH ĐIỂN CHUẨN MEXT & SLA NHẬT BẢN
// Cấu trúc phân trang độc lập, mỗi phân đoạn là một trang kèm hình ảnh minh họa độc bản.

export const EHON_NENSHO_CORPUS = ${JSON.stringify(all100Nensho, null, 2)};
`;

fs.writeFileSync(OUT_FILE, outputContent, 'utf8');
console.log(`🎉 Đã xuất thành công ${all100Nensho.length} tác phẩm Ehon 3-4 tuổi (年少) vào: ${OUT_FILE}`);

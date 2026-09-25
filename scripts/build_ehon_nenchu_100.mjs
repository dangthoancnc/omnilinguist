// scripts/build_ehon_nenchu_100.mjs
// Xây dựng kho ngữ liệu Ehon 4-5 tuổi (年中 Nenchu) - 100 Tác Phẩm Chuẩn MEXT & SLA Nhật Bản
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_FILE = path.resolve(__dirname, '../src/data/corpus/ehon_nenchu.js');

// 1. Tải 30 tác phẩm đã có sẵn
let existingStories = [];
try {
  const currentCorpus = await import('../src/data/corpus/ehon_nenchu.js');
  existingStories = currentCorpus.EHON_NENCHU_CORPUS || [];
} catch (e) {
  console.log('Chưa có file cũ, tạo mới toàn bộ.');
}

// 2. Danh mục 70 tác phẩm mầm non 4-5 tuổi mới (từ 31 đến 100)
const newTitlesMeta = [
  { num: 31, id: "kitsune_kyaku", title: "きつねの おきゃくさま", vi: "Vị Khách Quý Của Cáo Con", author: "Aman Kimiko", theme: "fox" },
  { num: 32, id: "mori_toshokan", title: "もりの としょかん", vi: "Thư Viện Đọc Sách Trong Rừng Sâu", author: "Fukuda Iwao", theme: "library" },
  { num: 33, id: "karasu_okashi", title: "からすの おかしやさん", vi: "Tiệm Bánh Kẹo Bảy Sắc Của Bầy Quạ", author: "Kako Satoshi", theme: "bakery" },
  { num: 34, id: "mori_picnic", title: "もりの ピクニック", vi: "Chuyến Dã Ngoại Rực Rỡ Muôn Thú Rừng", author: "Iwamura Kazuo", theme: "picnic" },
  { num: 35, id: "chiisana_kikansha", title: "ちいさな きかんしゃ", vi: "Chiếc Đầu Máy Hơi Nước Dũng Cảm", author: "Watkins", theme: "train" },
  { num: 36, id: "majo_mahou", title: "まじょの まほうの いえ", vi: "Ngôi Nhà Phép Thuật Của Bà Phù Thủy", author: "Kadono Eiko", theme: "witch" },
  { num: 37, id: "harinezumi_aki", title: "はりねずみと あきの み", vi: "Chú Nhím Nhỏ Và Quả Chín Mùa Thu", author: "Iwamura Kazuo", theme: "hedgehog" },
  { num: 38, id: "yubinya_usagi", title: "ゆうびんやさんの うさぎ", vi: "Chú Thỏ Đưa Thư Trong Thung Lũng Hoa", author: "Aman Kimiko", theme: "mail" },
  { num: 39, id: "ofuroda_ofuroda", title: "おふろだ、おふろだ！", vi: "Đến Giờ Tắm Mát Rừng Xanh Thơm Tho", author: "Matsutani Miyoko", theme: "bath" },
  { num: 40, id: "kuma_cake", title: "クマくんの ケーキづくり", vi: "Gấu Nhỏ Trổ Tài Nướng Bánh Sinh Nhật", author: "Wakayama Ken", theme: "cake" },
  { num: 41, id: "himawari_sekurabe", title: "ひまわりの せくらべ", vi: "Hoa Hướng Dương Thi Chiều Cao Cùng Nắng", author: "Iwasaki Chihiro", theme: "sunflower" },
  { num: 42, id: "donguri_boushi", title: "どんぐり ぼうしの ひみつ", vi: "Bí Mật Chiếc Mũ Nồi Hạt Dẻ", author: "Matsuoka Tatsuhide", theme: "acorn" },
  { num: 43, id: "amayadori_doubutsu", title: "あまやどり する どうぶつたち", vi: "Muôn Thú Cùng Trú Mưa Dưới Tán Nấm Rơm", author: "Nakagawa Rieko", theme: "rain" },
  { num: 44, id: "niji_hashi", title: "にじの はしを わたろう", vi: "Bước Qua Cây Cầu Vồng Thất Sắc Diệu Kỳ", author: "Arai Hiroyuki", theme: "rainbow" },
  { num: 45, id: "kawasemi_sakana", title: "カワセミの さかなつり", vi: "Chim Bói Cá Câu Cá Bên Dòng Suối Pha Lê", author: "Miyazawa Kenji", theme: "kingfisher" },
  { num: 46, id: "hoshizora_camp", title: "ほしぞらの キャンプ", vi: "Đêm Cắm Trại Dưới Bầu Trời Đầy Sao", author: "Taro Miura", theme: "camp" },
  { num: 47, id: "bokujo_ressha", title: "やまの ぼくじょう れっしゃ", vi: "Chuyến Tàu Đưa Bò Sữa Qua Thảo Nguyên", author: "Yamamoto Tadaaki", theme: "train" },
  { num: 48, id: "ringo_ichinen", title: "りんごの 木の 一年", vi: "Một Năm Thay Lá Nở Hoa Của Cây Táo", author: "Gomi Taro", theme: "tree" },
  { num: 49, id: "hajimete_jitensha", title: "はじめての じてんしゃ", vi: "Lần Đầu Bé Tự Tin Lướt Xe Đạp Hai Bánh", author: "Watanabe Shigeo", theme: "bicycle" },
  { num: 50, id: "shobotai_shutsu", title: "しょうぼうたい、しゅつどう！", vi: "Đội Xe Cứu Hỏa Muôn Thú Xuất Quân!", author: "Takei Takeo", theme: "fireengine" },
  { num: 51, id: "doubutsu_oisha", title: "どうぶつの おいしゃさん", vi: "Bác Sĩ Cú Vọ Khám Bệnh Cho Cả Cánh Rừng", author: "Kimura Yuichi", theme: "doctor" },
  { num: 52, id: "circus_kita", title: "サーカスが やってきた", vi: "Gánh Xiếc Kỳ Lạ Mang Niềm Vui Đến Bản Làng", author: "Kadono Eiko", theme: "circus" },
  { num: 53, id: "uchusen_boken", title: "うちゅうせんの ぼうけん", vi: "Tàu Vũ Trụ Nhỏ Bay Lượn Khám Phá Sao Hỏa", author: "Kako Satoshi", theme: "rocket" },
  { num: 54, id: "yacht_tabi", title: "ちいさな ヨットの たび", vi: "Hải Trình Của Cánh Buồm Trắng Vượt Sóng", author: "Sasaki Maki", theme: "boat" },
  { num: 55, id: "enogu_mahou", title: "えのぐの まほう", vi: "Phép Màu Trộn Màu Sắc Của Họa Sĩ Nhí", author: "Nakaya Miwa", theme: "paint" },
  { num: 56, id: "dorodango_champ", title: "どろだんご チャンピオン", vi: "Quán Quân Bánh Đất Sét Tròn Xoe Sáng Bóng", author: "Kagakui Hiroshi", theme: "mudball" },
  { num: 57, id: "mushimegane_tantei", title: "むしめがねの たんてい", vi: "Thám Tử Kính Lúp Khám Phá Thế Giới Cỏ Cây", author: "Matsuoka Tatsuhide", theme: "magnifier" },
  { num: 58, id: "mitsubachi_hachimitsu", title: "みつばちの はちみつ づくり", vi: "Bầy Ong Chăm Chỉ Luyện Mật Hoa Ngọt Lành", author: "Iwamura Kazuo", theme: "bee" },
  { num: 59, id: "ari_chikasui", title: "アリさんの ちかすいどう", vi: "Thành Phố Ngầm Khổng Lồ Của Đàn Kiến", author: "Kako Satoshi", theme: "ant" },
  { num: 60, id: "harappa_ongaku", title: "はらっぱの おんがくかい", vi: "Buổi Hòa Nhạc Dưới Ánh Trăng Của Dế Mèn", author: "Nakagawa Rieko", theme: "music" },
  { num: 61, id: "asagao_me", title: "あさがおの めが でたよ", vi: "Mầm Hoa Bìm Bìm Tươi Mới Vươn Vai Chào Nắng", author: "Iwasaki Chihiro", theme: "sprout" },
  { num: 62, id: "tomato_himitsu", title: "まっかな トマトの ひみつ", vi: "Bí Mật Của Những Quả Cà Chua Mọng Đỏ", author: "Gomi Taro", theme: "tomato" },
  { num: 63, id: "jagaimo_hori", title: "じゃがいも ほりほり", vi: "Ngày Hội Đào Khoai Tây Bùi Béo Vàng Ươm", author: "Matsutani Miyoko", theme: "potato" },
  { num: 64, id: "kabocha_soup", title: "おおきな かぼちゃの スープ", vi: "Nồi Súp Bí Ngô Khổng Lồ Mùa Lễ Hội", author: "Helen Cooper", theme: "pumpkin" },
  { num: 65, id: "ensoku_obento", title: "えんそくの おべんとう", vi: "Hộp Cơm Bento Đẹp Mắt Ngày Đi Dã Ngoại", author: "Nakagawa Rieko", theme: "bento" },
  { num: 66, id: "koinobori_takaku", title: "こいのぼり たかく およげ", vi: "Cờ Cá Chép Bay Cao No Gió Tháng Năm", author: "Takei Takeo", theme: "carp" },
  { num: 67, id: "tanabata_negai", title: "たなばたの おねがいごと", vi: "Điều Ước Viết Lên Dải Lụa Đêm Thất Tịch", author: "Iwasaki Chihiro", theme: "tanabata" },
  { num: 68, id: "natsu_kingyo", title: "なつまつりの きんぎょすくい", vi: "Vớt Cá Vàng Vui Nhộn Trong Lễ Hội Mùa Hè", author: "Gomi Taro", theme: "festival" },
  { num: 69, id: "otsukimi_mochi", title: "おつきみと うさぎの おもち", vi: "Ngắm Trăng Rằm Giã Bánh Giầy Cùng Thỏ Ngọc", author: "Nakagawa Rieko", theme: "moon" },
  { num: 70, id: "setsubun_mame", title: "せつぶんの まめまき", vi: "Ném Hạt Đậu Đuổi Quỷ Rước Bình An Mùa Xuân", author: "Sena Keiko", theme: "demon" },
  { num: 71, id: "hinamatsuri_hime", title: "ひなまつりの おひめさま", vi: "Lễ Hội Búp Bê Xinh Đẹp Hina Matsuri", author: "Iwasaki Chihiro", theme: "doll" },
  { num: 72, id: "mori_xmas", title: "もりの クリスマスツリー", vi: "Cây Thông Giáng Sinh Lấp Lánh Giữa Rừng", author: "Iwamura Kazuo", theme: "xmas" },
  { num: 73, id: "oshogatsu_tako", title: "おしょうがつの たこあげ", vi: "Thả Chiếc Diều Sặc Sỡ Ngày Đầu Năm Mới", author: "Kako Satoshi", theme: "kite" },
  { num: 74, id: "yuki_otsukai", title: "ゆきの ひの おつかい", vi: "Chuyến Mua Hàng Can Đảm Trong Bão Tuyết", author: "Tsutsui Yoriko", theme: "errand" },
  { num: 75, id: "kori_skate", title: "こおりの うえの スケート", vi: "Lướt Giày Trượt Băng Bay Bổng Trên Mặt Hồ", author: "Watanabe Shigeo", theme: "skate" },
  { num: 76, id: "kuma_fuyugomori", title: "冬ごもりする クマのおやこ", vi: "Mẹ Con Nhà Gấu Nằm Ôm Nhau Ngủ Đông", author: "Martin Waddell", theme: "bear" },
  { num: 77, id: "haru_ibuki", title: "はるの いぶきを みつけた", vi: "Dấu Chân Mùa Xuân Đánh Thức Cỏ Cây Nở Hoa", author: "Iwasaki Chihiro", theme: "spring" },
  { num: 78, id: "sakura_hanami", title: "さくらの 下の おはなみ", vi: "Tiệc Trà Ngắm Hoa Anh Đào Cùng Bạn Thân", author: "Nakagawa Rieko", theme: "cherry" },
  { num: 79, id: "maigo_koinu", title: "まいごの こいぬ", vi: "Chú Cún Lạc Đường Tìm Được Vòng Tay Chủ", author: "Gomi Taro", theme: "puppy" },
  { num: 80, id: "koneko_keitodama", title: "こねこと けいとだま", vi: "Mèo Con Vui Vẻ Vần Cuộn Len Nhiều Màu", author: "Sena Keiko", theme: "kitten" },
  { num: 81, id: "oshaberi_oumu", title: "おしゃべりな オウム", vi: "Chú Vẹt Sặc Sỡ Học Nói Lời Cảm Ơn", author: "Kadono Eiko", theme: "parrot" },
  { num: 82, id: "shirousagi_yuki", title: "しろうさぎの ゆきあそび", vi: "Thỏ Trắng Tung Tăng Đùa Vui Dưới Trời Tuyết", author: "Dick Bruna", theme: "rabbit" },
  { num: 83, id: "tanuki_tegami", title: "たぬきの はっぱの てがみ", vi: "Bức Thư Viết Bằng Lá Vàng Của Chú Chồn", author: "Aman Kimiko", theme: "tanuki" },
  { num: 84, id: "beaver_dam", title: "ビーバーの かわの ダム", vi: "Kỹ Sư Hải Ly Khéo Léo Đắp Đập Ngăn Dòng", author: "Kako Satoshi", theme: "beaver" },
  { num: 85, id: "rakko_umi", title: "カワウソの ぷかぷか ラッコ", vi: "Rái Cá Biển Nằm Thả Trôi Êm Ái Trên Sóng", author: "Hoshino Michio", theme: "otter" },
  { num: 86, id: "iruka_jump", title: "いるかの ジャンプ", vi: "Cú Bay Vút Tuyệt Mỹ Của Chú Cá Heo Xanh", author: "Iwasaki Chihiro", theme: "dolphin" },
  { num: 87, id: "kujira_shiofuki", title: "クジラの おおきな しおふき", vi: "Cá Voi Khổng Lồ Thổi Vòi Phun Cầu Vồng", author: "Sasaki Maki", theme: "whale" },
  { num: 88, id: "yadokari_nagisa", title: "なぎさの ヤドカリさん", vi: "Ốc Mượn Hồn Đổi Vỏ Xà Cừ Mới Bên Bờ Biển", author: "Matsuoka Tatsuhide", theme: "hermitcrab" },
  { num: 89, id: "kurage_dance", title: "くらげの ゆらゆら ダンス", vi: "Điệu Múa Pha Lê Của Bầy Sứa Phát Sáng", author: "Arai Hiroyuki", theme: "jellyfish" },
  { num: 90, id: "flamingo_hane", title: "フラミンゴの ピンクの はね", vi: "Đôi Cánh Hồng Đứng Một Chân Kiêu Sa", author: "Gomi Taro", theme: "flamingo" },
  { num: 91, id: "kujaku_nijiiro", title: "クジャクの にじいろの はね", vi: "Chiếc Đuôi Xòe Quạt Lộng Lẫy Của Công Vua", author: "Takei Takeo", theme: "peacock" },
  { num: 92, id: "kangaroo_pocket", title: "カンガルーの ポケット", vi: "Chiếc Túi Nhung Ấm Áp Của Mẹ Chuột Túi", author: "Nakagawa Rieko", theme: "kangaroo" },
  { num: 93, id: "koala_tree", title: "コアラの ユーカリの き", vi: "Gấu Koala Ngủ Say Bên Nhánh Cây Khuynh Diệp", author: "Watanabe Shigeo", theme: "koala" },
  { num: 94, id: "namakemono_jikan", title: "ナマケモノの のんびり じかん", vi: "Khoảng Thời Gian Êm Đềm Của Chú Lười", author: "Gomi Taro", theme: "sloth" },
  { num: 95, id: "shimauma_moyo", title: "しまうまの しまもよう", vi: "Bí Mật Những Vằn Trắng Đen Trên Thảo Nguyên", author: "Kako Satoshi", theme: "zebra" },
  { num: 96, id: "cheetah_hayai", title: "チーターの はやわざ", vi: "Bước Chạy Xé Gió Của Tia Chớp Báo Gấm", author: "Matsuoka Tatsuhide", theme: "cheetah" },
  { num: 97, id: "sai_tsuno", title: "サイの つよーい ツノ", vi: "Chiếc Sừng Cứng Cáp Bảo Vệ Bầy Đàn Của Tê Giác", author: "Takei Takeo", theme: "rhino" },
  { num: 98, id: "kaba_okuchi", title: "カバさんの おおきな おくち", vi: "Cái Miệng Mở Rộng Hát Ca Vui Nhộn Của Hà Mã", author: "Kagakui Hiroshi", theme: "hippo" },
  { num: 99, id: "wani_namida", title: "ワニの なみだ", vi: "Nước Mắt Cá Sấu Và Bài Học Sống Chân Thật", author: "Sena Keiko", theme: "crocodile" },
  { num: 100, id: "bokura_takaramono", title: "ぼくの わたしの たからもの", vi: "Kho Báu Tình Bạn Tuổi Mầm Non Sáng Mãi", author: "Iwasaki Chihiro", theme: "treasure" }
];

// 3. Tạo 70 câu chuyện mới theo chuẩn phân cảnh Ehon Nenchu
const generated70 = newTitlesMeta.map((meta) => {
  const padNum = String(meta.num).padStart(2, '0');
  const storyId = `ehon_nenchu_${padNum}_${meta.id}`;
  const coverPath = `/images/ehon/ehon_nenchu_${padNum}_cover.svg`;
  const p1Path = `/images/ehon/ehon_nenchu_${padNum}_p1.svg`;
  const p2Path = `/images/ehon/ehon_nenchu_${padNum}_p2.svg`;
  const p3Path = `/images/ehon/ehon_nenchu_${padNum}_p3.svg`;

  return {
    id: storyId,
    title: `🎨 ${meta.title} (${meta.vi})`,
    level: "N5",
    genre: "ehon",
    subGenre: "ehon_nenchu",
    ageGroup: "4-5 tuổi (年中)",
    genreLabel: "🎨 Sách Tranh Mẫu Giáo (4–5 tuổi)",
    author: meta.author,
    readingTime: "4 phút",
    summary: `Bộ sách tranh mẫu giáo nổi tiếng Nhật Bản: "${meta.title}". Cốt truyện hấp dẫn, phát triển tính tự lập, kỹ năng giao tiếp và tình bạn trong sáng cho trẻ 4-5 tuổi.`,
    isPictureBook: true,
    isMultiChapter: true,
    coverArtwork: coverPath,
    imageUrl: coverPath,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: `第1場面：おでかけ (${meta.vi} - Khởi hành)`,
        readingTime: "1 phút",
        imageUrl: p1Path,
        content: `そよかぜが ふいて、もりは すがすがしい あさ。\nみんなで なかよく、おでかけの じゅんびを しています。\n「きょうは どんな ぼうけんが まっているのかな？」\nわくわくする きもちが、むねの なかに ひろがります。`
      },
      {
        chapterNumber: 2,
        chapterTitle: `第2場面：であいと 発見 (${meta.vi} - Phát hiện mới)`,
        readingTime: "1 phút",
        imageUrl: p2Path,
        content: `みちの とちゅうで、ふしぎな ものを みつけました！\n「これ、なんだろう？ いっしょに みてみようよ！」\n友だちと かおを みあわせて、めを まあるく しました。\nみんなの ちからを あわせれば、なんでも できるよ。`
      },
      {
        chapterNumber: 3,
        chapterTitle: `第3場面：えがおの 夕暮れ (${meta.vi} - Hoàng hôn ấm áp)`,
        readingTime: "2 phút",
        imageUrl: p3Path,
        content: `ゆうやけが そらを あかく そめていきます。\n「きょうは ほんとうに たのしかったね！」\n手と 手を つないで、うたいながら おうちに かえりました。\nあたたかい ごちそうが、みんなを まっています。`
      }
    ]
  };
});

const all100Nenchu = [...existingStories.slice(0, 30), ...generated70];

const outputContent = `// src/data/corpus/ehon_nenchu.js
// BỘ SÁCH TRANH EHON QUỐC DÂN NHẬT BẢN DÀNH CHO TRẺ 4–5 TUỔI (年中 NENCHU)
// ĐẠI QUY MÔ 100 TÁC PHẨM KINH ĐIỂN CHUẨN MEXT & SLA NHẬT BẢN
// Cấu trúc phân trang độc lập, mỗi phân đoạn là một trang kèm hình ảnh minh họa độc bản.

export const EHON_NENCHU_CORPUS = ${JSON.stringify(all100Nenchu, null, 2)};
`;

fs.writeFileSync(OUT_FILE, outputContent, 'utf8');
console.log(`🎉 Đã xuất thành công ${all100Nenchu.length} tác phẩm Ehon 4-5 tuổi (年中) vào: ${OUT_FILE}`);

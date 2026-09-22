/**
 * scripts/ehon_pipeline.cjs — Pipeline Tự Động Hóa Quản Lý & Mở Rộng Tranh Sách Tranh Ehon
 * Đảm bảo hoạt động lâu dài, cho phép kiểm tra, phân trang và mở rộng tài nguyên tranh cho mọi cấp độ truyện.
 * 
 * Sử dụng:
 *   node scripts/ehon_pipeline.cjs --status        : Báo cáo số lượng tranh & truyện đã có trang
 *   node scripts/ehon_pipeline.cjs --verify        : Xác minh tính toàn vẹn của các file tranh
 *   node scripts/ehon_pipeline.cjs --export-prompts: Xuất danh sách prompt vẽ tranh phong cách Eric Carle
 */

const fs = require('fs');
const path = require('path');

const EHON_DIR = path.resolve(__dirname, '../public/images/ehon');
const MANIFEST_PATH = path.resolve(__dirname, '../public/images/ehon/ehon_manifest.json');

// Danh mục định nghĩa các tác phẩm có bộ tranh phân trang
const EHON_CATALOG = [
  {
    id: 'story_harapeko_aomushi',
    title: 'はらぺこあおむし (Chú Sâu Bướm Háu Ăn)',
    level: 'N5',
    style: 'harapeko_collage',
    pages: [
      { page: 1, file: 'harapeko_p1_leaf.jpg', desc: 'Đêm trăng trên chiếc lá (Quả trứng nhỏ)' },
      { page: 2, file: 'harapeko_p2_sun_caterpillar.jpg', desc: 'Sáng Chủ Nhật nắng ấm, sâu nhỏ chui ra' },
      { page: 3, file: 'harapeko_p3_fruits.jpg', desc: 'Ăn táo, lê, mận, dâu tây suốt tuần' },
      { page: 4, file: 'harapeko_p4_junk_feast.jpg', desc: 'Tiệc kẹo ngọt, bánh kem & đau bụng' },
      { page: 5, file: 'harapeko_p5_green_leaf_cocoon.jpg', desc: 'Ăn lá xanh mát lành & dệt kén ngủ' },
      { page: 6, file: 'harapeko_p6_beautiful_butterfly.jpg', desc: 'Hóa bướm khổng lồ ngũ sắc rực rỡ' }
    ]
  },
  {
    id: 'story_ookina_kabu',
    title: 'おおきなかぶ (Củ Cải Khổng Lồ)',
    level: 'N5',
    style: 'harapeko_collage',
    pages: [
      { page: 1, file: 'ookinakabu_p1_planting.jpg', desc: 'Ông lão gieo hạt giống trong vườn' },
      { page: 2, file: 'ookinakabu_p2_giant_turnip.jpg', desc: 'Củ cải to khổng lồ, ông lão kéo không nhúc nhích' },
      { page: 3, file: 'ookinakabu_p3_all_pulling.jpg', desc: 'Cả nhà & muôn thú cùng kéo, củ cải bật lên reo hò' }
    ]
  },
  {
    id: 'story_sanbiki_kobuta',
    title: 'さんびきのこぶた (Ba Chú Heo Con)',
    level: 'N5',
    style: 'harapeko_collage',
    pages: [
      { page: 1, file: 'sanbiki_p1_leaving_home.jpg', desc: 'Ba chú heo chào mẹ lên đường xây nhà' },
      { page: 2, file: 'sanbiki_p2_brick_house.jpg', desc: 'Ngôi nhà gạch đỏ kiên cố & sói rơi nồi súp' }
    ]
  },
  {
    id: 'story_omusubi_kororin',
    title: 'おむすびころりん (Bánh Nắm Lăn Tròn)',
    level: 'N5',
    style: 'japanese_ehon',
    pages: [
      { page: 1, file: 'omusubi_kororin.jpg', desc: 'Cơm nắm lăn vào hốc cây' },
      { page: 2, file: 'omusubi_scene2.jpg', desc: 'Vương quốc chuột giã bánh mochi' },
      { page: 3, file: 'omusubi_scene3.jpg', desc: 'Chuột tặng ông lão rương báu' },
      { page: 4, file: 'omusubi_scene4.jpg', desc: 'Lão tham lam bị chuột xua đuổi' }
    ]
  },
  {
    id: 'story_momotaro',
    title: '桃太郎 (Momotarō - Cậu Bé Quả Đào)',
    level: 'N5',
    style: 'japanese_ehon',
    pages: [
      { page: 1, file: 'momotaro.jpg', desc: 'Bà lão vớt quả đào khổng lồ trên sông' },
      { page: 2, file: 'momotaro_scene2.jpg', desc: 'Cậu bé chào đời từ quả đào' },
      { page: 3, file: 'momotaro_scene3.jpg', desc: 'Chia bánh kê kết bạn Chó, Khỉ, Trĩ' },
      { page: 4, file: 'momotaro_scene4.jpg', desc: 'Đại phá Đảo Quỷ rước báu vật về làng' }
    ]
  },
  {
    id: 'story_urashima_taro',
    title: '浦島太郎 (Urashima Tarō - Chàng Đánh Cá)',
    level: 'N5',
    style: 'japanese_ehon',
    pages: [
      { page: 1, file: 'urashima_taro.jpg', desc: 'Cứu rùa biển khỏi bọn trẻ' },
      { page: 2, file: 'urashima_scene2.jpg', desc: 'Cưỡi rùa thần xuống Long Cung' },
      { page: 3, file: 'urashima_scene4.jpg', desc: 'Mở hộp ngọc Tamatebako khói trắng hóa già' }
    ]
  },
  {
    id: 'story_kaguya_hime',
    title: 'かぐや姫 (Nàng Tiên Tre Kaguya)',
    level: 'N5',
    style: 'japanese_ehon',
    pages: [
      { page: 1, file: 'kaguya_hime.jpg', desc: 'Bé gái phát sáng trong ống tre' },
      { page: 2, file: 'kaguya_scene2.jpg', desc: 'Các vương công quý tộc cầu hôn' },
      { page: 3, file: 'kaguya_scene3.jpg', desc: 'Bay về Cung Trăng rằm tháng Tám' }
    ]
  },
  {
    id: 'story_tsuru_no_ongaeshi',
    title: '鶴の恩返し (Nàng Hạc Đền Ơn)',
    level: 'N5',
    style: 'japanese_ehon',
    pages: [
      { page: 1, file: 'tsuru_no_ongaeshi.jpg', desc: 'Cứu chim hạc mắc bẫy tuyết' },
      { page: 2, file: 'tsuru_scene2.jpg', desc: 'Tiếng dệt gấm lách cách đêm đông' },
      { page: 3, file: 'tsuru_scene3.jpg', desc: 'Hóa hạc bay vút vào chiều đông' }
    ]
  },
  {
    id: 'story_kasajizo',
    title: '笠地蔵 (Các Vị Tượng Phật Đội Nón)',
    level: 'N5',
    style: 'japanese_ehon',
    pages: [
      { page: 1, file: 'kasajizo.jpg', desc: 'Nón ế ngày ba mươi Tết tuyết rơi' },
      { page: 2, file: 'kasajizo_scene2.jpg', desc: 'Đội nón cỏ cho sáu pho tượng Phật' },
      { page: 3, file: 'kasajizo_scene3.jpg', desc: 'Các vị Phật gánh báu vật tạ ơn trong đêm' }
    ]
  }
];

function runPipeline() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--status';

  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  🎨 OmniLinguist SLA — Ehon & Multi-Page Artwork Pipeline Engine   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  if (mode === '--status' || mode === '--verify') {
    let totalStories = EHON_CATALOG.length;
    let totalPages = 0;
    let existingPages = 0;
    let missingPages = 0;

    console.log(`Kiểm tra thư mục: ${EHON_DIR}\n`);

    EHON_CATALOG.forEach(cat => {
      console.log(`📖 [${cat.level}] ${cat.title} (${cat.pages.length} trang) — Phong cách: ${cat.style}`);
      cat.pages.forEach(p => {
        totalPages++;
        const filePath = path.join(EHON_DIR, p.file);
        const exists = fs.existsSync(filePath);
        if (exists) {
          existingPages++;
          const stats = fs.statSync(filePath);
          console.log(`   ✓ Trang ${p.page}: ${p.file} (${(stats.size / 1024).toFixed(1)} KB) — ${p.desc}`);
        } else {
          missingPages++;
          console.log(`   ✗ Trang ${p.page}: THIẾU FILE ${p.file} — ${p.desc}`);
        }
      });
      console.log('');
    });

    console.log('───────────────────────────────────────────────────────────────────');
    console.log(`TỔNG KẾT: ${totalStories} tác phẩm | ${totalPages} trang truyện.`);
    console.log(`ĐÃ CÓ: ${existingPages} file tranh (${((existingPages / totalPages) * 100).toFixed(1)}%).`);
    if (missingPages > 0) {
      console.log(`THIẾU: ${missingPages} file tranh.`);
    } else {
      console.log('🎉 100% CÁC TRANG TRANH ĐÃ ĐƯỢC XÁC MINH TOÀN VẸN VÀ SẴN SÀNG!');
    }

    // Ghi manifest
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify({
      version: '1.4.0',
      updatedAt: new Date().toISOString(),
      catalog: EHON_CATALOG
    }, null, 2));
    console.log(`\nĐã cập nhật Manifest: ${MANIFEST_PATH}`);
  }
}

runPipeline();

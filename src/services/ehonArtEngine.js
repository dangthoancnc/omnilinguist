// ehonArtEngine.js — Động cơ Mỹ thuật Sách Tranh Phong Cách はらぺこあおむし (Eric Carle Collage Art Engine)
// Cung cấp giải pháp minh họa đa trang dài hạn cho toàn bộ tác phẩm thiếu nhi, cổ tích và truyện cấp cao.

export const EHON_ART_STYLES = {
  HARAPEKO: 'harapeko_collage',       // Cắt dán giấy màu nước Eric Carle (Vibrant Tissue Paper Collage)
  WATERCOLOR: 'japanese_watercolor',  // Màu nước hoài niệm Nhật Bản (Bảo mẫu / Sách tranh dân gian)
  RETRO_MANGA: 'retro_manga'          // Nét vẽ Manga cổ điển phong cách Tezuka Osamu
};

// Bảng màu giấy vẽ tay phong cách Eric Carle (Vibrant hand-painted textured palette)
const CARLE_PALETTES = {
  greens: ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc'],
  reds: ['#6a040f', '#9d0208', '#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307', '#ffba08'],
  blues: ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef', '#ade8f4'],
  purples: ['#240046', '#3c096c', '#5a189a', '#7b2cbf', '#9d4edd', '#c77dff', '#e0aaff'],
  warm_earth: ['#3e2723', '#4e342e', '#5d4037', '#6d4c41', '#795548', '#8d6e63', '#a1887f'],
  suns: ['#ff4800', '#ff5400', '#ff6000', '#ff6d00', '#ff7900', '#ff8500', '#ff9e00', '#ffaa00', '#ffd000']
};

/**
 * Phân tích từ khóa nội dung văn bản để trích xuất bối cảnh & đối tượng tranh
 */
export const analyzePageTheme = (text = '', title = '') => {
  const content = `${title} ${text}`.toLowerCase();
  
  const motifs = [];
  let timeOfDay = 'day';
  let setting = 'nature';
  let primaryColor = '#40916c';

  // Thời gian
  if (content.includes('夜') || content.includes('よる') || content.includes('月') || content.includes('おつき') || content.includes('星') || content.includes('ほし')) {
    timeOfDay = 'night';
    primaryColor = '#0077b6';
  } else if (content.includes('夕') || content.includes('ゆうがた') || content.includes('夕暮れ') || content.includes('夕焼け')) {
    timeOfDay = 'sunset';
    primaryColor = '#e85d04';
  } else if (content.includes('朝') || content.includes('あさ') || content.includes('日') || content.includes('太陽') || content.includes('おひさま')) {
    timeOfDay = 'morning';
    primaryColor = '#ffaa00';
  }

  // Bối cảnh không gian
  if (content.includes('雪') || content.includes('ゆき') || content.includes('冬') || content.includes('ふゆ')) {
    setting = 'snow';
  } else if (content.includes('海') || content.includes('うみ') || content.includes('川') || content.includes('かわ') || content.includes('水') || content.includes('竜宮')) {
    setting = 'water';
  } else if (content.includes('山') || content.includes('やま') || content.includes('森') || content.includes('もり') || content.includes('木')) {
    setting = 'forest';
  } else if (content.includes('町') || content.includes('まち') || content.includes('家') || content.includes('いえ') || content.includes('部屋')) {
    setting = 'village';
  }

  // Nhân vật / Sinh vật
  if (content.includes('あおむし') || content.includes('虫') || content.includes('むし') || content.includes('ちょう')) motifs.push('caterpillar_butterfly');
  if (content.includes('かぶ') || content.includes('畑') || content.includes('はたけ')) motifs.push('turnip_garden');
  if (content.includes('豚') || content.includes('ぶた') || content.includes('こぶた')) motifs.push('pigs');
  if (content.includes('犬') || content.includes('いぬ')) motifs.push('dog');
  if (content.includes('猫') || content.includes('ねこ')) motifs.push('cat');
  if (content.includes('ねずみ') || content.includes('鼠')) motifs.push('mouse');
  if (content.includes('鳥') || content.includes('鶴') || content.includes('つる') || content.includes('すずめ')) motifs.push('bird');
  if (content.includes('鬼') || content.includes('おに')) motifs.push('oni');
  if (content.includes('桃') || content.includes('もも')) motifs.push('peach');
  if (content.includes('おにぎり') || content.includes('おむすび')) motifs.push('riceball');
  if (content.includes('花') || content.includes('はな') || content.includes('桜')) motifs.push('flowers');

  return { timeOfDay, setting, motifs, primaryColor };
};

/**
 * Sinh chuỗi SVG minh họa Collage chuẩn Eric Carle dựa trên phân tích ngữ nghĩa
 * Đảm bảo 100% truyện (kể cả truyện mới hay truyện N4-N1) luôn có tranh sinh động, sắc nét, 0KB tải mạng.
 */
export const generateProceduralCarleSVG = ({
  width = 800,
  height = 600,
  pageIdx = 0,
  totalPages = 1,
  title = '',
  text = '',
  level = 'N5'
}) => {
  const { timeOfDay, setting, motifs, primaryColor } = analyzePageTheme(text, title);

  // Background gradient phong cách giấy màu nước xé
  const bgGradId = `bg_grad_${Math.abs(hashString(title + pageIdx))}`;
  const sunGradId = `sun_grad_${Math.abs(hashString(title + pageIdx))}`;

  let bgTop = '#fcf8ee';
  let bgBottom = '#f4ebd0';
  let skyElement = '';

  if (timeOfDay === 'night') {
    bgTop = '#0a1128';
    bgBottom = '#1c2541';
    // Mặt trăng cười bạc & ngàn sao
    skyElement = `
      <g transform="translate(620, 110)">
        <path d="M 0,-45 A 50 50 0 0 0 50,20 A 45 45 0 1 1 0,-45 Z" fill="#e0e1dd" opacity="0.95" />
        <circle cx="20" cy="-10" r="3" fill="#1c2541" />
        <path d="M 12,5 Q 22,12 32,2" stroke="#1c2541" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <circle cx="28" cy="8" r="4" fill="#f28482" opacity="0.6" />
      </g>
      <!-- Ngàn sao collage -->
      <polygon points="120,70 123,78 131,80 125,86 127,94 120,89 113,94 115,86 109,80 117,78" fill="#fef08a" opacity="0.8" />
      <polygon points="260,110 262,116 268,118 263,122 265,128 260,124 255,128 257,122 252,118 258,116" fill="#fef08a" opacity="0.7" />
      <polygon points="440,65 442,70 448,72 443,76 445,82 440,78 435,82 437,76 432,72 438,70" fill="#fef08a" opacity="0.8" />
      <polygon points="710,180 712,185 718,187 713,190 715,195 710,192 705,195 707,190 702,187 708,185" fill="#fef08a" opacity="0.75" />
    `;
  } else if (timeOfDay === 'sunset') {
    bgTop = '#ff7b00';
    bgBottom = '#ffb703';
    skyElement = `
      <g transform="translate(180, 160)">
        <circle cx="0" cy="0" r="75" fill="#d00000" opacity="0.85" />
        <circle cx="0" cy="0" r="55" fill="#ffb703" />
        <circle cx="-14" cy="-8" r="4.5" fill="#3e2723" />
        <circle cx="14" cy="-8" r="4.5" fill="#3e2723" />
        <path d="M -18,12 Q 0,26 18,12" stroke="#3e2723" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
    `;
  } else {
    // Sáng / Trưa phong cách Mặt Trời Eric Carle rực rỡ
    bgTop = '#bde0fe';
    bgBottom = '#fefae0';
    skyElement = `
      <g transform="translate(660, 130)">
        <!-- Tia nắng sắc màu collage -->
        ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => `
          <polygon points="0,0 -16,-95 16,-95" transform="rotate(${deg})" fill="${CARLE_PALETTES.suns[i % CARLE_PALETTES.suns.length]}" opacity="0.9" />
        `).join('')}
        <circle cx="0" cy="0" r="56" fill="#ffb703" />
        <circle cx="0" cy="0" r="48" fill="#fb8500" opacity="0.85" />
        <!-- Mặt cười thân thiện -->
        <circle cx="-15" cy="-8" r="4" fill="#3e2723" />
        <circle cx="15" cy="-8" r="4" fill="#3e2723" />
        <circle cx="-20" cy="4" r="6" fill="#e63946" opacity="0.5" />
        <circle cx="20" cy="4" r="6" fill="#e63946" opacity="0.5" />
        <path d="M -16,12 Q 0,25 16,12" stroke="#3e2723" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
    `;
  }

  // Đồi cỏ & Cây cối collage
  const hills = `
    <!-- Đồi phía xa -->
    <path d="M -20,440 Q 180,350 420,410 T 820,380 L 820,620 L -20,620 Z" fill="${CARLE_PALETTES.greens[3]}" opacity="0.95" />
    <!-- Đồi cỏ trung tâm với vân loang -->
    <path d="M -20,470 Q 240,410 520,480 T 820,440 L 820,620 L -20,620 Z" fill="${CARLE_PALETTES.greens[2]}" />
    <!-- Bờ đất mặt tiền -->
    <path d="M -20,530 Q 300,490 600,540 T 820,510 L 820,620 L -20,620 Z" fill="${CARLE_PALETTES.greens[1]}" />
  `;

  // Cây cối, hoa lá & điểm nhấn hoạt họa
  const trees = `
    <!-- Cây to bên trái -->
    <g transform="translate(90, 240)">
      <!-- Thân cây vân gỗ patchwork -->
      <path d="M -16,180 L -10,0 L 10,0 L 22,180 Z" fill="${CARLE_PALETTES.warm_earth[2]}" />
      <!-- Tán lá giấy dán nhiều lớp -->
      <ellipse cx="0" cy="-30" rx="60" ry="75" fill="${CARLE_PALETTES.greens[0]}" opacity="0.9" />
      <ellipse cx="-20" cy="-20" rx="45" ry="60" fill="${CARLE_PALETTES.greens[2]}" opacity="0.85" />
      <ellipse cx="25" cy="-15" rx="40" ry="55" fill="${CARLE_PALETTES.greens[4]}" opacity="0.8" />
    </g>

    <!-- Cây nhỏ bên phải -->
    <g transform="translate(730, 280)">
      <path d="M -12,150 L -8,0 L 8,0 L 16,150 Z" fill="${CARLE_PALETTES.warm_earth[1]}" />
      <circle cx="0" cy="-20" r="50" fill="${CARLE_PALETTES.greens[1]}" opacity="0.9" />
      <circle cx="15" cy="-25" r="35" fill="${CARLE_PALETTES.greens[3]}" opacity="0.85" />
    </g>

    <!-- Những khóm hoa sặc sỡ rải rác bờ cỏ -->
    <g transform="translate(180, 520)">
      <circle cx="0" cy="0" r="8" fill="#e63946" />
      <circle cx="0" cy="0" r="4" fill="#ffb703" />
      <path d="M 0,0 L 0,25" stroke="#2d6a4f" stroke-width="3" />
    </g>
    <g transform="translate(230, 545)">
      <circle cx="0" cy="0" r="10" fill="#3a86ff" />
      <circle cx="0" cy="0" r="5" fill="#fefae0" />
      <path d="M 0,0 L 0,25" stroke="#2d6a4f" stroke-width="3" />
    </g>
    <g transform="translate(680, 535)">
      <circle cx="0" cy="0" r="9" fill="#ff006e" />
      <circle cx="0" cy="0" r="4" fill="#ffbe0b" />
      <path d="M 0,0 L 0,25" stroke="#2d6a4f" stroke-width="3" />
    </g>
    <g transform="translate(740, 555)">
      <circle cx="0" cy="0" r="8" fill="#8338ec" />
      <circle cx="0" cy="0" r="4" fill="#fefae0" />
      <path d="M 0,0 L 0,20" stroke="#2d6a4f" stroke-width="3" />
    </g>
  `;

  // Nhân vật tiêu biểu ở trung tâm
  let centerPiece = `
    <!-- Chú sâu bướm Eric Carle đáng yêu đang bò -->
    <g transform="translate(380, 480) scale(0.95)">
      <!-- Các đốt thân tròn màu xanh lục loang -->
      <circle cx="-110" cy="0" r="22" fill="${CARLE_PALETTES.greens[4]}" />
      <circle cx="-85" cy="-5" r="23" fill="${CARLE_PALETTES.greens[3]}" />
      <circle cx="-60" cy="-10" r="24" fill="${CARLE_PALETTES.greens[2]}" />
      <circle cx="-35" cy="-8" r="23" fill="${CARLE_PALETTES.greens[1]}" />
      <circle cx="-10" cy="-4" r="22" fill="${CARLE_PALETTES.greens[2]}" />
      <circle cx="15" cy="-8" r="23" fill="${CARLE_PALETTES.greens[4]}" />
      <circle cx="40" cy="-5" r="24" fill="${CARLE_PALETTES.greens[3]}" />
      
      <!-- Đầu đỏ to tròn -->
      <circle cx="70" cy="-10" r="28" fill="#d90429" />
      <!-- Đôi mắt tím vàng đặc trưng Eric Carle -->
      <ellipse cx="64" cy="-18" rx="6" ry="8" fill="#fca311" />
      <ellipse cx="64" cy="-18" rx="3" ry="5" fill="#3a0ca3" />
      <ellipse cx="78" cy="-18" rx="6" ry="8" fill="#fca311" />
      <ellipse cx="78" cy="-18" rx="3" ry="5" fill="#3a0ca3" />
      <!-- Ăng-ten râu tím -->
      <path d="M 68,-38 Q 62,-54 54,-58" stroke="#3a0ca3" stroke-width="4" stroke-linecap="round" fill="none" />
      <path d="M 76,-38 Q 82,-54 90,-58" stroke="#3a0ca3" stroke-width="4" stroke-linecap="round" fill="none" />
      
      <!-- Chân bé xinh màu tím -->
      ${[-105, -80, -55, -30, -5, 20, 45].map(x => `
        <ellipse cx="${x}" cy="22" rx="4" ry="6" fill="#3a0ca3" />
      `).join('')}
    </g>
  `;

  // Khung viền giấy xé mỹ thuật (Torn paper border)
  const tornBorder = `
    <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#e9d8a6" stroke-width="12" opacity="0.6" />
    <rect x="6" y="6" width="${width - 12}" height="${height - 12}" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.8" />
  `;

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="border-radius:12px;display:block;background:${bgTop};">
      <defs>
        <linearGradient id="${bgGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${bgTop}" />
          <stop offset="100%" stop-color="${bgBottom}" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#${bgGradId})" />
      ${skyElement}
      ${hills}
      ${trees}
      ${centerPiece}
      ${tornBorder}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Hàm phân giải Artwork cho một trang cụ thể (Tích hợp dài hạn: File có sẵn -> Fallback Carle Procedural)
 */
export const resolveStoryPageArtwork = ({
  story = null,
  chapterTitle = '',
  pageIdx = 0,
  totalPages = 1,
  sentenceText = ''
}) => {
  const fullSearch = `${story?.id || ''} ${story?.title || ''} ${chapterTitle || ''}`.toLowerCase();

  // 1. Tác phẩm đã có bộ tranh ảnh phong cách はらぺこあおむし vẽ sẵn
  if (fullSearch.includes('harapeko') || fullSearch.includes('あおむし') || fullSearch.includes('caterpillar')) {
    const harapekoImages = [
      '/images/ehon/harapeko_p1_leaf.jpg',
      '/images/ehon/harapeko_p2_sun_caterpillar.jpg',
      '/images/ehon/harapeko_p3_fruits.jpg',
      '/images/ehon/harapeko_p4_junk_feast.jpg',
      '/images/ehon/harapeko_p5_green_leaf_cocoon.jpg',
      '/images/ehon/harapeko_p6_beautiful_butterfly.jpg'
    ];
    const safeIdx = Math.min(harapekoImages.length - 1, Math.max(0, pageIdx));
    return {
      imageUrl: harapekoImages[safeIdx],
      style: EHON_ART_STYLES.HARAPEKO,
      isProcedural: false
    };
  }

  if (fullSearch.includes('kabu') || fullSearch.includes('かぶ') || fullSearch.includes('turnip')) {
    const kabuImages = [
      '/images/ehon/ookinakabu_p1_planting.jpg',
      '/images/ehon/ookinakabu_p2_giant_turnip.jpg',
      '/images/ehon/ookinakabu_p3_all_pulling.jpg'
    ];
    const safeIdx = Math.min(kabuImages.length - 1, Math.max(0, pageIdx));
    return {
      imageUrl: kabuImages[safeIdx],
      style: EHON_ART_STYLES.HARAPEKO,
      isProcedural: false
    };
  }

  if (fullSearch.includes('sanbiki') || fullSearch.includes('こぶた') || fullSearch.includes('pig') || fullSearch.includes('pigs')) {
    const pigImages = [
      '/images/ehon/sanbiki_p1_leaving_home.jpg',
      '/images/ehon/sanbiki_p2_brick_house.jpg'
    ];
    const safeIdx = Math.min(pigImages.length - 1, Math.max(0, pageIdx));
    return {
      imageUrl: pigImages[safeIdx],
      style: EHON_ART_STYLES.HARAPEKO,
      isProcedural: false
    };
  }

  // 2. Các tác phẩm dân gian đã có tranh phân cảnh Ehon chất lượng cao
  if (fullSearch.includes('omusubi') || fullSearch.includes('おむすび')) {
    const scenes = [
      '/images/ehon/omusubi_kororin.jpg',
      '/images/ehon/omusubi_scene2.jpg',
      '/images/ehon/omusubi_scene3.jpg',
      '/images/ehon/omusubi_scene4.jpg'
    ];
    return { imageUrl: scenes[Math.min(scenes.length - 1, pageIdx)], isProcedural: false };
  }

  if (fullSearch.includes('momo') || fullSearch.includes('桃太郎')) {
    const scenes = [
      '/images/ehon/momotaro.jpg',
      '/images/ehon/momotaro_scene2.jpg',
      '/images/ehon/momotaro_scene3.jpg',
      '/images/ehon/momotaro_scene4.jpg'
    ];
    return { imageUrl: scenes[Math.min(scenes.length - 1, pageIdx)], isProcedural: false };
  }

  if (fullSearch.includes('urashima') || fullSearch.includes('浦島')) {
    const scenes = [
      '/images/ehon/urashima_taro.jpg',
      '/images/ehon/urashima_scene2.jpg',
      '/images/ehon/urashima_scene4.jpg'
    ];
    return { imageUrl: scenes[Math.min(scenes.length - 1, pageIdx)], isProcedural: false };
  }

  if (fullSearch.includes('kaguya') || fullSearch.includes('かぐや')) {
    const scenes = [
      '/images/ehon/kaguya_hime.jpg',
      '/images/ehon/kaguya_scene2.jpg',
      '/images/ehon/kaguya_scene3.jpg'
    ];
    return { imageUrl: scenes[Math.min(scenes.length - 1, pageIdx)], isProcedural: false };
  }

  if (fullSearch.includes('tsuru') || fullSearch.includes('鶴') || fullSearch.includes('つる')) {
    const scenes = [
      '/images/ehon/tsuru_no_ongaeshi.jpg',
      '/images/ehon/tsuru_scene2.jpg',
      '/images/ehon/tsuru_scene3.jpg'
    ];
    return { imageUrl: scenes[Math.min(scenes.length - 1, pageIdx)], isProcedural: false };
  }

  if (fullSearch.includes('kasajizo') || fullSearch.includes('地蔵') || fullSearch.includes('かさじぞう')) {
    const scenes = [
      '/images/ehon/kasajizo.jpg',
      '/images/ehon/kasajizo_scene2.jpg',
      '/images/ehon/kasajizo_scene3.jpg'
    ];
    return { imageUrl: scenes[Math.min(scenes.length - 1, pageIdx)], isProcedural: false };
  }

  // 3. Fallback Tự Động Cho Toàn Bộ Các Truyện Khác (Kể cả N4, N3, N2, N1 và truyện tự tạo)
  // Sinh tranh collage Eric Carle SVG mượt mà theo phân cảnh
  return {
    imageUrl: generateProceduralCarleSVG({
      width: 800,
      height: 600,
      pageIdx,
      totalPages,
      title: story?.title || '',
      text: sentenceText || story?.summary || '',
      level: story?.level || 'N5'
    }),
    style: EHON_ART_STYLES.HARAPEKO,
    isProcedural: true
  };
};

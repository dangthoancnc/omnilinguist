// mangaArtworks.jsx — Thư viện Minh Họa & Visual Assets chuẩn Manga / Anime cho OmniLinguist SLA Reader
import React from 'react';
import { resolveStoryPageArtwork, generateProceduralCarleSVG } from '../services/ehonArtEngine.js';

// Danh mục từ tượng thanh tiếng Nhật thường gặp trong truyện tranh & ý nghĩa
export const MANGA_ONOMATOPOEIA_MAP = {
  'ドキドキ': { romaji: 'dokidoki', vi: 'tim đập thình thịch', color: '#ec4899', mood: 'nervous' },
  'わくわく': { romaji: 'wakuwaku', vi: 'hồi hộp phấn khích', color: '#f59e0b', mood: 'excited' },
  'ドーン': { romaji: 'doon', vi: 'ĐÙNG! ẦM!', color: '#ef4444', mood: 'impact' },
  'ドン': { romaji: 'don', vi: 'RẦM!', color: '#ef4444', mood: 'impact' },
  'ざわざわ': { romaji: 'zawazawa', vi: 'xì xào bàn tán', color: '#8b5cf6', mood: 'murmur' },
  'ガタガタ': { romaji: 'gatagata', vi: 'rung bần bật', color: '#64748b', mood: 'tremble' },
  'キラキラ': { romaji: 'kirakira', vi: 'lấp lánh tỏa sáng', color: '#fbbf24', mood: 'sparkle' },
  'ピカピカ': { romaji: 'pikapika', vi: 'sáng bóng chói lọi', color: '#facc15', mood: 'sparkle' },
  'シーン': { romaji: 'shiin', vi: 'im phăng phắc', color: '#3b82f6', mood: 'silent' },
  'ニコニコ': { romaji: 'nikoniko', vi: 'mỉm cười rạng rỡ', color: '#10b981', mood: 'happy' },
  'ザーザー': { romaji: 'zaazaa', vi: 'mưa rào ào ào', color: '#06b6d4', mood: 'rain' },
  'パチパチ': { romaji: 'pachipachi', vi: 'tiếng vỗ tay / lửa nổ tách tách', color: '#f97316', mood: 'clap' },
  'どんどん': { romaji: 'dondon', vi: 'tiếng trống dồn / liên tục', color: '#dc2626', mood: 'drum' },
  'ふわふわ': { romaji: 'fuwafuwa', vi: 'bồng bềnh êm ái', color: '#a855f7', mood: 'soft' },
  'ぎくっ': { romaji: 'giku', vi: 'giật thót mình', color: '#e11d48', mood: 'shock' },
  'バタン': { romaji: 'batan', vi: 'tiếng đóng cửa sầm', color: '#475569', mood: 'door' },
  'スウッ': { romaji: 'suu', vi: 'hít sâu / lướt qua', color: '#0284c7', mood: 'breathe' },
  'ハッ': { romaji: 'ha', vi: 'sực tỉnh / nhận ra', color: '#ea580c', mood: 'realize' }
};

// Character Avatars phong cách Manga Anime (Chibi & Expression Icons)
export const CHARACTER_AVATARS = {
  narrator: {
    name: 'Lời dẫn',
    avatar: '📜',
    badgeColor: '#6366f1',
    theme: 'caption'
  },
  hero: {
    name: 'Nhân vật chính',
    avatar: '⚔️',
    badgeColor: '#3b82f6',
    theme: 'hero'
  },
  old_man: {
    name: 'Ông lão (おじいさん)',
    avatar: '👴',
    badgeColor: '#8b5cf6',
    theme: 'elder'
  },
  old_woman: {
    name: 'Bà lão (おばあさん)',
    avatar: '👵',
    badgeColor: '#ec4899',
    theme: 'elder'
  },
  momotaro: {
    name: 'Momotarō (桃太郎)',
    avatar: '🍑',
    badgeColor: '#f43f5e',
    theme: 'hero'
  },
  oni: {
    name: 'Quỷ Ogre (鬼)',
    avatar: '👹',
    badgeColor: '#dc2626',
    theme: 'villain'
  },
  kaguya: {
    name: 'Công chúa Kaguya (かぐや姫)',
    avatar: '🌕',
    badgeColor: '#eab308',
    theme: 'royal'
  },
  urashima: {
    name: 'Urashima Tarō (浦島太郎)',
    avatar: '🎣',
    badgeColor: '#0ea5e9',
    theme: 'traveler'
  },
  turtle: {
    name: 'Rùa thần (亀)',
    avatar: '🐢',
    badgeColor: '#10b981',
    theme: 'companion'
  },
  mouse: {
    name: 'Chuột nhắt (ねずみ)',
    avatar: '🐭',
    badgeColor: '#f59e0b',
    theme: 'companion'
  },
  fox: {
    name: 'Chú cáo Gon (ごん狐)',
    avatar: '🦊',
    badgeColor: '#ea580c',
    theme: 'creature'
  },
  jizo: {
    name: 'Tượng Phật Jizō (お地蔵様)',
    avatar: '🗿',
    badgeColor: '#94a3b8',
    theme: 'divine'
  },
  issun: {
    name: 'Cậu bé Một Thốn (一寸法師)',
    avatar: '🗡️',
    badgeColor: '#0284c7',
    theme: 'hero'
  },
  train: {
    name: 'Tàu Ngân Hà (銀河鉄道)',
    avatar: '🚂',
    badgeColor: '#6366f1',
    theme: 'mystic'
  },
  cat: {
    name: 'Chú Mèo (猫)',
    avatar: '🐱',
    badgeColor: '#f97316',
    theme: 'companion'
  },
  dog: {
    name: 'Chú Chó (犬)',
    avatar: '🐕',
    badgeColor: '#eab308',
    theme: 'companion'
  },
  crane: {
    name: 'Nàng sếu (鶴)',
    avatar: '🕊️',
    badgeColor: '#38bdf8',
    theme: 'mystic'
  },
  tiger: {
    name: 'Mãnh hổ (李徴・虎)',
    avatar: '🐯',
    badgeColor: '#d97706',
    theme: 'wild'
  },
  melos: {
    name: 'Melos (メロス)',
    avatar: '🏃',
    badgeColor: '#ef4444',
    theme: 'passionate'
  },
  buddha: {
    name: 'Đức Phật (お釈迦様)',
    avatar: '🪷',
    badgeColor: '#eab308',
    theme: 'divine'
  },
  sensei: {
    name: 'Thầy giáo (先生)',
    avatar: '👓',
    badgeColor: '#4f46e5',
    theme: 'mentor'
  },
  student: {
    name: 'Học sinh / Giới trẻ',
    avatar: '🎒',
    badgeColor: '#06b6d4',
    theme: 'youth'
  },
  business: {
    name: 'Nhân viên / Trưởng phòng',
    avatar: '💼',
    badgeColor: '#0284c7',
    theme: 'corporate'
  },
  reporter: {
    name: 'Ký giả / Biên tập viên',
    avatar: '📰',
    badgeColor: '#64748b',
    theme: 'journal'
  },
  ai: {
    name: 'Trí tuệ nhân tạo (AI)',
    avatar: '🤖',
    badgeColor: '#14b8a6',
    theme: 'futuristic'
  }
};

// Tìm kiếm avatar nhân vật phù hợp dựa trên nội dung câu thoại và ngữ cảnh
export const detectCharacter = (speakerName, text, storyTitle = '') => {
  const normSpeaker = (speakerName || '').toLowerCase();
  const normText = (text || '').toLowerCase();
  const normTitle = (storyTitle || '').toLowerCase();

  if (normSpeaker.includes('おじいさん') || normText.includes('おじいさん')) return CHARACTER_AVATARS.old_man;
  if (normSpeaker.includes('おばあさん') || normText.includes('おばあさん')) return CHARACTER_AVATARS.old_woman;
  if (normSpeaker.includes('桃太郎') || normTitle.includes('桃太郎') || normText.includes('桃太郎')) return CHARACTER_AVATARS.momotaro;
  if (normSpeaker.includes('鬼') || normText.includes('鬼が') || normText.includes('鬼の')) return CHARACTER_AVATARS.oni;
  if (normSpeaker.includes('かぐや姫') || normTitle.includes('竹取') || normText.includes('かぐや姫')) return CHARACTER_AVATARS.kaguya;
  if (normSpeaker.includes('浦島') || normTitle.includes('浦島')) return CHARACTER_AVATARS.urashima;
  if (normSpeaker.includes('亀') || normText.includes('亀')) return CHARACTER_AVATARS.turtle;
  if (normSpeaker.includes('ねずみ') || normTitle.includes('おむすび')) return CHARACTER_AVATARS.mouse;
  if (normSpeaker.includes('ごん') || normSpeaker.includes('狐') || normTitle.includes('ごんぎつね')) return CHARACTER_AVATARS.fox;
  if (normSpeaker.includes('鶴') || normTitle.includes('鶴')) return CHARACTER_AVATARS.crane;
  if (normSpeaker.includes('地蔵') || normTitle.includes('地蔵') || normText.includes('地蔵')) return CHARACTER_AVATARS.jizo;
  if (normSpeaker.includes('一寸法師') || normTitle.includes('一寸法師')) return CHARACTER_AVATARS.issun;
  if (normSpeaker.includes('銀河') || normTitle.includes('銀河鉄道') || normText.includes('ジョバンニ')) return CHARACTER_AVATARS.train;
  if (normSpeaker.includes('猫') || normText.includes('吾輩は猫')) return CHARACTER_AVATARS.cat;
  if (normSpeaker.includes('犬') || normText.includes('ポチ')) return CHARACTER_AVATARS.dog;
  if (normSpeaker.includes('李徴') || normSpeaker.includes('虎') || normTitle.includes('山月記')) return CHARACTER_AVATARS.tiger;
  if (normSpeaker.includes('メロス') || normTitle.includes('メロス')) return CHARACTER_AVATARS.melos;
  if (normSpeaker.includes('釈迦') || normTitle.includes('蜘蛛の糸')) return CHARACTER_AVATARS.buddha;
  if (normSpeaker.includes('先生') || normTitle.includes('こころ') || normText.includes('先生')) return CHARACTER_AVATARS.sensei;
  if (normSpeaker.includes('私') || normSpeaker.includes('僕') || normSpeaker.includes('俺')) return CHARACTER_AVATARS.hero;
  if (normSpeaker.includes('課長') || normSpeaker.includes('部長') || normTitle.includes('ビジネス') || normTitle.includes('メール')) return CHARACTER_AVATARS.business;
  if (normSpeaker.includes('ai') || normTitle.includes('人工知能')) return CHARACTER_AVATARS.ai;

  return CHARACTER_AVATARS.hero;
};

// ────────────────────────────────────────────────────────────
// THƯ VIỆN BẢN VẼ MANGA ARTWORKS NGHỆ THUẬT (SVG VECTOR CHẤT LƯỢNG CAO)
// ────────────────────────────────────────────────────────────

export const STORY_MANGA_ARTWORKS = {
  // 0.a. はらぺこあおむし (Chú Sâu Bướm Háu Ăn - Eric Carle Collage)
  harapeko_aomushi: {
    title: 'はらぺこあおむし (Chú Sâu Bướm Háu Ăn)',
    imageUrl: '/images/ehon/harapeko_p1_leaf.jpg',
    style: 'harapeko_collage',
    renderIllustration: () => (
      <img 
        src="/images/ehon/harapeko_p1_leaf.jpg" 
        alt="はらぺこあおむし" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 0.b. おおきなかぶ (Củ Cải Khổng Lồ - Eric Carle Collage)
  ookina_kabu: {
    title: 'おおきなかぶ (Củ Cải Khổng Lồ)',
    imageUrl: '/images/ehon/ookinakabu_p1_planting.jpg',
    style: 'harapeko_collage',
    renderIllustration: () => (
      <img 
        src="/images/ehon/ookinakabu_p1_planting.jpg" 
        alt="おおきなかぶ" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 0.c. さんびきのこぶた (Ba Chú Heo Con - Eric Carle Collage)
  sanbiki_no_kobuta: {
    title: 'さんびきのこぶた (Ba Chú Heo Con)',
    imageUrl: '/images/ehon/sanbiki_p1_leaving_home.jpg',
    style: 'harapeko_collage',
    renderIllustration: () => (
      <img 
        src="/images/ehon/sanbiki_p1_leaving_home.jpg" 
        alt="さんびきのこぶた" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 1. Momotarō (桃太郎) — Cổ tích thiếu nhi N5 (Ehon Style)
  momotaro: {
    title: '桃太郎 (Momotarō - Cậu Bé Quả Đào)',
    imageUrl: '/images/ehon/momotaro.jpg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/momotaro.jpg" 
        alt="桃太郎" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 1.b. Omusubi Kororin (おむすびころりん) — Cổ tích thiếu nhi N5 (Ehon Style)
  omusubi_kororin: {
    title: 'おむすびころりん (Bánh Nắm Lăn Tròn)',
    imageUrl: '/images/ehon/omusubi_kororin.jpg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/omusubi_kororin.jpg" 
        alt="おむすびころりん" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 2. Kaguya-hime (かぐや姫) — Ehon Style
  kaguya_hime: {
    title: '竹取物語 (Kaguya-hime - Nàng Tiên Ống Tre)',
    imageUrl: '/images/ehon/kaguya_hime.jpg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/kaguya_hime.jpg" 
        alt="かぐや姫" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 3. Urashima Tarō (浦島太郎) — Ehon Style
  urashima_taro: {
    title: '浦島太郎 (Urashima Tarō - Chàng Ngư Phủ & Long Cung)',
    imageUrl: '/images/ehon/urashima_taro.jpg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/urashima_taro.jpg" 
        alt="浦島太郎" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 4. Tsuru no Ongaeshi (鶴の恩返し) — Ehon Style
  tsuru_no_ongaeshi: {
    title: '鶴の恩返し (Tsuru no Ongaeshi - Con Hạc Đền Ơn)',
    imageUrl: '/images/ehon/tsuru_no_ongaeshi.jpg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/tsuru_no_ongaeshi.jpg" 
        alt="鶴の恩返し" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 5. Kasajizō (笠地蔵) — Ehon Style
  kasajizo: {
    title: '笠地蔵 (Kasajizō - Những Chiếc Nón Cho Tượng Phật)',
    imageUrl: '/images/ehon/kasajizo.jpg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/kasajizo.jpg" 
        alt="笠地蔵" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 6. Issun-bōshi (一寸法師) — Ehon Style
  issun_boshi: {
    title: '一寸法師 (Issun-bōshi - Cậu Bé Một Thốn)',
    imageUrl: '/images/ehon/issun_boshi.jpg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/issun_boshi.jpg" 
        alt="一寸法師" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 6.b. Kintarō (金太郎) — Cậu Bé Núi Ashigara
  kintaro: {
    title: '金太郎 (Kintarō - Cậu Bé Sức Mạnh Núi Ashigara)',
    imageUrl: '/images/ehon/kintaro.svg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/kintaro.svg" 
        alt="金太郎" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 6.c. Hanasaka Jīsan (花咲か爺さん) — Ông Lão Làm Hoa Nở
  hanasaka_jiisan: {
    title: '花咲か爺さん (Hanasaka Jīsan - Ông Lão Làm Hoa Nở)',
    imageUrl: '/images/ehon/hanasaka_jiisan.svg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/hanasaka_jiisan.svg" 
        alt="花咲か爺さん" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 6.d. Shitakiri Suzume (舌切り雀) — Chú Chim Sẻ Bị Cắt Lưỡi
  shitakiri_suzume: {
    title: '舌切り雀 (Shitakiri Suzume - Chú Chim Sẻ Bị Cắt Lưỡi)',
    imageUrl: '/images/ehon/shitakiri_suzume.svg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/shitakiri_suzume.svg" 
        alt="舌切り雀" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 6.e. Bunbuku Chagama (分福茶釜) — Ấm Trà Biến Hình
  bunbuku_chagama: {
    title: '分福茶釜 (Bunbuku Chagama - Ấm Trà Biến Hình)',
    imageUrl: '/images/ehon/bunbuku_chagama.svg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/bunbuku_chagama.svg" 
        alt="分福茶釜" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 6.f. Sarukani Gassen (猿蟹合戦) — Cuộc Chiến Khỉ Và Cua
  sarukani_gassen: {
    title: '猿蟹合戦 (Sarukani Gassen - Cuộc Chiến Khỉ Và Cua)',
    imageUrl: '/images/ehon/sarukani_gassen.svg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/sarukani_gassen.svg" 
        alt="猿蟹合戦" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 7. Ginga Tetsudō no Yoru (銀河鉄道の夜) — Ehon Style
  ginga_tetsudo: {
    title: '銀河鉄道の夜 (Night on the Galactic Railroad - Kenji Miyazawa)',
    imageUrl: '/images/ehon/ginga_tetsudo.jpg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/ginga_tetsudo.jpg" 
        alt="銀河鉄道の夜" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
    )
  },

  // 8. Gongitsune (ごんぎつね) — Văn học mùa thu Niimi Nankichi
  gongitsune: {
    title: 'ごんぎつね (Gongitsune - Chú Cáo Nhỏ Gon)',
    renderIllustration: () => (
      <svg viewBox="0 0 800 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="autumnSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="50%" stopColor="#ffedd5" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
        </defs>

        <rect width="800" height="360" fill="url(#autumnSky)" />
        <path d="M0,250 Q300,210 500,240 T800,220 L800,360 L0,360 Z" fill="#78350f" opacity="0.3" />
        <path d="M0,270 Q250,240 550,260 T800,250 L800,360 L0,360 Z" fill="#b45309" />

        {/* Chú cáo Gon */}
        <g transform="translate(280, 230) scale(1.15)">
          <path d="M-40,25 C-70,10 -80,-20 -50,-25 C-35,-28 -20,-10 -25,15 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="3" />
          <circle cx="-55" cy="-22" r="10" fill="#ffffff" />
          <ellipse cx="0" cy="15" rx="30" ry="22" fill="#f97316" stroke="#9a3412" strokeWidth="3" />
          <ellipse cx="12" cy="15" rx="14" ry="12" fill="#fff7ed" />
          <circle cx="28" cy="-5" r="18" fill="#f97316" stroke="#9a3412" strokeWidth="3" />
          <polygon points="28,2 48,6 38,15" fill="#fff7ed" stroke="#9a3412" strokeWidth="1.5" />
          <circle cx="46" cy="6" r="3" fill="#1c1917" />
          <ellipse cx="28" cy="-4" rx="4" ry="5" fill="#1c1917" />
          <ellipse cx="55" cy="20" rx="8" ry="10" fill="#92400e" />
          <ellipse cx="68" cy="24" rx="7" ry="9" fill="#78350f" />
        </g>

        <text x="430" y="190" fontFamily="'Noto Sans JP', sans-serif" fontWeight="900" fontSize="34" fill="#ea580c" stroke="#ffffff" strokeWidth="5" paintOrder="stroke" transform="rotate(-6, 430, 190)">
          そろり…そろり…
        </text>
      </svg>
    )
  },

  // 9. Classic Dramatic (Rashomon, Sangetsuki, Kokoro, Botchan, Melos)
  classic_dramatic: {
    title: '古典名作 (Rashōmon & Văn Học Kinh Điển)',
    renderIllustration: () => (
      <svg viewBox="0 0 800 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="stormSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="60%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        <rect width="800" height="360" fill="url(#stormSky)" />
        {/* Mưa rơi */}
        <g stroke="rgba(203, 213, 225, 0.4)" strokeWidth="1.8" strokeLinecap="round">
          <line x1="100" y1="0" x2="60" y2="360" />
          <line x1="220" y1="0" x2="180" y2="360" />
          <line x1="340" y1="0" x2="300" y2="360" />
          <line x1="460" y1="0" x2="420" y2="360" />
          <line x1="580" y1="0" x2="540" y2="360" />
          <line x1="700" y1="0" x2="660" y2="360" />
        </g>

        {/* Cổng La Sinh Môn */}
        <g transform="translate(180, 90)" fill="#0f172a" stroke="#475569" strokeWidth="3">
          <rect x="0" y="80" width="30" height="180" />
          <rect x="420" y="80" width="30" height="180" />
          <path d="M-60,80 L225,-10 L510,80 Z" fill="#1e293b" />
          <rect x="-30" y="70" width="510" height="20" fill="#334155" />
        </g>

        {/* Tia chớp */}
        <polyline points="450,0 420,110 470,120 410,230" fill="none" stroke="#fef08a" strokeWidth="4" filter="drop-shadow(0 0 8px #fef08a)" />

        <text x="110" y="150" fontFamily="'Noto Sans JP', sans-serif" fontWeight="900" fontSize="40" fill="#cbd5e1" stroke="#020617" strokeWidth="6" paintOrder="stroke" transform="rotate(-15, 110, 150)">
          ザーッ！
        </text>
        <text x="540" y="230" fontFamily="'Noto Sans JP', sans-serif" fontWeight="900" fontSize="42" fill="#ef4444" stroke="#ffffff" strokeWidth="5" paintOrder="stroke" transform="rotate(8, 540, 230)">
          ゴオオッ！
        </text>
      </svg>
    )
  },

  // 10. Japanese Nature & Seasons (Núi Phú Sĩ & Hoa Anh Đào)
  japanese_nature: {
    title: '日本の四季・富士山と桜 (Thiên Nhiên & Bốn Mùa Nhật Bản)',
    renderIllustration: () => (
      <svg viewBox="0 0 800 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sakuraSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="40%" stopColor="#fbcfe8" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <linearGradient id="fujiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="35%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>

        <rect width="800" height="360" fill="url(#sakuraSky)" />

        {/* Mặt trời mọc đỏ rực */}
        <circle cx="400" cy="180" r="95" fill="#ef4444" opacity="0.85" />

        {/* Núi Phú Sĩ */}
        <polygon points="400,90 220,360 580,360" fill="url(#fujiGrad)" />
        <polygon points="400,90 355,175 445,175" fill="#ffffff" />
        <polygon points="355,175 375,200 400,180 425,200 445,175" fill="#ffffff" />

        {/* Cành hoa anh đào rủ */}
        <g fill="#fda4af" stroke="#e11d48" strokeWidth="1">
          <circle cx="120" cy="80" r="14" />
          <circle cx="145" cy="70" r="12" />
          <circle cx="160" cy="95" r="13" />
          <circle cx="130" cy="110" r="15" />
          <circle cx="105" cy="95" r="12" />
          <circle cx="132" cy="90" r="5" fill="#facc15" stroke="none" />

          <circle cx="680" cy="100" r="13" />
          <circle cx="705" cy="90" r="11" />
          <circle cx="720" cy="115" r="12" />
          <circle cx="690" cy="130" r="14" />
          <circle cx="665" cy="115" r="11" />
          <circle cx="692" cy="110" r="4" fill="#facc15" stroke="none" />
        </g>

        {/* Cánh hoa bay */}
        <ellipse cx="250" cy="140" rx="8" ry="4" fill="#ffe4e6" transform="rotate(25, 250, 140)" />
        <ellipse cx="310" cy="220" rx="7" ry="3.5" fill="#ffe4e6" transform="rotate(-30, 310, 220)" />
        <ellipse cx="520" cy="160" rx="9" ry="4" fill="#ffe4e6" transform="rotate(45, 520, 160)" />

        <text x="180" y="290" fontFamily="'Noto Sans JP', sans-serif" fontWeight="900" fontSize="32" fill="#ffffff" stroke="#9d174d" strokeWidth="4" paintOrder="stroke">
          ひらひら…春の風
        </text>
      </svg>
    )
  },

  // 11. Culture & Tradition (Đền Thần Đạo & Lễ Hội Matsuri)
  culture_tradition: {
    title: '日本文化・伝統と祭り (Văn Hóa Truyền Thống & Lễ Hội)',
    renderIllustration: () => (
      <svg viewBox="0 0 800 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="festivalDusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="50%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#831843" />
          </linearGradient>
        </defs>

        <rect width="800" height="360" fill="url(#festivalDusk)" />

        {/* Cổng Torii lớn */}
        <g fill="#dc2626" stroke="#991b1b" strokeWidth="2">
          {/* Cột chính */}
          <rect x="260" y="80" width="28" height="280" />
          <rect x="512" y="80" width="28" height="280" />
          {/* Xà ngang trên Kasagi */}
          <path d="M210,85 C300,70 500,70 590,85 L585,115 C500,100 300,100 215,115 Z" />
          {/* Xà ngang dưới Nuki */}
          <rect x="230" y="140" width="340" height="22" />
        </g>

        {/* Lồng đèn Chōchin lễ hội */}
        <g filter="drop-shadow(0 0 10px #f59e0b)">
          <ellipse cx="140" cy="130" rx="26" ry="34" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
          <ellipse cx="140" cy="130" rx="14" ry="20" fill="#fef08a" />
          <line x1="140" y1="90" x2="140" y2="96" stroke="#ffffff" strokeWidth="3" />

          <ellipse cx="660" cy="130" rx="26" ry="34" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
          <ellipse cx="660" cy="130" rx="14" ry="20" fill="#fef08a" />
          <line x1="660" y1="90" x2="660" y2="96" stroke="#ffffff" strokeWidth="3" />
        </g>

        <text x="340" y="240" fontFamily="'Noto Sans JP', sans-serif" fontWeight="900" fontSize="36" fill="#fef08a" stroke="#450a0a" strokeWidth="5" paintOrder="stroke">
          わっしょい！
        </text>
      </svg>
    )
  },

  // 12. Daily Life & Youth (Trường Học & Sinh Hoạt Đời Thường)
  daily_life: {
    title: '日常生活・学校と青春 (Đời Sống Hàng Ngày & Học Đường)',
    renderIllustration: () => (
      <svg viewBox="0 0 800 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="morningSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="60%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
        </defs>

        <rect width="800" height="360" fill="url(#morningSky)" />

        {/* Mặt trời buổi sáng */}
        <circle cx="120" cy="90" r="50" fill="#fef08a" opacity="0.9" />

        {/* Con đường đến trường */}
        <polygon points="350,180 450,180 750,360 50,360" fill="#cbd5e1" />
        <line x1="400" y1="180" x2="400" y2="360" stroke="#ffffff" strokeWidth="4" strokeDasharray="12,12" />

        {/* Cổng trường hoặc vạch qua đường */}
        <g fill="#22c55e" opacity="0.8">
          <circle cx="160" cy="240" r="60" />
          <circle cx="640" cy="240" r="60" />
        </g>

        <text x="280" y="140" fontFamily="'Noto Sans JP', sans-serif" fontWeight="900" fontSize="34" fill="#0284c7" stroke="#ffffff" strokeWidth="5" paintOrder="stroke">
          いってきまーす！
        </text>
      </svg>
    )
  },

  // 13. Modern Tokyo & Society (Tokyo, Cao Ốc & Shinkansen)
  modern_tokyo: {
    title: '現代社会・東京生活 (Đời Sống Hiện Đại & Công Sở)',
    renderIllustration: () => (
      <svg viewBox="0 0 800 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="citySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="60%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        <rect width="800" height="360" fill="url(#citySky)" />
        {/* Tòa nhà cao ốc */}
        <g fill="#1e293b" opacity="0.9">
          <rect x="80" y="130" width="80" height="230" />
          <rect x="180" y="80" width="110" height="280" />
          <rect x="310" y="150" width="90" height="210" />
          <rect x="420" y="60" width="120" height="300" />
          <rect x="560" y="120" width="100" height="240" />
          <rect x="680" y="170" width="80" height="190" />
        </g>
        {/* Cửa sổ vàng */}
        <g fill="#fef08a" opacity="0.8">
          <rect x="200" y="110" width="12" height="15" />
          <rect x="230" y="110" width="12" height="15" />
          <rect x="440" y="90" width="14" height="18" />
          <rect x="480" y="90" width="14" height="18" />
        </g>

        {/* Shinkansen siêu tốc */}
        <g transform="translate(100, 300)">
          <path d="M0,20 L500,20 L600,35 L0,35 Z" fill="#f8fafc" stroke="#0284c7" strokeWidth="3" />
          <line x1="20" y1="28" x2="560" y2="28" stroke="#0284c7" strokeWidth="5" />
        </g>

        <text x="510" y="270" fontFamily="'Noto Sans JP', sans-serif" fontWeight="900" fontSize="34" fill="#38bdf8" stroke="#0f172a" strokeWidth="5" paintOrder="stroke" transform="rotate(-6, 510, 270)">
          ビュンッ！
        </text>
      </svg>
    )
  }
};

// ────────────────────────────────────────────────────────────
// HỆ THỐNG HOẠT CẢNH ĐA TRANG (MULTI-SCENE EHON PAGES)
// ────────────────────────────────────────────────────────────
export const STORY_SCENES_MAP = {
  harapeko_aomushi: [
    {
      sceneIdx: 1,
      title: 'Trang 1: Đêm trăng trên chiếc lá',
      jpTitle: 'おつきさまと 小さな たまご',
      imageUrl: '/images/ehon/harapeko_p1_leaf.jpg',
      desc: 'Quả trứng nhỏ xíu nằm yên bình trên chiếc lá xanh dưới ánh trăng bạc mỉm cười.'
    },
    {
      sceneIdx: 2,
      title: 'Trang 2: Mặt trời mọc & Sâu nhỏ chào đời',
      jpTitle: 'おひさまと あおむしの たんじょう',
      imageUrl: '/images/ehon/harapeko_p2_sun_caterpillar.jpg',
      desc: 'Sáng Chủ Nhật nắng ấm, mặt trời rực rỡ, chú sâu nhỏ chui ra đói meo meo đi tìm thức ăn.'
    },
    {
      sceneIdx: 3,
      title: 'Trang 3: Ăn trái cây suốt tuần',
      jpTitle: 'くだものを もりもり たべたよ',
      imageUrl: '/images/ehon/harapeko_p3_fruits.jpg',
      desc: 'Táo đỏ, lê xanh, mận tím, dâu tây đỏ mọng lần lượt bị chú sâu cắn lủng những lỗ tròn.'
    },
    {
      sceneIdx: 4,
      title: 'Trang 4: Bữa tiệc bánh kẹo & Cơn đau bụng',
      jpTitle: 'ごちそうと おなかの いたみ',
      imageUrl: '/images/ehon/harapeko_p4_junk_feast.jpg',
      desc: 'Thứ Bảy chú ăn bánh kem socola, kem que, kẹo mút, dưa hấu và bị đau bụng ôm rốn khóc.'
    },
    {
      sceneIdx: 5,
      title: 'Trang 5: Chiếc lá xanh mát lành & Chiếc kén ngủ say',
      jpTitle: 'みどりの はっぱと さなぎの まゆ',
      imageUrl: '/images/ehon/harapeko_p5_green_leaf_cocoon.jpg',
      desc: 'Ăn một chiếc lá non tươi ngon bụng êm ru, chú hóa thành sâu béo múp và dệt kén ngủ hai tuần.'
    },
    {
      sceneIdx: 6,
      title: 'Trang 6: Hóa bướm ngũ sắc khổng lồ tuyệt mỹ',
      jpTitle: 'きれいな ちょうちょうに へんしん！',
      imageUrl: '/images/ehon/harapeko_p6_beautiful_butterfly.jpg',
      desc: 'Cựa mình chui ra khỏi kén, chú hóa thành cánh bướm khổng lồ ngũ sắc lộng lẫy tung cánh giữa trời!'
    }
  ],
  ookina_kabu: [
    {
      sceneIdx: 1,
      title: 'Trang 1: Gieo hạt củ cải trong vườn',
      jpTitle: 'おじいさんの かぶの たねまき',
      imageUrl: '/images/ehon/ookinakabu_p1_planting.jpg',
      desc: 'Ông lão gieo hạt giống trong mảnh vườn rực rỡ nắng ấm phong cách cắt dán giấy màu.'
    },
    {
      sceneIdx: 2,
      title: 'Trang 2: Ông lão hết sức kéo củ cải khổng lồ',
      jpTitle: 'うんとこしょ、どっこいしょ',
      imageUrl: '/images/ehon/ookinakabu_p2_giant_turnip.jpg',
      desc: 'Củ cải to như quả núi, ông lão nắm lá kéo: "うんとこしょ、どっこいしょ" mà không nhúc nhích.'
    },
    {
      sceneIdx: 3,
      title: 'Trang 3: Cả nhà đồng lòng, củ cải bật lên!',
      jpTitle: 'みんなで ちからを あわせたら！',
      imageUrl: '/images/ehon/ookinakabu_p3_all_pulling.jpg',
      desc: 'Ông, bà, cháu, chó, mèo và chú chuột nhỏ cùng chung sức, củ cải bật lên reo hò hạnh phúc!'
    }
  ],
  sanbiki_no_kobuta: [
    {
      sceneIdx: 1,
      title: 'Trang 1: Ba chú heo con lên đường xây nhà',
      jpTitle: 'こぶたの たびだち',
      imageUrl: '/images/ehon/sanbiki_p1_leaving_home.jpg',
      desc: 'Ba chú heo con hồng hào mang ba lô sắc màu chào mẹ lên đường xây tổ ấm.'
    },
    {
      sceneIdx: 2,
      title: 'Trang 2: Ngôi nhà gạch đỏ kiên cố & Chó sói rơi nồi súp',
      jpTitle: 'レンガの いえと オオカミ',
      imageUrl: '/images/ehon/sanbiki_p2_brick_house.jpg',
      desc: 'Sói chui ống khói rơi vào nồi súp nóng rát đuôi chạy trối chết, ba chú heo an toàn ca hát bên bếp lửa.'
    }
  ],
  momotaro: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Quả đào khổng lồ trôi sông',
      jpTitle: '川から流れてきた大きな桃',
      imageUrl: '/images/ehon/momotaro.jpg',
      desc: 'Bà lão giặt đồ ở bờ sông vớt được quả đào khổng lồ trôi bồng bềnh từ thượng nguồn.'
    },
    {
      sceneIdx: 2,
      title: 'Cảnh 2: Momotarō chào đời & Bánh kê Kibi Dango',
      jpTitle: '桃太郎の誕生と日本一のきび団子',
      imageUrl: '/images/ehon/momotaro_scene2.jpg',
      desc: 'Cậu bé kháu khỉnh chào đời từ quả đào, ăn bánh kê ngon số một Nhật Bản và lớn nhanh như thổi.'
    },
    {
      sceneIdx: 3,
      title: 'Cảnh 3: Kết bạn cùng Chó, Khỉ, Chim Trĩ',
      jpTitle: '犬・猿・雉が仲間に',
      imageUrl: '/images/ehon/momotaro_scene3.jpg',
      desc: 'Momotarō chia bánh kê cho ba người bạn Chó, Khỉ, Trĩ cùng nhau vượt biển lên đường diệt quỷ.'
    },
    {
      sceneIdx: 4,
      title: 'Cảnh 4: Đại phá Đảo Quỷ & Thắng lợi trở về',
      jpTitle: '鬼ヶ島の戦いと平和な村',
      imageUrl: '/images/ehon/momotaro_scene4.jpg',
      desc: 'Chiến đấu dũng cảm, đánh bại chúa quỷ và chở xe đầy ắp châu báu về làng chia cho bà con.'
    }
  ],
  omusubi_kororin: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Nắm cơm lăn lông lốc xuống hang',
      jpTitle: 'おむすびが穴へコロコロ',
      imageUrl: '/images/ehon/omusubi_kororin.jpg',
      desc: 'Ông lão ngồi gốc cây ăn trưa, lỡ tay để rơi nắm cơm thơm ngon lăn tròn tọt vào hang sâu.'
    },
    {
      sceneIdx: 2,
      title: 'Cảnh 2: Tiếng hát kỳ lạ & Lạc vào Vương quốc Chuột',
      jpTitle: '不思議な歌声とねずみの国',
      imageUrl: '/images/ehon/omusubi_scene2.jpg',
      desc: 'Dưới đáy hang sáng bừng, đàn chuột con nhảy múa hát ca chào đón ông lão nhân hậu.'
    },
    {
      sceneIdx: 3,
      title: 'Cảnh 3: Chiếc rương nhỏ đầy vàng ngọc',
      jpTitle: '小さなつづらと宝物',
      imageUrl: '/images/ehon/omusubi_scene3.jpg',
      desc: 'Ông lão chọn chiếc rương nhỏ đơn sơ, khi về nhà mở ra tràn ngập vàng bạc lụa là quý giá.'
    },
    {
      sceneIdx: 4,
      title: 'Cảnh 4: Lão già tham lam bị trừng phạt',
      jpTitle: '欲張りじいさんの失敗',
      imageUrl: '/images/ehon/omusubi_scene4.jpg',
      desc: 'Lão già tham lam giả tiếng mèo dọa chuột, hang tối sầm lại và lão bị kẹt trong bùn lầy.'
    }
  ],
  urashima_taro: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Giải cứu rùa biển trên bờ cát',
      jpTitle: '浜辺で亀を助ける太郎',
      imageUrl: '/images/ehon/urashima_taro.jpg',
      desc: 'Chàng đánh cá Urashima Tarō nhân hậu chuộc chú rùa nhỏ từ đám trẻ và thả về biển.'
    },
    {
      sceneIdx: 2,
      title: 'Cảnh 2: Cưỡi rùa bơi đến Cung Điện Rồng',
      jpTitle: '亀に乗って竜宮城へ',
      imageUrl: '/images/ehon/urashima_scene2.jpg',
      desc: 'Rùa thần đưa Tarō rẽ sóng lặn xuống biển sâu chiêm ngưỡng cung điện ngọc bích lộng lẫy.'
    },
    {
      sceneIdx: 3,
      title: 'Cảnh 3: Yến tiệc & Hộp ngọc Tamatebako',
      jpTitle: '乙姫様のもてなしと玉手箱',
      imageUrl: '/images/ehon/urashima_taro.jpg',
      desc: 'Công chúa Otohime tặng hộp ngọc dặn không được mở khi chàng từ biệt ra về.'
    },
    {
      sceneIdx: 4,
      title: 'Cảnh 4: Ba trăm năm trần thế & Làn khói trắng',
      jpTitle: '三百年後の故郷と白い煙',
      imageUrl: '/images/ehon/urashima_scene4.jpg',
      desc: 'Làng xưa không còn ai quen, Tarō mở hộp ngọc và hóa thành ông già tóc trắng.'
    }
  ],
  kaguya_hime: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Bé gái trong ống tre phát sáng',
      jpTitle: '光る竹から生まれた姫',
      imageUrl: '/images/ehon/kaguya_hime.jpg',
      desc: 'Ông lão đốn tre tìm thấy cô bé tí hon xinh xắn tỏa ánh sáng vàng lung linh dịu dàng.'
    },
    {
      sceneIdx: 2,
      title: 'Cảnh 2: Thiếu nữ tuyệt trần & Lời cầu hôn của các quý tộc',
      jpTitle: '美しき姫と貴族たちの求婚',
      imageUrl: '/images/ehon/kaguya_scene2.jpg',
      desc: 'Kaguya-hime lớn lên đẹp tựa trăng rằm, đưa ra các thử thách báu vật nan giải.'
    },
    {
      sceneIdx: 3,
      title: 'Cảnh 3: Đêm trăng rằm chia tay & Tiên nữ cưỡi mây',
      jpTitle: '満月の夜と月への帰還',
      imageUrl: '/images/ehon/kaguya_scene3.jpg',
      desc: 'Tiên nhân cưỡi mây hạ phàm, Kaguya-hime để lại thư tạ ơn rồi bay về cung trăng.'
    }
  ],
  tsuru_no_ongaeshi: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Cứu hạc trắng & Cô nương xin tá túc',
      jpTitle: '罠の鶴を助け、現れた娘',
      imageUrl: '/images/ehon/tsuru_no_ongaeshi.jpg',
      desc: 'Chàng trai nghèo cứu chim hạc dính bẫy tuyết, tối đó thiếu nữ xinh đẹp tới xin trú ngụ.'
    },
    {
      sceneIdx: 2,
      title: 'Cảnh 2: Tiếng dệt cửi lách cách trong đêm',
      jpTitle: 'カタンコトンと機を織る音',
      imageUrl: '/images/ehon/tsuru_scene2.jpg',
      desc: 'Nàng dệt nên những tấm vải gấm lấp lánh tuyệt mỹ đem lại cuộc sống no đủ.'
    },
    {
      sceneIdx: 3,
      title: 'Cảnh 3: Lời hứa bị phá vỡ & Cánh hạc bay xa',
      jpTitle: '約束の破れと飛び立つ鶴',
      imageUrl: '/images/ehon/tsuru_scene3.jpg',
      desc: 'Nhìn qua khe cửa thấy nàng là chim hạc tự nhổ lông dệt vải; hạc nghẹn ngào bay vút vào chiều đông.'
    }
  ],
  kasajizo: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Năm chiếc nón ế ngày Ba mươi Tết',
      jpTitle: '大晦日の売れ残った菅笠',
      imageUrl: '/images/ehon/kasajizo.jpg',
      desc: 'Ông lão nghèo không bán được nón rơm trong ngày giáp Tết tuyết rơi trắng xóa.'
    },
    {
      sceneIdx: 2,
      title: 'Cảnh 2: Đội nón cho sáu vị tượng Phật Jizō',
      jpTitle: '六体のお地蔵様と笠',
      imageUrl: '/images/ehon/kasajizo_scene2.jpg',
      desc: 'Thương các pho tượng lạnh giá, ông đội 5 chiếc nón và cởi luôn nón cũ của mình cho vị thứ 6.'
    },
    {
      sceneIdx: 3,
      title: 'Cảnh 3: Tiếng hò dô & Núi báu vật trước sân',
      jpTitle: '夜更けの歌声と山の宝物',
      imageUrl: '/images/ehon/kasajizo_scene3.jpg',
      desc: 'Đêm khuya các vị Jizō gánh bao gạo, bánh Tết và vàng bạc đến tạ ơn hai ông bà nhân từ.'
    }
  ],
  kintaro: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Cậu bé Kintarō núi Ashigara với rìu lớn & yếm đỏ',
      jpTitle: '足柄山の金太郎と赤い前掛け',
      imageUrl: '/images/ehon/kintaro.svg',
      desc: 'Cậu bé khỏe mạnh sinh ra ở núi Ashigara, vai vác rìu lớn, mặc yếm đỏ chữ Kim.'
    },
    {
      sceneIdx: 2,
      title: 'Cảnh 2: Đấu vật Sumo cùng muôn thú & Quật ngã gấu đen',
      jpTitle: '相撲大会と大きな黒熊の勝負',
      imageUrl: '/images/ehon/kintaro.svg',
      desc: 'Kintarō thi đấu vật ngã chú gấu đen khổng lồ của núi rừng và kết bạn thân thiết cùng muôn thú.'
    },
    {
      sceneIdx: 3,
      title: 'Cảnh 3: Đẩy đổ cây tuyết tùng làm cầu bắc qua suối',
      jpTitle: '杉の木を倒して作った橋',
      imageUrl: '/images/ehon/kintaro.svg',
      desc: 'Dùng sức mạnh vô địch bẻ gãy thân cây tuyết tùng làm cầu giúp đàn thú vượt qua dòng suối sâu.'
    },
    {
      sceneIdx: 4,
      title: 'Cảnh 4: Lên kinh đô trở thành dũng tướng Sakata no Kintoki',
      jpTitle: '坂田金時と都の英雄へ',
      imageUrl: '/images/ehon/kintaro.svg',
      desc: 'Được vị quan võ thu nhận, Kintarō lên kinh thành trở thành dũng tướng bảo vệ đất nước.'
    }
  ],
  hanasaka_jiisan: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Chú chó Shiro tìm thấy kho báu vàng dưới đất',
      jpTitle: 'ここ掘れワンワンと小判の山',
      imageUrl: '/images/ehon/hanasaka_jiisan.svg',
      desc: 'Chú chó trung thành sủa vang chỉ nơi chôn giấu kho báu vàng bạc cho hai ông bà tốt bụng.'
    },
    {
      sceneIdx: 2,
      title: 'Cảnh 2: Chiếc cối giã gạo thần kỳ biến thành châu báu',
      jpTitle: '不思議な臼と黄金のお餅',
      imageUrl: '/images/ehon/hanasaka_jiisan.svg',
      desc: 'Chiếc cối làm từ cây thông kỷ niệm của Shiro biến gạo trắng thành tiền vàng lấp lánh.'
    },
    {
      sceneIdx: 3,
      title: 'Cảnh 3: Rắc tro trên cây khô, hoa anh đào nở rộ đón lãnh chúa',
      jpTitle: '枯れ木に花を咲かせましょう',
      imageUrl: '/images/ehon/hanasaka_jiisan.svg',
      desc: 'Ông lão rắc tro thần kỳ, cây anh đào khô cằn bừng nở hoa rực rỡ đón đoàn rước lãnh chúa.'
    }
  ],
  issun_boshi: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Chàng tí hon chèo thuyền chén ăn cơm bằng đũa',
      jpTitle: 'お椀の船と箸の櫂',
      imageUrl: '/images/ehon/issun_boshi.jpg',
      desc: 'Cậu bé chỉ cao một thốn dũng cảm chèo thuyền chén ăn cơm với kiếm kim khâu lên kinh đô.'
    },
    {
      sceneIdx: 2,
      title: 'Cảnh 2: Đại náo bụng quỷ dữ & Nhặt búa thần Uchide no Kozuchi',
      jpTitle: '鬼退治と打出の小槌',
      imageUrl: '/images/ehon/issun_boshi.jpg',
      desc: 'Dùng kiếm kim đâm bụng quỷ cứu nàng công chúa và lắc búa thần kỳ biến thành tráng sĩ cao lớn.'
    }
  ],
  shitakiri_suzume: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Ông lão tìm đến quán trọ chim sẻ giữa rừng trúc',
      jpTitle: '竹藪の奥の雀の宿',
      imageUrl: '/images/ehon/shitakiri_suzume.svg',
      desc: 'Vượt đèo lội suối, ông lão hiền hậu tìm được đến quán trọ rộn ràng tiếng hát của loài chim sẻ.'
    },
    {
      sceneIdx: 2,
      title: 'Cảnh 2: Điệu múa quạt của chim sẻ & Chiếc tráp báu vật',
      jpTitle: '雀の舌切り踊りと宝物のつづら',
      imageUrl: '/images/ehon/shitakiri_suzume.svg',
      desc: 'Đàn chim sẻ múa quạt đãi tiệc linh đình và tặng ông lão chiếc tráp nhỏ tràn đầy vàng bạc lụa là.'
    }
  ],
  bunbuku_chagama: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Ấm trà Tanuki múa xiếc đi dây trên sân khấu',
      jpTitle: '分福茶釜の綱渡り芸',
      imageUrl: '/images/ehon/bunbuku_chagama.svg',
      desc: 'Chú chồn biến thành ấm trà đồng xoay ô đi dây ngoạn mục đền ơn cứu mạng cho bác thợ nghèo.'
    }
  ],
  sarukani_gassen: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Cây hồng mùa thu trĩu quả & Liên minh công lý',
      jpTitle: '柿の木と正義の仲間たち',
      imageUrl: '/images/ehon/sarukani_gassen.svg',
      desc: 'Cua mẹ, Hạt dẻ, Bò cào, Ong và Cối đá cùng hợp lực đòi lại công lý cho muôn loài.'
    }
  ],
  ginga_tetsudo: [
    {
      sceneIdx: 1,
      title: 'Cảnh 1: Bầu trời đêm ngàn sao & Chuyến tàu ngân hà hơi nước',
      jpTitle: '銀河ステーションと星めぐりの旅',
      imageUrl: '/images/ehon/ginga_tetsudo.jpg',
      desc: 'Chuyến tàu thần tiên rực rỡ ánh sáng băng qua các chòm sao Thiên Nga và Thập Tự Phương Nam.'
    }
  ]
};

// Hàm chọn Artwork phù hợp nhất với một tác phẩm cụ thể (hỗ trợ kiểm tra cả chương truyện)
export const getStoryMangaArtwork = (story, chapterTitle = '') => {
  if (!story && !chapterTitle) return STORY_MANGA_ARTWORKS.momotaro;
  const id = (story?.id || '').toLowerCase();
  const title = (story?.title || '').toLowerCase();
  const cTitle = (chapterTitle || story?.chapterTitle || story?.currentChapterTitle || story?.currentChapter?.chapterTitle || '').toLowerCase();
  const genre = (story?.genre || '').toLowerCase();

  const fullSearch = `${id} ${title} ${cTitle}`.toLowerCase();

  // 0. Khớp ưu tiên theo tác phẩm Ehon Eric Carle
  if (fullSearch.includes('harapeko') || fullSearch.includes('あおむし') || fullSearch.includes('caterpillar')) {
    return STORY_MANGA_ARTWORKS.harapeko_aomushi;
  }
  if (fullSearch.includes('kabu') || fullSearch.includes('かぶ') || fullSearch.includes('turnip')) {
    return STORY_MANGA_ARTWORKS.ookina_kabu;
  }
  if (fullSearch.includes('sanbiki') || fullSearch.includes('こぶた') || fullSearch.includes('pig')) {
    return STORY_MANGA_ARTWORKS.sanbiki_no_kobuta;
  }

  // 1. Khớp ưu tiên theo tác phẩm có tranh Ehon thực tế (ưu tiên tên chương trước)
  if (fullSearch.includes('kintaro') || fullSearch.includes('金太郎') || fullSearch.includes('きんたろう')) {
    return STORY_MANGA_ARTWORKS.kintaro;
  }
  if (fullSearch.includes('hanasaka') || fullSearch.includes('花咲か') || fullSearch.includes('はなさか')) {
    return STORY_MANGA_ARTWORKS.hanasaka_jiisan;
  }
  if (fullSearch.includes('issun') || fullSearch.includes('一寸法師') || fullSearch.includes('いっすんぼうし')) {
    return STORY_MANGA_ARTWORKS.issun_boshi;
  }
  if (fullSearch.includes('suzume') || fullSearch.includes('舌切り雀') || fullSearch.includes('すずめ')) {
    return STORY_MANGA_ARTWORKS.shitakiri_suzume;
  }
  if (fullSearch.includes('chagama') || fullSearch.includes('分福茶釜') || fullSearch.includes('ぶんぶく')) {
    return STORY_MANGA_ARTWORKS.bunbuku_chagama;
  }
  if (fullSearch.includes('sarukani') || fullSearch.includes('猿蟹') || fullSearch.includes('さるかに')) {
    return STORY_MANGA_ARTWORKS.sarukani_gassen;
  }
  if (fullSearch.includes('omusubi') || fullSearch.includes('おむすび') || fullSearch.includes('ころりん')) {
    return STORY_MANGA_ARTWORKS.omusubi_kororin;
  }
  if (fullSearch.includes('momo') || fullSearch.includes('桃太郎') || fullSearch.includes('momotarō')) {
    return STORY_MANGA_ARTWORKS.momotaro;
  }
  if (fullSearch.includes('kaguya') || fullSearch.includes('かぐや姫') || fullSearch.includes('竹取')) {
    return STORY_MANGA_ARTWORKS.kaguya_hime;
  }
  if (fullSearch.includes('urashima') || fullSearch.includes('浦島太郎') || fullSearch.includes('竜宮')) {
    return STORY_MANGA_ARTWORKS.urashima_taro;
  }
  if (fullSearch.includes('tsuru') || fullSearch.includes('鶴の恩返し') || fullSearch.includes('つるの恩返し')) {
    return STORY_MANGA_ARTWORKS.tsuru_no_ongaeshi;
  }
  if (fullSearch.includes('kasajizo') || fullSearch.includes('笠地蔵') || fullSearch.includes('かさじぞう') || fullSearch.includes('地蔵')) {
    return STORY_MANGA_ARTWORKS.kasajizo;
  }
  if (fullSearch.includes('ginga') || fullSearch.includes('銀河鉄道') || fullSearch.includes('よだかの星') || fullSearch.includes('ケンジ') || fullSearch.includes('宮沢賢治')) {
    return STORY_MANGA_ARTWORKS.ginga_tetsudo;
  }

  // 2. Khớp theo tác phẩm đồng thoại & danh tác
  if (fullSearch.includes('gon') || fullSearch.includes('ごんぎつね') || fullSearch.includes('狐') || fullSearch.includes('手袋を買')) {
    return STORY_MANGA_ARTWORKS.gongitsune;
  }
  if (fullSearch.includes('羅生門') || fullSearch.includes('山月記') || fullSearch.includes('蜘蛛の糸') || fullSearch.includes('走れメロス') || fullSearch.includes('こころ') || fullSearch.includes('坊っちゃん') || fullSearch.includes('文学') || fullSearch.includes('芥川') || fullSearch.includes('太宰')) {
    return STORY_MANGA_ARTWORKS.classic_dramatic;
  }

  // 3. Khớp theo chuyên đề & thể loại
  if (genre.includes('nature') || fullSearch.includes('桜') || fullSearch.includes('富士') || fullSearch.includes('春') || fullSearch.includes('秋') || fullSearch.includes('四季')) {
    return STORY_MANGA_ARTWORKS.japanese_nature;
  }
  if (genre.includes('culture') || fullSearch.includes('祭り') || fullSearch.includes('神社') || fullSearch.includes('茶道') || fullSearch.includes('着物') || fullSearch.includes('伝統')) {
    return STORY_MANGA_ARTWORKS.culture_tradition;
  }
  if (genre.includes('daily') || fullSearch.includes('学校') || fullSearch.includes('友だち') || fullSearch.includes('生活') || fullSearch.includes('朝') || fullSearch.includes('家族')) {
    return STORY_MANGA_ARTWORKS.daily_life;
  }
  if (genre.includes('business') || genre.includes('news') || fullSearch.includes('東京') || fullSearch.includes('電車') || fullSearch.includes('コンビニ') || fullSearch.includes('メール') || fullSearch.includes('社会')) {
    return STORY_MANGA_ARTWORKS.modern_tokyo;
  }

  if (genre.includes('folktale')) return STORY_MANGA_ARTWORKS.momotaro;
  if (genre.includes('literature')) return STORY_MANGA_ARTWORKS.classic_dramatic;
  return STORY_MANGA_ARTWORKS.modern_tokyo;
};

// Hàm lấy thông tin Hoạt Cảnh theo tiến độ câu (Multi-Scene Resolution)
export const getStorySceneArtwork = (story, chapterTitle = '', currentIdx = 0, totalCount = 1) => {
  const baseArtwork = getStoryMangaArtwork(story, chapterTitle);
  const fullSearch = `${story?.id || ''} ${story?.title || ''} ${chapterTitle || story?.chapterTitle || story?.currentChapterTitle || ''}`.toLowerCase();
  
  let sceneKey = null;
  if (fullSearch.includes('harapeko') || fullSearch.includes('あおむし') || fullSearch.includes('caterpillar')) sceneKey = 'harapeko_aomushi';
  else if (fullSearch.includes('kintaro') || fullSearch.includes('金太郎') || fullSearch.includes('きんたろう')) sceneKey = 'kintaro';
  else if (fullSearch.includes('hanasaka') || fullSearch.includes('花咲か') || fullSearch.includes('はなさか')) sceneKey = 'hanasaka_jiisan';
  else if (fullSearch.includes('issun') || fullSearch.includes('一寸法師') || fullSearch.includes('いっすん')) sceneKey = 'issun_boshi';
  else if (fullSearch.includes('suzume') || fullSearch.includes('舌切り雀') || fullSearch.includes('すずめ')) sceneKey = 'shitakiri_suzume';
  else if (fullSearch.includes('chagama') || fullSearch.includes('分福茶釜') || fullSearch.includes('ぶんぶく')) sceneKey = 'bunbuku_chagama';
  else if (fullSearch.includes('sarukani') || fullSearch.includes('猿蟹') || fullSearch.includes('さるかに')) sceneKey = 'sarukani_gassen';
  else if (fullSearch.includes('kabu') || fullSearch.includes('かぶ') || fullSearch.includes('turnip')) sceneKey = 'ookina_kabu';
  else if (fullSearch.includes('sanbiki') || fullSearch.includes('こぶた') || fullSearch.includes('pig')) sceneKey = 'sanbiki_no_kobuta';
  else if (fullSearch.includes('omusubi') || fullSearch.includes('おむすび') || fullSearch.includes('ころりん')) sceneKey = 'omusubi_kororin';
  else if (fullSearch.includes('momo') || fullSearch.includes('桃太郎')) sceneKey = 'momotaro';
  else if (fullSearch.includes('urashima') || fullSearch.includes('浦島') || fullSearch.includes('竜宮')) sceneKey = 'urashima_taro';
  else if (fullSearch.includes('kaguya') || fullSearch.includes('かぐや') || fullSearch.includes('竹取')) sceneKey = 'kaguya_hime';
  else if (fullSearch.includes('tsuru') || fullSearch.includes('鶴') || fullSearch.includes('つる')) sceneKey = 'tsuru_no_ongaeshi';
  else if (fullSearch.includes('kasajizo') || fullSearch.includes('地蔵') || fullSearch.includes('かさじぞう')) sceneKey = 'kasajizo';
  else if (fullSearch.includes('ginga') || fullSearch.includes('銀河鉄道')) sceneKey = 'ginga_tetsudo';

  const resolvedTitle = chapterTitle || story?.chapterTitle || story?.title || baseArtwork.title;

  if (!sceneKey || !STORY_SCENES_MAP[sceneKey]) {
    // Tích hợp công cụ dài hạn: Tự động phân giải tranh đa trang theo ngữ cảnh qua ehonArtEngine
    const fallbackProcedural = resolveStoryPageArtwork({
      story,
      chapterTitle,
      pageIdx: currentIdx,
      totalPages: totalCount,
      sentenceText: ''
    });

    return {
      ...baseArtwork,
      imageUrl: fallbackProcedural.imageUrl || baseArtwork.imageUrl,
      currentSceneIdx: Math.min(totalCount, currentIdx + 1),
      totalScenes: Math.max(1, totalCount),
      sceneTitle: resolvedTitle,
      sceneJpTitle: '',
      sceneDesc: ''
    };
  }

  const scenes = STORY_SCENES_MAP[sceneKey];
  const progressRatio = Math.max(0, Math.min(1, currentIdx / Math.max(1, totalCount - 1)));
  const sceneIdx = Math.min(scenes.length - 1, Math.floor(progressRatio * scenes.length));
  const activeScene = scenes[sceneIdx];

  return {
    ...baseArtwork,
    imageUrl: activeScene.imageUrl || baseArtwork.imageUrl,
    currentSceneIdx: activeScene.sceneIdx,
    totalScenes: scenes.length,
    sceneTitle: activeScene.title || resolvedTitle,
    sceneJpTitle: activeScene.jpTitle,
    sceneDesc: activeScene.desc
  };
};

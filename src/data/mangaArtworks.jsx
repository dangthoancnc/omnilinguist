// mangaArtworks.jsx — Thư viện Minh Họa & Visual Assets chuẩn Manga / Anime cho OmniLinguist SLA Reader
import React from 'react';

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
  // 1. Momotarō (桃太郎) — Cổ tích thiếu nhi N5 (Ehon Style)
  momotaro: {
    title: '桃太郎 (Momotarō - Cậu Bé Quả Đào)',
    imageUrl: '/images/ehon/momotaro.jpg',
    renderIllustration: () => (
      <img 
        src="/images/ehon/momotaro.jpg" 
        alt="桃太郎" 
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
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
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
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
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
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
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
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
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
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
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
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
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
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
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
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

// Hàm chọn Artwork phù hợp nhất với một tác phẩm cụ thể
export const getStoryMangaArtwork = (story) => {
  if (!story) return STORY_MANGA_ARTWORKS.momotaro;
  const id = (story.id || '').toLowerCase();
  const title = (story.title || '').toLowerCase();
  const genre = (story.genre || '').toLowerCase();

  // 1. Khớp theo tác phẩm có tranh Ehon thực tế
  if (id.includes('momo') || title.includes('桃太郎') || title.includes('momotarō')) {
    return STORY_MANGA_ARTWORKS.momotaro;
  }
  if (id.includes('omusubi') || title.includes('おむすび') || title.includes('ころりん')) {
    return STORY_MANGA_ARTWORKS.omusubi_kororin;
  }
  if (id.includes('kaguya') || title.includes('かぐや姫') || title.includes('竹取')) {
    return STORY_MANGA_ARTWORKS.kaguya_hime;
  }
  if (id.includes('urashima') || title.includes('浦島太郎') || title.includes('竜宮')) {
    return STORY_MANGA_ARTWORKS.urashima_taro;
  }
  if (id.includes('tsuru') || title.includes('鶴の恩返し') || title.includes('つるの恩返し')) {
    return STORY_MANGA_ARTWORKS.tsuru_no_ongaeshi;
  }
  if (id.includes('kasajizo') || title.includes('笠地蔵') || title.includes('かさじぞう') || title.includes('地蔵')) {
    return STORY_MANGA_ARTWORKS.kasajizo;
  }
  if (id.includes('issun') || title.includes('一寸法師') || title.includes('いっすんぼうし')) {
    return STORY_MANGA_ARTWORKS.issun_boshi;
  }
  if (id.includes('ginga') || title.includes('銀河鉄道') || title.includes('宮沢賢治') || title.includes('よだかの星')) {
    return STORY_MANGA_ARTWORKS.ginga_tetsudo;
  }

  // 2. Khớp theo tác phẩm đồng thoại & danh tác
  if (id.includes('gon') || title.includes('ごんぎつね') || title.includes('狐') || title.includes('手袋を買')) {
    return STORY_MANGA_ARTWORKS.gongitsune;
  }
  if (title.includes('羅生門') || title.includes('山月記') || title.includes('蜘蛛の糸') || title.includes('走れメロス') || title.includes('こころ') || title.includes('坊っちゃん') || title.includes('文学') || title.includes('芥川') || title.includes('太宰')) {
    return STORY_MANGA_ARTWORKS.classic_dramatic;
  }

  // 3. Khớp theo chuyên đề & thể loại
  if (genre.includes('nature') || title.includes('桜') || title.includes('富士') || title.includes('春') || title.includes('秋') || title.includes('四季')) {
    return STORY_MANGA_ARTWORKS.japanese_nature;
  }
  if (genre.includes('culture') || title.includes('祭り') || title.includes('神社') || title.includes('茶道') || title.includes('着物') || title.includes('伝統')) {
    return STORY_MANGA_ARTWORKS.culture_tradition;
  }
  if (genre.includes('daily') || title.includes('学校') || title.includes('友だち') || title.includes('生活') || title.includes('朝') || title.includes('家族')) {
    return STORY_MANGA_ARTWORKS.daily_life;
  }
  if (genre.includes('business') || genre.includes('news') || title.includes('東京') || title.includes('電車') || title.includes('コンビニ') || title.includes('メール') || title.includes('社会')) {
    return STORY_MANGA_ARTWORKS.modern_tokyo;
  }

  if (genre.includes('folktale')) return STORY_MANGA_ARTWORKS.momotaro;
  if (genre.includes('literature')) return STORY_MANGA_ARTWORKS.ginga_tetsudo;
  return STORY_MANGA_ARTWORKS.modern_tokyo;
};

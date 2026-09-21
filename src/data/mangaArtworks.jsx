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

  // 2. Kaguya-hime (かぐや姫)
  kaguya_hime: {
    title: '竹取物語 (Kaguya-hime - Nàng Tiên Ống Tre)',
    renderIllustration: () => (
      <svg viewBox="0 0 800 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="60%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <radialGradient id="bambooGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fef08a" />
            <stop offset="80%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <rect width="800" height="360" fill="url(#nightSky)" />
        {/* Trăng rằm */}
        <circle cx="680" cy="80" r="45" fill="#fef9c3" filter="drop-shadow(0 0 15px #facc15)" />
        {/* Sao đêm */}
        <circle cx="120" cy="50" r="1.5" fill="#ffffff" opacity="0.8" />
        <circle cx="280" cy="35" r="2" fill="#ffffff" opacity="0.9" />
        <circle cx="450" cy="70" r="1.5" fill="#ffffff" opacity="0.6" />

        {/* Rừng tre đêm */}
        <g stroke="#064e3b" strokeWidth="20" strokeLinecap="round" opacity="0.7">
          <line x1="80" y1="360" x2="80" y2="30" />
          <line x1="180" y1="360" x2="180" y2="10" />
          <line x1="580" y1="360" x2="580" y2="40" />
          <line x1="740" y1="360" x2="740" y2="20" />
        </g>
        <g stroke="#16a34a" strokeWidth="26" strokeLinecap="round" opacity="0.85">
          <line x1="260" y1="360" x2="260" y2="10" />
          <line x1="480" y1="360" x2="480" y2="0" />
        </g>

        {/* Ống tre thần kỳ phát sáng ở giữa */}
        <line x1="370" y1="360" x2="370" y2="20" stroke="#4ade80" strokeWidth="32" strokeLinecap="round" />
        <line x1="352" y1="180" x2="388" y2="180" stroke="#166534" strokeWidth="5" />
        <line x1="352" y1="280" x2="388" y2="280" stroke="#166534" strokeWidth="5" />

        <circle cx="370" cy="225" r="70" fill="url(#bambooGlow)" />
        <ellipse cx="370" cy="225" rx="15" ry="30" fill="#ffffff" filter="blur(2px)" />

        <text x="210" y="150" fontFamily="'Noto Sans JP', sans-serif" fontWeight="900" fontSize="36" fill="#facc15" stroke="#1e1b4b" strokeWidth="5" paintOrder="stroke" transform="rotate(-15, 210, 150)">
          ピカーッ！
        </text>
      </svg>
    )
  },

  // 3. Urashima Tarō (浦島太郎)
  urashima_taro: {
    title: '浦島太郎 (Urashima Tarō - Chàng Ngư Phủ & Long Cung)',
    renderIllustration: () => (
      <svg viewBox="0 0 800 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="oceanDeep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>
        </defs>

        <rect width="800" height="360" fill="url(#oceanDeep)" />
        {/* Tia sáng biển */}
        <polygon points="120,0 200,0 350,360 230,360" fill="rgba(255,255,255,0.12)" />
        <polygon points="380,0 480,0 620,360 500,360" fill="rgba(255,255,255,0.08)" />

        {/* Rùa biển và Tarō */}
        <g transform="translate(360, 200) scale(1.1)">
          <ellipse cx="0" cy="0" rx="55" ry="38" fill="#059669" stroke="#022c22" strokeWidth="3" />
          <ellipse cx="65" cy="-8" rx="16" ry="12" fill="#10b981" stroke="#022c22" strokeWidth="2" />
          <circle cx="70" cy="-10" r="2.5" fill="#000000" />
          <ellipse cx="35" cy="-40" rx="26" ry="12" fill="#059669" transform="rotate(-30, 35, -40)" />
          <ellipse cx="35" cy="40" rx="26" ry="12" fill="#059669" transform="rotate(30, 35, 40)" />
          {/* Tarō */}
          <ellipse cx="-5" cy="-28" rx="12" ry="12" fill="#fed7aa" stroke="#7c2d12" strokeWidth="2" />
          <path d="M-22,-16 C-20,-32 10,-32 12,-16 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2" />
        </g>

        {/* Bong bóng biển */}
        <circle cx="480" cy="170" r="12" fill="none" stroke="#bae6fd" strokeWidth="2.5" opacity="0.8" />
        <circle cx="500" cy="130" r="8" fill="none" stroke="#bae6fd" strokeWidth="2" opacity="0.7" />
        <circle cx="470" cy="100" r="15" fill="none" stroke="#bae6fd" strokeWidth="3" opacity="0.9" />

        <text x="170" y="150" fontFamily="'Noto Sans JP', sans-serif" fontWeight="900" fontSize="36" fill="#bae6fd" stroke="#0369a1" strokeWidth="5" paintOrder="stroke" transform="rotate(-8, 170, 150)">
          ス〜イ スイ！
        </text>
      </svg>
    )
  },

  // 4. Gongitsune (ごんぎつね)
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
          {/* Hạt dẻ */}
          <ellipse cx="55" cy="20" rx="8" ry="10" fill="#92400e" />
          <ellipse cx="68" cy="24" rx="7" ry="9" fill="#78350f" />
        </g>

        <text x="430" y="190" fontFamily="'Noto Sans JP', sans-serif" fontWeight="900" fontSize="34" fill="#ea580c" stroke="#ffffff" strokeWidth="5" paintOrder="stroke" transform="rotate(-6, 430, 190)">
          そろり…そろり…
        </text>
      </svg>
    )
  },

  // 5. Classic Dramatic (Rashomon, Sangetsuki, Kokoro)
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

        {/* Cổng La Sinh */}
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

  // 6. Modern Life & Society
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
  if (id.includes('gon') || title.includes('ごんぎつね') || title.includes('狐') || title.includes('手袋を買')) {
    return STORY_MANGA_ARTWORKS.gongitsune;
  }
  if (title.includes('羅生門') || title.includes('山月記') || title.includes('蜘蛛の糸') || title.includes('走れメロス') || title.includes('こころ')) {
    return STORY_MANGA_ARTWORKS.classic_dramatic;
  }
  if (genre.includes('business') || genre.includes('news') || title.includes('東京') || title.includes('電車') || title.includes('コンビニ') || title.includes('メール')) {
    return STORY_MANGA_ARTWORKS.modern_tokyo;
  }

  if (genre.includes('folktale')) return STORY_MANGA_ARTWORKS.momotaro;
  if (genre.includes('literature')) return STORY_MANGA_ARTWORKS.gongitsune;
  return STORY_MANGA_ARTWORKS.modern_tokyo;
};

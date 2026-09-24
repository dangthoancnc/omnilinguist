// scripts/generate_all_ehon_artwork.mjs
// Động Cơ Tạo Minh Họa Tranh Sách Tranh Ehon Độc Bản Cho Toàn Bộ 100 Tác Phẩm
// Tự động tạo 100% file SVG màu nước/collage cao cấp lưu vào public/images/ehon/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_EHON_DIR = path.resolve(__dirname, '../public/images/ehon');

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(PUBLIC_EHON_DIR)) {
  fs.mkdirSync(PUBLIC_EHON_DIR, { recursive: true });
}

// Bảng màu giấy vẽ phong cách Eric Carle & Màu nước Nhật Bản
const PALETTES = {
  warm: ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'],
  nature: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'],
  earth: ['#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90'],
  sky: ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#48cae4'],
  sunset: ['#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307'],
  pastel: ['#fec5bb', '#fcd5ce', '#fae1dd', '#f8edeb', '#e8e8e4']
};

function hashStr(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Hàm sinh họa tiết theo nội dung câu chuyện
function getSceneIllustration({ storyId, title, pageNumber, pageTitle, content }) {
  const seed = hashStr(storyId + pageNumber + pageTitle);
  const text = (title + ' ' + pageTitle + ' ' + content).toLowerCase();

  // Xác định chủ đề
  let theme = 'general';
  if (text.includes('だるま') || text.includes('daruma')) theme = 'daruma';
  else if (text.includes('きんぎょ') || text.includes('cá vàng')) theme = 'goldfish';
  else if (text.includes('ほっとけーき') || text.includes('bánh kếp') || text.includes('shirokuma')) theme = 'pancake';
  else if (text.includes('ねないこ') || text.includes('おばけ') || text.includes('chuông')) theme = 'ghost_night';
  else if (text.includes('がたんごとん') || text.includes('きしゃ') || text.includes('tàu hỏa') || text.includes('しんかんせん')) theme = 'train';
  else if (text.includes('おべんとう') || text.includes('おにぎり') || text.includes('cơm')) theme = 'bento';
  else if (text.includes('ぞう') || text.includes('voi')) theme = 'elephant';
  else if (text.includes('ノンタン') || text.includes('nontan') || text.includes('ねこ') || text.includes('mèo')) theme = 'cat';
  else if (text.includes('ワンピース') || text.includes('váy')) theme = 'dress';
  else if (text.includes('やさい') || text.includes('だいこん') || text.includes('にんじん') || text.includes('củ cải')) theme = 'turnip';
  else if (text.includes('くだもの') || text.includes('りんご') || text.includes('すいか') || text.includes('trái cây')) theme = 'fruit';
  else if (text.includes('おつきさま') || text.includes('よる') || text.includes('trăng')) theme = 'moon';
  else if (text.includes('かえる') || text.includes('ếch') || text.includes('ぴょーん')) theme = 'frog';
  else if (text.includes('ぐりとぐら') || text.includes('guri') || text.includes('カステラ')) theme = 'guri';
  else if (text.includes('パン') || text.includes('からす') || text.includes('bánh mì')) theme = 'bakery';
  else if (text.includes('きょうりゅう') || text.includes('khủng long') || text.includes('ティラノ')) theme = 'dinosaur';
  else if (text.includes('ベッド') || text.includes('そらまめ') || text.includes('đậu')) theme = 'bean';
  else if (text.includes('てぶくろ') || text.includes('găng tay') || text.includes('tuyết')) theme = 'mitten';
  else if (text.includes('うみ') || text.includes('魚') || text.includes('スイミー') || text.includes('cá')) theme = 'ocean';
  else if (text.includes('フレデリック') || text.includes('chuột') || text.includes('ねずみ')) theme = 'mouse';
  else if (text.includes('虎') || text.includes('hổ') || text.includes('山月記')) theme = 'tiger';
  else if (text.includes('しょうぼう') || text.includes('cứu hỏa')) theme = 'fireengine';
  else if (text.includes('がっこう') || text.includes('ランドセル') || text.includes('lớp 1')) theme = 'school';
  else if (text.includes('はち公') || text.includes('いぬ') || text.includes('chó')) theme = 'dog';

  // Background
  let bgGrad1 = '#fffae0';
  let bgGrad2 = '#fef08a';
  let isNight = text.includes('夜') || text.includes('星') || text.includes('よる') || theme === 'ghost_night' || theme === 'moon';
  let isOcean = theme === 'ocean' || text.includes('海') || text.includes('うみ');
  let isSunset = text.includes('夕') || text.includes('茜');

  if (isNight) {
    bgGrad1 = '#03071e';
    bgGrad2 = '#1d3557';
  } else if (isOcean) {
    bgGrad1 = '#0077b6';
    bgGrad2 = '#90e0ef';
  } else if (isSunset) {
    bgGrad1 = '#d00000';
    bgGrad2 = '#ffb703';
  }

  // Generate distinct SVGs
  let elements = '';

  switch (theme) {
    case 'daruma':
      elements = `
        <!-- Búp bê Daruma đỏ -->
        <g transform="translate(400, 340) scale(${0.9 + (seed % 3) * 0.1})">
          <ellipse cx="0" cy="0" rx="140" ry="160" fill="#d90429" stroke="#9d0208" stroke-width="8"/>
          <ellipse cx="0" cy="-30" rx="90" ry="85" fill="#fdf0d5"/>
          <!-- Mặt Daruma -->
          <circle cx="-35" cy="-55" r="14" fill="#1b263b"/>
          <circle cx="35" cy="-55" r="14" fill="#1b263b"/>
          <circle cx="-32" cy="-58" r="4" fill="#ffffff"/>
          <circle cx="38" cy="-58" r="4" fill="#ffffff"/>
          <!-- Râu và lông mày rậm -->
          <path d="M-65,-80 Q-35,-100 -10,-75" stroke="#1b263b" stroke-width="8" stroke-linecap="round" fill="none"/>
          <path d="M65,-80 Q35,-100 10,-75" stroke="#1b263b" stroke-width="8" stroke-linecap="round" fill="none"/>
          <ellipse cx="-45" cy="-30" rx="15" ry="8" fill="#f28482" opacity="0.6"/>
          <ellipse cx="45" cy="-30" rx="15" ry="8" fill="#f28482" opacity="0.6"/>
          <path d="M-30,-15 Q0,10 30,-15" stroke="#1b263b" stroke-width="6" stroke-linecap="round" fill="none"/>
          <!-- Họa tiết vàng kim trên áo Daruma -->
          <circle cx="0" cy="70" r="45" fill="#ffd166" opacity="0.85"/>
          <text x="0" y="82" font-size="34" font-weight="bold" fill="#78350f" text-anchor="middle" font-family="'Zen Maru Gothic', sans-serif">福</text>
        </g>
      `;
      break;

    case 'goldfish':
      elements = `
        <!-- Cá vàng đỏ bơi lội -->
        <g transform="translate(400, 320)">
          <!-- Bong bóng nước -->
          <circle cx="-160" cy="-100" r="18" fill="#caf0f8" opacity="0.7"/>
          <circle cx="-120" cy="-160" r="12" fill="#caf0f8" opacity="0.6"/>
          <circle cx="180" cy="-80" r="22" fill="#caf0f8" opacity="0.75"/>
          <!-- Thân cá vàng -->
          <ellipse cx="0" cy="0" rx="110" ry="75" fill="#ff4d6d" stroke="#c9184a" stroke-width="5"/>
          <!-- Đuôi xòe lụa -->
          <path d="M-100,0 C-180,-70 -200,-10 -230,-60 C-210,0 -230,50 -200,30 C-170,80 -100,10 -100,0 Z" fill="#ff758f" opacity="0.9"/>
          <!-- Vây ngực và vây lưng -->
          <path d="M20,-75 Q40,-120 70,-70 Z" fill="#ff758f"/>
          <path d="M10,65 Q-20,110 5,60 Z" fill="#ff758f"/>
          <!-- Mắt tròn xoe ngộ nghĩnh -->
          <circle cx="65" cy="-15" r="18" fill="#ffffff" stroke="#c9184a" stroke-width="3"/>
          <circle cx="68" cy="-15" r="9" fill="#001219"/>
          <circle cx="70" cy="-18" r="3" fill="#ffffff"/>
          <!-- Rong biển xanh -->
          <path d="M-280,240 Q-240,100 -260,-20 Q-280,-120 -250,-200" stroke="#2d6a4f" stroke-width="18" stroke-linecap="round" fill="none" opacity="0.8"/>
          <path d="M280,240 Q320,120 290,20 Q260,-80 300,-180" stroke="#40916c" stroke-width="22" stroke-linecap="round" fill="none" opacity="0.7"/>
        </g>
      `;
      break;

    case 'pancake':
      elements = `
        <!-- Tháp bánh kếp thơm lừng của Gấu Trắng -->
        <g transform="translate(400, 360)">
          <!-- Đĩa sứ xanh ngọc -->
          <ellipse cx="0" cy="120" rx="240" ry="60" fill="#a8dadc" stroke="#457b9d" stroke-width="6"/>
          <ellipse cx="0" cy="115" rx="200" ry="45" fill="#f1faee"/>
          <!-- Ba lớp bánh xếp chồng -->
          <ellipse cx="0" cy="70" rx="150" ry="42" fill="#d4a373" stroke="#bc6c25" stroke-width="4"/>
          <ellipse cx="0" cy="30" rx="145" ry="40" fill="#ddb892" stroke="#bc6c25" stroke-width="4"/>
          <ellipse cx="0" cy="-10" rx="140" ry="38" fill="#e6ccb2" stroke="#bc6c25" stroke-width="4"/>
          <!-- Khối bơ vàng tan chảy -->
          <rect x="-25" y="-45" width="50" height="35" rx="6" fill="#ffe066" stroke="#f4a261" stroke-width="3"/>
          <!-- Mật ong óng ả chảy giọt -->
          <path d="M-15,-20 C-15,10 -35,25 -35,50 C-35,70 -15,75 -15,75" stroke="#f4a261" stroke-width="8" stroke-linecap="round" fill="none"/>
          <path d="M10,-20 C25,5 30,30 25,60" stroke="#f4a261" stroke-width="7" stroke-linecap="round" fill="none"/>
          <!-- Khuôn mặt chú gấu trắng nhỏ ló đầu -->
          <circle cx="150" cy="-70" r="55" fill="#ffffff" stroke="#ced4da" stroke-width="4"/>
          <circle cx="115" cy="-115" r="20" fill="#ffffff" stroke="#ced4da" stroke-width="3"/>
          <circle cx="185" cy="-115" r="20" fill="#ffffff" stroke="#ced4da" stroke-width="3"/>
          <circle cx="135" cy="-75" r="6" fill="#212529"/>
          <circle cx="165" cy="-75" r="6" fill="#212529"/>
          <ellipse cx="150" cy="-60" rx="7" ry="5" fill="#212529"/>
        </g>
      `;
      break;

    case 'train':
      elements = `
        <!-- Đoàn tàu hỏa hơi nước chạy qua cánh đồng -->
        <g transform="translate(400, 360)">
          <!-- Đường ray sắt -->
          <line x1="-380" y1="120" x2="380" y2="120" stroke="#495057" stroke-width="12"/>
          <line x1="-380" y1="140" x2="380" y2="140" stroke="#495057" stroke-width="8"/>
          <!-- Toa đầu tàu đen bóng -->
          <rect x="-180" y="-40" width="220" height="130" rx="15" fill="#212529" stroke="#343a40" stroke-width="5"/>
          <rect x="-50" y="-110" width="130" height="140" rx="10" fill="#1d3557" stroke="#457b9d" stroke-width="4"/>
          <!-- Cửa sổ toa lái -->
          <rect x="-30" y="-90" width="40" height="45" rx="5" fill="#f1faee"/>
          <rect x="25" y="-90" width="40" height="45" rx="5" fill="#f1faee"/>
          <!-- Ống khói và khói cuồn cuộn -->
          <rect x="-150" y="-95" width="35" height="60" fill="#e63946"/>
          <circle cx="-135" cy="-130" r="30" fill="#f8f9fa" opacity="0.9"/>
          <circle cx="-180" cy="-170" r="45" fill="#e9ecef" opacity="0.8"/>
          <circle cx="-240" cy="-210" r="60" fill="#dee2e6" opacity="0.7"/>
          <!-- Đèn pha vàng rực -->
          <polygon points="-180,20 -360,-20 -360,70" fill="#ffbe0b" opacity="0.4"/>
          <circle cx="-180" cy="25" r="16" fill="#ffbe0b"/>
          <!-- Bánh xe sắt lớn nhỏ -->
          <circle cx="-130" cy="115" r="35" fill="#e63946" stroke="#212529" stroke-width="6"/>
          <circle cx="-40" cy="115" r="35" fill="#e63946" stroke="#212529" stroke-width="6"/>
          <circle cx="45" cy="115" r="35" fill="#e63946" stroke="#212529" stroke-width="6"/>
        </g>
      `;
      break;

    case 'bento':
      elements = `
        <!-- Hộp cơm bento xe buýt ngộ nghĩnh -->
        <g transform="translate(400, 330)">
          <!-- Thân xe buýt cơm hộp đỏ -->
          <rect x="-220" y="-100" width="440" height="230" rx="35" fill="#e63946" stroke="#b7094c" stroke-width="7"/>
          <rect x="-195" y="-75" width="390" height="95" rx="15" fill="#fdf0d5"/>
          <!-- Bạn Cơm Nắm tam giác vẫy tay -->
          <g transform="translate(-110, -25)">
            <polygon points="0,-45 -40,30 40,30" fill="#ffffff" stroke="#ced4da" stroke-width="3"/>
            <rect x="-18" y="5" width="36" height="25" fill="#212529"/>
            <circle cx="-10" cy="-5" r="4" fill="#212529"/>
            <circle cx="10" cy="-5" r="4" fill="#212529"/>
          </g>
          <!-- Trứng cuộn vàng tươi -->
          <g transform="translate(0, -25)">
            <rect x="-35" y="-25" width="70" height="50" rx="12" fill="#ffd166" stroke="#f4a261" stroke-width="3"/>
            <path d="M-15,-2 C0,15 15,-10 25,5" stroke="#f4a261" stroke-width="3" fill="none"/>
          </g>
          <!-- Xúc xích bạch tuộc đỏ -->
          <g transform="translate(110, -25)">
            <ellipse cx="0" cy="-15" rx="25" ry="30" fill="#d90429"/>
            <path d="M-15,10 Q-25,35 -15,40 M-5,12 Q-5,38 0,40 M5,12 Q10,38 12,40 M15,10 Q25,35 22,40" stroke="#d90429" stroke-width="5" stroke-linecap="round"/>
            <circle cx="-8" cy="-18" r="3" fill="#ffffff"/>
            <circle cx="8" cy="-18" r="3" fill="#ffffff"/>
          </g>
          <!-- Bánh xe buýt đen tròn -->
          <circle cx="-130" cy="130" r="35" fill="#212529" stroke="#fdf0d5" stroke-width="6"/>
          <circle cx="130" cy="130" r="35" fill="#212529" stroke="#fdf0d5" stroke-width="6"/>
        </g>
      `;
      break;

    case 'ocean':
      elements = `
        <!-- Đại dương xanh sâu thẳm & đàn cá nhỏ -->
        <g transform="translate(400, 300)">
          <!-- Rạn san hô sặc sỡ bên dưới -->
          <path d="M-360,250 C-320,130 -280,180 -250,110 C-220,180 -180,130 -150,250 Z" fill="#ff758f"/>
          <path d="M150,250 C200,100 240,160 280,90 C320,170 340,130 380,250 Z" fill="#ffb703"/>
          <!-- Đàn cá đỏ bơi đàn -->
          ${[-120, -60, 0, 60, 120, -90, -30, 30, 90].map((x, i) => `
            <g transform="translate(${x}, ${(i % 3) * 50 - 60})">
              <ellipse cx="0" cy="0" rx="28" ry="16" fill="#e63946"/>
              <polygon points="-24,0 -40,-12 -40,12" fill="#e63946"/>
              <circle cx="12" cy="-4" r="3.5" fill="#ffffff"/>
              <circle cx="13" cy="-4" r="1.8" fill="#000000"/>
            </g>
          `).join('')}
          <!-- Chú cá đen Swimmy dẫn đầu -->
          <g transform="translate(180, -30) scale(1.3)">
            <ellipse cx="0" cy="0" rx="30" ry="18" fill="#1b263b" stroke="#415a77" stroke-width="2"/>
            <polygon points="-26,0 -42,-14 -42,14" fill="#1b263b"/>
            <circle cx="14" cy="-4" r="4.5" fill="#ffffff"/>
            <circle cx="15" cy="-4" r="2.2" fill="#000000"/>
          </g>
        </g>
      `;
      break;

    case 'moon':
    case 'ghost_night':
      elements = `
        <!-- Vầng trăng vàng rằm & Ngàn sao đêm -->
        <g transform="translate(400, 260)">
          <!-- Vầng trăng vàng to mỉm cười dịu dàng -->
          <circle cx="0" cy="0" r="110" fill="#ffbe0b" stroke="#fb5607" stroke-width="5"/>
          <circle cx="0" cy="0" r="95" fill="#ffd166"/>
          <!-- Đôi mắt nhắm ngủ hoặc nhìn thân thương -->
          <ellipse cx="-35" cy="-15" rx="8" ry="12" fill="#78350f"/>
          <ellipse cx="35" cy="-15" rx="8" ry="12" fill="#78350f"/>
          <ellipse cx="-45" cy="15" rx="16" ry="9" fill="#f28482" opacity="0.6"/>
          <ellipse cx="45" cy="15" rx="16" ry="9" fill="#f28482" opacity="0.6"/>
          <path d="M-25,25 Q0,48 25,25" stroke="#78350f" stroke-width="5" stroke-linecap="round" fill="none"/>
          <!-- Đám mây trắng trôi ngang trăng -->
          <g transform="translate(-140, 60)" opacity="0.85">
            <ellipse cx="40" cy="0" rx="55" ry="30" fill="#f8f9fa"/>
            <ellipse cx="90" cy="-15" rx="60" ry="38" fill="#f8f9fa"/>
            <ellipse cx="145" cy="0" rx="50" ry="28" fill="#f8f9fa"/>
          </g>
          <!-- Mái nhà ngói Nhật bên dưới -->
          <path d="M-380,300 L0,220 L380,300 L380,350 L-380,350 Z" fill="#2b2d42"/>
        </g>
      `;
      break;

    default:
      // Phong cách Collage hoa lá và thiên nhiên rực rỡ Eric Carle
      elements = `
        <g transform="translate(400, 320)">
          <!-- Cây cối collage nhiều tầng giấy -->
          <path d="M-30,180 L-15,-20 L15,-20 L30,180 Z" fill="#7f4f24"/>
          <ellipse cx="0" cy="-70" rx="110" ry="130" fill="#2d6a4f" opacity="0.95"/>
          <ellipse cx="-40" cy="-50" rx="80" ry="100" fill="#40916c" opacity="0.9"/>
          <ellipse cx="45" cy="-40" rx="75" ry="90" fill="#52b788" opacity="0.85"/>
          <circle cx="0" cy="-120" r="60" fill="#74c69d" opacity="0.8"/>
          <!-- Mặt trời Eric Carle rực rỡ góc trời -->
          <g transform="translate(240, -160)">
            ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg => `
              <polygon points="0,0 -12,-65 12,-65" transform="rotate(${deg})" fill="#e85d04" opacity="0.9"/>
            `).join('')}
            <circle cx="0" cy="0" r="42" fill="#ffb703"/>
            <circle cx="0" cy="0" r="32" fill="#fb8500"/>
          </g>
          <!-- Đồi cỏ lượn sóng -->
          <path d="M-400,160 Q-200,90 0,130 T400,100 L400,280 L-400,280 Z" fill="#52b788"/>
          <path d="M-400,190 Q-150,140 100,170 T400,150 L400,280 L-400,280 Z" fill="#40916c"/>
        </g>
      `;
      break;
  }

  // Tên thẻ bài và nhãn phụ đề trang
  const cleanTitle = (title || '').replace(/^[\p{Extended_Pictographic}\u2600-\u27BF\u2B50\s]+/u, '').trim();
  const cleanPageTitle = (pageTitle || '').replace(/^第\d+場面：/u, '').trim();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${bgGrad1}" />
      <stop offset="100%" stop-color="${bgGrad2}" />
    </linearGradient>
    <filter id="paperTexture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0" in="noise" result="coloredNoise" />
      <feComposite operator="in" in2="SourceGraphic" />
    </filter>
  </defs>

  <!-- Nền Gradient Mỹ Thuật -->
  <rect width="800" height="600" fill="url(#bgGrad)" />

  <!-- Yếu tố Minh Họa Trung Tâm -->
  ${elements}

  <!-- Lớp phủ chất liệu giấy mỹ thuật thủ công -->
  <rect width="800" height="600" fill="#ffffff" opacity="0.05" filter="url(#paperTexture)" pointer-events="none" />

  <!-- Khung viền tranh Ehon cổ điển -->
  <rect x="16" y="16" width="768" height="568" rx="20" fill="none" stroke="${isNight ? '#415a77' : '#e2e8f0'}" stroke-width="4" opacity="0.8" />

  <!-- Bảng Thông Tin Tác Phẩm & Phân Cảnh Trang Nhã Ở Đáy Tranh -->
  <g transform="translate(400, 545)">
    <rect x="-320" y="-22" width="640" height="44" rx="22" fill="${isNight ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)'}" stroke="${isNight ? '#334155' : '#cbd5e1'}" stroke-width="2" />
    <text x="0" y="4" font-size="16" font-weight="bold" fill="${isNight ? '#f8fafc' : '#1e293b'}" text-anchor="middle" font-family="'Zen Maru Gothic', 'Hiragino Sans', 'Meiryo', sans-serif">
      ${cleanTitle} — ${cleanPageTitle ? cleanPageTitle : (pageNumber ? `Trang ${pageNumber}` : 'Bìa Sách')}
    </text>
  </g>
</svg>`;
}

async function generateAllAssets() {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  🎨 BẮT ĐẦU TẠO TOÀN BỘ MINH HỌA EHON ĐỘC BẢN CHO 100 ĐẦU SÁCH    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const nensho = await import('../src/data/corpus/ehon_nensho.js');
  const nenchu = await import('../src/data/corpus/ehon_nenchu.js');
  const nencho = await import('../src/data/corpus/ehon_nencho.js');
  const folktales = await import('../src/data/corpus/folktales.js');
  const baseCorpus = await import('../src/data/corpus/base_corpus.js');

  const allCorpus = [
    ...nensho.EHON_NENSHO_CORPUS,
    ...nenchu.EHON_NENCHU_CORPUS,
    ...nencho.EHON_NENCHO_CORPUS,
    ...folktales.FOLKTALES_CORPUS,
    ...baseCorpus.BASE_CORPUS
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const story of allCorpus) {
    // 1. Kiểm tra & tạo ảnh bìa nếu thiếu
    const coverUrl = story.coverArtwork || story.imageUrl;
    if (coverUrl && coverUrl.endsWith('.svg')) {
      const fileName = path.basename(coverUrl);
      const targetPath = path.resolve(PUBLIC_EHON_DIR, fileName);
      if (!fs.existsSync(targetPath)) {
        const svgCode = getSceneIllustration({
          storyId: story.id,
          title: story.title,
          pageNumber: 0,
          pageTitle: 'Bìa Tác Phẩm (Cover)',
          content: story.summary || story.title
        });
        fs.writeFileSync(targetPath, svgCode, 'utf8');
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    // 2. Kiểm tra & tạo ảnh từng trang
    if (story.chapters && Array.isArray(story.chapters)) {
      for (const ch of story.chapters) {
        const pageUrl = ch.imageUrl;
        if (pageUrl && pageUrl.endsWith('.svg')) {
          const fileName = path.basename(pageUrl);
          const targetPath = path.resolve(PUBLIC_EHON_DIR, fileName);
          if (!fs.existsSync(targetPath)) {
            const svgCode = getSceneIllustration({
              storyId: story.id,
              title: story.title,
              pageNumber: ch.chapterNumber,
              pageTitle: ch.chapterTitle,
              content: ch.content || ''
            });
            fs.writeFileSync(targetPath, svgCode, 'utf8');
            createdCount++;
          } else {
            skippedCount++;
          }
        }
      }
    }
  }

  console.log(`\n🎉 HOÀN TẤT SINH TRANH MINH HỌA!`);
  console.log(`• Đã tạo mới: ${createdCount} file ảnh SVG màu nước độc bản.`);
  console.log(`• Đã có sẵn: ${skippedCount} file ảnh.`);
  console.log(`• Vị trí lưu trữ: ${PUBLIC_EHON_DIR}`);
}

generateAllAssets();

// scripts/package_backup.mjs
// Đóng gói bản backup mã nguồn v1.4.0 (Đại quy mô 400 tác phẩm Ehon & Cổ tích)
// Loại bỏ hoàn toàn các thư viện hệ thống nặng: node_modules, dist, .git, media cache

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const VERSION = 'v1.4.0';
const BACKUP_NAME = `omnilinguist_${VERSION}_ehon400_backup_20260925.zip`;
const LOCAL_BACKUP_DIR = path.resolve(ROOT_DIR, 'backups');
const USB_ROOT_BACKUP_DIR = 'G:\\AntiGravity\\backups';
const USB_APP_BACKUP_DIR = 'G:\\AntiGravity\\apps\\omnilinguist\\backups';

console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log(`║  📦 OMNILINGUIST — ĐÓNG GÓI MÃ NGUỒN BACKUP PHIÊN BẢN ${VERSION}         ║`);
console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

// 1. Tạo thư mục backup nội bộ
if (!fs.existsSync(LOCAL_BACKUP_DIR)) {
  fs.mkdirSync(LOCAL_BACKUP_DIR, { recursive: true });
}

const localZipPath = path.resolve(LOCAL_BACKUP_DIR, BACKUP_NAME);

// 2. Thực hiện git archive từ HEAD để đóng gói 100% mã nguồn sạch
console.log(`⏳ Đang nén toàn bộ mã nguồn & tài nguyên độc bản (bỏ qua node_modules, dist, .git)...`);
const startTime = Date.now();

try {
  // Lệnh git archive tạo zip với tiền tố thư mục omnilinguist-v1.4.0
  execSync(`git archive --format=zip --prefix=omnilinguist-${VERSION}/ -o "${localZipPath}" HEAD`, {
    cwd: ROOT_DIR,
    stdio: 'inherit'
  });
} catch (err) {
  console.error('❌ Lỗi khi thực hiện git archive:', err);
  process.exit(1);
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);
const stats = fs.statSync(localZipPath);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log(`✅ Đã tạo thành công tệp backup: ${BACKUP_NAME}`);
console.log(`• Kích thước tệp nén: ${sizeMB} MB`);
console.log(`• Thời gian thực thi: ${duration}s`);
console.log(`• Đường dẫn: ${localZipPath}\n`);

// 3. Tạo tài liệu hướng dẫn khôi phục đi kèm
const readmeContent = `# HƯỚNG DẪN KHÔI PHỤC & SỬ DỤNG BẢN BACKUP OMNILINGUIST ${VERSION}
======================================================================
Thời điểm sao lưu: 25/09/2026
Phiên bản: ${VERSION} (Cột mốc 400 tác phẩm Ehon mầm non & Cổ tích thần thoại Nhật Bản)
Quy mô kho đọc: 677 tác phẩm (1,520+ tranh minh họa SVG độc bản)

1. NỘI DUNG GÓI BACKUP:
----------------------------------------------------------------------
• Toàn bộ mã nguồn ứng dụng React 19 + Vite 8 PWA (thư mục src/)
• Kho ngữ liệu 677 tác phẩm chuẩn SLA & Stephen Krashen (src/data/corpus/)
• Hơn 1,520 file ảnh minh họa SVG chất lượng cao (public/images/ehon/)
• Ma trận kiểm toán độc bản không trùng lặp (public/images/story_illustration_matrix.json)
• Hệ thống kịch bản kiểm toán & sinh tranh tự động (scripts/)
• File cấu hình dự án: package.json, vite.config.js, eslint.config.js, index.html, .env.example
• ĐÃ LOẠI TRỪ CÁC THƯ MỤC NẶNG: node_modules, dist, .git, audio-cdn, media_studio

2. CÁCH KHÔI PHỤC VÀ KHỞI CHẠY TRÊN MÁY TÍNH MỚI:
----------------------------------------------------------------------
Bước 1: Giải nén tệp ${BACKUP_NAME} vào thư mục làm việc bạn muốn.
Bước 2: Mở Terminal (PowerShell hoặc Command Prompt) tại thư mục vừa giải nén.
Bước 3: Cài đặt các thư viện phụ thuộc bằng lệnh:
        npm install
Bước 4: (Tùy chọn) Sao chép .env.example thành .env nếu muốn cấu hình Supabase:
        copy .env.example .env
Bước 5: Khởi chạy môi trường phát triển (Dev Server):
        npm run dev
        hoặc click đúp file start.bat
Bước 6: Kiểm tra tính toàn vẹn minh họa tranh truyện:
        npm run audit:stories
Bước 7: Đóng gói bản chạy thực tế PWA (Production Build):
        npm run build

======================================================================
OmniLinguist Platform • Copyright 2026
`;

const readmePath = path.resolve(LOCAL_BACKUP_DIR, `README_${VERSION}.txt`);
fs.writeFileSync(readmePath, readmeContent, 'utf8');

// 4. Đồng bộ sang ổ USB (G:) nếu có kết nối
const targets = [USB_ROOT_BACKUP_DIR, USB_APP_BACKUP_DIR];

for (const targetDir of targets) {
  try {
    const parentDrive = targetDir.substring(0, 3); // G:\
    if (fs.existsSync(parentDrive)) {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const usbZipTarget = path.resolve(targetDir, BACKUP_NAME);
      const usbReadmeTarget = path.resolve(targetDir, `README_${VERSION}.txt`);
      
      console.log(`🔄 Đang sao chép bản backup sang USB: ${targetDir}...`);
      fs.copyFileSync(localZipPath, usbZipTarget);
      fs.copyFileSync(readmePath, usbReadmeTarget);
      console.log(`✅ Đã sao chép thành công sang: ${usbZipTarget}`);
    } else {
      console.log(`⚠️ Không tìm thấy ổ đĩa ${parentDrive}, bỏ qua đồng bộ.`);
    }
  } catch (copyErr) {
    console.warn(`⚠️ Lỗi khi sao chép sang ${targetDir}:`, copyErr.message);
  }
}

console.log('\n🎉 TOÀN BỘ QUÁ TRÌNH ĐÓNG GÓI BACKUP ĐÃ HOÀN TẤT THÀNH CÔNG!');

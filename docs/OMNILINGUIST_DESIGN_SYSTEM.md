# 🏛️ BỘ QUY TẮC THIẾT KẾ GIAO DIỆN OMNILINGUIST (ODS — EDTECH EDITION)
> **Kế thừa & Nâng tầm từ:** `YSDMS NextGen Design System` (SAP Fiori Horizon, Linear App, Notion, Vercel)  
> **Chuyên biệt hóa cho:** Ứng dụng Học Ngôn Ngữ & Luyện Thi Quốc Dân (EdTech Japanese Language Learning)  
> **Phiên bản:** 2.0.0 • 2026 Edition  
> **Định vị:** *Chuyên nghiệp, Mật độ thông tin cao, Gãy gọn, Thẩm mỹ sư phạm Nhật Bản (Khoa học nhưng ấm áp, không khô cứng công nghiệp).*

---

## 🧭 1. TỔNG QUAN SO SÁNH & ĐỊNH HƯỚNG CHUYỂN ĐỔI

| Tiêu chí | `YSDMS NextGen` (Sản xuất công nghiệp B2B) | `OmniLinguist` (Ứng dụng Học tập EdTech) |
|---|---|---|
| **Bản chất nghiệp vụ** | Quản lý khuôn mẫu, dao cắt, lệnh sản xuất, kho bãi | Học tiếng Nhật đa giác quan, Lò luyện thi JLPT, Thư viện truyện tranh, Flashcard Anki |
| **Tâm lý người dùng** | Cần nhập liệu nhanh, tra cứu chính xác, giám sát số liệu | Cần tập trung ghi nhớ, giảm mỏi mắt, kích thích hứng thú học tập, phản xạ tự nhiên |
| **Màu sắc chủ đạo** | Xám công nghiệp `#ECEEF1`, Accent Teal đơn sắc `#0D7A7A` | Nền trung tính ấm `#F8FAFC`, Điểm nhấn Anh đào `#F43F5E` & Xanh trí tuệ `#2563EB`, Tints màu đa vùng tiếp hợp |
| **Mật độ thông tin** | Siêu nén (Ultra-compact, hàng bảng 6px 10px, font 11–13px) | **Mật độ thích ứng (Adaptive Density)**: Gọn gàng thanh thoát, bảng thẻ rộng rãi, có không gian thở cho chữ Hán (Kanji & Furigana) |
| **Cảm xúc thị giác** | Nghiêm nghị, kỷ luật nhà xưởng, không emoji trang trí | **Khoa học chuẩn mực nhưng ấm áp**: Có linh vật Mascot biểu cảm, Ẩn dụ hình ảnh trực quan, Sơ đồ Sketchnote mềm mại |

---

## 📐 2. BỐ CỤC KHÔNG GIAN & MẬT ĐỘ HIỂN THỊ (LAYOUT & SPACING)

### 2.1. Quy Tắc Toàn Chiều Ngang (Full-Width Fluid Rule)
- **Tuyệt đối không giới hạn cứng** `maxWidth: 1200px` hoặc `1400px` trên các màn hình máy tính rộng (1920x1080 trở lên).
- Sử dụng layout lấp đầy màn hình:
  ```css
  width: 100%;
  max-width: 100%;
  padding: var(--space-4) var(--space-6); /* 12px 20px */
  box-sizing: border-box;
  ```

### 2.2. Hệ Thống Bước Nhảy Lưới (Spacing Tokens — 4px Base Grid)
Kế thừa hoàn toàn lưới tỉ lệ của `YSDMS NextGen`:
```css
--space-1: 2px;   /* Micro spacing (viền, dot status) */
--space-2: 4px;   /* Tag nội bộ, icon margin */
--space-3: 8px;   /* Gap giữa các nút, padding thẻ nhỏ */
--space-4: 12px;  /* Padding card, gutter lưới */
--space-5: 16px;  /* Margin phân đoạn, card padding chuẩn */
--space-6: 20px;  /* Container padding, tiêu đề section */
--space-7: 24px;  /* Khoảng cách giữa các module lớn */
--space-8: 32px;  /* Khoảng cách đỉnh trang */
```

### 2.3. Quy Tắc Thu Gọn Header (Compact Toolbar Rule)
- Chiều cao thanh tiêu đề trang chỉ được dao động từ **42px đến 48px** (tương tự Topbar của YSDMS NextGen).
- Không dựng Banner quảng cáo/Hero card đồ sộ chiếm 200–300px chiều dọc.
- Số liệu thống kê được hiển thị dạng **Micro-Badges inline** ngay trên thanh công cụ để tiết kiệm không gian.

### 2.4. Kiến Trúc 2 Chế Độ Nhất Quán (Catalog Grid vs Dedicated Focus View)
- **Trang Danh Mục (Catalog View)**: Lưới đa cột tự động co giãn (`gridTemplateColumns: repeat(auto-fill, minmax(310px, 1fr))`), hiển thị toàn cảnh 120 bài học hoặc danh mục truyện/ngữ pháp.
- **Trang Chi Tiết (Dedicated Lesson/Reading View)**: Chiếm 100% bề ngang, có thanh điều hướng trên cùng với:
  * Nút `← Quay lại danh mục` (Back Button) cố định ở góc trái.
  * Breadcrumb chỉ rõ vị trí học.
  * Cụm nút chuyển bài nhanh `← Bài trước` | `Bài tiếp →`.
  * Không gian học tập đa cột (Lý thuyết bên trái, Trắc nghiệm phản xạ bên phải).

---

## 🎨 3. BẢNG MÀU & HỆ THỐNG TOKEN (COLOR SYSTEM)

### 3.1. Phân Tầng Bề Mặt (Surface Hierarchy)
Lấy cảm hứng từ mô hình *GitHub Primer & Linear App* của `YSDMS`:
- **Chế độ Sáng (Day/Sakura Study Mode)**:
  * `--bg-page`: `#F8FAFC` (Nền trang xám nhạt nhẹ nhàng, giảm lóa mắt khi học lâu).
  * `--bg-surface`: `#FFFFFF` (Bề mặt thẻ trắng sáng, viền sắc nét 1px).
  * `--bg-surface-2`: `#F1F5F9` (Nền thẻ con, header bảng hoặc khung ghi chú).
  * `--bg-hover`: `#E2E8F0` (Hiệu ứng hover chuột mượt mà).
  * `--border-default`: `#E2E8F0` (Viền ngăn cách mảnh 1px).
  * `--border-strong`: `#CBD5E1` (Viền tương tác, input focus).
- **Chế độ Tối (Soft Dark / Midnight Study Mode)**:
  * `--bg-page`: `#0F172A` (Nền vũ trụ sâu thẳm, không dùng đen tuyệt đối `#000` để tránh gắt).
  * `--bg-surface`: `#1E293B` (Bề mặt thẻ nổi bật).
  * `--bg-surface-2`: `#283548`.
  * `--border-default`: `rgba(255, 255, 255, 0.08)`.

### 3.2. Màu Sắc Điểm Nhấn Sư Phạm (Pedagogical Section Tints)
Thay vì dùng màu accent Teal công nghiệp đơn điệu, OmniLinguist sử dụng hệ màu biểu tượng học thuật:
- **Sakura Rose (Minna & Sketchnote)**: Nền `#FFF1F2`, Viền `#FDA4AF`, Chữ `#E11D48`.
- **Matcha Green (N5 & Khởi đầu)**: Nền `#ECFDF5`, Viền `#A7F3D0`, Chữ `#047857`.
- **Sky Cyan (N4 & Mở rộng)**: Nền `#F0F9FF`, Viền `#BAE6FD`, Chữ `#0284C7`.
- **Sunflower Amber (N3 & Cạm bẫy)**: Nền `#FFFBEB`, Viền `#FDE68A`, Chữ `#B45309`.
- **Lavender Violet (N2 & Doanh nghiệp)**: Nền `#F5F3FF`, Viền `#DDD6FE`, Chữ `#6D28D9`.
- **Imperial Crimson (N1 & Thượng cấp)**: Nền `#FEF2F2`, Viền `#FECACA`, Chữ `#B91C1C`.

---

## 🔤 4. QUY TẮC PHÔNG CHỮ & TIẾNG NHẬT (TYPOGRAPHY & JAPANESE RULES)

### 4.1. Bộ Phông Chuẩn
- **Chữ Latin / Tiếng Việt**: `'Inter', 'Be Vietnam Pro', system-ui, sans-serif` (Rõ nét, tròn trịa, đọc lâu không mỏi).
- **Chữ Nhật (Kanji / Kana)**: `'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif` (Đường nét chuẩn mực thư pháp hiện đại).
- **Mã lệnh / Cấu trúc ngữ pháp**: `'Consolas', 'JetBrains Mono', monospace`.

### 4.2. Thang Cỡ Chữ Chuẩn Mực (Type Scale)
- **Thẻ / Nhãn siêu nhỏ (Tag / Badge)**: `11px` (Font weight 700).
- **Mục lục / Chú thích / Dịch nghĩa thứ cấp**: `12px` (Line-height 1.4).
- **Nội dung thẻ / Bảng / Ô nhập liệu**: `13px – 14px`.
- **Câu tiếng Nhật ví dụ (Japanese Sentence)**: `15px – 16px` (Chữ to hơn chữ Latin 1px để nhận diện Kanji dễ dàng).
- **Tiêu đề bài học / Mẫu ngữ pháp lớn**: `18px – 20px` (Font weight 800-900).

### 4.3. Quy Tắc Vàng Cho Furigana (Ruby Annotation Rule)
- Khi hiển thị phiên âm Furigana trên đầu chữ Hán (`<ruby>漢<rt>かん</rt>字<rt>じ</rt></ruby>`):
  * **Line-height tối thiểu**: `1.65 – 1.8` để đảm bảo thẻ `<rt>` không bị đè vào dòng văn bản phía trên.
  * **Cỡ chữ Furigana**: Chuẩn `50% – 55%` kích thước của chữ Kanji chính.
  * **Khoảng cách**: Màu chữ Furigana nên hơi nhạt hơn chữ Kanji một bậc (VD: chữ Kanji màu `#0F172A` thì Furigana dùng `#475569`) để mắt người đọc không bị phân tâm nếu đã biết chữ Hán đó.

---

## 🧩 5. BỘ THƯ VIỆN THÀNH PHẦN (COMPONENT SPECIFICATIONS)

### 5.1. Thẻ Học Tập (Learning Card: `.ods-card`)
- Bo góc: `radius-md (10px - 12px)`.
- Viền: `1px solid var(--border-default)`.
- Đổ bóng: `box-shadow: 0 1px 3px rgba(0,0,0,0.05)`.
- Hiệu ứng tương tác: Khi hover, thẻ nhấc nhẹ `transform: translateY(-2px)` và viền sáng màu accent.

### 5.2. Thẻ Đỉnh Nhấn (Accent Top-Border: `.ods-kpi-card`)
Kế thừa từ `.kpi-card` của YSDMS nhưng áp dụng cho Trọng tâm bài học:
- Viền trên dày 3px màu theo cấp độ (N5 xanh lá, N3 vàng mật ong, N2 tím, N1 đỏ).

### 5.3. Nút Điều Hướng & Hành Động (Action Buttons: `.ods-btn`)
- Chiều cao chuẩn: `34px – 36px`.
- Padding: `6px 14px`.
- Bo góc: `radius-sm (6px - 8px)`.
- Font size: `13px – 14px`, Font weight: `700`.

### 5.4. Trắc Nghiệm Phản Xạ & Phản Hồi Xúc Giác (Interactive Drills)
- Lựa chọn 4 đáp án dạng lưới 2x2.
- Trạng thái chưa chọn: Viền xám mảnh, nền surface nhạt.
- Trạng thái đúng: Nền xanh nhạt (`--status-success-bg`), viền xanh lá, hiển thị icon `✅` và giải thích ngay lập tức.
- Trạng thái sai: Nền đỏ nhạt (`--status-error-bg`), viền đỏ, hiển thị icon `❌` và phân tích lý do lừa.

### 5.5. Trải Nghiệm Âm Thanh (Audio Pronunciation Multi-Sensory)
- Mọi câu văn mẫu đều có nút loa phát âm (Volume Icon).
- Nút loa có kích thước nhỏ gọn `28px x 28px`, nền trong suốt, hover sáng màu accent.
- Khi đang phát âm: Icon loa đổi màu và có hiệu ứng nhịp tim nhẹ nhàng (`pulse`), giúp người học biết hệ thống đang nói câu nào.

---

## 💡 6. ĐỀ XUẤT NÂNG CẤP VÀ ÁP DỤNG THỰC TẾ

1. **Đồng bộ hóa Token CSS vào `src/index.css`**:
   - Thêm các biến `--space-*`, `--tint-*`, `--ods-*` tương thích với kiến trúc YSDMS NextGen.
2. **Cập nhật Giao diện Toàn Hệ Thống**:
   - Áp dụng triệt để cho `JlptMasterDojo.jsx`, `MindmapCanvasModal.jsx`, `MindmapAtlasModal.jsx`, `Dictionary.jsx`, `KanjiStudio.jsx`.
3. **Giữ gìn Bản sắc EdTech**:
   - Tuyệt đối không xóa bỏ các linh vật Mascot, các ẩn dụ hình ảnh và sơ đồ Sketchnote — đây là "linh hồn" giúp người học tiếp thu nhanh gấp 3 lần so với giáo trình bảng biểu khô khan.
   - Kết hợp cấu trúc khung xương kỷ luật của YSDMS với vẻ đẹp sư phạm trực quan của Sakura Sketchnote.

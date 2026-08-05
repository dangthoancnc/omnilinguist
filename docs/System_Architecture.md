# OmniLinguist System Architecture
**Version:** 10.4.0
**Last Updated:** 2026-05-25

Tài liệu này lưu trữ kiến trúc hệ thống tổng thể, bao gồm các bản nâng cấp từ đa thiết bị nhằm đảm bảo tính liền mạch trong phát triển (Đại Cung Điện).

---

## 1. Cross-Dictionary Search System (Từ điển Popup Toàn cầu)
Tích hợp khả năng tra cứu chéo trực tiếp trên giao diện người dùng (React), không bị giới hạn trong Iframe:
- **Auto Language Detection:** Dùng Regex phân biệt tiếng Nhật và ngôn ngữ khác.
- **Tiếng Nhật (Kanji/Kana):** 
  - Tra cứu Offline IndexedDB ưu tiên nghĩa Tiếng Việt.
  - Dự phòng bằng Jisho qua Proxy nội bộ (`http://127.0.0.1:8000/api/jisho`) để vượt lỗi CORS.
- **Tiếng Anh (English):**
  - Gửi request đến Google Translate API (`translate.googleapis.com`) lấy bản dịch Tiếng Việt và các từ loại.
- **UX/UI:** Giới hạn bôi đen nới lỏng lên 500 ký tự (cho phép bôi cả câu tiếng Anh). Cửa sổ phân chia màu sắc cho Từ vựng, Kanji, Ngữ pháp, Jisho và Eng-Vie. Tọa độ tính toán động bù trừ Iframe (PostMessage radar).

---

## 2. Omni Media Engine (Backend Python)
Phục vụ nhu cầu Tắm ngôn ngữ (Immersion) và Shadowing chuyên sâu. 
**Thư mục:** `omni-media-engine/`
**Stack:** FastAPI (Port 8000), FFmpeg, Whisper, Edge-TTS, F5-TTS.

### Core Services:
1. **`media_service.py` (FFmpeg Wrapper):** 
   - Quản lý cắt ghép clip, chụp frame, tạo video câm, hợp nhất âm thanh, xuất file MP3 và SRT.
2. **`stt_service.py` (Whisper AI):** 
   - Transcribe âm thanh. Đã xử lý lỗi gửi nhiều request (sử dụng Endpoint `POST /api/media/transcribe` nhận `file_path` có sẵn trên server thay vì upload lại).
3. **`voice_service.py` (4-Tier Voice Engine):** 
   - Quản lý lazy load cho Edge-TTS (cơ bản), F5-TTS Clone, CosyVoice và RVC để lồng tiếng (Dubbing).

### Core API Routes (`main.py`):
- `POST /api/media/upload`: Lưu file vào `temp/uploads/`.
- `POST /api/media/transcribe`: Khởi động Whisper dựa trên `file_path`.
- `POST /api/media/extract-clips` | `/create-muted` | `/merge` | `/export-srt`.
- `POST /api/voice/edge-tts` | `/clone` | `/unload`.

---

## 3. Media Studio v2.0 (React Frontend)
Thay thế toàn bộ giao diện Iframe Gradio cũ bằng **React NLE (Non-Linear Editor) 3-Panel**:
- **Panel 1 - Media Bin:** Quản lý hàng chờ file upload, hiển thị trạng thái, và trigger "Chuyển sang Shadowing".
- **Panel 2 - AI Inspector:** Giao diện xem transcript của Whisper đồng bộ với Video (click-to-seek), tìm kiếm từ khóa.
- **Panel 3 - Output & Voice Lab:** 
  - ✂️ **Cắt & Xuất:** Xuất MP3, SRT, Video câm.
  - 🎙️ **Voice Lab:** Thử nghiệm Edge-TTS và Voice Clone.
  - 🎬 **Lồng tiếng (Dubbing):** Ghép âm thanh AI vào video chuẩn.

---

## 4. Anki Universal Sandbox
Trình phát Anki siêu tốc 100% Offline lưu trực tiếp trên Ổ cứng trình duyệt (OPFS).
- SQL `JOIN` xử lý triệt để cấu trúc thẻ phức tạp, `ORDER BY ord` đảm bảo Front->Back.
- Iframe Sandbox cô lập CSS/JS của tác giả.
- Quét media động (`[sound:...]`, `<img src="...">`) và chuyển thành `Blob URL` qua chuẩn hóa `Unicode NFC` (Chống lỗi sai font chữ Mac/Win).
- Tích hợp 4 nút đánh giá chuẩn (FSRS-ready).

---

## 5. UI State Management & Global Audio Control
Tối ưu hóa luồng UX chuyển tab của ứng dụng React (SPA) để đảm bảo tính liền mạch.
- **State Persistence (CSS-based routing):** Sửa đổi `App.jsx` dùng `useLocation` kết hợp `display: none / block` để không Unmount các component khi chuyển Tab. Dữ liệu đang nhập, tiến độ Video (Tắm ngôn ngữ, Shadowing) được bảo lưu vĩnh viễn trong phiên.
- **Auto Pause Media (Global Listener):** Bắt sự kiện chuyển route (URL change) trong `App.jsx`, tự động dò tìm mọi thẻ `<audio>`, `<video>` đang có trên DOM và gọi lệnh `pause()`. Khiến tab không còn phát âm thanh ngầm khi chuyển sang tab khác.

---

## 6. Lựa chọn Giọng nói AI (TTS Engine Selector)
Tích hợp khả năng chọn Giọng đọc AI tự nhiên ngay trong giao diện luyện tập.
- **Immersion Reader:** Thêm Dropdown chọn Engine (Edge-TTS / Supertonic) và Nhân vật (Nanami, Keita, Aoi...) ngay cạnh nút "Nghe Sách Nói".
- **Shadowing Studio:** 
  - Bổ sung tùy chọn AI Voice trong Grid Settings.
  - Tích hợp nút Đọc AI riêng biệt cho từng phân đoạn (Segment) cạnh nút ghi âm Micro, hỗ trợ luyện nghe câu lẻ với giọng chuẩn.

# KIẾN TRÚC & QUY CHUẨN CỐT LÕI - KIDMEDIA STUDIO

Tài liệu này đóng vai trò là "Hiến pháp" của dự án KidMedia Studio. Mọi đoạn code, mọi module được thêm vào sau này bắt buộc phải tuân thủ 100% các tiêu chuẩn dưới đây.

## 1. QUY CHUẨN GIAO DIỆN & THẨM MỸ (PRO-KID NLE DESIGN)
Định hướng: Sức mạnh và luồng công việc (Workflow) của một phần mềm dựng phim chuyên nghiệp (NLE - Premiere Pro, FL Studio), nhưng khoác lớp áo thân thiện, màu sắc của trẻ em.

- **Edge-to-Edge Viewport:** Ứng dụng luôn bung rộng 100vw và 100vh. Không có viền trắng thừa. Bố cục không được cuộn trang (scroll) toàn màn hình mà chỉ cuộn trong từng Panel cụ thể.
- **Bố cục 3 Panel Độc Lập:** 
  - `Panel Trái (Media Bin):` Nơi chứa tài nguyên thô (Upload, Danh sách file/Media Pool, Các công cụ Save/Load Project). Cột này nhỏ nhất.
  - `Panel Giữa (Inspector/Editor):` Khu vực cấu hình thông số (AI, Cắt xén) và hiển thị Transcript.
  - `Panel Phải (Preview/Output):` Khu vực xem trước kết quả và Bảng điều khiển Xuất file (Export Panel).
- **Mini-Icon Sidebar:** Sidebar điều hướng không được ẩn hoàn toàn. Khi thu gọn, nó phải giữ lại một dải dọc 60px chứa các icon (✂️, 🎙️) để người dùng luôn biết mình đang ở đâu.
- **Thẩm mỹ Hình khối:** Góc bo tròn (border-radius: 16px). Nút bấm mang hiệu ứng 3D nhẹ, shadow rõ ràng.

## 2. QUY CHUẨN ĐA NGÔN NGỮ (GLOBAL I18N)
- **Cấm Hardcode Text:** Không viết trực tiếp văn bản Tiếng Việt/Tiếng Nhật vào mã nguồn UI.
- **Từ điển Toàn cục:** Tất cả văn bản phải được lấy từ một biến `I18N_DICTIONARY`.
- **Cập nhật Thời gian thực (Real-time):** Khi chuyển đổi ngôn ngữ, giao diện phải thay đổi ngay lập tức mà không tải lại trang.

## 3. KIẾN TRÚC MÃ NGUỒN & QUẢN LÝ DỮ LIỆU (DRY PRINCIPLE)
- **State Management (Quản lý Trạng thái Toàn cục):** 
  - Danh sách video (Media Pool) và Dữ liệu AI đã quét (Transcript) là tài nguyên chung. Chúng phải được lưu ở cấp `gr.State()` toàn cục.
- **Trí tuệ Bộ nhớ Đệm (Smart Cache):** 
  - Bắt buộc kiểm tra Hash (chữ ký) của file trước khi xử lý AI. Nếu file đã từng được quét, tự động lấy dữ liệu từ Cache thay vì chạy lại AI.
- **Seamless Pipeline (Luân chuyển không đứt quãng):** 
  - Bắt buộc phải có nút "Gửi đến..." (Send To...) để luân chuyển video từ Trạm này sang Trạm khác. Tuyệt đối không bắt người dùng upload lại file.
- **Project Session (Lưu Phiên Làm Việc):**
  - Hệ thống phải có khả năng Export toàn bộ State hiện tại ra file JSON (`.kidproj`) và Import lại để tiếp tục công việc đang dang dở.
- **Tập trung hóa Lõi AI:** Chỉ có một instance của Whisper AI được nạp vào bộ nhớ để tránh tràn RAM/VRAM.

---
*Cập nhật lần cuối: May 2026. Mọi thay đổi kiến trúc đều phải được đối chiếu với văn kiện này.*

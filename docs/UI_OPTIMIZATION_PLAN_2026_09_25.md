# Kế Hoạch Tối Ưu Toàn Diện Giao Diện OmniLinguist
> **Ngày tạo:** 2026-09-25  
> **Phiên bản:** 1.0  
> **Trạng thái:** Đã được duyệt bởi người dùng  

---

## 1. Tổng Quan Audit

Sau khi kiểm tra toàn bộ **16 route / 13 page component**, sidebar, layout shell, và design token system, báo cáo phát hiện **10 vấn đề** cần khắc phục để đạt chuẩn native-app chuyên nghiệp. Benchmark: **Duolingo, Bunpro, WaniKani, Notion, Linear**.

---

## 2. Vấn Đề Phát Hiện

### 🔴 Critical

| # | Vấn đề | Chi tiết |
|---|--------|---------|
| 1 | **4 tầng maxWidth** | 800px (Settings) → 840px (MockTest) → 900px (Dictionary) → 1360-1380px (Dashboard/Roadmap/News) → 1600px (Kanji/Flashcards/Anki) → full-bleed (ImmersionReader/Grammar/Media) |
| 2 | **6 chiến lược height** | `calc(100vh-90px)`, `calc(100vh-100px)`, `88vh`, `85vh`, `100%`, natural scroll — gây thanh cuộn kép và nội dung bị cắt |
| 3 | **0/13 trang dùng ODS classes** | `.ods-card`, `.ods-btn`, `.ods-tab-pill` đã định nghĩa trong index.css nhưng không trang nào sử dụng |
| 4 | **10/13 files duplicate LEVEL_COLORS** | Mỗi file tự khai báo `const LEVEL_COLORS = { N5: '#10b981', N4: '#3b82f6', N3: '#f59e0b', N2: '#8b5cf6', N1: '#ef4444' }` |
| 5 | **Settings.jsx lệch trái** | `maxWidth: 800` không có `margin: '0 auto'`, không có CSS definition cho `.view-container`, `.view-header` |
| 6 | **Sidebar phẳng** | JLPT Dojo có 5 tabs ẩn bên trong, ImmersionReader có 8+ thể loại + 3 chế độ đọc — người dùng không biết |

### 🟡 Medium

| # | Vấn đề | Chi tiết |
|---|--------|---------|
| 7 | Emoji tràn lan | `⛩️`, `🌱`, `📖`, `🧱`, `🎙️`, `⚡`, `🟢`, `📘`, `⏰`, `✅`, `✍️`, `🔴`, `🌐`, `🗾` trong tabs/badges/stats |
| 8 | Gradient icon header mỗi trang khác nhau | 5 trang dùng `linear-gradient(135deg, ...)` với color pair khác nhau |
| 9 | Hover bằng inline JS thay vì CSS | `onMouseEnter/onMouseLeave` thay đổi `e.currentTarget.style` thay vì dùng CSS `:hover` |
| 10 | Component naming sai | `GrammarStudio.jsx` chứa `const WritingStudio` |

---

## 3. Kế Hoạch 5 Phase

### Phase 1: Centralize Design Tokens & Shared Utilities
- **[NEW]** `src/theme.js` — Export `JLPT_LEVEL_COLORS`, `getLevelBadgeStyle()`, `PAGE_SHELL_MODES`
- **[MODIFY]** `src/index.css` — Thêm `--jlpt-n5..n1`, `.page-shell-content`, `.page-shell-studio`, chuẩn hóa page transitions

### Phase 2: Sidebar Phân Cấp
- **[MODIFY]** `src/Sidebar.jsx` — Thêm `children` array, `expandedItems` state, accordion sub-items
- **[MODIFY]** `src/JlptMasterDojo.jsx` — Đọc `searchParams.get('tab')` từ URL
- **[MODIFY]** `src/ImmersionReader.jsx` — Đọc `searchParams.get('genre')`, `searchParams.get('mode')`

### Phase 3: Chuẩn Hóa Page Shells
- **Content Pages** (maxWidth: 1380px): Dashboard, Roadmap, JapanNewsHub, Dictionary (900→1380), MockTestStudio (840→1380), Settings (800→1380, fix centering)
- **Studio Pages** (height: calc(100vh - var(--header-height))): ImmersionReader, KanjiStudio, VocabularyFlashcards, GrammarExplorer, GrammarStudio, MediaStudio, AnkiSandboxMode, JlptMasterDojo

### Phase 4: Visual Consistency
- **[NEW]** `src/components/PageHeader.jsx` — Reusable header component
- Xóa `LEVEL_COLORS` duplicates → import từ `src/theme.js`
- Thay legacy `.btn` → `.ods-btn`
- Thay emoji → Lucide icons (giữ lại emoji trong nội dung bài học)
- Thay inline hover JS → CSS `:hover`
- Fix orphaned classes Settings.jsx

### Phase 5: Native-App Feel & Polish
- Page transitions: `pageSlideIn` animation
- Skeleton loading cho `<Suspense>` fallback
- Scrollbar styling (thin, muted)
- Mobile `100dvh` thay `100vh`
- `overscroll-behavior: contain` cho Studio pages
- View Transitions API cho route changes

---

## 4. Quyết Định Đã Duyệt
1. ✅ Dictionary mở rộng 900→1380px, restructure 2-column
2. ✅ MockTestStudio mở rộng 840→1380px, restructure sidebar question list + main view
3. ✅ Emoji: Loại bỏ khỏi UI elements (tabs, badges, stats, buttons), giữ lại trong nội dung bài học và mascot
4. ✅ Chuẩn hóa 2 page shell modes (Content 1380px vs Studio full-viewport)

---

## 5. Files Cần Thay Đổi

| Phase | File | Loại |
|-------|------|------|
| 1 | `src/theme.js` | NEW |
| 1 | `src/index.css` | MODIFY |
| 2 | `src/Sidebar.jsx` | MODIFY |
| 2 | `src/JlptMasterDojo.jsx` | MODIFY |
| 2 | `src/ImmersionReader.jsx` | MODIFY |
| 3 | `src/Dashboard.jsx` | MODIFY |
| 3 | `src/Roadmap.jsx` | MODIFY |
| 3 | `src/JapanNewsHub.jsx` | MODIFY |
| 3 | `src/Dictionary.jsx` | MODIFY |
| 3 | `src/MockTestStudio.jsx` | MODIFY |
| 3 | `src/Settings.jsx` | MODIFY |
| 3 | `src/KanjiStudio.jsx` | MODIFY |
| 3 | `src/VocabularyFlashcards.jsx` | MODIFY |
| 3 | `src/GrammarExplorer.jsx` | MODIFY |
| 3 | `src/GrammarStudio.jsx` | MODIFY |
| 3 | `src/MediaStudio.jsx` | MODIFY |
| 3 | `src/AnkiSandboxMode.jsx` | MODIFY |
| 4 | `src/components/PageHeader.jsx` | NEW |
| 4 | Tất cả 13 page files | MODIFY |
| 5 | `src/index.css` | MODIFY |
| 5 | `src/App.jsx` | MODIFY |

**Tổng cộng: 2 files mới + 15 files modify**

---

## 6. Verification Plan

```bash
npm run build
npm run audit:stories
```

Manual: Kiểm tra Light/Dark mode, sidebar expand/collapse (desktop >1024px, mobile <1024px), JLPT sub-nav, ImmersionReader sub-nav, maxWidth consistency, page transitions, responsive breakpoints (1440/1024/768/375px).

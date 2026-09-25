# BỘ QUY TẮC GIAO DIỆN TOÀN HỆ THỐNG OMNILINGUIST (ODS 3.0)
> **Kế thừa:** YSDMS NextGen (SAP Fiori Horizon, Linear, Notion, GitHub Primer)  
> **Chuyên biệt:** Ứng dụng Tự Học Ngôn Ngữ Nhật Bản — EdTech SPA  
> **Phiên bản:** 3.0.0 — 2026-09-25  
> **Triết lý:** *Chuyên nghiệp nhưng ấm áp. Mật độ cao nhưng dễ thở. Khoa học nhưng có hồn.*

---

## MỤC LỤC
1. [Triết Lý Thiết Kế](#1-triết-lý-thiết-kế)
2. [Kiến Trúc Bố Cục](#2-kiến-trúc-bố-cục)
3. [Hệ Thống Màu Sắc](#3-hệ-thống-màu-sắc)
4. [Typography](#4-typography)
5. [Spacing & Grid](#5-spacing--grid)
6. [Component Library](#6-component-library)
7. [Sidebar & Navigation](#7-sidebar--navigation)
8. [Tương Tác & Animation](#8-tương-tác--animation)
9. [Emoji & Iconography](#9-emoji--iconography)
10. [Responsive & Mobile](#10-responsive--mobile)
11. [Dark Mode](#11-dark-mode)
12. [Accessibility](#12-accessibility)
13. [Code Conventions](#13-code-conventions)

---

## 1. TRIẾT LÝ THIẾT KẾ

### 1.1. Nguyên Tắc Cốt Lõi

| Nguyên tắc | Giải thích | Anti-pattern |
|-------------|-----------|--------------|
| **Nhất quán (Consistency)** | Mọi trang phải thuộc 1 trong 2 page shell, dùng chung tokens | Mỗi trang tự đặt maxWidth, height khác nhau |
| **Mật độ thích ứng (Adaptive Density)** | Thông tin dày đặc nhưng có nhịp thở — card padding 12-16px, gap 12-16px | Quá thưa thớt lãng phí hoặc quá chật chội khó đọc |
| **Phân biệt có kiểm soát (Controlled Distinction)** | Các đề mục/section dùng tint color khác nhau để phân biệt, nhưng palette giới hạn 5 tints | Rainbow/neon, quá nhiều màu loè loẹt |
| **Chuyên nghiệp ấm áp (Professional Warmth)** | Cấu trúc kỷ luật của Linear/Notion kết hợp nét mềm mại của EdTech Nhật Bản | Quá lạnh lẽo công nghiệp hoặc quá trẻ con cartoon |
| **Native-app feel** | Không flash trắng khi chuyển trang, transitions mượt, scroll contained | Trang web cổ điển với full-page reload |

### 1.2. Benchmark Tham Chiếu

| Ứng dụng | Bài học áp dụng |
|-----------|----------------|
| **Notion** | Sidebar phân cấp expand/collapse, page shell nhất quán, clean typography |
| **Linear** | Rail sidebar auto-collapse + hover expand, keyboard shortcuts, transitions |
| **Duolingo** | Gamification widgets, progress tracking UI, bento grid dashboard |
| **Bunpro** | SRS review interface, grammar point layout, level-coded badges |
| **WaniKani** | Dashboard widgets, review forecast, dense data display |

---

## 2. KIẾN TRÚC BỐ CỤC

### 2.1. App Shell (Khung Ứng Dụng)

```
┌─────────────────────────────────────────────────────────────────┐
│ .app-shell (display: flex; height: 100vh; overflow: hidden)     │
│                                                                  │
│  ┌──────────┐  ┌─────────────────────────────────────────────┐  │
│  │ Sidebar  │  │ .app-main (flex: 1; flex-direction: column) │  │
│  │ Rail     │  │                                             │  │
│  │ 68px     │  │  ┌─────────────────────────────────────┐    │  │
│  │ ──or──   │  │  │ .app-topbar (56px fixed)            │    │  │
│  │ Pinned   │  │  └─────────────────────────────────────┘    │  │
│  │ 240px    │  │  ┌─────────────────────────────────────┐    │  │
│  │          │  │  │ .app-content (flex: 1; overflow-y)  │    │  │
│  │          │  │  │                                     │    │  │
│  │          │  │  │   [Page Shell Content/Studio]       │    │  │
│  │          │  │  │                                     │    │  │
│  │          │  │  └─────────────────────────────────────┘    │  │
│  │          │  │  ┌─────────────────────────────────────┐    │  │
│  │          │  │  │ BottomNav (mobile only, <1024px)    │    │  │
│  └──────────┘  │  └─────────────────────────────────────┘    │  │
│                └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Hai Chế Độ Page Shell (BẮT BUỘC)

Mỗi trang PHẢI thuộc 1 trong 2 chế độ. KHÔNG ĐƯỢC tự tạo shell riêng.

#### Chế độ A: Content Page (Trang nội dung cuộn)
```css
.page-shell-content {
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 var(--space-6);    /* 0 20px */
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```
**Dùng cho:** Dashboard, Roadmap, JapanNewsHub, Dictionary, MockTestStudio, Settings

#### Chế độ B: Studio Page (Workspace toàn màn hình)
```css
.page-shell-studio {
  width: 100%;
  height: calc(100vh - var(--header-height));  /* 100vh - 56px */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  overscroll-behavior: contain;
}
/* Mobile Safari fix */
@supports (height: 100dvh) {
  .page-shell-studio { height: calc(100dvh - var(--header-height)); }
}
```
**Dùng cho:** ImmersionReader, KanjiStudio, VocabularyFlashcards, GrammarExplorer, GrammarStudio, MediaStudio, AnkiSandboxMode, JlptMasterDojo

### 2.3. Quy Tắc Bên Trong Page Shell

| Quy tắc | Giá trị | Ghi chú |
|---------|---------|---------|
| **Padding ngang** | `20px` (Content) / `clamp(16px, 3vw, 40px)` (Studio) | Dùng clamp cho Studio để tự co trên mobile |
| **Gap giữa sections** | `16px – 18px` | Tạo nhịp thở giữa các khối nội dung |
| **Toolbar height** | `42px – 48px` | KHÔNG vượt quá 48px, KHÔNG dựng hero banner |
| **Grid layout** | `repeat(auto-fill, minmax(310px, 1fr))` | Cho danh mục/catalog view |

---

## 3. HỆ THỐNG MÀU SẮC

### 3.1. Phân Tầng Bề Mặt

| Token | Light | Dark | Mục đích |
|-------|-------|------|----------|
| `--bg-main` | `#f8fafc` | `#0b1120` | Nền trang chính |
| `--bg-surface` | `#ffffff` | `#111827` | Bề mặt thẻ/card |
| `--bg-surface-2` | `#f1f5f9` | `#1e293b` | Nền thẻ con, header bảng |
| `--bg-surface-3` | `#e2e8f0` | `#334155` | Nền phân tầng sâu hơn |
| `--bg-card` | `rgba(255,255,255,0.92)` | `rgba(30,41,59,0.65)` | Card glass effect |
| `--bg-elevated` | `#f1f5f9` | `#1e293b` | Phần tử nổi (dropdown, popover) |
| `--bg-hover` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.04)` | Hover state |
| `--bg-active` | `rgba(37,99,235,0.08)` | `rgba(59,130,246,0.12)` | Active/selected state |

### 3.2. Văn Bản

| Token | Light | Dark | Mục đích |
|-------|-------|------|----------|
| `--text-primary` | `#0f172a` | `#f1f5f9` | Tiêu đề, nội dung chính |
| `--text-secondary` | `#475569` | `#cbd5e1` | Phụ đề, meta info |
| `--text-tertiary` | `#64748b` | `#94a3b8` | Placeholder, hint |
| `--text-muted` | `#64748b` | `#94a3b8` | Nội dung không quan trọng |

### 3.3. Viền & Đổ Bóng

| Token | Light | Dark |
|-------|-------|------|
| `--border-default` | `#e2e8f0` | `#334155` |
| `--border-strong` | `#cbd5e1` | `#475569` |
| `--border-subtle` | `#f1f5f9` | `#1e293b` |
| `--glass-border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` |
| `--glass-shadow` | `0 4px 24px rgba(0,0,0,0.06)` | `0 4px 24px rgba(0,0,0,0.25)` |

### 3.4. Accent & Trạng Thái

| Token | Light | Dark | Dùng cho |
|-------|-------|------|----------|
| `--accent-primary` | `#2563eb` | `#3b82f6` | CTA, link, active tab |
| `--accent-hover` | `#1d4ed8` | `#2563eb` | Hover state của accent |
| `--status-success` | `#10b981` | `#10b981` | Đúng, hoàn thành |
| `--status-error` | `#ef4444` | `#ef4444` | Sai, lỗi |
| `--status-warning` | `#f59e0b` | `#f59e0b` | Cảnh báo |
| `--status-info` | `#0284c7` | `#38bdf8` | Thông tin |

### 3.5. JLPT Level Colors (MỚI — Centralized)

| Level | CSS Variable | Hex | Tint Name | Dùng cho |
|-------|-------------|-----|-----------|----------|
| N5 | `--jlpt-n5` | `#10b981` (Emerald) | Matcha | Badge, filter, progress |
| N4 | `--jlpt-n4` | `#3b82f6` (Blue) | Sky | Badge, filter, progress |
| N3 | `--jlpt-n3` | `#f59e0b` (Amber) | Amber | Badge, filter, progress |
| N2 | `--jlpt-n2` | `#8b5cf6` (Violet) | Violet | Badge, filter, progress |
| N1 | `--jlpt-n1` | `#ef4444` (Red) | Sakura | Badge, filter, progress |

**QUY TẮC:** KHÔNG ĐƯỢC khai báo `const LEVEL_COLORS = {...}` trong bất kỳ file nào. Luôn import từ `src/theme.js`.

### 3.6. Pedagogical Section Tints (5 Palettes)

Mỗi palette gồm 3 tokens: `bg` (nền nhạt), `border` (viền trung bình), `text` (chữ đậm).

| Tint | Background | Border | Text | Dùng cho |
|------|-----------|--------|------|----------|
| **Sakura** | `--tint-sakura-bg` | `--tint-sakura-border` | `--tint-sakura-text` (#e11d48) | Minna/N1, Sketchnote |
| **Matcha** | `--tint-matcha-bg` | `--tint-matcha-border` | `--tint-matcha-text` (#047857) | N5, Beginner |
| **Sky** | `--tint-sky-bg` | `--tint-sky-border` | `--tint-sky-text` (#0284c7) | N4, Grammar |
| **Amber** | `--tint-amber-bg` | `--tint-amber-border` | `--tint-amber-text` (#b45309) | N3, Warnings |
| **Violet** | `--tint-violet-bg` | `--tint-violet-border` | `--tint-violet-text` (#6d28d9) | N2, Advanced |

**QUY TẮC PHÂN BIỆT SECTION:** Khi 1 trang có ≥3 section cùng cấp, PHẢI dùng các tint khác nhau cho top-border hoặc left-border của `.ods-kpi-card` để phân biệt trực quan. KHÔNG để tất cả cùng một màu.

---

## 4. TYPOGRAPHY

### 4.1. Font Stack

```css
/* Latin / Vietnamese */
font-family: 'Inter', 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;

/* Japanese (Kanji / Kana) */
font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;

/* Code / Grammar Formula */
font-family: 'Consolas', 'JetBrains Mono', 'SF Mono', monospace;
```

### 4.2. Type Scale

| Cấp | Size | Weight | Line Height | Dùng cho |
|-----|------|--------|-------------|----------|
| **Micro** | `11px` | 700 | 1.4 | Badge, tag, pill |
| **Caption** | `12px` | 600 | 1.4 | Chú thích, meta, timestamp |
| **Body Small** | `13px` | 400-500 | 1.5 | Nội dung thẻ, bảng, input label |
| **Body** | `14px` | 400 | 1.6 | Nội dung chính, mô tả |
| **Japanese Text** | `15-16px` | 400-500 | 1.8 | Câu ví dụ tiếng Nhật (lớn hơn Latin 1px) |
| **Heading 3** | `16px` | 700 | 1.4 | Tiêu đề section nhỏ |
| **Heading 2** | `18px` | 800 | 1.3 | Tiêu đề bài học, grammar pattern |
| **Heading 1** | `20-22px` | 800 | 1.2 | Tiêu đề trang (hiếm khi dùng, toolbar đã ghi) |

### 4.3. Furigana Rules

```css
ruby {
  ruby-position: over;
  line-height: 1.8;    /* Tối thiểu 1.65, khuyến nghị 1.8 */
}
rt {
  font-size: 0.55em;   /* 50-55% kích thước kanji */
  color: var(--text-secondary);  /* Nhạt hơn kanji 1 bậc */
  user-select: none;
  letter-spacing: 0;
}
```

---

## 5. SPACING & GRID

### 5.1. 4px Base Grid

| Token | Value | Dùng cho |
|-------|-------|----------|
| `--space-1` | `2px` | Micro-spacing (viền, dot status) |
| `--space-2` | `4px` | Tag padding, icon gap |
| `--space-3` | `8px` | Button padding, small card gap |
| `--space-4` | `12px` | Card padding, grid gutter |
| `--space-5` | `16px` | Section margin, standard padding |
| `--space-6` | `20px` | Container padding, header spacing |
| `--space-7` | `24px` | Module separation |
| `--space-8` | `32px` | Page top gutter |

### 5.2. Border Radius

| Token | Value | Dùng cho |
|-------|-------|----------|
| `--radius-xs` | `6px` | Button, input, small pill |
| `--radius-sm` | `8px` | Tag, dropdown item |
| `--radius-md` | `12px` | Card, panel |
| `--radius-lg` | `16px` | Modal, drawer |
| `--radius-xl` | `20px` | Large modal, splash card |

---

## 6. COMPONENT LIBRARY

### 6.1. Card (`.ods-card`)
```css
.ods-card {
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);   /* 12px */
  box-shadow: var(--glass-shadow);
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
.ods-card:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
```
**QUY TẮC:** KHÔNG dùng inline `onMouseEnter/onMouseLeave` cho hover effect trên card. Luôn dùng CSS `:hover`.

### 6.2. KPI Card (`.ods-kpi-card`)
- Top-border 3px màu tint → phân biệt section
- Variants: `--sakura`, `--matcha`, `--sky`, `--amber`, `--violet`

### 6.3. Badge (`.ods-badge`)
- Pill shape (border-radius: 999px)
- Font 11px, weight 700
- Variants theo tint: `--sakura`, `--matcha`, `--sky`, `--amber`, `--violet`

### 6.4. Button (`.ods-btn`)
- Height: `34px`
- Font: `13px`, weight `700`
- Border-radius: `var(--radius-xs)` (6px)
- **Primary**: `--accent-primary` background, white text
- **Secondary**: `--bg-surface` background, `--glass-border-strong` border
- **Ghost**: transparent background, text color only

**QUY TẮC:** KHÔNG dùng legacy `.btn`, `.btn-primary`, `.btn-outline`. Luôn dùng `.ods-btn`, `.ods-btn-primary`, `.ods-btn-secondary`.

### 6.5. Tab Bar (`.ods-tab-bar` + `.ods-tab-pill`)
- Flex container, gap 4px
- Tab: padding `5px 12px`, font `12px`, weight 600
- Active tab: `--accent-primary` color, `--bg-surface` background, subtle box-shadow

### 6.6. Page Header Component (`<PageHeader>`)
```jsx
<PageHeader
  icon={<BookOpen />}       // Lucide icon
  title="Tiêu đề trang"
  subtitle="Mô tả ngắn"
  gradient={['#2563eb', '#8b5cf6']}  // Optional gradient pair
/>
```
- Height: 42-48px max
- Icon: 36px squircle gradient background
- Title: 16-18px, weight 800
- Subtitle: 12px, `--text-secondary`

### 6.7. Học Tập Chuyên Biệt

#### Trắc Nghiệm Phản Xạ (Quiz Drill)
- 4 đáp án lưới 2×2
- Chưa chọn: `--glass-border`, `--bg-surface`
- Đúng: `--status-success-bg`, `--status-success-border`, icon CheckCircle
- Sai: `--status-error-bg`, `--status-error-border`, icon XCircle

#### Audio Pronunciation Button
- Size: `28px × 28px`
- Background: transparent
- Hover: `--accent-subtle`
- Đang phát: icon đổi màu `--accent-primary` + pulse animation

---

## 7. SIDEBAR & NAVIGATION

### 7.1. Sidebar Dimensions
- Expanded/Pinned: `240px`
- Collapsed (Rail): `68px`
- Mobile drawer: `280px`

### 7.2. Hierarchical Navigation
Sidebar HỖ TRỢ phân cấp 2 tầng:

```
Section Header (学習ツール)
├── Normal item      → click navigates
├── ▸ Expandable item → click toggles children
│   ├── Sub-item 1   → click navigates with query params
│   ├── Sub-item 2
│   └── Sub-item 3
├── Normal item
```

**Quy tắc:**
- Chỉ tối đa 2 tầng (parent → children). KHÔNG lồng sâu hơn.
- `expandedItems` state persisted vào `localStorage`
- Sub-items dùng `?tab=`, `?genre=`, `?mode=` query params — KHÔNG tạo route mới
- Khi sidebar collapsed (rail mode), hover parent hiển thị flyout tooltip chứa children
- Parent item highlighted khi bất kỳ child nào active

### 7.3. Active State
- Active item: `--accent-primary` text, `--bg-active` background, left border 3px `--accent-primary`
- Hover item: `--bg-hover` background
- Section header: `--text-tertiary`, uppercase, `11px`, weight 700, letter-spacing `0.05em`

### 7.4. Mobile Navigation
- Bottom nav: 4 core tabs (Home, Flashcards, Reading, Dictionary) + "More" → opens sidebar drawer
- Sidebar drawer: off-canvas `280px`, dark backdrop, auto-close on navigate

---

## 8. TƯƠNG TÁC & ANIMATION

### 8.1. Page Transitions
```css
.page-shell-content, .page-shell-studio {
  animation: pageSlideIn 0.2s ease-out;
}
@keyframes pageSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 8.2. Transition Tokens
| Token | Value | Dùng cho |
|-------|-------|----------|
| `--transition-fast` | `0.15s ease` | Hover, focus, toggle |
| `--transition-normal` | `0.25s ease` | Page mount, drawer open |

### 8.3. Hover Rules
- **Card hover**: `translateY(-1px)`, border-color → accent, shadow tăng
- **Button hover**: background darken 1 bậc
- **Link hover**: underline + color shift

**QUY TẮC:** LUÔN dùng CSS `:hover` pseudo-class. KHÔNG dùng inline JS `onMouseEnter/onMouseLeave` trừ khi cần logic phức tạp (ví dụ: tooltip positioning).

### 8.4. Loading States
- `<Suspense>` fallback: Skeleton layout matching page type (không chỉ spinner)
- Content loading: Shimmer animation trên card placeholder

### 8.5. Scrollbar Styling
```css
.app-content::-webkit-scrollbar { width: 6px; }
.app-content::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 3px;
}
.app-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-strong);
}
```

---

## 9. EMOJI & ICONOGRAPHY

### 9.1. Emoji Policy

| Vị trí | Emoji | Lucide Icon | Giải thích |
|--------|-------|-------------|-----------|
| **Tab labels** | ❌ KHÔNG | ✅ CÓ | Dùng Lucide icon 16px thay emoji |
| **Stats badges** | ❌ KHÔNG | ✅ CÓ | `📘 Mới:` → `<BookOpen size={14}/> Mới:` |
| **Button text** | ❌ KHÔNG | ✅ CÓ | `✍️ Luyện Tập` → `<Pencil size={14}/> Luyện Tập` |
| **Select options** | ❌ KHÔNG | ✅ CÓ | `⛩️ Bộ Thủ` → `<Landmark size={14}/> Bộ Thủ` |
| **Section headers** | ❌ KHÔNG | ✅ CÓ | `🔴 BREAKING` → `<AlertCircle size={14}/> BREAKING` |
| **Nội dung bài học** | ✅ GIỮ | — | Mascot, ẩn dụ hình ảnh, tip/trick nội dung |
| **Mindmap branches** | ✅ GIỮ | — | `mascotIcon` trong dữ liệu curriculum |
| **Notification/toast** | ✅ GIỮ | — | Phản hồi cảm xúc (đúng/sai/hoàn thành) |

### 9.2. Icon Sizing

| Context | Size | Weight |
|---------|------|--------|
| Inline with text | `14px` | 1.5 (stroke) |
| Sidebar nav item | `18px` | 1.5 |
| Button icon | `14-16px` | 2 |
| Page header icon | `20-22px` | 1.5 |
| Standalone action | `20px` | 1.5 |

---

## 10. RESPONSIVE & MOBILE

### 10.1. Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| **Desktop XL** | ≥1440px | Sidebar pinned default, full content |
| **Desktop** | 1024-1439px | Sidebar rail auto-collapse, full content |
| **Tablet** | 768-1023px | Sidebar hidden (drawer), bottom nav, 2-col → 1-col |
| **Mobile** | <768px | Sidebar drawer, bottom nav, 1-col, compact padding |

### 10.2. Mobile Adaptations
- `100dvh` thay `100vh` (Safari address bar)
- Touch targets: tối thiểu `44px × 44px`
- Studio 2-column layouts → stack to 1-column ở `<980px`
- Sidebar drawer `280px`, auto-close on navigate
- Bottom nav: 4 core tabs + "More"

---

## 11. DARK MODE

### 11.1. Nguyên Tắc
- KHÔNG dùng `#000000` pure black — dùng `#0b1120` deep navy
- Surface layers tăng dần luminance: `#0b1120` → `#111827` → `#1e293b` → `#334155`
- Text contrast ratio ≥ 4.5:1 (WCAG AA)
- Tint colors adjust: giảm saturation, tăng lightness cho dark mode
- Glass effects: giảm opacity background, tăng opacity border

### 11.2. Transition
```css
[data-theme] {
  transition: background-color 0.3s ease, color 0.2s ease, border-color 0.2s ease;
}
```

---

## 12. ACCESSIBILITY

### 12.1. Contrast
- Text trên background: ≥ 4.5:1 (WCAG AA)
- Large text (≥18px bold): ≥ 3:1

### 12.2. Focus States
- Tất cả interactive elements PHẢI có visible focus ring:
```css
:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### 12.3. Keyboard Navigation
- Tab order logic: sidebar → topbar → main content
- Escape: close modal/drawer
- Arrow keys: navigate within lists

---

## 13. CODE CONVENTIONS

### 13.1. Styling Hierarchy (Ưu Tiên)
1. **CSS Classes** (`.ods-*`, `.page-shell-*`) — cho layout, components chuẩn
2. **CSS Variables** (`var(--token)`) — cho colors, spacing, radii
3. **Inline styles** — CHỈ cho dynamic values (ví dụ: width tính toán, position dựa trên data)

**QUY TẮC:** KHÔNG dùng inline style cho:
- Colors → dùng CSS variable
- Hover effects → dùng CSS class
- Static padding/margin → dùng CSS class hoặc spacing token
- Border-radius → dùng radius token

### 13.2. Shared Imports
```jsx
// ✅ ĐÚNG
import { JLPT_LEVEL_COLORS, getLevelBadgeStyle } from './theme';

// ❌ SAI — KHÔNG duplicate
const LEVEL_COLORS = { N5: '#10b981', N4: '#3b82f6', ... };
```

### 13.3. Component Naming
- File name PHẢI khớp với export component name
- `GrammarStudio.jsx` → `export default function GrammarStudio()`
- KHÔNG: `GrammarStudio.jsx` chứa `const WritingStudio`

### 13.4. Page Shell Usage
```jsx
// ✅ Content Page
function Settings() {
  return (
    <div className="page-shell-content">
      {/* ... */}
    </div>
  );
}

// ✅ Studio Page
function KanjiStudio() {
  return (
    <div className="page-shell-studio">
      {/* ... */}
    </div>
  );
}

// ❌ SAI — KHÔNG tự tạo shell
function Settings() {
  return (
    <div style={{ maxWidth: 800, padding: 24 }}>
      {/* ... */}
    </div>
  );
}
```

---

## PHỤ LỤC: MAPPING CÁC TRANG VÀO PAGE SHELL

| Trang | Shell Mode | maxWidth | Ghi chú |
|-------|-----------|----------|---------|
| Dashboard | Content | 1380px | Bento grid, KPI cards |
| Roadmap | Content | 1380px | Timeline, goal cards |
| JapanNewsHub | Content | 1380px | News grid, ticker |
| Dictionary | Content | 1380px | 2-column: search + results |
| MockTestStudio | Content | 1380px | Sidebar questions + main view |
| Settings | Content | 1380px | Form sections, API keys |
| JlptMasterDojo | Studio | Full | Catalog grid ↔ Lesson view |
| ImmersionReader | Studio | Full | Dual panel reader |
| KanjiStudio | Studio | Full | Canvas + stroke practice |
| VocabularyFlashcards | Studio | Full | FSRS deck + card view |
| GrammarExplorer | Studio | Full | Grammar library + practice |
| GrammarStudio | Studio | Full | Writing composition |
| MediaStudio | Studio | Full | Video/audio workspace |
| AnkiSandboxMode | Studio | Full | Offline deck player |
| ShadowingStudio | Studio | Full | Audio shadow practice |

# PROMPT THỰC THI — TỐI ƯU GIAO DIỆN OMNILINGUIST

> **Dùng cho:** Model thực thi (Claude/Gemini) trong phiên làm việc tiếp theo  
> **Ngày tạo:** 2026-09-25  
> **Workspace:** `d:\AntiGravity_Workspace\apps\omnilinguist`  
> **USB Mirror:** `G:\AntiGravity\apps\omnilinguist` (sync sau khi hoàn thành)  
> **Dev server:** `npm run dev` → `localhost:5173`  
> **Build:** `npm run build` (Vite)  
> **Shell:** PowerShell trên Windows — dùng `;` thay `&&` để chain commands

---

## NGỮ CẢNH

OmniLinguist là ứng dụng React SPA (Vite + React Router v6 + PWA) để tự học tiếng Nhật & luyện thi JLPT. Ứng dụng có 16 routes / 15 page components. Sau khi audit toàn diện, phát hiện nhiều vấn đề giao diện nghiêm trọng cần khắc phục.

### TÀI LIỆU THAM KHẢO BẮT BUỘC ĐỌC TRƯỚC KHI LÀM

1. **Bộ quy tắc giao diện (ODS 3.0):** `docs/OMNILINGUIST_DESIGN_SYSTEM.md` — ĐÂY LÀ TÀI LIỆU QUAN TRỌNG NHẤT. Đọc toàn bộ trước khi bắt đầu bất kỳ thay đổi nào.
2. **Kế hoạch thực thi:** `docs/UI_OPTIMIZATION_PLAN_2026_09_25.md` — Chi tiết 5 phase và danh sách files cần thay đổi.
3. **CSS tokens hiện tại:** `src/index.css` — Đặc biệt chú ý lines 1-189 (theme variables) và lines 1751-1880 (ODS component classes).

---

## NHIỆM VỤ

Thực hiện tối ưu giao diện toàn bộ hệ thống OmniLinguist theo **5 Phase** được mô tả trong kế hoạch. Mỗi phase phải build thành công (`npm run build`) trước khi chuyển sang phase tiếp theo.

---

## PHASE 1: CENTRALIZE DESIGN TOKENS

### 1.1. Tạo file mới `src/theme.js`

```javascript
/**
 * OmniLinguist Design System — Shared Theme Constants
 * Single source of truth cho JLPT level colors và page shell config.
 * KHÔNG duplicate các constant này trong bất kỳ file nào khác.
 */

// JLPT Level Colors — map tới CSS variables --jlpt-n5 .. --jlpt-n1
export const JLPT_LEVEL_COLORS = {
  N5: '#10b981',  // Matcha / Emerald
  N4: '#3b82f6',  // Sky / Blue  
  N3: '#f59e0b',  // Amber
  N2: '#8b5cf6',  // Violet
  N1: '#ef4444',  // Sakura / Red
};

// Level badge styling helper — trả về inline style object
export function getLevelBadgeStyle(level) {
  const map = {
    N5: { bg: 'var(--tint-matcha-bg)', border: 'var(--tint-matcha-border)', color: 'var(--tint-matcha-text)' },
    N4: { bg: 'var(--tint-sky-bg)', border: 'var(--tint-sky-border)', color: 'var(--tint-sky-text)' },
    N3: { bg: 'var(--tint-amber-bg)', border: 'var(--tint-amber-border)', color: 'var(--tint-amber-text)' },
    N2: { bg: 'var(--tint-violet-bg)', border: 'var(--tint-violet-border)', color: 'var(--tint-violet-text)' },
    N1: { bg: 'var(--tint-sakura-bg)', border: 'var(--tint-sakura-border)', color: 'var(--tint-sakura-text)' },
  };
  const m = map[level] || map.N5;
  return {
    background: m.bg,
    border: `1px solid ${m.border}`,
    color: m.color,
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  };
}

// Page Shell Modes
export const PAGE_SHELL = {
  CONTENT: 'page-shell-content',  // maxWidth: 1380px, scrollable
  STUDIO: 'page-shell-studio',    // full viewport, fixed height
};
```

### 1.2. Thêm vào `src/index.css`

Thêm ngay SAU dòng `--space-8: 32px;` trong `:root` (khoảng line 74):

```css
/* JLPT Level Colors (Centralized) */
--jlpt-n5: #10b981;
--jlpt-n4: #3b82f6;
--jlpt-n3: #f59e0b;
--jlpt-n2: #8b5cf6;
--jlpt-n1: #ef4444;
```

Thêm vào cuối file (sau ODS component section, trước Furigana rules):

```css
/* ── Page Shell Modes ─────────────────────────────────────────────── */
.page-shell-content {
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.page-shell-studio {
  width: 100%;
  height: calc(100vh - var(--header-height));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  overscroll-behavior: contain;
}

@supports (height: 100dvh) {
  .page-shell-studio {
    height: calc(100dvh - var(--header-height));
  }
}

/* ── Page Transition ──────────────────────────────────────────────── */
.page-shell-content, .page-shell-studio {
  animation: pageSlideIn 0.2s ease-out;
}

@keyframes pageSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Scrollbar Styling ────────────────────────────────────────────── */
.app-content::-webkit-scrollbar,
.page-shell-content::-webkit-scrollbar { width: 6px; }
.app-content::-webkit-scrollbar-thumb,
.page-shell-content::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 3px;
}
.app-content::-webkit-scrollbar-thumb:hover,
.page-shell-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-strong);
}
```

### 1.3. Verify Phase 1
```bash
npm run build
```

---

## PHASE 2: SIDEBAR PHÂN CẤP

### 2.1. Sửa `src/Sidebar.jsx`

**Thay đổi cấu trúc `SECTIONS`:**

Items JLPT Dojo và ImmersionReader cần có mảng `children`:

```javascript
{
  jp: 'JLPT 特訓道場',
  sub: 'Lò Luyện Shinkanzen',
  icon: <Swords size={18} />,
  path: '/jlpt-dojo',
  children: [
    { label: 'Minna N5-N4 (1-50)', param: 'tab=minna' },
    { label: 'Lò Luyện N3', param: 'tab=n3' },
    { label: 'Lò Luyện N2', param: 'tab=n2' },
    { label: 'Lò Luyện N1', param: 'tab=n1' },
    { label: 'Đề Thi 10 Năm', param: 'tab=exams' },
  ]
},
// ...
{
  jp: '多読 (Immersion)',
  sub: 'Tắm ngôn ngữ',
  icon: <BookOpen size={18} />,
  path: '/reading',
  children: [
    { label: 'Sách Tranh Ehon', param: 'genre=ehon', icon: <Palette size={14} /> },
    { label: 'Cổ Tích Dân Gian', param: 'genre=folktale', icon: <Landmark size={14} /> },
    { label: 'Văn Học Cổ Điển', param: 'genre=literature', icon: <BookMarked size={14} /> },
    { label: 'Rạp Phim Ehon', param: 'mode=theater', icon: <Film size={14} /> },
    { label: 'Dòng Chảy Tri Thức', param: 'tab=corpus_stream', icon: <Zap size={14} /> },
  ]
},
```

**Thêm state quản lý expand/collapse:**

```javascript
const [expandedItems, setExpandedItems] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('omni_sidebar_expanded') || '[]');
  } catch { return []; }
});

const toggleExpand = (path) => {
  setExpandedItems(prev => {
    const next = prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path];
    localStorage.setItem('omni_sidebar_expanded', JSON.stringify(next));
    return next;
  });
};
```

**Render logic cho items có children:**
- Click chevron / arrow → toggle expand
- Click item text → navigate to parent path
- Sub-items render với indent (padding-left: 36px khi expanded, padding-left: 12px khi sidebar collapsed)
- Sub-item click → navigate(`${parentPath}?${param}`)
- Active highlighting: parent active nếu `location.pathname === parentPath`; child active nếu `location.search` includes child's param

### 2.2. Sửa `src/JlptMasterDojo.jsx`

Thêm đọc URL params:

```javascript
import { useSearchParams } from 'react-router-dom';

// Trong component:
const [searchParams, setSearchParams] = useSearchParams();

// Khi mount, đọc tab từ URL
useEffect(() => {
  const tabParam = searchParams.get('tab');
  if (tabParam && ['minna', 'n3', 'n2', 'n1', 'exams'].includes(tabParam)) {
    setMainTab(tabParam);
  }
}, [searchParams]);

// Khi user click tab, sync lên URL
const handleTabChange = (tab) => {
  setMainTab(tab);
  setSearchParams({ tab });
  setLessonView('catalog');
  // ... reset other states
};
```

**Quan trọng:** Xóa `const LEVEL_COLORS` và `const getLevelBadgeStyle` nếu có, thay bằng:
```javascript
import { JLPT_LEVEL_COLORS, getLevelBadgeStyle } from './theme';
```

### 2.3. Sửa `src/ImmersionReader.jsx`

Thêm đọc URL params:

```javascript
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();

useEffect(() => {
  const genre = searchParams.get('genre');
  const mode = searchParams.get('mode');
  const tab = searchParams.get('tab');
  
  if (genre) {
    // Set genre filter trong state
    setSelectedGenre(genre);
  }
  if (mode === 'theater') {
    // Set reader mode
    setReaderMode('theater');
  }
  if (tab === 'corpus_stream') {
    setLeftTab('corpus_stream');
  }
}, [searchParams]);
```

**Quan trọng:** Xóa `const LEVEL_COLORS` local, thay bằng import từ `./theme`.

### 2.4. Verify Phase 2
```bash
npm run build
```
Manual: Test sidebar expand/collapse, click sub-items, verify URL params sync.

---

## PHASE 3: CHUẨN HÓA PAGE SHELLS

### Batch thay đổi cho tất cả 13 page components:

**Content Pages — wrapper thay đổi:**

| File | Tìm (outer wrapper) | Thay bằng |
|------|---------------------|-----------|
| `Dashboard.jsx` | `<div style={{ ... maxWidth: 1380 ... }}>` | `<div className="page-shell-content" style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 40 }}>` |
| `Roadmap.jsx` | `<div style={{ ... maxWidth: 1380 ... }}>` | `<div className="page-shell-content" style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 40 }}>` |
| `JapanNewsHub.jsx` | `<div style={{ ... maxWidth: 1360 ... }}>` | `<div className="page-shell-content" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 60 }}>` |
| `Dictionary.jsx` | `<div style={{ maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 100px)' ... }}>` | `<div className="page-shell-content" style={{ display: 'flex', flexDirection: 'column' }}>` |
| `MockTestStudio.jsx` | `<div style={{ maxWidth: 840, margin: '0 auto', height: 'calc(100vh - 100px)' ... }}>` | `<div className="page-shell-content" style={{ display: 'flex', flexDirection: 'column' }}>` |
| `Settings.jsx` | `<div className="view-container">` + inner `<div style={{ padding: 24, maxWidth: 800 }}>` | Xóa orphaned classes. Dùng `<div className="page-shell-content" style={{ paddingTop: 20, paddingBottom: 40 }}>` |

**Studio Pages — wrapper thay đổi:**

| File | Tìm (outer wrapper) | Thay bằng |
|------|---------------------|-----------|
| `KanjiStudio.jsx` | `<div style={{ padding: '20px 40px', maxWidth: 1600 ... }}>` | `<div className="page-shell-studio" style={{ padding: '20px clamp(16px, 3vw, 40px)' }}>` |
| `VocabularyFlashcards.jsx` | `<div style={{ padding: '20px clamp(16px, 3vw, 40px)', maxWidth: 1600 ... }}>` | `<div className="page-shell-studio" style={{ padding: '20px clamp(16px, 3vw, 40px)' }}>` |
| `GrammarExplorer.jsx` | `<div style={{ ... height: '88vh' ... }}>` | `<div className="page-shell-studio" style={{ gap: 16, padding: '12px 20px' }}>` |
| `GrammarStudio.jsx` | `<div style={{ ... height: 'calc(100vh - 100px)' ... }}>` | `<div className="page-shell-studio" style={{ gap: 16, padding: '12px 20px' }}>` |
| `MediaStudio.jsx` | `<div style={{ ... height:'85vh' ... }}>` | `<div className="page-shell-studio" style={{ gap: 12, padding: '12px 20px' }}>` |
| `AnkiSandboxMode.jsx` | `<div style={{ padding: '20px 40px', maxWidth: 1600 ... }}>` | `<div className="page-shell-studio" style={{ padding: '20px clamp(16px, 3vw, 40px)' }}>` |
| `ImmersionReader.jsx` | `<div style={{ ... height: 'calc(100vh - 90px)' ... }}>` | `<div className="page-shell-studio" style={{ gap: 14 }}>` |
| `JlptMasterDojo.jsx` | outer wrapper | `<div className="page-shell-studio" style={{ padding: '12px 20px' }}>` |

**Xóa LEVEL_COLORS duplicate** trong tất cả các file:

Tìm và xóa dòng `const LEVEL_COLORS = {` (hoặc `const JLPT_LEVEL_COLORS = {`) cùng object kèm theo trong:
- `Dashboard.jsx` (~line 76)
- `Dictionary.jsx` (~line 8)
- `KanjiStudio.jsx` (~line 291)
- `VocabularyFlashcards.jsx` (~line 14)
- `ImmersionReader.jsx` (~line 24)
- `JapanNewsHub.jsx` (~line 39, tên `JLPT_LEVEL_COLORS`)
- `MockTestStudio.jsx` (~line 8)
- `GrammarExplorer.jsx` (~line 16)
- `GrammarStudio.jsx` (~line 9)
- `JlptMasterDojo.jsx` (nếu có)

Thay bằng: `import { JLPT_LEVEL_COLORS, getLevelBadgeStyle } from './theme';`

Sau đó cập nhật references: `LEVEL_COLORS[level]` → `JLPT_LEVEL_COLORS[level]`.

**Fix `GrammarStudio.jsx`**: Đổi component name `WritingStudio` → `GrammarStudio`.

### 3.1. Verify Phase 3
```bash
npm run build
```

---

## PHASE 4: VISUAL CONSISTENCY

### 4.1. Tạo `src/components/PageHeader.jsx`

```jsx
import React from 'react';

export default function PageHeader({ icon, title, subtitle, gradient = ['#2563eb', '#8b5cf6'], actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, minHeight: 42, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
          }}>
            {React.cloneElement(icon, { size: 18 })}
          </div>
        )}
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 1 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
    </div>
  );
}
```

### 4.2. Thay thế gradient headers trong 5 files

Tìm các block tạo gradient icon header thủ công (36-40px squircle div với `linear-gradient(135deg, ...)`) trong:
- `Dashboard.jsx`
- `Roadmap.jsx`
- `GrammarExplorer.jsx`
- `MediaStudio.jsx`
- `ImmersionReader.jsx`

Thay bằng: `import PageHeader from './components/PageHeader';` và dùng `<PageHeader .../>`.

### 4.3. Emoji → Lucide Icons

**Quy tắc:** Xem bảng Emoji Policy trong `docs/OMNILINGUIST_DESIGN_SYSTEM.md` section 9.

Mapping chính:
| Emoji | Thay bằng Lucide | Import |
|-------|------------------|--------|
| `📘` | `<BookOpen size={14}/>` | `BookOpen` |
| `⏰` | `<Clock size={14}/>` | `Clock` |
| `✅` | `<CheckCircle size={14}/>` | `CheckCircle` |
| `🌱` | `<Sprout size={14}/>` | `Sprout` |
| `📖` | `<Book size={14}/>` | `Book` |
| `🧱` | `<Layers size={14}/>` | `Layers` |
| `🎙️` | `<Mic size={14}/>` | `Mic` |
| `⚡` | `<Zap size={14}/>` | `Zap` |
| `🟢` | `<Circle size={10}/>` (fill green) | `Circle` |
| `✍️` | `<Pencil size={14}/>` | `Pencil` |
| `🔴` | `<AlertCircle size={14}/>` | `AlertCircle` |
| `🌐` | `<Globe size={14}/>` | `Globe` |
| `⛩️` | `<Landmark size={14}/>` | `Landmark` |
| `📂` | `<FolderOpen size={14}/>` | `FolderOpen` |
| `🔑` | `<Key size={14}/>` | `Key` |

**Lưu ý:** GIỮ LẠI emoji trong:
- Nội dung bài học (curriculum data JSON)
- Mindmap branches (`mascotIcon`)
- Notification/toast messages
- Mascot expressions

### 4.4. Thay legacy button classes

Tìm: `className="btn btn-primary"` hoặc `className={`btn ${...}`}`
Thay: `className="ods-btn ods-btn-primary"` hoặc tương ứng

Tìm: `className="btn btn-outline"` → Thay: `className="ods-btn ods-btn-secondary"`
Tìm: `className="btn btn-ghost"` → Thay: `className="ods-btn"` (ghost variant)

### 4.5. Fix Settings.jsx orphaned classes

Xóa `className="view-container"`, `className="view-header"`, `className="view-title"`, `className="view-icon"`.

### 4.6. Verify Phase 4
```bash
npm run build
```

---

## PHASE 5: NATIVE-APP POLISH

### 5.1. Skeleton Loading

Trong `src/App.jsx`, cải thiện `<Suspense>` fallback:

```jsx
const PageSkeleton = () => (
  <div style={{
    padding: '20px', display: 'flex', flexDirection: 'column', gap: 16,
    maxWidth: 1380, margin: '0 auto', animation: 'shimmer 1.5s infinite',
  }}>
    <div style={{ height: 42, background: 'var(--bg-surface-2)', borderRadius: 8, width: '40%' }} />
    <div style={{ height: 200, background: 'var(--bg-surface-2)', borderRadius: 12 }} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 120, background: 'var(--bg-surface-2)', borderRadius: 12 }} />
      ))}
    </div>
  </div>
);
```

Thêm shimmer animation trong `index.css`:
```css
@keyframes shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
```

### 5.2. Verify Final
```bash
npm run build ; npm run audit:stories
```

---

## SAU KHI HOÀN THÀNH

1. Sync USB:
```powershell
git add -A ; git commit -m "feat(ui): ODS 3.0 — comprehensive UI optimization across all pages"
git -C "G:\AntiGravity\apps\omnilinguist" pull "d:\AntiGravity_Workspace\apps\omnilinguist" main
```

2. Kiểm tra manual trên `localhost:5173`:
   - Chuyển qua lại tất cả các trang → không còn nhảy maxWidth
   - Test sidebar expand/collapse JLPT Dojo + ImmersionReader
   - Test Light/Dark mode
   - Test responsive ở 1440px, 1024px, 768px
   - Verify `npm run audit:stories` → 677 works, 1183 illustrations OK

---

## LƯU Ý QUAN TRỌNG

1. **KHÔNG sửa nội dung curriculum data** (`src/data/curriculum/*.json`, `src/data/corpus/*.js`) — chỉ sửa UI components.
2. **KHÔNG xóa hoặc sửa** `MindmapCanvasModal.jsx`, `MindmapAtlasModal.jsx`, `ExamSimulatorModal.jsx` — các modal này hoạt động tốt, chỉ cần sửa nơi gọi chúng.
3. **KHÔNG thay đổi routing structure** — giữ nguyên tất cả paths. Chỉ thêm query params support.
4. **KHÔNG xóa `ShadowingStudio` eager mount logic** — nó cần giữ mounted để bảo toàn audio/recording state.
5. **Mỗi phase build thành công** trước khi sang phase tiếp theo.
6. **`GrammarStudio.jsx` chứa component tên `WritingStudio`** — cần đổi tên component, KHÔNG đổi tên file.
7. **ImmersionReader.jsx rất lớn (4595 dòng)** — chỉ sửa outer wrapper và LEVEL_COLORS import, KHÔNG refactor toàn bộ.
8. **JlptMasterDojo.jsx (2200+ dòng)** — chỉ sửa wrapper, LEVEL_COLORS import, và thêm URL params sync.

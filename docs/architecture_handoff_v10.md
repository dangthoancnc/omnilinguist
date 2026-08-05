# OmniLinguist v10.4 - System Architecture & Handoff Document
*Documented for cross-machine continuity.*

## 1. System Architecture Overview
OmniLinguist is built as a highly decoupled, local-first React Single Page Application (SPA) supported by a Python-based AI Media Engine.

### 1.1. Frontend (React + Vite)
- **State Management:** LocalStorage for UI preferences (theme, selected voice) + IndexedDB (`dexie-react-hooks`) for master data (Vocab, Kanji, FSRS Flashcards).
- **Routing Strategy (v10.4 Update):** Replaced `<Routes>` with `useLocation` + CSS `display: none`. This ensures that heavy components (Video players, Audio contexts, inputs) are **never unmounted**, achieving 100% state persistence across tabs.
- **Global Media Control:** Implemented a global listener in `App.jsx` that automatically calls `.pause()` on all `<audio>` and `<video>` tags whenever the route changes.

### 1.2. Backend (Omni Media Engine - FastAPI)
- **Port:** `127.0.0.1:8000`
- **Capabilities:**
  - **STT (Whisper):** Extracts transcripts + timestamps from local/YouTube audio. (Requires `FFmpeg` installed via `winget install gyan.ffmpeg`).
  - **TTS (Edge-TTS & Supertonic):** Generates natural voices for reading and shadowing. Edge-TTS runs purely via cloud API (no GPU required).
  - **Voice Clone (F5-TTS/CosyVoice):** Requires NVIDIA GPU (8GB+ VRAM) and `pip install f5-tts`.

## 2. Core Modules & Recent Fixes

### A. Anki Sandbox Mode (`AnkiSandboxMode.jsx`)
- **OPFS vs Disk Fix:** Fixed the `net::ERR_CONNECTION_REFUSED` error by bypassing `navigator.storage` (OPFS) and directly using the user-granted `mediaHandle` from `window.showDirectoryPicker()`.
- **Font Rendering Fix:** Implemented Regex to dynamically replace `@font-face` `url()` in Anki's `model.css` with valid OPFS/Disk Blob URLs, resolving `OTS parsing error`.

### B. Immersion Reader (`ImmersionReader.jsx`)
- **Reference Error Fix:** Imported missing `<FuriganaText>` component, stopping the app from crashing when generating Bilingual (Song ngữ) text.
- **TTS Settings:** Added a dropdown for users to select the TTS Engine (Edge-TTS) and the specific Voice Character (Nanami, Keita, Aoi, Daichi).

### C. Shadowing Studio (`ShadowingStudio.jsx`)
- **AI Voice Integration:** Added a "Đọc AI" (Play TTS) button to every single extracted segment. Users can now generate and listen to perfect native pronunciation for any sentence.
- **Voice Persistence:** Voice selections are persisted via `localStorage('omni_shadowing_tts_voice')`.

---

## 3. Associated Projects Status (Quick Note)
*Để đảm bảo an toàn toàn vẹn dữ liệu khi bạn chuyển máy, tiến độ của các dự án vệ tinh cũng được ghi nhận nhanh tại đây:*

### MasterCAM Web (`cam-processing`)
- **YSD Flow UI:** Fully implemented the Dockable Layout (Left Dock: Operations Manager, Right Dock: Levels Manager) with Floating Viewport Toolbars.
- **Layer Manager:** Advanced layer management including Add, Delete, Visibility (Eye icon), Z-Depth parsing, and Column Sorting (`handleSort`).
- **State Integrity:** Fixes implemented using `setTimeout` to ensure `saveHistory(holes, edges)` correctly saves the state after DXF generation.

### MoldCutterSearch (`MoldCutterSearch`)
- **Current Cursor:** `moldcutter-backend/server.js` (Ready for cutter configuration mapping).

## 4. Initialization Steps for the New Machine
Khi chuyển sang máy tính mới, hãy thực hiện theo thứ tự sau:
1. `git pull` để nhận toàn bộ code mới nhất.
2. Cài đặt FFmpeg trên máy mới: `winget install gyan.ffmpeg` (nếu chưa có).
3. Khởi động Omni Media Engine: `cd omni-media-engine && python main.py`.
4. Khởi động Frontend: `npm run dev`.
5. Nếu máy mới có GPU NVIDIA mạnh và muốn dùng Voice Clone, chạy: `pip install f5-tts`.

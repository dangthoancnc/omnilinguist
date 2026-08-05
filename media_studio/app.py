import gradio as gr
import subprocess
import os
import whisper
import base64
import sys
import asyncio
import json
import shutil
from datetime import datetime

# Windows Asyncio Fix
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    try:
        from asyncio.proactor_events import _ProactorBasePipeTransport
        _original_call_connection_lost = _ProactorBasePipeTransport._call_connection_lost
        def _silence_connection_lost(self, exc):
            try:
                _original_call_connection_lost(self, exc)
            except ConnectionResetError as e:
                if e.winerror == 10054: pass
                else: raise
            except Exception: pass
        _ProactorBasePipeTransport._call_connection_lost = _silence_connection_lost
    except ImportError: pass

def check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except FileNotFoundError: return False

def get_file_hash(filepath):
    if not filepath or not os.path.exists(filepath): return None
    return f"{os.path.basename(filepath)}_{os.path.getsize(filepath)}"

model = None
current_model_size = None

def load_model_if_needed(model_size):
    global model, current_model_size
    if model is None or current_model_size != model_size:
        print(f"[*] Loading Whisper AI ({model_size})...")
        model = whisper.load_model(model_size)
        current_model_size = model_size
    return model

# ----------------- SESSION MANAGEMENT -----------------
def save_project(global_state):
    out_dir = os.path.abspath("projects")
    os.makedirs(out_dir, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(out_dir, f"kidproj_{stamp}.json")
    
    safe_state = {"transcripts": global_state.get("transcripts", {})}
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(safe_state, f, ensure_ascii=False, indent=2)
    return filepath, f"✅ Đã lưu phiên làm việc: {os.path.basename(filepath)}"

def load_project(filepath, global_state):
    if not filepath: return global_state, "⚠️ Chọn file project .json trước!"
    try:
        path = filepath.name if hasattr(filepath, 'name') else filepath
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        new_state = global_state.copy()
        new_state["transcripts"] = data.get("transcripts", {})
        return new_state, "✅ Khôi phục phiên làm việc thành công! (Dữ liệu Cache đã được nạp)"
    except Exception as e:
        return global_state, f"❌ Lỗi nạp project: {e}"

# ----------------- UI CORE CSS -----------------
KID_CSS = """
/* Import Fonts */
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@600;800&display=swap');

* { font-family: 'Nunito', sans-serif !important; box-sizing: border-box; }
h1, h2, h3, h4 { font-family: 'Fredoka One', cursive !important; color: #ff6b6b; text-shadow: 1px 1px 0px #ffeaa7; margin-top: 0; margin-bottom: 10px; }

/* 1. FORCE EDGE-TO-EDGE VIEWPORT */
body, html {
    margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; overflow: hidden !important;
}

/* Gradio's internal wrappers */
.gradio-container, .gradio-container > .main, .gradio-container > .main > .wrap {
    max-width: 100vw !important;
    width: 100vw !important;
    height: 100vh !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
    background: radial-gradient(circle at 50% 0%, #81ecec 0%, #74b9ff 100%) !important;
}

/* 2. APP WRAPPER (Flex Row) */
#app-wrapper {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    width: 100vw !important;
    height: 100vh !important;
    gap: 0 !important;
    margin: 0 !important; padding: 0 !important;
}

/* 3. SIDEBAR */
#sidebar {
    flex: 0 0 280px !important;
    width: 280px !important;
    height: 100vh !important;
    background: rgba(255, 255, 255, 0.95) !important;
    border-right: 4px solid #fff !important;
    border-radius: 0 20px 20px 0 !important;
    box-shadow: 5px 0 15px rgba(0,0,0,0.1) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex !important;
    flex-direction: column !important;
    padding: 15px !important;
    z-index: 100;
    overflow-x: hidden !important;
    overflow-y: auto !important;
}

#sidebar.collapsed {
    flex: 0 0 80px !important;
    width: 80px !important;
    padding: 15px 5px !important;
}
#sidebar.collapsed span, #sidebar.collapsed .gr-markdown, #sidebar.collapsed .gr-accordion, #sidebar.collapsed label {
    opacity: 0; pointer-events: none; display: none !important;
}

.sidebar-toggle-btn {
    width: 100%; height: 50px; min-height: 50px; border-radius: 12px;
    background: #a29bfe; color: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 24px; border: 3px solid white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 15px;
    transition: all 0.2s;
}
.sidebar-toggle-btn:hover { background: #6c5ce7; transform: scale(1.05); }

/* 4. MAIN WORKSPACE */
#main-workspace {
    flex: 1 1 auto !important;
    width: calc(100vw - 280px) !important;
    height: 100vh !important;
    padding: 15px !important;
    overflow-y: hidden !important;
    display: flex !important;
    flex-direction: column !important;
}

/* 5. NLE 3-PANEL ROW */
#nle-row {
    flex: 1 !important;
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    gap: 15px !important;
    height: 100% !important;
    min-height: 0 !important; /* Important for flex children to scroll */
}

/* 6. NLE PANEL */
.nle-panel {
    flex: 1 1 0 !important; /* Chia đều 3 cột, không cho giãn lung tung */
    background: rgba(255, 255, 255, 0.95) !important;
    border-radius: 20px !important;
    padding: 15px !important;
    border: 3px solid #fff !important;
    box-shadow: 0 8px 15px rgba(0,0,0,0.05) !important;
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    overflow-y: auto !important;
}

/* Fix Gradio inner components taking too much margin */
.nle-panel > div { margin-bottom: 10px !important; }

/* Buttons */
button.primary {
    background: linear-gradient(135deg, #a29bfe, #6c5ce7) !important; border: 3px solid #fff !important;
    border-radius: 20px !important; color: white !important; font-family: 'Fredoka One', cursive !important;
    box-shadow: 0 6px 0 #4834d4 !important; transition: all 0.1s; margin-top: 5px;
}
button.primary:active { transform: translateY(6px); box-shadow: 0 0 0 #4834d4 !important; }

button.secondary {
    background: linear-gradient(135deg, #55efc4, #00b894) !important; border: 3px solid #fff !important;
    border-radius: 20px !important; color: white !important; font-family: 'Fredoka One', cursive !important;
    box-shadow: 0 6px 0 #009432 !important; transition: all 0.1s; margin-top: 5px;
}
button.secondary:active { transform: translateY(6px); box-shadow: 0 0 0 #009432 !important; }
"""

with gr.Blocks(title="KidMedia Studio - NLE Super App", css=KID_CSS) as demo:
    global_state = gr.State({"transcripts": {}}) # Kho lưu trữ Cache
    
    with gr.Row(elem_id="app-wrapper"):
        # ---------------- SIDEBAR ----------------
        with gr.Column(scale=0, elem_id="sidebar"):
            gr.HTML("<div class='sidebar-toggle-btn' onclick='document.getElementById(\"sidebar\").classList.toggle(\"collapsed\");'>☰</div>")
            gr.Markdown("# 🚀 KidMedia\n### Trạm Điều Khiển")
            
            nav_extract = gr.Button("✂️ Trạm Trích Xuất", variant="primary")
            nav_dub = gr.Button("🎙️ Phòng Thu Lồng Tiếng", variant="secondary")
            
            gr.Markdown("---")
            lang_selector = gr.Radio(choices=["Tiếng Việt", "日本語"], value="Tiếng Việt", label="🌐 Ngôn ngữ")
            theme_selector = gr.Radio(choices=["Bầu trời (Sky)", "Kẹo ngọt (Candy)"], value="Bầu trời (Sky)", label="🎨 Chủ đề")

        # ---------------- MAIN WORKSPACE ----------------
        with gr.Column(scale=1, elem_id="main-workspace"):
            
            # =============== TAB 1: ASSET EXTRACTOR ===============
            with gr.Column(visible=True) as page_extract:
                gr.Markdown("### ✂️ TRẠM TRÍCH XUẤT TÀI NGUYÊN (ASSET EXTRACTOR)")
                with gr.Row(elem_id="nle-row"):
                    
                    # Panel 1: Media Bin
                    with gr.Column(scale=1, elem_classes=["nle-panel"]):
                        gr.Markdown("#### 📂 1. TÀI NGUYÊN (MEDIA BIN)")
                        media_input = gr.File(label="Tải Video/Audio (Hỗ trợ kéo thả)", file_count="multiple")
                        
                        with gr.Accordion("Bảng Quản lý Video (Media Pool)", open=True):
                            media_list_df = gr.Dataframe(headers=["Tên File", "Trạng Thái"], interactive=False)
                        
                        gr.Markdown("#### 💾 QUẢN LÝ PHIÊN (PROJECT)")
                        with gr.Row():
                            save_btn = gr.Button("Lưu Phiên")
                            load_btn = gr.Button("Nạp Phiên")
                        load_input = gr.File(label="File .kidproj")
                        proj_status = gr.Textbox(label="Trạng thái Project", interactive=False)

                    # Panel 2: Inspector / Editor
                    with gr.Column(scale=1, elem_classes=["nle-panel"]):
                        gr.Markdown("#### ⚙️ 2. MÁY QUÉT AI (INSPECTOR)")
                        model_size = gr.Dropdown(choices=["tiny", "base", "small"], value="base", label="Kích thước AI")
                        lang_ai = gr.Dropdown(choices=["Tự động phát hiện", "en", "vi", "ja"], value="Tự động phát hiện", label="Ngôn ngữ Video")
                        analyze_btn = gr.Button("🔍 Phân tích Toàn bộ (Smart Cache)", variant="primary")
                        sys_status = gr.Textbox(label="Trạng thái", interactive=False)
                        full_text = gr.TextArea(label="Kịch bản (Transcript)", lines=15, interactive=False)

                    # Panel 3: Output Preview
                    with gr.Column(scale=1, elem_classes=["nle-panel"]):
                        gr.Markdown("#### 🎬 3. XUẤT BẢN & LUÂN CHUYỂN")
                        word_input = gr.Textbox(label="Từ khóa cần cắt", placeholder="VD: red, apple, run")
                        padding_slider = gr.Slider(0.0, 1.0, 0.1, label="Khoảng đệm (giây)")
                        extract_btn = gr.Button("✂️ Cắt Nhanh Hình & Tiếng", variant="secondary")
                        
                        output_files = gr.File(label="File kết quả (Click để tải)")
                        output_preview = gr.HTML(label="Xem trước")
                        
                        gr.Markdown("---")
                        send_dub_btn = gr.Button("➡️ Chuyển sang Phòng Thu Lồng Tiếng", variant="primary")

            # =============== TAB 2: DUBBING STUDIO ===============
            with gr.Column(visible=False) as page_dub:
                gr.Markdown("### 🎙️ PHÒNG THU LỒNG TIẾNG (DUBBING STUDIO)")
                with gr.Row(elem_id="nle-row"):
                    
                    # Panel 1: Input & Script
                    with gr.Column(scale=1, elem_classes=["nle-panel"]):
                        gr.Markdown("#### 📂 1. VIDEO ĐẦU VÀO")
                        dub_input_vid = gr.Video(label="Video Gốc")
                        dub_gen_sub = gr.Checkbox(label="Tạo phụ đề AI (Sử dụng Cache nếu có)", value=True)
                        dub_prepare_btn = gr.Button("⚙️ Chuẩn bị Video Câm", variant="primary")
                        dub_status = gr.Textbox(label="Trạng thái", interactive=False)
                        dub_transcript = gr.TextArea(label="Kịch bản Phụ đề (Script)", lines=10)

                    # Panel 2: Record Monitor
                    with gr.Column(scale=1, elem_classes=["nle-panel"]):
                        gr.Markdown("#### 🎥 2. MÀN HÌNH LỒNG TIẾNG")
                        dub_muted_vid = gr.Video(label="Video Câm", interactive=False, elem_id="muted_video")
                        dub_sync_cb = gr.Checkbox(label="Đồng bộ: Tự động chạy Video khi bấm Thu âm", value=True)
                        dub_record_mode = gr.Radio(choices=["Chỉ thu âm", "Quay hình (Reaction)"], value="Chỉ thu âm")
                        
                        # Lazy loaded webcam
                        enable_webcam_cb = gr.Checkbox(label="[Mở rộng] Kích hoạt Webcam", value=False)
                        dub_record_aud = gr.Audio(label="🎤 Thu âm của bé", sources=["microphone"], type="filepath", visible=True)
                        dub_record_cam = gr.Video(label="🎥 Reaction Cam", sources=["webcam"], include_audio=True, visible=False)
                        
                        dub_merge_btn = gr.Button("🪄 Ghép hình & tiếng", variant="secondary")

                    # Panel 3: Export Panel
                    with gr.Column(scale=1, elem_classes=["nle-panel"]):
                        gr.Markdown("#### 💾 3. CỬA SỔ XUẤT BẢN (EXPORT PANEL)")
                        dub_final_vid = gr.Video(label="Tác phẩm hoàn chỉnh")
                        export_status = gr.Textbox(label="Trạng thái Xuất", interactive=False)
                        
                        export_mp4_btn = gr.Button("🎬 Xuất Video (.mp4)", variant="primary")
                        export_mp3_btn = gr.Button("🎵 Xuất Âm Thanh (.mp3)")
                        export_srt_btn = gr.Button("📝 Xuất Phụ Đề (.srt)")
                        export_file_res = gr.File(label="Tải xuống File Xuất")

    # ================= LOGIC HANDLERS =================
    
    # Navigation
    nav_extract.click(lambda: (gr.update(visible=True), gr.update(visible=False)), outputs=[page_extract, page_dub])
    nav_dub.click(lambda: (gr.update(visible=False), gr.update(visible=True)), outputs=[page_extract, page_dub])
    
    # Theme
    theme_selector.change(fn=None, inputs=[theme_selector], outputs=None, js="(t) => { let app = document.querySelector('.gradio-container'); if(t.includes('Bầu trời')) app.style.background = 'radial-gradient(circle at 50% 0%, #81ecec 0%, #74b9ff 100%)'; else app.style.background = 'radial-gradient(circle at 50% 0%, #ff9ff3 0%, #feca57 100%)'; }")
    
    # Session Management
    save_btn.click(fn=save_project, inputs=[global_state], outputs=[load_input, proj_status])
    load_btn.click(fn=load_project, inputs=[load_input, global_state], outputs=[global_state, proj_status])
    
    # Media Pool Updates
    def update_media_list(files):
        if not files: return [["Trống", "-"]]
        return [[os.path.basename(f.name if hasattr(f, 'name') else f), "Chờ xử lý ⏳"] for f in (files if isinstance(files, list) else [files])]
    media_input.change(fn=update_media_list, inputs=[media_input], outputs=[media_list_df])

    # Smart Cache Analysis
    def analyze_media_logic(media_files, m_size, lang, g_state):
        if not check_ffmpeg(): return "Lỗi FFmpeg", "", g_state, []
        if not media_files: return "Trống", "", g_state, []
        
        all_text = ""
        df_data = []
        files = media_files if isinstance(media_files, list) else [media_files]
        
        for f in files:
            path = f.name if hasattr(f, 'name') else f
            fname = os.path.basename(path)
            fhash = get_file_hash(path)
            
            if fhash in g_state["transcripts"]:
                res = g_state["transcripts"][fhash]
                all_text += f"\\n\\n--- [Cache ⚡] {fname} ---\\n{res.get('text', '')}"
                df_data.append([fname, "Phục hồi Cache ⚡"])
            else:
                try:
                    m = load_model_if_needed(m_size)
                    kwargs = {"word_timestamps": True, "fp16": False}
                    if lang != "Tự động phát hiện": kwargs["language"] = lang
                    res = m.transcribe(path, **kwargs)
                    g_state["transcripts"][fhash] = res
                    all_text += f"\\n\\n--- [AI] {fname} ---\\n{res.get('text', '')}"
                    df_data.append([fname, "Hoàn thành ✅"])
                except Exception as e:
                    df_data.append([fname, "Lỗi ❌"])
                    
        return "Hoàn tất phân tích!", all_text.strip(), g_state, df_data
        
    analyze_btn.click(fn=analyze_media_logic, inputs=[media_input, model_size, lang_ai, global_state], outputs=[sys_status, full_text, global_state, media_list_df])

    # Send to Dubbing
    def send_to_dubbing(media_files):
        if not media_files: return None, gr.update(visible=False), gr.update(visible=True)
        f = media_files[-1] if isinstance(media_files, list) else media_files
        path = f.name if hasattr(f, 'name') else f
        return path, gr.update(visible=False), gr.update(visible=True)
        
    send_dub_btn.click(fn=send_to_dubbing, inputs=[media_input], outputs=[dub_input_vid, page_extract, page_dub])
    
    # Extractor (simplified logic for brevity, uses cache)
    def extract_logic(media_files, keywords, pad, g_state):
        if not keywords or not media_files: return "Thiếu dữ liệu", [], ""
        files = media_files if isinstance(media_files, list) else [media_files]
        words = [w.strip().lower() for w in keywords.split(',') if w.strip()]
        out_files = []
        out_dir = os.path.abspath("output")
        os.makedirs(out_dir, exist_ok=True)
        
        for f in files:
            path = f.name if hasattr(f, 'name') else f
            fhash = get_file_hash(path)
            res = g_state["transcripts"].get(fhash)
            if not res: continue
            
            # Timestamps scanning
            all_w = []
            for seg in res.get("segments", []):
                for w in seg.get("words", []):
                    all_w.append({"w": w["word"].strip(".,!?\"'()[]{} ").lower(), "s": w["start"], "e": w["end"]})
                    
            for target in words:
                t_list = target.split()
                i = 0
                while i <= len(all_w) - len(t_list):
                    match = all(all_w[i+j]["w"] == t_list[j] for j in range(len(t_list)))
                    if match:
                        start_t = max(0, all_w[i]["s"] - pad)
                        end_t = all_w[i + len(t_list) - 1]["e"] + pad
                        out_mp3 = os.path.join(out_dir, f"{target}_{i}.mp3")
                        subprocess.run(["ffmpeg", "-y", "-i", path, "-ss", str(start_t), "-to", str(end_t), "-q:a", "0", "-map", "a", out_mp3], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        if os.path.exists(out_mp3): out_files.append(out_mp3)
                        i += len(t_list)
                    else:
                        i += 1
                        
        return "Cắt xong!", out_files, "<div style='color:green;'>Đã xuất ra output folder</div>"
        
    extract_btn.click(fn=extract_logic, inputs=[media_input, word_input, padding_slider, global_state], outputs=[sys_status, output_files, output_preview])

    # Dubbing logic with Smart Cache
    def process_dubbing(vid_path, gen_sub, m_size, g_state):
        if not vid_path: return None, "Trống", g_state, "Lỗi"
        out_dir = os.path.abspath("downloads")
        os.makedirs(out_dir, exist_ok=True)
        base = os.path.splitext(os.path.basename(vid_path))[0]
        muted_vid = os.path.join(out_dir, f"{base}_muted.mp4")
        subprocess.run(["ffmpeg", "-y", "-i", vid_path, "-c", "copy", "-an", muted_vid], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        fhash = get_file_hash(vid_path)
        txt = ""
        
        if gen_sub:
            if fhash in g_state["transcripts"]:
                res = g_state["transcripts"][fhash]
                txt = res.get("text", "")
                status = "✅ Phục hồi Phụ đề từ Cache ⚡ & Tạo Video Câm!"
            else:
                m = load_model_if_needed(m_size)
                res = m.transcribe(vid_path, word_timestamps=True)
                g_state["transcripts"][fhash] = res
                txt = res.get("text", "")
                status = "✅ Đã tạo Phụ đề mới & Video Câm!"
            
            # Tạo srt
            srt_file = os.path.join(out_dir, f"{base}.srt")
            with open(srt_file, "w", encoding="utf-8") as f:
                for i, seg in enumerate(res.get("segments", [])):
                    def fmt(s):
                        return f"{int(s//3600):02d}:{int((s%3600)//60):02d}:{int(s%60):02d},{int((s%1)*1000):03d}"
                    f.write(f"{i+1}\\n{fmt(seg['start'])} --> {fmt(seg['end'])}\\n{seg['text'].strip()}\\n\\n")
        else:
            status = "✅ Đã tạo Video Câm (Không tạo phụ đề)"
            
        return muted_vid, txt, g_state, status
        
    dub_prepare_btn.click(fn=process_dubbing, inputs=[dub_input_vid, dub_gen_sub, model_size, global_state], outputs=[dub_muted_vid, dub_transcript, global_state, dub_status])

    def toggle_webcam(en, mode):
        is_cam = ("Reaction" in mode)
        return gr.update(visible=(en and is_cam))
        
    enable_webcam_cb.change(fn=toggle_webcam, inputs=[enable_webcam_cb, dub_record_mode], outputs=[dub_record_cam])
    dub_record_mode.change(fn=lambda m, en: (gr.update(visible="Chỉ" in m), toggle_webcam(en, m)), inputs=[dub_record_mode, enable_webcam_cb], outputs=[dub_record_aud, dub_record_cam])

    def merge_dub(muted, mode, aud, cam):
        if not muted or (not aud and not cam): return None, "Thiếu dữ liệu"
        is_cam = ("Reaction" in mode)
        rec = cam if is_cam else aud
        if not rec: return None, "Chưa thu âm!"
        out = os.path.join(os.path.abspath("output"), "final_dubbed.mp4")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        
        if is_cam:
            cmd = ["ffmpeg", "-y", "-i", muted, "-i", rec, "-filter_complex", "[1:v]scale=320:-1[c];[0:v][c]overlay=W-w-20:H-h-20", "-c:a", "aac", out]
        else:
            cmd = ["ffmpeg", "-y", "-i", muted, "-i", rec, "-c:v", "copy", "-c:a", "aac", "-map", "0:v:0", "-map", "1:a:0?", out]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return out, "✅ Đã ghép xong!"
        
    dub_merge_btn.click(fn=merge_dub, inputs=[dub_muted_vid, dub_record_mode, dub_record_aud, dub_record_cam], outputs=[dub_final_vid, dub_status])

    # Sync
    dub_record_aud.start_recording(fn=None, inputs=[dub_sync_cb], outputs=None, js="(s) => { if(s) { let v = document.querySelector('#muted_video video'); if(v) { v.currentTime=0; v.play(); } } }")
    dub_record_aud.stop_recording(fn=None, inputs=[dub_sync_cb], outputs=None, js="(s) => { if(s) { let v = document.querySelector('#muted_video video'); if(v) { v.pause(); } } }")
    dub_record_cam.start_recording(fn=None, inputs=[dub_sync_cb], outputs=None, js="(s) => { if(s) { let v = document.querySelector('#muted_video video'); if(v) { v.currentTime=0; v.play(); } } }")
    dub_record_cam.stop_recording(fn=None, inputs=[dub_sync_cb], outputs=None, js="(s) => { if(s) { let v = document.querySelector('#muted_video video'); if(v) { v.pause(); } } }")

    # Export
    def export_mp4(final_vid):
        if not final_vid: return None, "⚠️ Chưa có video hoàn chỉnh"
        dst = os.path.abspath(f"export_video_{datetime.now().strftime('%H%M%S')}.mp4")
        shutil.copy(final_vid, dst)
        return dst, f"Đã xuất Video: {dst}"
        
    def export_mp3(final_vid):
        if not final_vid: return None, "⚠️ Chưa có video hoàn chỉnh"
        dst = os.path.abspath(f"export_audio_{datetime.now().strftime('%H%M%S')}.mp3")
        subprocess.run(["ffmpeg", "-y", "-i", final_vid, "-q:a", "0", "-map", "a", dst], stdout=subprocess.DEVNULL)
        return dst, f"Đã xuất Audio: {dst}"

    export_mp4_btn.click(fn=export_mp4, inputs=[dub_final_vid], outputs=[export_file_res, export_status])
    export_mp3_btn.click(fn=export_mp3, inputs=[dub_final_vid], outputs=[export_file_res, export_status])

if __name__ == "__main__":
    demo.launch(inbrowser=True, server_port=7865)

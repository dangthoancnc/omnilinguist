import re
import os

with open("app.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update analyze_media
old_analyze = """def analyze_media(media_files, model_size, language_choice):
    if not check_ffmpeg():
        return "LỖI: Hệ thống chưa cài đặt FFmpeg.", "", None

    if not media_files:
        return "Vui lòng tải lên file âm thanh hoặc video.", "", None
        
    try:
        model = load_model_if_needed(model_size)
    except Exception as e:
        return f"Lỗi khi tải mô hình: {str(e)}", "", None
    
    lang_map = {
        "Tiếng Anh (en)": "en",
        "Tiếng Việt (vi)": "vi",
        "Tiếng Nhật (ja)": "ja",
        "Tự động phát hiện": None
    }
    lang_code = lang_map.get(language_choice)
    kwargs = {"word_timestamps": True, "fp16": False}
    if lang_code:
        kwargs["language"] = lang_code
        
    all_text = ""
    state_data = {}
    
    if not isinstance(media_files, list):
        media_files = [media_files]
        
    for media_file in media_files:
        media_path = media_file.name if hasattr(media_file, 'name') else media_file
        print(f"[*] Đang phân tích: {media_path}")
        try:
            result = model.transcribe(media_path, **kwargs)
            state_data[media_path] = result
            filename = os.path.basename(media_path)
            all_text += f"\\n\\n--- [Video] {filename} ---\\n{result.get('text', '').strip()}"
        except Exception as e:
            all_text += f"\\n\\n--- [Lỗi phân tích] {os.path.basename(media_path)} ---\\n{str(e)}"
            
    return f"✅ Đã phân tích xong {len(media_files)} video!", all_text.strip(), state_data"""

new_analyze = """def analyze_media(media_files, model_size, language_choice):
    if not check_ffmpeg():
        return "LỖI: Hệ thống chưa cài đặt FFmpeg.", "", None, [["Lỗi", "Không có FFmpeg"]]

    if not media_files:
        return "Vui lòng tải lên file âm thanh hoặc video.", "", None, []
        
    try:
        model = load_model_if_needed(model_size)
    except Exception as e:
        return f"Lỗi khi tải mô hình: {str(e)}", "", None, [["Lỗi", "Lỗi tải AI"]]
    
    lang_map = {
        "Tiếng Anh (en)": "en",
        "Tiếng Việt (vi)": "vi",
        "Tiếng Nhật (ja)": "ja",
        "Tự động phát hiện": None
    }
    lang_code = lang_map.get(language_choice)
    kwargs = {"word_timestamps": True, "fp16": False}
    if lang_code:
        kwargs["language"] = lang_code
        
    all_text = ""
    state_data = {}
    df_data = []
    
    if not isinstance(media_files, list):
        media_files = [media_files]
        
    for media_file in media_files:
        media_path = media_file.name if hasattr(media_file, 'name') else media_file
        print(f"[*] Đang phân tích: {media_path}")
        filename = os.path.basename(media_path)
        try:
            result = model.transcribe(media_path, **kwargs)
            state_data[media_path] = result
            all_text += f"\\n\\n--- [Video] {filename} ---\\n{result.get('text', '').strip()}"
            df_data.append([filename, "Hoàn thành ✅"])
        except Exception as e:
            all_text += f"\\n\\n--- [Lỗi phân tích] {filename} ---\\n{str(e)}"
            df_data.append([filename, "Lỗi ❌"])
            
    return f"✅ Đã phân tích xong {len(media_files)} video!", all_text.strip(), state_data, df_data"""

content = content.replace(old_analyze, new_analyze)

# 2. Update CSS
css_start = content.find("KID_CSS = \"\"\"")
css_end = content.find("\"\"\"", css_start + 15) + 3
old_css = content[css_start:css_end]

new_css = """KID_CSS = \"\"\"
* {
    font-family: 'Nunito', sans-serif !important;
}

h1, h2, h3 {
    font-family: 'Fredoka One', cursive !important;
    color: #ff6b6b;
    text-shadow: 2px 2px 0px #ffeaa7;
}

/* Full screen container */
.gradio-container {
    max-width: 100% !important;
    padding: 0 !important;
    background-color: #74b9ff !important;
    background-image: radial-gradient(circle at 50% 0%, #81ecec 0%, #74b9ff 100%) !important;
    overflow-x: hidden;
}

/* Sidebar styling */
#sidebar {
    background: rgba(255, 255, 255, 0.95) !important;
    border-right: 4px solid #fff !important;
    border-radius: 0 24px 24px 0 !important;
    padding: 20px !important;
    box-shadow: 5px 0 15px rgba(0,0,0,0.1) !important;
    min-height: 100vh;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 50;
}
#sidebar.collapsed {
    transform: translateX(-100%);
    min-width: 0 !important;
    width: 0 !important;
    padding: 0 !important;
    border: none !important;
    margin-left: -320px !important;
    opacity: 0;
}
.sidebar-toggle-btn {
    position: absolute;
    top: 15px;
    right: -25px;
    width: 50px;
    height: 50px;
    background: #a29bfe;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1000;
    font-size: 24px;
    border: 4px solid white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: all 0.2s;
}
.sidebar-toggle-btn:hover {
    background: #6c5ce7;
    transform: scale(1.1);
}

#main-workspace {
    padding: 20px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
}

/* Box elements */
.gr-box, .gr-panel, .gr-form, .tabs {
    border-radius: 24px !important;
    border: 4px solid #fff !important;
    box-shadow: 0 10px 15px rgba(0,0,0,0.1) !important;
    background-color: rgba(255, 255, 255, 0.95) !important;
}

button.primary {
    background: linear-gradient(135deg, #a29bfe, #6c5ce7) !important;
    border: 4px solid #fff !important;
    border-radius: 30px !important;
    color: white !important;
    font-family: 'Fredoka One', cursive !important;
    font-size: 1.2rem !important;
    box-shadow: 0 8px 0 #4834d4 !important;
    transition: all 0.1s;
}
button.primary:active {
    transform: translateY(8px);
    box-shadow: 0 0 0 #4834d4 !important;
}

button.secondary {
    background: linear-gradient(135deg, #55efc4, #00b894) !important;
    border: 4px solid #fff !important;
    border-radius: 30px !important;
    color: white !important;
    font-family: 'Fredoka One', cursive !important;
    font-size: 1.2rem !important;
    box-shadow: 0 8px 0 #009432 !important;
    transition: all 0.1s;
}
button.secondary:active {
    transform: translateY(8px);
    box-shadow: 0 0 0 #009432 !important;
}

input, textarea {
    border-radius: 15px !important;
    border: 2px solid #a29bfe !important;
    background: #f1f2f6 !important;
}
\"\"\""""

content = content.replace(old_css, new_css)

# 3. Update the UI blocks
ui_start = content.find("with gr.Blocks(title=\"KidMedia Studio - Super App\") as demo:")
ui_old = content[ui_start:content.find("if __name__ == \"__main__\":")]

new_ui = """with gr.Blocks(title="KidMedia Studio - Super App") as demo:
    gr.HTML("<style>@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@600;800&display=swap');</style>", visible=False)
    transcription_state = gr.State({})
    
    with gr.Row():
        with gr.Column(scale=0, min_width=320, elem_id="sidebar") as sidebar_col:
            gr.HTML("<div id='sidebar-toggle-btn' class='sidebar-toggle-btn' onclick='document.getElementById(\"sidebar\").classList.toggle(\"collapsed\");'>☰</div>")
            gr.Markdown("# 🚀 KidMedia\\n### Trạm Điều Khiển")
            
            nav_extract_btn = gr.Button("✂️ Trạm Trích Xuất", variant="primary")
            nav_dub_btn = gr.Button("🎙️ Phòng Thu Lồng Tiếng", variant="secondary")
            
            gr.Markdown("---")
            
            lang_selector = gr.Radio(choices=[("Tiếng Việt", "vi"), ("日本語", "ja")], value="vi", label="🌐 Ngôn ngữ / 言語")
            theme_selector = gr.Radio(choices=["Bầu trời (Sky)", "Kẹo ngọt (Candy)", "Rừng xanh (Forest)"], value="Bầu trời (Sky)", label="🎨 Chủ đề / テーマ")
            
            with gr.Accordion(I18N['vi']['ai_setting'], open=True) as ai_setting:
                model_dropdown = gr.Dropdown(
                    choices=["tiny", "base", "small", "medium", "large"], 
                    value="base", 
                    label=I18N['vi']['ai_size']
                )
                language_dropdown = gr.Dropdown(
                    choices=["Tự động phát hiện", "Tiếng Anh (en)", "Tiếng Việt (vi)", "Tiếng Nhật (ja)"],
                    value="Tự động phát hiện",
                    label=I18N['vi']['video_lang']
                )
                padding_slider = gr.Slider(
                    minimum=0.0, maximum=1.0, value=0.1, step=0.05, 
                    label=I18N['vi']['padding']
                )
                
        with gr.Column(scale=1, elem_id="main-workspace"):
            with gr.Column(visible=True) as page_extract:
                t_title = gr.Markdown(f"### {I18N['vi']['title']}")
                t_desc = gr.Markdown(I18N['vi']['desc'])
                
                with gr.Row():
                    with gr.Column(scale=1):
                        with gr.Row():
                            yt_input = gr.Textbox(label=I18N['vi']['yt_label'], placeholder="Dán link YouTube vào đây...", scale=4)
                            yt_btn = gr.Button(I18N['vi']['yt_btn'], scale=1)
                            
                        media_input = gr.File(file_types=["audio", "video"], label=I18N['vi']['media_label'], file_count="multiple")
                        
                        analyze_btn = gr.Button(I18N['vi']['step1_btn'], variant="primary")
                        
                        gr.Markdown("---")
                        word_input = gr.Textbox(label=I18N['vi']['keyword_label'], placeholder=I18N['vi']['keyword_placeholder'])
                        
                        with gr.Row():
                            folder_input = gr.Textbox(label=I18N['vi']['folder_label'], value=os.path.abspath("output"), scale=4)
                            browse_btn = gr.Button(I18N['vi']['browse_btn'], scale=1)
                            
                        extract_btn = gr.Button(I18N['vi']['step2_btn'], variant="secondary")
                        
                    with gr.Column(scale=1):
                        status_text = gr.Textbox(label=I18N['vi']['status_label'], lines=2)
                        
                        # Media List Pool
                        with gr.Accordion("📂 Bảng Quản lý Video (Media Pool)", open=True) as media_pool_accordion:
                            media_list_df = gr.Dataframe(
                                headers=["Tên File", "Trạng Thái"], 
                                datatype=["str", "str"],
                                interactive=False,
                                label="Danh sách tải lên"
                            )
                            send_to_dub_btn = gr.Button("➡️ Chuyển sang Lồng tiếng (Video chọn cuối)", variant="secondary")

                        full_text_output = gr.TextArea(label=I18N['vi']['full_text_label'], lines=5, interactive=False)
                        output_preview = gr.HTML(label=I18N['vi']['preview_label'])
                        output_files = gr.File(label=I18N['vi']['files_label'], file_count="multiple")
                        
            with gr.Column(visible=False) as page_dub:
                t_tab2_desc = gr.Markdown("### 🎙️ Phòng Thu Lồng Tiếng\\nTải video lên -> Tách tiếng -> Thu âm giọng bé -> Ghép lại thành phim!")
                
                with gr.Row():
                    with gr.Column(scale=1):
                        dub_input_vid = gr.Video(label="1. Tải Video gốc lên đây")
                        dub_gen_sub_cb = gr.Checkbox(label="Tự động tạo phụ đề (Dùng Whisper AI)", value=False)
                        dub_prepare_btn = gr.Button("⚙️ Chuẩn bị Video Câm & Phụ đề", variant="primary")
                        dub_status = gr.Textbox(label="Trạng thái", interactive=False)
                        dub_orig_aud = gr.Audio(label="🎧 Nghe mẫu âm thanh gốc (nếu có)", interactive=False)
                        dub_transcript = gr.TextArea(label="Văn bản trích xuất (Phụ đề)", lines=4, interactive=False)
                        
                    with gr.Column(scale=1):
                        dub_muted_vid = gr.Video(label="2. Video Câm (Nhìn vào đây để lồng tiếng)", interactive=False, elem_id="muted_video")
                        dub_sync_cb = gr.Checkbox(label="Đồng bộ: Tự động chạy Video khi bấm Thu âm", value=True)
                        dub_record_mode = gr.Radio(choices=["Chỉ thu âm", "Quay hình (Reaction)"], value="Chỉ thu âm", label="Chế độ lồng tiếng")
                        
                        # Lazy loaded webcam
                        enable_webcam_cb = gr.Checkbox(label="Mở rộng: Kích hoạt Webcam", value=False)
                        
                        dub_record_aud = gr.Audio(label="3. 🎤 Thu âm giọng của bé", sources=["microphone"], type="filepath", visible=True)
                        dub_record_cam = gr.Video(label="3. 🎥 Quay hình của bé (Reaction Cam)", sources=["webcam"], include_audio=True, visible=False)
                        
                        dub_merge_btn = gr.Button("🪄 Đưa phép thuật vào Video! (Ghép hình & tiếng)", variant="secondary")
                        
                with gr.Row():
                    dub_final_vid = gr.Video(label="🎉 Tác phẩm hoàn chỉnh của bé!", interactive=False)
            
    # Xử lý đổi theme giao diện trẻ em bằng Javascript
    theme_selector.change(
        fn=None,
        inputs=[theme_selector],
        outputs=None,
        js=\"\"\"
        function changeKidTheme(theme_name) {
            let app = document.querySelector('.gradio-container');
            if (!app) return;
            if (theme_name.includes("Bầu trời")) {
                app.style.backgroundImage = "radial-gradient(circle at 50% 0%, #81ecec 0%, #74b9ff 100%)";
            } else if (theme_name.includes("Kẹo ngọt")) {
                app.style.backgroundImage = "radial-gradient(circle at 50% 0%, #ff9ff3 0%, #feca57 100%)";
            } else if (theme_name.includes("Rừng xanh")) {
                app.style.backgroundImage = "radial-gradient(circle at 50% 0%, #55efc4 0%, #00b894 100%)";
            }
        }
        \"\"\"
    )
            
    # Xử lý đa ngôn ngữ
    lang_selector.change(
        fn=update_ui_lang,
        inputs=[lang_selector],
        outputs=[
            t_title, t_desc, yt_input, yt_btn, media_input, ai_setting, model_dropdown, 
            language_dropdown, padding_slider, analyze_btn, word_input, folder_input, 
            browse_btn, extract_btn, status_text, full_text_output, output_preview, 
            output_files, t_tab2_desc, dub_input_vid, dub_gen_sub_cb, dub_prepare_btn, 
            dub_status, dub_orig_aud, dub_transcript, dub_muted_vid, dub_sync_cb, 
            dub_record_mode, dub_record_aud, dub_record_cam, dub_merge_btn, dub_final_vid
        ]
    )
    
    # Navigation Logic
    nav_extract_btn.click(
        fn=lambda: (gr.update(visible=True), gr.update(visible=False)),
        inputs=None,
        outputs=[page_extract, page_dub]
    )
    nav_dub_btn.click(
        fn=lambda: (gr.update(visible=False), gr.update(visible=True)),
        inputs=None,
        outputs=[page_extract, page_dub]
    )
            
    yt_btn.click(
        fn=download_youtube,
        inputs=[yt_input, media_input],
        outputs=[media_input, status_text]
    )
    
    def update_media_list(files):
        if not files:
            return [["Không có file", "Trống"]]
        if not isinstance(files, list):
            files = [files]
        return [[os.path.basename(f.name if hasattr(f, 'name') else f), "Chờ xử lý ⏳"] for f in files]

    media_input.change(
        fn=update_media_list,
        inputs=[media_input],
        outputs=[media_list_df]
    )
            
    analyze_btn.click(
        fn=analyze_media,
        inputs=[media_input, model_dropdown, language_dropdown],
        outputs=[status_text, full_text_output, transcription_state, media_list_df]
    )
    
    browse_btn.click(
        fn=browse_folder_local,
        inputs=[folder_input],
        outputs=[folder_input]
    )
    
    extract_btn.click(
        fn=extract_from_result,
        inputs=[media_input, word_input, padding_slider, folder_input, transcription_state],
        outputs=[status_text, output_files, output_preview]
    )
    
    def send_to_dubbing(media_files):
        if not media_files:
            return None, gr.update(visible=False), gr.update(visible=True)
        if isinstance(media_files, list):
            f = media_files[-1]
        else:
            f = media_files
        path = f.name if hasattr(f, 'name') else f
        return path, gr.update(visible=False), gr.update(visible=True)

    send_to_dub_btn.click(
        fn=send_to_dubbing,
        inputs=[media_input],
        outputs=[dub_input_vid, page_extract, page_dub]
    )
    
    # Dubbing Studio Events
    def toggle_webcam(enable, mode):
        is_cam_mode = (mode == "Quay hình (Reaction)" or mode == "動画撮影 (リアクション)")
        if enable and is_cam_mode:
            return gr.update(visible=True)
        return gr.update(visible=False)

    enable_webcam_cb.change(
        fn=toggle_webcam,
        inputs=[enable_webcam_cb, dub_record_mode],
        outputs=[dub_record_cam]
    )
    dub_record_mode.change(
        fn=lambda m, en: (gr.update(visible=m.startswith("Chỉ thu âm") or m.startswith("音声")), toggle_webcam(en, m)),
        inputs=[dub_record_mode, enable_webcam_cb],
        outputs=[dub_record_aud, dub_record_cam]
    )
    
    dub_prepare_btn.click(
        fn=process_dubbing_video,
        inputs=[dub_input_vid, dub_gen_sub_cb, model_dropdown, language_dropdown],
        outputs=[dub_muted_vid, dub_orig_aud, dub_transcript, dub_status]
    )
    
    dub_merge_btn.click(
        fn=merge_dubbing,
        inputs=[dub_muted_vid, dub_record_mode, dub_record_aud, dub_record_cam],
        outputs=[dub_final_vid, dub_status]
    )
    
    dub_record_aud.start_recording(
        fn=None,
        inputs=[dub_sync_cb],
        outputs=None,
        js="(sync) => { if(sync) { let vid = document.querySelector('#muted_video video'); if(vid) { vid.currentTime = 0; vid.play(); } } }"
    )
    dub_record_aud.stop_recording(
        fn=None,
        inputs=[dub_sync_cb],
        outputs=None,
        js="(sync) => { if(sync) { let vid = document.querySelector('#muted_video video'); if(vid) { vid.pause(); } } }"
    )
    
    dub_record_cam.start_recording(
        fn=None,
        inputs=[dub_sync_cb],
        outputs=None,
        js="(sync) => { if(sync) { let vid = document.querySelector('#muted_video video'); if(vid) { vid.currentTime = 0; vid.play(); } } }"
    )
    dub_record_cam.stop_recording(
        fn=None,
        inputs=[dub_sync_cb],
        outputs=None,
        js="(sync) => { if(sync) { let vid = document.querySelector('#muted_video video'); if(vid) { vid.pause(); } } }"
    )

"""

content = content.replace(ui_old, new_ui)

with open("app.py", "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")

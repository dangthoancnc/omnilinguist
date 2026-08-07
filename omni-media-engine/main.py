import os
import json
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import uuid
import requests

import time

# Lazy load services to prevent startup crashes if modules are missing
from services.stt_service import transcribe_media
from services.tts_service import generate_tts
from services.link_service import fetch_link_content, translate_realtime
from services.workspace_service import (
    list_workspace_items, add_to_playlist, load_workspace_item, delete_workspace_item,
    trigger_processing, save_workspace_item, get_workspace_dir, set_workspace_dir
)

app = FastAPI(title="Omni Media Engine", version="1.0.0", description="Super Engine for STT (Whisper) & TTS (OmniVoice/Supertonic)")

origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000,http://localhost:3000")
allowed_origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if "*" not in origins_env else ["*"],
    allow_credentials=True if "*" not in origins_env else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("temp", exist_ok=True)
os.makedirs("media", exist_ok=True)

def cleanup_temp_files(max_age_seconds: int = 86400):
    """Removes temporary files older than max_age_seconds (default 24h)"""
    for folder in ["temp", os.path.join("temp", "uploads"), os.path.join("temp", "voice_refs")]:
        if os.path.exists(folder):
            now = time.time()
            for filename in os.listdir(folder):
                file_path = os.path.join(folder, filename)
                if os.path.isfile(file_path):
                    try:
                        if now - os.path.getmtime(file_path) > max_age_seconds:
                            os.remove(file_path)
                    except Exception:
                        pass

@app.on_event("startup")
def on_startup():
    cleanup_temp_files(86400)

class TTSRequest(BaseModel):
    text: str
    lang: str = "vi" # en, vi, ja
    engine: str = "supertonic" # supertonic or omnivoice
    voice_ref: str = None # Path to reference audio for voice cloning (OmniVoice)

class LinkRequest(BaseModel):
    url: str

class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "vi"

class PlaylistRequest(BaseModel):
    source: str
    type: str # youtube, local
    title: str = None

class SaveSessionRequest(BaseModel):
    segments: list
    metadata: dict

class WorkspaceDirRequest(BaseModel):
    path: str

class EdgeTTSRequest(BaseModel):
    text: str
    voice: str = "ja-JP-NanamiNeural"
    rate: int = 0
    volume: int = 0
    pitch: int = 0

class VoiceCloneRequest(BaseModel):
    text: str
    ref_text: str = ""
    engine: str = "f5"  # f5, cosyvoice
    mode: str = "zero_shot"  # zero_shot, cross_lingual, instruct
    speed: float = 1.0

class MediaExtractRequest(BaseModel):
    keywords: List[str]
    padding: float = 0.1
    transcript: Optional[dict] = None

class SRTExportRequest(BaseModel):
    segments: list

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Omni Media Engine is running."}

@app.post("/api/transcribe")
async def api_transcribe(
    file: UploadFile = File(...),
    lang: str = Form("auto"),
    model_size: str = Form("base")
):
    """
    [INBOUND] Trích xuất Video/Audio -> Text + Timestamps (Whisper)
    """
    file_path = f"temp/{uuid.uuid4().hex}_{file.filename}"
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = transcribe_media(file_path, lang, model_size)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

class TranscribePathRequest(BaseModel):
    file_path: str
    lang: str = "auto"
    model_size: str = "base"

@app.post("/api/media/transcribe")
def api_media_transcribe(req: TranscribePathRequest):
    """Transcribe a file already on server (from /api/media/upload)"""
    if not os.path.exists(req.file_path):
        raise HTTPException(status_code=404, detail=f"File not found: {req.file_path}")
    try:
        result = transcribe_media(req.file_path, req.lang, req.model_size)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tts")
def api_tts(req: TTSRequest):
    """
    [OUTBOUND] Chuyển Text -> Audio tự nhiên (Supertonic / OmniVoice)
    """
    try:
        audio_path = generate_tts(req.text, req.lang, req.engine, req.voice_ref)
        if not audio_path or not os.path.exists(audio_path):
            raise Exception("Failed to generate audio")
            
        filename = os.path.basename(audio_path)
        return {"status": "success", "audio_url": f"/media/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fetch-link")
def api_fetch_link(req: LinkRequest):
    """
    Trích xuất bài viết hoặc phụ đề YouTube từ URL
    """
    try:
        result = fetch_link_content(req.url)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/translate")
def api_translate(req: TranslateRequest):
    """
    Dịch tự động thời gian thực (Google Translate / DeepL mock)
    """
    try:
        result = translate_realtime(req.text, req.target_lang)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jisho")
def proxy_jisho(keyword: str):
    """
    Proxy cho Jisho API để tránh lỗi CORS từ các dịch vụ public (corsproxy.io)
    """
    try:
        url = f"https://jisho.org/api/v1/search/words?keyword={keyword}"
        headers = {"User-Agent": "OmniLinguist/1.0 (Language Learning Platform; +https://github.com/dangthoancnc/omnilinguist)"}
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/media/clean-temp")
def api_clean_temp(max_age_hours: int = 24):
    """Manual trigger to clean old temporary files"""
    try:
        cleanup_temp_files(max_age_hours * 3600)
        return {"status": "success", "message": f"Cleaned temp files older than {max_age_hours}h"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/workspace/list")
def api_workspace_list():
    try:
        return {"status": "success", "data": list_workspace_items()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/playlist/add")
def api_playlist_add(req: PlaylistRequest):
    try:
        item_id = add_to_playlist(req.source, req.type, req.title)
        trigger_processing()
        return {"status": "success", "id": item_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/workspace/load/{item_id}")
def api_workspace_load(item_id: str):
    try:
        return {"status": "success", "data": load_workspace_item(item_id)}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.delete("/api/workspace/{item_id}")
def api_workspace_delete(item_id: str):
    try:
        success = delete_workspace_item(item_id)
        return {"status": "success" if success else "error"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workspace/save")
def api_workspace_save(req: SaveSessionRequest):
    """Save current session to workspace disk"""
    try:
        import uuid
        item_id = uuid.uuid4().hex
        save_workspace_item(item_id, req.segments, req.metadata)
        return {"status": "success", "id": item_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/workspace/config")
def api_workspace_config():
    return {"status": "success", "path": get_workspace_dir()}

@app.post("/api/workspace/config")
def api_workspace_config_set(req: WorkspaceDirRequest):
    try:
        set_workspace_dir(req.path)
        return {"status": "success", "path": get_workspace_dir()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/playlist/add-file")
async def api_playlist_add_file(
    file: UploadFile = File(...),
    lang: str = Form("ja"),
    model_size: str = Form("base")
):
    """Upload offline file and add to processing queue"""
    try:
        from services.workspace_service import OFFLINE_DIR
        item_id = uuid.uuid4().hex
        item_dir = os.path.join(OFFLINE_DIR, item_id)
        os.makedirs(item_dir, exist_ok=True)
        
        file_path = os.path.join(item_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        add_to_playlist(file_path, "local", file.filename)
        # Store extra info for processing
        import json
        with open(os.path.join(item_dir, "upload_config.json"), 'w') as f:
            json.dump({"lang": lang, "model_size": model_size, "filename": file.filename}, f)
        
        trigger_processing()
        return {"status": "success", "id": item_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# MEDIA STUDIO v2.0 — FFmpeg Operations
# ============================================================

@app.post("/api/media/upload")
async def api_media_upload(file: UploadFile = File(...)):
    """Upload media file for processing"""
    try:
        upload_dir = os.path.abspath(os.path.join("temp", "uploads"))
        os.makedirs(upload_dir, exist_ok=True)
        file_id = uuid.uuid4().hex[:8]
        file_path = os.path.join(upload_dir, f"{file_id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        from services.media_service import get_media_info
        info = get_media_info(file_path)
        
        return {"status": "success", "file_id": file_id, "path": file_path, "filename": file.filename, "info": info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/media/extract-clips")
async def api_media_extract_clips(
    file: UploadFile = File(None),
    file_path: str = Form(None),
    keywords: str = Form(""),
    padding: float = Form(0.1),
    transcript_json: str = Form(None)
):
    """Extract audio clips + capture frames by keyword search in transcript"""
    try:
        from services.media_service import extract_clips_by_keywords
        
        # Use uploaded file or existing path
        if file and file.filename:
            upload_dir = os.path.abspath(os.path.join("temp", "uploads"))
            os.makedirs(upload_dir, exist_ok=True)
            path = os.path.join(upload_dir, f"{uuid.uuid4().hex[:8]}_{file.filename}")
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        elif file_path:
            path = file_path
        else:
            raise ValueError("No file provided")
        
        kw_list = [k.strip() for k in keywords.split(',') if k.strip()]
        transcript = json.loads(transcript_json) if transcript_json else {}
        
        results = extract_clips_by_keywords(path, transcript, kw_list, padding)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/media/create-muted")
async def api_media_create_muted(
    file: UploadFile = File(None),
    file_path: str = Form(None)
):
    """Create muted copy of video"""
    try:
        from services.media_service import create_muted_video
        
        if file and file.filename:
            upload_dir = os.path.abspath(os.path.join("temp", "uploads"))
            os.makedirs(upload_dir, exist_ok=True)
            path = os.path.join(upload_dir, f"{uuid.uuid4().hex[:8]}_{file.filename}")
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        elif file_path:
            path = file_path
        else:
            raise ValueError("No file provided")
        
        result = create_muted_video(path)
        filename = os.path.basename(result)
        return {"status": "success", "path": result, "url": f"/media/output/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/media/merge")
async def api_media_merge(
    video: UploadFile = File(None),
    audio: UploadFile = File(None),
    video_path: str = Form(None),
    audio_path: str = Form(None),
    mode: str = Form("replace")
):
    """Merge audio with video"""
    try:
        from services.media_service import merge_audio_video
        upload_dir = os.path.abspath(os.path.join("temp", "uploads"))
        os.makedirs(upload_dir, exist_ok=True)
        
        v_path = video_path
        a_path = audio_path
        
        if video and video.filename:
            v_path = os.path.join(upload_dir, f"{uuid.uuid4().hex[:8]}_{video.filename}")
            with open(v_path, "wb") as buffer:
                shutil.copyfileobj(video.file, buffer)
        if audio and audio.filename:
            a_path = os.path.join(upload_dir, f"{uuid.uuid4().hex[:8]}_{audio.filename}")
            with open(a_path, "wb") as buffer:
                shutil.copyfileobj(audio.file, buffer)
        
        result = merge_audio_video(v_path, a_path, overlay_mode=mode)
        filename = os.path.basename(result)
        return {"status": "success", "path": result, "url": f"/media/output/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/media/export-srt")
def api_media_export_srt(req: SRTExportRequest):
    """Export SRT subtitle file"""
    try:
        from services.media_service import export_srt
        result = export_srt(req.segments)
        filename = os.path.basename(result)
        return {"status": "success", "path": result, "url": f"/media/output/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/media/extract-audio")
async def api_media_extract_audio(
    file: UploadFile = File(None),
    file_path: str = Form(None),
    fmt: str = Form("mp3")
):
    """Extract full audio track from video"""
    try:
        from services.media_service import extract_full_audio
        
        if file and file.filename:
            upload_dir = os.path.abspath(os.path.join("temp", "uploads"))
            os.makedirs(upload_dir, exist_ok=True)
            path = os.path.join(upload_dir, f"{uuid.uuid4().hex[:8]}_{file.filename}")
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        elif file_path:
            path = file_path
        else:
            raise ValueError("No file provided")
        
        result = extract_full_audio(path, fmt=fmt)
        filename = os.path.basename(result)
        return {"status": "success", "path": result, "url": f"/media/output/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# VOICE ENGINE v2.0
# ============================================================

@app.get("/api/voice/status")
def api_voice_status():
    """Check available voice engines"""
    try:
        from services.voice_service import get_engine_status
        return {"status": "success", "engines": get_engine_status()}
    except Exception as e:
        return {"status": "success", "engines": {}}

@app.post("/api/voice/edge-tts")
def api_voice_edge_tts(req: EdgeTTSRequest):
    """Generate TTS with Edge-TTS (CPU, cloud)"""
    try:
        from services.voice_service import edge_tts_generate
        result = edge_tts_generate(req.text, req.voice, req.rate, req.volume, req.pitch)
        filename = os.path.basename(result)
        return {"status": "success", "path": result, "url": f"/media/voice/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voice/edge-tts/voices")
def api_voice_edge_voices():
    """List Edge-TTS voices"""
    try:
        from services.voice_service import edge_tts_list_voices
        return {"status": "success", "voices": edge_tts_list_voices()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/clone")
async def api_voice_clone(
    ref_audio: Optional[UploadFile] = File(None),
    ref_audio_url: str = Form(None),
    text: str = Form(""),
    ref_text: str = Form(""),
    engine: str = Form("f5"),
    mode: str = Form("zero_shot"),
    speed: float = Form(1.0)
):
    """Clone voice using F5-TTS, CosyVoice, or ViZipvoice"""
    try:
        ref_path = None
        if ref_audio and ref_audio.filename:
            upload_dir = os.path.abspath(os.path.join("temp", "voice_refs"))
            os.makedirs(upload_dir, exist_ok=True)
            ref_path = os.path.join(upload_dir, f"{uuid.uuid4().hex[:8]}_{ref_audio.filename}")
            with open(ref_path, "wb") as buffer:
                shutil.copyfileobj(ref_audio.file, buffer)
        elif ref_audio_url:
            ref_path = ref_audio_url
        
        if engine == "vizipvoice":
            from services.voice_service import vizipvoice_generate
            result = vizipvoice_generate(text, ref_path, ref_text, speed=speed)
        elif engine == "cosyvoice":
            from services.voice_service import cosyvoice_clone
            result = cosyvoice_clone(text, ref_path, ref_text, mode, speed)
        else:
            from services.voice_service import f5_tts_clone
            result = f5_tts_clone(text, ref_path, ref_text, speed=speed)
        
        filename = os.path.basename(result)
        return {"status": "success", "path": result, "url": f"/media/voice/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/unload")
def api_voice_unload(engine: str = "all"):
    """Unload voice models to free VRAM"""
    try:
        if engine in ("f5", "all"):
            from services.voice_service import f5_tts_unload
            f5_tts_unload()
        if engine in ("cosyvoice", "all"):
            from services.voice_service import cosyvoice_unload
            cosyvoice_unload()
        return {"status": "success", "message": f"Unloaded {engine}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/media/output/{filename}")
async def get_media_output(filename: str):
    """Serve output files from media processing"""
    file_path = os.path.join("media", "output", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/media/voice/{filename}")
async def get_voice_output(filename: str):
    """Serve voice output files"""
    file_path = os.path.join("media", "voice", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/media/{filename}")
async def get_media(filename: str):
    """Serve the generated audio files"""
    file_path = os.path.join("media", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

if __name__ == "__main__":
    print("🚀 Khởi động Omni Media Engine (Port 8000)...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

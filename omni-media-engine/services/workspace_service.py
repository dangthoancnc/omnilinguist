import os
import json
import uuid
import datetime
import threading
import shutil
from pathlib import Path

# --- Config ---
CONFIG_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "workspace_config.json"))

def _load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def _save_config(cfg):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)

def get_workspace_dir():
    cfg = _load_config()
    default = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "workspace"))
    return cfg.get("workspace_dir", default)

def set_workspace_dir(path: str):
    os.makedirs(path, exist_ok=True)
    cfg = _load_config()
    cfg["workspace_dir"] = os.path.abspath(path)
    _save_config(cfg)
    # Re-init directories
    _init_dirs()

def _init_dirs():
    global WORKSPACE_DIR, ONLINE_DIR, OFFLINE_DIR
    WORKSPACE_DIR = get_workspace_dir()
    ONLINE_DIR = os.path.join(WORKSPACE_DIR, "online")
    OFFLINE_DIR = os.path.join(WORKSPACE_DIR, "offline")
    for d in [ONLINE_DIR, OFFLINE_DIR]:
        os.makedirs(d, exist_ok=True)

WORKSPACE_DIR = ""
ONLINE_DIR = ""
OFFLINE_DIR = ""
_init_dirs()

# In-memory queue for playlist
playlist_queue = []
processing_thread = None
is_processing = False

def list_workspace_items():
    """Retrieve all processed and pending items"""
    _init_dirs()  # refresh paths
    items = []
    
    # Add pending/processing items from queue
    for task in playlist_queue:
        items.append({
            "id": task["id"],
            "title": task.get("title", task["source"]),
            "source": task["source"],
            "type": task["type"],
            "status": task["status"],
            "progress": task.get("progress", 0),
            "date": task.get("date", datetime.datetime.now().isoformat()),
            "error": task.get("error", "")
        })
        
    # Read finished items from disk
    for category_dir in [ONLINE_DIR, OFFLINE_DIR]:
        if not os.path.exists(category_dir): continue
        for item_name in os.listdir(category_dir):
            item_path = os.path.join(category_dir, item_name)
            if os.path.isdir(item_path):
                meta_file = os.path.join(item_path, "metadata.json")
                if os.path.exists(meta_file):
                    try:
                        with open(meta_file, 'r', encoding='utf-8') as f:
                            meta = json.load(f)
                            items.append({
                                "id": meta.get("id", item_name),
                                "title": meta.get("title", item_name),
                                "source": meta.get("source", ""),
                                "type": meta.get("type", "online" if category_dir == ONLINE_DIR else "offline"),
                                "status": "completed",
                                "progress": 100,
                                "date": meta.get("date", ""),
                                "path": item_path
                            })
                    except:
                        pass
    return sorted(items, key=lambda x: x.get("date", ""), reverse=True)

def add_to_playlist(source: str, item_type: str, title: str = None):
    """Add a URL or local file path to the processing queue"""
    task_id = uuid.uuid4().hex
    task = {
        "id": task_id,
        "source": source,
        "type": item_type,
        "title": title or source,
        "status": "pending",
        "progress": 0,
        "date": datetime.datetime.now().isoformat()
    }
    playlist_queue.append(task)
    return task_id

def delete_workspace_item(item_id: str):
    """Delete an item from queue or disk"""
    global playlist_queue
    playlist_queue = [t for t in playlist_queue if t["id"] != item_id]
    
    for category_dir in [ONLINE_DIR, OFFLINE_DIR]:
        if not os.path.exists(category_dir): continue
        for item_name in os.listdir(category_dir):
            item_path = os.path.join(category_dir, item_name)
            if os.path.isdir(item_path):
                meta_file = os.path.join(item_path, "metadata.json")
                if os.path.exists(meta_file):
                    try:
                        with open(meta_file, 'r', encoding='utf-8') as f:
                            meta = json.load(f)
                            if meta.get("id") == item_id or item_name == item_id:
                                shutil.rmtree(item_path)
                                return True
                    except:
                        pass
    return True

def load_workspace_item(item_id: str):
    """Load transcript segments for a completed item"""
    for category_dir in [ONLINE_DIR, OFFLINE_DIR]:
        if not os.path.exists(category_dir): continue
        for item_name in os.listdir(category_dir):
            item_path = os.path.join(category_dir, item_name)
            if os.path.isdir(item_path):
                meta_file = os.path.join(item_path, "metadata.json")
                if os.path.exists(meta_file):
                    with open(meta_file, 'r', encoding='utf-8') as f:
                        meta = json.load(f)
                        if meta.get("id") == item_id or item_name == item_id:
                            seg_file = os.path.join(item_path, "segments.json")
                            if os.path.exists(seg_file):
                                with open(seg_file, 'r', encoding='utf-8') as sf:
                                    segments = json.load(sf)
                                    return {"metadata": meta, "segments": segments}
    raise Exception("Item not found or not completed")

def save_workspace_item(item_id: str, segments: list, metadata: dict):
    """Save a session to disk"""
    _init_dirs()
    cat = metadata.get("type", "online")
    target_dir = ONLINE_DIR if cat in ("youtube", "online") else OFFLINE_DIR
    item_path = os.path.join(target_dir, item_id)
    os.makedirs(item_path, exist_ok=True)
    
    metadata["id"] = item_id
    metadata["date"] = metadata.get("date", datetime.datetime.now().isoformat())
    
    with open(os.path.join(item_path, "metadata.json"), 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
        
    with open(os.path.join(item_path, "segments.json"), 'w', encoding='utf-8') as f:
        json.dump(segments, f, ensure_ascii=False, indent=2)
        
    return True

# --- Background Processing ---

def process_queue():
    global is_processing, playlist_queue
    is_processing = True
    
    from .link_service import process_youtube_link, translate_realtime
    
    while True:
        task = next((t for t in playlist_queue if t["status"] == "pending"), None)
        if not task:
            break
            
        task["status"] = "processing"
        task["progress"] = 10
        
        try:
            segments = []
            if task["type"] == "youtube":
                task["progress"] = 30
                yt_data = process_youtube_link(task["source"])
                task["title"] = yt_data.get("title", task["title"])
                raw_segments = yt_data.get("segments", [])
                
                task["progress"] = 60
                if raw_segments:
                    bulk_text = "\n".join([s["text"] for s in raw_segments])
                    trans_res = translate_realtime(bulk_text, target_lang='vi')
                    translated_lines = trans_res.get("translated", "").split("\n")
                    
                    for i, seg in enumerate(raw_segments):
                        segments.append({
                            **seg,
                            "vi": translated_lines[i] if i < len(translated_lines) else "",
                            "startOffset": 0,
                            "endOffset": 0
                        })
                
                metadata = {
                    "source": task["source"],
                    "type": "youtube",
                    "title": task["title"],
                    "video_id": yt_data.get("video_id")
                }
                save_workspace_item(task["id"], segments, metadata)
                
            elif task["type"] == "local":
                # Process local file with Whisper
                file_path = task["source"]
                if not os.path.exists(file_path):
                    raise Exception(f"File not found: {file_path}")
                
                task["progress"] = 20
                
                # Try to load upload config for lang/model
                config_dir = os.path.dirname(file_path)
                config_file = os.path.join(config_dir, "upload_config.json")
                lang = "ja"
                model_size = "base"
                if os.path.exists(config_file):
                    with open(config_file, 'r') as cf:
                        upload_cfg = json.load(cf)
                        lang = upload_cfg.get("lang", "ja")
                        model_size = upload_cfg.get("model_size", "base")
                
                task["progress"] = 30
                from .stt_service import transcribe_media
                result = transcribe_media(file_path, lang, model_size)
                
                task["progress"] = 70
                raw_segments = result.get("segments", [])
                if raw_segments:
                    bulk_text = "\n".join([s["text"] for s in raw_segments])
                    trans_res = translate_realtime(bulk_text, target_lang='vi')
                    translated_lines = trans_res.get("translated", "").split("\n")
                    
                    for i, seg in enumerate(raw_segments):
                        segments.append({
                            "text": seg["text"],
                            "start": seg["start"],
                            "duration": seg["end"] - seg["start"],
                            "vi": translated_lines[i] if i < len(translated_lines) else "",
                            "startOffset": 0,
                            "endOffset": 0
                        })
                
                metadata = {
                    "source": file_path,
                    "type": "local",
                    "title": task["title"]
                }
                save_workspace_item(task["id"], segments, metadata)
                
            task["status"] = "completed"
            task["progress"] = 100
            playlist_queue.remove(task)
            
        except Exception as e:
            task["status"] = "failed"
            task["error"] = str(e)
            print(f"Error processing {task['id']}: {e}")
            
    is_processing = False

def trigger_processing():
    global processing_thread, is_processing
    if not is_processing:
        processing_thread = threading.Thread(target=process_queue, daemon=True)
        processing_thread.start()
    return True

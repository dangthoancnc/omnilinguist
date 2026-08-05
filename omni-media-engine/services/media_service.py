"""
Media Service — FFmpeg Operations for Media Studio v2.0
Handles: clip extraction, frame capture, muted video, merge, SRT export, format conversion
"""
import os
import json
import uuid
import subprocess
import shutil
from pathlib import Path

# Detect FFmpeg
def get_ffmpeg():
    """Find ffmpeg binary - check PATH first, then local bin"""
    try:
        result = subprocess.run(["ffmpeg", "-version"], capture_output=True, timeout=5)
        if result.returncode == 0:
            return "ffmpeg"
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    
    local = os.path.join(os.path.dirname(__file__), "..", "bin", "ffmpeg.exe")
    if os.path.exists(local):
        return os.path.abspath(local)
    
    raise RuntimeError("FFmpeg not found. Install via 'choco install ffmpeg' or place ffmpeg.exe in omni-media-engine/bin/")

def get_ffprobe():
    try:
        subprocess.run(["ffprobe", "-version"], capture_output=True, timeout=5)
        return "ffprobe"
    except:
        local = os.path.join(os.path.dirname(__file__), "..", "bin", "ffprobe.exe")
        if os.path.exists(local):
            return os.path.abspath(local)
        return None

TEMP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "temp", "media"))
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "media", "output"))
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


def extract_audio_clip(input_path: str, start: float, end: float, output_path: str = None, padding: float = 0.0) -> str:
    """Extract audio clip from media file between start and end timestamps"""
    ffmpeg = get_ffmpeg()
    if not output_path:
        output_path = os.path.join(OUTPUT_DIR, f"clip_{uuid.uuid4().hex[:8]}.mp3")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    actual_start = max(0, start - padding)
    actual_end = end + padding
    
    cmd = [ffmpeg, "-y", "-i", input_path, "-ss", str(actual_start), "-to", str(actual_end),
           "-q:a", "0", "-map", "a", output_path]
    subprocess.run(cmd, capture_output=True, timeout=120)
    
    if os.path.exists(output_path):
        return output_path
    raise RuntimeError(f"Failed to extract clip from {start}s to {end}s")


def extract_clips_by_keywords(input_path: str, transcript_data: dict, keywords: list, padding: float = 0.1, output_dir: str = None) -> list:
    """Extract audio clips + capture frames for matched keywords in transcript"""
    if not output_dir:
        output_dir = os.path.join(OUTPUT_DIR, f"extract_{uuid.uuid4().hex[:8]}")
    os.makedirs(output_dir, exist_ok=True)
    
    results = []
    all_words = []
    
    for seg in transcript_data.get("segments", []):
        for w in seg.get("words", []):
            all_words.append({
                "w": w.get("word", "").strip(".,!?\"'()[] ").lower(),
                "s": w.get("start", 0),
                "e": w.get("end", 0)
            })
    
    for keyword in keywords:
        keyword_parts = keyword.strip().lower().split()
        i = 0
        match_idx = 0
        while i <= len(all_words) - len(keyword_parts):
            match = all(all_words[i + j]["w"] == keyword_parts[j] for j in range(len(keyword_parts)))
            if match:
                start_t = max(0, all_words[i]["s"] - padding)
                end_t = all_words[i + len(keyword_parts) - 1]["e"] + padding
                
                # Extract audio clip
                clip_file = os.path.join(output_dir, f"{keyword}_{match_idx}.mp3")
                try:
                    extract_audio_clip(input_path, start_t, end_t, clip_file)
                except:
                    pass
                
                # Capture frame
                frame_file = os.path.join(output_dir, f"{keyword}_{match_idx}.png")
                try:
                    capture_frame(input_path, all_words[i]["s"], frame_file)
                except:
                    pass
                
                results.append({
                    "keyword": keyword,
                    "start": start_t,
                    "end": end_t,
                    "clip": clip_file if os.path.exists(clip_file) else None,
                    "frame": frame_file if os.path.exists(frame_file) else None
                })
                
                match_idx += 1
                i += len(keyword_parts)
            else:
                i += 1
    
    return results


def capture_frame(input_path: str, timestamp: float, output_path: str = None) -> str:
    """Capture a frame from video at given timestamp"""
    ffmpeg = get_ffmpeg()
    if not output_path:
        output_path = os.path.join(OUTPUT_DIR, f"frame_{uuid.uuid4().hex[:8]}.png")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    cmd = [ffmpeg, "-y", "-ss", str(timestamp), "-i", input_path,
           "-vframes", "1", "-q:v", "2", output_path]
    subprocess.run(cmd, capture_output=True, timeout=60)
    
    if os.path.exists(output_path):
        return output_path
    raise RuntimeError(f"Failed to capture frame at {timestamp}s")


def capture_frames_batch(input_path: str, timestamps: list, output_dir: str = None) -> list:
    """Capture multiple frames at given timestamps"""
    if not output_dir:
        output_dir = os.path.join(OUTPUT_DIR, f"frames_{uuid.uuid4().hex[:8]}")
    os.makedirs(output_dir, exist_ok=True)
    
    results = []
    for i, ts in enumerate(timestamps):
        out = os.path.join(output_dir, f"frame_{i:04d}_{ts:.2f}s.png")
        try:
            capture_frame(input_path, ts, out)
            results.append({"timestamp": ts, "path": out})
        except:
            results.append({"timestamp": ts, "path": None, "error": "Failed"})
    return results


def create_muted_video(input_path: str, output_path: str = None) -> str:
    """Create a muted copy of the video (remove audio track)"""
    ffmpeg = get_ffmpeg()
    if not output_path:
        base = Path(input_path).stem
        output_path = os.path.join(OUTPUT_DIR, f"{base}_muted.mp4")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    cmd = [ffmpeg, "-y", "-i", input_path, "-c", "copy", "-an", output_path]
    subprocess.run(cmd, capture_output=True, timeout=300)
    
    if os.path.exists(output_path):
        return output_path
    raise RuntimeError("Failed to create muted video")


def merge_audio_video(video_path: str, audio_path: str, output_path: str = None, overlay_mode: str = "replace") -> str:
    """Merge audio with video. overlay_mode: 'replace' or 'mix'"""
    ffmpeg = get_ffmpeg()
    if not output_path:
        output_path = os.path.join(OUTPUT_DIR, f"merged_{uuid.uuid4().hex[:8]}.mp4")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    if overlay_mode == "mix":
        cmd = [ffmpeg, "-y", "-i", video_path, "-i", audio_path,
               "-filter_complex", "amix=inputs=2:duration=first",
               "-c:v", "copy", output_path]
    else:
        cmd = [ffmpeg, "-y", "-i", video_path, "-i", audio_path,
               "-c:v", "copy", "-c:a", "aac", "-map", "0:v:0", "-map", "1:a:0?",
               output_path]
    
    subprocess.run(cmd, capture_output=True, timeout=600)
    
    if os.path.exists(output_path):
        return output_path
    raise RuntimeError("Failed to merge audio and video")


def export_srt(segments: list, output_path: str = None) -> str:
    """Generate SRT subtitle file from segments"""
    if not output_path:
        output_path = os.path.join(OUTPUT_DIR, f"subtitles_{uuid.uuid4().hex[:8]}.srt")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    def fmt_time(seconds):
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        ms = int((seconds % 1) * 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
    
    with open(output_path, "w", encoding="utf-8") as f:
        for i, seg in enumerate(segments):
            start = seg.get("start", 0)
            end = start + seg.get("duration", 0)
            text = seg.get("text", "")
            f.write(f"{i+1}\n{fmt_time(start)} --> {fmt_time(end)}\n{text}\n\n")
    
    return output_path


def convert_format(input_path: str, target_format: str, output_path: str = None) -> str:
    """Convert media file to target format"""
    ffmpeg = get_ffmpeg()
    if not output_path:
        base = Path(input_path).stem
        output_path = os.path.join(OUTPUT_DIR, f"{base}.{target_format}")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    cmd = [ffmpeg, "-y", "-i", input_path, "-q:a", "0", output_path]
    subprocess.run(cmd, capture_output=True, timeout=600)
    
    if os.path.exists(output_path):
        return output_path
    raise RuntimeError(f"Failed to convert to {target_format}")


def extract_full_audio(input_path: str, output_path: str = None, fmt: str = "mp3") -> str:
    """Extract full audio track from video"""
    ffmpeg = get_ffmpeg()
    if not output_path:
        base = Path(input_path).stem
        output_path = os.path.join(OUTPUT_DIR, f"{base}_audio.{fmt}")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    cmd = [ffmpeg, "-y", "-i", input_path, "-q:a", "0", "-map", "a", output_path]
    subprocess.run(cmd, capture_output=True, timeout=300)
    
    if os.path.exists(output_path):
        return output_path
    raise RuntimeError("Failed to extract audio")


def get_media_info(input_path: str) -> dict:
    """Get media file info using ffprobe"""
    ffprobe = get_ffprobe()
    if not ffprobe:
        return {"duration": 0, "has_video": True, "has_audio": True}
    
    cmd = [ffprobe, "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", input_path]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    
    try:
        data = json.loads(result.stdout)
        streams = data.get("streams", [])
        fmt = data.get("format", {})
        
        has_video = any(s.get("codec_type") == "video" for s in streams)
        has_audio = any(s.get("codec_type") == "audio" for s in streams)
        duration = float(fmt.get("duration", 0))
        
        return {
            "duration": duration,
            "has_video": has_video,
            "has_audio": has_audio,
            "format": fmt.get("format_name", "unknown"),
            "size": int(fmt.get("size", 0)),
            "streams": len(streams)
        }
    except:
        return {"duration": 0, "has_video": True, "has_audio": True}

import whisper
import os

model = None
current_model_size = None

def get_whisper_model(model_size="base"):
    global model, current_model_size
    if model is None or current_model_size != model_size:
        print(f"[*] Loading Whisper AI ({model_size})...")
        try:
            model = whisper.load_model(model_size)
            current_model_size = model_size
        except Exception as e:
            print(f"Error loading Whisper: {e}")
            raise e
    return model

def transcribe_media(file_path: str, lang: str = "auto", model_size: str = "base"):
    """
    Transcribes media file using Whisper and extracts word-level timestamps.
    Returns JSON structured data for Immersion Reader / Shadowing.
    """
    m = get_whisper_model(model_size)
    
    kwargs = {"word_timestamps": True, "fp16": False}
    if lang and lang != "auto":
        kwargs["language"] = lang
        
    print(f"[*] Transcribing {file_path} (Lang: {lang})")
    result = m.transcribe(file_path, **kwargs)
    
    # Format the response for the Frontend
    segments = []
    for seg in result.get("segments", []):
        words = []
        for w in seg.get("words", []):
            words.append({
                "word": w["word"].strip(),
                "start": w["start"],
                "end": w["end"]
            })
        segments.append({
            "text": seg["text"].strip(),
            "start": seg["start"],
            "end": seg["end"],
            "words": words
        })
        
    return {
        "text": result.get("text", "").strip(),
        "language": result.get("language", lang),
        "segments": segments
    }

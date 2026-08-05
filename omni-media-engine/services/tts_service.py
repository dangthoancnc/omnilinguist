import os
import uuid
import warnings
from gtts import gTTS

warnings.filterwarnings("ignore")

def get_supertonic():
    global supertonic_model
    if supertonic_model is None:
        try:
            print("[*] Loading Supertonic TTS Model (Fast ONNX)...")
            import supertonic
            # Pseudo-init, replace with actual supertonic initialization
            # supertonic_model = supertonic.load(...)
            supertonic_model = True # Mocking for now until pip install is complete
        except ImportError:
            print("❌ Supertonic not installed. Fallback mode.")
    return supertonic_model

def get_omnivoice():
    global omnivoice_model
    if omnivoice_model is None:
        try:
            print("[*] Loading KhanhTTS-OmniVoice Model...")
            from omnivoice import OmniVoice
            import torch
            # Example initialization based on KhanhTTS docs
            # omnivoice_model = OmniVoice.from_pretrained("kjanh/KhanhTTS-OmniVoice", device_map="cuda:0", dtype=torch.float16)
            omnivoice_model = True # Mocking for now
        except ImportError:
            print("❌ OmniVoice not installed. Fallback mode.")
    return omnivoice_model

def generate_tts(text: str, lang: str = "ja", engine: str = "supertonic", voice_ref: str = None):
    """
    Generate audio from text using gTTS (Fallback for Supertonic/OmniVoice until local GPU models are set up).
    Returns the absolute path to the generated MP3 file.
    """
    out_dir = os.path.abspath("media")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, f"tts_{uuid.uuid4().hex}.mp3")
    
    print(f"[*] TTS Request -> Engine: {engine}, Lang: {lang}, Text: {text[:30]}...")
    
    if engine == "vizipvoice":
        from services.voice_service import vizipvoice_generate
        return vizipvoice_generate(text)
    
    try:
        # Use gTTS to generate real audio file
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(out_file)
    except Exception as e:
        print(f"❌ gTTS Error: {e}")
        raise Exception(f"Failed to generate TTS audio: {str(e)}")
            
    return out_file

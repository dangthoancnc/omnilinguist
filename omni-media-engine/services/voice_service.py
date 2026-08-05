"""
Voice Service — Multi-engine TTS + Voice Cloning for Media Studio v2.0
Tier 1: Edge-TTS (CPU, cloud)
Tier 2: F5-TTS (GPU, zero-shot clone)
Tier 3: CosyVoice (GPU, cross-lingual)
Tier 4: RVC (GPU, voice conversion)
All engines use lazy loading to minimize RAM/VRAM usage.
"""
import os
import uuid
import asyncio
import sys

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "media", "voice"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Windows asyncio fix
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# ============================================================
# TIER 1: Edge-TTS (CPU, requires internet)
# ============================================================

async def _edge_tts_generate(text: str, voice: str, output_file: str, rate: int = 0, volume: int = 0, pitch: int = 0):
    """Internal async Edge-TTS generation"""
    import edge_tts
    rate_str = f'+{rate}%' if rate >= 0 else f'{rate}%'
    volume_str = f'+{volume}%' if volume >= 0 else f'{volume}%'
    pitch_str = f'+{pitch}Hz' if pitch >= 0 else f'{pitch}Hz'
    
    communicate = edge_tts.Communicate(text, voice, rate=rate_str, volume=volume_str, pitch=pitch_str)
    await communicate.save(output_file)


def edge_tts_generate(text: str, voice: str = "ja-JP-NanamiNeural", rate: int = 0, volume: int = 0, pitch: int = 0) -> str:
    """Generate TTS audio using Microsoft Edge-TTS (CPU, free, requires internet)"""
    output_file = os.path.join(OUTPUT_DIR, f"edge_{uuid.uuid4().hex[:8]}.mp3")
    
    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(_edge_tts_generate(text, voice, output_file, rate, volume, pitch))
    finally:
        loop.close()
    
    if os.path.exists(output_file):
        return output_file
    raise RuntimeError("Edge-TTS generation failed")


async def _edge_tts_voices():
    """Get list of available Edge-TTS voices"""
    import edge_tts
    voices = await edge_tts.list_voices()
    return voices


def edge_tts_list_voices() -> list:
    """List all available Edge-TTS voices"""
    loop = asyncio.new_event_loop()
    try:
        voices = loop.run_until_complete(_edge_tts_voices())
    finally:
        loop.close()
    
    result = []
    for v in voices:
        result.append({
            "name": v["ShortName"],
            "locale": v["Locale"],
            "gender": v["Gender"],
            "friendly": v.get("FriendlyName", v["ShortName"])
        })
    return result


# ============================================================
# TIER 2: F5-TTS Voice Clone (GPU, zero-shot)
# ============================================================

_f5_model = None

def f5_tts_clone(text: str, ref_audio: str, ref_text: str, model_name: str = "SWivid/F5-TTS_v1", speed: float = 1.0) -> str:
    """Clone voice using F5-TTS. Requires GPU with 6GB+ VRAM."""
    global _f5_model
    
    try:
        import torch
        import soundfile as sf
        from f5_tts.model import DiT
        from f5_tts.infer.utils_infer import load_vocoder, load_model, preprocess_ref_audio_text, infer_process
    except ImportError:
        raise RuntimeError("F5-TTS not installed. Run: pip install f5-tts")
    
    output_file = os.path.join(OUTPUT_DIR, f"f5clone_{uuid.uuid4().hex[:8]}.wav")
    
    # Lazy load model
    if _f5_model is None:
        print("[*] Loading F5-TTS model (first time, may take 30s)...")
        vocoder = load_vocoder()
        model_cfg = dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512, conv_layers=4)
        from cached_path import cached_path
        ckpt = str(cached_path(f"hf://{model_name}/model_1200000.safetensors"))
        ema_model = load_model(DiT, model_cfg, ckpt)
        _f5_model = {"vocoder": vocoder, "model": ema_model}
    
    ref_audio_processed, ref_text_processed = preprocess_ref_audio_text(ref_audio, ref_text)
    
    final_wave, final_sr, _ = infer_process(
        ref_audio_processed, ref_text_processed, text,
        _f5_model["model"], _f5_model["vocoder"],
        cross_fade_duration=0.15, nfe_step=32, speed=speed
    )
    
    sf.write(output_file, final_wave, final_sr)
    return output_file


def f5_tts_unload():
    """Unload F5-TTS model to free VRAM"""
    global _f5_model
    if _f5_model is not None:
        del _f5_model
        _f5_model = None
        try:
            import torch, gc
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except:
            pass
        print("[*] F5-TTS model unloaded, VRAM freed")


# ============================================================
# TIER 3: CosyVoice 2 (GPU, cross-lingual)
# ============================================================

_cosyvoice_model = None

def cosyvoice_clone(text: str, ref_audio: str, ref_text: str, mode: str = "zero_shot", speed: float = 1.0) -> str:
    """Clone voice using CosyVoice 2. Modes: zero_shot, cross_lingual, instruct"""
    global _cosyvoice_model
    
    try:
        import torch
        import torchaudio
        from cosyvoice.cli.cosyvoice import CosyVoice2
        from cosyvoice.utils.file_utils import load_wav
    except ImportError:
        raise RuntimeError("CosyVoice not installed. See voice-pro-source for setup.")
    
    output_file = os.path.join(OUTPUT_DIR, f"cosyvoice_{uuid.uuid4().hex[:8]}.wav")
    
    # Lazy load
    if _cosyvoice_model is None:
        model_dir = os.path.join(os.path.dirname(__file__), "..", "..", "media", "voice-pro-source", "model", "cosyvoice", "CosyVoice2-0.5B")
        if not os.path.exists(model_dir):
            raise RuntimeError(f"CosyVoice model not found at {model_dir}")
        print("[*] Loading CosyVoice2 model...")
        _cosyvoice_model = CosyVoice2(model_dir)
    
    prompt_speech = load_wav(ref_audio, 16000)
    
    if mode == "cross_lingual":
        for _, j in enumerate(_cosyvoice_model.inference_cross_lingual(text, prompt_speech, speed=speed, stream=False)):
            torchaudio.save(output_file, j['tts_speech'], _cosyvoice_model.sample_rate)
    elif mode == "instruct":
        for _, j in enumerate(_cosyvoice_model.inference_instruct2(text, '', prompt_speech, stream=False)):
            torchaudio.save(output_file, j['tts_speech'], _cosyvoice_model.sample_rate)
    else:  # zero_shot
        for _, j in enumerate(_cosyvoice_model.inference_zero_shot(text, ref_text, prompt_speech, stream=False, speed=speed, text_frontend=False)):
            torchaudio.save(output_file, j['tts_speech'], _cosyvoice_model.sample_rate)
    
    return output_file


def cosyvoice_unload():
    """Unload CosyVoice model"""
    global _cosyvoice_model
    if _cosyvoice_model is not None:
        del _cosyvoice_model
        _cosyvoice_model = None
        try:
            import torch, gc
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except:
            pass


# ============================================================
# TIER 4: RVC Voice Conversion (GPU)
# ============================================================

def rvc_convert(input_audio: str, voice_model: str, pitch: int = 0, index_rate: float = 0.3) -> str:
    """Convert voice using RVC pretrained model"""
    try:
        from rvc.infer.infer import VoiceConverter
    except ImportError:
        raise RuntimeError("RVC not installed. See voice-pro-source for setup.")
    
    output_file = os.path.join(OUTPUT_DIR, f"rvc_{uuid.uuid4().hex[:8]}.wav")
    
    # Find model files
    voice_dir = os.path.join(os.path.dirname(__file__), "..", "voice-models", voice_model)
    if not os.path.exists(voice_dir):
        raise RuntimeError(f"RVC voice model '{voice_model}' not found")
    
    pth_file = next((f for f in os.listdir(voice_dir) if f.endswith(".pth")), None)
    index_file = next((f for f in os.listdir(voice_dir) if f.endswith(".index")), None)
    
    if not pth_file:
        raise RuntimeError(f"No .pth model found in {voice_dir}")
    
    converter = VoiceConverter()
    converter.infer_pipeline(
        str(pitch), "3", str(index_rate), "1", "0.23", "256", "rmvpe",
        str(input_audio), str(output_file),
        str(os.path.join(voice_dir, pth_file)),
        str(os.path.join(voice_dir, index_file)) if index_file else "",
        "False", "False", "True", "0.2", "wav", "contentvec", None, "False", None
    )
    
    return output_file


def list_rvc_voices() -> list:
    """List available RVC voice models"""
    voice_dir = os.path.join(os.path.dirname(__file__), "..", "voice-models")
    if not os.path.exists(voice_dir):
        return []
    return [d for d in os.listdir(voice_dir) if os.path.isdir(os.path.join(voice_dir, d))]


# ============================================================
# TIER 5: ViZipvoice (API, Zero-shot Vietnamese)
# ============================================================

def vizipvoice_generate(text: str, ref_audio: str = None, ref_text: str = None, speed: float = 1.0) -> str:
    """Generate TTS using ViZipvoice Gradio API (Hugging Face Space)"""
    try:
        from gradio_client import Client, handle_file
        import shutil
    except ImportError:
        raise RuntimeError("gradio_client not installed. Run: pip install gradio_client")
    
    # Sử dụng giọng mặc định nếu không truyền ref_audio (Đinh-Quyết)
    if not ref_audio:
        ref_audio = "https://huggingface.co/contextboxai/ViZipvoice/resolve/main/audio/%C4%90inh-Quy%E1%BA%BFt.mp3"
        ref_text = "Đây là giọng đọc của tôi, bạn có thể gọi tôi là Quyết. Rất hân hạnh được hỗ trợ bạn."
        
    output_file = os.path.join(OUTPUT_DIR, f"vizipvoice_{uuid.uuid4().hex[:8]}.wav")
    
    print(f"[*] Calling ViZipvoice API with text: {text[:30]}...")
    client = Client("dinhthuan/ViZipvoice")
    
    result = client.predict(
        prompt_wav_path=handle_file(ref_audio),
        prompt_text=ref_text,
        text=text,
        num_step=16,
        guidance_scale=1,
        speed=speed,
        seed=666,
        api_name="/infer"
    )
    
    if result and os.path.exists(result):
        shutil.copy2(result, output_file)
        return output_file
    else:
        raise RuntimeError(f"ViZipvoice API returned invalid result: {result}")

# ============================================================
# Engine Status Helper
# ============================================================

def get_engine_status() -> dict:
    """Check which engines are available"""
    status = {
        "edge_tts": {"available": False, "loaded": False, "type": "cpu"},
        "f5_tts": {"available": False, "loaded": _f5_model is not None, "type": "gpu"},
        "cosyvoice": {"available": False, "loaded": _cosyvoice_model is not None, "type": "gpu"},
        "rvc": {"available": False, "loaded": False, "type": "gpu"},
        "vizipvoice": {"available": True, "loaded": True, "type": "api"},
    }
    
    try:
        import edge_tts
        status["edge_tts"]["available"] = True
    except ImportError:
        pass
    
    try:
        import f5_tts
        status["f5_tts"]["available"] = True
    except ImportError:
        pass
    
    try:
        from cosyvoice.cli.cosyvoice import CosyVoice2
        status["cosyvoice"]["available"] = True
    except ImportError:
        pass
    
    try:
        from rvc.infer.infer import VoiceConverter
        status["rvc"]["available"] = True
    except ImportError:
        pass
    
    return status

import whisper
import traceback

def test():
    print("Loading model...")
    try:
        m = whisper.load_model("base")
        print("Transcribing...")
        res = m.transcribe(
            r"temp\uploads\test.mp3",
            word_timestamps=True,
            fp16=False
        )
        print("Success!", list(res.keys()))
    except Exception as e:
        print("Error!")
        traceback.print_exc()

test()

import re
from youtube_transcript_api import YouTubeTranscriptApi
from newspaper import Article
from deep_translator import GoogleTranslator

def extract_youtube_id(url: str):
    # Matches v=, youtu.be/, embed/
    match = re.search(r"(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})", url)
    return match.group(1) if match else None

def process_youtube_link(url: str):
    video_id = extract_youtube_id(url)
    if not video_id:
        raise ValueError("Invalid YouTube URL")
    
    try:
        # Fetch transcript in priority: ja, en, vi using the instance method API
        api = YouTubeTranscriptApi()
        fetched_transcript = api.fetch(video_id, languages=['ja', 'en', 'vi'])
        raw_segments = fetched_transcript.to_raw_data()
        
        # Combine the transcript text, preserving lines for bilingual translation alignment
        full_text = []
        segments = []
        
        for t in raw_segments:
            text_cleaned = t['text'].replace('\n', ' ')
            full_text.append(text_cleaned)
            segments.append({
                "start": t['start'],
                "duration": t['duration'],
                "text": text_cleaned
            })
            
        content = "\n".join(full_text)
        
        title = f"YouTube Video: {video_id}"
        return {
            "title": title, 
            "content": content, 
            "segments": segments,
            "type": "youtube",
            "video_id": video_id
        }
    except Exception as e:
        raise ValueError(f"Could not fetch YouTube subtitles. Video might not have CC. Error: {str(e)}")

def process_article_link(url: str):
    try:
        article = Article(url)
        article.download()
        article.parse()
        return {"title": article.title, "content": article.text, "type": "article"}
    except Exception as e:
        raise ValueError(f"Could not fetch article. Error: {str(e)}")

def fetch_link_content(url: str):
    if "youtube.com" in url or "youtu.be" in url:
        return process_youtube_link(url)
    else:
        return process_article_link(url)

def translate_realtime(text: str, target_lang: str = 'vi'):
    try:
        translator = GoogleTranslator(source='auto', target=target_lang)
        lines = text.split('\n')
        translated_lines = []
        
        # Batch translate in chunks of 50 to prevent Request exception
        chunk_size = 50
        for i in range(0, len(lines), chunk_size):
            chunk = lines[i:i+chunk_size]
            res = translator.translate_batch(chunk)
            # handle cases where translate_batch might return None for some items
            translated_lines.extend([r if r else "" for r in res])
            
        return {"original": text, "translated": '\n'.join(translated_lines)}
    except Exception as e:
        return {"original": text, "translated": f"Translation error: {str(e)}"}

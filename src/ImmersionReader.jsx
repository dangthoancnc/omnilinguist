// v9.1.54-1 — Immersion Reader (LingQ Style)
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookOpen, PlusCircle, Search, FileText, CheckCircle, UploadCloud, Volume2, Loader, Globe, Link as LinkIcon, ExternalLink, Cpu } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';
import { addCustomCard } from './studyStore';
import FuriganaText from './components/FuriganaText';

const LEVEL_COLORS = { N5:'#10b981', N4:'#3b82f6', N3:'#f59e0b', N2:'#8b5cf6', N1:'#ef4444' };

const translateToVi = async (enText) => {
  if (!enText) return '';
  const cacheKey = `trans_${enText}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(enText)}`);
    const data = await res.json();
    const viText = data[0][0][0];
    localStorage.setItem(cacheKey, viText);
    return viText;
  } catch (e) { return enText; }
};

const ViText = ({ text }) => {
  const [vi, setVi] = useState(() => localStorage.getItem(`trans_${text}`) || '');
  useEffect(() => {
    if (!localStorage.getItem(`trans_${text}`)) translateToVi(text).then(setVi);
  }, [text]);
  return <>{vi || text}</>;
};

// Simple Romaji to Kana conversion (Same as Dictionary)
const ROMAJI_TO_KANA = {
  kya:'きゃ', kyu:'きゅ', kyo:'きょ', sha:'しゃ', shu:'しゅ', sho:'しょ', cha:'ちゃ', chu:'ちゅ', cho:'ちょ',
  shi:'し', chi:'ち', tsu:'つ',
  ka:'か', ki:'き', ku:'く', ke:'け', ko:'こ', sa:'さ', su:'す', se:'せ', so:'そ',
  ta:'た', te:'て', to:'と', na:'な', ni:'に', nu:'ぬ', ne:'ね', no:'の',
  ha:'は', hi:'ひ', fu:'ふ', he:'へ', ho:'ほ', ma:'ま', mi:'み', mu:'む', me:'め', mo:'も',
  ya:'や', yu:'ゆ', yo:'よ', ra:'ら', ri:'り', ru:'る', re:'れ', ro:'ろ',
  wa:'わ', wo:'を', nn:'ん', n:'ん',
  ga:'が', gi:'ぎ', gu:'ぐ', ge:'げ', go:'ご', za:'ざ', ji:'じ', zu:'ず', ze:'ぜ', zo:'ぞ',
  da:'だ', de:'で', do:'ど', ba:'ば', bi:'び', bu:'ぶ', be:'べ', bo:'ぼ',
  pa:'ぱ', pi:'ぴ', pu:'ぷ', pe:'ぺ', po:'ぽ',
  a:'あ', i:'い', u:'う', e:'え', o:'お'
};

const toHiragana = (str) => {
  let res = str.toLowerCase();
  for (let k in ROMAJI_TO_KANA) { res = res.split(k).join(ROMAJI_TO_KANA[k]); }
  return res;
};

const ImmersionReader = () => {
  const vocabData = useLiveQuery(() => db.vocab.toArray()) || [];
  const kanjiData = useLiveQuery(() => db.kanji.toArray()) || [];
  const grammarData = useLiveQuery(() => db.grammar.toArray()) || [];
  const [texts, setTexts] = useState(() => JSON.parse(localStorage.getItem('immersion_texts') || '[]'));
  const [activeTextId, setActiveTextId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  
  const [selectedText, setSelectedText] = useState('');
  const [sentenceContext, setSentenceContext] = useState('');
  const [addedMessage, setAddedMessage] = useState(false);
  
  // Media Engine State
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [bilingualData, setBilingualData] = useState(null);

  const contentRef = useRef(null);

  const QUICK_LINKS = [
    { title: 'NHK Web Easy', url: 'https://www3.nhk.or.jp/news/easy/' },
    { title: 'CNN News', url: 'https://edition.cnn.com/' },
    { title: 'Comprehensible JP', url: 'https://www.youtube.com/@comprehensiblejapanese' },
  ];

  // Save texts to storage
  useEffect(() => {
    localStorage.setItem('immersion_texts', JSON.stringify(texts));
  }, [texts]);

  // Reset bilingual when text changes
  useEffect(() => {
    setBilingualData(null);
  }, [activeTextId]);

  const activeText = texts.find(t => t.id === activeTextId);

  const handleSaveText = () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    
    if (activeTextId && texts.some(t => t.id === activeTextId)) {
      setTexts(texts.map(t => t.id === activeTextId ? { ...t, title: editTitle, content: editContent } : t));
    } else {
      const newId = `t_${Date.now()}`;
      setTexts([{ id: newId, title: editTitle, content: editContent }, ...texts]);
      setActiveTextId(newId);
    }
    setIsEditing(false);
  };

  const createNew = () => {
    setActiveTextId(null);
    setEditTitle('');
    setEditContent('');
    setIsEditing(true);
    setSelectedText('');
    setAudioUrl(null);
  };

  // ------------------ MEDIA ENGINE INTEGRATION ------------------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    alert('Tính năng trích xuất âm thanh sang văn bản (Transcribe) đã được chuyển sang chế độ Serverless. Vui lòng nhập Groq API Key trong mục Cài đặt (Settings) để sử dụng.');
  };

  const [ttsEngine, setTtsEngine] = useState(() => localStorage.getItem('omni_tts_engine') || 'edge-tts');
  const [ttsVoice, setTtsVoice] = useState(() => localStorage.getItem('omni_tts_voice') || 'ja-JP-NanamiNeural');

  useEffect(() => {
    localStorage.setItem('omni_tts_engine', ttsEngine);
    localStorage.setItem('omni_tts_voice', ttsVoice);
  }, [ttsEngine, ttsVoice]);

  const handleGenerateTTS = (textToRead) => {
    if (!window.speechSynthesis) {
      alert('Trình duyệt của bạn không hỗ trợ Text-to-Speech.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9; // Tốc độ hơi chậm một chút để dễ nghe
    
    // Tìm giọng Nhật Bản nếu có
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
    if (jpVoice) {
      utterance.voice = jpVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const handleFetchLink = async () => {
    if (!urlInput.trim()) return;
    setIsProcessing(true);
    try {
      // Use CORS proxy to fetch HTML directly
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlInput.trim())}`);
      const data = await res.json();
      if (data.contents) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        // Lấy title
        const title = doc.title || 'Bài trích xuất Online';
        // Rút trích text đơn giản từ body (loại bỏ script/style)
        const scripts = doc.querySelectorAll('script, style, nav, footer, header');
        scripts.forEach(s => s.remove());
        const content = doc.body ? doc.body.innerText.replace(/\n\s*\n/g, '\n\n').trim() : 'Không tìm thấy nội dung.';
        
        setEditTitle(title);
        setEditContent(content);
        setUrlInput('');
      } else {
        alert('Lỗi: Không thể tải nội dung.');
      }
    } catch (err) {
      alert('Không thể tải URL này. Có thể trang web chặn CORS proxy.');
    }
    setIsProcessing(false);
  };

  const handleGenerateBilingual = async (textToRead) => {
    if (bilingualData) {
      setBilingualData(null);
      return;
    }
    setIsTranslating(true);
    try {
      // Gọi trực tiếp Google Translate (miễn phí)
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(textToRead)}`);
      const data = await res.json();
      if (data && data[0]) {
        // gộp tất cả các đoạn dịch lại
        let translatedText = '';
        data[0].forEach(item => {
          if (item[0]) translatedText += item[0];
        });
        
        const originalLines = textToRead.split('\n');
        const translatedLines = translatedText.split('\n');
        const interleaved = originalLines.map((line, idx) => ({
            original: line,
            translated: translatedLines[idx] || ''
        }));
        setBilingualData(interleaved);
      } else {
        alert('Lỗi dịch.');
      }
    } catch (err) {
      alert('Không thể kết nối API Dịch.');
    }
    setIsTranslating(false);
  };
  // --------------------------------------------------------------

  // Handle Text Selection (Mouse Highlight)
  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text && text.length < 20) { // Only lookup short phrases
      setSelectedText(text);
      
      // Try to extract the sentence context
      if (selection.anchorNode && selection.anchorNode.nodeValue) {
        const fullText = selection.anchorNode.nodeValue;
        // Simple sentence boundary detection (。 or \n)
        const sentences = fullText.split(/[。！？\n]/);
        const targetSentence = sentences.find(s => s.includes(text));
        if (targetSentence) setSentenceContext(targetSentence.trim() + '。');
      }
    }
  };

  // Dictionary Lookup Logic
  const results = useMemo(() => {
    const qRaw = selectedText.toLowerCase().trim();
    if (!qRaw) return { vocab: [], kanji: [], grammar: [] };
    
    const qHira = toHiragana(qRaw);
    const normalize = (str) => (str || '').toLowerCase().replace(/[\.\-\s]/g, '');

    const vRes = vocabData.filter(v => normalize(v.word).includes(qRaw) || normalize(v.word).includes(qHira) || normalize(v.reading).includes(qRaw) || normalize(v.reading).includes(qHira) || normalize(v.vi).includes(qRaw)).slice(0, 10);
    const kRes = kanjiData.filter(k => normalize(k.kanji).includes(qRaw) || k.meanings.some(m => normalize(m).includes(qRaw)) || k.onyomi.some(o => normalize(o).includes(qRaw) || normalize(o).includes(qHira)) || k.kunyomi.some(ku => normalize(ku).includes(qRaw) || normalize(ku).includes(qHira))).slice(0, 5);
    const gRes = grammarData.filter(g => normalize(g.pattern).includes(qRaw) || normalize(g.pattern).includes(qHira) || normalize(g.meaning).includes(qRaw) || normalize(g.vi).includes(qRaw)).slice(0, 5);

    return { vocab: vRes, kanji: kRes, grammar: gRes };
  }, [selectedText, vocabData, kanjiData, grammarData]);

  // Add to Flashcards FSRS
  const addToFlashcards = (item, type) => {
    const newCard = {
      id: `c_${Date.now()}`,
      level: item.level || 'Khác',
      word: item.word || item.kanji || item.pattern,
      reading: item.reading || item.onyomi?.join(', ') || '',
      vi: item.vi || item.meanings?.join(', ') || item.meaning,
      examples: sentenceContext ? [sentenceContext] : (item.examples || []),
      type: type === 'kanji' ? 'Hán tự' : (type === 'grammar' ? 'Ngữ pháp' : 'Từ vựng')
    };
    
    const success = addCustomCard(newCard);
    
    if (success) {
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 2000);
    } else {
      alert('Từ này đã có trong danh sách Flashcard của bạn!');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 100px)' }}>
      
      {/* LEFT PANEL: Texts List */}
      <div className="glass-panel" style={{ width: 280, display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ padding: '16px 16px 0', marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={createNew} style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <PlusCircle size={18}/> Thêm bài đọc mới
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px 16px' }}>
          <div style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Mục đã lưu</div>
          {texts.map(t => (
            <div 
              key={t.id} 
              onClick={() => { setActiveTextId(t.id); setIsEditing(false); setSelectedText(''); setAudioUrl(null); }}
              style={{ padding: '12px 14px', borderRadius: 8, cursor: 'pointer', background: activeTextId === t.id && !isEditing ? 'rgba(59,130,246,0.15)' : 'transparent', borderLeft: `3px solid ${activeTextId === t.id && !isEditing ? '#3b82f6' : 'transparent'}`, transition: 'all 0.2s' }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: activeTextId === t.id ? 700 : 400, color: activeTextId === t.id ? 'white' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <FileText size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', opacity: 0.7 }}/>
                {t.title}
              </div>
            </div>
          ))}
          {texts.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Chưa có bài đọc nào.<br/>Nhấn nút Thêm để bắt đầu.
            </div>
          )}

          <div style={{ padding: '24px 14px 12px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Kênh Nguồn (Nhanh)</div>
          {QUICK_LINKS.map(link => (
            <a 
              key={link.title} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, color: 'var(--accent-primary)', textDecoration: 'none', transition: 'all 0.2s', border: '1px solid transparent' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <ExternalLink size={14} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{link.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* MIDDLE PANEL: Reader / Editor */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {isEditing ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
            
            {/* ONLINE MODE / STT FETCHING */}
            <div style={{ display: 'flex', gap: 12, padding: 16, background: 'rgba(59,130,246,0.05)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#60a5fa' }}>Tải nội dung Online (YouTube Subtitles, Bài Báo)</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="text" 
                    placeholder="Nhập URL (VD: Link YouTube, CNN, NHK...)"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', fontSize: '1rem', borderRadius: 6, border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.4)', color: 'white', outline: 'none' }}
                  />
                  <button className="btn btn-outline" onClick={handleFetchLink} disabled={isProcessing} style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isProcessing ? <Loader size={16} className="spin" /> : <Globe size={16} />} Tải Online
                  </button>
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Hoặc bóc băng file Offline</div>
                <label className="btn btn-secondary" style={{ cursor: isProcessing ? 'not-allowed' : 'pointer', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: isProcessing ? 'gray' : '' }}>
                  {isProcessing ? <Loader size={16} className="spin" /> : <UploadCloud size={16} />}
                  Tải Video/Audio AI
                  <input type="file" accept="audio/*,video/*" hidden onChange={handleFileUpload} disabled={isProcessing} />
                </label>
              </div>
            </div>

            <input 
              type="text" 
              placeholder="Tiêu đề bài đọc (VD: Tin tức NHK ngày 15/10)"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', fontSize: '1.2rem', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' }}
            />
            <textarea
              placeholder="Dán nội dung tiếng Nhật vào đây..."
              className="jp-text"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              style={{ flex: 1, width: '100%', padding: 16, fontSize: '1.15rem', lineHeight: 1.8, borderRadius: 8, border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', resize: 'none', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              {activeTextId && <button className="btn btn-outline" onClick={() => setIsEditing(false)}>Hủy</button>}
              <button className="btn btn-primary" onClick={handleSaveText} style={{ padding: '10px 24px' }}>Lưu bài đọc</button>
            </div>
          </div>
        ) : activeText ? (
          <div style={{ padding: '24px 32px', overflowY: 'auto', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--accent-primary)' }}>{activeText.title}</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" onClick={() => handleGenerateBilingual(activeText.content)} disabled={isTranslating} style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: '#3b82f6', color: '#60a5fa' }}>
                  {isTranslating ? 'Đang dịch...' : bilingualData ? 'Ẩn Song Ngữ' : '🌐 Dịch Song Ngữ'}
                </button>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <select value={ttsEngine} onChange={e => setTtsEngine(e.target.value)} style={{ padding: '6px', fontSize: '0.85rem', borderRadius: 4, background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}>
                    <option value="edge-tts">Edge-TTS (Nhanh)</option>
                    <option value="supertonic">Supertonic (Mượt)</option>
                    <option value="vizipvoice">ViZipvoice (Tiếng Việt)</option>
                  </select>
                  {ttsEngine === 'edge-tts' && (
                    <select value={ttsVoice} onChange={e => setTtsVoice(e.target.value)} style={{ padding: '6px', fontSize: '0.85rem', borderRadius: 4, background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}>
                      <option value="ja-JP-NanamiNeural">Nanami (Nữ)</option>
                      <option value="ja-JP-KeitaNeural">Keita (Nam)</option>
                      <option value="ja-JP-AoiNeural">Aoi (Nữ)</option>
                      <option value="ja-JP-DaichiNeural">Daichi (Nam)</option>
                    </select>
                  )}
                  <button className="btn btn-primary" onClick={() => handleGenerateTTS(activeText.content)} disabled={isProcessing} style={{ padding: '6px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                     {isProcessing ? <><Loader size={16} className="spin" /> Đang tạo...</> : <><Volume2 size={16} /> Nghe Sách Nói</>}
                  </button>
                </div>
                <button className="btn btn-outline" onClick={() => { setEditTitle(activeText.title); setEditContent(activeText.content); setIsEditing(true); }} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  ✏️ Sửa
                </button>
              </div>
            </div>
            {audioUrl && (
               <div style={{ marginBottom: 20, padding: 12, background: 'rgba(16,185,129,0.1)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.3)' }}>
                 <div style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: 8, fontWeight: 600 }}>Tác phẩm Sách nói AI sinh ra thành công!</div>
                 <audio controls src={audioUrl} autoPlay style={{ width: '100%' }} />
               </div>
            )}
            <div style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: 24, padding: '8px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: 6, display: 'inline-block' }}>
              💡 Mẹo: Dùng chuột bôi đen (highlight) bất kỳ từ nào bạn không biết để tra từ điển ngay lập tức.
            </div>
            {bilingualData ? (
               <div ref={contentRef} onMouseUp={handleSelection} onTouchEnd={handleSelection} style={{ fontSize: '1.25rem', lineHeight: 2.2, color: '#e2e8f0', cursor: 'text' }}>
                 {bilingualData.map((block, i) => (
                   <div key={i} style={{ marginBottom: block.original.trim() ? 24 : 0 }}>
                     {block.original.trim() && <div className="jp-text" style={{ whiteSpace: 'pre-wrap' }}><FuriganaText text={block.original} /></div>}
                     {block.original.trim() && block.translated.trim() && (
                       <div style={{ fontSize: '1.05rem', color: '#94a3b8', borderLeft: '3px solid #3b82f6', paddingLeft: 12, marginTop: 4, fontStyle: 'italic', lineHeight: 1.6 }}>
                         {block.translated}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            ) : (
              <div 
                className="jp-text"
                ref={contentRef}
                onMouseUp={handleSelection}
                onTouchEnd={handleSelection}
                style={{ fontSize: '1.25rem', lineHeight: 2.2, color: '#e2e8f0', whiteSpace: 'pre-wrap', cursor: 'text' }}
              >
                {activeText.content}
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center' }}>
              <BookOpen size={60} style={{ opacity: 0.2, marginBottom: 20, margin: '0 auto' }}/>
              <p>Chọn một bài đọc hoặc thêm bài mới để bắt đầu Tắm Ngôn Ngữ.</p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Dictionary Inspector */}
      <div className="glass-panel" style={{ width: 340, display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto', padding: 20 }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={18}/> Phân tích Từ vựng
        </h3>
        
        {!selectedText ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0', fontSize: '0.9rem' }}>
            Bôi đen một từ trong bài đọc để tra cứu tự động.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ padding: 16, background: 'rgba(59,130,246,0.15)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: '#60a5fa', marginBottom: 6 }}>Từ đang chọn:</div>
              <div className="jp-text" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>{selectedText}</div>
            </div>

            {/* Vocab Results */}
            {results.vocab.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3b82f6', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Từ vựng ({results.vocab.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.vocab.map(v => (
                    <div key={v.id} style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div className="jp-text" style={{ fontSize: '1.15rem', fontWeight: 700 }}>{v.word || v.reading}</div>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: `${LEVEL_COLORS[v.level]}22`, color: LEVEL_COLORS[v.level], fontWeight: 800 }}>{v.level}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: 6 }}>{v.reading}</div>
                      <div style={{ fontSize: '0.95rem', color: '#e2e8f0', marginBottom: 12 }}>
                        <ViText text={v.vi}/><br/>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v.vi}</span>
                      </div>
                      <button onClick={() => addToFlashcards(v, 'vocab')} className="btn btn-outline" style={{ width: '100%', padding: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: 6, borderColor: '#10b981', color: '#10b981' }}>
                        <PlusCircle size={14}/> Thêm vào Flashcard
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Kanji Results */}
            {results.kanji.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Hán tự ({results.kanji.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.kanji.map(k => (
                    <div key={k.id} style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid var(--glass-border)', display: 'flex', gap: 12 }}>
                      <div className="jp-text" style={{ fontSize: '2.5rem', lineHeight: 1, color: LEVEL_COLORS[k.level] || 'white' }}>{k.kanji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>
                          <ViText text={k.meanings.join(', ')} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span style={{ color: '#ef4444' }}>ON:</span> {k.onyomi.join(', ')}<br/>
                          <span style={{ color: '#3b82f6' }}>KUN:</span> {k.kunyomi.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grammar Results */}
            {results.grammar.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Ngữ pháp ({results.grammar.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.grammar.map(g => (
                    <div key={g.id} style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div className="jp-text" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f59e0b' }}>{g.pattern}</div>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: `${LEVEL_COLORS[g.level]}22`, color: LEVEL_COLORS[g.level], fontWeight: 800 }}>{g.level}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{g.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.vocab.length === 0 && results.kanji.length === 0 && results.grammar.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0', fontSize: '0.85rem' }}>
                Không tìm thấy kết quả phù hợp trong Từ điển.
              </div>
            )}
          </div>
        )}

        {/* Floating Success Alert */}
        {addedMessage && (
          <div className="fade-in" style={{ position: 'fixed', bottom: 24, right: 24, background: '#10b981', color: 'white', padding: '12px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 100 }}>
            <CheckCircle size={18}/> Đã thêm vào Flashcards!
          </div>
        )}
      </div>
    </div>
  );
};

export default ImmersionReader;

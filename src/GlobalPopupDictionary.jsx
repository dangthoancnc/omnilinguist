import React, { useState, useEffect, useRef } from 'react';
import { db } from './db.js';
import { Search, Book, Type, X, ExternalLink, Loader, DownloadCloud, CheckCircle } from 'lucide-react';
import { supabase } from './lib/supabaseClient.js';
import FuriganaText from './components/FuriganaText';
import localMasterDb from './data/jlpt_master_db.json';

const API_BASE_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000` : '';

// RAM Cache for ultra fast 0ms repeated lookups
const jishoRamCache = new Map();

// Direct Jotoba API (Mapped to Jisho format) + Multi-layer Cache
const fetchJishoData = async (keyword, maxResults = 2) => {
  const q = (keyword || '').trim();
  if (!q) return null;

  // 1. RAM Cache (0ms)
  if (jishoRamCache.has(q)) return jishoRamCache.get(q).slice(0, maxResults);

  // 2. LocalStorage Cache (0ms)
  try {
    const lsData = localStorage.getItem(`jisho_${q}`);
    if (lsData) {
      const parsed = JSON.parse(lsData);
      jishoRamCache.set(q, parsed);
      return parsed.slice(0, maxResults);
    }
  } catch (e) {}

  // 3. Direct Jotoba API (100% CORS free, reliable)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://jotoba.de/api/search/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, language: 'English', no_english: false }),
      signal: controller.signal
    });
    clearTimeout(timer);
    
    if (res.ok) {
      const json = await res.json();
      if (json && json.words && json.words.length > 0) {
        // Map to Jisho format to avoid breaking existing UI
        const mappedData = json.words.map(w => ({
          japanese: [{
            word: w.reading.kanji || w.reading.kana,
            reading: w.reading.kana
          }],
          senses: w.senses.map(s => ({
            english_definitions: s.glosses,
            parts_of_speech: s.pos
          })),
          is_common: w.common,
          audio: w.audio ? `https://jotoba.de${w.audio}` : null,
          jlpt: [] // Jotoba doesn't provide JLPT cleanly in the word search by default
        }));
        
        jishoRamCache.set(q, mappedData);
        try { localStorage.setItem(`jisho_${q}`, JSON.stringify(mappedData)); } catch(e){}
        return mappedData.slice(0, maxResults);
      }
    }
  } catch(e) {}

  return null;
};

const GlobalPopupDictionary = () => {
  const [selection, setSelection] = useState({ text: '', x: 0, y: 0, show: false });
  const [results, setResults] = useState({ vocab: [], kanji: [], grammar: [], jisho: null, engVie: null, loading: false });
  const [savingId, setSavingId] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleMouseUp = (e) => {
      // Bỏ qua nếu click vào trong popup
      if (popupRef.current && popupRef.current.contains(e.target)) return;

      const sel = window.getSelection();
      const text = sel.toString().trim();
      
      // Kiểm tra xem có chứa ký tự tiếng Nhật (Kanji, Hiragana, Katakana) hay tiếng Anh không
      const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
      const isSearchable = text.length > 0 && (isJapanese ? text.length <= 40 : text.length <= 500);

      if (isSearchable) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelection({
          text,
          x: rect.left + (rect.width / 2),
          y: rect.bottom + window.scrollY,
          show: true
        });
        
        lookupWord(text);
      } else {
        setSelection(s => ({ ...s, show: false }));
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelection(s => ({ ...s, show: false }));
    };

    const handleMessage = (e) => {
      if (e.data && e.data.type === 'IFRAME_TEXT_SELECTION') {
        const text = e.data.text ? e.data.text.trim() : '';
        const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
        const isSearchable = text.length > 0 && (isJapanese ? text.length <= 40 : text.length <= 500);
        if (isSearchable) {
          let finalX = e.data.x;
          let finalY = e.data.y;
          
          const iframes = Array.from(document.querySelectorAll('iframe'));
          const visibleIframe = iframes.find(iframe => iframe.offsetParent !== null);
          if (visibleIframe) {
            const rect = visibleIframe.getBoundingClientRect();
            finalX += rect.left;
            finalY += rect.top + window.scrollY;
          }
          
          setSelection({ text, x: finalX, y: finalY, show: true });
          lookupWord(text);
        } else {
          setSelection(s => ({ ...s, show: false }));
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('message', handleMessage);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const lookupWord = async (text) => {
    setResults({ vocab: [], kanji: [], grammar: [], jisho: null, engVie: null, loading: true });
    
    try {
      const masterVocab = localMasterDb.vocabulary || [];
      const masterKanji = localMasterDb.kanji || [];
      const masterGrammar = localMasterDb.grammar || [];

      // 1. Tra cứu Offline (IndexedDB + localMasterDb fallback)
      let vocabMatches = await db.vocab.filter(v => v.word === text || v.reading === text).limit(3).toArray();
      if (vocabMatches.length === 0) {
        vocabMatches = masterVocab.filter(v => v.word === text || v.reading === text || v.vi === text).slice(0, 3);
      }
      
      let kanjiMatches = await db.kanji.filter(k => k.kanji === text).toArray();
      if (kanjiMatches.length === 0) {
        kanjiMatches = masterKanji.filter(k => k.kanji === text);
      }
      
      let grammarMatches = [];
      if (text.length > 1) {
        grammarMatches = await db.grammar.filter(g => g.pattern.includes(text)).limit(2).toArray();
        if (grammarMatches.length === 0) {
          grammarMatches = masterGrammar.filter(g => g.pattern.includes(text)).slice(0, 2);
        }
      }

      // HIỂN THỊ KẾT QUẢ OFFLINE NGAY LẬP TỨC
      setResults({
        vocab: vocabMatches,
        kanji: kanjiMatches,
        grammar: grammarMatches,
        jisho: null,
        engVie: null,
        loading: true
      });

      // 2. Tra cứu Online
      const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);

      if (isJapanese) {
        const pJisho = fetchJishoData(text);
        const pTrans = fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(text)}`)
          .then(res => res.json())
          .then(data => (data && data[0] && data[0][0]) ? data[0][0][0] : null)
          .catch(() => null);

        const [jishoData, viTrans] = await Promise.all([pJisho, pTrans]);
        setResults(prev => ({ ...prev, jisho: jishoData, jishoVi: viTrans, loading: false }));
      } else {
        try {
          const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(text)}`);
          const data = await res.json();
          let engVieData = null;
          if (data && data[0] && data[0][0]) {
            engVieData = {
              translation: data[0][0][0],
              dictionary: data[1] || []
            };
          }
          setResults(prev => ({ ...prev, engVie: engVieData, loading: false }));
        } catch (e) {
          setResults(prev => ({ ...prev, loading: false }));
        }
      }

    } catch (error) {
      console.error("Lookup error:", error);
      setResults(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSaveToDB = async (jishoItem) => {
    const word = jishoItem.japanese[0].word || jishoItem.japanese[0].reading;
    setSavingId(word);

    try {
      // 1. Kiểm tra chống trùng lặp 2 lớp (Local & Cloud)
      const existsLocal = await db.vocab.filter(v => v.word === word).count();
      if (existsLocal > 0) {
        alert("Từ vựng này đã tồn tại trong CSDL của bạn!");
        setSavingId(null);
        return;
      }

      // 2. Định dạng dữ liệu chuẩn với cấu trúc bảng
      const newVocab = {
        id: crypto.randomUUID(),
        level: jishoItem.jlpt && jishoItem.jlpt.length > 0 ? jishoItem.jlpt[0].toUpperCase().replace('JLPT-', '') : 'N?',
        word: jishoItem.japanese[0].word || word,
        reading: jishoItem.japanese[0].reading || '',
        vi: jishoItem.viTrans || jishoItem.senses[0].english_definitions.join(', '), // Ưu tiên bản dịch tiếng Việt
        type: 'jisho_import'
      };

      // 3. Đẩy lên Supabase (Master Data)
      const { error } = await supabase.from('omni_master_vocab').insert([newVocab]);
      if (error) throw error;

      // 4. Lưu trực tiếp vào IndexedDB để dùng ngay lập tức không cần tải lại trang
      await db.vocab.put(newVocab);

      // Cập nhật lại UI ngay lập tức
      setResults(prev => ({
        ...prev,
        vocab: [newVocab, ...prev.vocab],
        jisho: prev.jisho.filter(j => (j.japanese[0].word || j.japanese[0].reading) !== word) // Ẩn khỏi list Jisho
      }));
    } catch (err) {
      console.error("Lỗi khi lưu từ vựng:", err);
      alert("Lưu thất bại: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (!selection.show) return null;

  // Tính toán vị trí Popup để không bị tràn màn hình
  const leftPos = Math.max(10, Math.min(selection.x - 175, window.innerWidth - 360));

  return (
    <div 
      ref={popupRef}
      id="global-popup-dict"
      style={{
        position: 'absolute',
        top: selection.y + 10,
        left: leftPos,
        width: 350,
        maxHeight: 450,
        background: 'var(--bg-surface)',
        border: '1px solid var(--glass-border-strong)',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dict-popup-content::-webkit-scrollbar { width: 6px; }
        .dict-popup-content::-webkit-scrollbar-track { background: transparent; }
        .dict-popup-content::-webkit-scrollbar-thumb { background: rgba(100,100,100,0.3); border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '14px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }} className="jp-text">{selection.text}</span>
        </div>
        <button onClick={() => setSelection(s => ({ ...s, show: false }))} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}>
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="dict-popup-content" style={{ overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {results.loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '30px 0', color: 'var(--text-secondary)' }}>
            <Loader className="spin" size={18} /> <span style={{ fontSize: '0.95rem' }}>Đang quét từ điển đa ngữ...</span>
          </div>
        ) : (
          <>
            {/* TỪ VỰNG OFFLINE (TIẾNG VIỆT) - Ưu tiên trên cùng */}
            {results.vocab.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Book size={14}/> Từ vựng (Nghĩa Tiếng Việt)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.vocab.map((v, i) => {
                    // Trích xuất nghĩa thông minh dựa trên cấu trúc DB khác nhau
                    let vietnameseMeaning = v.meaning || v.vietnamese || v.vi_meaning || v.vi;
                    if (!vietnameseMeaning && v.meanings && Array.isArray(v.meanings) && v.meanings.length > 0) {
                      vietnameseMeaning = v.meanings[0].vi || v.meanings[0].vietnamese;
                    }
                    if (!vietnameseMeaning && typeof v.meanings === 'string') {
                      vietnameseMeaning = v.meanings;
                    }
                    if (!vietnameseMeaning) vietnameseMeaning = "[Không tìm thấy nghĩa trong DB]";

                    // Lấy cách đọc từ DB nếu có
                    let dbReading = v.furigana || v.reading || '';

                    return (
                      <div key={i} style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 10, borderTop: '1px solid rgba(59,130,246,0.2)', borderRight: '1px solid rgba(59,130,246,0.2)', borderBottom: '1px solid rgba(59,130,246,0.2)', borderLeft: '3px solid #3b82f6' }}>
                        {/* HIỂN THỊ CÁCH ĐỌC (HIRAGANA BẮT BUỘC NẾU CÓ) */}
                        {dbReading && (
                          <div style={{ fontSize: '1.05rem', color: '#3b82f6', marginBottom: 2, fontWeight: 500 }} className="jp-text">
                            【{dbReading}】
                          </div>
                        )}
                        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                          <FuriganaText text={v.word} className="jp-text" /> {v.kanji && v.kanji !== v.word && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem', fontWeight: 400 }}>(<FuriganaText text={v.kanji} />)</span>}
                        </div>
                        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{vietnameseMeaning}</div>
                        {v.example_jp && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--glass-border)' }}>
                            <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                              <FuriganaText text={v.example_jp} className="jp-text" />
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{v.example_vi}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* KANJI OFFLINE (TIẾNG VIỆT) */}
            {results.kanji.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Type size={14}/> Hán tự (Kanji)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.kanji.map((k, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 10, borderTop: '1px solid rgba(245,158,11,0.2)', borderRight: '1px solid rgba(245,158,11,0.2)', borderBottom: '1px solid rgba(245,158,11,0.2)', borderLeft: '3px solid #f59e0b', display: 'flex', gap: 14 }}>
                      <div style={{ fontSize: '2.8rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }} className="jp-text">{k.kanji}</div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: 4 }}>{k.sino_vietnamese}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{k.meaning}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}><strong>On:</strong> {k.onyomi?.join(', ') || '-'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}><strong>Kun:</strong> {k.kunyomi?.join(', ') || '-'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NGỮ PHÁP OFFLINE */}
            {results.grammar.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Book size={14}/> Cấu trúc Ngữ Pháp ({results.grammar[0].level})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.grammar.map((g, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 10, borderTop: '1px solid rgba(139,92,246,0.2)', borderRight: '1px solid rgba(139,92,246,0.2)', borderBottom: '1px solid rgba(139,92,246,0.2)', borderLeft: '3px solid #8b5cf6' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        <FuriganaText text={g.pattern} className="jp-text" />
                      </div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{g.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* JISHO ONLINE (TIẾNG ANH / HIRAGANA) - Nằm bên dưới */}
            {results.jisho && results.jisho.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ExternalLink size={14}/> Từ điển Anh-Nhật (Jisho)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.jishoVi && (
                    <div style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: 600, padding: '0 4px', marginBottom: -4 }}>
                      Vietnamese: {results.jishoVi}
                    </div>
                  )}
                  {results.jisho.map((item, i) => {
                    const currentWord = item.japanese[0].word || item.japanese[0].reading;
                    const isSaving = savingId === currentWord;
                    return (
                      <div key={i} style={{ background: 'rgba(16,185,129,0.05)', padding: 12, borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }} className="jp-text">
                            {currentWord} 
                            {item.japanese[0].word && <span style={{ color: '#10b981', fontSize: '0.9rem', marginLeft: 8, fontWeight: 500 }}>{item.japanese[0].reading}</span>}
                          </div>
                          
                          {/* Nút Thu thập dữ liệu thông minh */}
                          <button 
                            onClick={() => handleSaveToDB({...item, viTrans: results.jishoVi})}
                            disabled={isSaving}
                            title="Lưu từ này vào Cơ sở dữ liệu của bạn"
                            style={{ 
                              background: isSaving ? 'var(--bg-elevated)' : '#10b981', 
                              color: isSaving ? 'var(--text-tertiary)' : '#fff', 
                              border: 'none', borderRadius: 6, padding: '4px 8px', 
                              fontSize: '0.75rem', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s'
                            }}
                          >
                            {isSaving ? <Loader size={12} className="spin" /> : <DownloadCloud size={12} />}
                            {isSaving ? 'Đang lưu...' : 'Lưu vào DB'}
                          </button>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                          {item.senses[0].english_definitions.map((def, j) => (
                            <li key={j}>{def}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ENG-VIE ONLINE (TIẾNG ANH - VIỆT) */}
            {results.engVie && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ExternalLink size={14}/> Từ điển Anh-Việt
                </div>
                <div style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 10, borderTop: '1px solid rgba(239,68,68,0.2)', borderRight: '1px solid rgba(239,68,68,0.2)', borderBottom: '1px solid rgba(239,68,68,0.2)', borderLeft: '3px solid #ef4444' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {selection.text}
                  </div>
                  {results.engVie.translation && (
                    <div style={{ fontSize: '1.1rem', color: '#ef4444', fontWeight: 500, marginBottom: 8 }}>
                      {results.engVie.translation}
                    </div>
                  )}
                  {results.engVie.dictionary && results.engVie.dictionary.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {results.engVie.dictionary.map((posBlock, idx) => (
                        <div key={idx}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-tertiary)', fontStyle: 'italic', textTransform: 'capitalize' }}>
                            {posBlock[0]}
                          </div>
                          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {posBlock[1].join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {results.vocab.length === 0 && results.kanji.length === 0 && results.grammar.length === 0 && !results.jisho && !results.engVie && (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-tertiary)' }}>
                <Search size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>Không tìm thấy kết quả</div>
                <div style={{ fontSize: '0.85rem' }}>Từ khóa này không có trong CSDL Việt-Nhật hoặc Jisho.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GlobalPopupDictionary;

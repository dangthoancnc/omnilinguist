import React, { useState, useEffect, useRef } from 'react';
import { db } from './db.js';
import { Search, Book, Type, X, ExternalLink } from 'lucide-react';

const SelectionDictionary = () => {
  const [selection, setSelection] = useState({ text: '', x: 0, y: 0, show: false });
  const [results, setResults] = useState({ vocab: [], kanji: [], grammar: [], jisho: null, loading: false });
  const popupRef = useRef(null);

  // Lắng nghe sự kiện bôi đen văn bản
  useEffect(() => {
    const handleMouseUp = (e) => {
      // Nếu click vào bên trong popup thì bỏ qua
      if (popupRef.current && popupRef.current.contains(e.target)) return;

      const sel = window.getSelection();
      const text = sel.toString().trim();
      
      // Chỉ tra cứu nếu văn bản có độ dài vừa phải và chứa ký tự tiếng Nhật (Hiragana, Katakana, Kanji)
      const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);

      if (text && text.length <= 15 && isJapanese) {
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

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const lookupWord = async (text) => {
    setResults({ vocab: [], kanji: [], grammar: [], jisho: null, loading: true });
    
    try {
      // Tra cứu Offline (IndexedDB)
      const vocabMatches = await db.vocab.filter(v => v.word === text || v.kanji === text).toArray();
      const kanjiMatches = await db.kanji.filter(k => k.kanji === text).toArray();
      
      // Tìm kiếm ngữ pháp gần đúng (nếu text chứa cấu trúc)
      const grammarMatches = await db.grammar.filter(g => g.pattern.includes(text)).limit(3).toArray();

      // Nếu Offline không có từ vựng nào, ta gọi Jisho API (Tiếng Anh)
      let jishoData = null;
      if (vocabMatches.length === 0 && kanjiMatches.length === 0) {
        try {
          const apiQuery = encodeURIComponent(text);
          // Use CORS proxy for Jisho
          const res = await fetch(`https://api.allorigins.win/raw?url=https://jisho.org/api/v1/search/words?keyword=${apiQuery}`);
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            jishoData = data.data.slice(0, 2); // Lấy 2 kết quả đầu
          }
        } catch (e) {
          console.log("Jisho API Error:", e);
        }
      }

      setResults({
        vocab: vocabMatches,
        kanji: kanjiMatches,
        grammar: grammarMatches,
        jisho: jishoData,
        loading: false
      });
    } catch (error) {
      console.error("Lookup error:", error);
      setResults(prev => ({ ...prev, loading: false }));
    }
  };

  if (!selection.show) return null;

  // Tính toán vị trí Popup để không bị tràn màn hình
  const leftPos = Math.max(10, Math.min(selection.x - 150, window.innerWidth - 320));

  return (
    <div 
      ref={popupRef}
      style={{
        position: 'absolute',
        top: selection.y + 10,
        left: leftPos,
        width: 320,
        maxHeight: 400,
        background: 'var(--bg-surface)',
        border: '1px solid var(--glass-border-strong)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dict-popup-content::-webkit-scrollbar { width: 6px; }
        .dict-popup-content::-webkit-scrollbar-track { background: transparent; }
        .dict-popup-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selection.text}</span>
        </div>
        <button onClick={() => setSelection(s => ({ ...s, show: false }))} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="dict-popup-content" style={{ overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {results.loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Đang tra cứu từ điển...</div>
        ) : (
          <>
            {/* TỪ VỰNG OFFLINE (TIẾNG VIỆT) */}
            {results.vocab.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Book size={12}/> Từ vựng (Việt)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.vocab.map((v, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', padding: 10, borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {v.word} {v.kanji && v.kanji !== v.word && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', fontWeight: 400 }}>({v.kanji})</span>}
                      </div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{v.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KANJI OFFLINE (TIẾNG VIỆT) */}
            {results.kanji.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Type size={12}/> Hán tự (Kanji)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.kanji.map((k, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', padding: 10, borderRadius: 8, border: '1px solid var(--glass-border)', display: 'flex', gap: 12 }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{k.kanji}</div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: 4 }}>{k.sino_vietnamese}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 2 }}><strong>On:</strong> {k.onyomi?.join(', ') || '-'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Kun:</strong> {k.kunyomi?.join(', ') || '-'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* JISHO ONLINE (TIẾNG ANH) */}
            {results.jisho && results.jisho.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ExternalLink size={12}/> Jisho (English)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.jisho.map((item, i) => (
                    <div key={i} style={{ background: 'rgba(16,185,129,0.05)', padding: 10, borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {item.japanese[0].word || item.japanese[0].reading} 
                        {item.japanese[0].word && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginLeft: 6, fontWeight: 400 }}>{item.japanese[0].reading}</span>}
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {item.senses[0].english_definitions.map((def, j) => (
                          <li key={j}>{def}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {results.vocab.length === 0 && results.kanji.length === 0 && !results.jisho && (
              <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-tertiary)' }}>
                <Search size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontSize: '0.95rem' }}>Không tìm thấy từ vựng này trong cơ sở dữ liệu.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SelectionDictionary;

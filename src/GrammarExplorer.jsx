// v10.2.0 — Ngữ pháp JLPT toàn diện (2-Column Sticky Layout + Lazy Load + Advanced Search)
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';
import { Search, BookOpen, Info, AlertTriangle, Layers, List, ChevronRight } from 'lucide-react';
import FuriganaText from './components/FuriganaText';

const LEVELS = ['N5','N4','N3','N2','N1'];
const LEVEL_COLORS = { N5:'#10b981', N4:'#3b82f6', N3:'#f59e0b', N2:'#8b5cf6', N1:'#ef4444' };

const cleanText = (text) => text ? text.replace(/&nbsp;/g, ' ').replace(/<[^>]*>?/gm, '').trim() : '';

const GrammarCard = ({ g, onClick, isSelected }) => {
  return (
    <div 
      onClick={onClick} 
      style={{ 
        border: `1px solid ${isSelected ? LEVEL_COLORS[g.level] : 'var(--glass-border-strong)'}`, 
        borderLeft:`4px solid ${LEVEL_COLORS[g.level]}`, 
        borderRadius:10, 
        marginBottom:12, 
        overflow:'hidden', 
        background: isSelected ? 'var(--bg-active)' : 'var(--bg-card)', 
        boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
        cursor:'pointer',
        transition:'all 0.2s'
      }}
      onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'var(--bg-hover)'; } }}
      onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--bg-card)'; } }}
    >
      <div style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:'0.75rem', fontWeight:700, padding:'4px 10px', borderRadius:6, background:LEVEL_COLORS[g.level]+'22', color:LEVEL_COLORS[g.level], border:`1px solid ${LEVEL_COLORS[g.level]}44` }}>{g.level}</span>
          <span style={{ fontSize:'1.2rem', fontWeight:600, color:'var(--text-primary)' }} className="jp-text"><FuriganaText text={g.pattern} /></span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:'0.95rem', color:'var(--text-secondary)', fontWeight:500 }}>{g.meaning}</span>
          <div style={{ padding:6, background: isSelected ? LEVEL_COLORS[g.level] : 'var(--bg-active)', borderRadius:'50%', color: isSelected ? '#fff' : 'var(--accent-primary)', display:'flex' }}>
            <ChevronRight size={16}/>
          </div>
        </div>
      </div>
    </div>
  );
};

const GrammarDetailPanel = ({ g }) => {
  if (!g) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--glass-border-strong)', borderRadius: 16 }}>
      <BookOpen size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
      <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Chọn một điểm ngữ pháp để xem chi tiết</div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border-strong)', borderRadius: 16, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--glass-border)', display:'flex', alignItems:'center', gap:12, background:'var(--bg-elevated)', flexShrink:0 }}>
        <span style={{ fontSize:'0.8rem', fontWeight:700, padding:'4px 10px', borderRadius:6, background:LEVEL_COLORS[g.level]+'22', color:LEVEL_COLORS[g.level], border:`1px solid ${LEVEL_COLORS[g.level]}44` }}>{g.level}</span>
        <span style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--text-primary)' }} className="jp-text"><FuriganaText text={g.pattern} /></span>
      </div>

      {/* Content */}
      <div style={{ padding:'24px', overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:20 }}>
        <div style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--text-primary)', borderBottom:'2px solid var(--glass-border)', paddingBottom:12, marginBottom:4 }}>
          Ý nghĩa: <span style={{ color:'var(--accent-primary)' }}>{g.meaning}</span>
        </div>

        {g.explanation && (
          <div style={{ background:'rgba(59, 130, 246, 0.08)', border:'1px solid rgba(59, 130, 246, 0.2)', borderRadius:12, padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.85rem', color:'#3b82f6', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>
              <Info size={16}/> Giải thích chi tiết
            </div>
            <p style={{ fontSize:'0.95rem', color:'var(--text-primary)', lineHeight:1.6, margin:0 }}>{cleanText(g.explanation)}</p>
          </div>
        )}

        {(g.formation || (g.usage && g.usage !== "N/A")) && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:10, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>
              <Layers size={16}/> Cấu trúc ngữ pháp
            </div>
            <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--glass-border)', borderRadius:12, padding:16 }}>
              {g.formation ? (
                <ul style={{ margin:0, paddingLeft:20, color:'var(--text-primary)', display:'flex', flexDirection:'column', gap:10 }}>
                  {g.formation.map((form, i) => {
                    const cleaned = cleanText(form);
                    if (!cleaned) return null;
                    return (
                      <li key={i}><code className="jp-text" style={{ fontSize:'1.05rem', color:'var(--accent-primary)', background:'var(--bg-hover)', padding:'2px 6px', borderRadius:4, fontWeight:500 }}>{cleaned}</code></li>
                    );
                  })}
                </ul>
              ) : (
                <code className="jp-text" style={{ color:'var(--accent-primary)', fontSize:'1.1rem', background:'var(--bg-hover)', padding:'4px 8px', borderRadius:4, fontWeight:500 }}>{cleanText(g.usage)}</code>
              )}
            </div>
          </div>
        )}

        {g.examples && g.examples.length > 0 && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.85rem', color:'#10b981', marginBottom:12, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>
              <List size={16}/> Ví dụ minh họa
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {g.examples.map((ex, i) => {
                if (typeof ex === 'string') {
                  return (
                    <div key={i} style={{ background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:10, padding:16 }}>
                      <div className="jp-text" style={{ fontSize:'1.1rem', color:'var(--text-primary)' }}>• <FuriganaText text={cleanText(ex)} /></div>
                    </div>
                  );
                } else {
                  return (
                    <div key={i} style={{ background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:10, padding:16 }}>
                      <div className="jp-text" style={{ fontSize:'1.2rem', fontWeight:500, color:'var(--text-primary)', marginBottom:6 }}><FuriganaText text={cleanText(ex.jp)} /></div>
                      {ex.romaji && <div style={{ fontSize:'0.9rem', color:'var(--text-tertiary)', marginBottom:6, fontStyle:'italic' }}>{cleanText(ex.romaji)}</div>}
                      <div style={{ fontSize:'0.95rem', color:'var(--text-secondary)' }}>{cleanText(ex.vi)}</div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {g.note && (
          <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:16, marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.85rem', color:'#f59e0b', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>
              <AlertTriangle size={16}/> Lưu ý / Phân biệt
            </div>
            <p style={{ fontSize:'0.95rem', color:'var(--text-primary)', lineHeight:1.6, margin:0 }}>{cleanText(g.note)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GrammarExplorer = () => {
  const grammarData = useLiveQuery(() => db.grammar.toArray()) || [];
  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedGrammar, setSelectedGrammar] = useState(null);
  
  // Virtualization / Lazy Load
  const [visibleCount, setVisibleCount] = useState(50);
  const loadMoreRef = useRef(null);

  // Advanced Tokenized Search
  const filtered = useMemo(()=> grammarData.filter(g => {
    const matchLevel = selectedLevel === 'ALL' || g.level === selectedLevel;
    if (!matchLevel) return false;
    
    if (!query.trim()) return true;
    
    const qParts = query.toLowerCase().split(/\s+/).filter(Boolean);
    return qParts.every(q => 
      (g.pattern && g.pattern.toLowerCase().includes(q)) || 
      (g.meaning && g.meaning.toLowerCase().includes(q)) || 
      (g.explanation && g.explanation.toLowerCase().includes(q))
    );
  }), [query, selectedLevel, grammarData]);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(50);
  }, [query, selectedLevel]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filtered.length) {
        setVisibleCount(prev => prev + 50);
      }
    }, { threshold: 0.1 });
    
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 8px 0' }}>
          <BookOpen size={24} color="var(--accent-primary)"/> Tra cứu Ngữ pháp (Giáo trình Chuẩn)
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Hệ thống cấu trúc, giải thích ý nghĩa, phân biệt sắc thái và ví dụ song ngữ chi tiết từ N5 đến N1.
        </p>
      </div>

      {/* TOOLBAR */}
      <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap', flexShrink: 0 }}>
        <div style={{ position:'relative', flex:1, minWidth:250 }}>
          <Search size={18} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)' }}/>
          <input 
            value={query} 
            onChange={e=>setQuery(e.target.value)} 
            placeholder="Tìm kiếm đa trường (nhập nhiều từ khóa)..." 
            style={{ width:'100%', padding:'12px 14px 12px 42px', borderRadius:10, background:'var(--bg-surface)', border:'1px solid var(--glass-border-strong)', color:'var(--text-primary)', fontSize:'1rem', outline:'none', fontFamily:'inherit', boxShadow:'inset 0 2px 4px rgba(0,0,0,0.02)' }} 
          />
        </div>
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
          {['ALL',...LEVELS].map(l=>(
            <button 
              key={l} 
              onClick={()=>setSelectedLevel(l)} 
              style={{ 
                padding:'10px 18px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.9rem', 
                background: selectedLevel===l ? (LEVEL_COLORS[l]||'var(--accent-primary)') : 'var(--bg-elevated)', 
                color: selectedLevel===l ? 'white' : 'var(--text-secondary)', 
                transition:'all 0.2s', whiteSpace:'nowrap',
                boxShadow: selectedLevel===l ? `0 4px 12px ${LEVEL_COLORS[l]}44` : 'none'
              }}
            >
              {l === 'ALL' ? 'Tất cả' : l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:16, display:'flex', justifyContent:'space-between', flexShrink: 0 }}>
        <div>
          <BookOpen size={14} style={{ verticalAlign:'middle', marginRight:6, position:'relative', top:-1 }}/>
          Hiển thị <strong style={{color:'var(--text-primary)'}}>{filtered.length}</strong> / {grammarData.length} mẫu
        </div>
      </div>

      {/* 2-COLUMN LAYOUT (List Left, Sticky Detail Right) */}
      <div style={{ display: 'flex', gap: 24, flex: 1, overflow: 'hidden' }}>
        
        {/* LETS PANEL: Scrollable List */}
        <div style={{ flex: '1 1 40%', overflowY: 'auto', paddingRight: 8, paddingBottom: 60 }} className="custom-scrollbar">
          {filtered.length === 0
            ? <div className="glass-panel" style={{ textAlign:'center', padding:60, color:'var(--text-secondary)' }}>
                <Search size={48} style={{ opacity:0.2, margin:'0 auto 16px' }}/>
                <div style={{ fontSize:'1.1rem', fontWeight:500, color:'var(--text-primary)', marginBottom:8 }}>Không tìm thấy kết quả</div>
                <div>Thử tìm kiếm bằng từ khóa khác hoặc giảm bớt số lượng từ khóa.</div>
              </div>
            : filtered.slice(0, visibleCount).map(g => (
                <GrammarCard key={g.id} g={g} isSelected={selectedGrammar?.id === g.id} onClick={() => setSelectedGrammar(g)} />
              ))
          }
          {visibleCount < filtered.length && (
            <div ref={loadMoreRef} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              Đang tải thêm...
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Sticky Detail */}
        <div style={{ flex: '1 1 60%', height: '100%', position: 'sticky', top: 0 }}>
          <GrammarDetailPanel g={selectedGrammar} />
        </div>
      </div>

    </div>
  );
};

export default GrammarExplorer;

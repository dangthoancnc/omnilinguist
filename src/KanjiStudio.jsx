import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Edit3, RefreshCw, Eye, EyeOff, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Image, X, ThumbsUp, ThumbsDown, Minus, Filter } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';
import { reviewRoadmapCard, reviewFreeStudyCard, getCard, getDueCards, getStats, getUserProfile } from './studyStore.js';
import { Rating } from './fsrs.js';

import HanziWriter from 'hanzi-writer';

const CanvasDrawing = ({ kanji, showAnswer, onClearRef, onSnapshotRef }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const hasDrawing = pixels.some((v, i) => i % 4 === 3 && v > 0);
    if (!hasDrawing) return null;
    return canvas.toDataURL('image/png');
  };

  useEffect(() => {
    if (onClearRef) onClearRef.current = clearCanvas;
  }, [onClearRef]);

  useEffect(() => {
    if (onSnapshotRef) onSnapshotRef.current = getSnapshot;
  }, [onSnapshotRef]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div style={{ position: 'relative', width: 300, height: 300, background: 'rgba(0,0,0,0.5)', borderRadius: 12, border: '1px solid var(--glass-border)', overflow: 'hidden', touchAction: 'none' }}>
      {/* Grid guide */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', borderTop: '1px dashed rgba(255,255,255,0.15)' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', height: '100%', borderLeft: '1px dashed rgba(255,255,255,0.15)' }} />
      </div>
      
      {showAnswer && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.35, pointerEvents: 'none', zIndex: 1 }}>
          <div className="jp-text" style={{ fontSize: '12rem', color: '#10b981', lineHeight: 1 }}>{kanji}</div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair', position: 'relative', zIndex: 2 }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
};

const KanjiWriterComponent = ({ kanji, showAnswer, onScoreUpdate }) => {
  const containerRef = useRef(null);
  const writerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy old writer if exists
    if (writerRef.current) {
      containerRef.current.innerHTML = '';
    }

    writerRef.current = HanziWriter.create(containerRef.current, kanji, {
      width: 300,
      height: 300,
      padding: 10,
      showOutline: true,
      strokeAnimationSpeed: 1.5,
      delayBetweenStrokes: 100,
      radicalColor: '#10b981', // Highlight radical
      charDataLoader: (char, onComplete, onError) => {
        // Fetch Japanese stroke data from CDN to keep app offline-first eventually or cached
        fetch(`https://cdn.jsdelivr.net/npm/@k1low/hanzi-writer-data-jp@0.7.0/data/${char}.json`)
          .then(res => res.json())
          .then(onComplete)
          .catch(() => {
            // Fallback to Chinese hanzi if Japanese one is missing (very rare)
            fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${char}.json`)
              .then(res => res.json())
              .then(onComplete)
              .catch(onError);
          });
      }
    });

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [kanji]);

  // Handle Quiz Mode (Practice)
  const startQuiz = () => {
    if (!writerRef.current) return;
    writerRef.current.quiz({
      onMistake: (strokeData) => {
        if (onScoreUpdate) onScoreUpdate('mistake', strokeData);
      },
      onComplete: (summaryData) => {
        if (onScoreUpdate) onScoreUpdate('complete', summaryData);
      }
    });
  };

  const animate = () => {
    if (writerRef.current) {
      writerRef.current.animateCharacter();
    }
  };

  // Automatically start quiz if showAnswer is false, else show the character
  useEffect(() => {
    if (!writerRef.current) return;
    if (showAnswer) {
      writerRef.current.cancelQuiz();
      writerRef.current.showOutline();
      writerRef.current.showCharacter();
    } else {
      writerRef.current.hideCharacter();
      writerRef.current.hideOutline(); // Mặc định tự viết không nhìn nét mờ
      startQuiz();
    }
  }, [showAnswer, kanji]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div 
        ref={containerRef} 
        style={{ 
          background: 'rgba(0,0,0,0.5)', 
          borderRadius: 12, 
          border: '1px solid var(--glass-border)',
          width: 300, height: 300,
          position: 'relative'
        }}
      >
        {/* Grid guide */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', borderRadius: 12 }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', borderTop: '1px dashed rgba(255,255,255,0.15)' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', height: '100%', borderLeft: '1px dashed rgba(255,255,255,0.15)' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, width: '100%', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" style={{ flex: '1 1 100%', padding: '8px' }} onClick={() => { writerRef.current?.showOutline(); animate(); }}>
          <RefreshCw size={14}/> Mô phỏng vẽ nét
        </button>
        <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }} onClick={() => { writerRef.current?.showOutline(); startQuiz(); }}>
          <Edit3 size={14}/> Đồ theo nét mờ
        </button>
        <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }} onClick={() => { writerRef.current?.hideOutline(); startQuiz(); }}>
          <Edit3 size={14}/> Tự viết (Mù)
        </button>
      </div>
    </div>
  );
};

// --- Session Review Modal ---
const SessionReview = ({ sessionLog, onClose, onGrade }) => {
  if (!sessionLog.length) return null;
  const graded = sessionLog.filter(e => e.grade);
  const good = graded.filter(e => e.grade === 'good').length;
  const ok = graded.filter(e => e.grade === 'ok').length;
  const bad = graded.filter(e => e.grade === 'bad').length;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', overflowY: 'auto', padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: 'white', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image size={24} color="#3b82f6"/> セッション復習 (Xem lại phiên luyện tập)
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={16}/> Đóng
          </button>
        </div>

        {graded.length > 0 && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.15)', textAlign: 'center', color: '#6ee7b7' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{good}</div>
              <div style={{ fontSize: '0.8rem' }}>Tốt ✓</div>
            </div>
            <div style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(234,179,8,0.15)', textAlign: 'center', color: '#fbbf24' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{ok}</div>
              <div style={{ fontSize: '0.8rem' }}>Tạm ～</div>
            </div>
            <div style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.15)', textAlign: 'center', color: '#fca5a5' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{bad}</div>
              <div style={{ fontSize: '0.8rem' }}>Sai ✗</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {sessionLog.map((entry, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12, border: `1px solid ${entry.grade === 'good' ? 'rgba(16,185,129,0.4)' : entry.grade === 'bad' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                {/* User drawing */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Bạn vẽ</div>
                  <img src={entry.snapshot} alt="drawing" style={{ width: '100%', maxWidth: 110, borderRadius: 8, background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)' }}/>
                </div>
                {/* Correct answer */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Đáp án</div>
                  <div style={{ width: '100%', maxWidth: 110, aspectRatio: '1', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                    <span className="jp-text" style={{ fontSize: '3.5rem', color: 'white' }}>{entry.kanji}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, textAlign: 'center' }}>
                {entry.meanings}
              </div>
              {/* Self-grade buttons */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => onGrade(i, 'good')} style={{ flex: 1, padding: '6px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8rem', background: entry.grade === 'good' ? '#10b981' : 'rgba(16,185,129,0.15)', color: entry.grade === 'good' ? 'white' : '#6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <ThumbsUp size={13}/> Tốt
                </button>
                <button onClick={() => onGrade(i, 'ok')} style={{ flex: 1, padding: '6px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8rem', background: entry.grade === 'ok' ? '#eab308' : 'rgba(234,179,8,0.15)', color: entry.grade === 'ok' ? 'white' : '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Minus size={13}/> Tạm
                </button>
                <button onClick={() => onGrade(i, 'bad')} style={{ flex: 1, padding: '6px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8rem', background: entry.grade === 'bad' ? '#ef4444' : 'rgba(239,68,68,0.15)', color: entry.grade === 'bad' ? 'white' : '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <ThumbsDown size={13}/> Sai
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const LEVEL_COLORS = { N5:'#10b981', N4:'#3b82f6', N3:'#f59e0b', N2:'#8b5cf6', N1:'#ef4444' };

const KanjiStudio = () => {
  const kanjiData = useLiveQuery(() => db.kanji.toArray()) || [];
  const [level, setLevel] = useState(() => {
    const p = getUserProfile();
    return p?.currentLevel || 'N5';
  });
  const [learningMode, setLearningMode] = useState('roadmap'); // 'roadmap' | 'freestudy'
  const [kanjiList, setKanjiList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [scoreMessage, setScoreMessage] = useState(null);
  const [isStrict, setIsStrict] = useState(false);
  const [sessionLog, setSessionLog] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [hideListDetails, setHideListDetails] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [stats, setStats] = useState({ newCount:0, dueCount:0, learnedCount:0, total:0 });
  
  const clearCanvasRef = useRef(null);
  const snapshotRef = useRef(null);

  const kanjiByLevel = useMemo(() => {
    const counts = { N5:0, N4:0, N3:0, N2:0, N1:0 };
    kanjiData.forEach(k => { if(counts[k.level] !== undefined) counts[k.level]++; });
    return counts;
  }, [kanjiData]);

  const levelKanji = useMemo(() => kanjiData.filter(k => k.level === level), [kanjiData, level]);
  const allFsrsIds = useMemo(() => levelKanji.map(k => `kanji_${k.id}`), [levelKanji]);

  const refreshStats = () => setStats(getStats(allFsrsIds));

  const buildQueue = () => {
    refreshStats();
    let fsrsIds;
    if (filterMode === 'due') {
      fsrsIds = getDueCards(allFsrsIds);
    } else if (filterMode === 'again') {
      fsrsIds = allFsrsIds.filter(id => { const c = getCard(id); return c && c.last_rating === Rating.Again; });
    } else if (filterMode === 'hard') {
      fsrsIds = allFsrsIds.filter(id => { const c = getCard(id); return c && c.last_rating === Rating.Hard; });
    } else {
      const dueSet = new Set(getDueCards(allFsrsIds));
      fsrsIds = allFsrsIds.filter(id => {
        const card = getCard(id);
        if (!card) return true;
        if (dueSet.has(id)) return true;
        return false;
      });
      // limit to 50 for performance and goal setting
      fsrsIds = fsrsIds.slice(0, 50);
    }

    const dueSet = new Set(getDueCards(allFsrsIds));
    const sorted = [...fsrsIds].sort((a, b) => {
      const aD = dueSet.has(a) ? 0 : 1;
      const bD = dueSet.has(b) ? 0 : 1;
      return aD - bD;
    });

    const queueKanji = sorted.map(fsrsId => {
      const rawId = fsrsId.replace('kanji_', '');
      return levelKanji.find(k => String(k.id) === rawId);
    }).filter(Boolean);

    setKanjiList(queueKanji);
    setCurrentIndex(0);
    setShowAnswer(false);
    setScoreMessage(null);
    setSessionLog([]);
    if (clearCanvasRef.current) clearCanvasRef.current();
  };

  useEffect(() => {
    if (levelKanji.length > 0) buildQueue();
  }, [levelKanji, filterMode]);

  const currentKanji = kanjiList[currentIndex];

  const captureSnapshot = () => {
    if (isStrict || !currentKanji) return;
    const snapshot = snapshotRef.current && snapshotRef.current();
    if (snapshot) {
      setSessionLog(prev => [...prev, {
        id: currentKanji.id,
        kanji: currentKanji.kanji,
        meanings: currentKanji.meanings.join(', '),
        snapshot,
        grade: null
      }]);
    }
  };

  const handlePrev = () => {
    captureSnapshot();
    setCurrentIndex(i => (i - 1 + kanjiList.length) % kanjiList.length);
    setShowAnswer(false);
    setScoreMessage(null);
    if (clearCanvasRef.current) clearCanvasRef.current();
  };

  const handleNext = () => {
    captureSnapshot();
    setCurrentIndex(i => (i + 1) % kanjiList.length);
    setShowAnswer(false);
    setScoreMessage(null);
    if (clearCanvasRef.current) clearCanvasRef.current();
  };

  const handleGrade = (index, grade) => {
    setSessionLog(prev => prev.map((e, i) => i === index ? { ...e, grade } : e));
    
    const logEntry = sessionLog[index];
    if (logEntry && logEntry.id) {
      if (learningMode === 'roadmap') {
        const ratingMap = { good: Rating.Good, ok: Rating.Hard, bad: Rating.Again };
        if (ratingMap[grade]) {
          reviewRoadmapCard(`kanji_${logEntry.id}`, ratingMap[grade]);
        }
      } else {
        const isCorrect = grade === 'good' || grade === 'ok';
        reviewFreeStudyCard(`kanji_${logEntry.id}`, isCorrect, 'kanji');
      }
    }
  };

  const handleScoreUpdate = (type, data) => {
    if (type === 'mistake') {
      setScoreMessage({ type: 'error', text: `Sai nét! Còn ${data.totalMistakes} lỗi.` });
    } else if (type === 'complete') {
      setScoreMessage({ type: 'success', text: `Tuyệt vời! Hoàn thành với ${data.totalMistakes} lỗi.` });
    }
  };

  if (!currentKanji && kanjiList.length === 0) {
    return (
      <div style={{ padding: '20px 40px', maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        {/* Top Level Bar */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
          {LEVELS.map(lvl => (
            <button 
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                const p = getUserProfile();
                if (p && p.currentLevel === lvl) setLearningMode('roadmap');
                else setLearningMode('freestudy');
              }}
              className={`btn ${level === lvl ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 18px', fontSize: '0.9rem', fontWeight: 700 }}
            >
              {lvl} ({kanjiByLevel[lvl] || 0})
            </button>
          ))}
        </div>

        <div className="glass-panel" style={{ padding: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {levelKanji.length > 0 ? (
            <>
              <CheckCircle2 size={60} color="#10b981" style={{ marginBottom:20 }}/>
              <h2 style={{ marginBottom:10, color:'#10b981' }}>Tuyệt vời!</h2>
              <p style={{ color:'var(--text-secondary)', marginBottom:30 }}>Không còn chữ Kanji nào cần ôn tập trong mục {filterMode} cho cấp độ {level}.</p>
              <button className="btn btn-primary" onClick={() => setFilterMode('all')} style={{ padding:'12px 24px' }}>
                Quay lại chế độ Thường
              </button>
            </>
          ) : (
            <>
              <RefreshCw size={50} color="#3b82f6" style={{ marginBottom:20, animation: 'spin 2s linear infinite' }}/>
              <h2 style={{ marginBottom:10, color:'white' }}>Đang nạp dữ liệu Kanji cấp độ {level}...</h2>
              <p style={{ color:'var(--text-secondary)', marginBottom:30 }}>Nếu danh sách trống, bạn có thể chuyển sang cấp độ khác hoặc bấm nạp lại bên dưới.</p>
              <button className="btn btn-primary" onClick={() => buildQueue()} style={{ padding:'12px 24px' }}>
                🔄 Nạp lại dữ liệu Kanji {level}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 40px', maxWidth: 1600, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      
      {/* Top Stats Bar */}
      <div style={{ display:'flex', gap:12, padding:'10px 14px', background:'rgba(0,0,0,0.2)', borderRadius:8, marginBottom:16, fontSize:'0.85rem', flexWrap: 'wrap' }}>
        <span style={{ color:'#60a5fa' }}>Mới: <strong>{stats.newCount}</strong></span>
        <span style={{ color:'#f59e0b' }}>Đến hạn: <strong>{stats.dueCount}</strong></span>
        <span style={{ color:'#10b981' }}>Đã học: <strong>{stats.learnedCount}</strong></span>
        <span style={{ color:'var(--text-secondary)', marginLeft:'auto' }}>Tổng: {stats.total}</span>
      </div>
      
      {/* Header Controls */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:14 }}>
        <div style={{ display:'flex', gap:8, alignItems: 'center' }}>
          <select 
            value={level} 
            onChange={(e)=>{
              setLevel(e.target.value);
              const p = getUserProfile();
              if (p && p.currentLevel === e.target.value) setLearningMode('roadmap');
              else setLearningMode('freestudy');
            }} 
            style={{ padding:'8px 16px', borderRadius:8, background: LEVEL_COLORS[level] || '#6366f1', border:'none', color:'white', fontWeight:700, outline:'none', cursor:'pointer', boxShadow:`0 4px 12px ${(LEVEL_COLORS[level]||'#6366f1')}55` }}
          >
            {LEVELS.map(l => <option key={l} value={l} style={{ background: '#1e293b' }}>Thẻ {l} ({kanjiByLevel[l] || 0})</option>)}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 20 }}>
            <span style={{ fontSize: '0.85rem', color: isStrict ? 'var(--text-secondary)' : '#6ee7b7' }}>Tự do (Dễ)</span>
            <button 
              onClick={() => setIsStrict(!isStrict)}
              style={{
                width: 44, height: 24, borderRadius: 12, background: isStrict ? '#ef4444' : '#10b981',
                position: 'relative', border: 'none', cursor: 'pointer', transition: '0.3s'
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 2, left: isStrict ? 22 : 2, transition: '0.3s'
              }}/>
            </button>
            <span style={{ fontSize: '0.85rem', color: isStrict ? '#fca5a5' : 'var(--text-secondary)' }}>Bắt lỗi nét (Khó)</span>
          </div>

          <select 
            value={filterMode} 
            onChange={(e) => setFilterMode(e.target.value)}
            style={{ padding:'8px 16px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid var(--glass-border)', color:'white', outline:'none', cursor:'pointer' }}
          >
            <option value="all">Tất cả (Mặc định)</option>
            <option value="due">⏰ Đến hạn ôn tập ({stats.dueCount})</option>
            <option value="again">❌ Hay làm sai</option>
            <option value="hard">⚠️ Thấy khó</option>
          </select>
        </div>

        <div style={{ display:'flex', alignItems:'center', flexWrap: 'wrap', gap:16 }}>
          {sessionLog.length > 0 && (
            <button 
              className="btn btn-outline" 
              style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)' }}
              onClick={() => setShowReview(true)}
            >
              <Image size={16}/> Xem lại lịch sử vẽ ({sessionLog.length})
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', flex: 1, minHeight: 0 }}>
        
        {/* LEFT COLUMN: MAIN WORKSPACE */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 320, minHeight: 0 }}>
           <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '40px 20px', flex: 1, overflowY: 'auto' }}>
              
              {/* Meaning & Readings */}
              <div style={{ width: '100%', maxWidth: 500, textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  Hãy viết Kanji có nghĩa sau:
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-primary)', lineHeight: 1.4 }}>
                  {currentKanji.meanings.join(', ')}
                </div>
                {currentKanji.vi_meanings && (
                  <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {currentKanji.vi_meanings.join(', ')}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, marginTop: 24, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>ON:</span>
                    <div className="jp-text" style={{ fontSize: '1.15rem', marginTop: 4 }}>
                      {currentKanji.onyomi.join('、 ') || '---'}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>KUN:</span>
                    <div className="jp-text" style={{ fontSize: '1.15rem', marginTop: 4 }}>
                      {currentKanji.kunyomi.join('、 ') || '---'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Canvas Workspace */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                {isStrict ? (
                  <KanjiWriterComponent 
                    kanji={currentKanji.kanji} 
                    showAnswer={showAnswer} 
                    onScoreUpdate={handleScoreUpdate}
                  />
                ) : (
                  <CanvasDrawing kanji={currentKanji.kanji} showAnswer={showAnswer} onClearRef={clearCanvasRef} onSnapshotRef={snapshotRef} />
                )}

                {scoreMessage && isStrict && (
                  <div style={{ 
                    padding: '8px 16px', borderRadius: 8, width: '100%', maxWidth: 300, textAlign: 'center', fontSize: '0.9rem',
                    background: scoreMessage.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    color: scoreMessage.type === 'error' ? '#fca5a5' : '#6ee7b7',
                    border: `1px solid ${scoreMessage.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
                  }}>
                    {scoreMessage.text}
                  </div>
                )}
              </div>
           </div>

           {/* Bottom Controls */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Top Row: Erase / Show Answer */}
              <div style={{ display: 'flex', gap: 10 }}>
                {!isStrict && (
                  <button className="btn btn-outline" style={{ flex: 1, padding: '12px' }} onClick={() => clearCanvasRef.current && clearCanvasRef.current()}>
                    <RefreshCw size={18}/> Xóa vẽ lại
                  </button>
                )}
                <button className="btn btn-outline" style={{ flex: 1, padding: '12px', background: showAnswer ? 'rgba(59,130,246,0.1)' : 'transparent', color: showAnswer ? '#93c5fd' : 'var(--text-primary)', border: showAnswer ? '1px solid rgba(59,130,246,0.3)' : '' }} onClick={() => setShowAnswer(!showAnswer)}>
                  <Eye size={18}/> {showAnswer ? 'Đang hiển thị đối chiếu' : 'Xem đáp án đối chiếu'}
                </button>
              </div>

              {/* Bottom Row: Prev / Next */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-outline" style={{ padding:'12px 20px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={handlePrev}>
                  <ChevronLeft size={18}/> <span style={{ fontSize: '0.9rem' }} className="mobile-hide">Từ trước</span>
                </button>
                
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{currentIndex + 1} / {kanjiList.length}</span>

                <button className="btn btn-primary" style={{ padding:'12px 20px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleNext}>
                  <span style={{ fontSize: '0.9rem' }} className="mobile-hide">Từ tiếp</span> <ChevronRight size={18}/>
                </button>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: List View */}
        <div className="glass-panel" style={{ flex: '1 1 300px', maxWidth: 400, minWidth: 280, padding: 20, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Danh sách chữ ({kanjiList.length})</span>
            <button 
              onClick={() => setHideListDetails(!hideListDetails)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: hideListDetails ? 'var(--text-secondary)' : '#3b82f6', display: 'flex', alignItems: 'center', padding: 4 }}
              title={hideListDetails ? "Hiển thị chữ Kanji" : "Ẩn chữ Kanji"}
            >
              {hideListDetails ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto', paddingRight: 6 }} className="custom-scrollbar">
            {kanjiList.map((k, index) => (
              <div 
                key={k.id} 
                onClick={() => { captureSnapshot(); setCurrentIndex(index); setShowAnswer(false); setScoreMessage(null); if (clearCanvasRef.current) clearCanvasRef.current(); }} 
                style={{ 
                  padding: '12px 16px', borderRadius: 10, 
                  background: currentIndex === index ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', 
                  border: currentIndex === index ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent', 
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: 12, alignItems: 'center'
                }}
              >
                 <div className="jp-text" style={{ fontSize: '1.8rem', fontWeight: 700, color: currentIndex === index ? '#818cf8' : 'var(--text-primary)', filter: (!hideListDetails || currentIndex === index) ? 'none' : 'blur(5px)', opacity: (!hideListDetails || currentIndex === index) ? 1 : 0.6, transition: 'all 0.3s' }}>
                   {k.kanji}
                 </div>
                 <div style={{ flex: 1, minWidth: 0 }}>
                   <div style={{ fontSize: '0.95rem', fontWeight: 600, color: currentIndex === index ? 'white' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                     {k.meanings[0]}
                   </div>
                   {k.vi_meanings && (
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                       {k.vi_meanings[0]}
                     </div>
                   )}
                 </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showReview && (
        <SessionReview 
          sessionLog={sessionLog} 
          onClose={() => setShowReview(false)} 
          onGrade={handleGrade}
        />
      )}
    </div>
  );
};

export default KanjiStudio;

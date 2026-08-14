import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';
import { Rating } from './fsrs.js';
import { getCard, reviewRoadmapCard, reviewFreeStudyCard, getDueCards, getStats, getNextDueInfo, getCustomCards, isBookmarked, toggleBookmark, getUserProfile, getFreeStudyHistory } from './studyStore.js';
import { syncMasterData } from './syncMasterData.js';
import { Eye, EyeOff, Volume2, ChevronLeft, ChevronRight, Brain, CheckCircle2, AlertCircle, RotateCcw, Target, Bookmark, Filter, Shuffle, ListOrdered, Zap, BookOpen, List, X, Settings, FastForward, Play, Pause, Hand, UserPlus } from 'lucide-react';
import FuriganaText from './components/FuriganaText';
import localMasterDb from './data/jlpt_master_db.json';
import { isGuest, checkGuestQuota } from './identityManager.js';

const LEVELS = ['N5','N4','N3','N2','N1'];
const LEVEL_COLORS = { N5:'#10b981', N4:'#3b82f6', N3:'#f59e0b', N2:'#8b5cf6', N1:'#ef4444' };

const speak = (t) => {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t);
  u.lang = 'ja-JP'; u.rate = 0.82;
  window.speechSynthesis.speak(u);
};

const StatsBar = ({ stats, levelColor }) => (
  <div style={{ display:'flex', gap:12, padding:'10px 14px', background:'rgba(0,0,0,0.2)', borderRadius:8, marginBottom:16, fontSize:'0.83rem' }}>
    <span style={{ color:'#60a5fa' }}>📘 Mới: <strong>{stats.newCount}</strong></span>
    <span style={{ color:'#f59e0b' }}>⏰ Đến hạn: <strong>{stats.dueCount}</strong></span>
    <span style={{ color:'#10b981' }}>✅ Đã học: <strong>{stats.learnedCount}</strong></span>
    <span style={{ color:'var(--text-secondary)', marginLeft:'auto' }}>Tổng: {stats.total}</span>
  </div>
);

const VocabularyFlashcards = () => {
  const location = useLocation();
  const vocabData = useLiveQuery(() => db.vocab.toArray()) || [];
  const [level, setLevel] = useState(() => {
    if (location.state?.level) return location.state.level;
    const p = getUserProfile();
    return p?.goal || p?.targetLevel || p?.currentLevel || 'N3';
  });

  useEffect(() => {
    if (location.state?.level) {
      setLevel(location.state.level);
    }
  }, [location.state]);

  const [learningMode, setLearningMode] = useState(() => isGuest() ? 'freestudy' : 'roadmap'); // Guest luôn mặc định Học Tự Do
  const [filterMode, setFilterMode] = useState('all');
  const [autoPlay, setAutoPlay] = useState(() => localStorage.getItem('omni_flashcards_autoplay') !== 'false');
  
  // revealMode: 'on_rating' (Lật xem đáp án sau khi bấm đánh giá) | 'always' (Luôn hiển thị sẵn đáp án khi mở thẻ mới)
  const [revealMode, setRevealMode] = useState(() => {
    const saved = localStorage.getItem('omni_flashcards_reveal_mode');
    if (saved) return saved;
    if (localStorage.getItem('omni_flashcards_autoflip_next') === 'true') return 'always';
    return 'on_rating'; // Mặc định: Lật đáp án khi bấm Đánh Giá để xem lại kết quả
  });

  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(() => {
    const d = localStorage.getItem('omni_flashcards_delay');
    return d !== null ? Number(d) : 1000; // 1s mặc định để xem lại đáp án
  });
  const [isManualNextReady, setIsManualNextReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const advanceTimerRef = useRef(null);

  const updateAutoPlay = (val) => {
    setAutoPlay(val);
    localStorage.setItem('omni_flashcards_autoplay', String(val));
  };
  const updateRevealMode = (mode) => {
    setRevealMode(mode);
    localStorage.setItem('omni_flashcards_reveal_mode', mode);
  };
  const updateAutoAdvanceDelay = (val) => {
    setAutoAdvanceDelay(val);
    localStorage.setItem('omni_flashcards_delay', String(val));
  };
  
  const [queue, setQueue] = useState([]);
  const [queueIdx, setQueueIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastRating, setLastRating] = useState(null);
  const [stats, setStats] = useState({ newCount:0, dueCount:0, learnedCount:0, total:0 });
  const [sessionLog, setSessionLog] = useState({ easy:0, hard:0, again:0 });
  const [hideListDetails, setHideListDetails] = useState(true);
  
  const [studyMode, setStudyMode] = useState('fsrs');
  const [isRandom, setIsRandom] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizAnswered, setQuizAnswered] = useState(null);
  const [visibleCount, setVisibleCount] = useState(30);
  const hasTriedRepair = useRef(false);

  // === P0-2 FIX: Auto-repair với double guard (ref + localStorage) để chặn vòng lặp vô hạn ===
  // Nếu IndexedDB chưa đạt 10,000 từ vựng, force re-sync MỘT LẦN DUY NHẤT
  useEffect(() => {
    if (vocabData.length > 0 && vocabData.length < 10000 && !hasTriedRepair.current) {
      // Guard 1: ref chặn chạy lại trong cùng 1 session
      hasTriedRepair.current = true;
      // Guard 2: localStorage chặn chạy lại sau page reload
      const repairKey = 'omni_vocab_repaired';
      const lastRepair = localStorage.getItem(repairKey);
      if (lastRepair) {
        const elapsed = Date.now() - parseInt(lastRepair, 10);
        // Chỉ cho phép repair lại sau 24 giờ
        if (elapsed < 24 * 60 * 60 * 1000) {
          console.log(`ℹ️ Auto-repair đã chạy ${Math.round(elapsed/60000)} phút trước. Bỏ qua.`);
          return;
        }
      }
      console.warn(`⚠️ IndexedDB đang có ${vocabData.length}/10000 từ vựng — đang tự động nâng cấp...`);
      localStorage.setItem(repairKey, Date.now().toString());
      db.vocab.clear().then(() => db.kanji.clear()).then(() => {
        return syncMasterData();
      }).then(() => {
        console.log('✅ Auto-repair hoàn tất! 10,000 từ vựng đã được nạp.');
      }).catch((err) => {
        console.error('❌ Auto-repair thất bại:', err);
      });
    }
  }, [vocabData.length]);

  const levelVocab = useMemo(() => {
    const customCards = getCustomCards();
    const seen = new Set();
    // THUẦN DỮ LIỆU TRỰC TIẾP: Sử dụng trực tiếp dữ liệu 10,000 từ nếu IndexedDB đang trống hoặc chưa nạp xong
    const masterVocab = (localMasterDb.vocabulary || []).map((v, i) => ({
      id: v.id || `v_${i}`,
      level: v.level || 'N3',
      word: v.word,
      reading: v.reading || '',
      vi: v.vi || v.meaning || '',
      meaning: v.vi || v.meaning || '',
      type: v.type || (Array.isArray(v.tags) ? v.tags[0] : 'Từ vựng'),
      tags: v.tags || [],
      examples: v.examples || v.example || []
    }));
    const effectiveVocab = vocabData.length >= 50 ? vocabData : masterVocab;
    const allSources = [...effectiveVocab, ...customCards];
    
    return allSources.filter(v => {
      if (v.level !== level) return false;
      if (seen.has(v.word)) return false;
      seen.add(v.word);
      return true;
    });
  }, [level, vocabData]);

  // Calculate total vocab count per level for dropdown labels
  const vocabLevelCounts = useMemo(() => {
    const counts = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
    const customCards = getCustomCards();
    const effectiveVocab = vocabData.length >= 50 ? vocabData : (localMasterDb.vocabulary || []);
    [...effectiveVocab, ...customCards].forEach(v => {
      const lvl = (v.level || 'N3').toUpperCase();
      if (counts[lvl] !== undefined) counts[lvl]++;
    });
    return counts;
  }, [vocabData]);

  const allIds = useMemo(() => levelVocab.map(v => v.id), [levelVocab]);
  const refreshStats = () => setStats(getStats(allIds, learningMode));

  const buildQueue = () => {
    refreshStats();
    let ids;
    if (filterMode === 'due') {
      ids = getDueCards(allIds);
      if (ids.length === 0 && allIds.length > 0) {
        // Fallback for due mode if no due cards: shuffle all level cards for free review
        ids = [...allIds].sort(() => 0.5 - Math.random()).slice(0, 30);
      }
    } else if (filterMode === 'bookmark') {
      ids = allIds.filter(id => isBookmarked(id));
    } else if (filterMode === 'again') {
      ids = allIds.filter(id => { const c = getCard(id); return c && c.last_rating === Rating.Again; });
    } else if (filterMode === 'hard') {
      ids = allIds.filter(id => { const c = getCard(id); return c && c.last_rating === Rating.Hard; });
    } else {
      const dueSet = new Set(getDueCards(allIds));
      ids = allIds.filter(id => {
        const card = getCard(id);
        if (!card) return true;
        if (dueSet.has(id)) return true;
        return false;
      });
      // ⚡ LINH HOẠT HỌC TỰ DO: Nếu hết từ mới/đến hạn, tự động xáo trộn 30 từ của cấp độ này để luyện tập tự do
      if (ids.length === 0 && allIds.length > 0) {
        ids = [...allIds].sort(() => 0.5 - Math.random()).slice(0, 30);
      } else {
        ids = ids.slice(0, 30);
      }
    }
    
    let finalQueue;
    if (isRandom) {
      finalQueue = [...ids];
      for (let i = finalQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalQueue[i], finalQueue[j]] = [finalQueue[j], finalQueue[i]];
      }
    } else {
      const dueSet = new Set(getDueCards(allIds));
      finalQueue = [...ids].sort((a, b) => {
        const aD = dueSet.has(a) ? 0 : 1;
        const bD = dueSet.has(b) ? 0 : 1;
        return aD - bD;
      });
    }

    setQueue(finalQueue);
    setQueueIdx(0);
    setShowAnswer(false);
    setLastRating(null);
    setQuizAnswered(null);
    setVisibleCount(30);
  };

  useEffect(() => { buildQueue(); }, [level, levelVocab, filterMode, isRandom, learningMode]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const currentId = queue[queueIdx];
  const currentCard = levelVocab.find(v => v.id === currentId);
  const fsrsCard = currentId ? getCard(currentId) : null;
  const nextDue = currentId ? getNextDueInfo(currentId) : null;

  useEffect(() => {
    if (studyMode === 'quiz' && currentCard && levelVocab.length > 3) {
      const correctVi = currentCard.vi;
      const wrongCards = [...levelVocab].filter(v => v.id !== currentId).sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [correctVi, ...wrongCards.map(c => c.vi)].sort(() => 0.5 - Math.random());
      setQuizOptions(options);
      setQuizAnswered(null);
    }
  }, [currentId, studyMode, levelVocab]);

  // Xóa bỏ useEffect tự đọc khi mở tab (chỉ đọc khi có thao tác Lật thẻ/Next/Lùi của người dùng)

  const [sessionHistory, setSessionHistory] = useState([]);
  const [showSessionReview, setShowSessionReview] = useState(false);

  const advanceToNextCard = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setShowAnswer(revealMode === 'always');
    setLastRating(null);
    setQuizAnswered(null);
    setIsManualNextReady(false);
    if (queueIdx < queue.length - 1) {
      const nextIdx = queueIdx + 1;
      setQueueIdx(nextIdx);
      if (autoPlay) {
        const nextId = queue[nextIdx];
        const nextCard = levelVocab.find(v => v.id === nextId);
        if (nextCard) speak(nextCard.word);
      }
    } else {
      setQueue([]);
    }
  };

  const handlePrev = () => {
    if (queue.length === 0) return;
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setShowAnswer(revealMode === 'always');
    setLastRating(null);
    setQuizAnswered(null);
    setIsManualNextReady(false);
    const prevIdx = (queueIdx - 1 + queue.length) % queue.length;
    setQueueIdx(prevIdx);
    if (autoPlay) {
      const prevId = queue[prevIdx];
      const prevCard = levelVocab.find(v => v.id === prevId);
      if (prevCard) speak(prevCard.word);
    }
  };

  const handleRating = (rating) => {
    if (!currentId || !currentCard) return;
    
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    if (learningMode === 'roadmap') {
      reviewRoadmapCard(currentId, rating);
    } else {
      const isCorrect = (rating === Rating.Good || rating === Rating.Easy);
      reviewFreeStudyCard(currentId, isCorrect, 'vocab');
    }
    
    setLastRating(rating);

    // Nếu đang ở chế độ 'on_rating', tự động lật đáp án ngay khi vừa bấm trả lời để xem lại
    if (revealMode === 'on_rating') {
      setShowAnswer(true);
    }
    
    // Save to session history
    setSessionHistory(prev => {
      const exists = prev.find(p => p.id === currentCard.id);
      if (exists) return prev;
      return [...prev, { ...currentCard, rating, timestamp: Date.now() }];
    });

    setSessionLog(s => ({
      ...s,
      again: s.again + (rating === Rating.Again ? 1 : 0),
      hard: s.hard + (rating === Rating.Hard ? 1 : 0),
      easy: s.easy + (rating === Rating.Good || rating === Rating.Easy ? 1 : 0),
    }));

    refreshStats();

    if (autoAdvanceDelay === -1) {
      setIsManualNextReady(true);
    } else {
      advanceTimerRef.current = setTimeout(() => {
        advanceToNextCard();
      }, autoAdvanceDelay);
    }
  };

  // Derive studied cards in current level from FSRS store if sessionHistory is empty
  const studiedCardsInLevel = useMemo(() => {
    const freeStudyHist = getFreeStudyHistory();
    return levelVocab.filter(v => {
      const card = getCard(v.id);
      const fsHist = freeStudyHist[v.id];
      if (learningMode === 'freestudy') {
        return fsHist && (fsHist.correct > 0 || fsHist.incorrect > 0);
      }
      return card && card.repetition > 0;
    });
  }, [levelVocab, sessionHistory, learningMode, stats]);

  const effectiveReviewList = sessionHistory.length > 0 ? sessionHistory : studiedCardsInLevel;

  // Re-study current batch cards or all studied cards
  const handleRestudyCurrentBatch = () => {
    if (effectiveReviewList.length > 0) {
      setQueue(effectiveReviewList.map(c => c.id));
      setQueueIdx(0);
      setShowAnswer(false);
    } else {
      buildQueue();
    }
  };

  // Load next 25 new cards batch
  const handleLoadNextNewBatch = () => {
    const freeStudyHist = getFreeStudyHistory();
    const unlearned = levelVocab.filter(v => {
      if (learningMode === 'freestudy') {
        const fsHist = freeStudyHist[v.id];
        return !fsHist || (fsHist.correct === 0 && fsHist.incorrect === 0);
      }
      const card = getCard(v.id);
      return !card || card.repetition === 0;
    }).slice(0, 25);

    if (unlearned.length > 0) {
      setQueue(unlearned.map(v => v.id));
    } else {
      // Pick next 25 cards regardless of state
      setQueue(levelVocab.slice(0, 25).map(v => v.id));
    }
    setQueueIdx(0);
    setShowAnswer(false);
  };

  // COMPLETION SCREEN: Japanese License Test App Style Dashboard
  if (!currentCard && queue.length === 0) return (
    <div style={{ maxWidth:900, margin:'0 auto', padding: 20 }}>
      <StatsBar stats={stats} levelColor={LEVEL_COLORS[level]}/>
      
      <div className="glass-panel" style={{ textAlign:'center', padding:40, borderRadius: 20, display:'flex', flexDirection:'column', alignItems:'center', border: '1px solid var(--glass-border-strong)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <div style={{ background: 'rgba(16,185,129,0.15)', padding: 16, borderRadius: '50%', marginBottom: 16 }}>
          <CheckCircle2 size={54} color="#10b981"/>
        </div>
        
        <h2 style={{ marginBottom:8, color:'#10b981', fontSize: '1.6rem' }}>🎉 Tuyệt vời! Đã hoàn thành đợt học.</h2>
        <p style={{ color:'var(--text-secondary)', marginBottom:24, fontSize: '0.95rem' }}>
          Bạn đã hoàn thành mục tiêu ôn luyện hôm nay cho cấp độ <strong>Thẻ {level}</strong>.
        </p>

        {/* Session Log Quick Stats */}
        <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 500, marginBottom: 28, background: 'rgba(0,0,0,0.3)', padding: '14px 20px', borderRadius: 12, justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>{effectiveReviewList.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Từ đã thuộc</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>{sessionHistory.length > 0 ? sessionLog.easy : stats.learnedCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Nhớ tốt</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>{sessionLog.hard}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Tạm ổn</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444' }}>{sessionLog.again}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Cần xem lại</div>
          </div>
        </div>

        {/* Japanese Driving License App Style Action Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, width: '100%', maxWidth: 640 }}>
          
          <button 
            className="btn btn-outline" 
            onClick={handleRestudyCurrentBatch} 
            style={{ padding:'14px', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent: 'center', gap:8, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            <RotateCcw size={18}/> 🔄 Ôn lại các từ đã thuộc ({effectiveReviewList.length})
          </button>

          <button 
            className="btn btn-primary" 
            onClick={handleLoadNextNewBatch} 
            style={{ padding:'14px', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent: 'center', gap:8 }}
          >
            <Zap size={18}/> ⚡ Mở 25 từ mới tiếp theo
          </button>

          <button 
            className="btn btn-outline" 
            onClick={() => setShowSessionReview(true)} 
            style={{ padding:'14px', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent: 'center', gap:8, background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <BookOpen size={18}/> 📖 Xem nội dung vừa học ({effectiveReviewList.length})
          </button>

          <button 
            className="btn btn-outline" 
            onClick={() => { setFilterMode('all'); buildQueue(); }} 
            style={{ padding:'14px', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent: 'center', gap:8 }}
          >
            <List size={18}/> 📋 Quay lại danh sách ôn luyện
          </button>

        </div>

      </div>

      {/* Session Review Modal */}
      {showSessionReview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', padding: 24, overflowY: 'auto' }}>
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: 'white', fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <BookOpen size={22} color="#10b981"/> Danh sách từ vựng đã thuộc cấp độ {level} ({effectiveReviewList.length} từ)
              </h3>
              <button className="btn btn-ghost" onClick={() => setShowSessionReview(false)} style={{ color: 'white' }}>
                <X size={20}/>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {effectiveReviewList.map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 12, border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', marginBottom: 2 }}>{item.word}</div>
                    {item.reading && <div style={{ fontSize: '0.82rem', color: '#60a5fa', marginBottom: 4 }}>{item.reading}</div>}
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{item.vi || item.meaning}</div>
                  </div>
                  <button className="btn-ghost" onClick={() => speak(item.word)} style={{ padding: 6, color: '#10b981' }}>
                    <Volume2 size={18}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!currentCard) return (
    <div className="glass-panel" style={{ textAlign:'center', padding:40 }}>
      Đang tải từ vựng...
    </div>
  );

  const examples = Array.isArray(currentCard.examples) ? currentCard.examples : [];
  const lc = LEVEL_COLORS[level] || 'var(--accent-primary)';

  return (
    <div style={{ padding: '20px 40px', maxWidth: 1600, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
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
            {[...LEVELS, 'Khác'].map(l => (
              <option key={l} value={l} style={{ background: '#1e293b' }}>
                Thẻ {l} {vocabLevelCounts[l] !== undefined ? `(${vocabLevelCounts[l]} từ)` : ''}
              </option>
            ))}
          </select>

          {!isGuest() ? (
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 4 }}>
              <button onClick={() => setLearningMode('roadmap')} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: learningMode === 'roadmap' ? 'rgba(59,130,246,0.3)' : 'transparent', color: learningMode === 'roadmap' ? '#60a5fa' : 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: learningMode === 'roadmap' ? 600 : 400 }}>
                <ListOrdered size={16}/> Lộ Trình FSRS
              </button>
              <button onClick={() => setLearningMode('freestudy')} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: learningMode === 'freestudy' ? 'rgba(16,185,129,0.2)' : 'transparent', color: learningMode === 'freestudy' ? '#34d399' : 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: learningMode === 'freestudy' ? 600 : 400 }}>
                <Shuffle size={16}/> Học Tự Do
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.15)', padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)' }}>
              <Shuffle size={16} color="#34d399" />
              <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>Học Tự Do</span>
            </div>
          )}

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 4 }}>
            <button onClick={() => setStudyMode('fsrs')} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: studyMode === 'fsrs' ? 'rgba(255,255,255,0.1)' : 'transparent', color: studyMode === 'fsrs' ? 'white' : 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Brain size={16}/> Lật thẻ
            </button>
            <button onClick={() => setStudyMode('quiz')} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: studyMode === 'quiz' ? 'rgba(255,255,255,0.1)' : 'transparent', color: studyMode === 'quiz' ? 'white' : 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={16}/> Trắc nghiệm
            </button>
          </div>
          
          <button className="btn btn-ghost" onClick={() => setShowSettings(!showSettings)} style={{ padding: '8px', color: 'var(--text-secondary)' }} title="Cài đặt lật thẻ">
            <Settings size={20}/>
          </button>
        </div>
        
        <div style={{ display:'flex', alignItems:'center', flexWrap: 'wrap', gap:16 }}>
          {studyMode === 'fsrs' && (
            <div style={{ display:'flex', alignItems:'center', flexWrap: 'wrap', gap: 16, background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.85rem', color:'var(--text-secondary)' }}>
                <Filter size={16}/>
                <select 
                  value={filterMode} 
                  onChange={e => setFilterMode(e.target.value)}
                  style={{ background:'transparent', border:'none', color:'var(--text-secondary)', cursor:'pointer', outline:'none', fontWeight: 500 }}
                >
                  <option value="all">Học thông thường ({allIds.length})</option>
                  <option value="due">Chỉ thẻ đến hạn ({getDueCards(allIds).length})</option>
                  <option value="bookmark">Thẻ đã Bookmark ({allIds.filter(id => isBookmarked(id)).length})</option>
                  <option value="again">Thẻ đánh giá: Lại</option>
                  <option value="hard">Thẻ đánh giá: Khó</option>
                </select>
              </div>
              
              <div style={{ width: 1, height: 16, background: 'var(--glass-border)' }}></div>

              <button 
                onClick={() => setIsRandom(!isRandom)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isRandom ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600
                }}
                title="Đổi chế độ danh sách theo thứ tự hoặc ngẫu nhiên"
              >
                {isRandom ? <Shuffle size={16}/> : <ListOrdered size={16}/>}
                {isRandom ? 'Ngẫu nhiên' : 'Thứ tự'}
              </button>

              <div style={{ width: 1, height: 16, background: 'var(--glass-border)' }}></div>

              <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.85rem', color:'var(--text-secondary)', cursor:'pointer' }}>
                <input type="checkbox" checked={autoPlay} onChange={e => setAutoPlay(e.target.checked)} style={{ cursor:'pointer' }}/>
                Tự động phát âm
              </label>
            </div>
          )}
          <div style={{ display:'flex', gap:12, fontSize:'0.85rem', background: 'rgba(0,0,0,0.2)', padding: '8px 14px', borderRadius: 8 }}>
            <span style={{ color:'#10b981', fontWeight: 600 }}>✅ {sessionLog.easy}</span>
            <span style={{ color:'#f59e0b', fontWeight: 600 }}>😅 {sessionLog.hard}</span>
            <span style={{ color:'#ef4444', fontWeight: 600 }}>🔁 {sessionLog.again}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', flex: 1 }}>
        {/* LEFT COLUMN: MAIN CARD & STATS */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 320 }}>
          <StatsBar stats={stats} levelColor={lc}/>

          <div className="glass-panel" style={{ textAlign:'center', padding:'50px 28px 36px', minHeight:410, display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', transition: 'all 0.2s ease' }}>
            {/* Top Header inside card: Level tag + FSRS status */}
            <div style={{ position:'absolute', top:16, left:18, right:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <span style={{ fontSize:'0.78rem', padding:'3px 10px', borderRadius:4, background:`${lc}22`, color:lc, fontWeight:700 }}>{level}</span>
                {currentCard.type && <span style={{ fontSize:'0.78rem', padding:'3px 10px', borderRadius:4, background:'rgba(255,255,255,0.06)', color:'var(--text-secondary)' }}>{currentCard.type}</span>}
              </div>

              {fsrsCard && nextDue && (
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.78rem' }}>
                  <span style={{ color:lc, fontWeight: 600, display:'flex', alignItems:'center', gap:4 }}>
                    <Brain size={13}/>
                    FSRS: {['Chưa học','Đang học','Học','Ôn lại','Học lại'][fsrsCard.state || 0]}
                  </span>
                  <span style={{ color: nextDue.days === 0 ? '#f59e0b' : 'var(--text-tertiary)', fontWeight: 500 }}>
                    · {nextDue.label}
                  </span>
                </div>
              )}
            </div>

        {/* Word + TTS */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginBottom:24 }}>
          <span className="jp-text" style={{ fontSize: currentCard.word.length > 6 ? '2.5rem' : '3.8rem', fontWeight:800, cursor:'pointer', lineHeight: 1.3 }} onClick={()=>speak(currentCard.word)}>
            <FuriganaText text={currentCard.word} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={()=>speak(currentCard.word)} style={{ background:'none', border:'1px solid var(--glass-border)', borderRadius:8, padding:'7px 9px', cursor:'pointer', color:'var(--text-secondary)' }}>
              <Volume2 size={16}/>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleBookmark(currentId); setQueue([...queue]); /* re-render */ }} 
              style={{ background:'none', border:'1px solid var(--glass-border)', borderRadius:8, padding:'7px 9px', cursor:'pointer', color: isBookmarked(currentId) ? '#f59e0b' : 'var(--text-secondary)' }}
            >
              <Bookmark size={16} fill={isBookmarked(currentId) ? '#f59e0b' : 'none'}/>
            </button>
          </div>
        </div>

        <div onClick={() => { if (!showAnswer && studyMode === 'fsrs') { setShowAnswer(true); speak(currentCard.word); } }} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: (!showAnswer && studyMode === 'fsrs') ? 'pointer' : 'default' }}>
          {(showAnswer || studyMode === 'quiz') ? (
            <div className="fade-in">
              <div style={{ fontSize:'1.35rem', color:'var(--accent-primary)', marginBottom:10 }}>
                【{currentCard.reading}】
              </div>
              
              {studyMode === 'quiz' && !showAnswer ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
                  {quizOptions.map((opt, idx) => (
                    <button 
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setQuizAnswered(opt); setShowAnswer(true); }}
                      style={{ padding: '14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                      onMouseOut={e => e.currentTarget.style.background='rgba(0,0,0,0.3)'}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ fontSize:'1.3rem', fontWeight:600, marginBottom:20 }}>
                    {currentCard.vi}
                  </div>
                  
                  {studyMode === 'quiz' && quizAnswered && (
                    <div style={{ padding: '10px', borderRadius: 8, background: quizAnswered === currentCard.vi ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: quizAnswered === currentCard.vi ? '#10b981' : '#ef4444', marginBottom: 20, fontWeight: 600 }}>
                      {quizAnswered === currentCard.vi ? '🎉 Chính xác!' : `❌ Sai rồi! Bạn đã chọn: ${quizAnswered}`}
                    </div>
                  )}

                  {examples.length > 0 && (
                    <div style={{ textAlign:'left', background:'rgba(0,0,0,0.2)', borderRadius:10, padding:'14px 16px' }}>
                      <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:10 }}>✏️ Ví dụ (bấm để nghe)</div>
                      {examples.map((ex, i) => {
                        const textStr = typeof ex === 'string' ? ex : (ex?.jp || ex?.japanese || ex?.text || String(ex || ''));
                        const parts = textStr.split('(');
                        return (
                          <div key={i} style={{ marginBottom: i < examples.length - 1 ? 12 : 0 }}>
                            <div onClick={(e) => { e.stopPropagation(); speak(parts[0]); }} className="jp-text" style={{ cursor:'pointer', fontSize:'1.05rem', fontWeight:500, marginBottom:2 }}>
                              {parts[0]}
                            </div>
                            {parts[1] && <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', fontStyle:'italic' }}>({parts[1]}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div style={{ color:'var(--text-secondary)' }}>
              <Eye size={40} style={{ opacity:0.2, marginBottom:10 }}/>
              <p style={{ fontSize:'0.9rem' }}>Bấm vào vùng này để xem đáp án</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls - LUÔN HIỂN THỊ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {/* Navigation Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-outline" style={{ padding:'12px 20px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={handlePrev}>
            <ChevronLeft size={18}/> <span style={{ fontSize: '0.9rem', display: 'none' }} className="mobile-hide">Lùi</span>
          </button>
          
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{queueIdx + 1} / {queue.length}</span>

          <button className="btn btn-outline" style={{ padding:'12px 20px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={advanceToNextCard}>
            <span style={{ fontSize: '0.9rem', display: 'none' }} className="mobile-hide">Tiếp</span> <ChevronRight size={18}/>
          </button>
        </div>

        {/* Rating Row */}
        {isManualNextReady ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={advanceToNextCard} style={{ flex:1, padding:'14px 4px', borderRadius:8, cursor:'pointer', background:'rgba(59,130,246,0.15)', color:'#93c5fd', fontWeight:600, fontSize:'1.1rem', border:'1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>Thẻ tiếp theo</span> <ChevronRight size={20} />
            </button>
          </div>
        ) : studyMode === 'fsrs' ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={()=>handleRating(Rating.Again)} style={{ flex: '1 1 60px', padding:'13px 4px', borderRadius:8, cursor:'pointer', background:'rgba(239,68,68,0.15)', color:'#fca5a5', fontWeight:600, fontSize:'0.88rem', border:'1px solid rgba(239,68,68,0.3)' }}>
              🔁 Lại<br/><span style={{ fontSize:'0.72rem', opacity:0.7 }}>1 ngày</span>
            </button>
            <button onClick={()=>handleRating(Rating.Hard)} style={{ flex: '1 1 60px', padding:'13px 4px', borderRadius:8, cursor:'pointer', background:'rgba(245,158,11,0.15)', color:'#fcd34d', fontWeight:600, fontSize:'0.88rem', border:'1px solid rgba(245,158,11,0.3)' }}>
              😅 Khó<br/><span style={{ fontSize:'0.72rem', opacity:0.7 }}>~2-3 ngày</span>
            </button>
            <button onClick={()=>handleRating(Rating.Good)} style={{ flex: '1 1 60px', padding:'13px 4px', borderRadius:8, cursor:'pointer', background:'rgba(16,185,129,0.15)', color:'#6ee7b7', fontWeight:600, fontSize:'0.88rem', border:'1px solid rgba(16,185,129,0.3)' }}>
              ✅ Tốt<br/><span style={{ fontSize:'0.72rem', opacity:0.7 }}>~4-7 ngày</span>
            </button>
            <button onClick={()=>handleRating(Rating.Easy)} style={{ flex: '1 1 60px', padding:'13px 4px', borderRadius:8, cursor:'pointer', background:'rgba(99,102,241,0.15)', color:'#a5b4fc', fontWeight:600, fontSize:'0.88rem', border:'1px solid rgba(99,102,241,0.3)' }}>
              ⚡ Dễ<br/><span style={{ fontSize:'0.72rem', opacity:0.7 }}>~14+ ngày</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setQueueIdx(i=>(i+1)%queue.length); setShowAnswer(false); setQuizAnswered(null); }} style={{ flex:1, padding:'14px 4px', borderRadius:8, cursor:'pointer', background:'rgba(59,130,246,0.15)', color:'#93c5fd', fontWeight:600, fontSize:'1.1rem', border:'1px solid rgba(59,130,246,0.3)' }}>
              Bỏ qua / Tiếp theo
            </button>
          </div>
        )}
      </div>

      </div>
      
      {/* RIGHT COLUMN: List View of current queue */}
      {queue.length > 0 && (
        <div className="glass-panel" style={{ flex: '1 1 300px', maxWidth: 400, minWidth: 280, padding: 20, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Danh sách thẻ ({queue.length})</span>
            <button 
              onClick={() => setHideListDetails(!hideListDetails)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: hideListDetails ? 'var(--text-secondary)' : '#3b82f6', display: 'flex', alignItems: 'center', padding: 4 }}
              title={hideListDetails ? "Hiển thị chi tiết" : "Làm mờ chi tiết"}
            >
              {hideListDetails ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto', paddingRight: 6 }} className="custom-scrollbar">
            {queue.slice(0, visibleCount).map((id, index) => {
              const c = levelVocab.find(v => v.id === id);
              if (!c) return null;
              return (
                <div 
                  key={id} 
                  onClick={() => { setQueueIdx(index); setShowAnswer(false); }} 
                  style={{ 
                    padding: '12px 16px', borderRadius: 10, 
                    background: queueIdx === index ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', 
                    border: queueIdx === index ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent', 
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 6 
                  }}
                  onMouseOver={e => e.currentTarget.style.background = queueIdx === index ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.08)'}
                  onMouseOut={e => e.currentTarget.style.background = queueIdx === index ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)'}
                >
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span className="jp-text" style={{ fontSize: '1.15rem', fontWeight: 700, color: queueIdx === index ? '#818cf8' : 'var(--text-primary)' }}>{c.word}</span>
                     {isBookmarked(id) && <Bookmark size={14} color="#f59e0b" fill="#f59e0b" />}
                   </div>
                   <div style={{ filter: (!hideListDetails || queueIdx === index) ? 'none' : 'blur(4px)', opacity: (!hideListDetails || queueIdx === index) ? 1 : 0.6, transition: 'all 0.3s' }}>
                     {c.reading && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.reading}</span>}
                     <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{c.vi}</span>
                   </div>
                </div>
              );
            })}
            {queue.length > visibleCount && (
              <button
                onClick={() => setVisibleCount(v => v + 30)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(59,130,246,0.1)',
                  color: '#60a5fa',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: 6,
                  transition: 'all 0.2s'
                }}
              >
                ⚡ Tải thêm thẻ ({visibleCount} / {queue.length})
              </button>
            )}
          </div>
        </div>
      )}

      {showSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }} onClick={() => setShowSettings(false)}>
          <div style={{ background: '#1e293b', border: '1px solid var(--glass-border)', borderRadius: 16, padding: 24, width: '90%', maxWidth: 480, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 18 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 10, color: 'white' }}>
              <Settings size={20} color="#60a5fa" /> Cài Đặt Lật Thẻ & Thời Gian Xác Nhận
            </h2>

            {/* 1. Chế độ hiển thị đáp án - CHỌN 1 TRONG 2 */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600 }}>
                👁️ Chế độ lật đáp án (Chọn 1 trong 2):
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Option 1: Lật khi bấm Đánh Giá */}
                <div 
                  onClick={() => updateRevealMode('on_rating')}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    border: revealMode === 'on_rating' ? '1px solid #3b82f6' : '1px solid var(--glass-border)',
                    background: revealMode === 'on_rating' ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
                    <input 
                      type="radio" 
                      name="revealMode"
                      checked={revealMode === 'on_rating'} 
                      onChange={() => updateRevealMode('on_rating')}
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                    />
                    1. Lật đáp án ngay khi bấm Đánh Giá (Khuyên dùng)
                  </label>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 6, paddingLeft: 26, lineHeight: 1.4 }}>
                    Mặt ẩn ban đầu ➔ Bấm chọn Lại/Khó/Tốt/Dễ ➔ Hệ thống tự lật đáp án & giữ màn hình N giây để bạn xác nhận lại.
                  </div>
                </div>

                {/* Option 2: Luôn hiển thị sẵn đáp án */}
                <div 
                  onClick={() => updateRevealMode('always')}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    border: revealMode === 'always' ? '1px solid #3b82f6' : '1px solid var(--glass-border)',
                    background: revealMode === 'always' ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
                    <input 
                      type="radio" 
                      name="revealMode"
                      checked={revealMode === 'always'} 
                      onChange={() => updateRevealMode('always')}
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                    />
                    2. Luôn hiển thị sẵn đáp án ngay từ khi mở thẻ mới
                  </label>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 6, paddingLeft: 26, lineHeight: 1.4 }}>
                    Hiển thị sẵn Furigana, nghĩa tiếng Việt và câu ví dụ ngay khi vừa chuyển sang thẻ mới.
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Tự động phát âm */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 10, border: '1px solid var(--glass-border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>🔊 Tự động phát âm thanh tiếng Nhật</span>
                <input 
                  type="checkbox" 
                  checked={autoPlay} 
                  onChange={e => updateAutoPlay(e.target.checked)} 
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
              </label>
            </div>

            {/* 3. Thời gian giữ xem lại kết quả */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600 }}>⏱️ Thời gian giữ xem lại đáp án sau khi đánh giá</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { value: 500, label: '0.5 giây (Xem lướt nhanh)', icon: <FastForward size={16} /> },
                  { value: 1000, label: '1.0 giây (Khuyên dùng - Đủ đọc lại nghĩa)', icon: <Play size={16} /> },
                  { value: 2000, label: '2.0 giây (Đọc kỹ cả câu ví dụ)', icon: <Pause size={16} /> },
                  { value: 3000, label: '3.0 giây (Thư thả)', icon: <Pause size={16} /> },
                  { value: -1, label: 'Thủ công (Giữ màn hình cho tới khi bấm nút "Thẻ tiếp theo")', icon: <Hand size={16} /> },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateAutoAdvanceDelay(opt.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: autoAdvanceDelay === opt.value ? '1px solid #3b82f6' : '1px solid var(--glass-border)',
                      background: autoAdvanceDelay === opt.value ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.2)',
                      color: autoAdvanceDelay === opt.value ? '#60a5fa' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      textAlign: 'left',
                      fontSize: '0.88rem'
                    }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button onClick={() => setShowSettings(false)} className="btn btn-primary" style={{ padding: '10px 24px' }}>Lưu & Đóng</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VocabularyFlashcards;
// v9.2.5 — Optimized Flashcards Reveal Mode


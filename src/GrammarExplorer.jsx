// v11.0.0 — Ngữ Pháp Bunpro Style (Active Recall Typing, Smart Nuance Hints, Cram Mode & Multiple Choice)
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from './db.js';
import { 
  Search, BookOpen, Info, AlertTriangle, Layers, List, ChevronRight, 
  Sparkles, CheckCircle2, XCircle, RefreshCw, Flame, Volume2, VolumeX, 
  HelpCircle, Zap, BookMarked, ToggleLeft, ToggleRight, ArrowRight, Award
} from 'lucide-react';
import FuriganaText from './components/FuriganaText';

const LEVELS = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];
const LEVEL_COLORS = { N5: '#10b981', N4: '#3b82f6', N3: '#f59e0b', N2: '#8b5cf6', N1: '#ef4444' };

const cleanText = (text) => text ? text.replace(/&nbsp;/g, ' ').replace(/<[^>]*>?/gm, '').trim() : '';

// Normalizer for Japanese text comparisons
const normalizeJp = (str) => {
  if (!str) return '';
  return str.replace(/[。、！？\s～〜]/g, '').trim().toLowerCase();
};

import bunproQuizBank from './data/bunpro_quiz_bank.json';

// Smart Warning & Synonym Detection Engine for Bunpro Fill-In-The-Blank
const checkBunproAnswer = (userInput, targetPattern, synonyms = []) => {
  const normUser = normalizeJp(userInput);
  const normTarget = normalizeJp(targetPattern);

  if (!normUser) return { status: 'empty' };
  
  // Exact match
  if (normUser === normTarget) {
    return { status: 'correct', msg: '✨ Chính xác 100%!' };
  }

  // Check synonyms
  for (const syn of synonyms) {
    if (syn && normUser === normalizeJp(syn)) {
      return { status: 'warning', msg: `💡 Gợi ý Bunpro: Mẫu câu bạn gõ (${userInput}) đồng nghĩa, nhưng bài tập này yêu cầu cấu trúc [${targetPattern}]. Hãy thử lại!` };
    }
  }

  // Partial / Substring match or close formality hint
  if (normTarget.includes(normUser) && normUser.length >= 2) {
    return { status: 'warning', msg: `💡 Gợi ý Bunpro: Bạn đã điền đúng 1 phần [${userInput}]. Hãy hoàn thiện đầy đủ trợ từ/thể chia của [${targetPattern}]!` };
  }

  return { status: 'wrong', msg: `❌ Chưa chính xác. Đáp án đúng là: ${targetPattern}` };
};

// Fallback practice questions
const FALLBACK_PRACTICE_BANK = bunproQuizBank && bunproQuizBank.length > 0 ? bunproQuizBank : [
  {
    id: 'g_p1',
    level: 'N3',
    pattern: 'に関して',
    promptSentence: 'この問題 ___ 話し合いましょう。',
    target: 'に関して',
    synonyms: ['について', 'にかんして'],
    translation: 'Hãy thảo luận liên quan đến vấn đề này.',
    options: ['に関して', 'にして', 'にとって', 'において'],
    explanation: 'Cấu trúc [N + に関して] dùng để chỉ chủ đề "về/liên quan đến...".'
  }
];

const GrammarExplorer = () => {
  const navigate = useNavigate();

  // Active Main Tab: 'library' (Tra cứu & Cấu trúc), 'practice' (Luyện tập Bunpro & Trắc nghiệm), 'cram' (Ép xung Cram Mode)
  const [activeTab, setActiveTab] = useState('library');

  // Query database
  const grammarData = useLiveQuery(() => db.grammar.toArray()) || [];

  // TAB 1: LIBRARY STATES
  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  // TAB 2 & 3: PRACTICE STATES
  const [selectedPracticeLevel, setSelectedPracticeLevel] = useState('ALL');
  const [quizMode, setQuizMode] = useState('typing'); // 'typing' (Bunpro Active Recall) vs 'choice' (Trắc nghiệm 4 đáp án)
  const [cramLevel, setCramLevel] = useState('N3');
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [userTypedInput, setUserTypedInput] = useState('');
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [feedback, setFeedback] = useState(null); // { status: 'correct'|'warning'|'wrong', msg: '' }
  const [scoreStats, setScoreStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Calculate item counts per level dynamically for Library
  const levelCounts = useMemo(() => {
    const counts = { ALL: grammarData.length, N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
    grammarData.forEach(g => {
      if (counts[g.level] !== undefined) counts[g.level]++;
    });
    return counts;
  }, [grammarData]);

  // Calculate practice counts per level dynamically
  const practiceCounts = useMemo(() => {
    const counts = { ALL: bunproQuizBank.length, N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
    bunproQuizBank.forEach(q => {
      if (counts[q.level] !== undefined) counts[q.level]++;
    });
    return counts;
  }, []);

  // Filtered grammar list for Library
  const filteredGrammar = useMemo(() => {
    return grammarData.filter(g => {
      const matchLvl = selectedLevel === 'ALL' || g.level === selectedLevel;
      const q = query.trim().toLowerCase();
      const matchQ = !q || 
        (g.pattern && g.pattern.toLowerCase().includes(q)) || 
        (g.meaning && g.meaning.toLowerCase().includes(q)) ||
        (g.explanation && g.explanation.toLowerCase().includes(q));
      return matchLvl && matchQ;
    });
  }, [grammarData, selectedLevel, query]);

  useEffect(() => {
    if (filteredGrammar.length > 0 && !selectedItem) {
      setSelectedItem(filteredGrammar[0]);
    }
  }, [filteredGrammar, selectedItem]);

  // Derive Active Quiz Questions Bank (From Real Bunpro Quiz Bank Dataset)
  const activeQuizBank = useMemo(() => {
    let pool = bunproQuizBank && bunproQuizBank.length > 0 ? bunproQuizBank : FALLBACK_PRACTICE_BANK;
    
    if (activeTab === 'cram') {
      const cramFiltered = pool.filter(q => q.level === cramLevel);
      return cramFiltered.length > 0 ? cramFiltered : pool;
    }
    
    if (selectedPracticeLevel !== 'ALL') {
      const filtered = pool.filter(q => q.level === selectedPracticeLevel);
      return filtered.length > 0 ? filtered : pool;
    }
    
    return pool;
  }, [activeTab, cramLevel, selectedPracticeLevel]);

  const currentQuestion = activeQuizBank[currentQuizIdx % activeQuizBank.length] || FALLBACK_PRACTICE_BANK[0];

  // Reset answer states on question change
  useEffect(() => {
    setUserTypedInput('');
    setSelectedOptionIdx(null);
    setFeedback(null);
  }, [currentQuizIdx, activeTab]);

  // TTS Speech Reader
  const playAudio = (text) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlayingAudio(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
    if (jpVoice) utterance.voice = jpVoice;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  // Submit Answer Logic for Typing Mode (Bunpro Style)
  const handleCheckTypingAnswer = () => {
    if (!userTypedInput.trim()) return;
    const res = checkBunproAnswer(userTypedInput, currentQuestion.target, currentQuestion.synonyms);
    setFeedback(res);

    if (res.status === 'correct') {
      setScoreStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1, streak: prev.streak + 1 }));
      playAudio(currentQuestion.promptSentence.replace('___', currentQuestion.target));
    } else if (res.status === 'wrong') {
      setScoreStats(prev => ({ ...prev, total: prev.total + 1, streak: 0 }));
    }
  };

  // Submit Answer Logic for Multiple Choice Mode
  const handleSelectOption = (option, optIdx) => {
    setSelectedOptionIdx(optIdx);
    if (option === currentQuestion.target) {
      setFeedback({ status: 'correct', msg: '✨ Chính xác!' });
      setScoreStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1, streak: prev.streak + 1 }));
      playAudio(currentQuestion.promptSentence.replace('___', currentQuestion.target));
    } else {
      setFeedback({ status: 'wrong', msg: `❌ Chưa đúng. Đáp án đúng là: ${currentQuestion.target}` });
      setScoreStats(prev => ({ ...prev, total: prev.total + 1, streak: 0 }));
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuizIdx(prev => prev + 1);
  };

  // Save Grammar Point to FSRS Flashcards
  const handleSaveToFSRS = async (g) => {
    if (!g) return;
    try {
      const existing = await db.vocab.filter(v => v.word === g.pattern).first();
      if (existing) {
        alert(`Mẫu ngữ pháp "${g.pattern}" đã có trong bộ thẻ Flashcards của bạn!`);
        return;
      }
      const newCard = {
        id: 'g_' + Date.now(),
        word: g.pattern,
        kanji: g.pattern,
        level: g.level || 'N3',
        meaning: g.meaning || 'Ngữ pháp Bunpro',
        status: 'learning',
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        dueDate: new Date().toISOString()
      };
      await db.vocab.add(newCard);
      alert(`✅ Đã thêm ngữ pháp "${g.pattern}" vào bộ thẻ lặp lại ngắt quãng (FSRS)!`);
    } catch(err) {
      alert('Lỗi lưu vào Flashcards: ' + err.message);
    }
  };

  // Transfer Grammar Sentence to Shadowing Studio 1-Click
  const handleSendToShadowing = (text, meaning) => {
    if (!text) return;
    const session = {
      title: `Luyện Ngữ Pháp: ${text.slice(0, 15)}...`,
      segments: [{ start: 0, duration: 4.5, text, vi: meaning || '' }],
      currentSegIdx: 0,
      scores: {}
    };
    const savedStore = JSON.parse(localStorage.getItem('omni_shadowing_session_v3') || '{}');
    if (!savedStore.sessionStore) savedStore.sessionStore = {};
    savedStore.sessionStore.web = session;
    savedStore.activeTab = 'web';
    localStorage.setItem('omni_shadowing_session_v3', JSON.stringify(savedStore));
    navigate('/shadowing');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '88vh' }}>
      
      {/* TOP BAR: NAVIGATION TABS & BUNPRO BADGE */}
      <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: 10, display: 'flex' }}>
            <Flame size={20} color="white"/>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
              Bunpro Grammar Engine <span style={{ fontSize: '0.75rem', background: '#f59e0b', color: 'black', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>v11.1 Master</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Hệ thống 2,191+ mẫu ngữ pháp N5-N1 Active Recall, Gợi ý sắc thái thông minh & Cram Mode.
            </p>
          </div>
        </div>

        {/* Main Tab Switcher */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 10, border: '1px solid var(--glass-border)' }}>
          <button 
            className={`btn ${activeTab === 'library' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('library')}
            style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <BookOpen size={15}/> Tra Cứu & Cấu Trúc ({filteredGrammar.length})
          </button>
          
          <button 
            className={`btn ${activeTab === 'practice' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('practice')}
            style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Zap size={15}/> ✍️ Luyện Tập Bunpro
          </button>

          <button 
            className={`btn ${activeTab === 'cram' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('cram')}
            style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, background: activeTab === 'cram' ? '#ef4444' : 'transparent', color: 'white' }}
          >
            <Flame size={15}/> 🔥 Cram Mode (Ép Xung)
          </button>
        </div>

      </div>

      {/* TAB 1: LIBRARY & STRUCTURE FORMULAS */}
      {activeTab === 'library' && (
        <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
          
          {/* Left Column: Filter & List */}
          <div style={{ width: '38%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            
            {/* Search Input & Level Pills */}
            <div className="glass-panel" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                <Search size={16} color="var(--text-tertiary)"/>
                <input 
                  type="text" 
                  placeholder="Tra mẫu ngữ pháp, nghĩa tiếng Việt..." 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.85rem', flex: 1 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
                {LEVELS.map(lvl => (
                  <button 
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`btn ${selectedLevel === lvl ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '4px 6px', fontSize: '0.75rem', flex: 1, whiteSpace: 'nowrap' }}
                  >
                    {lvl} ({levelCounts[lvl] || 0})
                  </button>
                ))}
              </div>
            </div>

            {/* Grammar List */}
            <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredGrammar.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>Không tìm thấy mẫu ngữ pháp phù hợp.</div>
              ) : (
                filteredGrammar.map(g => {
                  const isSel = selectedItem?.pattern === g.pattern;
                  return (
                    <div 
                      key={g.pattern || g.id}
                      onClick={() => setSelectedItem(g)}
                      style={{ 
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        background: isSel ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isSel ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)'}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: (LEVEL_COLORS[g.level] || '#3b82f6') + '22', color: LEVEL_COLORS[g.level] || '#3b82f6' }}>
                          {g.level || 'N3'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'white' }} className="jp-text">
                            <FuriganaText text={g.pattern} />
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{g.meaning}</div>
                        </div>
                      </div>
                      <ChevronRight size={16} color={isSel ? 'var(--accent-primary)' : 'var(--text-tertiary)'} />
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Detailed Bunpro Formula & Nuance Panel */}
          <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {selectedItem ? (
              <>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: (LEVEL_COLORS[selectedItem.level] || '#3b82f6') + '22', color: LEVEL_COLORS[selectedItem.level] || '#3b82f6', marginRight: 10 }}>
                      {selectedItem.level || 'N3'}
                    </span>
                    <h2 style={{ display: 'inline', margin: 0, fontSize: '1.6rem', color: 'white' }} className="jp-text">
                      <FuriganaText text={selectedItem.pattern} />
                    </h2>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline" onClick={() => handleSaveToFSRS(selectedItem)} style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BookMarked size={14}/> Lưu FSRS
                    </button>
                    <button className="btn btn-primary" onClick={() => handleSendToShadowing(selectedItem.examples?.[0]?.jp || selectedItem.pattern, selectedItem.meaning)} style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Volume2 size={14}/> 🗣️ Shadowing
                    </button>
                  </div>
                </div>

                {/* Meaning & Formula Box */}
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                    Ý Nghĩa Cấu Trúc
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white', marginBottom: 12 }}>
                    {selectedItem.meaning}
                  </div>

                  {selectedItem.formation && (
                    <div style={{ borderTop: '1px dashed rgba(59,130,246,0.3)', paddingTop: 10 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 6 }}>CÔNG THỨC CHIA (STRUCTURE FORMULA):</div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 14px', borderRadius: 8, fontSize: '1.05rem', color: '#60a5fa', fontFamily: 'monospace' }}>
                        {Array.isArray(selectedItem.formation) ? selectedItem.formation.join(' / ') : selectedItem.formation}
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Explanation & Nuance */}
                {selectedItem.explanation && (
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Info size={16} color="#f59e0b" /> Giải Thích Sắc Thái (Nuance Breakdown)
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {cleanText(selectedItem.explanation)}
                    </p>
                  </div>
                )}

                {/* Examples */}
                {selectedItem.examples && selectedItem.examples.length > 0 && (
                  <div>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <List size={16} color="#10b981" /> Câu Ví Dụ Minh Họa
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selectedItem.examples.map((ex, i) => {
                        const jp = typeof ex === 'string' ? ex : (ex.jp || '');
                        const vi = typeof ex === 'object' ? (ex.vi || '') : '';
                        return (
                          <div key={i} style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div className="jp-text" style={{ fontSize: '1.1rem', color: 'white', marginBottom: 4 }}>
                                <FuriganaText text={jp} />
                              </div>
                              {vi && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{vi}</div>}
                            </div>

                            <button className="btn-ghost" onClick={() => playAudio(jp)} style={{ padding: 6, color: '#10b981' }} title="Nghe phát âm AI">
                              <Volume2 size={16}/>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 80 }}>Chọn mẫu ngữ pháp ở bên trái để xem công thức chi tiết.</div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2 & 3: PRACTICE (ACTIVE RECALL & MULTIPLE CHOICE) & CRAM MODE */}
      {(activeTab === 'practice' || activeTab === 'cram') && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          
          <div className="glass-panel" style={{ width: '100%', maxWidth: 720, padding: 28, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 20, border: '1px solid var(--glass-border-strong)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            
            {/* Header: Mode Toggle & Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 14 }}>
              
              {/* Dual Mode Switcher (Active Typing vs Multiple Choice) */}
              <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 10 }}>
                <button 
                  onClick={() => setQuizMode('typing')}
                  className={`btn ${quizMode === 'typing' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '4px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  title="Bunpro Active Recall: Tự gõ cấu trúc vào ô trống"
                >
                  ✍️ Tự Gõ (Bunpro Style)
                </button>
                <button 
                  onClick={() => setQuizMode('choice')}
                  className={`btn ${quizMode === 'choice' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '4px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  title="Trắc nghiệm 4 đáp án truyền thống"
                >
                  🔘 Trắc Nghiệm 4 Đáp Án
                </button>
              </div>

              {/* Level selector for Practice Mode */}
              {activeTab === 'practice' && (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', overflowX: 'auto' }}>
                  {LEVELS.map(lvl => (
                    <button 
                      key={lvl} 
                      onClick={() => { setSelectedPracticeLevel(lvl); setCurrentQuizIdx(0); }} 
                      className={`btn ${selectedPracticeLevel === lvl ? 'btn-primary' : 'btn-outline'}`} 
                      style={{ padding: '3px 7px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
                      {lvl} ({practiceCounts[lvl] || 0})
                    </button>
                  ))}
                </div>
              )}

              {/* Level selector for Cram Mode */}
              {activeTab === 'cram' && (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginRight: 4 }}>🔥 CRAM LEVEL:</span>
                  {['N5','N4','N3','N2','N1'].map(lvl => (
                    <button key={lvl} onClick={() => { setCramLevel(lvl); setCurrentQuizIdx(0); }} className={`btn ${cramLevel === lvl ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '2px 8px', fontSize: '0.75rem', background: cramLevel === lvl ? '#ef4444' : 'transparent' }}>
                      {lvl}
                    </button>
                  ))}
                </div>
              )}

              {/* Score & Streak */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Đúng: {scoreStats.correct}/{scoreStats.total}</span>
                <span style={{ color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Flame size={15}/> Streak: {scoreStats.streak}
                </span>
              </div>

            </div>

            {/* Prompt Question */}
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                CẤU TRÚC NGỮ PHÁP #{currentQuizIdx + 1} ({currentQuestion.level})
              </div>
              
              <div className="jp-text" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', lineHeight: 1.6, marginBottom: 8 }}>
                <FuriganaText text={currentQuestion.promptSentence} />
              </div>

              <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                "{currentQuestion.translation}"
              </div>
            </div>

            {/* ANSWER INPUT AREA */}

            {/* MODE A: BUNPRO ACTIVE RECALL TYPING */}
            {quizMode === 'typing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 450 }}>
                  <input 
                    type="text" 
                    placeholder="Gõ cấu trúc ngữ pháp vào đây (ví dụ: に関して, おかげで)..."
                    value={userTypedInput}
                    onChange={e => setUserTypedInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCheckTypingAnswer(); }}
                    disabled={feedback?.status === 'correct'}
                    style={{ 
                      flex: 1, padding: '12px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.4)', 
                      border: `2px solid ${feedback?.status === 'correct' ? '#10b981' : feedback?.status === 'warning' ? '#f59e0b' : 'var(--glass-border-strong)'}`, 
                      color: 'white', outline: 'none', fontSize: '1.1rem', textAlign: 'center'
                    }}
                  />
                  <button className="btn btn-primary" onClick={handleCheckTypingAnswer} disabled={feedback?.status === 'correct'} style={{ padding: '0 20px', fontSize: '0.9rem' }}>
                    Kiểm tra
                  </button>
                </div>
              </div>
            )}

            {/* MODE B: MULTIPLE CHOICE 4 OPTIONS */}
            {quizMode === 'choice' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSel = selectedOptionIdx === optIdx;
                  const isCorrect = opt === currentQuestion.target;
                  let bg = 'rgba(255,255,255,0.03)';
                  let border = '1px solid rgba(255,255,255,0.08)';

                  if (selectedOptionIdx !== null) {
                    if (isCorrect) { bg = 'rgba(16,185,129,0.2)'; border = '1px solid #10b981'; }
                    else if (isSel) { bg = 'rgba(239,68,68,0.2)'; border = '1px solid #ef4444'; }
                  }

                  return (
                    <button 
                      key={optIdx}
                      onClick={() => handleSelectOption(opt, optIdx)}
                      disabled={selectedOptionIdx !== null}
                      style={{ 
                        padding: '14px 18px', borderRadius: 10, background: bg, border, 
                        color: 'white', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s', textAlign: 'center'
                      }}
                      className="jp-text"
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* FEEDBACK & SMART WARNING BANNER */}
            {feedback && (
              <div style={{ 
                padding: 14, borderRadius: 10, 
                background: feedback.status === 'correct' ? 'rgba(16,185,129,0.15)' : feedback.status === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${feedback.status === 'correct' ? '#10b981' : feedback.status === 'warning' ? '#f59e0b' : '#ef4444'}`,
                color: 'white', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{feedback.msg}</div>
                  {currentQuestion.explanation && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      💡 {currentQuestion.explanation}
                    </div>
                  )}
                </div>

                <button className="btn btn-primary" onClick={handleNextQuestion} style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                  Câu tiếp <ArrowRight size={14}/>
                </button>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default GrammarExplorer;

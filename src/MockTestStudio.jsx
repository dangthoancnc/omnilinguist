// v9.1.52-1 — Exam Bank Studio (Menkyo Style)
import React, { useState, useEffect } from 'react';
import mockData from './data/mockTests.json';
import questionBank from './data/questionBank.json';
import { Timer, CheckCircle, XCircle, Play, FileText, Target, ShieldAlert, ChevronRight } from 'lucide-react';
import FuriganaText from './components/FuriganaText';

const LEVEL_COLORS = { N5:'#10b981', N4:'#3b82f6', N3:'#f59e0b', N2:'#8b5cf6', N1:'#ef4444' };

const ExamBankStudio = () => {
  const [tab, setTab] = useState('drill'); // 'drill' | 'weakness' | 'mock'
  
  // Drill State
  const [drillQ, setDrillQ] = useState(null);
  const [drillAnswer, setDrillAnswer] = useState(null);
  
  // Weakness State
  const [weaknessIds, setWeaknessIds] = useState([]);
  
  // Mock State
  const [mockView, setMockView] = useState('list'); // list, testing, result
  const [activeTest, setActiveTest] = useState(null);
  const [mockAnswers, setMockAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(null);

  // Load weakness from storage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('jlpt_weakness') || '[]');
    setWeaknessIds(saved);
  }, []);

  const saveWeakness = (id, isAdd) => {
    let saved = JSON.parse(localStorage.getItem('jlpt_weakness') || '[]');
    if (isAdd && !saved.includes(id)) saved.push(id);
    if (!isAdd) saved = saved.filter(x => x !== id);
    localStorage.setItem('jlpt_weakness', JSON.stringify(saved));
    setWeaknessIds(saved);
  };

  // ---------------- DRILL LOGIC ----------------
  const loadNextDrill = () => {
    setDrillAnswer(null);
    let pool = questionBank;
    if (tab === 'weakness') {
      pool = questionBank.filter(q => weaknessIds.includes(q.id));
      if (pool.length === 0) {
        setDrillQ(null);
        return;
      }
    }
    const randomIdx = Math.floor(Math.random() * pool.length);
    setDrillQ(pool[randomIdx]);
  };

  useEffect(() => {
    if (tab === 'drill' || tab === 'weakness') {
      loadNextDrill();
    }
  }, [tab]);

  const handleDrillAnswer = (optIdx) => {
    if (drillAnswer !== null) return; // Already answered
    setDrillAnswer(optIdx);
    const isCorrect = optIdx === drillQ.correctIndex;
    
    if (isCorrect) {
      if (tab === 'weakness') saveWeakness(drillQ.id, false); // Remove from weakness
    } else {
      saveWeakness(drillQ.id, true); // Add to weakness
    }
  };

  // ---------------- MOCK LOGIC ----------------
  useEffect(() => {
    let timer;
    if (mockView === 'testing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && mockView === 'testing') {
      handleMockSubmit();
    }
    return () => clearInterval(timer);
  }, [mockView, timeLeft]);

  const handleMockStart = (test) => {
    if (confirm('Bắt đầu làm bài thi? Thời gian sẽ được tính ngay lập tức.')) {
      setActiveTest(test);
      setMockAnswers({});
      setTimeLeft(test.timeLimit * 60);
      setMockView('testing');
    }
  };

  const handleMockSubmit = () => {
    if (timeLeft > 0 && !confirm('Bạn muốn nộp bài?')) return;
    let t = 0, e = 0;
    activeTest.sections.forEach(sec => sec.questions.forEach(q => {
      t += q.points;
      if (mockAnswers[q.id] === q.correctIndex) e += q.points;
    }));
    setScore({ earned: e, total: t, percent: Math.round((e/t)*100) });
    setMockView('result');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ---------------- RENDER ----------------
  return (
    <div style={{ maxWidth: 840, margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* TABS */}
      {mockView === 'list' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { id: 'drill', label: '一問一答 (Drill)', icon: <Target size={16}/> },
            { id: 'weakness', label: `弱点克服 (Lỗi sai: ${weaknessIds.length})`, icon: <ShieldAlert size={16}/> },
            { id: 'mock', label: '模擬テスト (Mock)', icon: <FileText size={16}/> }
          ].map(t => (
            <button 
              key={t.id} onClick={() => setTab(t.id)}
              className={`btn ${tab === t.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '12px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: 8, border: tab !== t.id ? '1px solid var(--glass-border)' : 'none' }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}

      {/* DRILL / WEAKNESS TAB */}
      {(tab === 'drill' || tab === 'weakness') && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {!drillQ ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: 60, width: '100%' }}>
              <CheckCircle size={60} color="#10b981" style={{ marginBottom: 20 }}/>
              <h2 style={{ color: '#10b981' }}>Tuyệt vời!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Hiện tại bạn không có câu nào làm sai trong danh sách 弱点克服.</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ width: '100%', padding: 30 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: 4, background: `${LEVEL_COLORS[drillQ.level]}22`, color: LEVEL_COLORS[drillQ.level], fontWeight: 800 }}>
                  {drillQ.level} - {drillQ.category.toUpperCase()}
                </span>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: '#f59e0b', marginBottom: 12 }}>{drillQ.instruction}</div>
              <div className="jp-text" style={{ fontSize: '1.25rem', marginBottom: 24, lineHeight: 1.6 }}><FuriganaText text={drillQ.text} /></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                {drillQ.options.map((opt, idx) => {
                  let bg = 'rgba(0,0,0,0.2)';
                  let border = '1px solid var(--glass-border)';
                  let color = '#e2e8f0';
                  
                  if (drillAnswer !== null) {
                    if (idx === drillQ.correctIndex) {
                      bg = 'rgba(16,185,129,0.2)'; border = '1px solid #10b981'; color = '#10b981';
                    } else if (idx === drillAnswer) {
                      bg = 'rgba(239,68,68,0.2)'; border = '1px solid #ef4444'; color = '#ef4444';
                    }
                  }

                  return (
                    <div 
                      key={idx} onClick={() => handleDrillAnswer(idx)}
                      className="jp-text"
                      style={{ padding: '14px 20px', borderRadius: 8, cursor: drillAnswer === null ? 'pointer' : 'default', background: bg, border, color, display: 'flex', alignItems: 'center', gap: 12, fontSize: '1.1rem', transition: 'all 0.2s' }}
                    >
                      <div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${drillAnswer !== null && (idx === drillQ.correctIndex || idx === drillAnswer) ? 'currentColor' : 'rgba(255,255,255,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontWeight: drillAnswer !== null && idx === drillQ.correctIndex ? 700 : 400 }}><FuriganaText text={opt} /></span>
                    </div>
                  );
                })}
              </div>

              {drillAnswer !== null && (
                <div className="fade-in" style={{ marginTop: 24 }}>
                  <div style={{ padding: 16, background: drillAnswer === drillQ.correctIndex ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${drillAnswer === drillQ.correctIndex ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 8, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, color: drillAnswer === drillQ.correctIndex ? '#10b981' : '#ef4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {drillAnswer === drillQ.correctIndex ? <><CheckCircle size={16}/> Chính xác!</> : <><XCircle size={16}/> Sai rồi!</>}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'white', lineHeight: 1.5 }}>
                      💡 <FuriganaText text={drillQ.explanation} />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={loadNextDrill} style={{ width: '100%', padding: '14px', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                    Câu tiếp theo <ChevronRight size={18}/>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MOCK TAB */}
      {tab === 'mock' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {mockView === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mockData.map(test => (
                <div key={test.id} className="glass-panel" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: 4, background: `${LEVEL_COLORS[test.level]}22`, color: LEVEL_COLORS[test.level], fontWeight: 800 }}>{test.level}</span>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 12, marginBottom: 6 }}>{test.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>⏱ {test.timeLimit} phút</div>
                  </div>
                  <button onClick={() => handleMockStart(test)} className="btn btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Play size={16}/> Thi thử
                  </button>
                </div>
              ))}
            </div>
          )}

          {mockView === 'testing' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
                <div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Đang thi:</div><div style={{ fontWeight: 700 }}>{activeTest.title}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: timeLeft < 300 ? '#ef4444' : '#10b981', fontWeight: 800, fontSize: '1.2rem' }}>
                    <Timer size={20}/> {formatTime(timeLeft)}
                  </div>
                  <button onClick={handleMockSubmit} className="btn btn-primary" style={{ padding: '8px 20px' }}>Nộp bài</button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
                {activeTest.sections.map(sec => (
                  <div key={sec.id} style={{ marginBottom: 24 }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '8px 8px 0 0', border: '1px solid var(--glass-border)', borderBottom: 'none' }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{sec.title}</h3>
                    </div>
                    <div className="glass-panel" style={{ borderRadius: '0 0 8px 8px', padding: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
                      {sec.questions.map((q, qIdx) => (
                        <div key={q.id}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', marginBottom: 12 }}>{q.instruction}</div>
                          <div className="jp-text" style={{ fontSize: '1.1rem', marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                            {q.highlight ? q.text.split(q.highlight).map((p, i, a) => <React.Fragment key={i}><FuriganaText text={p} />{i < a.length - 1 && <span style={{ textDecoration: 'underline', color: '#60a5fa' }}><FuriganaText text={q.highlight} /></span>}</React.Fragment>) : <FuriganaText text={q.text} />}
                          </div>
                          <div style={{ display: 'grid', gap: 10 }}>
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} onClick={() => setMockAnswers(p => ({ ...p, [q.id]: optIdx }))} className="jp-text" style={{ padding: '12px 16px', borderRadius: 8, cursor: 'pointer', background: mockAnswers[q.id] === optIdx ? 'rgba(59,130,246,0.2)' : 'rgba(0,0,0,0.2)', border: `1px solid ${mockAnswers[q.id] === optIdx ? '#3b82f6' : 'var(--glass-border)'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${mockAnswers[q.id] === optIdx ? '#3b82f6' : 'rgba(255,255,255,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mockAnswers[q.id] === optIdx ? '#3b82f6' : 'transparent', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>{optIdx + 1}</div>
                                <span><FuriganaText text={opt} /></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mockView === 'result' && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div className="glass-panel" style={{ textAlign: 'center', padding: 40, marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: 10 }}>Kết quả thi thử</h2>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: score.percent >= 50 ? '#10b981' : '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                  {score.percent >= 50 ? <CheckCircle size={40}/> : <XCircle size={40}/>}
                  {score.earned} / {score.total} <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>điểm</span>
                </div>
                <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => setMockView('list')}>← Quay lại danh sách</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamBankStudio;

// Dashboard: Command Center Tiến Độ Học Tập Cá Nhân Hóa (Guest & Logged-In User)
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, Flame, BookOpen, Mic, Brain, PencilLine, Map as MapIcon, ChevronRight, 
  AlertCircle, LogIn, UserPlus, CheckCircle2, History, BarChart2, ShieldCheck, 
  Sparkles, Layers, RefreshCw, Clock, Play, RotateCcw
} from 'lucide-react';
import { getStats, getStreak, updateStreak, getUserProfile, getFreeStudyHistory, getTodayStats } from './studyStore.js';
import { useAuth } from './AuthContext.jsx';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';
import AuthModal from './AuthModal.jsx';
import localMasterDb from './data/jlpt_master_db.json';

const SVGBar = ({ data }) => {
  const max = Math.max(...data.map(d => d.v), 1);
  const W = 280, H = 80;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      {data.map((d, i) => {
        const bW = (W / data.length) - 6;
        const bH = Math.max((d.v / max) * 60, 2);
        const x = i * (W / data.length) + 3;
        return (
          <g key={i}>
            <rect x={x} y={H - 16 - bH} width={bW} height={bH} rx={3} fill={d.today ? '#3b82f6' : 'rgba(59,130,246,0.3)'}/>
            <text x={x + bW / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

const WEEK = ['T2','T3','T4','T5','T6','T7','CN'];
const WEEK_DATA = WEEK.map((label, i) => ({ label, v: [45,120,90,130,110,60,85][i], today: i === (new Date().getDay() + 6) % 7 }));

const QUICK_LINKS = [
  { icon:<MapIcon size={18}/>, label:'学習ロードマップ', sub:'Lộ trình học tập', route:'/roadmap', color:'#f59e0b' },
  { icon:<Brain size={18}/>, label:'単語カード FSRS', sub:'Flashcards từ vựng', route:'/flashcards', color:'#3b82f6' },
  { icon:<PencilLine size={18}/>, label:'漢字練習', sub:'Luyện viết Kanji', route:'/kanji', color:'#8b5cf6' },
  { icon:<BookOpen size={18}/>, label:'文法検索', sub:'Tra cứu Ngữ pháp', route:'/grammar', color:'#ec4899' },
  { icon:<Mic size={18}/>, label:'シャドーイング', sub:'Luyện phát âm & Nghe', route:'/shadowing', color:'#10b981' },
  { icon:<Play size={18}/>, label:'Anki Sandbox', sub:'Phát Anki Offline', route:'/sandbox', color:'#06b6d4' },
];

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const LEVEL_COLORS = { N5:'#10b981', N4:'#3b82f6', N3:'#f59e0b', N2:'#8b5cf6', N1:'#ef4444' };

const Dashboard = () => {
  const vocabData = useLiveQuery(() => db.vocab.toArray()) || [];
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  
  const [streak, setStreak] = useState(0);
  const [dueStats, setDueStats] = useState({ dueCount: 0, learnedCount: 0, total: 0 });
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const todayStats = getTodayStats();

  useEffect(() => {
    setStreak(updateStreak());
    const p = getUserProfile();
    setProfile(p);

    const seen = new Set();
    const effectiveVocab = vocabData.length >= 50 ? vocabData : (localMasterDb.vocabulary || []);
    const targetLvl = p?.goal || p?.targetLevel || 'N3';
    const targetVocab = effectiveVocab.filter(v => {
      if ((v.level || 'N3') !== targetLvl || seen.has(v.word)) return false;
      seen.add(v.word); return true;
    });
    setDueStats(getStats(targetVocab.map(v => v.id), isGuest ? 'freestudy' : 'roadmap'));
  }, [vocabData, isGuest]);

  // Tính phần trăm tiến độ từng level (N5 -> N1)
  const levelProgress = useMemo(() => {
    const freeHistory = getFreeStudyHistory();
    const effectiveVocab = vocabData.length >= 50 ? vocabData : (localMasterDb.vocabulary || []);
    
    const progressMap = { N5: { learned: 0, total: 0 }, N4: { learned: 0, total: 0 }, N3: { learned: 0, total: 0 }, N2: { learned: 0, total: 0 }, N1: { learned: 0, total: 0 } };
    
    effectiveVocab.forEach(v => {
      const lvl = (v.level || 'N3').toUpperCase();
      if (progressMap[lvl]) {
        progressMap[lvl].total++;
        const hist = freeHistory[v.id];
        if (hist && (hist.correct > 0 || hist.incorrect > 0)) {
          progressMap[lvl].learned++;
        }
      }
    });

    return progressMap;
  }, [vocabData]);

  // Lịch sử luyện tập gần đây (History Logs)
  const recentHistoryLogs = useMemo(() => {
    const freeHistory = getFreeStudyHistory();
    const effectiveVocab = vocabData.length >= 50 ? vocabData : (localMasterDb.vocabulary || []);
    const vocabMap = new Map(effectiveVocab.map(v => [v.id, v]));

    const logs = Object.entries(freeHistory).map(([id, data]) => {
      const card = vocabMap.get(id);
      return {
        id,
        word: card?.word || id,
        reading: card?.reading || '',
        meaning: card?.vi || card?.meaning || '',
        level: card?.level || 'N3',
        correct: data.correct || 0,
        incorrect: data.incorrect || 0,
        lastPracticed: data.last_practiced ? new Date(data.last_practiced) : new Date()
      };
    });

    // Sắp xếp mới nhất lên đầu
    logs.sort((a, b) => b.lastPracticed - a.lastPracticed);
    return logs.slice(0, 30); // 30 mục mới nhất
  }, [vocabData]);

  const goalLabel = profile?.goal || profile?.targetLevel || 'N3';
  const startDateString = profile?.startDate && !isNaN(new Date(profile.startDate).getTime())
    ? new Date(profile.startDate).toLocaleDateString('vi-VN')
    : 'Mới khởi tạo';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, paddingBottom: 40 }}>
      
      {/* Header Banner: Guest vs Logged-In User */}
      {isGuest ? (
        <div className="glass-panel" style={{
          padding: '20px 24px', borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))',
          border: '1px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(16,185,129,0.15)', color: '#34d399', display: 'flex' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '2px 8px', borderRadius: 10 }}>
                  🟢 Chế độ Khách (Guest Mode)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Lưu trên thiết bị này</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>
                Tiến Độ Học Tự Do Cá Nhân
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                Dữ liệu học tự do & streak được lưu an toàn. Đăng ký tài khoản để mở khóa Lộ Trình SRS & Đồng bộ Cloud tự động.
              </p>
            </div>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => setShowAuthModal(true)}
            style={{ padding: '10px 18px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <UserPlus size={16} /> Đăng ký / Đăng nhập
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{
          padding: '20px 24px', borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
          border: '1px solid rgba(59,130,246,0.3)', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(59,130,246,0.2)', color: '#60a5fa', display: 'flex' }}>
              <Sparkles size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: 10 }}>
                  ⚡ Tài khoản đã đồng bộ Cloud
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{user?.email}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>
                Lộ Trình SRS Cá Nhân Hóa ({goalLabel})
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                Bắt đầu từ: {startDateString} · Giai đoạn hiện tại: Phase {profile?.currentPhase || 1}
              </p>
            </div>
          </div>

          <button 
            className="btn btn-outline"
            onClick={() => navigate('/roadmap')}
            style={{ padding: '10px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <MapIcon size={16} /> Xem Chi Tiết Lộ Trình <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--glass-border)', paddingBottom: 8 }}>
        <button 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('overview')}
          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <BarChart2 size={16}/> Tổng Quan Tiến Độ & Bắt Đầu
        </button>
        <button 
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('history')}
          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <History size={16}/> Nhật Ký Học Tập ({recentHistoryLogs.length})
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* ============ NEW: PHÒNG LUYỆN TẬP & THỐNG KÊ HÔM NAY ============ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            
            {/* Thống kê hôm nay */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontWeight: 600, fontSize: '1.05rem' }}>
                <BarChart2 size={20} color="#60a5fa" />
                Lịch Sử Học Hôm Nay
              </div>
              
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '16px', background: 'rgba(59,130,246,0.1)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', lineHeight: 1 }}>{todayStats.total}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>Thẻ đã lật</div>
                </div>
                
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>Tốt / Dễ ({todayStats.correct})</span>
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>Khó / Sai ({todayStats.incorrect})</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${todayStats.total ? (todayStats.correct / todayStats.total) * 100 : 0}%`, background: '#10b981', transition: 'width 0.5s' }} />
                      <div style={{ width: `${todayStats.total ? (todayStats.incorrect / todayStats.total) * 100 : 0}%`, background: '#ef4444', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    * Dữ liệu được tính dựa trên số lượt lật thẻ thực tế trong ngày, bao gồm cả từ vựng, kanji và ngữ pháp.
                  </div>

                  {/* Nút thao tác nhanh */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => navigate('/flashcards', { state: { studyMode: 'fsrs', filterMode: 'due' } })}
                      style={{ flex: 1, padding: '9px 12px', borderRadius: 10, background: '#3b82f6', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
                    >
                      <Play size={14} /> Tiếp tục học
                    </button>
                    <button 
                      onClick={() => navigate('/flashcards', { state: { studyMode: 'fsrs', filterMode: 'today' } })}
                      style={{ flex: 1, padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: '#60a5fa', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
                    >
                      <RotateCcw size={14} /> Ôn lại thẻ hôm nay
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Phòng luyện tập chuyên đề */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontWeight: 600, fontSize: '1.05rem' }}>
                <Target size={20} color="#f59e0b" />
                🏋️ Phòng Luyện Tập Chuyên Đề
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button 
                  onClick={() => navigate('/flashcards', { state: { studyMode: 'fsrs', filterMode: 'hard_only' } })}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#fca5a5' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 8, background: 'rgba(239,68,68,0.2)', borderRadius: 8 }}><AlertCircle size={18}/></div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Khắc Phục Điểm Yếu</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Ôn các thẻ hay sai và cực khó (Độ khó &gt; 7)</div>
                    </div>
                  </div>
                  <ChevronRight size={18}/>
                </button>
                
                <button 
                  onClick={() => navigate('/flashcards', { state: { studyMode: 'fsrs', filterMode: 'easy_only' } })}
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#6ee7b7' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 8, background: 'rgba(16,185,129,0.2)', borderRadius: 8 }}><CheckCircle2 size={18}/></div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ôn Tập Nhẹ Nhàng</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Lướt nhanh các thẻ Dễ (Độ khó &lt; 4)</div>
                    </div>
                  </div>
                  <ChevronRight size={18}/>
                </button>

                <button 
                  onClick={() => navigate('/flashcards', { state: { studyMode: 'fsrs', filterMode: 'sort_easy_to_hard' } })}
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#c4b5fd' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 8, background: 'rgba(139,92,246,0.2)', borderRadius: 8 }}><Layers size={18}/></div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Quét Toàn Diện (Dễ ➔ Khó)</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Sắp xếp toàn bộ thẻ theo độ khó tăng dần</div>
                    </div>
                  </div>
                  <ChevronRight size={18}/>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Stats Cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:12 }}>
            <div className="glass-panel" style={{ padding:16 }}>
              <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                <Flame size={14} color="#f97316"/> Streak Học Liên Tiếp
              </div>
              <div style={{ fontSize:'2rem', fontWeight:800, color:'#f97316' }}>{streak}</div>
              <div style={{ fontSize:'0.73rem', color:'var(--text-secondary)' }}>ngày liên tiếp</div>
            </div>
            <div className="glass-panel" style={{ padding:16 }}>
              <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                <Target size={14} color="#10b981"/> Mục Tiêu JLPT
              </div>
              <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#10b981' }}>{goalLabel}</div>
              <div style={{ fontSize:'0.73rem', color:'var(--text-secondary)' }}>{profile ? `Bắt đầu: ${startDateString}` : 'Chế độ Tự Do'}</div>
            </div>
            <div className="glass-panel" style={{ padding:16 }}>
              <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                <Brain size={14} color="#3b82f6"/> Thẻ Cần Ôn Hôm Nay
              </div>
              <div style={{ fontSize:'2rem', fontWeight:800, color: dueStats.dueCount > 0 ? '#f59e0b' : '#10b981' }}>
                {dueStats.dueCount}
              </div>
              <div style={{ fontSize:'0.73rem', color:'var(--text-secondary)' }}>thẻ đến hạn ({dueStats.learnedCount} đã hoàn thành)</div>
            </div>
          </div>

          {/* Level Mastery Progress (N5 -> N1) */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#3b82f6" />
              Tiến Độ Làm Chủ Từ Vựng (JLPT N5 ➔ N1)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {JLPT_LEVELS.map(lvl => {
                const prog = levelProgress[lvl] || { learned: 0, total: 1 };
                const pct = Math.min(Math.round((prog.learned / (prog.total || 1)) * 100), 100);
                const color = LEVEL_COLORS[lvl] || '#3b82f6';
                return (
                  <div key={lvl} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}>
                      <span style={{ fontWeight: 700, color }}>Trình độ {lvl}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <strong>{prog.learned}</strong> / {prog.total} từ ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links & Charts */}
          <div className="grid-2" style={{ gap:18 }}>
            {/* Quick Links */}
            <div className="glass-panel">
              <h3 style={{ fontSize:'0.92rem', marginBottom:14 }}>⚡ Bắt đầu nhanh</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {QUICK_LINKS.map((q, i) => (
                  <div key={i} onClick={()=>navigate(q.route)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid var(--glass-border)', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=q.color}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}
                  >
                    <div style={{ color:q.color }}>{q.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.85rem', fontWeight:600 }} className="jp-text">{q.label}</div>
                      <div style={{ fontSize:'0.73rem', color:'var(--text-secondary)' }}>{q.sub}</div>
                    </div>
                    {q.route==='/flashcards' && dueStats.dueCount > 0 && (
                      <span style={{ fontSize:'0.72rem', background:'#f59e0b', color:'black', fontWeight:700, padding:'2px 7px', borderRadius:10 }}>{dueStats.dueCount}</span>
                    )}
                    <ChevronRight size={14} color={q.color}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart + Routine */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="glass-panel" style={{ padding:'14px 16px' }}>
                <h3 style={{ fontSize:'0.88rem', marginBottom:10 }}>📈 Học tập tuần này</h3>
                <SVGBar data={WEEK_DATA}/>
              </div>
              <div className="glass-panel" style={{ padding:'14px 16px' }}>
                <h3 style={{ fontSize:'0.88rem', marginBottom:12 }}>🧠 Phương pháp gợi ý</h3>
                {[
                  { icon:'🌅', text:'Sáng: Nghe Podcast JP (Micro-learning 30p)', done: false },
                  { icon:'☀️', text:'Trưa: FSRS Flashcards (30p)', done: dueStats.learnedCount > 0 },
                  { icon:'🌙', text:'Tối: Shadowing + Writing (60p)', done: false },
                ].map((t,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom: i<2?'1px solid rgba(255,255,255,0.04)':'' }}>
                    <span>{t.icon}</span>
                    <span style={{ flex:1, fontSize:'0.83rem', color: t.done?'var(--text-secondary)':'white', textDecoration: t.done?'line-through':'' }}>{t.text}</span>
                    {t.done && <span style={{ color:'#10b981', fontSize:'0.75rem' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Tab 2: History Logs */
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="#34d399" />
            Nhật Ký Học Tập Gần Đây (Study Timeline)
          </h3>

          {recentHistoryLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
              Chưa có lịch sử học tập. Hãy bắt đầu học Flashcard hoặc Luyện tập để xem nhật ký!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentHistoryLogs.map((log, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--glass-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: (LEVEL_COLORS[log.level] || '#3b82f6') + '22', color: LEVEL_COLORS[log.level] || '#3b82f6' }}>
                      {log.level}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: 'white' }} className="jp-text">
                        {log.word} {log.reading ? `(${log.reading})` : ''}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.meaning}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: log.correct > 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
                      Đúng: {log.correct} | Chưa nhớ: {log.incorrect}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {log.lastPracticed.toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Dashboard;

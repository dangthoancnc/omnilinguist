// v9.1.49-1 — Dashboard: kéo dữ liệu FSRS thực + userProfile
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Flame, BookOpen, Mic, Brain, PencilLine, Map, ChevronRight, AlertCircle } from 'lucide-react';
import { getStats, getStreak, updateStreak, getUserProfile } from './studyStore.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';

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
const WEEK_DATA = WEEK.map((label, i) => ({ label, v: [45,120,90,130,110,60,0][i], today: i === 6 }));

const QUICK_LINKS = [
  { icon:<Map size={18}/>, label:'学習ロードマップ', sub:'Lộ trình học tập', route:'/roadmap', color:'#f59e0b' },
  { icon:<Brain size={18}/>, label:'単語カード FSRS', sub:'Flashcards đến hạn', route:'/flashcards', color:'#3b82f6' },
  { icon:<Mic size={18}/>, label:'シャドーイング', sub:'Luyện phát âm', route:'/shadowing', color:'#10b981' },
  { icon:<PencilLine size={18}/>, label:'ライティング', sub:'Writing & Output', route:'/email', color:'#8b5cf6' },
];

const Dashboard = () => {
  const vocabData = useLiveQuery(() => db.vocab.toArray()) || [];
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [dueStats, setDueStats] = useState({ dueCount: 0, total: 0 });
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Cập nhật streak hôm nay
    setStreak(updateStreak());

    // Lấy profile
    const p = getUserProfile();
    setProfile(p);

    // Tính số card N3 đến hạn từ FSRS store thực
    const seen = new Set();
    const n3Vocab = vocabData.filter(v => {
      if (v.level !== 'N3' || seen.has(v.word)) return false;
      seen.add(v.word); return true;
    });
    setDueStats(getStats(n3Vocab.map(v => v.id)));
  }, [vocabData]);

  const goalLabel = profile?.goal || 'N3';
  const monthsLeft = profile?.monthsLeft || '?';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

      {/* Alert nếu chưa chọn goal */}
      {!profile && (
        <div onClick={()=>navigate('/roadmap')} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:10, cursor:'pointer' }}>
          <AlertCircle size={18} color="#f59e0b"/>
          <div>
            <strong style={{ color:'#f59e0b' }}>Chưa thiết lập lộ trình!</strong>
            <span style={{ fontSize:'0.88rem', color:'var(--text-secondary)', marginLeft:8 }}>Bấm để chọn mục tiêu N3/N2/N1 và hệ thống sẽ cá nhân hóa kế hoạch cho bạn →</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        <div className="glass-panel" style={{ padding:16 }}>
          <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
            <Flame size={14} color="#f97316"/> Streak
          </div>
          <div style={{ fontSize:'2rem', fontWeight:800, color:'#f97316' }}>{streak}</div>
          <div style={{ fontSize:'0.73rem', color:'var(--text-secondary)' }}>ngày liên tiếp</div>
        </div>
        <div className="glass-panel" style={{ padding:16 }}>
          <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
            <Target size={14} color="#10b981"/> Mục tiêu
          </div>
          <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#10b981' }}>{goalLabel}</div>
          <div style={{ fontSize:'0.73rem', color:'var(--text-secondary)' }}>{profile ? `Bắt đầu: ${new Date(profile.startDate).toLocaleDateString('vi')}` : 'Chưa thiết lập'}</div>
        </div>
        <div className="glass-panel" style={{ padding:16 }}>
          <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
            <Brain size={14} color="#3b82f6"/> FSRS hôm nay
          </div>
          <div style={{ fontSize:'2rem', fontWeight:800, color: dueStats.dueCount > 0 ? '#f59e0b' : '#10b981' }}>
            {dueStats.dueCount}
          </div>
          <div style={{ fontSize:'0.73rem', color:'var(--text-secondary)' }}>từ đến hạn ôn ({dueStats.learnedCount} đã học)</div>
        </div>
      </div>

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

        {/* Chart + Method reminder */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="glass-panel" style={{ padding:'14px 16px' }}>
            <h3 style={{ fontSize:'0.88rem', marginBottom:10 }}>📈 Học tập tuần này</h3>
            <SVGBar data={WEEK_DATA}/>
          </div>
          <div className="glass-panel" style={{ padding:'14px 16px' }}>
            <h3 style={{ fontSize:'0.88rem', marginBottom:12 }}>🧠 Phương pháp hôm nay</h3>
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
    </div>
  );
};

export default Dashboard;

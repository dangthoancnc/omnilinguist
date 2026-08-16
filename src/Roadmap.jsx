// v9.1.50-3 — Roadmap & Onboarding
import React, { useState, useEffect } from 'react';
import { saveUserProfile, getUserProfile, advancePhase, getTodayStats } from './studyStore.js';
import { useNavigate } from 'react-router-dom';
import { Target, Brain, Mic, BookOpen, PencilLine, ChevronRight, CheckCircle2, Lock, ArrowRight, Flag, BarChart2, AlertCircle, Layers, Play, RotateCcw } from 'lucide-react';

const GOALS = [
  { id:'N3', label:'N3', sub:'Trung cấp', months:3, hours:2, color:'#f59e0b', desc:'Đọc báo đơn giản, giao tiếp cơ bản công sở, viết email ngắn.' },
  { id:'N2', label:'N2', sub:'Cao cấp', months:6, hours:2, color:'#8b5cf6', desc:'Làm việc bằng tiếng Nhật, đọc tài liệu chuyên ngành, viết báo cáo.' },
  { id:'N1', label:'N1', sub:'Thành thạo', months:12, hours:2, color:'#ef4444', desc:'Thành thạo gần như người bản ngữ, đọc văn học, thuyết trình.' },
];

const ROADMAP = {
  N3: [
    {
      phase:1, title:'Xây Nền (Tháng 1)', icon:'🧱', color:'#10b981', method:'SRS + Active Recall',
      desc:'Kích hoạt lại vốn từ N3 đã học, xây dựng phản xạ cơ bản. Học 10 từ/ngày bằng thuật toán FSRS.',
      tasks:[ { id:'p1t1', label:'Ôn 10 từ N3/ngày (FSRS)', time:20, route:'/flashcards', icon:<BookOpen size={14}/> }, { id:'p1t2', label:'Nghe Podcast thụ động', time:30, route:'/shadowing', icon:<Mic size={14}/> }, { id:'p1t3', label:'Học 2 mẫu ngữ pháp/ngày', time:20, route:'/grammar', icon:<Brain size={14}/> }, { id:'p1t4', label:'Shadowing câu đơn giản', time:30, route:'/shadowing', icon:<Mic size={14}/> } ],
      milestone:'Nhớ 300 từ N3, đọc được câu đơn NHK Easy'
    },
    {
      phase:2, title:'Bứt Phá (Tháng 2)', icon:'🚀', color:'#3b82f6', method:'Comprehensible Input (i+1)',
      desc:'Tăng tốc bằng Input thực tế. Đọc báo NHK Easy hàng ngày, Shadowing câu công sở, tập viết câu tự do.',
      tasks:[ { id:'p2t1', label:'Đọc 1 bài NHK News Web Easy', time:20, route:'/dictionary', icon:<BookOpen size={14}/> }, { id:'p2t2', label:'FSRS ôn từ + thêm 10 từ mới', time:25, route:'/flashcards', icon:<Brain size={14}/> }, { id:'p2t3', label:'Shadowing câu công sở N3', time:30, route:'/shadowing', icon:<Mic size={14}/> }, { id:'p2t4', label:'Viết email ngắn (AI review)', time:25, route:'/email', icon:<PencilLine size={14}/> } ],
      milestone:'Đọc hiểu 70% NHK Easy, viết được email xin phép nghỉ'
    },
    {
      phase:3, title:'Vượt Mốc N3 (Tháng 3)', icon:'🏆', color:'#f59e0b', method:'Output + Mock Test',
      desc:'Luyện đề thi N3, củng cố điểm yếu. Tập trung 50% thời gian vào Reading và Listening thực chiến.',
      tasks:[ { id:'p3t1', label:'Mock Test N3 (Reading 20p)', time:20, route:'/flashcards', icon:<Brain size={14}/> }, { id:'p3t2', label:'Shadowing audio N3', time:30, route:'/shadowing', icon:<Mic size={14}/> }, { id:'p3t3', label:'Ngữ pháp N3 ôn tổng hợp', time:30, route:'/grammar', icon:<BookOpen size={14}/> }, { id:'p3t4', label:'Viết bài luận ngắn 100 chữ', time:30, route:'/email', icon:<PencilLine size={14}/> } ],
      milestone:'Đạt 60+/120 điểm Mock Test N3 → Sẵn sàng thi'
    },
  ],
  N2: [
    {
      phase:1, title:'Củng Cố N3 + Bắt Đầu N2 (Tháng 1-2)', icon:'🧱', color:'#10b981', method:'SRS Interleaving',
      desc:'Song song ôn từ N3 bằng FSRS và học từ N2 mới. Bắt đầu đọc tài liệu công ty bằng tiếng Nhật.',
      tasks:[ { id:'n2p1t1', label:'FSRS: Ôn N3 + 8 từ N2 mới', time:25, route:'/flashcards', icon:<Brain size={14}/> }, { id:'n2p1t2', label:'Đọc bài báo tiếng Nhật', time:25, route:'/dictionary', icon:<BookOpen size={14}/> }, { id:'n2p1t3', label:'Shadowing tin tức bình thường', time:35, route:'/shadowing', icon:<Mic size={14}/> }, { id:'n2p1t4', label:'Viết email báo cáo công việc', time:30, route:'/email', icon:<PencilLine size={14}/> } ],
      milestone:'Nắm 500 từ N2, đọc hiểu email công ty 80%'
    },
    {
      phase:2, title:'Native Input (Tháng 3-4)', icon:'🎯', color:'#3b82f6', method:'Immersion + Active Output',
      desc:'Chuyển sang tài liệu người bản xứ hoàn toàn. Xem YouTube không phụ đề, đọc sách kinh doanh Nhật.',
      tasks:[ { id:'n2p2t1', label:'Xem YouTube JP 30p', time:30, route:'/shadowing', icon:<Mic size={14}/> }, { id:'n2p2t2', label:'FSRS hàng ngày', time:20, route:'/flashcards', icon:<Brain size={14}/> }, { id:'n2p2t3', label:'Ngữ pháp N2 nâng cao', time:20, route:'/grammar', icon:<BookOpen size={14}/> }, { id:'n2p2t4', label:'Viết báo cáo 200 chữ', time:30, route:'/email', icon:<PencilLine size={14}/> } ],
      milestone:'Hiểu 60% YouTube JP, viết báo cáo tự do'
    },
    {
      phase:3, title:'Làm Chủ N2 (Tháng 5-6)', icon:'🏆', color:'#8b5cf6', method:'Output + Mock Test',
      desc:'Giải đề thi thực tế, shadowing tốc độ 1.2x để tăng phản xạ.',
      tasks:[ { id:'n2p3t1', label:'Giải đề thi N2', time:30, route:'/flashcards', icon:<Brain size={14}/> }, { id:'n2p3t2', label:'Shadowing N2 tốc độ 1.2x', time:30, route:'/shadowing', icon:<Mic size={14}/> } ],
      milestone:'Đạt 90/180 điểm Mock Test N2'
    }
  ],
  N1: [
    {
      phase:1, title:'Xây nền N1 (Tháng 1-4)', icon:'🧱', color:'#8b5cf6', method:'Native Immersion + SRS Heavy',
      desc:'Đọc tiểu thuyết, báo chí chuyên ngành. Mỗi ngày thêm 15 từ N1 vào FSRS. Shadowing tin tức tốc độ gốc.',
      tasks:[ { id:'n1p1t1', label:'Đọc 10 trang tiểu thuyết/báo', time:30, route:'/dictionary', icon:<BookOpen size={14}/> }, { id:'n1p1t2', label:'FSRS: 15 từ N1/ngày', time:25, route:'/flashcards', icon:<Brain size={14}/> }, { id:'n1p1t3', label:'Shadowing tin tức NHK gốc', time:30, route:'/shadowing', icon:<Mic size={14}/> }, { id:'n1p1t4', label:'Viết bình luận 300 chữ', time:30, route:'/email', icon:<PencilLine size={14}/> } ],
      milestone:'2000 từ N1, đọc tài liệu học thuật 70%'
    },
  ]
};

const Roadmap = () => {
  const [profile, setProfile] = useState(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [formData, setFormData] = useState({ currentLevel: 'N4', goal: 'N3', timePerDay: 2 });
  const navigate = useNavigate();

  useEffect(() => {
    const p = getUserProfile();
    const activeGoal = p?.goal || p?.targetLevel;
    if (activeGoal) {
      setProfile({ ...p, goal: activeGoal });
    } else {
      setIsSettingUp(true);
    }
  }, []);

  const handleFinishSetup = () => {
    const newProfile = { 
      ...formData, 
      targetLevel: formData.goal,
      currentPhase: 0, 
      startDate: new Date().toISOString() 
    };
    const selectedGoal = GOALS.find(g => g.id === formData.goal);
    if(selectedGoal) newProfile.goalLabel = selectedGoal.label;
    
    saveUserProfile(newProfile);
    setProfile(newProfile);
    setIsSettingUp(false);
  };

  const handleConfigureNewRoadmap = () => {
    setSetupStep(1);
    setIsSettingUp(true);
  };
  const todayStats = getTodayStats();
  const handleResetCurrentRoadmap = () => {
    if (window.confirm(`Bạn có chắc muốn đặt lại ngày bắt đầu và học lại Lộ trình ${profile?.goal || 'hiện tại'} từ Phase 1 (Ngày 1)?`)) {
      const resetProf = {
        ...profile,
        currentPhase: 0,
        startDate: new Date().toISOString()
      };
      saveUserProfile(resetProf);
      setProfile(resetProf);
    }
  };

  const handleAdvance = () => {
    if (window.confirm("Chúc mừng bạn đã hoàn thành giai đoạn hiện tại! Bạn đã sẵn sàng chuyển sang giai đoạn tiếp theo chưa?")) {
      advancePhase();
      setProfile(getUserProfile());
    }
  };

  if (isSettingUp) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 10, color: 'var(--accent-primary)' }}>Khởi tạo Lộ trình Cá nhân</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>Hãy để OmniLinguist thiết kế lộ trình học phù hợp nhất với bạn.</p>

          {setupStep === 1 && (
            <div className="fade-in">
              <h3 style={{ marginBottom: 20 }}>Trình độ hiện tại của bạn là gì?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Mới bắt đầu / N5', 'Sơ cấp (N4)', 'Trung cấp (N3)', 'Cao cấp (N2)'].map((l, i) => {
                  const val = ['N5','N4','N3','N2'][i];
                  return (
                    <button key={val} onClick={() => { setFormData(f => ({ ...f, currentLevel: val })); setSetupStep(2); }} style={{ padding: 16, borderRadius: 10, background: formData.currentLevel === val ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', border: `1px solid ${formData.currentLevel === val ? '#60a5fa' : 'var(--glass-border)'}`, color: 'white', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s' }}>
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {setupStep === 2 && (
            <div className="fade-in">
              <h3 style={{ marginBottom: 20 }}>Mục tiêu bạn muốn đạt được?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {GOALS.map(g => (
                  <button key={g.id} onClick={() => { setFormData(f => ({ ...f, goal: g.id })); setSetupStep(3); }} style={{ padding: 16, borderRadius: 10, background: formData.goal === g.id ? `${g.color}33` : 'rgba(255,255,255,0.05)', border: `1px solid ${formData.goal === g.id ? g.color : 'var(--glass-border)'}`, color: 'white', cursor: 'pointer', fontSize: '1.05rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: g.color }}>{g.label}</span>
                      <span>{g.sub}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{g.months} tháng</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div className="fade-in">
              <h3 style={{ marginBottom: 20 }}>Thời gian học mỗi ngày?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
                {[1, 2, 3].map(h => (
                  <button key={h} onClick={() => setFormData(f => ({ ...f, timePerDay: h }))} style={{ padding: 16, borderRadius: 10, background: formData.timePerDay === h ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', border: `1px solid ${formData.timePerDay === h ? '#60a5fa' : 'var(--glass-border)'}`, color: 'white', cursor: 'pointer', fontSize: '1.05rem' }}>
                    {h} tiếng / ngày
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', padding: 18, fontSize: '1.1rem', fontWeight: 700 }} onClick={handleFinishSetup}>
                Tạo Lộ Trình Ngay <ArrowRight size={18} style={{ marginLeft: 8 }}/>
              </button>
            </div>
          )}

          {setupStep > 1 && (
            <button onClick={() => setSetupStep(s => s - 1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: 20, fontSize: '0.9rem' }}>
              ← Quay lại
            </button>
          )}

          {profile && (
            <div style={{ marginTop: 16 }}>
              <button 
                onClick={() => setIsSettingUp(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ✕ Hủy (Giữ lộ trình {profile.goal} hiện tại)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- SHOW ROADMAP ---
  if (!profile) return null;

  const goalInfo = GOALS.find(g => g.id === profile.goal) || GOALS[0];
  const phases = ROADMAP[profile.goal] || [];
  const currentPhaseIdx = profile.currentPhase || 0;
  
  // Tổng quan tiến độ
  const startDate = profile?.startDate ? new Date(profile.startDate) : new Date();
  const now = new Date();
  const validStartTime = isNaN(startDate.getTime()) ? now.getTime() : startDate.getTime();
  const daysActive = Math.max(1, Math.floor((now.getTime() - validStartTime) / 86400000) + 1);
  const totalDays = (goalInfo.months || 3) * 30;
  const progressPercent = Math.min(100, Math.round((daysActive / totalDays) * 100)) || 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header Overview */}
      <div className="glass-panel" style={{ marginBottom: 24, background: `linear-gradient(135deg, ${goalInfo.color}15, rgba(0,0,0,0.4))` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Flag color={goalInfo.color} size={24}/> Lộ trình {goalInfo.label} — {goalInfo.sub}
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Đầu vào: {profile.currentLevel} • Mục tiêu: {profile.goal} • {profile.timePerDay} tiếng/ngày
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button 
              onClick={handleConfigureNewRoadmap} 
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
              title="Đổi trình độ đầu vào hoặc chọn cấp độ mục tiêu mới"
            >
              ⚙️ Thiết Lập Lộ Trình Mới
            </button>

            <button 
              onClick={handleResetCurrentRoadmap} 
              style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '6px 12px', borderRadius: 8, color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.8rem' }}
              title="Học lại lộ trình hiện tại từ Ngày 1 (Phase 1)"
            >
              🔄 Học lại từ đầu
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Tiến độ thời gian: {daysActive} ngày / {totalDays} ngày</span>
          <strong style={{ color: goalInfo.color }}>{progressPercent}%</strong>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: goalInfo.color, transition: 'width 1s' }}/>
        </div>
      </div>

      {/* ============ NEW: PHÒNG LUYỆN TẬP & THỐNG KÊ HÔM NAY ============ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 20, marginBottom: 24 }}>
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

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Phase List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {phases.map((p, i) => {
            const isCompleted = i < currentPhaseIdx;
            const isActive = i === currentPhaseIdx;
            const isLocked = i > currentPhaseIdx;

            return (
              <div key={i} style={{ padding: '18px 20px', borderRadius: 12, border: `1px solid ${isActive ? p.color : isCompleted ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`, background: isActive ? `${p.color}15` : isCompleted ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)', transition: 'all 0.2s', position: 'relative' }}>
                {isCompleted && <div style={{ position: 'absolute', top: 16, right: 16, color: '#10b981' }}><CheckCircle2 size={20}/></div>}
                {isLocked && <div style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-secondary)' }}><Lock size={16}/></div>}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: '1.2rem', filter: isLocked ? 'grayscale(100%)' : 'none' }}>{p.icon}</span>
                  <strong style={{ color: isActive ? p.color : isCompleted ? '#10b981' : 'var(--text-secondary)', fontSize: '1rem' }}>{p.title}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: isActive ? 12 : 0 }}>
                  {isLocked ? 'Sẽ mở khóa sau khi hoàn thành giai đoạn trước.' : p.method}
                </div>

                {isActive && (
                  <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: `${p.color}15`, border: `1px solid ${p.color}44`, fontSize: '0.82rem', color: p.color, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Target size={16} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Đang học giai đoạn này:</strong> Tiến độ được tự động xác thực qua kết quả ôn luyện Flashcards & Shadowing của bạn.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Phase Details */}
        <div>
          {currentPhaseIdx < phases.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="glass-panel" style={{ borderLeft: `4px solid ${phases[currentPhaseIdx].color}` }}>
                <h3 style={{ color: phases[currentPhaseIdx].color, marginBottom: 10, fontSize: '1.05rem' }}>
                  Đang học: {phases[currentPhaseIdx].title}
                </h3>
                <div style={{ fontSize: '0.8rem', padding: '4px 10px', background: `${phases[currentPhaseIdx].color}22`, color: phases[currentPhaseIdx].color, borderRadius: 4, display: 'inline-block', marginBottom: 12, fontWeight: 600 }}>
                  Phương pháp: {phases[currentPhaseIdx].method}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {phases[currentPhaseIdx].desc}
                </p>
              </div>

              <div className="glass-panel">
                <h4 style={{ marginBottom: 14, fontSize: '0.95rem' }}>📅 Kế hoạch hàng ngày ({profile.timePerDay}h)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {phases[currentPhaseIdx].tasks.map((t, i) => (
                    <div key={i} onClick={() => navigate(t.route, { state: { level: profile.goal || profile.targetLevel || 'N3' } })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = phases[currentPhaseIdx].color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ color: phases[currentPhaseIdx].color }}>{t.icon}</div>
                        <span style={{ fontSize: '0.9rem' }}>{t.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.time} phút</span>
                        <ChevronRight size={14} color={phases[currentPhaseIdx].color}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: 12, background: `${phases[currentPhaseIdx].color}11`, border: `1px solid ${phases[currentPhaseIdx].color}33`, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.8rem', color: phases[currentPhaseIdx].color, fontWeight: 600, marginBottom: 4 }}>🏁 Mục tiêu vượt ải (Milestone)</div>
                  <div style={{ fontSize: '0.88rem' }}>{phases[currentPhaseIdx].milestone}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
              <h2 style={{ color: '#10b981', marginBottom: 10 }}>Chúc mừng bạn!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Bạn đã hoàn thành toàn bộ lộ trình {goalInfo.label}. Bạn đã sẵn sàng để thi JLPT hoặc sử dụng tiếng Nhật ở môi trường làm việc thực tế.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;

// Dashboard: Enterprise Command Center & Personalized Learning Telemetry (SLA + FSRS)
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, Flame, BookOpen, Mic, Brain, PencilLine, Map as MapIcon, ChevronRight, 
  AlertCircle, LogIn, UserPlus, CheckCircle2, History, BarChart2, ShieldCheck, 
  Sparkles, Layers, RefreshCw, Clock, Play, RotateCcw, Headphones, Award,
  ArrowUpRight, Zap, Check, ArrowRight, Activity, Calendar
} from 'lucide-react';
import { 
  getStats, getStreak, updateStreak, getUserProfile, getFreeStudyHistory, 
  getTodayStats, getImmersionStats 
} from './studyStore.js';
import { useAuth } from './AuthContext.jsx';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';
import AuthModal from './AuthModal.jsx';
import localMasterDb from './data/jlpt_master_db.json';
import { GOALS, ROADMAP } from './Roadmap.jsx';

// Interactive Weekly Study Activity SVG Chart
const SVGWeeklyActivity = ({ data }) => {
  const max = Math.max(...data.map(d => d.v), 1);
  const W = 280, H = 84;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      {data.map((d, i) => {
        const bW = (W / data.length) - 6;
        const bH = Math.max((d.v / max) * 58, 4);
        const x = i * (W / data.length) + 3;
        const isToday = d.today;
        return (
          <g key={i}>
            <rect 
              x={x} 
              y={H - 18 - bH} 
              width={bW} 
              height={bH} 
              rx={4} 
              fill={isToday ? 'var(--accent-primary, #3b82f6)' : 'var(--glass-border-strong, rgba(59,130,246,0.25))'}
            />
            <text 
              x={x + bW / 2} 
              y={H - 3} 
              textAnchor="middle" 
              fontSize={10} 
              fontWeight={isToday ? "700" : "500"}
              fill={isToday ? 'var(--accent-primary, #3b82f6)' : 'var(--text-tertiary)'}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DEFAULT_WEEK_DATA = WEEK_DAYS.map((label, i) => ({ 
  label, 
  v: [35, 80, 65, 110, 95, 40, 75][i], 
  today: i === (new Date().getDay() + 6) % 7 
}));

const QUICK_ACTIONS = [
  { icon: <MapIcon size={17} />, label: 'Lộ Trình Cá Nhân', sub: 'Adaptive Roadmap', route: '/roadmap', color: '#f59e0b' },
  { icon: <Brain size={17} />, label: 'Flashcards FSRS', sub: 'Spaced Repetition', route: '/flashcards', color: '#3b82f6' },
  { icon: <BookOpen size={17} />, label: 'Đọc Hiểu i+1', sub: 'Immersion Reader', route: '/reading', color: '#10b981' },
  { icon: <Mic size={17} />, label: 'Shadowing Studio', sub: 'Luyện Phát Âm AI', route: '/shadowing', color: '#8b5cf6' },
  { icon: <PencilLine size={17} />, label: 'Luyện Viết Kanji', sub: 'Kanji Stroke Engine', route: '/kanji', color: '#ec4899' },
  { icon: <Play size={17} />, label: 'Anki Sandbox', sub: 'Anki Deck Offline', route: '/sandbox', color: '#06b6d4' },
];

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const LEVEL_COLORS = { N5: '#10b981', N4: '#3b82f6', N3: '#f59e0b', N2: '#8b5cf6', N1: '#ef4444' };

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
  const immersionStats = getImmersionStats();

  useEffect(() => {
    setStreak(updateStreak());
    const p = getUserProfile();
    setProfile(p);

    const seen = new Set();
    const effectiveVocab = vocabData.length >= 50 ? vocabData : (localMasterDb.vocabulary || []);
    const targetLvl = p?.goal || p?.targetLevel || 'N3';
    const targetVocab = effectiveVocab.filter(v => {
      if ((v.level || 'N3') !== targetLvl || seen.has(v.word)) return false;
      seen.add(v.word); 
      return true;
    });
    setDueStats(getStats(targetVocab.map(v => v.id), isGuest ? 'freestudy' : 'roadmap'));
  }, [vocabData, isGuest]);

  // Roadmap & Sprint Calculations
  const goalLabel = profile?.goal || profile?.targetLevel || 'N3';
  const goalInfo = GOALS.find(g => g.id === goalLabel) || GOALS[1];
  const phases = ROADMAP[goalLabel] || ROADMAP['N3'] || [];
  const currentPhaseIdx = Math.min(profile?.currentPhase || 0, Math.max(0, phases.length - 1));
  const activePhase = phases[currentPhaseIdx] || phases[0];

  const startDate = profile?.startDate ? new Date(profile.startDate) : new Date();
  const now = new Date();
  const validStartTime = isNaN(startDate.getTime()) ? now.getTime() : startDate.getTime();
  const daysActive = Math.max(1, Math.floor((now.getTime() - validStartTime) / 86400000) + 1);
  const totalDays = (goalInfo?.months || 6) * 30;
  const roadmapPercent = Math.min(100, Math.round((daysActive / totalDays) * 100)) || 0;
  const retentionRate = todayStats.total > 0 ? Math.round((todayStats.correct / todayStats.total) * 100) : 92;

  // Next Best Action Recommender (Decision Engine)
  const nextAction = useMemo(() => {
    if (dueStats.dueCount > 0) {
      return {
        tag: 'ƯU TIÊN SỐ 1 · THẺ SRS ĐẾN HẠN',
        tagColor: '#ef4444',
        title: `Ôn tập ${dueStats.dueCount} thẻ FSRS cần củng cố ngay`,
        desc: 'Thuật toán FSRS phát hiện các thẻ này đang ở ngưỡng suy giảm trí nhớ (Forgetting Curve). Ôn tập ngay hôm nay để duy trì tỷ lệ nhớ 90%+.',
        btnText: 'Bắt Đầu Ôn Tập Thẻ',
        icon: <Brain size={16} />,
        action: () => navigate('/flashcards', { state: { studyMode: 'fsrs', filterMode: 'due' } })
      };
    }
    if (immersionStats.todayListeningMinutes < 20) {
      return {
        tag: 'THỤ ĐẮC INPUT · LUYỆN NGHE',
        tagColor: '#3b82f6',
        title: 'Nạp 20-30 phút Nghe Ngấm (Comprehensible Input)',
        desc: `Hôm nay bạn đã nghe ${immersionStats.todayListeningMinutes}/30 phút. Hãy bật Shadowing Studio để luyện phản xạ tai nghe tự nhiên.`,
        btnText: 'Mở Shadowing Studio',
        icon: <Headphones size={16} />,
        action: () => navigate('/shadowing')
      };
    }
    if (immersionStats.todayReadingWords < 300) {
      return {
        tag: 'ĐỌC HIỂU i+1 · NẠP TỪ VỰNG',
        tagColor: '#10b981',
        title: 'Đọc 1 bài truyện Ehon hoặc Tin tức song ngữ i+1',
        desc: `Hôm nay bạn đã đọc ${immersionStats.todayReadingWords}/500 từ. Hãy tiếp tục tắm ngôn ngữ qua thư viện Ehon đa phương thức.`,
        btnText: 'Vào Thư Viện Đọc i+1',
        icon: <BookOpen size={16} />,
        action: () => navigate('/reading')
      };
    }
    return {
      tag: 'XUẤT SẮC · HOÀN THÀNH CHỈ TIÊU NGÀY',
      tagColor: '#8b5cf6',
      title: 'Mục tiêu hôm nay đã hoàn thành xuất sắc!',
      desc: 'Tất cả thẻ SRS, thời lượng nghe ngấm và đọc hiểu đều đạt chuẩn. Bạn có thể luyện thêm bài kiểm tra thử hoặc ôn lại thẻ khó.',
      btnText: 'Phòng Luyện Đề Mock Test',
      icon: <Award size={16} />,
      action: () => navigate('/mocktest')
    };
  }, [dueStats.dueCount, immersionStats.todayListeningMinutes, immersionStats.todayReadingWords, navigate]);

  // Tiến độ từng level (N5 -> N1)
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

    logs.sort((a, b) => b.lastPracticed - a.lastPracticed);
    return logs.slice(0, 30);
  }, [vocabData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 40, maxWidth: 1380, margin: '0 auto' }}>
      
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. EXECUTIVE HEADER STRIP: ACCOUNT STATUS & QUICK LAUNCH */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '10px 4px 0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent-primary, #3b82f6) 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(59,130,246,0.25)'
          }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.3 }}>
                OmniLinguist Command Center
              </h2>
              {isGuest ? (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 8px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.3)' }}>
                  🟢 Guest Mode (Offline DB)
                </span>
              ) : (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '1px 8px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)' }}>
                  ⚡ Cloud Synced ({user?.email || 'Active User'})
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              Bảng điều khiển chỉ số học tập thông minh · Chuẩn thụ đắc Stephen Krashen & thuật toán FSRS
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isGuest && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowAuthModal(true)}
              style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <UserPlus size={14} /> Đồng Bộ Cloud
            </button>
          )}
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/roadmap')}
            style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MapIcon size={14} /> Quản Lý Lộ Trình <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. EXECUTIVE KPI STRIP (4-COLUMN HIGH-DENSITY METRICS BAR)      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12
      }}>
        {/* KPI 1: Streak */}
        <div className="glass-panel" style={{
          padding: '14px 16px',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: '4px solid #f97316'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Flame size={15} color="#f97316" /> Chuỗi Ngày Kỷ Luật
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
              {streak > 0 ? 'Đang cháy' : 'Hôm nay'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f97316', lineHeight: 1, fontFamily: 'monospace' }}>
              {streak}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ngày liên tiếp</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            {streak > 3 ? 'Phản xạ tiếng Nhật đang ổn định rất tốt' : 'Hoàn thành 1 bài học để tăng chuỗi'}
          </div>
        </div>

        {/* KPI 2: Roadmap Target & Phase */}
        <div className="glass-panel" style={{
          padding: '14px 16px',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: `4px solid ${goalInfo?.color || '#3b82f6'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Target size={15} color={goalInfo?.color || '#3b82f6'} /> Lộ Trình Mục Tiêu
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: `${goalInfo?.color || '#3b82f6'}22`, color: goalInfo?.color || '#3b82f6' }}>
              {goalInfo?.label || 'JLPT'} ({goalInfo?.sub || ''})
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              Phase {currentPhaseIdx + 1}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/ {phases.length} giai đoạn</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Đã tích lũy {daysActive} ngày · Tiến độ tổng: {roadmapPercent}%
          </div>
        </div>

        {/* KPI 3: FSRS Memory & Due Cards */}
        <div className="glass-panel" style={{
          padding: '14px 16px',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: `4px solid ${dueStats.dueCount > 0 ? '#ef4444' : '#10b981'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Brain size={15} color="#3b82f6" /> Trí Nhớ FSRS Đến Hạn
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 4,
              background: dueStats.dueCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
              color: dueStats.dueCount > 0 ? '#ef4444' : '#10b981'
            }}>
              {dueStats.dueCount > 0 ? 'Cần ôn ngay' : 'Đã sạch thẻ'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: dueStats.dueCount > 0 ? '#ef4444' : '#10b981',
              lineHeight: 1,
              fontFamily: 'monospace'
            }}>
              {dueStats.dueCount}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>thẻ đến hạn</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            {dueStats.learnedCount} thẻ đã thuộc · Tỷ lệ nhớ: ~{retentionRate}%
          </div>
        </div>

        {/* KPI 4: Krashen SLA Immersion */}
        <div className="glass-panel" style={{
          padding: '14px 16px',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: `4px solid ${immersionStats.levelColor}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Headphones size={15} color={immersionStats.levelColor} /> Thụ Đắc Ngôn Ngữ SLA
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 4,
              background: `${immersionStats.levelColor}22`,
              color: immersionStats.levelColor
            }}>
              Level {immersionStats.slaLevel}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: immersionStats.levelColor, lineHeight: 1, fontFamily: 'monospace' }}>
              {immersionStats.totalImmersionHours}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>giờ tích lũy</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Hôm nay: {immersionStats.todayListeningMinutes}p nghe · {immersionStats.todayReadingWords} từ đọc
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3. MAIN DASHBOARD TAB SWITCHER                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--glass-border)', paddingBottom: 6 }}>
        <button 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('overview')}
          style={{ padding: '7px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8 }}
        >
          <BarChart2 size={15} /> Tổng Quan & Điều Phối Sprint
        </button>
        <button 
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('history')}
          style={{ padding: '7px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8 }}
        >
          <History size={15} /> Nhật Ký Hoạt Động ({recentHistoryLogs.length})
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 4. DYNAMIC "NEXT BEST ACTION" & SPRINT CONTROLLER (ENTERPRISE)  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="glass-panel" style={{
            padding: '18px 20px',
            borderRadius: 14,
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            {/* Top row: Next Best Action Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 10,
              background: 'var(--bg-hover)',
              border: `1px solid ${nextAction.tagColor}44`
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 260 }}>
                <div style={{
                  padding: 8,
                  borderRadius: 8,
                  background: `${nextAction.tagColor}22`,
                  color: nextAction.tagColor,
                  display: 'flex',
                  marginTop: 2
                }}>
                  {nextAction.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      color: nextAction.tagColor
                    }}>
                      ⚡ {nextAction.tag}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {nextAction.title}
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {nextAction.desc}
                  </p>
                </div>
              </div>

              <button
                onClick={nextAction.action}
                className="btn btn-primary"
                style={{
                  padding: '9px 18px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 8
                }}
              >
                <span>{nextAction.btnText}</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Bottom row: Mini Sprint Task Checklist */}
            {activePhase?.tasks && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                borderTop: '1px solid var(--glass-border)',
                paddingTop: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    🎯 Nhiệm vụ Sprint Phase {currentPhaseIdx + 1}: {activePhase.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    Kế hoạch: {profile?.timePerDay || 2} giờ/ngày
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 8
                }}>
                  {activePhase.tasks.map((task, idx) => (
                    <div
                      key={task.id || idx}
                      onClick={() => navigate(task.route, { state: { level: goalLabel } })}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = activePhase?.color || 'var(--accent-primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: activePhase?.color || 'var(--accent-primary)' }}>{task.icon}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {task.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        ⏱ {task.time}p
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 5. DUAL WORKSPACE: SLA TELEMETRY + FSRS WORKOUT MATRIX         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 16
          }}>
            {/* CỘT TRÁI: STEPHEN KRASHEN COMPREHENSIBLE INPUT & SLA (THEME ADAPTIVE) */}
            <div className="glass-panel" style={{
              padding: '18px 20px',
              borderRadius: 14,
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Headphones size={18} color="var(--accent-primary, #3b82f6)" />
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Thụ Đắc Ngôn Ngữ Tự Nhiên (SLA)
                  </h3>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: immersionStats.levelColor,
                  background: `${immersionStats.levelColor}18`,
                  padding: '2px 8px',
                  borderRadius: 6
                }}>
                  {immersionStats.levelTitle}
                </span>
              </div>

              {/* Progress to Next Milestone */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 5 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Tích lũy: <strong style={{ color: 'var(--text-primary)' }}>{immersionStats.totalImmersionHours}h</strong>
                  </span>
                  <span style={{ color: immersionStats.levelColor, fontWeight: 700 }}>
                    Mục tiêu mốc tiếp theo: {immersionStats.nextMilestone}h ({immersionStats.progressInLevel}%)
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: 6,
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${immersionStats.progressInLevel}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, #3b82f6, ${immersionStats.levelColor})`,
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* 2 Telemetry Cards: Listening & Reading */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Listening Box */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 8
                }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <Headphones size={13} /> Nghe Ngấm Hôm Nay
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                      {immersionStats.todayListeningMinutes} <span style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>/ 30p</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 3 }}>
                      Tổng: {immersionStats.totalListeningHours} giờ nghe
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/shadowing')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: 'rgba(59,130,246,0.15)',
                      border: '1px solid rgba(59,130,246,0.3)',
                      color: 'var(--accent-primary)',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    Luyện Nghe <ChevronRight size={13} />
                  </button>
                </div>

                {/* Reading Box */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 8
                }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <BookOpen size={13} /> Đọc Hiểu i+1 Hôm Nay
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                      {immersionStats.todayReadingWords} <span style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>/ 500 từ</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 3 }}>
                      Tổng: {immersionStats.totalReadingWords} từ đã đọc
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/reading')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: 'rgba(16,185,129,0.15)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      color: '#10b981',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    Kho Đọc i+1 <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {/* Stephen Krashen SLA Note */}
              <div style={{
                padding: '8px 12px',
                background: 'var(--bg-hover)',
                borderRadius: 8,
                borderLeft: '3px solid var(--accent-primary)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45
              }}>
                💡 <strong>Nguyên lý i+1:</strong> Tiếp nhận thông điệp có độ khó cao hơn trình độ hiện tại 1 bậc qua truyện tranh, sách nói và podcast để não bộ tự hấp thu từ vựng.
              </div>
            </div>

            {/* CỘT PHẢI: FSRS MEMORY & TARGETED WORKOUT HUB */}
            <div className="glass-panel" style={{
              padding: '18px 20px',
              borderRadius: 14,
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={18} color="#f59e0b" />
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Phòng Luyện Tập & Ôn Thẻ FSRS
                  </h3>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Hôm nay: <strong style={{ color: 'var(--text-primary)' }}>{todayStats.total}</strong> thẻ lật
                </span>
              </div>

              {/* Today's Stats Bar */}
              <div style={{
                padding: '10px 14px',
                background: 'var(--bg-hover)',
                borderRadius: 8,
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 5 }}>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Tốt / Dễ ({todayStats.correct})</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>Khó / Sai ({todayStats.incorrect})</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${todayStats.total ? (todayStats.correct / todayStats.total) * 100 : 0}%`, background: '#10b981', transition: 'width 0.4s' }} />
                  <div style={{ width: `${todayStats.total ? (todayStats.incorrect / todayStats.total) * 100 : 0}%`, background: '#ef4444', transition: 'width 0.4s' }} />
                </div>
              </div>

              {/* 3 Compact Focused Workout Tiles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Tile 1: Weak points */}
                <div
                  onClick={() => navigate('/flashcards', { state: { studyMode: 'fsrs', filterMode: 'hard_only' } })}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ padding: 6, background: 'rgba(239,68,68,0.15)', borderRadius: 6, color: '#ef4444', display: 'flex' }}>
                      <AlertCircle size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>Khắc Phục Điểm Yếu</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Lọc các thẻ hay quên & độ khó cao (Difficulty &gt; 7)</div>
                    </div>
                  </div>
                  <ChevronRight size={15} color="#ef4444" />
                </div>

                {/* Tile 2: Easy cards */}
                <div
                  onClick={() => navigate('/flashcards', { state: { studyMode: 'fsrs', filterMode: 'easy_only' } })}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ padding: 6, background: 'rgba(16,185,129,0.15)', borderRadius: 6, color: '#10b981', display: 'flex' }}>
                      <CheckCircle2 size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ôn Tập Nhẹ Nhàng</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Lướt nhanh củng cố các thẻ dễ nhớ (Difficulty &lt; 4)</div>
                    </div>
                  </div>
                  <ChevronRight size={15} color="#10b981" />
                </div>

                {/* Tile 3: Full sweep */}
                <div
                  onClick={() => navigate('/flashcards', { state: { studyMode: 'fsrs', filterMode: 'sort_easy_to_hard' } })}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: 'rgba(139,92,246,0.08)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#8b5cf6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ padding: 6, background: 'rgba(139,92,246,0.15)', borderRadius: 6, color: '#8b5cf6', display: 'flex' }}>
                      <Layers size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quét Toàn Diện (Dễ ➔ Khó)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Duyệt toàn bộ kho thẻ theo thứ tự độ khó tăng dần</div>
                    </div>
                  </div>
                  <ChevronRight size={15} color="#8b5cf6" />
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 6. LEVEL MASTERY PROGRESS MATRIX (JLPT N5 ➔ N1)                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="glass-panel" style={{
            padding: '18px 20px',
            borderRadius: 14,
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={17} color="var(--accent-primary, #3b82f6)" />
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Tiến Độ Làm Chủ Vốn Từ Toàn Kho (JLPT N5 ➔ N1)
                </h3>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                Dữ liệu FSRS & Free Study tổng hợp
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {JLPT_LEVELS.map(lvl => {
                const prog = levelProgress[lvl] || { learned: 0, total: 1 };
                const pct = Math.min(Math.round((prog.learned / (prog.total || 1)) * 100), 100);
                const color = LEVEL_COLORS[lvl] || '#3b82f6';
                const isCurrentGoal = lvl === goalLabel;

                return (
                  <div 
                    key={lvl} 
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: isCurrentGoal ? 'var(--bg-hover)' : 'var(--bg-surface)',
                      border: `1px solid ${isCurrentGoal ? color : 'var(--glass-border)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: `${color}22`,
                          color
                        }}>
                          {lvl}
                        </span>
                        {isCurrentGoal && (
                          <span style={{ fontSize: '0.66rem', fontWeight: 700, color, background: 'var(--bg-hover)', padding: '1px 4px', borderRadius: 3 }}>
                            Mục tiêu
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {pct}%
                      </span>
                    </div>

                    <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.4s ease' }} />
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Đã nạp: <strong style={{ color: 'var(--text-secondary)' }}>{prog.learned}</strong> từ</span>
                      <span>Tổng: {prog.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 7. QUICK ACCESS LAUNCHER & WEEKLY ACTIVITY                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16
          }}>
            {/* Quick Links */}
            <div className="glass-panel" style={{
              padding: '18px 20px',
              borderRadius: 14,
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={16} color="#f59e0b" /> Trạm Khởi Động Nhanh (Quick Launch)
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {QUICK_ACTIONS.map((q, i) => (
                  <div 
                    key={i} 
                    onClick={() => navigate(q.route)} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 8,
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = q.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                  >
                    <div style={{ color: q.color, display: 'flex' }}>{q.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {q.label}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                        {q.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Biometrics Activity */}
            <div className="glass-panel" style={{
              padding: '18px 20px',
              borderRadius: 14,
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={16} color="var(--accent-primary, #3b82f6)" /> Nhịp Độ Hoạt Động Tuần Này
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    Hôm nay: {WEEK_DAYS[(new Date().getDay() + 6) % 7]}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Thời lượng duy trì tiếp xúc tiếng Nhật liên tục theo chu kỳ 7 ngày
                </p>
              </div>

              <SVGWeeklyActivity data={DEFAULT_WEEK_DATA} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--bg-hover)',
                borderRadius: 8,
                fontSize: '0.74rem'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mục tiêu tối thiểu: <strong>30 phút/ngày</strong></span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Đạt chuẩn kỷ luật</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ═══════════════════════════════════════════════════════════════ */
        /* TAB 2: NHẬT KÝ HOẠT ĐỘNG THỜI GIAN THỰC (STUDY TIMELINE)       */
        /* ═══════════════════════════════════════════════════════════════ */
        <div className="glass-panel" style={{
          padding: '20px 22px',
          borderRadius: 14,
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              <Clock size={18} color="#34d399" />
              Nhật Ký Học Tập Thời Gian Thực (Activity Logs)
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
              Hiển thị 30 phiên tương tác gần nhất
            </span>
          </div>

          {recentHistoryLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
              Chưa có lịch sử học tập trên thiết bị này. Hãy bắt đầu học Flashcard hoặc Luyện tập để xem nhật ký!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentHistoryLogs.map((log, idx) => {
                const lvlColor = LEVEL_COLORS[log.level] || '#3b82f6';
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 4,
                        background: `${lvlColor}22`,
                        color: lvlColor
                      }}>
                        {log.level}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }} className="jp-text">
                          {log.word} {log.reading ? `(${log.reading})` : ''}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {log.meaning}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '0.76rem',
                        color: log.correct > 0 ? '#10b981' : '#ef4444',
                        fontWeight: 700
                      }}>
                        Đúng: {log.correct} · Sai: {log.incorrect}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {log.lastPracticed.toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                );
              })}
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


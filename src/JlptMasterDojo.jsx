// src/JlptMasterDojo.jsx
// Trung tâm Lò Luyện Thi JLPT Toàn Diện (JLPT Master Dojo)
// Trục 1: Bản lề Quốc dân Minna no Nihongo (Bài 1 - 50)
// Trục 2: Lò Luyện Đỉnh Cao Shin Kanzen Master (N3, N2, N1 - 5 Lĩnh Vực)
// Trục 3: Phòng Thi Thật 10 Năm (2014 - 2024 - Bấm giờ & Scaled Score)

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Target, Award, Timer, CheckCircle, XCircle, Search, 
  HelpCircle, Volume2, ShieldAlert, Sparkles, ChevronRight, Filter, 
  ArrowRight, Layers, Play, Check, AlertCircle, Compass, Zap
} from 'lucide-react';
import FuriganaText from './components/FuriganaText';
import ExamSimulatorModal from './components/jlpt/ExamSimulatorModal';

// Nạp dữ liệu giáo trình chuẩn hóa
import minnaCorpus from './data/curriculum/minna_master_50.json';
import n3FoundationLessons from './data/curriculum/n3_foundation_lessons.json';
import n2FoundationLessons from './data/curriculum/n2_foundation_lessons.json';
import n1FoundationLessons from './data/curriculum/n1_foundation_lessons.json';
import shinkanzenN3 from './data/curriculum/shinkanzen_n3.json';
import shinkanzenN2 from './data/curriculum/shinkanzen_n2.json';
import shinkanzenN1 from './data/curriculum/shinkanzen_n1.json';
import pastExamsData from './data/curriculum/jlpt_past_exams_10yr.json';

import MindmapCanvasModal from './components/jlpt/MindmapCanvasModal';
import MindmapAtlasModal from './components/jlpt/MindmapAtlasModal';

export default function JlptMasterDojo() {
  // Navigation Tabs: 'minna' | 'n3' | 'n2' | 'n1' | 'exams'
  const [mainTab, setMainTab] = useState('minna');

  // ---------- STATE: MINNA 1-50 ----------
  const [minnaFilter, setMinnaFilter] = useState('all'); // 'all' | 'n5' | 'n4'
  const [selectedLessonNum, setSelectedLessonNum] = useState(1);
  const [minnaSearch, setMinnaSearch] = useState('');
  const [minnaQuizAnswer, setMinnaQuizAnswer] = useState({});

  // ---------- STATE: DUAL-TRACK N3, N2, N1 ----------
  const [subMode, setSubMode] = useState('foundation'); // 'foundation' | 'combat'
  const [selectedFoundationLessonNum, setSelectedFoundationLessonNum] = useState(51);
  const [foundationSearch, setFoundationSearch] = useState('');
  const [foundationQuizAnswer, setFoundationQuizAnswer] = useState({});

  // ---------- STATE: MINDMAP ATLAS & CANVAS ----------
  const [activeMindmapLesson, setActiveMindmapLesson] = useState(null);
  const [showAtlasModal, setShowAtlasModal] = useState(false);

  // ---------- STATE: SHINKANZEN COMBAT (N3, N2, N1) ----------
  const [shinkanzenSkill, setShinkanzenSkill] = useState('grammar'); // 'grammar' | 'reading' | 'listening'
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [shinkanzenQuizAnswer, setShinkanzenQuizAnswer] = useState({});

  // ---------- STATE: PAST EXAMS 10 YEARS ----------
  const [examLevelFilter, setExamLevelFilter] = useState('all');
  const [examYearFilter, setExamYearFilter] = useState('all');
  const [activeExamForModal, setActiveExamForModal] = useState(null);

  // Play audio helper
  const speakJapanese = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trọn bộ 120 bài học liên hoàn N5 - N1
  const all120Lessons = useMemo(() => [
    ...minnaCorpus,
    ...n3FoundationLessons,
    ...n2FoundationLessons,
    ...n1FoundationLessons
  ], []);

  // Filtered Minna Lessons
  const filteredMinnaLessons = useMemo(() => {
    return minnaCorpus.filter(l => {
      if (minnaFilter === 'n5' && l.level !== 'N5') return false;
      if (minnaFilter === 'n4' && l.level !== 'N4') return false;
      if (minnaSearch) {
        const q = minnaSearch.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          l.jpTitle.toLowerCase().includes(q) ||
          l.viTitle.toLowerCase().includes(q) ||
          l.pillar.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [minnaFilter, minnaSearch]);

  const activeLesson = useMemo(() => {
    return minnaCorpus.find(l => l.lessonNumber === selectedLessonNum) || minnaCorpus[0];
  }, [selectedLessonNum]);

  // Current Foundation List for N3, N2, N1
  const currentFoundationList = useMemo(() => {
    if (mainTab === 'n3') return n3FoundationLessons;
    if (mainTab === 'n2') return n2FoundationLessons;
    if (mainTab === 'n1') return n1FoundationLessons;
    return n3FoundationLessons;
  }, [mainTab]);

  const filteredFoundationLessons = useMemo(() => {
    if (!foundationSearch) return currentFoundationList;
    const q = foundationSearch.toLowerCase();
    return currentFoundationList.filter(l => 
      l.title.toLowerCase().includes(q) ||
      l.jpTitle.toLowerCase().includes(q) ||
      l.viTitle.toLowerCase().includes(q) ||
      (l.pillar && l.pillar.toLowerCase().includes(q))
    );
  }, [currentFoundationList, foundationSearch]);

  const activeFoundationLesson = useMemo(() => {
    return currentFoundationList.find(l => l.lessonNumber === selectedFoundationLessonNum) || currentFoundationList[0];
  }, [currentFoundationList, selectedFoundationLessonNum]);

  // Current Shinkanzen Data
  const currentShinkanzenData = useMemo(() => {
    if (mainTab === 'n3') return shinkanzenN3;
    if (mainTab === 'n2') return shinkanzenN2;
    if (mainTab === 'n1') return shinkanzenN1;
    return shinkanzenN3;
  }, [mainTab]);

  const currentGrammarChapter = currentShinkanzenData?.skills?.grammar?.[selectedChapterIdx] || currentShinkanzenData?.skills?.grammar?.[0];
  const activeGrammarPoint = currentGrammarChapter?.points?.find(p => p.id === selectedPointId) || currentGrammarChapter?.points?.[0];

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return pastExamsData.filter(e => {
      if (examLevelFilter !== 'all' && e.level !== examLevelFilter) return false;
      if (examYearFilter !== 'all' && e.year !== Number(examYearFilter)) return false;
      return true;
    });
  }, [examLevelFilter, examYearFilter]);

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto', color: 'var(--text-primary)' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
        border: '1px solid var(--glass-border-strong)',
        borderRadius: 16,
        padding: '24px 30px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 20
            }}>
              OFFICIAL CURRICULUM DOJO
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              Giáo trình Shin Kanzen Master & Minna No Nihongo Toàn Diện
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            🏛️ Lò Luyện Thi JLPT Toàn Diện (JLPT Master Dojo)
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Đại hệ thống 120 bài học bản lề N5–N1 • Bách khoa Sơ đồ tư duy Mindmap AI • Bẻ khóa bẫy đề thi Shinkanzen • Phòng thi thật 10 năm (2014–2024).
          </p>
        </div>

        {/* Global Statistics & Mindmap Atlas Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAtlasModal(true)}
            style={{
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(236, 72, 153, 0.45)',
              transition: 'all 0.2s ease'
            }}
          >
            <Compass size={18} />
            🗺️ BÁCH KHOA MINDMAP ATLAS (N5 – N1)
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '8px 14px', borderRadius: 10, textAlign: 'center', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>120</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Bài Bản Lề (N5-N1)</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '8px 14px', borderRadius: 10, textAlign: 'center', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ec4899' }}>120</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Trang Mindmap AI</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '8px 14px', borderRadius: 10, textAlign: 'center', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>480+</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Mẫu Bẫy N3-N1</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '8px 14px', borderRadius: 10, textAlign: 'center', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>63</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Đề Thi 10 Năm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '2px solid var(--glass-border)',
        paddingBottom: 12,
        marginBottom: 24,
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setMainTab('minna')}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: mainTab === 'minna' ? '#10b981' : 'var(--bg-elevated)',
            color: mainTab === 'minna' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease'
          }}
        >
          🌱 Bản Lề Minna No Nihongo (Bài 1–50)
        </button>

        <button
          onClick={() => { setMainTab('n3'); setSelectedFoundationLessonNum(51); setSelectedChapterIdx(0); setSelectedPointId(null); }}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: mainTab === 'n3' ? '#f59e0b' : 'var(--bg-elevated)',
            color: mainTab === 'n3' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease'
          }}
        >
          🥋 Lò Luyện N3 (Bản Lề + Shinkanzen)
        </button>

        <button
          onClick={() => { setMainTab('n2'); setSelectedFoundationLessonNum(76); setSelectedChapterIdx(0); setSelectedPointId(null); }}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: mainTab === 'n2' ? '#8b5cf6' : 'var(--bg-elevated)',
            color: mainTab === 'n2' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease'
          }}
        >
          ⚔️ Lò Luyện N2 (Bản Lề + Shinkanzen)
        </button>

        <button
          onClick={() => { setMainTab('n1'); setSelectedFoundationLessonNum(101); setSelectedChapterIdx(0); setSelectedPointId(null); }}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: mainTab === 'n1' ? '#ef4444' : 'var(--bg-elevated)',
            color: mainTab === 'n1' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease'
          }}
        >
          👑 Lò Luyện N1 (Bản Lề + Shinkanzen)
        </button>

        <button
          onClick={() => setMainTab('exams')}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: mainTab === 'exams' ? '#2563eb' : 'var(--bg-elevated)',
            color: mainTab === 'exams' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease'
          }}
        >
          ⏱️ Phòng Thi Thật 10 Năm (2014–2024)
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PHÂN HỆ BẢN LỀ MINNA NO NIHONGO (BÀI 1 - 50)            */}
      {/* ============================================================== */}
      {mainTab === 'minna' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Left Column: Lesson Directory */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>📚 Mục Lục 50 Bài</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{filteredMinnaLessons.length} bài</span>
            </div>

            {/* Filter Buttons: All, N5 (1-25), N4 (26-50) */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <button
                onClick={() => setMinnaFilter('all')}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  fontSize: '0.8rem',
                  borderRadius: 6,
                  border: 'none',
                  background: minnaFilter === 'all' ? '#10b981' : 'var(--bg-elevated)',
                  color: minnaFilter === 'all' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Tất Cả (50)
              </button>
              <button
                onClick={() => setMinnaFilter('n5')}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  fontSize: '0.8rem',
                  borderRadius: 6,
                  border: 'none',
                  background: minnaFilter === 'n5' ? '#10b981' : 'var(--bg-elevated)',
                  color: minnaFilter === 'n5' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Tập 1 (1–25)
              </button>
              <button
                onClick={() => setMinnaFilter('n4')}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  fontSize: '0.8rem',
                  borderRadius: 6,
                  border: 'none',
                  background: minnaFilter === 'n4' ? '#10b981' : 'var(--bg-elevated)',
                  color: minnaFilter === 'n4' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Tập 2 (26–50)
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Tìm bài học, chủ điểm, ngữ pháp..."
                value={minnaSearch}
                onChange={e => setMinnaSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 8,
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Lesson List */}
            <div style={{ maxHeight: '680px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4 }}>
              {filteredMinnaLessons.map(lesson => {
                const isSelected = lesson.lessonNumber === selectedLessonNum;
                return (
                  <button
                    key={lesson.lessonNumber}
                    onClick={() => setSelectedLessonNum(lesson.lessonNumber)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #10b981' : '1px solid var(--glass-border)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-elevated)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          background: lesson.level === 'N5' ? '#10b981' : '#3b82f6',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4
                        }}>
                          {lesson.level}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Bài {lesson.lessonNumber}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {lesson.viTitle}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        Trụ cột: {lesson.pillar}
                      </div>
                    </div>
                    <ChevronRight size={16} color={isSelected ? '#10b981' : 'var(--text-tertiary)'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Lesson Content */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: 28 }}>
            {/* Lesson Title Header */}
            <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{
                  background: activeLesson.level === 'N5' ? '#10b981' : '#3b82f6',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6
                }}>
                  {activeLesson.level} • GIÁO TRÌNH MINNA NO NIHONGO
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  Trụ cột: <strong>{activeLesson.pillar}</strong>
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                {activeLesson.title}
              </h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {activeLesson.summary}
              </p>
            </div>

            {/* Sơ đồ tư duy (Tree Mindmap Box) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(99, 102, 241, 0.08))',
              border: '1.5px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 14,
              padding: 20,
              marginBottom: 24,
              boxShadow: '0 4px 20px rgba(56, 189, 248, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#38bdf8', fontSize: '1.05rem' }}>
                  <Compass size={20} /> SƠ ĐỒ TƯ DUY BẢN LỀ (TREE MINDMAP): {activeLesson.mindmap.center}
                </div>
                <button
                  onClick={() => setActiveMindmapLesson(activeLesson)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(14, 165, 233, 0.35)'
                  }}
                >
                  <Sparkles size={15} /> 🗺️ Mở Sơ Đồ Tư Duy Mindmap AI (Toàn Màn Hình)
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, fontSize: '0.9rem' }}>
                {activeLesson.mindmap.branches.map((branch, bIdx) => {
                  const bName = typeof branch === 'object' ? branch.name : branch;
                  const bFormula = typeof branch === 'object' ? branch.formula : null;
                  return (
                    <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                      <span style={{ color: '#38bdf8', fontWeight: 800 }}>•</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{bName}</strong>
                      {bFormula && <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace' }}>({bFormula})</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 14px', borderRadius: 8 }}>
                💡 <strong>Mẹo ghi nhớ bản chất:</strong> {activeLesson.mindmap.tip}
              </div>
            </div>

            {/* Grammar Points List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={20} color="#10b981" /> Các Mẫu Ngữ Pháp Trọng Tâm ({activeLesson.grammarPoints.length} Mẫu)
              </h3>

              {activeLesson.grammarPoints.map((point, pIdx) => (
                <div
                  key={point.id}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 12,
                    padding: 20
                  }}
                >
                  {/* Pattern Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#10b981',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}>
                        {pIdx + 1}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {point.pattern}
                      </h4>
                    </div>
                  </div>

                  {/* Formula Box */}
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderLeft: '4px solid #10b981',
                    padding: '10px 14px',
                    borderRadius: '0 8px 8px 0',
                    marginBottom: 12,
                    fontFamily: 'monospace',
                    fontSize: '0.92rem',
                    color: '#34d399',
                    whiteSpace: 'pre-line'
                  }}>
                    {point.formula}
                  </div>

                  {/* Meaning & Nuance */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Ý nghĩa: {point.meaning}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {point.nuance}
                    </div>
                  </div>

                  {/* Examples */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Câu ví dụ song ngữ:</div>
                    {point.examples.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        style={{
                          background: 'rgba(15, 23, 42, 0.4)',
                          padding: '10px 14px',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 12
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                            <FuriganaText text={ex.jp} />
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {ex.vi}
                          </div>
                        </div>
                        <button
                          onClick={() => speakJapanese(ex.jp)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#38bdf8',
                            cursor: 'pointer',
                            padding: 4
                          }}
                          title="Phát âm tiếng Nhật"
                        >
                          <Volume2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Drills / Quizzes */}
                  {point.drills && point.drills.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 14 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>
                        ⚡ Trắc Nghiệm Phản Xạ Ngay Tại Chỗ:
                      </div>
                      {point.drills.map((drill, dIdx) => {
                        const answerKey = `${point.id}_${dIdx}`;
                        const selectedOpt = minnaQuizAnswer[answerKey];
                        const isCorrect = selectedOpt === drill.correct;

                        return (
                          <div key={dIdx} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 12, borderRadius: 8 }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 10 }}>
                              {drill.q}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
                              {drill.options.map((opt, optIdx) => {
                                const isChosen = selectedOpt === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => setMinnaQuizAnswer(prev => ({ ...prev, [answerKey]: optIdx }))}
                                    style={{
                                      padding: '8px 12px',
                                      borderRadius: 6,
                                      border: isChosen ? (isCorrect ? '1.5px solid #10b981' : '1.5px solid #ef4444') : '1px solid var(--glass-border)',
                                      background: isChosen ? (isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)') : 'var(--bg-elevated)',
                                      color: isChosen ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--text-primary)',
                                      fontSize: '0.85rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      textAlign: 'left'
                                    }}
                                  >
                                    {optIdx + 1}. {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {selectedOpt !== undefined && (
                              <div style={{ fontSize: '0.8rem', color: isCorrect ? '#10b981' : '#ef4444' }}>
                                {isCorrect ? '✅ Chính xác! ' : '❌ Chưa đúng! '} {drill.explain}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TABS 2, 3, 4: SHINKANZEN MASTER (N3, N2, N1)                   */}
      {/* ============================================================== */}
      {(mainTab === 'n3' || mainTab === 'n2' || mainTab === 'n1') && (
        <div>
          {/* Dual-Track Mode Selector (Foundation vs Shinkanzen Combat) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-elevated)',
            padding: '8px 14px',
            borderRadius: 12,
            border: '1px solid var(--glass-border)',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setSubMode('foundation')}
                style={{
                  padding: '10px 22px',
                  borderRadius: 10,
                  border: 'none',
                  background: subMode === 'foundation' ? 'linear-gradient(135deg, #0ea5e9, #2563eb)' : 'transparent',
                  color: subMode === 'foundation' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: subMode === 'foundation' ? '0 4px 14px rgba(14, 165, 233, 0.35)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <BookOpen size={18} />
                📘 Bài Học Bản Lề & Mindmap ({currentFoundationList.length} Bài)
              </button>

              <button
                onClick={() => setSubMode('combat')}
                style={{
                  padding: '10px 22px',
                  borderRadius: 10,
                  border: 'none',
                  background: subMode === 'combat' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                  color: subMode === 'combat' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: subMode === 'combat' ? '0 4px 14px rgba(245, 158, 11, 0.35)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Zap size={18} />
                ⚔️ Lò Luyện Bẻ Bẫy Shin Kanzen Master (5 Phân Môn)
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              {subMode === 'foundation'
                ? `Đang học theo bài tuần tự: Bài ${activeFoundationLesson?.lessonNumber || ''} (${mainTab.toUpperCase()})`
                : `Đang bẻ bẫy trắc nghiệm theo 5 phân môn`}
            </div>
          </div>

          {/* SUB-MODE 1: BÀI HỌC BẢN LỀ N3, N2, N1 */}
          {subMode === 'foundation' && activeFoundationLesson && (
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>
              {/* Left Column: Lesson Directory */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                    📚 Danh Sách Bài Học ({filteredFoundationLessons.length}/{currentFoundationList.length})
                  </h3>
                </div>

                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={foundationSearch}
                    onChange={(e) => setFoundationSearch(e.target.value)}
                    placeholder="Tìm kiếm bài học..."
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      borderRadius: 8,
                      border: '1px solid var(--glass-border)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 680, overflowY: 'auto', paddingRight: 4 }}>
                  {filteredFoundationLessons.map(lesson => {
                    const isSelected = lesson.lessonNumber === selectedFoundationLessonNum;
                    return (
                      <button
                        key={lesson.lessonNumber}
                        onClick={() => setSelectedFoundationLessonNum(lesson.lessonNumber)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 10,
                          border: isSelected ? '1.5px solid #0ea5e9' : '1px solid var(--glass-border)',
                          background: isSelected ? 'rgba(14, 165, 233, 0.12)' : 'var(--bg-elevated)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              background: lesson.level === 'N3' ? '#f59e0b' : lesson.level === 'N2' ? '#8b5cf6' : '#ef4444',
                              color: '#fff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: 4
                            }}>
                              {lesson.level}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              Bài {lesson.lessonNumber}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {lesson.jpTitle}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                            {lesson.viTitle}
                          </div>
                        </div>
                        <ChevronRight size={16} color={isSelected ? '#0ea5e9' : 'var(--text-tertiary)'} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Foundation Lesson */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: 28 }}>
                {/* Header */}
                <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{
                      background: activeFoundationLesson.level === 'N3' ? '#f59e0b' : activeFoundationLesson.level === 'N2' ? '#8b5cf6' : '#ef4444',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 6
                    }}>
                      {activeFoundationLesson.level} • BÀI HỌC BẢN LỀ TOÀN DIỆN
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                      Trụ cột: <strong>{activeFoundationLesson.pillar}</strong>
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                    {activeFoundationLesson.title}
                  </h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    {activeFoundationLesson.summary}
                  </p>
                </div>

                {/* Sơ đồ tư duy (Tree Mindmap Box) */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(139, 92, 246, 0.08))',
                  border: '1.5px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: 14,
                  padding: 20,
                  marginBottom: 24,
                  boxShadow: '0 4px 20px rgba(56, 189, 248, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#38bdf8', fontSize: '1.05rem' }}>
                      <Compass size={20} /> SƠ ĐỒ TƯ DUY BẢN LỀ (TREE MINDMAP): {activeFoundationLesson.mindmap.center}
                    </div>
                    <button
                      onClick={() => setActiveMindmapLesson(activeFoundationLesson)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(14, 165, 233, 0.35)'
                      }}
                    >
                      <Sparkles size={15} /> 🗺️ Mở Sơ Đồ Tư Duy Mindmap AI (Toàn Màn Hình)
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, fontSize: '0.9rem' }}>
                    {activeFoundationLesson.mindmap.branches?.map((branch, bIdx) => {
                      const bName = typeof branch === 'object' ? branch.name : branch;
                      const bFormula = typeof branch === 'object' ? branch.formula : null;
                      return (
                        <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                          <span style={{ color: '#38bdf8', fontWeight: 800 }}>•</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{bName}</strong>
                          {bFormula && <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace' }}>({bFormula})</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 14px', borderRadius: 8 }}>
                    💡 <strong>Mẹo ghi nhớ bản chất:</strong> {activeFoundationLesson.mindmap.tip}
                  </div>
                </div>

                {/* Grammar Points List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={20} color="#0ea5e9" /> Các Mẫu Ngữ Pháp Trọng Tâm ({activeFoundationLesson.grammarPoints.length} Mẫu)
                  </h3>

                  {activeFoundationLesson.grammarPoints.map((point, pIdx) => (
                    <div
                      key={point.id}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 12,
                        padding: 20
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: '#0ea5e9',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}>
                            {pIdx + 1}
                          </span>
                          <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {point.pattern}
                          </h4>
                        </div>
                      </div>

                      {/* Formula */}
                      <div style={{
                        background: 'rgba(14, 165, 233, 0.08)',
                        borderLeft: '4px solid #0ea5e9',
                        padding: '10px 14px',
                        borderRadius: '0 8px 8px 0',
                        marginBottom: 12,
                        fontFamily: 'monospace',
                        fontSize: '0.92rem',
                        color: '#38bdf8',
                        whiteSpace: 'pre-line'
                      }}>
                        {point.formula}
                      </div>

                      {/* Meaning & Nuance */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                          Ý nghĩa: {point.meaning}
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {point.nuance}
                        </div>
                      </div>

                      {/* Trap Buster / Mnemonic */}
                      {point.trapBuster && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: 8,
                          padding: '10px 14px',
                          marginBottom: 14,
                          fontSize: '0.85rem',
                          color: '#f87171'
                        }}>
                          <ShieldAlert size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <strong>Bẻ khóa cạm bẫy:</strong> {point.trapBuster}
                          </div>
                        </div>
                      )}

                      {/* Examples */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                          Ví Dụ Thực Tế:
                        </div>
                        {point.examples.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            style={{
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: 8,
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                <FuriganaText text={ex.jp} />
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {ex.vi}
                              </div>
                            </div>
                            <button
                              onClick={() => speakJapanese(ex.jp)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#38bdf8',
                                cursor: 'pointer',
                                padding: 4
                              }}
                              title="Phát âm tiếng Nhật"
                            >
                              <Volume2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Drills / Quizzes */}
                      {point.drills && point.drills.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 14 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>
                            ⚡ Trắc Nghiệm Phản Xạ:
                          </div>
                          {point.drills.map((drill, dIdx) => {
                            const answerKey = `${point.id}_${dIdx}`;
                            const selectedOpt = foundationQuizAnswer[answerKey];
                            const isCorrect = selectedOpt === drill.correct;

                            return (
                              <div key={dIdx} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 12, borderRadius: 8 }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 10 }}>
                                  {drill.q}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
                                  {drill.options.map((opt, optIdx) => {
                                    const isChosen = selectedOpt === optIdx;
                                    return (
                                      <button
                                        key={optIdx}
                                        onClick={() => setFoundationQuizAnswer(prev => ({ ...prev, [answerKey]: optIdx }))}
                                        style={{
                                          padding: '8px 12px',
                                          borderRadius: 6,
                                          border: isChosen ? (isCorrect ? '1.5px solid #10b981' : '1.5px solid #ef4444') : '1px solid var(--glass-border)',
                                          background: isChosen ? (isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)') : 'var(--bg-elevated)',
                                          color: isChosen ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--text-primary)',
                                          fontSize: '0.85rem',
                                          fontWeight: 600,
                                          cursor: 'pointer',
                                          textAlign: 'left'
                                        }}
                                      >
                                        {optIdx + 1}. {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                                {selectedOpt !== undefined && (
                                  <div style={{ fontSize: '0.8rem', color: isCorrect ? '#10b981' : '#ef4444' }}>
                                    {isCorrect ? '✅ Chính xác! ' : '❌ Chưa đúng! '} {drill.explain}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-MODE 2: LÒ BẺ BẪY SHIN KANZEN MASTER */}
          {subMode === 'combat' && (
            <div>
              {/* Sub-skill Tabs */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button
              onClick={() => setShinkanzenSkill('grammar')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: shinkanzenSkill === 'grammar' ? '#f59e0b' : 'var(--bg-elevated)',
                color: shinkanzenSkill === 'grammar' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <BookOpen size={16} /> 1. Ngữ Pháp & Bẻ Khóa Bẫy ({currentShinkanzenData?.stats?.grammarPoints} Mẫu)
            </button>

            <button
              onClick={() => setShinkanzenSkill('reading')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: shinkanzenSkill === 'reading' ? '#f59e0b' : 'var(--bg-elevated)',
                color: shinkanzenSkill === 'reading' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Target size={16} /> 2. Đọc Hiểu 5 Dạng Bài (Dokkai)
            </button>

            <button
              onClick={() => setShinkanzenSkill('listening')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: shinkanzenSkill === 'listening' ? '#f59e0b' : 'var(--bg-elevated)',
                color: shinkanzenSkill === 'listening' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Volume2 size={16} /> 3. Nghe Hiểu 5 Mondai (Choukai)
            </button>
          </div>

          {/* Grammar Mode */}
          {shinkanzenSkill === 'grammar' && (
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>
              {/* Left Column: Chapters & Points */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: 18 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 700 }}>
                  📖 Chương Ngữ Pháp {mainTab.toUpperCase()}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {currentShinkanzenData?.skills?.grammar?.map((ch, chIdx) => {
                    const isSelected = chIdx === selectedChapterIdx;
                    return (
                      <button
                        key={ch.chapterNumber}
                        onClick={() => { setSelectedChapterIdx(chIdx); setSelectedPointId(null); }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 8,
                          border: isSelected ? '1.5px solid #f59e0b' : '1px solid var(--glass-border)',
                          background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-elevated)',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#f59e0b' : 'var(--text-primary)' }}>
                          {ch.chapterTitle}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                          {ch.summary}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Grammar Point with TrapBuster */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: 28 }}>
                {activeGrammarPoint ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ background: '#f59e0b', color: '#fff', padding: '3px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.8rem' }}>
                        SHIN KANZEN MASTER {mainTab.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                        {currentGrammarChapter?.chapterTitle}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--text-primary)' }}>
                      {activeGrammarPoint.pattern}
                    </h2>

                    {/* Formula */}
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      borderLeft: '4px solid #f59e0b',
                      padding: '12px 16px',
                      borderRadius: '0 8px 8px 0',
                      marginBottom: 16,
                      fontFamily: 'monospace',
                      color: '#fbbf24',
                      fontSize: '0.95rem',
                      whiteSpace: 'pre-line'
                    }}>
                      {activeGrammarPoint.formula}
                    </div>

                    {/* Meaning & Nuance */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, whiteSpace: 'pre-line' }}>
                        Ý nghĩa: {activeGrammarPoint.meaning}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {activeGrammarPoint.nuance}
                      </div>
                    </div>

                    {/* Trap Buster Box (Độc quyền Shinkanzen) */}
                    {activeGrammarPoint.trapBuster && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1.5px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 24
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>
                          <ShieldAlert size={18} /> BẺ KHÓA BẪY ĐỀ THI (SHINKANZEN CONFUSION BUSTER)
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {activeGrammarPoint.trapBuster}
                        </div>
                      </div>
                    )}

                    {/* Examples */}
                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                        Ví dụ thực tế song ngữ:
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {activeGrammarPoint.examples?.map((ex, exIdx) => (
                          <div key={exIdx} style={{
                            background: 'var(--bg-elevated)',
                            padding: '12px 16px',
                            borderRadius: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                <FuriganaText text={ex.jp} />
                              </div>
                              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{ex.vi}</div>
                            </div>
                            <button
                              onClick={() => speakJapanese(ex.jp)}
                              style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 6 }}
                              title="Nghe Audio bản ngữ"
                            >
                              <Volume2 size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quiz */}
                    {activeGrammarPoint.quiz?.map((q, qIdx) => {
                      const answerKey = `${activeGrammarPoint.id}_${qIdx}`;
                      const chosen = shinkanzenQuizAnswer[answerKey];
                      const isCorrect = chosen === q.correct;

                      return (
                        <div key={qIdx} style={{ background: 'var(--bg-elevated)', padding: 18, borderRadius: 10, border: '1px solid var(--glass-border)' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>
                            ⚡ Câu Hỏi Trắc Nghiệm Chuẩn Đề Thi Thật:
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 14 }}>{q.q}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
                            {q.options.map((opt, optIdx) => (
                              <button
                                key={optIdx}
                                onClick={() => setShinkanzenQuizAnswer(prev => ({ ...prev, [answerKey]: optIdx }))}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: 8,
                                  border: chosen === optIdx ? (isCorrect ? '1.5px solid #10b981' : '1.5px solid #ef4444') : '1px solid var(--glass-border)',
                                  background: chosen === optIdx ? (isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)') : 'var(--bg-surface)',
                                  color: chosen === optIdx ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--text-primary)',
                                  fontSize: '0.9rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                {optIdx + 1}. {opt}
                              </button>
                            ))}
                          </div>
                          {chosen !== undefined && (
                            <div style={{ fontSize: '0.85rem', color: isCorrect ? '#10b981' : '#ef4444' }}>
                              {isCorrect ? '✅ Chuẩn xác!' : '❌ Bị bẫy rồi!'} {q.explain}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>Chọn một bài học từ danh sách bên trái.</div>
                )}
              </div>
            </div>
          )}

          {/* Reading Mode */}
          {shinkanzenSkill === 'reading' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {currentShinkanzenData?.skills?.reading?.map((r, rIdx) => (
                <div key={rIdx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 22 }}>
                  <h3 style={{ margin: '0 0 8px', color: '#38bdf8' }}>{r.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    💡 <strong>Chiến lược bóc tách câu:</strong> {r.strategy}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Listening Mode */}
          {shinkanzenSkill === 'listening' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {currentShinkanzenData?.skills?.listening?.map((l, lIdx) => (
                <div key={lIdx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 22 }}>
                  <h3 style={{ margin: '0 0 8px', color: '#10b981' }}>{l.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    🎧 <strong>Cấu trúc & Kỹ năng bắt điểm:</strong> {l.pattern}
                  </p>
                </div>
              ))}
            </div>
          )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: PHÒNG THI THẬT 10 NĂM (2014 - 2024)                     */}
      {/* ============================================================== */}
      {mainTab === 'exams' && (
        <div>
          {/* Filter Bar */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Filter size={16} color="var(--text-tertiary)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Cấp độ:</span>
                <select
                  value={examLevelFilter}
                  onChange={e => setExamLevelFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="all">Tất cả cấp độ</option>
                  <option value="N3">N3 (Trung cấp)</option>
                  <option value="N2">N2 (Cao cấp)</option>
                  <option value="N1">N1 (Thượng cấp)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Năm thi:</span>
                <select
                  value={examYearFilter}
                  onChange={e => setExamYearFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="all">10 năm gần nhất (2014–2024)</option>
                  {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014].map(y => (
                    <option key={y} value={y}>Năm {y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              Đang hiển thị <strong>{filteredExams.length}</strong> bộ đề thi thật chính thức
            </div>
          </div>

          {/* Exam Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
            {filteredExams.map(exam => (
              <div
                key={exam.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 14,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{
                      background: exam.level === 'N1' ? '#ef4444' : exam.level === 'N2' ? '#8b5cf6' : '#f59e0b',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4
                    }}>
                      JLPT {exam.level}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                      Năm {exam.year} • {exam.sessionLabel}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text-primary)' }}>
                    {exam.title}
                  </h3>

                  <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                    <div>⏱️ Thời gian: <strong>{exam.totalTime} phút</strong></div>
                    <div>🎯 Điểm đỗ: <strong>{exam.passingScore}/180</strong></div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)', padding: '6px 10px', borderRadius: 6, marginBottom: 18 }}>
                    ⚠️ Điểm liệt: Dưới {exam.sectionScoreDeadThreshold} điểm/phần thi sẽ bị trượt trực tiếp.
                  </div>
                </div>

                <button
                  onClick={() => setActiveExamForModal(exam)}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Play size={16} fill="white" /> Bắt Đầu Thi Thử Bấm Giờ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Exam Simulator Modal */}
      {activeExamForModal && (
        <ExamSimulatorModal
          exam={activeExamForModal}
          onClose={() => setActiveExamForModal(null)}
        />
      )}

      {/* Master Mindmap Atlas Modal */}
      {showAtlasModal && (
        <MindmapAtlasModal
          allLessons={all120Lessons}
          onClose={() => setShowAtlasModal(false)}
        />
      )}

      {/* Individual Mindmap Canvas Modal */}
      {activeMindmapLesson && (
        <MindmapCanvasModal
          lesson={activeMindmapLesson}
          onClose={() => setActiveMindmapLesson(null)}
        />
      )}
    </div>
  );
}

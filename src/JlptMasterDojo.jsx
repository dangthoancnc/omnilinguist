// src/JlptMasterDojo.jsx
// Trung tâm Lò Luyện Thi JLPT Toàn Diện (JLPT Master Dojo)
// Thiết kế: Chuyên nghiệp, Tinh gọn (High Density), Hạn chế màu mè, Chuẩn mực Sư phạm Nhật Bản.
// Hỗ trợ: Toàn chiều ngang màn hình rộng, Trang danh mục thẻ bài (Catalog) & Trang bài học riêng (Dedicated Lesson View).

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Target, Award, Timer, CheckCircle, XCircle, Search, 
  HelpCircle, Volume2, ShieldAlert, Sparkles, ChevronRight, ChevronLeft, Filter, 
  ArrowRight, ArrowLeft, Layers, Play, Check, AlertCircle, Compass, Zap
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

  // View Mode: 'catalog' (Danh mục thẻ bài lưới rộng) | 'lesson' (Trang bài học riêng biệt toàn màn hình)
  const [lessonView, setLessonView] = useState('catalog');

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
      utterance.rate = 0.88;
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
          (l.title || '').toLowerCase().includes(q) ||
          (l.jpTitle || '').toLowerCase().includes(q) ||
          (l.viTitle || '').toLowerCase().includes(q) ||
          (l.pillar && l.pillar.toLowerCase().includes(q)) ||
          (l.mindmap?.branches?.some(b => (b.name || '').toLowerCase().includes(q)))
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
      (l.title || '').toLowerCase().includes(q) ||
      (l.jpTitle || '').toLowerCase().includes(q) ||
      (l.viTitle || '').toLowerCase().includes(q) ||
      (l.pillar && l.pillar.toLowerCase().includes(q)) ||
      (l.mindmap?.branches?.some(b => (b.name || '').toLowerCase().includes(q)))
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

  // Lesson Navigation Helpers
  const goToAdjacentMinna = (step) => {
    const nextIdx = Math.max(1, Math.min(50, selectedLessonNum + step));
    setSelectedLessonNum(nextIdx);
  };

  const goToAdjacentFoundation = (step) => {
    const minN = mainTab === 'n3' ? 51 : mainTab === 'n2' ? 76 : 101;
    const maxN = mainTab === 'n3' ? 75 : mainTab === 'n2' ? 100 : 120;
    const nextIdx = Math.max(minN, Math.min(maxN, selectedFoundationLessonNum + step));
    setSelectedFoundationLessonNum(nextIdx);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      padding: '12px 18px',
      boxSizing: 'border-box',
      color: 'var(--text-primary)',
      fontFamily: `'Noto Sans JP', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
    }}>
      {/* ============================================================== */}
      {/* 1. COMPACT, PROFESSIONAL TOP TOOLBAR (No Rainbow Colors)        */}
      {/* ============================================================== */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 8,
        padding: '8px 14px',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10
      }}>
        {/* Left: Refined Title & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontWeight: 700,
            flexShrink: 0
          }}>
            🏛️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Lò Luyện Thi JLPT Toàn Diện
              </h1>
              <span style={{
                background: 'var(--bg-surface-2)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 4
              }}>
                N5 – N1
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              120 Bài Bản Lề Quốc Dân • Shin Kanzen Master • Đề Thi 10 Năm (2014–2024)
            </div>
          </div>
        </div>

        {/* Right: Neutral Micro-Stats & Atlas Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <span style={{ background: 'var(--bg-surface-2)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border-default)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>120</strong> Bài Bản Lề
            </span>
            <span style={{ background: 'var(--bg-surface-2)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border-default)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>120</strong> Sơ Đồ Tư Duy
            </span>
            <span style={{ background: 'var(--bg-surface-2)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border-default)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>480+</strong> Cấu Trúc
            </span>
            <span style={{ background: 'var(--bg-surface-2)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border-default)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>63</strong> Đề Thi Thật
            </span>
          </div>

          <button
            onClick={() => setShowAtlasModal(true)}
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-strong)',
              padding: '5px 12px',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '0.76rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
          >
            <Compass size={13} />
            <span>Bách Khoa Mindmap Atlas</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MINIMALIST UNIFIED TAB BAR (Clean Understated Design)        */}
      {/* ============================================================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        borderBottom: '1px solid var(--border-default)',
        paddingBottom: 6,
        marginBottom: 12,
        flexWrap: 'wrap'
      }}>
        {/* Main Tabs */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { id: 'minna', label: 'Minna No Nihongo (1–50)' },
            { id: 'n3', label: 'Lò Luyện N3' },
            { id: 'n2', label: 'Lò Luyện N2' },
            { id: 'n1', label: 'Lò Luyện N1' },
            { id: 'exams', label: 'Đề Thi 10 Năm (2014–2024)' }
          ].map(tab => {
            const isActive = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setMainTab(tab.id);
                  setLessonView('catalog');
                  if (tab.id === 'n3') { setSelectedFoundationLessonNum(51); setSelectedChapterIdx(0); setSelectedPointId(null); }
                  if (tab.id === 'n2') { setSelectedFoundationLessonNum(76); setSelectedChapterIdx(0); setSelectedPointId(null); }
                  if (tab.id === 'n1') { setSelectedFoundationLessonNum(101); setSelectedChapterIdx(0); setSelectedPointId(null); }
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.12s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sub-mode Segmented Buttons for N3, N2, N1 */}
        {(mainTab === 'n3' || mainTab === 'n2' || mainTab === 'n1') && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface-2)',
            padding: '2px',
            borderRadius: 6,
            border: '1px solid var(--border-default)'
          }}>
            <button
              onClick={() => { setSubMode('foundation'); }}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: 'none',
                background: subMode === 'foundation' ? 'var(--bg-surface)' : 'transparent',
                color: subMode === 'foundation' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.74rem',
                fontWeight: subMode === 'foundation' ? 700 : 500,
                cursor: 'pointer',
                boxShadow: subMode === 'foundation' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              25 Bài Bản Lề & Mindmap
            </button>
            <button
              onClick={() => { setSubMode('combat'); }}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: 'none',
                background: subMode === 'combat' ? 'var(--bg-surface)' : 'transparent',
                color: subMode === 'combat' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.74rem',
                fontWeight: subMode === 'combat' ? 700 : 500,
                cursor: 'pointer',
                boxShadow: subMode === 'combat' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              Bẻ Bẫy Shin Kanzen (5 Phân Môn)
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. MAIN CONTENT ROUTING                                         */}
      {/* ============================================================== */}

      {/* -------------------------------------------------------------- */}
      {/* 3A: MINNA NO NIHONGO (BÀI 1 - 50)                              */}
      {/* -------------------------------------------------------------- */}
      {mainTab === 'minna' && (
        lessonView === 'catalog' ? (
          /* MINNA CATALOG VIEW (Clean, High-Density Full Width Grid) */
          <div>
            {/* Filter & Search Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 12,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 6,
              padding: '6px 12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[
                  { id: 'all', label: 'Tất Cả (50)' },
                  { id: 'n5', label: 'Tập 1: N5 (Bài 1–25)' },
                  { id: 'n4', label: 'Tập 2: N4 (Bài 26–50)' }
                ].map(f => {
                  const isSelected = minnaFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setMinnaFilter(f.id)}
                      style={{
                        padding: '3px 9px',
                        borderRadius: 4,
                        border: isSelected ? '1px solid var(--border-strong)' : '1px solid transparent',
                        background: isSelected ? 'var(--bg-surface-2)' : 'transparent',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                  Hiển thị {filteredMinnaLessons.length} bài
                </span>
              </div>

              {/* Fast Search Input */}
              <div style={{ position: 'relative', width: 260 }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Tìm bài học, ngữ pháp..."
                  value={minnaSearch}
                  onChange={e => setMinnaSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px 8px 4px 28px',
                    borderRadius: 4,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Grid of 50 Minna Lessons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: 12
            }}>
              {filteredMinnaLessons.map(lesson => {
                const bCount = lesson.grammarPoints?.length || 0;

                return (
                  <div
                    key={lesson.lessonNumber}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--border-strong)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => {
                      setSelectedLessonNum(lesson.lessonNumber);
                      setLessonView('lesson');
                    }}
                  >
                    {/* Top Row: Clean Neutral Badge & Count */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        background: 'var(--bg-surface-2)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-default)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 4
                      }}>
                        {lesson.level} • 第{lesson.lessonNumber}課
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {bCount} mẫu câu
                      </span>
                    </div>

                    {/* Titles */}
                    <div>
                      <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '2px 0 1px', color: 'var(--text-primary)' }}>
                        {lesson.jpTitle}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {lesson.viTitle}
                      </div>
                    </div>

                    {/* Pillar */}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Chủ điểm: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{lesson.pillar}</span>
                    </div>

                    {/* Uniform Neutral Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                      {lesson.mindmap?.branches?.slice(0, 3).map((b, bIdx) => (
                        <span
                          key={bIdx}
                          style={{
                            background: 'var(--bg-surface-2)',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 4,
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-default)',
                            fontFamily: 'monospace'
                          }}
                        >
                          {b.name}
                        </span>
                      ))}
                    </div>

                    {/* Card Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      paddingTop: 8,
                      borderTop: '1px solid var(--border-default)'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMindmapLesson(lesson);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Compass size={12} /> Sơ đồ tư duy
                      </button>

                      <span style={{
                        color: 'var(--accent-primary)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3
                      }}>
                        Vào học bài <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* MINNA DEDICATED LESSON VIEW (Clean, High-Readability Layout) */
          <div>
            {/* Top Navigation & Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              padding: '7px 12px',
              marginBottom: 12,
              flexWrap: 'wrap',
              gap: 8
            }}>
              {/* Back Button & Breadcrumbs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => setLessonView('catalog')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    padding: '4px 10px',
                    borderRadius: 5,
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={13} /> Danh mục bài học
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                  <span style={{
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontWeight: 700,
                    fontSize: '0.7rem'
                  }}>
                    {activeLesson.level} • 第{activeLesson.lessonNumber}課
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {activeLesson.jpTitle}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                    ({activeLesson.viTitle})
                  </span>
                </div>
              </div>

              {/* Prev / Next & Action controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  disabled={selectedLessonNum <= 1}
                  onClick={() => goToAdjacentMinna(-1)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 5,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface-2)',
                    color: selectedLessonNum <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: selectedLessonNum <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                >
                  <ChevronLeft size={13} /> Bài trước
                </button>

                <button
                  disabled={selectedLessonNum >= 50}
                  onClick={() => goToAdjacentMinna(1)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 5,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface-2)',
                    color: selectedLessonNum >= 50 ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: selectedLessonNum >= 50 ? 'not-allowed' : 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                >
                  Bài tiếp <ChevronRight size={13} />
                </button>

                <button
                  onClick={() => setActiveMindmapLesson(activeLesson)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-strong)',
                    padding: '4px 10px',
                    borderRadius: 5,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Compass size={13} /> Sơ đồ tư duy đầy đủ
                </button>
              </div>
            </div>

            {/* SƠ ĐỒ TƯ DUY TÓM TẮT BÀI HỌC (Neutral & High-Readability) */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  Tổng kết sơ đồ tư duy: {activeLesson.jpTitle}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Trụ cột: <strong style={{ color: 'var(--text-secondary)' }}>{activeLesson.pillar}</strong>
                </div>
              </div>

              {/* Root Connection */}
              {activeLesson.mindmap?.rootConnection && (
                <div style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-surface-2)',
                  borderLeft: '3px solid var(--accent-primary)',
                  padding: '4px 8px',
                  borderRadius: '0 4px 4px 0',
                  marginBottom: 8
                }}>
                  <strong>Cội nguồn:</strong> {activeLesson.mindmap.rootConnection.replace(/^🔙 Rễ cây:\s*/, '')}
                </div>
              )}

              {/* Branches Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8, marginBottom: 8 }}>
                {activeLesson.mindmap.branches?.map((branch, bIdx) => {
                  const bName = typeof branch === 'object' ? branch.name : branch;
                  const bFormula = typeof branch === 'object' ? branch.formula : null;
                  const bMetaphor = typeof branch === 'object' ? branch.metaphor : null;
                  return (
                    <div key={bIdx} style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)', padding: '8px 10px', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.84rem' }}>{bName}</strong>
                      {bFormula && <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{bFormula}</div>}
                      {bMetaphor && <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{bMetaphor}</div>}
                    </div>
                  );
                })}
              </div>

              {/* Tip & Trap Footer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {activeLesson.mindmap?.tip && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', background: 'var(--bg-surface-2)', padding: '5px 8px', borderRadius: 4 }}>
                    <strong>Ghi chú:</strong> {activeLesson.mindmap.tip}
                  </div>
                )}
                {activeLesson.mindmap?.trapRadar && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--status-error-text)', background: 'var(--status-error-bg)', border: '1px solid var(--status-error)', padding: '5px 8px', borderRadius: 4 }}>
                    <strong>Lưu ý bẫy đề thi:</strong> {activeLesson.mindmap.trapRadar}
                  </div>
                )}
              </div>
            </div>

            {/* GRAMMAR POINTS LIST (Crisp Monochromatic Hierarchy) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={16} /> Các Mẫu Ngữ Pháp Trọng Tâm ({activeLesson.grammarPoints.length} Mẫu)
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Lý thuyết bên trái • Trắc nghiệm phản xạ bên phải
                </span>
              </div>

              {activeLesson.grammarPoints.map((point, pIdx) => (
                <div
                  key={point.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 8,
                    padding: '14px 16px',
                    display: 'grid',
                    gridTemplateColumns: point.drills && point.drills.length > 0 ? 'minmax(0, 1.3fr) minmax(0, 1fr)' : '1fr',
                    gap: 16,
                    alignItems: 'start'
                  }}
                >
                  {/* Left Column: Theory, Formula, Examples */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'var(--bg-surface-2)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {pIdx + 1}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {point.pattern}
                      </h4>
                    </div>

                    {/* Formula */}
                    <div style={{
                      background: 'var(--bg-surface-2)',
                      borderLeft: '3px solid var(--accent-primary)',
                      padding: '6px 10px',
                      borderRadius: '0 4px 4px 0',
                      marginBottom: 8,
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}>
                      {point.formula}
                    </div>

                    {/* Meaning & Nuance */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        Ý nghĩa: {point.meaning}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {point.nuance}
                      </div>
                    </div>

                    {/* Examples with Audio */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Ví Dụ Thực Tế:
                      </div>
                      {point.examples.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          style={{
                            background: 'var(--bg-surface-2)',
                            border: '1px solid var(--border-default)',
                            padding: '6px 10px',
                            borderRadius: 5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                              <FuriganaText text={ex.jp} />
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {ex.vi}
                            </div>
                          </div>
                          <button
                            onClick={() => speakJapanese(ex.jp)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: 4
                            }}
                            title="Nghe phát âm"
                          >
                            <Volume2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Interactive Reflex Drills */}
                  {point.drills && point.drills.length > 0 && (
                    <div style={{
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 6,
                      padding: '10px 12px'
                    }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Zap size={13} /> TRẮC NGHIỆM PHẢN XẠ NHANH:
                      </div>
                      {point.drills.map((drill, dIdx) => {
                        const answerKey = `${point.id}_${dIdx}`;
                        const selectedOpt = minnaQuizAnswer[answerKey];
                        const isCorrect = selectedOpt === drill.correct;

                        return (
                          <div key={dIdx} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {drill.q}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5, marginTop: 3 }}>
                              {drill.options.map((opt, optIdx) => {
                                const isChosen = selectedOpt === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => setMinnaQuizAnswer(prev => ({ ...prev, [answerKey]: optIdx }))}
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: 4,
                                      border: isChosen 
                                        ? (isCorrect ? '1px solid var(--status-success)' : '1px solid var(--status-error)') 
                                        : '1px solid var(--border-default)',
                                      background: isChosen 
                                        ? (isCorrect ? 'var(--status-success-bg)' : 'var(--status-error-bg)') 
                                        : 'var(--bg-surface)',
                                      color: isChosen 
                                        ? (isCorrect ? 'var(--status-success-text)' : 'var(--status-error-text)') 
                                        : 'var(--text-primary)',
                                      fontSize: '0.78rem',
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
                              <div style={{ fontSize: '0.75rem', color: isCorrect ? 'var(--status-success-text)' : 'var(--status-error-text)', marginTop: 3 }}>
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
        )
      )}

      {/* -------------------------------------------------------------- */}
      {/* 3B: FOUNDATION N3, N2, N1 & SHINKANZEN COMBAT                   */}
      {/* -------------------------------------------------------------- */}
      {(mainTab === 'n3' || mainTab === 'n2' || mainTab === 'n1') && (
        subMode === 'foundation' ? (
          lessonView === 'catalog' ? (
            /* FOUNDATION CATALOG VIEW */
            <div>
              {/* Toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 12,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 6,
                padding: '6px 12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    padding: '2px 7px',
                    borderRadius: 4,
                    fontWeight: 700,
                    fontSize: '0.72rem'
                  }}>
                    {mainTab.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Đại Lộ Trình 25 Bài Học Bản Lề Chuẩn Sư Phạm
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    (Hiển thị {filteredFoundationLessons.length} bài)
                  </span>
                </div>

                {/* Fast Search */}
                <div style={{ position: 'relative', width: 260 }}>
                  <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên bài, ngữ pháp..."
                    value={foundationSearch}
                    onChange={e => setFoundationSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px 4px 28px',
                      borderRadius: 4,
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-surface-2)',
                      color: 'var(--text-primary)',
                      fontSize: '0.78rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Full-Width Grid of Foundation Lessons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                gap: 12
              }}>
                {filteredFoundationLessons.map(lesson => {
                  const bCount = lesson.grammarPoints?.length || 0;

                  return (
                    <div
                      key={lesson.lessonNumber}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 8,
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--border-strong)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onClick={() => {
                        setSelectedFoundationLessonNum(lesson.lessonNumber);
                        setLessonView('lesson');
                      }}
                    >
                      {/* Top Row: Neutral Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          background: 'var(--bg-surface-2)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-default)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 4
                        }}>
                          {lesson.level} • 第{lesson.lessonNumber}課
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {bCount} mẫu câu
                        </span>
                      </div>

                      {/* Titles */}
                      <div>
                        <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '2px 0 1px', color: 'var(--text-primary)' }}>
                          {lesson.jpTitle}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {lesson.viTitle}
                        </div>
                      </div>

                      {/* Pillar */}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Chủ điểm: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{lesson.pillar}</span>
                      </div>

                      {/* Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                        {lesson.mindmap?.branches?.slice(0, 3).map((b, bIdx) => (
                          <span
                            key={bIdx}
                            style={{
                              background: 'var(--bg-surface-2)',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 4,
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-default)',
                              fontFamily: 'monospace'
                            }}
                          >
                            {b.name}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                        paddingTop: 8,
                        borderTop: '1px solid var(--border-default)'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMindmapLesson(lesson);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                          <Compass size={12} /> Sơ đồ tư duy
                        </button>

                        <span style={{
                          color: 'var(--accent-primary)',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}>
                          Vào học bài <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* FOUNDATION DEDICATED LESSON VIEW */
            <div>
              {/* Top Navigation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                padding: '7px 12px',
                marginBottom: 12,
                flexWrap: 'wrap',
                gap: 8
              }}>
                {/* Back button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => setLessonView('catalog')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      padding: '4px 10px',
                      borderRadius: 5,
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={13} /> Danh mục {activeFoundationLesson.level}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                    <span style={{
                      background: 'var(--bg-surface-2)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-default)',
                      padding: '1px 6px',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}>
                      {activeFoundationLesson.level} • 第{activeFoundationLesson.lessonNumber}課
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {activeFoundationLesson.jpTitle}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                      ({activeFoundationLesson.viTitle})
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => goToAdjacentFoundation(-1)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 5,
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-surface-2)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3
                    }}
                  >
                    <ChevronLeft size={13} /> Bài trước
                  </button>

                  <button
                    onClick={() => goToAdjacentFoundation(1)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 5,
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-surface-2)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3
                    }}
                  >
                    Bài tiếp <ChevronRight size={13} />
                  </button>

                  <button
                    onClick={() => setActiveMindmapLesson(activeFoundationLesson)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-strong)',
                      padding: '4px 10px',
                      borderRadius: 5,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Compass size={13} /> Sơ đồ tư duy đầy đủ
                  </button>
                </div>
              </div>

              {/* SƠ ĐỒ TƯ DUY TÓM TẮT BÀI HỌC (Neutral & Compact) */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    Tổng kết sơ đồ tư duy: {activeFoundationLesson.jpTitle}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Trụ cột: <strong style={{ color: 'var(--text-secondary)' }}>{activeFoundationLesson.pillar}</strong>
                  </div>
                </div>

                {/* Root Connection */}
                {activeFoundationLesson.mindmap?.rootConnection && (
                  <div style={{
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-surface-2)',
                    borderLeft: '3px solid var(--accent-primary)',
                    padding: '4px 8px',
                    borderRadius: '0 4px 4px 0',
                    marginBottom: 8
                  }}>
                    <strong>Cội nguồn:</strong> {activeFoundationLesson.mindmap.rootConnection.replace(/^🔙 Rễ cây:\s*/, '')}
                  </div>
                )}

                {/* Branches Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8, marginBottom: 8 }}>
                  {activeFoundationLesson.mindmap.branches?.map((branch, bIdx) => {
                    const bName = typeof branch === 'object' ? branch.name : branch;
                    const bFormula = typeof branch === 'object' ? branch.formula : null;
                    const bMetaphor = typeof branch === 'object' ? branch.metaphor : null;
                    return (
                      <div key={bIdx} style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)', padding: '8px 10px', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.84rem' }}>{bName}</strong>
                        {bFormula && <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{bFormula}</div>}
                        {bMetaphor && <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{bMetaphor}</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Tip & Trap Footer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {activeFoundationLesson.mindmap?.tip && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', background: 'var(--bg-surface-2)', padding: '5px 8px', borderRadius: 4 }}>
                      <strong>Ghi chú:</strong> {activeFoundationLesson.mindmap.tip}
                    </div>
                  )}
                  {activeFoundationLesson.mindmap?.trapRadar && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--status-error-text)', background: 'var(--status-error-bg)', border: '1px solid var(--status-error)', padding: '5px 8px', borderRadius: 4 }}>
                      <strong>Lưu ý bẫy đề thi:</strong> {activeFoundationLesson.mindmap.trapRadar}
                    </div>
                  )}
                </div>
              </div>

              {/* GRAMMAR POINTS LIST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={16} /> Các Mẫu Ngữ Pháp Trọng Tâm ({activeFoundationLesson.grammarPoints.length} Mẫu)
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Lý thuyết bên trái • Trắc nghiệm phản xạ bên phải
                  </span>
                </div>

                {activeFoundationLesson.grammarPoints.map((point, pIdx) => (
                  <div
                    key={point.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      padding: '14px 16px',
                      display: 'grid',
                      gridTemplateColumns: point.drills && point.drills.length > 0 ? 'minmax(0, 1.3fr) minmax(0, 1fr)' : '1fr',
                      gap: 16,
                      alignItems: 'start'
                    }}
                  >
                    {/* Left Column */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'var(--bg-surface-2)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {pIdx + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {point.pattern}
                        </h4>
                      </div>

                      {/* Formula */}
                      <div style={{
                        background: 'var(--bg-surface-2)',
                        borderLeft: '3px solid var(--accent-primary)',
                        padding: '6px 10px',
                        borderRadius: '0 4px 4px 0',
                        marginBottom: 8,
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)',
                        fontWeight: 600
                      }}>
                        {point.formula}
                      </div>

                      {/* Meaning & Nuance */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                          Ý nghĩa: {point.meaning}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {point.nuance}
                        </div>
                      </div>

                      {/* Trap Buster */}
                      {point.trapBuster && (
                        <div style={{
                          fontSize: '0.76rem',
                          color: 'var(--status-error-text)',
                          background: 'var(--status-error-bg)',
                          border: '1px solid var(--status-error)',
                          padding: '5px 8px',
                          borderRadius: 4,
                          marginBottom: 8
                        }}>
                          <strong>Bẫy đề thi:</strong> {point.trapBuster}
                        </div>
                      )}

                      {/* Examples */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Ví Dụ Thực Tế:
                        </div>
                        {point.examples.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            style={{
                              background: 'var(--bg-surface-2)',
                              border: '1px solid var(--border-default)',
                              padding: '6px 10px',
                              borderRadius: 5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                                <FuriganaText text={ex.jp} />
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                {ex.vi}
                              </div>
                            </div>
                            <button
                              onClick={() => speakJapanese(ex.jp)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: 4
                              }}
                              title="Nghe phát âm"
                            >
                              <Volume2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Drills */}
                    {point.drills && point.drills.length > 0 && (
                      <div style={{
                        background: 'var(--bg-surface-2)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 6,
                        padding: '10px 12px'
                      }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Zap size={13} /> TRẮC NGHIỆM PHẢN XẠ NHANH:
                        </div>
                        {point.drills.map((drill, dIdx) => {
                          const answerKey = `${point.id}_${dIdx}`;
                          const selectedOpt = foundationQuizAnswer[answerKey];
                          const isCorrect = selectedOpt === drill.correct;

                          return (
                            <div key={dIdx} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {drill.q}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5, marginTop: 3 }}>
                                {drill.options.map((opt, optIdx) => {
                                  const isChosen = selectedOpt === optIdx;
                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => setFoundationQuizAnswer(prev => ({ ...prev, [answerKey]: optIdx }))}
                                      style={{
                                        padding: '5px 8px',
                                        borderRadius: 4,
                                        border: isChosen 
                                          ? (isCorrect ? '1px solid var(--status-success)' : '1px solid var(--status-error)') 
                                          : '1px solid var(--border-default)',
                                        background: isChosen 
                                          ? (isCorrect ? 'var(--status-success-bg)' : 'var(--status-error-bg)') 
                                          : 'var(--bg-surface)',
                                        color: isChosen 
                                          ? (isCorrect ? 'var(--status-success-text)' : 'var(--status-error-text)') 
                                          : 'var(--text-primary)',
                                        fontSize: '0.78rem',
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
                                <div style={{ fontSize: '0.75rem', color: isCorrect ? 'var(--status-success-text)' : 'var(--status-error-text)', marginTop: 3 }}>
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
          )
        ) : (
          /* SHINKANZEN MASTER COMBAT MODE */
          <div>
            {/* Skill Sub-Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[
                { id: 'grammar', label: `1. Ngữ Pháp & Bẻ Khóa Bẫy (${currentShinkanzenData?.stats?.grammarPoints || 0} Mẫu)`, icon: BookOpen },
                { id: 'reading', label: '2. Đọc Hiểu 5 Dạng Bài (Dokkai)', icon: Target },
                { id: 'listening', label: '3. Nghe Hiểu 5 Mondai (Choukai)', icon: Volume2 }
              ].map(s => {
                const IconComponent = s.icon;
                const isSelected = shinkanzenSkill === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setShinkanzenSkill(s.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 5,
                      border: isSelected ? '1px solid var(--border-strong)' : '1px solid var(--border-default)',
                      background: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface-2)',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5
                    }}
                  >
                    <IconComponent size={14} />
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Grammar Mode */}
            {shinkanzenSkill === 'grammar' && (
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, alignItems: 'start' }}>
                {/* Left: Chapters */}
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 12 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '0.88rem', fontWeight: 700 }}>
                    Chương Ngữ Pháp {mainTab.toUpperCase()}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '680px', overflowY: 'auto' }}>
                    {currentShinkanzenData?.skills?.grammar?.map((ch, chIdx) => {
                      const isSelected = chIdx === selectedChapterIdx;
                      return (
                        <button
                          key={ch.chapterNumber}
                          onClick={() => { setSelectedChapterIdx(chIdx); setSelectedPointId(null); }}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 5,
                            border: isSelected ? '1px solid var(--border-strong)' : '1px solid transparent',
                            background: isSelected ? 'var(--bg-surface-2)' : 'transparent',
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontSize: '0.78rem',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          Chương {ch.chapterNumber}: {ch.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Active Chapter Details */}
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 16 }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Chương {currentGrammarChapter?.chapterNumber}: {currentGrammarChapter?.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {currentGrammarChapter?.points?.map((point, pIdx) => (
                      <div
                        key={point.id}
                        style={{
                          background: 'var(--bg-surface-2)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 6,
                          padding: '10px 12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '0.7rem', fontWeight: 700, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {pIdx + 1}
                          </span>
                          <strong style={{ fontSize: '0.92rem' }}>{point.pattern}</strong>
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: 4 }}>
                          {point.formula}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                          {point.meaning}
                        </div>

                        {/* Trap Buster */}
                        {point.trapBuster && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--status-error-text)',
                            background: 'var(--status-error-bg)',
                            border: '1px solid var(--status-error)',
                            padding: '4px 8px',
                            borderRadius: 4,
                            marginBottom: 6
                          }}>
                            <strong>Bẻ khóa cạm bẫy:</strong> {point.trapBuster}
                          </div>
                        )}

                        {/* Examples */}
                        {point.examples?.map((ex, exIdx) => (
                          <div key={exIdx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'var(--bg-surface)', padding: '5px 8px', borderRadius: 4, marginTop: 4 }}>
                            <div>
                              <strong>{ex.jp}</strong> — <span style={{ color: 'var(--text-secondary)' }}>{ex.vi}</span>
                            </div>
                            <button
                              onClick={() => speakJapanese(ex.jp)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                              <Volume2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reading Mode */}
            {shinkanzenSkill === 'reading' && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 16 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '0.98rem', fontWeight: 700 }}>
                  Đọc Hiểu Chuyên Sâu Shin Kanzen Master {mainTab.toUpperCase()}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 12 }}>
                  {currentShinkanzenData?.skills?.reading?.map((r, rIdx) => (
                    <div key={r.id || rIdx} style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)', borderRadius: 6, padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>DẠNG BÀI {rIdx + 1}</div>
                      <h4 style={{ margin: '3px 0 6px', fontSize: '0.92rem' }}>{r.title}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, maxHeight: 110, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.passage}
                      </p>
                      <div style={{ marginTop: 8, fontSize: '0.74rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {r.questions?.length || 0} câu hỏi trắc nghiệm
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listening Mode */}
            {shinkanzenSkill === 'listening' && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 16 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '0.98rem', fontWeight: 700 }}>
                  Nghe Hiểu 5 Mondai Shin Kanzen Master {mainTab.toUpperCase()}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 12 }}>
                  {currentShinkanzenData?.skills?.listening?.map((l, lIdx) => (
                    <div key={l.id || lIdx} style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)', borderRadius: 6, padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>MONDAI {lIdx + 1}</div>
                      <h4 style={{ margin: '3px 0 6px', fontSize: '0.92rem' }}>{l.title}</h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                        {l.strategy}
                      </div>
                      <button
                        onClick={() => speakJapanese(l.script || l.title)}
                        style={{
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 4,
                          padding: '4px 8px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        <Volume2 size={13} /> Nghe Audio Mẫu
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* -------------------------------------------------------------- */}
      {/* 3C: PAST EXAMS 10 YEARS (2014 - 2024)                          */}
      {/* -------------------------------------------------------------- */}
      {mainTab === 'exams' && (
        <div>
          {/* Filters */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 12,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 6,
            padding: '6px 12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>CẤP ĐỘ:</span>
              {['all', 'N3', 'N2', 'N1'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setExamLevelFilter(lvl)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: examLevelFilter === lvl ? '1px solid var(--border-strong)' : '1px solid transparent',
                    background: examLevelFilter === lvl ? 'var(--bg-surface-2)' : 'transparent',
                    color: examLevelFilter === lvl ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '0.74rem',
                    fontWeight: examLevelFilter === lvl ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {lvl === 'all' ? 'Tất cả' : lvl}
                </button>
              ))}

              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: 8 }}>NĂM THI:</span>
              {['all', '2024', '2023', '2022', '2021', '2020'].map(yr => (
                <button
                  key={yr}
                  onClick={() => setExamYearFilter(yr)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: examYearFilter === yr ? '1px solid var(--border-strong)' : '1px solid transparent',
                    background: examYearFilter === yr ? 'var(--bg-surface-2)' : 'transparent',
                    color: examYearFilter === yr ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '0.74rem',
                    fontWeight: examYearFilter === yr ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {yr === 'all' ? 'Toàn bộ 10 năm' : yr}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Đang có <strong>{filteredExams.length}</strong> đề thi thật chuẩn JLPT
            </div>
          </div>

          {/* Full-Width Grid of Past Exams */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 12
          }}>
            {filteredExams.map(ex => (
              <div
                key={ex.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 6,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                }}
                onClick={() => setActiveExamForModal(ex)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 4
                  }}>
                    {ex.level}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Kỳ {ex.session === 'jul' ? 'T7' : 'T12'}/{ex.year}
                  </span>
                </div>

                <h4 style={{ margin: '2px 0 0', fontSize: '0.92rem', fontWeight: 700 }}>
                  {ex.title}
                </h4>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Thời gian: {ex.durationMinutes} phút • Điểm chuẩn: {ex.passScore}/180
                </div>

                <button
                  style={{
                    marginTop: 'auto',
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    padding: '6px 10px',
                    borderRadius: 5,
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5
                  }}
                >
                  <Play size={12} /> Vào Phòng Thi Giả Lập
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODALS (Exam Simulator, Mindmap Atlas, Mindmap Canvas)       */}
      {/* ============================================================== */}
      {activeExamForModal && (
        <ExamSimulatorModal
          exam={activeExamForModal}
          onClose={() => setActiveExamForModal(null)}
        />
      )}

      {showAtlasModal && (
        <MindmapAtlasModal
          allLessons={all120Lessons}
          onClose={() => setShowAtlasModal(false)}
        />
      )}

      {activeMindmapLesson && (
        <MindmapCanvasModal
          lesson={activeMindmapLesson}
          onClose={() => setActiveMindmapLesson(null)}
        />
      )}
    </div>
  );
}

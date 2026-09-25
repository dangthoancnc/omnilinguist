// src/JlptMasterDojo.jsx
// Trung tâm Lò Luyện Thi JLPT Toàn Diện (JLPT Master Dojo)
// Tối ưu hóa: Mật độ thông tin cao, Header tinh gọn, Tận dụng 100% bề ngang màn hình rộng,
// Hệ thống Tab phẳng nhỏ gọn, Trang danh mục thẻ bài (Catalog) & Trang bài học riêng biệt (Dedicated Lesson View) có nút Back.

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

  // Level Badge Color Helper
  const getLvlBadge = (lvl) => {
    switch (lvl) {
      case 'N5': return { bg: '#10b981', border: '#34d399', text: '#fff' };
      case 'N4': return { bg: '#06b6d4', border: '#22d3ee', text: '#fff' };
      case 'N3': return { bg: '#f59e0b', border: '#fbbf24', text: '#fff' };
      case 'N2': return { bg: '#8b5cf6', border: '#a78bfa', text: '#fff' };
      case 'N1': return { bg: '#ef4444', border: '#f87171', text: '#fff' };
      default: return { bg: '#3b82f6', border: '#60a5fa', text: '#fff' };
    }
  };

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
      {/* 1. SLIM, HIGH-DENSITY TOP TOOLBAR (Saves ~170px of screen space)*/}
      {/* ============================================================== */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--glass-border)',
        borderRadius: 10,
        padding: '8px 14px',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10
      }}>
        {/* Left: Compact Branding & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #f43f5e, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 800,
            flexShrink: 0
          }}>
            🏛️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Lò Luyện Thi JLPT Toàn Diện (JLPT Master Dojo)
              </h1>
              <span style={{
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#0ea5e9',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: 8
              }}>
                N5 – N1
              </span>
            </div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)' }}>
              120 Bài Bản Lề Quốc Dân • Sơ Đồ Sketchnote Mindmap • Shin Kanzen Master • Đề Thi 10 Năm
            </div>
          </div>
        </div>

        {/* Right: Quick Micro-Stats & Mindmap Atlas Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <span style={{ background: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--glass-border)' }}>
              <strong style={{ color: '#0ea5e9' }}>120</strong> Bài Bản Lề
            </span>
            <span style={{ background: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--glass-border)' }}>
              <strong style={{ color: '#f43f5e' }}>120</strong> Mindmap
            </span>
            <span style={{ background: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--glass-border)' }}>
              <strong style={{ color: '#f59e0b' }}>480+</strong> Bẫy JLPT
            </span>
            <span style={{ background: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--glass-border)' }}>
              <strong style={{ color: '#10b981' }}>63</strong> Đề Thi
            </span>
          </div>

          <button
            onClick={() => setShowAtlasModal(true)}
            style={{
              background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(244, 63, 94, 0.25)'
            }}
          >
            <Compass size={14} />
            <span>🗺️ Bách Khoa Mindmap Atlas</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SLEEK, UNIFIED COMPACT TAB BAR (Minimalist, No Clutter)      */}
      {/* ============================================================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        borderBottom: '1px solid var(--glass-border)',
        paddingBottom: 8,
        marginBottom: 14,
        flexWrap: 'wrap'
      }}>
        {/* Main Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { id: 'minna', label: '🌱 Minna No Nihongo (1–50)', color: '#10b981' },
            { id: 'n3', label: '🥋 Lò Luyện N3', color: '#f59e0b' },
            { id: 'n2', label: '⚔️ Lò Luyện N2', color: '#8b5cf6' },
            { id: 'n1', label: '👑 Lò Luyện N1', color: '#ef4444' },
            { id: 'exams', label: '⏱️ Đề Thi 10 Năm (2014–2024)', color: '#2563eb' }
          ].map(tab => {
            const isActive = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setMainTab(tab.id);
                  setLessonView('catalog'); // return to catalog view on tab switch
                  if (tab.id === 'n3') { setSelectedFoundationLessonNum(51); setSelectedChapterIdx(0); setSelectedPointId(null); }
                  if (tab.id === 'n2') { setSelectedFoundationLessonNum(76); setSelectedChapterIdx(0); setSelectedPointId(null); }
                  if (tab.id === 'n1') { setSelectedFoundationLessonNum(101); setSelectedChapterIdx(0); setSelectedPointId(null); }
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  border: isActive ? `1.5px solid ${tab.color}` : '1px solid var(--glass-border)',
                  background: isActive ? `${tab.color}15` : 'var(--bg-surface)',
                  color: isActive ? tab.color : 'var(--text-secondary)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.12s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sub-mode Segmented Pills for N3, N2, N1 */}
        {(mainTab === 'n3' || mainTab === 'n2' || mainTab === 'n1') && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-elevated)',
            padding: '2px',
            borderRadius: 7,
            border: '1px solid var(--glass-border)'
          }}>
            <button
              onClick={() => { setSubMode('foundation'); }}
              style={{
                padding: '4px 10px',
                borderRadius: 5,
                border: 'none',
                background: subMode === 'foundation' ? 'var(--bg-surface)' : 'transparent',
                color: subMode === 'foundation' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: subMode === 'foundation' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📚 25 Bài Bản Lề & Mindmap
            </button>
            <button
              onClick={() => { setSubMode('combat'); }}
              style={{
                padding: '4px 10px',
                borderRadius: 5,
                border: 'none',
                background: subMode === 'combat' ? 'var(--bg-surface)' : 'transparent',
                color: subMode === 'combat' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: subMode === 'combat' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🎯 Bẻ Bẫy Shin Kanzen (5 Phân Môn)
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
          /* MINNA CATALOG VIEW (Full Width Grid) */
          <div>
            {/* Catalog Filter & Search Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 14,
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 8,
              padding: '8px 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[
                  { id: 'all', label: 'Tất Cả 50 Bài' },
                  { id: 'n5', label: 'N5 Tập 1 (Bài 1–25)' },
                  { id: 'n4', label: 'N4 Tập 2 (Bài 26–50)' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setMinnaFilter(f.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: minnaFilter === f.id ? '#10b981' : 'var(--bg-elevated)',
                      color: minnaFilter === f.id ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
                <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', marginLeft: 6 }}>
                  (Hiển thị {filteredMinnaLessons.length} bài)
                </span>
              </div>

              {/* Fast Search */}
              <div style={{ position: 'relative', width: 280 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Tìm bài học, mẫu ngữ pháp, trụ cột..."
                  value={minnaSearch}
                  onChange={e => setMinnaSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 10px 5px 30px',
                    borderRadius: 6,
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Full-Width Grid of 50 Minna Lessons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: 14
            }}>
              {filteredMinnaLessons.map(lesson => {
                const bCount = lesson.grammarPoints?.length || 0;
                const mascot = lesson.mindmap?.mascotIcon || '🌸';
                const lvlBadge = getLvlBadge(lesson.level);

                return (
                  <div
                    key={lesson.lessonNumber}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      transition: 'all 0.15s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(16, 185, 129, 0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => {
                      setSelectedLessonNum(lesson.lessonNumber);
                      setLessonView('lesson');
                    }}
                  >
                    {/* Card Top: Mascot + Level + Points count */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.3rem' }}>{mascot}</span>
                        <span style={{
                          background: lvlBadge.bg,
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 8
                        }}>
                          {lesson.level} • 第{lesson.lessonNumber}課
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        {bCount} mẫu câu
                      </span>
                    </div>

                    {/* Titles */}
                    <div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '2px 0 2px', color: 'var(--text-primary)' }}>
                        {lesson.jpTitle}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                        {lesson.viTitle}
                      </div>
                    </div>

                    {/* Pillar chip */}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                      Trụ cột: <strong style={{ color: 'var(--text-secondary)' }}>{lesson.pillar}</strong>
                    </div>

                    {/* Branches preview */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                      {lesson.mindmap?.branches?.slice(0, 3).map((b, bIdx) => (
                        <span
                          key={bIdx}
                          style={{
                            background: 'var(--bg-elevated)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 4,
                            color: b.color || '#38bdf8',
                            border: `1px solid ${b.color || '#38bdf8'}33`
                          }}
                        >
                          {b.icon || '🎯'} {b.name}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      paddingTop: 8,
                      borderTop: '1px solid var(--glass-border)'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMindmapLesson(lesson);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f43f5e',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Compass size={13} /> Sơ Đồ Sketchnote
                      </button>

                      <span style={{
                        color: '#10b981',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        Vào Học Bài <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* MINNA DEDICATED LESSON VIEW (Full Width Immersion) */
          <div>
            {/* Top Navigation & Breadcrumbs Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 10,
              padding: '8px 14px',
              marginBottom: 14,
              flexWrap: 'wrap',
              gap: 10
            }}>
              {/* Back button & Breadcrumbs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => setLessonView('catalog')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    padding: '6px 12px',
                    borderRadius: 7,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={15} /> Quay lại danh mục 50 bài
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem' }}>
                  <span style={{
                    background: activeLesson.level === 'N5' ? '#10b981' : '#3b82f6',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: '0.74rem'
                  }}>
                    {activeLesson.level} • 第{activeLesson.lessonNumber}課
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {activeLesson.jpTitle}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                    ({activeLesson.viTitle})
                  </span>
                </div>
              </div>

              {/* Prev / Next & Action controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  disabled={selectedLessonNum <= 1}
                  onClick={() => goToAdjacentMinna(-1)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-elevated)',
                    color: selectedLessonNum <= 1 ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    cursor: selectedLessonNum <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <ChevronLeft size={14} /> Bài trước
                </button>

                <button
                  disabled={selectedLessonNum >= 50}
                  onClick={() => goToAdjacentMinna(1)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-elevated)',
                    color: selectedLessonNum >= 50 ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    cursor: selectedLessonNum >= 50 ? 'not-allowed' : 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  Bài tiếp <ChevronRight size={14} />
                </button>

                <button
                  onClick={() => setActiveMindmapLesson(activeLesson)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: 7,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={14} /> 🌸 Mở Sơ Đồ Sketchnote Toàn Màn Hình
                </button>
              </div>
            </div>

            {/* SƠ ĐỒ SKETCHNOTE SAKURA IN-PLACE (Compact & Full Width) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.05), rgba(99, 102, 241, 0.05))',
              border: '1.5px solid rgba(244, 63, 94, 0.25)',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#f43f5e', fontSize: '0.98rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{activeLesson.mindmap?.mascotIcon || '🌸'}</span>
                  <span>SƠ ĐỒ TƯ DUY SKETCHNOTE SAKURA: {activeLesson.mindmap?.center || activeLesson.jpTitle}</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                  Trụ cột: {activeLesson.pillar}
                </div>
              </div>

              {/* Root Connection */}
              {activeLesson.mindmap?.rootConnection && (
                <div style={{ fontSize: '0.78rem', color: '#0284c7', background: 'rgba(56, 189, 248, 0.1)', padding: '5px 10px', borderRadius: 6, marginBottom: 10 }}>
                  🌱 <strong>Cội nguồn:</strong> {activeLesson.mindmap.rootConnection}
                </div>
              )}

              {/* Branches Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8, marginBottom: 10 }}>
                {activeLesson.mindmap.branches?.map((branch, bIdx) => {
                  const bName = typeof branch === 'object' ? branch.name : branch;
                  const bFormula = typeof branch === 'object' ? branch.formula : null;
                  const bIcon = typeof branch === 'object' ? branch.icon : '🌸';
                  const bMetaphor = typeof branch === 'object' ? branch.metaphor : null;
                  return (
                    <div key={bIdx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '1rem' }}>{bIcon || '🌸'}</span>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>{bName}</strong>
                      </div>
                      {bFormula && <div style={{ color: '#94a3b8', fontSize: '0.74rem', fontFamily: 'monospace' }}>{bFormula}</div>}
                      {bMetaphor && <div style={{ color: '#d97706', fontSize: '0.72rem' }}>🎨 {bMetaphor}</div>}
                    </div>
                  );
                })}
              </div>

              {/* Trap & Tip Footer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '0.8rem', color: '#b45309', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 10px', borderRadius: 6 }}>
                  💡 <strong>Mẹo ghi nhớ:</strong> {activeLesson.mindmap?.tip}
                </div>
                {activeLesson.mindmap?.trapRadar && (
                  <div style={{ fontSize: '0.8rem', color: '#be185d', background: 'rgba(236, 72, 153, 0.1)', padding: '6px 10px', borderRadius: 6 }}>
                    🛡️ <strong>Khiên bẫy đề thi:</strong> {activeLesson.mindmap.trapRadar}
                  </div>
                )}
              </div>
            </div>

            {/* GRAMMAR POINTS LIST (Full-Width High-Density View) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} color="#10b981" /> Các Mẫu Ngữ Pháp Trọng Tâm ({activeLesson.grammarPoints.length} Mẫu)
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                  Học lý thuyết bên trái & Luyện phản xạ trắc nghiệm bên phải
                </span>
              </div>

              {activeLesson.grammarPoints.map((point, pIdx) => (
                <div
                  key={point.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    display: 'grid',
                    gridTemplateColumns: point.drills && point.drills.length > 0 ? 'minmax(0, 1.3fr) minmax(0, 1fr)' : '1fr',
                    gap: 20,
                    alignItems: 'start'
                  }}
                >
                  {/* Left Column: Theory, Formula, Examples */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#10b981',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        {pIdx + 1}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {point.pattern}
                      </h4>
                    </div>

                    {/* Formula */}
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      borderLeft: '3px solid #10b981',
                      padding: '8px 12px',
                      borderRadius: '0 8px 8px 0',
                      marginBottom: 10,
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#059669',
                      fontWeight: 700
                    }}>
                      {point.formula}
                    </div>

                    {/* Meaning & Nuance */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                        Ý nghĩa: {point.meaning}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {point.nuance}
                      </div>
                    </div>

                    {/* Examples with Audio */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                        Ví Dụ Thực Tế:
                      </div>
                      {point.examples.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          style={{
                            background: 'var(--bg-elevated)',
                            padding: '8px 12px',
                            borderRadius: 7,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                              <FuriganaText text={ex.jp} />
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {ex.vi}
                            </div>
                          </div>
                          <button
                            onClick={() => speakJapanese(ex.jp)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#0ea5e9',
                              cursor: 'pointer',
                              padding: 4
                            }}
                            title="Nghe phát âm tiếng Nhật"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Interactive Reflex Drills */}
                  {point.drills && point.drills.length > 0 && (
                    <div style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 10,
                      padding: '12px 14px'
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Zap size={14} /> TRẮC NGHIỆM PHẢN XẠ NHANH:
                      </div>
                      {point.drills.map((drill, dIdx) => {
                        const answerKey = `${point.id}_${dIdx}`;
                        const selectedOpt = minnaQuizAnswer[answerKey];
                        const isCorrect = selectedOpt === drill.correct;

                        return (
                          <div key={dIdx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {drill.q}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 4 }}>
                              {drill.options.map((opt, optIdx) => {
                                const isChosen = selectedOpt === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => setMinnaQuizAnswer(prev => ({ ...prev, [answerKey]: optIdx }))}
                                    style={{
                                      padding: '6px 10px',
                                      borderRadius: 6,
                                      border: isChosen ? (isCorrect ? '1.5px solid #10b981' : '1.5px solid #ef4444') : '1px solid var(--glass-border)',
                                      background: isChosen ? (isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)') : 'var(--bg-surface)',
                                      color: isChosen ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--text-primary)',
                                      fontSize: '0.8rem',
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
                              <div style={{ fontSize: '0.78rem', color: isCorrect ? '#10b981' : '#ef4444', marginTop: 4 }}>
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
            /* FOUNDATION CATALOG VIEW (Full Width Grid) */
            <div>
              {/* Toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 14,
                background: 'var(--bg-surface)',
                border: '1px solid var(--glass-border)',
                borderRadius: 8,
                padding: '8px 14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    background: getLvlBadge(mainTab.toUpperCase()).bg,
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}>
                    {mainTab.toUpperCase()} BẢN LỀ
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Đại Lộ Trình 25 Bài Học Bản Lề Chuẩn Sư Phạm
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    (Hiển thị {filteredFoundationLessons.length} bài)
                  </span>
                </div>

                {/* Fast Search */}
                <div style={{ position: 'relative', width: 280 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên bài, ngữ pháp, chủ đề..."
                    value={foundationSearch}
                    onChange={e => setFoundationSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 10px 5px 30px',
                      borderRadius: 6,
                      border: '1px solid var(--glass-border)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Full-Width Grid of Foundation Lessons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                gap: 14
              }}>
                {filteredFoundationLessons.map(lesson => {
                  const bCount = lesson.grammarPoints?.length || 0;
                  const mascot = lesson.mindmap?.mascotIcon || '🌸';
                  const lvlBadge = getLvlBadge(lesson.level);

                  return (
                    <div
                      key={lesson.lessonNumber}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 12,
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        transition: 'all 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = lvlBadge.bg;
                        e.currentTarget.style.boxShadow = `0 6px 18px ${lvlBadge.bg}22`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onClick={() => {
                        setSelectedFoundationLessonNum(lesson.lessonNumber);
                        setLessonView('lesson');
                      }}
                    >
                      {/* Top Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1.3rem' }}>{mascot}</span>
                          <span style={{
                            background: lvlBadge.bg,
                            color: '#fff',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 8
                          }}>
                            {lesson.level} • 第{lesson.lessonNumber}課
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          {bCount} mẫu câu
                        </span>
                      </div>

                      {/* Titles */}
                      <div>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '2px 0 2px', color: 'var(--text-primary)' }}>
                          {lesson.jpTitle}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: lvlBadge.bg, fontWeight: 600 }}>
                          {lesson.viTitle}
                        </div>
                      </div>

                      {/* Pillar */}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        Trụ cột: <strong style={{ color: 'var(--text-secondary)' }}>{lesson.pillar}</strong>
                      </div>

                      {/* Branches Preview */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                        {lesson.mindmap?.branches?.slice(0, 3).map((b, bIdx) => (
                          <span
                            key={bIdx}
                            style={{
                              background: 'var(--bg-elevated)',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 4,
                              color: b.color || '#38bdf8',
                              border: `1px solid ${b.color || '#38bdf8'}33`
                            }}
                          >
                            {b.icon || '🌸'} {b.name}
                          </span>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                        paddingTop: 8,
                        borderTop: '1px solid var(--glass-border)'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMindmapLesson(lesson);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#f43f5e',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Compass size={13} /> Sơ Đồ Sketchnote
                        </button>

                        <span style={{
                          color: lvlBadge.bg,
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          Vào Học Bài <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* FOUNDATION DEDICATED LESSON VIEW (Full Width Immersion) */
            <div>
              {/* Top Navigation & Breadcrumbs Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)',
                border: '1px solid var(--glass-border)',
                borderRadius: 10,
                padding: '8px 14px',
                marginBottom: 14,
                flexWrap: 'wrap',
                gap: 10
              }}>
                {/* Back button & Breadcrumbs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => setLessonView('catalog')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      padding: '6px 12px',
                      borderRadius: 7,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={15} /> Quay lại danh mục {activeFoundationLesson.level}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem' }}>
                    <span style={{
                      background: getLvlBadge(activeFoundationLesson.level).bg,
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: '0.74rem'
                    }}>
                      {activeFoundationLesson.level} • 第{activeFoundationLesson.lessonNumber}課
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      {activeFoundationLesson.jpTitle}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                      ({activeFoundationLesson.viTitle})
                    </span>
                  </div>
                </div>

                {/* Prev / Next & Action controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => goToAdjacentFoundation(-1)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--glass-border)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <ChevronLeft size={14} /> Bài trước
                  </button>

                  <button
                    onClick={() => goToAdjacentFoundation(1)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--glass-border)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    Bài tiếp <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => setActiveMindmapLesson(activeFoundationLesson)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 7,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={14} /> 🌸 Mở Sơ Đồ Sketchnote Toàn Màn Hình
                  </button>
                </div>
              </div>

              {/* SƠ ĐỒ SKETCHNOTE SAKURA IN-PLACE (Full Width & Compact) */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.05), rgba(139, 92, 246, 0.05))',
                border: '1.5px solid rgba(244, 63, 94, 0.25)',
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#f43f5e', fontSize: '0.98rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>{activeFoundationLesson.mindmap?.mascotIcon || '🌸'}</span>
                    <span>SƠ ĐỒ TƯ DUY SKETCHNOTE SAKURA: {activeFoundationLesson.mindmap?.center || activeFoundationLesson.jpTitle}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: getLvlBadge(activeFoundationLesson.level).bg, background: 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                    Trụ cột: {activeFoundationLesson.pillar}
                  </div>
                </div>

                {/* Root Connection */}
                {activeFoundationLesson.mindmap?.rootConnection && (
                  <div style={{ fontSize: '0.78rem', color: '#0284c7', background: 'rgba(56, 189, 248, 0.1)', padding: '5px 10px', borderRadius: 6, marginBottom: 10 }}>
                    🌱 <strong>Cội nguồn:</strong> {activeFoundationLesson.mindmap.rootConnection}
                  </div>
                )}

                {/* Branches Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8, marginBottom: 10 }}>
                  {activeFoundationLesson.mindmap.branches?.map((branch, bIdx) => {
                    const bName = typeof branch === 'object' ? branch.name : branch;
                    const bFormula = typeof branch === 'object' ? branch.formula : null;
                    const bIcon = typeof branch === 'object' ? branch.icon : '🌸';
                    const bMetaphor = typeof branch === 'object' ? branch.metaphor : null;
                    return (
                      <div key={bIdx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '1rem' }}>{bIcon || '🌸'}</span>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>{bName}</strong>
                        </div>
                        {bFormula && <div style={{ color: '#94a3b8', fontSize: '0.74rem', fontFamily: 'monospace' }}>{bFormula}</div>}
                        {bMetaphor && <div style={{ color: '#d97706', fontSize: '0.72rem' }}>🎨 {bMetaphor}</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Trap & Tip Footer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: '0.8rem', color: '#b45309', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 10px', borderRadius: 6 }}>
                    💡 <strong>Mẹo ghi nhớ:</strong> {activeFoundationLesson.mindmap?.tip}
                  </div>
                  {activeFoundationLesson.mindmap?.trapRadar && (
                    <div style={{ fontSize: '0.8rem', color: '#be185d', background: 'rgba(236, 72, 153, 0.1)', padding: '6px 10px', borderRadius: 6 }}>
                      🛡️ <strong>Khiên bẫy đề thi:</strong> {activeFoundationLesson.mindmap.trapRadar}
                    </div>
                  )}
                </div>
              </div>

              {/* GRAMMAR POINTS LIST (Full-Width High-Density Layout) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={18} color="#0ea5e9" /> Các Mẫu Ngữ Pháp Trọng Tâm ({activeFoundationLesson.grammarPoints.length} Mẫu)
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    Học lý thuyết bên trái & Luyện phản xạ trắc nghiệm bên phải
                  </span>
                </div>

                {activeFoundationLesson.grammarPoints.map((point, pIdx) => (
                  <div
                    key={point.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 12,
                      padding: '16px 20px',
                      display: 'grid',
                      gridTemplateColumns: point.drills && point.drills.length > 0 ? 'minmax(0, 1.3fr) minmax(0, 1fr)' : '1fr',
                      gap: 20,
                      alignItems: 'start'
                    }}
                  >
                    {/* Left Column: Theory, Formula, Examples */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: getLvlBadge(activeFoundationLesson.level).bg,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}>
                          {pIdx + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {point.pattern}
                        </h4>
                      </div>

                      {/* Formula */}
                      <div style={{
                        background: 'rgba(14, 165, 233, 0.08)',
                        borderLeft: `3px solid ${getLvlBadge(activeFoundationLesson.level).bg}`,
                        padding: '8px 12px',
                        borderRadius: '0 8px 8px 0',
                        marginBottom: 10,
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        color: '#0284c7',
                        fontWeight: 700
                      }}>
                        {point.formula}
                      </div>

                      {/* Meaning & Nuance */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                          Ý nghĩa: {point.meaning}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {point.nuance}
                        </div>
                      </div>

                      {/* Trap Buster */}
                      {point.trapBuster && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 6,
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: 7,
                          padding: '6px 10px',
                          marginBottom: 10,
                          fontSize: '0.8rem',
                          color: '#ef4444'
                        }}>
                          <ShieldAlert size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                          <div><strong>Bẻ khóa cạm bẫy:</strong> {point.trapBuster}</div>
                        </div>
                      )}

                      {/* Examples with Audio */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                          Ví Dụ Thực Tế:
                        </div>
                        {point.examples.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            style={{
                              background: 'var(--bg-elevated)',
                              padding: '8px 12px',
                              borderRadius: 7,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 10
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                                <FuriganaText text={ex.jp} />
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {ex.vi}
                              </div>
                            </div>
                            <button
                              onClick={() => speakJapanese(ex.jp)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#0ea5e9',
                                cursor: 'pointer',
                                padding: 4
                              }}
                              title="Nghe phát âm tiếng Nhật"
                            >
                              <Volume2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Interactive Reflex Drills */}
                    {point.drills && point.drills.length > 0 && (
                      <div style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 10,
                        padding: '12px 14px'
                      }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Zap size={14} /> TRẮC NGHIỆM PHẢN XẠ NHANH:
                        </div>
                        {point.drills.map((drill, dIdx) => {
                          const answerKey = `${point.id}_${dIdx}`;
                          const selectedOpt = foundationQuizAnswer[answerKey];
                          const isCorrect = selectedOpt === drill.correct;

                          return (
                            <div key={dIdx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {drill.q}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 4 }}>
                                {drill.options.map((opt, optIdx) => {
                                  const isChosen = selectedOpt === optIdx;
                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => setFoundationQuizAnswer(prev => ({ ...prev, [answerKey]: optIdx }))}
                                      style={{
                                        padding: '6px 10px',
                                        borderRadius: 6,
                                        border: isChosen ? (isCorrect ? '1.5px solid #10b981' : '1.5px solid #ef4444') : '1px solid var(--glass-border)',
                                        background: isChosen ? (isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)') : 'var(--bg-surface)',
                                        color: isChosen ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--text-primary)',
                                        fontSize: '0.8rem',
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
                                <div style={{ fontSize: '0.78rem', color: isCorrect ? '#10b981' : '#ef4444', marginTop: 4 }}>
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
          /* SHINKANZEN MASTER COMBAT MODE (Full Width High-Density) */
          <div>
            {/* Skill Sub-Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
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
                      padding: '6px 14px',
                      borderRadius: 7,
                      border: isSelected ? '1.5px solid #f59e0b' : '1px solid var(--glass-border)',
                      background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface)',
                      color: isSelected ? '#f59e0b' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <IconComponent size={15} />
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Grammar Mode */}
            {shinkanzenSkill === 'grammar' && (
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18, alignItems: 'start' }}>
                {/* Left: Chapters & Points */}
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: 14 }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 800 }}>
                    📖 Chương Ngữ Pháp {mainTab.toUpperCase()}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '680px', overflowY: 'auto' }}>
                    {currentShinkanzenData?.skills?.grammar?.map((ch, chIdx) => {
                      const isSelected = chIdx === selectedChapterIdx;
                      return (
                        <button
                          key={ch.chapterNumber}
                          onClick={() => { setSelectedChapterIdx(chIdx); setSelectedPointId(null); }}
                          style={{
                            padding: '9px 12px',
                            borderRadius: 7,
                            border: isSelected ? '1.5px solid #f59e0b' : '1px solid var(--glass-border)',
                            background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-elevated)',
                            color: isSelected ? '#f59e0b' : 'var(--text-primary)',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 800 : 600,
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
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: 18 }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>
                    Chương {currentGrammarChapter?.chapterNumber}: {currentGrammarChapter?.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {currentGrammarChapter?.points?.map((point, pIdx) => (
                      <div
                        key={point.id}
                        style={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 9,
                          padding: '12px 16px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ background: '#f59e0b', color: '#fff', fontSize: '0.72rem', fontWeight: 800, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {pIdx + 1}
                          </span>
                          <strong style={{ fontSize: '1rem' }}>{point.pattern}</strong>
                        </div>
                        <div style={{ color: '#0ea5e9', fontFamily: 'monospace', fontSize: '0.82rem', marginBottom: 6 }}>
                          {point.formula}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                          {point.meaning}
                        </div>

                        {/* Trap Buster */}
                        {point.trapBuster && (
                          <div style={{
                            fontSize: '0.78rem',
                            color: '#ef4444',
                            background: 'rgba(239, 68, 68, 0.08)',
                            padding: '6px 10px',
                            borderRadius: 6,
                            marginBottom: 8
                          }}>
                            🛡️ <strong>Bẻ khóa bẫy đề thi:</strong> {point.trapBuster}
                          </div>
                        )}

                        {/* Examples */}
                        {point.examples?.map((ex, exIdx) => (
                          <div key={exIdx} style={{ fontSize: '0.84rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: 6, marginTop: 4 }}>
                            <div>
                              <strong>{ex.jp}</strong> — <span style={{ color: 'var(--text-secondary)' }}>{ex.vi}</span>
                            </div>
                            <button
                              onClick={() => speakJapanese(ex.jp)}
                              style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer' }}
                            >
                              <Volume2 size={15} />
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
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>
                  🎯 Đọc Hiểu Chuyên Sâu Shin Kanzen Master {mainTab.toUpperCase()}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                  {currentShinkanzenData?.skills?.reading?.map((r, rIdx) => (
                    <div key={r.id || rIdx} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 9, padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 800 }}>DẠNG BÀI {rIdx + 1}</div>
                      <h4 style={{ margin: '4px 0 8px', fontSize: '0.98rem' }}>{r.title}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, maxHeight: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.passage}
                      </p>
                      <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#0ea5e9', fontWeight: 700 }}>
                        {r.questions?.length || 0} câu hỏi trắc nghiệm
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listening Mode */}
            {shinkanzenSkill === 'listening' && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>
                  🎧 Nghe Hiểu 5 Mondai Shin Kanzen Master {mainTab.toUpperCase()}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                  {currentShinkanzenData?.skills?.listening?.map((l, lIdx) => (
                    <div key={l.id || lIdx} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 9, padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 800 }}>MONDAI {lIdx + 1}</div>
                      <h4 style={{ margin: '4px 0 8px', fontSize: '0.98rem' }}>{l.title}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                        {l.strategy}
                      </div>
                      <button
                        onClick={() => speakJapanese(l.script || l.title)}
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          border: '1px solid #f59e0b55',
                          borderRadius: 6,
                          padding: '5px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Volume2 size={14} /> Nghe Audio Mẫu
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
            marginBottom: 14,
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)',
            borderRadius: 8,
            padding: '8px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb' }}>CẤP ĐỘ:</span>
              {['all', 'N3', 'N2', 'N1'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setExamLevelFilter(lvl)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: 5,
                    border: 'none',
                    background: examLevelFilter === lvl ? '#2563eb' : 'var(--bg-elevated)',
                    color: examLevelFilter === lvl ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {lvl === 'all' ? 'Tất cả cấp' : lvl}
                </button>
              ))}

              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb', marginLeft: 10 }}>NĂM THI:</span>
              {['all', '2024', '2023', '2022', '2021', '2020'].map(yr => (
                <button
                  key={yr}
                  onClick={() => setExamYearFilter(yr)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: 5,
                    border: 'none',
                    background: examYearFilter === yr ? '#2563eb' : 'var(--bg-elevated)',
                    color: examYearFilter === yr ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {yr === 'all' ? 'Toàn bộ 10 năm' : yr}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              Đang có <strong>{filteredExams.length}</strong> đề thi thật chuẩn định dạng JLPT
            </div>
          </div>

          {/* Full-Width Grid of Past Exams */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 14
          }}>
            {filteredExams.map(ex => {
              const lvlBadge = getLvlBadge(ex.level);
              return (
                <div
                  key={ex.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 10,
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.transform = 'none';
                  }}
                  onClick={() => setActiveExamForModal(ex)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      background: lvlBadge.bg,
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 6
                    }}>
                      {ex.level}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 800 }}>
                      Kỳ {ex.session === 'jul' ? 'Tháng 7' : 'Tháng 12'}/{ex.year}
                    </span>
                  </div>

                  <h4 style={{ margin: '2px 0 0', fontSize: '0.98rem', fontWeight: 800 }}>
                    {ex.title}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    Thời gian: {ex.durationMinutes} phút • Điểm chuẩn: {ex.passScore}/180
                  </div>

                  <button
                    style={{
                      marginTop: 'auto',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: '#fff',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: 7,
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Play size={13} /> Vào Phòng Thi Giả Lập
                  </button>
                </div>
              );
            })}
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

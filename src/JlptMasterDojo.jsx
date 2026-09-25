// src/JlptMasterDojo.jsx
// JLPT Master Dojo v2.0 — Router Hub Architecture
// Thiết kế: Content-First, Chapter-Based, Compact Toolbar 48px, Zero Duplication.

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BookOpen, Target, Award, Network, Swords, ArrowRight, 
  Layers, CheckCircle, Sparkles, FolderTree 
} from 'lucide-react';
import { PAGE_SHELL, JLPT_LEVEL_COLORS, getLevelBadgeStyle } from './theme';

// Import CSS Design System
import './styles/jlpt-dojo.css';

// Import Curriculum Data Sources
import minnaCorpus from './data/curriculum/minna_master_50.json';
import n3FoundationLessons from './data/curriculum/n3_foundation_lessons.json';
import n2FoundationLessons from './data/curriculum/n2_foundation_lessons.json';
import n1FoundationLessons from './data/curriculum/n1_foundation_lessons.json';
import shinkanzenN3 from './data/curriculum/shinkanzen_n3.json';
import shinkanzenN2 from './data/curriculum/shinkanzen_n2.json';
import shinkanzenN1 from './data/curriculum/shinkanzen_n1.json';
import pastExamsData from './data/curriculum/jlpt_past_exams_10yr.json';

// Import Shared & Page View Components
import LessonCatalogView from './components/jlpt/LessonCatalogView';
import LessonDetailPage from './components/jlpt/LessonDetailPage';
import ShinkanzenCombatView from './components/jlpt/ShinkanzenCombatView';
import ExamGalleryView from './components/jlpt/ExamGalleryView';
import MindmapExplorerView from './components/jlpt/MindmapExplorerView';
import ExamSimulatorModal from './components/jlpt/ExamSimulatorModal';

export default function JlptMasterDojo() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL parameters sync
  const currentTab = searchParams.get('tab') || 'minna';
  const currentView = searchParams.get('view') || 'catalog';
  const lessonNumberParam = searchParams.get('lesson');
  const subMode = searchParams.get('mode') || 'foundation'; // 'foundation' | 'combat'

  // Exam simulator modal state
  const [activeExam, setActiveExam] = useState(null);

  // Global user drill answers cache
  const [quizAnswers, setQuizAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('omni_jlpt_drills');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleAnswerQuiz = (pointId, drillIdx, optIdx) => {
    setQuizAnswers(prev => {
      const next = { ...prev, [`${pointId}_${drillIdx}`]: optIdx };
      try {
        localStorage.setItem('omni_jlpt_drills', JSON.stringify(next));
      } catch (e) {
        console.error('Storage error:', e);
      }
      return next;
    });
  };

  // Full continuous sequence of 120 lessons (N5 through N1)
  const all120Lessons = useMemo(() => [
    ...minnaCorpus,
    ...n3FoundationLessons,
    ...n2FoundationLessons,
    ...n1FoundationLessons
  ], []);

  // Currently selected lesson object (if in lesson detail view)
  const currentLesson = useMemo(() => {
    if (!lessonNumberParam) return null;
    const num = parseInt(lessonNumberParam, 10);
    return all120Lessons.find(l => l.lessonNumber === num) || null;
  }, [all120Lessons, lessonNumberParam]);

  // Tab definitions
  const TABS = [
    { id: 'minna', label: 'Minna No Nihongo', badge: '1–50' },
    { id: 'n3', label: 'Lò Luyện N3', badge: '25 Bài' },
    { id: 'n2', label: 'Lò Luyện N2', badge: '25 Bài' },
    { id: 'n1', label: 'Lò Luyện N1', badge: '20 Bài' },
    { id: 'exams', label: 'Đề Thi 10 Năm', badge: '63 Đề' },
    { id: 'mindmap', label: 'Bách Khoa Mindmap', badge: '120 Sơ đồ' },
  ];

  // Navigation handlers
  const handleSelectTab = (tabId) => {
    setSearchParams({ tab: tabId, view: 'catalog' });
  };

  const handleSelectLesson = (lesson) => {
    setSearchParams({
      tab: currentTab,
      view: 'lesson',
      lesson: lesson.lessonNumber,
      mode: subMode,
    });
  };

  const handleBackToCatalog = () => {
    setSearchParams({
      tab: currentTab,
      view: 'catalog',
      mode: subMode,
    });
  };

  const handlePrevLesson = () => {
    if (!currentLesson || currentLesson.lessonNumber <= 1) return;
    setSearchParams({
      tab: currentTab,
      view: 'lesson',
      lesson: currentLesson.lessonNumber - 1,
      mode: subMode,
    });
  };

  const handleNextLesson = () => {
    if (!currentLesson || currentLesson.lessonNumber >= all120Lessons.length) return;
    setSearchParams({
      tab: currentTab,
      view: 'lesson',
      lesson: currentLesson.lessonNumber + 1,
      mode: subMode,
    });
  };

  const handleNavigateToLessonNumber = (targetNum) => {
    const num = parseInt(targetNum, 10);
    if (isNaN(num)) return;
    const target = all120Lessons.find(l => l.lessonNumber === num);
    if (!target) return;
    const tab = (target.level === 'N5' || target.level === 'N4') ? 'minna' :
                target.level === 'N3' ? 'n3' :
                target.level === 'N2' ? 'n2' : 'n1';
    setSearchParams({
      tab,
      view: 'lesson',
      lesson: num,
      mode: 'foundation',
    });
  };

  const handleToggleCombatMode = (mode) => {
    setSearchParams({
      tab: currentTab,
      view: 'catalog',
      mode,
    });
  };

  return (
    <div className={PAGE_SHELL.STUDIO} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Global Tab Bar (When in catalog/hub mode) */}
      {currentView !== 'lesson' && (
        <div style={{
          height: '44px',
          minHeight: '44px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          gap: '12px',
          overflowX: 'auto',
          flexShrink: 0,
        }}>
          {/* Main Tab Pills */}
          <div className="jlpt-view-toggle" style={{ background: 'transparent', border: 'none', gap: '4px' }}>
            {TABS.map((t) => {
              const isActive = currentTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`jlpt-view-toggle-btn ${isActive ? 'jlpt-view-toggle-btn--active' : ''}`}
                  onClick={() => handleSelectTab(t.id)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span>{t.label}</span>
                  <span style={{ 
                    fontSize: '10px', 
                    opacity: 0.85, 
                    padding: '1px 6px', 
                    borderRadius: '4px',
                    background: isActive ? 'var(--accent-primary)' : 'var(--bg-surface-3)',
                    color: isActive ? '#fff' : 'inherit',
                    whiteSpace: 'nowrap',
                    lineHeight: '16px',
                    flexShrink: 0,
                  }}>
                    {t.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-mode Segmented Control for N3, N2, N1 (Foundation vs Combat) */}
          {['n3', 'n2', 'n1'].includes(currentTab) && (
            <div className="jlpt-view-toggle">
              <button
                type="button"
                className={`jlpt-view-toggle-btn ${subMode === 'foundation' ? 'jlpt-view-toggle-btn--active' : ''}`}
                onClick={() => handleToggleCombatMode('foundation')}
                title="Học 25 bài bản lề theo giáo trình chuẩn"
              >
                <BookOpen size={12} />
                <span>Bài Bản Lề</span>
              </button>
              <button
                type="button"
                className={`jlpt-view-toggle-btn ${subMode === 'combat' ? 'jlpt-view-toggle-btn--active' : ''}`}
                onClick={() => handleToggleCombatMode('combat')}
                title="Luyện thi bẻ bẫy Shin Kanzen Master"
              >
                <Swords size={12} />
                <span>Shin Kanzen Combat</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main View Router */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* 1. DEDICATED CHAPTER LESSON PAGE */}
        {currentView === 'lesson' && currentLesson ? (
          <LessonDetailPage
            lesson={currentLesson}
            totalLessons={all120Lessons.length}
            allLessons={all120Lessons}
            onBack={handleBackToCatalog}
            onPrev={handlePrevLesson}
            onNext={handleNextLesson}
            onNavigateLesson={handleNavigateToLessonNumber}
            hasPrev={currentLesson.lessonNumber > 1}
            hasNext={currentLesson.lessonNumber < all120Lessons.length}
            quizAnswers={quizAnswers}
            onAnswerQuiz={handleAnswerQuiz}
          />
        ) : currentTab === 'mindmap' ? (
          /* 2. DEDICATED MINDMAP EXPLORER & ATLAS */
          <MindmapExplorerView
            allLessons={all120Lessons}
            onSelectLesson={handleSelectLesson}
            onBack={() => handleSelectTab('minna')}
          />
        ) : currentTab === 'exams' ? (
          /* 3. 10-YEAR PAST EXAMS BROWSER */
          <ExamGalleryView
            exams={pastExamsData}
            onStartExam={(exam) => setActiveExam(exam)}
            onBack={() => handleSelectTab('minna')}
          />
        ) : ['n3', 'n2', 'n1'].includes(currentTab) && subMode === 'combat' ? (
          /* 4. SHINKANZEN MASTER COMBAT TRACK */
          <ShinkanzenCombatView
            syllabus={
              currentTab === 'n3' ? shinkanzenN3 :
              currentTab === 'n2' ? shinkanzenN2 : shinkanzenN1
            }
            level={currentTab.toUpperCase()}
            onBack={() => handleToggleCombatMode('foundation')}
          />
        ) : currentTab === 'minna' ? (
          /* 5. MINNA NO NIHONGO 1-50 CATALOG */
          <LessonCatalogView
            lessons={minnaCorpus}
            level="N5"
            title="Minna No Nihongo (Bài 1–50)"
            filterOptions={[
              { id: 'all', label: 'Tất Cả (50)' },
              { id: 'n5', label: 'Tập 1: N5 (Bài 1–25)' },
              { id: 'n4', label: 'Tập 2: N4 (Bài 26–50)' },
            ]}
            onSelectLesson={handleSelectLesson}
            onOpenMindmap={(les) => handleSelectLesson(les)}
          />
        ) : (
          /* 6. FOUNDATION LESSONS N3 / N2 / N1 CATALOG */
          <LessonCatalogView
            lessons={
              currentTab === 'n3' ? n3FoundationLessons :
              currentTab === 'n2' ? n2FoundationLessons : n1FoundationLessons
            }
            level={currentTab.toUpperCase()}
            title={`25 Bài Bản Lề Chuẩn Hóa JLPT ${currentTab.toUpperCase()}`}
            onSelectLesson={handleSelectLesson}
            onOpenMindmap={(les) => handleSelectLesson(les)}
          />
        )}
      </div>

      {/* 7. EXAM SIMULATOR MODAL */}
      {activeExam && (
        <ExamSimulatorModal
          exam={activeExam}
          onClose={() => setActiveExam(null)}
        />
      )}
    </div>
  );
}

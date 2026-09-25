import React, { useState, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, ChevronDown, ChevronRight, 
  ArrowRight, Maximize2, X, ExternalLink, Sparkles, BookOpen, Network 
} from 'lucide-react';
import FuriganaText from '../FuriganaText';
import { JLPT_LEVEL_COLORS, getLevelBadgeStyle } from '../../theme';

/**
 * MindmapTreeView v3 — Dual Mode Architecture
 * 
 * 1. 'sidebar-tree': Adaptive Vertical Spine Tree (Cột sống tri thức cho Sidebar)
 *    - 100% responsive, không bị cắt xén hay tràn ngang
 *    - Hiển thị đầy đủ Pattern, Công thức tóm tắt, Sắc thái
 *    - Bấm vào nhánh nhảy ngay đến điểm ngữ pháp tương ứng trong bài
 * 
 * 2. 'lesson' / 'canvas': Sơ đồ Canvas ngang mở rộng với Zoom/Pan
 *    - Dùng trong Modal phóng to toàn cảnh hoặc trang độc lập
 * 
 * 3. 'level': Sơ đồ tư duy hữu cơ tỏa nhánh 2 bên (Bilateral Organic Radial Mind Map)
 */
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const TRUNK_PALETTES = [
  { color: '#2563eb', bg: 'rgba(37, 99, 235, 0.05)', border: '#3b82f6', defaultName: 'Thời gian & Tiến trình' },
  { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.05)', border: '#8b5cf6', defaultName: 'Nguyên nhân & Căn cứ' },
  { color: '#059669', bg: 'rgba(16, 185, 129, 0.05)', border: '#10b981', defaultName: 'Điều kiện & Giả định' },
  { color: '#d97706', bg: 'rgba(217, 119, 6, 0.05)', border: '#f59e0b', defaultName: 'Phạm vi & Mức độ' },
  { color: '#db2777', bg: 'rgba(219, 39, 119, 0.05)', border: '#ec4899', defaultName: 'Tâm lý & Kính ngữ' },
];

export default function MindmapTreeView({
  lesson,
  lessons = [],
  allLessons = [],
  level = 'N5',
  mode = 'sidebar-tree',
  height = 360,
  isOpen,
  onClose,
  onSelectLesson,
  onNavigateLesson,
  onSelectGrammarPoint,
  onOpenFullscreen,
}) {
  const [zoom, setZoom] = useState(1);
  const [expandedBranches, setExpandedBranches] = useState({});
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [modalView, setModalView] = useState('lesson'); // 'lesson' | 'level'
  const [selectedModalLesson, setSelectedModalLesson] = useState(null);

  const isModalVisible = isOpen !== undefined ? isOpen : internalModalOpen;
  const closeModal = () => {
    if (onClose) onClose();
    setInternalModalOpen(false);
    setSelectedModalLesson(null);
  };
  const openModal = () => {
    if (onOpenFullscreen) onOpenFullscreen();
    else setInternalModalOpen(true);
  };

  const toggleBranch = (id) => {
    setExpandedBranches(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 1.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.5));
  const handleResetZoom = () => setZoom(1);

  const currentLessonInModal = selectedModalLesson || lesson;
  const currentLevel = currentLessonInModal?.level || level;
  const accentColor = JLPT_LEVEL_COLORS[currentLevel] || '#3b82f6';

  const levelLessons = useMemo(() => {
    if (lessons && lessons.length > 0) return lessons;
    if (allLessons && allLessons.length > 0) {
      return allLessons.filter(l => l.level === currentLevel);
    }
    return [];
  }, [lessons, allLessons, currentLevel]);

  const branches = useMemo(() => {
    const target = currentLessonInModal;
    if (!target) return [];
    return target.mindmap?.branches ||
      (target.grammarPoints || []).map((gp, i) => ({
        name: gp.pattern,
        color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'][i % 5],
        formula: gp.formula,
        nuance: gp.nuance,
        metaphor: gp.metaphor,
        mnemonic: gp.mnemonic,
        example: gp.examples?.[0],
      }));
  }, [currentLessonInModal]);

  const handleBranchClick = (idx) => {
    if (onSelectGrammarPoint) {
      onSelectGrammarPoint(idx);
    } else {
      const el = document.getElementById(`gp-${currentLessonInModal?.grammarPoints?.[idx]?.id || idx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    if (isModalVisible) closeModal();
  };

  // Thematic trunks grouping for Bilateral Organic Mindmap
  const thematicTrunks = useMemo(() => {
    if (!levelLessons || levelLessons.length === 0) {
      return { allTrunks: [], leftTrunks: [], rightTrunks: [], totalGrammarCount: 0 };
    }

    const sorted = [...levelLessons].sort((a, b) => a.lessonNumber - b.lessonNumber);
    const totalGrammarCount = sorted.reduce((sum, l) => sum + (l.grammarPoints?.length || 0), 0);

    const desiredTrunks = sorted.length >= 20 ? 5 : Math.max(2, Math.ceil(sorted.length / 5));
    const chunkSize = Math.ceil(sorted.length / desiredTrunks);

    const trunks = [];
    for (let i = 0; i < desiredTrunks; i++) {
      const chunk = sorted.slice(i * chunkSize, (i + 1) * chunkSize);
      if (chunk.length === 0) continue;

      const palette = TRUNK_PALETTES[i % TRUNK_PALETTES.length];
      const uniquePillars = Array.from(new Set(chunk.map(l => l.pillar).filter(Boolean)));
      const themeTitle = uniquePillars.length > 0 
        ? uniquePillars.slice(0, 2).join(' • ') 
        : palette.defaultName;

      const chunkGrammarCount = chunk.reduce((acc, l) => acc + (l.grammarPoints?.length || 0), 0);
      const startNum = chunk[0].lessonNumber;
      const endNum = chunk[chunk.length - 1].lessonNumber;

      trunks.push({
        id: `trunk-${i}`,
        index: i,
        roman: ROMAN_NUMERALS[i] || `${i + 1}`,
        title: themeTitle,
        rangeLabel: startNum === endNum ? `Bài ${startNum}` : `Bài ${startNum}–${endNum}`,
        lessons: chunk,
        grammarCount: chunkGrammarCount,
        palette,
      });
    }

    const splitIdx = Math.floor(trunks.length / 2);
    const leftTrunks = trunks.slice(0, splitIdx);
    const rightTrunks = trunks.slice(splitIdx);

    return {
      allTrunks: trunks,
      leftTrunks,
      rightTrunks,
      totalGrammarCount,
    };
  }, [levelLessons]);

  const renderTrunk = (trunk, direction) => (
    <div
      key={trunk.id}
      className={`jlpt-organic-trunk jlpt-organic-trunk--${direction}`}
      style={{
        '--trunk-color': trunk.palette.border,
        background: trunk.palette.bg,
      }}
    >
      <div className="jlpt-organic-trunk-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="jlpt-organic-trunk-badge">
            TRỤC {trunk.roman}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: trunk.palette.border }}>
            {trunk.title}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
          {trunk.rangeLabel} • {trunk.grammarCount} mẫu
        </span>
      </div>

      <div className="jlpt-organic-lessons-list">
        {trunk.lessons.map((les) => {
          const isCurrentLesson = les.lessonNumber === lesson?.lessonNumber;
          return (
            <div
              key={les.lessonNumber}
              id={`mindmap-lesson-${les.lessonNumber}`}
              className={`jlpt-organic-lesson-card ${isCurrentLesson ? 'jlpt-organic-lesson-card--active' : ''}`}
              style={{ '--trunk-color': trunk.palette.border }}
              onClick={() => {
                setSelectedModalLesson(les);
                setModalView('lesson');
              }}
              title="Bấm để xem sơ đồ tư duy chi tiết bài này"
            >
              <div className="jlpt-organic-lesson-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="jlpt-organic-lesson-num">
                    第{les.lessonNumber}課
                  </span>
                  {isCurrentLesson && (
                    <span className="jlpt-tree-level-active-badge">
                      Đang học
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                    {les.grammarPoints?.length || 0} mẫu
                  </span>
                  {onNavigateLesson && (
                    <button
                      type="button"
                      className="jlpt-pedagogy-link-btn"
                      style={{ fontSize: '10px', padding: '1px 6px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateLesson(les.lessonNumber);
                        closeModal();
                      }}
                      title="Chuyển ngay tới bài này để học"
                    >
                      Học bài này ↗
                    </button>
                  )}
                </div>
              </div>

              <div className="jlpt-organic-lesson-title-jp">
                <FuriganaText text={les.jpTitle} />
              </div>

              <div className="jlpt-organic-lesson-title-vi">
                {les.viTitle}
              </div>

              {/* Grammar Leaf Pills (Mầm lá mẫu câu) */}
              {les.grammarPoints && les.grammarPoints.length > 0 && (
                <div className="jlpt-organic-leaves-row">
                  {les.grammarPoints.map((gp, pIdx) => (
                    <span
                      key={pIdx}
                      className="jlpt-organic-leaf-chip"
                      title={`${gp.pattern}${gp.meaning ? `: ${gp.meaning}` : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalLesson(les);
                        setModalView('lesson');
                      }}
                    >
                      {gp.pattern}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── MODAL CONTENT RENDERER ──────────────────────────────────
  const renderModalContent = () => (
    <div className="jlpt-mindmap-modal-backdrop" onClick={closeModal}>
      <div className="jlpt-mindmap-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header Bar with View Switcher */}
        <div className="jlpt-mindmap-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={getLevelBadgeStyle(currentLevel)}>
              {currentLevel}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {modalView === 'lesson' 
                ? `Bài ${currentLessonInModal?.lessonNumber}: ${currentLessonInModal?.jpTitle || ''}`
                : `Cây Bản Đồ Toàn Cấp Độ ${currentLevel}`}
            </span>
          </div>

          {/* Modal Header Tabs */}
          <div className="jlpt-modal-tabs">
            <button
              type="button"
              className={`jlpt-modal-tab-btn ${modalView === 'lesson' ? 'jlpt-modal-tab-btn--active' : ''}`}
              onClick={() => setModalView('lesson')}
            >
              <BookOpen size={13} />
              <span>Bài {currentLessonInModal?.lessonNumber}</span>
            </button>
            <button
              type="button"
              className={`jlpt-modal-tab-btn ${modalView === 'level' ? 'jlpt-modal-tab-btn--active' : ''}`}
              onClick={() => setModalView('level')}
            >
              <Network size={13} />
              <span>Toàn cảnh {currentLevel} ({levelLessons.length} bài)</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* If viewed lesson in modal is different from current page lesson */}
            {selectedModalLesson && selectedModalLesson.lessonNumber !== lesson?.lessonNumber && onNavigateLesson && (
              <button
                type="button"
                className="ods-btn ods-btn-primary"
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={() => {
                  onNavigateLesson(selectedModalLesson.lessonNumber);
                  closeModal();
                }}
              >
                Học bài {selectedModalLesson.lessonNumber} →
              </button>
            )}
            <button
              type="button"
              className="jlpt-icon-btn"
              onClick={closeModal}
              title="Đóng toàn cảnh"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body Canvas */}
        <div className="jlpt-mindmap-modal-body">
          {modalView === 'lesson' ? (
            /* 1. SINGLE LESSON CANVAS (With Upstream Root & Downstream Leap) */
            <div
              className="jlpt-tree-canvas"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease',
              }}
            >
              {/* Upstream Root Connection Node (Cội nguồn tiền đề) */}
              {currentLessonInModal?.mindmap?.rootConnection && (
                <>
                  <div className="jlpt-tree-upstream-root">
                    <Sparkles size={13} style={{ color: 'var(--tint-sky-text)' }} />
                    <span>{currentLessonInModal.mindmap.rootConnection}</span>
                  </div>
                  <div className="jlpt-tree-upstream-line" style={{ '--line-color': accentColor }} />
                </>
              )}

              {/* Central Root Node */}
              <div className="jlpt-tree-root-node" style={{ '--node-accent': accentColor }}>
                <div className="jlpt-tree-root-badge" style={getLevelBadgeStyle(currentLessonInModal.level)}>
                  {currentLessonInModal.level} • 第{currentLessonInModal.lessonNumber}課
                </div>
                <div className="jlpt-tree-root-title">
                  <FuriganaText text={currentLessonInModal.jpTitle} />
                </div>
                <div className="jlpt-tree-root-sub">
                  {currentLessonInModal.pillar || currentLessonInModal.viTitle}
                </div>
              </div>

              <div className="jlpt-tree-vline" style={{ '--line-color': accentColor }} />

              {/* Horizontal Branches */}
              {branches.length > 0 && (
                <div className="jlpt-tree-branch-rail">
                  <div className="jlpt-tree-hline" style={{ '--line-color': accentColor }} />
                  <div className="jlpt-tree-branches">
                    {branches.map((b, idx) => {
                      const branchColor = b.color || accentColor;
                      return (
                        <div key={idx} className="jlpt-tree-branch-col">
                          <div className="jlpt-tree-vline jlpt-tree-vline--short" style={{ '--line-color': branchColor }} />
                          <div
                            className="jlpt-tree-branch-card"
                            style={{ '--branch-color': branchColor }}
                            onClick={() => handleBranchClick(idx)}
                          >
                            <div className="jlpt-tree-branch-header">
                              <span className="jlpt-tree-branch-dot" style={{ background: branchColor }} />
                              <span className="jlpt-tree-branch-name"><FuriganaText text={b.name} /></span>
                            </div>
                            <div className="jlpt-tree-branch-details">
                              {b.formula && (
                                <div className="jlpt-tree-branch-formula"><FuriganaText text={b.formula} /></div>
                              )}
                              {b.nuance && (
                                <div className="jlpt-tree-branch-nuance"><FuriganaText text={b.nuance} /></div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Downstream Next Leap Node (Chồi non đệm bước) */}
              {currentLessonInModal?.mindmap?.nextLeap && (
                <>
                  <div className="jlpt-tree-upstream-line" style={{ '--line-color': 'var(--tint-matcha-border)' }} />
                  <div className="jlpt-tree-downstream-leap">
                    <ArrowRight size={13} style={{ color: 'var(--tint-matcha-text)' }} />
                    <span>{currentLessonInModal.mindmap.nextLeap}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* 2. ORGANIC BILATERAL MIND MAP (Toàn cảnh cấp độ & Cội nguồn hữu cơ) */
            <div
              className="jlpt-organic-mindmap-container"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease',
              }}
            >
              <div className="jlpt-organic-mindmap">
                {/* Cánh Trái (Left Wing) */}
                <div className="jlpt-organic-wing jlpt-organic-wing--left">
                  {thematicTrunks.leftTrunks.map(t => renderTrunk(t, 'left'))}
                </div>

                {/* Trọng Tâm Cốt Lõi (Central Root Hub) */}
                <div className="jlpt-organic-center-hub" style={{ '--accent-primary': accentColor }}>
                  <div className="jlpt-tree-root-badge" style={getLevelBadgeStyle(currentLevel)}>
                    JLPT {currentLevel}
                  </div>
                  <div className="jlpt-organic-center-title">
                    BẢN ĐỒ TRI THỨC NGỮ PHÁP
                  </div>
                  <div className="jlpt-organic-center-sub">
                    {levelLessons.length} bài học bản lề • {thematicTrunks.totalGrammarCount} mẫu ngữ pháp
                  </div>

                  <div style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    width: '100%',
                  }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                      {thematicTrunks.allTrunks?.length || 5} Trục Chuyên Đề Hữu Cơ
                    </div>

                    {lesson && (
                      <div 
                        style={{
                          fontSize: '11px',
                          color: '#e2e8f0',
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          const el = document.getElementById(`mindmap-lesson-${lesson.lessonNumber}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        title="Bấm để cuộn đến vị trí bài đang học"
                      >
                        📍 Đang học: <strong>第{lesson.lessonNumber}課</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cánh Phải (Right Wing) */}
                <div className="jlpt-organic-wing jlpt-organic-wing--right">
                  {thematicTrunks.rightTrunks.map(t => renderTrunk(t, 'right'))}
                </div>
              </div>
            </div>
          )}

          {/* Canvas Zoom Controls */}
          <div className="jlpt-mindmap-controls">
            <button type="button" className="jlpt-icon-btn" onClick={handleZoomIn} title="Phóng to"><ZoomIn size={14} /></button>
            <button type="button" className="jlpt-icon-btn" onClick={handleZoomOut} title="Thu nhỏ"><ZoomOut size={14} /></button>
            <button type="button" className="jlpt-icon-btn" onClick={handleResetZoom} title="Mặc định"><RotateCcw size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── 0. STANDALONE MODAL MODE ─────────────────────────────────
  if (mode === 'modal') {
    if (!isModalVisible) return null;
    return renderModalContent();
  }

  // ── 1. SIDEBAR VERTICAL SPINE TREE MODE ──────────────────────
  if (mode === 'sidebar-tree' && lesson) {
    return (
      <div className="jlpt-spine-tree-container">
        {/* Fullscreen Modal trigger button */}
        <div className="jlpt-spine-tree-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} style={{ color: 'var(--accent-primary, #3b82f6)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              Cột sống tư duy bài học ({branches.length} nhánh)
            </span>
          </div>
          <button
            type="button"
            className="jlpt-view-toggle-btn"
            style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={openModal}
            title="Mở sơ đồ tư duy toàn màn hình"
          >
            <Maximize2 size={11} />
            <span>Toàn cảnh</span>
          </button>
        </div>

        {/* Vertical Spine Flow */}
        <div className="jlpt-spine-flow">
          {branches.map((b, idx) => {
            const branchColor = b.color || accentColor;
            return (
              <div 
                key={idx} 
                className="jlpt-spine-node"
                onClick={() => handleBranchClick(idx)}
                title="Bấm để cuộn đến ngữ pháp này"
              >
                {/* Vertical Rail Marker */}
                <div className="jlpt-spine-rail">
                  <div className="jlpt-spine-bullet" style={{ background: branchColor }}>
                    {idx + 1}
                  </div>
                  {idx < branches.length - 1 && (
                    <div className="jlpt-spine-line" style={{ background: branchColor }} />
                  )}
                </div>

                {/* Node Content Card */}
                <div className="jlpt-spine-content" style={{ '--node-color': branchColor }}>
                  <div className="jlpt-spine-title-row">
                    <span className="jlpt-spine-pattern">
                      <FuriganaText text={b.name} />
                    </span>
                    <ArrowRight size={12} className="jlpt-spine-arrow" />
                  </div>

                  {b.formula && (
                    <div className="jlpt-spine-formula">
                      <FuriganaText text={b.formula} />
                    </div>
                  )}

                  {b.nuance && (
                    <div className="jlpt-spine-nuance">
                      <FuriganaText text={b.nuance} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Canvas Fullscreen Modal */}
        {isModalVisible && renderModalContent()}
      </div>
    );
  }

  // ── 2. LESSON HORIZONTAL CANVAS MODE ─────────────────────────
  if (mode === 'lesson' && lesson) {
    return (
      <div className="jlpt-mindmap-wrapper" style={{ height, minHeight: 280 }}>
        <div
          className="jlpt-tree-canvas"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
        >
          {/* Center Root Node */}
          <div className="jlpt-tree-root-node" style={{ '--node-accent': accentColor }}>
            <div className="jlpt-tree-root-badge" style={getLevelBadgeStyle(lesson.level)}>
              {lesson.level} • 第{lesson.lessonNumber}課
            </div>
            <div className="jlpt-tree-root-title"><FuriganaText text={lesson.jpTitle} /></div>
            <div className="jlpt-tree-root-sub">{lesson.pillar || lesson.viTitle}</div>
          </div>

          <div className="jlpt-tree-vline" style={{ '--line-color': accentColor }} />

          {branches.length > 0 && (
            <div className="jlpt-tree-branch-rail">
              <div className="jlpt-tree-hline" style={{ '--line-color': accentColor }} />
              <div className="jlpt-tree-branches">
                {branches.map((b, idx) => {
                  const branchColor = b.color || accentColor;
                  const isExpanded = expandedBranches[`b-${idx}`] !== false;

                  return (
                    <div key={idx} className="jlpt-tree-branch-col">
                      <div className="jlpt-tree-vline jlpt-tree-vline--short" style={{ '--line-color': branchColor }} />
                      <div
                        className="jlpt-tree-branch-card"
                        style={{ '--branch-color': branchColor }}
                        onClick={() => toggleBranch(`b-${idx}`)}
                      >
                        <div className="jlpt-tree-branch-header">
                          <span className="jlpt-tree-branch-dot" style={{ background: branchColor }} />
                          <span className="jlpt-tree-branch-name"><FuriganaText text={b.name} /></span>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>

                        {isExpanded && (
                          <div className="jlpt-tree-branch-details">
                            {b.formula && (
                              <div className="jlpt-tree-branch-formula"><FuriganaText text={b.formula} /></div>
                            )}
                            {b.nuance && (
                              <div className="jlpt-tree-branch-nuance"><FuriganaText text={b.nuance} /></div>
                            )}
                            {b.example && (
                              <div className="jlpt-tree-branch-example">
                                <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: '13px', fontWeight: 600 }}>
                                  <FuriganaText text={b.example.jp} />
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                                  {b.example.vi}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="jlpt-mindmap-controls">
          <button type="button" className="jlpt-icon-btn" onClick={handleZoomIn} title="Phóng to"><ZoomIn size={14} /></button>
          <button type="button" className="jlpt-icon-btn" onClick={handleZoomOut} title="Thu nhỏ"><ZoomOut size={14} /></button>
          <button type="button" className="jlpt-icon-btn" onClick={handleResetZoom} title="Mặc định"><RotateCcw size={14} /></button>
        </div>
      </div>
    );
  }

  // ── 3. LEVEL OVERVIEW MODE ──────────────────────────────────
  if (mode === 'level' && lessons && lessons.length > 0) {
    const rows = [];
    for (let i = 0; i < lessons.length; i += 5) {
      rows.push(lessons.slice(i, i + 5));
    }

    return (
      <div className="jlpt-mindmap-wrapper" style={{ minHeight: Math.max(height, 400) }}>
        <div
          className="jlpt-tree-canvas"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
        >
          <div className="jlpt-tree-root-node" style={{ '--node-accent': accentColor }}>
            <div className="jlpt-tree-root-title" style={{ fontSize: '16px' }}>
              JLPT {level} — Cây Bản Đồ Toàn Cấp Độ
            </div>
            <div className="jlpt-tree-root-sub">
              {lessons.length} bài học bản lề • Bấm vào bài để mở giáo trình chi tiết
            </div>
          </div>

          <div className="jlpt-tree-vline" style={{ '--line-color': accentColor }} />

          <div className="jlpt-tree-level-grid">
            {rows.map((row, rIdx) => (
              <div key={rIdx} className="jlpt-tree-level-row">
                <div className="jlpt-tree-row-label" style={{ color: accentColor }}>
                  Bài {row[0].lessonNumber}–{row[row.length - 1].lessonNumber}
                </div>

                <div className="jlpt-tree-level-cards">
                  {row.map((les) => (
                    <div
                      key={les.lessonNumber}
                      className="jlpt-tree-level-card"
                      style={{ '--branch-color': accentColor }}
                      onClick={() => onSelectLesson && onSelectLesson(les)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor }}>
                          第{les.lessonNumber}課
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                          {les.grammarPoints?.length || les.mindmap?.branches?.length || 0} mẫu
                        </span>
                      </div>
                      <div style={{
                        fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)',
                        fontFamily: "'Noto Sans JP', sans-serif",
                        lineHeight: 1.3, marginBottom: '2px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        <FuriganaText text={les.jpTitle} />
                      </div>
                      <div style={{
                        fontSize: '11px', color: 'var(--text-secondary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {les.viTitle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="jlpt-mindmap-controls">
          <button type="button" className="jlpt-icon-btn" onClick={handleZoomIn} title="Phóng to"><ZoomIn size={14} /></button>
          <button type="button" className="jlpt-icon-btn" onClick={handleZoomOut} title="Thu nhỏ"><ZoomOut size={14} /></button>
          <button type="button" className="jlpt-icon-btn" onClick={handleResetZoom} title="Mặc định"><RotateCcw size={14} /></button>
        </div>
      </div>
    );
  }

  return null;
}

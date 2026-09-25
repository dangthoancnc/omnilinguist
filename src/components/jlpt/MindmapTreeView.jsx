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
 * 3. 'level': Cây bản đồ toàn cấp độ
 */
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

  // Helper to group lessons by pillar or in groups of 5
  const groupedLevelLessons = useMemo(() => {
    if (!levelLessons || levelLessons.length === 0) return [];
    const groups = [];
    const pillarMap = new Map();

    levelLessons.forEach(l => {
      const pillarKey = l.pillar || `Bài ${Math.floor((l.lessonNumber - 1) / 5) * 5 + 1}–${Math.floor((l.lessonNumber - 1) / 5) * 5 + 5}`;
      if (!pillarMap.has(pillarKey)) {
        pillarMap.set(pillarKey, []);
      }
      pillarMap.get(pillarKey).push(l);
    });

    pillarMap.forEach((items, title) => {
      groups.push({ title, lessons: items });
    });
    return groups;
  }, [levelLessons]);

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
            /* 2. LEVEL KNOWLEDGE TREE (Toàn cảnh cấp độ & Cội nguồn) */
            <div
              className="jlpt-tree-canvas"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease',
              }}
            >
              {/* Macro Level Root Node */}
              <div className="jlpt-tree-root-node" style={{ '--node-accent': accentColor, maxWidth: '500px' }}>
                <div className="jlpt-tree-root-badge" style={getLevelBadgeStyle(currentLevel)}>
                  JLPT {currentLevel} • {levelLessons.length} BÀI HỌC BẢN LỀ
                </div>
                <div className="jlpt-tree-root-title" style={{ fontSize: '18px' }}>
                  Cây Bản Đồ Tri Thức & Gốc Rễ Ngữ Pháp
                </div>
                <div className="jlpt-tree-root-sub" style={{ opacity: 0.9 }}>
                  Hệ thống trụ cột và mạng lưới tiến hóa từ căn bản đến chuyên sâu
                </div>
              </div>

              <div className="jlpt-tree-vline" style={{ '--line-color': accentColor }} />

              {/* Grouped Pillars of the Level */}
              <div className="jlpt-tree-level-grid">
                {groupedLevelLessons.map((grp, gIdx) => (
                  <div key={gIdx} className="jlpt-tree-level-row">
                    <div className="jlpt-tree-row-label" style={{ color: accentColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={11} />
                      <span>{grp.title} ({grp.lessons.length} bài)</span>
                    </div>

                    <div className="jlpt-tree-level-cards">
                      {grp.lessons.map((les) => {
                        const isCurrentLesson = les.lessonNumber === lesson?.lessonNumber;
                        const isModalSelected = les.lessonNumber === currentLessonInModal?.lessonNumber;

                        return (
                          <div
                            key={les.lessonNumber}
                            className={`jlpt-tree-level-card ${isCurrentLesson ? 'jlpt-tree-level-card--active' : ''}`}
                            style={{ '--branch-color': accentColor }}
                            onClick={() => {
                              setSelectedModalLesson(les);
                              setModalView('lesson');
                            }}
                            title="Bấm để xem sơ đồ tư duy chi tiết của bài này"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: accentColor }}>
                                第{les.lessonNumber}課
                              </span>
                              {isCurrentLesson && (
                                <span className="jlpt-tree-level-active-badge">
                                  Đang học
                                </span>
                              )}
                            </div>

                            <div style={{
                              fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)',
                              fontFamily: "'Noto Sans JP', sans-serif",
                              lineHeight: 1.3, margin: '2px 0',
                            }}>
                              <FuriganaText text={les.jpTitle} />
                            </div>

                            <div style={{
                              fontSize: '11px', color: 'var(--text-secondary)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {les.viTitle}
                            </div>

                            {/* Mini Grammar Point Chips */}
                            {les.grammarPoints && les.grammarPoints.length > 0 && (
                              <div className="jlpt-tree-level-chips">
                                {les.grammarPoints.slice(0, 4).map((gp, pIdx) => (
                                  <span key={pIdx} className="jlpt-tree-level-chip">
                                    {gp.pattern}
                                  </span>
                                ))}
                                {les.grammarPoints.length > 4 && (
                                  <span className="jlpt-tree-level-chip" style={{ opacity: 0.7 }}>
                                    +{les.grammarPoints.length - 4}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Action Row */}
                            <div className="jlpt-tree-level-actions">
                              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                                {les.grammarPoints?.length || 0} cấu trúc
                              </span>
                              {onNavigateLesson && (
                                <button
                                  type="button"
                                  className="jlpt-pedagogy-link-btn"
                                  style={{ fontSize: '10px', padding: '1px 5px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigateLesson(les.lessonNumber);
                                    closeModal();
                                  }}
                                  title="Chuyển tới bài này để học"
                                >
                                  Học bài này ↗
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
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

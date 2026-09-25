import React, { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import FuriganaText from '../FuriganaText';
import { JLPT_LEVEL_COLORS, getLevelBadgeStyle } from '../../theme';

/**
 * MindmapTreeView v2 — Pure HTML/CSS Hierarchical Tree
 * 
 * DESIGN RULES:
 * 1. NO SVG overlay — use CSS ::before/::after pseudo-elements for connectors
 * 2. NO position:absolute for nodes — use flexbox/grid for natural flow
 * 3. Tree expands vertically from root, branches spread horizontally
 * 4. Each node is a clickable card with hover effects
 * 5. Connector lines use CSS borders (solid, reliable, theme-aware)
 * 
 * Modes:
 * - 'lesson': Center → Branches with formula/nuance details
 * - 'level': Level root → grouped rows of lesson cards
 */
export default function MindmapTreeView({
  lesson,
  lessons = [],
  level = 'N5',
  mode = 'lesson',
  height = 420,
  onSelectLesson,
  onSelectGrammarPoint,
}) {
  const [zoom, setZoom] = useState(1);
  const [expandedBranches, setExpandedBranches] = useState({});

  const toggleBranch = (id) => {
    setExpandedBranches(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 1.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.5));
  const handleResetZoom = () => setZoom(1);

  const accentColor = JLPT_LEVEL_COLORS[level] || '#3b82f6';

  // ── LESSON MODE ──────────────────────────────────────────────
  if (mode === 'lesson' && lesson) {
    const branches = lesson.mindmap?.branches ||
      (lesson.grammarPoints || []).map((gp, i) => ({
        name: gp.pattern,
        color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5],
        formula: gp.formula,
        nuance: gp.nuance,
        metaphor: gp.metaphor,
        mnemonic: gp.mnemonic,
        example: gp.examples?.[0],
      }));

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

          {/* Vertical connector from root */}
          <div className="jlpt-tree-vline" style={{ '--line-color': accentColor }} />

          {/* Horizontal branch rail */}
          {branches.length > 0 && (
            <div className="jlpt-tree-branch-rail">
              {/* Horizontal line connecting all branches */}
              <div className="jlpt-tree-hline" style={{ '--line-color': accentColor }} />

              {/* Branch Nodes */}
              <div className="jlpt-tree-branches">
                {branches.map((b, idx) => {
                  const branchColor = b.color || accentColor;
                  const isExpanded = expandedBranches[`b-${idx}`] !== false; // default expanded

                  return (
                    <div key={idx} className="jlpt-tree-branch-col">
                      {/* Vertical connector to branch */}
                      <div className="jlpt-tree-vline jlpt-tree-vline--short" style={{ '--line-color': branchColor }} />

                      {/* Branch card */}
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

  // ── LEVEL OVERVIEW MODE ──────────────────────────────────────
  if (mode === 'level' && lessons && lessons.length > 0) {
    // Group lessons into rows of 5
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
          {/* Level Root Node */}
          <div className="jlpt-tree-root-node" style={{ '--node-accent': accentColor }}>
            <div className="jlpt-tree-root-title" style={{ fontSize: '16px' }}>
              JLPT {level} — Cây Bản Đồ Toàn Cấp Độ
            </div>
            <div className="jlpt-tree-root-sub">
              {lessons.length} bài học bản lề • Bấm vào bài để mở giáo trình chi tiết
            </div>
          </div>

          {/* Vertical connector */}
          <div className="jlpt-tree-vline" style={{ '--line-color': accentColor }} />

          {/* Lesson Grid Rows */}
          <div className="jlpt-tree-level-grid">
            {rows.map((row, rIdx) => (
              <div key={rIdx} className="jlpt-tree-level-row">
                {/* Row label */}
                <div className="jlpt-tree-row-label" style={{ color: accentColor }}>
                  Bài {row[0].lessonNumber}–{row[row.length - 1].lessonNumber}
                </div>

                {/* Lesson cards in this row */}
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

        {/* Zoom Controls */}
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

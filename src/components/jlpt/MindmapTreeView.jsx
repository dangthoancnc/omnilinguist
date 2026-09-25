import React, { useState, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Sparkles, BookOpen } from 'lucide-react';
import { JLPT_LEVEL_COLORS, getLevelBadgeStyle } from '../../theme';

/**
 * MindmapTreeView — Pure CSS + SVG Bezier Curve Mindmap Component
 * Modes:
 * - 'lesson': Single lesson tree (Center -> Branches -> Formula/Nuance)
 * - 'level': Multi-lesson level overview tree (Level Root -> Lessons -> Patterns)
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
  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 1.6));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.6));
  const handleResetZoom = () => setZoom(1);

  // -------------------------------------------------------------
  // TREE CALCULATION: LESSON MODE (Single Lesson Center -> Branches)
  // -------------------------------------------------------------
  const lessonTreeData = useMemo(() => {
    if (mode !== 'lesson' || !lesson) return null;

    const branches = lesson.mindmap?.branches || 
      (lesson.grammarPoints || []).map((gp, i) => ({
        name: gp.pattern,
        color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5],
        formula: gp.formula,
        example: gp.examples?.[0],
      }));

    const centerX = 360;
    const centerY = 180;
    const branchCount = branches.length;
    const spreadAngle = Math.min(140, branchCount * 45);
    const startAngle = -spreadAngle / 2;
    const radius = 240;

    const branchNodes = branches.map((b, idx) => {
      const angle = branchCount > 1 
        ? (startAngle + (idx / (branchCount - 1)) * spreadAngle) * (Math.PI / 180)
        : 0;
      
      const isRight = Math.cos(angle) >= 0;
      const bx = centerX + (isRight ? 1 : -1) * (180 + Math.abs(Math.sin(angle)) * 40);
      const by = centerY + Math.sin(angle) * 110;

      return {
        ...b,
        id: `branch-${idx}`,
        x: bx,
        y: by,
        isRight,
        color: b.color || '#3b82f6',
      };
    });

    return {
      center: {
        title: `第${lesson.lessonNumber}課: ${lesson.jpTitle}`,
        sub: lesson.pillar || lesson.viTitle,
        x: centerX,
        y: centerY,
        level: lesson.level,
      },
      branches: branchNodes,
      width: 720,
      height: 380,
    };
  }, [lesson, mode]);

  // -------------------------------------------------------------
  // TREE CALCULATION: LEVEL OVERVIEW MODE (Level -> Lessons)
  // -------------------------------------------------------------
  const levelTreeData = useMemo(() => {
    if (mode !== 'level' || !lessons || lessons.length === 0) return null;

    const activeLessons = lessons.slice(0, 30); // Render up to 30 for performance
    const total = activeLessons.length;
    const cols = 5;
    const rows = Math.ceil(total / cols);
    const colWidth = 220;
    const rowHeight = 110;
    const width = cols * colWidth + 120;
    const height = rows * rowHeight + 160;

    const rootX = width / 2;
    const rootY = 50;

    const nodes = activeLessons.map((les, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = 80 + col * colWidth + colWidth / 2;
      const y = 140 + row * rowHeight;
      return {
        lesson: les,
        x,
        y,
      };
    });

    return {
      root: { title: `JLPT ${level} Cây Bản Đồ Toàn Cấp Độ`, x: rootX, y: rootY },
      nodes,
      width,
      height,
    };
  }, [lessons, level, mode]);

  // -------------------------------------------------------------
  // RENDER: LESSON MODE
  // -------------------------------------------------------------
  if (mode === 'lesson' && lessonTreeData) {
    const { center, branches, width, height: canvasHeight } = lessonTreeData;

    return (
      <div className="jlpt-mindmap-wrapper" style={{ height }}>
        <div 
          className="jlpt-mindmap-canvas" 
          ref={containerRef}
          style={{ 
            height: '100%', 
            transform: `scale(${zoom})`, 
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease' 
          }}
        >
          {/* SVG Bezier Curves */}
          <svg className="jlpt-mindmap-svg-layer" viewBox={`0 0 ${width} ${canvasHeight}`}>
            <defs>
              <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-primary, #3b82f6)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {branches.map((b) => {
              const dx = (b.x - center.x) * 0.5;
              const path = `M ${center.x} ${center.y} C ${center.x + dx} ${center.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
              return (
                <path
                  key={b.id}
                  d={path}
                  fill="none"
                  stroke={b.color || '#3b82f6'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                  opacity="0.75"
                />
              );
            })}
          </svg>

          {/* Center Root Node */}
          <div
            className="jlpt-mindmap-node jlpt-mindmap-node--center"
            style={{ left: `${center.x}px`, top: `${center.y}px` }}
          >
            <div style={{ fontSize: '15px', fontWeight: 800 }}>
              {center.title}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px', fontWeight: 500 }}>
              {center.sub}
            </div>
          </div>

          {/* Branch Nodes */}
          {branches.map((b) => (
            <div
              key={b.id}
              className="jlpt-mindmap-node jlpt-mindmap-node--branch"
              style={{
                left: `${b.x}px`,
                top: `${b.y}px`,
                '--node-border': b.color,
                maxWidth: '220px',
              }}
              onClick={() => onSelectGrammarPoint && onSelectGrammarPoint(b)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: b.color }}>●</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{b.name}</span>
              </div>
              {b.formula && (
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '2px' }}>
                  {b.formula}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="jlpt-mindmap-controls">
          <button type="button" className="jlpt-icon-btn" onClick={handleZoomIn} title="Phóng to">
            <ZoomIn size={14} />
          </button>
          <button type="button" className="jlpt-icon-btn" onClick={handleZoomOut} title="Thu nhỏ">
            <ZoomOut size={14} />
          </button>
          <button type="button" className="jlpt-icon-btn" onClick={handleResetZoom} title="Mặc định">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: LEVEL OVERVIEW MODE
  // -------------------------------------------------------------
  if (mode === 'level' && levelTreeData) {
    const { root, nodes, width, height: canvasHeight } = levelTreeData;
    const accentColor = JLPT_LEVEL_COLORS[level] || 'var(--accent-primary)';

    return (
      <div className="jlpt-mindmap-wrapper" style={{ height: Math.max(height, 500) }}>
        <div 
          className="jlpt-mindmap-canvas" 
          ref={containerRef}
          style={{ 
            height: '100%', 
            minWidth: `${width}px`,
            minHeight: `${canvasHeight}px`,
            transform: `scale(${zoom})`, 
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease',
            padding: '20px'
          }}
        >
          {/* SVG Connector Lines */}
          <svg className="jlpt-mindmap-svg-layer" viewBox={`0 0 ${width} ${canvasHeight}`}>
            {nodes.map((n, idx) => {
              const path = `M ${root.x} ${root.y + 20} C ${root.x} ${(root.y + n.y) / 2}, ${n.x} ${(root.y + n.y) / 2}, ${n.x} ${n.y - 20}`;
              return (
                <path
                  key={idx}
                  d={path}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                />
              );
            })}
          </svg>

          {/* Level Central Root */}
          <div
            className="jlpt-mindmap-node jlpt-mindmap-node--center"
            style={{ 
              left: `${root.x}px`, 
              top: `${root.y}px`,
              background: accentColor 
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 800 }}>
              {root.title}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              {nodes.length} bài học bản lề • Bấm vào bài để mở giáo trình chi tiết
            </div>
          </div>

          {/* Lesson Leaf Nodes */}
          {nodes.map((n, idx) => (
            <div
              key={idx}
              className="jlpt-mindmap-node"
              style={{
                left: `${n.x}px`,
                top: `${n.y}px`,
                width: '190px',
                '--node-border': accentColor,
              }}
              onClick={() => onSelectLesson && onSelectLesson(n.lesson)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor }}>
                  第{n.lesson.lessonNumber}課
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                  {n.lesson.grammarPoints?.length || 2} mẫu
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {n.lesson.jpTitle}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {n.lesson.viTitle}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="jlpt-mindmap-controls">
          <button type="button" className="jlpt-icon-btn" onClick={handleZoomIn} title="Phóng to">
            <ZoomIn size={14} />
          </button>
          <button type="button" className="jlpt-icon-btn" onClick={handleZoomOut} title="Thu nhỏ">
            <ZoomOut size={14} />
          </button>
          <button type="button" className="jlpt-icon-btn" onClick={handleResetZoom} title="Mặc định">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

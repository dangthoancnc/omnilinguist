import React from 'react';
import { ArrowRight, Network, BookOpen, Layers } from 'lucide-react';
import { getLevelBadgeStyle, JLPT_LEVEL_COLORS } from '../../theme';

/**
 * LessonCard — Unified Lesson Card Component
 * Variants: 'grid' | 'list' | 'compact'
 */
export default function LessonCard({
  lesson,
  variant = 'grid',
  onSelect,
  onOpenMindmap,
}) {
  const badgeStyle = getLevelBadgeStyle(lesson.level);
  const patternCount = lesson.grammarPoints?.length || lesson.mindmap?.branches?.length || 0;
  const accentColor = JLPT_LEVEL_COLORS[lesson.level] || 'var(--accent-primary)';

  // Variant: Compact Row (List View)
  if (variant === 'list') {
    return (
      <div 
        className="jlpt-lesson-row" 
        onClick={() => onSelect(lesson)}
        style={{ '--card-accent': accentColor }}
      >
        <div className="jlpt-lesson-row-left">
          <span style={badgeStyle}>
            {lesson.level} • 第{lesson.lessonNumber}課
          </span>
          <span className="jlpt-lesson-row-title-jp">
            {lesson.jpTitle}
          </span>
          <span className="jlpt-lesson-row-title-vi">
            • {lesson.viTitle}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lesson.pillar && (
            <span className="jlpt-card-pillar">
              {lesson.pillar}
            </span>
          )}

          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
            {patternCount} mẫu
          </span>

          {onOpenMindmap && (
            <button
              type="button"
              className="jlpt-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMindmap(lesson);
              }}
              title="Xem sơ đồ tư duy"
              aria-label="Mindmap"
            >
              <Network size={14} />
            </button>
          )}

          <button
            type="button"
            className="jlpt-icon-btn"
            title="Vào học bài"
            aria-label="Open Lesson"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Variant: Compact Tree Node
  if (variant === 'compact') {
    return (
      <div 
        className="jlpt-lesson-row"
        onClick={() => onSelect(lesson)}
        style={{ padding: '8px 12px', fontSize: '13px', borderBottom: '1px solid var(--border-default)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <span style={{ ...badgeStyle, fontSize: '10px', padding: '1px 6px' }}>
            第{lesson.lessonNumber}課
          </span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lesson.jpTitle}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            ({lesson.viTitle})
          </span>
        </div>
        <ArrowRight size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
      </div>
    );
  }

  // Variant: Default Grid Card
  return (
    <article 
      className="jlpt-lesson-card"
      onClick={() => onSelect(lesson)}
      style={{ '--card-accent': accentColor }}
    >
      <div className="jlpt-card-header">
        <span style={badgeStyle}>
          {lesson.level} • 第{lesson.lessonNumber}課
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
          {patternCount} mẫu câu
        </span>
      </div>

      <div>
        <h3 className="jlpt-card-title-jp">
          {lesson.jpTitle}
        </h3>
        <p className="jlpt-card-title-vi">
          {lesson.viTitle}
        </p>
      </div>

      {lesson.pillar && (
        <span className="jlpt-card-pillar">
          {lesson.pillar}
        </span>
      )}

      {lesson.grammarPoints && lesson.grammarPoints.length > 0 && (
        <div className="jlpt-card-patterns">
          {lesson.grammarPoints.slice(0, 3).map((gp, idx) => (
            <span key={gp.id || idx} className="jlpt-card-pattern-chip">
              {gp.pattern}
            </span>
          ))}
          {lesson.grammarPoints.length > 3 && (
            <span className="jlpt-card-pattern-chip" style={{ opacity: 0.7 }}>
              +{lesson.grammarPoints.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="jlpt-card-footer">
        {onOpenMindmap ? (
          <button
            type="button"
            className="jlpt-view-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMindmap(lesson);
            }}
            title="Xem sơ đồ tư duy"
          >
            <Network size={13} />
            <span>Sơ đồ tư duy</span>
          </button>
        ) : <div />}

        <button
          type="button"
          className="jlpt-view-toggle-btn"
          style={{ color: 'var(--accent-primary, #3b82f6)', fontWeight: 700 }}
        >
          <span>Vào học</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </article>
  );
}

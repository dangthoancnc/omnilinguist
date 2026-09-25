import React from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Network, BookOpen, Printer, Sparkles } from 'lucide-react';
import { getLevelBadgeStyle } from '../../theme';

/**
 * CompactToolbar — 48px Word/CAD Style Unified Toolbar
 * Strict Emoji Policy: Uses only Lucide icons in UI chrome.
 */
export default function CompactToolbar({
  level,
  title,
  subtitle,
  onBack,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  actions = [],
  children
}) {
  const badgeStyle = level ? getLevelBadgeStyle(level) : null;

  return (
    <header className="jlpt-compact-toolbar">
      <div className="jlpt-toolbar-left">
        {onBack && (
          <button 
            type="button" 
            className="jlpt-icon-btn" 
            onClick={onBack}
            title="Quay lại danh mục"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
        )}

        {level && (
          <span style={badgeStyle}>
            {level}
          </span>
        )}

        <div className="jlpt-toolbar-title">
          <span>{title}</span>
          {subtitle && (
            <span className="jlpt-toolbar-subtitle">
              • {subtitle}
            </span>
          )}
        </div>
      </div>

      <div className="jlpt-toolbar-center">
        {children}
      </div>

      <div className="jlpt-toolbar-right">
        {(onPrev || onNext) && (
          <div style={{ display: 'inline-flex', gap: '2px' }}>
            <button
              type="button"
              className="jlpt-icon-btn"
              onClick={onPrev}
              disabled={!hasPrev}
              title="Bài trước"
              aria-label="Previous lesson"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="jlpt-icon-btn"
              onClick={onNext}
              disabled={!hasNext}
              title="Bài tiếp"
              aria-label="Next lesson"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {actions.map((action, i) => (
          <button
            key={i}
            type="button"
            className={`jlpt-icon-btn ${action.active ? 'jlpt-icon-btn--active' : ''}`}
            onClick={action.onClick}
            title={action.title}
            aria-label={action.title}
          >
            {action.icon}
          </button>
        ))}
      </div>
    </header>
  );
}

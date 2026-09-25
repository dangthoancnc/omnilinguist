/**
 * OmniLinguist Design System — Shared Theme Constants
 * Single source of truth cho JLPT level colors và page shell config.
 * KHÔNG duplicate các constant này trong bất kỳ file nào khác.
 */

// JLPT Level Colors — map tới CSS variables --jlpt-n5 .. --jlpt-n1
export const JLPT_LEVEL_COLORS = {
  N5: '#10b981',  // Matcha / Emerald
  N4: '#3b82f6',  // Sky / Blue  
  N3: '#f59e0b',  // Amber
  N2: '#8b5cf6',  // Violet
  N1: '#ef4444',  // Sakura / Red
};

// Level badge styling helper — trả về inline style object
export function getLevelBadgeStyle(level) {
  const map = {
    N5: { bg: 'var(--tint-matcha-bg)', border: 'var(--tint-matcha-border)', color: 'var(--tint-matcha-text)' },
    N4: { bg: 'var(--tint-sky-bg)', border: 'var(--tint-sky-border)', color: 'var(--tint-sky-text)' },
    N3: { bg: 'var(--tint-amber-bg)', border: 'var(--tint-amber-border)', color: 'var(--tint-amber-text)' },
    N2: { bg: 'var(--tint-violet-bg)', border: 'var(--tint-violet-border)', color: 'var(--tint-violet-text)' },
    N1: { bg: 'var(--tint-sakura-bg)', border: 'var(--tint-sakura-border)', color: 'var(--tint-sakura-text)' },
  };
  const m = map[level] || { bg: 'var(--bg-surface-2)', border: 'var(--border-default)', color: 'var(--text-primary)' };
  return {
    background: m.bg,
    border: `1px solid ${m.border}`,
    color: m.color,
    text: m.color,
    bg: m.bg,
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  };
}

// Page Shell Modes
export const PAGE_SHELL = {
  CONTENT: 'page-shell-content',  // maxWidth: 1380px, scrollable
  STUDIO: 'page-shell-studio',    // full viewport, fixed height
};

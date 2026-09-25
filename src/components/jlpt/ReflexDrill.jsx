import React from 'react';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import FuriganaText from '../FuriganaText';

/**
 * ReflexDrill — Interactive Multiple-Choice Drill Component
 * Provides instant pedagogical feedback upon selection.
 */
export default function ReflexDrill({
  drill,
  pointId,
  drillIndex = 0,
  answer,
  onAnswer,
}) {
  if (!drill || !drill.options) return null;

  const isAnswered = answer !== undefined && answer !== null;
  const isCorrect = isAnswered && answer === drill.correct;

  return (
    <div className="jlpt-drill-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tint-violet-text, #6d28d9)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HelpCircle size={13} />
          Trắc nghiệm phản xạ nhanh
        </span>
        {isAnswered && (
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            color: isCorrect ? 'var(--tint-matcha-text, #047857)' : 'var(--tint-sakura-text, #e11d48)' 
          }}>
            {isCorrect ? <CheckCircle size={13} /> : <XCircle size={13} />}
            {isCorrect ? 'Chính xác!' : 'Chưa đúng'}
          </span>
        )}
      </div>

      <div className="jlpt-drill-prompt">
        <FuriganaText text={drill.q} />
      </div>

      <div className="jlpt-drill-options">
        {drill.options.map((opt, optIdx) => {
          let btnClass = 'jlpt-drill-btn';
          if (isAnswered) {
            if (optIdx === drill.correct) {
              btnClass += ' jlpt-drill-btn--correct';
            } else if (optIdx === answer) {
              btnClass += ' jlpt-drill-btn--wrong';
            }
          }

          return (
            <button
              key={optIdx}
              type="button"
              className={btnClass}
              onClick={() => onAnswer(optIdx)}
              disabled={isAnswered}
            >
              <span style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                background: 'var(--bg-surface-2)', 
                border: '1px solid var(--border-default)', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
                flexShrink: 0
              }}>
                {optIdx + 1}
              </span>
              <span style={{ flex: 1 }}><FuriganaText text={opt} /></span>
            </button>
          );
        })}
      </div>

      {isAnswered && drill.explain && (
        <div className="jlpt-drill-explain">
          <strong style={{ color: 'var(--text-primary)' }}>Giải thích sư phạm: </strong>
          <FuriganaText text={drill.explain} />
        </div>
      )}
    </div>
  );
}

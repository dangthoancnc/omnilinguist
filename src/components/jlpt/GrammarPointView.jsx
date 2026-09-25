import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Volume2, ShieldAlert, Sparkles, 
  Lightbulb, BookOpen, Layers, CheckCircle2 
} from 'lucide-react';
import FuriganaText from '../FuriganaText';
import ReflexDrill from './ReflexDrill';
import { speakJapanese } from './speechHelper';
import { getLevelBadgeStyle } from '../../theme';

/**
 * GrammarPointView — Textbook-Depth Pedagogical Grammar Point
 * Features:
 * - Accordion expand / collapse
 * - Combination formula (Monospace)
 * - Meaning & In-depth Nuance
 * - JLPT Trap Buster (Cạm bẫy thi thật)
 * - 3-Second Memory Anchor / Mnemonic
 * - Rich illustrative examples with Furigana & Audio
 * - Embedded Reflex Drills
 */
export default function GrammarPointView({
  point,
  index = 0,
  level = 'N3',
  expanded = true,
  onToggle,
  quizAnswer,
  onAnswerQuiz,
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(null);
  const badgeStyle = getLevelBadgeStyle(level);

  const handlePlayAudio = (text, idx) => {
    setIsPlayingAudio(idx);
    speakJapanese(text, () => setIsPlayingAudio(null));
  };

  return (
    <article className="jlpt-grammar-point" id={`gp-${point.id || index}`}>
      {/* Header Bar */}
      <div 
        className="jlpt-grammar-header" 
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        <div className="jlpt-grammar-header-left">
          <span className="jlpt-grammar-idx-badge">
            {index + 1}
          </span>
          <span className="jlpt-grammar-pattern">
            {point.pattern}
          </span>
          {level && (
            <span style={{ ...badgeStyle, fontSize: '10px', padding: '1px 6px' }}>
              {level}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            {expanded ? 'Thu gọn' : 'Chi tiết'}
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Accordion Body */}
      {expanded && (
        <div className="jlpt-grammar-body">
          {/* 1. Combination Formula */}
          {point.formula && (
            <div className="jlpt-grammar-section" style={{ '--section-color': 'var(--tint-sky-border, #38bdf8)' }}>
              <div className="jlpt-grammar-section-title">
                <Layers size={13} />
                <span>Cấu trúc / Công thức kết hợp</span>
              </div>
              <div className="jlpt-formula-box">
                {point.formula}
              </div>
            </div>
          )}

          {/* 2. Meaning & Nuance */}
          {(point.meaning || point.nuance) && (
            <div className="jlpt-grammar-section" style={{ '--section-color': 'var(--tint-matcha-border, #34d399)' }}>
              <div className="jlpt-grammar-section-title">
                <Lightbulb size={13} />
                <span>Ý nghĩa & Sắc thái sử dụng</span>
              </div>
              {point.meaning && (
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {point.meaning}
                </div>
              )}
              {point.nuance && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
                  {point.nuance}
                </div>
              )}
            </div>
          )}

          {/* 3. JLPT Trap Buster (Cạm bẫy thi thật) */}
          {point.trapBuster && (
            <div className="jlpt-trap-callout">
              <div className="jlpt-trap-title">
                <ShieldAlert size={14} />
                <span>Bẻ khóa cạm bẫy đề thi JLPT</span>
              </div>
              <div>{point.trapBuster}</div>
            </div>
          )}

          {/* 4. Mnemonic / Metaphor (Mẹo ghi nhớ 3 giây) */}
          {(point.mnemonic || point.metaphor) && (
            <div className="jlpt-mnemonic-box">
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Sparkles size={14} />
                <span>Mẹo ghi nhớ sư phạm</span>
              </div>
              {point.metaphor && (
                <div style={{ fontStyle: 'italic', marginBottom: '4px' }}>
                  💡 Ẩn dụ: {point.metaphor}
                </div>
              )}
              {point.mnemonic && (
                <div>🧠 {point.mnemonic}</div>
              )}
            </div>
          )}

          {/* 5. Illustrative Examples with Furigana & Audio */}
          {point.examples && point.examples.length > 0 && (
            <div className="jlpt-grammar-section" style={{ '--section-color': 'var(--tint-amber-border, #f59e0b)' }}>
              <div className="jlpt-grammar-section-title">
                <BookOpen size={13} />
                <span>Ví dụ minh họa ({point.examples.length} câu)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {point.examples.map((ex, exIdx) => (
                  <div key={exIdx} className="jlpt-example-item">
                    <div style={{ flex: 1 }}>
                      <div className="jlpt-example-text-jp">
                        <FuriganaText text={ex.jp} />
                      </div>
                      <div className="jlpt-example-text-vi">
                        {ex.vi}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`jlpt-icon-btn ${isPlayingAudio === exIdx ? 'jlpt-icon-btn--active' : ''}`}
                      onClick={() => handlePlayAudio(ex.jp, exIdx)}
                      title="Nghe phát âm"
                      aria-label="Play audio"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Embedded Reflex Drills / Quizzes */}
          {((point.drills && point.drills.length > 0) || (point.quiz && point.quiz.length > 0)) && (
            <div style={{ marginTop: '8px' }}>
              {(point.drills || point.quiz).map((drill, dIdx) => (
                <ReflexDrill
                  key={dIdx}
                  drill={drill}
                  pointId={point.id}
                  drillIndex={dIdx}
                  answer={quizAnswer ? quizAnswer[`${point.id}_${dIdx}`] : undefined}
                  onAnswer={(optIdx) => onAnswerQuiz && onAnswerQuiz(point.id, dIdx, optIdx)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

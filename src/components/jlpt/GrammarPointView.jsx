import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Volume2, ShieldAlert, Sparkles, 
  Lightbulb, BookOpen, Layers, CheckCircle2, GitCompare, Bookmark, Star 
} from 'lucide-react';
import FuriganaText from '../FuriganaText';
import ReflexDrill from './ReflexDrill';
import { speakJapanese } from './speechHelper';
import { getLevelBadgeStyle } from '../../theme';

/**
 * GrammarPointView — 4-Tier Visual Hierarchy Pedagogical Architecture
 * 
 * TẦNG 1: TỔ HỢP NGỮ PHÁP TRỌNG TÂM (Core Grammar Hero Bundle - Ưu tiên cao nhất)
 * - Mẫu câu + Phát âm + Cấp độ
 * - Cấu trúc / Công thức kết hợp (Monospace sắc nét)
 * - Ý nghĩa cốt lõi & Sắc thái sử dụng
 * - Ví dụ mẫu mực cốt lõi (Anchor Sentence) gắn liền với công thức
 * 
 * TẦNG 2: MỞ RỘNG & QUÁN NGỮ (Deepening & Collocations)
 * - Cụm từ cố định / Quán ngữ thường gặp (Collocations)
 * - Phân biệt cấu trúc tương đồng / dễ nhầm lẫn (Similar Grammar)
 * - Ví dụ thực tế bổ sung (Additional Examples)
 * 
 * TẦNG 3: CẨM NANG THI THẬT & MẸO NHỚ (Exam Strategy & Mnemonics - Nhã nhặn, không chói mắt)
 * - Bẻ khóa cạm bẫy đề thi JLPT (Thẻ Slate/Navy học thuật chuyên nghiệp)
 * - Mẹo ghi nhớ sư phạm 3 giây
 * 
 * TẦNG 4: LUYỆN TẬP PHẢN XẠ (Reflex Drills)
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

  const anchorExample = point.examples?.[0];
  const additionalExamples = point.examples?.slice(1) || [];

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
            <FuriganaText text={point.pattern} />
          </span>
          {level && (
            <span style={{ ...badgeStyle, fontSize: '10px', padding: '1px 6px' }}>
              {level}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="jlpt-icon-btn jlpt-icon-btn--sm"
            onClick={(e) => {
              e.stopPropagation();
              speakJapanese(point.pattern);
            }}
            title="Nghe phát âm mẫu câu"
            aria-label="Play pattern audio"
          >
            <Volume2 size={13} />
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            {expanded ? 'Thu gọn' : 'Chi tiết'}
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Accordion Body */}
      {expanded && (
        <div className="jlpt-grammar-body">
          {/* =========================================================================
              TẦNG 1: TỔ HỢP NGỮ PHÁP TRỌNG TÂM (CORE GRAMMAR HERO BUNDLE)
              Tâm điểm thị giác cao nhất: Công thức + Ý nghĩa + Ví dụ mẫu mực
              ========================================================================= */}
          <div className="jlpt-grammar-hero-bundle" style={{ position: 'relative' }}>
            <div className="jlpt-grammar-hero-badge">
              <Sparkles size={12} />
              TRỌNG TÂM CỐT LÕI
            </div>
            
            {/* 1.1 Formula Bar */}
            {point.formula && (
              <div className="jlpt-hero-formula-wrap">
                <div className="jlpt-hero-label-badge jlpt-hero-label-badge--formula">
                  <Layers size={13} />
                  <span>Công thức kết hợp</span>
                </div>
                <div className="jlpt-hero-formula-box">
                  <FuriganaText text={point.formula} />
                </div>
              </div>
            )}

            {/* 1.2 Meaning & Nuance */}
            {(point.meaning || point.nuance) && (
              <div className="jlpt-hero-meaning-wrap">
                <div className="jlpt-hero-label-badge jlpt-hero-label-badge--meaning">
                  <Lightbulb size={13} />
                  <span>Ý nghĩa & Sắc thái</span>
                </div>
                {point.meaning && (
                  <div className="jlpt-hero-meaning-text">
                    <FuriganaText text={point.meaning} />
                  </div>
                )}
                {point.nuance && (
                  <div className="jlpt-hero-nuance-text">
                    <FuriganaText text={point.nuance} />
                  </div>
                )}
              </div>
            )}

            {/* 1.3 Core Anchor Example (Gắn liền tạo phản xạ liên hoàn) */}
            {anchorExample && (
              <div className="jlpt-hero-anchor-example">
                <div className="jlpt-hero-anchor-header">
                  <div className="jlpt-hero-label-badge jlpt-hero-label-badge--example">
                    <Star size={13} />
                    <span>Ví dụ mẫu mực cốt lõi</span>
                  </div>
                  <button
                    type="button"
                    className="jlpt-icon-btn jlpt-icon-btn--sm"
                    onClick={() => handlePlayAudio(anchorExample.jp, 0)}
                    title="Nghe phát âm ví dụ cốt lõi"
                  >
                    <Volume2 size={13} />
                  </button>
                </div>

                <div className="jlpt-hero-anchor-jp">
                  <FuriganaText text={anchorExample.jp} />
                </div>
                <div className="jlpt-hero-anchor-vi">
                  {anchorExample.vi}
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              TẦNG 2: MỞ RỘNG & QUÁN NGỮ (DEEPENING & COLLOCATIONS)
              ========================================================================= */}
          {/* Collocations */}
          {point.collocations && point.collocations.length > 0 && (
            <div className="jlpt-grammar-section" style={{ '--section-color': 'var(--tint-amber-border, #f59e0b)' }}>
              <div className="jlpt-grammar-section-title">
                <Bookmark size={13} />
                <span>Cụm từ cố định & Quán ngữ hay gặp ({point.collocations.length})</span>
              </div>
              <div className="jlpt-collocations-chips">
                {point.collocations.map((col, cIdx) => (
                  <button
                    key={cIdx}
                    type="button"
                    className="jlpt-collocation-chip"
                    onClick={() => speakJapanese(col)}
                    title="Bấm để nghe phát âm"
                  >
                    <Volume2 size={12} />
                    <span><FuriganaText text={col} /></span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Additional Examples (if more than 1) */}
          {additionalExamples.length > 0 && (
            <div className="jlpt-grammar-section" style={{ '--section-color': 'var(--accent-primary, #3b82f6)' }}>
              <div className="jlpt-grammar-section-title">
                <BookOpen size={13} />
                <span>Ví dụ mở rộng ({additionalExamples.length} câu)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {additionalExamples.map((ex, exIdx) => {
                  const actualIdx = exIdx + 1;
                  return (
                    <div key={actualIdx} className="jlpt-example-item">
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
                        className={`jlpt-icon-btn ${isPlayingAudio === actualIdx ? 'jlpt-icon-btn--active' : ''}`}
                        onClick={() => handlePlayAudio(ex.jp, actualIdx)}
                        title="Nghe phát âm"
                        aria-label="Play audio"
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Similar Grammar & Nuance Distinction */}
          {point.similarGrammar && point.similarGrammar.length > 0 && (
            <div className="jlpt-grammar-section" style={{ '--section-color': 'var(--tint-violet-border, #8b5cf6)' }}>
              <div className="jlpt-grammar-section-title">
                <GitCompare size={13} />
                <span>Phân biệt cấu trúc tương đồng & Dễ nhầm lẫn ({point.similarGrammar.length})</span>
              </div>
              <div className="jlpt-similar-list">
                {point.similarGrammar.map((sim, sIdx) => (
                  <div key={sIdx} className="jlpt-similar-card">
                    <span className="jlpt-similar-pattern">
                      <FuriganaText text={sim.pattern || sim.target} />
                    </span>
                    <span className="jlpt-similar-contrast">
                      <FuriganaText text={sim.contrast || sim.diff} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TẦNG 3: CẨM NANG THI THẬT & MẸO NHỚ (EXAM STRATEGY - NHÃ NHẶN, HỌC THUẬT)
              Không dùng màu đỏ chói gây phân tán mắt!
              ========================================================================= */}
          {/* JLPT Trap Buster (Pro Card - Nhã nhặn, sang trọng) */}
          {point.trapBuster && (
            <div className="jlpt-trap-pro-card">
              <div className="jlpt-trap-pro-header">
                <ShieldAlert size={14} style={{ color: 'var(--text-secondary)' }} />
                <span>Cẩm nang bẻ bẫy thi thật & Lưu ý điểm mù</span>
              </div>
              <div className="jlpt-trap-pro-body">
                <FuriganaText text={point.trapBuster} />
              </div>
            </div>
          )}

          {/* Pedagogical Mnemonic Anchor */}
          {(point.mnemonic || point.metaphor) && (
            <div className="jlpt-mnemonic-box">
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Sparkles size={14} />
                <span>Mẹo ghi nhớ sư phạm 3 giây</span>
              </div>
              {point.metaphor && (
                <div style={{ fontStyle: 'italic', marginBottom: '4px' }}>
                  💡 Ẩn dụ: <FuriganaText text={point.metaphor} />
                </div>
              )}
              {point.mnemonic && (
                <div>🧠 <FuriganaText text={point.mnemonic} /></div>
              )}
            </div>
          )}

          {/* =========================================================================
              TẦNG 4: LUYỆN TẬP PHẢN XẠ NHANH (REFLEX DRILL)
              ========================================================================= */}
          {((point.drills && point.drills.length > 0) || (point.quiz && point.quiz.length > 0)) && (
            <div style={{ marginTop: '4px' }}>
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

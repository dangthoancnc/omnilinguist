import React, { useState, useMemo } from 'react';
import { 
  Network, BookOpen, CheckCircle, ChevronDown, ChevronUp, 
  Printer, Sparkles, Languages, Volume2, Maximize2, ExternalLink 
} from 'lucide-react';
import CompactToolbar from './CompactToolbar';
import GrammarPointView from './GrammarPointView';
import MindmapTreeView from './MindmapTreeView';
import FuriganaText from '../FuriganaText';
import { speakJapanese } from './speechHelper';
import { getLevelBadgeStyle } from '../../theme';

/**
 * Helper to render connection text with clickable 'Bài X' links
 */
function renderPedagogyConnectionWithLinks(text, onNavigateLesson) {
  if (!text) return null;
  const parts = [];
  const regex = /(Bài\s*(\d+))/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const lessonNum = parseInt(match[2], 10);
    parts.push(
      <button
        key={match.index}
        type="button"
        className="jlpt-pedagogy-link-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (onNavigateLesson) onNavigateLesson(lessonNum);
        }}
        title={`Bấm để chuyển tới Bài ${lessonNum}`}
      >
        Bài {lessonNum} ↗
      </button>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Extract first referenced lesson number from connection text for card click fallback
 */
function extractFirstLessonNumber(text) {
  if (!text) return null;
  const match = /Bài\s*(\d+)/i.exec(text);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * LessonDetailPage — 2-Column Standard Textbook Layout
 * Features:
 * - Left Sidebar (340px): Chapter overview, Smart Expandable TOC (integrated mini-mindmap), interactive connections, vocab
 * - Main Area (flex: 1): Direct full-focus Grammar Points from top of page, Zero wasted vertical space
 */
export default function LessonDetailPage({
  lesson,
  totalLessons = 50,
  allLessons = [],
  onBack,
  onPrev,
  onNext,
  onNavigateLesson,
  hasPrev = false,
  hasNext = false,
  quizAnswers = {},
  onAnswerQuiz,
}) {
  const [showVocab, setShowVocab] = useState(false);
  const [showMindmapModal, setShowMindmapModal] = useState(false);
  const [expandedTocItems, setExpandedTocItems] = useState({});
  const [expandedPoints, setExpandedPoints] = useState(() => {
    // Mặc định mở điểm ngữ pháp đầu tiên
    return { 0: true };
  });

  const togglePoint = (idx) => {
    setExpandedPoints(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAllPoints = () => {
    const all = {};
    (lesson.grammarPoints || []).forEach((_, i) => { all[i] = true; });
    setExpandedPoints(all);
  };

  const collapseAllPoints = () => {
    setExpandedPoints({});
  };

  const toggleTocItem = (idx, e) => {
    if (e) e.stopPropagation();
    setExpandedTocItems(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAllToc = () => {
    const all = {};
    (lesson.grammarPoints || []).forEach((_, i) => { all[i] = true; });
    setExpandedTocItems(all);
  };

  const collapseAllToc = () => {
    setExpandedTocItems({});
  };

  const scrollToPoint = (idx) => {
    const el = document.getElementById(`gp-${lesson.grammarPoints?.[idx]?.id || idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setExpandedPoints(prev => ({ ...prev, [idx]: true }));
    }
  };

  const grammarPoints = lesson.grammarPoints || [];
  const rootConn = lesson.mindmap?.rootConnection;
  const nextLeap = lesson.mindmap?.nextLeap;

  const rootTarget = extractFirstLessonNumber(rootConn);
  const leapTarget = extractFirstLessonNumber(nextLeap);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'hidden' }}>
      {/* 1. Compact Sticky Toolbar (38px sleek bar, eliminated duplicate long title) */}
      <CompactToolbar
        level={lesson.level}
        title={`Bài ${lesson.lessonNumber}`}
        subtitle={null}
        onBack={onBack}
        onPrev={onPrev}
        onNext={onNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
        actions={[
          ...(lesson.vocabulary?.length ? [{
            icon: <Languages size={15} />,
            title: showVocab ? 'Ẩn từ vựng' : 'Hiện từ vựng trọng tâm',
            active: showVocab,
            onClick: () => setShowVocab(v => !v),
          }] : []),
          {
            icon: <Network size={15} />,
            title: 'Sơ đồ tư duy toàn cảnh',
            active: showMindmapModal,
            onClick: () => setShowMindmapModal(true),
          },
          {
            icon: <Printer size={15} />,
            title: 'In / Xuất PDF chương này',
            onClick: () => window.print(),
          }
        ]}
      />

      {/* 2. Two-Column Layout (Sidebar 340px + Main Content) */}
      <div className="jlpt-lesson-layout">
        {/* Left Sidebar: 340px (Overview, Smart TOC, Vocab) */}
        <aside className="jlpt-lesson-sidebar">
          {/* Chapter Overview Box (Compact) */}
          <div className="jlpt-sidebar-overview-card">
            <div className="jlpt-chapter-meta">
              <span style={getLevelBadgeStyle(lesson.level)}>
                {lesson.level} • 第{lesson.lessonNumber}課
              </span>
              {lesson.pillar && (
                <span className="jlpt-card-pillar">
                  {lesson.pillar}
                </span>
              )}
            </div>

            <h1 className="jlpt-chapter-title-jp" style={{ fontSize: '16px', margin: '4px 0 2px' }}>
              <FuriganaText text={lesson.jpTitle} />
            </h1>
            <p className="jlpt-chapter-title-vi" style={{ fontSize: '13px', margin: '0 0 8px' }}>
              {lesson.viTitle}
            </p>

            {lesson.summary && (
              <div className="jlpt-chapter-summary-text" style={{ fontSize: '12px', padding: '8px 10px', margin: '0 0 8px', lineHeight: 1.4 }}>
                {lesson.summary}
              </div>
            )}

            {/* Root & Next Leap Connections (Interactive Clickable Links) */}
            {(rootConn || nextLeap) && (
              <div className="jlpt-pedagogy-connections" style={{ gridTemplateColumns: '1fr', gap: '6px' }}>
                {rootConn && (
                  <div 
                    className={`jlpt-pedagogy-box jlpt-pedagogy-box--root ${rootTarget ? 'jlpt-pedagogy-box--clickable' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '11px', cursor: rootTarget ? 'pointer' : 'default' }}
                    onClick={() => rootTarget && onNavigateLesson && onNavigateLesson(rootTarget)}
                    title={rootTarget ? `Bấm để chuyển tới Bài ${rootTarget}` : undefined}
                  >
                    <span className="jlpt-pedagogy-box-label">🌿 Cội Nguồn Tiền Đề</span>
                    <span>{renderPedagogyConnectionWithLinks(rootConn, onNavigateLesson)}</span>
                  </div>
                )}
                {nextLeap && (
                  <div 
                    className={`jlpt-pedagogy-box jlpt-pedagogy-box--leap ${leapTarget ? 'jlpt-pedagogy-box--clickable' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '11px', cursor: leapTarget ? 'pointer' : 'default' }}
                    onClick={() => leapTarget && onNavigateLesson && onNavigateLesson(leapTarget)}
                    title={leapTarget ? `Bấm để chuyển tới Bài ${leapTarget}` : undefined}
                  >
                    <span className="jlpt-pedagogy-box-label">🚀 Bước Nhảy Tiếp Theo</span>
                    <span>{renderPedagogyConnectionWithLinks(nextLeap, onNavigateLesson)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Smart Expandable TOC (Sơ đồ tư duy thu nhỏ tích hợp vào mục lục) */}
          {grammarPoints.length > 0 && (
            <div className="jlpt-sidebar-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 6px', borderBottom: '1px solid var(--border-default)', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Mục lục & Sơ đồ ({grammarPoints.length})
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    className="jlpt-view-toggle-btn"
                    style={{ padding: '2px 6px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    onClick={() => setShowMindmapModal(true)}
                    title="Mở toàn cảnh sơ đồ tư duy"
                  >
                    <Network size={11} />
                    <span>Toàn cảnh</span>
                  </button>
                  <button 
                    type="button" 
                    className="jlpt-view-toggle-btn" 
                    style={{ padding: '2px 5px', fontSize: '10px' }} 
                    onClick={Object.keys(expandedTocItems).length > 0 ? collapseAllToc : expandAllToc}
                    title="Mở/Thu công thức và ý nghĩa"
                  >
                    {Object.keys(expandedTocItems).length > 0 ? 'Thu gọn' : 'Chi tiết'}
                  </button>
                </div>
              </div>

              {/* Smart Expandable List */}
              <div className="jlpt-smart-toc-list">
                {grammarPoints.map((gp, idx) => {
                  const isExpanded = !!expandedTocItems[idx];
                  const isActive = !!expandedPoints[idx];

                  return (
                    <div 
                      key={gp.id || idx}
                      className={`jlpt-smart-toc-item ${isActive ? 'jlpt-smart-toc-item--active' : ''}`}
                    >
                      <div 
                        className="jlpt-smart-toc-header"
                        onClick={() => scrollToPoint(idx)}
                        title="Bấm để cuộn tới ngữ pháp này"
                      >
                        <span className="jlpt-smart-toc-num">{idx + 1}</span>
                        <span className="jlpt-smart-toc-title">
                          <FuriganaText text={gp.pattern} />
                        </span>
                        <button
                          type="button"
                          className="jlpt-smart-toc-expand-btn"
                          onClick={(e) => toggleTocItem(idx, e)}
                          title={isExpanded ? 'Thu gọn công thức' : 'Trải xuống xem công thức'}
                          aria-label="Toggle details"
                        >
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>

                      {/* Expandable Drawer: Mini-Mindmap Formula & Nuance */}
                      {isExpanded && (
                        <div className="jlpt-smart-toc-drawer">
                          {gp.formula && (
                            <div className="jlpt-smart-toc-formula">
                              <FuriganaText text={gp.formula} />
                            </div>
                          )}
                          {(gp.nuance || gp.meaning) && (
                            <div className="jlpt-smart-toc-nuance">
                              <FuriganaText text={gp.nuance || gp.meaning} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Standalone Mindmap Modal (1-Click Popup with Dual View: Lesson & Level Tree) */}
          <MindmapTreeView
            lesson={lesson}
            allLessons={allLessons}
            mode="modal"
            isOpen={showMindmapModal}
            onClose={() => setShowMindmapModal(false)}
            onNavigateLesson={onNavigateLesson}
            onSelectGrammarPoint={scrollToPoint}
          />

          {/* Vocabulary Section in Sidebar */}
          {lesson.vocabulary && lesson.vocabulary.length > 0 && (
            <div className="jlpt-sidebar-section">
              <div 
                className="jlpt-sidebar-section-header"
                onClick={() => setShowVocab(v => !v)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Languages size={13} style={{ color: 'var(--tint-matcha-text, #047857)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Từ vựng trọng tâm ({lesson.vocabulary.length})
                  </span>
                </div>
                {showVocab ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </div>

              {showVocab && (
                <div className="jlpt-sidebar-vocab-list">
                  {lesson.vocabulary.map((vocab, vIdx) => (
                    <div key={vIdx} className="jlpt-sidebar-vocab-item">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="jlpt-sidebar-vocab-jp">
                          <FuriganaText text={vocab.kanji || vocab.jp} />
                        </span>
                        <button
                          type="button"
                          className="jlpt-icon-btn jlpt-icon-btn--sm"
                          onClick={() => speakJapanese(vocab.kanji || vocab.jp)}
                          title="Nghe phát âm"
                        >
                          <Volume2 size={11} />
                        </button>
                      </div>
                      <div className="jlpt-sidebar-vocab-vi">{vocab.vi}</div>
                      {vocab.type && <span className="jlpt-vocab-type-tag">{vocab.type}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Right Main Pane: Full Grammar Points (Top-priority visual focus) */}
        <main className="jlpt-lesson-main">
          {/* Full Grammar Points List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {grammarPoints.map((point, idx) => (
              <GrammarPointView
                key={point.id || idx}
                point={point}
                index={idx}
                level={lesson.level}
                expanded={!!expandedPoints[idx]}
                onToggle={() => togglePoint(idx)}
                quizAnswer={quizAnswers}
                onAnswerQuiz={onAnswerQuiz}
              />
            ))}
          </div>

          {/* Chapter Summary & Review Card */}
          <div className="jlpt-lesson-summary-card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} style={{ color: 'var(--tint-amber-text, #b45309)' }} />
              Tổng kết chương & Lời khuyên ôn luyện
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {lesson.mindmap?.tip || `Bạn đã hoàn thành các mẫu câu cốt lõi của Bài ${lesson.lessonNumber}. Hãy làm đầy đủ các bài tập trắc nghiệm phản xạ phía trên để ghi nhớ cấu trúc trước khi bước sang bài tiếp theo.`}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-default)' }}>
              <button
                type="button"
                className="ods-btn ods-btn-secondary"
                onClick={onBack}
              >
                Về danh mục bài học
              </button>

              {hasNext && (
                <button
                  type="button"
                  className="ods-btn ods-btn-primary"
                  onClick={onNext}
                >
                  Tiếp tục: Bài {lesson.lessonNumber + 1} →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

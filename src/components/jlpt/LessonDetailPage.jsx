import React, { useState, useMemo } from 'react';
import { 
  Network, BookOpen, CheckCircle, ChevronDown, ChevronUp, 
  Printer, Sparkles, Languages, Volume2 
} from 'lucide-react';
import CompactToolbar from './CompactToolbar';
import GrammarPointView from './GrammarPointView';
import MindmapTreeView from './MindmapTreeView';
import FuriganaText from '../FuriganaText';
import { speakJapanese } from './speechHelper';
import { getLevelBadgeStyle } from '../../theme';

/**
 * LessonDetailPage — 2-Column Standard Textbook Layout
 * Features:
 * - Left Sidebar (260px): Chapter overview, inline mindmap (default open), vertical TOC, vocab accordion
 * - Main Area (flex: 1): Direct full-focus Grammar Points from top of page, Zero wasted vertical space
 */
export default function LessonDetailPage({
  lesson,
  totalLessons = 50,
  onBack,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  quizAnswers = {},
  onAnswerQuiz,
}) {
  const [showMindmap, setShowMindmap] = useState(true); // Default open per user request
  const [showVocab, setShowVocab] = useState(false);
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

  const expandAll = () => {
    const all = {};
    (lesson.grammarPoints || []).forEach((_, i) => { all[i] = true; });
    setExpandedPoints(all);
  };

  const collapseAll = () => {
    setExpandedPoints({});
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'hidden' }}>
      {/* 1. Compact Sticky Toolbar (48px) */}
      <CompactToolbar
        level={lesson.level}
        title={`第${lesson.lessonNumber}課: ${lesson.jpTitle}`}
        subtitle={lesson.viTitle}
        onBack={onBack}
        onPrev={onPrev}
        onNext={onNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
        actions={[
          ...(lesson.vocabulary?.length ? [{
            icon: <Languages size={16} />,
            title: showVocab ? 'Ẩn từ vựng' : 'Hiện từ vựng trọng tâm',
            active: showVocab,
            onClick: () => setShowVocab(v => !v),
          }] : []),
          {
            icon: <Network size={16} />,
            title: showMindmap ? 'Ẩn sơ đồ tư duy' : 'Hiện sơ đồ tư duy',
            active: showMindmap,
            onClick: () => setShowMindmap(s => !s),
          },
          {
            icon: <Printer size={16} />,
            title: 'In / Xuất PDF chương này',
            onClick: () => window.print(),
          }
        ]}
      />

      {/* 2. Two-Column Layout (Sidebar 260px + Main Content) */}
      <div className="jlpt-lesson-layout">
        {/* Left Sidebar: 260px (Overview, Mindmap, TOC, Vocab) */}
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

            {/* Root & Next Leap Connections (Compact) */}
            {(rootConn || nextLeap) && (
              <div className="jlpt-pedagogy-connections" style={{ gridTemplateColumns: '1fr', gap: '6px' }}>
                {rootConn && (
                  <div className="jlpt-pedagogy-box jlpt-pedagogy-box--root" style={{ padding: '6px 8px', fontSize: '11px' }}>
                    <span className="jlpt-pedagogy-box-label">🌿 Cội Nguồn Tiền Đề</span>
                    <span>{rootConn}</span>
                  </div>
                )}
                {nextLeap && (
                  <div className="jlpt-pedagogy-box jlpt-pedagogy-box--leap" style={{ padding: '6px 8px', fontSize: '11px' }}>
                    <span className="jlpt-pedagogy-box-label">🚀 Bước Nhảy Tiếp Theo</span>
                    <span>{nextLeap}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sơ đồ tư duy nhánh (Mindmap inline trong sidebar, default mở) */}
          <div className="jlpt-sidebar-section">
            <div 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', cursor: 'pointer' }}
              onClick={() => setShowMindmap(s => !s)}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Network size={13} style={{ color: 'var(--accent-primary)' }} />
                <span>Sơ đồ tư duy</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {showMindmap ? 'Thu nhỏ' : 'Mở rộng'}
              </span>
            </div>
            {showMindmap && (
              <div style={{ marginTop: '4px' }}>
                <MindmapTreeView 
                  lesson={lesson} 
                  mode="sidebar-tree" 
                  onSelectGrammarPoint={scrollToPoint} 
                />
              </div>
            )}
          </div>

          {/* Quick Vertical TOC in Sidebar */}
          {grammarPoints.length > 0 && (
            <div className="jlpt-sidebar-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Mục lục ({grammarPoints.length})
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" className="jlpt-view-toggle-btn" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={expandAll}>
                    Mở hết
                  </button>
                  <button type="button" className="jlpt-view-toggle-btn" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={collapseAll}>
                    Thu hết
                  </button>
                </div>
              </div>
              <div className="jlpt-sidebar-toc-list">
                {grammarPoints.map((gp, idx) => (
                  <button
                    key={gp.id || idx}
                    type="button"
                    className={`jlpt-sidebar-toc-item ${expandedPoints[idx] ? 'jlpt-sidebar-toc-item--active' : ''}`}
                    onClick={() => scrollToPoint(idx)}
                  >
                    <span className="jlpt-sidebar-toc-num">{idx + 1}</span>
                    <span className="jlpt-sidebar-toc-text"><FuriganaText text={gp.pattern} /></span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

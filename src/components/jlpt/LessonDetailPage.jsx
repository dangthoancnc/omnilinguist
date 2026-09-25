import React, { useState, useMemo } from 'react';
import { Network, BookOpen, CheckCircle, ChevronDown, ChevronUp, Printer, Sparkles } from 'lucide-react';
import CompactToolbar from './CompactToolbar';
import GrammarPointView from './GrammarPointView';
import MindmapTreeView from './MindmapTreeView';
import { getLevelBadgeStyle } from '../../theme';

/**
 * LessonDetailPage — Standard Textbook Single-Chapter Format
 * Structure:
 * 1. CompactToolbar (48px Sticky)
 * 2. Chapter Overview Box (Pillar, Summary, Predecessor/Successor connections)
 * 3. Collapsible Interactive Mindmap Tree
 * 4. Quick Sticky Table of Contents (TOC)
 * 5. Full Grammar Points (Accordion with Furigana, Audio, Traps, Reflex Drills)
 * 6. Chapter Summary & Review Card
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
  const [showMindmap, setShowMindmap] = useState(true);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
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

      {/* 2. Main Chapter Content */}
      <main className="jlpt-lesson-page">
        {/* Chapter Overview Box */}
        <section className="jlpt-chapter-overview">
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

          <h1 className="jlpt-chapter-title-jp">
            {lesson.jpTitle}
          </h1>
          <p className="jlpt-chapter-title-vi">
            {lesson.viTitle}
          </p>

          {lesson.summary && (
            <div className="jlpt-chapter-summary-text">
              {lesson.summary}
            </div>
          )}

          {/* Root & Next Leap Connections */}
          {(rootConn || nextLeap) && (
            <div className="jlpt-pedagogy-connections">
              {rootConn && (
                <div className="jlpt-pedagogy-box jlpt-pedagogy-box--root">
                  <span className="jlpt-pedagogy-box-label">🌿 Cội Nguồn Tiền Đề</span>
                  <span>{rootConn}</span>
                </div>
              )}
              {nextLeap && (
                <div className="jlpt-pedagogy-box jlpt-pedagogy-box--leap">
                  <span className="jlpt-pedagogy-box-label">🚀 Bước Nhảy Tiếp Theo</span>
                  <span>{nextLeap}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 3. Collapsible Interactive Mindmap Tree */}
        {showMindmap && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Network size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>Sơ đồ tư duy nhánh của chương</span>
              </div>
              <button 
                type="button" 
                className="jlpt-view-toggle-btn"
                onClick={() => setShowMindmap(false)}
              >
                Thu nhỏ
              </button>
            </div>
            <MindmapTreeView lesson={lesson} mode="lesson" height={380} />
          </section>
        )}

        {/* 4. Quick Sticky Table of Contents (TOC) */}
        {grammarPoints.length > 0 && (
          <nav className="jlpt-chapter-toc" aria-label="Mục lục ngữ pháp">
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginRight: '4px' }}>
              Mục lục ({grammarPoints.length}):
            </span>
            {grammarPoints.map((gp, idx) => (
              <button
                key={gp.id || idx}
                type="button"
                className={`jlpt-toc-item ${expandedPoints[idx] ? 'jlpt-toc-item--active' : ''}`}
                onClick={() => scrollToPoint(idx)}
              >
                <span>{idx + 1}.</span>
                <span>{gp.pattern}</span>
              </button>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
              <button type="button" className="jlpt-view-toggle-btn" onClick={expandAll} title="Mở rộng tất cả">
                Mở hết
              </button>
              <button type="button" className="jlpt-view-toggle-btn" onClick={collapseAll} title="Thu gọn tất cả">
                Thu hết
              </button>
            </div>
          </nav>
        )}

        {/* 5. Full Grammar Points List */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        </section>

        {/* 6. Chapter Summary & Review Card */}
        <section style={{ 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border-default)', 
          borderRadius: 'var(--radius-md, 12px)', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
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
        </section>
      </main>
    </div>
  );
}

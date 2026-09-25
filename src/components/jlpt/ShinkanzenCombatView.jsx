import React, { useState } from 'react';
import { BookOpen, FileText, Volume2, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import CompactToolbar from './CompactToolbar';
import GrammarPointView from './GrammarPointView';
import { getLevelBadgeStyle } from '../../theme';

/**
 * ShinkanzenCombatView — Shin Kanzen Master Combat Track (N3, N2, N1)
 * 3 Skills: Grammar (Ngữ pháp bẻ bẫy) | Reading (Đọc hiểu) | Listening (Nghe hiểu)
 */
export default function ShinkanzenCombatView({
  syllabus,
  level = 'N3',
  onBack,
}) {
  const [activeSkill, setActiveSkill] = useState('grammar');
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

  const handleAnswerQuiz = (pointId, drillIdx, optIdx) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`${pointId}_${drillIdx}`]: optIdx,
    }));
  };

  const skills = [
    { id: 'grammar', label: 'Ngữ Pháp Bẻ Bẫy', icon: <BookOpen size={14} /> },
    { id: 'reading', label: 'Đọc Hiểu (Dokkai)', icon: <FileText size={14} /> },
    { id: 'listening', label: 'Nghe Hiểu (Choukai)', icon: <Volume2 size={14} /> },
  ];

  const grammarChapters = syllabus?.skills?.grammar || [];
  const currentChapter = grammarChapters[selectedChapterIdx] || grammarChapters[0];

  const readingUnits = syllabus?.skills?.reading || [];
  const listeningUnits = syllabus?.skills?.listening || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'hidden' }}>
      {/* 1. Compact Sticky Toolbar (48px) */}
      <CompactToolbar
        level={level}
        title={syllabus?.title || `Shin Kanzen Master ${level}`}
        subtitle="Chiến lược bẻ khóa đề thi"
        onBack={onBack}
      >
        <div className="jlpt-view-toggle">
          {skills.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`jlpt-view-toggle-btn ${activeSkill === s.id ? 'jlpt-view-toggle-btn--active' : ''}`}
              onClick={() => setActiveSkill(s.id)}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </CompactToolbar>

      {/* 2. Main Content Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* SKILL: GRAMMAR MASTER-DETAIL */}
        {activeSkill === 'grammar' && (
          <div style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 104px)' }}>
            {/* Left Sidebar: Chapter List (280px) */}
            <aside style={{ 
              width: '280px', 
              borderRight: '1px solid var(--border-default)', 
              background: 'var(--bg-surface)', 
              overflowY: 'auto',
              flexShrink: 0 
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                Danh sách chương ({grammarChapters.length})
              </div>
              <div>
                {grammarChapters.map((ch, idx) => {
                  const isSelected = idx === selectedChapterIdx;
                  return (
                    <div
                      key={ch.chapterNumber || idx}
                      onClick={() => setSelectedChapterIdx(idx)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle, var(--border-default))',
                        background: isSelected ? 'var(--tint-sky-bg, #f0f9ff)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--accent-primary, #3b82f6)' : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? 'var(--accent-primary)' : 'var(--text-tertiary)', marginBottom: '2px' }}>
                        Chương {ch.chapterNumber || idx + 1}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {ch.chapterTitle}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {ch.points?.length || 0} mẫu cấu trúc
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right Pane: Chapter Detail & Grammar Points */}
            <main style={{ flex: 1, padding: '20px', overflowY: 'auto', maxWidth: '860px', margin: '0 auto' }}>
              {currentChapter ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-default)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                      Chương {currentChapter.chapterNumber}
                    </span>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 8px' }}>
                      {currentChapter.chapterTitle}
                    </h2>
                    {currentChapter.summary && (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {currentChapter.summary}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {(currentChapter.points || []).map((point, pIdx) => (
                      <GrammarPointView
                        key={point.id || pIdx}
                        point={point}
                        index={pIdx}
                        level={level}
                        expanded={true}
                        quizAnswer={quizAnswers}
                        onAnswerQuiz={handleAnswerQuiz}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  Chưa có dữ liệu chương này.
                </div>
              )}
            </main>
          </div>
        )}

        {/* SKILL: READING COMPREHENSION (Dokkai) */}
        {activeSkill === 'reading' && (
          <div style={{ padding: '24px 20px', maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Chiến Lược Đọc Hiểu 5 Dạng Bài Chuẩn JLPT {level}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {readingUnits.map((u, idx) => (
                <div 
                  key={idx} 
                  className="ods-card"
                  style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tint-matcha-text, #047857)' }}>
                    Kỹ năng {u.unit || idx + 1}
                  </span>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {u.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {u.strategy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILL: LISTENING COMPREHENSION (Choukai) */}
        {activeSkill === 'listening' && (
          <div style={{ padding: '24px 20px', maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Chiến Lược Nghe Hiểu 5 Mondai Chuẩn JLPT {level}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {listeningUnits.map((m, idx) => (
                <div 
                  key={idx} 
                  className="ods-card"
                  style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tint-violet-text, #6d28d9)' }}>
                    Mondai {m.mondai || idx + 1}
                  </span>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {m.pattern}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

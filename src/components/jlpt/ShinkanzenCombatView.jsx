import React, { useState } from 'react';
import { 
  BookOpen, FileText, Volume2, ShieldAlert, Sparkles, 
  ChevronRight, CheckCircle2, XCircle, RotateCcw, 
  HelpCircle, Trophy, Eye, EyeOff, Layers, Table, Lightbulb
} from 'lucide-react';
import CompactToolbar from './CompactToolbar';
import GrammarPointView from './GrammarPointView';
import { speakJapanese } from './speechHelper';
import { getLevelBadgeStyle } from '../../theme';

/**
 * ShinkanzenCombatView — Shin Kanzen Master Combat Track (N3, N2, N1)
 * 4 Skills: 
 * 1. Grammar (Ngữ pháp bẻ bẫy - 15 chapters)
 * 2. Reading (Đọc hiểu Dokkai - 5 units with full passages, questions, interactive options & trap busters)
 * 3. Listening (Nghe hiểu Choukai - 5 units with audio player, transcript toggle, options & trap busters)
 * 4. Stage Reviews (Tổng kết giai đoạn - 3 milestones with Traps Matrix & Milestone Quiz)
 */
export default function ShinkanzenCombatView({
  syllabus,
  level = 'N3',
  onBack,
}) {
  const [activeSkill, setActiveSkill] = useState('grammar');
  
  // Grammar State
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Reading (Dokkai) State
  const [selectedReadingIdx, setSelectedReadingIdx] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState({});
  const [showReadingExplanations, setShowReadingExplanations] = useState({});

  // Listening (Choukai) State
  const [selectedListeningIdx, setSelectedListeningIdx] = useState(0);
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [showListeningTranscript, setShowListeningTranscript] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Stage Reviews State
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);
  const [stageQuizAnswers, setStageQuizAnswers] = useState({});

  const handleAnswerQuiz = (pointId, drillIdx, optIdx) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`${pointId}_${drillIdx}`]: optIdx,
    }));
  };

  const skills = [
    { id: 'grammar', label: 'Ngữ Pháp Bẻ Bẫy', icon: <BookOpen size={14} /> },
    { id: 'reading', label: 'Đọc Hiểu Thực Chiến', icon: <FileText size={14} /> },
    { id: 'listening', label: 'Nghe Hiểu Thực Chiến', icon: <Volume2 size={14} /> },
    { id: 'reviews', label: 'Tổng Kết Giai Đoạn', icon: <Table size={14} /> },
  ];

  const grammarChapters = syllabus?.skills?.grammar || [];
  const currentChapter = grammarChapters[selectedChapterIdx] || grammarChapters[0];

  const readingUnits = syllabus?.skills?.reading || [];
  const currentReading = readingUnits[selectedReadingIdx] || readingUnits[0];

  const listeningUnits = syllabus?.skills?.listening || [];
  const currentListening = listeningUnits[selectedListeningIdx] || listeningUnits[0];

  const stageReviews = syllabus?.skills?.stageReviews || [];
  const currentStage = stageReviews[selectedStageIdx] || stageReviews[0];

  const handlePlayAudio = (text) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    speakJapanese(text, () => setIsPlayingAudio(false));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'hidden' }}>
      {/* 1. Compact Sticky Toolbar (48px) */}
      <CompactToolbar
        level={level}
        title={syllabus?.title || `Shin Kanzen Master ${level}`}
        subtitle="Chiến lược bẻ khóa đề thi chuẩn mực"
        onBack={onBack}
      >
        <div className="jlpt-view-toggle">
          {skills.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`jlpt-view-toggle-btn ${activeSkill === s.id ? 'jlpt-view-toggle-btn--active' : ''}`}
              onClick={() => {
                setActiveSkill(s.id);
                setShowListeningTranscript(false);
              }}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </CompactToolbar>

      {/* 2. Main Content Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* =========================================================================
            SKILL 1: GRAMMAR MASTER-DETAIL (15 CHAPTERS)
            ========================================================================= */}
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

        {/* =========================================================================
            SKILL 2: READING COMPREHENSION (Dokkai - 5 Dạng Bài Thực Chiến)
            ========================================================================= */}
        {activeSkill === 'reading' && (
          <div style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 104px)' }}>
            {/* Left Sidebar: 5 Dokkai Units */}
            <aside style={{ 
              width: '280px', 
              borderRight: '1px solid var(--border-default)', 
              background: 'var(--bg-surface)', 
              overflowY: 'auto',
              flexShrink: 0 
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                5 Dạng Bài Đọc Hiểu JLPT {level}
              </div>
              <div>
                {readingUnits.map((u, idx) => {
                  const isSelected = idx === selectedReadingIdx;
                  const isAnswered = readingAnswers[idx] !== undefined;
                  return (
                    <div
                      key={u.unit || idx}
                      onClick={() => setSelectedReadingIdx(idx)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle, var(--border-default))',
                        background: isSelected ? 'var(--tint-matcha-bg, #ecfdf5)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--tint-matcha-border, #10b981)' : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? 'var(--tint-matcha-text, #047857)' : 'var(--text-tertiary)' }}>
                          Dạng {u.unit || idx + 1}
                        </span>
                        {isAnswered && (
                          <span style={{ fontSize: '10px', color: 'var(--tint-matcha-text, #047857)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <CheckCircle2 size={12} /> Đã làm
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.4 }}>
                        {u.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right Pane: Dokkai Reader & Interactive Test */}
            <main style={{ flex: 1, padding: '24px', overflowY: 'auto', maxWidth: '880px', margin: '0 auto' }}>
              {currentReading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Unit Header */}
                  <div style={{ background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ ...getLevelBadgeStyle(level), fontSize: '11px' }}>
                        {level} • Kỹ năng Đọc
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tint-matcha-text, #047857)' }}>
                        Dạng bài {currentReading.unit}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {currentReading.title}
                    </h2>
                  </div>

                  {/* Strategy Callout */}
                  <div className="jlpt-dokkai-strategy-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--tint-matcha-text, #047857)', marginBottom: '4px' }}>
                      <Lightbulb size={14} />
                      <span>Chiến lược bẻ khóa dạng bài</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {currentReading.strategy}
                    </div>
                  </div>

                  {/* Japanese Passage Card */}
                  <div className="jlpt-dokkai-passage-card">
                    <div className="jlpt-dokkai-passage-header">
                      <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Văn Bản Đọc Hiểu (Bài tập thực chiến)
                      </span>
                      <button
                        type="button"
                        className="jlpt-icon-btn jlpt-icon-btn--sm"
                        onClick={() => handlePlayAudio(currentReading.passage)}
                        title="Nghe đọc bài văn"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                    <div className="jlpt-dokkai-passage-body">
                      {currentReading.passage}
                    </div>
                  </div>

                  {/* Question & Interactive Options */}
                  <div className="jlpt-dokkai-question-card">
                    <div className="jlpt-dokkai-question-title">
                      <HelpCircle size={15} style={{ color: 'var(--accent-primary, #3b82f6)' }} />
                      <span>{currentReading.question}</span>
                    </div>

                    <div className="jlpt-dokkai-options-list">
                      {currentReading.options.map((opt, oIdx) => {
                        const userAns = readingAnswers[selectedReadingIdx];
                        const isChosen = userAns === oIdx;
                        const isCorrect = currentReading.correctIndex === oIdx;
                        let optClass = 'jlpt-dokkai-option';

                        if (userAns !== undefined) {
                          if (isCorrect) optClass += ' jlpt-dokkai-option--correct';
                          else if (isChosen) optClass += ' jlpt-dokkai-option--wrong';
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            className={optClass}
                            onClick={() => {
                              setReadingAnswers(prev => ({ ...prev, [selectedReadingIdx]: oIdx }));
                              setShowReadingExplanations(prev => ({ ...prev, [selectedReadingIdx]: true }));
                            }}
                          >
                            <span className="jlpt-dokkai-option-num">{oIdx + 1}</span>
                            <span className="jlpt-dokkai-option-text">{opt}</span>
                            {userAns !== undefined && isCorrect && (
                              <CheckCircle2 size={16} className="jlpt-dokkai-option-icon jlpt-dokkai-option-icon--correct" />
                            )}
                            {userAns !== undefined && isChosen && !isCorrect && (
                              <XCircle size={16} className="jlpt-dokkai-option-icon jlpt-dokkai-option-icon--wrong" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Reveal / Hide Explanation Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button
                        type="button"
                        className="jlpt-view-toggle-btn"
                        onClick={() => setShowReadingExplanations(prev => ({
                          ...prev,
                          [selectedReadingIdx]: !prev[selectedReadingIdx]
                        }))}
                      >
                        {showReadingExplanations[selectedReadingIdx] ? 'Ẩn lời giải & phân tích cạm bẫy' : 'Xem lời giải & phân tích cạm bẫy'}
                      </button>
                    </div>

                    {/* Trap Buster Explanation Box */}
                    {showReadingExplanations[selectedReadingIdx] && (
                      <div className="jlpt-trap-callout" style={{ marginTop: '14px' }}>
                        <div className="jlpt-trap-title">
                          <ShieldAlert size={14} />
                          <span>Phân tích đáp án & Bẻ cạm bẫy câu hỏi</span>
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                          {currentReading.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  Chưa có dữ liệu bài đọc.
                </div>
              )}
            </main>
          </div>
        )}

        {/* =========================================================================
            SKILL 3: LISTENING COMPREHENSION (Choukai - 5 Mondai Thực Chiến)
            ========================================================================= */}
        {activeSkill === 'listening' && (
          <div style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 104px)' }}>
            {/* Left Sidebar: 5 Choukai Mondai */}
            <aside style={{ 
              width: '280px', 
              borderRight: '1px solid var(--border-default)', 
              background: 'var(--bg-surface)', 
              overflowY: 'auto',
              flexShrink: 0 
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                5 Dạng Mondai Nghe Hiểu JLPT {level}
              </div>
              <div>
                {listeningUnits.map((m, idx) => {
                  const isSelected = idx === selectedListeningIdx;
                  const isAnswered = listeningAnswers[idx] !== undefined;
                  return (
                    <div
                      key={m.mondai || idx}
                      onClick={() => {
                        setSelectedListeningIdx(idx);
                        setShowListeningTranscript(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle, var(--border-default))',
                        background: isSelected ? 'var(--tint-violet-bg, #f5f3ff)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--tint-violet-border, #8b5cf6)' : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? 'var(--tint-violet-text, #6d28d9)' : 'var(--text-tertiary)' }}>
                          Mondai {m.mondai || idx + 1}
                        </span>
                        {isAnswered && (
                          <span style={{ fontSize: '10px', color: 'var(--tint-violet-text, #6d28d9)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <CheckCircle2 size={12} /> Đã làm
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.4 }}>
                        {m.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right Pane: Choukai Player & Question */}
            <main style={{ flex: 1, padding: '24px', overflowY: 'auto', maxWidth: '880px', margin: '0 auto' }}>
              {currentListening ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Header */}
                  <div style={{ background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ ...getLevelBadgeStyle(level), fontSize: '11px' }}>
                        {level} • Kỹ năng Nghe
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tint-violet-text, #6d28d9)' }}>
                        Mondai {currentListening.mondai}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {currentListening.title}
                    </h2>
                  </div>

                  {/* Strategy Box */}
                  <div className="jlpt-choukai-strategy-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--tint-violet-text, #6d28d9)', marginBottom: '4px' }}>
                      <Sparkles size={14} />
                      <span>Dấu hiệu nhận biết & Cạm bẫy âm thanh</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {currentListening.strategy}
                    </div>
                  </div>

                  {/* Audio Player Station */}
                  <div className="jlpt-choukai-audio-station">
                    <div className="jlpt-choukai-audio-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          type="button"
                          className={`jlpt-choukai-play-btn ${isPlayingAudio ? 'jlpt-choukai-play-btn--playing' : ''}`}
                          onClick={() => handlePlayAudio(currentListening.dialogue)}
                          disabled={isPlayingAudio}
                        >
                          <Volume2 size={18} />
                          <span>{isPlayingAudio ? 'Đang phát hội thoại...' : 'Bấm để nghe đoạn hội thoại'}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        className="jlpt-view-toggle-btn"
                        onClick={() => setShowListeningTranscript(s => !s)}
                      >
                        {showListeningTranscript ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{showListeningTranscript ? 'Ẩn lời thoại (Script)' : 'Xem lời thoại (Script)'}</span>
                      </button>
                    </div>

                    {/* Dialogue Transcript (Collapsible) */}
                    {showListeningTranscript && (
                      <div className="jlpt-choukai-transcript-box">
                        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                          Kịch bản lời thoại (Transcript)
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-line', fontFamily: "'Noto Sans JP', sans-serif" }}>
                          {currentListening.dialogue}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Question & Interactive Options */}
                  <div className="jlpt-dokkai-question-card">
                    <div className="jlpt-dokkai-question-title">
                      <HelpCircle size={15} style={{ color: 'var(--tint-violet-text, #6d28d9)' }} />
                      <span>{currentListening.question}</span>
                    </div>

                    <div className="jlpt-dokkai-options-list">
                      {currentListening.options.map((opt, oIdx) => {
                        const userAns = listeningAnswers[selectedListeningIdx];
                        const isChosen = userAns === oIdx;
                        const isCorrect = currentListening.correctIndex === oIdx;
                        let optClass = 'jlpt-dokkai-option';

                        if (userAns !== undefined) {
                          if (isCorrect) optClass += ' jlpt-dokkai-option--correct';
                          else if (isChosen) optClass += ' jlpt-dokkai-option--wrong';
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            className={optClass}
                            onClick={() => {
                              setListeningAnswers(prev => ({ ...prev, [selectedListeningIdx]: oIdx }));
                            }}
                          >
                            <span className="jlpt-dokkai-option-num">{oIdx + 1}</span>
                            <span className="jlpt-dokkai-option-text">{opt}</span>
                            {userAns !== undefined && isCorrect && (
                              <CheckCircle2 size={16} className="jlpt-dokkai-option-icon jlpt-dokkai-option-icon--correct" />
                            )}
                            {userAns !== undefined && isChosen && !isCorrect && (
                              <XCircle size={16} className="jlpt-dokkai-option-icon jlpt-dokkai-option-icon--wrong" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Trap Buster Explanation Box (Always appears after answering) */}
                    {listeningAnswers[selectedListeningIdx] !== undefined && (
                      <div className="jlpt-trap-callout" style={{ marginTop: '14px' }}>
                        <div className="jlpt-trap-title">
                          <ShieldAlert size={14} />
                          <span>Phân tích then chốt câu trả lời & Điểm lừa người nghe</span>
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                          {currentListening.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  Chưa có dữ liệu bài nghe.
                </div>
              )}
            </main>
          </div>
        )}

        {/* =========================================================================
            SKILL 4: STAGE REVIEWS (Tổng Kết Giai Đoạn - 3 Milestones)
            ========================================================================= */}
        {activeSkill === 'reviews' && (
          <div style={{ padding: '24px 20px', maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Stage Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
              {stageReviews.map((st, idx) => (
                <button
                  key={st.stageNumber || idx}
                  type="button"
                  className={`jlpt-view-toggle-btn ${selectedStageIdx === idx ? 'jlpt-view-toggle-btn--active' : ''}`}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => setSelectedStageIdx(idx)}
                >
                  <Trophy size={14} />
                  <span>Giai Đoạn {st.stageNumber || idx + 1}</span>
                </button>
              ))}
            </div>

            {currentStage ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Stage Header Card */}
                <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ ...getLevelBadgeStyle(level), fontSize: '11px' }}>
                      {level} • Milestone {currentStage.stageNumber}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tint-amber-text, #b45309)' }}>
                      Tổng kết cột mốc
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
                    {currentStage.title}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {currentStage.description}
                  </p>
                </div>

                {/* Section 1: Traps Matrix Table */}
                {currentStage.trapsMatrix && currentStage.trapsMatrix.length > 0 && (
                  <div className="jlpt-stage-section">
                    <h3 className="jlpt-stage-section-title">
                      <ShieldAlert size={16} style={{ color: 'var(--tint-amber-text, #b45309)' }} />
                      <span>Ma Trận Bẻ Khóa Cặp Cấu Trúc Dễ Nhầm Lẫn</span>
                    </h3>

                    <div className="jlpt-traps-table-wrapper">
                      <table className="jlpt-traps-table">
                        <thead>
                          <tr>
                            <th style={{ width: '25%' }}>Cặp Cấu Trúc Bẫy</th>
                            <th style={{ width: '75%' }}>Bí Quyết Phân Biệt & Quy Tắc Nhớ Nhanh</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentStage.trapsMatrix.map((item, tIdx) => (
                            <tr key={tIdx}>
                              <td className="jlpt-traps-td-pair">
                                {item.pair}
                              </td>
                              <td className="jlpt-traps-td-rule">
                                {item.rule}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Section 2: Milestone Quiz Test */}
                {currentStage.milestoneQuiz && currentStage.milestoneQuiz.length > 0 && (
                  <div className="jlpt-stage-section">
                    <h3 className="jlpt-stage-section-title">
                      <CheckCircle2 size={16} style={{ color: 'var(--accent-primary, #3b82f6)' }} />
                      <span>Đề Thi Thử Tổng Hợp Giai Đoạn ({currentStage.milestoneQuiz.length} câu)</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {currentStage.milestoneQuiz.map((quiz, qIdx) => {
                        const answerKey = `stage_${selectedStageIdx}_${qIdx}`;
                        const chosen = stageQuizAnswers[answerKey];
                        const isAnswered = chosen !== undefined;

                        return (
                          <div key={qIdx} className="jlpt-milestone-quiz-card">
                            <div className="jlpt-milestone-quiz-q">
                              <span className="jlpt-milestone-quiz-badge">Câu {qIdx + 1}</span>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {quiz.q}
                              </span>
                            </div>

                            <div className="jlpt-milestone-quiz-options">
                              {quiz.options.map((opt, optIdx) => {
                                const isThisChosen = chosen === optIdx;
                                const isCorrect = quiz.correct === optIdx;
                                let btnClass = 'jlpt-milestone-opt-btn';

                                if (isAnswered) {
                                  if (isCorrect) btnClass += ' jlpt-milestone-opt-btn--correct';
                                  else if (isThisChosen) btnClass += ' jlpt-milestone-opt-btn--wrong';
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    className={btnClass}
                                    onClick={() => {
                                      setStageQuizAnswers(prev => ({ ...prev, [answerKey]: optIdx }));
                                    }}
                                  >
                                    <span style={{ fontWeight: 700 }}>{optIdx + 1}.</span>
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {isAnswered && (
                              <div className="jlpt-milestone-quiz-explain">
                                <span style={{ fontWeight: 700, color: chosen === quiz.correct ? 'var(--tint-matcha-text, #047857)' : 'var(--tint-sakura-text, #be123c)' }}>
                                  {chosen === quiz.correct ? '✓ Chính xác!' : '✕ Chưa chính xác!'}
                                </span>
                                <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                                  {quiz.explain}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                Chưa có dữ liệu tổng kết giai đoạn.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

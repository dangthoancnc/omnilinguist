// src/components/jlpt/ExamSimulatorModal.jsx
// Phòng thi thử chuẩn hóa kỳ thi JLPT 10 năm (2014 - 2024)
// Tính năng: Bấm giờ thi thật, Phiếu làm bài trắc nghiệm, Chấm điểm chuẩn hóa Scaled Score, Cảnh báo điểm liệt, Giải thích song ngữ

import React, { useState, useEffect } from 'react';
import { 
  X, Timer, CheckCircle, XCircle, AlertTriangle, Flag, ArrowRight, ArrowLeft, 
  RotateCcw, Award, ChevronRight, BarChart2, Volume2, ShieldAlert, Sparkles 
} from 'lucide-react';
import FuriganaText from '../FuriganaText';

export default function ExamSimulatorModal({ exam, onClose }) {
  if (!exam) return null;

  // Flatten questions from all sections
  const allQuestions = [];
  exam.sections.forEach(sec => {
    sec.questions.forEach(q => {
      allQuestions.push({
        ...q,
        sectionId: sec.id,
        sectionTitle: sec.title
      });
    });
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.totalTime * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  // Timer
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectOption = (qId, optIdx) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const toggleFlag = (qId) => {
    setFlagged(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmitExam = () => {
    if (isSubmitted) return;
    let totalScore = 0;
    let maxTotal = 0;
    let correctCount = 0;

    const reviewQuestions = allQuestions.map(q => {
      const selected = userAnswers[q.id];
      const isCorrect = selected === q.correctIndex;
      const pts = q.points || 2;
      maxTotal += pts;
      if (isCorrect) {
        totalScore += pts;
        correctCount++;
      }
      return {
        ...q,
        selected,
        isCorrect
      };
    });

    // Quy đổi ra thang điểm JLPT 180
    const scaledScore = Math.round((totalScore / maxTotal) * 180);
    const isPassed = scaledScore >= exam.passingScore;

    setScoreResult({
      totalScore,
      maxTotal,
      scaledScore,
      correctCount,
      totalQuestions: allQuestions.length,
      isPassed,
      reviewQuestions
    });
    setIsSubmitted(true);
  };

  const currentQ = allQuestions[currentIdx];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc'
    }}>
      {/* Top Header */}
      <header style={{
        padding: '12px 24px',
        background: 'rgba(30, 41, 59, 0.9)',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            background: exam.level === 'N1' ? '#ef4444' : exam.level === 'N2' ? '#8b5cf6' : '#f59e0b',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            {exam.level}
          </span>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
            {exam.title}
          </h2>
        </div>

        {/* Timer & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {!isSubmitted && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(51, 65, 85, 0.6)',
              padding: '6px 14px',
              borderRadius: 20,
              border: `1px solid ${timeLeft < 300 ? '#ef4444' : '#475569'}`
            }}>
              <Timer size={18} color={timeLeft < 300 ? '#ef4444' : '#38bdf8'} />
              <span style={{
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: timeLeft < 300 ? '#ef4444' : '#f8fafc'
              }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}

          {!isSubmitted ? (
            <button
              onClick={handleSubmitExam}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Nộp Bài Thi
            </button>
          ) : (
            <button
              onClick={() => {
                setIsSubmitted(false);
                setUserAnswers({});
                setFlagged({});
                setTimeLeft(exam.totalTime * 60);
              }}
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <RotateCcw size={16} /> Làm Lại
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6
            }}
          >
            <X size={24} />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side: Question or Score Screen */}
        <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          {isSubmitted && scoreResult ? (
            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
              <div style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: scoreResult.isPassed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: scoreResult.isPassed ? '#10b981' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: `3px solid ${scoreResult.isPassed ? '#10b981' : '#ef4444'}`
              }}>
                <Award size={48} />
              </div>

              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 10px' }}>
                {scoreResult.isPassed ? '🎉 CHÚC MỪNG: BẠN ĐÃ ĐỖ!' : '⚠️ KẾT QUẢ: CHƯA ĐẠT ĐIỂM ĐỖ'}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: 24 }}>
                {scoreResult.isPassed
                  ? `Xuất sắc! Điểm chuẩn hóa của bạn vượt mốc đậu ${exam.passingScore}/180 của cấp độ ${exam.level}.`
                  : `Cần nỗ lực thêm để vượt ngưỡng an toàn ${exam.passingScore}/180 của kỳ thi JLPT.`}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
                background: '#1e293b',
                padding: 20,
                borderRadius: 12,
                border: '1px solid #334155',
                marginBottom: 30
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Điểm Chuẩn Hóa (Scaled)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: scoreResult.isPassed ? '#10b981' : '#ef4444' }}>
                    {scoreResult.scaledScore} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ 180</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Số Câu Đúng</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
                    {scoreResult.correctCount} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ {scoreResult.totalQuestions}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Điểm Đậu Cần Thiết</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
                    ≥ {exam.passingScore}
                  </div>
                </div>
              </div>

              <h3 style={{ textAlign: 'left', marginBottom: 16 }}>📋 Xem Lại & Phân Tích Chi Tiết Từng Câu:</h3>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {scoreResult.reviewQuestions.map((q, idx) => (
                  <div key={q.id} style={{
                    background: '#1e293b',
                    padding: 16,
                    borderRadius: 10,
                    borderLeft: `4px solid ${q.isCorrect ? '#10b981' : '#ef4444'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{q.mondai} — Câu {idx + 1}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: q.isCorrect ? '#10b981' : '#ef4444' }}>
                        {q.isCorrect ? '✅ Đúng (+2đ)' : '❌ Sai (0đ)'}
                      </span>
                    </div>
                    <div style={{ fontSize: '1rem', marginBottom: 8, whiteSpace: 'pre-line' }}>{q.text}</div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: 6 }}>
                      Đáp án của bạn: <strong style={{ color: q.isCorrect ? '#10b981' : '#ef4444' }}>
                        {q.selected !== undefined ? `${q.selected + 1}. ${q.options[q.selected]}` : 'Chưa chọn'}
                      </strong>
                    </div>
                    {!q.isCorrect && (
                      <div style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: 6 }}>
                        Đáp án đúng: <strong>{q.correctIndex + 1}. {q.options[q.correctIndex]}</strong>
                      </div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.1)', padding: 8, borderRadius: 6 }}>
                      💡 <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : currentQ ? (
            <div style={{ maxWidth: 750, margin: '0 auto' }}>
              {/* Question Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  {currentQ.sectionTitle} • {currentQ.mondai}
                </span>
                <button
                  onClick={() => toggleFlag(currentQ.id)}
                  style={{
                    background: flagged[currentQ.id] ? '#f59e0b' : 'rgba(51, 65, 85, 0.5)',
                    color: flagged[currentQ.id] ? '#fff' : '#94a3b8',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.85rem'
                  }}
                >
                  <Flag size={14} /> {flagged[currentQ.id] ? 'Đã đánh dấu cờ' : 'Đánh dấu xem lại'}
                </button>
              </div>

              {/* Instruction */}
              <div style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: 14 }}>
                {currentQ.instruction}
              </div>

              {/* Question Text */}
              <div style={{
                background: '#1e293b',
                padding: '24px 20px',
                borderRadius: 12,
                border: '1px solid #334155',
                fontSize: '1.25rem',
                lineHeight: 1.8,
                marginBottom: 24,
                whiteSpace: 'pre-line'
              }}>
                <FuriganaText text={currentQ.text} />
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 10,
                        border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                        background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                        color: isSelected ? '#38bdf8' : '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        cursor: 'pointer',
                        fontSize: '1.05rem',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: isSelected ? '2px solid #38bdf8' : '1px solid #64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}>
                        {optIdx + 1}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                  style={{
                    background: '#334155',
                    color: currentIdx === 0 ? '#64748b' : '#f8fafc',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 8,
                    cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <ArrowLeft size={16} /> Câu Trước
                </button>

                <button
                  disabled={currentIdx === allQuestions.length - 1}
                  onClick={() => setCurrentIdx(i => Math.min(allQuestions.length - 1, i + 1))}
                  style={{
                    background: '#2563eb',
                    color: currentIdx === allQuestions.length - 1 ? '#64748b' : '#fff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: 8,
                    cursor: currentIdx === allQuestions.length - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  Câu Tiếp <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Side: Answer Sheet Matrix (Phiếu trả lời) */}
        {!isSubmitted && (
          <aside style={{
            width: 280,
            borderLeft: '1px solid #334155',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>
              Phiếu Trả Lời ({Object.keys(userAnswers).length}/{allQuestions.length})
            </h3>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: '0.75rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 12, background: '#2563eb', borderRadius: 3 }}></div> Đã làm
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 12, background: '#f59e0b', borderRadius: 3 }}></div> Đánh dấu
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 12, background: '#334155', borderRadius: 3 }}></div> Chưa làm
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 8,
              overflowY: 'auto',
              flex: 1
            }}>
              {allQuestions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isFlagged = flagged[q.id];
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    style={{
                      aspectRatio: '1',
                      border: isCurrent ? '2px solid #38bdf8' : 'none',
                      background: isFlagged ? '#f59e0b' : isAnswered ? '#2563eb' : '#334155',
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

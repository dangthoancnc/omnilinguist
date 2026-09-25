import React, { useState, useMemo } from 'react';
import { Timer, Award, Clock, ArrowRight, Filter, Play } from 'lucide-react';
import CompactToolbar from './CompactToolbar';
import { getLevelBadgeStyle, JLPT_LEVEL_COLORS } from '../../theme';

/**
 * ExamGalleryView — 10-Year Past Exams Browser (2014–2024)
 * 63 real official exams for N3, N2, N1 with timed simulation
 */
export default function ExamGalleryView({
  exams = [],
  onStartExam,
  onBack,
}) {
  const [levelFilter, setLevelFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  // Filter exams
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (levelFilter !== 'all' && e.level !== levelFilter) return false;
      if (yearFilter !== 'all' && String(e.year) !== String(yearFilter)) return false;
      return true;
    });
  }, [exams, levelFilter, yearFilter]);

  const levels = [
    { id: 'all', label: 'Tất Cả Cấp Độ' },
    { id: 'N3', label: 'JLPT N3' },
    { id: 'N2', label: 'JLPT N2' },
    { id: 'N1', label: 'JLPT N1' },
  ];

  const years = ['all', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* 1. Compact Sticky Toolbar (48px) */}
      <CompactToolbar
        title="Bộ Đề Thi Thật JLPT 10 Năm (2014–2024)"
        subtitle={`${filteredExams.length} đề thi chuẩn hóa`}
        onBack={onBack}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="jlpt-view-toggle">
            {levels.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`jlpt-view-toggle-btn ${levelFilter === l.id ? 'jlpt-view-toggle-btn--active' : ''}`}
                onClick={() => setLevelFilter(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: 'var(--radius-xs, 6px)',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface-2)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả năm</option>
            {years.filter(y => y !== 'all').map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
        </div>
      </CompactToolbar>

      {/* 2. Exam Cards Grid */}
      <main style={{ padding: '20px', flex: 1 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '16px',
          maxWidth: '1380px',
          margin: '0 auto' 
        }}>
          {filteredExams.map((exam) => {
            const badgeStyle = getLevelBadgeStyle(exam.level);
            const accentColor = JLPT_LEVEL_COLORS[exam.level] || 'var(--accent-primary)';

            return (
              <article
                key={exam.id}
                className="jlpt-lesson-card"
                onClick={() => onStartExam(exam)}
                style={{ '--card-accent': accentColor }}
              >
                <div className="jlpt-card-header">
                  <span style={badgeStyle}>
                    {exam.level} • {exam.year}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {exam.sessionLabel}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.4 }}>
                    {exam.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {exam.totalTime} phút
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={13} />
                      Đỗ: {exam.passingScore}/180 điểm
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {exam.sections?.map((sec, sIdx) => (
                    <span 
                      key={sIdx}
                      style={{ 
                        fontSize: '11px', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        background: 'var(--bg-surface-2)', 
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-default)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {sec.title}
                    </span>
                  ))}
                </div>

                <div className="jlpt-card-footer">
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    Điểm liệt: &lt;{exam.sectionScoreDeadThreshold || 19}
                  </span>
                  <button
                    type="button"
                    className="ods-btn ods-btn-primary"
                    style={{ height: '30px', padding: '0 12px', fontSize: '12px' }}
                  >
                    <span>Vào phòng thi</span>
                    <Play size={12} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

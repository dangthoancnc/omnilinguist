import React, { useState, useMemo } from 'react';
import { Network, Search, Printer, BookOpen, Sparkles, ArrowRight, Layers } from 'lucide-react';
import CompactToolbar from './CompactToolbar';
import MindmapTreeView from './MindmapTreeView';
import { getLevelBadgeStyle, JLPT_LEVEL_COLORS } from '../../theme';

/**
 * MindmapExplorerView — Dedicated Mindmap Atlas & E-Book Studio
 * Comprehensive 120-lesson visual knowledge graph covering N5 through N1
 */
export default function MindmapExplorerView({
  allLessons = [],
  onSelectLesson,
  onBack,
}) {
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExportingEbook, setIsExportingEbook] = useState(false);

  const levels = [
    { id: 'N5', label: 'N5 (Bài 1–25)' },
    { id: 'N4', label: 'N4 (Bài 26–50)' },
    { id: 'N3', label: 'N3 (Bài 51–75)' },
    { id: 'N2', label: 'N2 (Bài 76–100)' },
    { id: 'N1', label: 'N1 (Bài 101–120)' },
  ];

  // Filter lessons for selected level
  const currentLevelLessons = useMemo(() => {
    return allLessons.filter(l => l.level === selectedLevel);
  }, [allLessons, selectedLevel]);

  // Global search across all 120 lessons
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return allLessons.filter(l => {
      const matchTitle = (l.title || '').toLowerCase().includes(q);
      const matchJp = (l.jpTitle || '').toLowerCase().includes(q);
      const matchVi = (l.viTitle || '').toLowerCase().includes(q);
      const matchPillar = (l.pillar || '').toLowerCase().includes(q);
      const matchBranches = l.mindmap?.branches?.some(b => 
        (b.name || '').toLowerCase().includes(q) || 
        (b.formula || '').toLowerCase().includes(q) ||
        (b.nuance || '').toLowerCase().includes(q)
      );
      const matchTraps = (l.mindmap?.trapRadar || '').toLowerCase().includes(q);
      return matchTitle || matchJp || matchVi || matchPillar || matchBranches || matchTraps;
    }).slice(0, 15);
  }, [allLessons, searchTerm]);

  const handlePrintEbook = () => {
    setIsExportingEbook(true);
    setTimeout(() => {
      window.print();
      setIsExportingEbook(false);
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* 1. Compact Sticky Toolbar (48px) */}
      <CompactToolbar
        title="Sơ đồ tư duy"
        subtitle="120 Bài Bản Lề N5–N1"
        onBack={onBack}
        actions={[
          {
            icon: <Printer size={16} />,
            title: 'Xuất bản E-Book PDF chuẩn A4',
            onClick: handlePrintEbook,
          }
        ]}
      >
        <div className="jlpt-view-toggle">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              className={`jlpt-view-toggle-btn ${selectedLevel === lvl.id ? 'jlpt-view-toggle-btn--active' : ''}`}
              onClick={() => {
                setSelectedLevel(lvl.id);
                setSearchTerm('');
              }}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </CompactToolbar>

      {/* 2. Top Search & Info Bar */}
      <div style={{ 
        padding: '12px 20px', 
        background: 'var(--bg-surface)', 
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search 
            size={14} 
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} 
          />
          <input
            type="text"
            placeholder="Tra cứu cấu trúc, ẩn dụ, bẫy thi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 30px',
              fontSize: '12px',
              borderRadius: 'var(--radius-xs, 6px)',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface-2)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Trình độ: <strong style={{ color: 'var(--text-primary)' }}>{selectedLevel}</strong> ({currentLevelLessons.length} bài học bản lề)
        </div>
      </div>

      {/* 3. Search Results Overlay (If user is searching) */}
      {searchTerm.trim() ? (
        <div style={{ padding: '20px', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Kết quả tra cứu nhanh ({searchResults.length} bài học):
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {searchResults.map((les) => (
              <div
                key={les.lessonNumber}
                className="jlpt-lesson-row"
                onClick={() => onSelectLesson(les)}
              >
                <div className="jlpt-lesson-row-left">
                  <span style={getLevelBadgeStyle(les.level)}>
                    {les.level} • 第{les.lessonNumber}課
                  </span>
                  <span className="jlpt-lesson-row-title-jp">{les.jpTitle}</span>
                  <span className="jlpt-lesson-row-title-vi">• {les.viTitle}</span>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--accent-primary)' }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 4. Interactive Level Mindmap Tree Canvas */
        <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MindmapTreeView
            lessons={currentLevelLessons}
            allLessons={allLessons}
            level={selectedLevel}
            mode="level"
            height={650}
            onSelectLesson={onSelectLesson}
          />
        </div>
      )}
    </div>
  );
}

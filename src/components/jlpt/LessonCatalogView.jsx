import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Layers, BookOpen, Sparkles, FolderTree } from 'lucide-react';
import LessonCard from './LessonCard';
import ViewModeToggle from './ViewModeToggle';
import MindmapTreeView from './MindmapTreeView';
import { getLevelBadgeStyle } from '../../theme';

/**
 * LessonCatalogView — Unified Catalog View for Minna & Foundation Tracks
 * Features:
 * - 4 View Modes: Grid Cards, Compact List, Chapter Tree, Level Mindmap
 * - Debounced instant search
 * - Group & level filtering
 * - Zero duplicated code between tracks
 */
export default function LessonCatalogView({
  lessons = [],
  level = 'N5',
  title = 'Danh Mục Bài Học',
  subtitle = '',
  filterOptions = [],
  onSelectLesson,
  onOpenMindmap,
}) {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('jlpt_catalog_view_mode') || 'grid';
  });

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Persist view mode
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('jlpt_catalog_view_mode', mode);
  };

  // Debounce search 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter((les) => {
      // Filter tab check
      if (activeFilter !== 'all') {
        if (activeFilter === 'n5' && les.level !== 'N5') return false;
        if (activeFilter === 'n4' && les.level !== 'N4') return false;
      }

      // Search check
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchTitle = (les.title || '').toLowerCase().includes(q);
        const matchJp = (les.jpTitle || '').toLowerCase().includes(q);
        const matchVi = (les.viTitle || '').toLowerCase().includes(q);
        const matchPillar = (les.pillar || '').toLowerCase().includes(q);
        const matchBranches = les.mindmap?.branches?.some(b => (b.name || '').toLowerCase().includes(q));
        const matchPoints = les.grammarPoints?.some(p => (p.pattern || '').toLowerCase().includes(q));
        if (!matchTitle && !matchJp && !matchVi && !matchPillar && !matchBranches && !matchPoints) {
          return false;
        }
      }

      return true;
    });
  }, [lessons, activeFilter, debouncedSearch]);

  // Group lessons for Tree View (groups of 10 or by level)
  const treeGroups = useMemo(() => {
    if (viewMode !== 'tree') return [];

    const groups = {};
    filteredLessons.forEach((l) => {
      const groupKey = l.level === 'N5' 
        ? (l.lessonNumber <= 12 ? 'N5: Nhập môn & Khởi đầu (Bài 1–12)' : 'N5: Phát triển cơ sở (Bài 13–25)')
        : l.level === 'N4'
        ? (l.lessonNumber <= 37 ? 'N4: Mở rộng thể câu (Bài 26–37)' : 'N4: Nâng cao & Ứng dụng (Bài 38–50)')
        : `${l.level}: Giáo trình bản lề`;

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(l);
    });

    return Object.entries(groups).map(([title, items]) => ({ title, items }));
  }, [filteredLessons, viewMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Search & Control Filter Bar */}
      <div style={{ 
        padding: '12px 16px', 
        background: 'var(--bg-surface)', 
        borderBottom: '1px solid var(--border-default)', 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '12px' 
      }}>
        {/* Left: Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {filterOptions.length > 0 ? (
            <div className="jlpt-view-toggle">
              {filterOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`jlpt-view-toggle-btn ${activeFilter === opt.id ? 'jlpt-view-toggle-btn--active' : ''}`}
                  onClick={() => setActiveFilter(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Hiển thị {filteredLessons.length} bài học
            </span>
          )}
        </div>

        {/* Right: Search Input + View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search 
              size={14} 
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} 
            />
            <input
              type="text"
              placeholder="Tìm bài học, ngữ pháp..."
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

          <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
        </div>
      </div>

      {/* Content Rendering based on View Mode */}
      <div style={{ flex: 1 }}>
        {filteredLessons.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Không tìm thấy bài học phù hợp</p>
            <p style={{ fontSize: '13px', margin: '4px 0 0' }}>Vui lòng thử tìm với từ khóa hoặc bộ lọc khác</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="jlpt-card-grid">
            {filteredLessons.map((les) => (
              <LessonCard
                key={les.lessonNumber}
                lesson={les}
                variant="grid"
                onSelect={onSelectLesson}
                onOpenMindmap={onOpenMindmap}
              />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="jlpt-card-list">
            {filteredLessons.map((les) => (
              <LessonCard
                key={les.lessonNumber}
                lesson={les}
                variant="list"
                onSelect={onSelectLesson}
                onOpenMindmap={onOpenMindmap}
              />
            ))}
          </div>
        ) : viewMode === 'tree' ? (
          <div className="jlpt-tree-container">
            {treeGroups.map((grp, gIdx) => (
              <div key={gIdx} className="jlpt-tree-group">
                <div className="jlpt-tree-group-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderTree size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span>{grp.title}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {grp.items.length} bài
                  </span>
                </div>
                <div className="jlpt-tree-group-items">
                  {grp.items.map((les) => (
                    <LessonCard
                      key={les.lessonNumber}
                      lesson={les}
                      variant="compact"
                      onSelect={onSelectLesson}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'mindmap' ? (
          <div style={{ padding: '16px' }}>
            <MindmapTreeView
              lessons={filteredLessons}
              level={level}
              mode="level"
              height={560}
              onSelectLesson={onSelectLesson}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

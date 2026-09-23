// src/components/StoryLibraryModal.jsx
// Dedicated Enterprise Reading Library Hub (Grid / Table / Accordion View Modes + Series Grouping)
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Search, X, Grid, List, Table as TableIcon, Layers, ChevronRight, 
  ChevronDown, CheckCircle, Clock, Filter, ArrowUpDown, Sparkles, Flag, 
  Eye, Play, ExternalLink, Bookmark, Hash, Compass, ArrowRight
} from 'lucide-react';
import { groupStoriesIntoSeries } from '../utils/seriesGrouper.js';
import { getStoryMangaArtwork } from '../data/mangaArtworks.jsx';

const LEVEL_COLORS = {
  N5: '#10b981',
  N4: '#3b82f6',
  N3: '#f59e0b',
  N2: '#8b5cf6',
  N1: '#ef4444'
};

const GENRES = [
  { id: 'ALL', label: 'Tất cả thể loại' },
  { id: 'ehon', label: '🎨 Sách Tranh Ehon' },
  { id: 'folktale', label: '🏛️ Cổ Tích & Dân Gian' },
  { id: 'literature', label: '📚 Văn Học' },
  { id: 'daily', label: '🌱 Đời Sống & Hội Thoại' },
  { id: 'culture', label: '⛩️ Văn Hóa Nhật Bản' },
  { id: 'business', label: '💼 Công Sở & Thương Mại' },
  { id: 'news', label: '📰 Tin Tức & Xã Hội' },
  { id: 'academic', label: '🎓 Tiểu Luận Học Thuật' },
];

export const StoryLibraryModal = ({
  isOpen,
  onClose,
  stories = [],
  activeStoryId = '',
  onSelectStory = () => {}
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'accordion'
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [genreFilter, setGenreFilter] = useState('ALL');
  const [formatFilter, setFormatFilter] = useState('ALL'); // 'ALL' | 'series' | 'single'
  const [sortBy, setSortBy] = useState('parts_desc'); // 'parts_desc' | 'level_asc' | 'level_desc' | 'title_asc'
  
  // Selected series for dedicated episode drawer/picker
  const [inspectSeries, setInspectSeries] = useState(null);
  
  // Set of expanded series in accordion view
  const [expandedSeriesKeys, setExpandedSeriesKeys] = useState(new Set());

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (inspectSeries) {
          setInspectSeries(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, inspectSeries, onClose]);

  // Group raw stories into structured series
  const allSeries = useMemo(() => {
    return groupStoriesIntoSeries(stories);
  }, [stories]);

  // Dynamic counts for levels
  const levelCounts = useMemo(() => {
    const counts = { ALL: allSeries.length, N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
    allSeries.forEach(s => {
      const lvl = s.level ? s.level.slice(0, 2) : 'N5';
      if (counts[lvl] !== undefined) counts[lvl]++;
    });
    return counts;
  }, [allSeries]);

  // Filter and sort series
  const filteredSeries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allSeries.filter(series => {
      // Level filter
      if (levelFilter !== 'ALL' && !series.level?.includes(levelFilter)) {
        return false;
      }

      // Format filter (Series vs Single)
      if (formatFilter === 'series' && series.totalParts <= 1) return false;
      if (formatFilter === 'single' && series.totalParts > 1) return false;

      // Genre filter
      if (genreFilter !== 'ALL') {
        if (genreFilter === 'ehon' && !(series.genre === 'ehon' || series.genreLabel?.includes('Ehon') || series.genreLabel?.includes('Tranh'))) {
          return false;
        }
        if (genreFilter === 'folktale' && !(series.genre === 'folktale' || series.genreLabel?.includes('Cổ tích') || series.genreLabel?.includes('Dân gian'))) {
          return false;
        }
        if (genreFilter === 'business' && !(series.genre === 'business' || series.genreLabel?.includes('Công sở') || series.genreLabel?.includes('Thương mại'))) {
          return false;
        }
        if (genreFilter === 'literature' && !(series.genre === 'literature' || series.genreLabel?.includes('Văn học'))) {
          return false;
        }
        if (genreFilter === 'news' && !(series.genre === 'news' || series.genreLabel?.includes('Thời sự') || series.genreLabel?.includes('Tin tức'))) {
          return false;
        }
        if (genreFilter === 'culture' && !(series.genre === 'culture' || series.genreLabel?.includes('Văn hóa'))) {
          return false;
        }
      }

      // Search query
      if (q) {
        const matchTitle = series.title?.toLowerCase().includes(q);
        const matchAuthor = series.author?.toLowerCase().includes(q);
        const matchSummary = series.summary?.toLowerCase().includes(q);
        const matchParts = series.parts.some(p => p.title?.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthor && !matchSummary && !matchParts) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'parts_desc') {
        return b.totalParts - a.totalParts;
      }
      if (sortBy === 'level_asc') {
        const order = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
        return (order[a.level?.slice(0, 2)] || 99) - (order[b.level?.slice(0, 2)] || 99);
      }
      if (sortBy === 'level_desc') {
        const order = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
        return (order[b.level?.slice(0, 2)] || 99) - (order[a.level?.slice(0, 2)] || 99);
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  }, [allSeries, searchQuery, levelFilter, genreFilter, formatFilter, sortBy]);

  if (!isOpen) return null;

  const toggleAccordion = (seriesKey) => {
    setExpandedSeriesKeys(prev => {
      const next = new Set(prev);
      if (next.has(seriesKey)) {
        next.delete(seriesKey);
      } else {
        next.add(seriesKey);
      }
      return next;
    });
  };

  const handleReadPart = (part) => {
    if (part.isChapterOfBook) {
      onSelectStory(part.bookId, part.chapterIndex);
    } else {
      onSelectStory(part.id);
    }
    setInspectSeries(null);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      {/* Modal Container */}
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 1380,
          height: '92vh',
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border-strong)',
          borderRadius: 20,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 1. TOP HEADER & VIEW MODE CONTROLS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          background: 'var(--bg-elevated)'
        }}>
          {/* Title & Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--accent-primary, #3b82f6) 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 3px 12px rgba(59,130,246,0.3)'
            }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.3 }}>
                  Thư Viện Tác Phẩm & Kho Bộ Truyện
                </h2>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent-primary)',
                  padding: '2px 10px',
                  borderRadius: 20,
                  border: '1px solid var(--glass-border)'
                }}>
                  {allSeries.length} Bộ truyện · {stories.length} Phân đoạn
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                Đã phân nhóm và sắp xếp thứ tự chuẩn từng phần · Hỗ trợ tra từ, song ngữ & phát âm AI
              </p>
            </div>
          </div>

          {/* Right Controls: View Mode Switcher + Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* View Mode Switcher */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 10,
              padding: 3,
              gap: 2
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 7,
                  fontSize: '0.8rem',
                  fontWeight: viewMode === 'grid' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: viewMode === 'grid' ? 'var(--accent-primary)' : 'transparent',
                  color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s'
                }}
                title="Hiển thị dạng Lưới Thẻ Bìa (Grid Cards)"
              >
                <Grid size={15} /> Lưới Thẻ
              </button>

              <button
                onClick={() => setViewMode('table')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 7,
                  fontSize: '0.8rem',
                  fontWeight: viewMode === 'table' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: viewMode === 'table' ? 'var(--accent-primary)' : 'transparent',
                  color: viewMode === 'table' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s'
                }}
                title="Hiển thị dạng Bảng Dữ Liệu Enterprise (Data Table)"
              >
                <TableIcon size={15} /> Bảng Dữ Liệu
              </button>

              <button
                onClick={() => setViewMode('accordion')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 7,
                  fontSize: '0.8rem',
                  fontWeight: viewMode === 'accordion' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: viewMode === 'accordion' ? 'var(--accent-primary)' : 'transparent',
                  color: viewMode === 'accordion' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s'
                }}
                title="Hiển thị dạng Thẻ Xổ Xuống (Accordion)"
              >
                <Layers size={15} /> Thẻ Mở Rộng
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-hover)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '7px 10px',
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}
              title="Đóng Thư Viện (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 2. FACETED FILTERS & SEARCH CONTROLS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          background: 'var(--bg-surface)'
        }}>
          {/* Top Search & Sorters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 320px' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Tìm tác phẩm theo tên tiếng Nhật, phụ đề tiếng Việt, tác giả..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 34px 9px 38px',
                  borderRadius: 10,
                  fontSize: '0.86rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--glass-border-strong)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: 4
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Format Filter: All vs Series vs Single */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              borderRadius: 8,
              padding: 2,
              gap: 2
            }}>
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'series', label: '📚 Bộ Nhiều Phần' },
                { id: 'single', label: '📄 Truyện Đơn' }
              ].map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => setFormatFilter(fmt.id)}
                  style={{
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: formatFilter === fmt.id ? 700 : 500,
                    cursor: 'pointer',
                    background: formatFilter === fmt.id ? 'var(--accent-subtle)' : 'transparent',
                    color: formatFilter === fmt.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.15s'
                  }}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowUpDown size={14} color="var(--text-tertiary)" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="parts_desc">Số phần: Nhiều nhất trước</option>
                <option value="level_asc">Cấp độ: N5 ➔ N1</option>
                <option value="level_desc">Cấp độ: N1 ➔ N5</option>
                <option value="title_asc">Tên tác phẩm: A ➔ Z</option>
              </select>
            </div>
          </div>

          {/* Level Filter Pills & Genre Pills Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            {/* Level Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 700, marginRight: 4, textTransform: 'uppercase' }}>
                Cấp độ:
              </span>
              {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => {
                const isSel = levelFilter === lvl;
                const col = LEVEL_COLORS[lvl] || 'var(--accent-primary)';
                return (
                  <button
                    key={lvl}
                    onClick={() => setLevelFilter(lvl)}
                    style={{
                      border: `1px solid ${isSel ? col : 'var(--glass-border)'}`,
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: '0.74rem',
                      fontWeight: isSel ? 800 : 500,
                      cursor: 'pointer',
                      background: isSel ? `${col}22` : 'var(--bg-card)',
                      color: isSel ? col : 'var(--text-secondary)',
                      transition: 'all 0.15s'
                    }}
                  >
                    {lvl === 'ALL' ? 'Tất cả' : lvl} ({levelCounts[lvl] || 0})
                  </button>
                );
              })}
            </div>

            {/* Genre Pills */}
            <div style={{ display: 'flex', gap: 5, overflowX: 'auto', maxWidth: '60%', scrollbarWidth: 'none' }}>
              {GENRES.map(g => {
                const isSel = genreFilter === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGenreFilter(g.id)}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: '0.73rem',
                      fontWeight: isSel ? 700 : 500,
                      cursor: 'pointer',
                      border: isSel ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                      background: isSel ? 'var(--accent-subtle)' : 'var(--bg-card)',
                      color: isSel ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      flexShrink: 0,
                      transition: 'all 0.15s'
                    }}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 3. CONTENT VIEW AREA (GRID / TABLE / ACCORDION) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          
          {filteredSeries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
              <h3 style={{ margin: '0 0 6px', color: 'var(--text-primary)' }}>Không tìm thấy tác phẩm phù hợp</h3>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Hãy thử điều chỉnh từ khóa tìm kiếm hoặc chọn cấp độ / thể loại khác.</p>
            </div>
          ) : viewMode === 'grid' ? (
            
            /* ── VIEW 1: GRID CARDS ── */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 18
            }}>
              {filteredSeries.map(series => {
                const lvlColor = LEVEL_COLORS[series.level?.slice(0, 2)] || '#3b82f6';
                const hasActivePart = series.parts.some(p => p.id === activeStoryId);
                const coverImg = series.coverArtwork || getStoryMangaArtwork(series)?.imageUrl;
                const isEhon = series.genre === 'ehon' || series.genreLabel?.includes('Ehon') || series.genreLabel?.includes('Tranh');

                return (
                  <div
                    key={series.seriesKey}
                    className="glass-panel"
                    style={{
                      borderRadius: 16,
                      background: 'var(--bg-surface)',
                      border: `1.5px solid ${hasActivePart ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: hasActivePart ? '0 4px 18px rgba(59,130,246,0.18)' : '0 2px 8px rgba(0,0,0,0.06)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setInspectSeries(series)}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = lvlColor;
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = `0 10px 24px ${lvlColor}22`;
                      const img = e.currentTarget.querySelector('.story-card-cover-img');
                      if (img) img.style.transform = 'scale(1.04)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = hasActivePart ? 'var(--accent-primary)' : 'var(--glass-border)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = hasActivePart ? '0 4px 18px rgba(59,130,246,0.18)' : '0 2px 8px rgba(0,0,0,0.06)';
                      const img = e.currentTarget.querySelector('.story-card-cover-img');
                      if (img) img.style.transform = 'scale(1)';
                    }}
                  >
                    {/* Visual Book Cover Banner */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: 180,
                      overflow: 'hidden',
                      background: `linear-gradient(135deg, ${lvlColor}25 0%, var(--bg-card) 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid var(--glass-border)'
                    }}>
                      {coverImg ? (
                        <img 
                          src={coverImg} 
                          alt={series.title}
                          loading="lazy"
                          className="story-card-cover-img"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                      ) : (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          color: lvlColor
                        }}>
                          <BookOpen size={42} strokeWidth={1.6} />
                          <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>OmniLinguist Reader</span>
                        </div>
                      )}

                      {/* Vignette Overlay for Badges & Title Readability */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)',
                        pointerEvents: 'none'
                      }} />

                      {/* Top Badges */}
                      <div style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        right: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 2
                      }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 9px',
                          borderRadius: 6,
                          background: lvlColor,
                          color: '#fff',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                          letterSpacing: 0.5
                        }}>
                          {series.level || 'N5'}
                        </span>

                        <div style={{ display: 'flex', gap: 6 }}>
                          {isEhon && (
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: '#ec4899',
                              color: '#fff',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                            }}>
                              🎨 Ehon
                            </span>
                          )}

                          {series.totalParts > 1 ? (
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: 'rgba(37,99,235,0.92)',
                              color: '#fff',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <Layers size={11} /> {series.totalParts} tập
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '3px 7px',
                              borderRadius: 6,
                              background: 'rgba(15,23,42,0.7)',
                              backdropFilter: 'blur(4px)',
                              color: '#f8fafc',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}>
                              Đơn lẻ
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom-left Genre Chip */}
                      <div style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 10,
                        zIndex: 2
                      }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 5,
                          background: 'rgba(0,0,0,0.65)',
                          backdropFilter: 'blur(4px)',
                          color: '#f1f5f9',
                          border: '1px solid rgba(255,255,255,0.15)'
                        }}>
                          {series.genreLabel || 'Bài đọc'}
                        </span>
                      </div>
                    </div>

                    {/* Card Title Header */}
                    <div style={{
                      padding: '12px 16px 10px',
                      borderBottom: '1px solid var(--glass-border)',
                      background: 'var(--bg-card)'
                    }}>
                      <div style={{ 
                        fontSize: '0.98rem', 
                        fontWeight: 800, 
                        color: 'var(--text-primary)',
                        lineHeight: 1.35,
                        wordBreak: 'break-word',
                        marginBottom: 4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {series.parsedTitle?.main || series.title}
                      </div>

                      {series.parsedTitle?.sub && (
                        <div style={{ 
                          fontSize: '0.78rem', 
                          color: 'var(--text-secondary)',
                          lineHeight: 1.3,
                          wordBreak: 'break-word',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {series.parsedTitle.sub}
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '14px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 8, flexWrap: 'wrap' }}>
                          {series.genreLabel && (
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {series.genreLabel}
                            </span>
                          )}
                          <span>•</span>
                          <span>⏱️ {series.readingTime}</span>
                        </div>

                        {series.summary && (
                          <p style={{
                            margin: 0,
                            fontSize: '0.78rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {series.summary}
                          </p>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div style={{ paddingTop: 10, borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        {series.totalParts > 1 ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReadPart(series.parts[0]);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '5px 10px', fontSize: '0.74rem', borderRadius: 7 }}
                              title="Bắt đầu đọc từ Tập 1"
                            >
                              Đọc Tập 1
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectSeries(series);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '5px 12px', fontSize: '0.74rem', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              Xem {series.totalParts} tập <ChevronRight size={13} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReadPart(series.parts[0]);
                            }}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '6px 12px', fontSize: '0.78rem', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          >
                            Đọc tác phẩm ngay <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          ) : viewMode === 'table' ? (

            /* ── VIEW 2: DATA TABLE VIEW ── */
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 14,
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <th style={{ padding: '12px 16px' }}>Tác Phẩm / Bộ Truyện</th>
                    <th style={{ padding: '12px 14px' }}>Quy Mô</th>
                    <th style={{ padding: '12px 14px' }}>Cấp Độ</th>
                    <th style={{ padding: '12px 14px' }}>Thể Loại</th>
                    <th style={{ padding: '12px 14px' }}>Tác Giả</th>
                    <th style={{ padding: '12px 14px' }}>Thời Lượng</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSeries.map((series, idx) => {
                    const lvlColor = LEVEL_COLORS[series.level?.slice(0, 2)] || '#3b82f6';
                    const coverImg = series.coverArtwork || getStoryMangaArtwork(series)?.imageUrl;
                    return (
                      <tr 
                        key={series.seriesKey}
                        onClick={() => setInspectSeries(series)}
                        style={{
                          borderBottom: '1px solid var(--glass-border)',
                          cursor: 'pointer',
                          background: idx % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'var(--bg-card)'}
                      >
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 44,
                              height: 56,
                              borderRadius: 8,
                              overflow: 'hidden',
                              background: 'var(--bg-elevated)',
                              flexShrink: 0,
                              border: '1px solid var(--glass-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              {coverImg ? (
                                <img 
                                  src={coverImg} 
                                  alt={series.title} 
                                  loading="lazy"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                              ) : (
                                <BookOpen size={20} color={lvlColor} />
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                                {series.parsedTitle?.main || series.title}
                              </div>
                              {series.parsedTitle?.sub && (
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                                  {series.parsedTitle.sub}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          {series.totalParts > 1 ? (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: 'rgba(59,130,246,0.15)',
                              color: 'var(--accent-primary)',
                              whiteSpace: 'nowrap'
                            }}>
                              Bộ {series.totalParts} tập
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>1 tập</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: `${lvlColor}22`,
                            color: lvlColor,
                            border: `1px solid ${lvlColor}44`
                          }}>
                            {series.level || 'N5'}
                          </span>
                        </td>

                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                          {series.genreLabel || 'Bài đọc'}
                        </td>

                        <td style={{ padding: '12px 14px', color: 'var(--text-tertiary)', fontSize: '0.76rem' }}>
                          {series.author || 'Tác giả Nhật'}
                        </td>

                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                          {series.readingTime}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {series.totalParts > 1 ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectSeries(series);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.74rem', borderRadius: 6 }}
                            >
                              Chọn tập ({series.totalParts})
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReadPart(series.parts[0]);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.74rem', borderRadius: 6 }}
                            >
                              Đọc ngay
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          ) : (

            /* ── VIEW 3: ACCORDION EXPANDABLE VIEW ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredSeries.map(series => {
                const isExpanded = expandedSeriesKeys.has(series.seriesKey);
                const lvlColor = LEVEL_COLORS[series.level?.slice(0, 2)] || '#3b82f6';

                return (
                  <div
                    key={series.seriesKey}
                    className="glass-panel"
                    style={{
                      borderRadius: 14,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--glass-border)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleAccordion(series.seriesKey)}
                      style={{
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: isExpanded ? 'var(--bg-elevated)' : 'transparent',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: lvlColor,
                          color: '#fff'
                        }}>
                          {series.level}
                        </span>

                        <div>
                          <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {series.parsedTitle?.main || series.title}
                          </span>
                          {series.parsedTitle?.sub && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 8 }}>
                              ({series.parsedTitle.sub})
                            </span>
                          )}
                        </div>

                        {series.totalParts > 1 && (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'rgba(59,130,246,0.15)',
                            color: 'var(--accent-primary)'
                          }}>
                            {series.totalParts} tập
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                          {series.readingTime}
                        </span>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </div>

                    {/* Accordion Body: Episodes List */}
                    {isExpanded && (
                      <div style={{
                        padding: '12px 18px',
                        background: 'var(--bg-card)',
                        borderTop: '1px solid var(--glass-border)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: 8
                      }}>
                        {series.parts.map((part, idx) => (
                          <div
                            key={part.id || idx}
                            onClick={() => handleReadPart(part)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 8,
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--glass-border)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                                Tập {part.partNumber || idx + 1}
                              </div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {part.title}
                              </div>
                            </div>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '3px 8px', fontSize: '0.7rem', borderRadius: 6, flexShrink: 0 }}
                            >
                              Đọc
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 4. DEDICATED EPISODE PICKER MODAL (WHEN A SERIES IS CLICKED) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {inspectSeries && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 20
          }}>
            <div 
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: 780,
                maxHeight: '85vh',
                background: 'var(--bg-surface)',
                border: '1px solid var(--glass-border-strong)',
                borderRadius: 18,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                background: 'var(--bg-elevated)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                  {/* Book Cover Thumbnail */}
                  <div style={{
                    width: 64,
                    height: 82,
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: 'var(--bg-surface)',
                    border: '1.5px solid var(--glass-border)',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {(inspectSeries.coverArtwork || getStoryMangaArtwork(inspectSeries)?.imageUrl) ? (
                      <img 
                        src={inspectSeries.coverArtwork || getStoryMangaArtwork(inspectSeries)?.imageUrl} 
                        alt={inspectSeries.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <BookOpen size={24} color={LEVEL_COLORS[inspectSeries.level?.slice(0, 2)] || '#3b82f6'} />
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: LEVEL_COLORS[inspectSeries.level?.slice(0, 2)] || '#3b82f6',
                        color: '#fff'
                      }}>
                        {inspectSeries.level}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {inspectSeries.genreLabel} • Tổng {inspectSeries.totalParts} tập
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {inspectSeries.parsedTitle?.main || inspectSeries.title}
                    </h3>
                    {inspectSeries.parsedTitle?.sub && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {inspectSeries.parsedTitle.sub}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setInspectSeries(null)}
                  style={{
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: 8,
                    flexShrink: 0
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Summary */}
              {inspectSeries.summary && (
                <div style={{ padding: '12px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {inspectSeries.summary}
                </div>
              )}

              {/* Episodes List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Danh Sách Các Tập Theo Thứ Tự Đọc ({inspectSeries.parts.length} Tập)
                </div>

                {inspectSeries.parts.map((part, idx) => {
                  const isActive = part.id === activeStoryId;
                  return (
                    <div
                      key={part.id || idx}
                      onClick={() => handleReadPart(part)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: isActive ? 'var(--accent-subtle)' : 'var(--bg-card)',
                        border: `1.5px solid ${isActive ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => !isActive && (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                      onMouseLeave={e => !isActive && (e.currentTarget.style.borderColor = 'var(--glass-border)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: isActive ? 'var(--accent-primary)' : 'var(--bg-surface)',
                          color: isActive ? '#fff' : 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          flexShrink: 0
                        }}>
                          {part.partNumber || idx + 1}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {part.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                            ⏱️ {part.readingTime || '2 phút'} • {part.wordCount ? `${part.wordCount} ký tự` : 'Chuẩn Krashen SLA'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {isActive && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                            ● Đang đọc
                          </span>
                        )}
                        <button
                          className="btn btn-primary"
                          style={{ padding: '5px 12px', fontSize: '0.76rem', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          Đọc tập này <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StoryLibraryModal;

// src/components/jlpt/MindmapAtlasModal.jsx
// Đại Bách Khoa Sơ Đồ Tư Duy Mindmap Toàn Thư (N5 - N1)
// Quản lý 120 trang Mindmap liên hoàn & Bộ công cụ đóng gói Sách E-Book PDF

import React, { useState, useMemo } from 'react';
import { 
  X, Search, BookOpen, Layers, Printer, Award, 
  Sparkles, Filter, Eye, ChevronRight, Download, Check
} from 'lucide-react';
import MindmapCanvasModal from './MindmapCanvasModal';

export default function MindmapAtlasModal({ allLessons = [], onClose }) {
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMindmapLesson, setActiveMindmapLesson] = useState(null);
  const [isBookPrintMode, setIsBookPrintMode] = useState(false);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return allLessons.filter(l => {
      if (levelFilter !== 'all' && l.level !== levelFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inTitle = l.title.toLowerCase().includes(q) || l.jpTitle.toLowerCase().includes(q) || l.viTitle.toLowerCase().includes(q);
        const inPillar = l.pillar && l.pillar.toLowerCase().includes(q);
        const inBranches = l.mindmap?.branches?.some(b => b.name?.toLowerCase().includes(q));
        return inTitle || inPillar || inBranches;
      }
      return true;
    });
  }, [allLessons, levelFilter, searchQuery]);

  const getLevelBadge = (lvl) => {
    switch (lvl) {
      case 'N5': return { bg: '#10b981', text: '#fff' };
      case 'N4': return { bg: '#06b6d4', text: '#fff' };
      case 'N3': return { bg: '#f59e0b', text: '#fff' };
      case 'N2': return { bg: '#8b5cf6', text: '#fff' };
      case 'N1': return { bg: '#ef4444', text: '#fff' };
      default: return { bg: '#3b82f6', text: '#fff' };
    }
  };

  const handlePrintFullBook = () => {
    setIsBookPrintMode(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9990,
      background: 'rgba(10, 15, 29, 0.96)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc'
    }}>
      {/* Top Navigation Bar */}
      <div style={{
        padding: '18px 32px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(236, 72, 153, 0.4)'
          }}>
            <BookOpen size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                🗺️ ĐẠI BÁCH KHOA SƠ ĐỒ TƯ DUY TOÀN DIỆN (N5 – N1)
              </h2>
              <span style={{
                background: 'rgba(236, 72, 153, 0.2)',
                color: '#f472b6',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 12
              }}>
                120 BÀI LIÊN HOÀN
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Trọn bộ sơ đồ tư duy Mindmap AI cô đọng khoa học từ con số 0 đến Thượng cấp bản ngữ.
            </div>
          </div>
        </div>

        {/* Global Book Export & Close Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handlePrintFullBook}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}
          >
            <Printer size={18} />
            Xuất Bản Sách E-Book (In PDF Toàn Bộ 120 Bài)
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              width: 40,
              height: 40,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        padding: '14px 32px',
        background: 'rgba(30, 41, 59, 0.6)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Level Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tất Cả 120 Bài' },
            { id: 'N5', label: 'N5 (Bài 1–25)' },
            { id: 'N4', label: 'N4 (Bài 26–50)' },
            { id: 'N3', label: 'N3 (Bài 51–75)' },
            { id: 'N2', label: 'N2 (Bài 76–100)' },
            { id: 'N1', label: 'N1 (Bài 101–120)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setLevelFilter(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                background: levelFilter === tab.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.06)',
                color: levelFilter === tab.id ? '#0f172a' : '#cbd5e1',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: 320 }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài, ngữ pháp, mẫu câu..."
            style={{
              width: '100%',
              padding: '8px 14px 8px 36px',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Main Grid View of 120 Mindmap Cards */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '28px 32px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 20
        }}>
          {filteredLessons.map(l => {
            const badge = getLevelBadge(l.level);
            const branchCount = l.mindmap?.branches?.length || 0;
            return (
              <div
                key={l.lessonNumber}
                onClick={() => setActiveMindmapLesson(l)}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 14,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#38bdf8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(56, 189, 248, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: badge.bg,
                      color: badge.text,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 12
                    }}>
                      {l.level}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                      第{l.lessonNumber}課
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {branchCount} nhánh Mindmap
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>
                    {l.jpTitle}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {l.viTitle}
                  </div>
                </div>

                {/* Branches Preview Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {l.mindmap?.branches?.slice(0, 3).map((b, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: `1px solid ${b.color || '#38bdf8'}55`,
                        color: b.color || '#38bdf8',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6
                      }}
                    >
                      {b.name}
                    </span>
                  ))}
                  {branchCount > 3 && (
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '2px 4px' }}>
                      +{branchCount - 3} nữa
                    </span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: 8,
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Trụ cột: {l.pillar}
                  </span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: '#38bdf8',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    <Eye size={14} /> Mở Bản Đồ
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub-modal: Individual Mindmap Canvas */}
      {activeMindmapLesson && (
        <MindmapCanvasModal
          lesson={activeMindmapLesson}
          onClose={() => setActiveMindmapLesson(null)}
        />
      )}
    </div>
  );
}

// src/components/jlpt/MindmapAtlasModal.jsx
// ĐẠI BÁCH KHOA SƠ ĐỒ TƯ DUY TOÀN THƯ (N5 – N1)
// Quản lý 120 trang Mindmap Sketchnote liên hoàn & Bộ công cụ Xuất Bản Sách E-Book PDF

import React, { useState, useMemo } from 'react';
import { 
  X, Search, BookOpen, Layers, Printer, Award, 
  Sparkles, Filter, Eye, ChevronRight, Download, Check,
  ArrowLeft, FileText, Compass, Lightbulb, ShieldAlert,
  Calendar, CheckCircle2, Star
} from 'lucide-react';
import MindmapCanvasModal from './MindmapCanvasModal';
import FuriganaText from '../FuriganaText';

export default function MindmapAtlasModal({ allLessons = [], onClose }) {
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMindmapLesson, setActiveMindmapLesson] = useState(null);
  const [isBookPrintMode, setIsBookPrintMode] = useState(false);
  const [bookScope, setBookScope] = useState('filtered'); // 'filtered' | 'all'

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return allLessons.filter(l => {
      if (levelFilter !== 'all' && l.level !== levelFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inTitle = (l.title || '').toLowerCase().includes(q) || 
                        (l.jpTitle || '').toLowerCase().includes(q) || 
                        (l.viTitle || '').toLowerCase().includes(q);
        const inPillar = l.pillar && l.pillar.toLowerCase().includes(q);
        const inBranches = l.mindmap?.branches?.some(b => 
          (b.name || '').toLowerCase().includes(q) || 
          (b.nuance || '').toLowerCase().includes(q) ||
          (b.metaphor || '').toLowerCase().includes(q)
        );
        const inTrap = l.mindmap?.trapRadar && l.mindmap.trapRadar.toLowerCase().includes(q);
        return inTitle || inPillar || inBranches || inTrap;
      }
      return true;
    });
  }, [allLessons, levelFilter, searchQuery]);

  // Lessons to print in Book Mode
  const bookLessons = useMemo(() => {
    if (bookScope === 'all') return allLessons;
    return filteredLessons;
  }, [bookScope, allLessons, filteredLessons]);

  const getLevelBadge = (lvl) => {
    switch (lvl) {
      case 'N5': return { bg: '#10b981', border: '#34d399', text: '#fff' };
      case 'N4': return { bg: '#06b6d4', border: '#22d3ee', text: '#fff' };
      case 'N3': return { bg: '#f59e0b', border: '#fbbf24', text: '#fff' };
      case 'N2': return { bg: '#8b5cf6', border: '#a78bfa', text: '#fff' };
      case 'N1': return { bg: '#ef4444', border: '#f87171', text: '#fff' };
      default: return { bg: '#3b82f6', border: '#60a5fa', text: '#fff' };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9990,
      background: 'rgba(10, 15, 29, 0.97)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc',
      fontFamily: `'Noto Sans JP', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
    }}>
      {/* Print Styles for E-Book Generation */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ebook-print-container, #ebook-print-container * {
            visibility: visible;
          }
          #ebook-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            display: block !important;
          }
          .ebook-page {
            page-break-after: always !important;
            break-after: page !important;
            padding: 30px !important;
            min-height: 98vh !important;
            box-sizing: border-box !important;
          }
          .no-print-bar {
            display: none !important;
          }
        }
      `}</style>

      {/* ======================================================== */}
      {/* MODE 1: BOOK PRINT / E-BOOK EXPORT PREVIEW               */}
      {/* ======================================================== */}
      {isBookPrintMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Top Floating Control Bar (No Print) */}
          <div className="no-print-bar" style={{
            padding: '14px 28px',
            background: 'rgba(15, 23, 42, 0.96)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setIsBookPrintMode(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={16} /> Quay Lại Bộ Sưu Tập
              </button>

              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                  📖 Chế Độ Xuất Bản Sách E-Book Mindmap (PDF / A4)
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Đang chuẩn bị xuất bản {bookLessons.length} trang sơ đồ Sketchnote chuẩn in ấn.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Scope filter */}
              <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.8)', borderRadius: 8, padding: 3 }}>
                <button
                  onClick={() => setBookScope('filtered')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: bookScope === 'filtered' ? '#38bdf8' : 'transparent',
                    color: bookScope === 'filtered' ? '#0f172a' : '#cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Theo bộ lọc ({filteredLessons.length} bài)
                </button>
                <button
                  onClick={() => setBookScope('all')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: bookScope === 'all' ? '#38bdf8' : 'transparent',
                    color: bookScope === 'all' ? '#0f172a' : '#cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Toàn bộ 120 bài (Trọn bộ)
                </button>
              </div>

              {/* Print Action */}
              <button
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Printer size={16} />
                In Sách / Lưu PDF Ngay
              </button>

              <button
                onClick={() => setIsBookPrintMode(false)}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Book Pages Container (Scrollable Preview & Print Root) */}
          <div style={{ flex: 1, overflow: 'auto', background: '#334155', padding: '30px 20px' }}>
            <div id="ebook-print-container" style={{ maxWidth: 960, margin: '0 auto', background: '#fff', color: '#0f172a', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              {/* E-BOOK COVER PAGE */}
              <div className="ebook-page" style={{
                background: 'linear-gradient(135deg, #fff7ed 0%, #fef2f2 50%, #fdf4ff 100%)',
                border: '12px double #f43f5e',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '60px 40px'
              }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>
                  🌸 🍵 🥷 ⚡ 🌟
                </div>
                <div style={{
                  background: '#f43f5e',
                  color: '#fff',
                  padding: '6px 20px',
                  borderRadius: 30,
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: 20
                }}>
                  SAKURA SKETCHNOTE MASTER ATLAS
                </div>
                <h1 style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: '#881337',
                  margin: '0 0 10px',
                  lineHeight: 1.2
                }}>
                  ĐẠI BÁCH KHOA SƠ ĐỒ TƯ DUY TIẾNG NHẬT
                </h1>
                <h2 style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#e11d48',
                  margin: '0 0 20px'
                }}>
                  HỆ THỐNG 120 BÀI BẢN LỀ LIÊN HOÀN (N5 → N1)
                </h2>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#475569',
                  fontFamily: `'Noto Sans JP', sans-serif`,
                  marginBottom: 30
                }}>
                  日本語文法マインドマップ完全攻略全書
                </div>

                <div style={{
                  maxWidth: 620,
                  background: '#ffffff',
                  border: '2px dashed #fda4af',
                  borderRadius: 16,
                  padding: '20px 24px',
                  fontSize: '0.9rem',
                  color: '#334155',
                  lineHeight: 1.6,
                  marginBottom: 40
                }}>
                  <p style={{ margin: '0 0 10px', fontWeight: 700 }}>
                    💡 <strong>Giá trị cốt lõi của bộ sách Sơ Đồ Tư Duy Sketchnote:</strong>
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 20, textAlign: 'left' }}>
                    <li><strong>Linh vật & Ẩn dụ trực quan:</strong> Biến ngữ pháp khô khan thành hình ảnh sống động dễ khắc sâu.</li>
                    <li><strong>3 Vùng Tiếp Hợp Synapse:</strong> Rễ cây cội nguồn (bài trước) → Thân cành trọng tâm → Khiên bẫy & Chồi non (bước nhảy tiếp theo).</li>
                    <li><strong>Mẹo ghi nhớ 3 giây:</strong> Giúp học viên phản xạ tức thì trong kỳ thi JLPT thực chiến.</li>
                    <li><strong>Bao phủ 100% lộ trình:</strong> 50 bài Minna no Nihongo (N5-N4) + 70 bài trung thượng cấp (N3-N2-N1).</li>
                  </ul>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  Xuất bản bởi OmniLinguist JLPT Master Dojo • Bản quyền Giáo trình Sketchnote Quốc Dân
                </div>
              </div>

              {/* TABLE OF CONTENTS PAGE */}
              <div className="ebook-page" style={{ padding: '40px 50px' }}>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  color: '#881337',
                  borderBottom: '3px solid #f43f5e',
                  paddingBottom: 10,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <span>📑</span> MỤC LỤC TRA CỨU NHANH ({bookLessons.length} BÀI HỌC)
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px 30px',
                  fontSize: '0.82rem'
                }}>
                  {bookLessons.map((l, idx) => (
                    <div
                      key={l.lessonNumber}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        borderBottom: '1px dotted #cbd5e1'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: '#f1f5f9',
                          color: '#475569'
                        }}>
                          {l.level}
                        </span>
                        <span>{l.mindmap?.mascotIcon || '🌸'}</span>
                        <strong style={{ color: '#0f172a' }}>第{l.lessonNumber}課:</strong>
                        <span style={{ color: '#334155' }}>{l.jpTitle}</span>
                      </span>
                      <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem' }}>
                        Trang {idx + 3}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 120 DETAILED SKETCHNOTE PAGES */}
              {bookLessons.map((l, pageIdx) => {
                const bList = l.mindmap?.branches || [];
                const mascot = l.mindmap?.mascotIcon || '🌸';
                const lvl = getLevelBadge(l.level);

                return (
                  <div
                    key={l.lessonNumber}
                    className="ebook-page"
                    style={{
                      background: '#fffdfa',
                      padding: '36px 40px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16
                    }}
                  >
                    {/* Header: Lesson Title & Mascot */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: `2px solid ${lvl.bg}`,
                      paddingBottom: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          fontSize: '2rem',
                          background: '#fff1f2',
                          border: `2px dashed ${lvl.bg}`,
                          borderRadius: '50%',
                          width: 48,
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {mascot}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              background: lvl.bg,
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 12
                            }}>
                              {l.level} • 第{l.lessonNumber}課
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                              Trụ cột: {l.pillar}
                            </span>
                          </div>
                          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '4px 0 0', color: '#0f172a' }}>
                            {l.jpTitle}
                          </h2>
                          <div style={{ fontSize: '0.92rem', color: '#e11d48', fontWeight: 700 }}>
                            {l.viTitle}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8' }}>
                        Trang {pageIdx + 3} / {bookLessons.length + 2}
                      </div>
                    </div>

                    {/* Zone 1: Root */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: 10,
                      padding: '8px 14px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{ fontWeight: 800, color: '#0284c7' }}>🔙 RỄ CÂY CỘI NGUỒN:</span>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{l.mindmap?.rootConnection || 'Nền tảng liên kết các bài học trước'}</span>
                    </div>

                    {/* Zone 2: Core Illustrated Branches */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: bList.length > 2 ? 'repeat(2, 1fr)' : '1fr',
                      gap: 14,
                      flex: 1
                    }}>
                      {bList.map((b, bIdx) => (
                        <div
                          key={bIdx}
                          style={{
                            background: '#ffffff',
                            border: `1.5px solid ${b.color || '#cbd5e1'}`,
                            borderRadius: 12,
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '1.2rem' }}>{b.icon || '🎯'}</span>
                            <div>
                              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: b.color || '#0284c7', textTransform: 'uppercase' }}>
                                Nhánh {bIdx + 1}
                              </div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                                {b.name}
                              </div>
                            </div>
                          </div>

                          {b.metaphor && (
                            <div style={{
                              background: '#fffbeb',
                              border: '1px dashed #fcd34d',
                              borderRadius: 8,
                              padding: '6px 10px',
                              fontSize: '0.78rem',
                              color: '#78350f',
                              fontWeight: 600
                            }}>
                              🎨 <strong>Ẩn dụ trực quan:</strong> {b.metaphor}
                            </div>
                          )}

                          {b.formula && (
                            <div style={{
                              background: '#f1f5f9',
                              borderLeft: `3px solid ${b.color || '#0284c7'}`,
                              padding: '6px 10px',
                              fontSize: '0.76rem',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#0f172a'
                            }}>
                              接続: {b.formula}
                            </div>
                          )}

                          {b.nuance && (
                            <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                              <strong>Sắc thái:</strong> {b.nuance}
                            </div>
                          )}

                          {b.mnemonic && (
                            <div style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 700 }}>
                              ✨ <strong>Mẹo 3s:</strong> {b.mnemonic}
                            </div>
                          )}

                          {b.example && (
                            <div style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: 8,
                              padding: '8px 10px',
                              marginTop: 'auto'
                            }}>
                              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
                                {b.example.jp}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {b.example.vi}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Zone 3: Trap Radar & Next Leap */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 12,
                      marginTop: 'auto'
                    }}>
                      <div style={{
                        background: '#fffbeb',
                        border: '1.5px solid #fcd34d',
                        borderRadius: 10,
                        padding: '8px 12px',
                        fontSize: '0.78rem',
                        color: '#78350f'
                      }}>
                        <strong>🛡️ BẪY ĐỀ THI (TRAP RADAR):</strong><br />
                        {l.mindmap?.trapRadar || 'Lưu ý các cặp cấu trúc tương tự dễ nhầm lẫn.'}
                      </div>

                      <div style={{
                        background: '#ecfdf5',
                        border: '1.5px solid #6ee7b7',
                        borderRadius: 10,
                        padding: '8px 12px',
                        fontSize: '0.78rem',
                        color: '#065f46'
                      }}>
                        <strong>🔜 CHỒI NON (BƯỚC NHẢY TIẾP THEO):</strong><br />
                        {l.mindmap?.nextLeap || 'Bước đệm vững vàng tiến tới bài tiếp theo.'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* MODE 2: MASTER MINDMAP ATLAS GALLERY                     */
        /* ======================================================== */
        <>
          {/* Top Navigation Bar */}
          <div style={{
            padding: '16px 30px',
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
                background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)',
                width: 46,
                height: 46,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(244, 63, 94, 0.4)'
              }}>
                <BookOpen size={24} color="#fff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                    🗺️ ĐẠI BÁCH KHOA SƠ ĐỒ TƯ DUY TOÀN DIỆN (N5 – N1)
                  </h2>
                  <span style={{
                    background: 'rgba(244, 63, 94, 0.2)',
                    color: '#f43f5e',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 12
                  }}>
                    120 BÀI SKETCHNOTE SAKURA
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                  Hệ thống Mindmap Sketchnote kết nối phả hệ cội nguồn, hình tượng hóa bằng linh vật & ẩn dụ trực quan.
                </div>
              </div>
            </div>

            {/* Global Book Export & Close Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setIsBookPrintMode(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Printer size={17} />
                Xuất Bản Sách E-Book (In PDF)
              </button>

              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  width: 38,
                  height: 38,
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
            padding: '12px 30px',
            background: 'rgba(30, 41, 59, 0.65)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14
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
                    background: levelFilter === tab.id ? '#f43f5e' : 'rgba(255, 255, 255, 0.06)',
                    color: levelFilter === tab.id ? '#ffffff' : '#cbd5e1',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div style={{ position: 'relative', width: 340 }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài học, linh vật, mẫu ngữ pháp, ẩn dụ..."
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 36px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#fff',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{
            padding: '8px 30px',
            background: 'rgba(15, 23, 42, 0.5)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.78rem',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>
              Đang hiển thị <strong>{filteredLessons.length}</strong> bài học Sketchnote • Đầy đủ 3 vùng tiếp hợp (Rễ cây, Thân cành, Khiên bẫy & Chồi non)
            </span>
            <span style={{ color: '#38bdf8' }}>
              💡 Bấm vào bất kỳ thẻ bài nào để phóng to tương tác và luyện phát âm
            </span>
          </div>

          {/* Main Grid View of 120 Mindmap Cards */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px 30px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 20
            }}>
              {filteredLessons.map(l => {
                const badge = getLevelBadge(l.level);
                const branchCount = l.mindmap?.branches?.length || 0;
                const mascot = l.mindmap?.mascotIcon || '🌸';

                return (
                  <div
                    key={l.lessonNumber}
                    onClick={() => setActiveMindmapLesson(l)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 16,
                      padding: '18px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#f43f5e';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(244, 63, 94, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Card Top: Mascot + Level + Branch Count */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          fontSize: '1.4rem',
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '50%',
                          width: 36,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${badge.border}55`
                        }}>
                          {mascot}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            background: badge.bg,
                            color: badge.text,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 10
                          }}>
                            {l.level}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                            第{l.lessonNumber}課
                          </span>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.74rem',
                        color: '#94a3b8',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '2px 8px',
                        borderRadius: 6
                      }}>
                        {branchCount} nhánh tư duy
                      </span>
                    </div>

                    {/* Lesson Titles */}
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>
                        {l.jpTitle}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#f472b6', fontWeight: 600 }}>
                        {l.viTitle}
                      </div>
                    </div>

                    {/* Root Connection Snippet */}
                    {l.mindmap?.rootConnection && (
                      <div style={{
                        fontSize: '0.74rem',
                        color: '#cbd5e1',
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderLeft: '2px solid #38bdf8',
                        padding: '4px 8px',
                        borderRadius: '0 6px 6px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        🌱 <strong>Cội nguồn:</strong> {l.mindmap.rootConnection.replace(/^🔙 Rễ cây:\s*/, '')}
                      </div>
                    )}

                    {/* Branches Preview Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {l.mindmap?.branches?.slice(0, 3).map((b, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'rgba(15, 23, 42, 0.7)',
                            border: `1px solid ${b.color || '#38bdf8'}44`,
                            color: b.color || '#38bdf8',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <span>{b.icon || '🌸'}</span>
                          <span>{b.name}</span>
                        </span>
                      ))}
                      {branchCount > 3 && (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '3px 4px' }}>
                          +{branchCount - 3} nữa
                        </span>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      paddingTop: 8,
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Trụ cột: {l.pillar}
                      </span>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        color: '#f43f5e',
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
        </>
      )}

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

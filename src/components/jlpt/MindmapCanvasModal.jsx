// src/components/jlpt/MindmapCanvasModal.jsx
// Trang Tổng Kết Sơ Đồ Tư Duy Mindmap AI Cho Từng Bài Học (N5 - N1)
// Hỗ trợ thu phóng (Zoom), nghe phát âm audio, in trang A4 và xuất ảnh

import React, { useState } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, Volume2, Printer, 
  Sparkles, Layers, BookOpen, ChevronRight, Award, Compass, Lightbulb
} from 'lucide-react';
import FuriganaText from '../FuriganaText';

export default function MindmapCanvasModal({ lesson, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!lesson) return null;

  const speakJapanese = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const branches = lesson.mindmap?.branches || [];

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'N5': return { bg: '#10b981', border: '#34d399', text: '#fff' };
      case 'N4': return { bg: '#06b6d4', border: '#22d3ee', text: '#fff' };
      case 'N3': return { bg: '#f59e0b', border: '#fbbf24', text: '#fff' };
      case 'N2': return { bg: '#8b5cf6', border: '#a78bfa', text: '#fff' };
      case 'N1': return { bg: '#ef4444', border: '#f87171', text: '#fff' };
      default: return { bg: '#3b82f6', border: '#60a5fa', text: '#fff' };
    }
  };

  const lvlStyle = getLevelColor(lesson.level);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(10, 15, 29, 0.92)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc'
    }}>
      {/* Top Action Header Bar */}
      <div style={{
        padding: '16px 28px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            background: lvlStyle.bg,
            color: lvlStyle.text,
            fontWeight: 800,
            fontSize: '0.85rem',
            padding: '4px 12px',
            borderRadius: 20,
            boxShadow: `0 0 12px ${lvlStyle.bg}66`
          }}>
            {lesson.level} • 第{lesson.lessonNumber}課
          </span>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🗺️ Sơ Đồ Tư Duy Mindmap AI:</span>
              <span style={{ color: '#38bdf8' }}>{lesson.jpTitle}</span>
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {lesson.viTitle} • Trụ cột: {lesson.pillar}
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Zoom controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2px 4px'
          }}>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              title="Thu nhỏ"
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 6, display: 'flex' }}
            >
              <ZoomOut size={16} />
            </button>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: 42, textAlign: 'center', color: '#38bdf8' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
              title="Phóng to"
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 6, display: 'flex' }}
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Đặt lại 100%"
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6, display: 'flex' }}
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            In Bản Đồ A4
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
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
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '30px 40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        <div style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out',
          maxWidth: 1200,
          width: '100%'
        }}>
          {/* Central Root Node */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
            border: `2px solid ${lvlStyle.border}`,
            boxShadow: `0 0 30px ${lvlStyle.bg}33`,
            borderRadius: 20,
            padding: '24px 32px',
            textAlign: 'center',
            marginBottom: 36,
            position: 'relative'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: lvlStyle.bg,
              color: lvlStyle.text,
              fontSize: '0.8rem',
              fontWeight: 800,
              padding: '4px 14px',
              borderRadius: 20,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <Award size={14} />
              Cấp Độ {lesson.level} • Khóa Bản Lề Quốc Dân
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 6px', color: '#fff' }}>
              第{lesson.lessonNumber}課：{lesson.jpTitle}
            </h1>
            <div style={{ fontSize: '1.15rem', color: '#38bdf8', fontWeight: 700, marginBottom: 12 }}>
              {lesson.viTitle}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.9rem',
              color: '#cbd5e1',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '8px 16px',
              borderRadius: 12,
              maxWidth: 700,
              margin: '0 auto'
            }}>
              <Lightbulb size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
              <span>{lesson.mindmap?.tip || `Nắm vững toàn bộ cấu trúc trọng điểm của Bài ${lesson.lessonNumber}.`}</span>
            </div>
          </div>

          {/* Flow Connector Line from Root to Branches */}
          <div style={{
            width: 3,
            height: 24,
            background: 'linear-gradient(to bottom, #38bdf8, #818cf8)',
            margin: '-36px auto 16px',
            boxShadow: '0 0 10px #38bdf8'
          }} />

          {/* Primary Branches Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 24
          }}>
            {branches.map((b, idx) => {
              const branchColor = b.color || '#38bdf8';
              return (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: `1.5px solid ${branchColor}66`,
                    borderRadius: 16,
                    padding: '20px 22px',
                    boxShadow: `0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  {/* Glowing Top Border Accent */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: branchColor,
                    boxShadow: `0 0 12px ${branchColor}`
                  }} />

                  {/* Branch Title & Pattern */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: branchColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        NHÁNH {idx + 1} • TRỌNG TÂM
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 2 }}>
                        {b.name}
                      </div>
                    </div>
                    {b.example?.jp && (
                      <button
                        onClick={() => speakJapanese(b.example.jp)}
                        title="Nghe phát âm tiếng Nhật mẫu"
                        style={{
                          background: `${branchColor}22`,
                          color: branchColor,
                          border: `1px solid ${branchColor}66`,
                          borderRadius: 8,
                          width: 34,
                          height: 34,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Formula Section */}
                  {b.formula && (
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      borderLeft: `3px solid ${branchColor}`,
                      padding: '8px 12px',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: 2 }}>
                        CÔNG THỨC KẾT NỐI (接続):
                      </div>
                      <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>
                        {b.formula}
                      </div>
                    </div>
                  )}

                  {/* Nuance Section */}
                  {b.nuance && (
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: '#f59e0b' }}>Sắc thái: </span>
                      {b.nuance}
                    </div>
                  )}

                  {/* Mnemonic / Tip Section */}
                  {b.mnemonic && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      background: `${branchColor}11`,
                      border: `1px dashed ${branchColor}44`,
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: '0.8rem',
                      color: '#e2e8f0'
                    }}>
                      <Sparkles size={14} color={branchColor} style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>{b.mnemonic}</div>
                    </div>
                  )}

                  {/* Representative Example */}
                  {b.example && (
                    <div style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      padding: '10px 14px',
                      borderRadius: 10,
                      marginTop: 'auto'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: 4 }}>
                        VÍ DỤ VÀNG (例文):
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>
                        {b.example.jp}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        {b.example.vi}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

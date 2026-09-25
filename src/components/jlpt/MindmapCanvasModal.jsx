// src/components/jlpt/MindmapCanvasModal.jsx
// SƠ ĐỒ TƯ DUY SKETCHNOTE SAKURA (N5 – N1)
// Tích hợp: Mascot linh vật chibi, Ẩn dụ trực quan, Mẹo 3 giây,
// 3 Vùng Tiếp Hợp (Rễ cây cội nguồn, Thân cành trọng tâm, Khiên bẫy & Chồi non),
// Hai giao diện (🌸 Sakura Sketchnote & 🌙 Midnight Cyber), Phát âm Audio & In ấn A4.

import React, { useState, useEffect } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, Volume2, Printer, 
  Sparkles, Layers, BookOpen, ChevronRight, Award, Compass, 
  Lightbulb, ShieldAlert, GitBranch, ArrowRight, Sun, Moon,
  Palette, PlayCircle, CheckCircle2
} from 'lucide-react';
import FuriganaText from '../FuriganaText';

export default function MindmapCanvasModal({ lesson, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [themeMode, setThemeMode] = useState('sakura'); // 'sakura' (Washi Sketchnote) | 'cyber' (Midnight Neon)
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [activeSpeakingIdx, setActiveSpeakingIdx] = useState(null);

  if (!lesson) return null;

  const branches = lesson.mindmap?.branches || [];
  const mascot = lesson.mindmap?.mascotIcon || '🌸';
  const rootConn = lesson.mindmap?.rootConnection || 'Nền tảng khởi nguồn từ các bài học tiền đề';
  const nextLeap = lesson.mindmap?.nextLeap || 'Bước đệm vững vàng tiến tới cấp độ tiếp theo';
  const trapRadar = lesson.mindmap?.trapRadar || 'Lưu ý các cặp cấu trúc tương tự dễ nhầm lẫn trong đề thi JLPT';
  const tip = lesson.mindmap?.tip || `Nắm vững toàn bộ cấu trúc trọng điểm của Bài ${lesson.lessonNumber}.`;

  const speakJapanese = (text, idx = null) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.88;
      if (idx !== null) setActiveSpeakingIdx(idx);
      utterance.onend = () => setActiveSpeakingIdx(null);
      utterance.onerror = () => setActiveSpeakingIdx(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const playAllBranches = () => {
    if (isPlayingAll) {
      window.speechSynthesis?.cancel();
      setIsPlayingAll(false);
      setActiveSpeakingIdx(null);
      return;
    }

    const sentences = branches
      .map((b, i) => ({ text: b.example?.jp, idx: i }))
      .filter(item => Boolean(item.text));

    if (sentences.length === 0) return;

    setIsPlayingAll(true);
    let cur = 0;

    const speakNext = () => {
      if (cur >= sentences.length) {
        setIsPlayingAll(false);
        setActiveSpeakingIdx(null);
        return;
      }
      const item = sentences[cur];
      setActiveSpeakingIdx(item.idx);
      const utt = new SpeechSynthesisUtterance(item.text);
      utt.lang = 'ja-JP';
      utt.rate = 0.88;
      utt.onend = () => {
        cur++;
        setTimeout(speakNext, 600);
      };
      utt.onerror = () => {
        setIsPlayingAll(false);
        setActiveSpeakingIdx(null);
      };
      window.speechSynthesis.speak(utt);
    };

    speakNext();
  };

  const handlePrint = () => {
    window.print();
  };

  // Pastel palette for Sakura Sketchnote mode
  const sakuraColors = [
    { bg: '#fff1f2', border: '#f43f5e', text: '#e11d48', badgeBg: '#ffe4e6', light: '#fff5f7' }, // Sakura Rose
    { bg: '#ecfdf5', border: '#10b981', text: '#059669', badgeBg: '#d1fae5', light: '#f0fdf4' }, // Matcha Green
    { bg: '#fffbeb', border: '#f59e0b', text: '#d97706', badgeBg: '#fef3c7', light: '#fffdf5' }, // Sunflower Honey
    { bg: '#f5f3ff', border: '#8b5cf6', text: '#7c3aed', badgeBg: '#ede9fe', light: '#faf5ff' }, // Hydrangea Lavender
    { bg: '#eff6ff', border: '#3b82f6', text: '#2563eb', badgeBg: '#dbeafe', light: '#f0f7ff' }, // Sky Cyan
    { bg: '#fdf2f8', border: '#ec4899', text: '#db2777', badgeBg: '#fce7f3', light: '#fff1f8' }, // Peony Pink
  ];

  const getLevelStyle = (lvl) => {
    switch (lvl) {
      case 'N5': return { bg: '#10b981', border: '#34d399', text: '#fff' };
      case 'N4': return { bg: '#06b6d4', border: '#22d3ee', text: '#fff' };
      case 'N3': return { bg: '#f59e0b', border: '#fbbf24', text: '#fff' };
      case 'N2': return { bg: '#8b5cf6', border: '#a78bfa', text: '#fff' };
      case 'N1': return { bg: '#ef4444', border: '#f87171', text: '#fff' };
      default: return { bg: '#3b82f6', border: '#60a5fa', text: '#fff' };
    }
  };

  const lvlStyle = getLevelStyle(lesson.level);
  const isSakura = themeMode === 'sakura';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: isSakura 
        ? 'radial-gradient(ellipse at 50% 10%, #fff7ed 0%, #fef2f2 40%, #fdf4ff 100%)' 
        : 'radial-gradient(ellipse at 50% 10%, #0f172a 0%, #070d19 100%)',
      color: isSakura ? '#1e293b' : '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: `'Noto Sans JP', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
    }}>
      {/* Print-specific style rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #sketchnote-canvas-root, #sketchnote-canvas-root * {
            visibility: visible;
          }
          #sketchnote-canvas-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .sketchnote-card {
            break-inside: avoid !important;
            box-shadow: none !important;
            border: 1.5px solid #cbd5e1 !important;
          }
        }
      `}</style>

      {/* Top Header & Toolbar (No-Print) */}
      <div className="no-print" style={{
        padding: '14px 24px',
        background: isSakura ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: isSakura ? '1px solid #fecdd3' : '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: isSakura ? '0 4px 20px rgba(244, 63, 94, 0.08)' : '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Left: Lesson Badges & Mascot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            fontSize: '2rem',
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: isSakura ? '#ffe4e6' : 'rgba(56, 189, 248, 0.15)',
            border: `2px dashed ${isSakura ? '#f43f5e' : '#38bdf8'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isSakura ? '0 4px 12px rgba(244, 63, 94, 0.2)' : '0 0 15px rgba(56, 189, 248, 0.3)',
            animation: 'pulse 2.5s infinite'
          }}>
            {mascot}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: lvlStyle.bg,
                color: lvlStyle.text,
                fontWeight: 800,
                fontSize: '0.78rem',
                padding: '2px 10px',
                borderRadius: 20,
                boxShadow: `0 2px 8px ${lvlStyle.bg}55`
              }}>
                {lesson.level} • 第{lesson.lessonNumber}課
              </span>
              <span style={{
                background: isSakura ? '#fef3c7' : 'rgba(245, 158, 11, 0.15)',
                color: isSakura ? '#b45309' : '#fbbf24',
                border: `1px solid ${isSakura ? '#fde68a' : '#f59e0b44'}`,
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: 8
              }}>
                🌸 Sakura Sketchnote Mindmap
              </span>
            </div>

            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              margin: '3px 0 0',
              color: isSakura ? '#881337' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>{lesson.jpTitle}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isSakura ? '#64748b' : '#94a3b8' }}>
                ({lesson.viTitle})
              </span>
            </h2>
          </div>
        </div>

        {/* Right: Interactive Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Theme Mode Toggle (Sakura vs Midnight) */}
          <button
            onClick={() => setThemeMode(isSakura ? 'cyber' : 'sakura')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isSakura ? '#fff' : 'rgba(30, 41, 59, 0.8)',
              color: isSakura ? '#db2777' : '#38bdf8',
              border: `1.5px solid ${isSakura ? '#fbcfe8' : '#38bdf855'}`,
              borderRadius: 10,
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
          >
            {isSakura ? <Moon size={15} /> : <Sun size={15} />}
            <span>{isSakura ? '🌙 Midnight Cyber' : '🌸 Sakura Washi'}</span>
          </button>

          {/* Audio Play All */}
          <button
            onClick={playAllBranches}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isPlayingAll 
                ? (isSakura ? '#e11d48' : '#ef4444') 
                : (isSakura ? '#fdf2f8' : 'rgba(56, 189, 248, 0.12)'),
              color: isPlayingAll ? '#fff' : (isSakura ? '#be185d' : '#38bdf8'),
              border: `1.5px solid ${isSakura ? '#f472b6' : '#38bdf866'}`,
              borderRadius: 10,
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Tự động phát âm toàn bộ các câu ví dụ mẫu trong bài"
          >
            <Volume2 size={16} />
            <span>{isPlayingAll ? 'Dừng Audio' : '🔊 Đọc Toàn Bộ Bài'}</span>
          </button>

          {/* Zoom Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: isSakura ? '#fff' : 'rgba(30, 41, 59, 0.8)',
            borderRadius: 10,
            border: `1px solid ${isSakura ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)'}`,
            padding: '2px 4px'
          }}>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              title="Thu nhỏ"
              style={{ background: 'none', border: 'none', color: isSakura ? '#64748b' : '#cbd5e1', cursor: 'pointer', padding: 6, display: 'flex' }}
            >
              <ZoomOut size={15} />
            </button>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              minWidth: 44,
              textAlign: 'center',
              color: isSakura ? '#0f172a' : '#38bdf8'
            }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
              title="Phóng to"
              style={{ background: 'none', border: 'none', color: isSakura ? '#64748b' : '#cbd5e1', cursor: 'pointer', padding: 6, display: 'flex' }}
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Đặt lại 100%"
              style={{ background: 'none', border: 'none', color: isSakura ? '#94a3b8' : '#64748b', cursor: 'pointer', padding: 6, display: 'flex' }}
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Print A4 Button */}
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
              color: '#fff',
              border: 'none',
              padding: '7px 16px',
              borderRadius: 10,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(244, 63, 94, 0.35)'
            }}
          >
            <Printer size={15} />
            In Bản Đồ A4
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              background: isSakura ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)',
              color: isSakura ? '#dc2626' : '#f87171',
              border: `1px solid ${isSakura ? '#fca5a5' : 'rgba(239, 68, 68, 0.4)'}`,
              width: 36,
              height: 36,
              borderRadius: 10,
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

      {/* Main Canvas Scroll Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px 30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        <div 
          id="sketchnote-canvas-root"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
            maxWidth: 1240,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >
          {/* ======================================================== */}
          {/* ZONE 1: RỄ CÂY CỘI NGUỒN (FOUNDATION ROOT CONNECTION)    */}
          {/* ======================================================== */}
          <div style={{
            background: isSakura 
              ? 'linear-gradient(135deg, #fef2f2, #fff1f2)' 
              : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
            border: `2px dashed ${isSakura ? '#fca5a5' : '#38bdf855'}`,
            borderRadius: 16,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            boxShadow: isSakura ? '0 2px 10px rgba(244, 63, 94, 0.05)' : '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                background: isSakura ? '#fee2e2' : 'rgba(56, 189, 248, 0.2)',
                color: isSakura ? '#e11d48' : '#38bdf8',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                🌱
              </div>
              <div>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isSakura ? '#be185d' : '#38bdf8'
                }}>
                  VÙNG 1: RỄ CÂY CỘI NGUỒN (PHẢ HỆ KIẾN THỨC BÀI TRƯỚC)
                </div>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: isSakura ? '#475569' : '#e2e8f0',
                  marginTop: 2
                }}>
                  {rootConn}
                </div>
              </div>
            </div>

            <div style={{
              background: isSakura ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${isSakura ? '#fecdd3' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: isSakura ? '#e11d48' : '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>Khởi điểm vững chắc</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* ======================================================== */}
          {/* ZONE 2: TRUNG TÂM LINH VẬT & THÂN CÀNH SKETCHNOTE        */}
          {/* ======================================================== */}
          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20
          }}>
            {/* Central Cloud Node (Linh vật trung tâm & Khẩu hiệu) */}
            <div style={{
              background: isSakura 
                ? 'linear-gradient(135deg, #ffffff, #fffaf0)' 
                : 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
              border: `3px solid ${isSakura ? '#fda4af' : lvlStyle.border}`,
              borderRadius: 24,
              padding: '24px 36px',
              textAlign: 'center',
              boxShadow: isSakura 
                ? '0 12px 36px rgba(244, 63, 94, 0.12), inset 0 2px 0 #ffffff' 
                : `0 0 40px ${lvlStyle.bg}33, inset 0 1px 0 rgba(255,255,255,0.1)`,
              maxWidth: 780,
              width: '100%',
              position: 'relative'
            }}>
              {/* Cute Mascot Avatar Sticker */}
              <div style={{
                position: 'absolute',
                top: -24,
                left: '50%',
                transform: 'translateX(-50%)',
                background: isSakura ? '#fff1f2' : '#1e293b',
                border: `3px solid ${isSakura ? '#f43f5e' : '#38bdf8'}`,
                borderRadius: '50%',
                width: 52,
                height: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                boxShadow: isSakura ? '0 4px 14px rgba(244, 63, 94, 0.25)' : '0 0 18px rgba(56, 189, 248, 0.4)'
              }}>
                {mascot}
              </div>

              {/* Lesson Badge */}
              <div style={{
                marginTop: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: isSakura ? '#ffe4e6' : lvlStyle.bg,
                color: isSakura ? '#9f1239' : '#fff',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '4px 14px',
                borderRadius: 20,
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                <Award size={14} />
                CẤP ĐỘ {lesson.level} • BÀI {lesson.lessonNumber} • TRỤ CỘT: {lesson.pillar}
              </div>

              {/* Main Heading */}
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 900,
                margin: '10px 0 4px',
                color: isSakura ? '#881337' : '#ffffff',
                letterSpacing: '-0.01em'
              }}>
                {lesson.jpTitle}
              </h1>

              <div style={{
                fontSize: '1.18rem',
                fontWeight: 700,
                color: isSakura ? '#e11d48' : '#38bdf8',
                marginBottom: 10
              }}>
                {lesson.viTitle}
              </div>

              {/* AI Pedagogical Tip Banner */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: isSakura ? '#fffbeb' : 'rgba(0, 0, 0, 0.3)',
                border: `1.5px dashed ${isSakura ? '#fcd34d' : '#f59e0b55'}`,
                padding: '8px 18px',
                borderRadius: 14,
                fontSize: '0.85rem',
                color: isSakura ? '#92400e' : '#cbd5e1',
                maxWidth: '95%',
                textAlign: 'left'
              }}>
                <Lightbulb size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                <span><strong>Mẹo cốt lõi:</strong> {tip}</span>
              </div>
            </div>

            {/* Organic Branches Grid (Thân cành trực quan) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: 22,
              width: '100%'
            }}>
              {branches.map((b, idx) => {
                const colorPalette = isSakura 
                  ? (sakuraColors[idx % sakuraColors.length])
                  : { 
                      bg: 'rgba(15, 23, 42, 0.88)', 
                      border: b.color || '#38bdf8', 
                      text: b.color || '#38bdf8', 
                      badgeBg: `${b.color || '#38bdf8'}22`, 
                      light: 'rgba(30, 41, 59, 0.6)' 
                    };
                const isSpeakingThis = activeSpeakingIdx === idx;

                return (
                  <div
                    key={idx}
                    className="sketchnote-card"
                    style={{
                      background: colorPalette.bg,
                      border: `2px solid ${colorPalette.border}`,
                      borderRadius: 18,
                      padding: '20px 22px',
                      boxShadow: isSakura 
                        ? '0 6px 18px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0,0,0,0.02)' 
                        : `0 8px 25px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    {/* Top Branch Header Ribbon */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 10
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          fontSize: '1.4rem',
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: colorPalette.badgeBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${colorPalette.border}55`,
                          flexShrink: 0
                        }}>
                          {b.icon || '🌸'}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: colorPalette.text
                          }}>
                            NHÁNH {idx + 1} • TRỌNG ĐIỂM
                          </div>
                          <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            color: isSakura ? '#0f172a' : '#ffffff',
                            marginTop: 1
                          }}>
                            {b.name}
                          </div>
                        </div>
                      </div>

                      {/* Branch Audio Speaker Button */}
                      {b.example?.jp && (
                        <button
                          onClick={() => speakJapanese(b.example.jp, idx)}
                          title="Nghe phát âm chuẩn người bản xứ"
                          style={{
                            background: isSpeakingThis 
                              ? (isSakura ? '#f43f5e' : '#38bdf8') 
                              : colorPalette.badgeBg,
                            color: isSpeakingThis ? '#fff' : colorPalette.text,
                            border: `1.5px solid ${colorPalette.border}`,
                            borderRadius: 10,
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Volume2 size={18} />
                        </button>
                      )}
                    </div>

                    {/* Visual Metaphor / Ẩn Dụ Trực Quan Sketchnote */}
                    {b.metaphor && (
                      <div style={{
                        background: isSakura ? '#ffffff' : 'rgba(0, 0, 0, 0.35)',
                        border: `1.5px dashed ${colorPalette.border}`,
                        borderRadius: 12,
                        padding: '9px 13px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10
                      }}>
                        <div style={{
                          fontSize: '1.2rem',
                          lineHeight: 1,
                          marginTop: 2
                        }}>
                          🎨
                        </div>
                        <div>
                          <div style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: colorPalette.text,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            ẨN DỤ TƯ DUY TRỰC QUAN (VISUAL METAPHOR):
                          </div>
                          <div style={{
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            color: isSakura ? '#334155' : '#e2e8f0',
                            marginTop: 2,
                            lineHeight: 1.45
                          }}>
                            {b.metaphor}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Formula Pill (Công thức kết nối) */}
                    {b.formula && (
                      <div style={{
                        background: isSakura ? colorPalette.light : 'rgba(30, 41, 59, 0.5)',
                        borderLeft: `4px solid ${colorPalette.border}`,
                        padding: '8px 12px',
                        borderRadius: '0 10px 10px 0'
                      }}>
                        <div style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: isSakura ? '#64748b' : '#94a3b8',
                          marginBottom: 3,
                          textTransform: 'uppercase'
                        }}>
                          CÔNG THỨC KẾT NỐI (接続):
                        </div>
                        <div style={{
                          fontFamily: 'Consolas, Monaco, monospace',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: isSakura ? '#0f172a' : '#f8fafc',
                          lineHeight: 1.4
                        }}>
                          {b.formula}
                        </div>
                      </div>
                    )}

                    {/* Nuance & Sắc thái */}
                    {b.nuance && (
                      <div style={{
                        fontSize: '0.84rem',
                        lineHeight: 1.5,
                        color: isSakura ? '#475569' : '#cbd5e1'
                      }}>
                        <span style={{ fontWeight: 800, color: isSakura ? '#b45309' : '#fbbf24' }}>
                          Sắc thái cốt tủy:
                        </span>{' '}
                        {b.nuance}
                      </div>
                    )}

                    {/* 3-Second Mnemonic Rhyme */}
                    {b.mnemonic && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        background: isSakura ? '#fffbeb' : `${colorPalette.border}15`,
                        border: `1px solid ${isSakura ? '#fde68a' : `${colorPalette.border}44`}`,
                        padding: '8px 12px',
                        borderRadius: 10,
                        fontSize: '0.82rem',
                        color: isSakura ? '#92400e' : '#f1f5f9'
                      }}>
                        <Sparkles size={14} color={colorPalette.border} style={{ marginTop: 2, flexShrink: 0 }} />
                        <div style={{ lineHeight: 1.45 }}>
                          <strong>Mẹo nhớ 3s:</strong> {b.mnemonic}
                        </div>
                      </div>
                    )}

                    {/* Gold Standard Bilingual Example */}
                    {b.example && (
                      <div style={{
                        background: isSakura ? '#ffffff' : 'rgba(30, 41, 59, 0.75)',
                        border: `1px solid ${isSakura ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: 12,
                        padding: '10px 14px',
                        marginTop: 'auto'
                      }}>
                        <div style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: isSakura ? '#94a3b8' : '#64748b',
                          marginBottom: 4,
                          textTransform: 'uppercase'
                        }}>
                          VÍ DỤ VÀNG BẢN NGỮ (例文):
                        </div>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: isSakura ? '#0f172a' : '#f8fafc',
                          marginBottom: 4,
                          lineHeight: 1.45
                        }}>
                          <FuriganaText text={b.example.jp} />
                        </div>
                        <div style={{
                          fontSize: '0.82rem',
                          color: isSakura ? '#64748b' : '#94a3b8',
                          lineHeight: 1.4
                        }}>
                          {b.example.vi}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* ZONE 3: KHIÊN BẼ CẠM BẪY & CHỒI NON BƯỚC NHẢY TIẾP THEO */}
          {/* ======================================================== */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 18,
            marginTop: 6
          }}>
            {/* Trap Radar Shield */}
            <div style={{
              background: isSakura ? '#fffbeb' : 'rgba(245, 158, 11, 0.08)',
              border: `2px solid ${isSakura ? '#fcd34d' : '#f59e0b66'}`,
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              boxShadow: isSakura ? '0 4px 14px rgba(245, 158, 11, 0.08)' : '0 4px 16px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                background: isSakura ? '#fef3c7' : 'rgba(245, 158, 11, 0.2)',
                color: isSakura ? '#b45309' : '#fbbf24',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                🛡️
              </div>
              <div>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isSakura ? '#b45309' : '#fbbf24'
                }}>
                  VÙNG 3A: KHIÊN BẺ CẠM BẪY ĐỀ THI JLPT (TRAP RADAR)
                </div>
                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: isSakura ? '#78350f' : '#fde68a',
                  marginTop: 3,
                  lineHeight: 1.45
                }}>
                  {trapRadar}
                </div>
              </div>
            </div>

            {/* Next Leap Sprout */}
            <div style={{
              background: isSakura ? '#ecfdf5' : 'rgba(16, 185, 129, 0.08)',
              border: `2px solid ${isSakura ? '#6ee7b7' : '#10b98166'}`,
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              boxShadow: isSakura ? '0 4px 14px rgba(16, 185, 129, 0.08)' : '0 4px 16px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                background: isSakura ? '#d1fae5' : 'rgba(16, 185, 129, 0.2)',
                color: isSakura ? '#047857' : '#34d399',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                🔜
              </div>
              <div>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isSakura ? '#047857' : '#34d399'
                }}>
                  VÙNG 3B: CHỒI NON BƯỚC NHẢY TIẾP THEO (NEXT LEAP)
                </div>
                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: isSakura ? '#065f46' : '#a7f3d0',
                  marginTop: 3,
                  lineHeight: 1.45
                }}>
                  {nextLeap}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Copyright / Stamp */}
          <div style={{
            textAlign: 'center',
            fontSize: '0.78rem',
            color: isSakura ? '#94a3b8' : '#64748b',
            paddingTop: 10,
            borderTop: `1px dashed ${isSakura ? '#cbd5e1' : 'rgba(255,255,255,0.08)'}`
          }}>
            🌸 <strong>OmniLinguist Sakura Sketchnote Mindmap</strong> • Hệ thống 120 Bài Bản Lề Chuẩn Sư Phạm Nhật Ngữ • In ấn & Ôn luyện mọi lúc mọi nơi
          </div>
        </div>
      </div>
    </div>
  );
}

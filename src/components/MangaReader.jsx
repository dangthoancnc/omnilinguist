// MangaReader.jsx — Trình Đọc Manga Tương Tác Cấp Độ 3 (Interactive Dual-Panel Manga Canvas Reader)
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Volume2, Eye, EyeOff, Sparkles, LayoutGrid, Rows, 
  MessageSquare, BookOpen, ChevronRight, Check, Mic, Square,
  Maximize2, Image as ImageIcon
} from 'lucide-react';
import FuriganaText from './FuriganaText';
import { useFurigana } from '../FuriganaContext';
import { 
  MANGA_ONOMATOPOEIA_MAP, 
  detectCharacter, 
  getStorySceneArtwork,
  getStoryMangaArtwork
} from '../data/mangaArtworks';

// Dịch câu đơn giản qua Google Translate API (có cache)
const translateLine = async (jaText) => {
  if (!jaText || !jaText.trim()) return '';
  const cacheKey = `manga_trans_${jaText.trim()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(jaText.trim())}`);
    const data = await res.json();
    let vi = '';
    if (data && data[0]) {
      data[0].forEach(item => { if (item[0]) vi += item[0]; });
    }
    if (vi) localStorage.setItem(cacheKey, vi);
    return vi;
  } catch (e) {
    return '';
  }
};

const MangaReader = ({ 
  story, 
  content, 
  chapterTitle, 
  fontSize = 1.2, 
  onSelectText, 
  speak,
  onWordClick,
  onTransferToShadowing
}) => {
  const [layoutMode, setLayoutMode] = useState('webtoon'); // 'webtoon' | 'grid'
  const [translatedLines, setTranslatedLines] = useState({});
  const [loadingLines, setLoadingLines] = useState({});
  const [speakingBeatId, setSpeakingBeatId] = useState(null);
  const [selectedBeatId, setSelectedBeatId] = useState(null);
  const speakingTimeoutRef = useRef(null);

  const { showFurigana, toggleFurigana } = useFurigana();

  // Phân tích văn bản tiếng Nhật thành các Khung tranh Manga (Panels) & Bong bóng thoại (Speech Bubbles)
  const panels = useMemo(() => {
    if (!content) return [];

    const rawParagraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
    const parsedPanels = [];
    let currentBeats = [];

    rawParagraphs.forEach((para) => {
      const trimmed = para.trim();

      // Kiểm tra câu thoại trong ngoặc vuông「...」hoặc 『...』
      const dialogueRegex = /(「[^」]+」|『[^』]+』)/g;
      const parts = trimmed.split(dialogueRegex).filter(Boolean);

      parts.forEach(part => {
        const isDialogue = (part.startsWith('「') && part.endsWith('」')) || (part.startsWith('『') && part.endsWith('』'));
        const cleanText = isDialogue ? part.slice(1, -1).trim() : part.trim();
        if (!cleanText) return;

        // Nhận diện từ tượng thanh trong câu
        let detectedOno = null;
        for (const ono in MANGA_ONOMATOPOEIA_MAP) {
          if (cleanText.includes(ono)) {
            detectedOno = { word: ono, ...MANGA_ONOMATOPOEIA_MAP[ono] };
            break;
          }
        }

        // Nhận diện kiểu bong bóng
        let bubbleStyle = 'speech';
        if (cleanText.includes('！') || cleanText.includes('!') || cleanText.includes('だー') || cleanText.includes('わー')) {
          bubbleStyle = 'shout';
        } else if (cleanText.includes('…') || cleanText.includes('だろう') || cleanText.includes('と思った')) {
          bubbleStyle = 'thought';
        }

        const charInfo = detectCharacter('', cleanText, story?.title || '');

        currentBeats.push({
          id: `b_${Math.random().toString(36).substr(2, 6)}`,
          type: isDialogue ? 'dialogue' : 'narration',
          text: cleanText,
          originalText: part,
          bubbleStyle: isDialogue ? bubbleStyle : 'narration',
          speaker: isDialogue ? charInfo.name : 'Người dẫn chuyện',
          avatar: isDialogue ? charInfo.avatar : '📜',
          badgeColor: isDialogue ? charInfo.badgeColor : '#6366f1',
          onomatopoeia: detectedOno
        });

        // Gom 2-3 beats thành 1 Panel khung tranh
        if (currentBeats.length >= 3) {
          parsedPanels.push({
            panelId: `p_${parsedPanels.length + 1}`,
            beats: currentBeats
          });
          currentBeats = [];
        }
      });
    });

    if (currentBeats.length > 0) {
      parsedPanels.push({
        panelId: `p_${parsedPanels.length + 1}`,
        beats: currentBeats
      });
    }

    return parsedPanels;
  }, [content, story]);

  // Danh sách phẳng tất cả các câu thoại/dẫn để tính toán tiến trình hoạt cảnh
  const allBeats = useMemo(() => {
    return panels.flatMap(p => p.beats);
  }, [panels]);

  // Vị trí câu đang được phát âm hoặc đang được người dùng chọn
  const activeBeatIdx = useMemo(() => {
    if (speakingBeatId) {
      const sIdx = allBeats.findIndex(b => b.id === speakingBeatId);
      if (sIdx !== -1) return sIdx;
    }
    if (selectedBeatId) {
      const selIdx = allBeats.findIndex(b => b.id === selectedBeatId);
      if (selIdx !== -1) return selIdx;
    }
    return 0;
  }, [speakingBeatId, selectedBeatId, allBeats]);

  const activeBeat = allBeats[activeBeatIdx] || allBeats[0];

  // Hoạt cảnh Ehon tương ứng với câu thoại đang đọc / đang chọn
  const activeSceneInfo = useMemo(() => {
    return getStorySceneArtwork(
      story, 
      chapterTitle, 
      activeBeatIdx, 
      allBeats.length || 1
    );
  }, [story, chapterTitle, activeBeatIdx, allBeats.length]);

  const handleToggleTranslate = async (beatId, jaText) => {
    if (translatedLines[beatId]) {
      setTranslatedLines(prev => {
        const next = { ...prev };
        delete next[beatId];
        return next;
      });
      return;
    }

    setLoadingLines(prev => ({ ...prev, [beatId]: true }));
    const vi = await translateLine(jaText);
    setTranslatedLines(prev => ({ ...prev, [beatId]: vi }));
    setLoadingLines(prev => ({ ...prev, [beatId]: false }));
  };

  const handleSpeakBeat = (beatId, text) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }
    setSpeakingBeatId(beatId);
    setSelectedBeatId(beatId);
    if (speak) speak(text);
    speakingTimeoutRef.current = setTimeout(() => {
      setSpeakingBeatId(prev => (prev === beatId ? null : prev));
    }, Math.max(2500, text.length * 260));
  };

  const handleStopSpeakBeat = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }
    setSpeakingBeatId(null);
  };

  useEffect(() => {
    return () => {
      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div 
      className="manga-reader-container" 
      onMouseUp={onSelectText} 
      onTouchEnd={onSelectText}
      style={{ fontSize: `${fontSize}rem` }}
    >
      {/* MANGA CONTROLS TOOLBAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-card-solid)',
        border: '1px solid var(--glass-border-strong)',
        borderRadius: 10,
        padding: '8px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Manga Canvas 2-Panel
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {panels.length} Khung Tranh · {allBeats.length} Câu thoại
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* NÚT DỪNG PHÁT ÂM TO RÕ KHI ĐANG ĐỌC */}
          {speakingBeatId && (
            <button
              onClick={handleStopSpeakBeat}
              className="cinema-btn-stop"
              title="Dừng phát âm câu thoại ngay lập tức"
              style={{ padding: '4px 12px !important', fontSize: '0.75rem !important' }}
            >
              <Square size={13} fill="currentColor" />
              <span>Dừng đọc</span>
            </button>
          )}

          {/* Nút bật/tắt Furigana trực tiếp */}
          <button
            onClick={toggleFurigana}
            className={`btn ${showFurigana ? 'btn-primary' : 'btn-outline'}`}
            title="Bật/Tắt phiên âm Furigana trên câu thoại"
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontWeight: 800 }}>あ</span>
            <span>{showFurigana ? 'Ẩn Furigana' : 'Hiện Furigana'}</span>
          </button>

          <button
            onClick={() => setLayoutMode('webtoon')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: layoutMode === 'webtoon' ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border-strong)',
              background: layoutMode === 'webtoon' ? 'var(--accent-subtle)' : 'transparent',
              color: layoutMode === 'webtoon' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
          >
            <Rows size={13} /> Cuộn Webtoon
          </button>

          <button
            onClick={() => setLayoutMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: layoutMode === 'grid' ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border-strong)',
              background: layoutMode === 'grid' ? 'var(--accent-subtle)' : 'transparent',
              color: layoutMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
          >
            <LayoutGrid size={13} /> Khung Đôi
          </button>

          {onTransferToShadowing && (
            <button
              onClick={onTransferToShadowing}
              className="btn btn-shadowing-transfer"
              title="Chuyển tác phẩm này sang Shadowing Studio để luyện phát âm theo từng câu"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: '0.75rem'
              }}
            >
              <Mic size={13} /> Shadowing
            </button>
          )}
        </div>
      </div>

      {/* DUAL-PANEL MANGA LAYOUT: TẬN DỤNG TOÀN DIỆN CHIỀU NGANG MÀN HÌNH */}
      <div className="manga-dual-container">
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* CỘT TRÁI (38%): TRANH HOẠT CẢNH EHON ĐA CẢNH + CÂU THOẠI ĐANG CHỌN  */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        <div className="manga-left-panel">
          {/* EHON SCENE ARTWORK CARD */}
          <div className="ehon-scene-card" style={{ border: '2px solid var(--text-primary)' }}>
            <div className="ehon-scene-image-wrapper" style={{ height: 300 }}>
              {activeSceneInfo.imageUrl ? (
                <img 
                  src={activeSceneInfo.imageUrl} 
                  alt={activeSceneInfo.sceneTitle || story?.title}
                  className="ehon-scene-image"
                  loading="lazy"
                  decoding="async"
                />
              ) : activeSceneInfo.renderIllustration ? (
                activeSceneInfo.renderIllustration()
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <ImageIcon size={48} opacity={0.3} />
                </div>
              )}
              <div className="ehon-scene-badge-row">
                <span className="ehon-scene-number-badge">
                  🎨 Hoạt cảnh {activeSceneInfo.currentSceneIdx} / {activeSceneInfo.totalScenes}
                </span>
                {story?.level && (
                  <span className="ehon-level-badge" style={{ background: 'var(--accent-primary)' }}>
                    {story.level}
                  </span>
                )}
              </div>
            </div>

            {/* Thông tin & Tóm tắt hoạt cảnh */}
            <div className="ehon-scene-info">
              <div className="ehon-scene-titles">
                <div className="ehon-scene-title-vi">{activeSceneInfo.sceneTitle}</div>
                {activeSceneInfo.sceneJpTitle && (
                  <div className="ehon-scene-title-jp jp-text">{activeSceneInfo.sceneJpTitle}</div>
                )}
              </div>
              {activeSceneInfo.sceneDesc && (
                <div className="ehon-scene-desc">{activeSceneInfo.sceneDesc}</div>
              )}
            </div>
          </div>

          {/* LIVE BEAT / ACTIVE DIALOGUE SUBTITLE CARD */}
          {activeBeat && (
            <div className="immersion-karaoke-card" style={{ border: '2px solid var(--text-primary)' }}>
              <div className="immersion-karaoke-header">
                <div className="immersion-karaoke-title">
                  <span style={{ fontSize: '1.2rem', marginRight: 4 }}>{activeBeat.avatar}</span>
                  <span style={{ fontWeight: 800, color: activeBeat.badgeColor }}>{activeBeat.speaker}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginLeft: 6 }}>
                    (Câu {activeBeatIdx + 1}/{allBeats.length})
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {speakingBeatId === activeBeat.id ? (
                    <button 
                      onClick={handleStopSpeakBeat}
                      className="btn"
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer'
                      }}
                      title="Dừng phát âm"
                    >
                      <Square size={11} fill="currentColor" /> Dừng
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSpeakBeat(activeBeat.id, activeBeat.text)}
                      className="btn-icon-tiny"
                      title="Nghe câu này"
                    >
                      <Volume2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="immersion-karaoke-body">
                <div className="immersion-karaoke-japanese jp-text" style={{ fontSize: '1.25rem', lineHeight: 2 }}>
                  <FuriganaText text={activeBeat.text} />
                </div>
                {translatedLines[activeBeat.id] ? (
                  <div className="immersion-karaoke-vietnamese">
                    {translatedLines[activeBeat.id]}
                  </div>
                ) : (
                  <button
                    onClick={() => handleToggleTranslate(activeBeat.id, activeBeat.text)}
                    style={{
                      marginTop: 6,
                      background: 'transparent',
                      border: '1px dashed var(--glass-border-strong)',
                      color: 'var(--accent-primary)',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {loadingLines[activeBeat.id] ? 'Đang dịch...' : '🌐 Dịch nghĩa tiếng Việt'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* CỘT PHẢI (62%): TOÀN BỘ DANH SÁCH KHUNG TRANH PHÂN Ô MANGA          */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        <div className="manga-right-panel">
          {/* MANGA HERO TITLE BANNER */}
          <div style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--text-primary)',
            borderRadius: 10,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 6
          }}>
            <div>
              <div className="jp-text" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                <FuriganaText text={story?.title || ''} />
              </div>
              {chapterTitle && (
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  <FuriganaText text={chapterTitle} />
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              💡 Bấm vào câu thoại để đổi tranh hoạt cảnh & nghe đọc
            </span>
          </div>

          {/* MANGA PANELS STACK */}
          <div style={{
            display: layoutMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: layoutMode === 'grid' ? 'repeat(auto-fit, minmax(320px, 1fr))' : undefined,
            flexDirection: layoutMode === 'webtoon' ? 'column' : undefined,
            gap: 18
          }}>
            {panels.map((panel, pIdx) => (
              <div key={panel.panelId} className="manga-panel-card">
                {/* Panel Index Indicator & Screentone header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 14px',
                  background: 'var(--bg-elevated)',
                  borderBottom: '2px solid var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.05em'
                }}>
                  <span>FRAME #{pIdx + 1}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={11} color="var(--accent-primary)" />
                    {story?.genreLabel || story?.genre || 'Manga SLA'}
                  </span>
                </div>

                {/* Panel Content Beats */}
                <div className="manga-dialogue-stack manga-screentone-overlay">
                  {panel.beats.map((beat) => {
                    const isDialogue = beat.type === 'dialogue';
                    const hasTranslation = !!translatedLines[beat.id];
                    const isLoadingTrans = !!loadingLines[beat.id];
                    const isSpeaking = speakingBeatId === beat.id;
                    const isSelected = selectedBeatId === beat.id;

                    return (
                      <div 
                        key={beat.id} 
                        style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                        onClick={() => setSelectedBeatId(beat.id)}
                      >
                        {/* Onomatopoeia Badge nếu có */}
                        {beat.onomatopoeia && (
                          <div style={{ marginBottom: 2 }}>
                            <span 
                              className="manga-onomatopoeia-badge"
                              style={{ color: beat.onomatopoeia.color }}
                              title={`${beat.onomatopoeia.romaji} — ${beat.onomatopoeia.vi}`}
                            >
                              {beat.onomatopoeia.word}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginLeft: 8, fontStyle: 'italic' }}>
                              ({beat.onomatopoeia.vi})
                            </span>
                          </div>
                        )}

                        {isDialogue ? (
                          /* SPEECH BUBBLE HỘI THOẠI */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                            {/* Speaker Avatar Badge */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                fontSize: '1.1rem',
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: 'var(--bg-surface)',
                                border: `2px solid ${beat.badgeColor}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                              }}>
                                {beat.avatar}
                              </span>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: beat.badgeColor }}>
                                {beat.speaker}
                              </span>
                            </div>

                            {/* Bubble Body with Furigana */}
                            <div 
                              className={`manga-speech-bubble ${beat.bubbleStyle === 'shout' ? 'manga-speech-shout' : beat.bubbleStyle === 'thought' ? 'manga-speech-thought' : ''}`}
                              style={{
                                borderColor: isSpeaking ? '#ef4444' : isSelected ? 'var(--accent-primary)' : undefined,
                                boxShadow: isSpeaking ? '0 0 16px rgba(239, 68, 68, 0.45)' : isSelected ? '0 0 14px rgba(59, 130, 246, 0.35)' : undefined,
                                transition: 'all 0.25s ease',
                                cursor: 'pointer'
                              }}
                            >
                              <div className="jp-text" style={{ userSelect: 'text' }}>
                                <FuriganaText text={beat.text} />
                              </div>

                              {/* Dịch phụ đề tiếng Việt nếu bật */}
                              {hasTranslation && (
                                <div style={{
                                  marginTop: 8,
                                  paddingTop: 6,
                                  borderTop: '1px dashed var(--glass-border-strong)',
                                  fontSize: '0.85em',
                                  color: 'var(--text-secondary)',
                                  fontStyle: 'italic',
                                  lineHeight: 1.5
                                }}>
                                  {translatedLines[beat.id]}
                                </div>
                              )}

                              {/* Bubble Quick Actions */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 6,
                                marginTop: 6
                              }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleTranslate(beat.id, beat.text); }}
                                  title="Dịch câu thoại này sang tiếng Việt"
                                  style={{
                                    background: hasTranslation ? 'var(--accent-subtle)' : 'transparent',
                                    border: '1px solid var(--glass-border-strong)',
                                    color: hasTranslation ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                                    padding: '2px 7px',
                                    borderRadius: 4,
                                    fontSize: '0.68rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3
                                  }}
                                >
                                  {isLoadingTrans ? '...' : hasTranslation ? <EyeOff size={11} /> : <Eye size={11} />}
                                  {hasTranslation ? 'Ẩn dịch' : 'Dịch'}
                                </button>

                                {/* NÚT PHÁT ÂM HOẶC DỪNG TRỰC TIẾP */}
                                {isSpeaking ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStopSpeakBeat(); }}
                                    title="Dừng phát âm câu thoại này"
                                    style={{
                                      background: '#ef4444',
                                      border: '1px solid #ef4444',
                                      color: '#ffffff',
                                      padding: '2px 9px',
                                      borderRadius: 4,
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <Square size={11} fill="currentColor" /> Dừng
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleSpeakBeat(beat.id, beat.text); }}
                                    title="Nghe phát âm câu thoại này (TTS Bản Ngữ)"
                                    style={{
                                      background: 'var(--accent-subtle)',
                                      border: '1px solid var(--accent-primary)',
                                      color: 'var(--accent-primary)',
                                      padding: '2px 8px',
                                      borderRadius: 4,
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <Volume2 size={11} /> Đọc
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* CAPTION BOX DẪN TRUYỆN */
                          <div 
                            className="manga-narration-box"
                            style={{
                              borderColor: isSpeaking ? '#ef4444' : isSelected ? 'var(--accent-primary)' : undefined,
                              boxShadow: isSpeaking ? '0 0 16px rgba(239, 68, 68, 0.45)' : isSelected ? '0 0 14px rgba(59, 130, 246, 0.35)' : undefined,
                              transition: 'all 0.25s ease',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              📜 Lời Dẫn
                            </div>
                            <div className="jp-text" style={{ userSelect: 'text' }}>
                              <FuriganaText text={beat.text} />
                            </div>

                            {hasTranslation && (
                              <div style={{
                                marginTop: 8,
                                paddingTop: 6,
                                borderTop: '1px dashed var(--glass-border-strong)',
                                fontSize: '0.85em',
                                color: 'var(--text-secondary)',
                                fontStyle: 'italic',
                                lineHeight: 1.5
                              }}>
                                {translatedLines[beat.id]}
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleTranslate(beat.id, beat.text); }}
                                style={{
                                  background: hasTranslation ? 'var(--accent-subtle)' : 'transparent',
                                  border: '1px solid var(--glass-border-strong)',
                                  color: hasTranslation ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                                  padding: '2px 7px',
                                  borderRadius: 4,
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                {isLoadingTrans ? '...' : hasTranslation ? 'Ẩn dịch' : 'Dịch nghĩa'}
                              </button>

                              {/* NÚT PHÁT HOẶC DỪNG CHO LỜI DẪN */}
                              {isSpeaking ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStopSpeakBeat(); }}
                                  style={{
                                    background: '#ef4444',
                                    border: '1px solid #ef4444',
                                    color: '#ffffff',
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3
                                  }}
                                >
                                  <Square size={11} fill="currentColor" /> Dừng
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSpeakBeat(beat.id, beat.text); }}
                                  style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--glass-border-strong)',
                                    color: 'var(--text-primary)',
                                    padding: '2px 7px',
                                    borderRadius: 4,
                                    fontSize: '0.68rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3
                                  }}
                                >
                                  <Volume2 size={11} /> Nghe
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaReader;

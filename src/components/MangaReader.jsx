// MangaReader.jsx — Trình Đọc Manga Tương Tác Cấp Độ 3 (Interactive Manga Canvas Reader)
import React, { useState, useMemo } from 'react';
import { 
  Volume2, Eye, EyeOff, Sparkles, LayoutGrid, Rows, 
  MessageSquare, BookOpen, ChevronRight, Check, Mic 
} from 'lucide-react';
import FuriganaText from './FuriganaText';
import { 
  MANGA_ONOMATOPOEIA_MAP, 
  detectCharacter, 
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

  const artwork = useMemo(() => getStoryMangaArtwork(story), [story]);

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
    setSpeakingBeatId(beatId);
    if (speak) speak(text);
    setTimeout(() => {
      setSpeakingBeatId(prev => (prev === beatId ? null : prev));
    }, Math.max(2500, text.length * 260));
  };

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
        border: '2px solid var(--text-primary)',
        borderRadius: 10,
        padding: '8px 14px',
        boxShadow: '2px 3px 0px rgba(0,0,0,0.2)',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: 'var(--accent-primary)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Manga Canvas
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {panels.length} Khung Tranh Phân Ô
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
            <LayoutGrid size={13} /> Khung Đôi Manga
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
              <Mic size={13} /> Luyện Shadowing
            </button>
          )}
        </div>
      </div>

      {/* MANGA HERO COVER ARTWORK */}
      <div className="manga-panel-card" style={{ marginBottom: 12 }}>
        <div className="manga-panel-hero">
          {artwork.renderIllustration()}
          {/* Header Title Banner */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            right: 16,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 8,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 6
          }}>
            <div>
              <div className="jp-text" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                <FuriganaText text={story?.title || ''} />
              </div>
              {chapterTitle && (
                <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                  <FuriganaText text={chapterTitle} />
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontStyle: 'italic' }}>
              💡 Chạm vào câu thoại để nghe đọc · Bôi đen từ để nạp FSRS
            </span>
          </div>
        </div>
      </div>

      {/* MANGA PANELS STACK */}
      <div style={{
        display: layoutMode === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: layoutMode === 'grid' ? 'repeat(auto-fit, minmax(360px, 1fr))' : undefined,
        flexDirection: layoutMode === 'webtoon' ? 'column' : undefined,
        gap: 20
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

                return (
                  <div key={beat.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                            borderColor: speakingBeatId === beat.id ? 'var(--accent-primary)' : undefined,
                            boxShadow: speakingBeatId === beat.id ? '0 0 16px rgba(59, 130, 246, 0.45)' : undefined,
                            transition: 'all 0.25s ease'
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
                              onClick={() => handleToggleTranslate(beat.id, beat.text)}
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

                            <button
                              onClick={() => handleSpeakBeat(beat.id, beat.text)}
                              title="Nghe phát âm câu thoại này (TTS Bản Ngữ)"
                              style={{
                                background: speakingBeatId === beat.id ? 'var(--accent-primary)' : 'var(--accent-subtle)',
                                border: '1px solid var(--accent-primary)',
                                color: speakingBeatId === beat.id ? '#ffffff' : 'var(--accent-primary)',
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
                              <Volume2 size={11} /> {speakingBeatId === beat.id ? 'Đang đọc...' : 'Đọc'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* CAPTION BOX DẪN TRUYỆN */
                      <div 
                        className="manga-narration-box"
                        style={{
                          borderColor: speakingBeatId === beat.id ? 'var(--accent-primary)' : undefined,
                          boxShadow: speakingBeatId === beat.id ? '0 0 16px rgba(59, 130, 246, 0.45)' : undefined,
                          transition: 'all 0.25s ease'
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
                            onClick={() => handleToggleTranslate(beat.id, beat.text)}
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

                          <button
                            onClick={() => handleSpeakBeat(beat.id, beat.text)}
                            style={{
                              background: speakingBeatId === beat.id ? 'var(--accent-primary)' : 'var(--bg-surface)',
                              border: '1px solid var(--glass-border-strong)',
                              color: speakingBeatId === beat.id ? '#ffffff' : 'var(--text-primary)',
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
                            <Volume2 size={11} /> {speakingBeatId === beat.id ? 'Đang đọc...' : 'Nghe'}
                          </button>
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
  );
};

export default MangaReader;

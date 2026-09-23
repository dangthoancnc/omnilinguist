// MangaReader.jsx — Trình Đọc Manga Tương Tác Cấp Độ 3 (Interactive Dual-Panel Motion Manga Canvas Reader)
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, Eye, EyeOff, Sparkles, LayoutGrid, Rows, 
  MessageSquare, BookOpen, ChevronRight, ChevronLeft, Check, Mic, Square,
  Maximize2, Image as ImageIcon, Play, Pause, RotateCcw, Loader
} from 'lucide-react';
import FuriganaText from './FuriganaText';
import { useFurigana } from '../FuriganaContext';
import { 
  MANGA_ONOMATOPOEIA_MAP, 
  detectCharacter, 
  getStorySceneArtwork,
  getStoryMangaArtwork
} from '../data/mangaArtworks';
import { getCachedTranslation } from '../services/storyTranslationService';

// Dịch câu đơn giản qua Google Translate API (có cache)
const translateLine = async (jaText) => {
  if (!jaText || !jaText.trim()) return '';
  const clean = jaText.trim();
  const cached = getCachedTranslation(clean) || localStorage.getItem(`manga_trans_${clean}`);
  if (cached) return cached;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(clean)}`);
    const data = await res.json();
    let vi = '';
    if (data && data[0]) {
      data[0].forEach(item => { if (item[0]) vi += item[0]; });
    }
    if (vi) localStorage.setItem(`manga_trans_${clean}`, vi);
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
  onTransferToShadowing,
  // Props đồng bộ từ ImmersionReader nếu có
  isPlayingTTS,
  onStopTTS,
  ttsSpeed: parentTtsSpeed,
  activeSentenceIdx
}) => {
  const [layoutMode, setLayoutMode] = useState('webtoon'); // 'webtoon' | 'grid'
  const [translatedLines, setTranslatedLines] = useState({});
  const [loadingLines, setLoadingLines] = useState({});
  
  // Motion Manga Auto-play Engine States
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [isPausedAuto, setIsPausedAuto] = useState(false);
  const [activeBeatIdx, setActiveBeatIdx] = useState(0);
  const [mangaSpeed, setMangaSpeed] = useState(() => {
    const s = localStorage.getItem('omni_tts_speed');
    return s ? parseFloat(s) : (parentTtsSpeed || 0.85);
  });

  const { showFurigana, toggleFurigana } = useFurigana();

  const beatRefs = useRef({});
  const autoPlayCancelledRef = useRef(false);
  const mangaSessionIdRef = useRef(0);
  const currentUtteranceRef = useRef(null);

  // Phân tích văn bản tiếng Nhật thành các Khung tranh Manga (Panels) & Bong bóng thoại (Speech Bubbles)
  const { panels, allBeats } = useMemo(() => {
    if (!content) return { panels: [], allBeats: [] };

    const rawParagraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
    const parsedPanels = [];
    const flatBeats = [];
    let currentBeats = [];
    let globalBeatIdx = 0;

    rawParagraphs.forEach((para, paraIdx) => {
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
        const beatObj = {
          id: `beat_${globalBeatIdx}`,
          beatIdx: globalBeatIdx,
          paraIdx: paraIdx,
          type: isDialogue ? 'dialogue' : 'narration',
          text: cleanText,
          originalText: part,
          bubbleStyle: isDialogue ? bubbleStyle : 'narration',
          speaker: isDialogue ? charInfo.name : 'Người dẫn chuyện',
          avatar: isDialogue ? charInfo.avatar : '📜',
          badgeColor: isDialogue ? charInfo.badgeColor : '#6366f1',
          onomatopoeia: detectedOno
        };

        globalBeatIdx++;
        currentBeats.push(beatObj);
        flatBeats.push(beatObj);

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

    return { panels: parsedPanels, allBeats: flatBeats };
  }, [content, story]);

  const activeBeat = allBeats[activeBeatIdx] || allBeats[0];

  // Sync with global ImmersionReader activeSentenceIdx
  useEffect(() => {
    if (activeSentenceIdx !== undefined && (isPlayingTTS || !isPlayingAuto)) {
      const targetBeatIndex = allBeats.findIndex(b => b.paraIdx === activeSentenceIdx);
      if (targetBeatIndex !== -1 && targetBeatIndex !== activeBeatIdx) {
        setActiveBeatIdx(targetBeatIndex);
        if (beatRefs.current[targetBeatIndex]) {
          beatRefs.current[targetBeatIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [activeSentenceIdx, isPlayingTTS, allBeats]);

  // Hoạt cảnh Ehon tương ứng với câu thoại đang đọc / đang chọn
  const activeSceneInfo = useMemo(() => {
    return getStorySceneArtwork(
      story, 
      chapterTitle, 
      activeBeatIdx, 
      allBeats.length || 1
    );
  }, [story, chapterTitle, activeBeatIdx, allBeats.length]);

  // Dịch câu tự động khi chọn beat
  useEffect(() => {
    if (activeBeat && !translatedLines[activeBeat.id]) {
      const cached = getCachedTranslation(activeBeat.text);
      if (cached) {
        setTranslatedLines(prev => ({ ...prev, [activeBeat.id]: cached }));
      } else {
        translateLine(activeBeat.text).then(vi => {
          if (vi) setTranslatedLines(prev => ({ ...prev, [activeBeat.id]: vi }));
        });
      }
    }
  }, [activeBeat]);

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

  // Dừng đọc Manga tự động và hủy phiên
  const handleStopAutoPlay = useCallback(() => {
    mangaSessionIdRef.current += 1;
    autoPlayCancelledRef.current = true;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlayingAuto(false);
    setIsPausedAuto(false);
    currentUtteranceRef.current = null;
    if (onStopTTS) onStopTTS();
  }, [onStopTTS]);

  // Khi đổi nội dung bài đọc hoặc tác phẩm, lập tức dừng đọc Manga và reset về beat 0
  useEffect(() => {
    handleStopAutoPlay();
    setActiveBeatIdx(0);
  }, [content, story?.id, handleStopAutoPlay]);

  // ────────────────────────────────────────────────────────────
  // MOTION MANGA AUTO-PLAY TTS ENGINE (CHỮ TỰ CHẠY TUẦN TỰ)
  // ────────────────────────────────────────────────────────────
  const startAutoPlay = (startIdx = 0) => {
    if (!window.speechSynthesis || allBeats.length === 0) return;
    mangaSessionIdRef.current += 1;
    const currentSessionId = mangaSessionIdRef.current;
    autoPlayCancelledRef.current = false;
    window.speechSynthesis.cancel();
    setIsPlayingAuto(true);
    setIsPausedAuto(false);

    const playBeatAt = (idx) => {
      if (mangaSessionIdRef.current !== currentSessionId || autoPlayCancelledRef.current || idx >= allBeats.length) {
        setIsPlayingAuto(false);
        setIsPausedAuto(false);
        currentUtteranceRef.current = null;
        return;
      }

      const beat = allBeats[idx];
      setActiveBeatIdx(idx);

      // Tự động cuộn mượt mà đưa beat này vào giữa màn hình panel phải
      if (beatRefs.current[idx]) {
        beatRefs.current[idx].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      const utter = new SpeechSynthesisUtterance(beat.text);
      utter.lang = 'ja-JP';
      utter.rate = mangaSpeed || 0.85;

      const voices = window.speechSynthesis.getVoices();
      const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
      if (jpVoice) utter.voice = jpVoice;

      utter.onend = () => {
        if (mangaSessionIdRef.current === currentSessionId && !autoPlayCancelledRef.current) {
          setTimeout(() => {
            if (mangaSessionIdRef.current === currentSessionId && !autoPlayCancelledRef.current) {
              playBeatAt(idx + 1);
            }
          }, 380);
        }
      };

      utter.onerror = (e) => {
        if (e?.error === 'canceled' || e?.error === 'interrupted') {
          return;
        }
        if (mangaSessionIdRef.current === currentSessionId && !autoPlayCancelledRef.current) {
          setTimeout(() => {
            if (mangaSessionIdRef.current === currentSessionId && !autoPlayCancelledRef.current) {
              playBeatAt(idx + 1);
            }
          }, 300);
        }
      };

      currentUtteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    };

    playBeatAt(startIdx);
  };

  const handlePauseResumeAutoPlay = () => {
    if (!window.speechSynthesis) return;
    if (isPausedAuto) {
      window.speechSynthesis.resume();
      setIsPausedAuto(false);
    } else {
      window.speechSynthesis.pause();
      setIsPausedAuto(true);
    }
  };

  const handlePrevBeat = () => {
    const target = Math.max(0, activeBeatIdx - 1);
    setActiveBeatIdx(target);
    if (isPlayingAuto) {
      startAutoPlay(target);
    } else if (beatRefs.current[target]) {
      beatRefs.current[target].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNextBeat = () => {
    const target = Math.min(allBeats.length - 1, activeBeatIdx + 1);
    setActiveBeatIdx(target);
    if (isPlayingAuto) {
      startAutoPlay(target);
    } else if (beatRefs.current[target]) {
      beatRefs.current[target].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleBeatClick = (idx) => {
    setActiveBeatIdx(idx);
    if (isPlayingAuto) {
      startAutoPlay(idx);
    } else if (beatRefs.current[idx]) {
      beatRefs.current[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Phím tắt bàn phím tiện lợi: Esc / S để dừng, Space để Tạm dừng/Tiếp tục, Mũi tên trái/phải để chuyển câu
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      if (e.key === 'Escape' || e.key === 's' || e.key === 'S') {
        if (isPlayingAuto) {
          e.preventDefault();
          handleStopAutoPlay();
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        if (isPlayingAuto) {
          e.preventDefault();
          handlePauseResumeAutoPlay();
        }
      } else if (e.key === 'ArrowRight') {
        if (activeBeatIdx < allBeats.length - 1) {
          e.preventDefault();
          handleNextBeat();
        }
      } else if (e.key === 'ArrowLeft') {
        if (activeBeatIdx > 0) {
          e.preventDefault();
          handlePrevBeat();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingAuto, isPausedAuto, activeBeatIdx, allBeats.length]);

  // Dọn dẹp khi unmount
  useEffect(() => {
    return () => {
      autoPlayCancelledRef.current = true;
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
        {/* Tiêu đề & Thông tin số khung */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
            Motion Manga
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {panels.length} Khung Tranh · {allBeats.length} Câu thoại
          </span>
        </div>

        {/* CỤM ĐIỀU KHIỂN TỰ ĐỘNG ĐỌC MANGA CHỮ TỰ CHẠY */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Nút Câu Trước */}
          <button
            type="button"
            className="btn btn-outline"
            onClick={handlePrevBeat}
            disabled={activeBeatIdx === 0}
            title="Câu trước (Phím Mũi tên Trái)"
            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
          >
            <ChevronLeft size={14} />
          </button>

          {/* Nút ▶ Tự Động Đọc Manga / ⏸ Tạm Dừng */}
          {isPlayingAuto ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePauseResumeAutoPlay}
              title={isPausedAuto ? "Tiếp tục đọc Manga (Phím Space)" : "Tạm dừng (Phím Space)"}
              style={{
                padding: '6px 14px',
                fontSize: '0.78rem',
                borderRadius: 20,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 700
              }}
            >
              {isPausedAuto ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
              <span>{isPausedAuto ? 'Tiếp tục' : 'Tạm dừng'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => startAutoPlay(activeBeatIdx)}
              title="Tự động đọc toàn bộ Manga và tự cuộn khung thoại (Phím Space)"
              style={{
                padding: '6px 14px',
                fontSize: '0.78rem',
                borderRadius: 20,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
              }}
            >
              <Play size={14} fill="currentColor" />
              <span>▶ Đọc Manga</span>
            </button>
          )}

          {/* NÚT ⏹ DỪNG MÀU ĐỎ TO RÕ NỔI BẬT */}
          <button
            type="button"
            onClick={handleStopAutoPlay}
            className="cinema-btn-stop"
            title="Dừng đọc Manga ngay lập tức (Phím Esc hoặc S)"
            style={{ padding: '6px 14px !important', fontSize: '0.78rem !important' }}
          >
            <Square size={13} fill="currentColor" />
            <span>⏹ Dừng</span>
          </button>

          {/* Nút Câu Sau */}
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleNextBeat}
            disabled={activeBeatIdx >= allBeats.length - 1}
            title="Câu sau (Phím Mũi tên Phải)"
            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
          >
            <ChevronRight size={14} />
          </button>

          {/* Bộ chọn Tốc độ đọc */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 4 }}>
            {[0.75, 0.85, 1.0, 1.25].map(speed => (
              <button
                key={speed}
                type="button"
                className={`btn-speed-pill ${mangaSpeed === speed ? 'active' : ''}`}
                onClick={() => {
                  setMangaSpeed(speed);
                  localStorage.setItem('omni_tts_speed', speed.toString());
                }}
                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Nút bật/tắt Furigana trực tiếp */}
          <button
            onClick={toggleFurigana}
            className={`btn ${showFurigana ? 'btn-primary' : 'btn-outline'}`}
            title="Bật/Tắt phiên âm Furigana trên toàn bộ câu thoại Manga"
            style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontWeight: 800 }}>あ</span>
            <span>{showFurigana ? 'Ẩn Furigana' : 'Hiện Furigana'}</span>
          </button>

          {/* Nút chuyển chế độ bố cục Webtoon / Khung Đôi */}
          <button
            onClick={() => setLayoutMode('webtoon')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 9px',
              borderRadius: 6,
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: layoutMode === 'webtoon' ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border-strong)',
              background: layoutMode === 'webtoon' ? 'var(--accent-subtle)' : 'transparent',
              color: layoutMode === 'webtoon' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
            title="Chế độ cuộn dọc Webtoon"
          >
            <Rows size={13} /> Cuộn Webtoon
          </button>

          <button
            onClick={() => setLayoutMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 9px',
              borderRadius: 6,
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: layoutMode === 'grid' ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border-strong)',
              background: layoutMode === 'grid' ? 'var(--accent-subtle)' : 'transparent',
              color: layoutMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
            title="Chế độ lưới khung đôi"
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
                padding: '5px 11px',
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
                  {isPlayingAuto ? (
                    <button 
                      onClick={handleStopAutoPlay}
                      className="cinema-btn-stop"
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      title="Dừng đọc Manga"
                    >
                      <Square size={11} fill="currentColor" /> Dừng
                    </button>
                  ) : (
                    <button 
                      onClick={() => startAutoPlay(activeBeatIdx)}
                      className="btn btn-primary"
                      style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      title="Đọc từ câu này"
                    >
                      <Play size={11} fill="currentColor" /> Đọc
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

              {/* Action Buttons in Left Panel */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 8,
                marginTop: 8,
                borderTop: '1px solid var(--glass-border)'
              }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handlePrevBeat}
                  disabled={activeBeatIdx === 0}
                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                >
                  <ChevronLeft size={13} /> Câu trước
                </button>

                <div style={{ display: 'flex', gap: 6 }}>
                  {isPlayingAuto ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handlePauseResumeAutoPlay}
                      style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: 14 }}
                    >
                      {isPausedAuto ? <Play size={11} fill="currentColor" /> : <Pause size={11} fill="currentColor" />}
                      <span>{isPausedAuto ? 'Tiếp' : 'Tạm dừng'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => startAutoPlay(activeBeatIdx)}
                      style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: 14 }}
                    >
                      <Play size={11} fill="currentColor" />
                      <span>Đọc Manga</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="cinema-btn-stop"
                    onClick={handleStopAutoPlay}
                    style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                    title="Dừng đọc Manga"
                  >
                    <Square size={11} fill="currentColor" />
                    <span>Dừng</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleNextBeat}
                  disabled={activeBeatIdx >= allBeats.length - 1}
                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                >
                  Câu sau <ChevronRight size={13} />
                </button>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>{activeSceneInfo.avatar || '📖'}</span>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {story?.title || 'OmniLinguist Manga'}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  {chapterTitle || 'Tác phẩm chọn lọc'}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>💡 Bấm vào câu thoại để đổi tranh hoạt cảnh & nghe đọc</span>
            </div>
          </div>

          {/* MANGA PANELS CONTAINER: Webtoon cuộn mượt hoặc Lưới Khung Đôi */}
          <div className={layoutMode === 'webtoon' ? 'manga-webtoon-stream' : 'manga-grid-view'}>
            {panels.map((panel, pIdx) => {
              const hasActiveBeat = panel.beats.some(b => b.beatIdx === activeBeatIdx);

              return (
                <div 
                  key={panel.panelId} 
                  className={`manga-panel-card ${hasActiveBeat ? 'manga-frame-active' : ''}`}
                  style={{
                    transition: 'all 0.3s ease',
                    borderColor: hasActiveBeat ? '#f59e0b' : undefined
                  }}
                >
                  {/* Panel Header */}
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
                      const isReadingActive = isPlayingAuto && activeBeatIdx === beat.beatIdx;
                      const isSelected = activeBeatIdx === beat.beatIdx;

                      return (
                        <div 
                          key={beat.id} 
                          ref={el => { beatRefs.current[beat.beatIdx] = el; }}
                          style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                          onClick={() => handleBeatClick(beat.beatIdx)}
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

                              {/* Bubble Body with Furigana & Active Neon Highlight */}
                              <div 
                                className={`manga-speech-bubble ${beat.bubbleStyle === 'shout' ? 'manga-speech-shout' : beat.bubbleStyle === 'thought' ? 'manga-speech-thought' : ''} ${isReadingActive ? 'manga-beat-reading-active' : ''}`}
                                style={{
                                  borderColor: isReadingActive ? '#f59e0b' : isSelected ? 'var(--accent-primary)' : undefined,
                                  boxShadow: isReadingActive ? '0 0 20px rgba(245, 158, 11, 0.6)' : isSelected ? '0 0 14px rgba(59, 130, 246, 0.35)' : undefined,
                                  transition: 'all 0.25s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {isReadingActive && (
                                  <div className="manga-beat-reading-tag">
                                    <Volume2 size={11} className="karaoke-pulse-icon" />
                                    <span>Đang đọc câu {beat.beatIdx + 1}/{allBeats.length}</span>
                                  </div>
                                )}

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
                                  {isReadingActive ? (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleStopAutoPlay(); }}
                                      className="cinema-btn-stop"
                                      title="Dừng đọc câu thoại này"
                                      style={{
                                        padding: '2px 9px',
                                        fontSize: '0.68rem'
                                      }}
                                    >
                                      <Square size={11} fill="currentColor" /> Dừng
                                    </button>
                                  ) : (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); startAutoPlay(beat.beatIdx); }}
                                      title="Bắt đầu đọc Manga từ câu này"
                                      style={{
                                        background: 'transparent',
                                        border: '1px solid var(--glass-border-strong)',
                                        color: 'var(--text-primary)',
                                        padding: '2px 7px',
                                        borderRadius: 4,
                                        fontSize: '0.68rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 3
                                      }}
                                    >
                                      <Volume2 size={11} /> Đọc
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* NARRATION BOX (KHUNG LỜI DẪN TRUYỆN TRANH) */
                            <div 
                              className={`manga-narration-box ${isReadingActive ? 'manga-beat-reading-active' : ''}`}
                              style={{
                                borderColor: isReadingActive ? '#f59e0b' : isSelected ? 'var(--accent-primary)' : undefined,
                                boxShadow: isReadingActive ? '0 0 20px rgba(245, 158, 11, 0.6)' : isSelected ? '0 0 14px rgba(59, 130, 246, 0.35)' : undefined,
                                transition: 'all 0.25s ease',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  color: 'var(--accent-primary)',
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}>
                                  📜 LỜI DẪN
                                </span>
                                {isReadingActive && (
                                  <div className="manga-beat-reading-tag" style={{ margin: 0 }}>
                                    <Volume2 size={10} className="karaoke-pulse-icon" />
                                    <span>Câu {beat.beatIdx + 1}/{allBeats.length}</span>
                                  </div>
                                )}
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

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 6,
                                marginTop: 6
                              }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleTranslate(beat.id, beat.text); }}
                                  title="Dịch lời dẫn này sang tiếng Việt"
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

                                {isReadingActive ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStopAutoPlay(); }}
                                    className="cinema-btn-stop"
                                    style={{
                                      padding: '2px 9px',
                                      fontSize: '0.68rem'
                                    }}
                                  >
                                    <Square size={11} fill="currentColor" /> Dừng
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); startAutoPlay(beat.beatIdx); }}
                                    title="Bắt đầu đọc Manga từ lời dẫn này"
                                    style={{
                                      background: 'transparent',
                                      border: '1px solid var(--glass-border-strong)',
                                      color: 'var(--text-primary)',
                                      padding: '2px 7px',
                                      borderRadius: 4,
                                      fontSize: '0.68rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 3
                                    }}
                                  >
                                    <Volume2 size={11} /> Đọc
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaReader;

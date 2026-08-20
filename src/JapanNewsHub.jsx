import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Newspaper, Globe, BookOpen, Volume2, Sparkles, ExternalLink, ArrowRight, 
  Search, Bookmark, Plus, Loader, CheckCircle, RefreshCw, Layers, ShieldCheck, 
  Briefcase, HeartHandshake, Eye, VolumeX, PencilLine, Share2, X, Compass, 
  Flame, BookCheck, MessageSquareQuote, ChevronRight, Play, Pause, FastForward
} from 'lucide-react';
import FuriganaText from './components/FuriganaText';
import SelectionDictionary from './components/SelectionDictionary';
import { 
  fetchLiveNews, 
  CURATED_JAPAN_NEWS, 
  detectGrammarInArticle, 
  translateArticleToVi 
} from './services/newsService.js';

const CATEGORIES = [
  { id: 'all', label: '🌐 Tất cả Tin tức', icon: Globe },
  { id: 'life', label: '🗾 Đời sống & Visa Người nước ngoài', icon: Compass },
  { id: 'economy', label: '📈 Kinh tế & Xã hội Nhật Bản', icon: Briefcase },
  { id: 'society', label: '🏛️ Thời sự & Tin nóng', icon: Newspaper },
  { id: 'culture', label: '🌸 Văn hóa & Tiếng Nhật Dễ', icon: Sparkles }
];

const JLPT_LEVEL_COLORS = {
  N5: '#10b981',
  N4: '#3b82f6',
  N3: '#f59e0b',
  N2: '#8b5cf6',
  N1: '#ef4444'
};

const JapanNewsHub = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Articles data & loading states
  const [articles, setArticles] = useState(CURATED_JAPAN_NEWS);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));

  // Modal Learning Tools State
  const [modalTab, setModalTab] = useState('reading'); // 'reading' | 'grammar' | 'shadowing'
  const [showBilingual, setShowBilingual] = useState(true);
  const [showFurigana, setShowFurigana] = useState(true);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [liveTranslation, setLiveTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Load news on category change or mount
  useEffect(() => {
    let isMounted = true;
    const loadNews = async () => {
      setIsLoadingNews(true);
      try {
        const data = await fetchLiveNews(activeCategory);
        if (isMounted && data && data.length > 0) {
          setArticles(data);
          setLastRefreshedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (e) {
        console.warn('Error fetching news:', e);
      } finally {
        if (isMounted) setIsLoadingNews(false);
      }
    };

    loadNews();
    return () => { isMounted = false; };
  }, [activeCategory]);

  // Manual Refresh Handler
  const handleManualRefresh = async () => {
    setIsLoadingNews(true);
    try {
      const data = await fetchLiveNews(activeCategory, true);
      if (data && data.length > 0) {
        setArticles(data);
        setLastRefreshedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.warn('Manual refresh error:', e);
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Filtered articles by search keyword
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchesCat = activeCategory === 'all' || art.category === activeCategory;
      const kw = searchKeyword.toLowerCase().trim();
      const matchesSearch = !kw || 
        art.title.toLowerCase().includes(kw) || 
        (art.summary && art.summary.toLowerCase().includes(kw)) ||
        (art.viTranslation && art.viTranslation.toLowerCase().includes(kw));
      return matchesCat && matchesSearch;
    });
  }, [articles, activeCategory, searchKeyword]);

  // Detected grammar in the currently selected article
  const detectedGrammars = useMemo(() => {
    if (!selectedArticle) return [];
    return detectGrammarInArticle(`${selectedArticle.title}\n${selectedArticle.content}`);
  }, [selectedArticle]);

  // Handle article selection & live translation if needed
  const handleOpenArticle = async (art) => {
    setSelectedArticle(art);
    setModalTab('reading');
    setLiveTranslation(art.viTranslation || '');
    
    // If live RSS without pre-translated Vietnamese, trigger auto-translation
    if (!art.viTranslation && art.content) {
      setIsTranslating(true);
      try {
        const vi = await translateArticleToVi(art.content);
        setLiveTranslation(vi);
      } catch (e) {
        console.warn('Translation error:', e);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  // TTS Reader logic
  const handlePlayTts = (text) => {
    if (!text || !window.speechSynthesis) return;
    if (isPlayingTts) {
      window.speechSynthesis.cancel();
      setIsPlayingTts(false);
      return;
    }

    setIsPlayingTts(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = ttsSpeed * 0.9;
    
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
    if (jpVoice) utterance.voice = jpVoice;

    utterance.onend = () => setIsPlayingTts(false);
    utterance.onerror = () => setIsPlayingTts(false);
    window.speechSynthesis.speak(utterance);
  };

  // Transfer article to Shadowing Studio 1-Click
  const handleTransferToShadowing = (article) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const rawSentences = article.content.split(/[\n。]/).map(s => s.trim()).filter(s => s.length > 2);
    let currentTime = 0;
    const segments = rawSentences.map(st => {
      const duration = Math.max(3, Math.round(st.length * 0.28 * 10) / 10);
      const seg = {
        start: currentTime,
        duration: duration,
        text: st.endsWith('。') ? st : st + '。',
        vi: '',
        startOffset: 0,
        endOffset: 0
      };
      currentTime += duration + 0.5;
      return seg;
    });

    const session = {
      title: article.title,
      segments: segments,
      currentSegIdx: 0,
      scores: {}
    };
    
    const savedStore = JSON.parse(localStorage.getItem('omni_shadowing_session_v3') || '{}');
    if (!savedStore.sessionStore) savedStore.sessionStore = {};
    savedStore.sessionStore.web = session;
    savedStore.activeTab = 'web';
    localStorage.setItem('omni_shadowing_session_v3', JSON.stringify(savedStore));

    navigate('/shadowing');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: '88vh' }}>
      
      {/* SELECTION DICTIONARY GLOBAL POPUP (Enabled on highlighting text) */}
      <SelectionDictionary />

      {/* TOP HEADER PORTAL BANNER */}
      <div className="glass-panel" style={{ padding: '22px 26px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.18))', border: '1px solid rgba(59,130,246,0.35)', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <Newspaper size={26} color="#60a5fa" />
            <h1 style={{ margin: 0, fontSize: '1.45rem', color: 'white', fontWeight: 800 }}>Japan News Hub & Living Portal</h1>
            <span style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399', padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 1.5s infinite' }}></span>
              Live RSS · Cập nhật liên tục
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Cổng thông tin Đời sống, Visa, Kinh tế & Xã hội Nhật Bản — Tích hợp <b>Tra Từ Điển 1-Click, Phân Tích Ngữ Pháp JLPT, Dịch Song Ngữ & Shadowing AI</b>.
          </p>
        </div>

        {/* Action Controls & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button 
            onClick={handleManualRefresh}
            disabled={isLoadingNews}
            className="btn btn-outline"
            style={{ padding: '8px 14px', borderRadius: 20, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, color: '#60a5fa', borderColor: 'rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.1)' }}
            title="Làm mới tin tức nóng nhất từ các nguồn RSS Nhật Bản"
          >
            <RefreshCw size={14} className={isLoadingNews ? 'animate-spin' : ''} />
            {isLoadingNews ? 'Đang cập nhật...' : `Làm mới (${lastRefreshedTime})`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.35)', padding: '6px 14px', borderRadius: 20, border: '1px solid var(--glass-border)' }}>
            <Search size={16} color="var(--text-tertiary)"/>
            <input 
              type="text" 
              placeholder="Tìm tin tức, visa, thuế..." 
              value={searchKeyword} 
              onChange={e => setSearchKeyword(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.85rem', width: 170 }}
            />
          </div>
        </div>
      </div>

      {/* CATEGORY FILTERS */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }} className="custom-scrollbar">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
            >
              <Icon size={15} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ARTICLES GRID */}
      {isLoadingNews && articles.length === 0 ? (
        <div className="glass-panel" style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: '#60a5fa' }} />
          <div>Đang nạp các bản tin nóng từ các nguồn tin tức Nhật Bản...</div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="glass-panel" style={{ padding: 50, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Newspaper size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
          <div>Không tìm thấy bản tin nào phù hợp với từ khóa "{searchKeyword}".</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18, flex: 1 }}>
          {filteredArticles.map(art => (
            <div 
              key={art.id}
              className="glass-panel"
              style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.25s', cursor: 'pointer' }}
              onClick={() => handleOpenArticle(art)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Article Image Banner */}
              <div style={{ height: 165, position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
                <img src={art.image} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }} />
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', padding: '3px 9px', borderRadius: 6, fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>
                  {art.categoryLabel}
                </div>
                {art.isLive && (
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(239,68,68,0.85)', padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', color: 'white', fontWeight: 700 }}>
                    🔴 Live RSS
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.65)', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  {art.source} · {art.date}
                </div>
              </div>

              {/* Article Text Content */}
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.45, color: 'white', fontWeight: 700 }} className="jp-text">
                  {art.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {art.summary}
                </p>

                {/* Card Footer Actions */}
                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <BookOpen size={14}/> Đọc bài & Tra từ
                  </span>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleTransferToShadowing(art); }}
                    className="btn btn-primary" 
                    style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Volume2 size={13}/> 🗣️ Shadowing
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ARTICLE READER MODAL (FULL INTERACTIVE LEARNING & GRAMMAR DETECTION) */}
      {selectedArticle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          
          <div className="glass-panel" style={{ width: '92%', maxWidth: 900, maxHeight: '92vh', display: 'flex', flexDirection: 'column', borderRadius: 18, overflow: 'hidden', background: '#0f172a', border: '1px solid var(--glass-border-strong)', animation: 'fadeIn 0.25s' }}>
            
            {/* Modal Top Header & Navigation Tabs */}
            <div style={{ padding: '16px 22px', background: '#1e293b', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              
              {/* Category & Source Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '3px 9px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>
                  {selectedArticle.categoryLabel}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>{selectedArticle.source} · {selectedArticle.date}</span>
              </div>

              {/* Learning Mode Switcher Tabs */}
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 3 }}>
                <button 
                  onClick={() => setModalTab('reading')} 
                  style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: modalTab === 'reading' ? 'rgba(59,130,246,0.3)' : 'transparent', color: modalTab === 'reading' ? '#60a5fa' : 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: modalTab === 'reading' ? 600 : 400 }}
                >
                  <BookOpen size={14}/> Đọc Song Ngữ
                </button>
                <button 
                  onClick={() => setModalTab('grammar')} 
                  style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: modalTab === 'grammar' ? 'rgba(139,92,246,0.3)' : 'transparent', color: modalTab === 'grammar' ? '#c084fc' : 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: modalTab === 'grammar' ? 600 : 400 }}
                >
                  <Sparkles size={14}/> Ngữ Pháp JLPT ({detectedGrammars.length})
                </button>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => { if(window.speechSynthesis) window.speechSynthesis.cancel(); setSelectedArticle(null); setIsPlayingTts(false); }} 
                className="btn-ghost" 
                style={{ padding: 6, color: 'var(--text-secondary)' }}
              >
                <X size={20}/>
              </button>

            </div>

            {/* Modal AI Toolbar */}
            <div style={{ padding: '10px 22px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setShowFurigana(prev => !prev)}
                  className={`btn ${showFurigana ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  {showFurigana ? 'Ẩn Furigana' : 'あ Hiện Furigana'}
                </button>

                <button 
                  onClick={() => setShowBilingual(prev => !prev)}
                  className={`btn ${showBilingual ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <Globe size={13}/> {showBilingual ? 'Ẩn Dịch Việt' : '🌐 Hiện Dịch Việt'}
                </button>

                {selectedArticle.link && (
                  <a 
                    href={selectedArticle.link} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                  >
                    <ExternalLink size={13}/> Nguồn gốc bài báo
                  </a>
                )}
              </div>

              {/* Audio Reader & Speed */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select 
                  value={ttsSpeed} 
                  onChange={e => setTtsSpeed(parseFloat(e.target.value))} 
                  style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', fontSize: '0.78rem' }}
                >
                  <option value={0.75}>0.75x (Chậm)</option>
                  <option value={1}>1.0x (Chuẩn)</option>
                  <option value={1.25}>1.25x (Nhanh)</option>
                </select>

                <button 
                  onClick={() => handlePlayTts(`${selectedArticle.title}。${selectedArticle.content}`)}
                  className={`btn ${isPlayingTts ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '4px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5, background: isPlayingTts ? '#10b981' : 'transparent' }}
                >
                  {isPlayingTts ? <VolumeX size={14}/> : <Volume2 size={14}/>} {isPlayingTts ? 'Dừng Đọc' : '🔊 Đọc Toàn Bài'}
                </button>

                <button 
                  onClick={() => handleTransferToShadowing(selectedArticle)}
                  className="btn btn-primary"
                  style={{ padding: '4px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <Volume2 size={14}/> 🗣️ Luyện Shadowing
                </button>
              </div>

            </div>

            {/* Modal Body Tabs */}
            <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }} className="custom-scrollbar">
              
              {/* TAB 1: BILINGUAL READING & WORD LOOKUP */}
              {modalTab === 'reading' && (
                <>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', lineHeight: 1.5, color: 'white', fontWeight: 800 }} className="jp-text">
                    {showFurigana ? <FuriganaText text={selectedArticle.title} /> : selectedArticle.title}
                  </h2>

                  <div style={{ fontSize: '0.82rem', color: '#10b981', padding: '8px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    💡 <b>Tra từ điển tức thì:</b> Hãy <b>bôi đen (highlight)</b> bất kỳ từ hoặc câu nào trong bài báo để mở popup tra từ điển, cách đọc Hán-Việt và bấm <b>[➕ Lưu vào Flashcards FSRS]</b>.
                  </div>

                  {/* Japanese Sentences + Vietnamese Translation */}
                  <div style={{ fontSize: '1.18rem', lineHeight: 2.1, color: '#e2e8f0' }}>
                    {selectedArticle.content.split('\n').filter(p => p.trim().length > 0).map((paragraph, pIdx) => {
                      const viParagraph = selectedArticle.viTranslation 
                        ? (selectedArticle.viTranslation.split('\n')[pIdx] || '')
                        : (pIdx === 0 ? liveTranslation : '');

                      return (
                        <div key={pIdx} style={{ marginBottom: 22, background: 'rgba(255,255,255,0.02)', padding: '14px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div className="jp-text" style={{ whiteSpace: 'pre-wrap' }}>
                            {showFurigana ? <FuriganaText text={paragraph} /> : paragraph}
                          </div>
                          
                          {showBilingual && (
                            <div style={{ fontSize: '0.94rem', color: '#94a3b8', borderLeft: '3px solid #3b82f6', paddingLeft: 14, marginTop: 8, fontStyle: 'italic', lineHeight: 1.6 }}>
                              {isTranslating && !viParagraph ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60a5fa' }}>
                                  <RefreshCw size={13} className="animate-spin" /> Đang dịch tiếng Việt...
                                </span>
                              ) : viParagraph || 'Chưa có bản dịch cho đoạn này.'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* TAB 2: DETECTED JLPT GRAMMAR IN ARTICLE */}
              {modalTab === 'grammar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={18} color="#c084fc" />
                      Các Mẫu Ngữ Pháp JLPT Phát Hiện Trong Bài Báo ({detectedGrammars.length} mẫu)
                    </h3>
                  </div>

                  {detectedGrammars.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Không phát hiện mẫu ngữ pháp đặc biệt nào trong bài viết này.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
                      {detectedGrammars.map((g, idx) => {
                        const levelCol = JLPT_LEVEL_COLORS[g.level] || '#60a5fa';
                        return (
                          <div 
                            key={idx} 
                            style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: `1px solid ${levelCol}33`, display: 'flex', flexDirection: 'column', gap: 8 }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }} className="jp-text">
                                {g.title}
                              </span>
                              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 12, background: `${levelCol}22`, color: levelCol, fontWeight: 700, border: `1px solid ${levelCol}44` }}>
                                {g.level}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.9rem', color: '#60a5fa', fontWeight: 600 }}>
                              {g.meaning}
                            </div>

                            {g.explanation && (
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: 6 }}>
                                {g.explanation.slice(0, 150)}{g.explanation.length > 150 ? '...' : ''}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default JapanNewsHub;

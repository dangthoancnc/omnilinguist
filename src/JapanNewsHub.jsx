import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Newspaper, Globe, BookOpen, Volume2, Sparkles, ExternalLink, ArrowLeft, ArrowRight, 
  Search, Bookmark, Plus, Loader, CheckCircle, RefreshCw, Layers, ShieldCheck, 
  Briefcase, HeartHandshake, Eye, VolumeX, PencilLine, Share2, X, Compass, 
  Flame, BookCheck, MessageSquareQuote, ChevronRight, Play, Pause, FastForward,
  TrendingUp, Clock, Calendar, BookmarkCheck, Lightbulb, DollarSign, CloudSun
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
  { id: 'life', label: '🗾 Đời sống, Visa & Thủ tục', icon: Compass },
  { id: 'economy', label: '📈 Kinh tế & Tỷ giá Yên', icon: TrendingUp },
  { id: 'society', label: '🏛️ Thời sự & Xã hội Nhật Bản', icon: Newspaper },
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
  const { articleId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Active states
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Articles data & loading states
  const [articles, setArticles] = useState(CURATED_JAPAN_NEWS);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));

  // Full-page Article Reader Tools State
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

  // Determine current active article from URL param or search param
  const currentArticleId = articleId || searchParams.get('id');
  const selectedArticle = useMemo(() => {
    if (!currentArticleId) return null;
    return articles.find(a => String(a.id) === String(currentArticleId)) || null;
  }, [currentArticleId, articles]);

  // Translate live article on opening if needed
  useEffect(() => {
    if (selectedArticle) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setLiveTranslation(selectedArticle.viTranslation || '');
      if (!selectedArticle.viTranslation && selectedArticle.content) {
        setIsTranslating(true);
        translateArticleToVi(selectedArticle.content)
          .then(vi => setLiveTranslation(vi))
          .catch(e => console.warn('Translation error:', e))
          .finally(() => setIsTranslating(false));
      }
    }
  }, [selectedArticle]);

  // Filtered articles by category & search
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

  // Hero Featured Article (First article)
  const heroArticle = filteredArticles[0] || null;
  const standardArticles = filteredArticles.slice(1);

  // Detected grammar in the active article
  const detectedGrammars = useMemo(() => {
    if (!selectedArticle) return [];
    return detectGrammarInArticle(`${selectedArticle.title}\n${selectedArticle.content}`);
  }, [selectedArticle]);

  // Related articles in the same category
  const relatedArticles = useMemo(() => {
    if (!selectedArticle) return [];
    return articles
      .filter(a => a.id !== selectedArticle.id && (a.category === selectedArticle.category || selectedArticle.category === 'all'))
      .slice(0, 3);
  }, [selectedArticle, articles]);

  // Navigation handlers
  const handleOpenArticle = (art) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlayingTts(false);
    navigate(`/news/${art.id}`);
  };

  const handleBackToNewsList = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlayingTts(false);
    navigate('/news');
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

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 1: FULL-PAGE ARTICLE READER (TRANG CHI TIẾT BÀI BÁO ĐẦY ĐỦ)
  // ══════════════════════════════════════════════════════════════════════════
  if (selectedArticle) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: '88vh', maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
        
        {/* SELECTION DICTIONARY (Interactive popup on text highlight) */}
        <SelectionDictionary />

        {/* STICKY TOP ACTION TOOLBAR */}
        <div className="glass-panel" style={{ position: 'sticky', top: 10, zIndex: 100, padding: '12px 18px', background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border-strong)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
          
          {/* Back Button */}
          <button 
            onClick={handleBackToNewsList}
            className="btn btn-outline"
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 6, color: '#60a5fa', borderColor: 'rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.1)', fontWeight: 600 }}
          >
            <ArrowLeft size={16}/> Quay lại danh sách tin
          </button>

          {/* Reading & Audio Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowFurigana(prev => !prev)}
              className={`btn ${showFurigana ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {showFurigana ? 'Ẩn Furigana' : 'あ Hiện Furigana'}
            </button>

            <button 
              onClick={() => setShowBilingual(prev => !prev)}
              className={`btn ${showBilingual ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Globe size={14}/> {showBilingual ? 'Ẩn Dịch Việt' : '🌐 Hiện Dịch Song Ngữ'}
            </button>

            {/* TTS Speed */}
            <select 
              value={ttsSpeed} 
              onChange={e => setTtsSpeed(parseFloat(e.target.value))} 
              style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.35)', color: 'white', border: '1px solid var(--glass-border)', fontSize: '0.8rem', outline: 'none' }}
            >
              <option value={0.75}>0.75x (Chậm)</option>
              <option value={1}>1.0x (Chuẩn)</option>
              <option value={1.25}>1.25x (Nhanh)</option>
            </select>

            {/* Audio Play/Stop Button */}
            <button 
              onClick={() => handlePlayTts(`${selectedArticle.title}。${selectedArticle.content}`)}
              className={`btn ${isPlayingTts ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, background: isPlayingTts ? '#10b981' : 'transparent' }}
            >
              {isPlayingTts ? <VolumeX size={15}/> : <Volume2 size={15}/>} {isPlayingTts ? 'Dừng Đọc' : '🔊 Đọc Toàn Bài'}
            </button>

            {/* Shadowing Transfer */}
            <button 
              onClick={() => handleTransferToShadowing(selectedArticle)}
              className="btn btn-primary"
              style={{ padding: '6px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              <Volume2 size={15}/> 🗣️ Luyện Shadowing
            </button>
          </div>

        </div>

        {/* ARTICLE HERO & HEADER */}
        <div className="glass-panel" style={{ padding: '32px 36px', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid var(--glass-border)' }}>
          
          {/* Metadata badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '4px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700 }}>
                {selectedArticle.categoryLabel}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Newspaper size={14}/> {selectedArticle.source}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={14}/> {selectedArticle.date}
              </span>
            </div>

            {selectedArticle.link && (
              <a 
                href={selectedArticle.link} 
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize: '0.82rem', color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(59,130,246,0.1)', borderRadius: 6 }}
              >
                <ExternalLink size={14}/> Xem nguồn gốc bài báo
              </a>
            )}
          </div>

          {/* Article Title */}
          <h1 style={{ margin: 0, fontSize: '1.75rem', lineHeight: 1.5, color: 'white', fontWeight: 800 }} className="jp-text">
            {showFurigana ? <FuriganaText text={selectedArticle.title} /> : selectedArticle.title}
          </h1>

          {/* Hint for Selection Dictionary */}
          <div style={{ fontSize: '0.86rem', color: '#10b981', padding: '10px 16px', background: 'rgba(16,185,129,0.12)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lightbulb size={18} color="#10b981" />
            <span><b>Mẹo tra từ & lưu từ vựng:</b> Hãy <b>bôi đen (highlight)</b> bất kỳ chữ Hán, từ vựng hoặc ngữ pháp nào trong bài để xem giải nghĩa tức thì và bấm nút <b>[➕ Lưu vào Flashcards FSRS]</b>.</span>
          </div>

          {/* Article Banner Image */}
          {selectedArticle.image && (
            <div style={{ width: '100%', height: 380, borderRadius: 16, overflow: 'hidden', margin: '10px 0', background: '#000', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
              <img src={selectedArticle.image} alt={selectedArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* ARTICLE CONTENT: PARAGRAPH-BY-PARAGRAPH BILINGUAL VIEW */}
          <div style={{ fontSize: '1.25rem', lineHeight: 2.2, color: '#f1f5f9', marginTop: 12 }}>
            {selectedArticle.content.split('\n').filter(p => p.trim().length > 0).map((paragraph, pIdx) => {
              const viParagraph = selectedArticle.viTranslation 
                ? (selectedArticle.viTranslation.split('\n')[pIdx] || '')
                : (pIdx === 0 ? liveTranslation : '');

              return (
                <div key={pIdx} style={{ marginBottom: 26, background: 'rgba(255,255,255,0.02)', padding: '20px 24px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="jp-text" style={{ whiteSpace: 'pre-wrap' }}>
                    {showFurigana ? <FuriganaText text={paragraph} /> : paragraph}
                  </div>
                  
                  {showBilingual && (
                    <div style={{ fontSize: '1.02rem', color: '#94a3b8', borderLeft: '4px solid #3b82f6', paddingLeft: 16, marginTop: 12, fontStyle: 'italic', lineHeight: 1.65 }}>
                      {isTranslating && !viParagraph ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60a5fa' }}>
                          <RefreshCw size={14} className="animate-spin" /> Đang tự động dịch tiếng Việt...
                        </span>
                      ) : viParagraph || 'Đang cập nhật bản dịch cho đoạn này...'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* SECTION 2: DETECTED JLPT BUNPRO GRAMMAR POINTS IN THIS ARTICLE */}
        <div className="glass-panel" style={{ padding: '28px 32px', borderRadius: 20, border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'white', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
              <Sparkles size={22} color="#c084fc" />
              Các Mẫu Ngữ Pháp JLPT Phát Hiện Trong Bài Báo ({detectedGrammars.length} mẫu)
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              Trích xuất tự động từ cơ sở dữ liệu 2.191 mẫu Bunpro N5-N1
            </span>
          </div>

          {detectedGrammars.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
              Bài viết sử dụng ngữ pháp đời sống cơ bản, không có mẫu ngữ pháp phức tạp đặc thù.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {detectedGrammars.map((g, idx) => {
                const levelCol = JLPT_LEVEL_COLORS[g.level] || '#60a5fa';
                return (
                  <div 
                    key={idx} 
                    style={{ background: 'rgba(255,255,255,0.03)', padding: 18, borderRadius: 14, border: `1px solid ${levelCol}33`, display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }} className="jp-text">
                        {g.title}
                      </span>
                      <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 12, background: `${levelCol}22`, color: levelCol, fontWeight: 700, border: `1px solid ${levelCol}44` }}>
                        {g.level}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.94rem', color: '#60a5fa', fontWeight: 600 }}>
                      {g.meaning}
                    </div>

                    {g.explanation && (
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: 8 }}>
                        {g.explanation.slice(0, 160)}{g.explanation.length > 160 ? '...' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: RELATED ARTICLES */}
        {relatedArticles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Newspaper size={20} color="#60a5fa" /> Bài viết cùng chuyên mục liên quan
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {relatedArticles.map(rel => (
                <div 
                  key={rel.id}
                  className="glass-panel"
                  style={{ padding: 18, borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleOpenArticle(rel)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                >
                  <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>{rel.categoryLabel}</div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', color: 'white', lineHeight: 1.4 }} className="jp-text">{rel.title}</h4>
                  <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{rel.source} · {rel.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 2: MODERN NEWS PORTAL LIST VIEW (TRANG CHỦ BÁO ĐIỆN TỬ HIỆN ĐẠI)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, minHeight: '88vh' }}>
      
      {/* SELECTION DICTIONARY GLOBAL POPUP */}
      <SelectionDictionary />

      {/* TOP HEADER PORTAL BANNER */}
      <div className="glass-panel" style={{ padding: '22px 28px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.18))', border: '1px solid rgba(59,130,246,0.35)', borderRadius: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
            <Newspaper size={28} color="#60a5fa" />
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'white', fontWeight: 800 }}>Japan News Hub & Living Portal</h1>
            <span style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399', padding: '3px 12px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 1.5s infinite' }}></span>
              Live RSS · Cập nhật liên tục
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Cổng thông tin Đời sống, Visa, Kinh tế & Xã hội Nhật Bản — Tích hợp <b>Tra Từ Điển 1-Click, Phân Tích Ngữ Pháp JLPT, Dịch Song Ngữ & Shadowing AI</b>.
          </p>
        </div>

        {/* Action Controls & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button 
            onClick={handleManualRefresh}
            disabled={isLoadingNews}
            className="btn btn-outline"
            style={{ padding: '8px 16px', borderRadius: 20, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6, color: '#60a5fa', borderColor: 'rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.1)' }}
            title="Làm mới tin tức nóng nhất từ các nguồn RSS Nhật Bản"
          >
            <RefreshCw size={14} className={isLoadingNews ? 'animate-spin' : ''} />
            {isLoadingNews ? 'Đang cập nhật...' : `Làm mới (${lastRefreshedTime})`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.35)', padding: '7px 16px', borderRadius: 20, border: '1px solid var(--glass-border)' }}>
            <Search size={16} color="var(--text-tertiary)"/>
            <input 
              type="text" 
              placeholder="Tìm tin tức, visa, thuế, nenkin..." 
              value={searchKeyword} 
              onChange={e => setSearchKeyword(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.85rem', width: 200 }}
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
              style={{ padding: '9px 18px', fontSize: '0.86rem', whiteSpace: 'nowrap', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s', fontWeight: isActive ? 700 : 500 }}
            >
              <Icon size={15} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* HERO FEATURED ARTICLE (BÀI TIÊU ĐIỂM NỔI BẬT ĐẦU TRANG) */}
      {heroArticle && !searchKeyword && (
        <div 
          className="glass-panel" 
          style={{ padding: 0, borderRadius: 20, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer', transition: 'transform 0.2s, boxShadow 0.2s', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
          onClick={() => handleOpenArticle(heroArticle)}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'; }}
        >
          {/* Hero Image */}
          <div style={{ minHeight: 280, position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
            <img src={heroArticle.image} alt={heroArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', padding: '4px 12px', borderRadius: 8, fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700 }}>
              🔥 Tin Tiêu Điểm · {heroArticle.categoryLabel}
            </div>
            {heroArticle.isLive && (
              <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(239,68,68,0.9)', padding: '3px 10px', borderRadius: 8, fontSize: '0.72rem', color: 'white', fontWeight: 800 }}>
                🔴 Live RSS
              </div>
            )}
          </div>

          {/* Hero Content Details */}
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                <span>{heroArticle.source}</span>
                <span>·</span>
                <span>{heroArticle.date}</span>
              </div>

              <h2 style={{ margin: 0, fontSize: '1.45rem', lineHeight: 1.45, color: 'white', fontWeight: 800 }} className="jp-text">
                {heroArticle.title}
              </h2>

              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {heroArticle.summary}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.9rem', color: '#60a5fa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                Đọc toàn bài & Tra từ <ArrowRight size={16}/>
              </span>

              <button 
                onClick={(e) => { e.stopPropagation(); handleTransferToShadowing(heroArticle); }}
                className="btn btn-primary" 
                style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <Volume2 size={14}/> 🗣️ Shadowing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-COLUMN MAIN CONTENT & SIDEBAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22, alignItems: 'start' }}>
        
        {/* LEFT MAIN GRID (DANH SÁCH BÀI BÁO) */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Newspaper size={20} color="#60a5fa" />
              {searchKeyword ? `Kết quả tìm kiếm ("${searchKeyword}")` : 'Danh sách tin tức mới nhất'}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{filteredArticles.length} bản tin</span>
          </div>

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
              {standardArticles.map(art => (
                <div 
                  key={art.id}
                  className="glass-panel"
                  style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.25s', cursor: 'pointer' }}
                  onClick={() => handleOpenArticle(art)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Article Thumbnail */}
                  <div style={{ height: 175, position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
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

                  {/* Text Content */}
                  <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.45, color: 'white', fontWeight: 700 }} className="jp-text">
                      {art.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {art.summary}
                    </p>

                    {/* Footer actions */}
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

        </div>

        {/* RIGHT SIDEBAR (WIDGETS & TIỆN ÍCH HỌC TẬP) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Widget 1: JPY / VND Exchange Rate & Market Info */}
          <div className="glass-panel" style={{ padding: 20, borderRadius: 16, border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarSign size={18} color="#10b981" /> Tỷ Giá & Thị Trường Hôm Nay
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>JPY / VND (Tham khảo)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>168.50 ₫</div>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 700 }}>+0.45%</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Đồng Yên đang duy trì vị thế ổn định, tạo thuận lợi cho kiều bào tích lũy và chuyển tiền về quê hương.
            </p>
          </div>

          {/* Widget 2: Trending Visa & Life Topics */}
          <div className="glass-panel" style={{ padding: 20, borderRadius: 16, border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={18} color="#f59e0b" /> Chủ Đề Đời Sống Nổi Bật
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { title: 'Thủ tục xin Visa Kỹ năng đặc định Tokutei 2', tag: 'Visa', color: '#60a5fa' },
                { title: 'Hướng dẫn kê khai người phụ thuộc giảm thuế', tag: 'Thuế', color: '#f59e0b' },
                { title: 'Kinh nghiệm thuê nhà UR không tiền lễ', tag: 'Nhà ở', color: '#10b981' }
              ].map((topic, tIdx) => (
                <div 
                  key={tIdx} 
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setSearchKeyword(topic.tag)}
                >
                  <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: 4, background: `${topic.color}22`, color: topic.color, fontWeight: 700 }}>
                    {topic.tag}
                  </span>
                  <span style={{ fontSize: '0.84rem', color: 'white', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {topic.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Learning Guide */}
          <div className="glass-panel" style={{ padding: 20, borderRadius: 16, border: '1px solid rgba(16,185,129,0.3)', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.08))', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lightbulb size={18} color="#34d399" /> Cách Học Qua Báo Hiệu Quả
            </h4>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Bật <b>Furigana</b> để đọc trôi chảy mọi chữ Hán.</li>
              <li>Bôi đen từ chưa biết để mở <b>Từ điển Hán-Việt 1-Click</b>.</li>
              <li>Xem <b>Phân tích Ngữ pháp JLPT</b> ở chân bài viết.</li>
              <li>Bấm <b>🗣️ Shadowing</b> để luyện phát âm theo câu.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};

export default JapanNewsHub;

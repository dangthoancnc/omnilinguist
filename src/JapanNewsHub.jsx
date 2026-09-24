import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Newspaper, Globe, BookOpen, Volume2, Sparkles, ExternalLink, ArrowLeft, ArrowRight, 
  Search, Bookmark, Plus, Loader, CheckCircle, RefreshCw, Layers, ShieldCheck, 
  Briefcase, HeartHandshake, Eye, VolumeX, PencilLine, Share2, X, Compass, 
  Flame, BookCheck, MessageSquareQuote, ChevronRight, ChevronLeft, Play, Pause, FastForward,
  TrendingUp, Clock, Calendar, BookmarkCheck, Lightbulb, DollarSign, CloudSun,
  Calculator, Check, ArrowRightLeft, Filter, BookMarked, Sun, Cloud, Wind,
  BadgeCheck, Award, Zap, AlertCircle
} from 'lucide-react';
import FuriganaText from './components/FuriganaText';
import { 
  fetchLiveNews, 
  CURATED_JAPAN_NEWS, 
  BREAKING_NEWS_TICKER, 
  JAPAN_WEATHER_DATA, 
  DAILY_NEWS_KANJI_VOCAB,
  detectGrammarInArticle, 
  translateArticleToVi 
} from './services/newsService.js';
import { addCustomCard, getCustomCards } from './studyStore.js';

const CATEGORIES = [
  { id: 'all', label: '🌐 Tất cả Tin tức', icon: Globe },
  { id: 'life', label: '🗾 Đời sống, Visa & Thủ tục', icon: Compass },
  { id: 'economy', label: '📈 Kinh tế & Tỷ giá Yên', icon: TrendingUp },
  { id: 'society', label: '🏛️ Thời sự & Xã hội', icon: Newspaper },
  { id: 'culture', label: '🌸 Văn hóa & Tiếng Nhật Dễ', icon: Sparkles }
];

const JLPT_LEVEL_FILTERS = [
  { id: 'ALL', label: 'Tất cả trình độ' },
  { id: 'EASY', label: 'N5-N4 Dễ (NHK Easy)', levels: ['N5', 'N4'] },
  { id: 'N3', label: 'N3 Trung cấp', levels: ['N3'] },
  { id: 'HARD', label: 'N2-N1 Báo chí & Chuyên sâu', levels: ['N2', 'N1'] }
];

const JLPT_LEVEL_COLORS = {
  N5: '#10b981',
  N4: '#3b82f6',
  N3: '#f59e0b',
  N2: '#8b5cf6',
  N1: '#ef4444'
};

const TRENDING_TOPICS = [
  { id: 'news_tokutei_ginou_2026', title: 'Visa Kỹ năng đặc định Tokutei 2 nới lỏng', tag: 'Visa', color: '#3b82f6' },
  { id: 'news_tax_nenkin_guide', title: 'Kê khai người phụ thuộc giảm thuế & Nenkin', tag: 'Thuế', color: '#f59e0b' },
  { id: 'news_ur_housing_life', title: 'Thuê nhà UR không tiền lễ, không bảo lãnh', tag: 'Nhà ở', color: '#10b981' },
  { id: 'news_medical_insurance_japan', title: 'Bảo hiểm Y tế Quốc dân & Chế độ Viện phí cao', tag: 'Y tế', color: '#ec4899' },
  { id: 'news_driving_license_convert', title: 'Đổi bằng lái xe Việt sang Nhật (Gaimen Kirikae)', tag: 'Bằng lái', color: '#8b5cf6' },
  { id: 'news_bank_yucho_guide', title: 'Mở tài khoản Yucho & chuyển tiền về nước', tag: 'Ngân hàng', color: '#06b6d4' }
];

const FALLBACK_CATEGORY_IMAGES = {
  life: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=60',
  economy: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=60',
  society: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=600&auto=format&fit=crop&q=60',
  culture: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=60'
};

function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/[\u0300-\u036f]/g, '');
  return str.trim();
}

const JapanNewsHub = () => {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter & Search states
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeJlptFilter, setActiveJlptFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  
  // Breaking News Ticker state
  const [tickerIndex, setTickerIndex] = useState(0);

  // Currency Converter Interactive State
  const [calcDirection, setCalcDirection] = useState('jpy_to_vnd'); // 'jpy_to_vnd' | 'vnd_to_jpy'
  const [calcAmount, setCalcAmount] = useState('100000');
  const JPY_VND_RATE = 168.5; // Reference exchange rate

  // Daily Kanji / Vocab Saved state
  const [savedVocabMap, setSavedVocabMap] = useState({});

  // Grammar Sidebar Filter
  const [grammarLevelFilter, setGrammarLevelFilter] = useState('ALL');

  // Articles data & loading states
  const [articles, setArticles] = useState(CURATED_JAPAN_NEWS);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );

  // Full-page Article Reader Tools State
  const [showBilingual, setShowBilingual] = useState(true);
  const [showFurigana, setShowFurigana] = useState(true);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [liveTranslation, setLiveTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Initialize saved vocab map from custom cards
  useEffect(() => {
    try {
      const cards = getCustomCards() || [];
      const map = {};
      cards.forEach(c => {
        if (c.word) map[c.word] = true;
      });
      setSavedVocabMap(map);
    } catch (e) {
      console.warn('Error reading custom cards:', e);
    }
  }, []);

  // Auto-cycle breaking news ticker
  useEffect(() => {
    if (!BREAKING_NEWS_TICKER || BREAKING_NEWS_TICKER.length === 0) return;
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % BREAKING_NEWS_TICKER.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(10);
  }, [activeCategory, activeJlptFilter, searchKeyword]);

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

  // Intelligent Search + Category + JLPT Filtering
  const filteredArticles = useMemo(() => {
    let list = articles;

    // 1. Filter by Category
    if (activeCategory !== 'all') {
      list = list.filter(art => art.category === activeCategory);
    }

    // 2. Filter by JLPT Level
    if (activeJlptFilter !== 'ALL') {
      const targetFilter = JLPT_LEVEL_FILTERS.find(f => f.id === activeJlptFilter);
      if (targetFilter && targetFilter.levels) {
        list = list.filter(art => {
          const artLvl = art.level || 'N3';
          return targetFilter.levels.includes(artLvl);
        });
      }
    }

    // 3. Filter by Search Keyword
    const rawKw = searchKeyword.trim();
    if (rawKw) {
      const normKw = removeVietnameseTones(rawKw);
      list = list.filter(art => {
        const titleNorm = removeVietnameseTones(art.title);
        const sumNorm = removeVietnameseTones(art.summary || '');
        const viNorm = removeVietnameseTones(art.viTranslation || '');
        const catNorm = removeVietnameseTones(art.categoryLabel || '');
        const srcNorm = removeVietnameseTones(art.source || '');
        
        return titleNorm.includes(normKw) || 
               sumNorm.includes(normKw) || 
               viNorm.includes(normKw) || 
               catNorm.includes(normKw) || 
               srcNorm.includes(normKw) ||
               art.title.toLowerCase().includes(rawKw.toLowerCase()) ||
               (art.content && art.content.toLowerCase().includes(rawKw.toLowerCase()));
      });
    }

    return list;
  }, [articles, activeCategory, activeJlptFilter, searchKeyword]);

  // Layout splits: Lead + Sub-leads + Remaining
  const heroLeadArticle = filteredArticles[0] || null;
  const heroSubArticles = filteredArticles.slice(1, 4);
  const fastHeadlines = filteredArticles.slice(4, 9);
  const remainingArticles = filteredArticles.slice(4);

  // Detected grammar in the active article
  const detectedGrammars = useMemo(() => {
    if (!selectedArticle) return [];
    return detectGrammarInArticle(`${selectedArticle.title}\n${selectedArticle.content}`);
  }, [selectedArticle]);

  // Filtered grammar by JLPT Level
  const filteredDetectedGrammars = useMemo(() => {
    if (grammarLevelFilter === 'ALL') return detectedGrammars;
    return detectedGrammars.filter(g => g.level === grammarLevelFilter);
  }, [detectedGrammars, grammarLevelFilter]);

  // Related articles in the same category
  const relatedArticles = useMemo(() => {
    if (!selectedArticle) return [];
    return articles
      .filter(a => a.id !== selectedArticle.id && (a.category === selectedArticle.category || selectedArticle.category === 'all'))
      .slice(0, 3);
  }, [selectedArticle, articles]);

  // Navigation handlers
  const handleOpenArticle = (art) => {
    if (!art) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlayingTts(false);
    navigate(`/news/${art.id}`);
  };

  const handleOpenTopic = (topicId) => {
    const art = articles.find(a => a.id === topicId) || CURATED_JAPAN_NEWS.find(a => a.id === topicId);
    if (art) {
      handleOpenArticle(art);
    }
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
    const viLines = (article.viTranslation || '').split('\n').map(s => s.trim()).filter(s => s.length > 0);
    const segments = rawSentences.map((st, idx) => {
      const duration = Math.max(3, Math.round(st.length * 0.28 * 10) / 10);
      const seg = {
        start: currentTime,
        duration: duration,
        text: st.endsWith('。') ? st : st + '。',
        vi: viLines[idx] || '',
        startOffset: 0,
        endOffset: 0
      };
      currentTime += duration + 0.5;
      return seg;
    });

    const payload = {
      id: `news_${article.id}_${Date.now()}`,
      title: `[Tin tức] ${article.title}`,
      segments: segments,
      sourceType: 'news'
    };

    // Save to dedicated import key
    localStorage.setItem('omni_shadowing_imported_news', JSON.stringify(payload));

    const savedStore = JSON.parse(localStorage.getItem('omni_shadowing_session_v3') || '{}');
    if (!savedStore.sessionStore) savedStore.sessionStore = {};
    savedStore.sessionStore.web = {
      title: payload.title,
      segments: segments,
      currentSegIdx: 0,
      scores: {}
    };
    savedStore.activeTab = 'web';
    localStorage.setItem('omni_shadowing_session_v3', JSON.stringify(savedStore));

    // Dispatch realtime event to mounted instance
    window.dispatchEvent(new CustomEvent('omni_shadowing_import', { detail: payload }));

    navigate('/shadowing', { state: { importedNews: payload, t: Date.now() } });
  };

  // Add vocabulary to Flashcards FSRS
  const handleSaveVocabToFlashcards = (v) => {
    const success = addCustomCard({
      word: v.kanji,
      reading: v.reading,
      meaning: `${v.sino ? `[${v.sino}] ` : ''}${v.meaning}${v.example ? `\nVD: ${v.example}` : ''}`
    });
    setSavedVocabMap(prev => ({ ...prev, [v.kanji]: true }));
  };

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 1: DUAL-PANEL ARTICLE READER (BỐ CỤC 2 PANEL SONG SONG: TIN & NGỮ PHÁP)
  // ══════════════════════════════════════════════════════════════════════════
  if (selectedArticle) {
    const artLevel = selectedArticle.level || 'N3';
    const levelColor = JLPT_LEVEL_COLORS[artLevel] || '#3b82f6';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '88vh', maxWidth: 1360, margin: '0 auto', paddingBottom: 60 }}>
        
        {/* STICKY TOP ACTION TOOLBAR */}
        <div 
          className="glass-panel" 
          style={{ 
            position: 'sticky', 
            top: 10, 
            zIndex: 100, 
            padding: '12px 18px', 
            background: 'var(--bg-card)', 
            backdropFilter: 'blur(16px)', 
            border: '1px solid var(--glass-border-strong)', 
            borderRadius: 14, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: 12, 
            boxShadow: 'var(--glass-shadow)' 
          }}
        >
          {/* Back Button */}
          <button 
            onClick={handleBackToNewsList}
            className="btn btn-outline"
            style={{ 
              padding: '8px 16px', 
              borderRadius: 8, 
              fontSize: '0.86rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              color: 'var(--accent-primary)', 
              borderColor: 'var(--glass-border-strong)',
              fontWeight: 600 
            }}
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
              style={{ 
                padding: '6px 10px', 
                borderRadius: 8, 
                background: 'var(--bg-elevated)', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--glass-border)', 
                fontSize: '0.8rem', 
                outline: 'none' 
              }}
            >
              <option value={0.75}>0.75x (Chậm)</option>
              <option value={1}>1.0x (Chuẩn)</option>
              <option value={1.25}>1.25x (Nhanh)</option>
            </select>

            {/* Audio Play/Stop Button */}
            <button 
              onClick={() => handlePlayTts(`${selectedArticle.title}。${selectedArticle.content}`)}
              className={`btn ${isPlayingTts ? 'btn-primary' : 'btn-outline'}`}
              style={{ 
                padding: '6px 14px', 
                fontSize: '0.82rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                background: isPlayingTts ? 'var(--accent-success)' : 'transparent',
                borderColor: isPlayingTts ? 'var(--accent-success)' : 'var(--glass-border)'
              }}
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

        {/* 2-PANEL LAYOUT: MAIN ARTICLE (LEFT) + PARALLEL GRAMMAR SIDEBAR (RIGHT) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 20, alignItems: 'start' }}>
          
          {/* 📰 LEFT PANEL: ARTICLE READING & BILINGUAL CONTENT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            <div className="glass-panel" style={{ padding: '18px 24px', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid var(--glass-border)', background: 'var(--bg-card)' }}>
              
              {/* Metadata badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '3px 9px', borderRadius: 6, fontSize: '0.74rem', fontWeight: 700 }}>
                    {selectedArticle.categoryLabel}
                  </span>
                  <span style={{ background: `${levelColor}22`, color: levelColor, border: `1px solid ${levelColor}55`, padding: '2px 8px', borderRadius: 6, fontSize: '0.74rem', fontWeight: 800 }}>
                    Trình độ: {artLevel}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Newspaper size={13}/> {selectedArticle.source}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={13}/> {selectedArticle.date}
                  </span>
                </div>

                {selectedArticle.link && (
                  <a 
                    href={selectedArticle.link} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'var(--accent-subtle)', borderRadius: 6 }}
                  >
                    <ExternalLink size={13}/> Nguồn bài báo
                  </a>
                )}
              </div>

              {/* Article Title */}
              <h1 style={{ margin: 0, fontSize: '1.35rem', lineHeight: 1.35, color: 'var(--text-primary)', fontWeight: 800 }} className="jp-text">
                {showFurigana ? <FuriganaText text={selectedArticle.title} /> : selectedArticle.title}
              </h1>

              {/* Hint for Selection Dictionary */}
              <div style={{ fontSize: '0.76rem', color: 'var(--accent-success)', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lightbulb size={15} color="var(--accent-success)" />
                <span><b>Tra từ điển tức thì:</b> Hãy <b>bôi đen (highlight)</b> chữ Hán hoặc từ vựng trong bài để xem phiên âm & lưu vào Flashcards.</span>
              </div>

              {/* Article Banner Image */}
              {selectedArticle.image && (
                <div style={{ width: '100%', height: 180, borderRadius: 10, overflow: 'hidden', margin: '4px 0', background: 'var(--bg-elevated)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  <img 
                    src={selectedArticle.image} 
                    alt={selectedArticle.title} 
                    onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGES[selectedArticle.category] || FALLBACK_CATEGORY_IMAGES.life; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              )}

              {/* ARTICLE CONTENT: PARAGRAPH-BY-PARAGRAPH BILINGUAL VIEW */}
              <div style={{ fontSize: '1.18rem', lineHeight: 2.1, color: 'var(--text-primary)', marginTop: 8 }}>
                {selectedArticle.content.split('\n').filter(p => p.trim().length > 0).map((paragraph, pIdx) => {
                  const viParagraph = selectedArticle.viTranslation 
                    ? (selectedArticle.viTranslation.split('\n')[pIdx] || '')
                    : (pIdx === 0 ? liveTranslation : '');

                  return (
                    <div key={pIdx} style={{ marginBottom: 20, background: 'var(--bg-elevated)', padding: '16px 20px', borderRadius: 14, border: '1px solid var(--glass-border)' }}>
                      <div className="jp-text" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                        {showFurigana ? <FuriganaText text={paragraph} /> : paragraph}
                      </div>
                      
                      {showBilingual && (
                        <div style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', borderLeft: '4px solid var(--accent-primary)', paddingLeft: 14, marginTop: 10, lineHeight: 1.6 }}>
                          {isTranslating && !viParagraph ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-primary)' }}>
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

            {/* RELATED ARTICLES */}
            {relatedArticles.length > 0 && (
              <div className="glass-panel" style={{ padding: 22, borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Newspaper size={18} color="var(--accent-primary)" /> Tin tức liên quan cùng chuyên mục
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {relatedArticles.map(rel => (
                    <div 
                      key={rel.id}
                      style={{ padding: 14, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => handleOpenArticle(rel)}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{rel.categoryLabel}</span>
                        {rel.level && (
                          <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 4, background: `${JLPT_LEVEL_COLORS[rel.level] || '#3b82f6'}22`, color: JLPT_LEVEL_COLORS[rel.level] || '#3b82f6', fontWeight: 700 }}>
                            {rel.level}
                          </span>
                        )}
                      </div>
                      <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.4 }} className="jp-text">{rel.title}</h4>
                      <div style={{ marginTop: 'auto', fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>{rel.source} · {rel.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* 🔍 RIGHT PANEL: STICKY PARALLEL JLPT GRAMMAR ANALYZER */}
          <div style={{ position: 'sticky', top: 76, maxHeight: 'calc(100vh - 96px)', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }} className="custom-scrollbar">
            
            <div className="glass-panel" style={{ padding: 20, borderRadius: 18, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={18} color="var(--accent-primary)" />
                  Ngữ Pháp JLPT Trong Bài ({detectedGrammars.length})
                </h3>
              </div>

              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                Trích xuất tự động theo thời gian thực từ 2.191 mẫu Bunpro N5-N1.
              </p>

              {/* JLPT Level Filter Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setGrammarLevelFilter(lvl)}
                    style={{
                      padding: '3px 9px',
                      borderRadius: 12,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      border: '1px solid',
                      cursor: 'pointer',
                      background: grammarLevelFilter === lvl ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                      borderColor: grammarLevelFilter === lvl ? 'var(--accent-primary)' : 'var(--glass-border)',
                      color: grammarLevelFilter === lvl ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    {lvl === 'ALL' ? 'Tất cả' : lvl}
                  </button>
                ))}
              </div>

              {/* Grammar Cards List */}
              {filteredDetectedGrammars.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem', background: 'var(--bg-elevated)', borderRadius: 10 }}>
                  Không có mẫu {grammarLevelFilter} nào được phát hiện trong bài viết này.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredDetectedGrammars.map((g, idx) => {
                    const levelCol = JLPT_LEVEL_COLORS[g.level] || '#60a5fa';
                    return (
                      <div 
                        key={idx}
                        style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 12, border: `1px solid ${levelCol}33`, display: 'flex', flexDirection: 'column', gap: 8, transition: 'all 0.2s' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }} className="jp-text">
                            {g.title}
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 10, background: `${levelCol}22`, color: levelCol, fontWeight: 700, border: `1px solid ${levelCol}44` }}>
                            {g.level}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.86rem', color: 'var(--accent-primary)', fontWeight: 600, lineHeight: 1.4 }}>
                          {g.meaning}
                        </div>

                        {g.explanation && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: 6 }}>
                            {g.explanation.slice(0, 140)}{g.explanation.length > 140 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Sidebar Quick Shortcuts */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button 
                  onClick={() => navigate('/grammar')}
                  className="btn btn-outline"
                  style={{ padding: '6px 10px', fontSize: '0.76rem', justifyContent: 'center', gap: 6, color: 'var(--accent-primary)', borderColor: 'var(--glass-border)' }}
                >
                  <Sparkles size={13}/> Tra cứu toàn bộ 2.191 Mẫu Ngữ Pháp
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 2: MODERN HIGH-DENSITY JAPAN NEWS & LIVING PORTAL
  // ══════════════════════════════════════════════════════════════════════════
  const currentTicker = BREAKING_NEWS_TICKER[tickerIndex] || BREAKING_NEWS_TICKER[0];

  // Currency Converter Output
  const numInput = parseFloat(calcAmount.replace(/,/g, '')) || 0;
  const calculatedResult = calcDirection === 'jpy_to_vnd'
    ? `${(numInput * JPY_VND_RATE).toLocaleString('vi-VN')} ₫`
    : `${Math.round(numInput / JPY_VND_RATE).toLocaleString('ja-JP')} ¥`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '88vh', maxWidth: 1360, margin: '0 auto', paddingBottom: 60 }}>
      
      {/* 🔴 1. BREAKING NEWS TICKER (速報 · ĐIỂM TIN NÓNG LIÊN TỤC) */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '8px 16px', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: 12, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          overflow: 'hidden' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.2s infinite' }}></span>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#ef4444', letterSpacing: '0.5px' }}>速報 · TIN NÓNG</span>
        </div>

        {/* Ticker Content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', minWidth: 0 }}>
          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6, background: 'var(--accent-subtle)', color: 'var(--accent-primary)', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {currentTicker?.tag}
          </span>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentTicker?.text}
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
            <Clock size={12} style={{ display: 'inline', marginRight: 3 }} /> {currentTicker?.time}
          </span>
        </div>

        {/* Ticker controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button 
            onClick={() => setTickerIndex(prev => (prev - 1 + BREAKING_NEWS_TICKER.length) % BREAKING_NEWS_TICKER.length)}
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '3px 6px', borderRadius: 6, cursor: 'pointer' }}
            title="Tin trước"
          >
            <ChevronLeft size={13}/>
          </button>
          <button 
            onClick={() => setTickerIndex(prev => (prev + 1) % BREAKING_NEWS_TICKER.length)}
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '3px 6px', borderRadius: 6, cursor: 'pointer' }}
            title="Tin tiếp theo"
          >
            <ChevronRight size={13}/>
          </button>
        </div>
      </div>

      {/* 📰 2. TOP PORTAL HEADER & SEARCH */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px 22px', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: 16, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 14 
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <Newspaper size={24} color="var(--accent-primary)" />
            <h1 style={{ margin: 0, fontSize: '1.38rem', color: 'var(--text-primary)', fontWeight: 800 }}>
              Cổng Tin Tức & Đời Sống Nhật Bản
            </h1>
            <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--accent-success)', padding: '2px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-success)' }}></span>
              Live RSS & Cẩm Nang
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.4 }}>
            Tin thời sự, Visa, Thuế, Nhà ở, Tỷ giá Yên — <b>Tra Từ Điển 1-Click, Phân Tích Ngữ Pháp Song Song, Dịch Song Ngữ & Shadowing AI</b>.
          </p>
        </div>

        {/* Action Controls & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button 
            onClick={handleManualRefresh}
            disabled={isLoadingNews}
            className="btn btn-outline"
            style={{ padding: '7px 14px', borderRadius: 20, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-primary)', borderColor: 'var(--glass-border)' }}
            title="Làm mới tin tức nóng nhất từ các nguồn RSS Nhật Bản"
          >
            <RefreshCw size={14} className={isLoadingNews ? 'animate-spin' : ''} />
            {isLoadingNews ? 'Đang cập nhật...' : `Làm mới (${lastRefreshedTime})`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', padding: '6px 14px', borderRadius: 20, border: '1px solid var(--glass-border)', position: 'relative' }}>
            <Search size={15} color="var(--text-tertiary)"/>
            <input 
              type="text" 
              placeholder="Tìm kiếm tin tức, visa, thuế..." 
              value={searchKeyword} 
              onChange={e => setSearchKeyword(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.84rem', width: 180 }}
            />
            {searchKeyword && (
              <button 
                onClick={() => setSearchKeyword('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 2, display: 'flex' }}
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🧭 3. DUAL FILTER SYSTEM: CATEGORY TABS + JLPT LEVEL PILLS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        
        {/* Row 1: Category Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }} className="custom-scrollbar">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button 
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); }}
                className={`btn ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                style={{ 
                  padding: '7px 14px', 
                  fontSize: '0.84rem', 
                  whiteSpace: 'nowrap', 
                  borderRadius: 10, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  transition: 'all 0.2s', 
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? 'none' : '1px solid var(--glass-border)'
                }}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Row 2: JLPT Level Filters (NHK Easy N5-N4 vs Trung cấp N3 vs Báo chí N2-N1) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: 'var(--bg-card)', padding: '8px 14px', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700 }}>
            <Filter size={13} /> Phân loại cấp độ đọc:
          </span>
          
          {JLPT_LEVEL_FILTERS.map(flt => {
            const isLvlActive = activeJlptFilter === flt.id;
            return (
              <button
                key={flt.id}
                onClick={() => setActiveJlptFilter(flt.id)}
                style={{
                  padding: '4px 11px',
                  borderRadius: 20,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  border: '1px solid',
                  cursor: 'pointer',
                  background: isLvlActive ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  borderColor: isLvlActive ? 'var(--accent-primary)' : 'var(--glass-border)',
                  color: isLvlActive ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.18s ease'
                }}
              >
                {flt.label}
              </button>
            );
          })}

          <span style={{ marginLeft: 'auto', fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
            Đang hiển thị <b>{filteredArticles.length}</b> bản tin
          </span>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          4. VNEXPRESS / YAHOO STYLE TOP FOCUS GRID (1 MAIN LEAD + 3 SUB-LEADS + FAST BULLETINS)
          ══════════════════════════════════════════════════════════════════════ */}
      {heroLeadArticle && !searchKeyword && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: 16, alignItems: 'stretch' }}>
          
          {/* MAIN LEAD ARTICLE (BÊN TRÁI - ẢNH LỚN & ĐẦY ĐỦ TIỆN ÍCH) */}
          <div 
            className="glass-panel"
            style={{ 
              padding: 0, 
              borderRadius: 16, 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column', 
              border: '1px solid var(--glass-border)', 
              background: 'var(--bg-card)',
              cursor: 'pointer', 
              transition: 'all 0.25s', 
              boxShadow: 'var(--glass-shadow)' 
            }}
            onClick={() => handleOpenArticle(heroLeadArticle)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
          >
            <div style={{ height: 260, position: 'relative', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
              <img 
                src={heroLeadArticle.image} 
                alt={heroLeadArticle.title} 
                onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGES[heroLeadArticle.category] || FALLBACK_CATEGORY_IMAGES.life; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', padding: '3px 10px', borderRadius: 6, fontSize: '0.74rem', color: '#60a5fa', fontWeight: 700 }}>
                🔥 Tiêu Điểm · {heroLeadArticle.categoryLabel}
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                {heroLeadArticle.level && (
                  <span style={{ background: JLPT_LEVEL_COLORS[heroLeadArticle.level] || '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800 }}>
                    {heroLeadArticle.level}
                  </span>
                )}
                {heroLeadArticle.isLive && (
                  <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 800 }}>
                    🔴 Live RSS
                  </span>
                )}
              </div>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10, flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                  <span>{heroLeadArticle.source}</span>
                  <span>·</span>
                  <span>{heroLeadArticle.date}</span>
                  <span>·</span>
                  <span>⏱️ ~{Math.max(1, Math.ceil((heroLeadArticle.content?.length || 400) / 300))} phút đọc</span>
                </div>

                <h2 style={{ margin: 0, fontSize: '1.25rem', lineHeight: 1.4, color: 'var(--text-primary)', fontWeight: 800 }} className="jp-text">
                  {heroLeadArticle.title}
                </h2>

                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {heroLeadArticle.summary}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--accent-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  Đọc bài & Tra từ Hán-Việt <ArrowRight size={14}/>
                </span>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleTransferToShadowing(heroLeadArticle); }}
                  className="btn btn-primary" 
                  style={{ padding: '5px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Volume2 size={13}/> 🗣️ Luyện Shadowing
                </button>
              </div>
            </div>
          </div>

          {/* 3 SUB-LEADS + FAST HEADLINES (BÊN PHẢI - TIN NHANH MẬT ĐỘ CAO) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {heroSubArticles.map(sub => {
              const subLvlColor = JLPT_LEVEL_COLORS[sub.level] || '#3b82f6';
              return (
                <div 
                  key={sub.id}
                  className="glass-panel"
                  style={{ 
                    padding: 12, 
                    borderRadius: 14, 
                    border: '1px solid var(--glass-border)', 
                    background: 'var(--bg-card)',
                    display: 'grid', 
                    gridTemplateColumns: '100px 1fr', 
                    gap: 12, 
                    cursor: 'pointer', 
                    transition: 'all 0.2s', 
                    flex: 1, 
                    alignItems: 'center' 
                  }}
                  onClick={() => handleOpenArticle(sub)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                  <div style={{ height: 74, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                    <img 
                      src={sub.image} 
                      alt={sub.title} 
                      onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGES[sub.category] || FALLBACK_CATEGORY_IMAGES.life; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{sub.categoryLabel}</span>
                      {sub.level && (
                        <span style={{ fontSize: '0.64rem', padding: '1px 5px', borderRadius: 4, background: `${subLvlColor}22`, color: subLvlColor, fontWeight: 700 }}>
                          {sub.level}
                        </span>
                      )}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} className="jp-text">
                      {sub.title}
                    </h4>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{sub.source} · {sub.date}</div>
                  </div>
                </div>
              );
            })}

            {/* Fast Bulletin Snippets (Chớp nhoáng 2 bản tin tiếp) */}
            {fastHeadlines.length > 0 && (
              <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ⚡ Điểm tin nhanh khác:
                </div>
                {fastHeadlines.slice(0, 2).map(fast => (
                  <div 
                    key={fast.id}
                    onClick={() => handleOpenArticle(fast)}
                    style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    <ChevronRight size={12} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="jp-text">{fast.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          5. TWO-COLUMN MAIN NEWS FEED (68%) & LIVING UTILITIES SIDEBAR (32%)
          ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 20, alignItems: 'start' }}>
        
        {/* LEFT COLUMN: HIGH-DENSITY NEWS FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--glass-border)', paddingBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Newspaper size={17} color="var(--accent-primary)" />
              {searchKeyword ? `Kết quả tìm kiếm cho "${searchKeyword}"` : 'Dòng thời sự & Cẩm nang đời sống'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              Hiển thị {Math.min(visibleCount, (searchKeyword ? filteredArticles : remainingArticles).length)} / {(searchKeyword ? filteredArticles : remainingArticles).length} bài
            </span>
          </div>

          {isLoadingNews && articles.length === 0 ? (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: 'var(--accent-primary)' }} />
              <div>Đang tải dòng tin tức nóng từ các nguồn tin tức Nhật Bản...</div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <Newspaper size={32} style={{ opacity: 0.5 }} />
              <div>Không tìm thấy bản tin nào phù hợp với bộ lọc hiện tại.</div>
              <button 
                onClick={() => { setActiveCategory('all'); setActiveJlptFilter('ALL'); setSearchKeyword(''); }}
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                Đặt lại toàn bộ bộ lọc
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(searchKeyword ? filteredArticles : remainingArticles).slice(0, visibleCount).map(art => {
                const artLvlColor = JLPT_LEVEL_COLORS[art.level] || '#3b82f6';
                const readMinutes = Math.max(1, Math.ceil((art.content?.length || 400) / 300));

                return (
                  <div 
                    key={art.id}
                    className="glass-panel"
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '170px 1fr', 
                      gap: 14, 
                      overflow: 'hidden', 
                      borderRadius: 14, 
                      border: '1px solid var(--glass-border)', 
                      background: 'var(--bg-card)',
                      transition: 'all 0.22s ease', 
                      cursor: 'pointer',
                      alignItems: 'stretch'
                    }}
                    onClick={() => handleOpenArticle(art)}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                  >
                    {/* Article Thumbnail */}
                    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg-elevated)', minHeight: 120 }}>
                      <img 
                        src={art.image} 
                        alt={art.title} 
                        onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGES[art.category] || FALLBACK_CATEGORY_IMAGES.life; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      {art.level && (
                        <div style={{ position: 'absolute', top: 6, left: 6, background: artLvlColor, color: 'white', padding: '1px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 800 }}>
                          {art.level}
                        </div>
                      )}
                      {art.isLive && (
                        <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,0.9)', color: 'white', padding: '1px 5px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 700 }}>
                          Live
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div style={{ padding: '12px 14px 12px 0', display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Meta tags */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{art.categoryLabel}</span>
                          <span>·</span>
                          <span>{art.source}</span>
                          <span>·</span>
                          <span>{art.date}</span>
                          <span>·</span>
                          <span>⏱️ {readMinutes}p đọc</span>
                        </div>

                        {/* Title */}
                        <h3 style={{ margin: 0, fontSize: '0.96rem', lineHeight: 1.4, color: 'var(--text-primary)', fontWeight: 700 }} className="jp-text">
                          {art.title}
                        </h3>

                        {/* Vietnamese Summary */}
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {art.summary}
                        </p>
                      </div>

                      {/* Footer actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <BookOpen size={12}/> Đọc & Tra từ
                        </span>

                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTransferToShadowing(art); }}
                          className="btn btn-outline" 
                          style={{ padding: '3px 9px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-primary)', borderColor: 'var(--glass-border)' }}
                        >
                          <Volume2 size={12}/> 🗣️ Shadowing
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {(searchKeyword ? filteredArticles : remainingArticles).length > visibleCount && (
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 8)}
                    className="btn btn-outline"
                    style={{ padding: '8px 24px', borderRadius: 20, fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent-primary)', borderColor: 'var(--glass-border)' }}
                  >
                    Xem thêm bản tin (+8 bài)
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: LIVING UTILITIES & EDUCATION SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* 💴 WIDGET 1: 2-WAY INTERACTIVE JPY / VND CURRENCY CONVERTER */}
          <div className="glass-panel" style={{ padding: 16, borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <DollarSign size={16} color="var(--accent-success)" /> Quy Đổi Tỷ Giá 2 Chiều
              </h4>
              <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', color: 'var(--accent-success)', fontWeight: 700 }}>
                1 JPY ≈ {JPY_VND_RATE} ₫
              </span>
            </div>

            {/* Direction Switcher */}
            <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 8, padding: 2 }}>
              <button
                onClick={() => { setCalcDirection('jpy_to_vnd'); setCalcAmount('100000'); }}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: calcDirection === 'jpy_to_vnd' ? 'var(--accent-primary)' : 'transparent',
                  color: calcDirection === 'jpy_to_vnd' ? 'white' : 'var(--text-secondary)'
                }}
              >
                Yên Nhật → VNĐ
              </button>
              <button
                onClick={() => { setCalcDirection('vnd_to_jpy'); setCalcAmount('20000000'); }}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: calcDirection === 'vnd_to_jpy' ? 'var(--accent-primary)' : 'transparent',
                  color: calcDirection === 'vnd_to_jpy' ? 'white' : 'var(--text-secondary)'
                }}
              >
                VNĐ → Yên Nhật
              </button>
            </div>

            {/* Converter Input & Output */}
            <div style={{ background: 'var(--bg-elevated)', padding: '10px 12px', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {calcDirection === 'jpy_to_vnd' ? 'Nhập số Yên (¥):' : 'Nhập số VNĐ (₫):'}
                </span>
                <input 
                  type="number" 
                  value={calcAmount} 
                  onChange={e => setCalcAmount(e.target.value)}
                  style={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--glass-border)', 
                    color: 'var(--text-primary)', 
                    padding: '4px 8px', 
                    borderRadius: 6, 
                    width: 120, 
                    textAlign: 'right', 
                    fontSize: '0.86rem', 
                    fontWeight: 700, 
                    outline: 'none' 
                  }}
                />
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {calcDirection === 'jpy_to_vnd' ? (
                  <>
                    {['10000', '50000', '100000', '300000', '500000'].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => setCalcAmount(preset)}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: '1px solid var(--glass-border)',
                          background: calcAmount === preset ? 'var(--accent-subtle)' : 'transparent',
                          color: calcAmount === preset ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {parseInt(preset) / 10000} vạn
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {['5000000', '10000000', '20000000', '50000000'].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => setCalcAmount(preset)}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: '1px solid var(--glass-border)',
                          background: calcAmount === preset ? 'var(--accent-subtle)' : 'transparent',
                          color: calcAmount === preset ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {parseInt(preset) / 1000000} tr
                      </button>
                    ))}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: 6 }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Quy đổi tương đương:</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                  {calculatedResult}
                </span>
              </div>
            </div>

            <button 
              onClick={() => handleOpenTopic('news_yen_exchange_rate')}
              className="btn btn-outline"
              style={{ padding: '5px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--accent-primary)', borderColor: 'var(--glass-border)' }}
            >
              <TrendingUp size={13}/> Phân tích Tỷ giá & Kinh tế Nhật Bản
            </button>
          </div>

          {/* ☀️ WIDGET 2: JAPAN METROPOLITAN WEATHER */}
          <div className="glass-panel" style={{ padding: 16, borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CloudSun size={16} color="#f59e0b" /> Thời Tiết Đô Thị Nhật Bản
              </h4>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Dự báo hôm nay</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
              {JAPAN_WEATHER_DATA.map((w, wIdx) => (
                <div 
                  key={wIdx}
                  style={{ 
                    padding: '8px 10px', 
                    background: 'var(--bg-elevated)', 
                    borderRadius: 8, 
                    border: '1px solid var(--glass-border)',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 3 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>{w.city.split(' ')[0]}</span>
                    <span style={{ fontSize: '1rem' }}>{w.icon}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{w.temp}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{w.condition}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 📚 WIDGET 3: DAILY NEWS KANJI & VOCAB (CÓ NÚT + FSRS 1-CLICK) */}
          <div className="glass-panel" style={{ padding: 16, borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookCheck size={16} color="var(--accent-primary)" /> Từ Vựng Thời Sự & Đời Sống
              </h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700 }}>+ FSRS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }} className="custom-scrollbar">
              {DAILY_NEWS_KANJI_VOCAB.map((v, vIdx) => {
                const isSaved = !!savedVocabMap[v.kanji];
                const lvlCol = JLPT_LEVEL_COLORS[v.level] || '#3b82f6';

                return (
                  <div 
                    key={vIdx}
                    style={{ 
                      padding: 10, 
                      background: 'var(--bg-elevated)', 
                      borderRadius: 10, 
                      border: '1px solid var(--glass-border)',
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 4 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }} className="jp-text">
                          {v.kanji}
                        </span>
                        <span style={{ fontSize: '0.66rem', padding: '1px 5px', borderRadius: 4, background: `${lvlCol}22`, color: lvlCol, fontWeight: 700 }}>
                          {v.level}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSaveVocabToFlashcards(v)}
                        disabled={isSaved}
                        style={{
                          padding: '2px 8px',
                          borderRadius: 6,
                          border: 'none',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: isSaved ? 'default' : 'pointer',
                          background: isSaved ? 'rgba(16,185,129,0.15)' : 'var(--accent-subtle)',
                          color: isSaved ? 'var(--accent-success)' : 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        title={isSaved ? 'Đã lưu vào bộ thẻ flashcards FSRS' : 'Lưu từ vựng này vào bộ thẻ FSRS'}
                      >
                        {isSaved ? <Check size={11}/> : <Plus size={11}/>}
                        {isSaved ? 'Đã lưu' : '+ FSRS'}
                      </button>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                      {v.reading} {v.sino && `· [${v.sino}]`}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {v.meaning}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🔥 WIDGET 4: CẨM NANG THỦ TỤC & ĐỜI SỐNG */}
          <div className="glass-panel" style={{ padding: 16, borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flame size={16} color="#f59e0b" /> Cẩm Nang Thủ Tục Quan Trọng
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TRENDING_TOPICS.map((topic, tIdx) => (
                <div 
                  key={tIdx} 
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', background: 'var(--bg-elevated)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--glass-border)' }}
                  onClick={() => handleOpenTopic(topic.id)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                  title={`Đọc bài viết: ${topic.title}`}
                >
                  <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 4, background: `${topic.color}22`, color: topic.color, fontWeight: 700 }}>
                    {topic.tag}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {topic.title}
                  </span>
                  <ChevronRight size={13} color="var(--text-tertiary)" />
                </div>
              ))}
            </div>
          </div>

          {/* ⚡ WIDGET 5: LỐI TẮT CÔNG CỤ HỌC TẬP */}
          <div className="glass-panel" style={{ padding: 16, borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lightbulb size={16} color="var(--accent-primary)" /> Lối Tắt Công Cụ Học Tập
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button 
                onClick={() => navigate('/dictionary')}
                className="btn btn-outline"
                style={{ padding: '6px 10px', fontSize: '0.78rem', justifyContent: 'flex-start', gap: 6, color: 'var(--text-primary)', background: 'var(--bg-elevated)', borderColor: 'var(--glass-border)' }}
              >
                <BookOpen size={13} color="var(--accent-primary)"/> 📖 Tra Từ Điển Thông Minh
              </button>

              <button 
                onClick={() => navigate('/grammar')}
                className="btn btn-outline"
                style={{ padding: '6px 10px', fontSize: '0.78rem', justifyContent: 'flex-start', gap: 6, color: 'var(--text-primary)', background: 'var(--bg-elevated)', borderColor: 'var(--glass-border)' }}
              >
                <Sparkles size={13} color="#c084fc"/> ✨ 2.191 Mẫu Ngữ Pháp Bunpro
              </button>

              <button 
                onClick={() => navigate('/flashcards')}
                className="btn btn-outline"
                style={{ padding: '6px 10px', fontSize: '0.78rem', justifyContent: 'flex-start', gap: 6, color: 'var(--text-primary)', background: 'var(--bg-elevated)', borderColor: 'var(--glass-border)' }}
              >
                <BookmarkCheck size={13} color="#10b981"/> 🗂️ Ôn Tập Flashcards FSRS
              </button>

              <button 
                onClick={() => navigate('/shadowing')}
                className="btn btn-outline"
                style={{ padding: '6px 10px', fontSize: '0.78rem', justifyContent: 'flex-start', gap: 6, color: 'var(--text-primary)', background: 'var(--bg-elevated)', borderColor: 'var(--glass-border)' }}
              >
                <Volume2 size={13} color="#34d399"/> 🗣️ Luyện Nói Shadowing Studio
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default JapanNewsHub;

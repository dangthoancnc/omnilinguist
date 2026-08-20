import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Newspaper, Globe, BookOpen, Volume2, Sparkles, ExternalLink, ArrowLeft, ArrowRight, 
  Search, Bookmark, Plus, Loader, CheckCircle, RefreshCw, Layers, ShieldCheck, 
  Briefcase, HeartHandshake, Eye, VolumeX, PencilLine, Share2, X, Compass, 
  Flame, BookCheck, MessageSquareQuote, ChevronRight, Play, Pause, FastForward,
  TrendingUp, Clock, Calendar, BookmarkCheck, Lightbulb, DollarSign, CloudSun,
  Calculator, Check, ArrowRightLeft
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

const TRENDING_TOPICS = [
  { id: 'news_tokutei_ginou_2026', title: 'Thủ tục xin Visa Kỹ năng đặc định Tokutei 2', tag: 'Visa', color: '#60a5fa' },
  { id: 'news_tax_nenkin_guide', title: 'Hướng dẫn kê khai người phụ thuộc giảm thuế & Nenkin', tag: 'Thuế', color: '#f59e0b' },
  { id: 'news_ur_housing_life', title: 'Kinh nghiệm thuê nhà UR không tiền lễ, không bảo lãnh', tag: 'Nhà ở', color: '#10b981' },
  { id: 'news_bank_yucho_guide', title: 'Mở tài khoản Ngân hàng Yucho & ứng dụng chuyển tiền', tag: 'Ngân hàng', color: '#3b82f6' },
  { id: 'news_medical_insurance_japan', title: 'Bảo hiểm Y tế Quốc dân & Chế độ Viện phí cao', tag: 'Y tế', color: '#ec4899' },
  { id: 'news_driving_license_convert', title: 'Đổi bằng lái xe Việt Nam sang Nhật (Gaimen Kirikae)', tag: 'Bằng lái', color: '#8b5cf6' }
];

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
  
  // Active states
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Currency Calculator Interactive State
  const [jpyAmount, setJpyAmount] = useState('100000');
  const JPY_VND_RATE = 168.5; // Reference exchange rate

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

  // Global & Category-aware Intelligent Search Filtering
  const filteredArticles = useMemo(() => {
    const rawKw = searchKeyword.trim();
    if (!rawKw) {
      if (activeCategory === 'all') return articles;
      return articles.filter(art => art.category === activeCategory);
    }

    const normKw = removeVietnameseTones(rawKw);

    // Filter across articles
    const searchMatch = (art) => {
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
    };

    // First try matching in current category
    const inCat = articles.filter(art => (activeCategory === 'all' || art.category === activeCategory) && searchMatch(art));
    if (inCat.length > 0) return inCat;

    // If 0 in current category, search across ALL categories so user gets results!
    return articles.filter(searchMatch);
  }, [articles, activeCategory, searchKeyword]);

  // Hero Featured Article
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
        <div className="glass-panel" style={{ position: 'sticky', top: 10, zIndex: 100, padding: '12px 18px', background: 'rgba(15, 23, 42, 0.94)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border-strong)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}>
          
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.35)', padding: '7px 16px', borderRadius: 20, border: '1px solid var(--glass-border)', position: 'relative' }}>
            <Search size={16} color="var(--text-tertiary)"/>
            <input 
              type="text" 
              placeholder="Tìm tin tức, visa, thuế, nhà ở..." 
              value={searchKeyword} 
              onChange={e => setSearchKeyword(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.85rem', width: 200 }}
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

      {/* CATEGORY FILTERS */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }} className="custom-scrollbar">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button 
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setSearchKeyword(''); }}
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
              {searchKeyword ? `Kết quả tìm kiếm cho "${searchKeyword}"` : 'Danh sách tin tức mới nhất'}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{filteredArticles.length} bản tin</span>
          </div>

          {isLoadingNews && articles.length === 0 ? (
            <div className="glass-panel" style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: '#60a5fa' }} />
              <div>Đang nạp các bản tin nóng từ các nguồn tin tức Nhật Bản...</div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="glass-panel" style={{ padding: 50, textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Newspaper size={36} style={{ opacity: 0.5 }} />
              <div>Không tìm thấy bản tin nào phù hợp với từ khóa "{searchKeyword}".</div>
              <button 
                onClick={() => { setActiveCategory('all'); setSearchKeyword(''); }}
                className="btn btn-primary"
                style={{ padding: '6px 16px', fontSize: '0.85rem' }}
              >
                Xem tất cả tin tức
              </button>
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
          
          {/* Widget 1: JPY / VND Interactive Exchange Rate Calculator */}
          <div className="glass-panel" style={{ padding: 20, borderRadius: 16, border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={18} color="#10b981" /> Quy Đổi Tỷ Giá JPY / VND
              </h4>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 700 }}>1 JPY ≈ 168.5 ₫</span>
            </div>

            {/* Interactive Converter Input */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Nhập số Yên Nhật (¥):</span>
                <input 
                  type="number" 
                  value={jpyAmount} 
                  onChange={e => setJpyAmount(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '4px 8px', borderRadius: 6, width: 110, textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6 }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Quy đổi thành VNĐ:</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                  {((parseFloat(jpyAmount) || 0) * JPY_VND_RATE).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            <button 
              onClick={() => handleOpenTopic('news_yen_exchange_rate')}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#60a5fa', borderColor: 'rgba(59,130,246,0.3)' }}
            >
              <TrendingUp size={14}/> Đọc bài phân tích Tỷ giá & Kinh tế
            </button>
          </div>

          {/* Widget 2: Trending Visa & Life Topics (100% WORKING DIRECT NAVIGATION) */}
          <div className="glass-panel" style={{ padding: 20, borderRadius: 16, border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flame size={18} color="#f59e0b" /> Cẩm Nang Đời Sống & Visa
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Bấm để đọc ngay</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TRENDING_TOPICS.map((topic, tIdx) => (
                <div 
                  key={tIdx} 
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.04)' }}
                  onClick={() => handleOpenTopic(topic.id)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
                  title={`Đọc bài viết: ${topic.title}`}
                >
                  <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: 4, background: `${topic.color}22`, color: topic.color, fontWeight: 700 }}>
                    {topic.tag}
                  </span>
                  <span style={{ fontSize: '0.84rem', color: 'white', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {topic.title}
                  </span>
                  <ChevronRight size={14} color="var(--text-tertiary)" />
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Active Learning Shortcuts */}
          <div className="glass-panel" style={{ padding: 20, borderRadius: 16, border: '1px solid rgba(16,185,129,0.3)', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.08))', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lightbulb size={18} color="#34d399" /> Lối Tắt Công Cụ Học Tập
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                onClick={() => navigate('/dictionary')}
                className="btn btn-outline"
                style={{ padding: '7px 12px', fontSize: '0.8rem', justifyContent: 'flex-start', gap: 8, color: '#e2e8f0', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <BookOpen size={14} color="#60a5fa"/> 📖 Mở Từ Điển Thông Minh
              </button>

              <button 
                onClick={() => navigate('/grammar')}
                className="btn btn-outline"
                style={{ padding: '7px 12px', fontSize: '0.8rem', justifyContent: 'flex-start', gap: 8, color: '#e2e8f0', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Sparkles size={14} color="#c084fc"/> ✨ 2.191 Mẫu Ngữ Pháp Bunpro
              </button>

              <button 
                onClick={() => navigate('/shadowing')}
                className="btn btn-outline"
                style={{ padding: '7px 12px', fontSize: '0.8rem', justifyContent: 'flex-start', gap: 8, color: '#e2e8f0', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Volume2 size={14} color="#34d399"/> 🗣️ Luyện Nói Shadowing Studio
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default JapanNewsHub;

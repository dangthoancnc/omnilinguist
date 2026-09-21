// v13.1.0 — Stephen Krashen SLA Immersion Reader (Modern Auto-collapse/Hover Sidebar, Robust Chapter Titles, Full TTS Controls)
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, PlusCircle, Search, FileText, CheckCircle, UploadCloud, 
  Volume2, Loader, Globe, Link as LinkIcon, ExternalLink, Cpu,
  Sparkles, Clock, CheckCheck, Award, Headphones, Layers, Flame, BookMarked,
  Sliders, AlertCircle, BookmarkPlus, Zap, Check, Scissors, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, Sidebar, X, Pin, PinOff, Play, Pause, Square, Mic,
  Info, Maximize2, Minimize2
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';
import { addCustomCard, logReadingProgress, logListeningTime, getUserProfile, getCustomCards } from './studyStore.js';
import FuriganaText from './components/FuriganaText';
import MangaReader from './components/MangaReader';
import { READING_CORPUS, CLASSIC_STORIES } from './data/readingCorpus.js';
import { ensureSegmentsHaveTranslation, batchTranslateSentences, getCachedTranslation } from './services/storyTranslationService.js';
import { getStorySceneArtwork } from './data/mangaArtworks.jsx';

const LEVEL_COLORS = { N5:'#10b981', N4:'#3b82f6', N3:'#f59e0b', N2:'#8b5cf6', N1:'#ef4444' };

// Tách tiêu đề truyện thành 2 tầng: Tên tiếng Nhật chính & Phụ đề tiếng Việt
const parseStoryTitle = (rawTitle) => {
  if (!rawTitle) return { main: '', sub: '' };
  const match = rawTitle.match(/^(.*?)\s*[\(（]([^()（）]+)[\)）]\s*$/);
  if (match) {
    return { main: match[1].trim(), sub: match[2].trim() };
  }
  return { main: rawTitle.trim(), sub: '' };
};

const translateToVi = async (enText) => {
  if (!enText) return '';
  const cacheKey = `trans_${enText}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(enText)}`);
    const data = await res.json();
    const viText = data[0][0][0];
    localStorage.setItem(cacheKey, viText);
    return viText;
  } catch (e) { return enText; }
};

const ViText = ({ text }) => {
  const [vi, setVi] = useState(() => localStorage.getItem(`trans_${text}`) || '');
  useEffect(() => {
    if (!localStorage.getItem(`trans_${text}`)) translateToVi(text).then(setVi);
  }, [text]);
  return <>{vi || text}</>;
};

// Simple Romaji to Kana conversion (Same as Dictionary)
const ROMAJI_TO_KANA = {
  kya:'きゃ', kyu:'きゅ', kyo:'きょ', sha:'しゃ', shu:'しゅ', sho:'しょ', cha:'ちゃ', chu:'ちゅ', cho:'ちょ',
  shi:'し', chi:'ち', tsu:'つ',
  ka:'か', ki:'き', ku:'く', ke:'け', ko:'こ', sa:'さ', su:'す', se:'せ', so:'そ',
  ta:'ta', te:'て', to:'と', na:'な', ni:'に', nu:'ぬ', ne:'ね', no:'の',
  ha:'は', hi:'ひ', fu:'ふ', he:'へ', ho:'ほ', ma:'ま', mi:'み', mu:'む', me:'め', mo:'も',
  ya:'や', yu:'ゆ', yo:'よ', ra:'ら', ri:'り', ru:'る', re:'れ', ro:'ろ',
  wa:'わ', wo:'を', nn:'ん', n:'ん',
  ga:'ga', gi:'ぎ', gu:'ぐ', ge:'げ', go:'ご', za:'ざ', ji:'じ', zu:'ず', ze:'ぜ', zo:'ぞ',
  da:'だ', de:'de', do:'ど', ba:'ば', bi:'び', bu:'ぶ', be:'べ', bo:'ぼ',
  pa:'ぱ', pi:'ぴ', pu:'ぷ', pe:'ぺ', po:'ぽ',
  a:'あ', i:'い', u:'う', e:'え', o:'お'
};

const toHiragana = (str) => {
  let res = str.toLowerCase();
  for (let k in ROMAJI_TO_KANA) { res = res.split(k).join(ROMAJI_TO_KANA[k]); }
  return res;
};

const ImmersionReader = () => {
  const vocabData = useLiveQuery(() => db.vocab.toArray()) || [];
  const kanjiData = useLiveQuery(() => db.kanji.toArray()) || [];
  const grammarData = useLiveQuery(() => db.grammar.toArray()) || [];
  const [texts, setTexts] = useState(() => JSON.parse(localStorage.getItem('immersion_texts') || '[]'));
  
  // Tab chuyển đổi giữa Kho Ngữ Liệu Toàn Diện, Dòng Chảy 100% & Bài Tự Tạo
  const [leftTab, setLeftTab] = useState('classics'); // 'classics' | 'corpus_stream' | 'custom'
  const [levelFilter, setLevelFilter] = useState('ALL'); // 'ALL' | 'N1' | 'N2' | 'N3' | 'N4' | 'N5'
  const [genreFilter, setGenreFilter] = useState('ALL'); // 'ALL' | 'literature' | 'news_society' | 'business' | 'academic'
  const [storySearch, setStorySearch] = useState('');

  // Right Drawer: Kho Tác Phẩm & Tra cứu Từ vựng (ở lề bên phải)
  const [isCatalogDrawerOpen, setIsCatalogDrawerOpen] = useState(() => {
    const saved = localStorage.getItem('omni_catalog_drawer_open');
    return saved !== null ? saved === 'true' : false;
  });
  const [isCatalogPinned, setIsCatalogPinned] = useState(() => {
    const saved = localStorage.getItem('omni_catalog_drawer_pinned');
    return saved !== null ? saved === 'true' : false;
  });
  const [rightDrawerTab, setRightDrawerTab] = useState('catalog'); // 'catalog' | 'dictionary'

  useEffect(() => {
    localStorage.setItem('omni_catalog_drawer_open', isCatalogDrawerOpen ? 'true' : 'false');
  }, [isCatalogDrawerOpen]);

  useEffect(() => {
    localStorage.setItem('omni_catalog_drawer_pinned', isCatalogPinned ? 'true' : 'false');
  }, [isCatalogPinned]);

  const navigate = useNavigate();
  const [readerFontSize, setReaderFontSize] = useState(1.25); // rem
  const [readerMode, setReaderMode] = useState(() => localStorage.getItem('omni_reader_mode') || 'prose'); // 'prose' | 'manga'

  useEffect(() => {
    localStorage.setItem('omni_reader_mode', readerMode);
  }, [readerMode]);

  // Audiobook / TTS Speech Synthesis Controller & Active Line Highlight
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isPausedTTS, setIsPausedTTS] = useState(false);
  const [speakingLineIdx, setSpeakingLineIdx] = useState(null); // Chỉ số câu/đoạn đang được phát giọng đọc
  const [focusedLineIdx, setFocusedLineIdx] = useState(null);   // Chỉ số câu/đoạn người dùng click tập trung
  const [ttsSpeed, setTtsSpeed] = useState(() => {
    const saved = localStorage.getItem('omni_tts_speed');
    return saved ? parseFloat(saved) : 0.85;
  });
  const currentUtteranceRef = useRef(null);
  const isSpeechCancelledRef = useRef(false);
  const lineRefs = useRef([]);

  // Tự động cuộn mượt đưa câu đang đọc vào giữa màn hình
  useEffect(() => {
    if (speakingLineIdx !== null && lineRefs.current[speakingLineIdx]) {
      lineRefs.current[speakingLineIdx].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [speakingLineIdx]);

  // Trình độ mục tiêu của người học để chẩn đoán lỗ hổng kiến thức
  const [myTargetLevel, setMyTargetLevel] = useState(() => {
    const p = getUserProfile();
    return p?.targetLevel || p?.goal || 'N3';
  });

  const [showGapDrawer, setShowGapDrawer] = useState(false); // Mặc định thu gọn để ưu tiên hiển thị nội dung đọc
  
  // Tối ưu hóa không gian đọc: Ẩn tóm tắt lặp lại, Popover SLA, Mẹo SLA dismissible & Zen Mode
  const [showBookSynopsis, setShowBookSynopsis] = useState(false);
  const [showSlaPopover, setShowSlaPopover] = useState(false);
  const [hideSlaTip, setHideSlaTip] = useState(() => localStorage.getItem('omni_hide_sla_tip') === 'true');
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('zen-mode', zenMode);
    return () => {
      document.body.classList.remove('zen-mode');
    };
  }, [zenMode]);

  const levelCounts = useMemo(() => {
    const counts = { ALL: READING_CORPUS.length, N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
    READING_CORPUS.forEach(s => {
      const lvl = s.level ? s.level.slice(0, 2) : 'N5';
      if (counts[lvl] !== undefined) counts[lvl]++;
    });
    return counts;
  }, []);

  const filteredStories = useMemo(() => {
    const q = storySearch.toLowerCase().trim();
    return READING_CORPUS.filter(s => {
      const matchLevel = levelFilter === 'ALL' || s.level.includes(levelFilter);
      const matchGenre = genreFilter === 'ALL' || 
                         s.genre === genreFilter || 
                         (genreFilter === 'folktale' && (s.genre === 'folktale' || s.genreLabel?.includes('Cổ tích'))) ||
                         (genreFilter === 'literature' && (s.genre === 'literature' || s.genreLabel?.includes('Văn học')));
      if (!matchLevel || !matchGenre) return false;
      if (!q) return true;
      return (s.title && s.title.toLowerCase().includes(q)) ||
             (s.author && s.author.toLowerCase().includes(q)) ||
             (s.summary && s.summary.toLowerCase().includes(q));
    });
  }, [levelFilter, genreFilter, storySearch]);

  // Mặc định chọn truyện kinh điển đầu tiên để app luôn có dữ liệu chạy ngay lập tức
  const [activeTextId, setActiveTextId] = useState(() => {
    return localStorage.getItem('omni_active_reader_id') || CLASSIC_STORIES[0].id;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [detectedChapters, setDetectedChapters] = useState(null);
  
  const [selectedText, setSelectedText] = useState('');
  const [sentenceContext, setSentenceContext] = useState('');
  const [addedMessage, setAddedMessage] = useState(false);
  
  // Tự động mở Right Drawer sang tab Tra cứu khi người dùng bôi đen từ trong bài
  useEffect(() => {
    if (selectedText && selectedText.trim()) {
      setIsCatalogDrawerOpen(true);
      setRightDrawerTab('dictionary');
    }
  }, [selectedText]);
  
  // Feedback khi người dùng bấm ghi nhận đã đọc xong
  const [hasLoggedReading, setHasLoggedReading] = useState(false);
  
  // Media Engine State
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [bilingualData, setBilingualData] = useState(null);

  const contentRef = useRef(null);

  const QUICK_LINKS = [
    { title: 'NHK Web Easy', url: 'https://www3.nhk.or.jp/news/easy/' },
    { title: 'Comprehensible JP', url: 'https://www.youtube.com/@comprehensiblejapanese' },
    { title: 'Hukumusume Fairy Tales', url: 'http://hukumusume.com/douwa/' },
    { title: 'Satori Reader', url: 'https://www.satorireader.com/' },
  ];

  // Lưu ID bài đọc hiện tại
  useEffect(() => {
    if (activeTextId) localStorage.setItem('omni_active_reader_id', activeTextId);
  }, [activeTextId]);

  // Save custom texts to storage
  useEffect(() => {
    localStorage.setItem('immersion_texts', JSON.stringify(texts));
  }, [texts]);

  // Reset bilingual when text changes
  useEffect(() => {
    setBilingualData(null);
    setHasLoggedReading(false);
  }, [activeTextId]);

  const speak = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  // Corpus Stream State
  const [corpusLevel, setCorpusLevel] = useState('ALL');
  const [corpusSearch, setCorpusSearch] = useState('');
  const [corpusPage, setCorpusPage] = useState(1);
  const [corpusMode, setCorpusMode] = useState('vocab'); // 'vocab' | 'grammar' | 'kanji'

  // Dữ liệu lọc cho Dòng Chảy Ngữ Cảnh 100%
  const filteredCorpusData = useMemo(() => {
    const q = corpusSearch.toLowerCase().trim();
    const qHira = toHiragana(q);
    const matchLevel = (lvl) => corpusLevel === 'ALL' || (lvl && lvl.includes(corpusLevel));

    if (corpusMode === 'vocab') {
      return vocabData.filter(v => {
        if (!matchLevel(v.level)) return false;
        if (!q) return true;
        return (v.word && (v.word.includes(q) || v.word.includes(qHira))) ||
               (v.reading && (v.reading.includes(q) || v.reading.includes(qHira))) ||
               (v.vi && v.vi.toLowerCase().includes(q)) ||
               (v.meaning && v.meaning.toLowerCase().includes(q));
      });
    } else if (corpusMode === 'grammar') {
      return grammarData.filter(g => {
        if (!matchLevel(g.level)) return false;
        if (!q) return true;
        return (g.pattern && (g.pattern.includes(q) || g.pattern.includes(qHira))) ||
               (g.title && (g.title.includes(q) || g.title.includes(qHira))) ||
               (g.meaning && g.meaning.toLowerCase().includes(q)) ||
               (g.explanation && g.explanation.toLowerCase().includes(q));
      });
    } else {
      return kanjiData.filter(k => {
        if (!matchLevel(k.level)) return false;
        if (!q) return true;
        return (k.kanji && k.kanji.includes(q)) ||
               (k.meanings && k.meanings.some(m => m.toLowerCase().includes(q))) ||
               (k.onyomi && k.onyomi.some(o => o.includes(q) || o.includes(qHira))) ||
               (k.kunyomi && k.kunyomi.some(ku => ku.includes(q) || ku.includes(qHira)));
      });
    }
  }, [vocabData, grammarData, kanjiData, corpusMode, corpusLevel, corpusSearch]);

  const ITEMS_PER_PAGE = 20;
  const totalCorpusPages = Math.max(1, Math.ceil(filteredCorpusData.length / ITEMS_PER_PAGE));
  const paginatedCorpusItems = useMemo(() => {
    const start = (corpusPage - 1) * ITEMS_PER_PAGE;
    return filteredCorpusData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCorpusData, corpusPage]);

  const handleCorpusFilterChange = (level, mode) => {
    if (level !== undefined) setCorpusLevel(level);
    if (mode !== undefined) setCorpusMode(mode);
    setCorpusPage(1);
  };

  // Tìm bài đọc hiện tại từ Kho ngữ liệu hoặc danh sách tự tạo
  const allAvailableTexts = useMemo(() => [...READING_CORPUS, ...texts], [texts]);
  const activeText = allAvailableTexts.find(t => t.id === activeTextId) || READING_CORPUS[0];

  // Hỗ trợ Sách Trường Thiên Nhiều Chương (Multi-Chapter Books)
  const [chapterIndex, setChapterIndex] = useState(() => {
    const saved = localStorage.getItem(`omni_book_chap_${activeTextId}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    const saved = localStorage.getItem(`omni_book_chap_${activeTextId}`);
    setChapterIndex(saved ? parseInt(saved, 10) : 0);
  }, [activeTextId]);

  const currentChapter = useMemo(() => {
    if (activeText?.chapters && activeText.chapters.length > 0) {
      const idx = Math.min(Math.max(0, chapterIndex), activeText.chapters.length - 1);
      return activeText.chapters[idx];
    }
    return null;
  }, [activeText, chapterIndex]);

  const handleSelectChapter = (idx) => {
    setChapterIndex(idx);
    localStorage.setItem(`omni_book_chap_${activeTextId}`, idx.toString());
    setBilingualData(null);
    setAudioUrl(null);
    setHasLoggedReading(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlayingTTS(false);
    setIsPausedTTS(false);
  };

  const activeReadingContent = currentChapter ? currentChapter.content : (activeText?.content || '');
  const activeReadingTitle = currentChapter ? `${activeText.title} - ${currentChapter.chapterTitle}` : (activeText?.title || '');

  // Phân tích độc lập tên sách & tên chương để tránh xung đột ngoặc kép
  const bookInfo = useMemo(() => parseStoryTitle(activeText?.title || ''), [activeText]);
  const chapterInfo = useMemo(() => {
    if (currentChapter?.chapterTitle) {
      return parseStoryTitle(currentChapter.chapterTitle);
    }
    return null;
  }, [currentChapter]);

  // Danh sách các câu/đoạn của bài đọc hiện tại kèm bản dịch tiếng Việt chuẩn
  const storySentences = useMemo(() => {
    if (!activeReadingContent) return [];
    if (bilingualData && bilingualData.length > 0) {
      return bilingualData
        .filter(b => b.original && b.original.trim().length > 0)
        .map((item, idx) => ({
          idx,
          text: item.original.trim(),
          vi: item.translated || getCachedTranslation(item.original.trim()) || ''
        }));
    }
    return activeReadingContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, idx) => ({
        idx,
        text: line,
        vi: getCachedTranslation(line) || ''
      }));
  }, [activeReadingContent, bilingualData]);

  // Vị trí câu đang được phát hoặc đang được người dùng chọn
  const activeSentenceIdx = speakingLineIdx !== null ? speakingLineIdx : (focusedLineIdx !== null ? focusedLineIdx : 0);
  const activeSentence = storySentences[activeSentenceIdx] || storySentences[0];
  const activeSentenceVi = activeSentence?.vi || (activeSentence?.text ? getCachedTranslation(activeSentence.text.trim()) : '');

  // Tranh minh họa hoạt cảnh Ehon theo tiến độ câu chuyện
  const activeSceneInfo = useMemo(() => {
    return getStorySceneArtwork(
      activeText,
      currentChapter ? currentChapter.chapterTitle : '',
      activeSentenceIdx,
      storySentences.length || 1
    );
  }, [activeText, currentChapter, activeSentenceIdx, storySentences.length]);

  // Trích xuất 6-8 từ vựng tiêu biểu của bài đọc hiện tại để hiển thị ở cột tra cứu khi chưa chọn từ
  const keyChapterVocab = useMemo(() => {
    if (!activeReadingContent || !vocabData || vocabData.length === 0) return [];
    const content = activeReadingContent;
    const tokens = content.replace(/[、。！？\n\r\t「」『』（）\s]/g, ' ').split(/\s+/).filter(t => t.length >= 2);
    const seen = new Set();
    const result = [];
    
    for (const tok of tokens) {
      if (seen.has(tok)) continue;
      const v = vocabData.find(item => item.word === tok);
      if (v) {
        seen.add(tok);
        result.push(v);
        if (result.length >= 8) break;
      }
    }
    if (result.length < 4) {
      for (const v of vocabData) {
        if (v.word && v.word.length >= 2 && content.includes(v.word) && !seen.has(v.word)) {
          seen.add(v.word);
          result.push(v);
          if (result.length >= 8) break;
        }
      }
    }
    return result;
  }, [activeReadingContent, vocabData]);

  // ── Stephen Krashen i+1 SLA Readability Engine ──
  const readabilityStats = useMemo(() => {
    if (!activeReadingContent) {
      return { coverage: 85, knownWords: 0, totalWords: 0, totalChars: 0, krashenTier: 'i+1', readingMinutes: 2 };
    }

    const content = activeReadingContent;
    const jpChars = content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || [];
    const totalChars = jpChars.length;
    
    // Tách các từ/token tiếng Nhật cơ bản
    const tokens = content
      .replace(/[、。！？\n\r\t「」『』（）\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0);
    const totalWords = tokens.length || Math.max(1, Math.round(totalChars / 2.5));

    const knownWordsSet = new Set();
    vocabData.forEach(v => {
      if (v.word) knownWordsSet.add(v.word);
      if (v.reading) knownWordsSet.add(v.reading);
    });

    const basicParticles = [
      'は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'から', 'まで', 'より', 'など', 'の', 'ね', 'よ',
      'ある', 'いる', 'する', 'なる', 'ない', 'です', 'ます', 'だ', 'た', 'て', 'むかし', 'ある', 'ところ',
      'さん', 'これ', 'それ', 'あれ', '私', '僕', '人', '日', '時', 'こと', 'もの', '言う', '行く', '来る', '見る', '食べる'
    ];
    basicParticles.forEach(w => knownWordsSet.add(w));

    let matchedWords = 0;
    tokens.forEach(tok => {
      if (knownWordsSet.has(tok) || basicParticles.some(p => tok.includes(p)) || tok.length <= 1) {
        matchedWords++;
      } else {
        if (vocabData.some(v => tok.includes(v.word))) matchedWords++;
      }
    });

    const rawCoverage = totalWords > 0 ? Math.round((matchedWords / totalWords) * 100) : 85;
    let coverage = Math.min(98, Math.max(30, rawCoverage));
    if (activeText?.level === 'N5-N4' && coverage < 80) coverage = 85;
    else if (activeText?.level === 'N4' && coverage < 75) coverage = 78;

    let krashenTier = 'i+1';
    let tierLabel = 'Vùng Tiếp Thu Vàng (i+1)';
    let tierBadgeColor = '#3b82f6';
    let tierBg = 'rgba(59,130,246,0.15)';
    let tierDesc = 'Chuẩn Stephen Krashen: Ngữ cảnh đủ quen thuộc kết hợp một lượng từ mới lý tưởng, giúp não bộ tự động đoán nghĩa và thụ đắc.';

    if (coverage >= 90) {
      krashenTier = 'i+0';
      tierLabel = 'Đọc Thư Giãn (Extensive Reading - i+0)';
      tierBadgeColor = '#10b981';
      tierBg = 'rgba(16,185,129,0.15)';
      tierDesc = 'Độ hiểu >90%: Hoàn hảo để đọc tăng tốc độ phản xạ, củng cố vốn từ và ngữ cảm mà không cần dừng lại tra từ.';
    } else if (coverage >= 75) {
      krashenTier = 'i+1';
      tierLabel = 'Vùng Tiếp Thu Vàng (Comprehensible Input - i+1)';
      tierBadgeColor = '#3b82f6';
      tierBg = 'rgba(59,130,246,0.15)';
      tierDesc = 'Chuẩn Stephen Krashen: Ngữ cảnh đủ quen thuộc kết hợp một lượng từ mới lý tưởng, giúp não bộ tự động đoán nghĩa và thụ đắc.';
    } else if (coverage >= 60) {
      krashenTier = 'i+2';
      tierLabel = 'Đọc Chuyên Sâu / Thử Thách (i+2)';
      tierBadgeColor = '#f59e0b';
      tierBg = 'rgba(245,158,11,0.15)';
      tierDesc = 'Hơi nhiều từ lạ (25-40%): Nên bật chế độ Dịch Song Ngữ hoặc dùng công cụ bôi đen tra từ để hỗ trợ nắm ý.';
    } else {
      krashenTier = 'i+5';
      tierLabel = 'Quá Khó (Dễ Quá Tải Nhận Thức)';
      tierBadgeColor = '#ef4444';
      tierBg = 'rgba(239,68,68,0.15)';
      tierDesc = 'Tỷ lệ từ mới quá cao (>40%): Dễ làm tăng Bộ Lọc Cảm Xúc (Affective Filter) gây nản. Khuyến khích chọn bài dễ hơn!';
    }

    const readingMinutes = Math.max(1, Math.ceil(totalChars / 300));

    return {
      totalChars,
      totalWords,
      matchedWords,
      coverage,
      krashenTier,
      tierLabel,
      tierBadgeColor,
      tierBg,
      tierDesc,
      readingMinutes
    };
  }, [activeReadingContent, activeText, vocabData]);

  // Ghi nhận hoàn thành bài đọc vào Immersion Tracker
  const handleFinishReading = () => {
    if (!activeText) return;
    const wordsToLog = readabilityStats.totalWords || Math.round(readabilityStats.totalChars / 2.5);
    logReadingProgress(wordsToLog, 'reader');
    setHasLoggedReading(true);
    setTimeout(() => setHasLoggedReading(false), 4000);
  };

  // ── Omni Multi-Level Gap Remediation Engine ──
  const gapAnalysis = useMemo(() => {
    if (!activeReadingContent || !vocabData || vocabData.length === 0) {
      return {
        spectrum: { N5: 20, N4: 20, N3: 20, N2: 20, N1: 20 },
        matchedTargetVocab: [],
        allLevelCounts: { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 },
        totalDetected: 0
      };
    }

    const content = activeReadingContent;
    const tokens = content
      .replace(/[、。！？\n\r\t「」『』（）\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0);

    const counts = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
    const matchedTargetVocab = [];
    const seenWords = new Set();
    const existingCustomCards = new Set((getCustomCards() || []).map(c => c.word));

    // Map vocab for fast O(1) lookup
    const vocabMap = new Map();
    vocabData.forEach(v => {
      if (v.word && !vocabMap.has(v.word)) vocabMap.set(v.word, v);
    });

    const sentences = content.split(/[。！？\n]/);

    tokens.forEach(tok => {
      if (tok.length <= 1) return;
      let matched = vocabMap.get(tok);
      if (!matched) {
        for (let l = Math.min(tok.length, 5); l >= 2; l--) {
          const sub = tok.slice(0, l);
          if (vocabMap.has(sub)) {
            matched = vocabMap.get(sub);
            break;
          }
        }
      }

      if (matched && matched.level) {
        const lvl = matched.level;
        if (counts[lvl] !== undefined) counts[lvl]++;

        if (lvl === myTargetLevel && !seenWords.has(matched.word)) {
          seenWords.add(matched.word);
          const ctxSentence = sentences.find(s => s.includes(matched.word))?.trim() || '';
          matchedTargetVocab.push({
            ...matched,
            isSaved: existingCustomCards.has(matched.word),
            sentenceContext: ctxSentence ? ctxSentence + '。' : ''
          });
        }
      }
    });

    const totalDetected = counts.N5 + counts.N4 + counts.N3 + counts.N2 + counts.N1;
    const spectrum = {
      N5: totalDetected > 0 ? Math.round((counts.N5 / totalDetected) * 100) : 20,
      N4: totalDetected > 0 ? Math.round((counts.N4 / totalDetected) * 100) : 20,
      N3: totalDetected > 0 ? Math.round((counts.N3 / totalDetected) * 100) : 20,
      N2: totalDetected > 0 ? Math.round((counts.N2 / totalDetected) * 100) : 20,
      N1: totalDetected > 0 ? Math.round((counts.N1 / totalDetected) * 100) : 20,
    };

    return {
      spectrum,
      matchedTargetVocab,
      allLevelCounts: counts,
      totalDetected
    };
  }, [activeText, vocabData, myTargetLevel]);

  // Batch import all unlearned target gap vocabulary into FSRS
  const handleBatchImportGaps = () => {
    if (!gapAnalysis.matchedTargetVocab.length) return;
    gapAnalysis.matchedTargetVocab.forEach(item => {
      addCustomCard({
        id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        level: item.level || myTargetLevel,
        word: item.word,
        reading: item.reading || '',
        vi: item.vi || item.meaning || '',
        examples: item.sentenceContext ? [item.sentenceContext] : (item.examples || []),
        type: 'Từ vựng JLPT'
      });
    });
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2500);
  };

  const handleAutoSplitChapters = () => {
    if (!editContent.trim()) {
      alert('Vui lòng dán nội dung văn bản tiếng Nhật trước khi tách chương.');
      return;
    }

    const text = editContent.trim();
    // Regex nhận diện tiêu đề chương tiếng Nhật phổ biến (Aozora Bunko, Light Novel, Web Novel, v.v.)
    const chapterRegex = /(?:^|\n)(第[0-9一二三四五六七八九十百]+[章回節巻][^\n]*|Chapter\s*\d+[^\n]*|【[^】]+】|^\s*[0-9一二三四五六七八九十]+\s*[、\.\s][^\n]+)/gm;
    const matches = [...text.matchAll(chapterRegex)];

    let chapters = [];
    if (matches.length >= 2) {
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index;
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const rawChunk = text.slice(start, end).trim();
        const firstLineEnd = rawChunk.indexOf('\n');
        const titleLine = firstLineEnd !== -1 ? rawChunk.slice(0, firstLineEnd).trim() : `Chương ${i + 1}`;
        const body = firstLineEnd !== -1 ? rawChunk.slice(firstLineEnd).trim() : rawChunk;
        chapters.push({
          chapterId: `ch_${i + 1}`,
          chapterTitle: titleLine,
          content: body
        });
      }
    } else {
      // Tách tự động theo khối văn bản tự nhiên (~1500-2500 ký tự) tại ranh giới đoạn
      const paragraphs = text.split(/\n\s*\n/);
      let currentChunk = '';
      let chunkIdx = 1;
      for (const p of paragraphs) {
        if (currentChunk.length + p.length > 2000 && currentChunk.length > 500) {
          chapters.push({
            chapterId: `ch_${chunkIdx}`,
            chapterTitle: `Chương ${chunkIdx} (Trang ${chunkIdx})`,
            content: currentChunk.trim()
          });
          chunkIdx++;
          currentChunk = p + '\n\n';
        } else {
          currentChunk += p + '\n\n';
        }
      }
      if (currentChunk.trim()) {
        chapters.push({
          chapterId: `ch_${chunkIdx}`,
          chapterTitle: `Chương ${chunkIdx} (Trang ${chunkIdx})`,
          content: currentChunk.trim()
        });
      }
    }

    if (chapters.length <= 1) {
      alert('Văn bản quá ngắn để tách thành nhiều chương (dưới 2,000 ký tự hoặc không có phân đoạn rõ ràng). Bạn có thể lưu thành 1 bài đọc tiêu chuẩn.');
      return;
    }

    setDetectedChapters(chapters);
  };

  const handleSaveText = () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    
    const chapterData = detectedChapters && detectedChapters.length > 0 ? detectedChapters : null;
    
    if (activeTextId && texts.some(t => t.id === activeTextId)) {
      setTexts(texts.map(t => t.id === activeTextId ? { 
        ...t, 
        title: editTitle, 
        content: editContent,
        chapters: chapterData !== null ? chapterData : t.chapters
      } : t));
    } else {
      const newId = `t_${Date.now()}`;
      setTexts([{ 
        id: newId, 
        title: editTitle, 
        content: editContent,
        chapters: chapterData,
        level: 'Tùy chỉnh'
      }, ...texts]);
      setActiveTextId(newId);
    }
    setIsEditing(false);
    setDetectedChapters(null);
  };

  const createNew = () => {
    setActiveTextId(null);
    setEditTitle('');
    setEditContent('');
    setDetectedChapters(null);
    setIsEditing(true);
    setSelectedText('');
    setAudioUrl(null);
  };

  // ------------------ MEDIA ENGINE INTEGRATION ------------------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    alert('Tính năng trích xuất âm thanh sang văn bản (Transcribe) đã được chuyển sang chế độ Serverless. Vui lòng nhập Groq API Key trong mục Cài đặt (Settings) để sử dụng.');
  };

  const [ttsEngine, setTtsEngine] = useState(() => localStorage.getItem('omni_tts_engine') || 'edge-tts');
  const [ttsVoice, setTtsVoice] = useState(() => localStorage.getItem('omni_tts_voice') || 'ja-JP-NanamiNeural');

  useEffect(() => {
    localStorage.setItem('omni_tts_engine', ttsEngine);
    localStorage.setItem('omni_tts_voice', ttsVoice);
  }, [ttsEngine, ttsVoice]);

  const handleStopTTS = () => {
    isSpeechCancelledRef.current = true;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlayingTTS(false);
    setIsPausedTTS(false);
    setSpeakingLineIdx(null);
    currentUtteranceRef.current = null;
  };

  const handlePauseResumeTTS = () => {
    if (!window.speechSynthesis) return;
    if (isPausedTTS) {
      window.speechSynthesis.resume();
      setIsPausedTTS(false);
    } else {
      window.speechSynthesis.pause();
      setIsPausedTTS(true);
    }
  };

  // Phát TTS tuần tự từng đoạn/câu kèm hiệu ứng highlight dòng đang đọc và tự động cuộn
  const handleGenerateTTS = (textToRead, startIndex = 0) => {
    if (!window.speechSynthesis) {
      alert('Trình duyệt của bạn không hỗ trợ Text-to-Speech.');
      return;
    }
    window.speechSynthesis.cancel();
    isSpeechCancelledRef.current = false;

    // Lấy danh sách các câu cần đọc đồng bộ 100% với storySentences
    let lines = [];
    if (storySentences && storySentences.length > 0) {
      lines = storySentences.map(s => s.text);
    } else if (bilingualData && bilingualData.length > 0) {
      lines = bilingualData.map(b => b.original.trim()).filter(l => l.length > 0);
    } else {
      const source = textToRead || activeReadingContent || '';
      lines = source.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    }

    if (!lines || lines.length === 0) return;

    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');

    const speakLineAt = (idx) => {
      if (isSpeechCancelledRef.current || idx >= lines.length) {
        setIsPlayingTTS(false);
        setIsPausedTTS(false);
        setSpeakingLineIdx(null);
        currentUtteranceRef.current = null;
        return;
      }

      const rawLine = lines[idx];
      // Nếu dòng trống thì chuyển sang dòng kế tiếp
      if (!rawLine || !rawLine.trim()) {
        speakLineAt(idx + 1);
        return;
      }

      setSpeakingLineIdx(idx);
      setFocusedLineIdx(idx);

      // Cuộn mượt màn hình tới dòng đang đọc
      if (lineRefs.current[idx]) {
        lineRefs.current[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      const cleanText = rawLine.replace(/[「」『』（）()]/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = ttsSpeed;
      if (jpVoice) utterance.voice = jpVoice;

      utterance.onstart = () => {
        setIsPlayingTTS(true);
        setIsPausedTTS(false);
      };

      utterance.onend = () => {
        if (!isSpeechCancelledRef.current) {
          speakLineAt(idx + 1);
        }
      };

      utterance.onerror = () => {
        if (!isSpeechCancelledRef.current) {
          speakLineAt(idx + 1);
        }
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    setIsPlayingTTS(true);
    setIsPausedTTS(false);
    const startIdx = typeof startIndex === 'number' ? startIndex : (focusedLineIdx !== null ? focusedLineIdx : 0);
    speakLineAt(Math.max(0, Math.min(startIdx, lines.length - 1)));
  };

  // Người dùng bấm vào một dòng trong truyện để đặt tiêu điểm hoặc bắt đầu TTS từ dòng đó
  const handleLineClick = (idx) => {
    setFocusedLineIdx(idx);
    if (isPlayingTTS) {
      handleGenerateTTS(null, idx);
    }
  };

  // Điều hướng câu trước / câu sau trong Sách nói & Hoạt cảnh
  const handlePrevSentence = () => {
    const target = Math.max(0, activeSentenceIdx - 1);
    setFocusedLineIdx(target);
    if (isPlayingTTS) {
      handleGenerateTTS(null, target);
    }
  };

  const handleNextSentence = () => {
    const target = Math.min(storySentences.length - 1, activeSentenceIdx + 1);
    setFocusedLineIdx(target);
    if (isPlayingTTS) {
      handleGenerateTTS(null, target);
    }
  };

  // Chuyển toàn bộ câu chuyện sang Shadowing Studio
  const handleTransferToShadowing = async () => {
    if (!activeReadingContent) return;

    // Tách nội dung thành các câu chuẩn ngữ cảnh ngắn
    const rawSentences = activeReadingContent
      .split(/[。！？\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 2);

    if (rawSentences.length === 0) {
      alert('Không có nội dung câu để chuyển sang Shadowing.');
      return;
    }

    let currentTime = 0;
    const initialSegments = rawSentences.map((st, idx) => {
      const duration = Math.max(2.5, Math.round(st.length * 0.25 * 10) / 10);
      let viTrans = '';
      if (bilingualData && bilingualData[idx]) {
        viTrans = bilingualData[idx].translated || '';
      }
      const sentenceText = st.endsWith('。') ? st : st + '。';
      const seg = {
        start: currentTime,
        duration: duration,
        text: sentenceText,
        vi: viTrans || getCachedTranslation(sentenceText) || '',
        startOffset: 0,
        endOffset: 0
      };
      currentTime += duration + 0.5;
      return seg;
    });

    // Đảm bảo tất cả các câu đều có bản dịch tiếng Việt trước khi chuyển
    const segments = await ensureSegmentsHaveTranslation(initialSegments);

    const fullTitle = activeReadingTitle || activeText?.title || 'Bài đọc SLA';

    const payload = {
      id: `reading_${activeText?.id || 'story'}_${Date.now()}`,
      storyId: activeText?.id,
      title: fullTitle,
      level: activeText?.level || 'N5',
      genre: activeText?.genre || 'folktale',
      segments: segments,
      sourceType: 'reading'
    };

    // 1. Lưu vào storage key chuyên biệt
    localStorage.setItem('omni_shadowing_imported_story', JSON.stringify(payload));

    // 2. Cập nhật ngay vào omni_shadowing_session_v3
    try {
      const savedStore = JSON.parse(localStorage.getItem('omni_shadowing_session_v3') || '{}');
      if (!savedStore.sessionStore) savedStore.sessionStore = {};
      savedStore.sessionStore.reading = {
        title: payload.title,
        segments: segments,
        currentSegIdx: 0,
        scores: {}
      };
      savedStore.activeTab = 'reading';
      localStorage.setItem('omni_shadowing_session_v3', JSON.stringify(savedStore));
    } catch(e) {}

    // 3. Bắn event realtime cho instance ShadowingStudio đang chạy nền
    window.dispatchEvent(new CustomEvent('omni_shadowing_import', { detail: payload }));

    // 4. Điều hướng kèm router state
    navigate('/shadowing', { state: { importedStory: payload, t: Date.now() } });
  };

  // Tự động dừng phát âm thanh khi chuyển bài đọc hoặc chuyển chương
  useEffect(() => {
    handleStopTTS();
    setFocusedLineIdx(0);
    setSpeakingLineIdx(null);
  }, [activeTextId, chapterIndex]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const handleFetchLink = async () => {
    if (!urlInput.trim()) return;
    setIsProcessing(true);
    try {
      // Use CORS proxy to fetch HTML directly
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlInput.trim())}`);
      const data = await res.json();
      if (data.contents) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        // Lấy title
        const title = doc.title || 'Bài trích xuất Online';
        // Rút trích text đơn giản từ body (loại bỏ script/style)
        const scripts = doc.querySelectorAll('script, style, nav, footer, header');
        scripts.forEach(s => s.remove());
        const content = doc.body ? doc.body.innerText.replace(/\n\s*\n/g, '\n\n').trim() : 'Không tìm thấy nội dung.';
        
        setEditTitle(title);
        setEditContent(content);
        setUrlInput('');
      } else {
        alert('Lỗi: Không thể tải nội dung.');
      }
    } catch (err) {
      alert('Không thể tải URL này. Có thể trang web chặn CORS proxy.');
    }
    setIsProcessing(false);
  };

  const handleGenerateBilingual = async (textToRead) => {
    if (bilingualData) {
      setBilingualData(null);
      return;
    }
    setIsTranslating(true);
    try {
      const source = textToRead || activeReadingContent || '';
      const originalLines = source.split('\n');
      const translatedLines = await batchTranslateSentences(originalLines);
      const interleaved = originalLines.map((line, idx) => ({
        original: line,
        translated: translatedLines[idx] || ''
      }));
      setBilingualData(interleaved);
    } catch (err) {
      alert('Không thể kết nối dịch song ngữ.');
    } finally {
      setIsTranslating(false);
    }
  };
  // --------------------------------------------------------------

  // Handle Text Selection (Mouse Highlight)
  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text && text.length < 20) { // Only lookup short phrases
      setSelectedText(text);
      
      // Try to extract the sentence context
      if (selection.anchorNode && selection.anchorNode.nodeValue) {
        const fullText = selection.anchorNode.nodeValue;
        // Simple sentence boundary detection (。 or \n)
        const sentences = fullText.split(/[。！？\n]/);
        const targetSentence = sentences.find(s => s.includes(text));
        if (targetSentence) setSentenceContext(targetSentence.trim() + '。');
      }
    }
  };

  // Dictionary Lookup Logic
  const results = useMemo(() => {
    const qRaw = selectedText.toLowerCase().trim();
    if (!qRaw) return { vocab: [], kanji: [], grammar: [] };
    
    const qHira = toHiragana(qRaw);
    const normalize = (str) => (str || '').toLowerCase().replace(/[\.\-\s]/g, '');

    const vRes = vocabData.filter(v => normalize(v.word).includes(qRaw) || normalize(v.word).includes(qHira) || normalize(v.reading).includes(qRaw) || normalize(v.reading).includes(qHira) || normalize(v.vi).includes(qRaw)).slice(0, 10);
    const kRes = kanjiData.filter(k => normalize(k.kanji).includes(qRaw) || k.meanings.some(m => normalize(m).includes(qRaw)) || k.onyomi.some(o => normalize(o).includes(qRaw) || normalize(o).includes(qHira)) || k.kunyomi.some(ku => normalize(ku).includes(qRaw) || normalize(ku).includes(qHira))).slice(0, 5);
    const gRes = grammarData.filter(g => normalize(g.pattern).includes(qRaw) || normalize(g.pattern).includes(qHira) || normalize(g.meaning).includes(qRaw) || normalize(g.vi).includes(qRaw)).slice(0, 5);

    return { vocab: vRes, kanji: kRes, grammar: gRes };
  }, [selectedText, vocabData, kanjiData, grammarData]);

  // Add to Flashcards FSRS
  const addToFlashcards = (item, type) => {
    const newCard = {
      id: `c_${Date.now()}`,
      level: item.level || 'Khác',
      word: item.word || item.kanji || item.pattern,
      reading: item.reading || item.onyomi?.join(', ') || '',
      vi: item.vi || item.meanings?.join(', ') || item.meaning,
      examples: sentenceContext ? [sentenceContext] : (item.examples || []),
      type: type === 'kanji' ? 'Hán tự' : (type === 'grammar' ? 'Ngữ pháp' : 'Từ vựng')
    };
    
    const success = addCustomCard(newCard);
    
    if (success) {
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 2000);
    } else {
      alert('Từ này đã có trong danh sách Flashcard của bạn!');
    }
  };

  const renderCatalogInner = () => (
    <>
      {/* Header & Quick Action Row */}
      <div style={{ padding: '10px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <BookOpen size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Kho Ngữ Liệu Đọc</span>
          <span style={{ fontSize: '0.68rem', background: 'var(--accent-subtle)', color: 'var(--accent-primary)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
            {READING_CORPUS.length} tác phẩm
          </span>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => {
            createNew();
            if (!isCatalogPinned) setIsCatalogDrawerOpen(false);
          }} 
          style={{ padding: '3px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}
          title="Tạo hoặc dán bài đọc mới"
        >
          <PlusCircle size={13}/> Tạo mới
        </button>
      </div>

      <div style={{ padding: '0 10px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
        {/* Instant Search Bar */}
        <div style={{ marginTop: 8, position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Tìm tác phẩm, tác giả..."
            value={storySearch}
            onChange={e => setStorySearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 26px 6px 27px',
              fontSize: '0.78rem',
              background: 'var(--bg-hover)',
              border: '1px solid var(--glass-border-strong)',
              borderRadius: 6,
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {storySearch && (
            <button
              onClick={() => setStorySearch('')}
              style={{
                position: 'absolute',
                right: 7,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: 2
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, background: 'var(--bg-hover)', padding: 2, borderRadius: 6, border: '1px solid var(--glass-border)' }}>
          <button
            onClick={() => setLeftTab('classics')}
            style={{
              padding: '6px 2px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: leftTab === 'classics' ? 700 : 500,
              background: leftTab === 'classics' ? 'var(--accent-primary)' : 'transparent',
              color: leftTab === 'classics' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
          >
            📚 Tác Phẩm
          </button>
          <button
            onClick={() => setLeftTab('corpus_stream')}
            style={{
              padding: '6px 2px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: leftTab === 'corpus_stream' ? 700 : 500,
              background: leftTab === 'corpus_stream' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'transparent',
              color: leftTab === 'corpus_stream' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
          >
            ⚡ Dòng Chảy
          </button>
          <button
            onClick={() => setLeftTab('custom')}
            style={{
              padding: '6px 2px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: leftTab === 'custom' ? 700 : 500,
              background: leftTab === 'custom' ? 'var(--accent-primary)' : 'transparent',
              color: leftTab === 'custom' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
          >
            📝 Tự Tạo ({texts.length})
          </button>
        </div>

        {/* Level Filters with Dynamic Counts */}
        {leftTab === 'classics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 }}>
              {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  style={{
                    padding: '4px 0',
                    borderRadius: 5,
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: levelFilter === lvl 
                      ? (LEVEL_COLORS[lvl] || 'var(--accent-primary)') 
                      : 'var(--bg-hover)',
                    color: levelFilter === lvl ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                    textAlign: 'center',
                    lineHeight: 1.15
                  }}
                  title={`Cấp độ ${lvl}: ${levelCounts[lvl] || 0} tác phẩm`}
                >
                  <div>{lvl === 'ALL' ? 'Tất cả' : lvl}</div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>({levelCounts[lvl] || 0})</div>
                </button>
              ))}
            </div>

            {/* Genre Filter Pills */}
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
              {[
                { id: 'ALL', label: 'Toàn bộ thể loại' },
                { id: 'folktale', label: '🏛️ Cổ tích' },
                { id: 'literature', label: '📚 Văn học' },
                { id: 'daily', label: '🌱 Đời sống' },
                { id: 'culture', label: '⛩️ Văn hóa' },
                { id: 'business', label: '💼 Công sở' },
                { id: 'news', label: '📰 Thời sự' },
                { id: 'academic', label: '🎓 Tiểu luận' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setGenreFilter(g.id)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '2px 7px',
                    borderRadius: 12,
                    fontSize: '0.67rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: genreFilter === g.id ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                    background: genreFilter === g.id ? 'var(--accent-subtle)' : 'var(--bg-hover)',
                    color: genreFilter === g.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    flexShrink: 0,
                    transition: 'all 0.15s'
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: KHO TÁC PHẨM KINH ĐIỂN */}
        {leftTab === 'classics' && (
          <>
            <div style={{ padding: '3px 4px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Thư viện tác phẩm</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{filteredStories.length} / {READING_CORPUS.length} tác phẩm</span>
            </div>

            {filteredStories.map(story => {
              const parsed = parseStoryTitle(story.title);
              const isActive = activeTextId === story.id && !isEditing;
              const lvlColor = LEVEL_COLORS[story.level.slice(0, 2)] || '#3b82f6';
              return (
                <div 
                  key={story.id} 
                  onClick={() => {
                    setActiveTextId(story.id);
                    setIsEditing(false);
                    setSelectedText('');
                    setAudioUrl(null);
                    if (!isCatalogPinned) {
                      setIsCatalogDrawerOpen(false);
                    }
                  }}
                  style={{ 
                    padding: '8px 10px', 
                    borderRadius: 8, 
                    cursor: 'pointer', 
                    background: isActive ? 'var(--accent-subtle)' : 'var(--bg-surface)', 
                    borderLeft: `3px solid ${isActive ? 'var(--accent-primary)' : 'transparent'}`,
                    border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                    transition: 'all 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ 
                      fontSize: '0.88rem', 
                      fontWeight: 600, 
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)', 
                      lineHeight: 1.35,
                      wordBreak: 'break-word'
                    }}>
                      {parsed.main}
                    </div>
                    {parsed.sub && (
                      <div style={{ 
                        fontSize: '0.74rem', 
                        color: 'var(--text-secondary)', 
                        lineHeight: 1.3,
                        wordBreak: 'break-word'
                      }}>
                        {parsed.sub}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                    <span style={{ background: `${lvlColor}20`, color: lvlColor, padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>{story.level}</span>
                    {story.chapters && story.chapters.length > 0 && (
                      <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', padding: '1px 5px', borderRadius: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                        📖 {story.chapters.length} chương
                      </span>
                    )}
                    {story.genreLabel && <span style={{ color: 'var(--accent-primary)' }}>{story.genreLabel.split(' ')[0]}</span>}
                    {story.author && <span style={{ color: 'var(--text-secondary)' }}>✍️ {story.author}</span>}
                    <span>⏱️ {story.readingTime}</span>
                  </div>
                </div>
              );
            })}
            {filteredStories.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Không tìm thấy tác phẩm nào phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </>
        )}

        {/* TAB 2: BÀI TỰ TẠO CỦA NGƯỜI DÙNG */}
        {leftTab === 'custom' && (
          <>
            <div style={{ padding: '4px 6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Tài liệu cá nhân ({texts.length})
            </div>
            {texts.map(t => {
              const parsed = parseStoryTitle(t.title);
              const isActive = activeTextId === t.id && !isEditing;
              return (
                <div 
                  key={t.id} 
                  onClick={() => {
                    setActiveTextId(t.id);
                    setIsEditing(false);
                    setSelectedText('');
                    setAudioUrl(null);
                    if (!isCatalogPinned) {
                      setIsCatalogDrawerOpen(false);
                    }
                  }}
                  style={{ 
                    padding: '8px 10px', 
                    borderRadius: 8, 
                    cursor: 'pointer', 
                    background: isActive ? 'var(--accent-subtle)' : 'var(--bg-surface)', 
                    borderLeft: `3px solid ${isActive ? 'var(--accent-primary)' : 'transparent'}`,
                    border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                    transition: 'all 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.35 }}>
                    <FileText size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle', opacity: 0.7 }}/>
                    {parsed.main}
                  </div>
                  {parsed.sub && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', paddingLeft: 18, wordBreak: 'break-word' }}>
                      {parsed.sub}
                    </div>
                  )}
                  {t.chapters && t.chapters.length > 0 && (
                    <div style={{ fontSize: '0.7rem', color: '#d97706', paddingLeft: 18 }}>
                      📖 {t.chapters.length} chương
                    </div>
                  )}
                </div>
              );
            })}
            {texts.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Chưa có bài đọc nào.<br/>Nhấn nút Tạo mới để dán bài hoặc tải link online.
              </div>
            )}
          </>
        )}

        {/* TAB 3: DÒNG CHẢY NGỮ CẢNH 100% */}
        {leftTab === 'corpus_stream' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 10,
              padding: '12px 10px',
              fontSize: '0.8rem'
            }}>
              <div style={{ fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Sparkles size={15} /> 100% Độ Phủ Ngữ Cảnh
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', lineHeight: 1.4 }}>
                Bao phủ toàn bộ 9,248 từ vựng, 2,191 ngữ pháp & 2,674 Hán tự từ N5 đến N1 với phát âm và nạp FSRS 1-chạm.
              </div>
            </div>

            {/* Mode Selector */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Phân Loại Ngữ Liệu
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { id: 'vocab', label: '📖 Toàn Bộ Từ Vựng', count: vocabData.length || 9248, color: '#3b82f6' },
                { id: 'grammar', label: '📐 Mẫu Ngữ Pháp', count: grammarData.length || 2191, color: '#10b981' },
                { id: 'kanji', label: '🈴 Hán Tự JLPT', count: kanjiData.length || 2674, color: '#8b5cf6' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => handleCorpusFilterChange(undefined, m.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: corpusMode === m.id ? `1px solid ${m.color}` : '1px solid rgba(255,255,255,0.06)',
                    background: corpusMode === m.id ? `${m.color}20` : 'rgba(255,255,255,0.02)',
                    color: corpusMode === m.id ? '#fff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    fontWeight: corpusMode === m.id ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>{m.label}</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>
                    {m.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Level Filter */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
              Cấp Độ JLPT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => handleCorpusFilterChange(lvl, undefined)}
                  style={{
                    padding: '6px 4px',
                    borderRadius: 6,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: corpusLevel === lvl 
                      ? (LEVEL_COLORS[lvl] || 'var(--accent-primary)') 
                      : 'rgba(255,255,255,0.05)',
                    color: corpusLevel === lvl ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s'
                  }}
                >
                  {lvl === 'ALL' ? 'Tất cả' : lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '16px 8px 6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Nguồn Khuyến Nghị SLA</div>
        {QUICK_LINKS.map(link => (
          <a 
            key={link.title} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, color: 'var(--accent-primary)', textDecoration: 'none', transition: 'all 0.2s', border: '1px solid transparent', fontSize: '0.82rem' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <ExternalLink size={13} />
            <span style={{ fontWeight: 600 }}>{link.title}</span>
          </a>
        ))}
      </div>
    </>
  );

  const renderDictionaryInner = () => (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1 }}>
      {!selectedText ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            background: 'var(--accent-subtle)',
            border: '1px solid var(--glass-border)',
            borderRadius: 6,
            padding: '8px 10px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.35
          }}>
            💡 Bôi đen bất kỳ từ nào trong bài để tra cứu nhanh, hoặc chọn từ vựng tiêu biểu bên dưới:
          </div>

          <div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--accent-primary)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}>
              <Sparkles size={12} /> Từ vựng tiêu biểu trong bài ({keyChapterVocab.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {keyChapterVocab.map((v, i) => (
                <div
                  key={v.id || `${v.word}_${i}`}
                  style={{
                    padding: '7px 9px',
                    background: 'var(--bg-surface)',
                    borderRadius: 6,
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                      <span className="jp-text" style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>{v.word}</span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 500 }}>{v.reading}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => speak(v.word)}
                        title="Nghe phát âm"
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                      >
                        <Volume2 size={13} />
                      </button>
                      <span style={{ fontSize: '0.64rem', padding: '1px 5px', borderRadius: 4, background: `${LEVEL_COLORS[v.level] || 'var(--accent-primary)'}20`, color: LEVEL_COLORS[v.level] || 'var(--accent-primary)', fontWeight: 800 }}>
                        {v.level}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.3, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.vi || v.meaning}>
                      {v.vi || v.meaning}
                    </div>
                    <button
                      onClick={() => addToFlashcards(v, 'vocab')}
                      title="Nạp vào Deck FSRS"
                      style={{
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--glass-border-strong)',
                        color: 'var(--text-primary)',
                        padding: '2px 7px',
                        borderRadius: 4,
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        flexShrink: 0
                      }}
                    >
                      <PlusCircle size={11} style={{ color: 'var(--accent-success)' }} /> FSRS
                    </button>
                  </div>
                </div>
              ))}
              {keyChapterVocab.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.78rem', padding: '16px 0' }}>
                  Đang phân tích từ vựng bài đọc...
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: '10px 12px', background: 'var(--accent-subtle)', borderRadius: 8, border: '1px solid var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', marginBottom: 2 }}>Từ đang chọn:</div>
              <div className="jp-text" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedText}</div>
            </div>
            <button
              onClick={() => setSelectedText('')}
              title="Xóa lựa chọn"
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: 4 }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Vocab Results */}
          {results.vocab.length > 0 && (
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Từ vựng ({results.vocab.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.vocab.map(v => (
                  <div key={v.id} style={{ padding: '9px 11px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div className="jp-text" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{v.word || v.reading}</div>
                      <span style={{ fontSize: '0.66rem', padding: '1px 5px', borderRadius: 4, background: `${LEVEL_COLORS[v.level] || 'var(--accent-primary)'}20`, color: LEVEL_COLORS[v.level] || 'var(--accent-primary)', fontWeight: 800 }}>{v.level}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: 4, fontWeight: 500 }}>{v.reading}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
                      <ViText text={v.vi}/><br/>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{v.vi}</span>
                    </div>
                    <button onClick={() => addToFlashcards(v, 'vocab')} className="btn btn-outline" style={{ width: '100%', padding: '5px', fontSize: '0.76rem', display: 'flex', justifyContent: 'center', gap: 5, borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
                      <PlusCircle size={13}/> Thêm vào Flashcard
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kanji Results */}
          {results.kanji.length > 0 && (
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-success)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hán tự ({results.kanji.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.kanji.map(k => (
                  <div key={k.id} style={{ padding: '9px 11px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--glass-border)', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="jp-text" style={{ fontSize: '2.2rem', lineHeight: 1, color: LEVEL_COLORS[k.level] || 'var(--text-primary)' }}>{k.kanji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        <ViText text={k.meanings.join(', ')} />
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>ON:</span> {k.onyomi.join(', ')}<br/>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>KUN:</span> {k.kunyomi.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar Results */}
          {results.grammar.length > 0 && (
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-warning)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ngữ pháp ({results.grammar.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.grammar.map(g => (
                  <div key={g.id} style={{ padding: '9px 11px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div className="jp-text" style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>{g.pattern}</div>
                      <span style={{ fontSize: '0.66rem', padding: '1px 5px', borderRadius: 4, background: `${LEVEL_COLORS[g.level] || 'var(--accent-warning)'}20`, color: LEVEL_COLORS[g.level] || 'var(--accent-warning)', fontWeight: 800 }}>{g.level}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{g.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.vocab.length === 0 && results.kanji.length === 0 && results.grammar.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px 0', fontSize: '0.8rem' }}>
              Không tìm thấy kết quả phù hợp trong Từ điển.
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 14, height: 'calc(100vh - 90px)', position: 'relative', overflow: 'hidden' }}>
      
      {/* MAIN CONTENT: Reader / Editor / Corpus Stream (Starts cleanly from left edge) */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {leftTab === 'corpus_stream' ? (
          <div style={{ padding: '24px 32px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Sparkles size={13} /> DÒNG CHẢY NGỮ CẢNH 100%
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    SLA Comprehensible Input v17.0
                  </span>
                </div>
                <h2 style={{ fontSize: '1.45rem', color: 'var(--text-primary)', margin: 0 }}>
                  {corpusMode === 'vocab' ? 'Toàn Bộ Từ Vựng JLPT N5 - N1 Trong Ngữ Cảnh' : corpusMode === 'grammar' ? 'Cấu Trúc Ngữ Pháp & Mẫu Câu Thực Tế' : 'Hán Tự & Tổ Hợp Từ Vựng Đa Tầng'}
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Bao trọn 100% tri thức ngôn ngữ N5-N1. Đọc lướt câu ngữ cảnh, nghe giọng AI bản ngữ chuẩn Tokyo và nạp trực tiếp vào FSRS để lưu giữ trí nhớ dài hạn.
                </p>
              </div>

              {/* Search Box */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 260 }}>
                <input
                  type="text"
                  placeholder={`Tìm ${corpusMode === 'vocab' ? 'từ vựng, kanji, nghĩa' : corpusMode === 'grammar' ? 'mẫu câu, ngữ pháp' : 'kanji, âm Hán Việt'}...`}
                  value={corpusSearch}
                  onChange={e => { setCorpusSearch(e.target.value); setCorpusPage(1); }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--glass-border-strong)',
                    background: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                {corpusSearch && (
                  <button
                    onClick={() => { setCorpusSearch(''); setCorpusPage(1); }}
                    style={{
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-secondary)',
                      borderRadius: 6,
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Status & Pagination Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 14px',
              background: 'var(--bg-hover)',
              borderRadius: 8,
              border: '1px solid var(--glass-border)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
              gap: 8
            }}>
              <div>
                Đang hiển thị: <strong>{filteredCorpusData.length}</strong> mục (Cấp độ: <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{corpusLevel}</span>) · Trang <strong>{corpusPage}</strong> / {totalCorpusPages}
              </div>

              {/* Pagination Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setCorpusPage(p => Math.max(1, p - 1))}
                  disabled={corpusPage === 1}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', opacity: corpusPage === 1 ? 0.4 : 1, color: 'var(--text-primary)' }}
                >
                  ← Trước
                </button>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', padding: '0 4px' }}>
                  {corpusPage} / {totalCorpusPages}
                </span>
                <button
                  className="btn btn-outline"
                  onClick={() => setCorpusPage(p => Math.min(totalCorpusPages, p + 1))}
                  disabled={corpusPage === totalCorpusPages}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', opacity: corpusPage === totalCorpusPages ? 0.4 : 1, color: 'var(--text-primary)' }}
                >
                  Sau →
                </button>
              </div>
            </div>

            {/* Cards List */}
            <div 
              ref={contentRef}
              onMouseUp={handleSelection}
              onTouchEnd={handleSelection}
              style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}
            >
              {paginatedCorpusItems.map((item, idx) => {
                const lvlColor = LEVEL_COLORS[item.level?.slice(0, 2)] || '#3b82f6';

                if (corpusMode === 'vocab') {
                  const exampleText = item.examples && item.examples.length > 0 ? (typeof item.examples[0] === 'string' ? item.examples[0] : `${item.examples[0].jp} : ${item.examples[0].vi}`) : '';
                  return (
                    <div
                      key={item.id || `v_${idx}`}
                      style={{
                        padding: '12px 16px',
                        background: 'var(--bg-surface)',
                        borderRadius: 8,
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                          <span style={{
                            background: lvlColor,
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}>
                            {item.level || 'N5'}
                          </span>
                          <span className="jp-text" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {item.word}
                          </span>
                          {item.reading && item.reading !== item.word && (
                            <span className="jp-text" style={{ fontSize: '0.92rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                              （{item.reading}）
                            </span>
                          )}
                          {item.type && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', background: 'var(--bg-hover)', padding: '1px 6px', borderRadius: 4 }}>
                              {item.type}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => speak(item.word)}
                            title="Nghe phát âm từ"
                            style={{
                              background: 'var(--accent-subtle)',
                              border: '1px solid var(--glass-border-strong)',
                              color: 'var(--accent-primary)',
                              borderRadius: 6,
                              padding: '4px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.75rem'
                            }}
                          >
                            <Volume2 size={13} /> Nghe
                          </button>
                          <button
                            onClick={() => addToFlashcards(item, 'vocab')}
                            title="Nạp vào Deck FSRS"
                            style={{
                              background: 'var(--bg-hover)',
                              border: '1px solid var(--glass-border-strong)',
                              color: 'var(--text-primary)',
                              borderRadius: 6,
                              padding: '4px 10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <BookmarkPlus size={13} style={{ color: 'var(--accent-success)' }} /> + FSRS
                          </button>
                        </div>
                      </div>

                      {/* Meaning */}
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {item.vi || item.meaning}
                      </div>

                      {/* Example sentence */}
                      {exampleText && (
                        <div style={{
                          padding: '7px 12px',
                          background: 'var(--bg-hover)',
                          borderRadius: 6,
                          borderLeft: `3px solid ${lvlColor}`,
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 10
                        }}>
                          <span className="jp-text">{exampleText}</span>
                          <button
                            onClick={() => speak(exampleText.split(/[:：]/)[0])}
                            title="Nghe câu ví dụ"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer',
                              padding: 2,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Volume2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                } else if (corpusMode === 'grammar') {
                  return (
                    <div
                      key={item.id || `g_${idx}`}
                      style={{
                        padding: '12px 16px',
                        background: 'var(--bg-surface)',
                        borderRadius: 8,
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'gap 8' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                          <span style={{
                            background: lvlColor,
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}>
                            {item.level || 'N5'}
                          </span>
                          <span className="jp-text" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {item.pattern || item.title}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => addToFlashcards(item, 'grammar')}
                            title="Nạp vào Deck FSRS"
                            style={{
                              background: 'var(--bg-hover)',
                              border: '1px solid var(--glass-border-strong)',
                              color: 'var(--text-primary)',
                              borderRadius: 6,
                              padding: '4px 10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <BookmarkPlus size={13} style={{ color: 'var(--accent-success)' }} /> + FSRS
                          </button>
                        </div>
                      </div>

                      {/* Meaning */}
                      <div style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        {item.meaning || item.vi}
                      </div>

                      {/* Explanation */}
                      {item.explanation && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                          {item.explanation.slice(0, 300)}{item.explanation.length > 300 ? '...' : ''}
                        </div>
                      )}

                      {/* Examples */}
                      {item.examples && item.examples.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                          {item.examples.slice(0, 2).map((ex, exIdx) => {
                            const jpText = typeof ex === 'object' ? ex.jp : ex;
                            const viText = typeof ex === 'object' ? ex.vi : '';
                            return (
                              <div
                                key={exIdx}
                                style={{
                                  padding: '7px 12px',
                                  background: 'var(--bg-hover)',
                                  borderRadius: 6,
                                  borderLeft: `3px solid ${lvlColor}`,
                                  fontSize: '0.85rem',
                                  color: 'var(--text-secondary)',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <div>
                                  <div className="jp-text" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{jpText}</div>
                                  {viText && <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{viText}</div>}
                                </div>
                                <button
                                  onClick={() => speak(jpText)}
                                  title="Nghe câu ví dụ"
                                  style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 2 }}
                                >
                                  <Volume2 size={13} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  // Kanji
                  return (
                    <div
                      key={item.id || `k_${idx}`}
                      style={{
                        padding: '12px 16px',
                        background: 'var(--bg-surface)',
                        borderRadius: 8,
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{
                            background: lvlColor,
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}>
                            {item.level || 'N5'}
                          </span>
                          <span className="jp-text" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                            {item.kanji}
                          </span>
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {Array.isArray(item.meanings) ? item.meanings.join(', ') : item.meaning}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                              {item.onyomi?.length > 0 && <span>Âm On: <strong>{item.onyomi.join('・')}</strong> </span>}
                              {item.kunyomi?.length > 0 && <span>| Âm Kun: <strong>{item.kunyomi.join('・')}</strong></span>}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => speak(item.kanji)}
                            title="Phát âm"
                            style={{
                              background: 'var(--accent-subtle)',
                              border: '1px solid var(--glass-border-strong)',
                              color: 'var(--accent-primary)',
                              borderRadius: 6,
                              padding: '4px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.75rem'
                            }}
                          >
                            <Volume2 size={13} /> Nghe
                          </button>
                          <button
                            onClick={() => addToFlashcards(item, 'kanji')}
                            title="Nạp vào Deck FSRS"
                            style={{
                              background: 'var(--bg-hover)',
                              border: '1px solid var(--glass-border-strong)',
                              color: 'var(--text-primary)',
                              borderRadius: 6,
                              padding: '4px 10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <BookmarkPlus size={13} style={{ color: 'var(--accent-success)' }} /> + FSRS
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}

              {paginatedCorpusItems.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Không tìm thấy mục nào phù hợp với bộ lọc và từ khóa hiện tại.
                </div>
              )}
            </div>

            {/* Bottom Pagination */}
            {totalCorpusPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '16px 0' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setCorpusPage(1)}
                  disabled={corpusPage === 1}
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  ⏮ Đầu
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setCorpusPage(p => Math.max(1, p - 1))}
                  disabled={corpusPage === 1}
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  ◀ Trước
                </button>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', padding: '0 8px' }}>
                  Trang {corpusPage} / {totalCorpusPages}
                </span>
                <button
                  className="btn btn-outline"
                  onClick={() => setCorpusPage(p => Math.min(totalCorpusPages, p + 1))}
                  disabled={corpusPage === totalCorpusPages}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--text-primary)' }}
                >
                  Sau ▶
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setCorpusPage(totalCorpusPages)}
                  disabled={corpusPage === totalCorpusPages}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--text-primary)' }}
                >
                  Cuối ⏭
                </button>
              </div>
            )}
          </div>
        ) : isEditing ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
            
            {/* ONLINE MODE / STT FETCHING */}
            <div style={{ display: 'flex', gap: 12, padding: 16, background: 'var(--accent-subtle)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Tải nội dung Online (YouTube Subtitles, Bài Báo)</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="text" 
                    placeholder="Nhập URL (VD: Link YouTube, NHK Web Easy, Sách báo...)"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', fontSize: '0.95rem', borderRadius: 6, border: '1px solid var(--glass-border-strong)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <button className="btn btn-outline" onClick={handleFetchLink} disabled={isProcessing} style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isProcessing ? <Loader size={16} className="spin" /> : <Globe size={16} />} Tải Online
                  </button>
                </div>
              </div>
              <div style={{ width: 1, background: 'var(--glass-border)', margin: '0 8px' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Hoặc bóc băng file Offline</div>
                <label className="btn btn-secondary" style={{ cursor: isProcessing ? 'not-allowed' : 'pointer', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: isProcessing ? 'gray' : '' }}>
                  {isProcessing ? <Loader size={16} className="spin" /> : <UploadCloud size={16} />}
                  Tải Video/Audio AI
                  <input type="file" accept="audio/*,video/*" hidden onChange={handleFileUpload} disabled={isProcessing} />
                </label>
              </div>
            </div>

            <input 
              type="text" 
              placeholder="Tiêu đề bài đọc (VD: Tin tức NHK ngày 15/10)"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', fontSize: '1.2rem', borderRadius: 8, border: '1px solid var(--glass-border-strong)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }}
            />
            <textarea
              placeholder="Dán nội dung tiếng Nhật vào đây..."
              className="jp-text immersion-prose"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              style={{ flex: 1, width: '100%', padding: 16, fontSize: '1.15rem', lineHeight: 1.8, borderRadius: 8, border: '1px solid var(--glass-border-strong)', background: 'var(--bg-surface)', color: 'var(--text-primary)', resize: 'none', outline: 'none' }}
            />
            {detectedChapters && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 8,
                fontSize: '0.82rem',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>
                  ✅ Đã phân tích & tách thành <strong>{detectedChapters.length}</strong> chương tự động!
                </span>
                <button
                  type="button"
                  onClick={() => setDetectedChapters(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  Hủy tách chương
                </button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleAutoSplitChapters}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', borderColor: '#f59e0b', color: '#fbbf24' }}
              >
                <Scissors size={15} /> ✂️ Tự Động Tách Chương (Aozora / Sách Dài)
              </button>

              <div style={{ display: 'flex', gap: 12 }}>
                {activeTextId && <button className="btn btn-outline" onClick={() => { setIsEditing(false); setDetectedChapters(null); }}>Hủy</button>}
                <button className="btn btn-primary" onClick={handleSaveText} style={{ padding: '10px 24px' }}>
                  {detectedChapters ? `Lưu sách (${detectedChapters.length} chương)` : 'Lưu bài đọc'}
                </button>
              </div>
            </div>
          </div>
        ) : activeText ? (
          <div style={{ padding: zenMode ? '8px 16px' : '10px 18px', overflowY: 'auto', height: '100%' }}>
            
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* UNIFIED COMPACT READING HEADER BAR (~48px HEIGHT)                  */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="unified-reading-bar" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              borderRadius: 10,
              padding: '6px 12px',
              marginBottom: 10,
              gap: 8,
              flexWrap: 'wrap',
              position: 'sticky',
              top: 0,
              zIndex: 30,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              {/* LEFT: Quick Catalog & Chapter Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 260, flex: '1 1 auto' }}>
                <button 
                  className={`btn ${isCatalogDrawerOpen && rightDrawerTab === 'catalog' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    if (isCatalogDrawerOpen && rightDrawerTab === 'catalog') {
                      setIsCatalogDrawerOpen(false);
                    } else {
                      setIsCatalogDrawerOpen(true);
                      setRightDrawerTab('catalog');
                    }
                  }} 
                  title="Mở Danh Mục Kho Tác Phẩm (294 tác phẩm)"
                  style={{ padding: '3px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                >
                  <BookOpen size={13} /> Kho ({READING_CORPUS.length})
                </button>

                {activeText.level && (
                  <span style={{
                    background: LEVEL_COLORS[activeText.level.slice(0, 2)] || 'var(--accent-primary)',
                    color: 'white',
                    padding: '2px 7px',
                    borderRadius: 4,
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    {activeText.level}
                  </span>
                )}

                {/* Chapter Selector & Title */}
                {activeText?.chapters && activeText.chapters.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--glass-border-strong)' }}>
                    <button
                      type="button"
                      onClick={() => handleSelectChapter(Math.max(0, chapterIndex - 1))}
                      disabled={chapterIndex === 0}
                      title="Chương trước"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: chapterIndex === 0 ? 'not-allowed' : 'pointer',
                        opacity: chapterIndex === 0 ? 0.3 : 1,
                        padding: '2px 3px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <select
                      value={chapterIndex}
                      onChange={e => handleSelectChapter(Number(e.target.value))}
                      style={{
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        outline: 'none',
                        cursor: 'pointer',
                        maxWidth: 240
                      }}
                    >
                      {activeText.chapters.map((ch, idx) => {
                        const p = parseStoryTitle(ch.chapterTitle || '');
                        const label = p.sub ? `${p.main} (${p.sub})` : p.main;
                        return (
                          <option key={ch.chapterId || idx} value={idx}>
                            {`[${idx + 1}/${activeText.chapters.length}] ${label}`}
                          </option>
                        );
                      })}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleSelectChapter(Math.min(activeText.chapters.length - 1, chapterIndex + 1))}
                      disabled={chapterIndex === activeText.chapters.length - 1}
                      title="Chương sau"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: chapterIndex === activeText.chapters.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: chapterIndex === activeText.chapters.length - 1 ? 0.3 : 1,
                        padding: '2px 3px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    <FuriganaText text={bookInfo.main} />
                  </span>
                )}

                {/* Info button for viewing book synopsis / details */}
                <button
                  type="button"
                  onClick={() => setShowBookSynopsis(prev => !prev)}
                  title={showBookSynopsis ? "Thu gọn giới thiệu" : "Xem thông tin & tóm tắt tác phẩm"}
                  style={{
                    background: showBookSynopsis ? 'var(--accent-subtle)' : 'transparent',
                    border: '1px solid',
                    borderColor: showBookSynopsis ? 'var(--accent-primary)' : 'var(--glass-border)',
                    color: showBookSynopsis ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                    borderRadius: 6,
                    padding: '3px 6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}
                >
                  <Info size={13} />
                  <span className="hide-on-mobile">Mô tả</span>
                </button>

                {activeText.id.startsWith('t_') && (
                  <button className="btn btn-outline" onClick={() => { setEditTitle(activeText.title); setEditContent(activeText.content); setIsEditing(true); }} style={{ padding: '3px 7px', fontSize: '0.72rem' }}>
                    ✏️ Sửa
                  </button>
                )}
              </div>

              {/* RIGHT: Compact SLA Badge & Reading Tools */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                
                {/* Compact SLA Pill */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowSlaPopover(prev => !prev)}
                    title="Bấm để xem phân tích cấp độ Krashen SLA & lỗ hổng kiến thức"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: showSlaPopover ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                      border: '1px solid',
                      borderColor: showSlaPopover ? 'var(--accent-primary)' : 'var(--glass-border-strong)',
                      padding: '3px 8px',
                      borderRadius: 16,
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span style={{
                      background: readabilityStats.tierBadgeColor,
                      color: '#fff',
                      borderRadius: 4,
                      padding: '1px 5px',
                      fontSize: '0.66rem',
                      fontWeight: 800
                    }}>
                      {readabilityStats.krashenTier}
                    </span>
                    <span style={{ color: readabilityStats.tierBadgeColor }}>{readabilityStats.coverage}%</span>
                    <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>· ~{readabilityStats.readingMinutes}p</span>
                    <ChevronDown size={11} style={{ transform: showSlaPopover ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-tertiary)' }} />
                  </button>

                  {/* SLA DETAILS POPOVER */}
                  {showSlaPopover && (
                    <div style={{
                      position: 'absolute',
                      top: '115%',
                      right: 0,
                      width: 320,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--glass-border-strong)',
                      borderRadius: 10,
                      padding: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Sparkles size={13} color="var(--accent-primary)" /> Phân tích Krashen SLA (i+1)
                        </span>
                        <button onClick={() => setShowSlaPopover(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                          <X size={13} />
                        </button>
                      </div>

                      {/* Mini Spectrum */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-surface)', padding: '5px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>
                        <span style={{ color: LEVEL_COLORS.N5 }}>N5: {gapAnalysis.spectrum.N5}%</span>
                        <span style={{ color: LEVEL_COLORS.N4 }}>N4: {gapAnalysis.spectrum.N4}%</span>
                        <span style={{ color: LEVEL_COLORS.N3 }}>N3: {gapAnalysis.spectrum.N3}%</span>
                        <span style={{ color: LEVEL_COLORS.N2 }}>N2: {gapAnalysis.spectrum.N2}%</span>
                        <span style={{ color: LEVEL_COLORS.N1 }}>N1: {gapAnalysis.spectrum.N1}%</span>
                      </div>

                      {/* Target Level */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Mục tiêu:</span>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {['N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
                            <button
                              key={lvl}
                              onClick={() => setMyTargetLevel(lvl)}
                              style={{
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: myTargetLevel === lvl ? `1px solid ${LEVEL_COLORS[lvl]}` : '1px solid transparent',
                                background: myTargetLevel === lvl ? `${LEVEL_COLORS[lvl]}20` : 'transparent',
                                color: myTargetLevel === lvl ? LEVEL_COLORS[lvl] : 'var(--text-tertiary)'
                              }}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Gap Remediation & Mark as finished */}
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--glass-border)' }}>
                        <button
                          onClick={() => { setShowGapDrawer(!showGapDrawer); setShowSlaPopover(false); }}
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--glass-border-strong)',
                            color: 'var(--accent-primary)',
                            padding: '4px 8px',
                            borderRadius: 5,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Sliders size={11} /> Lỗ hổng {myTargetLevel} ({gapAnalysis.matchedTargetVocab.length})
                        </button>

                        <button
                          onClick={() => { handleFinishReading(); setShowSlaPopover(false); }}
                          disabled={hasLoggedReading}
                          style={{
                            background: hasLoggedReading ? 'var(--accent-success)' : 'var(--accent-primary)',
                            border: 'none',
                            color: '#ffffff',
                            padding: '4px 10px',
                            borderRadius: 5,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: hasLoggedReading ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {hasLoggedReading ? <><CheckCheck size={12} /> Đã lưu</> : <><CheckCircle size={12} /> Đã đọc xong</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dual Mode Switcher: Văn Bản vs Manga */}
                <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-hover)', borderRadius: 16, border: '1px solid var(--glass-border-strong)', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setReaderMode('prose')}
                    title="Chế độ đọc văn bản truyền thống"
                    style={{
                      background: readerMode === 'prose' ? 'var(--accent-primary)' : 'transparent',
                      color: readerMode === 'prose' ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: 14,
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3
                    }}
                  >
                    <BookOpen size={11} /> Văn bản
                  </button>

                  <button
                    type="button"
                    onClick={() => setReaderMode('manga')}
                    title="Chế độ Manga Tương Tác Cấp Độ 3"
                    style={{
                      background: readerMode === 'manga' ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'transparent',
                      color: readerMode === 'manga' ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: 14,
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3
                    }}
                  >
                    <Sparkles size={11} /> Manga
                  </button>
                </div>

                {/* Font Size Adjuster */}
                <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-hover)', borderRadius: 6, border: '1px solid var(--glass-border-strong)', padding: '1px 2px' }}>
                  <button
                    type="button"
                    onClick={() => setReaderFontSize(f => Math.max(0.9, Number((f - 0.1).toFixed(2))))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '2px 5px', fontSize: '0.74rem', fontWeight: 700 }}
                    title="Giảm cỡ chữ"
                  >
                    A-
                  </button>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', padding: '0 3px', minWidth: 28, textAlign: 'center', fontWeight: 600 }}>
                    {Math.round(readerFontSize * 16)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReaderFontSize(f => Math.min(2.0, Number((f + 0.1).toFixed(2))))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '2px 5px', fontSize: '0.74rem', fontWeight: 700 }}
                    title="Tăng cỡ chữ"
                  >
                    A+
                  </button>
                </div>

                {/* Tra từ Drawer toggle */}
                <button
                  className={`btn ${isCatalogDrawerOpen && rightDrawerTab === 'dictionary' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    if (isCatalogDrawerOpen && rightDrawerTab === 'dictionary') {
                      setIsCatalogDrawerOpen(false);
                    } else {
                      setIsCatalogDrawerOpen(true);
                      setRightDrawerTab('dictionary');
                    }
                  }}
                  title="Mở bảng phân tích từ vựng & Hán tự"
                  style={{ padding: '4px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Search size={12} /> Tra từ
                </button>

                {/* Song ngữ toggle */}
                <button 
                  className="btn btn-outline" 
                  onClick={() => handleGenerateBilingual(activeReadingContent)} 
                  disabled={isTranslating} 
                  style={{ 
                    padding: '4px 8px', 
                    fontSize: '0.74rem', 
                    borderColor: 'var(--accent-primary)', 
                    color: 'var(--accent-primary)',
                    background: bilingualData ? 'var(--accent-subtle)' : 'transparent' 
                  }}
                >
                  {isTranslating ? 'Đang dịch...' : bilingualData ? 'Ẩn Dịch' : '🌐 Dịch'}
                </button>

                {/* Sách nói AI TTS Controls */}
                {isPlayingTTS ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'var(--accent-subtle)',
                    border: '1px solid var(--accent-primary)',
                    padding: '2px 6px',
                    borderRadius: 16
                  }}>
                    <button
                      type="button"
                      onClick={handlePauseResumeTTS}
                      title={isPausedTTS ? "Tiếp tục đọc" : "Tạm dừng"}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {isPausedTTS ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleStopTTS}
                      title="Dừng đọc"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Square size={11} fill="currentColor" />
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGenerateTTS(activeReadingContent)}
                    disabled={isProcessing}
                    title="Nghe sách nói AI phát âm giọng chuẩn bản xứ"
                    style={{ padding: '4px 9px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {isProcessing ? <Loader size={12} className="spin" /> : <Volume2 size={12} />}
                    <span className="hide-on-mobile">Sách nói</span>
                  </button>
                )}

                {/* Shadowing Transfer button */}
                <button
                  className="btn btn-shadowing-transfer"
                  onClick={handleTransferToShadowing}
                  title="Chuyển tác phẩm này sang Shadowing Studio để luyện nói & nhại ngữ điệu"
                  style={{ padding: '4px 9px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Mic size={12} />
                  <span>Shadowing</span>
                </button>

                {/* Zen Focus Mode Toggle Button */}
                <button
                  type="button"
                  onClick={() => setZenMode(z => !z)}
                  title={zenMode ? "Thoát chế độ đọc toàn màn hình" : "Chế độ đọc tập trung Zen Mode (Ẩn topbar & sidebar)"}
                  style={{
                    background: zenMode ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    border: '1px solid var(--glass-border-strong)',
                    color: zenMode ? '#ffffff' : 'var(--text-secondary)',
                    borderRadius: 6,
                    padding: '4px 7px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: '0.72rem'
                  }}
                >
                  {zenMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>

              </div>
            </div>

            {/* COLLAPSIBLE STORY SYNOPSIS & METADATA (CHỈ HIỆN KHI BẤM NÚT MÔ TẢ) */}
            {showBookSynopsis && (
              <div style={{
                background: 'var(--bg-hover)',
                border: '1px solid var(--glass-border)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    📖 {bookInfo.main} {bookInfo.sub && `(${bookInfo.sub})`}
                  </div>
                  <button onClick={() => setShowBookSynopsis(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                    <X size={14} />
                  </button>
                </div>
                {activeText.author && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Tác giả: <strong>{activeText.author}</strong> {activeText.category && `· ${activeText.category}`}
                  </div>
                )}
                {activeText.summary && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {activeText.summary}
                  </p>
                )}
              </div>
            )}

            {/* COMPACT CHAPTER / STORY TITLE */}
            <div style={{ textAlign: 'center', margin: '4px 0 12px 0' }}>
              <h2 className="jp-text" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700, lineHeight: 1.3 }}>
                <FuriganaText text={chapterInfo ? chapterInfo.main : bookInfo.main} />
              </h2>
              {(chapterInfo ? chapterInfo.sub : bookInfo.sub) && (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500 }}>
                  {chapterInfo ? chapterInfo.sub : bookInfo.sub}
                </div>
              )}
            </div>

            {/* EXPANDABLE GAP REMEDIATION ACCORDION DRAWER */}
            {showGapDrawer && (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--glass-border)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    🔍 Phát hiện <strong style={{ color: LEVEL_COLORS[myTargetLevel] }}>{gapAnalysis.matchedTargetVocab.length}</strong> từ vựng mục tiêu <strong style={{ color: LEVEL_COLORS[myTargetLevel] }}>{myTargetLevel}</strong> trong bài:
                  </div>

                  {gapAnalysis.matchedTargetVocab.length > 0 && (
                    <button
                      onClick={handleBatchImportGaps}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: 6,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
                      }}
                    >
                      <BookmarkPlus size={13} /> Nạp Tất Cả ({gapAnalysis.matchedTargetVocab.length}) Vào FSRS Deck
                    </button>
                  )}
                </div>

                {gapAnalysis.matchedTargetVocab.length === 0 ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>
                    Bài đọc này không chứa từ mới cấp {myTargetLevel} (hoặc bạn đã thuần thục). Hãy chọn cấp cao hơn để thử thách $i+1$!
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                    {gapAnalysis.matchedTargetVocab.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-hover)',
                          border: `1px solid ${LEVEL_COLORS[myTargetLevel]}40`,
                          borderRadius: 6,
                          padding: '7px 10px',
                          minWidth: 150,
                          maxWidth: 200,
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="jp-text" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.word}
                          </span>
                          <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, background: `${LEVEL_COLORS[myTargetLevel]}20`, color: LEVEL_COLORS[myTargetLevel], fontWeight: 800 }}>
                            {item.level}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: 500 }}>{item.reading}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.vi}>
                          {item.vi}
                        </div>
                        <button
                          onClick={() => {
                            addCustomCard({
                              id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                              level: item.level,
                              word: item.word,
                              reading: item.reading,
                              vi: item.vi,
                              examples: item.sentenceContext ? [item.sentenceContext] : item.examples,
                              type: 'Từ vựng JLPT'
                            });
                            setAddedMessage(true);
                            setTimeout(() => setAddedMessage(false), 2000);
                          }}
                          style={{
                            marginTop: 2,
                            background: item.isSaved ? 'var(--bg-surface)' : 'var(--accent-subtle)',
                            border: item.isSaved ? '1px solid var(--glass-border)' : '1px solid var(--accent-primary)',
                            color: item.isSaved ? 'var(--text-tertiary)' : 'var(--accent-primary)',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                          }}
                        >
                          {item.isSaved ? <><Check size={11} /> Đã có</> : <><PlusCircle size={11} /> Nạp FSRS</>}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {audioUrl && (
               <div style={{ marginBottom: 14, padding: 10, background: 'var(--accent-subtle)', borderRadius: 8, border: '1px solid var(--accent-primary)' }}>
                 <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', marginBottom: 6, fontWeight: 600 }}>Tác phẩm Sách nói AI sinh ra thành công!</div>
                 <audio controls src={audioUrl} autoPlay style={{ width: '100%' }} />
               </div>
            )}

            {/* Reading Content Container */}
            {readerMode === 'manga' ? (
              <MangaReader
                story={activeText}
                content={activeReadingContent}
                chapterTitle={currentChapter ? currentChapter.chapterTitle : ''}
                fontSize={readerFontSize}
                onSelectText={handleSelection}
                speak={speak}
                onWordClick={(w) => setSelectedText(w)}
                onTransferToShadowing={handleTransferToShadowing}
              />
            ) : (
              <div className="immersion-dual-container">
                {/* ══════════════════════════════════════════════════════════════ */}
                {/* CỘT TRÁI (42%): TRANH HOẠT CẢNH EHON + LIVE KARAOKE + PLAYER */}
                {/* ══════════════════════════════════════════════════════════════ */}
                <div className="immersion-left-panel">
                  {/* Khung Tranh Hoạt Cảnh Ehon */}
                  <div className="ehon-scene-card">
                    <div className="ehon-scene-image-wrapper">
                      <img 
                        src={activeSceneInfo.imageUrl} 
                        alt={activeSceneInfo.sceneTitle || activeReadingTitle}
                        className="ehon-scene-image"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="ehon-scene-badge-row">
                        <span className="ehon-scene-number-badge">
                          🎨 Hoạt cảnh {activeSceneInfo.currentSceneIdx} / {activeSceneInfo.totalScenes}
                        </span>
                        {activeText.level && (
                          <span className="ehon-level-badge" style={{ background: LEVEL_COLORS[activeText.level.slice(0, 2)] || 'var(--accent-primary)' }}>
                            {activeText.level}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tiêu đề & Tóm tắt Hoạt cảnh */}
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

                  {/* Phụ Đề Nổi Bật / Live Karaoke Subtitle Card */}
                  <div className="immersion-karaoke-card">
                    <div className="immersion-karaoke-header">
                      <div className="immersion-karaoke-title">
                        <Volume2 size={15} className={isPlayingTTS ? "karaoke-pulse-icon" : ""} />
                        <span>📖 Câu Đang Đọc ({storySentences.length > 0 ? `${activeSentenceIdx + 1}/${storySentences.length}` : '0/0'})</span>
                      </div>
                      <div className="immersion-karaoke-actions">
                        <button 
                          className="btn-icon-tiny"
                          onClick={() => {
                            if (activeSentence?.text) speak(activeSentence.text);
                          }}
                          title="Phát lại riêng câu này"
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="immersion-karaoke-body">
                      <div className="immersion-karaoke-japanese jp-text">
                        {activeSentence?.text ? (
                          <FuriganaText text={activeSentence.text} />
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>(Chọn một câu trong bài để đọc)</span>
                        )}
                      </div>
                      {activeSentenceVi && (
                        <div className="immersion-karaoke-vietnamese">
                          {activeSentenceVi}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cụm Nút Điều Khiển Sách Nói AI & Tốc Độ */}
                  <div className="immersion-audiobook-card">
                    <div className="immersion-audiobook-playback-bar">
                      <button 
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handlePrevSentence}
                        disabled={activeSentenceIdx === 0}
                        title="Tua về câu trước"
                        style={{ padding: '6px 10px' }}
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {isPlayingTTS ? (
                        <button 
                          type="button"
                          className="btn btn-primary btn-playback-main"
                          onClick={handlePauseResumeTTS}
                          title={isPausedTTS ? "Tiếp tục phát" : "Tạm dừng"}
                        >
                          {isPausedTTS ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}
                          <span>{isPausedTTS ? 'Tiếp tục' : 'Tạm dừng'}</span>
                        </button>
                      ) : (
                        <button 
                          type="button"
                          className="btn btn-primary btn-playback-main"
                          onClick={() => handleGenerateTTS(activeReadingContent, activeSentenceIdx)}
                          title="Bắt đầu nghe Sách nói từ câu này"
                        >
                          <Play size={15} fill="currentColor" />
                          <span>Nghe Sách Nói</span>
                        </button>
                      )}

                      <button 
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleNextSentence}
                        disabled={activeSentenceIdx >= storySentences.length - 1}
                        title="Tua sang câu sau"
                        style={{ padding: '6px 10px' }}
                      >
                        <ChevronRight size={16} />
                      </button>

                      {isPlayingTTS && (
                        <button 
                          type="button"
                          className="btn-danger-outline"
                          onClick={handleStopTTS}
                          title="Dừng đọc hoàn toàn"
                        >
                          <Square size={13} fill="currentColor" />
                        </button>
                      )}
                    </div>

                    {/* Speed & Quick Transfer */}
                    <div className="immersion-audiobook-subbar">
                      <div className="immersion-speed-selector">
                        <span className="speed-label">Tốc độ:</span>
                        {[0.75, 0.85, 1.0, 1.25].map(speed => (
                          <button
                            key={speed}
                            type="button"
                            className={`btn-speed-pill ${ttsSpeed === speed ? 'active' : ''}`}
                            onClick={() => {
                              setTtsSpeed(speed);
                              localStorage.setItem('omni_tts_speed', speed.toString());
                            }}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>

                      <button 
                        className="btn btn-shadowing-transfer"
                        onClick={handleTransferToShadowing}
                        title="Chuyển tác phẩm này sang Shadowing Studio"
                        style={{ padding: '4px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Mic size={12} />
                        <span>Shadowing</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════ */}
                {/* CỘT PHẢI (58%): TOÀN BỘ NỘI DUNG CÂU CHUYỆN (AUTO-SCROLL FEED) */}
                {/* ══════════════════════════════════════════════════════════════ */}
                <div className="immersion-right-panel">
                  {/* Top Feed Bar: Sentence Counter & Quick Actions */}
                  <div className="immersion-feed-header">
                    <div className="immersion-feed-title">
                      <BookOpen size={14} />
                      <span>📜 Toàn bộ câu chuyện ({storySentences.length} câu)</span>
                    </div>
                    <div className="immersion-feed-tools">
                      {!hideSlaTip && (
                        <span className="feed-hint">
                          💡 Bôi đen từ lạ để tra cứu & nạp FSRS
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Story Feed */}
                  <div 
                    className="immersion-feed-scroll"
                    ref={contentRef}
                    onMouseUp={handleSelection}
                    onTouchEnd={handleSelection}
                    style={{ fontSize: `${readerFontSize}rem` }}
                  >
                    {storySentences.map((st, i) => {
                      const isSpeaking = speakingLineIdx === i;
                      const isFocused = activeSentenceIdx === i;
                      const isLineActive = isSpeaking || isFocused;
                      const rawText = st.text.trim();
                      if (!rawText) return null;

                      return (
                        <div 
                          key={i}
                          ref={el => (lineRefs.current[i] = el)}
                          onClick={() => handleLineClick(i)}
                          className={`reading-feed-row ${isLineActive ? 'reading-active-row' : ''} ${isSpeaking ? 'reading-speaking-row' : ''}`}
                          title="Bấm để chọn câu này & cập nhật tranh hoạt cảnh"
                        >
                          <div className="feed-row-left">
                            <span className="feed-row-num">#{i + 1}</span>
                            {isSpeaking && (
                              <span className="feed-soundwave-badge">
                                <Volume2 size={11} /> Đang đọc
                              </span>
                            )}
                          </div>

                          <div className="feed-row-content">
                            <div className="feed-row-japanese jp-text">
                              <FuriganaText text={st.text} />
                            </div>
                            {st.vi && (
                              <div className="feed-row-vietnamese">
                                {st.vi}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center' }}>
              <BookOpen size={60} style={{ opacity: 0.2, marginBottom: 20, margin: '0 auto' }}/>
              <p>Chọn một bài đọc hoặc thêm bài mới để bắt đầu Tắm Ngôn Ngữ.</p>
            </div>
          </div>
        )}
      </div>

      {/* PULL TAB ON RIGHT EDGE (When Drawer is Closed) */}
      {!isCatalogDrawerOpen && (
        <button
          onClick={() => {
            setIsCatalogDrawerOpen(true);
            setRightDrawerTab('catalog');
          }}
          className="glass-panel"
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            writingMode: 'vertical-rl',
            padding: '16px 8px',
            background: 'var(--accent-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px 0 0 10px',
            cursor: 'pointer',
            zIndex: 45,
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '-4px 0 16px rgba(0,0,0,0.25)',
            letterSpacing: '1px'
          }}
          title="Mở Kho Tác Phẩm (294 tác phẩm) & Tra cứu từ vựng"
        >
          <BookOpen size={14} /> KHO TÁC PHẨM · {READING_CORPUS.length}
        </button>
      )}

      {/* Backdrop for unpinned drawer overlay on tablet/mobile or when opened as modal */}
      {!isCatalogPinned && isCatalogDrawerOpen && (
        <div
          onClick={() => setIsCatalogDrawerOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(2px)',
            zIndex: 65,
            transition: 'opacity 0.2s ease'
          }}
        />
      )}

      {/* RIGHT DRAWER: Kho Tác Phẩm & Tra Cứu Từ Vựng */}
      {isCatalogDrawerOpen && (
        <div
          className="glass-panel"
          style={{
            position: isCatalogPinned ? 'relative' : 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 380,
            maxWidth: '92vw',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            zIndex: 70,
            background: 'var(--sidebar-bg)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: isCatalogPinned ? 'var(--glass-shadow)' : '-8px 0 32px rgba(0, 0, 0, 0.45)',
            borderLeft: '1px solid var(--glass-border-strong)',
            borderRadius: isCatalogPinned ? 12 : '12px 0 0 12px',
            overflow: 'hidden',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Drawer Top Navigation & Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderBottom: '1px solid var(--glass-border)',
            background: 'var(--bg-hover)',
            gap: 6
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, flex: 1, overflowX: 'auto' }}>
              <button
                onClick={() => setRightDrawerTab('catalog')}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: rightDrawerTab === 'catalog' ? 'var(--accent-primary)' : 'transparent',
                  color: rightDrawerTab === 'catalog' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                <BookOpen size={13} /> Kho Tác Phẩm ({READING_CORPUS.length})
              </button>
              <button
                onClick={() => setRightDrawerTab('dictionary')}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: rightDrawerTab === 'dictionary' ? 'var(--accent-primary)' : 'transparent',
                  color: rightDrawerTab === 'dictionary' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Search size={13} /> Tra từ
                {selectedText && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                )}
              </button>
            </div>

            {/* Pin & Close Action Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setIsCatalogPinned(!isCatalogPinned)}
                title={isCatalogPinned ? "Hủy ghim (chuyển sang dạng Drawer trượt lề)" : "Ghim cố định (chia cột giao diện đọc)"}
                style={{
                  background: isCatalogPinned ? 'var(--accent-subtle)' : 'transparent',
                  border: '1px solid',
                  borderColor: isCatalogPinned ? 'var(--accent-primary)' : 'transparent',
                  color: isCatalogPinned ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  borderRadius: 6,
                  padding: '4px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}
              >
                {isCatalogPinned ? <Pin size={13} /> : <PinOff size={13} />}
                <span>{isCatalogPinned ? 'Đã ghim' : 'Ghim'}</span>
              </button>

              <button
                onClick={() => setIsCatalogDrawerOpen(false)}
                title="Đóng bảng bên phải"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {rightDrawerTab === 'catalog' ? renderCatalogInner() : renderDictionaryInner()}
          </div>
        </div>
      )}

      {/* Floating Success Alert */}
      {addedMessage && (
        <div className="fade-in" style={{ position: 'fixed', bottom: 24, right: 24, background: '#10b981', color: 'white', padding: '12px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 100 }}>
          <CheckCircle size={18}/> Đã thêm vào Flashcards!
        </div>
      )}
    </div>
  );
};

export default ImmersionReader;

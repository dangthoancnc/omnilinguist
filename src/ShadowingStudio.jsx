import React, { useState, useRef, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';
import { 
  Mic, Globe, Video, Upload, HardDrive, Loader, AlertCircle, Plus, Minus, 
  Settings2, SkipBack, Play, Repeat, SkipForward, Pause, Square, List, Trash2, 
  Save, FolderOpen, Volume2, Cpu, Eye, EyeOff, FileText, Download, Edit3, 
  FolderPlus, RefreshCw, Bookmark, Sparkles, HelpCircle, Check, X, BookOpen, Layers,
  Newspaper, ExternalLink, Link2, Wand2
} from 'lucide-react';
import FuriganaText from './components/FuriganaText';
import { API_BASE_URL } from './config.js';

// Algorithm for speech score calculation
const scoreMatch = (target, got) => {
  if (!got || !target) return 0;
  const t = target.replace(/[。、！？\s]/g, '');
  const g = got.replace(/[。、！？\s]/g, '');
  if (!t) return 0;
  let match = 0;
  for (const ch of g) { if (t.includes(ch)) match++; }
  return Math.min(100, Math.round((match / t.length) * 120));
};

// Subtitle Parsers (SRT / VTT)
const parseSRT = (srtText) => {
  if (!srtText) return [];
  const normalized = srtText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split('\n\n');
  const segments = [];
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length >= 2) {
      let timeLine = lines.find(l => l.includes('-->'));
      if (!timeLine) continue;
      
      const parts = timeLine.split('-->').map(s => s.trim());
      if (parts.length < 2) continue;

      const parseTime = (str) => {
        const clean = str.replace(',', '.');
        const tParts = clean.split(':');
        if (tParts.length === 3) {
          return parseFloat(tParts[0]) * 3600 + parseFloat(tParts[1]) * 60 + parseFloat(tParts[2]);
        } else if (tParts.length === 2) {
          return parseFloat(tParts[0]) * 60 + parseFloat(tParts[1]);
        }
        return 0;
      };
      
      const start = parseTime(parts[0]);
      const end = parseTime(parts[1]);
      const textLines = lines.slice(lines.indexOf(timeLine) + 1).join(' ');
      
      if (textLines.trim()) {
        segments.push({
          start,
          duration: Math.max(0.5, end - start),
          text: textLines.trim(),
          vi: '',
          startOffset: 0,
          endOffset: 0
        });
      }
    }
  }
  return segments;
};

// Split raw text into Japanese Shadowing Segments
const parseRawTextToSegments = (rawText) => {
  if (!rawText) return [];
  const rawSentences = rawText.split(/[。！？\n]/).map(s => s.trim()).filter(s => s.length > 2);
  let currentTime = 0;
  return rawSentences.map((st) => {
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
};

// Preset Curated Shadowing Lessons
const PRESET_LESSONS = [
  {
    id: 'preset_momotaro',
    title: '桃太郎 (Truyện cổ tích Momotaro)',
    category: 'Fairy Tale / Cổ tích',
    type: 'preset',
    segments: [
      { start: 0, duration: 4.5, text: 'むかしむかし、あるところに、おじいさんとおばあさんがいました。', vi: 'Ngày xửa ngày xưa, ở một nơi nọ, có một ông lão và một bà lão.' },
      { start: 4.8, duration: 5.2, text: 'おじいさんは山へしばかりに、おばあさんは川へせんたくに行きました。', vi: 'Ông lão lên núi đốn củi, còn bà lão ra sông giặt quần áo.' },
      { start: 10.2, duration: 6.0, text: 'おばあさんが川でせんたくをしていると、大きな桃がどんぶらこ、どんぶらこと流れてきました。', vi: 'Khi bà lão đang giặt đồ ở sông, một quả đào lớn trôi bồng bềnh bồng bềnh tới.' },
      { start: 16.5, duration: 5.5, text: '「なんと大きな桃でしょう！家に持って帰っておじいさんと食べましょう。」', vi: '「Quả đào mới to làm sao! Hãy mang về nhà cùng ăn với ông lão nào.」' }
    ]
  },
  {
    id: 'preset_business',
    title: 'ビジネス挨拶 (Nhật ngữ công sở chào hỏi)',
    category: 'Business / Công sở',
    type: 'preset',
    segments: [
      { start: 0, duration: 4.0, text: 'いつもお世話になっております。ABC会社の山田でございます。', vi: 'Cảm ơn anh/chị đã luôn giúp đỡ. Tôi là Yamada đến từ công ty ABC.' },
      { start: 4.2, duration: 4.8, text: '本日はお忙しい中、お時間をいただき誠にありがとうございます。', vi: 'Chân thành cảm ơn anh/chị đã dành thời gian quý báu ngày hôm nay.' },
      { start: 9.2, duration: 5.0, text: '新プロジェクトの進捗状況について、ご報告させていただきます。', vi: 'Tôi xin phép được báo cáo về tiến độ của dự án mới.' },
      { start: 14.5, duration: 4.5, text: '今後とも何卒よろしくお願い申し上げます。', vi: 'Rất mong tiếp tục nhận được sự hợp tác của anh/chị.' }
    ]
  },
  {
    id: 'preset_nhk_news',
    title: 'NHK Easy News (Tin tức văn hóa Nhật)',
    category: 'News / Tin tức',
    type: 'preset',
    segments: [
      { start: 0, duration: 5.2, text: '日本で桜の花が咲き始めました。多くの人が公園でお花見を楽しんでいます。', vi: 'Hoa anh đào đã bắt đầu nở ở Nhật Bản. Nhiều người đang tận hưởng việc ngắm hoa ở công viên.' },
      { start: 5.5, duration: 5.0, text: '気象庁によると、今年の開花は例年より少し早いということです。', vi: 'Theo Cơ quan Khí tượng, hoa nở năm nay sớm hơn một chút so với mọi năm.' },
      { start: 10.8, duration: 5.8, text: '外国人観光客も増えており、日本の春の cảnh sắc を写真に収めています。', vi: 'Khách du lịch nước ngoài cũng tăng lên, họ đang chụp ảnh phong cảnh mùa xuân Nhật Bản.' }
    ]
  },
  {
    id: 'preset_jlpt_n3',
    title: 'JLPT N3 (Nghe hội thoại hàng ngày)',
    category: 'JLPT N3 / Chokai',
    type: 'preset',
    segments: [
      { start: 0, duration: 3.8, text: 'すみません、この近くに図書館はありますか。', vi: 'Xin lỗi, gần đây có thư viện nào không ạ?' },
      { start: 4.0, duration: 4.5, text: 'はい、この道をまっすぐ行って、二つ目の信号を右に曲がるとありますよ。', vi: 'Có chứ, đi thẳng đường này, rẽ右 ở đèn giao thông thứ hai là tới.' },
      { start: 8.8, duration: 3.5, text: '歩いてどのくらいかかりますか。', vi: 'Đi bộ mất khoảng bao lâu ạ?' },
      { start: 12.5, duration: 4.0, text: '10分くらいですよ。気をつけていってらっしゃい。', vi: 'Khoảng 10 phút thôi. Đi cẩn thận nhé.' }
    ]
  }
];

// Open Web Channels
const OPEN_NEWS_CHANNELS = [
  { title: '📰 NHK News Web Easy', url: 'https://www3.nhk.or.jp/news/easy/', desc: 'Tin tức tiếng Nhật dễ đọc cho người học' },
  { title: '🍵 Matcha Japan Magazine', url: 'https://matcha-jp.com/easy', desc: 'Văn hóa, ẩm thực & du lịch Nhật Bản' },
  { title: '🌸 Easy Japanese Stories', url: 'https://hukumusume.com/douwa/', desc: 'Kho tàng truyện dân gian Nhật Bản' },
  { title: '⛩️ Asahi Easy News', url: 'https://www.asahi.com/', desc: 'Tin tức thời sự Nhật Bản' }
];

const ShadowingStudio = () => {
  // Live Dexie Database Queries
  const storedPlaylists = useLiveQuery(() => db.playlists?.toArray()) || [];
  const storedMediaFiles = useLiveQuery(() => db.mediaFiles?.toArray()) || [];

  // Active Main Tab: 'presets', 'web', 'youtube', 'local', 'workspace'
  const [activeTab, setActiveTab] = useState('presets');

  // Shadowing Mode: 'text' (Text-Guided), 'blind' (Blind Shadowing), 'echo' (Echoing Method), 'record' (Record & Compare)
  const [shadowingMode, setShadowingMode] = useState('text');
  const [isBlindRevealed, setIsBlindRevealed] = useState(false);

  // Per-tab session store: isolates Web Open Materials, YouTube, Local media, Presets
  const [sessionStore, setSessionStore] = useState({
    presets: { title: PRESET_LESSONS[0].title, segments: PRESET_LESSONS[0].segments, currentSegIdx: 0, scores: {} },
    web: { title: '', segments: [], currentSegIdx: 0, scores: {} },
    youtube: { title: '', segments: [], currentSegIdx: 0, scores: {} },
    local: { title: '', segments: [], currentSegIdx: 0, scores: {} }
  });

  // Active Session derived getters
  const activeTabStoreKey = activeTab === 'youtube' || activeTab === 'local' || activeTab === 'web' ? activeTab : 'presets';
  const activeSession = sessionStore[activeTabStoreKey] || sessionStore.presets;
  const segments = activeSession.segments || [];
  const currentSegIdx = activeSession.currentSegIdx || 0;
  const scores = activeSession.scores || {};
  const activeTitle = activeSession.title || 'Bài học Shadowing';

  // Setters for Active Session
  const setSegments = (segsOrFn) => {
    setSessionStore(prev => {
      const tabKey = activeTabStoreKey;
      const newSegs = typeof segsOrFn === 'function' ? segsOrFn(prev[tabKey].segments) : segsOrFn;
      return { ...prev, [tabKey]: { ...prev[tabKey], segments: newSegs } };
    });
  };
  const setCurrentSegIdx = (idx) => {
    setSessionStore(prev => {
      const tabKey = activeTabStoreKey;
      return { ...prev, [tabKey]: { ...prev[tabKey], currentSegIdx: Math.max(0, Math.min(idx, (prev[tabKey].segments.length || 1) - 1)) } };
    });
  };
  const setScores = (scOrFn) => {
    setSessionStore(prev => {
      const tabKey = activeTabStoreKey;
      const newSc = typeof scOrFn === 'function' ? scOrFn(prev[tabKey].scores) : scOrFn;
      return { ...prev, [tabKey]: { ...prev[tabKey], scores: newSc } };
    });
  };
  const setActiveTitle = (title) => {
    setSessionStore(prev => ({
      ...prev,
      [activeTabStoreKey]: { ...prev[activeTabStoreKey], title }
    }));
  };

  // Web & Open Materials States
  const [webUrlInput, setWebUrlInput] = useState('');
  const [customTextInput, setCustomTextInput] = useState('');
  const [customTextTitle, setCustomTextTitle] = useState('');

  // YouTube States
  const [urlInput, setUrlInput] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Local Media States
  const [localFile, setLocalFile] = useState(null);
  const [localMediaUrl, setLocalMediaUrl] = useState(null);
  const [localMediaType, setLocalMediaType] = useState('video');
  const [sttLang, setSttLang] = useState('ja');
  const [sttModel, setSttModel] = useState('base');

  // Playlist & Workspace States
  const [workspaceItems, setWorkspaceItems] = useState([]);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('all');

  // Shadowing Audio Controls
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatCount, setRepeatCount] = useState(1);
  const [waitMode, setWaitMode] = useState('Manual'); // 'Off', 'Manual', '50', '80', '100', '120'
  const [subSync, setSubSync] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVi, setShowVi] = useState(true);

  // TTS State
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  // MediaRecorder Real Audio Blobs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [userAudioBlobs, setUserAudioBlobs] = useState({}); // idx -> blobUrl
  const userAudioPlayerRef = useRef(null);

  // Refs for Players & Sync
  const playerRef = useRef(null);
  const localPlayerRef = useRef(null);
  const reqFrameRef = useRef(null);
  const isPlayerReady = useRef(false);
  const segmentRefs = useRef([]);

  const segmentsRef = useRef([]);
  const currentSegIdxRef = useRef(0);
  const repeatCountRef = useRef(1);
  const waitModeRef = useRef('Manual');
  const subSyncRef = useRef(0);
  const shadowingModeRef = useRef('text');

  const loopCountRef = useRef(0);
  const isWaitingRef = useRef(false);
  const waitTimeoutRef = useRef(null);

  // Speech Recognition Recording
  const [recordingIdx, setRecordingIdx] = useState(null);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => { segmentsRef.current = segments; }, [segments]);
  useEffect(() => { currentSegIdxRef.current = currentSegIdx; }, [currentSegIdx]);
  useEffect(() => { repeatCountRef.current = repeatCount; }, [repeatCount]);
  useEffect(() => { waitModeRef.current = waitMode; }, [waitMode]);
  useEffect(() => { subSyncRef.current = subSync; }, [subSync]);
  useEffect(() => { shadowingModeRef.current = shadowingMode; }, [shadowingMode]);

  // Auto-scroll active segment smoothly into center view
  useEffect(() => {
    if (segmentRefs.current[currentSegIdx]) {
      segmentRefs.current[currentSegIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSegIdx]);

  // Load Saved Workspace Items
  const fetchWorkspaceItems = useCallback(async () => {
    try {
      const localItems = JSON.parse(localStorage.getItem('omni_shadowing_workspace') || '[]');
      try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/list`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && Array.isArray(data.data)) {
            setWorkspaceItems([...localItems, ...data.data]);
            return;
          }
        }
      } catch (e) {}
      setWorkspaceItems(localItems);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchWorkspaceItems();
  }, [fetchWorkspaceItems]);

  // Cleanup players when switching main tabs to prevent audio state leaks
  const pauseAllPlayers = () => {
    if (playerRef.current && isPlayerReady.current && playerRef.current.pauseVideo) {
      try { playerRef.current.pauseVideo(); } catch(e){}
    }
    if (localPlayerRef.current && localPlayerRef.current.pause) {
      try { localPlayerRef.current.pause(); } catch(e){}
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (userAudioPlayerRef.current) userAudioPlayerRef.current.pause();
    setIsPlaying(false);
  };

  const handleTabChange = (newTab) => {
    pauseAllPlayers();
    setActiveTab(newTab);
    if (reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current);
  };

  // Keyboard Shortcuts Support for High Speed Shadowing Practice
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
        e.preventDefault();
        jumpToSegment(currentSegIdxRef.current + 1);
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
        e.preventDefault();
        jumpToSegment(currentSegIdxRef.current - 1);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        jumpToSegment(currentSegIdxRef.current);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setShowVi(prev => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setShadowingMode(prev => prev === 'blind' ? 'text' : 'blind');
      } else if (e.key === 'g' || e.key === 'G' || e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        if (segmentsRef.current[currentSegIdxRef.current]) {
          toggleRecording(currentSegIdxRef.current, segmentsRef.current[currentSegIdxRef.current].text);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save Session State locally
  useEffect(() => {
    const session = {
      activeTab, sessionStore, videoId, urlInput,
      playbackRate, repeatCount, waitMode, subSync, shadowingMode, showVi
    };
    localStorage.setItem('omni_shadowing_session_v3', JSON.stringify(session));
  }, [activeTab, sessionStore, videoId, urlInput, playbackRate, repeatCount, waitMode, subSync, shadowingMode, showVi]);

  // Load Presets
  const loadPresetLesson = (preset) => {
    pauseAllPlayers();
    setSessionStore(prev => ({
      ...prev,
      presets: { title: preset.title, segments: preset.segments, currentSegIdx: 0, scores: {} }
    }));
    setActiveTab('presets');
  };

  // OPEN WEB MATERIALS: Fetch Web Article URL
  const handleFetchWebArticle = async (targetUrl = null) => {
    const url = targetUrl || webUrlInput.trim();
    if (!url) return;
    setIsFetching(true);
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data && data.contents) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        const title = doc.title || 'Bài báo Web Online';
        
        // Clean unwanted tags
        const scripts = doc.querySelectorAll('script, style, nav, footer, header, iframe');
        scripts.forEach(s => s.remove());
        const bodyText = doc.body ? doc.body.innerText.replace(/\n\s*\n/g, '\n').trim() : '';

        const newSegs = parseRawTextToSegments(bodyText);
        if (newSegs.length > 0) {
          setSessionStore(prev => ({
            ...prev,
            web: { title, segments: newSegs, currentSegIdx: 0, scores: {} }
          }));
          setActiveTab('web');
          alert(`✅ Đã trích xuất thành công ${newSegs.length} câu Shadowing từ bài báo Online!`);
        } else {
          alert('Không trích xuất được câu tiếng Nhật phù hợp từ URL này.');
        }
      } else {
        alert('Không thể kết nối tải trang Web.');
      }
    } catch(err) {
      alert('Lỗi tải bài báo Web: ' + err.message);
    }
    setIsFetching(false);
  };

  // OPEN WEB MATERIALS: Parse Custom Pasted Text
  const handleParseCustomText = () => {
    if (!customTextInput.trim()) { alert('Vui lòng nhập hoặc dán văn bản tiếng Nhật.'); return; }
    const title = customTextTitle.trim() || 'Tài liệu tự do ' + new Date().toLocaleDateString();
    const newSegs = parseRawTextToSegments(customTextInput.trim());
    if (newSegs.length > 0) {
      setSessionStore(prev => ({
        ...prev,
        web: { title, segments: newSegs, currentSegIdx: 0, scores: {} }
      }));
      setActiveTab('web');
      setCustomTextInput('');
      setCustomTextTitle('');
      alert(`✅ Đã chuyển đổi ${newSegs.length} câu thành bài học Shadowing!`);
    } else {
      alert('Vui lòng nhập văn bản tiếng Nhật có dấu chấm [。] hoặc xuống dòng.');
    }
  };

  // YouTube Player Setup
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    return () => {
      if (reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current);
    };
  }, []);

  const initYTPlayer = (vId) => {
    if (reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current);
    if (playerRef.current && playerRef.current.destroy) {
      try { playerRef.current.destroy(); } catch(e){}
    }
    isPlayerReady.current = false;
    
    playerRef.current = new window.YT.Player('yt-player', {
      videoId: vId,
      playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
      events: {
        onReady: () => {
          isPlayerReady.current = true;
          playerRef.current.setPlaybackRate(playbackRate);
        },
        onStateChange: (e) => {
          setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
          if (e.data === window.YT.PlayerState.PLAYING) {
            checkSync();
          }
        }
      }
    });
  };

  // Media Synchronization Loop
  const checkSync = () => {
    if (isWaitingRef.current) {
       reqFrameRef.current = requestAnimationFrame(checkSync);
       return;
    }
    
    let time = 0;
    let pauseFn = null;
    let playFn = null;
    let seekFn = null;

    if (activeTab === 'youtube') {
      if (!isPlayerReady.current || !playerRef.current || !playerRef.current.getCurrentTime) {
         reqFrameRef.current = requestAnimationFrame(checkSync);
         return;
      }
      try {
        time = playerRef.current.getCurrentTime();
        pauseFn = () => playerRef.current.pauseVideo();
        playFn = () => playerRef.current.playVideo();
        seekFn = (t) => playerRef.current.seekTo(t);
      } catch (e) {}
    } else {
      if (!localPlayerRef.current) {
        reqFrameRef.current = requestAnimationFrame(checkSync);
        return;
      }
      time = localPlayerRef.current.currentTime;
      pauseFn = () => localPlayerRef.current.pause();
      playFn = () => localPlayerRef.current.play();
      seekFn = (t) => { localPlayerRef.current.currentTime = t; };
    }

    const segs = segmentsRef.current;
    const activeIdx = currentSegIdxRef.current;
    
    if (time > 0 && segs.length > 0) {
      if (activeIdx >= 0 && activeIdx < segs.length) {
         const seg = segs[activeIdx];
         const start = seg.start + (seg.startOffset || 0) + (subSyncRef.current / 1000);
         const end = seg.start + seg.duration + (seg.endOffset || 0) + (subSyncRef.current / 1000);
         
         if (time < start - 1 || time > end + 1) {
            const realIdx = segs.findIndex(s => time >= s.start + (s.startOffset||0) && time <= s.start + s.duration + (s.endOffset||0));
            if (realIdx !== -1 && realIdx !== activeIdx) {
                setCurrentSegIdx(realIdx);
                loopCountRef.current = 0;
            }
         }
         
         if (time >= end - 0.1) {
            pauseFn();
            loopCountRef.current += 1;
            
            if (loopCountRef.current < repeatCountRef.current) {
               seekFn(start);
               playFn();
            } else {
               loopCountRef.current = 0;
               const isEchoingMode = shadowingModeRef.current === 'echo';
               const effectiveWaitMode = isEchoingMode ? (waitModeRef.current === 'Off' ? '100' : waitModeRef.current) : waitModeRef.current;

               if (effectiveWaitMode === 'Off') {
                  if (activeIdx + 1 < segs.length) {
                      setCurrentSegIdx(activeIdx + 1);
                      seekFn(segs[activeIdx + 1].start + (segs[activeIdx + 1].startOffset || 0) + (subSyncRef.current / 1000));
                      playFn();
                  }
               } else if (effectiveWaitMode === 'Manual') {
                  // Stay paused
               } else {
                  const waitPercent = parseInt(effectiveWaitMode) / 100;
                  const waitTime = (seg.duration + (seg.endOffset||0) - (seg.startOffset||0)) * waitPercent * 1000;
                  isWaitingRef.current = true;
                  if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
                  
                  waitTimeoutRef.current = setTimeout(() => {
                      isWaitingRef.current = false;
                      if (currentSegIdxRef.current + 1 < segs.length) {
                          setCurrentSegIdx(currentSegIdxRef.current + 1);
                          const nextSeg = segs[currentSegIdxRef.current + 1];
                          seekFn(nextSeg.start + (nextSeg.startOffset || 0) + (subSyncRef.current / 1000));
                          playFn();
                      }
                  }, waitTime);
               }
            }
         }
      }
    }
    
    reqFrameRef.current = requestAnimationFrame(checkSync);
  };

  // YouTube Link Fetching
  const handleFetchYouTube = async () => {
    if (!urlInput.trim()) return;
    setIsFetching(true);
    let extractedVideoId = null;
    try {
      const reg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = urlInput.trim().match(reg);
      if (match) extractedVideoId = match[1];
    } catch(e){}

    if (extractedVideoId) {
      setVideoId(extractedVideoId);
      setTimeout(() => initYTPlayer(extractedVideoId), 500);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/fetch-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() })
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        const segs = data.data.segments || data.data.subtitles;
        if (segs && segs.length > 0) {
          const title = data.data.title || `YouTube ${extractedVideoId || 'Video'}`;
          setSessionStore(prev => ({
            ...prev,
            youtube: { title, segments: segs, currentSegIdx: 0, scores: {} }
          }));
          alert('✅ Đã trích xuất phụ đề YouTube thành công!');
          setIsFetching(false);
          return;
        }
      }
    } catch(e) {}
    
    setIsFetching(false);
    if (!extractedVideoId) {
      alert('Không thể trích xuất phụ đề. Bạn có thể nạp file phụ đề .srt thủ công bằng nút [📤 Nạp phụ đề SRT].');
    }
  };

  // Upload Local Audio/Video File & Save to IndexedDB
  const handleUploadLocal = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLocalFile(file);
    const url = URL.createObjectURL(file);
    setLocalMediaUrl(url);
    const isVid = file.type.startsWith('video');
    setLocalMediaType(isVid ? 'video' : 'audio');
    setActiveTitle(file.name);

    try {
      if (db.mediaFiles) {
        await db.mediaFiles.put({
          id: file.name,
          name: file.name,
          blob: file,
          type: isVid ? 'video' : 'audio',
          date: new Date().toISOString()
        });
      }
    } catch(err){}

    setIsFetching(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('lang', sttLang);
      formData.append('model_size', sttModel);
      
      const res = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.status === 'success' && data.data && data.data.segments) {
        setSessionStore(prev => ({
          ...prev,
          local: { title: file.name, segments: data.data.segments, currentSegIdx: 0, scores: {} }
        }));
        alert('✅ Đã trích xuất phụ đề tự động từ Whisper AI!');
      }
    } catch(err) {
      console.log('Backend Media Engine STT offline - sẵn sàng nạp phụ đề SRT thủ công.');
    }
    setIsFetching(false);
  };

  // Import SRT / VTT Subtitle File Manually
  const handleImportSRTFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const parsedSegs = parseSRT(text);
      if (parsedSegs.length > 0) {
        setSegments(parsedSegs);
        alert(`✅ Đã nạp thành công ${parsedSegs.length} đoạn phụ đề từ file ${file.name}!`);
      } else {
        alert('Không thể đọc định dạng phụ đề. Vui lòng chọn file .srt hoặc .vtt hợp lệ.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export Subtitles to SRT File
  const handleExportSRT = () => {
    if (!segments || segments.length === 0) { alert('Chưa có phụ đề để xuất.'); return; }
    const formatTime = (seconds) => {
      const pad = (num, size = 2) => String(num).padStart(size, '0');
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
    };
    
    let srtContent = '';
    segments.forEach((seg, idx) => {
      const start = seg.start + (seg.startOffset || 0);
      const end = start + seg.duration + (seg.endOffset || 0);
      srtContent += `${idx + 1}\n${formatTime(start)} --> ${formatTime(end)}\n${seg.text}\n${seg.vi ? seg.vi + '\n' : ''}\n`;
    });
    
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTitle.replace(/\s+/g, '_')}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CLEAR / DELETE CURRENT MEDIA & RESET PLAYER
  const handleClearCurrentMedia = () => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học media này khỏi trình phát hiện tại?')) return;
    pauseAllPlayers();
    if (localMediaUrl) URL.revokeObjectURL(localMediaUrl);
    setLocalFile(null);
    setLocalMediaUrl(null);
    setVideoId(null);
    setUrlInput('');
    setSessionStore(prev => ({
      ...prev,
      [activeTabStoreKey]: { title: '', segments: [], currentSegIdx: 0, scores: {} }
    }));
  };

  // Rename Active Lesson Title
  const handleRenameActiveLesson = () => {
    const newTitle = prompt('Nhập tên mới cho bài học:', activeTitle);
    if (newTitle && newTitle.trim()) {
      setActiveTitle(newTitle.trim());
    }
  };

  // Jump To Segment
  const jumpToSegment = (idx) => {
    if (idx < 0 || idx >= segments.length) return;
    setCurrentSegIdx(idx);
    loopCountRef.current = 0;
    isWaitingRef.current = false;
    if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
    
    const seg = segments[idx];
    const start = seg.start + (seg.startOffset || 0) + (subSync / 1000);
    
    if (activeTab === 'youtube') {
      if (isPlayerReady.current && playerRef.current?.seekTo) {
        playerRef.current.seekTo(start);
        playerRef.current.playVideo();
      }
    } else if (activeTab === 'local' && localPlayerRef.current) {
      localPlayerRef.current.currentTime = start;
      localPlayerRef.current.play();
    } else {
      // Preset / Web Open Material TTS playback
      playTTS(seg.text);
    }
  };

  const togglePlayPause = () => {
    if (activeTab === 'youtube') {
      if (isPlayerReady.current && playerRef.current) {
        if (isPlaying) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
      }
    } else if (activeTab === 'local' && localPlayerRef.current) {
      if (isPlaying) localPlayerRef.current.pause();
      else localPlayerRef.current.play();
    } else {
      if (segments[currentSegIdx]) {
        playTTS(segments[currentSegIdx].text);
      }
    }
  };

  const changeRate = (rate) => {
    setPlaybackRate(rate);
    if (activeTab === 'youtube') {
      if (isPlayerReady.current && playerRef.current) playerRef.current.setPlaybackRate(rate);
    } else if (activeTab === 'local' && localPlayerRef.current) {
      localPlayerRef.current.playbackRate = rate;
    }
  };

  const updateSegmentOffset = (idx, field, delta) => {
    setSegments(prev => {
      const copy = [...prev];
      const currentVal = copy[idx][field] || 0;
      copy[idx] = { ...copy[idx], [field]: currentVal + delta };
      return copy;
    });
  };

  const mergeWithNext = (idx) => {
    setSegments(prev => {
      if (idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const s1 = copy[idx];
      const s2 = copy[idx+1];
      const merged = {
        ...s1,
        text: s1.text + ' ' + s2.text,
        vi: (s1.vi || '') + ' ' + (s2.vi || ''),
        duration: (s2.start + s2.duration) - s1.start,
        endOffset: s2.endOffset || 0
      };
      copy.splice(idx, 2, merged);
      return copy;
    });
  };

  // Real Audio Voice Recording & Speech Recognition
  const toggleRecording = async (idx, textTarget) => {
    if (listening && recordingIdx === idx) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      SpeechRecognition.stopListening();
      setRecordingIdx(null);
      const sc = scoreMatch(textTarget, transcript);
      setScores(prev => ({ ...prev, [idx]: sc }));
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setUserAudioBlobs(prev => ({ ...prev, [idx]: audioUrl }));
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        resetTranscript();
        setRecordingIdx(idx);
        SpeechRecognition.startListening({ continuous: true, language: 'ja-JP' });
      } catch (err) {
        alert('Không thể khởi động Microphone: ' + err.message);
      }
    }
  };

  const playUserRecordedAudio = (idx) => {
    const url = userAudioBlobs[idx];
    if (!url) return;
    if (userAudioPlayerRef.current) {
      userAudioPlayerRef.current.pause();
    }
    const audio = new Audio(url);
    userAudioPlayerRef.current = audio;
    audio.play();
  };

  // TTS Speech Synthesis
  const playTTS = (text) => {
    if (!text || !window.speechSynthesis) return;
    setIsTtsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = playbackRate * 0.9;
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
    if (jpVoice) utterance.voice = jpVoice;
    
    utterance.onend = () => setIsTtsPlaying(false);
    utterance.onerror = () => setIsTtsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  // Save Word to FSRS Flashcards in db.vocab
  const handleSaveWordToFlashcards = async (wordText) => {
    if (!wordText || !wordText.trim()) return;
    const word = wordText.trim();
    try {
      const existing = await db.vocab.filter(v => v.word === word).first();
      if (existing) {
        alert(`Từ "${word}" đã có trong bộ thẻ Flashcards của bạn!`);
        return;
      }
      const newCard = {
        id: Date.now().toString(),
        word: word,
        kanji: word,
        level: 'N3',
        meaning: 'Lưu từ Shadowing Studio',
        status: 'learning',
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        dueDate: new Date().toISOString()
      };
      await db.vocab.add(newCard);
      alert(`✅ Đã thêm từ "${word}" vào bộ thẻ Flashcards (FSRS)!`);
    } catch(e) {
      alert('Lỗi lưu từ vào Flashcards: ' + e.message);
    }
  };

  // Save Current Session to Workspace & Custom Playlist
  const saveCurrentSessionToWorkspace = async (targetPlaylistId = null) => {
    if (segments.length === 0) { alert('Chưa có nội dung để lưu.'); return; }
    const title = prompt('Đặt tên cho bài học này:', activeTitle || 'Bài học Shadowing');
    if (!title) return;
    try {
      const newItem = {
          id: Date.now().toString(),
          title,
          playlistId: targetPlaylistId || selectedPlaylistId || 'all',
          metadata: {
            title,
            type: activeTab,
            video_id: videoId || null,
            source: activeTab === 'youtube' ? urlInput : (localFile?.name || 'online_web')
          },
          segments: segments,
          created_at: new Date().toISOString()
      };
      const items = JSON.parse(localStorage.getItem('omni_shadowing_workspace') || '[]');
      items.push(newItem);
      localStorage.setItem('omni_shadowing_workspace', JSON.stringify(items));
      alert('✅ Đã lưu bài học vào Workspace & Playlist!');
      fetchWorkspaceItems();
    } catch(e) { alert('Lỗi lưu bài học.'); }
  };

  // Create New Playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) return;
    try {
      if (db.playlists) {
        const newPl = {
          id: 'pl_' + Date.now(),
          title: newPlaylistTitle.trim(),
          createdAt: new Date().toISOString()
        };
        await db.playlists.add(newPl);
        setNewPlaylistTitle('');
        alert(`✅ Đã tạo Danh sách phát "${newPl.title}"!`);
      }
    } catch(e) {
      alert('Lỗi tạo Playlist: ' + e.message);
    }
  };

  const handleDeletePlaylist = async (id, title) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa Playlist "${title}"?`)) return;
    try {
      if (db.playlists) await db.playlists.delete(id);
      if (selectedPlaylistId === id) setSelectedPlaylistId('all');
    } catch(e){}
  };

  const loadWorkspaceItem = (id) => {
    try {
      const items = JSON.parse(localStorage.getItem('omni_shadowing_workspace') || '[]');
      const item = items.find(i => i.id === id);
      if (item) {
        const meta = item.metadata || {};
        const targetTab = meta.type === 'youtube' ? 'youtube' : (meta.type === 'local' ? 'local' : 'web');
        setSessionStore(prev => ({
          ...prev,
          [targetTab]: { title: item.title, segments: item.segments || [], currentSegIdx: 0, scores: {} }
        }));
        setActiveTab(targetTab);
        if (meta.type === 'youtube' && meta.video_id) {
          setVideoId(meta.video_id);
          setTimeout(() => initYTPlayer(meta.video_id), 500);
        }
      }
    } catch(e){}
  };

  const deleteWorkspaceItem = (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này khỏi Workspace?')) return;
    try {
      const items = JSON.parse(localStorage.getItem('omni_shadowing_workspace') || '[]');
      const newItems = items.filter(item => item.id !== id);
      localStorage.setItem('omni_shadowing_workspace', JSON.stringify(newItems));
      fetchWorkspaceItems();
    } catch(e){}
  };

  if (!browserSupportsSpeechRecognition) return (
    <div className="glass-panel" style={{ textAlign: 'center', padding: 40 }}>
      <AlertCircle size={40} color="var(--accent-danger)" style={{ marginBottom: 12 }}/>
      <h2>Yêu cầu Trình duyệt Google Chrome</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Tính năng nhận diện giọng nói Web Speech API yêu cầu Chrome.</p>
    </div>
  );

  const completedCount = currentSegIdx;
  const progressPercent = segments.length > 0 ? Math.round((completedCount / segments.length) * 100) : 0;

  // Filter workspace items by active playlist
  const filteredWorkspaceItems = selectedPlaylistId === 'all' 
    ? workspaceItems 
    : workspaceItems.filter(i => i.playlistId === selectedPlaylistId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '88vh' }}>
      
      {/* TOP HEADER: NAVIGATION & SHADOWING MODES */}
      <div className="glass-panel" style={{ display: 'flex', gap: 12, padding: '10px 16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        
        {/* Source Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            className={`btn ${activeTab === 'presets' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleTabChange('presets')}
            style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            <Sparkles size={15} /> Bài Học Mẫu
          </button>
          <button 
            className={`btn ${activeTab === 'web' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleTabChange('web')}
            style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            <Newspaper size={15} /> Web & Tin Tức Online
          </button>
          <button 
            className={`btn ${activeTab === 'youtube' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleTabChange('youtube')}
            style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            <Globe size={15} /> Online YouTube
          </button>
          <button 
            className={`btn ${activeTab === 'local' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleTabChange('local')}
            style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            <HardDrive size={15} /> Offline Media (Máy Tính)
          </button>
          <button 
            className={`btn ${activeTab === 'workspace' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleTabChange('workspace')}
            style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            <List size={15} /> Playlist & Workspace ({workspaceItems.length})
          </button>
        </div>

        {/* 4 Scientific Shadowing Modes Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 4 }}>CHẾ ĐỘ:</span>
          
          <button 
            onClick={() => setShadowingMode('text')} 
            className={`btn ${shadowingMode === 'text' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
            title="Text-Guided: Nghe + Phụ đề tiếng Nhật + Furigana"
          >
            <FileText size={13}/> Text-Guided
          </button>

          <button 
            onClick={() => setShadowingMode('blind')} 
            className={`btn ${shadowingMode === 'blind' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, background: shadowingMode === 'blind' ? '#8b5cf6' : 'transparent', color: 'white' }}
            title="Blind Shadowing: Làm mờ phụ đề luyện phản xạ nghe trực tiếp"
          >
            <EyeOff size={13}/> Blind (Ẩn Chữ)
          </button>

          <button 
            onClick={() => setShadowingMode('echo')} 
            className={`btn ${shadowingMode === 'echo' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, background: shadowingMode === 'echo' ? '#f59e0b' : 'transparent', color: 'white' }}
            title="Echoing Method (Dr. Karen Chung): Tự động dừng sau từng câu để nhại lại"
          >
            <Repeat size={13}/> Echoing
          </button>

          <button 
            onClick={() => setShadowingMode('record')} 
            className={`btn ${shadowingMode === 'record' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, background: shadowingMode === 'record' ? '#ef4444' : 'transparent', color: 'white' }}
            title="Record & Compare: Thu âm giọng thực tế và nghe lại đối chiếu"
          >
            <Mic size={13}/> Ghi Âm & Đối Chiếu
          </button>
        </div>

      </div>

      {/* TAB CONTENTS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
          
        {/* INPUT / CONTROL BARS */}
        {activeTab === 'presets' && (
          <div className="glass-panel" style={{ display: 'flex', gap: 10, padding: '10px 16px', alignItems: 'center', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <Sparkles size={16}/> Chọn Bài Học Mẫu:
            </span>
            {PRESET_LESSONS.map(p => (
              <button 
                key={p.id}
                className={`btn ${activeTitle === p.title ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => loadPresetLesson(p)}
                style={{ padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}

        {/* OPEN WEB MATERIALS & NEWS FETCHER */}
        {activeTab === 'web' && (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 14 }}>
            
            {/* Direct URL Fetcher & News Feeds */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
                <input 
                  type="text" 
                  placeholder="Dán URL Bài báo / Tin tức / Blog tiếng Nhật bất kỳ vào đây..."
                  value={webUrlInput}
                  onChange={e => setWebUrlInput(e.target.value)}
                  onKeyDown={e => { if(e.key === 'Enter') handleFetchWebArticle(); }}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                />
                <button className="btn btn-primary" onClick={() => handleFetchWebArticle()} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                  {isFetching ? <Loader size={14} className="spin" /> : <Link2 size={14} />} Trích Xuất Web
                </button>
              </div>

              {/* Quick Preset News Channels */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>KÊNH TIN TỨC:</span>
                {OPEN_NEWS_CHANNELS.map(ch => (
                  <button 
                    key={ch.title}
                    className="btn btn-outline"
                    onClick={() => handleFetchWebArticle(ch.url)}
                    disabled={isFetching}
                    style={{ padding: '4px 8px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    title={ch.desc}
                  >
                    {ch.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Raw Text Importer */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
               <input 
                 type="text" 
                 placeholder="Tiêu đề bài viết..."
                 value={customTextTitle}
                 onChange={e => setCustomTextTitle(e.target.value)}
                 style={{ width: 220, padding: '6px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.8rem' }}
               />
               <input 
                 type="text"
                 placeholder="Dán bất kỳ đoạn văn bản, tin tức, bài hội thoại tiếng Nhật nào vào đây..."
                 value={customTextInput}
                 onChange={e => setCustomTextInput(e.target.value)}
                 onKeyDown={e => { if(e.key === 'Enter') handleParseCustomText(); }}
                 style={{ flex: 1, minWidth: 200, padding: '6px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.8rem' }}
               />
               <button className="btn btn-primary" onClick={handleParseCustomText} style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                 <Wand2 size={13}/> Biến Thành Bài Shadowing
               </button>
            </div>

          </div>
        )}

        {activeTab === 'youtube' && (
          <div className="glass-panel" style={{ display: 'flex', gap: 10, padding: 10 }}>
            <input 
              type="text" 
              placeholder="Dán link YouTube tiếng Nhật có phụ đề vào đây..."
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter') handleFetchYouTube(); }}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', fontSize: '0.9rem' }}
            />
            <button className="btn btn-primary" onClick={handleFetchYouTube} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              {isFetching ? <Loader size={15} className="spin" /> : <Globe size={15} />} Học Ngay
            </button>
          </div>
        )}

        {activeTab === 'local' && (
          <div className="glass-panel" style={{ display: 'flex', gap: 10, padding: 10, alignItems: 'center', flexWrap: 'wrap' }}>
             <label className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                <Upload size={15} /> {isFetching ? 'Đang trích xuất Whisper...' : 'Tải lên Video/Audio'}
                <input type="file" accept="video/*,audio/*" onChange={handleUploadLocal} disabled={isFetching} style={{ display: 'none' }} />
             </label>

             <select value={sttLang} onChange={e => setSttLang(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.8rem' }}>
                <option value="ja">🇯🇵 Tiếng Nhật</option>
                <option value="en">🇺🇸 Tiếng Anh</option>
                <option value="vi">🇻🇳 Tiếng Việt</option>
             </select>

             <select value={sttModel} onChange={e => setSttModel(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.8rem' }}>
                <option value="base">⚡ Whisper Base</option>
                <option value="small">📊 Whisper Small</option>
                <option value="medium">🎯 Whisper Medium</option>
             </select>

             <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {localFile ? `📄 ${localFile.name}` : 'Hỗ trợ MP4, MP3, WAV, AAC...'}
             </span>
             {isFetching && <Loader size={16} className="spin" style={{ color: 'var(--accent-primary)' }} />}
          </div>
        )}

        {/* WORKSPACE & PLAYLIST TAB */}
        {activeTab === 'workspace' && (
           <div className="glass-panel" style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Playlists Management Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                 <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}><List size={20}/> Danh Sách Phát & Thư Mục (Playlists)</h2>
                 
                 <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input 
                      type="text"
                      placeholder="Tên Playlist mới..."
                      value={newPlaylistTitle}
                      onChange={e => setNewPlaylistTitle(e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.85rem' }}
                    />
                    <button className="btn btn-primary" onClick={handleCreatePlaylist} style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FolderPlus size={15}/> Tạo Playlist
                    </button>
                 </div>
              </div>

              {/* Playlist Filter Chips */}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                 <button 
                   className={`btn ${selectedPlaylistId === 'all' ? 'btn-primary' : 'btn-outline'}`}
                   onClick={() => setSelectedPlaylistId('all')}
                   style={{ padding: '4px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                 >
                   Tất cả bài học ({workspaceItems.length})
                 </button>

                 {storedPlaylists.map(pl => (
                   <div key={pl.id} style={{ display: 'flex', alignItems: 'center' }}>
                     <button 
                       className={`btn ${selectedPlaylistId === pl.id ? 'btn-primary' : 'btn-outline'}`}
                       onClick={() => setSelectedPlaylistId(pl.id)}
                       style={{ padding: '4px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap', borderRadius: '6px 0 0 6px' }}
                     >
                       📁 {pl.title}
                     </button>
                     <button 
                       className="btn-ghost" 
                       onClick={() => handleDeletePlaylist(pl.id, pl.title)}
                       style={{ padding: '4px 6px', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', borderRadius: '0 6px 6px 0', border: '1px solid var(--glass-border)' }}
                     >
                       <X size={12}/>
                     </button>
                   </div>
                 ))}
              </div>

              {/* Lessons List inside Workspace */}
              {filteredWorkspaceItems.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                     <List size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
                     <p>Chưa có bài học nào trong Playlist này. Thêm link YouTube hoặc Upload file từ máy tính để lưu bài.</p>
                 </div>
              ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredWorkspaceItems.map((item) => (
                       <div key={item.id}
                           style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                       >
                           <div style={{ flex: 1 }}>
                               <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 2 }}>{item.title}</div>
                               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                   <span style={{ textTransform: 'uppercase', background: 'rgba(59,130,246,0.15)', padding: '1px 6px', borderRadius: 4, fontSize: '0.75rem' }}>[{item.metadata?.type || 'media'}]</span>
                                   <span>{item.segments?.length || 0} đoạn phụ đề</span>
                                   <span>{new Date(item.created_at).toLocaleDateString()}</span>
                               </div>
                           </div>
                           <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                               <button className="btn btn-primary" onClick={() => loadWorkspaceItem(item.id)} style={{ padding: '6px 14px', borderRadius: 6, display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.85rem' }}>
                                   <Play size={14}/> Học ngay
                               </button>
                               <button className="btn-ghost" onClick={() => deleteWorkspaceItem(item.id)} style={{ padding: 6, color: 'var(--accent-danger)' }} title="Xóa bài học này">
                                   <Trash2 size={16}/>
                               </button>
                           </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        )}

        {/* MAIN STUDIO PLAYER & TRANSCRIPT SPLIT VIEW */}
        <div style={{ display: (activeTab === 'workspace') ? 'none' : 'flex', gap: 16, flex: 1, minHeight: 0 }}>
          
          {/* LEFT PANE: MEDIA PLAYER & UNIFIED MEDIA CONTROL BAR */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: '44%' }}>
            
            {/* UNIFIED MEDIA BAR (UX FIX: Clear/Delete, Rename, Export/Import Subtitles) */}
            <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }} title={activeTitle}>
                  {activeTitle}
                </div>

                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button className="btn-ghost" onClick={handleRenameActiveLesson} style={{ padding: 4 }} title="Đổi tên bài học">
                    <Edit3 size={14}/>
                  </button>
                  <button className="btn-ghost" onClick={() => saveCurrentSessionToWorkspace()} style={{ padding: 4, color: 'var(--accent-primary)' }} title="Lưu vào Workspace">
                    <Save size={14}/>
                  </button>
                  <button className="btn-ghost" onClick={handleClearCurrentMedia} style={{ padding: 4, color: 'var(--accent-danger)' }} title="🗑️ Xóa Media này / Tải bài mới">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>

              {/* Subtitle Action Toolbar */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6 }}>
                <label className="btn btn-outline" style={{ padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Upload size={12}/> 📤 Nạp Sub SRT
                  <input type="file" accept=".srt,.vtt" onChange={handleImportSRTFile} style={{ display: 'none' }} />
                </label>

                <button className="btn btn-outline" onClick={handleExportSRT} style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Download size={12}/> 📥 Xuất SRT
                </button>

                {shadowingMode === 'blind' && (
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setIsBlindRevealed(prev => !prev)}
                    style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', background: isBlindRevealed ? 'rgba(139,92,246,0.2)' : 'transparent' }}
                  >
                    {isBlindRevealed ? <Eye size={12}/> : <EyeOff size={12}/>} {isBlindRevealed ? 'Ẩn lại' : 'Xem chữ nhanh'}
                  </button>
                )}
              </div>

            </div>

            {/* YouTube Player Element */}
            <div style={{ display: activeTab === 'youtube' && videoId ? 'block' : 'none', position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 10, overflow: 'hidden', background: '#000', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              <div id="yt-player" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></div>
            </div>
            
            {/* Local Media Player Element */}
            <div style={{ display: activeTab === 'local' && localMediaUrl ? 'flex' : 'none', position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#000', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
               {localMediaType === 'video' ? (
                  <video ref={localPlayerRef} src={localMediaUrl} controls style={{ width: '100%', maxHeight: '45vh' }} onPlay={() => { setIsPlaying(true); if(!reqFrameRef.current) checkSync(); }} onPause={() => setIsPlaying(false)} />
               ) : (
                  <audio ref={localPlayerRef} src={localMediaUrl} controls style={{ width: '85%', marginTop: 20, marginBottom: 20 }} onPlay={() => { setIsPlaying(true); if(!reqFrameRef.current) checkSync(); }} onPause={() => setIsPlaying(false)} />
               )}
            </div>

            {/* Presets & Web Open Materials Player Banner */}
            {(activeTab === 'presets' || activeTab === 'web') && (
              <div className="glass-panel" style={{ padding: 16, textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12 }}>
                <Newspaper size={32} color="#60a5fa" style={{ marginBottom: 8 }} />
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'white' }}>{activeTitle}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bài học tự do tích hợp sẵn đọc tự động AI TTS & Furigana.</p>
              </div>
            )}

            {/* Empty States */}
            {activeTab === 'youtube' && !videoId && (
              <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: 20 }}>
                <Video size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                <p style={{ fontSize: '0.9rem' }}>Dán link YouTube ở trên để bắt đầu Shadowing</p>
              </div>
            )}
            {activeTab === 'local' && !localMediaUrl && (
              <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>
                <HardDrive size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                <p style={{ fontSize: '0.9rem' }}>Tải lên file Video hoặc Audio từ máy tính.</p>
                <p style={{ fontSize: '0.75rem', marginTop: 6, opacity: 0.6 }}>Hỗ trợ Whisper AI tự động phân tích hoặc Nạp file phụ đề .srt sẵn có.</p>
              </div>
            )}

            {/* ADVANCED SHADOWING AUDIO CONTROLS */}
            <div className="glass-panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
               
               {/* Progress Bar */}
               <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                       <span>TIẾN ĐỘ SHADOWING</span>
                       <span>{progressPercent}% ({completedCount}/{segments.length})</span>
                   </div>
                   <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                       <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--accent-primary)', transition: 'width 0.3s' }}></div>
                   </div>
               </div>

               {/* Transport Control Buttons */}
               <div style={{ display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center' }}>
                   <button className="btn-ghost" onClick={() => jumpToSegment(currentSegIdx - 1)} style={{ padding: 8 }} title="Câu trước (Mũi tên Trái/Lên)"><SkipBack size={18}/></button>
                   <button className="btn-primary" onClick={togglePlayPause} style={{ padding: '8px 20px', borderRadius: 20 }}>
                       {isPlaying ? <Pause size={18}/> : <Play size={18}/>}
                   </button>
                   <button className="btn-ghost" onClick={() => jumpToSegment(currentSegIdx)} style={{ padding: 8 }} title="Phát lại câu này (Phím R)"><Repeat size={18}/></button>
                   <button className="btn-ghost" onClick={() => jumpToSegment(currentSegIdx + 1)} style={{ padding: 8 }} title="Câu tiếp theo (Mũi tên Phải/Xuống)"><SkipForward size={18}/></button>
               </div>

               {/* Control Settings Grid */}
               <div style={{ display: 'grid', gridTemplateColumns: '75px 1fr', gap: '8px 12px', alignItems: 'center', fontSize: '0.8rem' }}>
                   
                   <div style={{ color: 'var(--text-secondary)' }}>Tốc độ</div>
                   <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                       {[0.5, 0.75, 1, 1.25, 1.5].map(r => (
                           <button key={r} onClick={() => changeRate(r)} className={`btn ${playbackRate === r ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '3px 6px', fontSize: '0.75rem', flex: 1 }}>{r}x</button>
                       ))}
                   </div>

                   <div style={{ color: 'var(--text-secondary)' }}>Lặp câu</div>
                   <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                       {[1, 2, 3, 5, 10].map(c => (
                           <button key={c} onClick={() => setRepeatCount(c)} className={`btn ${repeatCount === c ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '3px 6px', fontSize: '0.75rem', flex: 1 }}>{c} lần</button>
                       ))}
                   </div>

                   <div style={{ color: 'var(--text-secondary)' }}>Chờ nhại</div>
                   <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                       {['Off', 'Manual', '50', '80', '100', '120'].map(m => (
                           <button key={m} onClick={() => setWaitMode(m)} className={`btn ${waitMode === m ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '3px 6px', fontSize: '0.75rem', flex: 1 }}>
                               {m === 'Off' || m === 'Manual' ? m : `+${m}%`}
                           </button>
                       ))}
                   </div>

                   <div style={{ color: 'var(--text-secondary)' }}>Dịch nghĩa</div>
                   <div>
                       <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'rgba(59,130,246,0.1)', padding: '4px 10px', borderRadius: 6 }}>
                           <input type="checkbox" checked={showVi} onChange={e => setShowVi(e.target.checked)} />
                           <span>Hiện Tiếng Việt</span>
                       </label>
                   </div>
               </div>

            </div>
          </div>

          {/* RIGHT PANE: TRANSCRIPT LIST WITH AUTO-SCROLL & INTERACTIVE SEGMENTS */}
          <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!segments.length && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 40 }}>Chưa có bài học. Chọn bài học mẫu, dán URL bài báo hoặc dán văn bản tùy ý ở trên.</div>}
              
              {segments.map((seg, idx) => {
                  const isCurrent = currentSegIdx === idx;
                  const isBlind = shadowingMode === 'blind' && !isBlindRevealed;

                  return (
                      <React.Fragment key={idx}>
                          <div 
                              ref={el => segmentRefs.current[idx] = el}
                              style={{
                                  padding: '14px',
                                  borderRadius: 10,
                                  background: isCurrent ? 'rgba(59,130,246,0.15)' : 'transparent',
                                  border: `1px solid ${isCurrent ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.03)'}`,
                                  transition: 'all 0.25s',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 10
                              }}
                          >
                              {/* Top Bar: ID, Time, Trim Offset Controls */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                      <span style={{ background: isCurrent ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', color: 'white', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>#{idx + 1}</span>
                                      <span>{Math.floor(seg.start / 60)}:{(Math.floor(seg.start % 60) + '').padStart(2, '0')}</span>
                                  </div>
                                  
                                  {/* Fine Audio Trim Controls */}
                                  <div style={{ display: 'flex', gap: 12, opacity: isCurrent ? 1 : 0.4, transition: 'opacity 0.2s' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          <span>Start</span>
                                          <button className="btn-ghost" style={{ padding: 1 }} onClick={() => updateSegmentOffset(idx, 'startOffset', -0.2)}><Minus size={11}/></button>
                                          <span style={{ width: 26, textAlign: 'center' }}>{(seg.startOffset||0).toFixed(1)}s</span>
                                          <button className="btn-ghost" style={{ padding: 1 }} onClick={() => updateSegmentOffset(idx, 'startOffset', 0.2)}><Plus size={11}/></button>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          <span>End</span>
                                          <button className="btn-ghost" style={{ padding: 1 }} onClick={() => updateSegmentOffset(idx, 'endOffset', -0.2)}><Minus size={11}/></button>
                                          <span style={{ width: 26, textAlign: 'center' }}>{(seg.endOffset||0).toFixed(1)}s</span>
                                          <button className="btn-ghost" style={{ padding: 1 }} onClick={() => updateSegmentOffset(idx, 'endOffset', 0.2)}><Plus size={11}/></button>
                                      </div>
                                  </div>
                              </div>

                              {/* Main Subtitle Text Content */}
                              <div 
                                style={{ 
                                  cursor: 'pointer',
                                  filter: isBlind ? 'blur(8px)' : 'none',
                                  transition: 'filter 0.3s'
                                }} 
                                onClick={() => jumpToSegment(idx)}
                              >
                                 <div className="jp-text" style={{ fontSize: '1.2rem', lineHeight: 1.8, color: isCurrent ? 'white' : '#cbd5e1' }}>
                                     <FuriganaText text={seg.text} />
                                 </div>
                                 {showVi && seg.vi && (
                                     <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>
                                         {seg.vi}
                                     </div>
                                 )}
                              </div>

                              {/* Interactive Recording & Dual Audio Compare Tools */}
                              {isCurrent && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, marginTop: 2, flexWrap: 'wrap', gap: 8 }}>
                                      
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                          {scores[idx] !== undefined && (
                                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: scores[idx] > 80 ? 'var(--accent-success)' : scores[idx] > 50 ? '#f59e0b' : 'var(--accent-danger)' }}>
                                                  Điểm: {scores[idx]}%
                                              </span>
                                          )}
                                          <button 
                                              onClick={() => handleSaveWordToFlashcards(window.getSelection()?.toString() || seg.text.slice(0, 10))}
                                              className="btn btn-outline"
                                              style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                                              title="Thêm từ đang chọn vào Flashcards FSRS"
                                          >
                                              <BookOpen size={12}/> Lưu FSRS
                                          </button>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                          {/* AI Audio Read */}
                                          <button 
                                              onClick={() => playTTS(seg.text)}
                                              disabled={isTtsPlaying}
                                              style={{ 
                                                  padding: '4px 10px', borderRadius: 16, border: '1px solid var(--glass-border)',
                                                  cursor: isTtsPlaying ? 'not-allowed' : 'pointer',
                                                  display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: '0.8rem',
                                                  background: 'rgba(59,130,246,0.1)', color: '#60a5fa'
                                              }}
                                          >
                                              {isTtsPlaying ? <Loader size={12} className="spin" /> : <Volume2 size={12}/>} Giọng AI
                                          </button>

                                          {/* User Recorded Audio Playback (Record & Compare Mode) */}
                                          {userAudioBlobs[idx] && (
                                              <button 
                                                  onClick={() => playUserRecordedAudio(idx)}
                                                  style={{ 
                                                      padding: '4px 10px', borderRadius: 16, border: '1px solid #10b981',
                                                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: '0.8rem',
                                                      background: 'rgba(16,185,129,0.15)', color: '#34d399'
                                                  }}
                                                  title="Phát đối chiếu giọng thu của bạn"
                                              >
                                                  <Play size={12}/> Giọng Tôi
                                              </button>
                                          )}

                                          {/* Record Voice Button */}
                                          <button 
                                              onClick={() => toggleRecording(idx, seg.text)}
                                              style={{ 
                                                  padding: '4px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
                                                  display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: '0.8rem',
                                                  background: recordingIdx === idx ? 'var(--accent-danger)' : 'rgba(255,255,255,0.12)',
                                                  color: 'white'
                                              }}
                                          >
                                              {recordingIdx === idx ? <Square size={12}/> : <Mic size={12}/>} 
                                              {recordingIdx === idx ? 'Dừng' : 'Thu Âm'}
                                          </button>
                                      </div>
                                  </div>
                              )}

                              {/* Live Speech Recognition Display */}
                              {recordingIdx === idx && (
                                  <div className="jp-text" style={{ fontSize: '0.85rem', padding: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 6, color: '#fca5a5' }}>
                                      🎙️ {transcript || 'Đang nghe giọng bạn nhại âm...'}
                                  </div>
                              )}
                          </div>

                          {/* Segment Merge Divider */}
                          {idx < segments.length - 1 && (
                              <div className="merge-divider" style={{ position: 'relative', height: 2, background: 'rgba(255,255,255,0.05)', margin: '2px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }}
                                   onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                   onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                   onClick={() => mergeWithNext(idx)}
                                   title="Ghép câu này với câu tiếp theo"
                              >
                                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Plus size={12} />
                                  </div>
                              </div>
                          )}
                      </React.Fragment>
                  );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadowingStudio;

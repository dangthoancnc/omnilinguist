import React, { useState, useRef, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';
import { Mic, Globe, Video, Upload, HardDrive, Loader, AlertCircle, Plus, Minus, Settings2, SkipBack, Play, Repeat, SkipForward, Pause, Square, List, Trash2, Save, FolderOpen, Volume2, Cpu } from 'lucide-react';
import FuriganaText from './components/FuriganaText';

const scoreMatch = (target, got) => {
  if (!got) return 0;
  const t = target.replace(/[。、！？\s]/g, '');
  const g = got.replace(/[。、！？\s]/g, '');
  let match = 0;
  for (const ch of g) { if (t.includes(ch)) match++; }
  return Math.min(100, Math.round((match / t.length) * 120));
};

const ShadowingStudio = () => {
  const shadowingData = useLiveQuery(() => db.shadowing.toArray()) || [];
  
  const [activeTab, setActiveTab] = useState('youtube');
  
  // Per-tab session store: each tab preserves its own segments independently
  const [sessionStore, setSessionStore] = useState({
    youtube: { segments: [], currentSegIdx: 0, scores: {} },
    local: { segments: [], currentSegIdx: 0, scores: {} }
  });
  
  // Active derived states (from current tab's store)
  const activeSession = sessionStore[activeTab] || sessionStore.youtube;
  const segments = activeSession.segments;
  const currentSegIdx = activeSession.currentSegIdx;
  const scores = activeSession.scores;
  
  const setSegments = (segsOrFn) => {
    setSessionStore(prev => {
      const tab = activeTab === 'youtube' || activeTab === 'local' ? activeTab : 'youtube';
      const newSegs = typeof segsOrFn === 'function' ? segsOrFn(prev[tab].segments) : segsOrFn;
      return { ...prev, [tab]: { ...prev[tab], segments: newSegs } };
    });
  };
  const setCurrentSegIdx = (idx) => {
    setSessionStore(prev => {
      const tab = activeTab === 'youtube' || activeTab === 'local' ? activeTab : 'youtube';
      return { ...prev, [tab]: { ...prev[tab], currentSegIdx: idx } };
    });
  };
  const setScores = (scOrFn) => {
    setSessionStore(prev => {
      const tab = activeTab === 'youtube' || activeTab === 'local' ? activeTab : 'youtube';
      const newSc = typeof scOrFn === 'function' ? scOrFn(prev[tab].scores) : scOrFn;
      return { ...prev, [tab]: { ...prev[tab], scores: newSc } };
    });
  };
  
  const [isFetching, setIsFetching] = useState(false);
  const [showVi, setShowVi] = useState(false);
  
  // YouTube States
  const [urlInput, setUrlInput] = useState('');
  const [videoId, setVideoId] = useState(null);
  
  // Local Media States
  const [localFile, setLocalFile] = useState(null);
  const [localMediaUrl, setLocalMediaUrl] = useState(null);
  const [localMediaType, setLocalMediaType] = useState('video');
  const [sttLang, setSttLang] = useState('ja');
  const [sttModel, setSttModel] = useState('base');
  
  // Workspace States
  const [workspaceItems, setWorkspaceItems] = useState([]);
  const [workspaceDir, setWorkspaceDir] = useState('');
  const [playlistInput, setPlaylistInput] = useState('');
  
  // New Shadowing Controls
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatCount, setRepeatCount] = useState(1);
  const [waitMode, setWaitMode] = useState('Manual'); // 'Off', 'Manual', '50', '80', '100', '120'
  const [subSync, setSubSync] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // TTS State
  const [ttsVoice, setTtsVoice] = useState(() => localStorage.getItem('omni_shadowing_tts_voice') || 'ja-JP-NanamiNeural');
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const ttsAudioRef = useRef(null);

  // Engine Manager
  const [engineRunning, setEngineRunning] = useState(false);
  const [engineToggling, setEngineToggling] = useState(false);

  useEffect(() => {
    // Vô hiệu hóa kiểm tra engine cục bộ cho chế độ Serverless
    setEngineRunning(true);
  }, []);

  const toggleEngine = async () => {
    alert('Không áp dụng ở chế độ Serverless.');
  };

  useEffect(() => {
    localStorage.setItem('omni_shadowing_tts_voice', ttsVoice);
  }, [ttsVoice]);

  const playTTS = (text) => {
    if (!text || !window.speechSynthesis) return;
    setIsTtsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
    if (jpVoice) utterance.voice = jpVoice;
    
    utterance.onend = () => setIsTtsPlaying(false);
    utterance.onerror = () => setIsTtsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  // Refs
  const playerRef = useRef(null);
  const localPlayerRef = useRef(null);
  const reqFrameRef = useRef(null);
  const isPlayerReady = useRef(false);
  
  const segmentsRef = useRef([]);
  const currentSegIdxRef = useRef(0);
  const repeatCountRef = useRef(1);
  const waitModeRef = useRef('Manual');
  const subSyncRef = useRef(0);
  
  const loopCountRef = useRef(0);
  const isWaitingRef = useRef(false);
  const waitTimeoutRef = useRef(null);
  
  // Recording
  const [recordingIdx, setRecordingIdx] = useState(null);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => { segmentsRef.current = segments; }, [segments]);
  useEffect(() => { currentSegIdxRef.current = currentSegIdx; }, [currentSegIdx]);
  useEffect(() => { repeatCountRef.current = repeatCount; }, [repeatCount]);
  useEffect(() => { waitModeRef.current = waitMode; }, [waitMode]);
  useEffect(() => { subSyncRef.current = subSync; }, [subSync]);

  const fetchWorkspaceItems = async () => {
    try {
      const items = JSON.parse(localStorage.getItem('omni_shadowing_workspace') || '[]');
      setWorkspaceItems(items);
    } catch(e) {}
  };

  useEffect(() => {
    if (activeTab === 'workspace') {
      fetchWorkspaceItems();
      fetchWorkspaceDir();
      const interval = setInterval(fetchWorkspaceItems, 5000); // Poll for background processing updates
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchWorkspaceDir = async () => {
    setWorkspaceDir('Trình duyệt (Local Storage)');
  };

  const changeWorkspaceDir = async () => {
    alert('Tính năng này không khả dụng ở chế độ Serverless.');
  };

  const saveCurrentSessionToWorkspace = async () => {
    if (segments.length === 0) { alert('Chưa có nội dung để lưu.'); return; }
    const title = prompt('Đặt tên cho bài học:', videoId ? `YouTube ${videoId}` : (localFile?.name || 'Bài học'));
    if (!title) return;
    try {
      const newItem = {
          id: Date.now().toString(),
          title,
          metadata: {
            title,
            type: activeTab === 'youtube' ? 'youtube' : 'local',
            video_id: videoId || null,
            source: activeTab === 'youtube' ? urlInput : (localFile?.name || 'local')
          },
          segments: segments,
          created_at: new Date().toISOString()
      };
      const items = JSON.parse(localStorage.getItem('omni_shadowing_workspace') || '[]');
      items.push(newItem);
      localStorage.setItem('omni_shadowing_workspace', JSON.stringify(items));
      alert('Đã lưu vào bộ nhớ trình duyệt!');
      fetchWorkspaceItems();
    } catch(e) { alert('Lỗi lưu.'); }
  };

  const handlePlaylistAddUrl = async () => {
    if (!playlistInput.trim()) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/playlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: playlistInput.trim(), type: 'youtube', title: null })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPlaylistInput('');
        fetchWorkspaceItems();
      }
    } catch(e) { alert('Lỗi kết nối.'); }
  };

  const handlePlaylistAddFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('lang', sttLang);
      formData.append('model_size', sttModel);
      const res = await fetch('http://127.0.0.1:8000/api/playlist/add-file', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchWorkspaceItems();
      }
    } catch(e) { alert('Lỗi tải file.'); }
    e.target.value = '';
  };

  // Load Session
  useEffect(() => {
    try {
      const saved = localStorage.getItem('omni_shadowing_session_v2');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.sessionStore) {
          setSessionStore(data.sessionStore);
        }
        setActiveTab(data.activeTab || 'youtube');
        if (data.playbackRate) setPlaybackRate(data.playbackRate);
        if (data.repeatCount) setRepeatCount(data.repeatCount);
        if (data.waitMode) setWaitMode(data.waitMode);
        if (data.subSync !== undefined) setSubSync(data.subSync);
        if (data.sttLang) setSttLang(data.sttLang);
        if (data.sttModel) setSttModel(data.sttModel);
        
        if (data.videoId) {
          setVideoId(data.videoId);
          setUrlInput(data.urlInput || '');
          setTimeout(() => initPlayer(data.videoId), 500);
        }
      }
    } catch (e) {}
  }, []);

  // Save Session
  useEffect(() => {
    const session = {
      activeTab, sessionStore, videoId, urlInput, hasLocalMedia: !!localMediaUrl,
      playbackRate, repeatCount, waitMode, subSync, sttLang, sttModel
    };
    localStorage.setItem('omni_shadowing_session_v2', JSON.stringify(session));
  }, [activeTab, sessionStore, videoId, urlInput, localMediaUrl, playbackRate, repeatCount, waitMode, subSync, sttLang, sttModel]);

  // Init YouTube
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

  const initPlayer = (vId) => {
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
               if (waitModeRef.current === 'Off') {
                  if (activeIdx + 1 < segs.length) {
                      setCurrentSegIdx(activeIdx + 1);
                      seekFn(segs[activeIdx + 1].start + (segs[activeIdx + 1].startOffset || 0) + (subSyncRef.current / 1000));
                      playFn();
                  }
               } else if (waitModeRef.current === 'Manual') {
                  // Stay paused
               } else {
                  const waitPercent = parseInt(waitModeRef.current) / 100;
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

  const handleFetchYouTube = async () => {
    if (!urlInput.trim()) return;
    alert('Tính năng trích xuất phụ đề YouTube đã được chuyển sang chế độ Serverless. Vui lòng cấu hình API Key trong Settings.');
  };

  const handleAddToPlaylist = async () => {
    if (!urlInput.trim()) return;
    alert('Playlist ngầm đã bị vô hiệu hóa trong chế độ Serverless.');
  };

  const loadWorkspaceItem = async (id) => {
    try {
      const items = JSON.parse(localStorage.getItem('omni_shadowing_workspace') || '[]');
      const item = items.find(i => i.id === id);
      if (item) {
        const meta = item.metadata;
        const targetTab = meta.type === 'youtube' ? 'youtube' : 'local';
        
        // Store segments into the correct tab's session
        setSessionStore(prev => ({
          ...prev,
          [targetTab]: {
            segments: item.segments,
            currentSegIdx: 0,
            scores: {}
          }
        }));
        setActiveTab(targetTab);
        
        if (meta.type === 'youtube' && meta.video_id) {
            setVideoId(meta.video_id);
            setTimeout(() => initPlayer(meta.video_id), 500);
        }
      } else {
        alert('Không tìm thấy mục này.');
      }
    } catch(e) { alert('Không thể tải mục này.'); }
  };

  const deleteWorkspaceItem = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      const items = JSON.parse(localStorage.getItem('omni_shadowing_workspace') || '[]');
      const newItems = items.filter(item => item.id !== id);
      localStorage.setItem('omni_shadowing_workspace', JSON.stringify(newItems));
      fetchWorkspaceItems();
    } catch(e) {}
  };

  const handleUploadLocal = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLocalFile(file);
    const url = URL.createObjectURL(file);
    setLocalMediaUrl(url);
    setLocalMediaType(file.type.startsWith('video') ? 'video' : 'audio');
    
    alert('Tính năng tách phụ đề (Transcribe) đã được chuyển sang Serverless. Vui lòng thêm Groq API Key trong Settings.');
  };

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
    } else {
      if (localPlayerRef.current) {
        localPlayerRef.current.currentTime = start;
        localPlayerRef.current.play();
      }
    }
  };

  const togglePlayPause = () => {
    if (activeTab === 'youtube') {
      if (isPlayerReady.current && playerRef.current) {
        if (isPlaying) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
      }
    } else {
      if (localPlayerRef.current) {
        if (isPlaying) localPlayerRef.current.pause();
        else localPlayerRef.current.play();
      }
    }
  };

  const changeRate = (rate) => {
    setPlaybackRate(rate);
    if (activeTab === 'youtube') {
      if(isPlayerReady.current && playerRef.current) playerRef.current.setPlaybackRate(rate);
    } else {
      if(localPlayerRef.current) localPlayerRef.current.playbackRate = rate;
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

  const toggleRecording = (idx, textTarget) => {
    if (listening && recordingIdx === idx) {
      SpeechRecognition.stopListening();
      setRecordingIdx(null);
      const sc = scoreMatch(textTarget, transcript);
      setScores(prev => ({ ...prev, [idx]: sc }));
    } else {
      resetTranscript();
      setRecordingIdx(idx);
      SpeechRecognition.startListening({ continuous: true, language: 'ja-JP' });
    }
  };

  if (!browserSupportsSpeechRecognition) return (
    <div className="glass-panel" style={{ textAlign: 'center', padding: 40 }}>
      <AlertCircle size={40} color="var(--accent-danger)" style={{ marginBottom: 12 }}/>
      <h2>Yêu cầu Google Chrome</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Web Speech API chỉ hoạt động trên Chrome.</p>
    </div>
  );

  const completedCount = currentSegIdx; // roughly
  const progressPercent = segments.length > 0 ? Math.round((completedCount / segments.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '85vh' }}>
      
      {/* TABS */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button 
          className={`btn ${activeTab === 'youtube' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setActiveTab('youtube'); if(reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current); }}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Globe size={16} /> Online YouTube
        </button>
        <button 
          className={`btn ${activeTab === 'local' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setActiveTab('local'); if(reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current); }}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <HardDrive size={16} /> Offline Media (Máy Tính)
        </button>
        <button 
          className={`btn ${activeTab === 'workspace' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setActiveTab('workspace'); if(reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current); }}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <List size={16} /> Playlist & Workspace
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
           {(activeTab === 'youtube' || activeTab === 'local') && segments.length > 0 && (
             <button className="btn btn-outline" onClick={saveCurrentSessionToWorkspace} style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
               <Save size={14}/> Lưu vào Workspace
             </button>
           )}
           <div style={{ display:'flex', alignItems:'center', gap: 10, background:'rgba(0,0,0,0.2)', padding:'4px 10px', borderRadius:8, border:'1px solid var(--glass-border)' }}>
             <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
               <div style={{ width:8, height:8, borderRadius:'50%', background: engineRunning ? '#10b981' : '#ef4444', boxShadow: `0 0 8px ${engineRunning ? '#10b981' : '#ef4444'}` }} />
               <span style={{ fontSize:'0.75rem', color: engineRunning ? '#10b981' : '#ef4444', fontWeight:600 }}>
                 AI {engineRunning ? 'Online' : 'Offline'}
               </span>
             </div>
             <button className={`btn ${engineRunning ? 'btn-outline' : 'btn-primary'}`} onClick={toggleEngine} disabled={engineToggling} style={{ padding:'2px 8px', fontSize:'0.7rem', display:'flex', alignItems:'center', gap:4 }}>
               {engineToggling ? <Loader size={10} className="spin" /> : <Cpu size={10} />}
               {engineRunning ? 'Tắt' : 'Bật'}
             </button>
           </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
          
        {/* INPUT BAR */}
        {activeTab === 'youtube' && (
          <div className="glass-panel" style={{ display: 'flex', gap: 12, padding: 12 }}>
            <input 
              type="text" 
              placeholder="Dán link YouTube tiếng Nhật có phụ đề (CC) vào đây..."
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
            />
            <button className="btn btn-outline" onClick={handleAddToPlaylist} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }} title="Tải ngầm vào Workspace">
              <List size={16} /> Thêm vào Playlist
            </button>
            <button className="btn btn-primary" onClick={handleFetchYouTube} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
              {isFetching ? <Loader size={16} className="spin" /> : <Globe size={16} />} Học Ngay
            </button>
          </div>
        )}
        {activeTab === 'local' && (
          <div className="glass-panel" style={{ display: 'flex', gap: 12, padding: 12, alignItems: 'center', flexWrap: 'wrap' }}>
             <label className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Upload size={16} /> {isFetching ? 'Đang trích xuất Whisper...' : 'Tải lên Video/Audio'}
                <input type="file" accept="video/*,audio/*" onChange={handleUploadLocal} disabled={isFetching} style={{ display: 'none' }} />
             </label>
             <select value={sttLang} onChange={e => setSttLang(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white' }}>
                <option value="auto">🌐 Auto</option>
                <option value="ja">🇯🇵 Tiếng Nhật</option>
                <option value="en">🇺🇸 Tiếng Anh</option>
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="zh">🇨🇳 Tiếng Trung</option>
                <option value="ko">🇰🇷 Tiếng Hàn</option>
             </select>
             <select value={sttModel} onChange={e => setSttModel(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white' }}>
                <option value="base">⚡ Base (nhanh, ~21% lỗi)</option>
                <option value="small">📊 Small (vừa, ~14% lỗi)</option>
                <option value="medium">🎯 Medium (chậm, ~10% lỗi)</option>
             </select>
             <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {localFile ? localFile.name : 'Chưa chọn file (Hỗ trợ MP4, MP3, WAV...)'}
             </span>
             {isFetching && <Loader size={16} className="spin" style={{ color: 'var(--accent-primary)' }} />}
          </div>
        )}

        {activeTab === 'workspace' && (
           <div className="glass-panel" style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Header + Workspace Dir */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                 <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}><HardDrive size={24}/> Playlist & Workspace</h2>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <FolderOpen size={14}/>
                    <span style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workspaceDir || '...'}</span>
                    <button className="btn btn-outline" onClick={changeWorkspaceDir} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Đổi thư mục</button>
                 </div>
              </div>

              {/* Add new item bar */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
                 <input
                   type="text"
                   placeholder="Dán link YouTube vào đây..."
                   value={playlistInput}
                   onChange={e => setPlaylistInput(e.target.value)}
                   onKeyDown={e => { if(e.key === 'Enter') handlePlaylistAddUrl(); }}
                   style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                 />
                 <button className="btn btn-primary" onClick={handlePlaylistAddUrl} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                   <Plus size={16}/> Thêm Link
                 </button>
                 <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                   <Upload size={16}/> Thêm File
                   <input type="file" accept="video/*,audio/*" onChange={handlePlaylistAddFile} style={{ display: 'none' }} />
                 </label>
              </div>

              {/* Items list */}
              {workspaceItems.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                     <List size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                     <p>Chưa có mục nào. Thêm link hoặc file ở trên.</p>
                 </div>
              ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {workspaceItems.map((item, idx) => (
                       <div key={item.id}
                           onDoubleClick={() => item.status === 'completed' && loadWorkspaceItem(item.id)}
                           style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', cursor: item.status === 'completed' ? 'pointer' : 'default', transition: 'background 0.2s' }}
                           onMouseEnter={e => { if(item.status === 'completed') e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
                           onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                       >
                           <div style={{ flex: 1 }}>
                               <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 4 }}>{item.title}</div>
                               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                   <span style={{ textTransform: 'uppercase', background: item.type === 'youtube' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)', padding: '1px 6px', borderRadius: 4 }}>[{item.type}]</span>
                                   <span>{new Date(item.date).toLocaleString()}</span>
                                   <span style={{ color: item.status === 'completed' ? 'var(--accent-success)' : item.status === 'failed' ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                                       {item.status === 'completed' ? '🟢' : item.status === 'processing' ? '🟡' : item.status === 'failed' ? '🔴' : '⚪'} {item.status} {item.progress > 0 && item.progress < 100 ? `(${item.progress}%)` : ''}
                                   </span>
                               </div>
                               {item.status === 'completed' && <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4 }}>Nháy đúp để mở bài học</div>}
                           </div>
                           <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                               {item.status === 'completed' && (
                                   <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); loadWorkspaceItem(item.id); }} style={{ padding: '8px 16px', borderRadius: 8, display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.85rem' }}>
                                       <Play size={16}/> Học ngay
                                   </button>
                               )}
                               {(item.status === 'pending' || item.status === 'failed') && (
                                   <button className="btn btn-outline" style={{ padding: '6px 12px', borderRadius: 8, display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.85rem' }} title="Bóc tách media này">
                                       <Play size={14}/> Bóc tách
                                   </button>
                               )}
                               {item.status === 'processing' && (
                                   <Loader size={20} className="spin" style={{ color: 'var(--accent-warning)' }} />
                               )}
                               <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); deleteWorkspaceItem(item.id); }} style={{ padding: 8, color: 'var(--accent-danger)' }}>
                                   <Trash2 size={18}/>
                               </button>
                           </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        )}

        <div style={{ display: (activeTab === 'youtube' || activeTab === 'local') ? 'flex' : 'none', gap: 16, flex: 1, minHeight: 0 }}>
          {/* LEFT PANE: VIDEO & CONTROLS */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: '45%' }}>
            
            {/* YouTube Player */}
            <div style={{ display: activeTab === 'youtube' && videoId ? 'block' : 'none', position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden', background: '#000', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              <div id="yt-player" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></div>
            </div>
            
            {/* Local Media Player */}
            <div style={{ display: activeTab === 'local' && localMediaUrl ? 'flex' : 'none', position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', minHeight: 250 }}>
               {localMediaType === 'video' ? (
                  <video ref={localPlayerRef} src={localMediaUrl} controls style={{ width: '100%', maxHeight: '50vh' }} onPlay={() => { setIsPlaying(true); if(!reqFrameRef.current) checkSync(); }} onPause={() => setIsPlaying(false)} />
               ) : (
                  <audio ref={localPlayerRef} src={localMediaUrl} controls style={{ width: '80%', marginTop: 20, marginBottom: 20 }} onPlay={() => { setIsPlaying(true); if(!reqFrameRef.current) checkSync(); }} onPause={() => setIsPlaying(false)} />
               )}
            </div>

            {/* Empty states */}
            {activeTab === 'youtube' && !videoId && (
              <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <Video size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p>Bắt đầu bằng cách dán link YouTube</p>
              </div>
            )}
            {activeTab === 'local' && !localMediaUrl && (
              <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>
                <HardDrive size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p>Tải lên File từ máy tính để phân tích bằng AI Whisper.</p>
                <p style={{ fontSize: '0.8rem', marginTop: 10, opacity: 0.7 }}>File của bạn được xử lý hoàn toàn Offline, bảo mật 100%.</p>
              </div>
            )}

            {/* Advanced Controls */}
            {((activeTab === 'youtube' && videoId) || (activeTab === 'local' && segments.length > 0)) && (
                <div className="glass-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
                   
                   {/* Progress */}
                   <div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                           <span>SHADOWING PROGRESS</span>
                           <span>{progressPercent}% ({completedCount}/{segments.length})</span>
                       </div>
                       <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                           <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--accent-primary)', transition: 'width 0.3s' }}></div>
                       </div>
                   </div>

                   {/* Navigation Buttons */}
                   <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '8px 0' }}>
                       <button className="btn-ghost" onClick={() => jumpToSegment(currentSegIdx - 1)} style={{ padding: 10 }} title="Câu trước"><SkipBack size={20}/></button>
                       <button className="btn-primary" onClick={togglePlayPause} style={{ padding: '10px 24px', borderRadius: 24 }}>
                           {isPlaying ? <Pause size={20}/> : <Play size={20}/>}
                       </button>
                       <button className="btn-ghost" onClick={() => jumpToSegment(currentSegIdx)} style={{ padding: 10 }} title="Lặp lại câu này"><Repeat size={20}/></button>
                       <button className="btn-ghost" onClick={() => jumpToSegment(currentSegIdx + 1)} style={{ padding: 10 }} title="Câu tiếp theo"><SkipForward size={20}/></button>
                   </div>

                   {/* Grid Settings */}
                   <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px 16px', alignItems: 'center', fontSize: '0.85rem' }}>
                       
                       <div style={{ color: 'var(--text-secondary)' }}>Speed</div>
                       <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                           {[0.5, 0.75, 1, 1.25, 1.5].map(r => (
                               <button key={r} onClick={() => changeRate(r)} className={`btn ${playbackRate === r ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 8px', fontSize: '0.8rem', flex: 1 }}>{r}x</button>
                           ))}
                       </div>

                       <div style={{ color: 'var(--text-secondary)' }}>Repeat</div>
                       <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                           {[1, 2, 3, 5, 10].map(c => (
                               <button key={c} onClick={() => setRepeatCount(c)} className={`btn ${repeatCount === c ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 8px', fontSize: '0.8rem', flex: 1 }}>{c}</button>
                           ))}
                       </div>

                       <div style={{ color: 'var(--text-secondary)' }}>Wait Mode</div>
                       <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                           {['Off', 'Manual', '50', '80', '100', '120'].map(m => (
                               <button key={m} onClick={() => setWaitMode(m)} className={`btn ${waitMode === m ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 8px', fontSize: '0.8rem', flex: 1 }}>
                                   {m === 'Off' || m === 'Manual' ? m : `+${m}%`}
                               </button>
                           ))}
                       </div>

                       <div style={{ color: 'var(--text-secondary)' }}>Sub Sync</div>
                       <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                           {[-100, 0, 100].map(s => (
                               <button key={s} onClick={() => setSubSync(s)} className={`btn ${subSync === s ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 8px', fontSize: '0.8rem', flex: 1 }}>
                                   {s > 0 ? `+${s}ms` : s === 0 ? '0ms' : `${s}ms`}
                               </button>
                           ))}
                       </div>

                       <div style={{ color: 'var(--text-secondary)' }}>View</div>
                       <div>
                           <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(59,130,246,0.1)', padding: '6px 12px', borderRadius: 8 }}>
                               <input type="checkbox" checked={showVi} onChange={e => setShowVi(e.target.checked)} />
                               <span>Hiện Tiếng Việt</span>
                           </label>
                       </div>

                       <div style={{ color: 'var(--text-secondary)' }}>AI Voice</div>
                       <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                           <select value={ttsVoice} onChange={e => setTtsVoice(e.target.value)} style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}>
                               <option value="ja-JP-NanamiNeural">Nanami (Nữ)</option>
                               <option value="ja-JP-KeitaNeural">Keita (Nam)</option>
                               <option value="ja-JP-AoiNeural">Aoi (Nữ)</option>
                               <option value="ja-JP-DaichiNeural">Daichi (Nam)</option>
                           </select>
                       </div>
                   </div>

                </div>
            )}
          </div>

          {/* RIGHT PANE: TRANSCRIPT */}
          <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!segments.length && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 40 }}>{isFetching ? 'Đang phân tích và dịch...' : 'Chưa có nội dung.'}</div>}
              
              {activeTab === 'local' && segments.length > 0 && !localMediaUrl && (
                  <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', borderRadius: 8, fontSize: '0.9rem', marginBottom: 16 }}>
                      Phiên làm việc trước đã được lưu, nhưng vì lý do bảo mật trình duyệt, bạn cần <b>tải lại file media</b> để tiếp tục phát.
                  </div>
              )}

              {segments.map((seg, idx) => (
                  <React.Fragment key={idx}>
                      <div 
                          style={{
                              padding: '16px',
                              borderRadius: 12,
                              background: currentSegIdx === idx ? 'rgba(59,130,246,0.15)' : 'transparent',
                              border: `1px solid ${currentSegIdx === idx ? 'rgba(59,130,246,0.4)' : 'transparent'}`,
                              transition: 'all 0.3s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 12
                          }}
                      >
                          {/* Top bar: ID, Time, Trim Controls */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                              <div style={{ display: 'flex', gap: 12 }}>
                                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>#{idx + 1}</span>
                                  <span>{Math.floor(seg.start / 60)}:{(Math.floor(seg.start % 60) + '').padStart(2, '0')}</span>
                              </div>
                              
                              {/* Audio Trim Controls (Hover to reveal or always show tiny) */}
                              <div style={{ display: 'flex', gap: 16, opacity: currentSegIdx === idx ? 1 : 0.4, transition: 'opacity 0.2s' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <span>Start</span>
                                      <button className="btn-ghost" style={{ padding: 2 }} onClick={() => updateSegmentOffset(idx, 'startOffset', -0.2)}><Minus size={12}/></button>
                                      <span style={{ width: 30, textAlign: 'center', color: (seg.startOffset||0) !== 0 ? 'var(--accent-warning)' : 'inherit' }}>{(seg.startOffset||0).toFixed(1)}s</span>
                                      <button className="btn-ghost" style={{ padding: 2 }} onClick={() => updateSegmentOffset(idx, 'startOffset', 0.2)}><Plus size={12}/></button>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <span>End</span>
                                      <button className="btn-ghost" style={{ padding: 2 }} onClick={() => updateSegmentOffset(idx, 'endOffset', -0.2)}><Minus size={12}/></button>
                                      <span style={{ width: 30, textAlign: 'center', color: (seg.endOffset||0) !== 0 ? 'var(--accent-warning)' : 'inherit' }}>{(seg.endOffset||0).toFixed(1)}s</span>
                                      <button className="btn-ghost" style={{ padding: 2 }} onClick={() => updateSegmentOffset(idx, 'endOffset', 0.2)}><Plus size={12}/></button>
                                  </div>
                              </div>
                          </div>

                          {/* Text Content */}
                          <div style={{ cursor: 'pointer' }} onClick={() => jumpToSegment(idx)}>
                             <div className="jp-text" style={{ fontSize: '1.25rem', lineHeight: 1.8, color: currentSegIdx === idx ? 'white' : '#cbd5e1' }}>
                                 <FuriganaText text={seg.text} />
                             </div>
                             {showVi && seg.vi && (
                                 <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>
                                     {seg.vi}
                                 </div>
                             )}
                          </div>

                          {/* Recording Controls */}
                          {currentSegIdx === idx && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10, marginTop: 4 }}>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                      <Mic size={14} style={{ verticalAlign: 'middle', marginRight: 4 }}/> Nhại âm
                                  </div>
                                  
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                      {scores[idx] !== undefined && (
                                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: scores[idx] > 80 ? 'var(--accent-success)' : scores[idx] > 50 ? '#f59e0b' : 'var(--accent-danger)' }}>
                                              Điểm: {scores[idx]}%
                                          </span>
                                      )}
                                      <button 
                                          onClick={() => playTTS(seg.text)}
                                          disabled={isTtsPlaying}
                                          style={{ 
                                              padding: '6px 12px', 
                                              borderRadius: 20, 
                                              border: '1px solid var(--glass-border)', 
                                              cursor: isTtsPlaying ? 'not-allowed' : 'pointer',
                                              display: 'flex', alignItems: 'center', gap: 6,
                                              fontWeight: 600,
                                              fontSize: '0.85rem',
                                              background: 'rgba(59,130,246,0.1)',
                                              color: '#60a5fa'
                                          }}
                                      >
                                          {isTtsPlaying ? <Loader size={14} className="spin" /> : <Volume2 size={14}/>} 
                                          Đọc AI
                                      </button>
                                      <button 
                                          onClick={() => toggleRecording(idx, seg.text)}
                                          style={{ 
                                              padding: '6px 12px', 
                                              borderRadius: 20, 
                                              border: 'none', 
                                              cursor: 'pointer',
                                              display: 'flex', alignItems: 'center', gap: 6,
                                              fontWeight: 600,
                                              fontSize: '0.85rem',
                                              background: recordingIdx === idx ? 'var(--accent-danger)' : 'rgba(255,255,255,0.1)',
                                              color: 'white',
                                              animation: recordingIdx === idx ? 'pulse 1.5s infinite' : 'none'
                                          }}
                                      >
                                          {recordingIdx === idx ? <Square size={14}/> : <Mic size={14}/>} 
                                          {recordingIdx === idx ? 'Dừng' : 'Ghi âm'}
                                      </button>
                                  </div>
                              </div>
                          )}

                          {/* Live Transcript Display */}
                          {recordingIdx === idx && (
                              <div className="jp-text" style={{ fontSize: '0.9rem', padding: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 6, color: '#fca5a5' }}>
                                  🎙️ {transcript || 'Đang nghe...'}
                              </div>
                          )}
                      </div>

                      {/* Merge Divider */}
                      {idx < segments.length - 1 && (
                          <div className="merge-divider" style={{ position: 'relative', height: 2, background: 'rgba(255,255,255,0.05)', margin: '4px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }}
                               onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                               onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                               onClick={() => mergeWithNext(idx)}
                               title="Ghép câu này với câu tiếp theo"
                          >
                              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Plus size={14} />
                              </div>
                          </div>
                      )}
                  </React.Fragment>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadowingStudio;

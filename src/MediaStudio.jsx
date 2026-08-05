import React, { useState, useRef, useEffect } from 'react';
import { Film, Upload, Cpu, HardDrive, Search, Scissors, Image, Volume2, VolumeX, Mic, Download, Loader, Play, Pause, Trash2, Send, Settings2, ChevronRight } from 'lucide-react';

const API = 'http://127.0.0.1:8000';

const MediaStudio = () => {
  // Media Bin
  const [files, setFiles] = useState([]);
  const [activeFileIdx, setActiveFileIdx] = useState(-1);
  const [uploading, setUploading] = useState(false);

  // Inspector
  const [transcript, setTranscript] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [sttModel, setSttModel] = useState('base');
  const [sttLang, setSttLang] = useState('auto');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Output
  const [activeOutputTab, setActiveOutputTab] = useState('extract');
  const [processing, setProcessing] = useState(false);
  const [outputFiles, setOutputFiles] = useState([]);
  const [outputStatus, setOutputStatus] = useState('');

  // Voice
  const [voiceEngines, setVoiceEngines] = useState({});
  const [voiceText, setVoiceText] = useState('');
  const [voiceEngine, setVoiceEngine] = useState('edge');
  const [edgeVoice, setEdgeVoice] = useState('ja-JP-NanamiNeural');
  const [voiceResult, setVoiceResult] = useState(null);
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [viRefAudio, setViRefAudio] = useState('');
  const [viRefText, setViRefText] = useState('');

  // Engine Manager
  const [engineRunning, setEngineRunning] = useState(false);
  const [engineToggling, setEngineToggling] = useState(false);

  // Player
  const playerRef = useRef(null);
  const activeFile = files[activeFileIdx] || null;

  useEffect(() => {
    fetch(`${API}/api/voice/status`).then(r=>r.json()).then(d=> setVoiceEngines(d.engines||{})).catch(()=>{});
    
    const checkStatus = () => {
      fetch('/api/system/status-engine').then(r=>r.json()).then(d=>{
        setEngineRunning(d.running);
      }).catch(()=>{});
    };
    checkStatus();
    const intv = setInterval(checkStatus, 3000);
    return () => clearInterval(intv);
  }, []);

  const toggleEngine = async () => {
    setEngineToggling(true);
    try {
      if (engineRunning) {
        await fetch('/api/system/stop-engine');
      } else {
        await fetch('/api/system/start-engine');
      }
      // Đợi 1 chút để server kịp xử lý
      setTimeout(() => setEngineToggling(false), 2000);
    } catch(e) {
      setEngineToggling(false);
    }
  };

  const handleUpload = async (e) => {
    const fileList = Array.from(e.target.files);
    if (!fileList.length) return;
    setUploading(true);
    for (const f of fileList) {
      const fd = new FormData();
      fd.append('file', f);
      try {
        const res = await fetch(`${API}/api/media/upload`, { method:'POST', body: fd });
        const data = await res.json();
        if (data.status === 'success') {
          setFiles(prev => [...prev, { name: f.name, path: data.path, info: data.info, status: 'uploaded', transcript: null }]);
        }
      } catch(err) { console.error(err); }
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleTranscribe = async () => {
    if (!activeFile) return;
    setTranscribing(true);
    setTranscript(null);
    setOutputStatus('Đang phân tích bằng Whisper...');
    try {
      const res = await fetch(`${API}/api/media/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_path: activeFile.path,
          lang: sttLang,
          model_size: sttModel
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTranscript(data.data);
        setFiles(prev => prev.map((f, i) => i === activeFileIdx ? { ...f, transcript: data.data, status: 'analyzed' } : f));
        setOutputStatus(`✅ Phân tích xong (${data.data.segments?.length || 0} đoạn, ngôn ngữ: ${data.data.language})`);
      } else {
        setOutputStatus('❌ Lỗi: ' + (data.detail || 'Unknown error'));
      }
    } catch (err) { setOutputStatus('❌ Lỗi transcribe: ' + err.message); }
    setTranscribing(false);
  };

  const handleExtractClips = async () => {
    if (!activeFile || !searchKeyword.trim() || !transcript) return;
    setProcessing(true);
    setOutputStatus('Đang cắt clips...');
    try {
      const fd = new FormData();
      fd.append('file_path', activeFile.path);
      fd.append('keywords', searchKeyword);
      fd.append('padding', '0.1');
      fd.append('transcript_json', JSON.stringify(transcript));
      const res = await fetch(`${API}/api/media/extract-clips`, { method:'POST', body: fd });
      const data = await res.json();
      setOutputFiles(data.results || []);
      setOutputStatus(`Đã cắt ${(data.results||[]).length} clips`);
    } catch(e) { setOutputStatus('Lỗi: ' + e.message); }
    setProcessing(false);
  };

  const handleCreateMuted = async () => {
    if (!activeFile) return;
    setProcessing(true);
    setOutputStatus('Đang tạo video câm...');
    try {
      const fd = new FormData();
      fd.append('file_path', activeFile.path);
      const res = await fetch(`${API}/api/media/create-muted`, { method:'POST', body: fd });
      const data = await res.json();
      setOutputStatus(`✅ Video câm: ${data.url}`);
      setOutputFiles(prev => [...prev, { type: 'muted', url: data.url, path: data.path }]);
    } catch(e) { setOutputStatus('Lỗi: ' + e.message); }
    setProcessing(false);
  };

  const handleExportSRT = async () => {
    if (!transcript?.segments) return;
    setProcessing(true);
    try {
      const segs = transcript.segments.map(s => ({ text: s.text, start: s.start, duration: (s.end||0) - (s.start||0) }));
      const res = await fetch(`${API}/api/media/export-srt`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ segments: segs })
      });
      const data = await res.json();
      setOutputStatus(`✅ SRT: ${data.url}`);
    } catch(e) { setOutputStatus('Lỗi: ' + e.message); }
    setProcessing(false);
  };

  const handleExtractAudio = async () => {
    if (!activeFile) return;
    setProcessing(true);
    setOutputStatus('Đang trích xuất audio...');
    try {
      const fd = new FormData();
      fd.append('file_path', activeFile.path);
      fd.append('fmt', 'mp3');
      const res = await fetch(`${API}/api/media/extract-audio`, { method:'POST', body: fd });
      const data = await res.json();
      setOutputStatus(`✅ Audio: ${data.url}`);
      setOutputFiles(prev => [...prev, { type: 'audio', url: data.url }]);
    } catch(e) { setOutputStatus('Lỗi: ' + e.message); }
    setProcessing(false);
  };

  const handleEdgeTTS = async () => {
    if (!voiceText.trim()) return;
    setGeneratingVoice(true);
    try {
      const res = await fetch(`${API}/api/voice/edge-tts`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text: voiceText, voice: edgeVoice })
      });
      const data = await res.json();
      setVoiceResult(`${API}${data.url}`);
    } catch(e) { setOutputStatus('Lỗi TTS: ' + e.message); }
    setGeneratingVoice(false);
  };

  const handleSendToShadowing = () => {
    if (!transcript?.segments) return;
    const segments = transcript.segments.map(s => ({
      text: s.text, start: s.start, duration: (s.end||0)-(s.start||0), vi: '', startOffset: 0, endOffset: 0
    }));
    localStorage.setItem('omni_media_to_shadowing', JSON.stringify({ segments, title: activeFile?.name }));
    alert('Đã gửi transcript sang Shadowing! Chuyển sang tab Shadowing để học.');
  };

  const filteredSegments = transcript?.segments?.filter(s =>
    !searchKeyword.trim() || s.text.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    s.words?.some(w => w.word.toLowerCase().includes(searchKeyword.toLowerCase()))
  ) || [];

  const panelStyle = { flex: 1, display:'flex', flexDirection:'column', gap: 12, background:'rgba(255,255,255,0.02)', borderRadius: 16, border:'1px solid rgba(255,255,255,0.06)', padding: 16, minWidth: 0, overflow:'hidden' };
  const btnSm = { padding:'6px 12px', borderRadius: 8, fontSize:'0.8rem', display:'flex', alignItems:'center', gap: 6, whiteSpace:'nowrap' };
  const selectStyle = { padding:'6px 10px', borderRadius:8, background:'rgba(0,0,0,0.3)', border:'1px solid var(--glass-border)', color:'white', fontSize:'0.8rem' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap: 12, height:'85vh' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{ padding:8, background:'linear-gradient(135deg, #8b5cf6, #ec4899)', borderRadius:10, display:'flex' }}>
            <Film size={20} color="white"/>
          </div>
          <div>
            <h2 style={{ fontSize:'1.15rem', margin:0 }}>Media Studio v2.0</h2>
            <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>FFmpeg · Whisper · Edge-TTS · Voice Clone</p>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap: 15 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 10, background:'rgba(0,0,0,0.2)', padding:'6px 12px', borderRadius:8, border:'1px solid var(--glass-border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: engineRunning ? '#10b981' : '#ef4444', boxShadow: `0 0 8px ${engineRunning ? '#10b981' : '#ef4444'}` }} />
              <span style={{ fontSize:'0.8rem', color: engineRunning ? '#10b981' : '#ef4444', fontWeight:600 }}>
                AI {engineRunning ? 'Online' : 'Offline'}
              </span>
            </div>
            <button className={`btn ${engineRunning ? 'btn-outline' : 'btn-primary'}`} onClick={toggleEngine} disabled={engineToggling} style={{ padding:'4px 10px', fontSize:'0.75rem', display:'flex', alignItems:'center', gap:4 }}>
              {engineToggling ? <Loader size={12} className="spin" /> : <Cpu size={12} />}
              {engineRunning ? 'Tắt' : 'Khởi động AI'}
            </button>
          </div>
          {outputStatus && <span style={{ fontSize:'0.8rem', color:'var(--accent-success)', maxWidth:300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{outputStatus}</span>}
        </div>
      </div>

      {/* 3-Panel NLE Layout */}
      <div style={{ display:'flex', gap: 12, flex:1, minHeight:0 }}>

        {/* Panel 1: Media Bin */}
        <div style={panelStyle}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ margin:0, fontSize:'0.95rem', display:'flex', alignItems:'center', gap: 6 }}><HardDrive size={16}/> Media Bin</h3>
            <label className="btn btn-primary" style={{ ...btnSm, cursor:'pointer' }}>
              {uploading ? <Loader size={14} className="spin"/> : <Upload size={14}/>} Tải lên
              <input type="file" accept="video/*,audio/*" multiple onChange={handleUpload} style={{ display:'none' }} disabled={uploading}/>
            </label>
          </div>

          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap: 6 }}>
            {files.length === 0 && <div style={{ textAlign:'center', padding:30, color:'var(--text-tertiary)', fontSize:'0.85rem' }}><Upload size={32} style={{ opacity:0.2, marginBottom:8 }}/><br/>Kéo thả hoặc tải file lên</div>}
            {files.map((f, i) => (
              <div key={i} onClick={() => setActiveFileIdx(i)} style={{
                padding:'10px 12px', borderRadius:10, cursor:'pointer', transition:'all 0.2s',
                background: activeFileIdx === i ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeFileIdx === i ? 'rgba(139,92,246,0.3)' : 'transparent'}`
              }}>
                <div style={{ fontSize:'0.85rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-tertiary)', display:'flex', gap:8, marginTop:2 }}>
                  <span>{f.status === 'analyzed' ? '✅' : '⏳'} {f.status}</span>
                  {f.info?.duration > 0 && <span>{Math.floor(f.info.duration/60)}:{Math.floor(f.info.duration%60).toString().padStart(2,'0')}</span>}
                </div>
              </div>
            ))}
          </div>

          {activeFile && (
            <button className="btn btn-outline" onClick={handleSendToShadowing} disabled={!transcript} style={{ ...btnSm, justifyContent:'center', opacity: transcript ? 1 : 0.4 }}>
              <Send size={14}/> Chuyển sang Shadowing
            </button>
          )}
        </div>

        {/* Panel 2: AI Inspector */}
        <div style={{...panelStyle, flex: 1.3}}>
          <h3 style={{ margin:0, fontSize:'0.95rem', display:'flex', alignItems:'center', gap: 6 }}><Cpu size={16}/> AI Inspector</h3>

          {activeFile ? (
            <>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                <select value={sttLang} onChange={e=>setSttLang(e.target.value)} style={selectStyle}>
                  <option value="auto">🌐 Auto</option>
                  <option value="ja">🇯🇵 Nhật</option>
                  <option value="en">🇺🇸 Anh</option>
                  <option value="vi">🇻🇳 Việt</option>
                  <option value="zh">🇨🇳 Trung</option>
                  <option value="ko">🇰🇷 Hàn</option>
                </select>
                <select value={sttModel} onChange={e=>setSttModel(e.target.value)} style={selectStyle}>
                  <option value="base">⚡ Base</option>
                  <option value="small">📊 Small</option>
                  <option value="medium">🎯 Medium</option>
                </select>
                <button className="btn btn-primary" onClick={handleTranscribe} disabled={transcribing} style={btnSm}>
                  {transcribing ? <Loader size={14} className="spin"/> : <Cpu size={14}/>} {transcribing ? 'Đang phân tích...' : 'Phân tích AI'}
                </button>
              </div>

              <div style={{ display:'flex', gap:6 }}>
                <input type="text" placeholder="Tìm từ khóa..." value={searchKeyword} onChange={e=>setSearchKeyword(e.target.value)}
                  style={{ flex:1, padding:'8px 12px', borderRadius:8, background:'rgba(0,0,0,0.3)', border:'1px solid var(--glass-border)', color:'white', outline:'none', fontSize:'0.85rem' }}/>
                <button className="btn btn-outline" onClick={handleExtractClips} disabled={!searchKeyword.trim() || !transcript || processing} style={btnSm}>
                  <Scissors size={14}/> Cắt
                </button>
              </div>

              <div style={{ flex:1, overflowY:'auto', fontSize:'0.85rem' }}>
                {transcribing && <div style={{ textAlign:'center', padding:20, color:'var(--text-secondary)' }}><Loader size={24} className="spin"/><br/>Đang phân tích bằng Whisper {sttModel}...</div>}
                {!transcript && !transcribing && <div style={{ textAlign:'center', padding:20, color:'var(--text-tertiary)' }}>Bấm "Phân tích AI" để bóc tách nội dung</div>}
                {filteredSegments.map((seg, i) => (
                  <div key={i} style={{ padding:'8px 10px', borderRadius:8, marginBottom:4, background: searchKeyword && seg.text.toLowerCase().includes(searchKeyword.toLowerCase()) ? 'rgba(234,179,8,0.1)' : 'transparent', cursor:'pointer', lineHeight:1.6 }}
                    onClick={() => { if(playerRef.current) playerRef.current.currentTime = seg.start; }}>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-tertiary)', marginRight:8 }}>{Math.floor(seg.start/60)}:{Math.floor(seg.start%60).toString().padStart(2,'0')}</span>
                    {seg.text}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-tertiary)', fontSize:'0.85rem' }}>
              Chọn file từ Media Bin để bắt đầu
            </div>
          )}
        </div>

        {/* Panel 3: Output & Voice Lab */}
        <div style={{...panelStyle, flex: 1.2}}>
          <div style={{ display:'flex', gap:4, marginBottom:4 }}>
            {[['extract','✂️ Cắt & Xuất'],['voice','🎙️ Voice Lab'],['dubbing','🎬 Lồng tiếng']].map(([k,l]) => (
              <button key={k} onClick={()=>setActiveOutputTab(k)} className={`btn ${activeOutputTab===k?'btn-primary':'btn-outline'}`} style={{ ...btnSm, flex:1, justifyContent:'center' }}>{l}</button>
            ))}
          </div>

          {activeOutputTab === 'extract' && (
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10, overflowY:'auto' }}>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                <button className="btn btn-outline" onClick={handleCreateMuted} disabled={!activeFile||processing} style={btnSm}><VolumeX size={14}/> Video câm</button>
                <button className="btn btn-outline" onClick={handleExtractAudio} disabled={!activeFile||processing} style={btnSm}><Volume2 size={14}/> Trích MP3</button>
                <button className="btn btn-outline" onClick={handleExportSRT} disabled={!transcript||processing} style={btnSm}><Download size={14}/> Xuất SRT</button>
              </div>
              {processing && <div style={{ textAlign:'center', padding:12 }}><Loader size={20} className="spin" style={{ color:'var(--accent-primary)' }}/></div>}
              {outputFiles.length > 0 && (
                <div style={{ fontSize:'0.8rem' }}>
                  <div style={{ fontWeight:600, marginBottom:6 }}>Kết quả ({outputFiles.length}):</div>
                  {outputFiles.map((f,i) => (
                    <div key={i} style={{ padding:'6px 10px', background:'rgba(255,255,255,0.03)', borderRadius:6, marginBottom:4, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{f.keyword || f.type || 'file'}</span>
                      {f.url && <a href={`${API}${f.url}`} target="_blank" rel="noreferrer" style={{ color:'var(--accent-primary)', fontSize:'0.75rem' }}>⬇ Tải</a>}
                      {f.clip && <a href={f.clip} target="_blank" rel="noreferrer" style={{ color:'var(--accent-primary)', fontSize:'0.75rem' }}>🎵</a>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeOutputTab === 'voice' && (
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10, overflowY:'auto' }}>
              <div style={{ display:'flex', gap:6, flexWrap: 'wrap' }}>
                {[['edge','⚡ Edge-TTS'],['vizipvoice','🇻🇳 ViZipvoice'],['f5','🧬 F5 Clone'],['cosyvoice','🌐 CosyVoice']].map(([k,l]) => (
                  <button key={k} onClick={()=>setVoiceEngine(k)} className={`btn ${voiceEngine===k?'btn-primary':'btn-outline'}`} style={{ ...btnSm, flex:1, minWidth: '40%', justifyContent:'center', fontSize:'0.75rem' }}>{l}</button>
                ))}
              </div>

              {voiceEngine === 'edge' && (
                <>
                  <select value={edgeVoice} onChange={e=>setEdgeVoice(e.target.value)} style={selectStyle}>
                    <option value="ja-JP-NanamiNeural">🇯🇵 Nanami (Nữ)</option>
                    <option value="ja-JP-KeitaNeural">🇯🇵 Keita (Nam)</option>
                    <option value="en-US-JennyNeural">🇺🇸 Jenny (Nữ)</option>
                    <option value="en-US-GuyNeural">🇺🇸 Guy (Nam)</option>
                    <option value="vi-VN-HoaiMyNeural">🇻🇳 Hoài My (Nữ)</option>
                    <option value="vi-VN-NamMinhNeural">🇻🇳 Nam Minh (Nam)</option>
                    <option value="zh-CN-XiaoxiaoNeural">🇨🇳 Xiaoxiao (Nữ)</option>
                    <option value="ko-KR-SunHiNeural">🇰🇷 Sun-Hi (Nữ)</option>
                  </select>
                  <textarea value={voiceText} onChange={e=>setVoiceText(e.target.value)} placeholder="Nhập text để đọc..." rows={4}
                    style={{ width:'100%', padding:10, borderRadius:8, background:'rgba(0,0,0,0.3)', border:'1px solid var(--glass-border)', color:'white', resize:'vertical', fontSize:'0.85rem', outline:'none' }}/>
                  <button className="btn btn-primary" onClick={handleEdgeTTS} disabled={generatingVoice || !voiceText.trim()} style={{ ...btnSm, justifyContent:'center' }}>
                    {generatingVoice ? <Loader size={14} className="spin"/> : <Play size={14}/>} {generatingVoice ? 'Đang tạo...' : 'Tạo giọng nói'}
                  </button>
                </>
              )}

              {voiceEngine === 'vizipvoice' && (
                <>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mô hình TTS tiếng Việt Zero-shot (Hugging Face)</div>
                  <input type="text" placeholder="URL Audio mẫu (tùy chọn, để trống dùng giọng mặc định)"
                         value={viRefAudio} onChange={e=>setViRefAudio(e.target.value)}
                         style={{ width:'100%', padding:8, borderRadius:6, background:'rgba(0,0,0,0.3)', border:'1px solid var(--glass-border)', color:'white', fontSize:'0.8rem', outline:'none' }}/>
                  <input type="text" placeholder="Transcript Audio mẫu (tùy chọn)"
                         value={viRefText} onChange={e=>setViRefText(e.target.value)}
                         style={{ width:'100%', padding:8, borderRadius:6, background:'rgba(0,0,0,0.3)', border:'1px solid var(--glass-border)', color:'white', fontSize:'0.8rem', outline:'none' }}/>
                  <textarea value={voiceText} onChange={e=>setVoiceText(e.target.value)} placeholder="Nhập văn bản tiếng Việt để đọc..." rows={4}
                    style={{ width:'100%', padding:10, borderRadius:8, background:'rgba(0,0,0,0.3)', border:'1px solid var(--glass-border)', color:'white', resize:'vertical', fontSize:'0.85rem', outline:'none' }}/>
                  <button className="btn btn-primary" onClick={async () => {
                      if (!voiceText.trim()) return;
                      setGeneratingVoice(true);
                      try {
                        const res = await fetch(`${API}/api/voice/clone`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                          body: new URLSearchParams({ 
                              text: voiceText, 
                              engine: 'vizipvoice',
                              ref_audio_url: viRefAudio,
                              ref_text: viRefText
                          })
                        });
                        const data = await res.json();
                        if (data.status === 'success') setVoiceResult(`${API}${data.url}`);
                        else alert('Lỗi: ' + data.detail);
                      } catch(e) { alert('Lỗi gọi API: ' + e.message); }
                      setGeneratingVoice(false);
                  }} disabled={generatingVoice || !voiceText.trim()} style={{ ...btnSm, justifyContent:'center' }}>
                    {generatingVoice ? <Loader size={14} className="spin"/> : <Play size={14}/>} {generatingVoice ? 'Đang tạo...' : 'Tạo giọng nói tiếng Việt'}
                  </button>
                </>
              )}

              {(voiceEngine === 'f5' || voiceEngine === 'cosyvoice') && (
                <div style={{ padding:16, background:'rgba(139,92,246,0.08)', borderRadius:10, fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6 }}>
                  <strong>🧬 {voiceEngine === 'f5' ? 'F5-TTS' : 'CosyVoice'} Voice Clone</strong><br/>
                  Yêu cầu: GPU CUDA 6GB+ VRAM<br/>
                  Cần cài đặt: <code>pip install {voiceEngine === 'f5' ? 'f5-tts' : 'cosyvoice'}</code><br/><br/>
                  {voiceEngines[voiceEngine === 'f5' ? 'f5_tts' : 'cosyvoice']?.available
                    ? <span style={{ color:'var(--accent-success)' }}>✅ Engine sẵn sàng</span>
                    : <span style={{ color:'var(--accent-warning)' }}>⚠️ Chưa cài đặt engine</span>
                  }
                </div>
              )}

              {voiceResult && (
                <div style={{ padding:10, background:'rgba(59,130,246,0.08)', borderRadius:8 }}>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:6 }}>🔊 Kết quả:</div>
                  <audio controls src={voiceResult} style={{ width:'100%' }}/>
                </div>
              )}
            </div>
          )}

          {activeOutputTab === 'dubbing' && (
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10, alignItems:'center', justifyContent:'center', color:'var(--text-tertiary)', fontSize:'0.85rem' }}>
              <Mic size={40} style={{ opacity:0.2 }}/>
              <p style={{ textAlign:'center', lineHeight:1.6 }}>
                <strong>Phòng Thu Lồng Tiếng</strong><br/>
                1. Tạo video câm ở tab "Cắt & Xuất"<br/>
                2. Thu âm bằng mic<br/>
                3. Ghép audio + video câm<br/><br/>
                <em>Sẽ sớm được triển khai đầy đủ ở Phase M4</em>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Player */}
      {activeFile && (
        <div className="glass-panel" style={{ padding:10, flexShrink:0, display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ fontSize:'0.8rem', fontWeight:600, minWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>🎬 {activeFile.name}</div>
          {activeFile.info?.has_video ? (
            <video ref={playerRef} src={activeFile.path} controls style={{ height:60, borderRadius:6 }}/>
          ) : (
            <audio ref={playerRef} src={activeFile.path} controls style={{ flex:1, height:36 }}/>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaStudio;

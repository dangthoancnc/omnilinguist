import React, { useState, useEffect, useRef } from 'react';
import { FolderOpen, FileArchive, Play, Book, Save, RefreshCw, AudioLines, ChevronLeft, ChevronRight, Bookmark, List } from 'lucide-react';
import JSZip from 'jszip';
import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const AnkiSandboxMode = () => {
  const [workspaceHandle, setWorkspaceHandle] = useState(null);
  const [mediaHandle, setMediaHandle] = useState(null);
  const [decks, setDecks] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressLog, setProgressLog] = useState([]);
  
  const [deckData, setDeckData] = useState({ models: null, cards: [] });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progressData, setProgressData] = useState({ bookmarks: [], history: {} });
  const [jumpIndex, setJumpIndex] = useState('');
  const [isJumpMode, setIsJumpMode] = useState(false);
  const [showListMode, setShowListMode] = useState(false);
  const [listFilter, setListFilter] = useState('all');
  const [currentCardIframeHtml, setCurrentCardIframeHtml] = useState('');
  const mediaCache = useRef({});

  const addLog = (msg) => setProgressLog(p => [...p, msg]);

  // Request Directory Access
  const handleSelectWorkspace = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setWorkspaceHandle(dirHandle);
      
      // Get or create media folder
      const mediaDir = await dirHandle.getDirectoryHandle('media', { create: true });
      setMediaHandle(mediaDir);

      addLog(`✅ Đã kết nối Workspace: ${dirHandle.name}`);
      await scanWorkspace(dirHandle);
    } catch (err) {
      if (err.name !== 'AbortError') {
        alert('Lỗi truy cập thư mục: ' + err.message);
      }
    }
  };

  // Scan workspace for existing decks
  const scanWorkspace = async (dirHandle) => {
    try {
      const foundDecks = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('_deck.json')) {
          foundDecks.push(entry.name);
        }
      }
      setDecks(foundDecks);
      if (foundDecks.length > 0) {
        addLog(`Tìm thấy ${foundDecks.length} bài học có sẵn.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Import APKG
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !workspaceHandle) return;

    setIsProcessing(true);
    setProgressLog([]);
    addLog(`Đang giải nén: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);

    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      
      // 1. Read media mapping
      let mediaMap = {};
      if (loadedZip.files['media']) {
        const mediaStr = await loadedZip.files['media'].async('string');
        mediaMap = JSON.parse(mediaStr);
        addLog(`Tìm thấy ${Object.keys(mediaMap).length} file âm thanh/hình ảnh.`);
      }

      // 2. Extract media directly to OPFS
      const mediaKeys = Object.keys(mediaMap);
      let copiedCount = 0;
      for (const key of mediaKeys) {
        if (loadedZip.files[key]) {
          const originalName = mediaMap[key] ? mediaMap[key].normalize('NFC') : null;
          if (!originalName) continue;
          const blob = await loadedZip.files[key].async('blob');
          const newFileHandle = await mediaHandle.getFileHandle(originalName, { create: true });
          const writable = await newFileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          copiedCount++;
          if (copiedCount % 100 === 0) {
             addLog(`Đã giải nén ${copiedCount} / ${mediaKeys.length} media files...`);
          }
        }
      }
      addLog(`✅ Đã lưu ${copiedCount} file Media vào ổ cứng.`);

      // 3. Extract SQLite (Support Anki v2.1 format)
      let dbFileName = null;
      if (loadedZip.files['collection.anki21']) {
        dbFileName = 'collection.anki21';
      } else if (loadedZip.files['collection.anki2']) {
        dbFileName = 'collection.anki2';
      } else {
        throw new Error("Không tìm thấy Database của Anki (collection.anki2 hoặc collection.anki21)");
      }
      
      const sqliteBuffer = await loadedZip.files[dbFileName].async('uint8array');
      
      addLog("Khởi tạo WebAssembly SQLite...");
      const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
      const db = new SQL.Database(sqliteBuffer);

      // Extract Models
      const colRes = db.exec("SELECT models FROM col");
      let models = {};
      if (colRes.length > 0) {
        models = JSON.parse(colRes[0].values[0][0]);
      }

      // Extract cards from cards table joined with notes
      // ORDER BY c.ord ASC ensures all Front->Back cards come before Back->Front cards
      const res = db.exec(`
        SELECT c.id, c.ord, n.mid, n.flds 
        FROM cards c
        JOIN notes n ON c.nid = n.id
        ORDER BY c.ord ASC, c.id ASC
      `);
      const extractedCards = [];
      if (res.length > 0) {
        res[0].values.forEach(r => {
          extractedCards.push({
            id: r[0],
            ord: r[1],
            mid: r[2],
            flds: r[3].split('\x1f')
          });
        });
      }
      
      const deckDataObj = { models, cards: extractedCards };
      
      const deckFileName = file.name.replace(/\.apkg$/i, '') + '_deck.json';
      const deckFileHandle = await workspaceHandle.getFileHandle(deckFileName, { create: true });
      const writable = await deckFileHandle.createWritable();
      await writable.write(JSON.stringify(deckDataObj));
      await writable.close();

      addLog(`✅ Bóc tách thành công ${extractedCards.length} thẻ ghi nhớ!`);
      await scanWorkspace(workspaceHandle);

    } catch (err) {
      console.error(err);
      addLog(`❌ Lỗi: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadDeck = async (deckName) => {
    try {
      const fileHandle = await workspaceHandle.getFileHandle(deckName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        setDeckData({ models: null, cards: data });
      } else {
        setDeckData(data);
      }
      
      // Load progress
      let progress = { bookmarks: [], history: {} };
      try {
        const progressFileName = deckName.replace('_deck.json', '_progress.json');
        const progHandle = await workspaceHandle.getFileHandle(progressFileName);
        const progFile = await progHandle.getFile();
        progress = JSON.parse(await progFile.text());
        if (!progress.bookmarks) progress.bookmarks = [];
        if (!progress.history) progress.history = {};
      } catch(e) {
        // No progress file yet
      }
      setProgressData(progress);

      setCurrentIndex(0);
      setShowAnswer(false);
      setShowListMode(false);
      setActiveDeck(deckName);
    } catch (e) {
      alert("Lỗi đọc file deck!");
    }
  };

  useEffect(() => {
    if (!deckData.cards || deckData.cards.length === 0) return;
    
    const buildHtml = async () => {
       const indices = getFilteredIndices();
       if (indices.length === 0) return;
       const idx = indices.indexOf(currentIndex) !== -1 ? currentIndex : indices[0];
       
       const card = deckData.cards[idx];
       if (!card) return;
       
       const { mid, flds, ord = 0 } = card;
       const model = deckData.models ? deckData.models[mid] : null;

       let html = '';
       if (model && model.tmpls && model.tmpls.length > ord) {
         const tmpl = model.tmpls[ord]; 
         let templateStr = showAnswer ? tmpl.afmt : tmpl.qfmt;
         
         const fieldMap = {};
         if (model.flds) {
           model.flds.forEach(f => fieldMap[f.name] = flds[f.ord] || '');
         }
         
         html = templateStr.replace(/\{\{(?:type|hint|cq|edit):([^}]+)\}\}/g, '{{$1}}');
         for (const [key, val] of Object.entries(fieldMap)) {
            html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
         }
         if (html.includes('{{FrontSide}}')) {
            let front = tmpl.qfmt.replace(/\{\{(?:type|hint|cq|edit):([^}]+)\}\}/g, '{{$1}}');
            for (const [key, val] of Object.entries(fieldMap)) {
              front = front.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
            }
            html = html.replace(/\{\{FrontSide\}\}/g, front);
         }
         html = html.replace(/\{\{.*?\}\}/g, '');
       } else {
         const validFields = flds.filter(f => f && f.trim() !== '');
         html = showAnswer ? validFields.join('<hr style="margin: 24px 0; border: 0; border-top: 1px dashed rgba(255,255,255,0.2)" />') : flds[0];
       }

       // Get Media Blob URL
       const getMediaBlobUrl = async (filename) => {
         const normalizedFilename = filename ? filename.normalize('NFC') : '';
         if (!normalizedFilename || !mediaHandle) return null;
         
         if (mediaCache.current[normalizedFilename]) return mediaCache.current[normalizedFilename];
         try {
           const fileHandle = await mediaHandle.getFileHandle(normalizedFilename);
           const file = await fileHandle.getFile();
           const url = URL.createObjectURL(file);
           mediaCache.current[normalizedFilename] = url;
           return url;
         } catch (e) {
           console.warn("Media not found:", normalizedFilename, e);
           return null;
         }
       };

       // Parse [sound:...] (Audio & Video)
       const soundRegex = /\[sound:(.*?)\]/g;
       let match;
       while ((match = soundRegex.exec(html)) !== null) {
         const filename = match[1];
         const blobUrl = await getMediaBlobUrl(filename);
         if (blobUrl) {
           if (filename.toLowerCase().endsWith('.mp4')) {
             html = html.replace(match[0], `<video controls width="100%" src="${blobUrl}" style="max-height: 400px; border-radius: 8px;"></video>`);
           } else {
             html = html.replace(match[0], `<audio controls autoplay src="${blobUrl}"></audio>`);
           }
         } else {
           html = html.replace(match[0], `<span style="color:#ef4444; font-size: 0.8rem;">[Thiếu Media: ${filename}]</span>`);
         }
       }

       // Parse <img src="...">
       const srcRegex = /src=["'](.*?)["']/g;
       let srcMatch;
       let uniqueSrcs = new Set();
       while ((srcMatch = srcRegex.exec(html)) !== null) {
          const filename = srcMatch[1];
          if (!filename.startsWith('http') && !filename.startsWith('data:') && !filename.startsWith('blob:')) {
             uniqueSrcs.add(filename);
          }
       }
       for (const filename of uniqueSrcs) {
          const blobUrl = await getMediaBlobUrl(filename);
          if (blobUrl) {
             html = html.split(`src="${filename}"`).join(`src="${blobUrl}"`);
             html = html.split(`src='${filename}'`).join(`src='${blobUrl}'`);
          }
       }

       let css = model && model.css ? model.css : '';
       const fontRegex = /url\(['"]?(_.*?\.[a-zA-Z0-9]+)['"]?\)/g;
       let fontMatch;
       let uniqueFonts = new Set();
       while ((fontMatch = fontRegex.exec(css)) !== null) {
          uniqueFonts.add(fontMatch[1]);
       }
       for (const fontName of uniqueFonts) {
          const blobUrl = await getMediaBlobUrl(fontName);
          if (blobUrl) {
             css = css.split(fontName).join(blobUrl);
          }
       }

       const iframeDoc = `
         <!DOCTYPE html>
         <html>
         <head>
           <meta charset="utf-8">
           <style>
             body { 
               margin: 0; padding: 20px; 
               font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
               color: #e2e8f0; 
               text-align: center;
               word-wrap: break-word;
               overflow-x: hidden;
             }
             ${css}
             /* Force transparent bg so it matches our dark theme UI */
             .card { background: transparent !important; color: inherit !important; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
             img { max-width: 100%; height: auto; border-radius: 8px; }
             audio { margin-top: 10px; max-width: 100%; }
           </style>
         </head>
         <body>
           <div class="card">${html}</div>
           <script>
             document.addEventListener('mouseup', function(e) {
                const sel = window.getSelection();
                const text = sel.toString();
                if (text) {
                   const range = sel.getRangeAt(0);
                   const rect = range.getBoundingClientRect();
                   window.parent.postMessage({
                      type: 'IFRAME_TEXT_SELECTION',
                      text: text,
                      x: rect.left + (rect.width / 2),
                      y: rect.bottom
                   }, '*');
                } else {
                   window.parent.postMessage({ type: 'IFRAME_TEXT_SELECTION', text: '' }, '*');
                }
             });
           </script>
         </body>
         </html>
       `;
       setCurrentCardIframeHtml(iframeDoc);
    };
    
    buildHtml();
  }, [currentIndex, showAnswer, deckData, listFilter, mediaHandle]);

  const handleDeleteDeck = async (e, deckName) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc muốn xóa bài học "${deckName.replace('_deck.json', '')}" khỏi máy tính?`)) {
      try {
        await workspaceHandle.removeEntry(deckName);
        if (activeDeck === deckName) setActiveDeck(null);
        await scanWorkspace(workspaceHandle);
      } catch (err) {
        alert("Lỗi khi xóa: " + err.message);
      }
    }
  };

  const saveProgress = async (newProgress) => {
    setProgressData(newProgress);
    if (activeDeck && workspaceHandle) {
       try {
         const progressFileName = activeDeck.replace('_deck.json', '_progress.json');
         const progHandle = await workspaceHandle.getFileHandle(progressFileName, { create: true });
         const writable = await progHandle.createWritable();
         await writable.write(JSON.stringify(newProgress));
         await writable.close();
       } catch (e) {
         console.error("Failed to save progress", e);
       }
    }
  };

  const getFilteredIndices = () => {
    const indices = [];
    for (let i = 0; i < deckData.cards.length; i++) {
      const c = deckData.cards[i];
      const rating = progressData.history[c.id];
      const isBookmark = progressData.bookmarks?.includes(c.id);
      
      let match = true;
      if (listFilter === 'bookmark' && !isBookmark) match = false;
      else if (listFilter === 'new' && rating) match = false;
      else if (listFilter !== 'all' && listFilter !== 'bookmark' && listFilter !== 'new' && rating !== listFilter) match = false;
      
      if (match) indices.push(i);
    }
    return indices;
  };

  const prevCard = () => {
    const indices = getFilteredIndices();
    const pos = indices.indexOf(currentIndex);
    if (pos > 0) {
      setCurrentIndex(indices[pos - 1]);
      setShowAnswer(false);
    }
  };

  const nextCard = () => {
    const indices = getFilteredIndices();
    const pos = indices.indexOf(currentIndex);
    if (pos !== -1 && pos < indices.length - 1) {
      setCurrentIndex(indices[pos + 1]);
      setShowAnswer(false);
    } else {
      alert("Đã hoàn thành danh sách này!");
    }
  };

  const startStudyFiltered = () => {
    const indices = getFilteredIndices();
    if (indices.length > 0) {
      setCurrentIndex(indices[0]);
      setShowListMode(false);
      setShowAnswer(false);
    } else {
      alert("Danh sách này hiện không có thẻ nào!");
    }
  };

  const resetStudyAll = () => {
    setListFilter('all');
    setCurrentIndex(0);
    setShowListMode(false);
    setShowAnswer(false);
  };

  const handleReview = (rating) => {
    const cardId = deckData.cards[currentIndex].id;
    const newHistory = { ...progressData.history, [cardId]: rating };
    saveProgress({ ...progressData, history: newHistory });
    nextCard();
  };

  const toggleBookmark = () => {
    const cardId = deckData.cards[currentIndex].id;
    let newBookmarks = [...(progressData.bookmarks || [])];
    if (newBookmarks.includes(cardId)) {
      newBookmarks = newBookmarks.filter(id => id !== cardId);
    } else {
      newBookmarks.push(cardId);
    }
    saveProgress({ ...progressData, bookmarks: newBookmarks });
  };

  return (
    <div style={{ padding: '20px 40px', maxWidth: 1600, margin: '0 auto', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Book size={32} color="#8b5cf6"/>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Anki Universal Sandbox</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Trình phát Anki siêu tốc 100% Offline lưu trực tiếp trên Ổ cứng (OPFS)</p>
        </div>
      </div>

      {!workspaceHandle ? (
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
          <FolderOpen size={48} color="#3b82f6" style={{ marginBottom: 16 }} />
          <h2>Khởi tạo Workspace</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            Vui lòng chọn một thư mục trên máy tính của bạn (VD: D:\Omni_Sandbox). Toàn bộ dữ liệu bài học, hình ảnh và âm thanh sẽ được lưu an toàn tại đây để bạn có thể học offline vĩnh viễn.
          </p>
          <button className="btn btn-primary" onClick={handleSelectWorkspace} style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
            Chọn Thư Mục Lưu Trữ
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', flex: 1 }}>
          {/* Sidebar */}
          <div style={{ flex: '1 1 250px', maxWidth: 350, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#10b981' }}>
                <Save size={18}/>
                <span style={{ fontWeight: 600 }}>Workspace Đã Kết Nối</span>
              </div>
              <div style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, wordBreak: 'break-all' }}>
                {workspaceHandle.name}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 20, flex: 1 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Danh sách Bài học</h3>
              {decks.length === 0 ? (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Chưa có bài học nào.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {decks.map(d => (
                    <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button 
                        onClick={() => loadDeck(d)}
                        style={{ 
                          flex: 1,
                          padding: '10px 12px', 
                          background: activeDeck === d ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', 
                          border: 'none', 
                          borderRadius: 6, 
                          color: 'white', 
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={d.replace('_deck.json', '')}
                      >
                        📚 {d.replace('_deck.json', '')}
                      </button>
                      <button 
                        onClick={(e) => handleDeleteDeck(e, d)}
                        style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', flexShrink: 0 }}
                        title="Xóa bài học"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <hr style={{ borderColor: 'var(--glass-border)', margin: '20px 0' }}/>
              
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 16, border: '1px dashed var(--accent-primary)', borderRadius: 8, cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.5 : 1 }}>
                <FileArchive size={24} color="var(--accent-primary)"/>
                <span style={{ fontSize: '0.9rem', textAlign: 'center' }}>+ Nạp file .apkg mới</span>
                <input type="file" accept=".apkg" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isProcessing}/>
              </label>
            </div>
          </div>

          {/* Main Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isProcessing && (
              <div className="glass-panel" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 12px 0' }}><RefreshCw className="spin" size={18} style={{ marginRight: 8, display: 'inline-block' }}/> Đang xử lý...</h3>
                <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: '0.85rem', color: '#a78bfa', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {progressLog.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              </div>
            )}

            {!isProcessing && activeDeck && deckData.cards.length > 0 && (() => {
              const indices = getFilteredIndices();
              const relativePos = indices.indexOf(currentIndex);
              const isPrevDisabled = relativePos <= 0;
              const isNextDisabled = relativePos === -1 || relativePos >= indices.length - 1;
              const displayIndex = relativePos !== -1 ? relativePos + 1 : '?';
              const totalIndex = indices.length;

              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', flex: '1 1 600px', gap: 16, alignItems: 'flex-start', height: '100%' }}>
                  {/* MAIN CARD VIEW */}
                  <div className="glass-panel" style={{ padding: '20px 30px', flex: '1 1 400px', minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflowY: 'auto' }}>
                    {/* Navigation Toolbar */}
                    <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 20, background: 'rgba(0,0,0,0.2)', padding: '12px 20px', borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={prevCard} disabled={isPrevDisabled} className="btn btn-secondary" style={{ padding: 6, borderRadius: '50%', opacity: isPrevDisabled ? 0.3 : 1 }}>
                          <ChevronLeft size={20}/>
                        </button>
                        
                        {isJumpMode ? (
                           <input 
                             autoFocus
                             type="number"
                             min="1"
                             max={totalIndex}
                             value={jumpIndex}
                             onChange={e => setJumpIndex(e.target.value)}
                             onBlur={() => setIsJumpMode(false)}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                 const idx = parseInt(jumpIndex) - 1;
                                 if (idx >= 0 && idx < totalIndex) {
                                   setCurrentIndex(indices[idx]);
                                   setShowAnswer(false);
                                 }
                                 setIsJumpMode(false);
                               }
                             }}
                             style={{ width: 60, textAlign: 'center', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: 6, padding: '4px' }}
                           />
                        ) : (
                           <span 
                             onClick={() => { setIsJumpMode(true); setJumpIndex(displayIndex !== '?' ? displayIndex : 1); }} 
                             style={{ fontSize: '0.9rem', cursor: 'pointer', padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', fontWeight: 500 }}
                             title="Bấm để nhảy tới thẻ số X trong danh sách"
                           >
                             {displayIndex} / {totalIndex}
                           </span>
                        )}

                        <button onClick={nextCard} disabled={isNextDisabled} className="btn btn-secondary" style={{ padding: 6, borderRadius: '50%', opacity: isNextDisabled ? 0.3 : 1 }}>
                          <ChevronRight size={20}/>
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {listFilter !== 'all' && (
                          <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#3b82f6', color: 'white', borderRadius: 4, marginRight: 8 }}>
                            Đang lọc: {listFilter}
                          </span>
                        )}
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                          {progressData.history[deckData.cards[currentIndex]?.id] ? 
                            `Đánh giá: ${progressData.history[deckData.cards[currentIndex]?.id]}` : 'Chưa học'}
                        </span>
                        <button 
                          onClick={() => setShowListMode(!showListMode)}
                          className="btn btn-secondary" 
                          style={{ padding: 8, borderRadius: '50%', color: showListMode ? '#3b82f6' : 'var(--text-secondary)' }}
                          title="Bật/Tắt danh sách thẻ"
                        >
                          <List size={18}/>
                        </button>
                        <button 
                          onClick={toggleBookmark}
                          className="btn btn-secondary" 
                          style={{ padding: 8, borderRadius: '50%', color: progressData.bookmarks.includes(deckData.cards[currentIndex]?.id) ? '#fbbf24' : 'var(--text-secondary)' }}
                          title="Lưu Bookmark"
                        >
                          <Bookmark size={18} fill={progressData.bookmarks.includes(deckData.cards[currentIndex]?.id) ? '#fbbf24' : 'none'}/>
                        </button>
                      </div>
                    </div>

                    <div style={{ 
                        width: '100%', 
                        minHeight: 350,
                        maxHeight: '55vh',
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid var(--glass-border)', 
                        borderRadius: 16, 
                        display: 'flex', 
                        flexDirection: 'column',
                        marginBottom: 20,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                      }}
                    >
                      <iframe 
                        srcDoc={currentCardIframeHtml}
                        style={{ width: '100%', flex: 1, border: 'none', background: 'transparent' }}
                        title="Anki Card View"
                      />
                    </div>

                    {!showAnswer && (
                      <div style={{ display: 'flex', width: '100%', marginTop: 10 }}>
                        <button onClick={() => setShowAnswer(true)} className="btn btn-primary" style={{ flex: 1, padding: 16, fontSize: '1.1rem', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                          <RefreshCw size={20} /> Lật thẻ (Hiển thị đáp án)
                        </button>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: showAnswer ? 20 : 10, opacity: showAnswer ? 1 : 0.4, pointerEvents: showAnswer ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                      <button onClick={() => handleReview('Lại (Again)')} className="btn" style={{ flex: 1, padding: 16, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '1rem', fontWeight: 'bold' }}>Lại</button>
                      <button onClick={() => handleReview('Khó (Hard)')} className="btn" style={{ flex: 1, padding: 16, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '1rem', fontWeight: 'bold' }}>Khó</button>
                      <button onClick={() => handleReview('Tốt (Good)')} className="btn" style={{ flex: 1, padding: 16, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '1rem', fontWeight: 'bold' }}>Tốt</button>
                      <button onClick={() => handleReview('Dễ (Easy)')} className="btn" style={{ flex: 1, padding: 16, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '1rem', fontWeight: 'bold' }}>Dễ</button>
                    </div>
                  </div>

                  {/* SIDE PANEL CARD LIST */}
                  {showListMode && (
                    <div className="glass-panel" style={{ flex: '1 1 300px', maxWidth: 400, minWidth: 280, padding: 20, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <List size={20}/> Danh sách thẻ
                      </h3>
                      
                      <select 
                        value={listFilter} 
                        onChange={e => { setListFilter(e.target.value); setCurrentIndex(getFilteredIndices()[0] || 0); }}
                        style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', padding: '10px 12px', borderRadius: 8, fontSize: '0.9rem', marginBottom: 16, width: '100%', outline: 'none' }}
                      >
                        <option value="all">Tất cả ({deckData.cards.length})</option>
                        <option value="bookmark">Bookmarks ({progressData.bookmarks?.length || 0})</option>
                        <option value="Lại (Again)">Lại (Again)</option>
                        <option value="Khó (Hard)">Khó (Hard)</option>
                        <option value="Tốt (Good)">Tốt (Good)</option>
                        <option value="Dễ (Easy)">Dễ (Easy)</option>
                        <option value="new">Chưa học</option>
                      </select>
                      
                      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 6 }}>
                        {indices.map((i) => {
                          const c = deckData.cards[i];
                          const rating = progressData.history[c.id];
                          const isBookmark = progressData.bookmarks?.includes(c.id);

                          return (
                              <div 
                                key={c.id} 
                                onClick={() => { setCurrentIndex(i); setShowAnswer(false); }}
                                style={{ padding: '12px', background: currentIndex === i ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)', border: currentIndex === i ? '1px solid #3b82f6' : '1px solid transparent', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                              >
                                <div style={{ width: 30, color: currentIndex === i ? '#3b82f6' : 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 'bold' }}>#{i + 1}</div>
                                <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: currentIndex === i ? 'white' : '#cbd5e1', fontSize: '0.9rem' }}>
                                  {(() => {
                                      for (let f of c.flds) {
                                        if (!f) continue;
                                        let text = f.replace(/<[^>]*>?/gm, '').replace(/\[sound:(.*?)\]/g, '').trim();
                                        if (text.length > 0) return text.substring(0, 60);
                                      }
                                      return 'Thẻ Media';
                                  })()}
                                </div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  {isBookmark && <Bookmark size={14} fill="#fbbf24" color="#fbbf24"/>}
                                  {rating && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 10, color: '#94a3b8' }}>{rating}</span>}
                                </div>
                              </div>
                          )
                        })}
                        {indices.length === 0 && (
                           <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Không có thẻ nào trong mục lọc này.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {!isProcessing && !activeDeck && (
               <div className="glass-panel" style={{ padding: 40, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                 Hãy chọn một bài học bên trái hoặc nạp file .apkg mới để bắt đầu.
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnkiSandboxMode;

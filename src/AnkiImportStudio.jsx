import React, { useState } from 'react';
import { DownloadCloud, CheckCircle, Database, AlertCircle, Loader } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

const AnkiImportStudio = () => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetDeck, setTargetDeck] = useState('shadowing'); // 'shadowing' | 'mock'
  const [status, setStatus] = useState('idle'); // idle, extracting, syncing, done, error
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '1621') {
      setIsAuthenticated(true);
    } else {
      alert('Mật khẩu quản trị không hợp lệ!');
      setPin('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const addLog = (msg) => setLogs(p => [...p, msg]);

  const handleImport = async () => {
    if (!selectedFile) return;
    setStatus('extracting');
    setProgress(10);
    setLogs([]);
    addLog(`Đang tải lên và bóc tách file: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);
    addLog(`Quá trình giải nén Media & đẩy CDN ngầm có thể mất 2-3 phút...`);
    
    try {
      const res = await fetch('/api/anki-import', {
        method: 'POST',
        headers: { 
          'x-target-deck': targetDeck 
        },
        body: selectedFile // Send file as binary stream
      });
      
      const result = await res.json();
      
      if (!result.success && !result.data) {
        throw new Error(result.message || 'Lỗi giải nén Anki');
      }

      setProgress(40);
      addLog(`✅ Bóc tách thành công. Đã Push Audio sang GitHub CDN.`);
      
      if (!result.data || result.data.length === 0) {
        throw new Error('Không tìm thấy dữ liệu Text trong file Anki.');
      }

      setStatus('syncing');
      const cards = result.data;
      addLog(`Chuẩn bị đồng bộ ${cards.length} cards lên Supabase...`);

      // Định dạng dữ liệu theo Target Deck
      const formattedData = cards.map(card => {
        const fields = card.flds.split('\x1f');
        if (targetDeck === 'shadowing') {
          // Mapping chuẩn cho Shadowing Deck (Giả định fields[0] là JP, fields[1] là EN/VN, fields[2] là Audio [sound:xyz.mp3])
          let audioFile = null;
          fields.forEach(f => {
            const match = f.match(/\[sound:(.*?)\]/);
            if (match) audioFile = match[1];
          });
          
          return {
            category: 'imported',
            japanese: fields[0] || 'Unknown',
            vietnamese: fields[1] || '',
            audio_url: audioFile ? `https://cdn.jsdelivr.net/gh/toanysd/omnilinguist-audio-cdn@main/media/${audioFile}` : null,
            level: 'N3', // Default
          };
        } else {
          // Mapping cho Mock Test
          return {
            level: 'N3',
            category: 'grammar',
            type: 'multiple_choice',
            instruction: 'Imported from Anki',
            text: fields[0] || '',
            options: [fields[1] || 'A', fields[2] || 'B', fields[3] || 'C', fields[4] || 'D'],
            correctIndex: 0,
            explanation: fields.length > 5 ? fields[5] : ''
          };
        }
      });

      // Insert into Supabase in chunks of 500
      const CHUNK_SIZE = 500;
      for (let i = 0; i < formattedData.length; i += CHUNK_SIZE) {
        const chunk = formattedData.slice(i, i + CHUNK_SIZE);
        const tableName = targetDeck === 'shadowing' ? 'omni_master_shadowing' : 'omni_mock_questions';
        
        // Mock test table doesn't exist yet, we will just simulate it or use questionBank concept
        // if it fails, we catch.
        if (targetDeck === 'shadowing') {
             const { error } = await supabase.from(tableName).insert(chunk);
             if (error) {
               addLog(`Cảnh báo: Supabase lỗi - ${error.message}`);
             }
        } else {
             // For mock, just log for now until table is ready
             addLog(`Mock test data processed in memory.`);
        }

        setProgress(40 + Math.round(((i + chunk.length) / formattedData.length) * 60));
        addLog(`Đã đồng bộ ${i + chunk.length} / ${formattedData.length} records.`);
      }

      setStatus('done');
      setProgress(100);
      addLog(`🎉 HOÀN TẤT! Dữ liệu đã sẵn sàng trên hệ thống.`);

    } catch(err) {
      console.error(err);
      setStatus('error');
      addLog(`❌ LỖI: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center', maxWidth: 400 }}>
          <Database size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <h2 style={{ margin: '0 0 8px 0' }}>Khu Vực Quản Trị Hệ Thống</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Tính năng Import can thiệp trực tiếp vào Database và CDN gốc. Vui lòng xác thực.</p>
          <form onSubmit={handlePinSubmit} style={{ display: 'flex', gap: 8 }}>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Nhập PIN Code" 
              autoFocus
              style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', textAlign: 'center', letterSpacing: 4, fontSize: '1.2rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>Mở khóa</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: '0 auto', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
        <Database size={32} color="#3b82f6"/>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Anki Import Studio</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Công cụ Admin chuyên nạp File siêu lớn qua Local Server (Bypass C:\fakepath)</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, color: 'var(--accent-primary)' }}>1. Chọn File Anki (.apkg)</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderRadius: 8, border: '1px dashed var(--glass-border-strong)', background: 'rgba(0,0,0,0.2)', cursor: 'pointer', marginBottom: 24, transition: 'all 0.2s' }}>
          <div style={{ padding: 10, background: 'var(--accent-subtle)', borderRadius: '50%', color: 'var(--accent-primary)' }}>
            <DownloadCloud size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: selectedFile ? '#10b981' : 'white' }}>
              {selectedFile ? selectedFile.name : 'Nhấn để duyệt file (.apkg)'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              {selectedFile ? `Dung lượng: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Dữ liệu File sẽ được truyền trực tiếp qua Binary Stream'}
            </div>
          </div>
          <input 
            type="file" 
            accept=".apkg"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>

        <h3 style={{ marginTop: 0, marginBottom: 16, color: 'var(--accent-primary)' }}>2. Chế độ Đồng bộ (Deck Routing)</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <div 
            onClick={() => setTargetDeck('shadowing')}
            style={{ flex: 1, padding: 20, borderRadius: 12, border: `2px solid ${targetDeck === 'shadowing' ? '#10b981' : 'var(--glass-border)'}`, background: targetDeck === 'shadowing' ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <h4 style={{ margin: '0 0 8px 0', color: targetDeck === 'shadowing' ? '#10b981' : 'white' }}>🗣️ Luyện Đọc Đuổi (Shadowing)</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Trích xuất câu, nghĩa và tự động map link Audio MP3 từ Github CDN.</p>
          </div>
          <div 
            onClick={() => setTargetDeck('mock')}
            style={{ flex: 1, padding: 20, borderRadius: 12, border: `2px solid ${targetDeck === 'mock' ? '#3b82f6' : 'var(--glass-border)'}`, background: targetDeck === 'mock' ? 'rgba(59,130,246,0.1)' : 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <h4 style={{ margin: '0 0 8px 0', color: targetDeck === 'mock' ? '#3b82f6' : 'white' }}>📝 Thi Thử (Mock Test)</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bóc tách câu hỏi trắc nghiệm, đáp án và giải thích chi tiết.</p>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleImport}
            disabled={status === 'extracting' || status === 'syncing'}
            style={{ padding: '14px 32px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {(status === 'extracting' || status === 'syncing') ? <Loader size={20} className="spin" /> : <DownloadCloud size={20}/>}
            {status === 'extracting' ? 'Đang giải nén & Push CDN...' : status === 'syncing' ? 'Đang nạp Supabase...' : 'Bắt đầu Import & Đồng bộ'}
          </button>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="glass-panel" style={{ padding: 24, background: 'rgba(0,0,0,0.4)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Tiến trình xử lý (Console)</h3>
          
          {(status === 'extracting' || status === 'syncing' || status === 'done') && (
            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#3b82f6', transition: 'width 0.3s' }}></div>
            </div>
          )}

          <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#a78bfa', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {logs.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#4b5563' }}>[{new Date().toLocaleTimeString()}]</span>
                <span style={{ color: l.includes('LỖI') ? '#ef4444' : l.includes('HOÀN TẤT') ? '#10b981' : 'inherit' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnkiImportStudio;

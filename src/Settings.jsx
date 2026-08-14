import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Save, CheckCircle, Info, FolderOpen, FolderCheck, RefreshCw } from 'lucide-react';
import { getStorageKey } from './identityManager';
import { saveAnkiWorkspaceHandle, getAnkiWorkspaceHandle, DEFAULT_ANKI_FOLDER } from './ankiStore';

const Settings = () => {
  const [keys, setKeys] = useState({
    groqApiKey: '',
    openaiApiKey: '',
    googleApiKey: ''
  });
  const [ankiFolder, setAnkiFolder] = useState(DEFAULT_ANKI_FOLDER);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Tải key từ localStorage
    const savedKeys = localStorage.getItem(getStorageKey('settings'));
    if (savedKeys) {
      try {
        setKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error("Lỗi khi đọc API keys", e);
      }
    }

    // Tải thông tin thư mục Anki mặc định
    getAnkiWorkspaceHandle().then(res => {
      if (res && res.path) {
        setAnkiFolder(res.path);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setKeys(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(getStorageKey('settings'), JSON.stringify(keys));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSelectAnkiFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await saveAnkiWorkspaceHandle(dirHandle, dirHandle.name);
      setAnkiFolder(dirHandle.name);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (err.name !== 'AbortError') {
        alert('Lỗi chọn thư mục: ' + err.message);
      }
    }
  };

  const handleResetDefaultAnkiFolder = () => {
    localStorage.setItem('omni_anki_workspace_name', DEFAULT_ANKI_FOLDER);
    setAnkiFolder(DEFAULT_ANKI_FOLDER);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <SettingsIcon className="view-icon" />
          <h1>Cài đặt Hệ thống</h1>
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 800 }}>
        {/* Cấu hình AI API Keys */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 24, border: '1px solid var(--glass-border)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
            <Key size={20} color="var(--accent-primary)" />
            Cấu hình AI (API Keys)
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
            Omnilinguist hoạt động hoàn toàn trên trình duyệt của bạn (Serverless). Để sử dụng các tính năng phân tích âm thanh, dịch thuật AI, bạn cần cung cấp API Key của riêng mình. Chìa khóa này được <b>lưu trữ an toàn 100% trên máy tính của bạn</b> (localStorage) và không bao giờ được gửi lên bất kỳ máy chủ nào khác ngoài nhà cung cấp AI.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Groq API Key */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
                Groq API Key (Miễn phí & Cực nhanh cho Whisper STT)
              </label>
              <input 
                type="password"
                name="groqApiKey"
                value={keys.groqApiKey}
                onChange={handleChange}
                placeholder="gsk_..."
                className="base-input"
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                Lấy Key miễn phí tại: <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>console.groq.com</a>
              </div>
            </div>

            {/* OpenAI API Key */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
                OpenAI API Key (Tùy chọn - Dùng cho ChatGPT & Whisper)
              </label>
              <input 
                type="password"
                name="openaiApiKey"
                value={keys.openaiApiKey}
                onChange={handleChange}
                placeholder="sk-..."
                className="base-input"
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
            </div>

            {/* Google Gemini API Key */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
                Google Gemini API Key (Tùy chọn - Dùng dịch thuật nâng cao)
              </label>
              <input 
                type="password"
                name="googleApiKey"
                value={keys.googleApiKey}
                onChange={handleChange}
                placeholder="AIzaSy..."
                className="base-input"
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                Lấy Key miễn phí tại: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>aistudio.google.com</a>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} /> Lưu Cài Đặt
              </button>
              {saved && (
                <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.9rem', fontWeight: 500 }}>
                  <CheckCircle size={16} /> Đã lưu thành công
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cấu hình Anki Sandbox Workspace Folder */}
        <div style={{ marginTop: 24, background: 'var(--bg-secondary)', borderRadius: 12, padding: 24, border: '1px solid var(--glass-border)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
            <FolderOpen size={20} color="#8b5cf6" />
            Cấu hình Anki Local Sandbox Workspace
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
            Trình phát Anki Sandbox sẽ tự động ghi nhớ và khôi phục kết nối đến thư mục bài học mặc định của bạn khi vào học.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
                Thư mục Workspace Mặc Định Hiện Tại:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                <FolderCheck size={18} color="#10b981" />
                <span style={{ fontFamily: 'monospace', fontSize: '0.92rem', color: '#60a5fa', flex: 1, wordBreak: 'break-all' }}>
                  {ankiFolder || DEFAULT_ANKI_FOLDER}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <button 
                className="btn btn-primary" 
                onClick={handleSelectAnkiFolder}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: '0.9rem' }}
              >
                <FolderOpen size={16} /> Chọn / Đổi Thư Mục Tùy Chọn
              </button>

              <button 
                className="btn btn-outline" 
                onClick={handleResetDefaultAnkiFolder}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: '0.9rem' }}
              >
                <RefreshCw size={16} /> Đặt Lại Thư Mục Mặc Định ({DEFAULT_ANKI_FOLDER})
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: 16, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Info size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Lưu ý:</strong> Thư mục Anki mặc định là <code>apps\omnilinguist\anki_universal_sandbox</code> trên ổ cứng. Toàn bộ file bài học <code>.json</code>, hình ảnh và âm thanh bóc tách từ file Anki <code>.apkg</code> sẽ được tự động lưu trữ và giữ nguyên cho những lần học sau.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

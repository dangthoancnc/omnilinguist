import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Save, CheckCircle, Info } from 'lucide-react';

const Settings = () => {
  const [keys, setKeys] = useState({
    groqApiKey: '',
    openaiApiKey: '',
    googleApiKey: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Tải key từ localStorage
    const savedKeys = localStorage.getItem('omni_api_keys');
    if (savedKeys) {
      try {
        setKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error("Lỗi khi đọc API keys", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setKeys(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('omni_api_keys', JSON.stringify(keys));
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

        <div style={{ marginTop: 24, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: 16, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Info size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Lưu ý:</strong> Khi bạn đã nhập <b>Groq API Key</b>, hệ thống <b>Media Studio</b> và <b>Shadowing</b> sẽ tự động chuyển sang dùng AI qua Cloud thay vì bắt buộc phải khởi động hệ thống AI Backend nội bộ. Điều này giúp ứng dụng siêu nhẹ và có thể chạy trực tuyến từ mọi nơi.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

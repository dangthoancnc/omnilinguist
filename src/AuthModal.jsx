import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { Mail, Lock, BookOpen, Loader } from 'lucide-react';

const AuthModal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Hiển thị thông báo yêu cầu xác nhận email nếu cần
        setError('Đăng ký thành công! Đang tự động đăng nhập...');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="glass-panel-solid" style={{ width: '100%', maxWidth: 400, padding: 32, animation: 'fadeIn 0.3s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', padding: 12, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 16, marginBottom: 16 }}>
            <BookOpen size={32} color="white"/>
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>OmniLinguist</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Hệ thống Tự học Tiếng Nhật Toàn diện
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '10px 14px', background: error.includes('thành công') ? 'rgba(16,185,129,0.15)' : 'rgba(239, 68, 68, 0.15)', color: error.includes('thành công') ? '#6ee7b7' : '#fca5a5', borderRadius: 8, fontSize: '0.85rem', border: `1px solid ${error.includes('thành công') ? 'rgba(16,185,129,0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
              {error}
            </div>
          )}
          
          <div>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}/>
              <input 
                type="email" 
                placeholder="Email của bạn"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 14px 12px 42px', borderRadius: 8,
                  background: 'var(--bg-hover)', border: '1px solid var(--glass-border-strong)',
                  color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}/>
              <input 
                type="password" 
                placeholder="Mật khẩu (từ 6 ký tự)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%', padding: '12px 14px 12px 42px', borderRadius: 8,
                  background: 'var(--bg-hover)', border: '1px solid var(--glass-border-strong)',
                  color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px', fontSize: '1rem', marginTop: 8 }}>
            {loading ? <Loader size={18} className="spin"/> : (isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản')}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <span 
            onClick={() => { setIsLogin(!isLogin); setError(null); }} 
            style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

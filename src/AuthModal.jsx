import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { X, LogIn, UserPlus, AlertCircle, CheckCircle, Lock, Mail } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp({ email, password });
        setSuccessMsg('Đăng ký thành công! Dữ liệu học vãng lai đã được chuyển sang tài khoản của bạn.');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        await signIn({ email, password });
        setSuccessMsg('Đăng nhập thành công!');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 20
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: 440, padding: 32, borderRadius: 16,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute', top: 16, right: 16, background: 'transparent',
            border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', padding: 12, borderRadius: '50%',
            background: isSignUp ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
            color: isSignUp ? '#34d399' : '#60a5fa', marginBottom: 12
          }}>
            {isSignUp ? <UserPlus size={28} /> : <LogIn size={28} />}
          </div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', color: 'white' }}>
            {isSignUp ? 'Tạo Tài Khoản Mới' : 'Đăng Nhập Tài Khoản'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isSignUp 
              ? 'Tự động đồng bộ toàn bộ tiến độ học từ chế độ Khách'
              : 'Đăng nhập để tiếp tục lộ trình SRS và đồng bộ Cloud'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5',
            fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7',
            fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Email
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
              <Mail size={16} color="var(--text-tertiary)" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem', width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Mật khẩu
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
              <Lock size={16} color="var(--text-tertiary)" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem', width: '100%' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '12px', fontSize: '1rem', marginTop: 8,
              opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Đang xử lý...' : (isSignUp ? '✨ Tạo Tài Khoản & Đồng Bộ' : '🔑 Đăng Nhập')}
          </button>
        </form>

        {/* Switch Mode Toggle */}
        <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--glass-border)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
          {' '}
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); setSuccessMsg(null); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSignUp ? 'Đăng nhập ngay' : 'Đăng ký tài khoản mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

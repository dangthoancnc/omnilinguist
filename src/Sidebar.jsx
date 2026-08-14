// v10.0.0 - Drawer Sidebar with Theme Toggle
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Mic, Volume2, BookA, BookOpen, Search, PencilLine, Settings, Film, ListChecks, Sun, Moon, X, ChevronLeft, LogOut, User, Database, Play, Newspaper } from 'lucide-react';
import { useAuth } from './AuthContext';
import { supabase } from './lib/supabaseClient';

const SECTIONS = [
  {
    label: '学習ツール',
    items: [
      { jp:'ホーム', sub:'Dashboard', icon:<LayoutDashboard size={17}/>, path:'/', end:true },
      { jp:'学習ロードマップ', sub:'Lộ trình Học', icon:<Map size={17}/>, path:'/roadmap' },
    ]
  },
  {
    label: 'インプット',
    items: [
      { jp:'ニュース Hub', sub:'Tin tức & Đời sống Nhật', icon:<Newspaper size={17}/>, path:'/news' },
      { jp:'多読 (Immersion)', sub:'Tắm ngôn ngữ', icon:<BookOpen size={17}/>, path:'/reading' },
      { jp:'シャドーイング', sub:'Shadowing', icon:<Volume2 size={17}/>, path:'/shadowing' },
    ]
  },
  {
    label: 'トレーニング',
    items: [
      { jp:'単語カード', sub:'Flashcards FSRS', icon:<BookA size={17}/>, path:'/flashcards' },
      { jp:'漢字練習', sub:'Luyện viết Kanji', icon:<PencilLine size={17}/>, path:'/kanji' },
      { jp:'文法検索', sub:'Tra cứu Ngữ pháp', icon:<BookOpen size={17}/>, path:'/grammar' },
      { jp:'辞書', sub:'Từ điển Thông minh', icon:<Search size={17}/>, path:'/dictionary' },
    ]
  },
  {
    label: 'アウトプット',
    items: [
      { jp:'ライティング', sub:'Viết văn (Writing)', icon:<PencilLine size={17}/>, path:'/email' },
      { jp:'模擬試験', sub:'Thi thử JLPT', icon:<ListChecks size={17}/>, path:'/mocktest' },
    ]
  },
  {
    label: 'ツール',
    items: [
      { jp:'Anki Local Player', sub:'Học Offline Tự do', icon:<Play size={17}/>, path:'/sandbox' },
      { jp:'インポート', sub:'Anki Import', icon:<Database size={17}/>, path:'/anki-import' },
      { jp:'メディアスタジオ', sub:'Media Studio', icon:<Film size={17}/>, path:'/media' },
      { jp:'設定', sub:'Cài đặt (API Keys)', icon:<Settings size={17}/>, path:'/settings' },
    ]
  }
];

const Sidebar = ({ isOpen, onClose, theme, onToggleTheme }) => {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {/* Overlay for mobile */}
    <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}/>
    
    <aside className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div style={{ padding: 6, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 8, display: 'flex', flexShrink: 0 }}>
          <BookOpen size={18} color="white"/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>OmniLinguist</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>v10.0 · 全言語学習</div>
        </div>
        {/* Close button for mobile */}
        <button className="btn-ghost" onClick={onClose} style={{ display: 'none' }}>
          <X size={18}/>
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {SECTIONS.map((section, si) => (
          <div key={si}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              >
                {item.icon}
                <div style={{ lineHeight: 1.25, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="jp-text">{item.jp}</div>
                  <div style={{ fontSize: '0.66rem', opacity: 0.6 }}>{item.sub}</div>
                </div>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer: Theme + Settings */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {theme === 'dark' ? <Moon size={14} color="var(--text-secondary)"/> : <Sun size={14} color="var(--accent-warning)"/>}
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{theme === 'dark' ? 'ダーク' : 'ライト'}</span>
          </div>
          <button
            className={`theme-toggle ${theme === 'light' ? 'active' : ''}`}
            onClick={onToggleTheme}
          >
            <div className="theme-toggle-knob"/>
          </button>
        </div>

        {user ? (
          <div style={{ padding: '12px 8px 4px', borderTop: '1px solid var(--glass-border)', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                <User size={16}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                  {user.email}
                </div>
                <div onClick={handleLogout} style={{ fontSize: '0.65rem', color: 'var(--accent-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontWeight: 500 }}>
                  <LogOut size={12}/> Đăng xuất
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px 8px 4px', borderTop: '1px solid var(--glass-border)', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                <User size={16}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                  Khách vãng lai
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Lưu trên thiết bị này</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  </>
  );
};

export default Sidebar;

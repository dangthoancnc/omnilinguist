// v11.0.0 - Auto-collapsing & Hover-expanding Sidebar with Pinning Support
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Map, Mic, Volume2, BookA, BookOpen, Search, PencilLine, 
  Settings, Film, ListChecks, Sun, Moon, X, ChevronLeft, LogOut, User, 
  Database, Play, Newspaper, Pin, PinOff, Award
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { supabase } from './lib/supabaseClient';

const SECTIONS = [
  {
    label: '学習ツール',
    items: [
      { jp:'ホーム', sub:'Dashboard', icon:<LayoutDashboard size={18}/>, path:'/', end:true },
      { jp:'JLPT 特訓道場', sub:'Lò Luyện Shinkanzen', icon:<Award size={18}/>, path:'/jlpt-dojo' },
      { jp:'学習ロードマップ', sub:'Lộ trình Học', icon:<Map size={18}/>, path:'/roadmap' },
    ]
  },
  {
    label: 'インプット',
    items: [
      { jp:'ニュース Hub', sub:'Tin tức & Đời sống Nhật', icon:<Newspaper size={18}/>, path:'/news' },
      { jp:'多読 (Immersion)', sub:'Tắm ngôn ngữ', icon:<BookOpen size={18}/>, path:'/reading' },
      { jp:'シャドーイング', sub:'Shadowing', icon:<Volume2 size={18}/>, path:'/shadowing' },
    ]
  },
  {
    label: 'トレーニング',
    items: [
      { jp:'単語カード', sub:'Flashcards FSRS', icon:<BookA size={18}/>, path:'/flashcards' },
      { jp:'漢字練習', sub:'Luyện viết Kanji', icon:<PencilLine size={18}/>, path:'/kanji' },
      { jp:'文法検索', sub:'Tra cứu Ngữ pháp', icon:<BookOpen size={18}/>, path:'/grammar' },
      { jp:'辞書', sub:'Từ điển Thông minh', icon:<Search size={18}/>, path:'/dictionary' },
    ]
  },
  {
    label: 'アウトプット',
    items: [
      { jp:'ライティング', sub:'Viết văn (Writing)', icon:<PencilLine size={18}/>, path:'/email' },
      { jp:'模擬試験', sub:'Thi thử JLPT', icon:<ListChecks size={18}/>, path:'/mocktest' },
    ]
  },
  {
    label: 'ツール',
    items: [
      { jp:'Anki Local Player', sub:'Học Offline Tự do', icon:<Play size={18}/>, path:'/sandbox' },
      { jp:'インポート', sub:'Anki Import', icon:<Database size={18}/>, path:'/anki-import' },
      { jp:'メディアスタジオ', sub:'Media Studio', icon:<Film size={18}/>, path:'/media' },
      { jp:'設定', sub:'Cài đặt (API Keys)', icon:<Settings size={18}/>, path:'/settings' },
    ]
  }
];

const Sidebar = ({ isOpen, onClose, theme, onToggleTheme }) => {
  const { user } = useAuth();
  
  // Tự động thu gọn, mở rộng khi hover (mặc định unpinned)
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('omni_sidebar_pinned') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);

  const togglePin = () => {
    setIsPinned(p => {
      const next = !p;
      localStorage.setItem('omni_sidebar_pinned', next ? 'true' : 'false');
      return next;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}/>
      
      {/* Rail wrapper preserves 68px space in document flow so content never shifts on hover */}
      <div 
        className={`sidebar-rail-wrapper ${isPinned ? 'pinned' : 'auto-collapsed'} ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <aside className={`sidebar-drawer ${isOpen ? 'open' : ''} ${isPinned ? 'pinned' : 'auto-collapsed'} ${isHovered ? 'hovered' : ''}`}>
          {/* Brand */}
          <div className="sidebar-brand">
            <div style={{ padding: 6, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 8, display: 'flex', flexShrink: 0 }}>
              <BookOpen size={18} color="white"/>
            </div>
            <div className="sidebar-brand-text" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>OmniLinguist</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>v10.2 · 全言語学習</div>
            </div>
            
            {/* Desktop Pin / Unpin Button */}
            <button 
              className="sidebar-pin-btn btn-ghost" 
              onClick={togglePin}
              title={isPinned ? "Bỏ ghim (tự động thu gọn, hover mở ra)" : "Ghim cố định thanh bên"}
              style={{ padding: 5, cursor: 'pointer', borderRadius: 6, color: isPinned ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
            >
              {isPinned ? <PinOff size={15}/> : <Pin size={15}/>}
            </button>

            {/* Close button for mobile */}
            <button className="btn-ghost hide-on-desktop" onClick={onClose} style={{ padding: 4 }}>
              <X size={18}/>
            </button>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {SECTIONS.map((section, si) => (
              <div key={si} className="sidebar-section-block">
                <div className="sidebar-section-label">{section.label}</div>
                {section.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    title={`${item.jp} (${item.sub})`}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                  >
                    <div className="sidebar-link-icon">{item.icon}</div>
                    <div className="sidebar-link-text">
                      <div style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="jp-text">{item.jp}</div>
                      <div style={{ fontSize: '0.66rem', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sub}</div>
                    </div>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer: Theme + Settings */}
          <div className="sidebar-footer">
            {/* Full Footer (shown when expanded or pinned) */}
            <div className="sidebar-footer-full">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {theme === 'dark' ? <Moon size={14} color="var(--text-secondary)"/> : <Sun size={14} color="var(--accent-warning)"/>}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{theme === 'dark' ? 'ダーク' : 'ライト'}</span>
                </div>
                <button
                  className={`theme-toggle ${theme === 'light' ? 'active' : ''}`}
                  onClick={onToggleTheme}
                  title="Chuyển đổi giao diện Sáng / Tối"
                >
                  <div className="theme-toggle-knob"/>
                </button>
              </div>

              {user ? (
                <div style={{ padding: '8px 8px 4px', borderTop: '1px solid var(--glass-border)', marginTop: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                      <User size={14}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                        {user.email}
                      </div>
                      <div onClick={handleLogout} style={{ fontSize: '0.65rem', color: 'var(--accent-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontWeight: 500 }}>
                        <LogOut size={11}/> Đăng xuất
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '8px 8px 4px', borderTop: '1px solid var(--glass-border)', marginTop: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                      <User size={14}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 600 }}>Khách vãng lai</div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-tertiary)' }}>Lưu trên máy này</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compact Footer (shown only when collapsed & not hovered) */}
            <div className="sidebar-footer-compact">
              <button 
                onClick={onToggleTheme} 
                className="btn-ghost" 
                title={`Giao diện: ${theme === 'dark' ? 'Tối' : 'Sáng'} (Bấm để đổi)`}
                style={{ padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme === 'dark' ? 'var(--text-secondary)' : 'var(--accent-warning)', cursor: 'pointer' }}
              >
                {theme === 'dark' ? <Moon size={16}/> : <Sun size={16}/>}
              </button>
              <div 
                title={user ? user.email : 'Khách vãng lai'}
                style={{ width: 30, height: 30, borderRadius: '50%', background: user ? 'var(--accent-subtle)' : 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: user ? 'var(--accent-primary)' : '#34d399', cursor: 'pointer' }}
              >
                <User size={15}/>
              </div>
            </div>

          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;

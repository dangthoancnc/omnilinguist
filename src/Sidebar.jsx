// v12.0.0 - Auto-collapsing & Hover-expanding Sidebar with Hierarchical Sub-navigation & Pinning
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Map, Mic, Volume2, BookA, BookOpen, Search, PencilLine, 
  Settings, Film, ListChecks, Sun, Moon, X, ChevronLeft, LogOut, User, 
  Database, Play, Newspaper, Pin, PinOff, Award, ChevronDown, ChevronRight,
  Palette, Landmark, BookMarked, Zap, Swords
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { supabase } from './lib/supabaseClient';

const SECTIONS = [
  {
    label: '学習ツール',
    items: [
      { jp:'ホーム', sub:'Dashboard', icon:<LayoutDashboard size={18}/>, path:'/', end:true },
      { 
        jp:'JLPT 特訓道場', 
        sub:'Lò Luyện Shinkanzen', 
        icon:<Swords size={18}/>, 
        path:'/jlpt-dojo',
        children: [
          { label: 'Minna N5-N4 (1-50)', param: 'tab=minna' },
          { label: 'Lò Luyện N3', param: 'tab=n3' },
          { label: 'Lò Luyện N2', param: 'tab=n2' },
          { label: 'Lò Luyện N1', param: 'tab=n1' },
          { label: 'Đề Thi 10 Năm', param: 'tab=exams' },
          { label: 'Bách Khoa Mindmap', param: 'tab=mindmap' },
        ]
      },
      { jp:'学習ロードマップ', sub:'Lộ trình Học', icon:<Map size={18}/>, path:'/roadmap' },
    ]
  },
  {
    label: 'インプット',
    items: [
      { jp:'ニュース Hub', sub:'Tin tức & Đời sống Nhật', icon:<Newspaper size={18}/>, path:'/news' },
      { 
        jp:'多読 (Immersion)', 
        sub:'Tắm ngôn ngữ', 
        icon:<BookOpen size={18}/>, 
        path:'/reading',
        children: [
          { label: 'Sách Tranh Ehon', param: 'genre=ehon', icon: <Palette size={13} /> },
          { label: 'Cổ Tích Dân Gian', param: 'genre=folktale', icon: <Landmark size={13} /> },
          { label: 'Văn Học Cổ Điển', param: 'genre=literature', icon: <BookMarked size={13} /> },
          { label: 'Rạp Phim Ehon', param: 'mode=theater', icon: <Film size={13} /> },
          { label: 'Dòng Chảy Tri Thức', param: 'tab=corpus_stream', icon: <Zap size={13} /> },
        ]
      },
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
  const location = useLocation();
  
  // Tự động thu gọn, mở rộng khi hover (mặc định unpinned)
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('omni_sidebar_pinned') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);

  // Phân cấp danh mục (Expand / Collapse)
  const [expandedItems, setExpandedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('omni_sidebar_expanded');
      return saved ? JSON.parse(saved) : ['/jlpt-dojo', '/reading'];
    } catch {
      return ['/jlpt-dojo', '/reading'];
    }
  });

  // Tự động mở rộng khi người dùng đang ở trang tương ứng
  useEffect(() => {
    if (location.pathname === '/jlpt-dojo' || location.pathname === '/reading') {
      setExpandedItems(prev => prev.includes(location.pathname) ? prev : [...prev, location.pathname]);
    }
  }, [location.pathname]);

  const toggleExpand = (path, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedItems(prev => {
      const next = prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path];
      localStorage.setItem('omni_sidebar_expanded', JSON.stringify(next));
      return next;
    });
  };

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
                {section.items.map(item => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedItems.includes(item.path);
                  const isParentActive = location.pathname === item.path;

                  return (
                    <div key={item.path} className="sidebar-item-group">
                      <NavLink
                        to={item.path}
                        end={item.end}
                        title={`${item.jp} (${item.sub})`}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          if (hasChildren && !isExpanded) {
                            setExpandedItems(prev => [...prev, item.path]);
                          }
                          if (window.innerWidth < 1024 && !hasChildren) onClose();
                        }}
                      >
                        <div className="sidebar-link-icon">{item.icon}</div>
                        <div className="sidebar-link-text" style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="jp-text">{item.jp}</div>
                          <div style={{ fontSize: '0.66rem', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sub}</div>
                        </div>
                        {hasChildren && (
                          <button
                            type="button"
                            className="sidebar-chevron-btn"
                            onClick={(e) => toggleExpand(item.path, e)}
                            title={isExpanded ? "Thu gọn mục con" : "Mở rộng mục con"}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'inherit',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              display: 'flex',
                              alignItems: 'center',
                              borderRadius: 4
                            }}
                          >
                            {isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                          </button>
                        )}
                      </NavLink>

                      {/* Hierarchical Sub-Navigation */}
                      {hasChildren && isExpanded && (
                        <div className="sidebar-subnav">
                          {item.children.map(child => {
                            const childUrl = `${item.path}?${child.param}`;
                            const isChildActive = isParentActive && location.search.includes(child.param);
                            return (
                              <NavLink
                                key={child.param}
                                to={childUrl}
                                className={`sidebar-sublink ${isChildActive ? 'active' : ''}`}
                                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                              >
                                {child.icon ? (
                                  <span style={{ display: 'inline-flex', opacity: 0.85, flexShrink: 0 }}>{child.icon}</span>
                                ) : (
                                  <span style={{
                                    width: 5, height: 5, borderRadius: '50%',
                                    background: isChildActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                                    flexShrink: 0
                                  }}/>
                                )}
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {child.label}
                                </span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
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

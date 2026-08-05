// v10.1.0 - App Shell with Auth System, Theme & Drawer Sidebar
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { syncMasterData } from './syncMasterData.js';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, BookOpen, Loader } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useFurigana } from './FuriganaContext';
import AuthModal from './AuthModal';
import BottomNav from './components/BottomNav';
import GlobalPopupDictionary from './GlobalPopupDictionary';
import './index.css';

// Lazy load heavy components to optimize web bundle size (<300KB initial chunk)
const Dashboard = lazy(() => import('./Dashboard'));
const ShadowingStudio = lazy(() => import('./ShadowingStudio'));
const VocabularyFlashcards = lazy(() => import('./VocabularyFlashcards'));
const GrammarExplorer = lazy(() => import('./GrammarExplorer'));
const Dictionary = lazy(() => import('./Dictionary'));
const GrammarStudio = lazy(() => import('./GrammarStudio'));
const Roadmap = lazy(() => import('./Roadmap'));
const MockTestStudio = lazy(() => import('./MockTestStudio'));
const ImmersionReader = lazy(() => import('./ImmersionReader'));
const KanjiStudio = lazy(() => import('./KanjiStudio'));
const MediaStudio = lazy(() => import('./MediaStudio'));
const AnkiImportStudio = lazy(() => import('./AnkiImportStudio'));
const AnkiSandboxMode = lazy(() => import('./AnkiSandboxMode'));
const Settings = lazy(() => import('./Settings'));

function App() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [theme, setTheme] = useState(() => localStorage.getItem('omni_theme') || 'dark');
  const [isSyncing, setIsSyncing] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Gọi đồng bộ dữ liệu Master khi app khởi động
    syncMasterData().then(() => {
      setIsSyncing(false);
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('omni_theme', theme);
  }, [theme]);

  // Dừng toàn bộ âm thanh/video/TTS khi chuyển tab
  useEffect(() => {
    const mediaElements = document.querySelectorAll('audio, video');
    mediaElements.forEach(media => {
      if (!media.paused) {
        media.pause();
      }
    });
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [location.pathname]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const { showFurigana, toggleFurigana } = useFurigana();

  return (
    <>
      <GlobalPopupDictionary />
      {!loading && !user && <AuthModal />}
      <div className="app-shell">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <div className="app-main">
          {/* Top bar */}
          <header className="app-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="btn-ghost hide-on-mobile" onClick={() => setSidebarOpen(!sidebarOpen)} title="Bật/Tắt Sidebar">
                <Menu size={20}/>
              </button>
              <div style={{ padding: 6, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 8, display: 'flex' }}>
                <BookOpen size={16} color="white"/>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OmniLinguist</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Hệ thống Tự học Tiếng Nhật Toàn diện</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button 
                onClick={toggleFurigana}
                title="Bật/Tắt Furigana (Hiển thị Hiragana trên Kanji)"
                style={{
                  background: showFurigana ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  color: showFurigana ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--glass-border-strong)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>あ</span> <span className="hide-on-mobile">Furigana</span>
              </button>
              <span className="system-version hide-on-mobile">v10.2</span>
            </div>
          </header>

          {/* Content */}
          <main className="app-content fade-in">
            {isSyncing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
                <div className="spinner" style={{ width: 40, height: 40, border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#60a5fa', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h3 style={{ color: 'var(--text-secondary)' }}>Đang tải Master Data từ Cloud...</h3>
              </div>
            ) : (
              <Suspense fallback={
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                  <Loader className="spin" size={32} color="var(--accent-primary)" />
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Đang tải giao diện...</span>
                </div>
              }>
                <div className="tab-container" style={{ width: '100%', height: '100%' }}>
                  <div style={{ display: location.pathname === '/' ? 'block' : 'none', height: '100%' }}><Dashboard/></div>
                  <div style={{ display: location.pathname === '/roadmap' ? 'block' : 'none', height: '100%' }}><Roadmap/></div>
                  <div style={{ display: location.pathname === '/shadowing' ? 'block' : 'none', height: '100%' }}><ShadowingStudio/></div>
                  <div style={{ display: location.pathname === '/reading' ? 'block' : 'none', height: '100%' }}><ImmersionReader/></div>
                  <div style={{ display: location.pathname === '/flashcards' ? 'block' : 'none', height: '100%' }}><VocabularyFlashcards/></div>
                  <div style={{ display: location.pathname === '/grammar' ? 'block' : 'none', height: '100%' }}><GrammarExplorer/></div>
                  <div style={{ display: location.pathname === '/dictionary' ? 'block' : 'none', height: '100%' }}><Dictionary/></div>
                  <div style={{ display: location.pathname === '/email' ? 'block' : 'none', height: '100%' }}><GrammarStudio/></div>
                  <div style={{ display: location.pathname === '/mocktest' ? 'block' : 'none', height: '100%' }}><MockTestStudio/></div>
                  <div style={{ display: location.pathname === '/kanji' ? 'block' : 'none', height: '100%' }}><KanjiStudio/></div>
                  <div style={{ display: location.pathname === '/media' ? 'block' : 'none', height: '100%' }}><MediaStudio/></div>
                  <div style={{ display: location.pathname === '/anki-import' ? 'block' : 'none', height: '100%' }}><AnkiImportStudio/></div>
                  <div style={{ display: location.pathname === '/sandbox' ? 'block' : 'none', height: '100%' }}><AnkiSandboxMode/></div>
                  <div style={{ display: location.pathname === '/settings' ? 'block' : 'none', height: '100%' }}><Settings/></div>
                </div>
              </Suspense>
            )}
          </main>
          
          <BottomNav onOpenMore={() => setSidebarOpen(true)} />
        </div>
      </div>
    </>
  );
}

export default App;

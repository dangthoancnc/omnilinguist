import React, { createContext, useContext, useState, useEffect } from 'react';
import Kuroshiro from 'kuroshiro';
import CustomKuromojiAnalyzer from './CustomKuromojiAnalyzer';

const FuriganaContext = createContext();

export const FuriganaProvider = ({ children }) => {
  const [kuroshiro, setKuroshiro] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [showFurigana, setShowFurigana] = useState(() => {
    return localStorage.getItem('omni_show_furigana') === 'true';
  });

  useEffect(() => {
    const initKuroshiro = async () => {
      try {
        const k = new Kuroshiro();
        // Sử dụng CustomKuromojiAnalyzer gọi từ CDN để vượt qua lỗi của Vite
        // Các file .dat.gz đã được đổi tên thành .dat.gz.bin và chặn qua XHR
        await k.init(new CustomKuromojiAnalyzer({ dictPath: '/dict' }));
        setKuroshiro(k);
        setIsReady(true);
        console.log("✅ Kuroshiro Furigana Engine initialized (via Local Binaries)!");
      } catch (err) {
        console.error("❌ Failed to initialize Kuroshiro:", err);
      }
    };
    initKuroshiro();
  }, []);

  const toggleFurigana = () => {
    setShowFurigana(prev => {
      const next = !prev;
      localStorage.setItem('omni_show_furigana', String(next));
      return next;
    });
  };

  return (
    <FuriganaContext.Provider value={{ kuroshiro, isReady, showFurigana, toggleFurigana }}>
      {children}
    </FuriganaContext.Provider>
  );
};

export const useFurigana = () => useContext(FuriganaContext);

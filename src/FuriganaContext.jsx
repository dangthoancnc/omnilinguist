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
    let isCancelled = false;
    const initKuroshiro = async () => {
      // Đợi Kuromoji script tải xong từ CDN nếu chưa sẵn sàng
      for (let i = 0; i < 40; i++) {
        if (isCancelled) return;
        if (typeof window !== 'undefined' && window.kuromoji) {
          break;
        }
        await new Promise(res => setTimeout(res, 150));
      }

      if (typeof window === 'undefined' || !window.kuromoji) {
        console.warn("⚠️ Kuromoji CDN script is not available.");
        return;
      }

      try {
        const k = new Kuroshiro();
        // Sử dụng CustomKuromojiAnalyzer gọi từ local dictionary binaries /dict/*.dat.gz.bin
        await k.init(new CustomKuromojiAnalyzer({ dictPath: '/dict' }));
        if (!isCancelled) {
          setKuroshiro(k);
          setIsReady(true);
          console.log("✅ Kuroshiro Furigana Engine initialized (via Local Binaries)!");
        }
      } catch (err) {
        console.error("❌ Failed to initialize Kuroshiro:", err);
      }
    };

    initKuroshiro();
    return () => { isCancelled = true; };
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

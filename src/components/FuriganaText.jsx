import React, { useState, useEffect } from 'react';
import { useFurigana } from '../FuriganaContext';

// Global memory cache để lưu kết quả parse Furigana, giúp hiển thị tức thì khi người dùng bật nút
const furiganaGlobalCache = new Map();

const FuriganaText = ({ text, className = "jp-text", style = {} }) => {
  const { kuroshiro, isReady, showFurigana } = useFurigana();
  const [rubyHtml, setRubyHtml] = useState(() => {
    if (text && furiganaGlobalCache.has(text)) {
      return furiganaGlobalCache.get(text);
    }
    return text;
  });

  useEffect(() => {
    let isMounted = true;

    // Nếu đã có trong cache thì dùng ngay
    if (text && furiganaGlobalCache.has(text)) {
      setRubyHtml(furiganaGlobalCache.get(text));
      return;
    }

    const parseText = async () => {
      // Nếu rỗng, không bật tính năng, hoặc text không có Kanji thì bỏ qua
      if (!text || !showFurigana) {
        if (isMounted) setRubyHtml(text);
        return;
      }
      
      const hasKanji = /[\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
      if (!hasKanji) {
        furiganaGlobalCache.set(text, text);
        if (isMounted) setRubyHtml(text);
        return;
      }

      if (!isReady || !kuroshiro) {
        return;
      }

      try {
        // Kuroshiro parse to HTML ruby
        const result = await kuroshiro.convert(text, { mode: 'furigana', to: 'hiragana' });
        furiganaGlobalCache.set(text, result);
        if (isMounted) setRubyHtml(result);
      } catch (err) {
        console.error("Furigana parse error:", err);
        if (isMounted) setRubyHtml(text);
      }
    };

    parseText();

    return () => { isMounted = false; };
  }, [text, isReady, showFurigana, kuroshiro]);

  if (!showFurigana) {
    return <span className={className} style={style}>{text}</span>;
  }

  return (
    <span 
      className={className} 
      style={{ ...style, lineHeight: 2.2 }}
      dangerouslySetInnerHTML={{ __html: rubyHtml || text }} 
    />
  );
};

export default FuriganaText;

import React, { useState, useEffect } from 'react';
import { useFurigana } from '../FuriganaContext';

// Global memory cache với giới hạn tối đa 1000 items (FIFO Eviction)
const MAX_CACHE_SIZE = 1000;
const furiganaGlobalCache = new Map();

const setCachedRuby = (key, val) => {
  if (furiganaGlobalCache.size >= MAX_CACHE_SIZE) {
    const firstKey = furiganaGlobalCache.keys().next().value;
    furiganaGlobalCache.delete(firstKey);
  }
  furiganaGlobalCache.set(key, val);
};

// Hàm lọc HTML an toàn (chỉ giữ thẻ ruby hợp lệ, loại bỏ script/xss)
const sanitizeRubyHtml = (html) => {
  if (!html) return '';
  if (!html.includes('<ruby')) {
    return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

const FuriganaText = ({ text, className = "jp-text", style = {} }) => {
  const { kuroshiro, isReady, showFurigana } = useFurigana();
  const [rubyHtml, setRubyHtml] = useState(() => {
    if (text && furiganaGlobalCache.has(text)) {
      return furiganaGlobalCache.get(text);
    }
    return text || '';
  });

  useEffect(() => {
    let isMounted = true;

    // Nếu đã có trong cache thì dùng ngay
    if (text && furiganaGlobalCache.has(text)) {
      setRubyHtml(furiganaGlobalCache.get(text));
      return;
    }

    const parseText = async () => {
      if (!text || !showFurigana) {
        if (isMounted) setRubyHtml(text || '');
        return;
      }
      
      const hasKanji = /[\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
      if (!hasKanji) {
        setCachedRuby(text, text);
        if (isMounted) setRubyHtml(text);
        return;
      }

      if (!isReady || !kuroshiro) {
        return;
      }

      try {
        const result = await kuroshiro.convert(text, { mode: 'furigana', to: 'hiragana' });
        setCachedRuby(text, result);
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

  // Ưu tiên đọc từ cache ngay trong lúc render để loại bỏ hiện tượng flicker
  const activeRuby = (text && furiganaGlobalCache.has(text)) ? furiganaGlobalCache.get(text) : (rubyHtml || text);

  return (
    <span 
      className={className} 
      style={{ ...style, lineHeight: 2.2 }}
      dangerouslySetInnerHTML={{ __html: sanitizeRubyHtml(activeRuby) }} 
    />
  );
};

export default FuriganaText;

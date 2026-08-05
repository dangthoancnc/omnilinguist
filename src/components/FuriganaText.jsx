import React, { useState, useEffect } from 'react';
import { useFurigana } from '../FuriganaContext';

const FuriganaText = ({ text, className = "jp-text", style = {} }) => {
  const { kuroshiro, isReady, showFurigana } = useFurigana();
  const [rubyHtml, setRubyHtml] = useState(text);

  useEffect(() => {
    let isMounted = true;

    const parseText = async () => {
      // Nếu rỗng, không bật tính năng, hoặc text không có Kanji thì bỏ qua
      if (!text || !showFurigana || !isReady || !kuroshiro) {
        if (isMounted) setRubyHtml(text);
        return;
      }
      
      const hasKanji = /[\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
      if (!hasKanji) {
        if (isMounted) setRubyHtml(text);
        return;
      }

      try {
        // Kuroshiro parse to HTML ruby
        const result = await kuroshiro.convert(text, { mode: 'furigana', to: 'hiragana' });
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
      style={{ ...style, lineHeight: 1.8 }}
      dangerouslySetInnerHTML={{ __html: rubyHtml }} 
    />
  );
};

export default FuriganaText;

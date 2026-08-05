// Custom Analyzer wrapper for Kuroshiro using the global Kuromoji object
// Kèm theo bộ đánh chặn XHR để vượt qua lỗi Vite/CDN tự động giải nén GZIP
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (typeof url === 'string' && url.includes('/dict/') && url.endsWith('.dat.gz')) {
    url = url + '.bin'; // Đổi thành .bin để máy chủ trả về file gốc
  }
  return originalOpen.call(this, method, url, ...rest);
};

class CustomKuromojiAnalyzer {
  constructor({ dictPath = '/dict' } = {}) {
    this._analyzer = null;
    this._dictPath = dictPath;
  }

  init() {
    return new Promise((resolve, reject) => {
      if (this._analyzer) {
        return resolve();
      }
      if (typeof window === 'undefined' || !window.kuromoji) {
        return reject(new Error('Kuromoji is not loaded in the browser.'));
      }
      
      window.kuromoji.builder({ dicPath: this._dictPath }).build((err, tokenizer) => {
        if (err) {
          return reject(err);
        }
        this._analyzer = tokenizer;
        resolve();
      });
    });
  }

  parse(str = '') {
    return new Promise((resolve, reject) => {
      if (!this._analyzer) {
        return reject(new Error('Analyzer is not initialized.'));
      }
      try {
        const tokens = this._analyzer.tokenize(str);
        // Map Kuromoji tokens to Kuroshiro compatible format
        const result = tokens.map(token => ({
          surface_form: token.surface_form,
          pos: token.pos,
          pos_detail_1: token.pos_detail_1,
          pos_detail_2: token.pos_detail_2,
          pos_detail_3: token.pos_detail_3,
          conjugated_type: token.conjugated_type,
          conjugated_form: token.conjugated_form,
          basic_form: token.basic_form,
          reading: token.reading,
          pronunciation: token.pronunciation
        }));
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default CustomKuromojiAnalyzer;

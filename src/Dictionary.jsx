import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';
import { Search, BookA, Bookmark, ArrowRight, LayoutGrid, Type } from 'lucide-react';

const LEVEL_COLORS = { N5:'#10b981', N4:'#3b82f6', N3:'#f59e0b', N2:'#8b5cf6', N1:'#ef4444' };

// Auto-Translate component with caching
const translateToVi = async (enText) => {
  if (!enText) return '';
  const cacheKey = `trans_${enText}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;
  
  if (!navigator.onLine) return enText;
  
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(enText)}`);
    const data = await res.json();
    const viText = data[0][0][0];
    localStorage.setItem(cacheKey, viText);
    return viText;
  } catch (e) { return enText; }
};

const ViText = ({ text }) => {
  const [vi, setVi] = useState(() => localStorage.getItem(`trans_${text}`) || '');
  useEffect(() => {
    if (!localStorage.getItem(`trans_${text}`)) {
      translateToVi(text).then(setVi);
    }
  }, [text]);
  return <>{vi || text}</>;
};

const ROMAJI_TO_KANA = {
  kya:'きゃ', kyu:'きゅ', kyo:'きょ', sha:'しゃ', shu:'しゅ', sho:'しょ', cha:'ちゃ', chu:'ちゅ', cho:'ちょ',
  nya:'にゃ', nyu:'にゅ', nyo:'にょ', hya:'ひゃ', hyu:'ひゅ', hyo:'ひょ', mya:'みゃ', myu:'みゅ', myo:'みょ',
  rya:'りゃ', ryu:'りゅ', ryo:'りょ', gya:'ぎゃ', gyu:'ぎゅ', gyo:'ぎょ', ja:'じゃ', ju:'じゅ', jo:'じょ',
  bya:'びゃ', byu:'びゅ', byo:'びょ', pya:'ぴゃ', pyu:'ぴゅ', pyo:'ぴょ',
  shi:'し', chi:'ち', tsu:'つ',
  ka:'か', ki:'き', ku:'く', ke:'け', ko:'こ', sa:'さ', su:'す', se:'せ', so:'そ',
  ta:'た', te:'て', to:'と', na:'な', ni:'に', nu:'ぬ', ne:'ね', no:'の',
  ha:'は', hi:'ひ', fu:'ふ', he:'へ', ho:'ほ', ma:'ま', mi:'み', mu:'む', me:'め', mo:'も',
  ya:'や', yu:'ゆ', yo:'よ', ra:'ら', ri:'り', ru:'る', re:'れ', ro:'ろ',
  wa:'わ', wo:'を', nn:'ん', n:'ん',
  ga:'が', gi:'ぎ', gu:'ぐ', ge:'げ', go:'ご', za:'ざ', ji:'じ', zu:'ず', ze:'ぜ', zo:'ぞ',
  da:'だ', de:'で', do:'ど', ba:'ば', bi:'び', bu:'ぶ', be:'べ', bo:'ぼ',
  pa:'ぱ', pi:'ぴ', pu:'ぷ', pe:'ぺ', po:'ぽ',
  a:'あ', i:'い', u:'う', e:'え', o:'お'
};

const toHiragana = (str) => {
  let res = str.toLowerCase();
  for (let k in ROMAJI_TO_KANA) {
    res = res.split(k).join(ROMAJI_TO_KANA[k]);
  }
  return res;
};

const CrossDictEnVn = ({ query }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    let isMounted = true;
    const fetchDict = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (isMounted) setData(json);
      } catch (e) { }
      if (isMounted) setLoading(false);
    };
    const timer = setTimeout(fetchDict, 500); // debounce
    return () => { isMounted = false; clearTimeout(timer); };
  }, [query]);

  if (!query) return null;
  if (loading) return null; // keep silent while loading
  if (!data || !data[1]) return null;

  return (
    <div className="glass-panel" style={{ padding: 20, marginBottom: 20, border: '1px solid rgba(139, 92, 246, 0.3)' }}>
      <h3 style={{ fontSize: '1.05rem', color: '#a78bfa', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <BookA size={18}/> Từ điển Anh - Việt (Cross-Search)
      </h3>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 16, color: 'white' }}>{data[0]?.[0]?.[0] || query}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data[1].map((posGroup, idx) => (
          <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8 }}>
            <div style={{ color: '#c4b5fd', fontWeight: 'bold', fontStyle: 'italic', marginBottom: 8, textTransform: 'capitalize' }}>{posGroup[0]}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {posGroup[1].map((meaning, i) => (
                <span key={i} style={{ padding: '4px 10px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: 16, fontSize: '0.9rem', color: '#e2e8f0' }}>{meaning}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SearchResults = React.memo(({ query, totalResults, results, isSearching }) => {
  if (!query.trim()) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
        <Search size={60} style={{ opacity: 0.2, marginBottom: 20 }}/>
        <p>Nhập bất kỳ ký tự nào để tìm kiếm xuyên suốt Từ vựng, Hán tự và Ngữ pháp.</p>
      </div>
    );
  }
  if (totalResults === 0 && !isSearching) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
        <p>Không tìm thấy kết quả nào cho "{query}".</p>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KANJI RESULTS */}
      {results.kanji.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.05rem', color: '#10b981', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LayoutGrid size={18}/> Hán tự (Kanji) - {results.kanji.length} kết quả
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {results.kanji.map(k => (
              <div key={k.id} className="glass-panel" style={{ padding: 16, display: 'flex', gap: 16 }}>
                <div className="jp-text" style={{ fontSize: '3rem', lineHeight: 1, color: LEVEL_COLORS[k.level] || 'white' }}>
                  {k.kanji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 4, display: 'inline-block', marginBottom: 6 }}>
                    {k.level} | {k.strokes} nét
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>
                    <ViText text={k.meanings.join(', ')}/>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {k.onyomi.length > 0 && <div><span style={{ color: '#ef4444' }}>ON:</span> {k.onyomi.join(', ')}</div>}
                    {k.kunyomi.length > 0 && <div><span style={{ color: '#3b82f6' }}>KUN:</span> {k.kunyomi.join(', ')}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GRAMMAR RESULTS */}
      {results.grammar.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.05rem', color: '#f59e0b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bookmark size={18}/> Ngữ pháp - {results.grammar.length} kết quả
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.grammar.map(g => (
              <div key={g.id} className="glass-panel" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 4, background: `${LEVEL_COLORS[g.level]}22`, color: LEVEL_COLORS[g.level], fontWeight: 800 }}>
                      {g.level}
                    </span>
                    <span className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{g.pattern}</span>
                  </div>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 10 }}>{g.meaning}</div>
                {g.usage && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10, padding: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>Cách chia: {g.usage}</div>}
                {g.examples && g.examples.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                    {g.examples.map((ex, idx) => {
                      if (typeof ex === 'object') {
                        return (
                          <div key={idx} style={{ fontSize: '0.9rem', paddingLeft: 12, borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                            <div className="jp-text" style={{ marginBottom: 4 }}>{ex.jp || ex.japanese || JSON.stringify(ex)}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>{ex.vi || ex.vietnamese || ex.en || ''}</div>
                          </div>
                        );
                      }
                      const textEx = String(ex);
                      return (
                        <div key={idx} style={{ fontSize: '0.9rem', paddingLeft: 12, borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                          <div className="jp-text" style={{ marginBottom: 4 }}>{textEx.split('(')[0]}</div>
                          <div style={{ color: 'var(--text-secondary)' }}>{textEx.includes('(') ? `(${textEx.split('(').slice(1).join('(')}` : ''}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VOCAB RESULTS */}
      {results.vocab.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.05rem', color: '#3b82f6', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Type size={18}/> Từ vựng - {results.vocab.length} kết quả
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.vocab.map(v => (
              <div key={v.id} className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 60, textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: 4, background: `${LEVEL_COLORS[v.level]}22`, color: LEVEL_COLORS[v.level], fontWeight: 800 }}>
                    {v.level}
                  </span>
                </div>
                <div style={{ width: 150 }}>
                  <div className="jp-text" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{v.word}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{v.reading}</div>
                </div>
                <div style={{ flex: 1, fontSize: '1.05rem' }}>
                  <ViText text={v.vi}/>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{v.vi}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {v.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const Dictionary = () => {
  const vocabCount = useLiveQuery(() => db.vocab.count()) || 0;
  const kanjiCount = useLiveQuery(() => db.kanji.count()) || 0;
  const grammarCount = useLiveQuery(() => db.grammar.count()) || 0;
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, vocab, kanji, grammar
  const [translatedQ, setTranslatedQ] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-translate Vietnamese query to English/Japanese for offline DB matching
  useEffect(() => {
    const qRaw = searchQuery.trim().toLowerCase();
    if (qRaw.length < 2) { setTranslatedQ([]); return; }
    
    // Check if query is likely Vietnamese (has spaces or diacritics)
    const isVietnamese = /[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỵỷỹ\s]/i.test(qRaw);
    if (!isVietnamese) {
      setTranslatedQ([]);
      return;
    }

    // If completely offline, skip the API entirely to fallback to local data instantly
    if (!navigator.onLine) {
      setTranslatedQ([]);
      return;
    }

    let isMounted = true;
    const fetchTrans = async () => {
      setIsSearching(true);
      try {
        const [resEn, resJa] = await Promise.all([
          fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encodeURIComponent(qRaw)}`),
          fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=ja&dt=t&q=${encodeURIComponent(qRaw)}`)
        ]);
        const dataEn = await resEn.json();
        const dataJa = await resJa.json();
        const en = dataEn[0][0][0].toLowerCase();
        const ja = dataJa[0][0][0].toLowerCase();
        if (isMounted) setTranslatedQ([en, ja].filter(t => t !== qRaw));
      } catch(e) {}
      if (isMounted) setIsSearching(false);
    };
    fetchTrans();
    
    return () => { isMounted = false; };
  }, [searchQuery]);

  const results = useLiveQuery(async () => {
    const qRaw = searchQuery.toLowerCase().trim();
    if (!qRaw) return { vocab: [], kanji: [], grammar: [] };
    
    const normalize = (str) => (str || '').toLowerCase().replace(/[\.\-\s]/g, '');
    const nq = normalize(qRaw);
    const nqHira = toHiragana(nq);
    const normalizedTranslatedQ = translatedQ.map(tq => normalize(tq));

    const vRes = filterType === 'all' || filterType === 'vocab' 
      ? await db.vocab.filter(v => 
          normalize(v.word).includes(nq) || 
          normalize(v.word).includes(nqHira) || 
          normalize(v.reading).includes(nq) || 
          normalize(v.reading).includes(nqHira) || 
          normalize(v.vi).includes(nq) ||
          (translatedQ && translatedQ.some(t => normalize(v.word).includes(normalize(t))))
        ).limit(50).toArray()
      : [];

    const kRes = filterType === 'all' || filterType === 'kanji'
      ? await db.kanji.filter(k => 
          normalize(k.kanji).includes(nq) || 
          k.meanings.some(m => normalize(m).includes(nq)) || 
          k.onyomi.some(o => normalize(o).includes(nq) || normalize(o).includes(nqHira)) || 
          k.kunyomi.some(ku => normalize(ku).includes(nq) || normalize(ku).includes(nqHira)) ||
          (translatedQ && k.meanings.some(m => translatedQ.some(t => normalize(m).includes(normalize(t)))))
        ).limit(30).toArray()
      : [];

    const gRes = filterType === 'all' || filterType === 'grammar'
      ? await db.grammar.filter(g => 
          normalize(g.pattern).includes(nq) || 
          normalize(g.pattern).includes(nqHira) || 
          normalize(g.meaning).includes(nq) || 
          normalize(g.vi).includes(nq) ||
          (translatedQ && translatedQ.some(t => normalize(g.meaning).includes(normalize(t))))
        ).limit(30).toArray()
      : [];

    return { vocab: vRes, kanji: kRes, grammar: gRes };
  }, [searchQuery, filterType, translatedQ]) || { vocab: [], kanji: [], grammar: [] };

  const totalResults = results.vocab.length + results.kanji.length + results.grammar.length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Search Header */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={24} color="var(--accent-primary)"/> Từ điển Đa năng (OmniSearch)
        </h2>
        
        <div style={{ position: 'relative', display: 'flex' }}>
          <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: 16, top: 18 }}/>
          <input
            type="text"
            className="jp-text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (e.target.value === '') setSearchQuery(''); // Clear immediately if empty
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') setSearchQuery(query);
            }}
            placeholder="Nhập tiếng Nhật, Romaji, Hán tự hoặc Nghĩa tiếng Việt... (Nhấn Enter để tìm)"
            style={{ width: '100%', padding: '16px 120px 16px 48px', fontSize: '1.1rem', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', opacity: isSearching ? 0.7 : 1 }}
            autoFocus
          />
          <button
            onClick={() => setSearchQuery(query)}
            style={{ position: 'absolute', right: 8, top: 8, bottom: 8, padding: '0 24px', borderRadius: 8, background: 'var(--accent-primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
          >
            Tìm kiếm
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { id: 'all', label: `Tất cả (${totalResults})` },
            { id: 'vocab', label: `Từ vựng (${vocabCount})` },
            { id: 'kanji', label: `Hán tự (${kanjiCount})` },
            { id: 'grammar', label: `Ngữ pháp (${grammarCount})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`btn ${filterType === f.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', borderRadius: 20, fontSize: '0.85rem' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
        {totalResults === 0 && isSearching ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--accent-primary)' }}>
            <div className="spinner" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <p>Đang biên dịch và tìm kiếm chéo...</p>
          </div>
        ) : (
          <>
            <CrossDictEnVn query={searchQuery} />
            <SearchResults query={searchQuery} totalResults={totalResults} results={results} isSearching={isSearching} />
          </>
        )}
      </div>
    </div>
  );
};

export default Dictionary;

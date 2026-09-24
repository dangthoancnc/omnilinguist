/**
 * Japan News & Living Portal Service
 * Handles live RSS fetching from NHK / Livedoor / Yahoo, curated articles, grammar detection & live translation.
 */
import localMasterDb from '../data/jlpt_master_db.json';

const RSS_FEEDS = {
  all: [
    { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK News', category: 'society', label: 'Thời sự tổng hợp' },
    { url: 'https://news.livedoor.com/topics/rss/top.xml', source: 'Livedoor News', category: 'society', label: 'Tin nóng Nhật Bản' }
  ],
  life: [
    { url: 'https://www3.nhk.or.jp/rss/news/cat1.xml', source: 'NHK Xã hội & Đời sống', category: 'life', label: 'Đời sống & Xã hội' }
  ],
  economy: [
    { url: 'https://www3.nhk.or.jp/rss/news/cat5.xml', source: 'NHK Kinh tế', category: 'economy', label: 'Kinh tế & Thị trường' },
    { url: 'https://news.livedoor.com/rss/summary/52.xml', source: 'Livedoor Kinh tế', category: 'economy', label: 'Tài chính & Doanh nghiệp' }
  ],
  society: [
    { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK News', category: 'society', label: 'Thời sự Nhật Bản' }
  ],
  culture: [
    { url: 'https://www3.nhk.or.jp/rss/news/cat3.xml', source: 'NHK Văn hóa & Khoa học', category: 'culture', label: 'Văn hóa & Đời sống' }
  ]
};

import { 
  CURATED_JAPAN_NEWS, 
  BREAKING_NEWS_TICKER, 
  JAPAN_WEATHER_DATA, 
  DAILY_NEWS_KANJI_VOCAB 
} from '../data/japanNewsCorpus.js';

export {
  CURATED_JAPAN_NEWS,
  BREAKING_NEWS_TICKER,
  JAPAN_WEATHER_DATA,
  DAILY_NEWS_KANJI_VOCAB
};

const FALLBACK_IMAGES = {
  life: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=60',
  economy: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=60',
  society: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=600&auto=format&fit=crop&q=60',
  culture: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=60'
};

// In-memory cache for live fetched news
let cachedNews = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Fetch and parse RSS XML text into structured items
 */
function parseRssXml(xmlText, sourceName, category) {
  const items = [];
  try {
    const itemBlocks = xmlText.split('<item>').slice(1);
    for (const block of itemBlocks) {
      const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const descMatch = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
      const pubDateMatch = block.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);

      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim();
        const rawDesc = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        const link = linkMatch ? linkMatch[1].trim() : '';
        const rawDate = pubDateMatch ? pubDateMatch[1].trim() : '';
        
        let dateStr = new Date().toISOString().split('T')[0];
        try {
          if (rawDate) dateStr = new Date(rawDate).toISOString().split('T')[0];
        } catch (e) {}

        const id = `rss_${Math.abs(title.split('').reduce((a,b)=>((a<<5)-a)+b.charCodeAt(0),0))}`;
        
        items.push({
          id,
          title,
          category: category || 'society',
          categoryLabel: category === 'economy' ? '📈 Kinh tế & Tỷ giá' : category === 'life' ? '🗾 Đời sống & Visa' : category === 'culture' ? '🌸 Văn hóa & Tiếng Nhật Dễ' : '🏛️ Thời sự & Xã hội',
          level: category === 'culture' ? 'N4' : 'N2',
          source: sourceName || 'NHK News',
          date: dateStr,
          link,
          image: FALLBACK_IMAGES[category] || FALLBACK_IMAGES.society,
          summary: rawDesc.slice(0, 180) + (rawDesc.length > 180 ? '...' : ''),
          content: rawDesc || title,
          viTranslation: '',
          isLive: true
        });
      }
    }
  } catch (err) {
    console.error('Error parsing RSS XML:', err);
  }
  return items;
}

/**
 * Fetch live news from RSS feeds using public CORS endpoints with resilient fallbacks
 */
export async function fetchLiveNews(category = 'all', forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedNews && (now - lastFetchTime < CACHE_TTL_MS)) {
    return filterByCategory(cachedNews, category);
  }

  // Check localStorage cache on initial boot
  if (!cachedNews && !forceRefresh) {
    try {
      const saved = localStorage.getItem('omni_cached_news');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedNews = parsed;
          return filterByCategory(parsed, category);
        }
      }
    } catch(e) {}
  }

  const feeds = RSS_FEEDS[category] || RSS_FEEDS.all;
  let allFetchedItems = [];

  for (const feed of feeds) {
    try {
      // 1. Try public rss2json API first
      const encodedUrl = encodeURIComponent(feed.url);
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodedUrl}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      
      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok' && Array.isArray(data.items)) {
          const items = data.items.map(item => {
            const rawTitle = item.title || item.link || 'tin_tuc';
            const id = `rss_json_${Math.abs(rawTitle.split('').reduce((a,b)=>((a<<5)-a)+b.charCodeAt(0),0))}`;
            return {
              id,
              title: item.title || 'Tin tức Nhật Bản',
              category: feed.category,
              categoryLabel: feed.category === 'economy' ? '📈 Kinh tế & Tỷ giá' : feed.category === 'life' ? '🗾 Đời sống & Visa' : feed.category === 'culture' ? '🌸 Văn hóa & Tiếng Nhật Dễ' : '🏛️ Thời sự & Xã hội',
              level: feed.category === 'culture' ? 'N4' : 'N2',
              source: feed.source,
              date: item.pubDate ? item.pubDate.split(' ')[0] : new Date().toISOString().split('T')[0],
              link: item.link,
              image: item.thumbnail || item.enclosure?.link || FALLBACK_IMAGES[feed.category] || FALLBACK_IMAGES.society,
              summary: rawDesc.slice(0, 180) + (rawDesc.length > 180 ? '...' : ''),
              content: rawDesc || item.title || '',
              viTranslation: '',
              isLive: true
            };
          });
          allFetchedItems = [...allFetchedItems, ...items];
        }
      }
    } catch (e) {
      // 2. Fallback to AllOrigins raw XML fetch
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`;
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 4000);
        const xmlRes = await fetch(proxyUrl, { signal: controller2.signal });
        clearTimeout(timeoutId2);
        if (xmlRes.ok) {
          const xmlText = await xmlRes.text();
          const xmlItems = parseRssXml(xmlText, feed.source, feed.category);
          allFetchedItems = [...allFetchedItems, ...xmlItems];
        }
      } catch (proxyErr) {
        console.warn(`Could not fetch live feed ${feed.source}:`, e.message);
      }
    }
  }

  // Merge with curated articles
  const combined = [...CURATED_JAPAN_NEWS, ...allFetchedItems];
  
  // Deduplicate by title
  const seen = new Set();
  const deduped = combined.filter(item => {
    if (!item.title || seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  });

  cachedNews = deduped;
  lastFetchTime = now;
  try {
    localStorage.setItem('omni_cached_news', JSON.stringify(deduped));
  } catch(e) {}

  return filterByCategory(deduped, category);
}

function filterByCategory(articles, category) {
  if (!category || category === 'all') return articles;
  return articles.filter(a => a.category === category);
}

/**
 * Detect JLPT grammar points present in the given Japanese text
 * Uses Bunpro N5-N1 patterns from master DB
 */
export function detectGrammarInArticle(text) {
  if (!text || typeof text !== 'string') return [];
  const grammarList = localMasterDb.grammar || [];
  if (grammarList.length === 0) return [];

  const foundGrammar = [];
  const seenPatterns = new Set();

  for (const g of grammarList) {
    if (!g.title || !g.pattern) continue;
    const cleanPattern = g.pattern.replace(/[〜~]/g, '').trim();
    // Only detect patterns of length >= 2 to avoid false single-character matches
    if (cleanPattern.length < 2) continue;

    if (text.includes(cleanPattern) && !seenPatterns.has(g.title)) {
      seenPatterns.add(g.title);
      foundGrammar.push({
        id: g.id,
        level: g.level || 'N3',
        pattern: g.pattern,
        title: g.title,
        meaning: g.meaning,
        explanation: g.explanation,
        examples: g.examples || []
      });
    }
  }

  // Sort by JLPT Level (N5 -> N1)
  const LEVEL_ORDER = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
  return foundGrammar.sort((a, b) => (LEVEL_ORDER[a.level] || 99) - (LEVEL_ORDER[b.level] || 99));
}

/**
 * On-demand translation helper for live news articles
 */
export async function translateArticleToVi(japaneseText) {
  if (!japaneseText) return '';
  try {
    const encoded = encodeURIComponent(japaneseText.slice(0, 500));
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encoded}&langpair=ja|vi`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    }
  } catch (err) {
    console.warn('MyMemory translation error:', err);
  }

  // Fallback to Google Translate API client-side
  try {
    const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(japaneseText.slice(0, 500))}`;
    const gRes = await fetch(gUrl);
    if (gRes.ok) {
      const gData = await gRes.json();
      if (Array.isArray(gData) && Array.isArray(gData[0])) {
        return gData[0].map(item => item[0]).join('');
      }
    }
  } catch (gErr) {
    console.error('Translation fallback error:', gErr);
  }

  return 'Bản dịch tự động đang được xử lý...';
}

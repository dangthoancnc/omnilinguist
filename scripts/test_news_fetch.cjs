const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function testNHK() {
  const urls = [
    { cat: 'Thời sự tổng hợp', url: 'https://www3.nhk.or.jp/rss/news/cat0.xml' },
    { cat: 'Xã hội', url: 'https://www3.nhk.or.jp/rss/news/cat1.xml' },
    { cat: 'Kinh tế', url: 'https://www3.nhk.or.jp/rss/news/cat5.xml' },
    { cat: 'Văn hóa đời sống', url: 'https://www3.nhk.or.jp/rss/news/cat3.xml' }
  ];

  for (const item of urls) {
    const res = await fetchUrl(item.url);
    console.log(`[NHK ${item.cat}] Status: ${res.statusCode}, len: ${res.data.length}`);
    const items = res.data.split('<item>').slice(1, 3);
    items.forEach((it, idx) => {
      const titleMatch = it.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
      const descMatch = it.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
      const pubMatch = it.match(/<pubDate>(.*?)<\/pubDate>/);
      console.log(`  (${idx+1}) ${titleMatch ? titleMatch[1] : ''}`);
      console.log(`      ${descMatch ? descMatch[1].slice(0, 120).replace(/<[^>]+>/g, '').trim() : ''}`);
      console.log(`      Date: ${pubMatch ? pubMatch[1] : ''}`);
    });
  }
}

testNHK();

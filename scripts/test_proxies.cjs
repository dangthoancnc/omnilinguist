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

async function testProxies() {
  const target = encodeURIComponent('https://www3.nhk.or.jp/rss/news/cat0.xml');
  const proxies = [
    { name: 'AllOrigins', url: `https://api.allorigins.win/raw?url=${target}` },
    { name: 'CorsProxyIO', url: `https://corsproxy.io/?url=${target}` },
    { name: 'CodeTabs', url: `https://api.codetabs.com/v1/proxy?quest=${target}` }
  ];

  for (const p of proxies) {
    try {
      console.log(`Testing proxy ${p.name}...`);
      const res = await fetchUrl(p.url);
      console.log(`[${p.name}] Status: ${res.statusCode}, len: ${res.data.length}, contains <item>: ${res.data.includes('<item>')}`);
    } catch (e) {
      console.error(`[${p.name}] Error:`, e.message);
    }
  }
}

testProxies();

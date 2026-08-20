const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  try {
    console.log('Fetching kanji dataset from GitHub raw...');
    const raw = await fetchUrl('https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json');
    const parsed = JSON.parse(raw);
    console.log('Successfully fetched kanji count:', Object.keys(parsed).length);
    fs.writeFileSync(path.join(__dirname, 'raw_kanji.json'), JSON.stringify(parsed, null, 2));
    console.log('Saved to scripts/raw_kanji.json');
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

run();

const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      if (res.statusCode !== 200) return resolve(null);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(null));
  });
}

async function testSources() {
  const sources = [
    'https://raw.githubusercontent.com/cjkvi/cjkvi-dict/master/kvietnamese.txt',
    'https://raw.githubusercontent.com/krmanik/kanji-dataset/master/kanji.json',
    'https://raw.githubusercontent.com/mitchellmebane/Unihan-json/master/kMandarin.json',
    'https://raw.githubusercontent.com/skishore/makemeahanzi/master/graphics.txt',
    'https://raw.githubusercontent.com/mwh/monash-kanji-database/master/kanjidic2.xml'
  ];

  for (const url of sources) {
    console.log('Testing url:', url);
    const res = await fetchUrl(url);
    if (res) {
      console.log('✅ Found! Length:', res.length);
      fs.writeFileSync(path.join(__dirname, path.basename(url)), res.slice(0, 500000));
    } else {
      console.log('❌ Not found');
    }
  }
}

testSources();

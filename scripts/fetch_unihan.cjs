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

async function fetchUnihan() {
  const urls = [
    'https://raw.githubusercontent.com/unicode-org/unihan-database/main/Unihan_Readings.txt',
    'https://raw.githubusercontent.com/cjkvi/cjkvi-data/master/Unihan_Readings.txt',
    'https://raw.githubusercontent.com/kfcd/unihan/master/Unihan_Readings.txt'
  ];

  for (const url of urls) {
    console.log('Trying:', url);
    const data = await fetchUrl(url);
    if (data) {
      console.log('✅ Found Unihan_Readings! Length:', data.length);
      fs.writeFileSync(path.join(__dirname, 'Unihan_Readings.txt'), data);
      break;
    }
  }
}

fetchUnihan();

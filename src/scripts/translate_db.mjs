import fs from 'fs';
import https from 'https';

const fetchTranslation = (textArray) => {
  return new Promise((resolve, reject) => {
    const q = textArray.join('\n');
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(q);
    
    https.get(url, res => {
      let r = '';
      res.on('data', c => r += c);
      res.on('end', () => {
        try {
          const data = JSON.parse(r);
          const translated = data[0].map(x => x[0].replace(/\n$/, '').trim());
          resolve(translated);
        } catch(e) {
          console.log('Error parsing response:', e.message);
          resolve(textArray); // Fallback to original
        }
      });
    }).on('error', reject);
  });
};

const delay = ms => new Promise(r => setTimeout(r, ms));

async function processVocab() {
  console.log('Reading vocab.json...');
  const vocabPath = './src/data/vocab.json';
  const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
  
  const chunkSize = 50;
  for (let i = 0; i < vocab.length; i += chunkSize) {
    const chunk = vocab.slice(i, i + chunkSize);
    const textArray = chunk.map(v => v.vi || v.word || ''); // v.vi contains English currently
    
    console.log(`Translating Vocab chunk ${i} to ${i + chunkSize}...`);
    const translated = await fetchTranslation(textArray);
    
    for (let j = 0; j < chunk.length; j++) {
      if (translated[j]) {
        chunk[j].en = chunk[j].vi; // Backup English
        chunk[j].vi = translated[j]; // Set Vietnamese
      }
    }
    
    fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2));
    await delay(500); // Prevent rate limit
  }
  console.log('Vocab translation complete!');
}

async function processKanji() {
  console.log('Reading kanji.json...');
  const kanjiPath = './src/data/kanji.json';
  const kanji = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));
  
  const chunkSize = 50;
  for (let i = 0; i < kanji.length; i += chunkSize) {
    const chunk = kanji.slice(i, i + chunkSize);
    const textArray = chunk.map(k => k.meanings.join(', '));
    
    console.log(`Translating Kanji chunk ${i} to ${i + chunkSize}...`);
    const translated = await fetchTranslation(textArray);
    
    for (let j = 0; j < chunk.length; j++) {
      if (translated[j]) {
        chunk[j].vi_meanings = translated[j].split(',').map(s => s.trim());
      }
    }
    
    fs.writeFileSync(kanjiPath, JSON.stringify(kanji, null, 2));
    await delay(500);
  }
  console.log('Kanji translation complete!');
}

async function run() {
  await processVocab();
  await processKanji();
  console.log('All DB translations finished!');
}

run();

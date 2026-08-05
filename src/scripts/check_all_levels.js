import fs from 'fs';
try {
  const db = JSON.parse(fs.readFileSync('./src/data/jlpt_master_db.json', 'utf8'));
  ['N5', 'N4', 'N3', 'N2', 'N1'].forEach(lvl => {
    const items = db.vocabulary.filter(v => v.level === lvl);
    const uniqueWords = [...new Set(items.map(v => v.word))];
    console.log(`Level ${lvl}: total ${items.length} rows, UNIQUE words count: ${uniqueWords.length}`);
    console.log(`First 5 unique words in ${lvl}:`, uniqueWords.slice(0, 5));
  });
} catch(e) {
  console.error(e);
}

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const raw = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(raw);

console.log('Total kanji in DB:', db.kanji ? db.kanji.length : 0);
if (db.kanji) {
  const counts = {};
  db.kanji.forEach(k => counts[k.level] = (counts[k.level] || 0) + 1);
  console.log('Kanji counts by level:', counts);
  console.log('Sample kanji:', JSON.stringify(db.kanji.slice(0, 3), null, 2));
}

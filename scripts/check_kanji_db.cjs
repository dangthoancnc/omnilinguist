const fs = require('fs');
const path = require('path');

const masterDb = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/jlpt_master_db.json'), 'utf8'));

console.log('Master DB Kanji array length:', masterDb.kanji ? masterDb.kanji.length : 0);
if (masterDb.kanji && masterDb.kanji.length > 0) {
  console.log('Sample Kanji:', masterDb.kanji.slice(0, 5));
} else {
  console.log('⚠️ Master DB has 0 Kanji items!');
}

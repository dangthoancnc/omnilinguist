const fs = require('fs');
const path = require('path');

const masterDb = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/jlpt_master_db.json'), 'utf8'));

console.log('Master DB Vocab count:', masterDb.vocabulary ? masterDb.vocabulary.length : 0);

const counts = {};
if (masterDb.vocabulary) {
  masterDb.vocabulary.forEach(v => {
    const lvl = (v.level || 'N3').toUpperCase();
    counts[lvl] = (counts[lvl] || 0) + 1;
  });
}
console.log('Vocab level counts:', counts);

const fs = require('fs');
const path = require('path');

// We will load the existing jlpt_master_db.json, replace or expand the `kanji` array with comprehensive N5, N4, N3, N2, N1 sets.
const dbPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const raw = fs.readFileSync(dbPath, 'utf8');
const masterDb = JSON.parse(raw);

console.log('Current vocabulary count:', masterDb.vocabulary ? masterDb.vocabulary.length : 0);
console.log('Current grammar count:', masterDb.grammar ? masterDb.grammar.length : 0);
console.log('Current kanji count:', masterDb.kanji ? masterDb.kanji.length : 0);

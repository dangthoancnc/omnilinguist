const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const grammarPath = path.join(__dirname, '../src/data/jlpt_grammar_full.json');

const masterDb = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const fullGrammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));

console.log('Existing vocab count:', masterDb.vocabulary ? masterDb.vocabulary.length : 0);
console.log('Existing kanji count:', masterDb.kanji ? masterDb.kanji.length : 0);
console.log('Existing grammar count:', masterDb.grammar ? masterDb.grammar.length : 0);

// Merge full grammar into masterDb
masterDb.grammar = fullGrammar;

fs.writeFileSync(masterPath, JSON.stringify(masterDb, null, 2), 'utf8');
console.log('🎉 Successfully updated jlpt_master_db.json with', fullGrammar.length, 'grammar points covering N5 to N1!');

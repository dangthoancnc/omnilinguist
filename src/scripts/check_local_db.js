import fs from 'fs';
try {
  const data = JSON.parse(fs.readFileSync('./src/data/jlpt_master_db.json', 'utf8'));
  console.log('Vocabulary length:', data.vocabulary ? data.vocabulary.length : 'none');
  console.log('Kanji length:', data.kanji ? data.kanji.length : 'none');
  console.log('Grammar length:', data.grammar ? data.grammar.length : 'none');
  if (data.vocabulary && data.vocabulary.length > 0) {
    const levels = {};
    data.vocabulary.forEach(v => {
      levels[v.level || 'undefined'] = (levels[v.level || 'undefined'] || 0) + 1;
    });
    console.log('Vocabulary levels:', levels);
  }
} catch (e) {
  console.error(e);
}

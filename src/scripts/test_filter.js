import fs from 'fs';
try {
  const db = JSON.parse(fs.readFileSync('./src/data/jlpt_master_db.json', 'utf8'));
  const level = 'N3';
  const masterVocab = (db.vocabulary || []).map((v, i) => ({
    id: v.id || 'v_' + i,
    level: v.level || 'N3',
    word: v.word,
    reading: v.reading || '',
    vi: v.vi || v.meaning || '',
    meaning: v.vi || v.meaning || '',
    type: v.type || (Array.isArray(v.tags) ? v.tags[0] : 'Từ vựng'),
    tags: v.tags || [],
    examples: v.examples || v.example || []
  }));
  const seen = new Set();
  const res = masterVocab.filter(v => {
    if (v.level !== level) return false;
    if (seen.has(v.word)) return false;
    seen.add(v.word);
    return true;
  });
  console.log('Filtered N3 count:', res.length);
  console.log('First 5 N3 words:', res.slice(0, 5).map(x => x.word));
} catch(e) {
  console.error(e);
}

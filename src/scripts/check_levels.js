import fs from 'fs';
try {
  const db = JSON.parse(fs.readFileSync('./src/data/jlpt_master_db.json', 'utf8'));
  const levelCounts = {};
  db.vocabulary.forEach(v => {
    const l = String(v.level).trim();
    levelCounts[l] = (levelCounts[l] || 0) + 1;
  });
  console.log('Exact level breakdown:', levelCounts);
  console.log('Sample N3 items in json:', db.vocabulary.filter(v => String(v.level).trim() === 'N3').slice(0, 10).map(v => v.word));
} catch(e) {
  console.error(e);
}

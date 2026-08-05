import fs from 'fs';
try {
  const db = JSON.parse(fs.readFileSync('./src/data/jlpt_master_db.json', 'utf8'));
  console.log('Sample vocab items:', JSON.stringify(db.vocabulary.slice(0, 3), null, 2));
} catch(e) {
  console.error(e);
}

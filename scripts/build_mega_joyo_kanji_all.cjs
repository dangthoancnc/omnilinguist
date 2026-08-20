const fs = require('fs');
const path = require('path');

const radicals = require('./kanji_radicals.cjs');
const kanjiN5 = require('./kanji_n5.cjs');
const kanjiN4 = require('./kanji_n4.cjs');
const kanjiN3 = require('./kanji_n3.cjs');
const kanjiN2 = require('./kanji_n2.cjs');
const kanjiN1 = require('./kanji_n1.cjs');

// We also load the enriched ones from previous step
const fullList = [
  ...radicals,
  ...kanjiN5,
  ...kanjiN4,
  ...kanjiN3,
  ...kanjiN2,
  ...kanjiN1
];

const seen = new Set();
const finalMaster = [];

for (const item of fullList) {
  if (!item.kanji) continue;
  const key = `${item.level}_${item.kanji}`;
  if (seen.has(key)) continue;
  seen.add(key);

  finalMaster.push({
    id: `k_${item.level === 'Bộ Thủ' ? 'bushu' : item.level.toLowerCase()}_${String(finalMaster.length + 1).padStart(4, '0')}`,
    kanji: item.kanji,
    level: item.level,
    meanings: item.meanings || item.vi_meanings || [],
    onyomi: item.onyomi || [],
    kunyomi: item.kunyomi || [],
    vi_meanings: item.vi_meanings || item.meanings || []
  });
}

console.log('Total Master items:', finalMaster.length);
const counts = {};
finalMaster.forEach(k => counts[k.level] = (counts[k.level] || 0) + 1);
console.log('Final counts:', counts);

// Update jlpt_master_db.json
const dbPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
dbContent.kanji = finalMaster;
fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2), 'utf8');

console.log('✅ jlpt_master_db.json updated successfully with all 214+ Bộ Thủ and full N5-N1!');

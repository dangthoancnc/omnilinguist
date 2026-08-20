const fs = require('fs');
const path = require('path');

const radicals = require('./kanji_radicals.cjs');
const kanjiN5 = require('./kanji_n5.cjs');
const kanjiN4 = require('./kanji_n4.cjs');
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw_kanji.json'), 'utf8'));

const allKanjiCards = [];
const seenChars = new Set();

// 1. Add all 228 Radicals (Bộ Thủ)
for (const r of radicals) {
  const key = `Bộ Thủ_${r.kanji}`;
  if (seenChars.has(key)) continue;
  seenChars.add(key);
  allKanjiCards.push({
    id: `k_bushu_${String(allKanjiCards.length + 1).padStart(4, '0')}`,
    kanji: r.kanji,
    level: 'Bộ Thủ',
    meanings: r.meanings || r.vi_meanings,
    onyomi: r.onyomi || [],
    kunyomi: r.kunyomi || [],
    vi_meanings: r.vi_meanings || r.meanings
  });
}

// 2. Add all curated 103 N5 Kanji
for (const k of kanjiN5) {
  const key = `N5_${k.kanji}`;
  if (seenChars.has(key)) continue;
  seenChars.add(key);
  allKanjiCards.push({
    id: `k_n5_${String(allKanjiCards.length + 1).padStart(4, '0')}`,
    kanji: k.kanji,
    level: 'N5',
    meanings: k.meanings,
    onyomi: k.onyomi,
    kunyomi: k.kunyomi,
    vi_meanings: k.meanings
  });
}

// 3. Add all curated 181 N4 Kanji
for (const k of kanjiN4) {
  const key = `N4_${k.kanji}`;
  if (seenChars.has(key)) continue;
  seenChars.add(key);
  allKanjiCards.push({
    id: `k_n4_${String(allKanjiCards.length + 1).padStart(4, '0')}`,
    kanji: k.kanji,
    level: 'N4',
    meanings: k.meanings,
    onyomi: k.onyomi,
    kunyomi: k.kunyomi,
    vi_meanings: k.meanings
  });
}

// 4. Add all remaining Joyo Kanji (N3, N2, N1)
const chars = Object.keys(raw);

for (const ch of chars) {
  const item = raw[ch];
  let level = null;
  
  if (item.jlpt_new === 5) level = 'N5';
  else if (item.jlpt_new === 4) level = 'N4';
  else if (item.jlpt_new === 3) level = 'N3';
  else if (item.jlpt_new === 2) level = 'N2';
  else if (item.jlpt_new === 1) level = 'N1';
  else if (item.grade >= 1 && item.grade <= 2) level = 'N5';
  else if (item.grade === 3) level = 'N4';
  else if (item.grade === 4) level = 'N3';
  else if (item.grade === 5 || item.grade === 6) level = 'N2';
  else if (item.grade === 8) level = 'N1';

  if (!level) continue;

  const key = `${level}_${ch}`;
  if (seenChars.has(key)) continue;
  seenChars.add(key);

  allKanjiCards.push({
    id: `k_${level.toLowerCase()}_${String(allKanjiCards.length + 1).padStart(4, '0')}`,
    kanji: ch,
    level,
    meanings: item.meanings || [],
    onyomi: item.readings_on || [],
    kunyomi: item.readings_kun || [],
    vi_meanings: item.meanings || []
  });
}

console.log('Total Master Kanji Cards Generated:', allKanjiCards.length);
const counts = { 'Bộ Thủ': 0, N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
allKanjiCards.forEach(k => counts[k.level] = (counts[k.level] || 0) + 1);
console.log('Final Level Counts:', counts);

// Update database
const dbPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
dbContent.kanji = allKanjiCards;
fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2), 'utf8');

console.log('✅ jlpt_master_db.json successfully updated with COMPLETE Joyo Kanji set!');

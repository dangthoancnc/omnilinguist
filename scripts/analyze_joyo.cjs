const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw_kanji.json'), 'utf8'));

// Filter all Joyo and JLPT kanji
const joyoList = [];
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

  if (level) {
    joyoList.push({
      kanji: ch,
      level,
      grade: item.grade,
      strokes: item.strokes,
      meanings: item.meanings || [],
      onyomi: item.readings_on || [],
      kunyomi: item.readings_kun || []
    });
  }
}

console.log('Total Joyo / JLPT Kanji found:', joyoList.length);
const counts = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
joyoList.forEach(k => counts[k.level]++);
console.log('Level distribution:', counts);

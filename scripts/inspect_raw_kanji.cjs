const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw_kanji.json'), 'utf8'));
const keys = Object.keys(data);
console.log('Sample item (日):', data['日']);
console.log('Sample item (一):', data['一']);

const jlptCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, none: 0 };
for (const k of keys) {
  const item = data[k];
  const jlpt = item.jlpt_new || item.jlpt;
  if (jlpt) jlptCounts[jlpt] = (jlptCounts[jlpt] || 0) + 1;
  else jlptCounts.none++;
}
console.log('JLPT counts in raw_kanji.json:', jlptCounts);

// Also check Joyo grades
const gradeCounts = {};
for (const k of keys) {
  const item = data[k];
  if (item.grade) gradeCounts[item.grade] = (gradeCounts[item.grade] || 0) + 1;
}
console.log('Grade counts:', gradeCounts);

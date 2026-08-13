const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/anki_extracted.json'), 'utf8'));
const mazii = data.filter(d => d.source_deck.includes('Mazii'));

console.log('Mazii Cards total:', mazii.length);

const samples = mazii.slice(0, 30).map((m, i) => {
  return `[${i}] FLDS: ${JSON.stringify(m.flds.slice(0, 150))}`;
});

console.log(samples.join('\n'));

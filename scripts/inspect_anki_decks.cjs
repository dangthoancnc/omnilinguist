const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/anki_extracted.json'), 'utf8'));

console.log('Total cards in anki_extracted.json:', data.length);

const deck1 = data.filter(d => d.source_deck === '848_im_Ng_Php_N5-N1.apkg');
const deck2 = data.filter(d => d.source_deck.includes('Mazii'));

console.log('Deck 1 (848 Grammar):', deck1.length);
console.log('Deck 2 (Mazii 2218):', deck2.length);

// Print samples of Deck 2
console.log('\n--- Deck 2 (Mazii) Samples ---');
deck2.slice(0, 10).forEach((item, i) => {
  console.log(`[${i}]`, item.flds.slice(0, 100).replace(/\n/g, ' '));
});

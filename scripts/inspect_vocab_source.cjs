const fs = require('fs');
const path = require('path');

const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/anki_extracted.json'), 'utf8'));

const decks = {};
cards.forEach(c => { decks[c.source_deck] = (decks[c.source_deck] || 0) + 1; });
console.log('Decks in anki_extracted.json:', decks);

// Print samples of cards
console.log('\nFirst 5 cards sample:');
cards.slice(0, 5).forEach((c, i) => {
  console.log(`[${i}] Deck: ${c.source_deck} | Flds: ${JSON.stringify(c.flds.slice(0, 100))}`);
});

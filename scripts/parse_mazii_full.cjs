const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/anki_extracted.json'), 'utf8'));

console.log('Parsing all Mazii deck cards...');

const maziiCards = data.filter(d => d.source_deck.includes('Mazii'));
console.log('Mazii Cards total:', maziiCards.length);

const parsedGrammarList = [];
const seenKeys = new Set();

maziiCards.forEach((item, idx) => {
  const flds = item.flds || '';
  if (!flds.trim()) return;

  const parts = flds.split('\x1f');
  const front = (parts[0] || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  const back = (parts[1] || parts[0] || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

  // Front format: "N1 わけても Đặc biệt là..." or "N3 ～にする Làm cho..."
  let level = 'N3';
  let pattern = '';
  let meaning = '';

  const tokens = cleanFront(front).split(' ');
  if (tokens.length >= 2 && /^N[1-5]$/i.test(tokens[0])) {
    level = tokens[0].toUpperCase();
    pattern = tokens[1];
    meaning = tokens.slice(2).join(' ') || pattern;
  } else {
    const match = cleanFront(front).match(/^(N[1-5])\s+([^\s]+)\s*(.*)$/i);
    if (match) {
      level = match[1].toUpperCase();
      pattern = match[2];
      meaning = match[3] || pattern;
    } else {
      pattern = cleanFront(front).slice(0, 30);
      meaning = cleanFront(front);
    }
  }

  pattern = pattern.replace(/^[0-9\.\s]+/, '').replace(/[～〜\s]/g, '').trim();
  if (!pattern || pattern.length > 50) return;

  const key = `${pattern}_${level}`;
  if (!seenKeys.has(key)) {
    seenKeys.add(key);

    parsedGrammarList.push({
      id: `g_mazii_${idx}`,
      pattern: pattern,
      title: pattern,
      level: level,
      meaning: meaning || pattern,
      formation: [`${pattern} (${level})`],
      explanation: back.slice(0, 200) || `Mẫu ngữ pháp JLPT ${level}`,
      examples: [{ jp: `${pattern}の例文です。`, vi: meaning || `Ví dụ về ${pattern}` }]
    });
  }
});

function cleanFront(str) {
  return str.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

console.log('🎉 Extracted Unique Mazii Grammar Points:', parsedGrammarList.length);

const counts = {};
parsedGrammarList.forEach(g => counts[g.level] = (counts[g.level] || 0) + 1);
console.log('Mazii Level Counts:', counts);

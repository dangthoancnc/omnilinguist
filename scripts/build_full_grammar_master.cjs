const fs = require('fs');
const path = require('path');

const ankiData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/anki_extracted.json'), 'utf8'));

console.log('Extracting ALL Anki cards with exact \\x1f field parsing...');

const masterGrammarList = [];
const seenKeys = new Set();

ankiData.forEach((item, idx) => {
  const flds = item.flds || '';
  if (!flds.trim()) return;

  const parts = flds.split('\x1f').map(p => p.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim());

  let level = 'N3';
  let pattern = '';
  let meaning = '';
  let formation = [];
  let explanation = '';
  let examples = [];

  if (item.source_deck === '848_im_Ng_Php_N5-N1.apkg') {
    // Deck 1 (848 Grammar)
    const front = parts[0] || '';
    const back = parts[1] || parts[0] || '';

    const match = front.match(/^(?:\d+[\.\s]*)?([^\(\x1f]+?)(?:\s*\((.*?)\))?\s*(.*)$/);
    if (match) {
      pattern = match[1].trim();
      meaning = match[3] ? match[3].trim() : (match[2] || pattern);
    } else {
      pattern = front.split('\n')[0].trim();
      meaning = front;
    }

    if (idx < 140) level = 'N5';
    else if (idx < 320) level = 'N4';
    else if (idx < 580) level = 'N3';
    else if (idx < 780) level = 'N2';
    else level = 'N1';

    formation = [pattern];
    explanation = back.slice(0, 200) || `Cấu trúc ngữ pháp ${level}`;
    examples = [{ jp: `${pattern}の例文です。`, vi: meaning || 'Ví dụ câu tiếng Nhật' }];

  } else {
    // Deck 2 (Mazii 2218 cards) - Field 0: Level, Field 1: Pattern, Field 2: Meaning, Field 3: Formation, Field 4: Explanation, Field 5+: Examples
    if (parts.length >= 3 && /^N[1-5]$/i.test(parts[0])) {
      level = parts[0].toUpperCase();
      pattern = parts[1];
      meaning = parts[2] || pattern;
      
      const formText = parts[3] || '';
      formation = formText ? [formText] : [pattern];

      explanation = parts[4] || `Mẫu ngữ pháp JLPT ${level} chuẩn.`;

      const exJp = parts[5] || '';
      const exVi = parts[6] || meaning || 'Ví dụ minh họa';
      if (exJp) {
        examples.push({ jp: exJp, vi: exVi });
      }
    } else {
      // Fallback text match
      const rawFront = parts[0] || '';
      const m = rawFront.match(/^(N[1-5])\s+([^\s]+)\s*(.*)$/i);
      if (m) {
        level = m[1].toUpperCase();
        pattern = m[2];
        meaning = m[3] || pattern;
      }
    }
  }

  pattern = pattern.replace(/^\d+[\.\s]*/, '').replace(/[～〜]/g, '').trim();
  if (!pattern || pattern.length < 1 || pattern.length > 50) return;

  const key = `${pattern.toLowerCase()}_${level}`;
  if (!seenKeys.has(key)) {
    seenKeys.add(key);
    masterGrammarList.push({
      id: `g_master_${idx}`,
      pattern: pattern,
      title: pattern,
      level: level,
      meaning: meaning || pattern,
      formation: formation.length > 0 ? formation : [pattern],
      explanation: explanation || `Mẫu ngữ pháp JLPT ${level} chuẩn.`,
      examples: examples.length > 0 ? examples : [{ jp: `${pattern}の例文です。`, vi: meaning || `Ví dụ về ${pattern}.` }]
    });
  }
});

console.log('🎉 TOTAL EXTRACTED UNIQUE JLPT GRAMMAR POINTS:', masterGrammarList.length);

const counts = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
masterGrammarList.forEach(g => {
  if (counts[g.level] !== undefined) counts[g.level]++;
});
console.log('Breakdown by Level:', counts);

// Save to src/data/jlpt_grammar_full.json and jlpt_master_db.json
const fullPath = path.join(__dirname, '../src/data/jlpt_grammar_full.json');
fs.writeFileSync(fullPath, JSON.stringify(masterGrammarList, null, 2), 'utf8');

const masterPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
masterData.grammar = masterGrammarList;
fs.writeFileSync(masterPath, JSON.stringify(masterData, null, 2), 'utf8');

console.log('💾 Successfully saved full master dataset to jlpt_grammar_full.json & jlpt_master_db.json!');

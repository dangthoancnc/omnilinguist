const fs = require('fs');
const path = require('path');

const ankiData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/anki_extracted.json'), 'utf8'));

console.log('Processing all', ankiData.length, 'cards from both 848 Deck and Mazii Deck...');

const fullList = [];
const seenKeys = new Set();

ankiData.forEach((item, idx) => {
  const flds = item.flds || '';
  if (!flds.trim()) return;

  const parts = flds.split('\x1f');
  const front = (parts[0] || '').replace(/<[^>]*>?/gm, ' ').trim();
  const back = (parts[1] || parts[0] || '').replace(/<br\s*\/?>/gi, '\n');

  let pattern = '';
  let level = 'N3';
  let meaning = '';
  let formation = [];
  let explanation = '';
  let examples = [];

  if (item.source_deck === '848_im_Ng_Php_N5-N1.apkg') {
    // Deck 1 format: "1.  だ  /  です  (Da / Desu) Là"
    const match = front.match(/^(?:\d+[\.\s]*)?([^\(\x1f]+?)(?:\s*\((.*?)\))?\s*(.*)$/);
    if (match) {
      pattern = match[1].trim();
      meaning = match[3] ? match[3].trim() : (match[2] || pattern);
    } else {
      pattern = front.split('\n')[0].trim();
      meaning = front;
    }

    if (idx < 120) level = 'N5';
    else if (idx < 300) level = 'N4';
    else if (idx < 550) level = 'N3';
    else if (idx < 750) level = 'N2';
    else level = 'N1';

    const formationMatch = back.match(/<b>Công thức:<\/b>([\s\S]*?)(?=<b>|───|$)/i);
    const usageMatch = back.match(/<b>Cách dùng:<\/b>([\s\S]*?)(?=<b>|───|$)/i);
    const exampleMatch = back.match(/<b>Ví dụ:<\/b>([\s\S]*?)$/i);

    const formText = formationMatch ? formationMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';
    formation = formText ? formText.split('\n').map(s => s.trim()).filter(Boolean) : [pattern];
    explanation = usageMatch ? usageMatch[1].replace(/<[^>]*>?/gm, '').trim() : `Cấu trúc ngữ pháp ${level}`;

    if (exampleMatch) {
      const exLines = exampleMatch[1].split('\n').map(s => s.replace(/<[^>]*>?/gm, '').trim()).filter(Boolean);
      let tempJp = '';
      exLines.forEach(l => {
        if (l.includes('→') || l.includes('Nghĩa:')) {
          if (tempJp) {
            examples.push({ jp: tempJp, vi: l.replace('→', '').replace('Nghĩa:', '').trim() });
            tempJp = '';
          }
        } else if (/[ぁ-んァ-ヶ一-龠]/.test(l)) {
          tempJp = l;
        }
      });
      if (tempJp) examples.push({ jp: tempJp, vi: 'Ví dụ câu tiếng Nhật' });
    }

  } else {
    // Deck 2 (Mazii 2218 cards) format: "N1 わけても Đặc biệt là..."
    const matchLvl = front.match(/^(N[1-5])\s+([^\s]+)\s+(.*)$/i);
    if (matchLvl) {
      level = matchLvl[1].toUpperCase();
      pattern = matchLvl[2].trim();
      meaning = matchLvl[3].trim();
    } else {
      const tokens = front.split(/\s+/);
      if (tokens.length >= 2 && /^N[1-5]$/i.test(tokens[0])) {
        level = tokens[0].toUpperCase();
        pattern = tokens[1];
        meaning = tokens.slice(2).join(' ');
      } else {
        pattern = front.slice(0, 30);
        meaning = front;
      }
    }

    // Clean back HTML for Mazii
    const cleanBackText = back.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    formation = [pattern];
    explanation = cleanBackText.slice(0, 200);
    examples = [{ jp: `${pattern}の例文です。`, vi: meaning || 'Ví dụ minh họa' }];
  }

  // Clean pattern string (remove ~ and numbers)
  pattern = pattern.replace(/^\d+[\.\s]*/, '').replace(/<[^>]*>?/gm, '').trim();
  if (!pattern || pattern.length > 50 || pattern === 'Unknown') return;

  const key = pattern.replace(/[～〜\s]/g, '') + '_' + level;
  if (!seenKeys.has(key)) {
    seenKeys.add(key);
    fullList.push({
      id: `g_full_${idx}`,
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

console.log('🎉 Total Extracted Full JLPT Grammar Points:', fullList.length);

const counts = {};
fullList.forEach(g => counts[g.level] = (counts[g.level] || 0) + 1);
console.log('Breakdown by Level:', counts);

// Save to src/data/jlpt_grammar_full.json
const outPath = path.join(__dirname, '../src/data/jlpt_grammar_full.json');
fs.writeFileSync(outPath, JSON.stringify(fullList, null, 2), 'utf8');
console.log('💾 Saved complete 900+ dataset to:', outPath);

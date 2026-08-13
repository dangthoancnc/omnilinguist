const fs = require('fs');
const path = require('path');

const ankiData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/anki_extracted.json'), 'utf8'));

console.log('Processing', ankiData.length, 'raw Anki cards...');

const parsedGrammarList = [];
const seenPatterns = new Set();

ankiData.forEach((item, idx) => {
  const rawText = item.flds || '';
  if (!rawText.trim()) return;

  // Split front and back of card by \x1f or \n\n
  const parts = rawText.split('\x1f');
  const front = parts[0] || '';
  const back = parts[1] || parts[0] || '';

  // Extract Pattern & Title
  let pattern = '';
  let meaning = '';
  
  // Clean front text
  const cleanFront = front.replace(/<[^>]*>?/gm, '').trim();
  const frontMatch = cleanFront.match(/^(?:\d+[\.\s]*)?([^\(\x1f]+?)(?:\s*\((.*?)\))?\s*(.*)$/);
  if (frontMatch) {
    pattern = frontMatch[1].trim();
    const subReading = frontMatch[2] ? frontMatch[2].trim() : '';
    meaning = frontMatch[3] ? frontMatch[3].trim() : (subReading || 'Cấu trúc ngữ pháp tiếng Nhật');
  } else {
    pattern = cleanFront.split('\n')[0].trim();
    meaning = cleanFront;
  }

  if (!pattern || pattern.length > 60) return;

  // Assign JLPT Level based on position/metadata
  let level = 'N3';
  if (idx < 120) level = 'N5';
  else if (idx < 300) level = 'N4';
  else if (idx < 550) level = 'N3';
  else if (idx < 750) level = 'N2';
  else if (idx < 1000) level = 'N1';
  else {
    // Mazii Deck level detection
    if (rawText.includes('N5')) level = 'N5';
    else if (rawText.includes('N4')) level = 'N4';
    else if (rawText.includes('N2')) level = 'N2';
    else if (rawText.includes('N1')) level = 'N1';
    else level = 'N3';
  }

  // Parse Back HTML into Formations, Explanations, and Examples
  const cleanBack = back.replace(/<br\s*\/?>/gi, '\n');
  
  const formationMatch = cleanBack.match(/<b>Công thức:<\/b>([\s\S]*?)(?=<b>|───|$)/i);
  const usageMatch = cleanBack.match(/<b>Cách dùng:<\/b>([\s\S]*?)(?=<b>|───|$)/i);
  const exampleMatch = cleanBack.match(/<b>Ví dụ:<\/b>([\s\S]*?)$/i);

  const formationText = formationMatch ? formationMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';
  const usageText = usageMatch ? usageMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';
  const exampleText = exampleMatch ? exampleMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';

  const formation = formationText ? formationText.split('\n').map(s => s.trim()).filter(Boolean) : [pattern];
  const explanation = usageText || 'Cấu trúc ngữ pháp JLPT ' + level;

  // Parse example sentences
  const examples = [];
  if (exampleText) {
    const lines = exampleText.split('\n').map(s => s.replace(/<[^>]*>?/gm, '').trim()).filter(Boolean);
    let tempJp = '';
    let tempVi = '';
    let tempRomaji = '';

    lines.forEach(line => {
      if (line.includes('→') || line.includes('Nghĩa:')) {
        tempVi = line.replace('→', '').replace('Nghĩa:', '').trim();
        if (tempJp) {
          examples.push({ jp: tempJp, vi: tempVi, romaji: tempRomaji });
          tempJp = ''; tempVi = ''; tempRomaji = '';
        }
      } else if (line.startsWith('(') && line.endsWith(')')) {
        tempRomaji = line.slice(1, -1).trim();
      } else if (/[ぁ-んァ-ヶ一-龠]/.test(line)) {
        if (tempJp) {
          examples.push({ jp: tempJp, vi: tempVi || 'Ví dụ câu tiếng Nhật', romaji: tempRomaji });
        }
        tempJp = line;
      }
    });

    if (tempJp) {
      examples.push({ jp: tempJp, vi: tempVi || 'Ví dụ câu tiếng Nhật', romaji: tempRomaji });
    }
  }

  // Deduplicate by pattern
  const normKey = pattern.replace(/\s+/g, '') + '_' + level;
  if (!seenPatterns.has(normKey)) {
    seenPatterns.add(normKey);
    parsedGrammarList.push({
      id: `g_anki_${idx}`,
      pattern: pattern,
      title: pattern,
      level: level,
      meaning: meaning || pattern,
      formation: formation,
      explanation: explanation,
      examples: examples.length > 0 ? examples : [{ jp: `${pattern}の例文です。`, vi: `Ví dụ về cấu trúc ${pattern}.` }]
    });
  }
});

console.log('✅ Parsed clean unique grammar entries:', parsedGrammarList.length);

const levelCounts = {};
parsedGrammarList.forEach(g => {
  levelCounts[g.level] = (levelCounts[g.level] || 0) + 1;
});
console.log('Breakdown by JLPT level:', levelCounts);

// Save to src/data/jlpt_grammar_full.json
const outputPath = path.join(__dirname, '../src/data/jlpt_grammar_full.json');
fs.writeFileSync(outputPath, JSON.stringify(parsedGrammarList, null, 2), 'utf8');
console.log('💾 Saved full grammar dataset to:', outputPath);

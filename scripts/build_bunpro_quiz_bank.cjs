const fs = require('fs');
const path = require('path');

const grammarList = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/jlpt_grammar_full.json'), 'utf8'));

console.log('Generating Bunpro Quiz Bank from', grammarList.length, 'master grammar points...');

const quizBank = [];
const levelMap = { N5: [], N4: [], N3: [], N2: [], N1: [] };

// Group patterns by level for dynamic distractor generation
grammarList.forEach(g => {
  if (levelMap[g.level]) {
    levelMap[g.level].push(g.pattern);
  }
});

// Helper to pick 3 random distractors from same level
function getDistractors(targetPattern, level) {
  const pool = (levelMap[level] || levelMap['N3']).filter(p => p !== targetPattern && p.length <= 15);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  // Fallbacks if pool is small
  const defaultDistractors = ['にして', 'にとって', 'において', 'について', 'として', 'に関して'];
  while (selected.length < 3) {
    const fallback = defaultDistractors[selected.length];
    if (!selected.includes(fallback) && fallback !== targetPattern) {
      selected.push(fallback);
    }
  }
  return selected;
}

grammarList.forEach((g, idx) => {
  const pattern = g.pattern.replace(/[～〜]/g, '').trim();
  if (!pattern) return;

  if (g.examples && g.examples.length > 0) {
    g.examples.forEach((ex, exIdx) => {
      const jp = typeof ex === 'string' ? ex : (ex.jp || '');
      const vi = typeof ex === 'object' ? (ex.vi || '') : g.meaning;

      // Filter out generic fallback sentences like "〜の例文です。"
      if (!jp || jp.includes('の例文です') || jp.includes('Ví dụ')) return;

      if (jp.includes(pattern)) {
        const promptSentence = jp.replace(pattern, ' ___ ');
        const distractors = getDistractors(pattern, g.level);
        const options = [pattern, ...distractors].sort(() => Math.random() - 0.5);

        quizBank.push({
          id: `quiz_${g.level.toLowerCase()}_${idx}_${exIdx}`,
          level: g.level || 'N3',
          pattern: pattern,
          promptSentence: promptSentence,
          target: pattern,
          synonyms: [pattern.replace(/~|～/g, '')],
          translation: vi || g.meaning,
          options: options,
          explanation: g.explanation || g.meaning
        });
      }
    });
  }
});

console.log('🎉 Total Real Bunpro Practice Questions Generated:', quizBank.length);

const quizCounts = {};
quizBank.forEach(q => quizCounts[q.level] = (quizCounts[q.level] || 0) + 1);
console.log('Questions breakdown by level:', quizCounts);

// Save to src/data/bunpro_quiz_bank.json
const outPath = path.join(__dirname, '../src/data/bunpro_quiz_bank.json');
fs.writeFileSync(outPath, JSON.stringify(quizBank, null, 2), 'utf8');
console.log('💾 Saved Bunpro Quiz Bank to:', outPath);

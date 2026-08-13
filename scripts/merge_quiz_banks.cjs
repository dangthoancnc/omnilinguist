const fs = require('fs');
const path = require('path');

const generatedBank = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/bunpro_quiz_bank.json'), 'utf8'));
const questionBank = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/questionBank.json'), 'utf8'));

console.log('Merging generated bank (', generatedBank.length, ') and questionBank (', questionBank.length, ')...');

const mergedBank = [...generatedBank];
const seenPrompts = new Set(generatedBank.map(q => q.promptSentence.replace(/\s+/g, '')));

questionBank.forEach((q, idx) => {
  if (q.category === 'grammar' && q.text && q.options && q.options.length === 4) {
    const prompt = q.text.replace(/[\(（]\s*[\)）]/g, ' ___ ');
    const normPrompt = prompt.replace(/\s+/g, '');
    const correctTarget = q.options[q.correctIndex !== undefined ? q.correctIndex : 0] || q.options[0];

    if (!seenPrompts.has(normPrompt) && correctTarget) {
      seenPrompts.add(normPrompt);
      mergedBank.push({
        id: `qb_${q.id || idx}`,
        level: q.level || 'N3',
        pattern: correctTarget,
        promptSentence: prompt,
        target: correctTarget,
        synonyms: [correctTarget.replace(/~|～/g, '')],
        translation: q.explanation || `Thực hành ngữ pháp ${q.level || 'N3'}`,
        options: q.options,
        explanation: q.explanation || `Đáp án đúng là [${correctTarget}].`
      });
    }
  }
});

console.log('🎉 TOTAL COMBINED REAL BUNPRO PRACTICE QUESTIONS:', mergedBank.length);

const finalCounts = {};
mergedBank.forEach(q => finalCounts[q.level] = (finalCounts[q.level] || 0) + 1);
console.log('Final Level Breakdown:', finalCounts);

// Save to src/data/bunpro_quiz_bank.json
const outPath = path.join(__dirname, '../src/data/bunpro_quiz_bank.json');
fs.writeFileSync(outPath, JSON.stringify(mergedBank, null, 2), 'utf8');
console.log('💾 Saved combined Quiz Bank to:', outPath);

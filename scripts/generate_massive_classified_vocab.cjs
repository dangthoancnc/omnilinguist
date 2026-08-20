/**
 * Comprehensive JLPT Vocabulary Generator with Importance & Frequency Classification
 * Levels: N5 (750+), N4 (700+), N3 (800+), N2 (800+), N1 (600+) -> Total 3,650+ words
 * Classification: Priority 1 (Core - Cốt lõi ⭐⭐⭐), Priority 2 (Common - Phổ biến ⭐⭐), Priority 3 (Advanced - Nâng cao ⭐)
 */
const fs = require('fs');
const path = require('path');

console.log('🚀 Generating 3,600+ Classified JLPT Vocabulary Dataset...');

const VOCAB_DATA = require('./vocab_source_data.cjs');

function buildEntry(word, reading, vi, type, priority, level, index) {
  const p = priority || 2;
  const pLabel = p === 1 ? 'Cốt lõi' : p === 2 ? 'Phổ biến' : 'Nâng cao';
  const id = `v_${level.toLowerCase()}_${String(index + 1).padStart(4, '0')}`;
  
  return {
    id,
    level,
    word,
    reading,
    vi,
    meaning: vi,
    type: type || 'Từ vựng',
    priority: p,
    priorityLabel: pLabel,
    tags: [pLabel, type || 'Từ vựng', level],
    examples: [`${word}（${reading}）: ${vi}`]
  };
}

function processLevel(list, level) {
  const seen = new Set();
  const result = [];
  
  for (const item of (list || [])) {
    const [word, reading, vi, type, priority] = item;
    if (!word || seen.has(word)) continue;
    seen.add(word);
    result.push(buildEntry(word, reading, vi, type, priority, level, result.length));
  }
  
  return result;
}

const n5 = processLevel(VOCAB_DATA.N5, 'N5');
const n4 = processLevel(VOCAB_DATA.N4, 'N4');
const n3 = processLevel(VOCAB_DATA.N3, 'N3');
const n2 = processLevel(VOCAB_DATA.N2, 'N2');
const n1 = processLevel(VOCAB_DATA.N1, 'N1');

const allVocab = [...n5, ...n4, ...n3, ...n2, ...n1];

console.log('-------------------------------------------');
console.log(`📊 Total Vocab: ${allVocab.length}`);
console.log(`N5: ${n5.length} (Core: ${n5.filter(x=>x.priority===1).length}, Common: ${n5.filter(x=>x.priority===2).length}, Adv: ${n5.filter(x=>x.priority===3).length})`);
console.log(`N4: ${n4.length} (Core: ${n4.filter(x=>x.priority===1).length}, Common: ${n4.filter(x=>x.priority===2).length}, Adv: ${n4.filter(x=>x.priority===3).length})`);
console.log(`N3: ${n3.length} (Core: ${n3.filter(x=>x.priority===1).length}, Common: ${n3.filter(x=>x.priority===2).length}, Adv: ${n3.filter(x=>x.priority===3).length})`);
console.log(`N2: ${n2.length} (Core: ${n2.filter(x=>x.priority===1).length}, Common: ${n2.filter(x=>x.priority===2).length}, Adv: ${n2.filter(x=>x.priority===3).length})`);
console.log(`N1: ${n1.length} (Core: ${n1.filter(x=>x.priority===1).length}, Common: ${n1.filter(x=>x.priority===2).length}, Adv: ${n1.filter(x=>x.priority===3).length})`);
console.log('-------------------------------------------');

// Update jlpt_master_db.json
const masterPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const masterDb = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

masterDb.vocabulary = allVocab;

fs.writeFileSync(masterPath, JSON.stringify(masterDb, null, 2), 'utf8');
console.log(`🎉 Successfully saved ${allVocab.length} words to jlpt_master_db.json!`);

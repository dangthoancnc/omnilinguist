/**
 * Merges all classified datasets and updates jlpt_master_db.json
 */
const fs = require('fs');
const path = require('path');

const n5Data = require('./data_n5.cjs');
const n4Data = require('./data_n4.cjs');
const n3Data = require('./data_n3.cjs');
const n2Data = require('./data_n2.cjs');
const n1Data = require('./data_n1.cjs');

console.log('📦 Merging all classified JLPT vocabulary datasets...');

function buildEntry(word, reading, vi, type, priority, level, index) {
  const p = Number(priority) || 2;
  const pLabel = p === 1 ? 'Cốt lõi' : p === 2 ? 'Phổ biến' : 'Nâng cao';
  const id = `v_${level.toLowerCase()}_${String(index + 1).padStart(4, '0')}`;
  
  return {
    id,
    level,
    word: String(word).trim(),
    reading: String(reading).trim(),
    vi: String(vi).trim(),
    meaning: String(vi).trim(),
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
    if (!word) continue;
    const cleanWord = String(word).trim();
    if (seen.has(cleanWord)) continue;
    seen.add(cleanWord);
    result.push(buildEntry(cleanWord, reading, vi, type, priority, level, result.length));
  }
  
  return result;
}

const n5 = processLevel(n5Data, 'N5');
const n4 = processLevel(n4Data, 'N4');
const n3 = processLevel(n3Data, 'N3');
const n2 = processLevel(n2Data, 'N2');
const n1 = processLevel(n1Data, 'N1');

const allVocab = [...n5, ...n4, ...n3, ...n2, ...n1];

console.log('===========================================');
console.log(`📊 TOTAL MERGED VOCABULARY: ${allVocab.length}`);
console.log(`N5: ${n5.length} (⭐⭐⭐ Core: ${n5.filter(x=>x.priority===1).length}, ⭐⭐ Common: ${n5.filter(x=>x.priority===2).length}, ⭐ Adv: ${n5.filter(x=>x.priority===3).length})`);
console.log(`N4: ${n4.length} (⭐⭐⭐ Core: ${n4.filter(x=>x.priority===1).length}, ⭐⭐ Common: ${n4.filter(x=>x.priority===2).length}, ⭐ Adv: ${n4.filter(x=>x.priority===3).length})`);
console.log(`N3: ${n3.length} (⭐⭐⭐ Core: ${n3.filter(x=>x.priority===1).length}, ⭐⭐ Common: ${n3.filter(x=>x.priority===2).length}, ⭐ Adv: ${n3.filter(x=>x.priority===3).length})`);
console.log(`N2: ${n2.length} (⭐⭐⭐ Core: ${n2.filter(x=>x.priority===1).length}, ⭐⭐ Common: ${n2.filter(x=>x.priority===2).length}, ⭐ Adv: ${n2.filter(x=>x.priority===3).length})`);
console.log(`N1: ${n1.length} (⭐⭐⭐ Core: ${n1.filter(x=>x.priority===1).length}, ⭐⭐ Common: ${n1.filter(x=>x.priority===2).length}, ⭐ Adv: ${n1.filter(x=>x.priority===3).length})`);
console.log('===========================================');

// Load master DB and preserve grammar + kanji
const masterPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const masterDb = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

masterDb.vocabulary = allVocab;

fs.writeFileSync(masterPath, JSON.stringify(masterDb, null, 2), 'utf8');
console.log(`🎉 Master DB updated successfully with ${allVocab.length} classified words!`);

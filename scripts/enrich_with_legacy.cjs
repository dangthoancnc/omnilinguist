/**
 * Enriches the datasets with legacy words from generate_vocab.cjs to maximize coverage
 */
const fs = require('fs');
const path = require('path');

// Helper to extract word lists from generate_vocab.cjs
const genCode = fs.readFileSync(path.join(__dirname, '../src/data/generate_vocab.cjs'), 'utf8');

function extractArray(varName) {
  const regex = new RegExp(`const ${varName} = \\[([\\s\\S]*?)\\];`);
  const match = genCode.match(regex);
  if (!match) return [];
  try {
    // Evaluate safely
    const arrStr = `[${match[1]}]`;
    return eval(arrStr);
  } catch (e) {
    console.error('Error parsing', varName, e);
    return [];
  }
}

const legN5 = extractArray('N5_WORDS').map(x => [x[0], x[1], x[2], x[3], 1]);
const legN4 = extractArray('N4_WORDS').map(x => [x[0], x[1], x[2], x[3], 1]);
const legN3 = extractArray('N3_WORDS').map(x => [x[0], x[1], x[2], x[3], 1]);
const legN2 = extractArray('N2_WORDS').map(x => [x[0], x[1], x[2], x[3], 1]);
const legN1 = extractArray('N1_WORDS').map(x => [x[0], x[1], x[2], x[3], 1]);

const extraPack = require('./extra_vocab_pack.cjs');
const extraPack2 = require('./extra_vocab_pack_2.cjs');
const extraPack3 = require('./extra_vocab_pack_3.cjs');

const n5Data = [...require('./data_n5.cjs'), ...(extraPack.N5 || []), ...(extraPack2.N5 || []), ...(extraPack3.N5 || []), ...legN5];
const n4Data = [...require('./data_n4.cjs'), ...(extraPack.N4 || []), ...(extraPack2.N4 || []), ...(extraPack3.N4 || []), ...legN4];
const n3Data = [...require('./data_n3.cjs'), ...(extraPack.N3 || []), ...(extraPack2.N3 || []), ...(extraPack3.N3 || []), ...legN3];
const n2Data = [...require('./data_n2.cjs'), ...(extraPack.N2 || []), ...(extraPack2.N2 || []), ...(extraPack3.N2 || []), ...legN2];
const n1Data = [...require('./data_n1.cjs'), ...(extraPack.N1 || []), ...(extraPack2.N1 || []), ...(extraPack3.N1 || []), ...legN1];

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
  
  for (const item of list) {
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
console.log(`📊 TOTAL ENRICHED VOCABULARY: ${allVocab.length}`);
console.log(`N5: ${n5.length} (⭐⭐⭐ Core: ${n5.filter(x=>x.priority===1).length}, ⭐⭐ Common: ${n5.filter(x=>x.priority===2).length}, ⭐ Adv: ${n5.filter(x=>x.priority===3).length})`);
console.log(`N4: ${n4.length} (⭐⭐⭐ Core: ${n4.filter(x=>x.priority===1).length}, ⭐⭐ Common: ${n4.filter(x=>x.priority===2).length}, ⭐ Adv: ${n4.filter(x=>x.priority===3).length})`);
console.log(`N3: ${n3.length} (⭐⭐⭐ Core: ${n3.filter(x=>x.priority===1).length}, ⭐⭐ Common: ${n3.filter(x=>x.priority===2).length}, ⭐ Adv: ${n3.filter(x=>x.priority===3).length})`);
console.log(`N2: ${n2.length} (⭐⭐⭐ Core: ${n2.filter(x=>x.priority===1).length}, ⭐⭐ Common: ${n2.filter(x=>x.priority===2).length}, ⭐ Adv: ${n2.filter(x=>x.priority===3).length})`);
console.log(`N1: ${n1.length} (⭐⭐⭐ Core: ${n1.filter(x=>x.priority===1).length}, ⭐⭐ Common: ${n1.filter(x=>x.priority===2).length}, ⭐ Adv: ${n1.filter(x=>x.priority===3).length})`);
console.log('===========================================');

const masterPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
const masterDb = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

masterDb.vocabulary = allVocab;

fs.writeFileSync(masterPath, JSON.stringify(masterDb, null, 2), 'utf8');
console.log(`🎉 Master DB updated successfully with ${allVocab.length} classified words!`);

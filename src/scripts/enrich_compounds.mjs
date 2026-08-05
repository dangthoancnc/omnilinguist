import fs from 'fs';
import path from 'path';

// This script is part of OmniLinguist v10 Phase 1 Data Enrichment Pipeline
// It is designed to extract compound words (熟語) from the existing vocab.json
// and kanji.json to create a new compounds.json, or to merge JMDict data.

const DATA_DIR = path.join(process.cwd(), '../data');
const VOCAB_FILE = path.join(DATA_DIR, 'vocab.json');
const KANJI_FILE = path.join(DATA_DIR, 'kanji.json');
const COMPOUNDS_FILE = path.join(DATA_DIR, 'compounds.json');

async function runEnrichment() {
  console.log("🚀 Bắt đầu quá trình Data Enrichment v10 (Phase 1)...");
  
  if (!fs.existsSync(VOCAB_FILE) || !fs.existsSync(KANJI_FILE)) {
    console.error("❌ Không tìm thấy file dữ liệu gốc.");
    return;
  }

  const vocab = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf-8'));
  const kanji = JSON.parse(fs.readFileSync(KANJI_FILE, 'utf-8'));
  
  console.log(`📦 Đã nạp ${vocab.length} từ vựng và ${kanji.length} Hán tự.`);
  
  // Example pipeline: Find all multi-kanji words in vocab and map them to their kanji
  const compounds = vocab.filter(v => v.word.length >= 2 && v.word.match(/[\u4e00-\u9faf]/));
  
  const optimizedCompounds = compounds.map(c => ({
    word: c.word,
    reading: c.reading,
    vi: c.vi,
    level: c.level,
    kanji_used: kanji.filter(k => c.word.includes(k.kanji)).map(k => k.kanji)
  }));

  console.log(`✨ Đã trích xuất và tối ưu ${optimizedCompounds.length} từ ghép (熟語).`);
  
  // In a real pipeline, we would fetch JMdict or KanjiVG here to inject stroke orders and more definitions.
  
  fs.writeFileSync(COMPOUNDS_FILE, JSON.stringify(optimizedCompounds, null, 2));
  console.log(`✅ Đã lưu file mới tại: ${COMPOUNDS_FILE}`);
}

runEnrichment().catch(console.error);

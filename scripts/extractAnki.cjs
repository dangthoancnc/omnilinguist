const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const initSqlJs = require('sql.js');

const APKG_PATH = process.argv[2];
if (!APKG_PATH) {
  console.error("Please provide the path to the .apkg file.");
  process.exit(1);
}

const CDN_DIR = path.resolve(__dirname, '../audio-cdn/media');
if (!fs.existsSync(CDN_DIR)) fs.mkdirSync(CDN_DIR, { recursive: true });

const extractPath = path.resolve(__dirname, '../scripts/temp_extract');
if (fs.existsSync(extractPath)) fs.rmSync(extractPath, { recursive: true, force: true });
fs.mkdirSync(extractPath, { recursive: true });

console.log("Extracting APKG: ", APKG_PATH);
const zip = new AdmZip(APKG_PATH);
zip.extractAllTo(extractPath, true);

const mediaPath = path.join(extractPath, 'media');
if (!fs.existsSync(mediaPath)) {
  console.error("No media file found in APKG.");
  process.exit(1);
}

const mediaMap = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));
let audioCount = 0;

console.log("Copying audio files to CDN...");
for (const [key, filename] of Object.entries(mediaMap)) {
  if (filename.toLowerCase().endsWith('.mp3') || filename.toLowerCase().endsWith('.wav')) {
    const sourceFile = path.join(extractPath, key);
    const destFile = path.join(CDN_DIR, filename);
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, destFile);
      audioCount++;
    }
  }
}
console.log(`Copied ${audioCount} audio files to audio-cdn/media.`);

// Load SQLite using sql.js
initSqlJs().then((SQL) => {
  let dbPath = path.join(extractPath, 'collection.anki21');
  if (!fs.existsSync(dbPath)) {
    dbPath = path.join(extractPath, 'collection.anki2');
  }
  if (!fs.existsSync(dbPath)) {
    console.error("No Anki database found (collection.anki2 or collection.anki21).");
    process.exit(1);
  }

  const filebuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(filebuffer);
  
  const outJsonPath = path.join(__dirname, '../src/data/anki_extracted.json');
  
  const res = db.exec("SELECT * FROM notes");
  if (res.length > 0) {
    const columns = res[0].columns;
    const values = res[0].values;
    
    let existing = [];
    if (fs.existsSync(outJsonPath)) {
        try { existing = JSON.parse(fs.readFileSync(outJsonPath, 'utf8')); } catch(e) {}
    }
    
    values.forEach(r => {
      const row = {};
      columns.forEach((col, idx) => row[col] = r[idx]);
      existing.push({
        id: row.id,
        source_deck: path.basename(APKG_PATH),
        flds: row.flds,
        tags: row.tags
      });
    });
    
    fs.writeFileSync(outJsonPath, JSON.stringify(existing, null, 2));
    console.log(`Saved ${values.length} notes to src/data/anki_extracted.json`);
  }
  
  fs.rmSync(extractPath, { recursive: true, force: true });
});

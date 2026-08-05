import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import initSqlJs from 'sql.js';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

const envContent = fs.readFileSync(envPath, 'utf8');
let supabaseUrl = '';
let supabaseKey = '';
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    if (key === 'VITE_SUPABASE_URL') supabaseUrl = parts.slice(1).join('=').trim();
    if (key === 'VITE_SUPABASE_ANON_KEY') supabaseKey = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(supabaseUrl, supabaseKey);

function drawProgressBar(current, total, label) {
  const width = 40;
  const progress = current / total;
  const filled = Math.round(width * progress);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  process.stdout.write(`\r[${bar}] ${Math.round(progress * 100)}% | ${current}/${total} | ${label}`);
  if (current === total) process.stdout.write('\n');
}

async function extractAnkiMazii(apkgPath) {
  console.log(`\n📦 Đang phân giải file Mazii Anki: ${path.basename(apkgPath)}`);
  
  const zip = new AdmZip(apkgPath);
  const dbEntry = zip.getEntries().find(e => e.entryName === 'collection.anki2');
  
  if (!dbEntry) {
    console.log("❌ Không tìm thấy database collection.anki2 trong file .apkg");
    return;
  }

  const dbData = dbEntry.getData();
  const SQL = await initSqlJs();
  const db = new SQL.Database(dbData);

  const res = db.exec("SELECT flds FROM notes");
  if (res.length === 0) return;

  const notes = res[0].values;
  console.log(`✅ Tìm thấy ${notes.length} mẫu ngữ pháp. Bắt đầu bóc tách đa tầng...`);

  const extractedGrammar = [];
  const cleanHTML = (str) => str ? str.replace(/<[^>]*>?/gm, '').trim() : '';

  for (let i = 0; i < notes.length; i++) {
    const fields = notes[i][0].split('\x1f');
    
    // Format chuẩn của bộ Mazii N5-N1:
    // [0] Level, [1] Pattern, [2] Meaning, [3] Formation, [4] Explanation
    // [5] JP1, [6] VI1, [7] JP2, [8] VI2 ...
    
    const levelStr = cleanHTML(fields[0]) || 'N?';
    const pattern = cleanHTML(fields[1]);
    const meaning = cleanHTML(fields[2]) || 'Chưa có ý nghĩa';
    
    const formationRaw = cleanHTML(fields[3]);
    const formation = formationRaw ? formationRaw.split(/[,;+]/).map(s => s.trim()).filter(s => s) : [];

    const explanation = cleanHTML(fields[4]);

    const examples = [];
    // Lặp qua các cặp Ví dụ (JP chẵn, VI lẻ bắt đầu từ index 5)
    for (let j = 5; j < fields.length - 1; j += 2) {
      const jp = cleanHTML(fields[j]);
      const vi = cleanHTML(fields[j+1]);
      if (jp && jp.length > 0) {
        examples.push({ jp, vi: vi || '' });
      }
    }

    if (pattern && pattern.length > 0) {
      extractedGrammar.push({
        id: crypto.randomUUID(),
        pattern: pattern,
        meaning: meaning,
        level: levelStr,
        formation: formation.length > 0 ? formation : ["[Đang cập nhật]"],
        explanation: explanation || "Trích xuất từ dữ liệu Mazii",
        examples: examples.length > 0 ? examples : [{ jp: "Đang cập nhật ví dụ", vi: "" }],
        note: ""
      });
    }
  }

  db.close();

  console.log("\n🗑️  Đang xóa dữ liệu lỗi cũ trên Supabase để tránh trùng lặp...");
  await supabase.from('omni_master_grammar').delete().neq('pattern', 'impossible_string_to_delete_all'); // .neq trick deletes everything

  console.log("☁️  Đang đẩy dữ liệu chuẩn hóa lên Supabase...");
  
  const chunkSize = 100;
  for (let i = 0; i < extractedGrammar.length; i += chunkSize) {
    drawProgressBar(Math.min(i + chunkSize, extractedGrammar.length), extractedGrammar.length, "Uploading...");
    const chunk = extractedGrammar.slice(i, i + chunkSize);
    const { error } = await supabase.from('omni_master_grammar').insert(chunk);
    if (error) {
      console.log("\n❌ Lỗi khi đẩy lên Supabase:", error.message);
      break;
    }
  }

  console.log("\n🎉 QUÁ TRÌNH TRÍCH XUẤT TỪ MAZII HOÀN TẤT TUYỆT ĐỐI!");
}

async function run() {
  const dataDir = path.resolve(__dirname, '../data');
  const maziiFile = path.join(dataDir, 'Ng_php_ting_Nht_N5-N1_-_Mazii.apkg');
  
  if (!fs.existsSync(maziiFile)) {
    console.log(`\n❌ Không tìm thấy file: ${maziiFile}`);
    return;
  }

  await extractAnkiMazii(maziiFile);
}

run();

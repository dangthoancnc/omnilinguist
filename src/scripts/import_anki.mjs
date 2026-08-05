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

async function extractAnki(apkgPath, levelStr) {
  console.log(`\n📦 Đang giải nén file Anki: ${path.basename(apkgPath)}`);
  
  const zip = new AdmZip(apkgPath);
  const dbEntry = zip.getEntries().find(e => e.entryName === 'collection.anki2');
  
  if (!dbEntry) {
    console.log("❌ Không tìm thấy database collection.anki2 trong file .apkg");
    return;
  }

  const dbData = dbEntry.getData();
  const SQL = await initSqlJs();
  const db = new SQL.Database(dbData);

  // Lấy dữ liệu từ bảng notes (chứa nội dung flashcard)
  const res = db.exec("SELECT flds FROM notes");
  if (res.length === 0) return;

  const notes = res[0].values;
  console.log(`✅ Tìm thấy ${notes.length} mẫu ngữ pháp trong file Anki.`);

  const extractedGrammar = [];
  
  for (let i = 0; i < notes.length; i++) {
    const fields = notes[i][0].split('\x1f'); // Anki phân cách field bằng ký tự 0x1F
    
    // AnkiVN Mimikara / Shinkanzen thường có các field:
    // [0]: Ngữ pháp (Pattern)
    // [1]: Ý nghĩa (Meaning)
    // [2]: Cấu trúc (Formation)
    // [3]: Ví dụ (Examples)
    
    // Lọc bỏ HTML tags rác
    const cleanHTML = (str) => str ? str.replace(/<[^>]*>?/gm, '').trim() : '';

    const pattern = cleanHTML(fields[0]);
    const meaning = cleanHTML(fields[1]) || 'Chưa có ý nghĩa';
    
    // Tách cấu trúc bằng dấu phẩy hoặc gạch ngang
    const formationRaw = cleanHTML(fields[2]);
    const formation = formationRaw ? formationRaw.split(/[,;+]/).map(s => s.trim()).filter(s => s) : ['[Đang cập nhật cấu trúc]'];

    // Phân tách ví dụ (thường xuống dòng bằng <br> hoặc <div>)
    const examplesRaw = fields[3] || '';
    const exampleParts = examplesRaw.split(/<br\s*\/?>|<div>/i)
                         .map(s => cleanHTML(s))
                         .filter(s => s.length > 5);
                         
    const examples = exampleParts.map(ex => ({ jp: ex, vi: "" })); // Tạm nhét vào jp, sau này AI có thể phân tách Nhật-Việt sau

    if (pattern && pattern.length > 0) {
      extractedGrammar.push({
        id: crypto.randomUUID(),
        pattern: pattern,
        meaning: meaning,
        level: levelStr,
        formation: formation,
        explanation: "Trích xuất từ AnkiVN",
        examples: examples.length > 0 ? examples : [{ jp: "Đang cập nhật ví dụ", vi: "" }],
        note: ""
      });
    }
  }

  db.close();

  console.log("\n☁️  Đang đẩy dữ liệu lên bảng omni_master_grammar (Supabase)...");
  
  const chunkSize = 100;
  for (let i = 0; i < extractedGrammar.length; i += chunkSize) {
    drawProgressBar(Math.min(i + chunkSize, extractedGrammar.length), extractedGrammar.length, "Uploading...");
    const chunk = extractedGrammar.slice(i, i + chunkSize);
    // Upsert không dùng onConflict: 'pattern' vì pattern không phải unique key
    const { error } = await supabase.from('omni_master_grammar').insert(chunk);
    if (error) {
      console.log("\n❌ Lỗi khi đẩy lên Supabase:", error.message);
      break;
    }
  }

  console.log("\n🎉 QUÁ TRÌNH TRÍCH XUẤT TỪ ANKI VÀ ĐỒNG BỘ HOÀN TẤT!");
}

async function run() {
  console.log("🚀 BẮT ĐẦU TOOL TÍCH HỢP NGỮ PHÁP TỪ ANKI");
  const dataDir = path.resolve(__dirname, '../data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.apkg'));
  
  if (files.length === 0) {
    console.log(`\n❌ Không tìm thấy file .apkg nào trong thư mục: ${dataDir}`);
    console.log("👉 HƯỚNG DẪN:");
    console.log("1. Vào https://ankivn.com/decks/ tải một deck Ngữ Pháp N3/N4 (Mimikara Oboeru hoặc Shinkanzen)");
    console.log("2. Copy file vừa tải vào thư mục: src/data/");
    console.log("3. Chạy lại lệnh: node src/scripts/import_anki.mjs");
    return;
  }

  for (const file of files) {
    // Dự đoán level từ tên file (vd: N3_Grammar.apkg -> N3)
    const levelMatch = file.match(/N[1-5]/i);
    const level = levelMatch ? levelMatch[0].toUpperCase() : 'N?';
    await extractAnki(path.join(dataDir, file), level);
  }
}

run();

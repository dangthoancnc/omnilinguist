import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

if (!fs.existsSync(envPath)) {
  console.error("Không tìm thấy file .env tại", envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
    if (key === 'VITE_SUPABASE_ANON_KEY') supabaseKey = val;
  }
});

if (!supabaseUrl || !supabaseKey) {
  console.error("Thiếu cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong file .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTable(tableName, jsonFile) {
  const filePath = path.resolve(__dirname, `../data/${jsonFile}`);
  if (!fs.existsSync(filePath)) {
    console.log(`Bỏ qua ${tableName}: Không tìm thấy file ${jsonFile}.`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Đang đẩy dữ liệu lên ${tableName} (${data.length} bản ghi)...`);
  
  // Push lên từng batch 500 bản ghi để tránh lỗi payload quá lớn
  const chunkSize = 500;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const { error } = await supabase.from(tableName).upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error(`Lỗi khi insert vào ${tableName}:`, error.message);
    } else {
      console.log(`✅ Đã đẩy thành công ${Math.min(i + chunkSize, data.length)} / ${data.length} bản ghi vào ${tableName}`);
    }
  }
}

async function run() {
  console.log("BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU MASTER LÊN SUPABASE...");
  await seedTable('omni_master_vocab', 'vocab.json');
  await seedTable('omni_master_grammar', 'grammar.json');
  await seedTable('omni_master_kanji', 'kanji.json');
  await seedTable('omni_master_shadowing', 'shadowing.json');
  console.log("🎉 ĐỒNG BỘ HOÀN TẤT!");
}

run();

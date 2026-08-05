require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Thiếu VITE_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env");
  process.exit(1);
}

const tokenPayload = JSON.parse(Buffer.from(supabaseKey.split('.')[1], 'base64').toString());
console.log("Sử dụng role:", tokenPayload.role);

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedVocab() {
  console.log('--- Bắt đầu đồng bộ Từ Vựng ---');
  const dbPath = path.join(__dirname, '../src/data/jlpt_master_db.json');
  
  if (!fs.existsSync(dbPath)) {
    console.error(`Không tìm thấy file: ${dbPath}`);
    return;
  }

  const rawData = fs.readFileSync(dbPath, 'utf8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error("Lỗi parse JSON:", err.message);
    return;
  }

  const vocabs = data.vocabulary;
  if (!vocabs || !Array.isArray(vocabs)) {
    console.error("Không tìm thấy mảng vocabulary");
    return;
  }

  console.log(`Đã tìm thấy ${vocabs.length} từ vựng.`);

  // Chuyển đổi định dạng để phù hợp với bảng omni_master_vocab
  const formattedData = vocabs.map(v => {
    return {
      level: v.level || 'N5',
      word: v.word || '',
      kanji: v.word !== v.reading ? v.word : '', // Giả định nếu word khác reading thì là kanji
      reading: v.reading || '',
      vi: v.meaning || '',
      tags: v.type ? [v.type] : [],
      examples: v.example ? [{ jp: v.example, vi: "" }] : []
    };
  });

  const chunkSize = 500;
  for (let i = 0; i < formattedData.length; i += chunkSize) {
    const chunk = formattedData.slice(i, i + chunkSize);
    console.log(`Đang đẩy batch từ ${i} đến ${i + chunk.length - 1}...`);
    
    const { error } = await supabase.from('omni_master_vocab').insert(chunk);
    if (error) {
      console.error(`Lỗi ở batch ${i}:`, error.message);
      return; // Dừng nếu có lỗi để tránh đẩy sai dữ liệu
    }
  }

  console.log('✅ Đã đồng bộ toàn bộ Từ vựng lên Supabase thành công!');
}

seedVocab();

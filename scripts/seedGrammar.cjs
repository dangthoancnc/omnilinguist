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

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedGrammar() {
  console.log('--- Bắt đầu đồng bộ Ngữ Pháp ---');
  const dbPath = path.join(__dirname, '../src/data/anki_extracted.json');
  
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

  // Lọc chỉ lấy deck Mazii
  const maziiData = data.filter(d => d.source_deck === 'Ng_php_ting_Nht_N5-N1_-_Mazii.apkg');
  console.log(`Đã tìm thấy ${maziiData.length} mẫu ngữ pháp Mazii.`);

  const formattedData = [];

  maziiData.forEach(item => {
    const fields = item.flds.split('\u001f');
    if (fields.length < 5) return;

    const level = fields[0] || 'N3';
    const pattern = fields[1];
    const vi = fields[2];
    const formation = fields[3] ? [fields[3]] : [];
    const meaning = fields[4]; // Giải thích cách dùng
    
    // Parse examples
    const examples = [];
    for (let i = 5; i < fields.length; i += 2) {
      const jp = fields[i];
      const vie = fields[i + 1];
      if (jp && jp.trim() !== '') {
        examples.push({ jp, vi: vie || '' });
      }
    }

    formattedData.push({
      level,
      pattern,
      meaning,
      vi,
      formation,
      examples
    });
  });

  console.log(`Bắt đầu đẩy ${formattedData.length} mẫu lên Supabase...`);

  const chunkSize = 200;
  for (let i = 0; i < formattedData.length; i += chunkSize) {
    const chunk = formattedData.slice(i, i + chunkSize);
    const { error } = await supabase.from('omni_master_grammar').insert(chunk);
    if (error) {
      console.error(`Lỗi ở batch ${i}:`, error.message);
      return;
    } else {
      console.log(`Đã đẩy batch từ ${i} đến ${i + chunk.length - 1}`);
    }
  }

  console.log('✅ Đã đồng bộ toàn bộ Ngữ pháp lên Supabase thành công!');
}

seedGrammar();

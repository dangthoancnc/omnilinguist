const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedGrammar() {
  console.log('--- Bắt đầu đồng bộ Ngữ pháp ---');
  const grammarPath = path.join(__dirname, '../src/data/grammar.json');
  if (fs.existsSync(grammarPath)) {
    const data = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
    console.log(`Đã tìm thấy ${data.length} mẫu ngữ pháp nội bộ.`);
    
    // Convert format to match Supabase schema
    const formattedData = data.map(g => ({
      pattern: g.pattern,
      meaning: g.meaning,
      level: g.level,
      formation: g.formation || [g.usage], // fallback
      explanation: g.explanation || '',
      examples: g.examples || [],
      note: g.note || ''
    }));

    // Bơm từng batch (để tránh lỗi payload too large)
    const { error } = await supabase.from('omni_master_grammar').insert(formattedData);
    if (error) {
      console.error('Lỗi khi đẩy Ngữ pháp:', error.message);
    } else {
      console.log('✅ Đã đồng bộ Ngữ pháp lên Supabase thành công!');
    }
  }
}

async function seedKanji() {
  console.log('--- Bắt đầu tải dữ liệu Kanji chuẩn từ Github ---');
  const url = 'https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json';
  
  https.get(url, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', async () => {
      try {
        const kanjiDict = JSON.parse(body);
        const formattedKanjis = [];
        
        // Lọc lấy Kanji thuộc N5 đến N1
        for (const [char, data] of Object.entries(kanjiDict)) {
          if (data.jlpt_new >= 1 && data.jlpt_new <= 5) {
            formattedKanjis.push({
              kanji: char,
              onyomi: data.readings_on ? data.readings_on.join('、') : '',
              kunyomi: data.readings_kun ? data.readings_kun.join('、') : '',
              meaning: data.meanings ? data.meanings.join(', ') : '',
              level: `N${data.jlpt_new}`,
              stroke_count: data.strokes || 0,
              strokes: [] // Dự phòng cho animation nét vẽ
            });
          }
        }

        console.log(`Đã lọc được ${formattedKanjis.length} Kanji chuẩn (N5-N1). Bắt đầu đẩy lên...`);
        
        // Push in chunks of 500
        const chunkSize = 500;
        for (let i = 0; i < formattedKanjis.length; i += chunkSize) {
          const chunk = formattedKanjis.slice(i, i + chunkSize);
          const { error } = await supabase.from('omni_master_kanji').upsert(chunk);
          if (error) {
            console.error(`Lỗi ở batch ${i}:`, error.message);
          } else {
            console.log(`Đã đẩy batch ${i} - ${i + chunk.length}`);
          }
        }
        console.log('✅ Đã đồng bộ Kanji lên Supabase thành công!');
      } catch (err) {
        console.error('Lỗi khi xử lý dữ liệu Kanji:', err);
      }
    });
  }).on('error', err => {
    console.error('Lỗi khi tải Kanji:', err.message);
  });
}

async function main() {
  await seedGrammar();
  await seedKanji();
  console.log('Tất cả lệnh bơm đã được gửi đi. Hãy kiểm tra Supabase!');
}

main();

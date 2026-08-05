require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Thiếu VITE_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
              onyomi: data.readings_on || [],
              kunyomi: data.readings_kun || [],
              meanings: data.meanings || [],
              vi_meanings: [], // Cập nhật sau nếu có DB từ điển Hán Việt
              level: `N${data.jlpt_new}`,
              strokes: data.strokes || 0
            });
          }
        }

        console.log(`Đã lọc được ${formattedKanjis.length} Kanji chuẩn (N5-N1). Bắt đầu đẩy lên...`);
        
        const chunkSize = 500;
        for (let i = 0; i < formattedKanjis.length; i += chunkSize) {
          const chunk = formattedKanjis.slice(i, i + chunkSize);
          const { error } = await supabase.from('omni_master_kanji').insert(chunk);
          if (error) {
            console.error(`Lỗi ở batch ${i}:`, error.message);
            return;
          } else {
            console.log(`Đã đẩy batch từ ${i} đến ${i + chunk.length - 1}`);
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

seedKanji();

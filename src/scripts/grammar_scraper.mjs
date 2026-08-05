import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

// Đọc cấu hình Supabase từ .env
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

const supabase = createClient(supabaseUrl, supabaseKey);

// Hàm tạo thanh tiến trình CLI đơn giản
function drawProgressBar(current, total, label) {
  const width = 40;
  const progress = current / total;
  const filled = Math.round(width * progress);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  process.stdout.write(`\r[${bar}] ${Math.round(progress * 100)}% | ${current}/${total} | ${label}`);
  if (current === total) process.stdout.write('\n');
}

// Hàm Sleep để tránh bị block IP do gọi API quá nhanh
const sleep = ms => new Promise(res => setTimeout(res, ms));

async function scrapeGrammar() {
  console.log("🚀 BẮT ĐẦU CHẠY WEB SCRAPER TỰ ĐỘNG...\n");
  console.log("⚠️ Chú ý: AhoVN lưu trữ ngữ pháp dưới dạng Ảnh (.png), nên Bot sẽ chuyển sang chế độ quét dữ liệu Văn Bản (Text) từ JLPT Sensei / Nguồn mở tương đương để đảm bảo đúng cấu trúc Database.\n");

  // Danh sách các URL trang danh sách ngữ pháp (Ví dụ minh họa cho N4, N3)
  const sourceUrls = [
    { level: 'N3', url: 'https://jlptsensei.com/jlpt-n3-grammar-list/' },
    { level: 'N4', url: 'https://jlptsensei.com/jlpt-n4-grammar-list/' }
  ];

  let allGrammarPoints = [];

  // BƯỚC 1: CÀO DANH SÁCH LINK NGỮ PHÁP
  console.log("📡 [BƯỚC 1] Đang quét danh sách các mẫu ngữ pháp...");
  for (const source of sourceUrls) {
    try {
      const { data } = await axios.get(source.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      
      const links = [];
      $('table.table a').each((i, el) => {
        links.push({
          link: $(el).attr('href'),
          level: source.level
        });
      });
      
      console.log(`✅ Đã tìm thấy ${links.length} mẫu ngữ pháp ${source.level}`);
      allGrammarPoints.push(...links);
      await sleep(1000);
    } catch (err) {
      console.log(`❌ Không thể truy cập trang danh sách ${source.level}:`, err.message);
    }
  }

  const totalPoints = allGrammarPoints.length;
  if (totalPoints === 0) {
    console.log("❌ Không tìm thấy mẫu ngữ pháp nào. Dừng Script.");
    return;
  }

  // BƯỚC 2: CÀO CHI TIẾT TỪNG MẪU NGỮ PHÁP
  console.log("\n🕵️ [BƯỚC 2] Đang đi sâu vào từng trang để trích xuất Cấu trúc & Ví dụ...");
  const extractedData = [];
  
  // Rút gọn để test nhanh (Bạn có thể bỏ .slice để chạy toàn bộ)
  const targetPoints = allGrammarPoints.slice(0, 50); 
  
  for (let i = 0; i < targetPoints.length; i++) {
    const item = targetPoints[i];
    try {
      drawProgressBar(i + 1, targetPoints.length, `Đang cào: ${item.link}`);
      
      const { data } = await axios.get(item.link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      
      // Bóc tách dữ liệu (Giả lập cấu trúc DOM của trang đích)
      const pattern = $('h1.entry-title').text().replace(/JLPT N\d Grammar: /, '').trim() || "Unknown";
      const meaning = $('.grammar-meaning').text().trim() || "Chưa có nghĩa";
      
      const formation = [];
      $('.formation-table tr').each((_, el) => {
        formation.push($(el).text().replace(/\s+/g, ' ').trim());
      });

      const examples = [];
      $('.example-sentence').each((_, el) => {
        const jp = $(el).find('.jp').text().trim();
        const vi = $(el).find('.en').text().trim(); // Tiếng Anh/Việt
        if (jp && vi) examples.push({ jp, vi });
      });

      extractedData.push({
        pattern: pattern,
        meaning: meaning,
        level: item.level,
        formation: formation.length > 0 ? formation : ["[Đang cập nhật cấu trúc]"],
        explanation: "Được trích xuất tự động bằng Web Scraper Bot.",
        examples: examples.length > 0 ? examples : [{ jp: "Ví dụ đang được dịch...", vi: "..." }],
        note: ""
      });

      await sleep(1500); // Tránh bị block IP
    } catch (err) {
      // Bỏ qua lỗi 404 hoặc timeout
    }
  }

  // BƯỚC 3: LƯU VÀ ĐẨY LÊN SUPABASE
  console.log(`\n\n💾 [BƯỚC 3] Hoàn tất cào dữ liệu. Trích xuất thành công ${extractedData.length} mẫu.`);
  
  // Lưu ra file JSON backup
  const outPath = path.resolve(__dirname, '../data/grammar_scraped.json');
  fs.writeFileSync(outPath, JSON.stringify(extractedData, null, 2));
  console.log(`✅ Đã lưu file backup tại: src/data/grammar_scraped.json`);

  console.log("☁️  Đang đẩy dữ liệu lên bảng omni_master_grammar (Supabase)...");
  
  const chunkSize = 100;
  for (let i = 0; i < extractedData.length; i += chunkSize) {
    const chunk = extractedData.slice(i, i + chunkSize);
    const { error } = await supabase.from('omni_master_grammar').upsert(chunk, { onConflict: 'pattern' });
    
    if (error) {
      console.error("❌ Lỗi khi đẩy lên Supabase:", error.message);
    } else {
      console.log(`✅ Đã đồng bộ ${Math.min(i + chunkSize, extractedData.length)}/${extractedData.length} mẫu lên Cloud.`);
    }
  }
  
  console.log("\n🎉 QUÁ TRÌNH SCRAPER & ĐỒNG BỘ HOÀN TẤT!");
}

scrapeGrammar();

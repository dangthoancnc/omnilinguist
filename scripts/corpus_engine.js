import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''; // Đặt key trong file .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''; 

// Nơi lưu trữ dữ liệu
const DATA_DIR = path.join(__dirname, '../public/data');
const ASSETS_DIR = path.join(__dirname, '../public/assets/ehon_generated');
const STATE_FILE = path.join(__dirname, 'corpus_state.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'generated_corpus.json');

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

// Danh sách truyện mẫu muốn tạo (sau này có thể đọc từ CSV/TXT chứa hàng nghìn truyện)
const TITLES_TO_GENERATE = [
  { id: 'ehon_gen_001', title: 'Cậu bé quả đào (Momotaro)', jpTitle: '桃太郎', level: 'N5' },
  { id: 'ehon_gen_002', title: 'Công chúa ống tre (Kaguya-hime)', jpTitle: 'かぐや姫', level: 'N4' }
  // Thêm hàng nghìn tựa đề vào đây...
];

const PAGES_PER_STORY = 15; // Yêu cầu 15-20 trang mỗi truyện

// ============================================================================
// HELPERS & API WRAPPERS
// ============================================================================

const loadState = () => {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return { completed: [], inProgress: null };
};

const saveState = (state) => {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
};

const appendToCorpus = (storyObj) => {
  let corpus = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    corpus = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  }
  // Kiểm tra trùng lặp
  const idx = corpus.findIndex(s => s.id === storyObj.id);
  if (idx !== -1) corpus[idx] = storyObj;
  else corpus.push(storyObj);
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(corpus, null, 2));
};

// Gọi OpenAI để tạo text truyện
async function generateStoryText(storyMeta) {
  console.log(`[LLM] Đang sinh nội dung cho truyện: ${storyMeta.jpTitle}...`);
  if (!OPENAI_API_KEY) {
    console.warn("⚠️ Chưa có OPENAI_API_KEY. Dùng dữ liệu mock.");
    return Array.from({ length: PAGES_PER_STORY }).map((_, i) => ({
      chapterTitle: `Trang ${i + 1}`,
      text: `昔々、あるところに... (Trang ${i + 1} của ${storyMeta.jpTitle})`,
      summary: `Tóm tắt cảnh ${i + 1}`,
      imagePrompt: `Japanese watercolor, vintage picture book style, scene ${i + 1} of ${storyMeta.title}, white background`
    }));
  }

  const prompt = `
    Hãy viết lại câu chuyện cổ tích "${storyMeta.jpTitle}" (${storyMeta.title}) bằng tiếng Nhật cấp độ ${storyMeta.level}.
    Chia câu chuyện thành đúng ${PAGES_PER_STORY} phân đoạn (mỗi phân đoạn 1-2 câu).
    Trả về định dạng JSON array chuẩn:
    [
      {
        "chapterTitle": "Tên đoạn bằng tiếng Nhật",
        "text": "Nội dung tiếng Nhật",
        "summary": "Tóm tắt cảnh bằng tiếng Việt",
        "imagePrompt": "Mô tả chi tiết bằng tiếng Anh để vẽ ảnh cho cảnh này (thêm tiền tố: Japanese watercolor, vintage picture book, ehon style, white background)"
      }
    ]
  `;

  try {
    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    }, { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } });

    const data = JSON.parse(res.data.choices[0].message.content);
    return data.pages || data; // fallback
  } catch (err) {
    console.error("Lỗi khi sinh text:", err.response?.data || err.message);
    throw err;
  }
}

// Gọi DALL-E 3 để vẽ ảnh
async function generateAndDownloadImage(prompt, filename) {
  console.log(`[IMG] Đang vẽ ảnh cho: ${filename}...`);
  if (!OPENAI_API_KEY) {
    console.warn("⚠️ Chưa có OPENAI_API_KEY. Dùng ảnh trắng mock.");
    fs.writeFileSync(path.join(ASSETS_DIR, filename), "mock_image_data");
    return `/assets/ehon_generated/${filename}`;
  }

  try {
    const res = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1
    }, { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } });

    const imgUrl = res.data.data[0].url;
    
    // Download ảnh về thư mục cục bộ
    const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(path.join(ASSETS_DIR, filename), imgRes.data);
    
    return `/assets/ehon_generated/${filename}`;
  } catch (err) {
    console.error("Lỗi khi tạo ảnh:", err.response?.data || err.message);
    throw err;
  }
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

async function runEngine() {
  console.log("🚀 KHỞI ĐỘNG CÔNG CỤ TẠO KHO SÁCH (CORPUS ENGINE)");
  let state = loadState();

  for (const story of TITLES_TO_GENERATE) {
    if (state.completed.includes(story.id)) {
      console.log(`⏩ Bỏ qua ${story.id}, đã hoàn thành trước đó.`);
      continue;
    }

    console.log(`\n===========================================`);
    console.log(`📖 Bắt đầu xử lý: ${story.title} (${story.id})`);
    
    try {
      // 1. Sinh nội dung 15-20 trang (Text Generation)
      const pages = await generateStoryText(story);
      
      // 2. Vẽ ảnh cho từng trang (Image Generation)
      const chapters = [];
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const safeId = `${story.id}_p${i + 1}`;
        const filename = `${safeId}.jpg`;
        
        // Gọi API vẽ ảnh
        const localImageUrl = await generateAndDownloadImage(page.imagePrompt, filename);

        chapters.push({
          chapterTitle: page.chapterTitle,
          text: page.text,
          summary: page.summary,
          imageUrl: localImageUrl
        });

        // Delay nhẹ để tránh rate limit
        await new Promise(r => setTimeout(r, 1000));
      }

      // 3. Đóng gói thành Story Object
      const fullContent = chapters.map(c => c.text).join('\n');
      const finalStory = {
        id: story.id,
        title: story.jpTitle,
        category: 'Tranh truyện Ehon',
        level: story.level,
        author: 'AI Generated',
        summary: `Tác phẩm ${story.title} (Gồm ${chapters.length} trang)`,
        content: fullContent,
        chapters: chapters
      };

      // 4. Lưu vào CSDL
      appendToCorpus(finalStory);
      
      // Đánh dấu hoàn thành
      state.completed.push(story.id);
      saveState(state);
      console.log(`✅ Hoàn thành: ${story.title}`);
      
    } catch (e) {
      console.error(`❌ Dừng tiến trình do lỗi ở ${story.id}:`, e.message);
      break; // Dừng nếu có lỗi (hết tiền API, rate limit...)
    }
  }

  console.log("\n🎉 TIẾN TRÌNH KẾT THÚC!");
  console.log(`Tệp CSDL đã được lưu tại: ${OUTPUT_FILE}`);
  console.log(`Ảnh đã tải về tại: ${ASSETS_DIR}`);
}

runEngine();

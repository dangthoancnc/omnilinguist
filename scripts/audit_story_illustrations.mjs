/**
 * scripts/audit_story_illustrations.mjs
 * 
 * Công Cụ Kiểm Toán Liên Tục Minh Họa Kho Ngữ Liệu Đọc OmniLinguist
 * Tự động rà soát 100% tác phẩm trong kho:
 * 1. Kiểm tra sự tồn tại của file ảnh thực tế trên ổ cứng (public/images/...)
 * 2. Phát hiện tranh bị trùng lặp (nhiều truyện dùng chung 1 ảnh đại diện)
 * 3. Kiểm tra độ phủ phân trang (mỗi phân đoạn/câu mô tả có ảnh riêng chưa)
 * 4. Báo cáo tỷ lệ hoàn thiện theo từng chuyên mục & cấp độ tuổi (Ehon 3t, 4t, 5-6t, Cổ tích, Văn học...)
 * 5. Xuất báo cáo ma trận ra file JSON: public/images/story_illustration_matrix.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

// Nạp kho ngữ liệu đọc chính
const corpusFilePath = path.resolve(ROOT_DIR, 'src/data/readingCorpus.js');

async function runAudit() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║  🔍 OMNILINGUIST — HỆ THỐNG KIỂM TOÁN MINH HỌA TRANH TRUYỆN LIÊN TỤC   ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(corpusFilePath)) {
    console.error(`❌ Không tìm thấy tệp ngữ liệu: ${corpusFilePath}`);
    process.exit(1);
  }

  // Import dynamic từ readingCorpus.js
  let corpus = [];
  try {
    const mod = await import('file:///' + corpusFilePath.replace(/\\/g, '/') + '?t=' + Date.now());
    corpus = mod.READING_CORPUS || mod.CLASSIC_STORIES || mod.default || [];
  } catch (err) {
    console.error('❌ Lỗi nạp module readingCorpus:', err);
    process.exit(1);
  }

  console.log(`📚 Đã nạp thành công ${corpus.length} tác phẩm từ kho ngữ liệu.\n`);

  // Phân tích và kiểm toán từng truyện
  const categoryStats = {};
  const imageUsageMap = new Map(); // url -> array of { storyId, title, page }
  const missingImages = [];
  const singleChapterStories = [];
  const multiChapterStories = [];

  let totalPages = 0;
  let pagesWithImage = 0;
  let validDiskImages = 0;
  let brokenDiskImages = 0;

  const auditedStories = corpus.map((story, sIdx) => {
    const cat = story.subGenre || story.genre || 'unclassified';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { totalStories: 0, totalPages: 0, pagesWithArt: 0, coversWithArt: 0 };
    }
    categoryStats[cat].totalStories++;

    // Kiểm tra ảnh bìa
    const coverUrl = story.coverArtwork || story.imageUrl || story.image || null;
    let coverValid = false;
    if (coverUrl) {
      categoryStats[cat].coversWithArt++;
      const diskPath = path.resolve(PUBLIC_DIR, coverUrl.replace(/^\//, ''));
      if (fs.existsSync(diskPath)) {
        coverValid = true;
      } else {
        missingImages.push({ type: 'cover', storyId: story.id, title: story.title, url: coverUrl });
      }

      // Theo dõi trùng lặp ảnh bìa
      if (!imageUsageMap.has(coverUrl)) imageUsageMap.set(coverUrl, []);
      imageUsageMap.get(coverUrl).push({ storyId: story.id, title: story.title, page: 'cover' });
    }

    // Kiểm tra các trang (chapters)
    const chapters = story.chapters || (story.content ? [{ content: story.content, chapterNumber: 1, imageUrl: story.coverArtwork || story.imageUrl }] : []);
    const isMultiPage = chapters.length > 1;
    if (isMultiPage) multiChapterStories.push(story.id);
    else singleChapterStories.push(story.id);

    totalPages += chapters.length;
    categoryStats[cat].totalPages += chapters.length;

    const auditedPages = chapters.map((ch, chIdx) => {
      const pageNum = ch.chapterNumber || chIdx + 1;
      const pageImg = ch.imageUrl || ch.image || null;
      let imgValid = false;

      if (pageImg) {
        pagesWithImage++;
        categoryStats[cat].pagesWithArt++;
        const pageDiskPath = path.resolve(PUBLIC_DIR, pageImg.replace(/^\//, ''));
        if (fs.existsSync(pageDiskPath)) {
          imgValid = true;
          validDiskImages++;
        } else {
          brokenDiskImages++;
          missingImages.push({ type: 'page', storyId: story.id, title: story.title, page: pageNum, url: pageImg });
        }

        // Theo dõi trùng lặp ảnh trang
        if (!imageUsageMap.has(pageImg)) imageUsageMap.set(pageImg, []);
        imageUsageMap.get(pageImg).push({ storyId: story.id, title: story.title, page: pageNum });
      }

      return {
        pageNumber: pageNum,
        title: ch.chapterTitle || `Trang ${pageNum}`,
        hasImage: !!pageImg,
        imageUrl: pageImg,
        imageValidOnDisk: imgValid,
        contentLength: (ch.content || '').length
      };
    });

    const storyComplete = auditedPages.every(p => p.hasImage && p.imageValidOnDisk) && coverValid;

    return {
      id: story.id,
      title: story.title,
      genre: cat,
      level: story.level || 'N/A',
      coverUrl,
      coverValidOnDisk: coverValid,
      pagesCount: chapters.length,
      pagesWithImage: auditedPages.filter(p => p.hasImage).length,
      isComplete: storyComplete,
      pages: auditedPages
    };
  });

  // Tìm các ảnh bị dùng chung (Duplicate image detection)
  // Cảnh báo khi: Nhiều truyện KHÁC NHAU dùng chung 1 ảnh, hoặc nhiều trang (chapters) trong truyện dùng chung 1 ảnh
  const duplicates = [];
  for (const [url, usages] of imageUsageMap.entries()) {
    const uniqueStories = new Set(usages.map(u => u.storyId));
    const nonCoverPages = usages.filter(u => u.page !== 'cover');
    if (uniqueStories.size > 1 || nonCoverPages.length > 1) {
      duplicates.push({ url, count: usages.length, usedBy: usages.map(u => `${u.title} (${u.page})`) });
    }
  }

  // Báo cáo ma trận theo chuyên mục
  console.log('📊 MA TRẬN TIẾN ĐỘ THEO CHUYÊN MỤC:');
  console.log('───────────────────────────────────────────────────────────────────────────────────');
  console.log(' Chuyên mục          | Số truyện | Đã có bìa | Tổng số trang | Trang có tranh | % Phủ ');
  console.log('───────────────────────────────────────────────────────────────────────────────────');
  for (const [cat, stat] of Object.entries(categoryStats)) {
    const pct = stat.totalPages > 0 ? Math.round((stat.pagesWithArt / stat.totalPages) * 100) : 0;
    const catPad = cat.padEnd(19, ' ');
    const strCount = String(stat.totalStories).padStart(9, ' ');
    const covCount = String(stat.coversWithArt).padStart(9, ' ');
    const pagCount = String(stat.totalPages).padStart(13, ' ');
    const artCount = String(stat.pagesWithArt).padStart(14, ' ');
    const pctStr = `${pct}%`.padStart(5, ' ');
    console.log(` ${catPad} | ${strCount} | ${covCount} | ${pagCount} | ${artCount} | ${pctStr}`);
  }
  console.log('───────────────────────────────────────────────────────────────────────────────────');

  console.log('\n📈 TỔNG KẾT TOÀN HỆ THỐNG:');
  console.log(`• Tổng số tác phẩm: ${corpus.length}`);
  console.log(`• Tổng số trang / phân cảnh: ${totalPages}`);
  console.log(`• Trang đã được cấu hình ảnh: ${pagesWithImage}/${totalPages} (${Math.round((pagesWithImage/totalPages)*100)}%)`);
  console.log(`• Ảnh trang hợp lệ thực tế trên ổ cứng: ${validDiskImages}`);
  console.log(`• Truyện đã chia nhiều trang (multi-chapter): ${multiChapterStories.length}/${corpus.length}`);
  console.log(`• Truyện còn ở dạng đơn trang cần phân đoạn: ${singleChapterStories.length}/${corpus.length}`);

  // Cảnh báo nếu có tranh thiếu hoặc trùng lặp
  if (missingImages.length > 0) {
    console.log(`\n⚠️  CẢNH BÁO: Phát hiện ${missingImages.length} đường dẫn ảnh KHÔNG TỒN TẠI trên ổ đĩa:`);
    missingImages.slice(0, 5).forEach(m => {
      console.log(`   - [${m.type.toUpperCase()}] ${m.title} (${m.page || 'Bìa'}): ${m.url}`);
    });
    if (missingImages.length > 5) console.log(`   ... và ${missingImages.length - 5} ảnh khác.`);
  } else {
    console.log('\n✅ 100% các file ảnh được cấu hình đều tồn tại thực tế trên ổ đĩa!');
  }

  if (duplicates.length > 0) {
    console.log(`\n⚠️  CẢNH BÁO: Phát hiện ${duplicates.length} ảnh đang bị DÙNG CHUNG cho nhiều truyện/trang:`);
    duplicates.slice(0, 5).forEach(d => {
      console.log(`   - ${d.url} (đang dùng cho ${d.count} nơi: ${d.usedBy.slice(0, 2).join(', ')}...)`);
    });
  } else {
    console.log('✅ Tuyệt đối không có ảnh nào bị dùng trùng lặp giữa các tác phẩm!');
  }

  // Xuất file ma trận kiểm toán chi tiết
  const matrixOutPath = path.resolve(PUBLIC_DIR, 'images/story_illustration_matrix.json');
  fs.mkdirSync(path.dirname(matrixOutPath), { recursive: true });
  fs.writeFileSync(matrixOutPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalStories: corpus.length,
    totalPages,
    pagesWithImage,
    validDiskImages,
    categoryStats,
    missingImages,
    duplicates,
    stories: auditedStories
  }, null, 2));

  console.log(`\n💾 Đã lưu ma trận kiểm toán chi tiết ra: ${matrixOutPath}`);
  console.log('═'.repeat(75) + '\n');
}

runAudit();

import { db } from './db.js';
import localMasterDb from './data/jlpt_master_db.json';

const CURRENT_DATA_VERSION = 'v12.0.0_deduplicated_1201';
const CHUNK_SIZE = 200; // Chia nhỏ 200 bản ghi / đợt để nạp siêu mượt

const parseField = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return String(val).split(',').map(s => s.trim());
  }
};

/**
 * Nạp dữ liệu chia nhỏ theo từng đợt (Chunked Batch Insert) không làm khóa UI thread.
 */
async function chunkedBulkPut(table, items) {
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    await table.bulkPut(chunk);
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

/**
 * Cơ chế nạp dữ liệu siêu tốc, tối ưu RAM/CPU và phòng chống quá tải.
 */
export async function syncMasterData() {
  try {
    const savedVer = localStorage.getItem('omni_master_ver');
    const vocabCount = await db.vocab.count();
    const grammarCount = await db.grammar.count();

    // ⚡ TỐI ƯU SIÊU TỐC: Nếu phiên bản đã khớp & đã có đủ dữ liệu từ vựng + ngữ pháp -> Bỏ qua nạp lại
    if (savedVer === CURRENT_DATA_VERSION && grammarCount > 1000 && vocabCount > 500) {
      console.log(`⚡ [FastLoad] Master Data đã sẵn sàng (${vocabCount} từ vựng, ${grammarCount} mẫu ngữ pháp Bunpro). Bỏ qua nạp lại!`);
      return;
    }

    console.log(`⏳ [ChunkedLoader] Đang nạp dữ liệu phiên bản ${CURRENT_DATA_VERSION} theo đợt nhỏ...`);

    // Xóa dữ liệu cũ khi phiên bản thay đổi
    await db.vocab.clear();
    await db.kanji.clear();
    await db.grammar.clear();

    // === 1. Nạp Từ vựng theo Chunk ===
    const vocab = localMasterDb.vocabulary || [];
    if (vocab.length > 0) {
      const parsedVocab = vocab.map((v, i) => ({
        id: v.id || `v_${i}`,
        level: v.level || 'N3',
        word: v.word,
        reading: v.reading || '',
        vi: v.vi || v.meaning || '',
        meaning: v.vi || v.meaning || '',
        type: v.type || (Array.isArray(v.tags) ? v.tags[0] : 'Từ vựng'),
        tags: parseField(v.tags),
        examples: parseField(v.examples || v.example)
      }));
      await chunkedBulkPut(db.vocab, parsedVocab);
    }

    // === 2. Nạp Kanji theo Chunk ===
    const kanji = localMasterDb.kanji || [];
    if (kanji.length > 0) {
      const parsedKanji = kanji.map((k, i) => ({
        id: k.id || `k_${i}`,
        kanji: k.kanji,
        level: k.level || 'N3',
        meanings: parseField(k.meanings || k.vi_meanings),
        onyomi: parseField(k.onyomi),
        kunyomi: parseField(k.kunyomi),
        vi_meanings: parseField(k.vi_meanings || k.meanings)
      }));
      await chunkedBulkPut(db.kanji, parsedKanji);
    }

    // === 3. Nạp Ngữ pháp Bunpro Full 2,191 N5-N1 theo Chunk ===
    const grammar = localMasterDb.grammar || [];
    if (grammar.length > 0) {
      const parsedGrammar = grammar.map((g, i) => ({
        id: g.id || `g_${i}`,
        pattern: g.pattern || g.title || g.name || '',
        title: g.pattern || g.title || g.name || '',
        level: g.level || 'N3',
        meaning: g.meaning || g.vi || '',
        formation: parseField(g.formation),
        explanation: g.explanation || '',
        examples: Array.isArray(g.examples) ? g.examples : parseField(g.examples)
      }));
      await chunkedBulkPut(db.grammar, parsedGrammar);
    }

    // Ghi nhận phiên bản để lần sau mở web là chạy ngay tức thì
    localStorage.setItem('omni_master_ver', CURRENT_DATA_VERSION);
    console.log(`🎉 [ChunkedLoader] Hoàn tất nạp ${grammar.length} mẫu ngữ pháp Bunpro N5-N1!`);

  } catch (error) {
    console.error('❌ Lỗi khi nạp Master Data:', error);
    // Không lưu version khi lỗi → cho phép retry lần sau
    // Re-throw để caller (auto-repair) biết lỗi
    throw error;
  }
}

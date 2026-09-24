// src/data/readingCorpus.js
// Kho Ngữ Liệu Đọc Toàn Diện Đại Quy Mô OmniLinguist SLA (Stephen Krashen Comprehensive Input Library: N5 -> N1)
// Cấu trúc phân hệ Module hóa đa cấp độ:
// - Ehon Nensho (3–4 tuổi): 30 tác phẩm
// - Ehon Nenchu (4–5 tuổi): 30 tác phẩm
// - Ehon Nencho (5–6 tuổi): 40 tác phẩm
// - Folktales (Truyện cổ tích & thần thoại dân gian): 17 tác phẩm
// - Base Corpus (Văn học cổ điển, Đời sống, Văn hóa, Kinh tế, Báo chí, Học thuật): 277 tác phẩm
// Tổng cộng: 394 tác phẩm, 100% minh họa độc bản, hỗ trợ chế độ Đọc Liên Tục & Shadowing

import { EHON_NENSHO_CORPUS } from './corpus/ehon_nensho.js';
import { EHON_NENCHU_CORPUS } from './corpus/ehon_nenchu.js';
import { EHON_NENCHO_CORPUS } from './corpus/ehon_nencho.js';
import { FOLKTALES_CORPUS } from './corpus/folktales.js';
import { BASE_CORPUS } from './corpus/base_corpus.js';

export const READING_CORPUS = [
  ...EHON_NENSHO_CORPUS,
  ...EHON_NENCHU_CORPUS,
  ...EHON_NENCHO_CORPUS,
  ...FOLKTALES_CORPUS,
  ...BASE_CORPUS
];

// Re-export for 100% backward compatibility
export const CLASSIC_STORIES = READING_CORPUS;
export default READING_CORPUS;

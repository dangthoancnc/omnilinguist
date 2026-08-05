// v9.1.50-3 — Offline Rule-based Keigo Checker
export const KEIGO_RULES = [
  { bad: 'ごめんなさい', good: '申し訳ございません', reason: 'ごめんなさい chỉ dùng cho bạn bè/gia đình. Trong business phải dùng 申し訳ございません.' },
  { bad: 'すみません', good: '申し訳ございません / 恐れ入りますが', reason: 'すみません mang sắc thái khá casual. Xin lỗi -> 申し訳ございません. Nhờ vả -> 恐れ入りますが.' },
  { bad: '分かりました', good: '承知いたしました / かしこまりました', reason: '分かりました không đủ trang trọng khi nói với cấp trên hoặc khách hàng.' },
  { bad: '了解しました', good: '承知いたしました', reason: '了解 chỉ dùng cho đồng nghiệp ngang hàng hoặc cấp dưới.' },
  { bad: 'どうですか', good: 'いかがでしょうか', reason: 'どうですか hơi thô trong văn bản hành chính.' },
  { bad: '言いました', good: '申し上げました (khiêm nhường) / おっしゃいました (tôn kính)', reason: 'Cần phân biệt hành động của mình (申し上げました) và của đối tác (おっしゃいました).' },
  { bad: '見ました', good: '拝見いたしました', reason: '拝見する là khiêm nhường ngữ của 見る.' },
  { bad: '聞いてください', good: 'お聞きください / お耳にお入れください', reason: 'てください mang tính ra lệnh, không phù hợp với cấp trên.' },
  { bad: 'もらいました', good: 'いただきました', reason: 'いただく là khiêm nhường ngữ của もらう.' },
  { bad: 'くれますか', good: 'いただけますでしょうか', reason: 'Dùng いただける (có thể nhận được không) thay vì くれる (cho tôi).' },
  { bad: 'できません', good: 'いたしかねます / できかねます', reason: 'できません nghe rất trực diện và lạnh lùng. Dùng かねる để từ chối khéo léo.' },
  { bad: '知ってますか', good: 'ご存知でしょうか', reason: 'ご存知 (ごぞんじ) là tôn kính ngữ của 知っている.' },
  { bad: '分かりません', good: 'わかりかねます / 存じ上げません', reason: '存じ上げません (không biết về người/việc). わかりかねます (không thể hiểu/giải quyết).' },
  { bad: 'お疲れ様でございます', good: 'お疲れ様です', reason: 'お疲れ様です là đủ. Thêm でございます bị coi là sai ngữ pháp (二重敬語 hoặc dùng sai đối tượng).' },
  { bad: 'ご苦労様', good: 'お疲れ様です', reason: 'ご苦労様 (ごくろうさま) chỉ dùng từ cấp trên nói xuống cấp dưới.' }
];

export function analyzeEmail(text) {
  if (!text) return [];
  const issues = [];
  const lines = text.split('\n');
  const fullText = text.replace(/\s+/g, '');

  // 1. Check structural missing
  if (fullText.length > 30 && !fullText.includes('お世話になっております') && !fullText.includes('お疲れ様です')) {
    issues.push({
      type: 'structure',
      message: 'Thiếu lời chào mở đầu',
      suggestion: 'Nên bắt đầu bằng "お世話になっております" (đối ngoại) hoặc "お疲れ様です" (đối nội).'
    });
  }

  if (fullText.length > 30 && !fullText.includes('よろしくお願い') && !fullText.includes('よろしくいたし')) {
    issues.push({
      type: 'structure',
      message: 'Thiếu lời kết thư',
      suggestion: 'Nên kết thúc bằng "よろしくお願いいたします" hoặc "よろしくお願い申し上げます".'
    });
  }

  // 2. Check Keigo rules
  KEIGO_RULES.forEach(rule => {
    if (text.includes(rule.bad)) {
      issues.push({
        type: 'keigo',
        bad: rule.bad,
        good: rule.good,
        message: `Tránh dùng "${rule.bad}"`,
        suggestion: `Đổi thành "${rule.good}". ${rule.reason}`
      });
    }
  });

  // 3. Length check
  if (text.split('\n').some(line => line.length > 40)) {
    issues.push({
      type: 'format',
      message: 'Có dòng quá dài',
      suggestion: 'Nên ngắt dòng (Enter) sau khoảng 30-35 ký tự để email dễ đọc hơn trên màn hình.'
    });
  }

  return issues;
}

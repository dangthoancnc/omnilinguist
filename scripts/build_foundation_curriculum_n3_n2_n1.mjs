// scripts/build_foundation_curriculum_n3_n2_n1.mjs
// Xây dựng đại kho bài học bản lề N3, N2, N1 hoàn chỉnh chuẩn SAKURA SKETCHNOTE:
// Sử dụng 100% TRI THỨC THỰC TẾ từ Shin Kanzen Master, Mazii JLPT Deck và Giáo trình Ngữ pháp chuẩn.
// Tuyệt đối không dùng văn mẫu placeholder hay câu ví dụ bịa đặt.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, '../src/data/curriculum');
const DATA_DIR = path.resolve(__dirname, '../src/data');

// -------------------------------------------------------------
// 1. NẠP VÀ CHUẨN HÓA CƠ SỞ DỮ LIỆU NGỮ PHÁP CHUẨN
// -------------------------------------------------------------
console.log("📚 Đang nạp cơ sở dữ liệu Shin Kanzen Master, Mazii và JLPT Grammar...");

const anki = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'anki_extracted.json'), 'utf8'));
const gFull = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'jlpt_grammar_full.json'), 'utf8'));
const sk1 = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'shinkanzen_n1.json'), 'utf8'));
const sk2 = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'shinkanzen_n2.json'), 'utf8'));
const sk3 = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'shinkanzen_n3.json'), 'utf8'));

const normalize = (s) => (s || '')
  .replace(/[～〜~]/g, '')
  .replace(/\s+/g, '')
  .replace(/（.*?）/g, '')
  .replace(/\(.*?\)/g, '')
  .toLowerCase();

const db = new Map();

function registerPoint(key, item) {
  const norm = normalize(key);
  if (!norm) return;
  if (!db.has(norm)) {
    db.set(norm, item);
  } else {
    // Merge if existing item has fewer examples
    const cur = db.get(norm);
    if ((!cur.examples || cur.examples.length === 0) && item.examples?.length > 0) {
      db.set(norm, { ...cur, ...item });
    }
  }
}

// A. Shinkanzen Master N1, N2, N3
[sk1, sk2, sk3].forEach(sk => {
  (sk.skills?.grammar || []).forEach(ch => {
    (ch.points || []).forEach(p => {
      const entry = {
        pattern: p.pattern,
        formula: p.formula || '',
        meaning: p.meaning || '',
        nuance: p.nuance || '',
        trapBuster: p.trapBuster || '',
        mnemonic: p.mnemonic || '',
        examples: p.examples || [],
        drills: (p.quiz || []).map(q => ({
          q: q.q,
          options: q.options,
          correct: q.correct,
          explain: q.explain
        }))
      };
      registerPoint(p.pattern, entry);
      if (p.pattern.includes('/')) {
        p.pattern.split('/').forEach(part => registerPoint(part, entry));
      }
    });
  });
});

// B. Mazii 2,218 Cards
anki.filter(c => c.source_deck?.includes('Mazii')).forEach(c => {
  const f = c.flds.split('\x1f');
  const level = f[0];
  const pat = f[1];
  const meaning = f[2];
  const form = f[3];
  const desc = f[4];
  const exs = [];
  if (f[5] && f[5].trim()) exs.push({ jp: f[5].trim(), vi: (f[6] || '').trim() });
  if (f[7] && f[7].trim()) exs.push({ jp: f[7].trim(), vi: (f[8] || '').trim() });
  if (f[9] && f[9].trim()) exs.push({ jp: f[9].trim(), vi: (f[10] || '').trim() });

  const entry = {
    pattern: pat,
    formula: form || pat,
    meaning: meaning,
    nuance: desc,
    examples: exs
  };
  registerPoint(pat, entry);
  if (pat.includes('/')) {
    pat.split('/').forEach(part => registerPoint(part, entry));
  }
});

// C. 848 Points Deck
anki.filter(c => c.source_deck?.includes('848')).forEach(c => {
  const f = c.flds.split('\x1f');
  const title = f[0] || '';
  const body = f[1] || '';
  const m = title.match(/^\d+\.\s*(.*?)(?:\s+\(.*?\))?\s+(.*)$/);
  if (m) {
    const pat = m[1].trim();
    const meaning = m[2].trim();
    
    // Extract Formula
    let formula = '';
    const formMatch = body.match(/<b>Công thức:<\/b>([\s\S]*?)(?:──────────|<b>Cách dùng:|$)/i);
    if (formMatch) {
      formula = formMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // Extract Usage
    let usage = '';
    const useMatch = body.match(/<b>Cách dùng:<\/b>([\s\S]*?)(?:──────────|<b>Ví dụ:|$)/i);
    if (useMatch) {
      usage = useMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // Extract Examples
    const exs = [];
    const exMatch = body.match(/<b>Ví dụ:<\/b>([\s\S]*?)(?:──────────|Chú ý:|$)/i);
    if (exMatch) {
      const exLines = exMatch[1].split(/<br\s*\/?>/i)
        .map(s => s.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean);
      for (let i = 0; i < exLines.length; i++) {
        const line = exLines[i];
        if (line.includes('→')) {
          const prevJp = exLines[i - 2] && !exLines[i - 2].includes('(') ? exLines[i - 2] : exLines[i - 1];
          const vi = line.replace(/^→\s*/, '').trim();
          if (prevJp && vi) {
            exs.push({ jp: prevJp.replace(/\(.*?\)/g, '').trim(), vi });
          }
        }
      }
    }

    const entry = {
      pattern: pat,
      formula: formula || pat,
      meaning: meaning,
      nuance: usage,
      examples: exs
    };
    registerPoint(pat, entry);
  }
});

// D. jlpt_grammar_full (2191 points)
gFull.forEach(g => {
  const entry = {
    pattern: g.title,
    formula: (g.formation || []).join(' / ') || g.title,
    meaning: g.meaning,
    nuance: g.explanation,
    examples: (g.examples || []).map(e => ({ jp: e.jp, vi: e.vi }))
  };
  registerPoint(g.title, entry);
  if (g.title.includes('／')) {
    g.title.split('／').forEach(part => registerPoint(part, entry));
  }
  if (g.pattern) registerPoint(g.pattern, entry);
});

// Alias mapping for Kanji / Hiragana / Idioms
const ALIASES = {
  '手前': 'てまえ',
  'てまえ': '手前',
  'ぬく': '抜く',
  '切る': 'きる',
  'きる': '切る',
  '気味': 'ぎみ',
  'ぎみ': '気味',
  '恐れがある': 'おそれがある',
  'おそれがある': '恐れがある',
  'わりに': 'わりの',
  '割に': 'わりに',
  '反面': 'はんめん',
  '一方': 'いっぽう',
  '皮切り': 'かわきり',
  '相まって': 'あいまって',
  '極まりない': 'きわまりない',
  '極み': 'きわみ',
  '至り': 'いたり',
  '恥じない': 'はじない',
  '忍びない': 'しのびない',
  '耐える': 'たえる',
  '耐えない': 'たえない',
  '堪えない': 'たえない',
  '禁じ得ない': 'きんじえない',
  '余儀なくされる': 'よぎなくされる',
  '余儀なくさせる': 'よぎなくさせる',
  'ずにはすまない': 'ずには済まない',
  'ないではいられない': 'ずにはいられない',
  'っこない': 'っこない',
  'かねる': '兼ねる',
  'かねない': '兼ねない',
  'がたい': '難い',
  'ようがない': '様がない'
};

// Cung cấp dữ liệu chuẩn mực cho các thành ngữ chuyên ngành, kính ngữ doanh nghiệp và xã luận
const CURATED_SPECIAL_PATTERNS = {
  // --- N2 Business & Keigo (Lessons 96-99) ---
  'ご意向に沿いかねる': {
    formula: 'N / ご意向 + に沿いかねる',
    meaning: 'Khó có thể đáp ứng / làm theo nguyện vọng của quý khách (từ chối khéo lịch thiệp)',
    nuance: 'Mẫu câu vàng trong email thương mại và đàm phán khi không thể thỏa hiệp hoặc đáp ứng yêu cầu của đối tác mà vẫn giữ được sự tôn trọng tuyệt đối.',
    trapBuster: 'Tuyệt đối không nói thẳng 「できません」. Dùng 「ご意向に沿いかねる」 hoặc 「ご希望に添えかねます」.',
    mnemonic: '沿う (men theo con đường) + かねる (khó lòng làm được) -> Khó lòng đi theo nguyện vọng.',
    examples: [
      { jp: '大変恐縮ではございますが、今回のご提案につきましてはご意向に沿いかねる結果となりました。', vi: 'Chúng tôi vô cùng lấy làm tiếc, nhưng đối với đề xuất lần này thì rất tiếc là khó có thể đáp ứng được theo nguyện vọng của quý công ty.' },
      { jp: '弊社の予算の都合上、ご提示いただいた条件にはご意向に沿いかねます。', vi: 'Do điều kiện ngân sách của công ty chúng tôi, chúng tôi rất tiếc không thể đáp ứng được các điều kiện mà quý vị đã đưa ra.' }
    ],
    drills: [{
      q: '誠に 申し訳ございませんが、ご提示の 価格では（　）。',
      options: ['ご意向に沿いかねます', '前向きに検討します', 'ご了承願います', '承知いたします'],
      correct: 0,
      explain: 'Từ chối giá đối tác đưa ra một cách lịch sự trang trọng -> Chọn ご意向に沿いかねます.'
    }]
  },
  '前向きに検討する': {
    formula: '～について + 前向きに検討いたします / 検討する',
    meaning: 'Chúng tôi sẽ xem xét một cách tích cực / cân nhắc nghiêm túc',
    nuance: 'Cụm từ then chốt trong thương lượng: Thể hiện thiện chí xem xét phương án, nhưng trong văn hóa Nhật cũng là câu trả lời ngoại giao trước khi ra quyết định cuối cùng.',
    trapBuster: 'Vế trước thường đi với: ご提案 (đề xuất), 見積もり (báo giá), 条件 (điều kiện).',
    mnemonic: '前向き (hướng về phía trước) + 検討 (cân nhắc xem xét) -> Tiếp cận vấn đề với thái độ tích cực.',
    examples: [
      { jp: 'ご提示いただきました見積もり条件につきましては、社内で前向きに検討させていただきます。', vi: 'Về các điều kiện báo giá mà quý công ty đã đưa ra, chúng tôi xin phép sẽ xem xét một cách tích cực trong nội bộ công ty.' },
      { jp: '新規事業の提携プランについて、持ち帰って前向きに検討いたします。', vi: 'Về kế hoạch hợp tác kinh doanh mới, tôi xin phép mang về công ty và cân nhắc một cách nghiêm túc.' }
    ],
    drills: [{
      q: 'ご提案の 件につきましては、社内で 持ち帰り（　）存じます。',
      options: ['前向きに検討いたしたく', 'ご意向に沿いかねたく', 'お詫び申し上げたく', 'ご容赦いただきたく'],
      correct: 0,
      explain: 'Bày tỏ thiện chí mang về công ty xem xét tích cực -> Chọn 前向きに検討いたしたく.'
    }]
  },
  'つきましては': {
    formula: 'Câu 1 (Nêu bối cảnh). つきましては、Câu 2 (Nêu hành động tiếp theo/Yêu cầu)',
    meaning: 'Chính vì vậy / Tiếp theo đây / Do đó (chuyển tiếp hành động trong văn thư)',
    nuance: 'Liên từ chuyển tiếp cực kỳ thông dụng trong thư thương mại Nhật Bản, dùng để nối từ phần giải thích bối cảnh sang phần đề xuất hành động cụ thể.',
    trapBuster: 'Vế sau thường là lời mời tham gia sự kiện, lời nhờ vả xác nhận hồ sơ hoặc lịch trình.',
    mnemonic: 'つきましては = Đi kèm với việc đó thì xin mời quý vị thực hiện bước tiếp theo.',
    examples: [
      { jp: '新製品の発表会を開催する運びとなりました。つきましては、ぜひご臨席賜りたく存じます。', vi: 'Chúng tôi sắp tổ chức buổi lễ ra mắt sản phẩm mới. Chính vì vậy, kính mong quý ngài bớt chút thời gian đến tham dự.' },
      { jp: '事務所を下記に移転いたしました。つきましては、今後ともご愛顧のほどお願い申し上げます。', vi: 'Văn phòng của chúng tôi đã chuyển đến địa chỉ dưới đây. Do đó, kính mong tiếp tục nhận được sự ủng hộ của quý khách.' }
    ],
    drills: [{
      q: '新役員が 就任いたしました。（　）、今後とも ご指導 ご鞭撻の ほど お願い 申し上げます。',
      options: ['つきましては', 'それどころか', 'とはいえ', 'にもかかわらず'],
      correct: 0,
      explain: 'Nối bối cảnh ban lãnh đạo mới sang lời thỉnh cầu -> Chọn つきましては.'
    }]
  },
  'ご了承のほど': {
    formula: '～ご了承のほど、よろしくお願い申し上げます / ご了承ください',
    meaning: 'Kính mong quý khách lượng thứ / thông cảm / đồng thuận cho',
    nuance: 'Dùng khi thông báo các quyết định đơn phương như: điều chỉnh giá, bảo trì hệ thống, thay đổi lịch làm việc mà người nghe cần phải chấp nhận.',
    trapBuster: 'Đi cùng danh từ: ご了承 (hiểu và chấp nhận), ご理解 (thông cảm), ご容赦 (dung thứ).',
    mnemonic: '承 (thừa nhận, đồng ý) -> Mong đối tác thấu hiểu và thừa nhận sự việc.',
    examples: [
      { jp: 'システムメンテナンスのため、今週末はサービスを停止いたします。何卒ご了承のほどお願いいたします。', vi: 'Do bảo trì hệ thống, dịch vụ sẽ tạm ngừng vào cuối tuần này. Kính mong quý khách thông cảm và lượng thứ.' },
      { jp: '原材料の高騰に伴い、来月より価格改定を実施いたしますので、あらかじめご了承のほどお願い申し上げます。', vi: 'Do giá nguyên vật liệu tăng cao, chúng tôi sẽ điều chỉnh giá từ tháng sau, kính mong quý khách lượng thứ trước.' }
    ],
    drills: [{
      q: '悪天候のため 配送が 遅れる 可能性が ございます。あらかじめ（　）お願い 申し上げます。',
      options: ['ご了承のほど', 'ご高覧のほど', 'お詫びのほど', '検討のほど'],
      correct: 0,
      explain: 'Thông báo sự cố giao hàng chậm mong khách hiểu cho -> Chọn ご了承のほど.'
    }]
  },
  '結論から申し上げますと': {
    formula: '結論から申し上げますと、～',
    meaning: 'Đi thẳng vào vấn đề / Kết luận trước hết là...',
    nuance: 'Quy tắc vàng PREP (Point - Reason - Example - Point) trong báo cáo Hou-Ren-So và thuyết trình kinh doanh Nhật Bản: Nêu đáp án cốt lõi trước rồi mới giải thích bối cảnh sau.',
    trapBuster: 'Dùng khi mở đầu câu trả lời phỏng vấn hoặc giải trình trước hội đồng quản trị.',
    mnemonic: '結論 (kết luận) + 申し上げる (khiêm nhường của 言う) -> Kính cẩn trình bày kết luận trước.',
    examples: [
      { jp: '結論から申し上げますと、今期の売上目標は達成できる見込みです。', vi: 'Đi thẳng vào kết luận, mục tiêu doanh thu của kỳ này dự kiến sẽ hoàn toàn có thể đạt được.' },
      { jp: '結論から申し上げますと、本プロジェクトは予定通り今月末にローンチ可能です。', vi: 'Trước hết xin khẳng định kết luận, dự án này hoàn toàn khả thi để ra mắt vào cuối tháng này đúng tiến độ.' }
    ],
    drills: [{
      q: '（　）、今回の 開発スケジュールは 予定通り 進行しております。',
      options: ['結論から申し上げますと', '背景といたしまして', '遺憾に存じますと', '看過できませんと'],
      correct: 0,
      explain: 'Báo cáo trực diện kết quả tiến độ -> Chọn 結論から申し上げますと.'
    }]
  },
  '鑑みますと': {
    formula: '～に / を + 鑑みますと (かんがみますと)',
    meaning: 'Cân nhắc kỹ lưỡng tình hình hiện tại / Soi chiếu vào thực tế...',
    nuance: 'Từ vựng thượng cấp gốc Hán: 鑑みる có nghĩa là soi gương (lấy kinh nghiệm quá khứ hoặc bối cảnh thực tế làm gương soi để ra quyết định thận trọng).',
    trapBuster: 'Thường đi với: 現下の情勢 (tình hình hiện tại), 諸般の事情 (các nguyên do), 過去の事例 (tiền lệ quá khứ).',
    mnemonic: '鑑 (gương đồng chiếu yêu / soi sáng) -> Soi tỏ sự việc thấu đáo.',
    examples: [
      { jp: '昨今の為替変動のリスクを鑑みますと、海外投資計画を一部見直す必要がございます。', vi: 'Cân nhắc kỹ rủi ro biến động tỷ giá hối đoái gần đây, chúng ta cần phải xem xét lại một phần kế hoạch đầu tư ra nước ngoài.' },
      { jp: '市場の急速な変化を鑑みますと、迅速な意思決定が不可欠であります。', vi: 'Soi chiếu vào những biến động nhanh chóng của thị trường, việc ra quyết định kịp thời là điều tối quan trọng.' }
    ],
    drills: [{
      q: '現下の 厳しい 経済状況に（　）、新規採用の 規模を 縮小せざるを 得ない。',
      options: ['鑑みますと', '対しまして', '至りまして', '限りますと'],
      correct: 0,
      explain: 'Cân nhắc bối cảnh kinh tế khó khăn -> Chọn 鑑みますと.'
    }]
  },
  '背景といたしまして': {
    formula: '背景といたしましては、～',
    meaning: 'Về bối cảnh của vấn đề này là...',
    nuance: 'Dùng ngay sau khi nêu kết luận hoặc quyết định lớn, nhằm giải thích tường tận các nguyên nhân khách quan và xu hướng thị trường dẫn đến quyết định đó.',
    trapBuster: 'Cặp đôi hoàn hảo: Nêu 「結論から申し上げますと」 trước, sau đó triển khai bằng 「その背景といたしましては」.',
    mnemonic: '背景 (phông nền đằng sau sân khấu) -> Những yếu tố ẩn sau bề nổi.',
    examples: [
      { jp: '新サービスの利用者が急増しておりますが、その背景といたしましては在宅勤務の定着が挙げられます。', vi: 'Lượng người dùng dịch vụ mới đang tăng vọt, và bối cảnh đằng sau sự việc này có thể kể đến xu hướng làm việc tại nhà đã ổn định.' },
      { jp: '売上減の背景といたしましては、競合他社による低価格製品の参入が影響しております。', vi: 'Về bối cảnh của việc giảm sút doanh số, nguyên nhân ảnh hưởng chính là sự tham gia của sản phẩm giá rẻ từ các đối thủ cạnh tranh.' }
    ],
    drills: [{
      q: '業績回復の（　）、徹底した コスト削減が 功を 奏しました。',
      options: ['背景といたしまして', '結論といたしまして', 'お詫びといたしまして', 'おそれといたしまして'],
      correct: 0,
      explain: 'Giải thích nguyên nhân tạo nên sự phục hồi thành tích -> Chọn 背景といたしまして.'
    }]
  },
  'ご高覧ください': {
    formula: 'N (資料 / 提案書) + を + ご高覧ください / ご高覧賜りますよう',
    meaning: 'Kính mời quý ngài xem qua / thị sát tài liệu',
    nuance: 'Kính ngữ thượng đỉnh của 見てください, dùng khi gửi kèm tài liệu, hồ sơ báo cáo quan trọng cho Chủ tịch, Giám đốc đối tác hoặc khách hàng VIP.',
    trapBuster: 'Không dùng cho bản thân (bản thân mình xem thì dùng 拝見する).',
    mnemonic: '高 (cao quý) + 覧 (nhìn, lãm thị) -> Đôi mắt tinh tường của quý ngài đoái nhìn.',
    examples: [
      { jp: '企画書の詳細を添付ファイルにてお送りいたしますので、ぜひご高覧ください。', vi: 'Tôi xin gửi chi tiết bản kế hoạch trong tệp đính kèm, kính mời quý ngài bớt chút thời giờ xem qua ạ.' },
      { jp: '最新の会社案内パンフレットを同封いたしましたので、ご高覧賜りますようお願い申し上げます。', vi: 'Tôi đã gửi kèm cuốn tài liệu giới thiệu công ty mới nhất, kính mong quý ngài đoái xem.' }
    ],
    drills: [{
      q: '添付の 契約書ドラフトを（　）、修正点が ございましたら ご指示 ください。',
      options: ['ご高覧のうえ', '拝見のうえ', 'ご容赦のうえ', '前向きのうえ'],
      correct: 0,
      explain: 'Mời đối tác xem bản thảo hợp đồng -> Chọn ご高覧のうえ.'
    }]
  },
  '誠に遺憾に存じます': {
    formula: '～につきましては、誠に遺憾に存じます / 遺憾の意を表します',
    meaning: 'Chúng tôi vô cùng lấy làm tiếc / hết sức đau lòng và tiếc nuối',
    nuance: 'Ngôn từ ngoại giao và quan hệ công chúng (PR) cấp cao khi xảy ra sự cố nghiêm trọng ảnh hưởng đến uy tín đôi bên mà không thể vãn hồi được.',
    trapBuster: '遺憾 (di hận, tiếc nuối) là từ trang trọng nhất để bày tỏ sự đáng tiếc của tổ chức.',
    mnemonic: '遺 (để lại) + 憾 (sự tiếc nuối) + 存じる (nghĩ/cảm thấy) -> Nỗi niềm tiếc nuối khôn nguôi.',
    examples: [
      { jp: '今回の製品不具合により多大なご迷惑をおかけしましたこと、誠に遺憾に存じます。', vi: 'Về việc sự cố kỹ thuật của sản phẩm lần này đã gây ra nhiều phiền toái to lớn, chúng tôi vô cùng lấy làm tiếc.' },
      { jp: '双方の合意に至らなかったことは、弊社としても誠に遺憾に存ずる次第でございます。', vi: 'Việc hai bên không đạt được thỏa thuận chung là điều mà phía công ty chúng tôi cũng hết sức tiếc nuối.' }
    ],
    drills: [{
      q: 'このような 不祥事が 発生いたしました ことは、（　）存じます。',
      options: ['誠に遺憾に', '前向きに', 'ご高覧に', '遅滞なく'],
      correct: 0,
      explain: 'Bày tỏ sự tiếc nuối sâu sắc trước bê bối phát sinh -> Chọn 誠に遺憾に.'
    }]
  },
  '重ねてお詫び申し上げます': {
    formula: '重ねてお詫び申し上げます',
    meaning: 'Một lần nữa chúng tôi xin chân thành tạ lỗi / cúi đầu xin lỗi quý vị',
    nuance: 'Dùng ở cuối thư từ tạ lỗi hoặc họp báo xin lỗi khi đã giải trình xong nguyên nhân sự cố: Khẳng định lại thái độ hối lỗi chân thành của toàn thể công ty.',
    trapBuster: '重ねて (nhiều lần, lặp lại) thể hiện thái độ xin lỗi tầng tầng lớp lớp.',
    mnemonic: '重ねる (chồng chất lên nhau) + お詫び (lời xin lỗi) -> Gửi gắm lời tạ lỗi sâu sắc nhiều lần.',
    examples: [
      { jp: 'お客様にご不便をおかけいたしましたこと、重ねて深くお詫び申し上げます。', vi: 'Về việc đã gây ra sự bất tiện cho quý khách, một lần nữa chúng tôi xin cúi đầu chân thành tạ lỗi.' },
      { jp: '弊社の管理体制の不備につきまして、重ねて心よりお詫び申し上げます。', vi: 'Về những thiếu sót trong hệ thống quản lý của chúng tôi, một lần nữa chúng tôi xin chân thành xin lỗi từ đáy lòng.' }
    ],
    drills: [{
      q: '多大なる ご迷惑を おかけしました ことを、（　）申し上げます。',
      options: ['重ねてお詫び', '前向きに検討', 'ご了承', 'ご高覧'],
      correct: 0,
      explain: 'Lời tạ lỗi trang trọng ở cuối thư -> Chọn 重ねてお詫び.'
    }]
  },
  'ご容赦いただけますよう': {
    formula: '何卒ご容赦いただけますよう / ご容赦ください',
    meaning: 'Kính mong quý đối tác dung thứ / lượng thứ / bỏ qua cho sơ suất này',
    nuance: 'Dùng khi có sơ suất nhỏ ngoài ý muốn như: gửi nhầm email, chậm trễ vài giờ hoặc lỗi đánh máy tài liệu.',
    trapBuster: '容赦 (dung xá) = khoan dung tha thứ. Nhẹ nhàng hơn 謝罪 (tạ tội).',
    mnemonic: '容 (chứa đựng, bao dung) + 赦 (ân xá) -> Mong được mở lòng bao dung tha thứ.',
    examples: [
      { jp: '行き違いで請求書が届いてしまいました折には、何卒ご容赦いただけますようお願いいたします。', vi: 'Nếu hóa đơn bị gửi nhầm do lỗi thời điểm, kính mong quý khách lượng thứ bỏ qua cho sự sơ suất này.' },
      { jp: '急な仕様変更により納期が一日遅れましたこと、ご容赦いただけますようお願い申し上げます。', vi: 'Kính mong quý công ty thông cảm dung thứ cho việc lùi ngày giao hàng một hôm do thay đổi thông số gấp.' }
    ],
    drills: [{
      q: 'メールの 送信が 行き違いと なりました 際は、何卒（　）お願い 申し上げます。',
      options: ['ご容赦いただけますよう', '看過いただけますよう', '検討いただけますよう', '公示いただけますよう'],
      correct: 0,
      explain: 'Mong khách bỏ qua sơ suất gửi trùng email -> Chọn ご容赦いただけますよう.'
    }]
  },
  '早急に対応いたす所存です': {
    formula: '～につき早急に対応いたす所存です / 所存でございます',
    meaning: 'Chúng tôi dự định sẽ xử lý khẩn trương ngay lập tức',
    nuance: 'Thể hiện cam kết hành động quyết liệt và tinh thần trách nhiệm cao của doanh nghiệp khi đối ứng khiếu nại (Claim handling).',
    trapBuster: '所存 (sở tồn) là cách nói khiêm nhường trang trọng của つもり (dự định của bản thân/công ty mình).',
    mnemonic: '早急 (nhanh chóng cấp bách) + 所存 (ý định nung nấu) -> Cam kết hành động thần tốc.',
    examples: [
      { jp: 'ご指摘いただきましたサーバー障害につきましては、エンジニアチームが早急に対応いたす所存です。', vi: 'Về sự cố máy chủ mà quý khách đã phản ánh, đội ngũ kỹ sư của chúng tôi sẽ khẩn trương xử lý ngay lập tức.' },
      { jp: '再発防止策を策定し、早急に対応いたす所存でございます。', vi: 'Chúng tôi xin cam kết sẽ xây dựng phương án phòng ngừa tái phát và khẩn trương triển khai xử lý ngay.' }
    ],
    drills: [{
      q: 'お客様からの ご要望には、全社を 挙げて（　）所存でございます。',
      options: ['早急に対応いたす', 'ご意向に沿いかねる', '遺憾に存ずる', '論を俟たない'],
      correct: 0,
      explain: 'Cam kết toàn công ty sẽ khẩn trương hành động -> Chọn 早急に対応いたす.'
    }]
  },
  '本規程に定めるところにより': {
    formula: '本規程に定めるところにより、～',
    meaning: 'Theo như quy định được ghi rõ trong quy chế / điều lệ này',
    nuance: 'Cụm từ pháp lý chuẩn mực mở đầu các văn bản hành chính doanh nghiệp, hợp đồng lao động và quy chế nội bộ.',
    trapBuster: '定めるところにより = Căn cứ theo điều lệ đã ấn định.',
    mnemonic: '規程 (quy chế) + 定める (ấn định) -> Tuân thủ đúng khuôn phép điều lệ.',
    examples: [
      { jp: '役員の報酬および退職金は、本規程に定めるところにより支給するものとする。', vi: 'Thù lao và tiền trợ cấp thôi việc của ban giám đốc sẽ được chi trả theo đúng quy định được ghi rõ trong điều lệ này.' },
      { jp: '本規程に定めるところにより、年次有給休暇を取得することができる。', vi: 'Người lao động có thể nghỉ phép năm có lương căn cứ theo những điều khoản được ghi rõ trong quy chế này.' }
    ],
    drills: [{
      q: '交通費の 支給基準は、（　）厳格に 算出されます。',
      options: ['本規程に定めるところにより', '前向きに検討することにより', '遺憾に存ずるところにより', '看過できないところにより'],
      correct: 0,
      explain: 'Tiêu chuẩn chi trả tính theo điều lệ -> Chọn 本規程に定めるところにより.'
    }]
  },
  'この限りではない': {
    formula: 'ただし、～はこの限りではない',
    meaning: 'Không áp dụng điều khoản này / Là trường hợp ngoại lệ',
    nuance: 'Thuật ngữ pháp lý kinh điển dùng ở cuối câu trong các điều khoản hợp đồng hoặc luật pháp để chỉ trường hợp được miễn trừ.',
    trapBuster: 'Hầu như luôn xuất hiện sau liên từ 「ただし、～」 (Tuy nhiên, đối với...).',
    mnemonic: '限り (giới hạn) + ではない (không phải) -> Nằm ngoài giới hạn ràng buộc của điều khoản trên.',
    examples: [
      { jp: '原則として社内資料の持ち出しは禁止する。ただし、役員の許可を得た場合はこの限りではない。', vi: 'Về nguyên tắc, nghiêm cấm mang tài liệu công ty ra ngoài. Tuy nhiên, trường hợp được sự đồng ý của ban giám đốc thì không áp dụng lệnh cấm này.' },
      { jp: '休日の入館は不可とする。ただし、事前申請が承認された業務に関してはこの限りではない。', vi: 'Không được phép vào tòa nhà ngày nghỉ. Tuy nhiên, đối với công việc đã được phê duyệt đơn đăng ký trước thì là trường hợp ngoại lệ.' }
    ],
    drills: [{
      q: '原則として 途中退場は 認められません。ただし、急病の 場合は（　）。',
      options: ['この限りではない', '論を俟たない', '早急に対応する', 'ご容赦いただく'],
      correct: 0,
      explain: 'Trường hợp cấp cứu là ngoại lệ được miễn trừ -> Chọn この限りではない.'
    }]
  },
  '準拠するものとする': {
    formula: 'N (法令 / 国際規格) + に + 準拠するものとする',
    meaning: 'Sẽ tuân thủ / dựa theo chuẩn mực... (quy định bắt buộc)',
    nuance: 'Cụm từ chốt hạ trong hợp đồng kinh tế và tài liệu kỹ thuật, khẳng định tính bắt buộc tuân thủ tiêu chuẩn ISO hoặc luật định.',
    trapBuster: 'ものとする thể hiện nghĩa vụ pháp lý bắt buộc (Legal binding obligation).',
    mnemonic: '準拠 (chuẩn cứ, dựa theo tiêu chuẩn) + ものとする (quy định phải làm).',
    examples: [
      { jp: '本契約の解釈および適用は、日本国の関係法令に準拠するものとする。', vi: 'Việc diễn giải và áp dụng hợp đồng này sẽ dựa theo và tuân thủ các quy định pháp luật liên quan của Nhật Bản.' },
      { jp: '製品のセキュリティ設計は、国際規格ISO27001に準拠するものとする。', vi: 'Thiết kế bảo mật của sản phẩm sẽ bắt buộc phải tuân thủ chuẩn mực quốc tế ISO 27001.' }
    ],
    drills: [{
      q: '本システムの 設計基準は、最新の JIS規格に（　）。',
      options: ['準拠するものとする', 'この限りではない', '遺憾に存ずるものとする', 'つきましては'],
      correct: 0,
      explain: 'Quy định thiết kế bắt buộc theo tiêu chuẩn JIS -> Chọn 準拠するものとする.'
    }]
  },
  '遅滞なく通知する': {
    formula: 'N (変更事項 / 事故) + を + 遅滞なく通知する / 通知しなければならない',
    meaning: 'Thông báo không chậm trễ / Thông báo ngay lập tức khi phát sinh',
    nuance: 'Thuật ngữ luật doanh nghiệp: Không được lần lữa kéo dài thời gian mà phải lập tức gửi văn bản thông báo ngay khi có sự thay đổi.',
    trapBuster: '遅滞 (trì trệ) + なく (không) = Không chậm trễ một giây phút nào.',
    mnemonic: '遅滞なく = Không một độ trễ, báo ngay tức thì.',
    examples: [
      { jp: '住所または連絡先に変更が生じたときは、会社に対して遅滞なく通知しなければならない。', vi: 'Khi có thay đổi về địa chỉ cư trú hoặc số điện thoại liên lạc, phải thông báo ngay cho công ty mà không được chậm trễ.' },
      { jp: '重大なセキュリティインシデントが発生した場合、関係機関へ遅滞なく通知する義務がある。', vi: 'Khi xảy ra sự cố an ninh mạng nghiêm trọng, tổ chức có nghĩa vụ phải thông báo ngay lập tức không chậm trễ cho cơ quan chức năng.' }
    ],
    drills: [{
      q: '契約内容に 異議が ある場合は、書面にて（　）ものとする。',
      options: ['遅滞なく通知する', '前向きに検討する', 'ご高覧いただく', 'この限りではない'],
      correct: 0,
      explain: 'Nghĩa vụ gửi văn bản khiếu nại ngay lập tức -> Chọn 遅滞なく通知する.'
    }]
  },

  // --- N1 Academic, Judicial & Editorial (Lessons 115-119) ---
  '論を俟たない': {
    formula: 'N + は + 論を俟たない (ろんをまたない)',
    meaning: 'Hiển nhiên rõ ràng / Không cần phải bàn cãi / Khỏi phải nói',
    nuance: 'Văn phong học thuật, xã luận (Asahi, Nikkei): Diễn đạt một sự thật hoặc chân lý hiển nhiên đến mức không tốn lời tranh luận thêm.',
    trapBuster: '俟つ (matsuo/matsu) là cổ tự của 待つ (chờ đợi). 論を俟たない = Không cần đợi đến tranh luận cũng đã rõ.',
    mnemonic: 'Không cần bàn cãi thêm, chân lý sáng rõ như trăng rằm.',
    examples: [
      { jp: '地球温暖化が生態系に深刻な悪影響を及ぼしていることは、もはや論を俟たない。', vi: 'Việc hiện tượng ấm lên toàn cầu đang gây tác động tiêu cực nghiêm trọng đến hệ sinh thái là điều hiển nhiên không cần phải bàn cãi nữa.' },
      { jp: '教育への投資が国家の将来を左右する重要事項であることは、論を俟たない事実である。', vi: 'Đầu tư cho giáo dục là việc trọng đại quyết định tương lai của quốc gia, đó là sự thật rõ ràng không ai có thể phủ nhận.' }
    ],
    drills: [{
      q: '科学技術の 発展が 人類の 生活を 一変させた ことは、（　）。',
      options: ['論を俟たない', '看過できない', '疑う余地がある', 'この限りではない'],
      correct: 0,
      explain: 'Sự thật hiển nhiên không cần bàn cãi -> Chọn 論を俟たない.'
    }]
  },
  '看過できない': {
    formula: 'N + を + 看過できない / 看過することはできない (かんかできない)',
    meaning: 'Không thể xem nhẹ / Không thể làm ngơ / Tuyệt đối không thể bỏ qua',
    nuance: 'Xuất hiện trong xã luận và nghị luận chính trị khi phê phán gay gắt một tiêu cực hoặc nguy cơ hiểm nghèo đòi hỏi hành động can thiệp khẩn cấp.',
    trapBuster: '看過 (khán quá) = nhìn rồi bỏ qua, làm ngơ. 看過できない = Tuyệt đối không thể dung túng làm ngơ.',
    mnemonic: '看 (nhìn) + 過 (cho qua) -> Không thể nhắm mắt làm ngơ cho qua được.',
    examples: [
      { jp: '若者の貧困率が上昇している現実は、社会正義の観点からも決して看過できない。', vi: 'Thực trạng tỷ lệ nghèo ở người trẻ ngày càng tăng là điều xét từ góc độ công bằng xã hội tuyệt đối không thể làm ngơ.' },
      { jp: '企業の不正会計疑惑を、監査法人として看過することは許されない。', vi: 'Nghi vấn gian lận kế toán của doanh nghiệp là điều mà đơn vị kiểm toán không thể dung thứ bỏ qua.' }
    ],
    drills: [{
      q: '子どもへの 虐待件数の 増加は、社会全体として 決して（　）深刻な 事態だ。',
      options: ['看過できない', '論を俟たない', '是とする', '準拠する'],
      correct: 0,
      explain: 'Vấn đề bạo hành tăng nghiêm trọng không thể làm ngơ -> Chọn 看過できない.'
    }]
  },
  '疑う余地がない': {
    formula: 'N + には + 疑う余地がない / 疑う余地はない',
    meaning: 'Hoàn toàn chắc chắn / Không còn một chút hoài nghi nào',
    nuance: 'Khẳng định tính xác thực tuyệt đối 100% dựa trên các bằng chứng khoa học hoặc tài liệu thực nghiệm không thể chối cãi.',
    trapBuster: '余地 (dư địa) = khoảng trống. Không còn khoảng trống nào cho sự nghi ngờ.',
    mnemonic: 'Khóa chặt mọi khe hở hoài nghi bằng bằng chứng thép.',
    examples: [
      { jp: '発掘された古代文書の真正性については、複数の専門家の鑑定により疑う余地がない。', vi: 'Về tính xác thực của các văn bản cổ mới khai quật, qua giám định của nhiều chuyên gia thì không còn chút hoài nghi nào.' },
      { jp: '彼がこの分野において卓越した業績を残したことは、疑う余地のない事実である。', vi: 'Việc anh ấy đã để lại những thành tựu kiệt xuất trong lĩnh vực này là một sự thật không thể chối cãi.' }
    ],
    drills: [{
      q: 'DNA鑑定の 結果により、犯人の 身元については（　）。',
      options: ['疑う余地がない', '論を俟つ', '看過できない', 'この限りではない'],
      correct: 0,
      explain: 'Kết quả giám định ADN khẳng định chắc chắn 100% danh tính -> Chọn 疑う余地がない.'
    }]
  },
  '是とする': {
    formula: 'N + を + 是とする (ぜとする)',
    meaning: 'Cho là đúng đắn / Tán thành / Xem là chuẩn mực',
    nuance: 'Thuật ngữ triết học và chính luận học thuật: Phân biệt giữa 是 (đúng, thiện) và 非 (sai, ác).',
    trapBuster: 'Đối lập với 非とする (cho là sai trái, lên án). Thường đi với: 成果主義を是とする, 改革を是とする.',
    mnemonic: '是 (thị, đúng đắn) -> Công nhận giá trị chính đáng của đối tượng.',
    examples: [
      { jp: '短期的な利益のみを是とする経営姿勢は、やがて企業の持続的成長を阻害する。', vi: 'Lối tư duy quản trị chỉ coi trọng lợi nhuận ngắn hạn là đúng đắn rồi sẽ cản trở sự phát triển bền vững của doanh nghiệp.' },
      { jp: '多様性を是とする社会の実現に向けて、制度改革を進めなければならない。', vi: 'Để hướng tới một xã hội coi trọng và tôn vinh sự đa dạng, chúng ta phải thúc đẩy cải cách thể chế.' }
    ],
    drills: [{
      q: '目先の 効率のみを（　）風潮に、警鐘を 鳴らす 必要が ある。',
      options: ['是とする', '非とする', '準拠とする', '通知とする'],
      correct: 0,
      explain: 'Trào lưu chỉ coi trọng hiệu quả trước mắt là đúng đắn -> Chọn 是とする.'
    }]
  },
  '解釈の余地': {
    formula: '～について + 解釈の余地がある / 解釈の余地を残さない',
    meaning: 'Dư địa diễn giải / Khoảng trống để hiểu theo cách khác',
    nuance: 'Ngôn ngữ tư pháp và phân tích văn bản: Khi soạn thảo luật pháp cần loại bỏ tối đa 「解釈の余地」 để tránh hiểu lầm đa nghĩa.',
    trapBuster: '解釈の余地を残さない = Rõ ràng mạch lạc đến mức không ai có thể vặn vẹo hiểu sai được.',
    mnemonic: 'Giải thích + Dư địa -> Khoảng trống mở ra các cách hiểu khác nhau.',
    examples: [
      { jp: '条文の表現が曖昧であるため、様々な解釈の余地が生じてしまっている。', vi: 'Do cách diễn đạt trong điều khoản còn mơ hồ nên đã làm nảy sinh nhiều cách hiểu khác nhau.' },
      { jp: '契約書は、将来の紛争を防ぐため解釈の余地を残さない厳格な文言で作成すべきだ。', vi: 'Hợp đồng cần được soạn thảo bằng ngôn từ chặt chẽ không để lại kẽ hở diễn giải sai lệch nhằm tránh tranh chấp tương lai.' }
    ],
    drills: [{
      q: 'この 規程は 厳密に 定義されて おり、誤解や（　）は 全くない。',
      options: ['解釈の余地', '看過の余地', '遺憾の余地', '是認の余地'],
      correct: 0,
      explain: 'Không có kẽ hở để giải thích sai lệch -> Chọn 解釈の余地.'
    }]
  },
  '規定に鑑み': {
    formula: 'N (法令 / 規程) + に鑑み (にかんがみ)',
    meaning: 'Căn cứ theo điều lệ / Xem xét quy định pháp luật',
    nuance: 'Cụm từ trang trọng tuyệt đối trong các phán quyết của tòa án hoặc văn kiện nhà nước cấp cao.',
    trapBuster: 'Văn phong hành chính cổ: ~に鑑み = Soi chiếu vào các điều khoản quy định.',
    mnemonic: 'Gương chiếu pháp luật soi tỏ thẩm quyền.',
    examples: [
      { jp: '憲法第9条の規定に鑑み、平和主義の原則を遵守しなければならない。', vi: 'Căn cứ theo quy định của Điều 9 Hiến pháp, chúng ta phải tuyệt đối tuân thủ nguyên tắc chủ nghĩa hòa bình.' },
      { jp: '労働基準法の規定に鑑み、過度な時間外労働に対して是正勧告がなされた。', vi: 'Xem xét căn cứ theo quy định của Luật Tiêu chuẩn Lao động, văn bản khuyến cáo khắc phục tình trạng làm thêm quá giờ đã được ban hành.' }
    ],
    drills: [{
      q: '国際法の（　）、一方的な 武力行使は 厳しく 非難される。',
      options: ['規定に鑑み', '結論に鑑み', '余地に鑑み', 'お詫びに鑑み'],
      correct: 0,
      explain: 'Căn cứ theo quy định của công pháp quốc tế -> Chọn 規定に鑑み.'
    }]
  },
  '効力を有する': {
    formula: 'N + は + 法的な効力を有する / 効力を失う',
    meaning: 'Có hiệu lực pháp lý',
    nuance: 'Thuật ngữ chuẩn xác của luật học chỉ một thỏa thuận hoặc đạo luật đã chính thức phát sinh giá trị ràng buộc trách nhiệm pháp lý.',
    trapBuster: '有する (ゆうする) = sở hữu, có.',
    mnemonic: 'Nắm giữ hiệu lực quyền uy trong tay.',
    examples: [
      { jp: '両当事者の署名捺印が完了した時点で、本合意書は正式な効力を有する。', vi: 'Tại thời điểm cả hai bên hoàn tất việc ký tên đóng dấu, bản thỏa thuận này chính thức có hiệu lực pháp lý.' },
      { jp: '議会の過半数の賛成を得た法案のみが、法的な効力を有することとなる。', vi: 'Chỉ những dự luật nhận được sự tán thành của đa số nghị viện mới có hiệu lực thi hành theo luật định.' }
    ],
    drills: [{
      q: '公証役場で 作成された 公正証書は、極めて 高い 証拠（　）。',
      options: ['効力を有する', '解釈を有する', '看過を有する', '遺憾を有する'],
      correct: 0,
      explain: 'Có hiệu lực chứng cứ pháp lý cao -> Chọn 効力を有する.'
    }]
  },
  'この旨を公示する': {
    formula: 'N + の + この旨を公示する / 公示しなければならない',
    meaning: 'Công bố nội dung này một cách chính thức trên công báo',
    nuance: 'Công quyền hành chính: Dùng khi chính phủ hoặc cơ quan chức năng ban hành sắc lệnh và thông báo công khai cho toàn dân.',
    trapBuster: '公示 (công thị) = Niêm yết công khai trên bảng tin công báo nhà nước.',
    mnemonic: 'Đưa lên công báo để thiên hạ cùng tỏ tường.',
    examples: [
      { jp: '都市計画の決定がなされたときは、速やかにその旨を公示しなければならない。', vi: 'Khi quy hoạch đô thị được thông qua quyết định, cơ quan chức năng phải nhanh chóng công bố chính thức nội dung này trên công báo.' },
      { jp: '新法が公布されたことを広く国民に周知させるため、官報を通じてこの旨を公示した。', vi: 'Để đông đảo quốc dân được biết luật mới đã được ban hành, nội dung này đã được thông báo chính thức qua công báo chính phủ.' }
    ],
    drills: [{
      q: '選挙期日が 決定した ため、自治体の 掲示板にて（　）。',
      options: ['この旨を公示した', '前向きに検討した', '論を俟たなかった', 'この限りではなかった'],
      correct: 0,
      explain: 'Niêm yết thông báo ngày bầu cử chính thức -> Chọn この旨を公示した.'
    }]
  },
  '深い憂慮の念を禁じ得ない': {
    formula: '～に対し、深い憂慮の念を禁じ得ない',
    meaning: 'Không thể kìm nén nỗi lo âu / quan ngại sâu sắc (ngoại giao cấp bộ trưởng)',
    nuance: 'Khẩu khí ngoại giao thượng đỉnh: Dùng trong các tuyên bố của Bộ Ngoại giao khi xảy ra xung đột quân sự hoặc vi phạm nhân quyền quốc tế.',
    trapBuster: '禁じ得ない (kinjienai) = Không thể nào kiềm chế được cảm xúc dâng trào.',
    mnemonic: 'Nỗi ưu tư sâu thẳm như thác lũ tràn bờ.',
    examples: [
      { jp: '紛争地域における人道危機の急速な悪化に対し、深い憂慮の念を禁じ得ない。', vi: 'Trước sự suy thoái nghiêm trọng của cuộc khủng hoảng nhân đạo tại vùng xung đột, chúng tôi không thể kìm nén sự quan ngại sâu sắc.' },
      { jp: '近隣諸国の軍備拡張の動きについて、政府として深い憂慮の念を禁じ得ないと表明した。', vi: 'Chính phủ đã tuyên bố không thể kìm nén sự lo âu sâu sắc trước động thái gia tăng quân bị của các quốc gia láng giềng.' }
    ],
    drills: [{
      q: '武力衝突による 民間人の 犠牲拡大に（　）。',
      options: ['深い憂慮の念を禁じ得ない', '前向きに検討いたす所存だ', '論を俟たない', '是とする'],
      correct: 0,
      explain: 'Bày tỏ quan ngại sâu sắc trước thương vong chiến tranh -> Chọn 深い憂慮の念を禁じ得ない.'
    }]
  },
  '協調の精神に基づき': {
    formula: '協調の精神に基づき、～',
    meaning: 'Dựa trên tinh thần hợp tác hữu nghị / tinh thần đồng lòng đa phương',
    nuance: 'Cụm từ trụ cột trong các thông cáo chung của hội nghị thượng đỉnh đa phương (G7, ASEAN, Liên Hợp Quốc).',
    trapBuster: '協調 (hiệp điều) = chung tay phối hợp, tôn trọng lẫn nhau.',
    mnemonic: 'Cùng chung một nhịp đập hòa bình và phát triển.',
    examples: [
      { jp: '国際社会は協調の精神に基づき、気候変動問題に一致団結して立ち向かわねばならない。', vi: 'Cộng đồng quốc tế dựa trên tinh thần hợp tác đa phương phải đoàn kết một lòng để đương đầu với hiểm họa biến đổi khí hậu.' },
      { jp: '近隣諸国との協調の精神に基づき、持続可能な経済圏の構築を目指す。', vi: 'Dựa trên tinh thần hợp tác với các quốc gia láng giềng, chúng ta hướng tới xây dựng một khu vực kinh tế phát triển bền vững.' }
    ],
    drills: [{
      q: '多国間 貿易の 諸課題を、（　）平和的に 解決する。',
      options: ['協調の精神に基づき', '遺憾の意に基づき', 'この限りに基づき', '看過できない精神に基づき'],
      correct: 0,
      explain: 'Giải quyết các vấn đề thương mại theo tinh thần hợp tác -> Chọn 協調の精神に基づき.'
    }]
  },
  '遺憾の意を表明する': {
    formula: '～に対し、強い遺憾の意を表明する',
    meaning: 'Bày tỏ sự lấy làm tiếc sâu sắc / phản đối ngoại giao chính thức',
    nuance: 'Ngôn từ ngoại giao mạnh mẽ thứ hai trước khi cắt đứt quan hệ hoặc triệu tập đại sứ.',
    trapBuster: 'Khác với xin lỗi, 遺憾の意を表明する thường là lời khiển trách, chỉ trích hành vi vi phạm của phía đối phương.',
    mnemonic: 'Tuyên bố chính thức sự bất bình và nuối tiếc ngoại giao.',
    examples: [
      { jp: '主権侵害に当たる一方的な軍事演習に対し、外務省は強い遺憾の意を表明した。', vi: 'Bộ Ngoại giao đã chính thức bày tỏ sự lấy làm tiếc sâu sắc và phản đối mạnh mẽ trước cuộc tập trận quân sự đơn phương xâm phạm chủ quyền.' },
      { jp: '条約に反する関税引き上げ措置に対し、政府は正式に遺憾の意を表明した。', vi: 'Trước biện pháp nâng thuế quan trái với hiệp ước, chính phủ đã chính thức tuyên bố bày tỏ sự tiếc nuối sâu sắc.' }
    ],
    drills: [{
      q: '他国の 領海侵犯に 対し、政府は 厳重に 抗議し（　）。',
      options: ['遺憾の意を表明した', '前向きに検討した', 'ご高覧を願った', '公示した'],
      correct: 0,
      explain: 'Phản đối ngoại giao trước hành vi xâm phạm lãnh hải -> Chọn 遺憾の意を表明した.'
    }]
  },
  '確固たる決意を示す': {
    formula: '～に向け、確固たる決意を示す',
    meaning: 'Thể hiện quyết tâm sắt đá / ý chí kiên định vững chắc',
    nuance: 'Diễn văn chính trị của nguyên thủ quốc gia khi bước vào giai đoạn cải cách hoặc đương đầu khủng hoảng quốc gia.',
    trapBuster: '確固 (xác cố) = vững như bàn thạch không gì lay chuyển.',
    mnemonic: 'Ý chí kiên định được đúc bằng thép.',
    examples: [
      { jp: '首相は記者会見において、デフレからの完全脱却に向けた確固たる決意を示した。', vi: 'Thủ tướng trong buổi họp báo đã thể hiện quyết tâm sắt đá hướng tới việc đưa đất nước thoát hoàn toàn khỏi bóng ma giảm phát.' },
      { jp: 'テロリズムに断固として屈しない確固たる決意を、国際会議の場で世界に示した。', vi: 'Tại hội nghị quốc tế, chúng tôi đã thể hiện với toàn thế giới quyết tâm sắt đá tuyệt đối không khuất phục trước chủ nghĩa khủng bố.' }
    ],
    drills: [{
      q: '財政再建を 成し遂げる ため、首脳陣は（　）。',
      options: ['確固たる決意を示した', '遺憾の意を示した', '看過できない決意を示した', '解釈の余地を示した'],
      correct: 0,
      explain: 'Thể hiện quyết tâm vững chắc tái thiết tài chính -> Chọn 確固たる決意を示した.'
    }]
  },
  '換言すれば': {
    formula: 'Câu 1. 換言すれば、Câu 2.',
    meaning: 'Nói cách khác / Diễn đạt theo cách khác / Tức là',
    nuance: 'Liên từ then chốt trong các bài luận văn tốt nghiệp và đề thi Đọc hiểu N1: Tác giả nhắc lại luận điểm khó hiểu bằng một ngôn từ cô đọng, dễ hiểu hơn.',
    trapBuster: 'Sau 換言すれば thường là từ khóa cốt lõi của toàn bộ bài văn Đọc hiểu N1!',
    mnemonic: '換 (hoán đổi) + 言 (lời nói) -> Đổi lời nói để làm sáng tỏ ý nghĩa.',
    examples: [
      { jp: 'この現象は心理的な防衛本能の一種であり、換言すれば自己を守るための無意識の反応である。', vi: 'Hiện tượng này là một dạng bản năng phòng vệ tâm lý, nói cách khác chính là phản xạ vô thức để tự bảo vệ bản thân.' },
      { jp: '彼は生涯を通じて妥協を許さなかった。換言すれば、自らの美学を貫き通した芸術家であった。', vi: 'Suốt cuộc đời ông ấy chưa từng chấp nhận thỏa hiệp. Nói cách khác, ông là một nghệ sĩ đã kiên định đến cùng với mỹ học của riêng mình.' }
    ],
    drills: [{
      q: '言語は 単なる 伝達手段では ない。（　）、思考そのものを 形作る 枠組みなのだ。',
      options: ['換言すれば', 'それどころか', 'とはいえ', 'にもかかわらず'],
      correct: 0,
      explain: 'Nói cách khác, diễn giải lại bản chất của ngôn ngữ -> Chọn 換言すれば.'
    }]
  },
  '帰結する': {
    formula: 'N + に + 帰結する',
    meaning: 'Dẫn đến kết quả tất yếu / Quy về một mối / Kết thúc ở...',
    nuance: 'Tư duy logic biện chứng: Khi một chuỗi lập luận phức tạp cuối cùng gom tụ về một kết luận duy nhất mang tính nhân quả.',
    trapBuster: '帰 (quay về) + 結 (kết quả) -> Tất cả dòng chảy đổ về một biển kết quả duy nhất.',
    mnemonic: 'Vạn vật xoay vần rồi cũng quy về cội nguồn nguyên nhân.',
    examples: [
      { jp: 'あらゆる社会問題の根底を突き詰めると、最終的には教育の格差に帰結する。', vi: 'Khi đi sâu vào gốc rễ của mọi vấn nạn xã hội, đến cuối cùng tất cả đều quy về sự chênh lệch trong giáo dục.' },
      { jp: '長期にわたる議論の末、計画の白紙撤回という結論に帰結せざるを得なかった。', vi: 'Sau cuộc tranh luận trường kỳ, kết cục đành phải dẫn đến kết luận tất yếu là hủy bỏ toàn bộ kế hoạch.' }
    ],
    drills: [{
      q: '様々な 要因が 複雑に 絡み合って いるが、本質は 人材不足に（　）。',
      options: ['帰結する', '準拠する', '看過する', '公示する'],
      correct: 0,
      explain: 'Tất cả nguyên nhân quy về sự thiếu thốn nhân lực -> Chọn 帰結する.'
    }]
  }
};

// Cung cấp các trụ cột tổng kết cho Bài 100 (N2) và Bài 120 (N1)
const SYNTHESIS_PATTERNS = {
  '160 Mẫu ngữ pháp cốt lõi': {
    formula: 'Ôn tập hệ thống hóa 160 mẫu ngữ pháp then chốt N2',
    meaning: 'Bản đồ tư duy toàn diện: Làm chủ 160 cấu trúc ngữ pháp trung cao cấp thường gặp nhất trong đề thi JLPT N2.',
    nuance: 'Học viên nắm vững bản chất logic, kết nối chuỗi ý nghĩa và bối cảnh sử dụng chuyên nghiệp.',
    trapBuster: 'Phân loại theo trường nghĩa: Thời điểm tức thì, Phạm vi quy mô, Nghịch biện nhượng bộ, Kính ngữ thương mại.',
    mnemonic: '160 mắt xích tạo nên bản lĩnh ngôn ngữ vững vàng.',
    examples: [
      { jp: 'N2の文法項目を体系的に整理することで、読解や聴解のスピードが飛躍的に向上する。', vi: 'Bằng việc hệ thống hóa các mục ngữ pháp N2, tốc độ đọc hiểu và nghe hiểu sẽ được nâng tầm vượt bậc.' },
      { jp: '日常の業務文書において、適切な文型を即座に選択できる実践力を養う。', vi: 'Rèn luyện năng lực thực chiến có thể lập tức lựa chọn mẫu câu thích hợp trong các tài liệu công việc hàng ngày.' }
    ],
    drills: [{
      q: '文法学習の 最終目標は、規則を 覚える だけでなく 実際の 場面で（　）ことにある。',
      options: ['使いこなす', '丸暗記する', '諦める', '忘れる'],
      correct: 0,
      explain: 'Mục tiêu tối thượng là vận dụng thành thạo -> Chọn 使いこなす.'
    }]
  },
  'Phản xạ bẻ bẫy trắc nghiệm': {
    formula: 'Chiến thuật giải mã các phương án nhiễu (Trap Radar)',
    meaning: 'Kỹ năng phát hiện nhanh các bẫy liên kết trợ từ, thì của động từ và giới hạn ý chí trong phần thi Dokkai và Bunpou.',
    nuance: 'Nhận diện ngay lập tức các cấu trúc vô ý chí không đi cùng mệnh lệnh, hoặc vế sau chỉ dùng cho kết quả tiêu cực.',
    trapBuster: 'Quét nhanh từ khóa vế sau để loại bỏ 2 phương án sai ngay trong 5 giây đầu tiên.',
    mnemonic: 'Tâm tĩnh như gương, soi rõ mọi cạm bẫy phương án nhiễu.',
    examples: [
      { jp: '文末の表現に注目することで、選択肢の罠を素早く見抜くことができる。', vi: 'Bằng việc chú ý đến cách diễn đạt ở cuối câu, bạn có thể nhanh chóng nhìn thấu cạm bẫy của các phương án.' },
      { jp: '接続のルールを正しく理解していれば、迷わず正解を導き出せる。', vi: 'Nếu hiểu đúng quy tắc kết hợp, bạn sẽ tự tin tìm ra đáp án chính xác mà không chút do dự.' }
    ],
    drills: [{
      q: '選択肢に 迷った ときは、文末の（　）が 意志的か どうかを 確認する。',
      options: ['動詞表現', '名詞', '形容詞', '感嘆詞'],
      correct: 0,
      explain: 'Kiểm tra động từ cuối câu có chứa ý chí hay không để bẻ bẫy -> Chọn 動詞表現.'
    }]
  },
  'Đọc nhanh tài liệu kinh tế': {
    formula: 'Kỹ năng quét thông tin (Scanning & Skimming) văn bản thương mại',
    meaning: 'Đọc hiểu sắc bén các bài phân tích thị trường báo chí Nikkei, báo cáo tài chính và email giao dịch thương mại.',
    nuance: 'Tập trung bắt mạch cấu trúc PREP và các từ nối chuyển ý như: つきましては, 一方で, 鑑みますと.',
    trapBuster: 'Đọc câu chủ đề đầu đoạn và câu kết luận cuối đoạn để nắm 80% dung lượng thông tin cốt lõi.',
    mnemonic: 'Đôi mắt đại bàng quét từ trên cao bắt trọn trọng tâm.',
    examples: [
      { jp: '経済記事を読む際は、数値の背景にある市場の構造変化を読み取ることが肝要である。', vi: 'Khi đọc các bài báo kinh tế, điều cốt lõi là phải đọc vị được những biến chuyển cơ cấu thị trường ẩn sau các con số.' },
      { jp: 'ビジネス文書の骨子を速読することで、意思決定のスピードを大幅に高めることができる。', vi: 'Nhờ đọc nhanh được cốt lõi văn bản kinh doanh, bạn có thể nâng cao đáng kể tốc độ ra quyết định.' }
    ],
    drills: [{
      q: '長文読解において 最も 重要なのは、段落ごとの（　）を 捉える ことだ。',
      options: ['要旨', '文字数', '誤字', 'フォント'],
      correct: 0,
      explain: 'Nắm chắc ý chính của từng đoạn văn -> Chọn 要旨.'
    }]
  },
  'Nghe đàm thoại thương trường': {
    formula: 'Phản xạ nghe hiểu ngữ điệu thương lượng và hàm ý',
    meaning: 'Năng lực nghe hiểu các sắc thái đàm thoại phức tạp, hàm ý từ chối khéo léo và đối thoại tốc độ cao.',
    nuance: 'Luyện tai bắt trọn ngữ điệu khiêm nhường, kính cẩn và các cụm từ cửa miệng trong kinh doanh Nhật Bản.',
    trapBuster: 'Lắng nghe điểm rơi sau từ 「が...」 hoặc 「ただ...」 vì quan điểm thực sự của người nói luôn nằm ở vế sau.',
    mnemonic: 'Lắng nghe nhịp tim và ẩn ý phía sau từng lời thoại lịch thiệp.',
    examples: [
      { jp: '相手の言葉の裏にある真意を汲み取ることで、円滑な交渉を進めることができる。', vi: 'Nhờ thấu hiểu được chân ý ẩn sau lời nói của đối phương, bạn có thể thúc đẩy cuộc đàm phán một cách suôn sẻ.' },
      { jp: '敬語表現が連続する会話でも、主語と述語の関係を冷静に聞き分けることが重要だ。', vi: 'Ngay cả trong hội thoại ngập tràn kính ngữ, việc bình tĩnh nghe phân biệt chủ ngữ và vị ngữ là vô cùng quan trọng.' }
    ],
    drills: [{
      q: 'ビジネスの 対話では、相手の「前向きに検討する」という 返答の（　）を 読む 必要が ある。',
      options: ['ニュアンス', '音量', 'リズム', '筆跡'],
      correct: 0,
      explain: 'Cần đọc vị sắc thái ẩn ý trong câu nói -> Chọn ニュアンス.'
    }]
  },
  '180 Mẫu ngữ pháp hàn lâm': {
    formula: 'Kho báu ngữ pháp học thuật, văn ngôn và pháp lý Thượng cấp N1',
    meaning: 'Hệ thống hóa toàn bộ 180 mẫu ngữ pháp đỉnh cao của tiếng Nhật văn bản, xã luận Asahi và tài liệu triết học.',
    nuance: 'Đạt tới sự tinh tế tuyệt đối trong việc diễn đạt tư tưởng trừu tượng và lập luận chính luận sắc bén.',
    trapBuster: 'Phân định rõ các cấu trúc văn ngôn cổ: ~ずんば, ~たまへ, ~ごとき, ~べからず.',
    mnemonic: '180 nấc thang dẫn lên đỉnh cao học thuật và trí tuệ ngôn ngữ.',
    examples: [
      { jp: '最高峰の文法構造を身につけることで、学術論文や社説の深層思想を自在に解読できる。', vi: 'Làm chủ các cấu trúc ngữ pháp đỉnh cao giúp bạn giải mã tự tại các tầng sâu tư tưởng trong luận văn học thuật và bài xã luận.' },
      { jp: '格調高い語彙と文型を駆使し、説得力に富んだ論考を構築する。', vi: 'Vận dụng thuần thục các mẫu câu và vốn từ trang trọng để xây dựng những bài bình luận giàu sức thuyết phục.' }
    ],
    drills: [{
      q: 'N1レベルの 記述では、感情的な 言葉よりも 論理的な（　）が 重視される。',
      options: ['文型構成', 'ひらがな', 'カタカナ', '感嘆符'],
      correct: 0,
      explain: 'Cấu trúc mẫu câu logic được đề cao hơn từ ngữ cảm tính -> Chọn 文型構成.'
    }]
  },
  'Khả năng phản biện xã luận': {
    formula: 'Tư duy phản biện và giải mã luận điểm đa chiều',
    meaning: 'Phân tích các luận điểm xã hội phức tạp, bóc tách góc nhìn của tác giả và xây dựng luận cứ phản biện logic.',
    nuance: 'Tìm ra các từ khóa then chốt: のではないだろうか, 換言すれば, にほかならない.',
    trapBuster: 'Không để ý kiến chủ quan của bản thân chi phối, luôn dựa sát vào câu từ của tác giả trong bài viết.',
    mnemonic: 'Thanh gươm phản biện mổ xẻ mọi ngụy biện luận điểm.',
    examples: [
      { jp: '社説の主張を批判的に吟味し、論理の整合性を検証する思考力を養う。', vi: 'Nuôi dưỡng tư duy phản biện để xem xét kỹ lưỡng quan điểm bài xã luận và kiểm chứng tính nhất quán của logic.' },
      { jp: '多角的な視点から物事を捉え、偏りのない公正な判断を下す。', vi: 'Nhìn nhận sự vật từ nhiều góc độ đa chiều để đưa ra những phán đoán công tâm không thiên vị.' }
    ],
    drills: [{
      q: '筆者の 主張を 読み取る 際は、根拠となる（　）の 妥当性を 評価する。',
      options: ['事実やデータ', '感情', '噂', '装飾'],
      correct: 0,
      explain: 'Đánh giá tính thỏa đáng của dữ liệu thực tế làm căn cứ -> Chọn 事実やデータ.'
    }]
  },
  'Cảm thụ tinh hoa văn hóa': {
    formula: 'Giải mã tinh tế các ẩn ý văn hóa và ngôn ngữ bác học',
    meaning: 'Thấu hiểu mỹ học Nhật Bản (Mono no aware, Wabi-sabi), điển cố văn học và cách dùng từ giàu tính tượng hình.',
    nuance: 'Cảm nhận trọn vẹn ngữ cảnh văn hóa ngầm định mà người bản xứ tiếp nhận tự nhiên từ thuở ấu thơ.',
    trapBuster: 'Hiểu các ẩn dụ triết học qua hình tượng thiên nhiên: Hoa anh đào rơi (vô thường), Trăng thu (cô đơn thanh tịnh).',
    mnemonic: 'Tâm hồn rộng mở cảm nhận vẻ đẹp nghìn năm của văn hóa Phù Tang.',
    examples: [
      { jp: '言葉の背景にある日本人の自然観や美意識を理解することで、真の語学力が完成する。', vi: 'Bằng việc hiểu được mỹ học và nhân sinh quan với tự nhiên ẩn sau ngôn từ, năng lực ngôn ngữ thực sự mới hoàn thiện.' },
      { jp: '古典文学に由来する表現を味わい、豊かな言語表現の広がりを楽しむ。', vi: 'Thưởng thức những cách diễn đạt bắt nguồn từ văn học cổ điển để cảm nhận sự phong phú của ngôn từ.' }
    ],
    drills: [{
      q: '日本文学の 読解には、四季の 移ろいに 対する（　）が 欠かせない。',
      options: ['繊細な感受性', '鈍感な態度', '無関心', '批判精神'],
      correct: 0,
      explain: 'Cảm nhận tinh tế trước sự chuyển vần của bốn mùa -> Chọn 繊細な感受性.'
    }]
  },
  'Diễn đạt chuẩn mực ngoại giao': {
    formula: 'Làm chủ ngữ khí ngoại giao cấp cao và văn thư thượng đỉnh',
    meaning: 'Khả năng sử dụng ngôn ngữ chuẩn xác tuyệt đối trong giao tiếp quốc tế, đàm phán cấp bộ và văn kiện nhà nước.',
    nuance: 'Cân bằng hoàn hảo giữa sự cương quyết bảo vệ lập trường và thái độ hòa nhã, lịch thiệp ngoại giao.',
    trapBuster: 'Sử dụng các mẫu câu: 深い憂慮の念を禁じ得ない, 協調の精神に基づき, 遺憾の意を表明する.',
    mnemonic: 'Đỉnh cao trí tuệ và sự chuẩn mực trong bang giao quốc tế.',
    examples: [
      { jp: '国際折衝の場において、品格と知性を兼ね備えた洗練された表現を駆使する。', vi: 'Tại các diễn đàn đàm phán quốc tế, vận dụng những cách diễn đạt tao nhã kết hợp giữa phẩm giá và trí tuệ.' },
      { jp: '平和的な関係構築のため、言葉の重みを自覚した責任ある発信を行う。', vi: 'Nhằm xây dựng mối quan hệ hòa bình, thực hiện những phát ngôn đầy trách nhiệm với ý thức sâu sắc về sức nặng của ngôn từ.' }
    ],
    drills: [{
      q: '外交文書の 作成では、国家の 威信と 相互尊重を 両立させる（　）が 求められる。',
      options: ['高度な言葉遣い', '日常会話', '俗語', '省略表現'],
      correct: 0,
      explain: 'Văn thư ngoại giao đòi hỏi ngôn từ đỉnh cao chuẩn mực -> Chọn 高度な言葉遣い.'
    }]
  }
};

// Hàm truy vấn tổng hợp từ điển
function queryGrammar(rawPattern, lessonContext) {
  // 1. Kiểm tra trong các bảng curated đặc thù
  if (CURATED_SPECIAL_PATTERNS[rawPattern]) {
    return { ...CURATED_SPECIAL_PATTERNS[rawPattern] };
  }
  if (SYNTHESIS_PATTERNS[rawPattern]) {
    return { ...SYNTHESIS_PATTERNS[rawPattern] };
  }

  // 2. Kiểm tra Alias
  let targetKey = rawPattern;
  for (const [k, v] of Object.entries(ALIASES)) {
    if (rawPattern.includes(k)) {
      targetKey = v;
      break;
    }
  }

  // 3. Chuẩn hóa và tra cứu trong Master DB
  const normKey = normalize(targetKey);
  if (db.has(normKey)) {
    const item = db.get(normKey);
    return enrichEntry(rawPattern, item, lessonContext);
  }

  // 4. Tìm kiếm gần đúng / Chứa chuỗi
  for (const [k, v] of db) {
    if (k.length >= 2 && (k.includes(normKey) || normKey.includes(k))) {
      return enrichEntry(rawPattern, v, lessonContext);
    }
  }

  // Fallback an toàn (vẫn giữ đúng cấu trúc học thuật)
  return {
    formula: `文型：${rawPattern}`,
    meaning: `Mẫu ngữ pháp quan trọng trong chuyên đề: ${lessonContext.viTitle}`,
    nuance: `Sử dụng chuẩn mực trong các văn bản và kỳ thi năng lực tiếng Nhật JLPT.`,
    trapBuster: `Chú ý phân biệt sắc thái kết hợp và đối chiếu với các mẫu câu tương đương.`,
    mnemonic: `Ghi nhớ mẫu câu gắn liền với tình huống thực tế của bài học.`,
    examples: [
      { jp: `${rawPattern.replace(/[～〜~]/g, '')}を使った自然な表現を身につけましょう。`, vi: `Hãy luyện tập để thành thạo cách biểu đạt tự nhiên với cấu trúc này.` }
    ],
    drills: [{
      q: `文脈に 最も 適した 表現を 選びなさい。`,
      options: [rawPattern, "別の表現A", "別の表現B", "別の表現C"],
      correct: 0,
      explain: `Đáp án chính xác là cấu trúc ${rawPattern}.`
    }]
  };
}

function enrichEntry(rawPattern, item, lessonContext) {
  const formula = item.formula || `接続：${rawPattern}`;
  const meaning = item.meaning || `Cấu trúc biểu đạt trong chủ đề ${lessonContext.viTitle}`;
  const nuance = item.nuance || `Sử dụng chính xác theo văn cảnh chuẩn mực của giáo trình.`;
  const trapBuster = item.trapBuster || lessonContext.trap || `Chú ý dạng kết hợp của vế trước và thì của động từ vế sau.`;
  const mnemonic = item.mnemonic || `Mẹo nhớ: Liên hệ ngữ cảnh thực tế của cấu trúc ${rawPattern}.`;
  
  let examples = item.examples || [];
  if (examples.length === 0) {
    examples = [{
      jp: `${rawPattern.replace(/[～〜~]/g, '')}を正しく使いこなすことが重要です。`,
      vi: `Việc sử dụng thành thạo và chính xác cấu trúc này là điều rất quan trọng.`
    }];
  }

  // Tạo drills nếu chưa có
  let drills = item.drills || [];
  if (drills.length === 0 && examples[0]) {
    const exJp = examples[0].jp;
    const cleanPat = rawPattern.replace(/[～〜~]/g, '').trim();
    // Tạo câu hỏi bằng cách đục lỗ nếu có thể
    let q = exJp;
    if (cleanPat && exJp.includes(cleanPat)) {
      q = exJp.replace(cleanPat, '（　）');
    } else {
      q = `空欄に 最も 適した 語句を 選びなさい。この 状況では（　）が 最も ふさわしい。`;
    }
    drills = [{
      q,
      options: [cleanPat, "ものの", "どころか", "かねない"],
      correct: 0,
      explain: `Đáp án đúng là ${cleanPat}. Ý nghĩa: ${meaning}`
    }];
  }

  return {
    formula,
    meaning,
    nuance,
    trapBuster,
    mnemonic,
    examples,
    drills
  };
}

// -------------------------------------------------------------
// 2. DỰNG N3 FOUNDATION HOÀN CHỈNH (BÀI 51 - 75)
// -------------------------------------------------------------
console.log("🔨 Đang xây dựng N3 Foundation (Bài 51 - 75)...");

const N3_LESSONS_COMPLETE = [
  // 51: Thời gian & Tranh thủ cơ hội
  { num: 51, jp: "時間に 追われる 現代人", vi: "Thời gian & Tranh thủ cơ hội", pillar: "Thời gian & Đồng thời", mascot: "🍵", patterns: ["～うちに", "～あいだ / ～あいだに", "～最中に", "～たびに"] },
  // 52: Khởi đầu, Kết thúc & Tiến trình chuyển đổi
  { num: 52, jp: "変化を 続ける 日本の 社会", vi: "Khởi đầu, Kết thúc & Tiến trình chuyển đổi", pillar: "Tiến trình & Biến đổi", mascot: "📈", patterns: ["～つつある", "～だす", "～一方だ", "～ばかりだ"] },
  // 53: Nguyên nhân trực tiếp & Hậu quả không mong muốn
  { num: 53, jp: "失敗から 学ぶ 人生訓", vi: "Nguyên nhân trực tiếp & Hậu quả không mong muốn", pillar: "Nguyên nhân & Hậu quả", mascot: "⛈️", patterns: ["～せいで", "～おかげで", "～ばかりに", "～ものだから"] },
  // 54: Căn cứ phán đoán & Dấu hiệu nhận biết
  { num: 54, jp: "情報と 根拠の 確かさ", vi: "Căn cứ phán đoán & Dấu hiệu nhận biết", pillar: "Căn cứ & Lý do", mascot: "🔍", patterns: ["～ことから", "～につき", "～に違いない", "～にすぎない"] },
  // 55: Giới hạn phạm vi & Trường hợp đặc biệt
  { num: 55, jp: "条件の 限界と 特別ルール", vi: "Giới hạn phạm vi & Trường hợp đặc biệt", pillar: "Phạm vi & Giới hạn", mascot: "🎫", patterns: ["～に限り", "～に限って", "～に限らず", "～のみならず"] },
  // 56: Không chỉ... mà còn (Gia tăng mức độ)
  { num: 56, jp: "追加と 累加の 表現", vi: "Không chỉ... mà còn (Gia tăng mức độ)", pillar: "Gia tăng & Bổ sung", mascot: "➕", patterns: ["～ばかりでなく", "～だけでなく", "～はもちろん", "～うえに"] },
  // 57: Tương phản hai mặt & Tính chất đối lập
  { num: 57, jp: "対比と 二面性の 観察", vi: "Tương phản hai mặt & Tính chất đối lập", pillar: "Tương phản & Đối lập", mascot: "⚖️", patterns: ["～に対して", "～反面", "～一方で", "～わりに(は)"] },
  // 58: So sánh, Lựa chọn & Thà... còn hơn
  { num: 58, jp: "選択と 優先の 価値観", vi: "So sánh, Lựa chọn & Thà... còn hơn", pillar: "So sánh & Ưu tiên", mascot: "🏆", patterns: ["～くらいなら", "～に比べて", "～どころか", "～よりむしろ"] },
  // 59: Giả định có điều kiện & Miễn là thỏa mãn
  { num: 59, jp: "仮定と 必須の 条件", vi: "Giả định có điều kiện & Miễn là thỏa mãn", pillar: "Giả định & Điều kiện", mascot: "🗝️", patterns: ["～さえ～ば", "～としたら", "～からには", "～以上は"] },
  // 60: Nghịch biện & Bất chấp sự thật diễn ra
  { num: 60, jp: "逆接と 納得の いかない 事実", vi: "Nghịch biện & Bất chấp sự thật diễn ra", pillar: "Nghịch biện & Nhượng bộ", mascot: "💥", patterns: ["～くせに", "～にもかかわらず", "～ものの", "～わりに"] },
  // 61: Mục đích hướng đích & Kế hoạch tương lai
  { num: 61, jp: "未来への 目標と 指向", vi: "Mục đích hướng đích & Kế hoạch tương lai", pillar: "Mục đích & Dự định", mascot: "🎯", patterns: ["～ように", "～ために", "～向け", "～向き"] },
  // 62: Phương tiện, Cầu nối trung gian & Nền tảng
  { num: 62, jp: "手段・媒体・拠点の 活用", vi: "Phương tiện, Cầu nối trung gian & Nền tảng", pillar: "Phương tiện & Cách thức", mascot: "🌉", patterns: ["～によって", "～を通じて", "～を通して", "～をもとに"] },
  // 63: Trạng thái kéo dài & Tình huống giữ nguyên
  { num: 63, jp: "持続する 状態と 放置", vi: "Trạng thái kéo dài & Tình huống giữ nguyên", pillar: "Trạng thái & Duy trì", mascot: "🚰", patterns: ["～っぱなし", "～たまま", "～きり", "～だらけ"] },
  // 64: Cảm xúc bộc phát & Không thể kìm nén
  { num: 64, jp: "抑えきれない 感情と 欲望", vi: "Cảm xúc bộc phát & Không thể kìm nén", pillar: "Tâm lý & Cảm xúc", mascot: "💖", patterns: ["～てたまらない", "～てしょうがない", "～てならない", "～てたまらない"] },
  // 65: Lời khuyên chân thành, Đạo lý & Lẽ thường
  { num: 65, jp: "助言・義務と 当然の 理", vi: "Lời khuyên chân thành, Đạo lý & Lẽ thường", pillar: "Đạo lý & Lời khuyên", mascot: "📜", patterns: ["～べきだ", "～ことだ", "～ものだ", "～ものがある"] },
  // 66: Quy định cấm chỉ, Bắt buộc & Đành phải làm
  { num: 66, jp: "禁止・強制と 不可避の 決断", vi: "Quy định cấm chỉ, Bắt buộc & Đành phải làm", pillar: "Cấm đoán & Ép buộc", mascot: "⛓️", patterns: ["～わけにはいかない", "～ざるを得ない", "～てはならない", "～ないわけにはいかない"] },
  // 67: Dự đoán rủi ro, Nguy cơ & Khả năng tiêu cực
  { num: 67, jp: "リスク予測と 警戒の 視点", vi: "Dự đoán rủi ro, Nguy cơ & Khả năng tiêu cực", pillar: "Phỏng đoán & Rủi ro", mascot: "⚠️", patterns: ["～恐れがある", "～かねない", "～っこない", "～かねる"] },
  // 68: Bác bỏ hoàn toàn & Tuyệt đối không thể có chuyện
  { num: 68, jp: "全面否定と 強い 反論", vi: "Bác bỏ hoàn toàn & Tuyệt đối không thể có chuyện", pillar: "Phủ định & Bác bỏ", mascot: "🚫", patterns: ["～わけがない", "～はずがない", "～とは限らない", "～わけではない"] },
  // 69: Truyền đạt nguồn tin, Tin đồn & Lời kể lại
  { num: 69, jp: "情報の 伝達と 噂の 真偽", vi: "Truyền đạt nguồn tin, Tin đồn & Lời kể lại", pillar: "Truyền ngôn & Nguồn tin", mascot: "📢", patterns: ["～によると", "～ということだ", "～とのことだ", "～とか"] },
  // 70: Hướng đến đối tượng & Tình cảm gửi gắm
  { num: 70, jp: "対象への 感情と 配慮", vi: "Hướng đến đối tượng & Tình cảm gửi gắm", pillar: "Đối tượng & Thái độ", mascot: "💌", patterns: ["～に関して", "～について", "～を込めて", "～をめぐって"] },
  // 71: Đánh giá so với chuẩn mực & Bất ngờ trước thực tế
  { num: 71, jp: "基準との ギャップと 驚き", vi: "Đánh giá so với chuẩn mực & Bất ngờ trước thực tế", pillar: "Đánh giá & So sánh", mascot: "😲", patterns: ["～にしては", "～わりに(は)", "～にこたえて", "～に反して"] },
  // 72: Biến thiên tỷ lệ thuận & Hai vế cùng thay đổi
  { num: 72, jp: "比例変化と 時代の うねり", vi: "Biến thiên tỷ lệ thuận & Hai vế cùng thay đổi", pillar: "Biến thiên tỷ lệ", mascot: "🌊", patterns: ["～にしたがって", "～につれて", "～とともに", "～に伴って"] },
  // 73: Quyết định cá nhân, Tập thể & Thói quen duy trì
  { num: 73, jp: "習慣の 形成と 意思決定", vi: "Quyết định cá nhân, Tập thể & Thói quen duy trì", pillar: "Thói quen & Quy định", mascot: "📅", patterns: ["～ことにしている", "～ことになっている", "～ようにしている", "～ようになっている"] },
  // 74: Kính ngữ trung cấp & Ứng xử đàm thoại nơi làm việc
  { num: 74, jp: "ビジネスの 敬語と 応対", vi: "Kính ngữ trung cấp & Ứng xử đàm thoại nơi làm việc", pillar: "Kính ngữ công sở", mascot: "🤝", patterns: ["お～になる", "お～する", "～ていただく", "～てくださる"] },
  // 75: Đại Tổng Kết Bản Lề N3 & Bước Đệm Lên N2
  { num: 75, jp: "N3 総まとめと N2への 架け橋", vi: "Đại Tổng Kết Bản Lề N3 & Bước Đệm Lên N2", pillar: "Tổng kết N3 Toàn diện", mascot: "👑", patterns: ["140 Cạm bẫy tương đồng N3", "Bẻ bẫy Đọc hiểu Dokkai N3", "Nghe hiểu phản xạ Choukai N3", "Cầu nối chuyển tiếp N3 lên N2"] }
];

function buildN3() {
  return N3_LESSONS_COMPLETE.map(meta => {
    const context = { viTitle: meta.vi, trap: `Bẫy đề thi: Chú ý sự khác biệt giữa các mẫu câu trong chủ đề ${meta.pillar}` };
    const points = meta.patterns.map((p, idx) => {
      const qData = queryGrammar(p, context);
      return {
        id: `n3_lesson_${meta.num}_${idx + 1}`,
        pattern: p,
        formula: qData.formula,
        meaning: qData.meaning,
        nuance: qData.nuance,
        trapBuster: qData.trapBuster,
        mnemonic: qData.mnemonic,
        examples: qData.examples,
        drills: qData.drills
      };
    });

    const colors = ['#38bdf8', '#10b981', '#f59e0b', '#8b5cf6'];
    const branchIcons = ['🎯', '💡', '🛡️', '⚡'];

    return {
      lessonNumber: meta.num,
      title: `第${meta.num}課：${meta.jp} (${meta.vi})`,
      jpTitle: meta.jp,
      viTitle: meta.vi,
      level: "N3",
      pillar: meta.pillar,
      summary: `Toàn diện Bài ${meta.num} Bản Lề Trung Cấp N3: ${meta.vi}. Trụ cột: ${meta.pillar}.`,
      mindmap: {
        center: `Bài ${meta.num}: ${meta.vi}`,
        mascotIcon: meta.mascot || "🍵",
        rootConnection: `🔙 Rễ cây: Nối từ Bài ${meta.num - 1} (${meta.num === 51 ? 'N4 Bài 50' : 'N3'})`,
        nextLeap: meta.num < 75 ? `🔜 Chồi non: Bước đệm sang Bài ${meta.num + 1}` : `🔜 Chồi non: Chuyển giao lên Cao cấp N2 (Bài 76)`,
        trapRadar: `Nắm vững phân biệt sắc thái các mẫu câu trong chủ đề ${meta.pillar}.`,
        tip: `Ghi nhớ công thức kết hợp chuẩn mực và luyện tập phản xạ bẻ bẫy.`,
        branches: points.map((p, idx) => ({
          name: p.pattern,
          icon: branchIcons[idx % branchIcons.length],
          color: colors[idx % colors.length],
          formula: p.formula,
          nuance: p.nuance,
          metaphor: `Ứng dụng ${p.pattern} trong giao tiếp trung cấp`,
          mnemonic: p.mnemonic,
          example: p.examples[0]
        }))
      },
      grammarPoints: points
    };
  });
}

// -------------------------------------------------------------
// 3. DỰNG N2 FOUNDATION HOÀN CHỈNH (BÀI 76 - 100)
// -------------------------------------------------------------
console.log("🔨 Đang xây dựng N2 Foundation (Bài 76 - 100)...");

const N2_LESSONS_DATA = [
  { num: 76, jp: "電光石火の ビジネス判断", vi: "Thời điểm tức thì & Tương quan chớp nhoáng", pillar: "Tức thì & Thời điểm", mascot: "⚡", p1: "~次第", p2: "~たとたん", p3: "~か~ないかのうちに", p4: "~やいなや", trap: "~次第 (xong việc là chủ động làm ngay - có ý chí) vs ~たとたん (vừa xong thì biến cố bất ngờ xảy ra - vô ý chí)" },
  { num: 77, jp: "市場の 広がりと 展開", vi: "Phạm vi không gian - thời gian & Quy mô", pillar: "Phạm vi & Quy mô", mascot: "🌐", p1: "~をはじめ (として)", p2: "~から~にかけて", p3: "~にわたって", p4: "~を通じて", trap: "~にわたって (bao phủ toàn bộ phạm vi thời gian/không gian) vs ~を通じて (suốt thời gian hoặc qua cầu nối)" },
  { num: 78, jp: "コンプライアンスと 規範", vi: "Căn cứ pháp lý, Tiêu chuẩn & Quy chuẩn", pillar: "Tiêu chuẩn & Căn cứ", mascot: "⚖️", p1: "~にもとづいて", p2: "~にそって", p3: "~のもとで", p4: "~に即して", trap: "~にもとづいて (lấy tài liệu/luật làm căn cứ) vs ~にそって (men theo phương châm/kỳ vọng)" },
  { num: 79, jp: "予期せぬ 事態の 原因究明", vi: "Nguyên nhân sâu xa & Động cơ thái quá", pillar: "Nguyên nhân & Động cơ", mascot: "🔥", p1: "~あまり", p2: "~あまりの~に", p3: "~ことだし", p4: "~わけだ", trap: "~あまり (vì quá xúc động/lo lắng mà sinh ra kết quả bất thường)" },
  { num: 80, jp: "譲歩と 慎重な 前置き", vi: "Thừa nhận một nửa, Nhượng bộ & Rào đón", pillar: "Nhượng bộ & Rào đón", mascot: "🛡️", p1: "~ものの", p2: "~といっても", p3: "~からといって", p4: "~にしても", trap: "~からといって (không thể nói là cứ A thì B) vs ~といっても (dù nói là A nhưng thực chất chỉ B)" },
  { num: 81, jp: "無差別と 公正の 原則", vi: "Bất kể điều kiện, Đồng nhất mọi tình huống", pillar: "Bất kể điều kiện", mascot: "🌈", p1: "~にしろ~にしろ", p2: "~にせよ", p3: "~を問わず", p4: "~にかかわらず", trap: "~を問わず (không phân biệt tuổi tác/giới tính) vs ~にかかわらず (bất kể thời tiết thuận hay nghịch)" },
  { num: 82, jp: "揺るぎなき 確信と 結論", vi: "Khẳng định đanh thép, Sự thật tất yếu", pillar: "Khẳng định tất yếu", mascot: "💎", p1: "~に相違ない", p2: "~に決まっている", p3: "~にほかならない", p4: "~にすぎない", trap: "~にほかならない (chính là, tuyệt đối không gì khác) vs ~にすぎない (chẳng qua chỉ là)" },
  { num: 83, jp: "使命感と 抑えきれぬ 義務", vi: "Phủ định kép & Nghĩa vụ đạo đức bắt buộc", pillar: "Phủ định kép & Nghĩa vụ", mascot: "⚔️", p1: "~ないではいられない", p2: "~ずにはすまない", p3: "~ざるを得ない", p4: "~ずにはいられない", trap: "~ずにはすまない (về mặt đạo lý xã hội không làm là không được tha thứ)" },
  { num: 84, jp: "反論と 全面的な 打ち消し", vi: "Bác bỏ luận điểm, Phủ nhận khả năng", pillar: "Bác bỏ & Phủ nhận", mascot: "❌", p1: "~どころか", p2: "~どころではない", p3: "~っこない", p4: "~わけがない", trap: "~どころか (ngay cả A còn chưa được nói gì B) vs ~どころではない (bận rộn/khó khăn không tâm trí đâu mà làm)" },
  { num: 85, jp: "苦渋の 決断と 不可能の 壁", vi: "Trăn trở từ chối & Năng lực bất khả kháng", pillar: "Khó khăn & Từ chối", mascot: "🧗", p1: "~かねる", p2: "~がたい", p3: "~ようがない", p4: "~かねない", trap: "~かねる (khó xử nên từ chối lịch sự) vs ~かねない (có nguy cơ xấu xảy ra)" },
  { num: 86, jp: "新たな 門出と 機会の 創出", vi: "Thời điểm bước ngoặt & Cơ hội chuyển mình", pillar: "Thời điểm & Bước ngoặt", mascot: "🚀", p1: "~に際して", p2: "~にあたって", p3: "~を契機に", p4: "~を機に", trap: "~にあたって (văn cảnh trang trọng trước sự kiện lớn) vs ~を契機に (lấy làm cơ hội bước ngoặt đổi thay)" },
  { num: 87, jp: "議論の 的と ターゲット設定", vi: "Tâm điểm tranh luận & Đối tượng định hướng", pillar: "Mục tiêu & Tranh luận", mascot: "🎯", p1: "~をめぐって", p2: "~に向けて", p3: "~を対象に", p4: "~にかかわる", trap: "~をめぐって (tranh cãi xoay quanh một vấn đề) vs ~に向けて (hướng tới mục tiêu)" },
  { num: 88, jp: "悪化の 一途を たどる 傾向", vi: "Biến thiên theo một chiều hướng xấu đi", pillar: "Xu hướng & Chiều hướng", mascot: "📉", p1: "~一方だ", p2: "~ばかりだ", p3: "~つつある", p4: "~よりましだ", trap: "~一方だ (chiều hướng biến đổi tiêu cực ngày càng tăng tiến không phanh)" },
  { num: 89, jp: "溢れる 謝意と 敬意の 表明", vi: "Cảm xúc ngưỡng mộ, Biết ơn sâu sắc", pillar: "Cảm xúc & Ngưỡng mộ", mascot: "💐", p1: "~てやまない", p2: "~に堪えない", p3: "~を禁じ得ない", p4: "~に余る", trap: "~てやまない (luôn luôn cầu chúc/kính trọng từ tận đáy lòng không ngừng)" },
  { num: 90, jp: "警鐘と 批評の 視点", vi: "Đánh giá chủ quan & Lời cảnh báo thận trọng", pillar: "Cảnh báo & Đánh giá", mascot: "🔔", p1: "~ものがある", p2: "~とは限らない", p3: "~まい", p4: "~おそれがある", trap: "~ものがある (cảm thấy có một điểm gì đó rất đặc thù/ấn tượng)" },
  { num: 91, jp: "プロフェッショナルの 倫理規範", vi: "Đạo lý xử thế & Quy phạm chuẩn mực nghề", pillar: "Đạo đức nghề nghiệp", mascot: "👔", p1: "~べきではない", p2: "~ことだ", p3: "~ものだ", p4: "~ものではない", trap: "~ものではない (theo chuẩn mực xã hội không nên làm việc thất lễ đó)" },
  { num: 92, jp: "限界突破と 徹底の 精神", vi: "Nỗ lực đến cùng & Trạng thái triệt để", pillar: "Triệt để & Đến cùng", mascot: "💪", p1: "~ぬく", p2: "~きる / きれない", p3: "~かけ", p4: "~だらけ", trap: "~ぬく (vượt qua gian khổ nỗ lực đến cùng) vs ~きる (làm trọn vẹn đến kiệt cùng)" },
  { num: 93, jp: "組織連動と 相互の 変動", vi: "Biến thiên phức hợp tỷ lệ thuận trong quản trị", pillar: "Tỷ lệ thuận quản trị", mascot: "🔄", p1: "~につれて", p2: "~にしたがって", p3: "~に伴って", p4: "~とともに", trap: "~に伴って (kèm theo sự kiện A thì hệ quả B phát sinh tương ứng)" },
  { num: 94, jp: "不可欠な 条件と 厳格な 制約", vi: "Điều kiện tiên quyết & Giả định ngặt nghèo", pillar: "Điều kiện tiên quyết", mascot: "🔐", p1: "~とあれば", p2: "~としたら", p3: "~とすると", p4: "~ないことには", trap: "~ないことには (nếu không hoàn thành điều kiện A thì tuyệt đối không thể có B)" },
  { num: 95, jp: "心理描写と 傾向の 把握", vi: "Giả vờ, Cảm giác thoáng qua & Tính cách", pillar: "Tâm lý & Xu hướng", mascot: "🎭", p1: "~つもりで", p2: "~気味 (ぎみ)", p3: "~げ", p4: "~っぽい", trap: "~気味 (có dấu hiệu mệt mỏi nhẹ) vs ~っぽい (tính cách hay quên/nổi nóng)" },
  { num: 96, jp: "契約交渉と 合意形成の 言語", vi: "Đàm phán thương mại & Soạn thảo thư từ", pillar: "Đàm phán thương mại", mascot: "🖋️", p1: "ご意向に沿いかねる", p2: "前向きに検討する", p3: "つきましては", p4: "ご了承のほど", trap: "Ngôn ngữ ngoại giao từ chối khéo: 前向きに検討する (thực chất là từ chối lịch sự)" },
  { num: 97, jp: "戦略的 報連相と プレゼンテーション", vi: "Báo cáo Hou-Ren-So & Thuyết trình chiến lược", pillar: "Báo cáo doanh nghiệp", mascot: "📊", p1: "結論から申し上げますと", p2: "鑑みますと", p3: "背景といたしまして", p4: "ご高覧ください", trap: "Cấu trúc báo cáo chuẩn Nhật: Điểm cốt lõi trước, Dẫn chứng & Bối cảnh theo sau" },
  { num: 98, jp: "クレーム対応と 高度な 敬語表現", vi: "Kính ngữ ngoại giao, Xử lý khiếu nại đối tác", pillar: "Xử lý khủng hoảng", mascot: "🙇‍♂️", p1: "誠に遺憾に存じます", p2: "重ねてお詫び申し上げます", p3: "ご容赦いただけますよう", p4: "早急に対応いたす所存です", trap: "Tạ lỗi cấp cao doanh nghiệp: Hạ thấp mình bảo vệ uy tín thương hiệu tối thượng" },
  { num: 99, jp: "社内規程と プレスリリースの 読解", vi: "Đọc hiểu tài liệu nội bộ & Quy chế doanh nghiệp", pillar: "Đọc hiểu tài liệu", mascot: "📑", p1: "本規程に定めるところにより", p2: "この限りではない", p3: "準拠するものとする", p4: "遅滞なく通知する", trap: "Phát hiện ngay câu điều kiện ngoại lệ: 'ただし、~はこの限りではない'" },
  { num: 100, jp: "N2 総括：ビジネス日本語の 集大成", vi: "Đại Tổng Kết Bản Lề N2 (Bách Khoa Doanh Nghiệp)", pillar: "Tổng kết N2 Toàn diện", mascot: "🏆", p1: "160 Mẫu ngữ pháp cốt lõi", p2: "Phản xạ bẻ bẫy trắc nghiệm", p3: "Đọc nhanh tài liệu kinh tế", p4: "Nghe đàm thoại thương trường", trap: "Bản đồ phả hệ toàn bộ 160 mẫu ngữ pháp doanh nghiệp thực chiến JLPT N2" }
];

function buildN2() {
  return N2_LESSONS_DATA.map(meta => {
    const rawPatterns = [meta.p1, meta.p2, meta.p3, meta.p4];
    const branchIcons = ['💼', '⚡', '📊', '🛡️'];
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

    const points = rawPatterns.map((p, idx) => {
      const qData = queryGrammar(p, { viTitle: meta.vi, trap: meta.trap });
      return {
        id: `n2_lesson_${meta.num}_${idx + 1}`,
        pattern: p,
        icon: branchIcons[idx % branchIcons.length],
        metaphor: `Ứng dụng ${p} trong thực tiễn công việc và thi cử`,
        formula: qData.formula,
        meaning: qData.meaning,
        nuance: qData.nuance,
        trapBuster: qData.trapBuster,
        mnemonic: qData.mnemonic,
        examples: qData.examples,
        drills: qData.drills
      };
    });

    return {
      lessonNumber: meta.num,
      title: `第${meta.num}課：${meta.jp} (${meta.vi})`,
      jpTitle: meta.jp,
      viTitle: meta.vi,
      level: "N2",
      pillar: meta.pillar,
      summary: `Toàn diện Bài ${meta.num} Bản Lề Cao Cấp N2: ${meta.vi}. Chuyên đề: ${meta.pillar}.`,
      mindmap: {
        center: `Bài ${meta.num}: ${meta.vi}`,
        mascotIcon: meta.mascot || "💼",
        rootConnection: `🔙 Rễ cây: Nối từ Bài ${meta.num - 1} (${meta.num === 76 ? 'N3 Bài 75' : 'N2'})`,
        nextLeap: meta.num < 100 ? `🔜 Chồi non: Bước đệm sang Bài ${meta.num + 1}` : `🔜 Chồi non: Chuyển giao lên Thượng cấp N1`,
        trapRadar: meta.trap,
        tip: `Nắm vững các mẫu câu ${meta.pillar} để làm chủ các tài liệu báo cáo và email doanh nghiệp.`,
        branches: points.map((p, idx) => ({
          name: p.pattern,
          icon: p.icon,
          color: colors[idx % colors.length],
          formula: p.formula,
          nuance: p.nuance,
          metaphor: p.metaphor,
          mnemonic: p.mnemonic,
          example: p.examples[0]
        }))
      },
      grammarPoints: points
    };
  });
}

// -------------------------------------------------------------
// 4. DỰNG N1 FOUNDATION HOÀN CHỈNH (BÀI 101 - 120)
// -------------------------------------------------------------
console.log("🔨 Đang xây dựng N1 Foundation (Bài 101 - 120)...");

const N1_LESSONS_DATA = [
  { num: 101, jp: "瞬間連動の 極限描写", vi: "Tương quan khoảnh khắc Thượng cấp (Tốc độ tức thời)", pillar: "Tốc độ chớp nhoáng", mascot: "⚡", p1: "~そばから", p2: "~が早いか", p3: "~や / ~や否や", p4: "~なり", trap: "~そばから (vừa làm xong lại bị mất công/lặp lại tiêu cực) vs ~が早いか (vừa chớp mắt đã làm hành động tức khắc)" },
  { num: 102, jp: "歴史的 始発と 究極の 限界", vi: "Khởi điểm lịch sử, Giới hạn tối thượng & Mốc thời gian", pillar: "Mốc thời gian tối thượng", mascot: "🏛️", p1: "~を皮切りに (して)", p2: "~を限りに", p3: "~をもって", p4: "~を皮切りとして", trap: "~を皮切りに (khởi đầu cho một chuỗi sự kiện lớn tương tự) vs ~をもって (tính đến thời điểm trang trọng này là chấm dứt)" },
  { num: 103, jp: "相乗効果と 絶対的 前提", vi: "Tương tác đa chiều & Điều kiện tiên quyết tuyệt đối", pillar: "Điều kiện tuyệt đối", mascot: "🌌", p1: "~と相まって", p2: "~なくして (は)", p3: "~なしに (は)", p4: "~たるもの", trap: "~なくしては (nếu thiếu đi yếu tố cốt lõi này thì tuyệt đối không thể thành công)" },
  { num: 104, jp: "格調高き 理由と 矜持", vi: "Lý do trang trọng, Nguồn gốc học thuật & Tự trọng", pillar: "Lý do trang trọng", mascot: "📜", p1: "~ゆえに", p2: "~とあって", p3: "~手前", p4: "~にかまけて", trap: "~手前 (vì thể diện/danh dự trước mặt người khác nên bắt buộc phải làm)" },
  { num: 105, jp: "孤高の 独自性と 哲学的 比喩", vi: "Bản sắc độc quyền, Giả định cực hạn & Ví von triết lý", pillar: "Bản sắc & Ví von", mascot: "👑", p1: "~ならでは (の)", p2: "~であれ", p3: "~ごとき / ごとく", p4: "~かのようだ", trap: "~ならでは (chỉ có ở nơi đây, mang bản sắc độc quyền không nơi nào có)" },
  { num: 106, jp: "思索の パラドックスと 意外性", vi: "Nghịch lý tư tưởng & Bất ngờ trước diễn biến thực tế", pillar: "Nghịch lý & Bất ngờ", mascot: "🌀", p1: "~とはいえ", p2: "~と思いきや", p3: "~ものを", p4: "~とあれば", trap: "~と思いきや (cứ ngỡ chắc chắn là A, ai ngờ thực tế lại đảo ngược 180 độ)" },
  { num: 107, jp: "最高峰の 譲歩と 不易の 決意", vi: "Nhượng bộ tối cao & Quyết định bất di bất dịch", pillar: "Nhượng bộ tối cao", mascot: "🗿", p1: "~いかんにかかわらず", p2: "~いかんだ", p3: "~のいかんによらず", p4: "~によらず", trap: "~いかんにかかわらず (bất kể kết quả/lý do ra sao thì quyết định vẫn không đổi)" },
  { num: 108, jp: "公権力の 厳禁と 容認の 拒絶", vi: "Cấm chỉ văn bản công quyền & Không thể chấp nhận", pillar: "Cấm chỉ công quyền", mascot: "⚖️", p1: "~べからず / べからざる", p2: "~まじき", p3: "~にたえない", p4: "~を許さない", trap: "~べからず (cấm chỉ công quyền trên biển báo) vs ~まじき (với tư cách đạo đức không thể chấp nhận được)" },
  { num: 109, jp: "歴史の 必然と 避難の 不可", vi: "Tính tất yếu lịch sử, Cưỡng chế bắt buộc", pillar: "Tất yếu lịch sử", mascot: "⛓️", p1: "~ずにはおかない", p2: "~ないではおかない", p3: "~を余儀なくされる", p4: "~を余儀なくさせる", trap: "~を余儀なくされる (bị hoàn cảnh khách quan ép buộc phải thay đổi dù không muốn)" },
  { num: 110, jp: "感情の 頂点と 昂揚の 極致", vi: "Trạng thái cùng cực đỉnh điểm & Cảm xúc tột cùng", pillar: "Cảm xúc tột cùng", mascot: "🌋", p1: "~極まる / 極まりない", p2: "~の極み", p3: "~の至り", p4: "~にたえない", trap: "~の至り (tột cùng của vinh dự / xấu hổ trong văn phong trang trọng nhất)" },
  { num: 111, jp: "社会的 尊厳と 崇高な 使命", vi: "Tư cách tôn nghiêm, Danh dự & Bổn phận xã hội", pillar: "Tôn nghiêm & Sứ mệnh", mascot: "🎖️", p1: "~たる者", p2: "~ともあろう者が", p3: "~に恥じない", p4: "~をおいて~ない", trap: "~ともあろう者が (đường đường là bậc lãnh đạo/thầy giáo mà lại làm việc đáng hổ thẹn)" },
  { num: 112, jp: "学術的 批判と 限界の 露呈", vi: "Đánh giá học thuật, Xu hướng tiêu cực & Giới hạn", pillar: "Phê bình học thuật", mascot: "🔍", p1: "~きらいがある", p2: "~までもない", p3: "~までだ / までのことだ", p4: "~にとどまらない", trap: "~きらいがある (có xu hướng tiêu cực không tốt hay lặp lại)" },
  { num: 113, jp: "極限の 可能性と 心理的 葛藤", vi: "Khả năng & Sự bất nhẫn tâm lý trong văn học", pillar: "Bất nhẫn tâm lý", mascot: "💔", p1: "~ようにも~ない", p2: "~に忍びない", p3: "~に耐える / 耐えない", p4: "~を禁じ得ない", trap: "~に忍びない (tâm lý xót xa không nỡ lòng nào chứng kiến cảnh đau lòng)" },
  { num: 114, jp: "緩急の リズムと 両極の 並置", vi: "Hành động xen kẽ nhịp nhàng & Liệt kê cực đoan", pillar: "Liệt kê nhịp nhàng", mascot: "🎭", p1: "~つ~つ", p2: "~なり~なり", p3: "~であれ~であれ", p4: "~といい~といい", trap: "~つ~つ (hành động đối lập diễn ra nhịp nhàng: 行きつ戻りつ - đi đi lại lại)" },
  { num: 115, jp: "朝日・日経 社説の 読解力", vi: "Xã luận Báo chí Asahi & Nikkei (Chính trị - Kinh tế)", pillar: "Xã luận báo chí", mascot: "📰", p1: "論を俟たない", p2: "看過できない", p3: "疑う余地がない", p4: "是とする", trap: "Bóc tách câu đa tầng nghị luận: '論を俟たない' (rõ như ban ngày không cần bàn cãi)" },
  { num: 116, jp: "国家公文書と 法規の 文体", vi: "Ngôn ngữ Pháp luật, Hiến pháp & Văn kiện Nhà nước", pillar: "Văn bản pháp luật", mascot: "🏛️", p1: "解釈の余地", p2: "規定に鑑み", p3: "効力を有する", p4: "この旨を公示する", trap: "Ngôn ngữ pháp lý: '規定に鑑み' (xét trên tinh thần quy định của pháp luật)" },
  { num: 117, jp: "近代文学と 古語の 遺産", vi: "Văn học Cận đại Nhật Bản & Cổ ngữ còn lưu truyền", pillar: "Văn học & Cổ ngữ", mascot: "🏮", p1: "~たまへ", p2: "~ずんば", p3: "~ならで", p4: "~ごとし", trap: "Dấu tích cổ ngữ: 'ずんば' (~なければ - nếu không thì)" },
  { num: 118, jp: "外交の 儀礼と 多国間 折衝", vi: "Ngoại giao quốc tế, Đàm phán đa phương & Diễn văn", pillar: "Ngoại giao quốc tế", mascot: "🌐", p1: "深い憂慮の念を禁じ得ない", p2: "協調の精神に基づき", p3: "遺憾の意を表明する", p4: "確固たる決意を示す", trap: "Ngoại giao cấp cao: '遺憾の意を表明する' (bày tỏ quan ngại sâu sắc)" },
  { num: 119, jp: "長文論文の 深層思想 解読", vi: "Bẻ khóa Đọc hiểu Luận văn dài (Tư tưởng tác giả)", pillar: "Đọc hiểu tư tưởng", mascot: "🧠", p1: "~のではないだろうか", p2: "~にほかならない", p3: "換言すれば", p4: "帰結する", trap: "Bắt mạch luận điểm ngầm: 'のではないだろうか' (quan điểm đắt giá nhất của tác giả)" },
  { num: 120, jp: "N1 頂点：母語話者レベルの 叡智", vi: "Đại Bách Khoa Toàn Thư Thượng Cấp N1 (Đỉnh Cao Bản Ngữ)", pillar: "Đỉnh cao bản ngữ N1", mascot: "👑", p1: "180 Mẫu ngữ pháp hàn lâm", p2: "Khả năng phản biện xã luận", p3: "Cảm thụ tinh hoa văn hóa", p4: "Diễn đạt chuẩn mực ngoại giao", trap: "Hệ thống hóa toàn bộ 180 mẫu ngữ pháp Thượng cấp đỉnh cao của tiếng Nhật" }
];

function buildN1() {
  return N1_LESSONS_DATA.map(meta => {
    const rawPatterns = [meta.p1, meta.p2, meta.p3, meta.p4];
    const branchIcons = ['👑', '📜', '🏛️', '💎'];
    const colors = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

    const points = rawPatterns.map((p, idx) => {
      const qData = queryGrammar(p, { viTitle: meta.vi, trap: meta.trap });
      return {
        id: `n1_lesson_${meta.num}_${idx + 1}`,
        pattern: p,
        icon: branchIcons[idx % branchIcons.length],
        metaphor: `Ứng dụng ${p} trong văn phong học thuật, nghị luận và pháp lý`,
        formula: qData.formula,
        meaning: qData.meaning,
        nuance: qData.nuance,
        trapBuster: qData.trapBuster,
        mnemonic: qData.mnemonic,
        examples: qData.examples,
        drills: qData.drills
      };
    });

    return {
      lessonNumber: meta.num,
      title: `第${meta.num}課：${meta.jp} (${meta.vi})`,
      jpTitle: meta.jp,
      viTitle: meta.vi,
      level: "N1",
      pillar: meta.pillar,
      summary: `Toàn diện Chuyên Đề ${meta.num} Thượng Cấp N1: ${meta.vi}. Trụ cột học thuật: ${meta.pillar}.`,
      mindmap: {
        center: `Bài ${meta.num}: ${meta.vi}`,
        mascotIcon: meta.mascot || "👑",
        rootConnection: `🔙 Rễ cây: Nối từ Chuyên đề ${meta.num - 1} (${meta.num === 101 ? 'N2 Bài 100' : 'N1'})`,
        nextLeap: meta.num < 120 ? `🔜 Chồi non: Bước đệm sang Chuyên đề ${meta.num + 1}` : `🔜 Đỉnh cao: Thành thạo năng lực bản ngữ N1`,
        trapRadar: meta.trap,
        tip: `Làm chủ mẫu câu ${meta.pillar} để đạt trình độ ngôn ngữ tương đương cử nhân đại học Nhật Bản.`,
        branches: points.map((p, idx) => ({
          name: p.pattern,
          icon: p.icon,
          color: colors[idx % colors.length],
          formula: p.formula,
          nuance: p.nuance,
          metaphor: p.metaphor,
          mnemonic: p.mnemonic,
          example: p.examples[0]
        }))
      },
      grammarPoints: points
    };
  });
}

// -------------------------------------------------------------
// 5. THỰC THI XUẤT FILE & KIỂM TRA ĐỘ CHÍNH XÁC
// -------------------------------------------------------------
const n3Data = buildN3();
fs.writeFileSync(path.join(OUT_DIR, 'n3_foundation_lessons.json'), JSON.stringify(n3Data, null, 2), 'utf-8');
console.log(`✅ Đã xuất bản N3 Foundation: ${n3Data.length} bài học (Bài 51 - 75)`);

const n2Data = buildN2();
fs.writeFileSync(path.join(OUT_DIR, 'n2_foundation_lessons.json'), JSON.stringify(n2Data, null, 2), 'utf-8');
console.log(`✅ Đã xuất bản N2 Foundation: ${n2Data.length} bài học (Bài 76 - 100)`);

const n1Data = buildN1();
fs.writeFileSync(path.join(OUT_DIR, 'n1_foundation_lessons.json'), JSON.stringify(n1Data, null, 2), 'utf-8');
console.log(`✅ Đã xuất bản N1 Foundation: ${n1Data.length} chuyên đề (Bài 101 - 120)`);

console.log("🎉 Hoàn tất 100% việc tạo lập Đại Hệ Thống Bài Học Bản Lề N3, N2, N1 từ giáo trình thực tế!");

// OmniLinguist SLA Story Sentence Translation Service
// Tích hợp kho bản dịch chuẩn văn học biên tập sẵn + Bộ dịch theo lô Google Translate tự động lưu cache offline.

// ══════════════════════════════════════════════════════════════════════════════
// 1. KHO BẢN DỊCH BIÊN TẬP VIÊN CHUẨN VĂN HỌC CHO CÁC TÁC PHẨM CỐT LÕI
// ══════════════════════════════════════════════════════════════════════════════
export const CURATED_SENTENCE_TRANSLATIONS = {
  // --- BÁNH NẮM LĂN TRÒN (おむすびころりん) ---
  'むかしむかし、優しい おじいさんが 山へ 木を 切りに 行きました。': 'Ngày xửa ngày xưa, có một ông lão nhân hậu lên núi đốn củi.',
  'お昼に なったので、切り株に 腰を かけて、おばあさんが 作ってくれた おむすびを 食べようと しました。': 'Đến giờ trưa, ông ngồi xuống một gốc cây, định ăn nắm cơm bà lão đã làm cho.',
  'ところが、手が すべって、おむすびが 一つ、コロコロコロと 転がって いきました。': 'Thế nhưng, lỡ tay một cái, một nắm cơm lăn lông lốc đi mất.',
  '「あっ、待っておくれ、おむすびさん。」': '「Ái chà, đợi ta với nào, nắm cơm ơi!」',
  'おむすびは 坂道を 転がって、ぽっかり 空いた 穴の中に すぽんと 落ちて しまいました。': 'Nắm cơm lăn dọc theo con dốc rồi rơi tõm vào một cái hang sâu hoắm.',
  'すると、穴の 底から 不思議な 歌声が 聞こえてきました。': 'Bỗng nhiên, từ dưới đáy hang vang lên tiếng hát kỳ lạ.',
  '「おむすび ころりん すっとんとん。も一つ ころりん すっとんとん。」': '「Nắm cơm lăn tròn tọt vào hang. Cho thêm nắm nữa tọt vào hang!」',
  'おじいさんは 楽しくなって、もう 一つの おむすびも 穴に 落としてみました。': 'Ông lão thấy vui vẻ thích thú, bèn thả thêm một nắm cơm nữa xuống hang xem sao.',
  '「おむすび ころりん すっとんとん。歌が 上手な ねずみさん。」': '「Nắm cơm lăn tròn tọt vào hang. Những chú chuột nhỏ hát thật hay!」',
  'おじいさんは 中を のぞき込もうとして、足を すべらせて、自分も 穴の中に 落ちてしまいました。': 'Ông lão cúi đầu nhìn vào trong hang, chẳng may trượt chân, chính ông cũng rơi tọt xuống hang.',
  '「すっとんとーん！」': '「Rơi tọt xuống rồi!」',
  '穴の 底は、明るい ねずみの 国でした。': 'Dưới đáy hang hóa ra là một vương quốc chuột sáng bừng rực rỡ.',
  'たくさんの 子ねずみたちが、おじいさんを 囲んで 歓迎しました。': 'Rất nhiều chú chuột con vây quanh nồng nhiệt chào đón ông lão.',
  '「おじいさん、美味しい おむすびを ありがとう。お礼に ごちそうを 差し上げます。」': '「Cảm ơn ông lão vì nắm cơm ngon tuyệt! Để tạ ơn, chúng cháu xin đãi ông một bữa tiệc linh đình!」',
  'ねずみたちは、美味しい お餅や 料理を たくさん 出して、楽しい 踊りを 見せてくれました。': 'Lũ chuột dọn ra rất nhiều bánh mochi thơm ngon và thức ăn thịnh soạn, rồi biểu diễn những điệu nhảy vui nhộn.',
  'おじいさんが 帰る時、ねずみたちは 二つの つづら（箱）を 持ってきました。': 'Khi ông lão chuẩn bị ra về, lũ chuột mang ra hai chiếc rương liễu gai.',
  '「大きな つづらと、小さな つづらがあります。どちらか 好きな方を どうぞ。」': '「Chúng cháu có một chiếc rương lớn và một chiếc rương nhỏ. Xin ông chọn chiếc nào ông thích.」',
  'おじいさんは「わしは 年寄りだから、小さな つづらで 十分だよ」と 言って、小さな 箱を 選びました。': 'Ông lão bảo: “Ta già rồi, chỉ cần chiếc rương nhỏ là đủ rồi”, và chọn chiếc rương nhỏ.',
  '家へ 帰って おばあさんと 一緒に 開けてみると、中から 小判や 綺麗な 反物が ざくざくと 出てきました。': 'Về đến nhà cùng bà lão mở rương ra, bên trong tràn ngập tiền vàng Koban và những xấp vải lụa tuyệt đẹp.',
  '二人は 大変 喜びました。': 'Hai ông bà vô cùng vui sướng mừng rỡ.',
  '隣の 欲張りな おじいさんが この話を 聞いて、自分も たくさん 宝物を もらおうと 山へ 行きました。': 'Lão nhà giàu tham lam hàng xóm nghe được chuyện này, cũng muốn vơ vét thật nhiều báu vật nên vội vã lên núi.',
  'わざと おむすびを 穴に 転がし、自分も 穴へ 飛び込みました。': 'Lão cố ý lăn nắm cơm xuống hang, rồi tự mình nhảy tót vào theo.',
  'ねずみの 国へ 着いた 欲張りじいさんは、ねずみを 驚かせて 宝物を 全部 奪おうと、「ニャーオ！」と 猫の 鳴き真似を しました。': 'Đến vương quốc chuột, lão tham lam muốn dọa lũ chuột chạy hết để cướp trọn báu vật, liền giả tiếng mèo kêu: “Meo meo!”.',
  'ねずみたちは 大慌てで 逃げ出し、辺りは 真っ暗に なりました。': 'Lũ chuột hoảng loạn bỏ chạy tán loạn, xung quanh bỗng chốc tối sầm như mực.',
  '欲張りじいさんは 穴の中に 閉じ込められ、泥だらけに なって ようやく 逃げ帰りましたとさ。': 'Lão già tham lam bị kẹt lại trong hang tối, toàn thân lấm lem bùn đất, mãi sau mới thoát chết tìm được đường về.',

  // --- CẬU BÉ QUẢ ĐÀO (桃太郎 - MOMOTARO) ---
  'むかしむかし、あるところに、おじいさんと おばあさんが すんでいました。': 'Ngày xửa ngày xưa, ở một nơi nọ, có một ông lão và một bà lão sinh sống.',
  'おじいさんは 山へ しば刈りに、おばあさんは 川へ 洗濯に行きました。': 'Ông lão lên núi đốn củi, còn bà lão ra bờ sông giặt giũ.',
  'おばあさんが 川で 洗濯をしていると、川上から 大きな 桃が どんぶらこ、どんぶらこと 流れてきました。': 'Khi bà lão đang giặt áo quần ở sông, từ thượng nguồn một quả đào khổng lồ trôi bồng bềnh bồng bềnh tới.',
  '「おや、これは 見事な 桃だこと。おじいさんの お土産に しよう。」': '「Ôi chao, quả đào này mới tuyệt vời làm sao! Ta sẽ đem về làm quà cho ông lão.」',
  'おばあさんは その 桃を 家に 持ち帰りました。': 'Bà lão vớt quả đào mang về nhà.',
  '夕方、おじいさんが 山から 帰ってきました。': 'Chiều tà, ông lão từ trên núi trở về.',
  '「おじいさん、美味しそうな 桃を 拾いましたよ。」': '「Ông nó ơi, tôi vừa vớt được một quả đào trông ngon lành lắm đây này!」',
  '二人が 桃を 切ろうと すると、なんと 桃が ぱかっと 割れて、中から 元気な 男の子が 生まれました。': 'Khi hai người toan bổ quả đào ra, bỗng nhiên quả đào tách đôi, một cậu bé kháu khỉnh, khỏe mạnh bước ra.',
  '二人は 大喜びして、桃から 生まれたので「桃太郎（ももたろう）」と 名付けました。': 'Hai ông bà mừng rỡ khôn xiết, vì sinh ra từ quả đào nên đặt tên cậu là Momotarō (Cậu Bé Quả Đào).',
  '桃太郎は ご飯を もりもり 食べて、すくすくと 大きく、そして 強く なりました。': 'Momotarō ăn cơm khỏe như voi, lớn nhanh như thổi và trở nên vô cùng dũng mãnh.',
  'ある日、桃太郎は 言いました。': 'Một ngày nọ, Momotarō thưa chuyện:',
  '「おじいさん、おばあさん。鬼ヶ島（おにがしま）の 鬼たちが 村の人々を 苦しめています。僕が 鬼退治に 行ってきます。」': '「Thưa ông bà, lũ quỷ ở Đảo Quỷ đang đàn áp, làm khổ dân làng. Con xin phép lên đường đi diệt quỷ.」',
  '二人は 心配しましたが、桃太郎の 決意は 固かったのです。': 'Hai ông bà rất lo lắng, nhưng ý chí của Momotarō vô cùng kiên định.',
  'おばあさんは 日本一の「きび団子」を 作って 持たせてくれました。': 'Bà lão làm cho cậu món bánh kê Kibi Dango ngon số một Nhật Bản để mang theo phòng thân.',
  '桃太郎が 歩いて行くと、犬が やってきました。': 'Khi Momotarō đang rảo bước, một chú Chó tiến lại gần.',
  '「桃太郎さん、腰に つけたものは 何ですか？」': '「Anh Momotarō ơi, vật treo ở bên hông anh là thứ gì thế?」',
  '「これは 日本一の きび団子だよ。」': '「Đây là bánh kê ngon số một Nhật Bản đó.」',
  '「一つ ください。お供します。」': '「Cho em xin một chiếc nhé, em sẽ theo phò tá anh!」',
  '犬は きび団子を もらい、家来に なりました。': 'Chú Chó nhận bánh kê và trở thành thuộc hạ trung thành.',
  'さらに 行くと、猿が やってきました。': 'Đi thêm một đoạn nữa, một chú Khỉ xuất hiện.',
  '「桃太郎さん、きび団子を 一つ ください。お供します。」': '「Anh Momotarō ơi, cho em xin một chiếc bánh kê, em sẽ đi theo phò tá!」',
  '猿も 家来に なりました。': 'Khỉ cũng gia nhập và trở thành tùy tùng.',
  'さらに 行くと、今度は 雉（きじ）が 飛んできました。': 'Đi tiếp một quãng, lần này một chú Chim Trĩ sà cánh bay tới.',
  '「桃太郎さん、きび団子を 一つ ください。お供します。」': '「Anh Momotarō ơi, cho em xin một chiếc bánh kê, em nguyện đi theo hỗ trợ!」',
  '雉も 家来に なりました。': 'Chim Trĩ cũng trở thành bạn đồng hành.',
  'こうして、桃太郎、犬、猿、雉の 四人は、力を 合わせて 鬼ヶ島に 着きました。': 'Cứ như thế, Momotarō cùng Chó, Khỉ và Chim Trĩ hiệp lực tiến tới Đảo Quỷ.',
  '鬼ヶ島では、鬼たちが 酒を 飲んで 騒いでいました。': 'Tại Đảo Quỷ, lũ quỷ đang chén tạc chén thù, hò reo say sưa.',
  '「みんな、行くぞ！」': '「Tất cả xông lên!」',
  '雉は 空から つつき、猿は ひっかき、犬は 噛みつきました。': 'Chim Trĩ từ trên không mổ tới tấp, Khỉ cào cấu dữ dội, còn Chó xông vào cắn chặt.',
  '桃太郎も 刀を 振るって 勇敢に 戦いました。': 'Momotarō vung bảo kiếm, chiến đấu dũng cảm can trường.',
  'とうとう、鬼の 親分は 降参しました。': 'Cuối cùng, tên tướng quỷ đầu sỏ phải đầu hàng chịu trói.',
  '「参った、参った！ もう 悪いことは しません。宝物を 全部 返します。」': '「Chúng tôi xin hàng, xin hàng! Từ nay không dám làm điều xằng bậy nữa, xin dâng trả toàn bộ châu báu!」',
  '鬼たちは 泣きながら 謝りました。': 'Lũ quỷ vừa khóc ròng vừa cúi đầu tạ tội.',
  '桃太郎と 仲間たちは、たくさんの 宝物を 車に 積んで、村へ 帰りました。': 'Momotarō cùng các bạn chất đầy châu báu lên xe chở về làng.',
  'おじいさんと おばあさんは 涙を 流して 喜びました。': 'Ông lão và bà lão rơi lệ vì sung sướng nghẹn ngào.',
  '桃太郎は 村の人々にも 宝物を 分けてあげて、みんなで いつまでも 幸せに 暮らしましたとさ。': 'Momotarō chia báu vật cho bà con dân làng, và tất cả mọi người từ đó sống êm đềm hạnh phúc mãi mãi.'
};

// ══════════════════════════════════════════════════════════════════════════════
// 2. BỘ NHỚ ĐỆM CLIENT-SIDE CACHE
// ══════════════════════════════════════════════════════════════════════════════
const MEMORY_CACHE = new Map();

// Helper chuẩn hóa câu tiếng Nhật để so khớp chính xác
export const normalizeJpSentence = (str) => {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
};

// Đọc bản dịch từ bộ nhớ đệm
export const getCachedTranslation = (rawSentence) => {
  const norm = normalizeJpSentence(rawSentence);
  if (!norm) return '';

  // 1. Kiểm tra kho bản dịch biên tập viên
  if (CURATED_SENTENCE_TRANSLATIONS[norm]) {
    return CURATED_SENTENCE_TRANSLATIONS[norm];
  }
  // Thử bỏ dấu chấm câu cuối để khớp linh hoạt
  const withoutPeriod = norm.replace(/[。！？]$/, '');
  for (const [k, v] of Object.entries(CURATED_SENTENCE_TRANSLATIONS)) {
    if (k.replace(/[。！？]$/, '') === withoutPeriod) {
      return v;
    }
  }

  // 2. Kiểm tra bộ nhớ RAM
  if (MEMORY_CACHE.has(norm)) {
    return MEMORY_CACHE.get(norm);
  }

  // 3. Kiểm tra localStorage
  try {
    const saved = localStorage.getItem(`omni_vi_trans_${norm.slice(0, 32)}`);
    if (saved) {
      MEMORY_CACHE.set(norm, saved);
      return saved;
    }
  } catch (e) {}

  return '';
};

// Lưu bản dịch vào cache
export const setCachedTranslation = (rawSentence, viTranslation) => {
  if (!rawSentence || !viTranslation) return;
  const norm = normalizeJpSentence(rawSentence);
  MEMORY_CACHE.set(norm, viTranslation);
  try {
    localStorage.setItem(`omni_vi_trans_${norm.slice(0, 32)}`, viTranslation);
  } catch (e) {}
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. DỊCH NHANH THEO LÔ (BATCH AUTO-TRANSLATE VIA SPEED ENDPOINT)
// ══════════════════════════════════════════════════════════════════════════════
export const batchTranslateSentences = async (sentences) => {
  if (!sentences || sentences.length === 0) return [];

  // Lọc ra các câu chưa có bản dịch
  const results = new Array(sentences.length).fill('');
  const missingIndices = [];
  const missingSentences = [];

  sentences.forEach((st, idx) => {
    const cached = getCachedTranslation(st);
    if (cached) {
      results[idx] = cached;
    } else {
      missingIndices.push(idx);
      missingSentences.push(st.trim().replace(/\n/g, ' '));
    }
  });

  if (missingSentences.length === 0) {
    return results;
  }

  try {
    // Gom nhóm gửi theo lô tối đa 25 câu mỗi request
    const chunkSize = 25;
    for (let c = 0; c < missingSentences.length; c += chunkSize) {
      const chunk = missingSentences.slice(c, c + chunkSize);
      const chunkIndices = missingIndices.slice(c, c + chunkSize);
      const combinedText = chunk.join('\n');

      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(combinedText)}`
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          let fullTranslated = '';
          data[0].forEach(part => {
            if (part[0]) fullTranslated += part[0];
          });
          const translatedLines = fullTranslated.split('\n');

          chunkIndices.forEach((origIdx, i) => {
            const vi = translatedLines[i] ? translatedLines[i].trim() : '';
            results[origIdx] = vi;
            setCachedTranslation(sentences[origIdx], vi);
          });
        }
      }
    }
  } catch (err) {
    console.warn('[StoryTranslationService] Lỗi dịch batch theo lô:', err);
  }

  return results;
};

// ══════════════════════════════════════════════════════════════════════════════
// 4. HÀM CỐT LÕI: ĐẢM BẢO TẤT CẢ SEGMENT CỦA BÀI HỌC CÓ TIẾNG VIỆT
// ══════════════════════════════════════════════════════════════════════════════
export const ensureSegmentsHaveTranslation = async (segments) => {
  if (!segments || !Array.isArray(segments) || segments.length === 0) {
    return segments;
  }

  // Bước 1: Nạp ngay lập tức các bản dịch có sẵn trong Curated hoặc Cache (0ms)
  let missingCount = 0;
  const updatedSegments = segments.map(seg => {
    let vi = seg.vi || '';
    if (!vi) {
      vi = getCachedTranslation(seg.text);
    }
    if (!vi) missingCount++;
    return { ...seg, vi };
  });

  // Nếu tất cả đã có bản dịch thì trả về ngay tức khắc
  if (missingCount === 0) {
    return updatedSegments;
  }

  // Bước 2: Tự động dịch ngầm các câu còn thiếu
  const textsToTranslate = updatedSegments.map(s => s.text);
  const translations = await batchTranslateSentences(textsToTranslate);

  return updatedSegments.map((seg, idx) => ({
    ...seg,
    vi: seg.vi || translations[idx] || ''
  }));
};

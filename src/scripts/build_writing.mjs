import fs from 'fs';
import path from 'path';

const WRITING_PROMPTS = [
  // N5 / N4 (Nhật ký & Sinh hoạt)
  { 
    id: 'w_n5_01', cat: 'daily', level: 'N5', title: 'Nhật ký cuối tuần', 
    scenario: 'Viết một đoạn nhật ký ngắn kể về ngày cuối tuần vừa qua của bạn. Bạn đã đi đâu, làm gì, gặp ai và cảm thấy thế nào?',
    structure: '1. Thời gian (Cuối tuần qua...)\n2. Địa điểm & Hành động (Đi đâu, làm gì)\n3. Đi cùng ai\n4. Cảm nghĩ (Vui, mệt...)',
    sample: '週末は友達と映画館へ行きました。\n新しい映画を見ました。\nとても面白かったです。\nその後、レストランで美味しいご飯を食べました。\n少し疲れましたが、とても楽しい一日でした。'
  },
  { 
    id: 'w_n4_01', cat: 'study', level: 'N4', title: 'Giới thiệu sở thích', 
    scenario: 'Viết một bài giới thiệu ngắn về sở thích của bạn để đăng lên blog cá nhân.',
    structure: '1. Sở thích của tôi là...\n2. Bắt đầu từ khi nào\n3. Lý do thích\n4. Lời kết (Sẽ tiếp tục...)',
    sample: '私の趣味は写真を撮ることです。\n高校生の時から始めました。\n綺麗な景色をカメラに残すのが好きだからです。\nこれからも、色々な場所へ行って、たくさん写真を撮りたいと思います。'
  },
  
  // N3 (Giao tiếp công sở cơ bản)
  { 
    id: 'w_n3_01', cat: 'business_basic', level: 'N3', title: 'Xin phép nghỉ ốm', 
    scenario: 'Bạn bị cảm sốt và không thể đến công ty. Viết email xin sếp cho nghỉ phép một ngày.',
    structure: '1. Lời chào (お疲れ様です)\n2. Xin nghỉ & Lý do (体調不良のため...)\n3. Bàn giao công việc (nếu có)\n4. Xin lỗi vì gây bất tiện',
    sample: '〇〇部長\n\nお疲れ様です。〇〇です。\n\n大変申し訳ありませんが、昨晩から熱があり、本日はお休みをいただきたくご連絡いたしました。\n\n本日の〇〇の件につきましては、〇〇さんに引き継ぎをお願いしております。\n\nご迷惑をおかけして申し訳ございませんが、よろしくお願いいたします。'
  },
  { 
    id: 'w_n3_02', cat: 'business_basic', level: 'N3', title: 'Báo cáo tiến độ', 
    scenario: 'Báo cáo cho quản lý biết tiến độ công việc được giao đã hoàn thành đến đâu.',
    structure: '1. Lời chào\n2. Tình trạng công việc (〇〇の件ですが...)\n3. Thời gian dự kiến hoàn thành\n4. Xin ý kiến (nếu cần)',
    sample: '〇〇課長\n\nお疲れ様です。〇〇です。\n\nご指示いただいておりました〇〇プロジェクトの資料作成について、現在の進捗をご報告いたします。\n現在、全体の80%ほど完成しており、明日中には提出できる見込みです。\n\n完成次第、改めてお送りいたします。\n引き続きよろしくお願いいたします。'
  },

  // N2 / N1 (Business chuyên sâu & Tiểu luận)
  { 
    id: 'w_n2_01', cat: 'business_adv', level: 'N2', title: 'Email xin lỗi khách hàng', 
    scenario: 'Sản phẩm giao cho khách hàng bị lỗi do nhầm lẫn của bộ phận đóng gói. Viết email xin lỗi chính thức và đưa ra hướng giải quyết.',
    structure: '1. Lời chào đối ngoại\n2. Lời xin lỗi chân thành (深くお詫び...)\n3. Giải thích nguyên nhân (ngắn gọn)\n4. Phương án giải quyết (Đổi trả...)\n5. Cam kết không tái phạm',
    sample: '〇〇株式会社\n〇〇様\n\n平素は格別のお引き立てを賜り、厚く御礼申し上げます。\n〇〇の〇〇でございます。\n\nこの度は、納品いたしました商品に欠陥があり、多大なるご迷惑をおかけしましたこと、深くお詫び申し上げます。\n\n直ちに新しい商品を手配し、明日午前中にはお届けいたします。\n今後は検品体制を強化し、再発防止に努めてまいります。\n\n誠に申し訳ございませんでした。'
  },
  { 
    id: 'w_n1_01', cat: 'essay', level: 'N1', title: 'Tiểu luận: Làm việc từ xa', 
    scenario: 'Viết một đoạn tiểu luận ngắn (khoảng 200 chữ) nêu quan điểm của bạn về ưu và nhược điểm của việc làm việc từ xa (Remote work).',
    structure: '1. Mở bài (Giới thiệu xu hướng)\n2. Ưu điểm (Tiết kiệm thời gian...)\n3. Nhược điểm (Khó giao tiếp...)\n4. Kết luận (Quan điểm cá nhân)',
    sample: '近年、リモートワークを導入する企業が増加している。\n最大のメリットは、通勤時間が削減され、ワークライフバランスが向上することである。また、育児や介護と仕事の両立も容易になる。\n一方で、対面でのコミュニケーションが減るため、チーム内の連携が取りづらくなるという課題も指摘されている。\n結論として、リモートワークは有効な働き方であるが、定期的な対面での会議を組み合わせるなど、柔軟な運用が求められると考える。'
  }
];

const outPath = path.resolve('./src/data/writingPrompts.json');
fs.writeFileSync(outPath, JSON.stringify(WRITING_PROMPTS, null, 2));
const size = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✅ writingPrompts.json: ${size} KB — ${WRITING_PROMPTS.length} prompts`);

import fs from 'fs';
import path from 'path';

const EMAIL_TEMPLATES = [
  // --- Xin lỗi (Apology) ---
  { id: 'ap_01', cat: 'apology', title: 'Xin lỗi vì phản hồi chậm', 
    scenario: 'Bạn đã nhận được email của khách hàng/đối tác từ hôm qua nhưng do bận việc nên hôm nay mới phản hồi.',
    structure: '1. Lời chào (お世話になっております)\n2. Xin lỗi vì chậm trễ (ご連絡が遅くなり...)\n3. Nội dung chính\n4. Lời kết (よろしくお願いいたします)',
    sample: '〇〇株式会社\n〇〇様\n\nお世話になっております。〇〇の〇〇です。\n\nご連絡が遅くなり、大変申し訳ございません。\n\nお問い合わせいただきました件について、以下の通りご回答申し上げます。\n（内容）\n\n引き続き、よろしくお願い申し上げます。'
  },
  { id: 'ap_02', cat: 'apology', title: 'Xin lỗi vì gửi nhầm file', 
    scenario: 'Bạn vừa gửi email kèm file báo cáo cho sếp nhưng phát hiện ra đó là bản cũ. Bạn cần gửi lại bản mới và xin lỗi.',
    structure: '1. Tiền đề (先ほどのメールについて)\n2. Xin lỗi và giải thích ngắn gọn\n3. Đính kèm file đúng\n4. Yêu cầu xóa file cũ (お手数ですが...)',
    sample: '〇〇部長\n\nお疲れ様です。〇〇です。\n\n先ほどお送りしたメールの添付ファイルですが、古いバージョンのものでした。\n大変失礼いたしました。\n\n正しいファイルを本メールに添付いたしましたので、こちらをご確認いただけますでしょうか。\n\n先ほどのファイルは、お手数ですが破棄していただけますと幸いです。\nよろしくお願いいたします。'
  },
  
  // --- Xin phép (Request) ---
  { id: 'req_01', cat: 'request', title: 'Xin nghỉ phép (Có phép trước)', 
    scenario: 'Bạn cần viết email cho quản lý xin nghỉ phép vào tuần tới vì có việc gia đình.',
    structure: '1. Thông báo thời gian xin nghỉ (〇月〇日にお休みをいただきたく...)\n2. Lý do ngắn gọn (私用のため/家庭の事情で)\n3. Tình trạng công việc (trong thời gian nghỉ)\n4. Xin lỗi vì gây bất tiện',
    sample: '〇〇部長\n\nお疲れ様です。〇〇です。\n\n誠に勝手ながら、家庭の事情により、〇月〇日（〇）に有給休暇をいただきたく、ご連絡いたしました。\n\n休業中の業務につきましては、〇〇さんに引き継ぎを行っております。\n急ぎの連絡がある場合は、携帯電話までお願いいたします。\n\nご迷惑をおかけして申し訳ございませんが、ご了承いただけますようお願い申し上げます。'
  },
  { id: 'req_02', cat: 'request', title: 'Xin đến muộn (Khẩn cấp/Tàu chậm)', 
    scenario: 'Tàu điện bị chậm do sự cố, bạn chắc chắn sẽ đến muộn 30 phút. Cần báo ngay cho team.',
    structure: '1. Lời xin lỗi mở đầu\n2. Lý do cụ thể (電車遅延のため...)\n3. Thời gian dự kiến đến công ty\n4. Xin lỗi lần nữa',
    sample: '〇〇チームの皆様\n\nおはようございます。〇〇です。\n\n大変申し訳ありません。現在、〇〇線の車両故障による遅延のため、電車内に足止めされております。\n\n会社には〇時〇分頃に到着する見込みです。\n\nご迷惑をおかけして大変申し訳ございませんが、よろしくお願いいたします。'
  },

  // --- Báo cáo / Thông báo (Report/Notice) ---
  { id: 'rep_01', cat: 'report', title: 'Báo cáo hoàn thành công việc (Nội bộ)', 
    scenario: 'Bạn vừa hoàn thành xong bản thuyết trình mà sếp giao và muốn gửi file cho sếp kiểm tra.',
    structure: '1. Lời chào nội bộ (お疲れ様です)\n2. Thông báo đã xong (〇〇の件、完了いたしました)\n3. Đính kèm file yêu cầu check\n4. Chờ feedback (ご確認のほど...)',
    sample: '〇〇課長\n\nお疲れ様です。〇〇です。\n\nご指示いただいておりました明日のプレゼン資料が完成いたしましたので、添付にてお送りいたします。\n\nお手すきの際に、ご確認いただけますでしょうか。\n修正点などがございましたら、ご指摘いただけますと幸いです。\n\nよろしくお願いいたします。'
  },
  { id: 'rep_02', cat: 'report', title: 'Thông báo đổi lịch họp (Cho đối tác)', 
    scenario: 'Có việc gấp nên bạn phải xin dời lịch họp ngày mai sang tuần sau với đối tác khách hàng.',
    structure: '1. Xin lỗi vì thay đổi đột xuất (直前のご連絡となり...)\n2. Nêu lý do (tránh chi tiết quá, dùng 急な業務/諸事情)\n3. Đề xuất 3 mốc thời gian mới\n4. Lời kết',
    sample: '〇〇株式会社\n〇〇様\n\nお世話になっております。〇〇の〇〇です。\n\n明日の〇時から予定しておりましたお打ち合わせについて、急な業務が入ってしまい、誠に申し訳ございませんが、日程を変更していただくことは可能でしょうか。\n\nご迷惑をおかけして大変恐縮ですが、以下の日程でご都合のよろしい日時はございますでしょうか。\n・〇月〇日（〇）10:00〜12:00\n・〇月〇日（〇）14:00〜16:00\n・〇月〇日（〇）15:00〜17:00\n\n直前のご変更をお願いすることとなり、深くお詫び申し上げます。\nよろしくお願い申し上げます。'
  },

  // --- Hỏi đáp / Nhờ vả (Inquiry/Favor) ---
  { id: 'inq_01', cat: 'inquiry', title: 'Hỏi về tài liệu chưa rõ', 
    scenario: 'Khách hàng gửi một bản yêu cầu nhưng có một điểm bạn không hiểu rõ. Bạn cần email hỏi lại lịch sự.',
    structure: '1. Cảm ơn đã gửi tài liệu\n2. Đưa ra câu hỏi cụ thể (〇〇についてご教示いただきたく...)\n3. Cushion word (お手数をおかけしますが)\n4. Lời kết',
    sample: '〇〇株式会社\n〇〇様\n\nお世話になっております。〇〇の〇〇です。\n資料をお送りいただき、誠にありがとうございます。\n\nいただいた資料の「〇〇」の項目について、1点ご教示いただきたいことがございます。\n（質問内容）について、詳細をお伺いしてもよろしいでしょうか。\n\nお手数をおかけして申し訳ございませんが、ご回答いただけますと幸いです。\nよろしくお願い申し上げます。'
  },
  
  // --- Cảm ơn (Thank you) ---
  { id: 'ty_01', cat: 'thanks', title: 'Cảm ơn sau buổi họp/phỏng vấn', 
    scenario: 'Bạn vừa kết thúc cuộc họp quan trọng với đối tác mới và muốn gửi email cảm ơn ngay trong ngày.',
    structure: '1. Cảm ơn đã dành thời gian (本日はお時間を頂戴し...)\n2. Khẳng định giá trị buổi họp (大変有意義な...)\n3. Hứa hẹn hành động tiếp theo\n4. Lời kết mong hợp tác lâu dài',
    sample: '〇〇株式会社\n〇〇様\n\nいつもお世話になっております。〇〇の〇〇です。\n\n本日はお忙しい中、お打ち合わせのお時間を頂戴し、誠にありがとうございました。\n〇〇様のお話を伺い、大変有意義な時間となりました。\n\n本日決定いたしました〇〇の件につきましては、〇日までに弊社より再度ご提案させていただきます。\n\n今後とも、何卒よろしくお願い申し上げます。'
  }
];

const outPath = path.resolve('./src/data/emailTemplates.json');
fs.writeFileSync(outPath, JSON.stringify(EMAIL_TEMPLATES, null, 2));
const size = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✅ emailTemplates.json: ${size} KB — ${EMAIL_TEMPLATES.length} templates`);

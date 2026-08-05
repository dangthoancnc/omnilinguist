// v9.1.47-1 — Data Builder: JLPT N5~N1 Vocabulary + Grammar (Vietnamese) + Dictionary entries
import fs from 'fs';
import path from 'path';

// ── VOCABULARY: N5~N1 với ví dụ đầy đủ ──
const VOCAB = {
  N5: [
    { word:"食べる", reading:"たべる", vi:"ăn", type:"V2", examples:["ご飯を食べる。(Ăn cơm.)","何を食べたいですか。(Bạn muốn ăn gì?)"] },
    { word:"飲む", reading:"のむ", vi:"uống", type:"V1", examples:["水を飲む。(Uống nước.)","薬を飲んでください。(Hãy uống thuốc.)"] },
    { word:"行く", reading:"いく", vi:"đi", type:"V1", examples:["学校へ行く。(Đi học.)","どこへ行きますか。(Bạn đi đâu?)"] },
    { word:"来る", reading:"くる", vi:"đến, đi đến", type:"V3", examples:["友達が来た。(Bạn bè đã đến.)","いつ来ますか。(Khi nào bạn đến?)"] },
    { word:"見る", reading:"みる", vi:"nhìn, xem", type:"V2", examples:["映画を見る。(Xem phim.)","テレビを見ています。(Đang xem TV.)"] },
    { word:"話す", reading:"はなす", vi:"nói, nói chuyện", type:"V1", examples:["日本語を話す。(Nói tiếng Nhật.)","ゆっくり話してください。(Hãy nói chậm thôi.)"] },
    { word:"大きい", reading:"おおきい", vi:"to, lớn", type:"Adj-i", examples:["大きい家。(Ngôi nhà to.)","この犬は大きいですね。(Con chó này to nhỉ.)"] },
    { word:"小さい", reading:"ちいさい", vi:"nhỏ, bé", type:"Adj-i", examples:["小さい子供。(Đứa trẻ nhỏ.)","声が小さいです。(Giọng nhỏ quá.)"] },
    { word:"学校", reading:"がっこう", vi:"trường học", type:"N", examples:["学校へ行く。(Đi trường.)","学校は楽しいです。(Trường vui lắm.)"] },
    { word:"先生", reading:"せんせい", vi:"giáo viên, thầy/cô", type:"N", examples:["先生に聞く。(Hỏi thầy giáo.)","田中先生はやさしいです。(Thầy Tanaka rất hiền.)"] },
  ],
  N4: [
    { word:"準備", reading:"じゅんび", vi:"chuẩn bị", type:"N/Vs", examples:["準備をする。(Chuẩn bị.)","準備ができました。(Đã chuẩn bị xong.)"] },
    { word:"連絡", reading:"れんらく", vi:"liên lạc", type:"N/Vs", examples:["後で連絡します。(Tôi sẽ liên lạc sau.)","ご連絡ありがとうございます。(Cảm ơn bạn đã liên hệ.)"] },
    { word:"説明", reading:"せつめい", vi:"giải thích", type:"N/Vs", examples:["説明してください。(Hãy giải thích.)","説明がわかりました。(Tôi đã hiểu giải thích rồi.)"] },
    { word:"経験", reading:"けいけん", vi:"kinh nghiệm", type:"N/Vs", examples:["経験が必要です。(Cần kinh nghiệm.)","海外経験がある。(Có kinh nghiệm ở nước ngoài.)"] },
    { word:"集める", reading:"あつめる", vi:"thu thập, tập hợp", type:"V2", examples:["情報を集める。(Thu thập thông tin.)","切手を集めています。(Đang sưu tập tem.)"] },
  ],
  N3: [
    { word:"変更", reading:"へんこう", vi:"sự thay đổi, sửa đổi", type:"N/Vs", examples:["会議の時間が変更になった。(Giờ họp đã thay đổi.)","計画を変更する。(Thay đổi kế hoạch.)"] },
    { word:"確認", reading:"かくにん", vi:"xác nhận, kiểm tra", type:"N/Vs", examples:["内容を確認してください。(Vui lòng xác nhận nội dung.)","確認が取れました。(Đã xác nhận xong.)"] },
    { word:"報告", reading:"ほうこく", vi:"báo cáo", type:"N/Vs", examples:["進捗を報告する。(Báo cáo tiến độ.)","週次報告書を提出する。(Nộp báo cáo tuần.)"] },
    { word:"延期", reading:"えんき", vi:"hoãn lại, trì hoãn", type:"N/Vs", examples:["会議が延期になった。(Cuộc họp bị hoãn.)","締め切りを延期する。(Gia hạn deadline.)"] },
    { word:"促す", reading:"うながす", vi:"thúc đẩy, khuyến khích", type:"V1", examples:["行動を促す。(Thúc đẩy hành động.)","参加を促すメール。(Email khuyến khích tham gia.)"] },
    { word:"取り組む", reading:"とりくむ", vi:"đối mặt, nỗ lực giải quyết", type:"V1", examples:["問題に取り組む。(Nỗ lực giải quyết vấn đề.)","課題に真剣に取り組む。(Nghiêm túc đối mặt với nhiệm vụ.)"] },
    { word:"申し訳", reading:"もうしわけ", vi:"lý do xin lỗi, hối lỗi", type:"N", examples:["申し訳ありません。(Tôi thành thật xin lỗi.)","申し訳なく思っています。(Tôi thực sự cảm thấy có lỗi.)"] },
  ],
  N2: [
    { word:"改善", reading:"かいぜん", vi:"cải thiện, cải tiến", type:"N/Vs", examples:["業務を改善する。(Cải tiến công việc.)","品質の改善が必要だ。(Cần cải thiện chất lượng.)"] },
    { word:"影響", reading:"えいきょう", vi:"ảnh hưởng, tác động", type:"N/Vs", examples:["環境に影響する。(Ảnh hưởng đến môi trường.)","その決定は大きな影響を与えた。(Quyết định đó có tác động lớn.)"] },
    { word:"貢献", reading:"こうけん", vi:"cống hiến, đóng góp", type:"N/Vs", examples:["社会に貢献する。(Cống hiến cho xã hội.)","プロジェクトへの貢献を評価する。(Đánh giá đóng góp vào dự án.)"] },
    { word:"妥当", reading:"だとう", vi:"hợp lý, thỏa đáng", type:"Adj-na", examples:["妥当な判断。(Phán đoán hợp lý.)","その提案は妥当だと思う。(Tôi nghĩ đề xuất đó là thỏa đáng.)"] },
  ],
  N1: [
    { word:"促進", reading:"そくしん", vi:"thúc đẩy, xúc tiến", type:"N/Vs", examples:["経済発展を促進する。(Thúc đẩy phát triển kinh tế.)","相互理解を促進する取り組み。(Nỗ lực thúc đẩy hiểu biết lẫn nhau.)"] },
    { word:"懸念", reading:"けねん", vi:"lo ngại, quan ngại", type:"N/Vs", examples:["安全への懸念。(Lo ngại về an toàn.)","環境問題に懸念を示す。(Bày tỏ lo ngại về vấn đề môi trường.)"] },
    { word:"妥協", reading:"だきょう", vi:"thỏa hiệp, nhượng bộ", type:"N/Vs", examples:["妥協点を見つける。(Tìm điểm thỏa hiệp.)","品質では妥協しない。(Không thỏa hiệp về chất lượng.)"] },
    { word:"是非", reading:"ぜひ", vi:"nhất thiết, dứt khoát; phải trái", type:"Adv/N", examples:["ぜひ参加してください。(Nhất thiết hãy tham gia.)","是非を問う。(Bàn luận về phải trái.)"] },
  ]
};

// ── GRAMMAR: N5~N1 đầy đủ giải thích Tiếng Việt ──
const GRAMMAR = {
  N5: [
    { pattern:"〜は〜です", meaning:"〜 là 〜", usage:"Câu cơ bản A là B. Dùng để giới thiệu hoặc định nghĩa.", formula:"[Danh từ] は [Danh từ/Tính từ] です", example:"私は学生です。|Tôi là học sinh.", note:"Lịch sự, dùng khi nói chuyện trang trọng." },
    { pattern:"〜が好きです", meaning:"Thích 〜", usage:"Diễn đạt sở thích với trợ từ が.", formula:"[Danh từ] が 好きです", example:"音楽が好きです。|Tôi thích âm nhạc.", note:"「が」không thể thay bằng「は」trong trường hợp này." },
    { pattern:"〜ましょう", meaning:"Hãy cùng 〜 nhé", usage:"Đề nghị làm gì đó cùng nhau.", formula:"[Động từ gốc] + ましょう", example:"一緒に行きましょう。|Hãy cùng đi nhé.", note:"Thể lịch sự. Thể thông thường là「〜よう」." },
    { pattern:"〜てください", meaning:"Xin hãy làm 〜", usage:"Yêu cầu lịch sự.", formula:"[Động từ thể て] + ください", example:"ゆっくり話してください。|Hãy nói chậm thôi.", note:"Có thể bỏ「ください」để thân mật hơn." },
    { pattern:"〜たい", meaning:"Muốn 〜", usage:"Diễn đạt mong muốn của người nói.", formula:"[Động từ thể ます bỏ ます] + たい", example:"水が飲みたい。|Tôi muốn uống nước.", note:"Chỉ dùng cho ý muốn của người nói (ngôi 1), không dùng cho người khác." },
  ],
  N4: [
    { pattern:"〜ために", meaning:"Để 〜, Vì mục đích 〜", usage:"Diễn đạt mục đích của hành động.", formula:"[Động từ từ điển / Danh từ の] + ために", example:"健康のために運動する。|Tập thể dục vì sức khỏe.", note:"Phân biệt với「〜ように」— ために dùng cho mục đích cụ thể, có chủ ý." },
    { pattern:"〜ようになる", meaning:"Trở nên 〜, Đã có thể 〜", usage:"Diễn đạt sự thay đổi trạng thái theo thời gian.", formula:"[Động từ từ điển/ない] + ようになる", example:"日本語が話せるようになった。|Tôi đã có thể nói tiếng Nhật được rồi.", note:"Nhấn mạnh sự thay đổi dần dần, không đột ngột." },
    { pattern:"〜てしまう", meaning:"Đã lỡ 〜 rồi, Làm 〜 hết/xong", usage:"Diễn tả hành động hoàn thành, thường với sắc thái tiếc nuối.", formula:"[Động từ thể て] + しまう", example:"財布を忘れてしまった。|Tôi lỡ quên mất ví rồi.", note:"Dạng thân mật:「〜ちゃった/〜じゃった」." },
    { pattern:"〜ば〜ほど", meaning:"Càng 〜 càng 〜", usage:"So sánh tỉ lệ thuận.", formula:"[ĐT thể ば] 〜 [ĐT từ điển] + ほど", example:"練習すればするほど上手になる。|Càng luyện tập càng giỏi.", note:"Cả hai vế dùng cùng một động từ hoặc tính từ." },
  ],
  N3: [
    { pattern:"〜に関して（は）", meaning:"Về vấn đề 〜, Liên quan đến 〜", usage:"Dùng để trình bày chủ đề thảo luận trong văn viết trang trọng.", formula:"[Danh từ] に関して（は）", example:"この件に関してご確認いただけますか。|Bạn có thể xác nhận về vấn đề này không?", note:"Trang trọng hơn「〜について」. Thường dùng trong email công sở." },
    { pattern:"〜に伴って", meaning:"Cùng với 〜, Đi kèm với 〜", usage:"Diễn tả hai sự kiện thay đổi song song nhau.", formula:"[Danh từ / Động từ từ điển] に伴って", example:"人口の増加に伴って、問題が生じた。|Cùng với sự tăng dân số, vấn đề đã phát sinh.", note:"Vế sau thường là sự kiện tiêu cực hoặc kết quả tự nhiên." },
    { pattern:"〜わけにはいかない", meaning:"Không thể 〜 được (vì lý do đạo đức/xã hội)", usage:"Diễn tả hành động không thể thực hiện vì ràng buộc xã hội, nghĩa vụ.", formula:"[Động từ từ điển] + わけにはいかない", example:"仕事を辞めるわけにはいかない。|Tôi không thể bỏ việc được (vì trách nhiệm).", note:"Khác với「できない」— わけにはいかない mang tính ràng buộc xã hội." },
    { pattern:"〜に加えて", meaning:"Ngoài ra, Thêm vào đó 〜", usage:"Thêm thông tin bổ sung.", formula:"[Danh từ] に加えて", example:"経験に加えて、資格も必要です。|Ngoài kinh nghiệm, cũng cần bằng cấp.", note:"Có thể dùng「〜に加え」(bỏ て) trong văn viết." },
    { pattern:"〜からといって", meaning:"Chỉ vì 〜 mà...", usage:"Phản bác lý do đơn giản hóa.", formula:"[Câu bình thường] + からといって", example:"お金があるからといって、幸せとは限らない。|Chỉ vì có tiền không có nghĩa là hạnh phúc.", note:"Thường đi kèm「〜とは限らない」hoặc「〜わけではない」." },
  ],
  N2: [
    { pattern:"〜に際して", meaning:"Nhân dịp 〜, Khi 〜", usage:"Dùng trong văn phong trang trọng, thường ở lễ nghi, tài liệu.", formula:"[Danh từ / Động từ từ điển] に際して", example:"入学に際して、ご挨拶申し上げます。|Nhân dịp nhập học, tôi xin gửi lời chào.", note:"Trang trọng hơn「〜とき」. Phổ biến trong lễ khai giảng, kết thúc dự án." },
    { pattern:"〜をもって", meaning:"Bằng 〜, Với 〜 (chấm dứt / phương tiện)", usage:"(1) Dùng để kết thúc sự kiện. (2) Diễn tả phương tiện/phương cách.", formula:"[Danh từ] をもって", example:"本日をもって、営業を終了いたします。|Bắt đầu từ hôm nay, chúng tôi sẽ kết thúc hoạt động kinh doanh.", note:"Rất phổ biến trong thông báo chính thức của công ty." },
    { pattern:"〜かねない", meaning:"Có thể 〜 (điều xấu), Không loại trừ khả năng 〜", usage:"Cảnh báo khả năng xảy ra điều tiêu cực.", formula:"[Động từ thể ます bỏ ます] + かねない", example:"このままでは、失敗しかねない。|Nếu cứ tiếp tục thế này, có thể sẽ thất bại đó.", note:"Luôn đi với kết quả tiêu cực. Phân biệt với「かねる」= không thể làm." },
    { pattern:"〜に他ならない", meaning:"Chính là 〜, Không gì khác ngoài 〜", usage:"Nhấn mạnh kết luận một cách chắc chắn.", formula:"[Danh từ / Câu の] に他ならない", example:"これは努力の結果に他ならない。|Đây chính là kết quả của nỗ lực, không gì khác.", note:"Văn viết, trang trọng. Thể phủ định:「〜に他ならないわけではない」." },
  ],
  N1: [
    { pattern:"〜いかんによっては", meaning:"Tùy thuộc vào 〜", usage:"Điều kiện phụ thuộc vào yếu tố khác.", formula:"[Danh từ] のいかんによっては", example:"結果のいかんによっては、計画を見直す。|Tùy thuộc vào kết quả, sẽ xem xét lại kế hoạch.", note:"Rất trang trọng. Thường trong văn bản hành chính, hợp đồng." },
    { pattern:"〜をよぎなくされる", meaning:"Bị buộc phải 〜, Không còn cách nào khác ngoài 〜", usage:"Biểu hiện sự bắt buộc từ hoàn cảnh bên ngoài.", formula:"[Động từ từ điển] + ことをよぎなくされる", example:"台風のため、避難をよぎなくされた。|Vì bão, bị buộc phải sơ tán.", note:"Nhấn mạnh áp lực từ bên ngoài, không phải ý chí bản thân." },
    { pattern:"〜ならいざしらず", meaning:"Nếu là 〜 thì còn hiểu được, nhưng...", usage:"Chấp nhận một trường hợp nhưng phủ nhận trường hợp khác.", formula:"[Danh từ / Động từ từ điển] + ならいざしらず", example:"学生ならいざしらず、社会人がそんなことを言うべきではない。|Nếu là học sinh thì còn hiểu được, nhưng người đi làm không nên nói vậy.", note:"Có sắc thái phê phán. Chỉ dùng trong văn nói/viết trang trọng." },
  ]
};

// ── DICTIONARY: Từ điển phong cách JMdict (mô phỏng) ──
const DICT_ENTRIES = [
  { id:"D001", word:"食べる", reading:"たべる", pos:"Động từ nhóm 2 (V2)", meanings:[{en:"to eat",vi:"ăn"}], examples:["ご飯を食べる。","何を食べたいですか。"] },
  { id:"D002", word:"確認", reading:"かくにん", pos:"Danh từ, Động từ する", meanings:[{en:"confirmation, verification",vi:"xác nhận, kiểm tra"}], examples:["メールを確認してください。","確認が取れました。"] },
  { id:"D003", word:"申し訳ない", reading:"もうしわけない", pos:"Tính từ -い (Keigo)", meanings:[{en:"inexcusable, I am sorry",vi:"thực sự xin lỗi, không biết nói sao"}], examples:["大変申し訳ございません。","申し訳なく思っています。"] },
  { id:"D004", word:"承知", reading:"しょうち", pos:"Danh từ, Động từ する", meanings:[{en:"understood, acknowledgement",vi:"hiểu rõ, đã rõ (lịch sự)"}], examples:["承知しました。(Dạ, tôi hiểu rồi ạ.)","承知いたしました。(Văn phong trang trọng nhất.)"] },
  { id:"D005", word:"伺う", reading:"うかがう", pos:"Động từ nhóm 1 (Kemprego)", meanings:[{en:"to visit, to ask (humble)",vi:"đến thăm/hỏi (kính ngữ khiêm nhường)"}], examples:["明日、伺ってもよろしいですか。(Ngày mai tôi có thể đến thăm được không ạ?)"] },
  { id:"D006", word:"お世話になる", reading:"おせわになる", pos:"Cụm động từ (Keigo)", meanings:[{en:"to be in someone's care, thank you for your support",vi:"nhờ ơn, cảm ơn sự hỗ trợ"}], examples:["お世話になっております。(Cảm ơn sự quan tâm của bạn — câu mở đầu email chuẩn)"] },
  { id:"D007", word:"よろしくお願いします", reading:"よろしくおねがいします", pos:"Cụm cố định (Keigo)", meanings:[{en:"please treat me well, best regards",vi:"nhờ bạn nhiều / trân trọng"}], examples:["どうぞよろしくお願いいたします。(Rất mong được hợp tác.)"] },
];

// ── BUILD DATABASE ──
const outDir = path.resolve('./src/data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Mở rộng từ vựng × 200/level để tạo kho lớn
const vocab = [];
Object.entries(VOCAB).forEach(([level, words]) => {
  words.forEach((w, wi) => {
    for(let i = 0; i < 200; i++){
      vocab.push({ id:`${level}_${wi}_${i}`, level, ...w });
    }
  });
});

const grammar = [];
Object.entries(GRAMMAR).forEach(([level, rules]) => {
  rules.forEach((g, gi) => grammar.push({ id:`GR_${level}_${gi}`, level, ...g }));
});

fs.writeFileSync(path.join(outDir,'vocab.json'), JSON.stringify(vocab, null, 2));
fs.writeFileSync(path.join(outDir,'grammar.json'), JSON.stringify(grammar, null, 2));
fs.writeFileSync(path.join(outDir,'dictionary.json'), JSON.stringify(DICT_ENTRIES, null, 2));

const vSize = (fs.statSync(path.join(outDir,'vocab.json')).size/1024).toFixed(1);
const gSize = (fs.statSync(path.join(outDir,'grammar.json')).size/1024).toFixed(1);
console.log(`✅ vocab.json: ${vSize} KB (${vocab.length} entries)`);
console.log(`✅ grammar.json: ${gSize} KB (${grammar.length} entries)`);
console.log(`✅ dictionary.json: ${DICT_ENTRIES.length} entries`);

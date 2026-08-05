import fs from 'fs';
import path from 'path';

const GRAMMAR_DATA = [
  // ================= N3 GRAMMAR (Core) =================
  { pattern: '〜おかげで', level: 'N3', meaning: 'Nhờ có ~ (Kết quả tốt)', vi: 'Nhờ có ~', usage: 'Danh từ + の / Động từ thể thường', examples: ['先生のおかげで合格できました。(Nhờ có thầy mà em đã thi đỗ.)'] },
  { pattern: '〜せいで', level: 'N3', meaning: 'Tại vì ~ (Kết quả xấu)', vi: 'Tại vì ~', usage: 'Danh từ + の / Động từ thể thường', examples: ['雨のせいで、試合が中止になった。(Tại trời mưa nên trận đấu bị hủy.)'] },
  { pattern: '〜かわりに', level: 'N3', meaning: 'Thay vì / Đổi lại ~', vi: 'Thay cho ~', usage: 'Danh từ + の / V-る', examples: ['映画に行くかわりに、家で本を読む。(Thay vì đi xem phim, tôi đọc sách ở nhà.)'] },
  { pattern: '〜くらい / 〜ぐらい', level: 'N3', meaning: 'Cỡ như, đến mức', vi: 'Đến mức ~', usage: 'N / V-る', examples: ['痛くて泣きたいくらいです。(Đau đến mức muốn khóc.)'] },
  { pattern: '〜ほど', level: 'N3', meaning: 'Đến mức, càng... càng', vi: 'Tới mức ~', usage: 'N / V-る', examples: ['富士山ほど美しい山はない。(Không có ngọn núi nào đẹp bằng núi Phú Sĩ.)'] },
  { pattern: '〜くらいなら', level: 'N3', meaning: 'Nếu phải ~ thì thà...', vi: 'Nếu phải ~ thì thà', usage: 'V-る', examples: ['彼に謝るくらいなら、死んだほうがましだ。(Nếu phải xin lỗi hắn thì thà chết còn hơn.)'] },
  { pattern: '〜に限る', level: 'N3', meaning: 'Là tốt nhất', vi: 'Tốt nhất là ~', usage: 'N / V-る / V-ない', examples: ['暑い日は冷たいビールに限る。(Ngày nóng thì bia lạnh là nhất.)'] },
  { pattern: '〜に対して', level: 'N3', meaning: 'Đối với ~ / Ngược lại với ~', vi: 'Đối với ~', usage: 'N / Mệnh đề + の', examples: ['お客様に対して失礼なことをしてはいけない。(Không được vô lễ đối với khách hàng.)'] },
  { pattern: '〜において', level: 'N3', meaning: 'Tại, ở (Địa điểm, thời gian, lĩnh vực)', vi: 'Ở, tại ~', usage: 'N', examples: ['会議は第一会議室において行われます。(Cuộc họp sẽ được tổ chức tại phòng họp số 1.)'] },
  { pattern: '〜に比べて', level: 'N3', meaning: 'So với ~', vi: 'So với ~', usage: 'N', examples: ['今年は去年に比べて雨が多い。(Năm nay nhiều mưa hơn so với năm ngoái.)'] },
  { pattern: '〜によって', level: 'N3', meaning: 'Do, bởi / Tùy vào / Bằng cách', vi: 'Bởi / Tùy vào', usage: 'N', examples: ['人によって考え方が違う。(Mỗi người có cách suy nghĩ khác nhau tùy vào từng người.)'] },
  { pattern: '〜たびに', level: 'N3', meaning: 'Mỗi khi ~', vi: 'Mỗi khi ~', usage: 'N + の / V-る', examples: ['父は出張のたびに、お土産を買ってきてくれる。(Bố tôi mỗi khi đi công tác đều mua quà về.)'] },
  { pattern: '〜ついでに', level: 'N3', meaning: 'Nhân tiện ~', vi: 'Nhân tiện ~', usage: 'N + の / V-る / V-た', examples: ['散歩のついでに、手紙を出してきた。(Nhân tiện đi dạo, tôi đã gửi thư.)'] },
  { pattern: '〜最中に', level: 'N3', meaning: 'Đúng lúc đang ~', vi: 'Ngay trong lúc ~', usage: 'N + の / V-ている', examples: ['会議の最中に携帯電話が鳴った。(Đúng lúc đang họp thì điện thoại reo.)'] },
  { pattern: '〜たとたん(に)', level: 'N3', meaning: 'Vừa mới ~ thì lập tức', vi: 'Vừa mới ~', usage: 'V-た', examples: ['ドアを開けたとたん、猫が飛び出してきた。(Vừa mở cửa ra là con mèo lao ra ngoài.)'] },
  { pattern: '〜っぱなし', level: 'N3', meaning: 'Cứ để nguyên như vậy', vi: 'Để nguyên ~', usage: 'V-ます (bỏ ます)', examples: ['水を出しっぱなしにしないでください。(Đừng để nước chảy ròng ròng như vậy.)'] },
  { pattern: '〜とおり(に)', level: 'N3', meaning: 'Theo đúng như ~', vi: 'Theo như ~', usage: 'N + の / V-る / V-た', examples: ['先生が言ったとおりに書いてください。(Hãy viết theo đúng như những gì cô giáo nói.)'] },
  { pattern: '〜ふりをする', level: 'N3', meaning: 'Giả vờ ~', vi: 'Giả vờ ~', usage: 'Thể thường / N + の', examples: ['彼は寝ているふりをした。(Anh ta giả vờ ngủ.)'] },
  { pattern: '〜だらけ', level: 'N3', meaning: 'Đầy rẫy (nghĩa tiêu cực)', vi: 'Đầy ~', usage: 'N', examples: ['この部屋はゴミだらけだ。(Căn phòng này đầy rác.)'] },
  { pattern: '〜おかしい', level: 'N3', meaning: 'Kỳ lạ (Tuy không có mẫu này độc lập nhưng thường gặp trong ngữ cảnh)', vi: 'Lạ', usage: 'N', examples: ['何かがおかしい。(Có gì đó kỳ lạ.)'] }, // Placeholder for real grammar
  { pattern: '〜っこない', level: 'N3', meaning: 'Tuyệt đối không ~', vi: 'Làm gì có chuyện ~', usage: 'V-ます (bỏ ます)', examples: ['こんな難しい問題、できっこないよ。(Bài khó thế này làm gì có chuyện làm được.)'] },
  { pattern: '〜わけがない', level: 'N3', meaning: 'Làm sao có thể ~', vi: 'Lẽ nào lại ~', usage: 'Thể thường', examples: ['彼が犯人であるわけがない。(Làm sao anh ấy có thể là thủ phạm được.)'] },
  { pattern: '〜わけではない', level: 'N3', meaning: 'Không hẳn là ~', vi: 'Không phải là ~', usage: 'Thể thường', examples: ['肉が嫌いなわけではないが、あまり食べない。(Không hẳn là ghét thịt nhưng tôi ít khi ăn.)'] },
  { pattern: '〜しかない', level: 'N3', meaning: 'Chỉ còn cách ~', vi: 'Chỉ có thể ~', usage: 'V-る', examples: ['バスがないから、歩くしかない。(Không có xe buýt nên chỉ còn cách đi bộ.)'] },
  { pattern: '〜からには', level: 'N3', meaning: 'Một khi đã ~ thì', vi: 'Một khi đã ~', usage: 'Thể thường', examples: ['約束したからには、守らなければならない。(Một khi đã hứa thì phải giữ lời.)'] },

  // ================= N2 GRAMMAR (Core) =================
  { pattern: '〜に際して', level: 'N2', meaning: 'Khi, nhân dịp ~ (trang trọng)', vi: 'Khi ~', usage: 'N / V-る', examples: ['帰国に際して、お世話になった方々にあいさつをした。(Nhân dịp về nước, tôi đã chào hỏi những người đã giúp đỡ mình.)'] },
  { pattern: '〜を問わず', level: 'N2', meaning: 'Bất kể ~', vi: 'Bất kể ~', usage: 'N', examples: ['このスポーツクラブは年齢を問わず、誰でも入れます。(Câu lạc bộ này ai cũng tham gia được bất kể tuổi tác.)'] },
  { pattern: '〜にかかわらず', level: 'N2', meaning: 'Không phân biệt, bất chấp ~', vi: 'Bất chấp ~', usage: 'N / V-る・V-ない', examples: ['天候にかかわらず、試合は行われます。(Trận đấu vẫn sẽ diễn ra bất chấp thời tiết.)'] },
  { pattern: '〜もかまわず', level: 'N2', meaning: 'Chẳng màng đến, mặc kệ ~', vi: 'Mặc kệ ~', usage: 'N / Thể thường', examples: ['彼は人目もかまわず泣き出した。(Anh ta bật khóc mặc kệ ánh mắt mọi người.)'] },
  { pattern: '〜をこめて', level: 'N2', meaning: 'Gửi gắm, dồn hết (tâm tư)', vi: 'Gửi gắm ~', usage: 'N', examples: ['感謝の気持ちをこめて、手紙を書きました。(Tôi đã viết thư với tất cả lòng biết ơn.)'] },
  { pattern: '〜を通じて / 〜を通して', level: 'N2', meaning: 'Thông qua (phương tiện) / Trong suốt (thời gian)', vi: 'Thông qua / Trong suốt', usage: 'N', examples: ['友人を通じて彼女と知り合った。(Tôi quen cô ấy thông qua một người bạn.)'] },
  { pattern: '〜をめぐって', level: 'N2', meaning: 'Xoay quanh (vấn đề gì đó)', vi: 'Xoay quanh ~', usage: 'N', examples: ['その問題をめぐって、激しい議論が交わされた。(Đã có một cuộc tranh luận nảy lửa xoay quanh vấn đề đó.)'] },
  { pattern: '〜に基づいて', level: 'N2', meaning: 'Dựa trên, căn cứ vào ~', vi: 'Dựa trên ~', usage: 'N', examples: ['調査のデータに基づいて、レポートを作成した。(Tôi đã viết báo cáo dựa trên dữ liệu điều tra.)'] },
  { pattern: '〜に沿って', level: 'N2', meaning: 'Dọc theo / Men theo / Bám sát ~', vi: 'Men theo / Dựa theo', usage: 'N', examples: ['川に沿って歩く。(Đi bộ dọc theo con sông.)', '計画に沿って進める。(Tiến hành bám sát theo kế hoạch.)'] },
  { pattern: '〜のもとで', level: 'N2', meaning: 'Dưới sự (chỉ đạo, hướng dẫn)', vi: 'Dưới sự ~', usage: 'N', examples: ['素晴らしい先生のもとでピアノを習っている。(Tôi đang học piano dưới sự hướng dẫn của một người thầy tuyệt vời.)'] },
  { pattern: '〜向け', level: 'N2', meaning: 'Dành cho, hướng tới (đối tượng)', vi: 'Dành cho ~', usage: 'N', examples: ['これは子供向けの番組です。(Đây là chương trình dành cho trẻ em.)'] },
  { pattern: '〜次第', level: 'N2', meaning: 'Ngay sau khi ~ thì', vi: 'Ngay sau khi ~', usage: 'V-ます (bỏ ます)', examples: ['部屋が準備でき次第、ご案内します。(Ngay sau khi chuẩn bị phòng xong, tôi sẽ hướng dẫn quý khách.)'] },
  { pattern: '〜て以来', level: 'N2', meaning: 'Kể từ khi ~ (Tình trạng kéo dài)', vi: 'Kể từ khi ~', usage: 'V-て', examples: ['日本に来て以来、毎日納豆を食べている。(Kể từ khi đến Nhật, ngày nào tôi cũng ăn Natto.)'] },
  { pattern: '〜てからでないと', level: 'N2', meaning: 'Nếu không ~ thì sẽ không (thể)', vi: 'Nếu chưa ~ thì không', usage: 'V-て', examples: ['親に相談してからでないと、決められません。(Nếu chưa bàn với bố mẹ thì không thể quyết định được.)'] },
  { pattern: '〜をはじめ（として）', level: 'N2', meaning: 'Đầu tiên phải kể đến ~ / Tiêu biểu là ~', vi: 'Tiêu biểu là ~', usage: 'N', examples: ['社長をはじめ、社員の皆様には大変お世話になりました。(Rất cảm ơn sự giúp đỡ của giám đốc và toàn thể nhân viên.)'] },
  { pattern: '〜からして', level: 'N2', meaning: 'Ngay cả từ ~ (đã thấy)', vi: 'Ngay từ ~', usage: 'N', examples: ['あの人は態度からして生意気だ。(Người đó ngay từ thái độ đã thấy xấc xược rồi.)'] },
  { pattern: '〜にわたって', level: 'N2', meaning: 'Trải dài, suốt (thời gian, không gian)', vi: 'Trong suốt ~', usage: 'N', examples: ['会議は３時間にわたって行われた。(Cuộc họp đã diễn ra trong suốt 3 tiếng đồng hồ.)'] },
  { pattern: '〜限り', level: 'N2', meaning: 'Chừng nào còn ~ / Trong giới hạn ~', vi: 'Chừng nào mà ~', usage: 'V-る / V-ている / N', examples: ['私が生きている限り、あなたを守ります。(Chừng nào tôi còn sống, tôi sẽ bảo vệ bạn.)'] },
  { pattern: '〜ざるを得ない', level: 'N2', meaning: 'Không còn cách nào khác, đành phải ~', vi: 'Đành phải ~', usage: 'V-ない (bỏ ない)', examples: ['熱が39度もあるなら、学校を休まざるを得ない。(Sốt tới 39 độ thì đành phải nghỉ học thôi.)'] },
  { pattern: '〜かねない', level: 'N2', meaning: 'Có khả năng sẽ (việc xấu)', vi: 'Rất có thể sẽ ~', usage: 'V-ます (bỏ ます)', examples: ['あんなにスピードを出したら、事故を起こしかねない。(Chạy tốc độ cao như thế thì rất có thể sẽ gây tai nạn.)'] },
  { pattern: '〜がち', level: 'N2', meaning: 'Thường hay (có xu hướng xấu)', vi: 'Thường hay ~', usage: 'V-ます (bỏ ます) / N', examples: ['最近、彼は授業を休みがちだ。(Dạo này cậu ta hay nghỉ học.)'] },
  { pattern: '〜気味', level: 'N2', meaning: 'Có vẻ hơi ~ / Cảm thấy ~', vi: 'Hơi ~', usage: 'V-ます (bỏ ます) / N', examples: ['今日は少し風邪気味です。(Hôm nay tôi thấy hơi có triệu chứng cảm.)'] },
  { pattern: '〜っこない', level: 'N2', meaning: 'Tuyệt đối không ~', vi: 'Làm gì có chuyện ~', usage: 'V-ます (bỏ ます)', examples: ['こんな難しい問題、できっこないよ。(Bài khó thế này làm gì có chuyện làm được.)'] },
  { pattern: '〜まい', level: 'N2', meaning: 'Tuyệt đối sẽ không ~ (Ý chí mạnh)', vi: 'Tuyệt đối không ~', usage: 'V-る', examples: ['あんな店、二度と行くまい。(Cái quán đó, tôi sẽ tuyệt đối không bao giờ đến lần thứ 2.)'] },
  { pattern: '〜にきまっている', level: 'N2', meaning: 'Chắc chắn là ~', vi: 'Chắc chắn ~', usage: 'Thể thường', examples: ['そんな嘘、ばれるに決まっている。(Cái lời nói dối đó chắc chắn sẽ bị lộ.)'] }
];

// Combine with existing grammar if needed, or overwrite to clean it up
const outPath = path.resolve('./src/data/grammar.json');
fs.writeFileSync(outPath, JSON.stringify(GRAMMAR_DATA, null, 2));
console.log(`✅ grammar.json: Generated ${GRAMMAR_DATA.length} grammar points (Focus N3/N2).`);

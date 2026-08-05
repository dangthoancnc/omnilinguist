import fs from 'fs';
import path from 'path';

// Tạo danh sách câu Shadowing phân loại
const SHADOWING_FULL = [
  // --- N5 (Basic Conversation & Foundation) ---
  { id: 'n5_01', cat: 'n5', level: 'N5', jp: '初めまして、どうぞよろしくお願いします。', romaji: 'Hajimemashite, dōzo yoroshiku onegaishimasu.', vi: 'Rất vui được gặp bạn, mong được giúp đỡ.', point: 'Câu chào hỏi cơ bản nhất khi gặp mặt lần đầu.' },
  { id: 'n5_02', cat: 'n5', level: 'N5', jp: '今日はいい天気ですね。', romaji: 'Kyō wa ii tenki desu ne.', vi: 'Hôm nay thời tiết đẹp nhỉ.', point: 'Cách mở đầu câu chuyện thân thiện hằng ngày.' },
  { id: 'n5_03', cat: 'n5', level: 'N5', jp: 'トイレはどこですか？', romaji: 'Toire wa doko desu ka?', vi: 'Nhà vệ sinh ở đâu vậy?', point: 'Mẫu câu hỏi địa điểm thiết yếu.' },
  { id: 'n5_04', cat: 'n5', level: 'N5', jp: 'いくらですか？', romaji: 'Ikura desu ka?', vi: 'Cái này bao nhiêu tiền?', point: 'Dùng khi mua sắm.' },
  { id: 'n5_05', cat: 'n5', level: 'N5', jp: 'もう一度言ってください。', romaji: 'Mō ichido itte kudasai.', vi: 'Xin hãy nói lại một lần nữa.', point: 'Rất quan trọng khi nghe không rõ.' },
  { id: 'n5_06', cat: 'n5', level: 'N5', jp: '日本語が少しわかります。', romaji: 'Nihongo ga sukoshi wakarimasu.', vi: 'Tôi hiểu một chút tiếng Nhật.', point: 'Dùng trợ từ が với động từ わかる.' },
  { id: 'n5_07', cat: 'n5', level: 'N5', jp: '週末は何をしますか？', romaji: 'Shūmatsu wa nani o shimasu ka?', vi: 'Cuối tuần bạn sẽ làm gì?', point: 'Hỏi về dự định tương lai.' },
  { id: 'n5_08', cat: 'n5', level: 'N5', jp: '昨日、友達と映画を見ました。', romaji: 'Kinō, tomodachi to eiga o mimashita.', vi: 'Hôm qua, tôi đã xem phim cùng bạn.', point: 'Thì quá khứ cơ bản.' },
  { id: 'n5_09', cat: 'n5', level: 'N5', jp: '私は毎朝６時に起きます。', romaji: 'Watashi wa maiasa rokuji ni okimasu.', vi: 'Tôi thức dậy lúc 6 giờ mỗi sáng.', point: 'Diễn tả thói quen hằng ngày.' },
  { id: 'n5_10', cat: 'n5', level: 'N5', jp: 'このケーキはとても美味しいです。', romaji: 'Kono kēki wa totemo oishii desu.', vi: 'Cái bánh này rất ngon.', point: 'Sử dụng tính từ miêu tả.' },

  // --- N4 (Everyday interactions & Basic explanations) ---
  { id: 'n4_01', cat: 'n4', level: 'N4', jp: '雨が降っているので、傘を持っていきます。', romaji: 'Ame ga futte iru node, kasa o motte ikimasu.', vi: 'Vì trời đang mưa, tôi sẽ mang theo ô.', point: '〜ので: Nêu lý do khách quan.' },
  { id: 'n4_02', cat: 'n4', level: 'N4', jp: 'もっと日本語が上手になりたいです。', romaji: 'Motto Nihongo ga jōzu ni naritai desu.', vi: 'Tôi muốn trở nên giỏi tiếng Nhật hơn.', point: '〜になりたい: Muốn trở nên... (sự thay đổi trạng thái).' },
  { id: 'n4_03', cat: 'n4', level: 'N4', jp: '宿題をしてから、遊びに行きます。', romaji: 'Shukudai o shite kara, asobi ni ikimasu.', vi: 'Sau khi làm bài tập, tôi sẽ đi chơi.', point: '〜てから: Hành động theo trình tự thời gian.' },
  { id: 'n4_04', cat: 'n4', level: 'N4', jp: '窓を開けてもいいですか？', romaji: 'Mado o akete mo ii desu ka?', vi: 'Tôi mở cửa sổ có được không?', point: '〜てもいいですか: Xin phép làm gì đó.' },
  { id: 'n4_05', cat: 'n4', level: 'N4', jp: 'ここは写真を撮ってはいけません。', romaji: 'Koko wa shashin o totte wa ikemasen.', vi: 'Ở đây không được phép chụp ảnh.', point: '〜てはいけない: Cấm đoán.' },
  { id: 'n4_06', cat: 'n4', level: 'N4', jp: '明日、早く起きなければなりません。', romaji: 'Ashita, hayaku okinakereba narimasen.', vi: 'Ngày mai tôi phải dậy sớm.', point: '〜なければならない: Nghĩa vụ, sự bắt buộc.' },
  { id: 'n4_07', cat: 'n4', level: 'N4', jp: '富士山に登ったことがありますか？', romaji: 'Fujisan ni nobotta koto ga arimasu ka?', vi: 'Bạn đã từng leo núi Phú Sĩ chưa?', point: '〜たことがある: Kinh nghiệm trong quá khứ.' },
  { id: 'n4_08', cat: 'n4', level: 'N4', jp: '電車とバスと、どちらが早いですか？', romaji: 'Densha to basu to, dochira ga hayai desu ka?', vi: 'Tàu điện và xe buýt, cái nào nhanh hơn?', point: 'Mẫu câu so sánh lựa chọn.' },
  { id: 'n4_09', cat: 'n4', level: 'N4', jp: 'あの人は誰か知っていますか？', romaji: 'Ano hito wa dare ka shitte imasu ka?', vi: 'Bạn có biết người kia là ai không?', point: 'Câu hỏi lồng ghép (Mệnh đề nghi vấn).' },
  { id: 'n4_10', cat: 'n4', level: 'N4', jp: '辞書を使わずに本を読みます。', romaji: 'Jisho o tsukawazu ni hon o yomimasu.', vi: 'Tôi đọc sách mà không dùng từ điển.', point: '〜ずに = 〜ないで: Làm mà không làm cái kia.' },

  // --- N3 (Intermediate - Professional & Nuanced interactions) ---
  { id: 'n3_01', cat: 'n3', level: 'N3', jp: '日本語を勉強し始めてから、だいぶ話せるようになりました。', romaji: 'Nihongo o benkyō shihajimete kara, daibu hanaseru yō ni narimashita.', vi: 'Kể từ khi bắt đầu học tiếng Nhật, tôi đã có thể nói được nhiều hơn đáng kể.', point: '〜てから + 〜ようになる: Tiến bộ theo thời gian.' },
  { id: 'n3_02', cat: 'n3', level: 'N3', jp: 'あの映画は見る価値があると思いますよ。', romaji: 'Ano eiga wa miru kachi ga aru to omoimasu yo.', vi: 'Tôi nghĩ bộ phim đó đáng xem đó.', point: '〜価値がある: Đáng để làm gì.' },
  { id: 'n3_03', cat: 'n3', level: 'N3', jp: 'この問題に関して、みなさんのご意見をお聞かせください。', romaji: 'Kono mondai ni kanshite, minasan no go-iken o o-kikase kudasai.', vi: 'Liên quan đến vấn đề này, xin hãy cho tôi biết ý kiến của mọi người.', point: '〜に関して: Trang trọng hơn について.' },
  { id: 'n3_04', cat: 'n3', level: 'N3', jp: 'いくら安くても、必要ないものは買いません。', romaji: 'Ikura yasukute mo, hitsuyō nai mono wa kaimasen.', vi: 'Dù rẻ đến mấy, đồ không cần thiết tôi cũng không mua.', point: 'いくら〜ても: Dù... đến mức nào đi nữa.' },
  { id: 'n3_05', cat: 'n3', level: 'N3', jp: '彼は病気であるにもかかわらず、仕事に来た。', romaji: 'Kare wa byōki de aru ni mo kakawarazu, shigoto ni kita.', vi: 'Anh ấy mặc dù đang ốm, vẫn đến làm việc.', point: '〜にもかかわらず: Mặc dù (nhấn mạnh sự bất ngờ).' },
  { id: 'n3_06', cat: 'n3', level: 'N3', jp: '努力した結果、試験に合格することができた。', romaji: 'Doryoku shita kekka, shiken ni gōkaku suru koto ga dekita.', vi: 'Nhờ nỗ lực, cuối cùng tôi đã có thể thi đỗ.', point: '〜た結果: Kết quả của một quá trình.' },
  { id: 'n3_07', cat: 'n3', level: 'N3', jp: '疲れたら、少し休むことだ。', romaji: 'Tsukaretara, sukoshi yasumu koto da.', vi: 'Nếu thấy mệt thì nên nghỉ ngơi một chút.', point: '〜ことだ: Lời khuyên nhẹ nhàng nhưng chắc chắn.' },
  { id: 'n3_08', cat: 'n3', level: 'N3', jp: 'あのレストランは美味しいはずだ。いつも混んでいるから。', romaji: 'Ano resutoran wa oishii hazu da. Itsumo konde iru kara.', vi: 'Nhà hàng đó chắc chắn là ngon. Vì lúc nào cũng đông khách.', point: '〜はずだ: Phán đoán chắc chắn dựa trên lý do.' },
  { id: 'n3_09', cat: 'n3', level: 'N3', jp: '君の言うとおりにやってみよう。', romaji: 'Kimi no iu tōri ni yatte miyō.', vi: 'Hãy thử làm đúng như lời bạn nói xem.', point: '〜とおりに: Làm theo đúng như...' },
  { id: 'n3_10', cat: 'n3', level: 'N3', jp: '旅行のついでに、友達の家に寄った。', romaji: 'Ryokō no tsuide ni, tomodachi no ie ni yotta.', vi: 'Nhân tiện đi du lịch, tôi đã ghé qua nhà bạn.', point: '〜ついでに: Nhân tiện làm A thì làm B.' },

  // --- N2 (Advanced - Business discussions & Complex opinions) ---
  { id: 'n2_01', cat: 'n2', level: 'N2', jp: '彼女が成功したのは、努力の賜物に他ならない。', romaji: 'Kanojo ga seikō shita no wa, doryoku no tamamono ni hoka naranai.', vi: 'Thành công của cô ấy không gì khác chính là kết quả của nỗ lực.', point: '〜に他ならない: Khẳng định chắc chắn "chính là".' },
  { id: 'n2_02', cat: 'n2', level: 'N2', jp: 'このままでは、計画が失敗しかねない。', romaji: 'Kono mama de wa, keikaku ga shippai shikanenai.', vi: 'Nếu cứ tiếp tục thế này, kế hoạch có thể thất bại đó.', point: '〜しかねない: Có khả năng mang lại kết quả xấu.' },
  { id: 'n2_03', cat: 'n2', level: 'N2', jp: '経済の発展に伴って、環境問題も深刻化している。', romaji: 'Keizai no hatten ni tomonatte, kankyō mondai mo shinkokuka shite iru.', vi: 'Cùng với sự phát triển kinh tế, vấn đề môi trường cũng ngày càng nghiêm trọng hơn.', point: '〜に伴って: Sự biến đổi đồng thời.' },
  { id: 'n2_04', cat: 'n2', level: 'N2', jp: '仕事の経験を問わず、やる気のある人を募集します。', romaji: 'Shigoto no keiken o towazu, yaruki no aru hito o boshū shimasu.', vi: 'Tuyển người có nhiệt huyết, không đòi hỏi kinh nghiệm làm việc.', point: '〜を問わず: Không kể, bất kể.' },
  { id: 'n2_05', cat: 'n2', level: 'N2', jp: 'お客様のご要望に応えて、新商品を開発しました。', romaji: 'O-kyakusama no go-yōbō ni kotaete, shin-shōhin o kaihatsu shimashita.', vi: 'Chúng tôi đã phát triển sản phẩm mới để đáp ứng yêu cầu của khách hàng.', point: '〜に応えて: Đáp ứng lại mong muốn, yêu cầu.' },
  { id: 'n2_06', cat: 'n2', level: 'N2', jp: '彼は優れたリーダーであるのみならず、人間的にも素晴らしい。', romaji: 'Kare wa sugureta rīdā de aru nomi narazu, ningenteki ni mo subarashii.', vi: 'Anh ấy không chỉ là một lãnh đạo xuất sắc mà về mặt con người cũng rất tuyệt vời.', point: '〜のみならず: Không chỉ... mà còn.' },
  { id: 'n2_07', cat: 'n2', level: 'N2', jp: 'このプロジェクトは成功させないわけにはいかない。', romaji: 'Kono purojekuto wa seikō sasenai wake ni wa ikanai.', vi: 'Dự án này không thể không thành công (phải thành công).', point: '〜ないわけにはいかない: Bắt buộc phải làm (vì trách nhiệm).' },
  { id: 'n2_08', cat: 'n2', level: 'N2', jp: '会議の途中で退席するとは、失礼極まりない。', romaji: 'Kaigi no tochū de taiseki suru to wa, shitsurei kiwamarinai.', vi: 'Rời đi giữa chừng trong cuộc họp thật là vô cùng bất lịch sự.', point: '〜極まりない: Cực kỳ, vô cùng (thường dùng đánh giá tiêu cực).' },
  { id: 'n2_09', cat: 'n2', level: 'N2', jp: 'あの人の実力から言って、優勝は間違いないだろう。', romaji: 'Ano hito no jitsuryoku kara itte, yūshō wa machigainai darō.', vi: 'Xét về thực lực của người đó, chức vô địch là không thể sai được.', point: '〜から言って: Nhìn từ quan điểm, yếu tố nào đó để đánh giá.' },
  { id: 'n2_10', cat: 'n2', level: 'N2', jp: '失敗を恐れることなく、新しいことに挑戦してください。', romaji: 'Shippai o osoreru koto naku, atarashii koto ni chōsen shite kudasai.', vi: 'Hãy thử thách những điều mới mẻ mà không sợ thất bại.', point: '〜ことなく: Làm B mà không làm A (trang trọng).' },

  // --- N1 (Native-like fluency & Formal speech) ---
  { id: 'n1_01', cat: 'n1', level: 'N1', jp: '政策のいかんによっては、社会全体に多大な影響を及ぼしかねない。', romaji: 'Seisaku no ikan ni yotte wa, shakai zentai ni tadai na eikyō o oyoboshi kanenai.', vi: 'Tùy thuộc vào chính sách, điều này có thể gây ảnh hưởng lớn đến toàn xã hội.', point: '〜のいかんによっては + 〜かねない.' },
  { id: 'n1_02', cat: 'n1', level: 'N1', jp: '理想と現実の間には、越えがたい壁が存在するといわざるを得ない。', romaji: 'Risō to genjitsu no aida ni wa, koegatai kabe ga sonzai suru to iwazaru o enai.', vi: 'Không thể không thừa nhận rằng giữa lý tưởng và thực tế tồn tại một bức tường khó vượt qua.', point: '〜といわざるを得ない: Buộc phải thừa nhận.' },
  { id: 'n1_03', cat: 'n1', level: 'N1', jp: '彼のスピーチは、聞く者を感動させずにはおかなかった。', romaji: 'Kare no supīchi wa, kiku mono o kandō sasezu ni wa okanakatta.', vi: 'Bài phát biểu của anh ấy chắc chắn khiến người nghe phải cảm động.', point: '〜ずにはおかない: Chắc chắn sẽ dẫn đến trạng thái/hành động nào đó.' },
  { id: 'n1_04', cat: 'n1', level: 'N1', jp: 'どんなに困難な状況にあろうとも、決して諦めてはいけない。', romaji: 'Donna ni konnan na jōkyō ni arō tomo, kesshite akiramete wa ikenai.', vi: 'Dù có ở trong hoàn cảnh khó khăn đến đâu, tuyệt đối không được bỏ cuộc.', point: '〜ようとも: Cho dù... thì vẫn.' },
  { id: 'n1_05', cat: 'n1', level: 'N1', jp: 'これは単なる推測にすぎない。', romaji: 'Kore wa tannaru suisoku ni suginai.', vi: 'Đó chỉ đơn thuần là phỏng đoán mà thôi.', point: '〜にすぎない: Chỉ là... không hơn không kém.' },
  { id: 'n1_06', cat: 'n1', level: 'N1', jp: '経験の有無を問わず、意欲的な人材を求む。', romaji: 'Keiken no umu o towazu, iyokuteki na jinzai o motomu.', vi: 'Tuyển dụng nhân tài có nhiệt huyết bất kể có kinh nghiệm hay không.', point: '〜を問わず (trang trọng hơn).' },
  { id: 'n1_07', cat: 'n1', level: 'N1', jp: '社長の決定とあっては、従わざるを得ない。', romaji: 'Shachō no kettei to atte wa, shitagawazaru o enai.', vi: 'Vì là quyết định của giám đốc, nên không thể không tuân theo.', point: '〜とあっては: Đứng trước một tình huống đặc biệt thì phải phản ứng tương ứng.' },
  { id: 'n1_08', cat: 'n1', level: 'N1', jp: '皆様のご期待に沿えるよう、全力を尽くす所存です。', romaji: 'Minasama no go-kitai ni soeru yō, zenryoku o tsukusu shozon desu.', vi: 'Tôi dự định sẽ dốc toàn lực để đáp ứng kỳ vọng của mọi người.', point: '〜所存です: Từ khiêm nhường biểu đạt ý định (Business).' },

  // --- BUSINESS (Workplace, Emails & Keigo) ---
  { id: 'b_01', cat: 'business', level: 'N3', jp: '会議の時間が変更になりましたので、お知らせいたします。', romaji: 'Kaigi no jikan ga henkō ni narimashita node, oshirase itashimasu.', vi: 'Tôi xin thông báo rằng giờ họp đã được thay đổi.', point: 'お知らせいたします: Thông báo một cách lịch sự.' },
  { id: 'b_02', cat: 'business', level: 'N3', jp: 'お世話になっております。添付ファイルをご確認ください。', romaji: 'Osewa ni natte orimasu. Tenpu fairu o go-kakunin kudasai.', vi: 'Cảm ơn sự hỗ trợ thường xuyên của bạn. Vui lòng kiểm tra file đính kèm.', point: 'お世話になっております: Lời chào chuẩn trong Email/Điện thoại.' },
  { id: 'b_03', cat: 'business', level: 'N2', jp: 'ご多忙のところ恐れ入りますが、ご確認いただけますでしょうか。', romaji: 'Go-tabō no tokoro osoreirimasu ga, go-kakunin itadakemasu deshō ka.', vi: 'Xin lỗi vì làm phiền lúc bạn đang bận, bạn có thể xác nhận giúp tôi được không?', point: 'ご多忙のところ恐れ入りますが: Cushion word rất lịch sự.' },
  { id: 'b_04', cat: 'business', level: 'N2', jp: 'ご検討のほど、よろしくお願い申し上げます。', romaji: 'Go-kentō no hodo, yoroshiku onegai mōshiagemasu.', vi: 'Kính mong bạn xem xét và cân nhắc.', point: '〜のほど: Làm câu nói mềm mỏng hơn. Kết thư chuẩn.' },
  { id: 'b_05', cat: 'business', level: 'N3', jp: '大変申し訳ございません。早急に対応いたします。', romaji: 'Taihen mōshiwake gozaimasen. Sōkyū ni taiō itashimasu.', vi: 'Tôi thành thật xin lỗi. Tôi sẽ xử lý ngay lập tức.', point: 'Xin lỗi + hành động khắc phục.' },
  { id: 'b_06', cat: 'business', level: 'N2', jp: 'ご連絡が遅くなり、大変失礼いたしました。', romaji: 'Go-renraku ga osoku nari, taihen shitsurei itashimashita.', vi: 'Tôi vô cùng xin lỗi vì đã phản hồi chậm trễ.', point: 'Lời xin lỗi phổ biến trong business email.' },
  { id: 'b_07', cat: 'business', level: 'N2', jp: 'ご不明な点がございましたら、お気軽にお申し付けください。', romaji: 'Go-fumei na ten ga gozaimashita ra, okigaru ni o-mōshitsuke kudasai.', vi: 'Nếu có bất kỳ điểm nào chưa rõ, xin đừng ngại báo cho tôi.', point: 'Thể hiện sự sẵn sàng hỗ trợ khách hàng/đối tác.' },
  { id: 'b_08', cat: 'business', level: 'N3', jp: '承知いたしました。期日までには必ず提出いたします。', romaji: 'Shōchi itashimashita. Kijitsu made ni wa kanarazu teishutsu itashimasu.', vi: 'Tôi đã hiểu. Tôi nhất định sẽ nộp trước hạn chót.', point: '承知いたしました: Hiểu rõ (khiêm nhường ngữ).' },
  { id: 'b_09', cat: 'business', level: 'N2', jp: '本日はお時間を頂戴し、誠にありがとうございました。', romaji: 'Honjitsu wa o-jikan o chōdai shi, makoto ni arigatō gozaimashita.', vi: 'Rất cảm ơn bạn đã dành thời gian cho tôi hôm nay.', point: 'お時間を頂戴する: Nhận thời gian của đối phương.' },
  { id: 'b_10', cat: 'business', level: 'N1', jp: '誠に勝手ながら、明日は休業とさせていただきます。', romaji: 'Makoto ni katte nagara, ashita wa kyūgyō to sasete itadakimasu.', vi: 'Thật đường đột nhưng chúng tôi xin phép nghỉ làm việc vào ngày mai.', point: '誠に勝手ながら: Lời mào đầu khi tự ý quyết định việc gây bất tiện.' },

  // --- DAILY (Survival & Casual interactions) ---
  { id: 'd_01', cat: 'daily', level: 'N4', jp: 'すみません、この近くにコンビニはありますか？', romaji: 'Sumimasen, kono chikaku ni konbini wa arimasu ka?', vi: 'Xin lỗi, gần đây có cửa hàng tiện lợi không?', point: 'Hỏi đường cơ bản.' },
  { id: 'd_02', cat: 'daily', level: 'N4', jp: 'もう少しゆっくり話していただけますか？', romaji: 'Mō sukoshi yukkuri hanashite itadakemasu ka?', vi: 'Bạn có thể nói chậm hơn một chút không?', point: 'Yêu cầu lặp lại lịch sự.' },
  { id: 'd_03', cat: 'daily', level: 'N3', jp: '今日は少し疲れているので、早めに帰らせてください。', romaji: 'Kyō wa sukoshi tsukarete iru node, hayame ni kaerasete kudasai.', vi: 'Hôm nay tôi hơi mệt, xin phép cho tôi về sớm.', point: '〜させてください: Xin phép.' },
  { id: 'd_04', cat: 'daily', level: 'N3', jp: '来週の予定はどうなっていますか？', romaji: 'Raishū no yotei wa dō natte imasu ka?', vi: 'Kế hoạch tuần tới như thế nào rồi?', point: 'Hỏi tiến độ/kế hoạch.' },
  { id: 'd_05', cat: 'daily', level: 'N2', jp: 'せっかくですが、今回は遠慮させていただきます。', romaji: 'Sekkaku desu ga, konkai wa enryo sasete itadakimasu.', vi: 'Dù bạn đã có nhã ý, nhưng lần này tôi xin phép từ chối.', point: 'せっかくですが: Từ chối khéo léo.' },
  { id: 'd_06', cat: 'daily', level: 'N5', jp: 'お会計をお願いします。', romaji: 'O-kaikei o onegaishimasu.', vi: 'Cho tôi tính tiền nhé.', point: 'Sử dụng tại nhà hàng/quán ăn.' },
  { id: 'd_07', cat: 'daily', level: 'N5', jp: 'クレジットカードは使えますか？', romaji: 'Kurejitto kādo wa tsukaemasu ka?', vi: 'Tôi có thể dùng thẻ tín dụng không?', point: 'Hỏi phương thức thanh toán.' },
  { id: 'd_08', cat: 'daily', level: 'N4', jp: '写真を撮ってもらえませんか？', romaji: 'Shashin o totte moraemasen ka?', vi: 'Bạn có thể chụp ảnh giúp tôi được không?', point: 'Nhờ vả lịch sự.' },
  { id: 'd_09', cat: 'daily', level: 'N4', jp: 'アレルギーがあるので、卵を抜いてください。', romaji: 'Arerugī ga aru node, tamago o nuite kudasai.', vi: 'Vì tôi bị dị ứng, xin hãy bỏ trứng ra.', point: 'Yêu cầu đặc biệt khi gọi món.' },
  { id: 'd_10', cat: 'daily', level: 'N3', jp: 'お口に合うといいのですが。', romaji: 'O-kuchi ni au to ii no desu ga.', vi: 'Hi vọng là nó hợp khẩu vị của bạn.', point: 'Câu nói khi tặng đồ ăn/mời khách ăn.' }
];

const outPath = path.resolve('./src/data/shadowing.json');
fs.writeFileSync(outPath, JSON.stringify(SHADOWING_FULL, null, 2));
const size = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✅ shadowing.json: ${size} KB — ${SHADOWING_FULL.length} câu shadowing`);

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
  '桃太郎は 村の人々にも 宝物を 分けてあげて、みんなで いつまでも 幸せに 暮らしましたとさ。': 'Momotarō chia báu vật cho bà con dân làng, và tất cả mọi người từ đó sống êm đềm hạnh phúc mãi mãi.',

  // --- CHÀNG ĐÁNH CÁ URASHIMA TARŌ (浦島太郎) ---
  'むかし、浦島太郎という 心の優しい 漁師が いました。': 'Ngày xưa, có một chàng đánh cá nhân hậu tên là Urashima Tarō.',
  'ある日、太郎が 浜辺を 歩いていると、子供たちが 小さな 亀を いじめていました。': 'Một ngày nọ, khi Tarō đang đi dạo trên bờ biển, chàng thấy lũ trẻ con đang bắt nạt một chú rùa nhỏ.',
  '「亀を いじめては いけないよ。」': '「Đừng bắt nạt chú rùa chứ!」',
  '太郎は お金を 払って 亀を 助け、海へ 逃がしてあげました。': 'Tarō bỏ tiền ra chuộc chú rùa và thả chú về với biển khơi.',
  '数日後、太郎が 釣りを していると、大きな 亀が やってきました。': 'Vài ngày sau, khi Tarō đang buông câu, một chú rùa to lớn bơi đến.',
  '「太郎さん、助けてくれた お礼に、竜宮城（りゅうぐうじょう）へ ご案内します。」': '「Anh Tarō ơi, để đền đáp ơn cứu mạng, tôi xin đưa anh tới Cung điện Rồng Ryūgū-jō!」',
  '太郎は 亀の 背中に 乗って、海の 底の 竜宮城へ 行きました。': 'Tarō cưỡi lên lưng rùa, lặn xuống đáy biển đến Cung điện Rồng.',
  '竜宮城では、美しい 乙姫（おとひめ）様が 太郎を 歓迎しました。': 'Tại Cung điện Rồng, nàng công chúa Otohime xinh đẹp nồng nhiệt chào đón Tarō.',
  '魚たちの 楽しい 踊りを 見て、美味しい ごちそうを 食べました。': 'Chàng được xem các loài cá múa hát vui nhộn và thưởng thức những sơn hào hải vị tuyệt ngon.',
  '夢のような 日々が 過ぎ、太郎は 村の お母さんが 心配になりました。': 'Những ngày thần tiên như mơ trôi qua, Tarō bắt đầu thấy lo lắng cho người mẹ già ở làng quê.',
  '「そろそろ 家へ 帰ります。」': '「Tôi xin phép phải trở về nhà rồi.」',
  '乙姫様は「決して 開けては なりません」と 言って、「玉手箱（たまてばこ）」を くれました。': 'Công chúa Otohime trao cho chàng chiếc hộp ngọc Tamatebako và dặn: “Tuyệt đối chàng không được mở ra nhé!”',
  '太郎が 村へ 帰ると、知っている 人は 誰も いませんでした。': 'Khi Tarō về đến làng, chàng chẳng thấy một ai quen biết.',
  'なんと、地上では 三百年も 経っていたのです。': 'Hóa ra, ở trên cõi trần gian đã ba trăm năm trôi qua.',
  '困った 太郎が 玉手箱を 開けると、白い 煙が もくもくと 出て、太郎は 一瞬で 白髪の おじいさんに なってしまいました。': 'Bối rối và hoang mang, Tarō mở chiếc hộp ngọc ra, khói trắng nghi ngút bốc lên, chàng chớp mắt biến thành một ông lão râu tóc bạc phơ.',

  // --- NÀNG TIÊN ỐNG TRE (かぐや姫 - KAGUYA-HIME) ---
  'むかし、竹を取る おじいさんが いました。': 'Ngày xửa ngày xưa, có một ông lão chuyên nghề đốn tre.',
  'ある日、光り輝く 竹を 見つけました。': 'Một ngày nọ, ông tìm thấy một thân tre phát ra ánh sáng lung linh rực rỡ.',
  '切ってみると、中から 小さくて 可愛い 女の子が 出てきました。': 'Khi chặt thân tre ra, từ bên trong bước ra một bé gái nhỏ nhắn, vô cùng đáng yêu.',
  'おじいさんと おばあさんは「かぐや姫」と 名付け、大切に 育てました。': 'Ông lão và bà lão đặt tên bé là Kaguya-hime (Nàng Tiên Ống Tre) và hết lòng chăm sóc, yêu thương.',
  'かぐや姫は すくすくと 育ち、とても 美しい 娘に なりました。': 'Kaguya-hime lớn nhanh như thổi, trở thành một thiếu nữ dung mạo tuyệt trần.',
  'たくさんの 貴族が「結婚してください」と 来ましたが、かぐや姫は 難しい 宝物を 頼んで、みんな 断りました。': 'Rất nhiều chàng quý tộc tới ngỏ lời cầu hôn, nhưng nàng đưa ra những yêu cầu báu vật khó vô cùng và từ chối tất cả.',
  'やがて、かぐや姫は 月を 見て 泣くように なりました。': 'Thời gian trôi qua, Kaguya-hime thường ngắm trăng tròn rồi rơi nước mắt.',
  '「私は 実は 月の 国の 人間です。次の 満月の 夜に、月へ 帰らなければ なりません。」': '「Thực ra con là người của Vương quốc Mặt Trăng. Vào đêm trăng rằm tới, con phải trở về đó.」',
  '満月の 夜、空から 雲に 乗った 天人たちが 迎えに 来ました。': 'Vào đêm trăng rằm, từ trên mây cao những tiên nhân cưỡi mây hạ xuống đón nàng.',
  'おじいさんたちは 悲しみましたが、止めることは できませんでした。': 'Hai ông bà đau lòng khôn xiết, nhưng không cách nào giữ nàng lại được.',
  'かぐや姫は 感謝の 手紙を 残し、静かに 月へと 帰っていきました。': 'Kaguya-hime để lại bức thư tạ ơn chân thành, rồi lặng lẽ bay về cung trăng.',

  // --- NÀNG SẾU ĐỀN ƠN (鶴の恩返し - TSURU NO ONGAESHI) ---
  'ある 冬の日、貧しい 若者が 罠に かかった 鶴を 助けてあげました。': 'Vào một ngày mùa đông, một chàng trai nghèo giải thoát cho một con hạc trắng dính bẫy.',
  'その夜、美しい 娘が 若者の 家を 訪ねてきました。': 'Tối hôm đó, một thiếu nữ xinh đẹp bất ngờ tìm đến nhà chàng trai.',
  '「道に 迷いました。今夜 泊めてください。」': '「Em bị lạc đường, xin chàng cho em tá túc đêm nay.」',
  '娘は 若者の 家に 留まり、やがて 二人は 夫婦に なりました。': 'Nàng ở lại căn nhà của chàng trai, rồi chẳng bao lâu sau hai người nên duyên vợ chồng.',
  '娘は「機（はた）を 織ります。織っている 間は、決して 部屋を 見ないでください」と 約束させました。': 'Nàng bảo: “Thiếp sẽ dệt vải. Trong lúc dệt, chàng tuyệt đối không được nhìn vào phòng nhé!”',
  '部屋からは カタン、コトンと 綺麗な 音が しました。': 'Từ trong phòng phát ra tiếng dệt cửi lách cách nhịp nhàng nghe thật êm tai.',
  '出来上がった 布は、息を のむほど 美しい 織物でした。': 'Tấm vải dệt xong đẹp đến nín thở, lấp lánh như dát ngọc.',
  '布は 町で とても 高く 売れました。': 'Tấm vải đem ra chợ thị trấn bán được giá rất cao.',
  'しかし、若者は 好奇心に 負けて、戸の 隙間から 部屋を のぞいてしまいました。': 'Thế nhưng, vì tò mò không kìm được, chàng trai hé mắt nhìn qua khe cửa vào trong phòng.',
  '中に いたのは、娘ではなく、自分の 羽を 抜いて 織っている 一羽の 鶴でした。': 'Bên trong chẳng phải là cô nương, mà là một con hạc trắng đang tự nhổ lông cánh của mình để dệt nên gấm vóc.',
  '「正体を 見られました。もう ここには いられません。」': '「Chàng đã thấy hình hài thật của thiếp rồi. Thiếp không thể ở lại đây được nữa.」',
  '鶴は 悲しそうに 鳴きながら、夕暮れの 空へ 飛び去っていきました。': 'Con hạc cất tiếng kêu nghẹn ngào thảm thiết, rồi vỗ cánh bay vút vào bầu trời chiều hoàng hôn.',

  // --- CÁC VỊ BỒ TÁT ĐỘI NÓN (笠地蔵 - KASAJIZO) ---
  'むかしむかし、ある山里に、貧しいけれど 心の 優しい おじいさんと おばあさんが すんでいました。': 'Ngày xửa ngày xưa, ở một ngôi làng ven núi, có hai ông bà nghèo khó nhưng tấm lòng vô cùng nhân từ.',
  '大晦日の 日、お正月のお餅を買うお金がありませんでした。': 'Vào ngày Ba mươi Tết, ông bà chẳng có đồng nào để mua bánh mochi mừng năm mới.',
  'おじいさんは 作った 五つの 菅笠（すげがさ）を 売りに 町へ 行きましたが、雪が 激しく 降り、笠は 一つも 売れませんでした。': 'Ông lão bèn đem 5 chiếc nón rơm tự đan ra chợ bán, nhưng tuyết rơi mù mịt, chẳng bán được chiếc nón nào.',
  'とぼとぼと 帰る 道の 途中で、六体の お地蔵様が 雪を かぶって 寒そうに 並んで 立っていました。': 'Trên con đường lủi thủi trở về, ông thấy 6 bức tượng Phật Jizō đứng thành hàng giữa trời tuyết lạnh giá.',
  '「ああ、お地蔵様、冷たい 雪を かぶって お気の毒に。」': '「Chao ôi, các ngài Jizō đội tuyết lạnh thế này, tội nghiệp quá!」',
  'おじいさんは、売れ残った 五つの 笠を お地蔵様たちの 頭に かぶせました。': 'Ông lão đem 5 chiếc nón ế đội lên đầu cho các vị tượng Phật.',
  'しかし、笠が 一つ 足りません。おじいさんは 自分の 古い 笠を 脱いで、最後の お地蔵様に かぶせました。': 'Nhưng vẫn thiếu mất một chiếc, ông bèn cởi chiếc nón rơm cũ kỹ của chính mình đội cho bức tượng cuối cùng.',
  '手ぬぐいを 頭に 巻いて 帰ってきた おじいさんの 話を 聞いて、おばあさんは にっこり 笑いました。': 'Thấy ông lão chỉ quấn khăn vải trên đầu về nhà và nghe ông kể lại, bà lão mỉm cười đôn hậu.',
  '「それは 良いことを なさいましたね。お餅は なくても、温かい お粥が あれば 幸せですよ。」': '「Ông làm thế là rất phải đạo. Dù không có bánh Tết, chỉ cần có bát cháo nóng là chúng ta hạnh phúc rồi!」',
  'その 夜更けのことでした。': 'Đêm khuya thanh vắng hôm đó...',
  '遠くから「よいしょ、よいしょ。笠売りの じいさんの 家は どこだ」と 不思議な 歌声が 聞こえてきました。': 'Từ đằng xa vang lên tiếng hát lạ lùng: “Hò dô ta, hò dô ta! Nhà ông lão bán nón rơm ở đâu nào!”',
  'ドサリ！ と 重い 音が して 静かに なりました。': 'Bịch một tiếng thật lớn! Rồi mọi thứ trở lại tĩnh mịch.',
  '戸を 開けてみると、そこには 米俵や お餅、野菜、そして 黄金の 財宝が 山のように 積まれていました。': 'Khi mở cửa ra, trước sân chất thành núi bao gạo, bánh mochi, rau củ và vô vàn châu báu vàng ròng.',
  '見ると、笠を かぶった 六人の お地蔵様が、静かに 雪道を 去っていく 後ろ姿が 見えました。': 'Nhìn ra xa, bóng lưng 6 vị Phật Jizō đội nón rơm đang lặng lẽ dạo bước khuất dần trên con đường tuyết trắng.'
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


// Tạo khóa băm duy nhất cho câu (tránh xung đột 32 ký tự đầu giữa các truyện cổ tích)
const getSentenceHashKey = (norm) => {
  let hash = 5381;
  for (let i = 0; i < norm.length; i++) {
    hash = ((hash << 5) + hash) + norm.charCodeAt(i);
    hash |= 0;
  }
  return `omni_vi_${Math.abs(hash)}_${norm.length}`;
};

// Kiểm tra bản dịch trong Cache
export const getCachedTranslation = (rawSentence) => {
  if (!rawSentence) return '';
  const norm = normalizeJpSentence(rawSentence);

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

  // 3. Kiểm tra localStorage với khóa băm
  try {
    const cacheKey = getSentenceHashKey(norm);
    const saved = localStorage.getItem(cacheKey);
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
    const cacheKey = getSentenceHashKey(norm);
    localStorage.setItem(cacheKey, viTranslation);
  } catch (e) {}
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. DỊCH NHANH THEO LÔ (BATCH AUTO-TRANSLATE VIA SPEED ENDPOINT)
// ══════════════════════════════════════════════════════════════════════════════
export const batchTranslateSentences = async (sentences) => {
  if (!sentences || sentences.length === 0) return [];

  // Lọc ra các câu chưa có bản dịch
  const results = new Array(sentences.length).fill('');
  const missing = [];

  sentences.forEach((st, idx) => {
    const cached = getCachedTranslation(st);
    if (cached) {
      results[idx] = cached;
    } else {
      missing.push({ idx, text: st.trim() });
    }
  });

  if (missing.length === 0) {
    return results;
  }

  try {
    // Dịch song song theo từng đợt 5 câu để bảo đảm độ chính xác 100% không bao giờ bị lệch dòng
    const CONCURRENCY = 5;
    for (let c = 0; c < missing.length; c += CONCURRENCY) {
      const chunk = missing.slice(c, c + CONCURRENCY);
      await Promise.all(chunk.map(async (item) => {
        try {
          const res = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(item.text)}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data[0]) {
              let vi = '';
              data[0].forEach(part => {
                if (part[0]) vi += part[0];
              });
              vi = vi.trim();
              results[item.idx] = vi;
              setCachedTranslation(sentences[item.idx], vi);
            }
          }
        } catch (err) {
          console.warn('[StoryTranslationService] Lỗi dịch câu:', item.text, err);
        }
      }));
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

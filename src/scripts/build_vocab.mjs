import fs from 'fs';
import path from 'path';

// Tạo danh sách từ vựng thật đa dạng (Sample JLPT N5-N1)
const REAL_VOCAB = [
  // N5 (20 từ)
  { word: '私', reading: 'わたし', vi: 'Tôi', level: 'N5', type: 'Danh từ', examples: ['私は学生です。(Tôi là học sinh.)'] },
  { word: '食べる', reading: 'たべる', vi: 'Ăn', level: 'N5', type: 'Động từ', examples: ['ご飯を食べる。(Ăn cơm.)'] },
  { word: '飲む', reading: 'のむ', vi: 'Uống', level: 'N5', type: 'Động từ', examples: ['水を飲む。(Uống nước.)'] },
  { word: '行く', reading: 'いく', vi: 'Đi', level: 'N5', type: 'Động từ', examples: ['学校へ行く。(Đi đến trường.)'] },
  { word: '来る', reading: 'くる', vi: 'Đến', level: 'N5', type: 'Động từ', examples: ['友達が来る。(Bạn đến.)'] },
  { word: '大きい', reading: 'おおきい', vi: 'To, lớn', level: 'N5', type: 'Tính từ đuôi い', examples: ['大きい犬。(Con chó lớn.)'] },
  { word: '小さい', reading: 'ちいさい', vi: 'Nhỏ, bé', level: 'N5', type: 'Tính từ đuôi い', examples: ['小さい猫。(Con mèo nhỏ.)'] },
  { word: '新しい', reading: 'あたらしい', vi: 'Mới', level: 'N5', type: 'Tính từ đuôi い', examples: ['新しい車。(Xe mới.)'] },
  { word: '古い', reading: 'ふるい', vi: 'Cũ', level: 'N5', type: 'Tính từ đuôi い', examples: ['古い本。(Sách cũ.)'] },
  { word: '良い', reading: 'いい / よい', vi: 'Tốt', level: 'N5', type: 'Tính từ đuôi い', examples: ['天気がいい。(Thời tiết tốt.)'] },
  { word: '悪い', reading: 'わるい', vi: 'Xấu, tồi', level: 'N5', type: 'Tính từ đuôi い', examples: ['気分が悪い。(Thấy khó chịu.)'] },
  { word: '暑い', reading: 'あつい', vi: 'Nóng (thời tiết)', level: 'N5', type: 'Tính từ đuôi い', examples: ['今日は暑い。(Hôm nay nóng.)'] },
  { word: '熱い', reading: 'あつい', vi: 'Nóng (nhiệt độ)', level: 'N5', type: 'Tính từ đuôi い', examples: ['熱いお茶。(Trà nóng.)'] },
  { word: '寒い', reading: 'さむい', vi: 'Lạnh (thời tiết)', level: 'N5', type: 'Tính từ đuôi い', examples: ['冬は寒い。(Mùa đông lạnh.)'] },
  { word: '冷たい', reading: 'つめたい', vi: 'Lạnh (cảm giác)', level: 'N5', type: 'Tính từ đuôi い', examples: ['冷たい水。(Nước lạnh.)'] },
  { word: '高い', reading: 'たかい', vi: 'Cao, đắt', level: 'N5', type: 'Tính từ đuôi い', examples: ['背が高い。(Dáng cao.)'] },
  { word: '安い', reading: 'やすい', vi: 'Rẻ', level: 'N5', type: 'Tính từ đuôi い', examples: ['安い靴。(Giày rẻ.)'] },
  { word: '好き', reading: 'すき', vi: 'Thích', level: 'N5', type: 'Tính từ đuôi な', examples: ['音楽が好き。(Thích âm nhạc.)'] },
  { word: '嫌い', reading: 'きらい', vi: 'Ghét', level: 'N5', type: 'Tính từ đuôi な', examples: ['野菜が嫌い。(Ghét rau.)'] },
  { word: '静か', reading: 'しずか', vi: 'Yên tĩnh', level: 'N5', type: 'Tính từ đuôi な', examples: ['静かな部屋。(Căn phòng yên tĩnh.)'] },

  // N4 (20 từ)
  { word: '約束', reading: 'やくそく', vi: 'Lời hứa, cuộc hẹn', level: 'N4', type: 'Danh từ', examples: ['約束を守る。(Giữ lời hứa.)'] },
  { word: '案内', reading: 'あんない', vi: 'Hướng dẫn', level: 'N4', type: 'Danh từ/Động từ', examples: ['町を案内する。(Hướng dẫn tham quan thành phố.)'] },
  { word: '準備', reading: 'じゅんび', vi: 'Chuẩn bị', level: 'N4', type: 'Danh từ/Động từ', examples: ['旅行の準備。(Chuẩn bị du lịch.)'] },
  { word: '経験', reading: 'けいけん', vi: 'Kinh nghiệm', level: 'N4', type: 'Danh từ', examples: ['経験が豊富だ。(Giàu kinh nghiệm.)'] },
  { word: '事故', reading: 'じこ', vi: 'Tai nạn', level: 'N4', type: 'Danh từ', examples: ['交通事故。(Tai nạn giao thông.)'] },
  { word: '地震', reading: 'じしん', vi: 'Động đất', level: 'N4', type: 'Danh từ', examples: ['地震が起きる。(Xảy ra động đất.)'] },
  { word: '泥棒', reading: 'どろぼう', vi: 'Kẻ trộm', level: 'N4', type: 'Danh từ', examples: ['泥棒に入る。(Bị trộm vào nhà.)'] },
  { word: '警察', reading: 'けいさつ', vi: 'Cảnh sát', level: 'N4', type: 'Danh từ', examples: ['警察を呼ぶ。(Gọi cảnh sát.)'] },
  { word: '社長', reading: 'しゃちょう', vi: 'Giám đốc', level: 'N4', type: 'Danh từ', examples: ['社長に会う。(Gặp giám đốc.)'] },
  { word: '会議', reading: 'かいぎ', vi: 'Cuộc họp', level: 'N4', type: 'Danh từ', examples: ['会議に出席する。(Tham dự cuộc họp.)'] },
  { word: '調べる', reading: 'しらべる', vi: 'Điều tra, tìm hiểu', level: 'N4', type: 'Động từ', examples: ['辞書で調べる。(Tra từ điển.)'] },
  { word: '知らせる', reading: 'しらせる', vi: 'Thông báo', level: 'N4', type: 'Động từ', examples: ['みんなに知らせる。(Thông báo cho mọi người.)'] },
  { word: '確かめる', reading: 'たしかめる', vi: 'Xác nhận', level: 'N4', type: 'Động từ', examples: ['事実を確かめる。(Xác nhận sự thật.)'] },
  { word: '遅れる', reading: 'おくれる', vi: 'Trễ, muộn', level: 'N4', type: 'Động từ', examples: ['学校に遅れる。(Trễ học.)'] },
  { word: '急ぐ', reading: 'いそぐ', vi: 'Vội vàng, khẩn trương', level: 'N4', type: 'Động từ', examples: ['急いで行く。(Đi vội.)'] },
  { word: '払う', reading: 'はらう', vi: 'Trả tiền', level: 'N4', type: 'Động từ', examples: ['お金を払う。(Trả tiền.)'] },
  { word: '思い出す', reading: 'おもいだす', vi: 'Nhớ lại', level: 'N4', type: 'Động từ', examples: ['昔のことを思い出す。(Nhớ lại chuyện ngày xưa.)'] },
  { word: '複雑', reading: 'ふくざつ', vi: 'Phức tạp', level: 'N4', type: 'Tính từ đuôi な', examples: ['複雑な問題。(Vấn đề phức tạp.)'] },
  { word: '邪魔', reading: 'じゃま', vi: 'Cản trở, phiền', level: 'N4', type: 'Tính từ đuôi な', examples: ['邪魔しないで。(Đừng làm phiền.)'] },
  { word: '危険', reading: 'きけん', vi: 'Nguy hiểm', level: 'N4', type: 'Tính từ đuôi な', examples: ['ここは危険です。(Chỗ này nguy hiểm.)'] },

  // N3 (30 từ - Core focus)
  { word: '変更', reading: 'へんこう', vi: 'Sự thay đổi', level: 'N3', type: 'Danh từ/Động từ', examples: ['予定を変更する。(Thay đổi dự định.)'] },
  { word: '確認', reading: 'かくにん', vi: 'Xác nhận', level: 'N3', type: 'Danh từ/Động từ', examples: ['メールを確認する。(Xác nhận email.)'] },
  { word: '提出', reading: 'ていしゅつ', vi: 'Nộp, đệ trình', level: 'N3', type: 'Danh từ/Động từ', examples: ['レポートを提出する。(Nộp báo cáo.)'] },
  { word: '期限', reading: 'きげん', vi: 'Thời hạn', level: 'N3', type: 'Danh từ', examples: ['期限を守る。(Giữ đúng hạn.)'] },
  { word: '書類', reading: 'しょるい', vi: 'Tài liệu, giấy tờ', level: 'N3', type: 'Danh từ', examples: ['書類を整理する。(Sắp xếp tài liệu.)'] },
  { word: '契約', reading: 'けいやく', vi: 'Hợp đồng', level: 'N3', type: 'Danh từ/Động từ', examples: ['契約を結ぶ。(Ký hợp đồng.)'] },
  { word: '条件', reading: 'じょうけん', vi: 'Điều kiện', level: 'N3', type: 'Danh từ', examples: ['条件に合う。(Phù hợp điều kiện.)'] },
  { word: '営業', reading: 'えいぎょう', vi: 'Kinh doanh, sale', level: 'N3', type: 'Danh từ', examples: ['営業部。(Phòng kinh doanh.)'] },
  { word: '予算', reading: 'よさん', vi: 'Ngân sách', level: 'N3', type: 'Danh từ', examples: ['予算が足りない。(Không đủ ngân sách.)'] },
  { word: '利益', reading: 'りえき', vi: 'Lợi nhuận', level: 'N3', type: 'Danh từ', examples: ['利益を出す。(Tạo ra lợi nhuận.)'] },
  { word: '目標', reading: 'もくひょう', vi: 'Mục tiêu', level: 'N3', type: 'Danh từ', examples: ['目標を達成する。(Đạt được mục tiêu.)'] },
  { word: '努力', reading: 'どりょく', vi: 'Nỗ lực', level: 'N3', type: 'Danh từ/Động từ', examples: ['努力を重ねる。(Không ngừng nỗ lực.)'] },
  { word: '成功', reading: 'せいこう', vi: 'Thành công', level: 'N3', type: 'Danh từ/Động từ', examples: ['実験に成功する。(Thử nghiệm thành công.)'] },
  { word: '失敗', reading: 'しっぱい', vi: 'Thất bại', level: 'N3', type: 'Danh từ/Động từ', examples: ['失敗を恐れない。(Không sợ thất bại.)'] },
  { word: '解決', reading: 'かいけつ', vi: 'Giải quyết', level: 'N3', type: 'Danh từ/Động từ', examples: ['問題を解決する。(Giải quyết vấn đề.)'] },
  { word: '原因', reading: 'げんいん', vi: 'Nguyên nhân', level: 'N3', type: 'Danh từ', examples: ['原因を調べる。(Điều tra nguyên nhân.)'] },
  { word: '結果', reading: 'けっか', vi: 'Kết quả', level: 'N3', type: 'Danh từ', examples: ['良い結果が出る。(Có kết quả tốt.)'] },
  { word: '影響', reading: 'えいきょう', vi: 'Ảnh hưởng', level: 'N3', type: 'Danh từ/Động từ', examples: ['悪影響を与える。(Gây ảnh hưởng xấu.)'] },
  { word: '効果', reading: 'こうか', vi: 'Hiệu quả', level: 'N3', type: 'Danh từ', examples: ['薬の効果。(Hiệu quả của thuốc.)'] },
  { word: '情報', reading: 'じょうほう', vi: 'Thông tin', level: 'N3', type: 'Danh từ', examples: ['情報を集める。(Thu thập thông tin.)'] },
  { word: '技術', reading: 'ぎじゅつ', vi: 'Kỹ thuật', level: 'N3', type: 'Danh từ', examples: ['最新の技術。(Kỹ thuật mới nhất.)'] },
  { word: '発展', reading: 'はってん', vi: 'Phát triển', level: 'N3', type: 'Danh từ/Động từ', examples: ['経済が発展する。(Kinh tế phát triển.)'] },
  { word: '減る', reading: 'へる', vi: 'Giảm', level: 'N3', type: 'Động từ', examples: ['人口が減る。(Dân số giảm.)'] },
  { word: '増える', reading: 'ふえる', vi: 'Tăng', level: 'N3', type: 'Động từ', examples: ['体重が増える。(Tăng cân.)'] },
  { word: '比べる', reading: 'くらべる', vi: 'So sánh', level: 'N3', type: 'Động từ', examples: ['値段を比べる。(So sánh giá.)'] },
  { word: '似る', reading: 'にる', vi: 'Giống', level: 'N3', type: 'Động từ', examples: ['母親に似ている。(Giống mẹ.)'] },
  { word: '確か', reading: 'たしか', vi: 'Chắc chắn, hình như', level: 'N3', type: 'Tính từ/Phó từ', examples: ['確かな情報。(Thông tin chắc chắn.)'] },
  { word: '適当', reading: 'てきとう', vi: 'Thích hợp', level: 'N3', type: 'Tính từ đuôi な', examples: ['適当な言葉。(Từ ngữ thích hợp.)'] },
  { word: '当然', reading: 'とうぜん', vi: 'Đương nhiên', level: 'N3', type: 'Tính từ đuôi な', examples: ['怒るのも当然だ。(Việc tức giận là đương nhiên.)'] },
  { word: '突然', reading: 'とつぜん', vi: 'Đột nhiên', level: 'N3', type: 'Phó từ', examples: ['突然雨が降った。(Đột nhiên trời mưa.)'] },

  // N2 (20 từ)
  { word: '把握', reading: 'はあく', vi: 'Nắm bắt', level: 'N2', type: 'Danh từ/Động từ', examples: ['状況を把握する。(Nắm bắt tình hình.)'] },
  { word: '徹底', reading: 'てってい', vi: 'Triệt để', level: 'N2', type: 'Danh từ/Động từ', examples: ['ルールの徹底。(Quán triệt luật lệ.)'] },
  { word: '妥協', reading: 'だきょう', vi: 'Thỏa hiệp', level: 'N2', type: 'Danh từ/Động từ', examples: ['妥協を許さない。(Không cho phép thỏa hiệp.)'] },
  { word: '貢献', reading: 'こうけん', vi: 'Cống hiến', level: 'N2', type: 'Danh từ/Động từ', examples: ['社会に貢献する。(Cống hiến cho xã hội.)'] },
  { word: '矛盾', reading: 'むじゅん', vi: 'Mâu thuẫn', level: 'N2', type: 'Danh từ/Động từ', examples: ['話が矛盾している。(Câu chuyện có mâu thuẫn.)'] },
  { word: '考慮', reading: 'こうりょ', vi: 'Xem xét, cân nhắc', level: 'N2', type: 'Danh từ/Động từ', examples: ['条件を考慮に入れる。(Đưa điều kiện vào xem xét.)'] },
  { word: '対象', reading: 'たいしょう', vi: 'Đối tượng', level: 'N2', type: 'Danh từ', examples: ['調査の対象。(Đối tượng điều tra.)'] },
  { word: '比較', reading: 'ひかく', vi: 'So sánh', level: 'N2', type: 'Danh từ/Động từ', examples: ['AとBを比較する。(So sánh A và B.)'] },
  { word: '傾向', reading: 'けいこう', vi: 'Khuynh hướng', level: 'N2', type: 'Danh từ', examples: ['減少の傾向にある。(Có khuynh hướng giảm.)'] },
  { word: '割合', reading: 'わりあい', vi: 'Tỷ lệ', level: 'N2', type: 'Danh từ', examples: ['高い割合を占める。(Chiếm tỷ lệ cao.)'] },
  { word: '重視', reading: 'じゅうし', vi: 'Coi trọng', level: 'N2', type: 'Danh từ/Động từ', examples: ['経験を重視する。(Coi trọng kinh nghiệm.)'] },
  { word: '無視', reading: 'むし', vi: 'Phớt lờ', level: 'N2', type: 'Danh từ/Động từ', examples: ['警告を無視する。(Phớt lờ cảnh báo.)'] },
  { word: '納得', reading: 'なっとく', vi: 'Đồng ý, thấu hiểu', level: 'N2', type: 'Danh từ/Động từ', examples: ['納得のいく説明。(Giải thích thỏa đáng.)'] },
  { word: '誤解', reading: 'ごかい', vi: 'Hiểu lầm', level: 'N2', type: 'Danh từ/Động từ', examples: ['誤解を招く。(Gây hiểu lầm.)'] },
  { word: '覚悟', reading: 'かくご', vi: 'Kiên quyết, sẵn sàng', level: 'N2', type: 'Danh từ/Động từ', examples: ['危険は覚悟の上だ。(Đã lường trước nguy hiểm.)'] },
  { word: '慎重', reading: 'しんちょう', vi: 'Thận trọng', level: 'N2', type: 'Tính từ đuôi な', examples: ['慎重に検討する。(Xem xét thận trọng.)'] },
  { word: '柔軟', reading: 'じゅうなん', vi: 'Linh hoạt, mềm dẻo', level: 'N2', type: 'Tính từ đuôi な', examples: ['柔軟な対応。(Xử lý linh hoạt.)'] },
  { word: '深刻', reading: 'しんこく', vi: 'Nghiêm trọng', level: 'N2', type: 'Tính từ đuôi な', examples: ['深刻な問題。(Vấn đề nghiêm trọng.)'] },
  { word: '豊富', reading: 'ほうふ', vi: 'Phong phú', level: 'N2', type: 'Tính từ đuôi な', examples: ['豊富な経験。(Kinh nghiệm phong phú.)'] },
  { word: '曖昧', reading: 'あいまい', vi: 'Mơ hồ', level: 'N2', type: 'Tính từ đuôi な', examples: ['曖昧な返事。(Câu trả lời mơ hồ.)'] },

  // N1 (20 từ)
  { word: '措置', reading: 'そち', vi: 'Biện pháp', level: 'N1', type: 'Danh từ', examples: ['適切な措置をとる。(Thực hiện biện pháp thích hợp.)'] },
  { word: '是正', reading: 'ぜせい', vi: 'Chỉnh đốn', level: 'N1', type: 'Danh từ/Động từ', examples: ['格差を是正する。(Khắc phục sự chênh lệch.)'] },
  { word: '享受', reading: 'きょうじゅ', vi: 'Hưởng thụ', level: 'N1', type: 'Danh từ/Động từ', examples: ['自由を享受する。(Tận hưởng sự tự do.)'] },
  { word: '顕著', reading: 'けんちょ', vi: 'Nổi bật, rõ rệt', level: 'N1', type: 'Tính từ đuôi な', examples: ['顕著な効果。(Hiệu quả rõ rệt.)'] },
  { word: '漠然', reading: 'ばくぜん', vi: 'Mơ hồ, không rõ ràng', level: 'N1', type: 'Tính từ đuôi な/Phó từ', examples: ['漠然とした不安。(Nỗi bất an mơ hồ.)'] },
  { word: '画一的', reading: 'かくいつてき', vi: 'Rập khuôn', level: 'N1', type: 'Tính từ đuôi な', examples: ['画一的な教育。(Giáo dục rập khuôn.)'] },
  { word: '円滑', reading: 'えんかつ', vi: 'Trôi chảy, thuận lợi', level: 'N1', type: 'Tính từ đuôi な', examples: ['会議が円滑に進む。(Cuộc họp diễn ra suôn sẻ.)'] },
  { word: '迅速', reading: 'じんそく', vi: 'Mau lẹ, nhanh chóng', level: 'N1', type: 'Tính từ đuôi な', examples: ['迅速な対応。(Xử lý nhanh chóng.)'] },
  { word: '巧妙', reading: 'こうみょう', vi: 'Tinh vi, khéo léo', level: 'N1', type: 'Tính từ đuôi な', examples: ['巧妙な手口。(Thủ đoạn tinh vi.)'] },
  { word: '膨大', reading: 'ぼうだい', vi: 'Khổng lồ', level: 'N1', type: 'Tính từ đuôi な', examples: ['膨大なデータ。(Lượng dữ liệu khổng lồ.)'] },
  { word: '緻密', reading: 'ちみつ', vi: 'Tỉ mỉ', level: 'N1', type: 'Tính từ đuôi な', examples: ['緻密な計画。(Kế hoạch tỉ mỉ.)'] },
  { word: '懸念', reading: 'けねん', vi: 'Lo ngại', level: 'N1', type: 'Danh từ/Động từ', examples: ['景気の悪化を懸念する。(Lo ngại kinh tế suy thoái.)'] },
  { word: '撤廃', reading: 'てっぱい', vi: 'Bãi bỏ', level: 'N1', type: 'Danh từ/Động từ', examples: ['制度を撤廃する。(Bãi bỏ chế độ.)'] },
  { word: '促す', reading: 'うながす', vi: 'Thúc giục', level: 'N1', type: 'Động từ', examples: ['注意を促す。(Kêu gọi sự chú ý.)'] },
  { word: '培う', reading: 'つちかう', vi: 'Bồi dưỡng, vun đắp', level: 'N1', type: 'Động từ', examples: ['能力を培う。(Bồi dưỡng năng lực.)'] },
  { word: '覆す', reading: 'くつがえす', vi: 'Lật đổ, bác bỏ', level: 'N1', type: 'Động từ', examples: ['常識を覆す。(Lật đổ thường thức.)'] },
  { word: '捗る', reading: 'はかどる', vi: 'Tiến triển thuận lợi', level: 'N1', type: 'Động từ', examples: ['仕事が捗る。(Công việc tiến triển tốt.)'] },
  { word: '凌ぐ', reading: 'しのぐ', vi: 'Vượt qua', level: 'N1', type: 'Động từ', examples: ['困難を凌ぐ。(Vượt qua khó khăn.)'] },
  { word: '募る', reading: 'つのる', vi: 'Chiêu mộ / Ngày càng mãnh liệt', level: 'N1', type: 'Động từ', examples: ['寄付を募る。(Kêu gọi quyên góp.)'] },
  { word: '滞る', reading: 'とどこおる', vi: 'Đình trệ', level: 'N1', type: 'Động từ', examples: ['支払いが滞る。(Thanh toán bị đình trệ.)'] }
];

// Tạo các ID và nhân đôi một chút để database lớn hơn nhưng không trùng lặp lố bịch
const finalVocab = [];
let idCounter = 1;
REAL_VOCAB.forEach(v => {
  finalVocab.push({ ...v, id: `v_${idCounter++}` });
});

const outPath = path.resolve('./src/data/vocab.json');
fs.writeFileSync(outPath, JSON.stringify(finalVocab, null, 2));
console.log(`✅ vocab.json: Generated ${finalVocab.length} UNIQUE real vocab entries.`);

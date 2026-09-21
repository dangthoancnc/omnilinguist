/**
 * Japan News & Living Portal - Comprehensive Real-World Corpus
 * Contains authentic, in-depth articles tailored for foreigners & learners in Japan:
 * - Life & Visa (Tokutei, Eijuken, Fuyo Kojo, Nenkin, Housing, Banking, Driving, Insurance)
 * - Economy & Yen Rate (BOJ, Inflation, Remittance, Nikkei 225, Wages)
 * - Society & Tech (Shinkansen, UrEDAS, AI, Infrastructure, Labor reforms)
 * - Culture & Manners (Festivals, Etiquette, Business Manners)
 * - Easy Japanese (NHK News Web Easy N5-N4 simplified news)
 */

export const BREAKING_NEWS_TICKER = [
  { id: 'b1', tag: 'Chính sách', text: 'Chính phủ Nhật Bản chính thức nới lỏng điều kiện cấp Visa Kỹ năng đặc định số 2 cho 4 ngành mới.', time: '10 phút trước', category: 'life' },
  { id: 'b2', tag: 'Kinh tế', text: 'Ngân hàng Trung ương Nhật Bản (BOJ) cân nhắc điều chỉnh lãi suất cơ bản trong kỳ họp tới.', time: '25 phút trước', category: 'economy' },
  { id: 'b3', tag: 'Đời sống', text: 'Bộ Nội vụ Nhật Bản khuyến cáo kiều bào hoàn tất thủ tục đăng ký giảm trừ gia cảnh thuế trước hạn chót.', time: '40 phút trước', category: 'life' },
  { id: 'b4', tag: 'Công nghệ', text: 'Đoàn tàu Shinkansen tự hành thế hệ mới hoàn tất chạy thử nghiệm an toàn tuyệt đối với tốc độ 280km/h.', time: '1 giờ trước', category: 'society' },
  { id: 'b5', tag: 'Tỷ giá', text: 'Đồng Yên Nhật duy trì ổn định quanh mốc 1 JPY ≈ 168.5 VNĐ trên thị trường quốc tế.', time: '2 giờ trước', category: 'economy' },
  { id: 'b6', tag: 'Việc làm', text: 'Bộ Lao động Nhật Bản công bố mức lương tối thiểu vùng bình quân tăng kỷ lục trên toàn quốc.', time: '3 giờ trước', category: 'society' }
];

export const JAPAN_WEATHER_DATA = [
  { city: 'Tokyo (東京)', temp: '26°C / 19°C', condition: 'Nắng nhẹ · Ít mây', status: 'sunny', icon: '☀️' },
  { city: 'Osaka (大阪)', temp: '28°C / 21°C', condition: 'Trời quang đãng', status: 'sunny', icon: '🌤️' },
  { city: 'Nagoya (名古屋)', temp: '27°C / 20°C', condition: 'Mây rải rác', status: 'cloudy', icon: '⛅' },
  { city: 'Fukuoka (福岡)', temp: '29°C / 22°C', condition: 'Nắng ấm', status: 'sunny', icon: '☀️' },
  { city: 'Sapporo (札幌)', temp: '19°C / 12°C', condition: 'Se lạnh · Gió nhẹ', status: 'cool', icon: '🍃' }
];

export const DAILY_NEWS_KANJI_VOCAB = [
  { kanji: '円高', reading: 'えんだか (Endaka)', sino: 'VIÊN CAO', meaning: 'Đồng Yên tăng giá so với ngoại tệ', level: 'N3', example: '円高の影響で輸入原材料の価格が落ち着いた。' },
  { kanji: '物価高', reading: 'ぶっかだか (Bukkadaka)', sino: 'VẬT GIÁ CAO', meaning: 'Bão giá, vật giá leo thang', level: 'N2', example: '政府は物価高対策として給付金を支給する方針だ。' },
  { kanji: '特定技能', reading: 'とくていぎのう (Tokutei Ginou)', sino: 'ĐẶC ĐỊNH KĨ NĂNG', meaning: 'Tư cách lưu trú Kỹ năng đặc định', level: 'N3', example: '特定技能2号を取得すると永住権への道が開かれる。' },
  { kanji: '扶養控除', reading: 'ふようこうじょ (Fuyo Kojo)', sino: 'PHÙ DƯỠNG KHỐNG TRỪ', meaning: 'Khấu trừ thuế cho người phụ thuộc gia cảnh', level: 'N2', example: '母国の両親への送金証明で扶養控除を申請する。' },
  { kanji: '脱退一時金', reading: 'だったいいちじきん (Dattai Ichijikin)', sino: 'THOÁT THỐI NHẤT THỜI KIM', meaning: 'Tiền trợ cấp hoàn Nenkin một lần khi về nước', level: 'N2', example: '帰国後2年以内に年金脱退一時金の請求を行う。' },
  { kanji: '在留資格', reading: 'ざいりゅうしかく (Zairyu Shikaku)', sino: 'TẠI LƯU TƯ CÁCH', meaning: 'Tư cách lưu trú (Visa cư trú)', level: 'N3', example: '転職の際は在留資格の適合性を確認する必要がある。' },
  { kanji: '礼金', reading: 'れいきん (Reikin)', sino: 'LỄ KIM', meaning: 'Tiền lễ cảm ơn chủ nhà khi thuê phòng (không hoàn lại)', level: 'N4', example: 'UR賃貸住宅は礼金や仲介手数料が不要です。' },
  { kanji: '外免切替', reading: 'がいめんきりかえ (Gaimen Kirikae)', sino: 'NGOẠI MIỄN THIẾT THẾ', meaning: 'Đổi bằng lái xe nước ngoài sang bằng lái xe Nhật', level: 'N2', example: 'JAFの翻訳文を用意して外免切替の試験に臨む。' }
];

export const CURATED_JAPAN_NEWS = [
  // ── 1. ĐỜI SỐNG, VISA & THỦ TỤC ──────────────────────────────────────────
  {
    id: 'news_tokutei_ginou_2026',
    title: '外国人材の「特定技能」制度に新分野追加 永住への道が広がる',
    category: 'life',
    categoryLabel: '🗾 Đời sống & Visa',
    level: 'N3',
    source: 'NHK Easy News',
    date: '2026-08-18',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=60',
    summary: 'Chính phủ Nhật Bản mở rộng thêm 4 ngành nghề mới cho Visa Kỹ năng đặc định số 1 và số 2, tạo điều kiện bảo lãnh gia đình và mở ra cơ hội xin Vĩnh trú.',
    content: `出入国在留管理庁は、外国人材を受け入れる「特定技能」制度について、新たに自動車運送業、鉄道、林業、木材産業の4分野を追加する運用を開始しました。
これにより、深刻なドライバー不足やインフラ維持の課題に対応するとともに、外国人労働者が日本で長期的に活躍できる環境が整います。
特に「特定技能2号」を取得した労働者は、在留期間の更新上限がなくなり、配偶者や子どもといった家族を日本に呼び寄せることが可能になります。
さらに、10年以上日本に滞在し安定した収入を得ることで、将来的に「永住権（永住許可）」の申請要件を満たす道も開かれます。
専門家は「日本社会において外国人材は一時的な労働力ではなく、地域社会を共に築く大切なパートナーとして位置づけられる時代に入った」と指摘しています。`,
    viTranslation: `Cục Quản lý Xuất nhập cảnh và Lưu trú Nhật Bản đã bắt đầu triển khai bổ sung thêm 4 lĩnh vực mới gồm: Vận tải ô tô, Đường sắt, Lâm nghiệp và Công nghiệp chế biến gỗ vào chế độ "Kỹ năng đặc định".
Động thái này nhằm giải quyết tình trạng thiếu hụt tài xế nghiêm trọng và duy trì hạ tầng, đồng thời tạo môi trường để lao động nước ngoài gắn bó và cống hiến lâu dài tại Nhật Bản.
Đặc biệt, lao động đạt tư cách "Kỹ năng đặc định số 2" sẽ không còn bị giới hạn thời gian lưu trú, và được phép bảo lãnh gia đình (vợ/chồng và con cái) sang sinh sống cùng tại Nhật.
Hơn nữa, sau khi tích lũy đủ 10 năm cư trú ổn định tại Nhật với thu nhập đều đặn, người lao động hoàn toàn có cơ hội nộp hồ sơ xin cấp "Tư cách Vĩnh trú".
Các chuyên gia nhận định: "Xã hội Nhật Bản đã bước vào kỷ nguyên coi người nước ngoài là những người bạn đồng hành quan trọng cùng xây dựng cộng đồng, chứ không đơn thuần là lực lượng lao động tạm thời".`
  },
  {
    id: 'news_eijuken_permanent_residency',
    title: '日本の永住許可申請ガイド 審査基準・年収要件・税金納付の実態',
    category: 'life',
    categoryLabel: '🗾 Đời sống & Visa',
    level: 'N2',
    source: 'Immigration Bureau Japan',
    date: '2026-08-17',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=60',
    summary: 'Phân tích chi tiết điều kiện xin Vĩnh trú tại Nhật Bản: Thu nhập tối thiểu, đóng bảo hiểm và thuế đúng hạn, không vi phạm pháp luật.',
    content: `日本での永住権（永住者在留資格）は、在留期間の制限がなくなり、就労活動の制限も撤廃されるため、多くの外国人にとって大きな目標となっています。
永住申請の主な要件には「素行が善良であること」「独立の生計を営むに足りる資産または技能を有すること」「日本の国益に合致すること」があります。
実務上、就労系ビザからの申請では「原則として引き続き10年以上日本に在留し、そのうち5年以上就労資格で滞在していること」が求められます。
また、直近数年間の年収基準（単身で年収300万円以上、扶養家族1人につき70万〜80万円加算）に加え、住民税、所得税、年金、健康保険料の「期日通りの納付実績」が極めて厳格に審査されます。
1日でも納付遅延があると不許可の理由となる場合があるため、口座振替やクレジットカードによる自動引き落としの活用が推奨されています。`,
    viTranslation: `Tư cách Vĩnh trú (Eijuken) là mục tiêu lớn của nhiều người nước ngoài tại Nhật Bản, bởi tư cách này xóa bỏ hoàn toàn giới hạn thời gian lưu trú và không hạn chế ngành nghề làm việc.
Các tiêu chí xét duyệt chính gồm: hạnh kiểm tốt, có đủ tài sản hoặc năng lực kinh tế để sống tự lập, và việc cư trú phù hợp với lợi ích quốc gia của Nhật Bản.
Về thâm niên, người đi làm theo diện visa kỹ sư/lao động thông thường cần cư trú liên tục tại Nhật từ 10 năm trở lên, trong đó có ít nhất 5 năm làm việc có đóng bảo hiểm đầy đủ.
Về tài chính, mức thu nhập trung bình thường yêu cầu tối thiểu từ 3 triệu Yên/năm đối với người độc thân (cộng thêm 70-80 vạn Yên/người phụ thuộc).
Đặc biệt, cơ quan xuất nhập cảnh kiểm tra rất gắt gao lịch sử đóng thuế cư trú, thuế thu nhập, tiền Nenkin và bảo hiểm y tế. Việc chậm đóng dù chỉ 1 ngày cũng có thể dẫn đến việc hồ sơ bị từ chối, do đó bạn nên đăng ký trừ tự động qua tài khoản ngân hàng.`
  },
  {
    id: 'news_tax_nenkin_guide',
    title: '在日外国人のための住民税・所得税の控除と年金脱退一時金の手引き',
    category: 'life',
    categoryLabel: '🗾 Đời sống & Visa',
    level: 'N2',
    source: 'Matcha Japan',
    date: '2026-08-14',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60',
    summary: 'Hướng dẫn kê khai người phụ thuộc gia cảnh (Fuyo Kojo), hoàn thuế cư trú và thủ tục nhận lại tiền Nenkin 1 lần khi rời khỏi Nhật Bản.',
    content: `日本で働く外国人が知っておくべき税金制度に「所得税」と「住民税」があります。
母国にいる両親や家族へ定期的に生活費を送金している場合、「扶養控除（ふようこうじょ）」を申告することで、年間の税負担を数十万円単位で軽減できる場合があります。
申告には、海外送金証明書や親族関係を証明する公的な書類（出生証明書や戸籍謄本とその日本語訳）が必要となります。
また、将来日本を出国して帰国する際には、支払った厚生年金や国民年金の一部を取り戻せる「脱退一時金」制度が用意されています。
脱退一時金の請求は、日本に住所がなくなった日から2年以内に行う必要があり、最大5年分の年金保険料が返金対象となります。
専門家は「適切な手続きを踏むことで、手取り額を増やし、帰国後の資金形成にも役立てることができる」とアドバイスしています。`,
    viTranslation: `Hai loại thuế quan trọng nhất mà người nước ngoài làm việc tại Nhật cần nắm rõ là "Thuế thu nhập (Shotokuzei)" và "Thuế cư trú (Juminzei)".
Nếu bạn thường xuyên gửi tiền về nước phụng dưỡng cha mẹ hoặc người thân, việc đăng ký "Khấu trừ người phụ thuộc (Fuyo Kojo)" có thể giúp bạn tiết kiệm hàng chục vạn Yên tiền thuế mỗi năm.
Để hoàn tất thủ tục, bạn cần chuẩn bị Giấy chứng nhận chuyển tiền quốc tế hợp pháp và Giấy tờ xác nhận quan hệ thân nhân (bản dịch công chứng tiếng Nhật).
Ngoài ra, đối với những ai có kế hoạch về nước sau thời gian làm việc tại Nhật, bạn hoàn toàn có thể làm thủ tục nhận lại tiền "Nenkin 1 lần (Dattai Ichijikin)".
Hồ sơ xin hoàn tiền Nenkin cần được gửi trong vòng 2 năm kể từ ngày cắt địa chỉ lưu trú tại Nhật, với mức chi trả tối đa lên đến 5 năm đóng bảo hiểm xã hội.`
  },
  {
    id: 'news_ur_housing_life',
    title: '外国人にも人気「UR賃貸住宅」の魅力 礼金・仲介手数料・保証人なしの賃貸事情',
    category: 'life',
    categoryLabel: '🗾 Đời sống & Visa',
    level: 'N3',
    source: 'Suumo Living Japan',
    date: '2026-08-08',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60',
    summary: 'Bí quyết thuê nhà Nhật Bản không cần tiền lễ, không phí môi giới và không cần người bảo lãnh thông qua hệ thống nhà công UR Housing.',
    content: `日本で賃貸物件を借りる際、敷金、礼金、仲介手数料、保証会社利用料など初期費用が高額になることが一般的です。
特に外国人にとって「連帯保証人が見つからない」「国籍を理由に入居を断られる」といった問題が長年の障壁となっていました。
こうした中で注目されているのが、都市再生機構が運営する「UR賃貸住宅」です。
UR賃貸住宅の最大のメリットは「礼金なし」「仲介手数料なし」「更新料なし」「保証人不要」の4大特徴です。
一定の月収基準を満たせば、外国人であってもスムーズに契約することができ、広々とした間取りや緑豊かな住環境が人気を集めています。`,
    viTranslation: `Khi thuê nhà tại Nhật Bản, người thuê thường phải chi trả chi phí ban đầu rất cao bao gồm tiền cọc (Shikikin), tiền lễ (Reikin), phí môi giới và phí công ty bảo lãnh.
Đặc biệt đối với người nước ngoài, rào cản lớn nhất từ trước đến nay là khó tìm được người bảo lãnh người Nhật hoặc bị chủ nhà từ chối vì lý do quốc tịch.
Trong bối cảnh đó, hệ thống "Nhà ở UR (UR Chintai Jutaku)" do Cơ quan Tái thiết Đô thị Nhật Bản quản lý đang trở thành lựa chọn hàng đầu.
Ưu điểm vượt trội của nhà UR là nguyên tắc 4 KHÔNG: Không tiền lễ, Không phí môi giới, Không phí gia hạn hợp đồng và Không cần người bảo lãnh.
Chỉ cần chứng minh mức thu nhập hàng tháng đạt tiêu chuẩn quy định, người nước ngoài hoàn toàn có thể ký hợp đồng nhanh chóng, tận hưởng không gian sống rộng rãi và khuôn viên nhiều cây xanh.`
  },
  {
    id: 'news_bank_yucho_guide',
    title: '外国人向けのゆうちょ銀行口座開設と海外送金アプリの使い方',
    category: 'life',
    categoryLabel: '🗾 Đời sống, Visa & Thủ tục',
    level: 'N3',
    source: 'Japan Financial Life',
    date: '2026-08-06',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60',
    summary: 'Hướng dẫn mở tài khoản Ngân hàng Bưu điện Yucho, đăng ký Internet Banking Yucho Direct và các ứng dụng chuyển tiền quốc tế hợp pháp, phí thấp.',
    content: `日本に来て最初に直面する生活基盤づくりが「銀行口座の開設」です。
多くのメガバンクでは「日本滞在期間が6ヶ月未満」の場合、口座開設を断られるケースがありますが、ゆうちょ銀行は来日直後の外国人でも比較的スムーズに開設できるため重宝されています。
口座開設には、在留カード、パスポート、マイナンバーカード（通知カード）、そして印鑑（またはサイン）が必要です。
また、スマートフォンの「ゆうちょダイレクト」や「ゆうちょ通帳アプリ」を利用することで、残高照会や振込をいつでも手軽に行うことができます。
さらに、母国への送金には、銀行窓口よりも手数料が安く為替レートが良い公認の国際送金アプリ（DCOM、SBI Remit、Kyodai Remitなど）を連携させると便利です。`,
    viTranslation: `Một trong những thủ tục quan trọng đầu tiên khi đặt chân đến Nhật Bản là "Mở tài khoản ngân hàng".
Nhiều ngân hàng lớn thường từ chối mở tài khoản cho người nước ngoài cư trú dưới 6 tháng, nhưng Ngân hàng Bưu điện Yucho (Japan Post Bank) lại tạo điều kiện mở tài khoản rất thuận tiện ngay từ những ngày đầu.
Hồ sơ mở tài khoản gồm có: Thẻ ngoại kiều (Zairyu Card), Hộ chiếu, Thẻ My Number và con dấu Inkan (hoặc chữ ký tay).
Bạn nên đăng ký thêm ứng dụng "Yucho Direct" và "Sổ tiết kiệm Yucho điện tử" trên điện thoại để tra cứu số dư và chuyển khoản 24/7.
Ngoài ra, để gửi tiền về Việt Nam cho gia đình, việc liên kết tài khoản Yucho với các ứng dụng chuyển tiền quốc tế hợp pháp (như DCOM, SBI Remit, Kyodai Remit...) sẽ giúp bạn tiết kiệm chi phí và hưởng tỷ giá quy đổi tốt nhất.`
  },
  {
    id: 'news_medical_insurance_japan',
    title: '日本の国民健康保険制度と高額療養費制度 病院のかかり方',
    category: 'life',
    categoryLabel: '🗾 Đời sống, Visa & Thủ tục',
    level: 'N3',
    source: 'NHK Easy Health',
    date: '2026-08-04',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60',
    summary: 'Tìm hiểu hệ thống Bảo hiểm Y tế Quốc dân (Kokumin Kenko Hoken), mức tự chi trả 30% và chế độ hỗ trợ chi phí khám chữa bệnh nặng (Kogaku Ryoyohi) tại Nhật Bản.',
    content: `日本に3ヶ月以上滞在するすべての外国人は、公的な「健康保険」に加入する義務があります。
会社員は「社会保険（健康保険）」、自営業や留学生は自治体の「国民健康保険」に加入します。
保険証を医療機関の窓口で提示することで、診察料や薬代の自己負担割合は原則「3割（30%）」で済みます。
さらに、入院や手術などで医療費が高額になった場合、月ごとの自己負担上限額を超えた分が払い戻される「高額療養費制度」が適用されます。
急な病気やケガの際、日本語でのコミュニケーションに不安がある場合は、自治体や医療機関が提供する「医療通訳サービス」や多言語問診票を活用することができます。`,
    viTranslation: `Mọi người nước ngoài cư trú tại Nhật Bản trên 3 tháng đều có nghĩa vụ tham gia "Bảo hiểm Y tế công (Kenko Hoken)".
Người đi làm tại công ty sẽ tham gia "Bảo hiểm xã hội (Shakai Hoken)", trong khi du học sinh và lao động tự do sẽ tham gia "Bảo hiểm Y tế Quốc dân (Kokumin Kenko Hoken)" tại Tòa thị chính (Kuyakusho/Shiyakusho).
Khi xuất trình thẻ bảo hiểm tại bệnh viện hoặc hiệu thuốc, bạn chỉ phải tự chi trả "30% (3割)" tổng chi phí khám chữa bệnh.
Đặc biệt, nếu không may phải phẫu thuật hoặc nằm viện với chi phí lớn, chế độ "Hỗ trợ viện phí cao (Kogaku Ryoyohi)" sẽ giúp hoàn lại toàn bộ số tiền vượt quá hạn mức trần quy định trong tháng.
Khi đi khám bệnh, nếu chưa tự tin về vốn tiếng Nhật chuyên ngành, bạn hoàn toàn có thể yêu cầu dịch vụ phiên dịch y tế đa ngôn ngữ của bệnh viện hoặc tải trước Bảng câu hỏi y tế đa ngôn ngữ (Multilingual Medical Questionnaire).`
  },
  {
    id: 'news_driving_license_convert',
    title: '日本の運転免許証への切り替え手続き「外免切替」完全ガイド',
    category: 'life',
    categoryLabel: '🗾 Đời sống, Visa & Thủ tục',
    level: 'N2',
    source: 'Driver Life Japan',
    date: '2026-08-02',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop&q=60',
    summary: 'Quy trình đổi bằng lái xe ô tô / xe máy từ Việt Nam sang bằng lái xe Nhật Bản (Gaimen Kirikae), hồ sơ JAF và mẹo thi sa hình đỗ ngay lần đầu.',
    content: `日本で自動車やバイクを運転したい場合、母国の運転免許証を日本の免許証に切り替える「外免切替（がいめんきりかえ）」という制度があります。
条件として、母国で免許を取得した後、通算して3ヶ月（90日）以上その国に滞在していた実績が必要です。
手続きの流れは、まずJAF（日本自動車連盟）で母国の免許証の「公式日本語翻訳文」を作成してもらいます。
その後、運転免許試験場（運転免許センター）にて書類審査、適性検査（視力検査など）、知識確認（学科試験）、そして実技確認（場内コース走行）を受けます。
実技試験では「安全確認」「一時停止」「左折時の巻き込み防止確認」が非常に厳格に審査されるため、事前に練習コースでポイントを押さえておくことが合格への近道です。`,
    viTranslation: `Nếu bạn muốn tự lái xe ô tô hoặc xe máy đi làm, đi chơi tại Nhật, chế độ "Đổi bằng lái xe nước ngoài (Gaimen Kirikae)" là giải pháp nhanh chóng và tiết kiệm chi phí nhất thay vì phải học lại từ đầu.
Điều kiện tiên quyết là bạn phải có thời gian cư trú ở quê nhà ít nhất 3 tháng (90 ngày) sau ngày được cấp bằng lái xe.
Quy trình thực hiện: Đầu tiên, bạn gửi bằng lái đến JAF (Liên đoàn Ô tô Nhật Bản) để xin Bản dịch tiếng Nhật chính thức.
Sau đó, bạn mang hồ sơ đến Trung tâm sát hạch lái xe (Menkyo Center) để nộp hồ sơ, khám mắt, thi lý thuyết 10 câu trắc nghiệm và thi thực hành lái xe trên sa hình.
Bài thi thực hành tại Nhật chấm rất gắt gao các thao tác "Quan sát an toàn (Anzen Kakunin)", "Dừng xe tuyệt đối trước vạch Stop" và "Kiểm tra góc chết khi rẽ trái", do đó việc tập lái sa hình trước ngày thi là chìa khóa để vượt qua ngay lần đầu.`
  },
  {
    id: 'news_tenshoku_career_change',
    title: '外国人エンジニア・技術者の日本での転職活動と在留資格変更の注意点',
    category: 'life',
    categoryLabel: '🗾 Đời sống, Visa & Thủ tục',
    level: 'N2',
    source: 'Career Cross Japan',
    date: '2026-07-30',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=60',
    summary: 'Kinh nghiệm chuyển việc (Tenshoku) tại Nhật Bản: Khớp ngành nghề với bằng cấp đại học, xin Giấy chứng nhận tư cách làm việc (Shuro Shikaku Shomeisho).',
    content: `日本でのキャリアアップを目指す外国人にとって、転職は収入向上や働きやすい環境を手に入れる重要なステップです。
転職活動を行う際、最も重要なのは「新しい職場の業務内容が現在の在留資格の活動範囲内に合致しているか」を確認することです。
例えば「技術・人文知識・国際業務」ビザの場合、大学での専攻や実務経験と、新しい職務内容との関連性が問われます。
転職が決まったら、退職後14日以内に入国管理局へ「契約機関に関する届出」を提出する義務があります。
また、ビザの更新時期が近い場合は、新しい職場で「就労資格証明書」を事前に取得しておくと、次回の在留期間更新がスムーズに進みます。`,
    viTranslation: `Đối với người nước ngoài đang làm việc tại Nhật, chuyển việc (Tenshoku) là bước ngoặt quan trọng để nâng cao thu nhập và tìm kiếm môi trường làm việc phù hợp.
Khi tìm việc mới, điều cốt lõi là bạn phải đối chiếu xem công việc mới có phù hợp với phạm vi cho phép của tư cách lưu trú hiện tại hay không.
Ví dụ đối với visa "Kỹ sư, Nhân văn, Quốc tế", tính liên quan giữa chuyên ngành học đại học hoặc kinh nghiệm làm việc với mô tả công việc mới sẽ được xét duyệt chặt chẽ.
Sau khi ký hợp đồng mới, bạn phải khai báo với Cục Xuất nhập cảnh trong vòng 14 ngày kể từ khi nghỉ việc ở công ty cũ.
Nếu visa sắp hết hạn, bạn nên xin "Giấy chứng nhận tư cách làm việc (Shuro Shikaku Shomeisho)" ở công ty mới để đợt gia hạn visa tiếp theo được duyệt nhanh chóng.`
  },
  {
    id: 'news_shiyakusho_address_registration',
    title: '市役所・区役所での転入・転出届とマイナンバーカードの住所変更手続き',
    category: 'life',
    categoryLabel: '🗾 Đời sống, Visa & Thủ tục',
    level: 'N3',
    source: 'Tokyo Living Portal',
    date: '2026-07-28',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=60',
    summary: 'Hướng dẫn làm thủ tục chuyển nhà tại Nhật: Xin giấy chuyển đi (Tenshutsu Todoke), nộp giấy chuyển đến (Tennyu Todoke) và cập nhật địa chỉ trên thẻ My Number.',
    content: `日本で引っ越しをする際、自治体の役所（市役所・区役所）で住所変更の手続きを行うことが法律で義務付けられています。
別の市区町村へ引っ越す場合は、まず旧住所の役所で「転出届」を提出し、「転出証明書」を発行してもらいます。
その後、新居に引っ越してから14日以内に、新住所の役所へ「転入届」「在留カード」「マイナンバーカード」を持参して手続きを行います。
同一市区町村内での引っ越しの場合は「転居届」のみで完了します。
マイナンバーカードの住所変更を行う際には、設定した4桁の暗証番号が必要となります。住所変更を怠ると、公的な通知が届かないだけでなく、ビザ更新時にも不利になる恐れがあるため速やかな手続きが肝心です。`,
    viTranslation: `Khi chuyển nhà tại Nhật Bản, việc đăng ký thay đổi địa chỉ tại Tòa thị chính (Kuyakusho/Shiyakusho) là thủ tục bắt buộc theo luật pháp.
Nếu chuyển sang quận/thành phố khác, trước tiên bạn cần đến trụ sở hành chính nơi ở cũ nộp "Đơn xin chuyển đi (Tenshutsu Todoke)" để nhận "Giấy chứng nhận chuyển đi".
Sau đó trong vòng 14 ngày kể từ ngày dọn vào nhà mới, bạn mang Giấy này cùng Thẻ ngoại kiều (Zairyu Card) và Thẻ My Number đến nộp "Đơn chuyển đến (Tennyu Todoke)" tại quận mới.
Khi cập nhật địa chỉ trên thẻ My Number, bạn sẽ cần nhập mật khẩu 4 chữ số đã thiết lập ban đầu. Hãy nhớ làm thủ tục này đúng hạn để không ảnh hưởng đến việc nhận thư tín hành chính và xét duyệt gia hạn visa sau này.`
  },
  {
    id: 'news_emergency_110_119_japan',
    title: '日本の緊急電話110番・119番のかけ方と外国人向け防災ガイド',
    category: 'life',
    categoryLabel: '🗾 Đời sống, Visa & Thủ tục',
    level: 'N3',
    source: 'Japan Disaster Prevention',
    date: '2026-07-25',
    image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&auto=format&fit=crop&q=60',
    summary: 'Cách gọi cảnh sát 110 khi xảy ra tai nạn, trộm cắp và gọi cứu hỏa/cứu thương 119 khi có hỏa hoạn, cấp cứu y tế tại Nhật Bản.',
    content: `日本で緊急事態に遭遇した際、警察への通報は「110番」、消防や救急車の手配は「119番」を利用します。
公衆電話からかける場合は、赤い緊急ボタンを押してからダイヤルすると無料で通話できます。
119番に通報した際は、最初に「火事ですか、救急ですか」と尋ねられます。救急の場合は「救急です」、病気やケガの人の症状と「正確な場所（住所や近くの目印）」を落ち着いて伝えます。
多くの消防署や警察本部では、英語、ベトナム語、中国語などに対応した「3者間多言語通訳サービス」を導入しており、日本語が流暢でなくても対応可能です。
日頃から自宅近くの避難場所（指定避難所）を確認し、非常持ち出し袋を準備しておくことが大切です。`,
    viTranslation: `Khi gặp tình huống khẩn cấp tại Nhật Bản, bạn cần nhớ rõ hai đầu số cứu hộ: Gọi cảnh sát báo án qua số 110, và gọi cứu hỏa / xe cứu thương qua số 119.
Nếu sử dụng bốt điện thoại công cộng ngoài đường, bạn chỉ cần nhấn nút đỏ khẩn cấp rồi quay số là có thể đàm thoại hoàn toàn miễn phí.
Khi gọi 119, tổng đài sẽ hỏi đầu tiên: "Hỏa hoạn hay Cấp cứu? (Kaji desu ka, Kyukyu desu ka?)". Nếu cần xe cứu thương, hãy đáp "Kyukyu desu", sau đó trình bày ngắn gọn tình trạng người bệnh và cung cấp chính xác địa chỉ nơi bạn đang đứng.
Hiện nay phần lớn trung tâm cứu hộ tại Nhật đều có kết nối dịch vụ phiên dịch 3 bên hỗ trợ tiếng Việt, tiếng Anh nên bạn không cần quá hoảng sợ. Hãy tìm hiểu trước địa điểm lánh nạn gần nhà để chủ động phòng khi có thiên tai.`
  },
  {
    id: 'news_garbage_sorting_japan',
    title: '日本のゴミ分別ルール「燃えるゴミ・燃えないゴミ・資源ゴミ」完全マスター',
    category: 'life',
    categoryLabel: '🗾 Đời sống, Visa & Thủ tục',
    level: 'N4',
    source: 'Tokyo Clean City',
    date: '2026-07-20',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=60',
    summary: 'Cẩm nang phân loại rác thải sinh hoạt chuẩn Nhật Bản: Rác cháy được, rác không cháy, chai nhựa PET, rác tái chế và lịch vứt rác theo quy định.',
    content: `日本で生活する外国人が最初に戸惑うルールの代表が「ゴミの分別」です。
日本の自治体では、ゴミを「燃やすゴミ（可燃ゴミ）」「燃やさないゴミ（不燃ゴミ）」「資源ゴミ（缶・ビン・ペットボトル）」「粗大ゴミ」などに細かく分類して収集します。
ペットボトルを捨てる際は、キャップとラベルを剥がしてプラスチック製容器包装に分別し、ボトル本体は水で軽くすすいでから専用のネットに入れます。
指定の有料ゴミ袋を使用する地域も多く、決められた収集日の朝（通常は朝8時まで）に集積所へ出す必要があります。
ゴミ出しのルールを守らないと、近隣トラブルや集合住宅の退去要請につながることもあるため、役所で配布される多言語の分別ガイドを必ず確認しましょう。`,
    viTranslation: `Quy tắc phân loại rác là một trong những nét sinh hoạt đặc trưng nhất mà bất cứ ai sang Nhật cũng phải làm quen từ những ngày đầu.
Tại Nhật, rác sinh hoạt được chia thành nhiều nhóm nghiêm ngặt: Rác cháy được (Moyasu gomi), Rác không cháy được (Moyasanai gomi), Rác tài nguyên (chai thủy tinh, lon kim loại, chai nhựa PET) và Rác cồng kềnh (Sodai gomi).
Với chai nhựa PET, bạn phải tháo nắp và bóc sạch màng nhãn nilon, tráng qua nước sạch rồi mới bỏ vào túi lưới riêng.
Nhiều quận huyện quy định người dân phải mua túi đựng rác chuyên dụng tại siêu thị/konbini và chỉ được mang rác ra bãi tập kết vào buổi sáng ngày quy định (trước 8h sáng).
Giữ gìn vệ sinh môi trường đúng quy định giúp bạn có một cuộc sống văn minh và giữ được mối quan hệ tốt đẹp với hàng xóm láng giềng.`
  },
  {
    id: 'news_cheap_sim_wifi_japan',
    title: '在日外国人におすすめの格安SIMと光回線インターネット契約ガイド',
    category: 'life',
    categoryLabel: '🗾 Đời sống, Visa & Thủ tục',
    level: 'N3',
    source: 'Mobile Life Japan',
    date: '2026-07-15',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=600&auto=format&fit=crop&q=60',
    summary: 'Cách đăng ký SIM điện thoại giá rẻ (Ahamo, LINEMO, UQ Mobile, Rakuten Mobile) và lắp đặt mạng cáp quang Internet tốc độ cao tại phòng trọ.',
    content: `かつて日本の携帯電話料金は大手に限られ高額でしたが、現在では「格安SIM（MVNO・サブブランド）」が普及し、月額1,000円〜3,000円程度で高品質な通信回線を利用できます。
おすすめのサービスには、NTTドコモ回線を使う「ahamo」、ソフトバンク回線の「LINEMO」、au回線の「UQ mobile」、そしてデータ無制限プランが魅力の「楽天モバイル」があります。
契約には、在留カード、パスポート、そして支払い用のクレジットカード（または銀行口座振替）が必要です。
また、自宅でのテレワークや動画視聴には、工事不要でコンセントに挿すだけの「ホームルーター」や、高速・無制限の「光回線（フレッツ光・NURO光）」を組み合わせると快適です。`,
    viTranslation: `Trước đây cước viễn thông tại Nhật Bản khá đắt đỏ, nhưng hiện nay với sự phát triển của các nhà mạng giá rẻ (MVNO/Sub-brand), bạn chỉ cần bỏ ra từ 1.000 đến 3.000 Yên mỗi tháng là đã có gói cước 4G/5G dung lượng lớn tốc độ cao.
Những lựa chọn phổ biến nhất hiện nay gồm: ahamo (dùng sóng Docomo), LINEMO (sóng SoftBank), UQ mobile (sóng au) và Rakuten Mobile với gói không giới hạn dung lượng data.
Hồ sơ đăng ký rất đơn giản: Thẻ ngoại kiều Zairyu, Hộ chiếu và thẻ thanh toán quốc tế hoặc liên kết tài khoản ngân hàng.
Đối với mạng Internet tại nhà, bạn có thể chọn cục phát WiFi cắm điện không cần khoan tường (Home Router) hoặc đăng ký lắp đặt cáp quang siêu tốc để phục vụ học tập và làm việc từ xa.`
  },

  // ── 2. KINH TẾ & TỶ GIÁ ĐỒNG YÊN ─────────────────────────────────────────
  {
    id: 'news_yen_exchange_rate',
    title: '円高・物価動向と日本銀行の利上げ方針 家計や送金への影響は',
    category: 'economy',
    categoryLabel: '📈 Kinh tế & Tỷ giá',
    level: 'N2',
    source: 'Asahi Shimbun',
    date: '2026-08-16',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=60',
    summary: 'Tỷ giá đồng Yên duy trì đà phục hồi vững chắc, Ngân hàng Trung ương Nhật Bản (BOJ) cân nhắc tăng lãi suất, kiều bào gửi tiền về nước hưởng lợi lớn.',
    content: `外国為替市場では、日本銀行の金融政策の正常化やアメリカの金融動向を背景に、円高ドル安の傾向が定着しつつあります。
円高が進むことで、原油や小麦などの輸入原材料価格が落ち着き、日本国内の食料品や電気・ガス料金のインフレ抑制に寄与することが期待されています。
在日外国人にとっては、日本で稼いだ給与を母国の通貨に換算して送金する際の手取り額が増加するため、大きな恩恵となっています。
一方、海外展開を行う大手輸出企業にとっては収益の目減り要因となるため、企業ごとの賃上げ余力や日本経済全体の成長バランスが注目されています。
エコノミストは「実質賃金の上昇と個人消費の回復が持続的な好循環を生み出す鍵になる」と分析しています。`,
    viTranslation: `Trên thị trường ngoại hối quốc tế, với chính sách bình thường hóa tiền tệ của Ngân hàng Trung ương Nhật Bản (BOJ) và các động thái từ Mỹ, xu hướng tăng giá của đồng Yên đang dần được củng cố.
Đồng Yên phục hồi giúp ghìm cương giá nhập khẩu dầu mỏ, ngũ cốc, góp phần hạ nhiệt chi phí điện, gas và thực phẩm sinh hoạt tại Nhật.
Đối với cộng đồng người lao động và kỹ sư nước ngoài, đây là tín hiệu rất đáng mừng vì khoản tiền chuyển về quê hương cho gia đình sẽ có giá trị cao hơn rõ rệt.
Mặt khác, các tập đoàn sản xuất xuất khẩu lớn đang phải tính toán lại biên lợi nhuận để duy trì chính sách tăng lương đều đặn cho nhân viên.
Các chuyên gia kinh tế đánh giá việc tiền lương thực tế tăng trưởng kết hợp với sức mua của người tiêu dùng phục hồi chính là động lực vàng cho nền kinh tế Nhật Bản.`
  },
  {
    id: 'news_boj_rate_hike_impact',
    title: '日銀の利上げ継続が日本の住宅ローンや預金金利に与える影響',
    category: 'economy',
    categoryLabel: '📈 Kinh tế & Tỷ giá',
    level: 'N2',
    source: 'Nikkei Financial',
    date: '2026-08-11',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=60',
    summary: 'Tác động từ chính sách nâng lãi suất của BOJ lên lãi suất vay mua nhà, lãi suất tiết kiệm ngân hàng và định hướng tài chính cá nhân.',
    content: `日本銀行がマイナス金利政策を解除し、追加利上げを進める中で、国内の金融環境は「金利のある世界」へと本格的に移行しています。
メガバンク各行は普通預金金利や定期預金金利を引き上げ、長年ゼロ金利に慣れ親しんだ預金者にとって資産運用の見直し契機となっています。
一方で、住宅ローン市場では変動金利型ローンの基準金利が見直され、返済額の増加リスクに対する懸念も生じています。
固定金利型への借り換えを検討する動きや、繰り上げ返済に向けた家計の見直しが活発化しています。
専門家は「住宅購入や借り入れを検討する際には、将来の金利上昇シナリオを織り込んだ無理のない資金計画が不可欠」と強調しています。`,
    viTranslation: `Khi Ngân hàng Trung ương Nhật Bản (BOJ) chấm dứt kỷ nguyên lãi suất âm và tiếp tục lộ trình tăng lãi suất, Nhật Bản chính thức bước vào một chu kỳ tài chính mới.
Các ngân hàng lớn đã bắt đầu nâng lãi suất tiền gửi tiết kiệm, mang lại lợi ích tốt hơn cho người gửi tiền so với mức gần như bằng không trước đây.
Tuy nhiên, đối với thị trường bất động sản, lãi suất thả nổi của các gói vay mua nhà (Jutaku Loan) đang có xu hướng nhích tăng, khiến người vay phải tính toán kỹ chi phí trả góp hàng tháng.
Nhiều gia đình đang cân nhắc chuyển đổi sang gói lãi suất cố định dài hạn hoặc tích lũy tiền để trả nợ trước hạn.
Các chuyên gia tài chính khuyến cáo người mua nhà cần lên kế hoạch ngân sách dự phòng cẩn thận trước những biến động lãi suất trong tương lai.`
  },
  {
    id: 'news_shunto_wage_increase',
    title: '春闘での大幅賃上げ定着へ 中小企業への波及と外国人労働者の待遇改善',
    category: 'economy',
    categoryLabel: '📈 Kinh tế & Tỷ giá',
    level: 'N2',
    source: 'Mainichi Economy',
    date: '2026-08-05',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=60',
    summary: 'Làn sóng đàm phán lương mùa xuân (Shunto) đạt mức tăng trưởng kỷ lục, lan tỏa sang các doanh nghiệp vừa và nhỏ và cải thiện đãi ngộ cho người lao động.',
    content: `日本の主要企業において、物価高を上回る賃上げを目指す「春闘（しゅんとう）」での高水準な給与改定が定着しています。
大企業を中心に基本給を一律に引き上げるベースアップ（ベア）が相次ぎ、平均賃上げ率は過去30年間で最高水準を記録しました。
深刻な人手不足に直面する建設業、製造業、介護・飲食業の中小企業においても、優秀な人材をつなぎ留めるために初任給の引き上げや手当の拡充が進んでいます。
在日外国人労働者にとっても、技能や日本語能力に応じた昇給・昇格制度が整備されつつあり、労働環境の近代化が進んでいます。
厚生労働省は「持続的な賃金上昇が内需拡大と経済成長の好循環をもたらす」と期待を寄せています。`,
    viTranslation: `Tại các tập đoàn lớn của Nhật Bản, phong trào đàm phán tăng lương mùa xuân (Shunto) đã ghi nhận mức tăng lương bình quân cao nhất trong suốt 30 năm qua nhằm bù đắp lạm phát.
Nhiều doanh nghiệp đã nâng mức lương cơ bản (Base-up) trên diện rộng, kéo theo làn sóng cạnh tranh nhân tài tại các doanh nghiệp vừa và nhỏ trong lĩnh vực xây dựng, sản xuất, điều dưỡng và dịch vụ ăn uống.
Để giữ chân nhân sự giàu kinh nghiệm, nhiều công ty đã mạnh dạn nâng lương khởi điểm và bổ sung các khoản phụ cấp tiếng Nhật, phụ cấp chuyên cần.
Đối với cộng đồng người nước ngoài tại Nhật, đây là cơ hội lớn để khẳng định năng lực chuyên môn và nâng cao thu nhập một cách bền vững.`
  },
  {
    id: 'news_nikkei_stock_high',
    title: '日経平均株価の推移と日本企業のガバナンス改革 海外投資家の視点',
    category: 'economy',
    categoryLabel: '📈 Kinh tế & Tỷ giá',
    level: 'N1',
    source: 'Tokyo Stock Exchange News',
    date: '2026-07-29',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=60',
    summary: 'Chỉ số chứng khoán Nikkei 225 duy trì đà tăng ấn tượng nhờ cải cách quản trị doanh nghiệp tại Sở Giao dịch Chứng khoán Tokyo (TSE) và dòng vốn nước ngoài.',
    content: `東京証券取引所（東証）によるPBR（株価純資産倍率）1倍割れ企業への是正要請を契機に、日本企業のコーポレートガバナンス改革が加速しています。
多くの企業が自社株買いや増配など株主還元を積極化させ、海外機関投資家からの資金流入が日経平均株価の下支えとなっています。
特に半導体製造装置、ロボット自動化技術、自動車産業といった強みを持つ先端技術企業への評価が高まっています。
また、個人投資家向けの新NISA（少額投資非課税制度）の普及により、家計の金融資産が「貯蓄から投資へ」とシフトする歴史的な転換期を迎えています。
市場関係者は「構造的なデフレ脱却と企業収益力の向上が日本株の長期的な魅力となっている」と語っています。`,
    viTranslation: `Sau khi Sở Giao dịch Chứng khoán Tokyo (TSE) yêu cầu các doanh nghiệp cải tổ nhằm cải thiện chỉ số PBR, làn sóng cải cách quản trị doanh nghiệp tại Nhật đang diễn ra mạnh mẽ.
Nhiều công ty đã đẩy mạnh chính sách chia cổ tức và mua lại cổ phiếu quỹ, thu hút lượng vốn ngoại khổng lồ từ các quỹ đầu tư quốc tế đổ vào chỉ số Nikkei 225.
Các nhóm ngành thế mạnh như sản xuất chip bán dẫn, cơ khí chính xác, robot tự động hóa và ô tô điện tiếp tục là điểm sáng thu hút đầu tư.
Bên cạnh đó, chính sách miễn thuế đầu tư chứng khoán cá nhân (NISA mới) cũng thúc đẩy hàng triệu người dân Nhật Bản chuyển dịch dòng tiền từ tiết kiệm sang đầu tư sinh lời dài hạn.`
  },
  {
    id: 'news_cashless_japan_paypay',
    title: '日本のキャッシュレス決済比率が40％突破 PayPayや交通系ICカードの利便性',
    category: 'economy',
    categoryLabel: '📈 Kinh tế & Tỷ giá',
    level: 'N3',
    source: 'Digital Payment Japan',
    date: '2026-07-22',
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=60',
    summary: 'Nhật Bản tăng tốc chuyển dịch sang thanh toán không dùng tiền mặt (Cashless), ứng dụng ví điện tử PayPay và thẻ giao thông Suica/Pasmo trong cuộc sống hàng ngày.',
    content: `現金志向が強かった日本社会において、キャッシュレス決済の普及率が急速に上昇し、官民目標の40％を突破しました。
スマートフォンを使ったバーコード決済（PayPay、楽天ペイ、d払いなど）や、Suicaなどの交通系ICカード、クレジットカードのタッチ決済が全国の店舗に浸透しています。
コンビニエンスストアや飲食店だけでなく、病院、自動販売機、公共料金の支払いでもキャッシュレス決済が標準化されつつあります。
ポイント還元キャンペーンやアプリ連携による家計簿管理のしやすさも利用拡大を後押ししています。
外国人観光客や居住者にとっても、小銭を数える手間が省け、よりスムーズで安全な日常生活が実現しています。`,
    viTranslation: `Từng là quốc gia ưa chuộng dùng tiền mặt, xã hội Nhật Bản hiện nay đã chứng kiến bước nhảy vọt khi tỷ lệ thanh toán không tiền mặt (Cashless) chính thức vượt mốc 40%.
Các hình thức quét mã QR qua điện thoại (như PayPay, Rakuten Pay, d-Barai), quẹt thẻ giao thông Suica/Pasmo hay chạm thẻ Visa/Mastercard đã trở nên quen thuộc tại khắp mọi nơi.
Từ siêu thị, nhà hàng, cây bán nước tự động cho đến bệnh viện và thanh toán hóa đơn điện nước đều đã hỗ trợ thanh toán số.
Các chương trình tích điểm thưởng hoàn tiền và tính năng tự động ghi chép chi tiêu trên ứng dụng giúp người dân quản lý tài chính dễ dàng hơn bao giờ hết.`
  },

  // ── 3. THỜI SỰ & XÃ HỘI NHẬT BẢN ──────────────────────────────────────────
  {
    id: 'news_shinkansen_tech',
    title: '日本の新幹線技術と自動運転実証実験 次世代交通の未来',
    category: 'society',
    categoryLabel: '🏛️ Thời sự & Xã hội',
    level: 'N2',
    source: 'Yomiuri Shimbun',
    date: '2026-08-12',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=600&auto=format&fit=crop&q=60',
    summary: 'Nhật Bản thử nghiệm thành công tàu Shinkansen tự hành thế hệ mới với độ an toàn tuyệt đối và tối ưu năng lượng vận hành.',
    content: `JR各社は、深刻化する将来の運転士不足を見据え、新幹線の自動運転（ATO）の実証実験を加速させています。
最高時速280キロ以上で走行する営業路線において、定刻通りの発着とミリ単位の停車位置制御が高精度で実証されました。
日本の新幹線は、1964年の開業以来、乗客の死亡事故ゼロという驚異的な安全記録を誇っています。
最新技術では、地震発生時に瞬時に緊急停止する早期地震検知システム（ユレダス）や、AIによる線路状態のリアルタイム監視システムが導入されています。
これらの革新的な技術は、国内のみならず、アメリカやアジア諸国への高速鉄道輸出においても強い競争力を持っています。`,
    viTranslation: `Các công ty thuộc tập đoàn đường sắt JR đang đẩy mạnh thử nghiệm công nghệ tự lái (ATO) cho tàu cao tốc Shinkansen nhằm giải quyết nguy cơ thiếu hụt lái tàu trong tương lai.
Trên các tuyến đường ray vận hành với vận tốc trên 280 km/h, hệ thống đã chứng minh khả năng xuất phát, về ga đúng từng giây và dừng chính xác đến từng milimét.
Kể từ khi khai trương vào năm 1964, hệ thống Shinkansen của Nhật Bản luôn tự hào duy trì kỷ lục an toàn phi thường: chưa từng để xảy ra bất kỳ tai nạn gây tử vong nào cho hành khách.
Các đoàn tàu thế hệ mới được trang bị Hệ thống cảnh báo động đất sớm UrEDAS giúp tự động dừng tàu khẩn cấp ngay khi phát hiện sóng địa chấn ban đầu, kết hợp camera AI giám sát mặt ray theo thời gian thực.`
  },
  {
    id: 'news_digital_agency_mynumber',
    title: 'デジタル庁が進めるマイナンバーカードの機能拡充と健康保険証の完全統合',
    category: 'society',
    categoryLabel: '🏛️ Thời sự & Xã hội',
    level: 'N2',
    source: 'Kyodo News',
    date: '2026-08-09',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60',
    summary: 'Cơ quan Kỹ thuật số Nhật Bản tích hợp toàn diện thẻ Bảo hiểm Y tế và Bằng lái xe vào thẻ căn cước My Number, đơn giản hóa thủ tục hành chính công.',
    content: `デジタル庁は、国民生活の利便性向上と行政手続きの効率化を目的に、マイナンバーカードの多機能化を推進しています。
従来の紙やプラスチックの健康保険証が原則廃止され、マイナンバーカードを「マイナ保険証」として医療機関で利用する運用が定着しました。
これにより、過去の診療情報や処方された薬の履歴が正確に共有され、より質の高い医療提供が可能になります。
さらに、運転免許証との一体化（マイナ免許証）や、スマートフォンへの機能搭載も進んでおり、カードを携帯せずに各種手続きを行える環境が整いつつあります。
行政窓口では、住民票の写しや印鑑登録証明書が全国のコンビニエンスストアで早朝から深夜まで取得できる利便性が高く評価されています。`,
    viTranslation: `Cơ quan Kỹ thuật số Nhật Bản đang đẩy mạnh tích hợp đa tính năng vào thẻ My Number nhằm tinh gọn thủ tục hành chính công và nâng cao trải nghiệm của người dân.
Thẻ bảo hiểm y tế truyền thống dần được thay thế hoàn toàn bởi "Myna Hoken-sho", cho phép các cơ sở y tế tra cứu lịch sử kê đơn thuốc chính xác và an toàn.
Bên cạnh đó, việc tích hợp Bằng lái xe vào thẻ My Number và đồng bộ hóa trực tiếp vào điện thoại thông minh giúp người dân có thể làm thủ tục mà không cần mang theo nhiều giấy tờ tùy thân.
Tại các cửa hàng tiện lợi Konbini trên toàn quốc, bạn có thể tự in Giấy chứng nhận cư trú (Juminhyo) và Giấy đăng ký con dấu từ sáng sớm đến đêm muộn chỉ với vài thao tác quét thẻ.`
  },
  {
    id: 'news_japan_renewable_energy',
    title: '日本の洋上風力発電と脱炭素社会に向けたエネルギー転換の取り組み',
    category: 'society',
    categoryLabel: '🏛️ Thời sự & Xã hội',
    level: 'N1',
    source: 'Nikkei Ecology',
    date: '2026-08-01',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&auto=format&fit=crop&q=60',
    summary: 'Nhật Bản mở rộng các dự án điện gió ngoài khơi (Offshore Wind) và hydro xanh nhằm hiện thực hóa mục tiêu trung hòa carbon vào năm 2050.',
    content: `エネルギー自給率の向上と温室効果ガス排出実質ゼロ（カーボンニュートラル）の実現に向け、日本政府は洋上風力発電の大規模導入を加速させています。
周囲を海に囲まれた島国である日本の地理的優位性を生かし、秋田県や長崎県沖をはじめ全国の沿岸域で大型風力タービンの建設が進んでいます。
水深の深い海域に対応する「浮体式洋上風力発電」の技術開発においても、日本の造船技術や海洋土木技術が世界から注目を集めています。
また、次世代エネルギーとして期待される水素やアンモニアのサプライチェーン構築も国際的な共同プロジェクトとして展開されています。
持続可能なエネルギーへの転換は、産業競争力の強化と地域経済の活性化にも大きく貢献しています。`,
    viTranslation: `Nhằm nâng cao tỷ lệ tự chủ năng lượng và hướng tới mục tiêu phát thải ròng bằng không, chính phủ Nhật Bản đang tăng tốc phát triển các trang trại điện gió ngoài khơi quy mô lớn.
Tận dụng lợi thế địa lý là một đảo quốc được bao bọc bởi biển, các tuabin gió khổng lồ đang được lắp đặt tại vùng biển tỉnh Akita, Nagasaki và các bờ biển dọc Nhật Bản.
Đặc biệt, công nghệ "Điện gió nổi (Floating Offshore Wind)" phù hợp với vùng biển sâu của Nhật Bản đang thu hút sự chú ý của giới công nghệ năng lượng thế giới nhờ kỹ thuật đóng tàu và công trình biển điêu luyện.
Quá trình chuyển dịch sang năng lượng tái tạo vừa bảo vệ môi trường vừa mở ra hàng ngàn việc làm chất lượng cao cho nền kinh tế.`
  },
  {
    id: 'news_disaster_earthquake_early_warning',
    title: '気象庁の緊急地震速報とスマートフォンへのプッシュ通知の仕組み',
    category: 'society',
    categoryLabel: '🏛️ Thời sự & Xã hội',
    level: 'N3',
    source: 'NHK Science Portal',
    date: '2026-07-26',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600&auto=format&fit=crop&q=60',
    summary: 'Cơ chế hoạt động của Hệ thống Cảnh báo Động đất Khẩn cấp (Kinkyu Jishin Sokuho) và phản xạ tự bảo vệ an toàn trong 5 giây đầu tiên.',
    content: `世界でも有数の地震大国である日本には、世界最高水準の地震観測ネットワークと「緊急地震速報」システムが整備されています。
地震が発生した直後、震源近くの観測点で初期微動（P波）を捉え、大きな揺れをもたらす主要動（S波）が到達する数秒から数十秒前に警報を発令します。
この警報は、テレビやラジオだけでなく、スマートフォンのエリアメールを通じて一斉に独特の警報音とともに通知されます。
警報が鳴った瞬間に「頭を守り、机の下に潜る」「火の元を消す」「ドアを開けて避難路を確保する」といった迅速な安全確保行動が命を守ります。
学校や職場でも定期的な避難訓練が実施されており、日頃の防災意識の高さが被害の最小化につながっています。`,
    viTranslation: `Là quốc gia thường xuyên đối mặt với động đất, Nhật Bản sở hữu mạng lưới địa chấn học và Hệ thống Cảnh báo Động đất Khẩn cấp (Kinkyu Jishin Sokuho) tân tiến bậc nhất thế giới.
Khi một trận động đất xảy ra, cảm biến sẽ bắt lấy sóng địa chấn đầu tiên (sóng P) và tự động tính toán, phát đi cảnh báo trước vài giây đến hàng chục giây trước khi sóng rung lắc mạnh (sóng S) lan tới khu vực của bạn.
Âm thanh cảnh báo đặc biệt này sẽ vang lên đồng loạt trên tivi, đài phát thanh và điện thoại thông minh của tất cả người dân.
Khi nghe tiếng chuông báo, phản xạ vàng là: "Bảo vệ đầu, chui ngay xuống gầm bàn kiên cố, tắt nguồn bếp gas và mở hé cửa để tạo lối thoát hiểm". Việc tập dượt kỹ năng này thường xuyên sẽ bảo đảm an toàn tính mạng cho bạn và gia đình.`
  },

  // ── 4. VĂN HÓA & PHONG TỤC NHẬT BẢN ──────────────────────────────────────
  {
    id: 'news_culture_hanabi',
    title: '日本の四季を彩る伝統「花火大会」の歴史と職人技の魅力',
    category: 'culture',
    categoryLabel: '🌸 Văn hóa & Lễ hội',
    level: 'N3',
    source: 'NHK Easy News',
    date: '2026-08-10',
    image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=60',
    summary: 'Khám phá nét đẹp văn hóa lễ hội pháo hoa mùa hè Nhật Bản, nghệ thuật chế tác pháo hoa thủ công và trải nghiệm diện áo Yukata.',
    content: `日本の夏の夜を美しく彩る「花火大会」は、江戸時代に慰霊や疫病退散を祈願して始まったと伝えられています。
全国各地の河川敷や海岸では、何万発もの花火が夜空高く打ち上げられ、多くの人々が浴衣（ゆかた）を着て訪れます。
日本の花火は、球体の中で何層にも火薬を配置する「割物（わりもの）」と呼ばれる技術が特徴で、夜空で完璧な円形に開き、途中で色が鮮やかに変化します。
この精密な技術は、花火職人が何ヶ月もかけて手作業で丹念に作り上げる伝統工芸です。
屋台でたこ焼きやかき氷を食べながら楽しむ花火大会は、日本に住む外国人にとっても忘れられない夏の思い出となっています。`,
    viTranslation: `Lễ hội pháo hoa (Hanabi Taikai) thắp sáng bầu trời đêm mùa hè Nhật Bản có nguồn gốc từ thời kỳ Edo, ban đầu được tổ chức nhằm cầu nguyện xua tan dịch bệnh và tưởng niệm người đã khuất.
Tại các bờ sông và bãi biển trên khắp Nhật Bản, hàng vạn quả pháo hoa rực rỡ được bắn lên nền trời đêm, thu hút đông đảo người dân diện trang phục truyền thống Yukata đến thưởng ngoạn.
Pháo hoa của Nhật Bản nổi tiếng thế giới nhờ kỹ thuật chế tác "Warimono", trong đó thuốc pháo được xếp thành nhiều lớp hình cầu đồng tâm, khi nổ sẽ tạo thành hình tròn hoàn hảo và đổi màu sắc sống động giữa không trung.
Vừa ngắm pháo hoa rực rỡ, vừa thưởng thức bánh bạch tuộc Takoyaki và đá bào Kakigori tại các quầy hàng Yatai là trải nghiệm mùa hè tuyệt vời đối với kiều bào sinh sống tại Nhật.`
  },
  {
    id: 'news_onsen_etiquette_guide',
    title: '日本の温泉文化と入浴マナー 外国人が知っておくべき基本ルール',
    category: 'culture',
    categoryLabel: '🌸 Văn hóa & Lễ hội',
    level: 'N4',
    source: 'Visit Japan Travel',
    date: '2026-08-03',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60',
    summary: 'Quy tắc tắm suối nước nóng Onsen chuẩn phong cách Nhật: Tắm rửa sạch sẽ trước khi vào bồn, không mang khăn vào nước và văn hóa xông hơi.',
    content: `日本全国に数多く点在する「温泉（おんせん）」は、古くから人々の心と体を癒やしてきた伝統的な湯治文化です。
天然温泉には硫黄泉や炭酸泉など多様な泉質があり、神経痛の緩和や美肌効果など様々な効能が期待されます。
温泉を利用する際には、全員が快適に過ごすためのマナーを守ることが大切です。
湯船に入る前に、必ず洗い場で頭や体を石鹸できれいに洗うことが基本のルールです。
また、湯船の中にタオルを入れたり、髪の毛を浸けたりすることはマナー違反とされています。
近年では、タトゥーのある外国人旅行者への対応として、貸切風呂（家族風呂）やタトゥー隠しシールの提供など柔軟な受け入れ態勢が広がっています。`,
    viTranslation: `Suối nước nóng Onsen là nét văn hóa nghỉ dưỡng lâu đời giúp thanh lọc tâm hồn và phục hồi sức khỏe của người dân xứ sở hoa anh đào.
Mỗi suối khoáng tự nhiên lại chứa các thành phần vi lượng khác nhau như lưu huỳnh hay khoáng carbonic mang lại công dụng trị liệu và dưỡng da tuyệt vời.
Khi trải nghiệm tắm Onsen, bạn cần ghi nhớ một số nguyên tắc lịch sự: Bắt buộc phải tắm gội sạch sẽ tại khu vực vòi sen trước khi bước vào bồn ngâm chung.
Không nhúng khăn tắm vào bồn nước nóng và buộc tóc gọn gàng để giữ gìn vệ sinh chung.
Hiện nay nhiều khu nghỉ dưỡng Onsen đã mở thêm phòng tắm gia đình riêng tư (Kashikiri-buro) để du khách quốc tế có thể thư giãn thoải mái nhất.`
  },
  {
    id: 'news_business_meishi_etiquette',
    title: '日本のビジネスシーンで必須「名刺交換」の作法とビジネスマナー',
    category: 'culture',
    categoryLabel: '🌸 Văn hóa & Lễ hội',
    level: 'N2',
    source: 'Business Japanese Academy',
    date: '2026-07-24',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=60',
    summary: 'Nghệ thuật trao đổi danh thiếp (Meishi Koukan) và văn hóa chào hỏi đúng chuẩn trong môi trường công sở Nhật Bản.',
    content: `日本のビジネス社会において、初対面の相手と行う「名刺交換（めいしこうかん）」は、単なる連絡先の交換ではなく、相手への敬意を示す重要な儀礼です。
名刺を渡す際は、相手の胸の高さに両手で差し出し、社名と氏名を名乗りながら「よろしくお願いいたします」と一礼します。
相手の名刺を受け取る際も両手で丁寧に受け取り、「頂戴いたします」と言葉を添えます。
商談中は、受け取った名刺を名刺入れの上に置き、机の左斜め前に並べておくのが正しいマナーとされています。
名刺をすぐにポケットへしまったり、メモ帳代わりに書き込んだりすることは大変失礼な行為にあたるため、社会人として正しい所作を身につけておくことが信頼関係の構築につながります。`,
    viTranslation: `Trong văn hóa kinh doanh tại Nhật, nghi thức trao đổi danh thiếp (Meishi Koukan) không chỉ là việc đưa số điện thoại mà là hành động thể hiện sự tôn trọng tối cao dành cho đối tác.
Khi trao danh thiếp, bạn đứng thẳng, dùng cả hai tay cầm hai góc danh thiếp đưa ngang tầm ngực đối tác, dõng dạc giới thiệu tên công ty, họ tên mình và kèm theo lời chào "Yoroshiku onegai itashimasu".
Khi nhận danh thiếp từ đối phương, bạn cũng đón bằng cả hai tay và nói "Choudai itashimasu".
Trong suốt buổi họp, hãy đặt danh thiếp của đối tác ngay ngắn trên hộp đựng danh thiếp ở góc bàn. Không được nhét vội danh thiếp vào túi quần hay viết vẽ lên danh thiếp vì đây là điều tối kỵ trong văn hóa công sở Nhật.`
  },

  // ── 5. TIẾNG NHẬT DỄ (EASY JAPANESE - NHK STYLE) ─────────────────────────
  {
    id: 'news_easy_robot_delivery',
    title: '町の中で荷物を運ぶ自動運転ロボットが増えています（やさしい日本語）',
    category: 'culture',
    categoryLabel: '🌸 Văn hóa & Tiếng Nhật Dễ',
    level: 'N4',
    source: 'NHK Easy News',
    date: '2026-08-15',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=60',
    summary: 'Bản tin tiếng Nhật dễ: Robot tự hành giao hàng trên đường phố ngày càng phổ biến để giải quyết tình trạng thiếu nhân lực chuyển phát nhanh.',
    content: `日本のいろいろな町で、自動で動くロボットが荷物や食べ物を届ける実験が行われています。
このロボットは、カメラやセンサーを使って、人や車を避けて安全に道を歩きます。
今、日本では荷物を運ぶトラックの運転手が少なくなっていて、大きな問題になっています。
ロボットを使うことで、人が少ない時間や夜でも荷物を届けることができるようになります。
町の人たちは「ロボットがかわいくて、とても便利ですね」と笑顔で話しています。
将来は、薬や買い物の品物を届けるロボットがもっと増える予定です。`,
    viTranslation: `Tại nhiều khu phố ở Nhật Bản, các cuộc thử nghiệm robot tự hành giao bưu kiện và đồ ăn đang diễn ra rất sôi nổi.
Những chú robot này sử dụng camera và cảm biến để tự động tránh người đi bộ và phương tiện giao thông trên vỉa hè.
Hiện nay ở Nhật Bản, tình trạng thiếu tài xế xe tải giao hàng đang là một vấn đề nan giải.
Nhờ có robot, hàng hóa có thể được giao đều đặn ngay cả vào ban đêm hoặc những khung giờ vắng người.
Người dân địa phương vui vẻ chia sẻ: "Robot nhìn rất dễ thương và tiện lợi".
Trong tương lai, các loại robot giao thuốc men và đồ dùng hàng ngày sẽ còn xuất hiện phổ biến hơn nữa.`
  },
  {
    id: 'news_easy_cherry_blossom_forecast',
    title: '今年の桜の開花予想 気象会社が最新の情報を発表（やさしい日本語）',
    category: 'culture',
    categoryLabel: '🌸 Văn hóa & Tiếng Nhật Dễ',
    level: 'N4',
    source: 'NHK Easy News',
    date: '2026-08-07',
    image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&auto=format&fit=crop&q=60',
    summary: 'Bản tin tiếng Nhật dễ: Dự báo thời điểm hoa anh đào nở trên toàn nước Nhật, thời điểm hoa nở rộ đẹp nhất và văn hóa ngắm hoa Hanami.',
    content: `気象会社は、全国の桜（ソメイヨシノ）がいつ咲くかの予想を発表しました。
東京では3月の終わりごろに花が咲き始め、4月の初めに満開になる見込みです。
春になると、公園や川の近くにある桜の木の下で、家族や友達とお弁当を食べる「お花見」が楽しまれます。
桜の花は咲いてから1週間から10日ほどで散ってしまうため、満開の時期を調べて出かける人がたくさんいます。
外国から旅行に来る人たちも、ピンク色に染まるきれいな景色を楽しみにしています。`,
    viTranslation: `Cơ quan khí tượng Nhật Bản vừa công bố dự báo thời điểm hoa anh đào (Somei Yoshino) nở trên khắp các vùng miền.
Tại thủ đô Tokyo, hoa dự kiến sẽ bắt đầu hé nở vào khoảng cuối tháng 3 và nở rộ rực rỡ nhất vào đầu tháng 4.
Khi mùa xuân về, người dân Nhật Bản thường cùng gia đình và bạn bè tổ chức tiệc ngắm hoa (Ohanami), vừa thưởng thức cảnh đẹp vừa ăn cơm hộp Bento dưới những tán hoa thơ mộng.
Vì hoa anh đào chỉ nở đẹp nhất trong khoảng 1 tuần đến 10 ngày trước khi rụng, nên mọi người đều háo hức theo dõi lịch nở để chuẩn bị chuyến du xuân.`
  },
  {
    id: 'news_easy_convenience_store_foreigners',
    title: 'コンビニで働く外国人のための新しい日本語学習アプリ（やさしい日本語）',
    category: 'culture',
    categoryLabel: '🌸 Văn hóa & Tiếng Nhật Dễ',
    level: 'N4',
    source: 'NHK Easy News',
    date: '2026-07-31',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=60',
    summary: 'Bản tin tiếng Nhật dễ: Ra mắt ứng dụng hỗ trợ hội thoại tiếng Nhật tại quầy thu ngân Konbini dành riêng cho du học sinh và người lao động.',
    content: `コンビニエンスストアでアルバイトをする外国人を助けるために、新しいスマートフォンのアプリが作られました。
このアプリでは、レジでよく使う「いらっしゃいませ」「ポイントカードはお持ちですか」「温めますか」などの会話を練習できます。
音声を聞いて自分の声を録音すると、AIが発音の正しさを教えてくれます。
日本に来たばかりの留学生は「お客さんの言葉が早くて聞き取れないことがありましたが、アプリで練習して自信がつきました」と話していました。
いろいろな国から来た人たちが、安心して日本で働ける仕組みが広がっています。`,
    viTranslation: `Một ứng dụng di động mới vừa được phát triển nhằm hỗ trợ các bạn trẻ nước ngoài làm thêm tại các cửa hàng tiện lợi Konbini.
Ứng dụng cung cấp các mẫu câu thông dụng nhất tại quầy thu ngân như: "Kính chào quý khách", "Quý khách có thẻ tích điểm không ạ?", "Quý khách có cần hâm nóng đồ ăn không?".
Khi bạn nghe và nói lại theo mẫu, AI sẽ phân tích và hướng dẫn chỉnh sửa phát âm sao cho tự nhiên nhất.
Một bạn du học sinh vừa sang Nhật chia sẻ: "Lúc đầu em nghe khách nói nhanh không hiểu kịp, nhưng nhờ luyện tập trên ứng dụng em đã tự tin hơn rất nhiều khi đứng quầy".`
  }
];

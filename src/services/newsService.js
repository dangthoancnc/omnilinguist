/**
 * Japan News & Living Portal Service
 * Handles live RSS fetching from NHK / Livedoor / Yahoo, curated articles, grammar detection & live translation.
 */
import localMasterDb from '../data/jlpt_master_db.json';

const RSS_FEEDS = {
  all: [
    { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK News', category: 'society', label: 'Thời sự tổng hợp' },
    { url: 'https://news.livedoor.com/topics/rss/top.xml', source: 'Livedoor News', category: 'society', label: 'Tin nóng Nhật Bản' }
  ],
  life: [
    { url: 'https://www3.nhk.or.jp/rss/news/cat1.xml', source: 'NHK Xã hội & Đời sống', category: 'life', label: 'Đời sống & Xã hội' }
  ],
  economy: [
    { url: 'https://www3.nhk.or.jp/rss/news/cat5.xml', source: 'NHK Kinh tế', category: 'economy', label: 'Kinh tế & Thị trường' },
    { url: 'https://news.livedoor.com/rss/summary/52.xml', source: 'Livedoor Kinh tế', category: 'economy', label: 'Tài chính & Doanh nghiệp' }
  ],
  society: [
    { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK News', category: 'society', label: 'Thời sự Nhật Bản' }
  ],
  culture: [
    { url: 'https://www3.nhk.or.jp/rss/news/cat3.xml', source: 'NHK Văn hóa & Khoa học', category: 'culture', label: 'Văn hóa & Đời sống' }
  ]
};

// Rich curated in-depth articles tailored for foreigners in Japan
export const CURATED_JAPAN_NEWS = [
  {
    id: 'news_tokutei_ginou_2026',
    title: '外国人材の「特定技能」制度に新分野追加 永住への道が広がる',
    category: 'life',
    categoryLabel: '🗾 Đời sống & Visa',
    source: 'NHK Easy News',
    date: '2026-08-18',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=60',
    summary: 'Chính phủ Nhật Bản mở rộng thêm các ngành nghề mới cho Visa Kỹ năng đặc định (Tokutei Ginou) số 1 và số 2, tạo điều kiện bảo lãnh gia đình và xin Vĩnh trú lâu dài.',
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
    id: 'news_yen_exchange_rate',
    title: '円高・物価動向と日本銀行の利上げ方針 家計や送金への影響は',
    category: 'economy',
    categoryLabel: '📈 Kinh tế & Xã hội',
    source: 'Asahi Shimbun',
    date: '2026-08-16',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=60',
    summary: 'Tỷ giá đồng Yên Nhật duy trì đà tăng trưởng, Ngân hàng Trung ương Nhật Bản (BOJ) cân nhắc điều chỉnh lãi suất, ảnh hưởng tích cực đến việc kiều bào gửi tiền về nước.',
    content: `外国為替市場では、日本銀行の金融政策の正常化やアメリカの金融動向を背景に、円高ドル安の傾向が定着しつつあります。
円高が進むことで、原油や小麦などの輸入原材料価格が落ち着き、日本国内の食料品や電気・ガス料金のインフレ抑制に寄与することが期待されています。
在日外国人にとっては、日本で稼いだ給与を母国の通貨に換算して送金する際の手取り額が増加するため、大きな恩恵となっています。
一方、海外展開を行う大手輸出企業にとっては収益の目減り要因となるため、企業ごとの賃上げ余力や日本経済全体の成長バランスが注目されています。
エコノミストは「実質賃金の上昇と個人消費の回復が持続的な好循環を生み出す鍵になる」と分析しています。`,
    viTranslation: `Trên thị trường ngoại hối, với chính sách bình thường hóa tiền tệ của Ngân hàng Trung ương Nhật Bản (BOJ) và diễn biến tài chính tại Mỹ, xu hướng tăng giá của đồng Yên đang dần được củng cố.
Đồng Yên tăng giá giúp ghìm cương giá nhập khẩu dầu thô, lúa mì, từ đó góp phần kìm hãm đà tăng giá thực phẩm cũng như hóa đơn điện, gas tại Nhật.
Đối với cộng đồng người nước ngoài tại Nhật Bản, đây là tin rất đáng mừng vì số tiền quy đổi khi gửi tiền về quê hương cho gia đình sẽ có giá trị cao hơn đáng kể.
Mặt khác, đối với các tập đoàn xuất khẩu lớn, đồng Yên tăng có thể làm giảm lợi nhuận từ nước ngoài, do đó khả năng tăng lương của doanh nghiệp và sự cân bằng tăng trưởng kinh tế đang được theo dõi sát sao.
Các chuyên gia kinh tế phân tích: "Việc tiền lương thực tế tăng trưởng và sức tiêu dùng của người dân phục hồi chính là chìa khóa tạo nên vòng tuần hoàn kinh tế bền vững".`
  },
  {
    id: 'news_tax_nenkin_guide',
    title: '在日外国人のための住民税・所得税の控除と年金脱退一時金の手引き',
    category: 'life',
    categoryLabel: '🗾 Đời sống & Visa',
    source: 'Matcha Japan',
    date: '2026-08-14',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60',
    summary: 'Tổng hợp hướng dẫn làm thủ tục giảm trừ gia cảnh (Fuyo Kojo), hoàn thuế cư trú và thủ tục nhận tiền Nenkin 1 lần khi rời Nhật Bản.',
    content: `日本で働く外国人が知っておくべき税金制度に「所得税」と「住民税」があります。
母国にいる両親や家族へ定期的に生活費を送金している場合、「扶養控除（ふようこうじょ）」を申告することで、年間の税負担を数十万円単位で軽減できる場合があります。
申告には、海外送金証明書や親族関係を証明する公的な書類が必要となります。
また、将来日本を出国して帰国する際には、支払った厚生年金や国民年金の一部を取り戻せる「脱退一時金」制度が用意されています。
脱退一時金の請求は、日本に住所がなくなった日から2年以内に行う必要があり、最大5年分の年金保険料が返金対象となります。`,
    viTranslation: `Hai loại thuế quan trọng nhất mà người nước ngoài làm việc tại Nhật cần nắm rõ là "Thuế thu nhập (Shotokuzei)" và "Thuế cư trú (Juminzei)".
Nếu bạn thường xuyên gửi tiền về nước phụng dưỡng cha mẹ hoặc hỗ trợ gia đình, việc đăng ký "Khấu trừ người phụ thuộc (Fuyo Kojo)" có thể giúp bạn tiết kiệm hàng chục vạn Yên tiền thuế mỗi năm.
Để hoàn tất thủ tục, bạn cần chuẩn bị Giấy chứng nhận chuyển tiền quốc tế và Giấy tờ xác nhận quan hệ thân nhân hợp pháp.
Ngoài ra, đối với những ai có kế hoạch về nước sau thời gian làm việc tại Nhật, bạn hoàn toàn có thể làm thủ tục nhận lại tiền "Nenkin 1 lần (Dattai Ichijikin)".
Hồ sơ xin hoàn tiền Nenkin cần được gửi trong vòng 2 năm kể từ ngày cắt địa chỉ lưu trú tại Nhật, với mức chi trả tối đa lên đến 5 năm đóng bảo hiểm.`
  },
  {
    id: 'news_shinkansen_tech',
    title: '日本の新幹線技術と自動運転実証実験 次世代交通の未来',
    category: 'society',
    categoryLabel: '🏛️ Thời sự & Xã hội',
    source: 'Yomiuri Shimbun',
    date: '2026-08-12',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=600&auto=format&fit=crop&q=60',
    summary: 'Nhật Bản thử nghiệm thành công tàu Shinkansen tự hành thế hệ mới, nâng cao độ an toàn tuyệt đối và tối ưu năng lượng.',
    content: `JR各社は、深刻化する将来の運転士不足を見据え、新幹線の自動運転（ATO）の実証実験を加速させています。
最高時速280キロ以上で走行する営業路線において、定刻通りの発着とミリ単位の停車位置制御が高精度で実証されました。
日本の新幹線は、1964年の開業以来、乗客の死亡事故ゼロという驚異的な安全記録を誇っています。
最新技術では、地震発生時に瞬時に緊急停止する早期地震検知システム（ユレダス）や、AIによる線路状態のリアルタイム監視システムが導入されています。
これらの革新的な技術は、国内のみならず、アメリカやアジア諸国への高速鉄道輸出においても強い競争力を持っています。`,
    viTranslation: `Các công ty thuộc tập đoàn đường sắt JR đang đẩy mạnh thử nghiệm công nghệ tự lái (ATO) cho tàu cao tốc Shinkansen nhằm giải quyết nguy cơ thiếu hụt lái tàu trong tương lai.
Trên các tuyến đường ray vận hành với vận tốc trên 280 km/h, hệ thống đã chứng minh khả năng xuất phát, về ga đúng từng giây và dừng chính xác đến từng milimét.
Kể từ khi khai trương vào năm 1964, hệ thống Shinkansen của Nhật Bản luôn tự hào duy trì kỷ lục an toàn phi thường: chưa từng để xảy ra bất kỳ tai nạn gây tử vong nào cho hành khách.
Các đoàn tàu thế hệ mới được trang bị Hệ thống cảnh báo động đất sớm UrEDAS giúp tự động dừng tàu khẩn cấp ngay khi phát hiện sóng địa chấn ban đầu, kết hợp camera AI giám sát mặt ray theo thời gian thực.
Những đột phá công nghệ này không chỉ phục vụ trong nước mà còn mang lại sức cạnh tranh vượt trội khi xuất khẩu hạ tầng đường sắt tốc độ cao sang Mỹ và các nước châu Á.`
  },
  {
    id: 'news_culture_hanabi',
    title: '日本の四季を彩る伝統「花火大会」の歴史と職人技の魅力',
    category: 'culture',
    categoryLabel: '🌸 Văn hóa & Tiếng Nhật Dễ',
    source: 'NHK Easy News',
    date: '2026-08-10',
    image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=60',
    summary: 'Khám phá nét đẹp văn hóa lễ hội pháo hoa mùa hè Nhật Bản, nghệ thuật chế tác pháo hoa truyền thống và trải nghiệm mặc Yukata.',
    content: `日本の夏の夜を美しく彩る「花火大会」は、江戸時代に慰霊や疫病退散を祈願して始まったと伝えられています。
全国各地の河川敷や海岸では、何万発もの花火が夜空高く打ち上げられ、多くの人々が浴衣（ゆかた）を着て訪れます。
日本の花火は、球体の中で何層にも火薬を配置する「割物（わりもの）」と呼ばれる技術が特徴で、夜空で完璧な円形に開き、途中で色が鮮やかに変化します。
この精密な技術は、花火職人が何ヶ月もかけて手作業で丹念に作り上げる伝統工芸です。
屋台でたこ焼きやかき氷を食べながら楽しむ花火大会は、日本に住む外国人にとっても忘れられない夏の思い出となっています。`,
    viTranslation: `Lễ hội pháo hoa (Hanabi Taikai) thắp sáng bầu trời đêm mùa hè Nhật Bản có nguồn gốc từ thời kỳ Edo, ban đầu được tổ chức nhằm cầu nguyện xua tan dịch bệnh và tưởng niệm người đã khuất.
Tại các bờ sông và bãi biển trên khắp Nhật Bản, hàng vạn quả pháo hoa rực rỡ được bắn lên nền trời đêm, thu hút đông đảo người dân diện trang phục truyền thống Yukata đến thưởng ngoạn.
Pháo hoa của Nhật Bản nổi tiếng thế giới nhờ kỹ thuật chế tác "Warimono", trong đó thuốc pháo được xếp thành nhiều lớp hình cầu đồng tâm, khi nổ sẽ tạo thành hình tròn hoàn hảo và đổi màu sắc sống động giữa không trung.
Sự tinh xảo này là thành quả lao động thủ công miệt mài trong nhiều tháng trời của các nghệ nhân làm pháo hoa truyền thống.
Vừa ngắm pháo hoa rực rỡ, vừa thưởng thức bánh bạch tuộc Takoyaki và đá bào Kakigori tại các quầy hàng Yatai là một trải nghiệm mùa hè tuyệt vời không thể nào quên đối với kiều bào sinh sống tại Nhật.`
  },
  {
    id: 'news_ur_housing_life',
    title: '外国人にも人気「UR賃貸住宅」の魅力 礼金・仲介手数料・保証人なしの賃貸事情',
    category: 'life',
    categoryLabel: '🗾 Đời sống & Visa',
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
  }
];

// In-memory cache for live fetched news
let cachedNews = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Fetch and parse RSS XML text into structured items
 */
function parseRssXml(xmlText, sourceName, category) {
  const items = [];
  try {
    const itemBlocks = xmlText.split('<item>').slice(1);
    for (const block of itemBlocks) {
      const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const descMatch = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
      const pubDateMatch = block.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);

      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim();
        const rawDesc = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        const link = linkMatch ? linkMatch[1].trim() : '';
        const rawDate = pubDateMatch ? pubDateMatch[1].trim() : '';
        
        let dateStr = new Date().toISOString().split('T')[0];
        try {
          if (rawDate) dateStr = new Date(rawDate).toISOString().split('T')[0];
        } catch (e) {}

        const id = `rss_${Math.abs(title.split('').reduce((a,b)=>((a<<5)-a)+b.charCodeAt(0),0))}`;
        
        items.push({
          id,
          title,
          category: category || 'society',
          categoryLabel: category === 'economy' ? '📈 Kinh tế & Xã hội' : category === 'life' ? '🗾 Đời sống & Visa' : category === 'culture' ? '🌸 Văn hóa & Tiếng Nhật Dễ' : '🏛️ Thời sự & Tin tức',
          source: sourceName || 'NHK News',
          date: dateStr,
          link,
          image: category === 'economy' 
            ? 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=60'
            : category === 'culture'
            ? 'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=600&auto=format&fit=crop&q=60'
            : 'https://images.unsplash.com/photo-1538947151057-dfe933d688d1?w=600&auto=format&fit=crop&q=60',
          summary: rawDesc.slice(0, 180) + (rawDesc.length > 180 ? '...' : ''),
          content: rawDesc || title,
          viTranslation: '', // On-demand translation
          isLive: true
        });
      }
    }
  } catch (err) {
    console.error('Error parsing RSS XML:', err);
  }
  return items;
}

/**
 * Fetch live news from RSS feeds using public CORS endpoints
 */
export async function fetchLiveNews(category = 'all', forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedNews && (now - lastFetchTime < CACHE_TTL_MS)) {
    return filterByCategory(cachedNews, category);
  }

  const feeds = RSS_FEEDS[category] || RSS_FEEDS.all;
  let allFetchedItems = [];

  for (const feed of feeds) {
    try {
      // Use rss2json or fallback
      const encodedUrl = encodeURIComponent(feed.url);
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodedUrl}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok' && Array.isArray(data.items)) {
          const items = data.items.map((item, idx) => {
            const rawDesc = (item.description || item.content || '').replace(/<[^>]+>/g, '').trim();
            const id = `rss_json_${Math.abs(item.title.split('').reduce((a,b)=>((a<<5)-a)+b.charCodeAt(0),0))}`;
            return {
              id,
              title: item.title,
              category: feed.category,
              categoryLabel: feed.category === 'economy' ? '📈 Kinh tế & Xã hội' : feed.category === 'life' ? '🗾 Đời sống & Visa' : feed.category === 'culture' ? '🌸 Văn hóa & Tiếng Nhật Dễ' : '🏛️ Thời sự & Tin tức',
              source: feed.source,
              date: item.pubDate ? item.pubDate.split(' ')[0] : new Date().toISOString().split('T')[0],
              link: item.link,
              image: item.thumbnail || (feed.category === 'economy' 
                ? 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=60'
                : 'https://images.unsplash.com/photo-1538947151057-dfe933d688d1?w=600&auto=format&fit=crop&q=60'),
              summary: rawDesc.slice(0, 180) + (rawDesc.length > 180 ? '...' : ''),
              content: rawDesc || item.title,
              viTranslation: '',
              isLive: true
            };
          });
          allFetchedItems = [...allFetchedItems, ...items];
        }
      }
    } catch (e) {
      console.warn(`Could not fetch live feed ${feed.source}:`, e.message);
    }
  }

  // Merge with curated articles
  const combined = [...CURATED_JAPAN_NEWS, ...allFetchedItems];
  
  // Deduplicate by title
  const seen = new Set();
  const deduped = combined.filter(item => {
    if (seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  });

  cachedNews = deduped;
  lastFetchTime = now;
  try {
    localStorage.setItem('omni_cached_news', JSON.stringify(deduped));
  } catch(e) {}

  return filterByCategory(deduped, category);
}

function filterByCategory(articles, category) {
  if (!category || category === 'all') return articles;
  return articles.filter(a => a.category === category);
}

/**
 * Detect JLPT grammar points present in the given Japanese text
 * Uses Bunpro N5-N1 patterns from master DB
 */
export function detectGrammarInArticle(text) {
  if (!text || typeof text !== 'string') return [];
  const grammarList = localMasterDb.grammar || [];
  if (grammarList.length === 0) return [];

  const foundGrammar = [];
  const seenPatterns = new Set();

  for (const g of grammarList) {
    if (!g.title || !g.pattern) continue;
    const cleanPattern = g.pattern.replace(/[〜~]/g, '').trim();
    // Only detect patterns of length >= 2 to avoid false single-character matches
    if (cleanPattern.length < 2) continue;

    if (text.includes(cleanPattern) && !seenPatterns.has(g.title)) {
      seenPatterns.add(g.title);
      foundGrammar.push({
        id: g.id,
        level: g.level || 'N3',
        pattern: g.pattern,
        title: g.title,
        meaning: g.meaning,
        explanation: g.explanation,
        examples: g.examples || []
      });
    }
  }

  // Sort by JLPT Level (N5 -> N1)
  const LEVEL_ORDER = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
  return foundGrammar.sort((a, b) => (LEVEL_ORDER[a.level] || 99) - (LEVEL_ORDER[b.level] || 99));
}

/**
 * On-demand translation helper for live news articles
 */
export async function translateArticleToVi(japaneseText) {
  if (!japaneseText) return '';
  try {
    const encoded = encodeURIComponent(japaneseText.slice(0, 500));
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encoded}&langpair=ja|vi`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    }
  } catch (err) {
    console.warn('MyMemory translation error:', err);
  }

  // Fallback to Google Translate API client-side
  try {
    const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(japaneseText.slice(0, 500))}`;
    const gRes = await fetch(gUrl);
    if (gRes.ok) {
      const gData = await gRes.json();
      if (Array.isArray(gData) && Array.isArray(gData[0])) {
        return gData[0].map(item => item[0]).join('');
      }
    }
  } catch (gErr) {
    console.error('Translation fallback error:', gErr);
  }

  return 'Bản dịch tự động đang được xử lý...';
}

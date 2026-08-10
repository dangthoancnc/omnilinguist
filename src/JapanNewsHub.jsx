import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Newspaper, Globe, BookOpen, Volume2, Sparkles, ExternalLink, ArrowRight, 
  Search, Bookmark, Plus, Loader, CheckCircle, RefreshCw, Layers, ShieldCheck, 
  Briefcase, HeartHandshake, Eye, VolumeX, PencilLine, Share2
} from 'lucide-react';
import FuriganaText from './components/FuriganaText';
import SelectionDictionary from './components/SelectionDictionary';

// Curated News Articles Database (Tailored for Foreigners in Japan, Economy, Life & Easy Japanese)
const JAPAN_NEWS_DATABASE = [
  {
    id: 'news_visa_2026',
    title: '外国人材の特定技能制度に新しい分野を追加へ (Nhật Bản bổ sung ngành nghề mới cho Visa Kỹ năng đặc định)',
    category: 'life',
    categoryLabel: '🗾 Đời sống & Visa',
    source: 'NHK Easy News',
    date: '2026-08-11',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=60',
    summary: 'Chính phủ Nhật Bản công bố kế hoạch mở rộng các ngành nghề áp dụng Visa Kỹ năng đặc địnhTokutei Ginou nhằm hỗ trợ lao động nước ngoài làm việc và định cư lâu dài.',
    content: `出入国在留管理庁は、外国人材を受け入れる「特定技能」制度について、新たに自動車運送業や鉄道などの分野を追加する方針を固めました。
少子高齢化に伴う深刻な人手不足に対応するためで、政府は閣議決定を経て、今年度中の運用開始を目指しています。
特定技能2号を取得することで、将来的に家族を日本に呼び寄せたり、在留期間の更新上限がなくなったりするため、多くの外国人労働者から注目を集めています。
専門家は「日本での長期的なキャリア形成が可能となり、外国人にとってより魅力的な働く環境が整う」と評価しています。`,
    viTranslation: `Cục Quản lý Xuất nhập cảnh và Lưu trú Nhật Bản đã quyết định bổ sung thêm các lĩnh vực như vận tải ô tô và đường sắt vào chế độ "Kỹ năng đặc định".
Động thái này nhằm ứng phó với tình trạng thiếu hụt lao động nghiêm trọng do tỷ lệ sinh giảm và gióng lão hóa dân số. Chính phủ hướng tới bắt đầu áp dụng trong năm nay.
Việc đạt được Kỹ năng đặc định số 2 sẽ cho phép bảo lãnh gia đình sang Nhật và không còn giới hạn thời gian gia hạn lưu trú, thu hút sự chú ý của đông đảo lao động nước ngoài.
Các chuyên gia đánh giá "Điều này giúp người nước ngoài có thể xây dựng sự nghiệp lâu dài tại Nhật Bản và tạo ra môi trường làm việc hấp dẫn hơn".`
  },
  {
    id: 'news_economy_yen',
    title: '為替相場 円高傾向が続く 日本経済への影響は (Tỷ giá đồng Yên duy trì xu hướng tăng - Ảnh hưởng tới kinh tế)',
    category: 'economy',
    categoryLabel: '📈 Kinh tế & Xã hội',
    source: 'Asahi Shimbun',
    date: '2026-08-10',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=60',
    summary: 'Tỷ giá đồng Yên Nhật đang có dấu hiệu phục hồi mạnh mẽ, mang lại nhiều lợi ích cho kiều bào gửi tiền về nước và người mua sắm đồ nhập khẩu.',
    content: `外国為替市場では、日本銀行の金融政策の変更やアメリカの金利動向を受けて、円高ドル安が進んでいます。
円高の進行により、輸入品の価格が下がり、食料品やエネルギーコストの負担軽減が期待されています。
一方で、輸出企業にとっては業績の押し下げ要因となるため、日本経済全体の成長にどのような影響を与えるかが注目されています。
在日外国人にとっては、母国への送金効率が高まるため、歓迎の声が多く聞かれます。`,
    viTranslation: `Trên thị trường ngoại hối, do sự thay đổi chính sách tiền tệ của Ngân hàng Trung ương Nhật Bản và xu hướng lãi suất Mỹ, đồng Yên đang tăng giá so với đồng USD.
Đồng Yên tăng giá giúp hạ giá thành hàng hóa nhập khẩu, kỳ vọng giảm bớt chi phí thực phẩm và năng lượng.
Mặt khác, đối với các doanh nghiệp xuất khẩu, đây là yếu tố làm giảm doanh thu nên ảnh hưởng tổng thể tới kinh tế Nhật Bản đang được theo dõi sát sao.
Đối với cộng đồng người nước ngoài tại Nhật, việc gửi tiền về quê hương đạt hiệu quả cao hơn nên nhận được nhiều sự hoan nghênh.`
  },
  {
    id: 'news_life_tax',
    title: '在日外国人のための住民税と所得税の手続きガイド (Hướng dẫn thuế cư trú và thuế thu nhập cho người nước ngoài)',
    category: 'life',
    categoryLabel: '🗾 Đời sống & Visa',
    source: 'Matcha Japan',
    date: '2026-08-09',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60',
    summary: 'Tổng hợp các quy định mới nhất về thủ tục hoàn thuế, khấu trừ người phụ thuộc và miễn giảm thuế cư trú năm 2026.',
    content: `日本で働く外国人が毎年行う大切な手続きに「年末調整」と「確定申告」があります。
扶養控除を正しく申請することで、所得税や住民税の負担を大幅に軽減することができます。
母国に住む家族へ送金している場合は、送金証明書や親族関係書類を提出する必要があります。
自治体の窓口では、多言語での相談対応やオンライン手続きの導入が進んでおり、以前よりも手続きが簡単になっています。`,
    viTranslation: `Một trong những thủ tục quan trọng hàng năm của người nước ngoài làm việc tại Nhật là "Điều chỉnh thuế cuối năm" và "Kê khai thuế cá nhân".
Đăng ký đúng khấu trừ phụ thuộc sẽ giúp giảm đáng kể chi phí Thuế thu nhập và Thuế cư trú.
Trường hợp gửi tiền cho người thân ở quê nhà, bạn cần nộp Giấy chứng nhận gửi tiền và Giấy chứng minh quan hệ nhân thân.
Các văn phòng chính quyền địa phương đang đẩy mạnh tư vấn đa ngôn ngữ và làm thủ tục online, giúp việc kê khai trở nên dễ dàng hơn nhiều.`
  },
  {
    id: 'news_culture_cherry',
    title: '日本の四季を楽しむ 夏の風物詩「花火大会」が各地で開催 (Thưởng thức lễ hội pháo hoa mùa hè Nhật Bản)',
    category: 'culture',
    categoryLabel: '🌸 Tiếng Nhật & Văn hóa',
    source: 'NHK Easy News',
    date: '2026-08-08',
    image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=60',
    summary: 'Không khí lễ hội mùa hè nở rộ khắp xứ sở hoa anh đào với các buổi bắn pháo hoa hoành tráng và mặc áo Yukata truyền thống.',
    content: `夏の訪れとともに、全国各地で伝統的な花火大会が開催されています。
夜空を彩る大輪の花火を見ようと、浴衣を着た大勢の人々が会場に集まっています。
屋台では、かき氷やたこ焼きなどの美味しい食べ物が売られ、日本の夏ならではの賑やかな雰囲気を楽しむことができます。
外国人観光客にとっても、日本の伝統文化を間近で体験できる絶好の機会となっています。`,
    viTranslation: `Cùng với sự ghé thăm của mùa hè, các lễ hội pháo hoa truyền thống đang được tổ chức khắp cả nước.
Rất đông người mặc áo Yukata tập trung tại khán đài để ngắm nhìn những bông pháo hoa rực rỡ thắp sáng bầu trời đêm.
Tại các quầy hàng Yatai, những món ăn ngon như đá bào Kakigori hay bánh bạch tuộc Takoyaki được bày bán, tạo nên không khí nhộn nhịp đặc trưng mùa hè Nhật.
Đối với du khách nước ngoài, đây là cơ hội tuyệt vời để trải nghiệm trực tiếp văn hóa truyền thống Nhật Bản.`
  }
];

const JapanNewsHub = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // AI Reader tools inside article modal
  const [showBilingual, setShowBilingual] = useState(true);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1);

  // Filtered articles
  const filteredArticles = JAPAN_NEWS_DATABASE.filter(art => {
    const matchesCat = activeCategory === 'all' || art.category === activeCategory;
    const matchesSearch = !searchKeyword.trim() || 
      art.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
      art.summary.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // TTS Reader logic
  const handlePlayTts = (text) => {
    if (!text || !window.speechSynthesis) return;
    if (isPlayingTts) {
      window.speechSynthesis.cancel();
      setIsPlayingTts(false);
      return;
    }

    setIsPlayingTts(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = ttsSpeed * 0.9;
    
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
    if (jpVoice) utterance.voice = jpVoice;

    utterance.onend = () => setIsPlayingTts(false);
    utterance.onerror = () => setIsPlayingTts(false);
    window.speechSynthesis.speak(utterance);
  };

  // Transfer article to Shadowing Studio 1-Click
  const handleTransferToShadowing = (article) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    // Parse content into sentences
    const rawSentences = article.content.split('\n').filter(s => s.trim().length > 0);
    let currentTime = 0;
    const segments = rawSentences.map(st => {
      const duration = Math.max(3, Math.round(st.length * 0.28 * 10) / 10);
      const seg = {
        start: currentTime,
        duration: duration,
        text: st.endsWith('。') ? st : st + '。',
        vi: '',
        startOffset: 0,
        endOffset: 0
      };
      currentTime += duration + 0.5;
      return seg;
    });

    const session = {
      title: article.title,
      segments: segments,
      currentSegIdx: 0,
      scores: {}
    };
    
    // Save to local storage for Shadowing Studio to load
    const savedStore = JSON.parse(localStorage.getItem('omni_shadowing_session_v3') || '{}');
    if (!savedStore.sessionStore) savedStore.sessionStore = {};
    savedStore.sessionStore.web = session;
    savedStore.activeTab = 'web';
    localStorage.setItem('omni_shadowing_session_v3', JSON.stringify(savedStore));

    navigate('/shadowing');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '88vh' }}>
      
      {/* SELECTION DICTIONARY GLOBAL POPUP */}
      <SelectionDictionary />

      {/* TOP HEADER PORTAL BANNER */}
      <div className="glass-panel" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Newspaper size={24} color="#60a5fa" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'white' }}>Japan News Hub & Living Portal</h1>
            <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>v1.0 · Live</span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Trang tổng hợp tin tức Đời sống, Visa người nước ngoài, Kinh tế Nhật Bản tích hợp <b>Đọc AI, Dịch Song Ngữ & Shadowing 1-Click</b>.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: 20, border: '1px solid var(--glass-border)' }}>
          <Search size={16} color="var(--text-tertiary)"/>
          <input 
            type="text" 
            placeholder="Tìm tin tức, visa, đời sống..." 
            value={searchKeyword} 
            onChange={e => setSearchKeyword(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.85rem', width: 180 }}
          />
        </div>
      </div>

      {/* CATEGORY FILTERS */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'all', label: '🌐 Tất cả Tin tức' },
          { id: 'life', label: '🗾 Đời sống & Visa Người nước ngoài' },
          { id: 'economy', label: '📈 Kinh tế & Xã hội Nhật Bản' },
          { id: 'culture', label: '🌸 Tiếng Nhật Dễ & Văn hóa' }
        ].map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`btn ${activeCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap', borderRadius: 20 }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ARTICLES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, flex: 1 }}>
        {filteredArticles.map(art => (
          <div 
            key={art.id}
            className="glass-panel"
            style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', transition: 'transform 0.2s, boxShadow 0.2s', cursor: 'pointer' }}
            onClick={() => setSelectedArticle(art)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Article Image Banner */}
            <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: '#000' }}>
              <img src={art.image} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
              <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>
                {art.categoryLabel}
              </div>
              <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                {art.source} · {art.date}
              </div>
            </div>

            {/* Article Text Content */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', lineHeight: 1.4, color: 'white' }} className="jp-text">
                {art.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {art.summary}
              </p>

              {/* Card Footer Actions */}
              <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookOpen size={14}/> Đọc bài
                </span>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleTransferToShadowing(art); }}
                  className="btn btn-primary" 
                  style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Volume2 size={13}/> 🗣️ Shadowing
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ARTICLE READER MODAL (FULL AI LEARNING TOOLS) */}
      {selectedArticle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          
          <div className="glass-panel" style={{ width: '90%', maxWidth: 850, maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid var(--glass-border-strong)', animation: 'fadeIn 0.25s' }}>
            
            {/* Modal Header & AI Toolbar */}
            <div style={{ padding: '16px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>
                  {selectedArticle.categoryLabel}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{selectedArticle.source}</span>
              </div>

              {/* AI Tools Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setShowBilingual(prev => !prev)}
                  className={`btn ${showBilingual ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Globe size={13}/> {showBilingual ? 'Ẩn Dịch Việt' : '🌐 Dịch Song Ngữ'}
                </button>

                <select value={ttsSpeed} onChange={e => setTtsSpeed(parseFloat(e.target.value))} style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', fontSize: '0.78rem' }}>
                  <option value={0.75}>0.75x (Chậm)</option>
                  <option value={1}>1.0x (Chuẩn)</option>
                  <option value={1.25}>1.25x (Nhanh)</option>
                </select>

                <button 
                  onClick={() => handlePlayTts(selectedArticle.content)}
                  className={`btn ${isPlayingTts ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4, background: isPlayingTts ? '#10b981' : 'transparent' }}
                >
                  {isPlayingTts ? <VolumeX size={13}/> : <Volume2 size={13}/>} {isPlayingTts ? 'Dừng Đọc' : '🔊 Đọc AI'}
                </button>

                <button 
                  onClick={() => handleTransferToShadowing(selectedArticle)}
                  className="btn btn-primary"
                  style={{ padding: '4px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Volume2 size={13}/> 🗣️ Luyện Shadowing
                </button>

                <button onClick={() => { if(window.speechSynthesis) window.speechSynthesis.cancel(); setSelectedArticle(null); setIsPlayingTts(false); }} className="btn-ghost" style={{ padding: 4 }}>
                  <X size={20}/>
                </button>
              </div>

            </div>

            {/* Modal Body: Content + Bilingual & Interactive Word Selection */}
            <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <h2 style={{ margin: 0, fontSize: '1.4rem', lineHeight: 1.5, color: 'white' }} className="jp-text">
                <FuriganaText text={selectedArticle.title} />
              </h2>

              <div style={{ fontSize: '0.8rem', color: '#10b981', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: 6, display: 'inline-block' }}>
                💡 <b>Mẹo học tập:</b> Bôi đen (highlight) bất kỳ từ nào trong bài báo để mở tra từ điển Hán-Việt, Ngữ pháp và nút <b>[➕ Lưu vào Flashcards FSRS]</b>.
              </div>

              {/* Japanese Sentences + Vietnamese Translation */}
              <div style={{ fontSize: '1.15rem', lineHeight: 2.0, color: '#e2e8f0' }}>
                {selectedArticle.content.split('\n').map((paragraph, pIdx) => {
                  const viParagraph = selectedArticle.viTranslation.split('\n')[pIdx] || '';
                  return (
                    <div key={pIdx} style={{ marginBottom: 20 }}>
                      <div className="jp-text" style={{ whiteSpace: 'pre-wrap' }}>
                        <FuriganaText text={paragraph} />
                      </div>
                      {showBilingual && viParagraph && (
                        <div style={{ fontSize: '0.95rem', color: '#94a3b8', borderLeft: '3px solid #3b82f6', paddingLeft: 12, marginTop: 4, fontStyle: 'italic', lineHeight: 1.6 }}>
                          {viParagraph}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default JapanNewsHub;

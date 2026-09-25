// v10.2 — Executive Adaptive Roadmap & Sprint Command Center (SLA + FSRS)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, Brain, Mic, BookOpen, PencilLine, ChevronRight, CheckCircle2, Lock, 
  ArrowRight, Flag, BarChart2, AlertCircle, Layers, Play, RotateCcw, Compass, 
  Clock, Check, Sparkles, Award, ArrowUpRight, Flame, Calendar, RefreshCw, Zap
} from 'lucide-react';
import { saveUserProfile, getUserProfile, advancePhase, getTodayStats } from './studyStore.js';
import { JLPT_LEVEL_COLORS } from './theme';

export const GOALS = [
  { id: 'N5', label: 'N5', sub: 'Sơ cấp Khởi đầu', months: 2, hours: 1.5, color: JLPT_LEVEL_COLORS.N5, desc: 'Chữ cái Kana, 200 từ vựng nền tảng, 40 Kanji cơ bản, đọc truyện Ehon có Furigana.' },
  { id: 'N4', label: 'N4', sub: 'Sơ cấp Hoàn chỉnh', months: 3, hours: 2, color: JLPT_LEVEL_COLORS.N4, desc: 'Ngữ pháp liên kết, 350 từ vựng N4, giao tiếp đời thường, đọc tin NHK News Web Easy.' },
  { id: 'N3', label: 'N3', sub: 'Trung cấp', months: 3, hours: 2, color: JLPT_LEVEL_COLORS.N3, desc: 'Đọc báo đơn giản, giao tiếp cơ bản công sở, viết email ngắn và tài liệu phổ thông.' },
  { id: 'N2', label: 'N2', sub: 'Cao cấp', months: 6, hours: 2, color: JLPT_LEVEL_COLORS.N2, desc: 'Làm việc độc lập bằng tiếng Nhật, đọc tài liệu chuyên ngành, viết báo cáo kinh doanh.' },
  { id: 'N1', label: 'N1', sub: 'Thành thạo', months: 12, hours: 2, color: JLPT_LEVEL_COLORS.N1, desc: 'Thành thạo gần như người bản xứ, đọc hiểu văn học xã luận, thuyết trình chuyên sâu.' },
];

export const ROADMAP = {
  N5: [
    {
      phase: 1, 
      title: 'Chữ Cái & 200 Từ Đầu Tiên (Tháng 1)', 
      icon: '🌱', 
      color: '#10b981', 
      method: 'Nhận diện mặt chữ & FSRS SRS',
      desc: 'Nắm chắc 100% Hiragana, Katakana và các quy tắc biến âm (dakuon, youon, xúc âm). Nạp 200 từ vựng N5 cốt lõi kèm phát âm bản xứ.',
      tasks: [
        { id: 'n5p1t1', label: 'Flashcards: 10 từ N5/ngày (FSRS)', time: 15, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' },
        { id: 'n5p1t2', label: 'Luyện viết chữ & Bộ thủ Kanji', time: 20, route: '/kanji', icon: <PencilLine size={15}/>, studio: 'Kanji Studio' },
        { id: 'n5p1t3', label: 'Nghe phát âm bảng chữ cái chuẩn Tokyo', time: 15, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' },
        { id: 'n5p1t4', label: 'Học 2 mẫu ngữ pháp N5 cơ bản (Trợ từ は/が/を)', time: 20, route: '/grammar', icon: <BookOpen size={15}/>, studio: 'Grammar Studio' }
      ],
      milestone: 'Thuộc làu 100% bảng Kana, nắm vững 200 từ vựng cơ bản và 40 chữ Kanji sơ cấp.',
      checklist: [
        'Đọc trôi chảy bảng chữ cái Hiragana và Katakana không vấp',
        'Nắm vững 200 từ vựng căn bản qua thuật toán FSRS',
        'Làm quen 40 chữ Hán N5 và các bộ thủ nền tảng',
        'Hiểu bản chất 4 trợ từ trọng tâm: は, が, を, に'
      ]
    },
    {
      phase: 2, 
      title: 'Đọc Hiểu Truyện Tranh & Đề N5 (Tháng 2)', 
      icon: '📖', 
      color: '#3b82f6', 
      method: 'Comprehensible Input (Ehon/Manga) + Mock Test',
      desc: 'Áp dụng Krashen SLA với truyện thiếu nhi Ehon có Audio song ngữ và Furigana. Shadowing các câu chào hỏi giao tiếp cơ bản và thi thử N5.',
      tasks: [
        { id: 'n5p2t1', label: 'Đọc 1 truyện tranh Ehon có Audio song ngữ', time: 20, route: '/reading', icon: <BookOpen size={15}/>, studio: 'Immersion Reader' },
        { id: 'n5p2t2', label: 'FSRS ôn từ vựng & Kanji N5 đến hạn', time: 20, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' },
        { id: 'n5p2t3', label: 'Shadowing 5 câu chào hỏi hàng ngày', time: 20, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' },
        { id: 'n5p2t4', label: 'Làm đề thi thử N5 trọn gói', time: 30, route: '/mocktest', icon: <Target size={15}/>, studio: 'Mock Test Studio' }
      ],
      milestone: 'Đọc hiểu truyện Ehon không cần tra từ nhiều, đạt trên 80% điểm thi thử N5.',
      checklist: [
        'Đọc hết 10 câu chuyện Ehon song ngữ kèm Audio',
        'Phản xạ Shadowing phát âm chuẩn các câu giao tiếp cơ bản',
        'Vượt qua bài thi thử JLPT N5 với số điểm an toàn > 100/180'
      ]
    }
  ],

  N4: [
    {
      phase: 1, 
      title: 'Xây Nền N4 & Mở Rộng Từ Vựng (Tháng 1)', 
      icon: '🧱', 
      color: '#3b82f6', 
      method: 'Active Recall & Spaced Repetition (FSRS)',
      desc: 'Nạp 350 từ mới N4, hệ thống hóa các thể động từ cơ bản (thể Te, Ta, Nai, Từ điển, Thể Khả Năng, Ý Định).',
      tasks: [
        { id: 'n4p1t1', label: 'FSRS: Ôn tập + 10 từ N4 mới mỗi ngày', time: 20, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' },
        { id: 'n4p1t2', label: 'Hệ thống hóa thể biến đổi động từ N4', time: 25, route: '/grammar', icon: <BookOpen size={15}/>, studio: 'Grammar Studio' },
        { id: 'n4p1t3', label: 'Luyện 5 chữ Kanji N4 theo nét chuẩn', time: 20, route: '/kanji', icon: <PencilLine size={15}/>, studio: 'Kanji Studio' },
        { id: 'n4p1t4', label: 'Đọc truyện ngắn song ngữ cấp độ N4', time: 20, route: '/reading', icon: <BookOpen size={15}/>, studio: 'Immersion Reader' }
      ],
      milestone: 'Chia nhuần nhuyễn 7 thể động từ N4, nhớ 350 từ vựng và 80 Kanji N4.',
      checklist: [
        'Biến đổi tức thì các thể: Te, Ta, Nai, Từ điển, Khả năng',
        'Nắm vững 350 từ vựng cốt lõi cấp độ N4',
        'Đọc trôi chảy các đoạn văn ngắn 100-200 chữ'
      ]
    },
    {
      phase: 2, 
      title: 'Đắm Chìm Tin Tức Dễ & Giao Tiếp (Tháng 2)', 
      icon: '🎙️', 
      color: '#10b981', 
      method: 'Krashen SLA (NHK Easy + Audio Native)',
      desc: 'Luyện nghe hiểu tin tức thời sự NHK News Web Easy, luyện nói nhại giọng (Shadowing) tốc độ tự nhiên và viết nhật ký ngắn.',
      tasks: [
        { id: 'n4p2t1', label: 'Đọc 1 bài báo NHK News Web Easy', time: 20, route: '/news', icon: <BookOpen size={15}/>, studio: 'Japan News Hub' },
        { id: 'n4p2t2', label: 'Shadowing bản tin giọng chuẩn NHK', time: 25, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' },
        { id: 'n4p2t3', label: 'FSRS ôn thẻ từ vựng đến hạn', time: 20, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' },
        { id: 'n4p2t4', label: 'Viết nhật ký ngắn 3-5 câu (AI chấm điểm)', time: 20, route: '/email', icon: <PencilLine size={15}/>, studio: 'Writing Studio' }
      ],
      milestone: 'Nghe hiểu bài báo NHK Easy không cần nhìn phụ đề, phản xạ Shadowing kịp tốc độ phát thanh.',
      checklist: [
        'Nghe hiểu 80% bản tin NHK Easy với tốc độ 1.0x',
        'Tích lũy tối thiểu 10 giờ đắm chìm Krashen SLA',
        'Tự viết câu giao tiếp đời sống không mắc lỗi ngữ pháp cơ bản'
      ]
    },
    {
      phase: 3, 
      title: 'Luyện Đề N4 & Về Đích (Tháng 3)', 
      icon: '🏆', 
      color: '#f59e0b', 
      method: 'Mock Test Simulator & Weakness Workout',
      desc: 'Luyện bộ đề thi JLPT N4 đầy đủ 3 phần: Từ vựng/Chữ hán, Ngữ pháp/Đọc hiểu, Nghe hiểu. Quét sạch các lỗ hổng kiến thức.',
      tasks: [
        { id: 'n4p3t1', label: 'Làm đề thi thử N4 (Reading/Listening)', time: 35, route: '/mocktest', icon: <Target size={15}/>, studio: 'Mock Test Studio' },
        { id: 'n4p3t2', label: 'FSRS: Ôn tập trung các thẻ điểm yếu Retrievability < 70%', time: 20, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' },
        { id: 'n4p3t3', label: 'Ôn tổng hợp 60 mẫu ngữ pháp N4', time: 25, route: '/grammar', icon: <BookOpen size={15}/>, studio: 'Grammar Studio' }
      ],
      milestone: 'Đạt 110+/180 điểm thi thử JLPT N4 chính thức, sẵn sàng bước sang N3.',
      checklist: [
        'Hoàn thành ít nhất 3 bộ đề thi thử N4 đầy đủ',
        'Điểm số mô phỏng đạt trên 110 điểm',
        'Thời gian làm bài thực tế dưới hạn mức quy định'
      ]
    }
  ],

  N3: [
    {
      phase: 1, 
      title: 'Xây Nền & Kích Hoạt Từ Vựng (Tháng 1)', 
      icon: '🧱', 
      color: '#10b981', 
      method: 'SRS + Active Recall',
      desc: 'Kích hoạt lại vốn từ N3 đã học, xây dựng phản xạ cơ bản. Nạp 10 từ/ngày bằng thuật toán FSRS và củng cố 50 mẫu ngữ pháp N3 trọng tâm.',
      tasks: [
        { id: 'p1t1', label: 'Ôn 10 từ N3/ngày (FSRS)', time: 20, route: '/flashcards', icon: <BookOpen size={15}/>, studio: 'Flashcards FSRS' },
        { id: 'p1t2', label: 'Nghe Podcast thụ động & Audio tin tức', time: 30, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' },
        { id: 'p1t3', label: 'Học 2 mẫu ngữ pháp/ngày', time: 20, route: '/grammar', icon: <Brain size={15}/>, studio: 'Grammar Studio' },
        { id: 'p1t4', label: 'Shadowing câu hội thoại trung cấp', time: 30, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' }
      ],
      milestone: 'Nhớ vững 300 từ N3, đọc hiểu trơn tru các câu văn trung cấp trên NHK Easy.',
      checklist: [
        'Thuộc và ghi nhớ 300 từ vựng N3 cốt lõi',
        'Nắm vững 50 mẫu ngữ pháp trung cấp cơ bản',
        'Đọc hiểu bài báo tin tức mức độ trung bình không cần dịch từng từ'
      ]
    },
    {
      phase: 2, 
      title: 'Bứt Phá Input Thực Tế (Tháng 2)', 
      icon: '🚀', 
      color: '#3b82f6', 
      method: 'Comprehensible Input (i+1)',
      desc: 'Tăng tốc bằng Input thực tế. Đọc báo NHK Easy hàng ngày, Shadowing câu công sở, tập viết câu tự do và email cơ bản.',
      tasks: [
        { id: 'p2t1', label: 'Đọc 1 bài NHK News Web Easy', time: 20, route: '/news', icon: <BookOpen size={15}/>, studio: 'Japan News Hub' },
        { id: 'p2t2', label: 'FSRS ôn từ + thêm 10 từ mới', time: 25, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' },
        { id: 'p2t3', label: 'Shadowing câu công sở N3', time: 30, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' },
        { id: 'p2t4', label: 'Viết email ngắn (AI review chấm lỗi)', time: 25, route: '/email', icon: <PencilLine size={15}/>, studio: 'Writing Studio' }
      ],
      milestone: 'Đọc hiểu 70% NHK Easy, viết được email xin phép nghỉ hoặc thông báo công việc.',
      checklist: [
        'Đọc hiểu 70% nội dung báo chí tiếng Nhật đơn giản',
        'Viết hoàn chỉnh email giao tiếp công sở ngắn',
        'Đạt 15 giờ thụ đắc Comprehensible Input'
      ]
    },
    {
      phase: 3, 
      title: 'Vượt Mốc N3 & Thi Thử (Tháng 3)', 
      icon: '🏆', 
      color: '#f59e0b', 
      method: 'Output + Mock Test Simulator',
      desc: 'Luyện đề thi N3, củng cố điểm yếu. Dành 50% thời gian vào Reading và Listening thực chiến với đồng hồ bấm giờ chuẩn JLPT.',
      tasks: [
        { id: 'p3t1', label: 'Mock Test N3 (Reading/Listening 30p)', time: 30, route: '/mocktest', icon: <Target size={15}/>, studio: 'Mock Test Studio' },
        { id: 'p3t2', label: 'Shadowing audio N3 tốc độ cao', time: 30, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' },
        { id: 'p3t3', label: 'Ngữ pháp N3 ôn tổng hợp 100 mẫu', time: 30, route: '/grammar', icon: <BookOpen size={15}/>, studio: 'Grammar Studio' },
        { id: 'p3t4', label: 'Viết bài luận ngắn 100-150 chữ', time: 30, route: '/email', icon: <PencilLine size={15}/>, studio: 'Writing Studio' }
      ],
      milestone: 'Đạt 100+/180 điểm Mock Test N3 → Tự tin vượt ải kỳ thi thật.',
      checklist: [
        'Vượt qua 3 bài thi thử N3 với điểm số > 100',
        'Không để bị điểm liệt bất kỳ phần nào (Từ vựng, Đọc, Nghe)',
        'Sẵn sàng đăng ký kỳ thi JLPT N3 chính thức'
      ]
    },
  ],

  N2: [
    {
      phase: 1, 
      title: 'Củng Cố N3 + Bắt Đầu N2 (Tháng 1-2)', 
      icon: '🧱', 
      color: '#10b981', 
      method: 'SRS Interleaving',
      desc: 'Song song củng cố từ N3 bằng FSRS và nạp từ N2 mới. Bắt đầu làm quen với tài liệu công ty, email dự án bằng tiếng Nhật.',
      tasks: [
        { id: 'n2p1t1', label: 'FSRS: Ôn N3 + 8 từ N2 mới', time: 25, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' },
        { id: 'n2p1t2', label: 'Đọc bài báo tiếng Nhật chuyên ngành', time: 25, route: '/news', icon: <BookOpen size={15}/>, studio: 'Japan News Hub' },
        { id: 'n2p1t3', label: 'Shadowing tin tức bản xứ tốc độ 1.0x', time: 35, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' },
        { id: 'n2p1t4', label: 'Viết email báo cáo tiến độ công việc', time: 30, route: '/email', icon: <PencilLine size={15}/>, studio: 'Writing Studio' }
      ],
      milestone: 'Nắm 500 từ N2, đọc hiểu email công ty 80%, viết báo cáo đúng thể văn trang trọng.',
      checklist: [
        'Làm chủ 500 từ vựng N2 đầu tiên trong FSRS',
        'Đọc hiểu 80% email công việc hàng ngày',
        'Shadowing bắt kịp nhịp độ bản tin phổ thông'
      ]
    },
    {
      phase: 2, 
      title: 'Native Input & Đắm Chìm (Tháng 3-4)', 
      icon: '🎯', 
      color: '#3b82f6', 
      method: 'Immersion + Active Output',
      desc: 'Chuyển dịch sang tài liệu người bản xứ hoàn toàn. Xem tin tức YouTube tiếng Nhật, đọc sách kinh doanh, phân tích ngữ cảnh cao cấp.',
      tasks: [
        { id: 'n2p2t1', label: 'Đắm chìm video/audio bản xứ 30p', time: 30, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' },
        { id: 'n2p2t2', label: 'FSRS ôn thẻ đến hạn + nạp từ chuyên ngành', time: 20, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' },
        { id: 'n2p2t3', label: 'Ngữ pháp N2 nâng cao (Thể kính ngữ, khiêm nhường ngữ)', time: 25, route: '/grammar', icon: <BookOpen size={15}/>, studio: 'Grammar Studio' },
        { id: 'n2p2t4', label: 'Viết báo cáo chuyên môn 200 chữ', time: 30, route: '/email', icon: <PencilLine size={15}/>, studio: 'Writing Studio' }
      ],
      milestone: 'Nghe hiểu 60% hội thoại bản xứ, viết báo cáo độc lập không cần từ điển hỗ trợ.',
      checklist: [
        'Đạt 40 giờ thụ đắc Krashen SLA',
        'Nắm vững hệ thống kính ngữ Keigo giao tiếp thương mại',
        'Tự tin đọc hiểu tài liệu hướng dẫn kỹ thuật'
      ]
    },
    {
      phase: 3, 
      title: 'Làm Chủ N2 & Chiến Thuật Thi (Tháng 5-6)', 
      icon: '🏆', 
      color: '#8b5cf6', 
      method: 'Output + Mock Test Simulator',
      desc: 'Giải đề thi thực tế JLPT N2, rèn luyện kỹ năng đọc lướt (skimming & scanning), shadowing tốc độ 1.2x để bứt phá phản xạ.',
      tasks: [
        { id: 'n2p3t1', label: 'Giải đề thi thử N2 chuẩn cấu trúc', time: 45, route: '/mocktest', icon: <Target size={15}/>, studio: 'Mock Test Studio' },
        { id: 'n2p3t2', label: 'Shadowing N2 tốc độ cao 1.2x', time: 30, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' },
        { id: 'n2p3t3', label: 'FSRS Sweep: Quét toàn bộ điểm yếu N2', time: 25, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' }
      ],
      milestone: 'Đạt 105+/180 điểm Mock Test N2, sẵn sàng chinh phục chứng chỉ quốc tế.',
      checklist: [
        'Vượt qua 5 bài thi thử N2 với điểm số an toàn',
        'Tốc độ đọc đạt 350-400 chữ/phút',
        'Thành thạo kỹ năng bắt keyword trong phần Nghe hiểu'
      ]
    }
  ],

  N1: [
    {
      phase: 1, 
      title: 'Xây Nền N1 & Kho Ngữ Liệu Lớn (Tháng 1-4)', 
      icon: '🧱', 
      color: '#8b5cf6', 
      method: 'Native Immersion + SRS Heavy',
      desc: 'Đọc tiểu thuyết, báo chí chuyên ngành kinh tế xã hội. Mỗi ngày thêm 15 từ N1 vào FSRS. Shadowing tin tức NHK phát thanh viên tốc độ gốc.',
      tasks: [
        { id: 'n1p1t1', label: 'Đọc 10 trang tiểu thuyết hoặc bài phân tích kinh tế', time: 30, route: '/news', icon: <BookOpen size={15}/>, studio: 'Japan News Hub' },
        { id: 'n1p1t2', label: 'FSRS: 15 từ vựng & Kanji N1/ngày', time: 25, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' },
        { id: 'n1p1t3', label: 'Shadowing tin tức NHK phát thanh viên gốc', time: 30, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' },
        { id: 'n1p1t4', label: 'Viết bài luận quan điểm xã hội 300 chữ', time: 35, route: '/email', icon: <PencilLine size={15}/>, studio: 'Writing Studio' }
      ],
      milestone: 'Nắm 2,000 từ N1, đọc hiểu tài liệu học thuật và văn học 70%.',
      checklist: [
        'Nhớ 2,000 từ vựng và 500 Kanji N1 phức tạp',
        'Hiểu các thành ngữ, quán dụng ngữ và từ tượng thanh tượng hình',
        'Đọc lướt văn bản học thuật với độ chính xác cao'
      ]
    },
    {
      phase: 2, 
      title: 'Đỉnh Cao Thực Chiến & Thuyết Trình (Tháng 5-8)', 
      icon: '⚡', 
      color: '#3b82f6', 
      method: 'Nuance Analysis & High-Speed Input',
      desc: 'Phân tích các sắc thái ngữ nghĩa tinh tế của ngữ pháp N1. Đắm chìm vào các buổi tranh luận, hội thảo chuyên gia tiếng Nhật.',
      tasks: [
        { id: 'n1p2t1', label: 'Phân biệt sắc thái các cặp ngữ pháp N1 dễ nhầm', time: 30, route: '/grammar', icon: <BookOpen size={15}/>, studio: 'Grammar Studio' },
        { id: 'n1p2t2', label: 'Shadowing hội thảo & diễn thuyết thương mại', time: 30, route: '/shadowing', icon: <Mic size={15}/>, studio: 'Shadowing Studio' },
        { id: 'n1p2t3', label: 'FSRS củng cố điểm yếu N1', time: 25, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' }
      ],
      milestone: 'Tự tin thuyết trình và tranh luận bằng tiếng Nhật không gặp rào cản ngữ nghĩa.',
      checklist: [
        'Phân biệt rõ ràng hơn 100 cặp ngữ pháp sắc thái tương đồng',
        'Tích lũy trên 80 giờ thụ đắc ngôn ngữ đắm chìm',
        'Tốc độ nghe hiểu tự nhiên như tiếng mẹ đẻ'
      ]
    },
    {
      phase: 3, 
      title: 'Chinh Phục JLPT N1 Toàn Diện (Tháng 9-12)', 
      icon: '🏆', 
      color: '#ef4444', 
      method: 'Master Simulator & Time Management',
      desc: 'Luyện đề thi thử N1 bấm giờ nghiêm ngặt, rèn luyện sự bền bỉ tinh thần và chiến lược phân bổ thời gian bài thi 170 phút.',
      tasks: [
        { id: 'n1p3t1', label: 'Làm đề thi thử trọn gói N1 có bấm giờ', time: 60, route: '/mocktest', icon: <Target size={15}/>, studio: 'Mock Test Studio' },
        { id: 'n1p3t2', label: 'Rà soát lỗi sai và ghi chú vào Flashcards', time: 30, route: '/flashcards', icon: <Brain size={15}/>, studio: 'Flashcards FSRS' }
      ],
      milestone: 'Đạt 115+/180 điểm Mock Test N1, sẵn sàng chinh phục đỉnh cao chứng chỉ JLPT N1.',
      checklist: [
        'Vượt qua ít nhất 4 bài thi thử N1 với số điểm đạt chuẩn',
        'Hoàn thành phần Đọc hiểu trong thời gian quy định',
        'Tự tin bước vào kỳ thi chính thức với phong độ cao nhất'
      ]
    }
  ]
};

const Roadmap = () => {
  const [profile, setProfile] = useState(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [formData, setFormData] = useState({ currentLevel: 'N4', goal: 'N3', timePerDay: 2 });
  const [inspectPhaseIdx, setInspectPhaseIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const p = getUserProfile();
    const activeGoal = p?.goal || p?.targetLevel;
    if (activeGoal) {
      setProfile({ ...p, goal: activeGoal });
      setInspectPhaseIdx(p?.currentPhase || 0);
    } else {
      setIsSettingUp(true);
    }
  }, []);

  const handleFinishSetup = () => {
    const newProfile = { 
      ...formData, 
      targetLevel: formData.goal,
      goal: formData.goal,
      currentPhase: 0, 
      startDate: new Date().toISOString() 
    };
    const selectedGoal = GOALS.find(g => g.id === formData.goal);
    if (selectedGoal) newProfile.goalLabel = selectedGoal.label;
    
    saveUserProfile(newProfile);
    setProfile(newProfile);
    setInspectPhaseIdx(0);
    setIsSettingUp(false);
  };

  const handleQuickSwitchGoal = (newGoalId) => {
    if (profile?.goal === newGoalId) return;
    const goalObj = GOALS.find(g => g.id === newGoalId);
    const updated = {
      ...profile,
      goal: newGoalId,
      targetLevel: newGoalId,
      goalLabel: goalObj?.label || newGoalId,
      currentPhase: 0,
      startDate: new Date().toISOString()
    };
    saveUserProfile(updated);
    setProfile(updated);
    setInspectPhaseIdx(0);
  };

  const handleConfigureNewRoadmap = () => {
    setSetupStep(1);
    setFormData({
      currentLevel: profile?.currentLevel || 'N4',
      goal: profile?.goal || 'N3',
      timePerDay: profile?.timePerDay || 2
    });
    setIsSettingUp(true);
  };

  const handleResetCurrentRoadmap = () => {
    if (window.confirm(`Bạn có chắc muốn đặt lại ngày bắt đầu và học lại Lộ trình ${profile?.goal || 'hiện tại'} từ Phase 1 (Ngày 1)?`)) {
      const resetProf = {
        ...profile,
        currentPhase: 0,
        startDate: new Date().toISOString()
      };
      saveUserProfile(resetProf);
      setProfile(resetProf);
      setInspectPhaseIdx(0);
    }
  };

  const handleAdvance = () => {
    if (window.confirm("Chúc mừng bạn đã hoàn thành giai đoạn hiện tại! Bạn đã sẵn sàng chuyển sang giai đoạn tiếp theo chưa?")) {
      advancePhase();
      const updated = getUserProfile();
      setProfile(updated);
      setInspectPhaseIdx(updated?.currentPhase || 0);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // ONBOARDING / CONFIGURATION MODAL (EXECUTIVE STYLE)
  // ═══════════════════════════════════════════════════════════════════
  if (isSettingUp) {
    return (
      <div style={{ maxWidth: 840, margin: '24px auto', padding: '0 16px', width: '100%' }}>
        <div className="glass-panel" style={{ 
          padding: '36px 32px', 
          borderRadius: 20,
          background: 'var(--bg-surface)', 
          border: '1px solid var(--glass-border-strong)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
        }}>
          {/* Top header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent-primary, #3b82f6), #8b5cf6)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: 14,
              boxShadow: '0 4px 14px rgba(59,130,246,0.3)'
            }}>
              <Compass size={24} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Khởi Tạo Lộ Trình Học Tập Cá Nhân Hóa
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              OmniLinguist tự động thiết kế lộ trình theo giai đoạn Sprint kết hợp Krashen SLA & FSRS
            </p>

            {/* Stepper Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18 }}>
              {[1, 2, 3].map(step => (
                <div key={step} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: setupStep === step ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: setupStep === step ? '#fff' : 'var(--text-tertiary)',
                  border: `1px solid ${setupStep === step ? 'transparent' : 'var(--glass-border)'}`
                }}>
                  <span>Bước {step}</span>
                  {setupStep > step && <Check size={12} />}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: Trình độ hiện tại */}
          {setupStep === 1 && (
            <div className="fade-in">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)', textAlign: 'center' }}>
                Trình độ Nhật ngữ hiện tại của bạn là gì?
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
                {[
                  { id: 'N5', label: 'Khởi đầu / Chưa biết gì', desc: 'Bắt đầu từ bảng chữ cái Kana' },
                  { id: 'N4', label: 'Sơ cấp (N4)', desc: 'Đã thuộc Kana, biết ~100 Kanji' },
                  { id: 'N3', label: 'Trung cấp (N3)', desc: 'Giao tiếp cơ bản, đọc câu đơn giản' },
                  { id: 'N2', label: 'Cao cấp (N2)', desc: 'Hiểu tin tức, làm việc cơ bản' },
                ].map((item) => {
                  const isSel = formData.currentLevel === item.id;
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => { setFormData(f => ({ ...f, currentLevel: item.id })); setSetupStep(2); }}
                      style={{
                        padding: '18px 16px',
                        borderRadius: 14,
                        background: isSel ? 'rgba(59,130,246,0.12)' : 'var(--bg-card)',
                        border: `2px solid ${isSel ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }}
                      onMouseEnter={e => !isSel && (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                      onMouseLeave={e => !isSel && (e.currentTarget.style.borderColor = 'var(--glass-border)')}
                    >
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isSel ? 'var(--accent-primary)' : 'var(--text-primary)', marginBottom: 4 }}>
                        {item.id}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {item.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Mục tiêu muốn đạt được */}
          {setupStep === 2 && (
            <div className="fade-in">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)', textAlign: 'center' }}>
                Mục tiêu chứng chỉ hoặc trình độ bạn hướng tới?
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {GOALS.map(g => {
                  const isSel = formData.goal === g.id;
                  return (
                    <div 
                      key={g.id} 
                      onClick={() => { setFormData(f => ({ ...f, goal: g.id })); setSetupStep(3); }}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 14,
                        background: isSel ? `${g.color}15` : 'var(--bg-card)',
                        border: `2px solid ${isSel ? g.color : 'var(--glass-border)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 16,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => !isSel && (e.currentTarget.style.borderColor = g.color)}
                      onMouseLeave={e => !isSel && (e.currentTarget.style.borderColor = 'var(--glass-border)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: `${g.color}22`,
                          color: g.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.15rem'
                        }}>
                          {g.label}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                            {g.label} — {g.sub}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            {g.desc}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: g.color, background: `${g.color}18`, padding: '4px 10px', borderRadius: 20 }}>
                          ⏱️ ~{g.months} tháng
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Thời gian học mỗi ngày */}
          {setupStep === 3 && (
            <div className="fade-in">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)', textAlign: 'center' }}>
                Bạn cam kết dành bao nhiêu thời gian học mỗi ngày?
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                {[1, 1.5, 2, 3].map(h => {
                  const isSel = formData.timePerDay === h;
                  return (
                    <div 
                      key={h} 
                      onClick={() => setFormData(f => ({ ...f, timePerDay: h }))}
                      style={{
                        padding: '16px 12px',
                        borderRadius: 14,
                        background: isSel ? 'rgba(59,130,246,0.12)' : 'var(--bg-card)',
                        border: `2px solid ${isSel ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isSel ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        {h}h
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {h <= 1 ? 'Duy trì nhẹ nhàng' : h <= 2 ? 'Tiến độ tiêu chuẩn' : 'Tăng tốc tối đa'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Card */}
              <div style={{
                padding: '16px 20px',
                borderRadius: 14,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--glass-border)',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Tóm tắt Lộ trình dự kiến
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                    Đầu vào {formData.currentLevel} ➔ Mục tiêu {formData.goal} ({formData.timePerDay}h/ngày)
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>
                    {ROADMAP[formData.goal]?.length || 3} Giai đoạn Sprint
                  </span>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>
                    Chuẩn Krashen SLA + FSRS
                  </span>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 12 }} 
                onClick={handleFinishSetup}
              >
                Kích Hoạt Lộ Trình Ngay <ArrowRight size={18} style={{ marginLeft: 8 }}/>
              </button>
            </div>
          )}

          {/* Bottom Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
            {setupStep > 1 ? (
              <button 
                onClick={() => setSetupStep(s => s - 1)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                ← Quay lại bước trước
              </button>
            ) : <div />}

            {profile && (
              <button 
                onClick={() => setIsSettingUp(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ✕ Hủy (Giữ lộ trình {profile.goal} hiện tại)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ROADMAP MAIN VIEW (ENTERPRISE COMMAND CENTER)
  // ═══════════════════════════════════════════════════════════════════
  if (!profile) return null;

  const currentGoalId = profile.goal || 'N3';
  const goalInfo = GOALS.find(g => g.id === currentGoalId) || GOALS[2];
  const phases = ROADMAP[currentGoalId] || ROADMAP['N3'] || [];
  const currentPhaseIdx = Math.min(profile.currentPhase || 0, Math.max(0, phases.length - 1));
  const activePhase = phases[currentPhaseIdx] || phases[0] || {};
  const safeInspectIdx = Math.min(inspectPhaseIdx, Math.max(0, phases.length - 1));
  const inspectedPhase = phases[safeInspectIdx] || activePhase || {};

  // Timeline calculation
  const startDate = profile?.startDate ? new Date(profile.startDate) : new Date();
  const now = new Date();
  const validStartTime = isNaN(startDate.getTime()) ? now.getTime() : startDate.getTime();
  const daysActive = Math.max(1, Math.floor((now.getTime() - validStartTime) / 86400000) + 1);
  const totalDays = (goalInfo.months || 3) * 30;
  const progressPercent = Math.min(100, Math.round((daysActive / totalDays) * 100)) || 0;

  return (
    <div className="page-shell-content" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 18, 
      paddingBottom: 40
    }}>
      
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. EXECUTIVE HEADER STRIP: GOAL STATUS & QUICK SELECTOR */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        padding: '8px 4px 0 4px'
      }}>
        {/* Left: Branding & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${goalInfo.color} 0%, #3b82f6 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: `0 3px 10px ${goalInfo.color}44`
          }}>
            <Compass size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.3 }}>
                OmniLinguist Adaptive Roadmap
              </h2>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                background: `${goalInfo.color}18`, 
                color: goalInfo.color, 
                padding: '2px 8px', 
                borderRadius: 6, 
                border: `1px solid ${goalInfo.color}33` 
              }}>
                Mục tiêu {goalInfo.label} ({goalInfo.sub})
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              Lộ trình chia theo Sprint khoa học · Phối hợp Krashen Comprehensible Input & Thuật toán FSRS
            </p>
          </div>
        </div>

        {/* Right: Quick Level Switcher & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Quick Level Pills */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)',
            borderRadius: 10,
            padding: 3,
            gap: 2
          }}>
            {GOALS.map(g => {
              const isCurrent = g.id === currentGoalId;
              return (
                <button
                  key={g.id}
                  onClick={() => handleQuickSwitchGoal(g.id)}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: 7,
                    fontSize: '0.78rem',
                    fontWeight: isCurrent ? 800 : 500,
                    cursor: 'pointer',
                    background: isCurrent ? g.color : 'transparent',
                    color: isCurrent ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s'
                  }}
                  title={`Chuyển nhanh sang lộ trình ${g.label}`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          <button 
            onClick={handleConfigureNewRoadmap} 
            className="btn btn-outline"
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.8rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              borderRadius: 8
            }}
            title="Đổi trình độ đầu vào hoặc thiết lập thời lượng học mới"
          >
            ⚙️ Thiết Lập Mới
          </button>

          <button 
            onClick={handleResetCurrentRoadmap} 
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--glass-border)', 
              padding: '6px 12px', 
              borderRadius: 8, 
              color: 'var(--text-tertiary)', 
              cursor: 'pointer', 
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
            title="Đặt lại từ Ngày 1 của lộ trình hiện tại"
          >
            <RotateCcw size={13} /> Học lại
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. EXECUTIVE 4-METRIC KPI STRIP */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 12
      }}>
        {/* Metric 1: Cấp độ & Trọng tâm */}
        <div className="glass-panel" style={{
          padding: '14px 18px',
          borderRadius: 14,
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: `${goalInfo.color}18`,
            color: goalInfo.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem'
          }}>
            <Flag size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Cấp Độ Mục Tiêu
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              JLPT {goalInfo.label} — {goalInfo.sub}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Đầu vào: {profile.currentLevel || 'N5'} • {profile.timePerDay || 2} tiếng/ngày
            </div>
          </div>
        </div>

        {/* Metric 2: Sprint Phase Hiện Tại */}
        <div className="glass-panel" style={{
          padding: '14px 18px',
          borderRadius: 14,
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'rgba(59,130,246,0.15)',
            color: 'var(--accent-primary, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Target size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Giai Đoạn Đang Học
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Phase {currentPhaseIdx + 1} / {phases.length}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activePhase?.title}
            </div>
          </div>
        </div>

        {/* Metric 3: Tiến Độ Thời Gian (Days Active) */}
        <div className="glass-panel" style={{
          padding: '14px 18px',
          borderRadius: 14,
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'rgba(16,185,129,0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                Thời Gian Kỷ Luật
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: goalInfo.color }}>
                {progressPercent}%
              </span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {daysActive} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>/ {totalDays} ngày</span>
            </div>
            <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: goalInfo.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
            </div>
          </div>
        </div>

        {/* Metric 4: Tiêu Chuẩn Nghiệm Thu (Milestone) */}
        <div className="glass-panel" style={{
          padding: '14px 18px',
          borderRadius: 14,
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'rgba(245,158,11,0.15)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Tiêu Chuẩn Vượt Ải
            </div>
            <div style={{ 
              fontSize: '0.82rem', 
              fontWeight: 600, 
              color: 'var(--text-secondary)', 
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }} title={activePhase?.milestone}>
              {activePhase?.milestone}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3. INTERACTIVE SPRINT PIPELINE (MACRO STEPPER BAR) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        borderRadius: 14,
        background: 'var(--bg-surface)',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Tiến Trình Chuyển Đổi Sprint (Pipeline)
            </span>
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
            Nhấp vào từng giai đoạn để xem trước kế hoạch chi tiết
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${phases.length}, 1fr)`,
          gap: 12,
          position: 'relative'
        }}>
          {phases.map((p, i) => {
            const isCompleted = i < currentPhaseIdx;
            const isCurrent = i === currentPhaseIdx;
            const isInspected = i === inspectPhaseIdx;
            
            return (
              <div 
                key={i}
                onClick={() => setInspectPhaseIdx(i)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: isInspected 
                    ? `${p.color}15` 
                    : isCurrent 
                      ? 'var(--bg-elevated)' 
                      : 'var(--bg-card)',
                  border: `1.5px solid ${isInspected ? p.color : isCompleted ? '#10b98166' : isCurrent ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                {/* Step Circle */}
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: isCompleted 
                    ? '#10b981' 
                    : isCurrent 
                      ? p.color 
                      : 'var(--bg-surface)',
                  color: isCompleted || isCurrent ? '#fff' : 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {isCompleted ? <Check size={15} /> : i + 1}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ 
                      fontSize: '0.68rem', 
                      fontWeight: 800, 
                      textTransform: 'uppercase',
                      color: isCompleted ? '#10b981' : isCurrent ? p.color : 'var(--text-tertiary)'
                    }}>
                      {isCompleted ? '✓ Đã Vượt' : isCurrent ? '● Đang Học' : `Phase ${i + 1}`}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '0.82rem', 
                    fontWeight: 700, 
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {p.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 4. MAIN BENTO GRID: PHASES TIMELINE + EXECUTION COMMAND */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 400px) 1fr',
        gap: 18,
        alignItems: 'start'
      }}>
        
        {/* ── LEFT COLUMN: SPRINT PHASES JOURNEY LIST ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Danh Sách Giai Đoạn ({phases.length} Phases)
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
              Đang xem: Phase {inspectPhaseIdx + 1}
            </span>
          </div>

          {phases.map((p, i) => {
            const isCompleted = i < currentPhaseIdx;
            const isCurrent = i === currentPhaseIdx;
            const isInspected = i === inspectPhaseIdx;
            const isLocked = i > currentPhaseIdx;

            return (
              <div 
                key={i} 
                onClick={() => setInspectPhaseIdx(i)}
                style={{ 
                  padding: '16px 18px', 
                  borderRadius: 14, 
                  border: `2px solid ${isInspected ? p.color : isCurrent ? `${p.color}88` : isCompleted ? 'rgba(16,185,129,0.3)' : 'var(--glass-border)'}`, 
                  background: isInspected 
                    ? `${p.color}10` 
                    : isCurrent 
                      ? 'var(--bg-surface)' 
                      : isCompleted 
                        ? 'var(--bg-surface)' 
                        : 'var(--bg-card)', 
                  cursor: 'pointer',
                  transition: 'all 0.2s', 
                  position: 'relative' 
                }}
                onMouseEnter={e => !isInspected && (e.currentTarget.style.borderColor = p.color)}
                onMouseLeave={e => !isInspected && (e.currentTarget.style.borderColor = isCurrent ? `${p.color}88` : isCompleted ? 'rgba(16,185,129,0.3)' : 'var(--glass-border)')}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.2rem', filter: isLocked ? 'grayscale(100%)' : 'none' }}>{p.icon}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: isCompleted ? 'rgba(16,185,129,0.15)' : isCurrent ? `${p.color}22` : 'var(--bg-elevated)',
                      color: isCompleted ? '#10b981' : isCurrent ? p.color : 'var(--text-tertiary)'
                    }}>
                      Phase {i + 1}
                    </span>
                  </div>

                  {isCompleted ? (
                    <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={15} /> Đã hoàn thành
                    </span>
                  ) : isCurrent ? (
                    <span style={{ fontSize: '0.74rem', color: p.color, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Target size={15} /> Đang tiến hành
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={13} /> Sắp diễn ra
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {p.title}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Phương pháp: <strong style={{ color: p.color }}>{p.method}</strong>
                </div>

                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-tertiary)',
                  background: 'var(--bg-elevated)',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--glass-border)'
                }}>
                  🎯 Cột mốc: {p.milestone}
                </div>
              </div>
            );
          })}

          {/* Strategic Commitment Card */}
          <div className="glass-panel" style={{
            padding: '16px 18px',
            borderRadius: 14,
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} color="var(--accent-primary)" /> Cam Kết Chiến Lược
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tổng thời gian dự kiến:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{totalDays} ngày (~{goalInfo.months} tháng)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Định mức thời gian:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{profile.timePerDay || 2} giờ / ngày</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tổng quỹ giờ học tập:</span>
                <strong style={{ color: goalInfo.color }}>~{totalDays * (profile.timePerDay || 2)} giờ</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: PHASE EXECUTION COMMAND CENTER ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* A. Phase Overview Panel */}
          <div className="glass-panel" style={{
            padding: '22px 24px',
            borderRadius: 16,
            background: 'var(--bg-surface)',
            border: `1px solid var(--glass-border)`,
            borderLeft: `5px solid ${inspectedPhase.color}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 10px',
                    borderRadius: 6,
                    background: `${inspectedPhase.color}20`,
                    color: inspectedPhase.color
                  }}>
                    Chi Tiết Phase {inspectPhaseIdx + 1} / {phases.length}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    • {inspectedPhase.method}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {inspectedPhase.title}
                </h3>
              </div>

              {inspectPhaseIdx === currentPhaseIdx ? (
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: `${inspectedPhase.color}22`,
                  color: inspectedPhase.color,
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: `1px solid ${inspectedPhase.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Target size={14} /> Giai đoạn đang thực hiện
                </span>
              ) : inspectPhaseIdx < currentPhaseIdx ? (
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: 'rgba(16,185,129,0.15)',
                  color: '#10b981',
                  padding: '4px 12px',
                  borderRadius: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <CheckCircle2 size={14} /> Đã hoàn thành
                </span>
              ) : (
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-tertiary)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Lock size={14} /> Giai đoạn tiếp theo
                </span>
              )}
            </div>

            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {inspectedPhase.desc}
            </p>
          </div>

          {/* B. Daily Execution Plan (Interactive Task Hub) */}
          <div className="glass-panel" style={{
            padding: '22px 24px',
            borderRadius: 16,
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={18} color="var(--accent-primary)" /> Kế Hoạch Thực Thi Hàng Ngày
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Tổng thời lượng: {profile.timePerDay || 2} tiếng / ngày · Phân bổ đều các kỹ năng
                </div>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                {inspectedPhase.tasks.length} hạng mục hành động
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {inspectedPhase.tasks.map((task, idx) => (
                <div 
                  key={task.id || idx}
                  onClick={() => navigate(task.route, { state: { level: profile.goal || profile.targetLevel || 'N3' } })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    gap: 12
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = inspectedPhase.color;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: `${inspectedPhase.color}18`,
                      color: inspectedPhase.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {task.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                          {task.studio || 'Studio'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>•</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          Chuẩn Krashen SLA + FSRS
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-surface)',
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--glass-border)'
                    }}>
                      {task.time} phút
                    </span>

                    <button
                      className="btn btn-outline"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      Bắt đầu <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C. Milestone Acceptance Checklist */}
          <div className="glass-panel" style={{
            padding: '20px 24px',
            borderRadius: 16,
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Award size={18} color="#f59e0b" />
              <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Tiêu Chuẩn Nghiệm Thu Vượt Ải (Milestone Acceptance Criteria)
              </h4>
            </div>

            <div style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: `${inspectedPhase.color || '#3b82f6'}10`,
              border: `1px solid ${inspectedPhase.color || '#3b82f6'}33`,
              marginBottom: 14
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: inspectedPhase.color || '#3b82f6' }}>
                🎯 Mốc then chốt: {inspectedPhase.milestone || 'Hoàn thành các mục tiêu của giai đoạn'}
              </div>
            </div>

            {inspectedPhase.checklist && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {inspectedPhase.checklist.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      background: 'rgba(16,185,129,0.15)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}>
                      <Check size={12} />
                    </div>
                    <span style={{ lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* D. Sprint Transition Command Bar */}
          {inspectPhaseIdx === currentPhaseIdx && (
            <div className="glass-panel" style={{
              padding: '18px 24px',
              borderRadius: 16,
              background: `linear-gradient(135deg, ${activePhase.color}15, var(--bg-surface))`,
              border: `1.5px solid ${activePhase.color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: activePhase.color, textTransform: 'uppercase' }}>
                  Điều Khiển Tiến Độ Sprint
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {currentPhaseIdx < phases.length - 1 
                    ? `Bạn đã sẵn sàng để chuyển sang Phase ${currentPhaseIdx + 2}?`
                    : `Chúc mừng bạn! Đã hoàn thành toàn bộ các Phase của lộ trình ${goalInfo.label}!`}
                </div>
              </div>

              {currentPhaseIdx < phases.length - 1 ? (
                <button
                  onClick={handleAdvance}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: activePhase.color,
                    borderColor: activePhase.color
                  }}
                >
                  <CheckCircle2 size={16} /> Chuyển Sang Phase {currentPhaseIdx + 2} <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/mocktest', { state: { level: goalInfo.label } })}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Target size={16} /> Làm Đề Thi Thử {goalInfo.label} Ngay <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Roadmap;


import fs from 'fs';
import path from 'path';

// Format: level|pattern|reading_or_vi_meaning|usage|example
const rawData = `
N5|だ / です|là|N/A|私は学生です。
N5|ではない / じゃない|không phải là|N/A|彼は先生じゃない。
N5|か|không? (câu hỏi)|N/A|お元気ですか。
N5|の|của|N1 の N2|これは私の本です。
N5|から|từ (địa điểm, thời gian)|N/A|日本から来ました。
N5|まで|đến (địa điểm, thời gian)|N/A|東京まで行きます。
N5|より|hơn (so sánh)|N/A|肉より魚が好きです。
N5|が|nhưng / (trợ từ chủ ngữ)|N/A|犬は好きですが、猫は嫌いです。
N5|けれども / けど|nhưng|N/A|高いけど、買います。
N5|を|trợ từ tân ngữ|N/A|水を飲みます。
N5|に|vào lúc, ở, đến|N/A|７時に起きます。
N5|へ|hướng đến|N/A|学校へ行きます。
N5|で|bằng (phương tiện), tại (địa điểm)|N/A|バスで帰ります。
N5|と|và / cùng với|N/A|友達と映画を見ます。
N5|や|và (liệt kê không đầy đủ)|N/A|パンや卵を食べます。
N5|も|cũng|N/A|私も行きます。
N5|だけ|chỉ|N/A|これだけです。
N5|しか～ない|chỉ (nhấn mạnh sự ít ỏi)|N/A|百円しかない。
N5|くらい / ぐらい|khoảng|N/A|５分くらい待ちます。
N5|など|vân vân|N/A|りんごやみかんなどがあります。
N5|ませんか|bạn có muốn... không?|V-ます|一緒に食べませんか。
N5|ましょう|cùng làm nhé|V-ます|行きましょう。
N5|ましょうか|để tôi làm nhé / cùng làm nhé?|V-ます|手伝いましょうか。
N5|てください|hãy làm...|V-て|読んでください。
N5|てもいいです|làm... cũng được (cho phép)|V-て|入ってもいいですか。
N5|てはいけません|không được phép làm...|V-て|ここでタバコを吸ってはいけません。
N5|から|bởi vì|Mệnh đề + から|暑いから、窓を開けます。
N5|ている|đang làm...|V-て|今、本を読んでいます。
N5|たい|muốn làm...|V-ます|日本へ行きたいです。
N5|たり～たりする|lúc thì... lúc thì...|V-た|休みの日は本を読んだり、映画を見たりします。
N4|てみる|thử làm gì đó|V-て|この靴を履いてみます。
N4|てしまう|làm xong / lỡ làm (tiếc nuối)|V-て|ケーキを全部食べてしまった。
N4|ておく|làm trước để chuẩn bị|V-て|ホテルを予約しておく。
N4|てあげる|làm cho ai đó (mình làm cho)|V-て|友達に本を貸してあげる。
N4|てもらう|nhận được việc ai đó làm cho|V-て|先生に教えてもらった。
N4|てくれる|ai đó làm cho mình|V-て|彼が手伝ってくれた。
N4|ば|nếu (điều kiện)|V-ば|安ければ買います。
N4|たら|nếu / sau khi|V-た|雨が降ったら、行きません。
N4|なら|nếu là (đưa ra lời khuyên)|N / V|日本へ行くなら、春がいいですよ。
N4|と|hễ mà (điều kiện tất yếu)|V-る|春になると、花が咲きます。
N4|つもりだ|dự định|V-る|明日、行くつもりです。
N4|予定だ|dự định (có kế hoạch sẵn)|V-る / Nの|来週、出張の予定です。
N4|ために|để / vì (mục đích, nguyên nhân)|V-る / Nの|健康のために、運動します。
N4|ように|để (mục tiêu ngoài tầm kiểm soát)|V-る / V-ない|風邪を引かないように、気をつけます。
N4|ようになる|trở nên có thể...|V-る|日本語が話せるようになりました。
N4|ようにする|cố gắng làm...|V-る / V-ない|毎日野菜を食べるようにしています。
N4|かもしれない|có lẽ|Thể thường|明日は雨かもしれない。
N4|でしょう|chắc là / phải không?|Thể thường|明日も忙しいでしょう。
N4|はずだ|chắc chắn là|Thể thường|彼はもう着いたはずだ。
N4|ようだ / みたいだ|có vẻ như|Thể thường|彼は疲れているようだ。
N4|らしい|nghe nói là / có vẻ như|Thể thường|明日は寒くなるらしい。
N4|すぎる|quá...|V-ます / A(bỏ い)|食べすぎました。
N4|やすい|dễ làm...|V-ます|このペンは書きやすい。
N4|にくい|khó làm...|V-ます|この漢字は覚えにくい。
N4|がる|cảm thấy (ngôi thứ 3)|A(bỏ い)|子供が怖がっている。
N4|なさい|hãy làm (ra lệnh nhẹ nhàng)|V-ます|早く寝なさい。
N4|のに|mặc dù|Thể thường|勉強したのに、テストができなかった。
N3|おかげで|nhờ có... (kết quả tốt)|V-た / Nの|先生のおかげで合格できました。
N3|せいで|tại vì... (kết quả xấu)|V-た / Nの|雨のせいで、試合が中止になった。
N3|かわりに|thay vì / đổi lại|V-る / Nの|車で行くかわりに、電車で行く。
N3|くらい / ぐらい|đến mức|V-る / N|泣きたいくらい痛い。
N3|ほど|tới mức / càng... càng|V-る / N|彼ほど優しい人はいない。
N3|くらいなら|nếu phải... thì thà|V-る|彼に謝るくらいなら、死んだほうがましだ。
N3|に限る|là tốt nhất|V-る / N|暑い日は冷たいビールに限る。
N3|に対して|đối với / ngược lại với|N|お客様に対して失礼なことをしてはいけない。
N3|において|tại, ở (địa điểm, thời gian trang trọng)|N|会議は第一会議室において行われます。
N3|に比べて|so với|N|今年は去年に比べて雨が多い。
N3|によって|do / tùy vào / bằng cách|N|人によって考え方が違う。
N3|たびに|mỗi khi|V-る / Nの|出張のたびに、お土産を買う。
N3|ついでに|nhân tiện|V-る / V-た / Nの|散歩のついでに、手紙を出してきた。
N3|最中に|đúng lúc đang|V-ている / Nの|会議の最中に電話が鳴った。
N3|たとたん|vừa mới... thì lập tức|V-た|ドアを開けたとたん、猫が飛び出した。
N3|っぱなし|để nguyên như vậy|V-ます|水を出しっぱなしにしないで。
N3|とおり|theo như|V-る / V-た / Nの|先生が言ったとおりに書いてください。
N3|ふりをする|giả vờ|Thể thường / Nの|彼は寝ているふりをした。
N3|だらけ|đầy (nghĩa tiêu cực)|N|この部屋はゴミだらけだ。
N3|っこない|tuyệt đối không|V-ます|こんな難しい問題、できっこないよ。
N3|わけがない|làm sao có thể|Thể thường|彼が犯人であるわけがない。
N3|わけではない|không hẳn là|Thể thường|肉が嫌いなわけではない。
N3|しかない|chỉ còn cách|V-る|歩くしかない。
N3|からには|một khi đã... thì|Thể thường|約束したからには、守らなければならない。
N3|切る|làm hết sạch|V-ます|読み切った。
N3|ぎみ|có vẻ hơi|V-ます / N|風邪ぎみだ。
N3|がち|thường hay (tiêu cực)|V-ます / N|遅れがちだ。
N3|向き|phù hợp với|N|この服は子供向きだ。
N3|向け|dành cho|N|これは初心者向けのパソコンだ。
N3|を通じて / を通して|thông qua / trong suốt|N|友人を通じて彼女と知り合った。
N3|っぽい|có vẻ như (tính chất)|N / V-ます|子供っぽい。
N3|とともに|cùng với / đồng thời|N / V-る|家族とともに過ごす。
N3|にともなって|cùng với (sự thay đổi)|N / V-る|人口の増加にともなって、問題が増えた。
N2|に際して|khi / nhân dịp (trang trọng)|N / V-る|帰国に際して、挨拶をした。
N2|を問わず|bất kể|N|年齢を問わず、誰でも参加できます。
N2|にかかわらず|bất chấp / không phân biệt|N / V-るV-ない|天候にかかわらず、試合は行われる。
N2|もかまわず|mặc kệ / chẳng màng đến|N|人目もかまわず泣き出した。
N2|をこめて|gửi gắm (tâm tư)|N|感謝の気持ちをこめて手紙を書く。
N2|をめぐって|xoay quanh (vấn đề)|N|その問題をめぐって議論が交わされた。
N2|に基づいて|dựa trên (căn cứ)|N|データに基づいてレポートを作成した。
N2|に沿って|men theo / bám sát|N|計画に沿って進める。
N2|のもとで|dưới sự (chỉ đạo)|N|先生のもとで学ぶ。
N2|次第|ngay sau khi|V-ます|準備でき次第、ご連絡します。
N2|て以来|kể từ khi|V-て|日本に来て以来、納豆を食べている。
N2|てからでないと|nếu chưa... thì không thể|V-て|相談してからでないと、決められない。
N2|をはじめ|tiêu biểu là / đầu tiên kể đến|N|社長をはじめ、皆様にお世話になりました。
N2|からして|ngay từ... đã|N|あの人は態度からして生意気だ。
N2|にわたって|trải dài / suốt|N|会議は３時間にわたって行われた。
N2|限り|chừng nào còn / trong giới hạn|V-る / N|私が生きている限り、あなたを守る。
N2|ざるを得ない|không còn cách nào khác đành phải|V-ない|休まざるを得ない。
N2|かねない|có khả năng sẽ (xấu)|V-ます|事故を起こしかねない。
N2|まい|tuyệt đối không / chắc là không|V-る|二度と行くまい。
N2|にきまっている|chắc chắn là|Thể thường|ばれるに決まっている。
N2|にほかならない|chính là / không gì khác ngoài|N|これは努力の結果にほかならない。
N2|にすぎない|chỉ là / chẳng qua chỉ là|N / Thể thường|ただの言い訳にすぎない。
N2|上(に)|không những... mà còn|Thể thường|彼は頭がいい上に、性格もいい。
N2|上で|sau khi / khi (chuẩn bị)|V-た / V-る|相談した上で、決める。
N2|上は|một khi đã... thì (trang trọng)|V-る / V-た|約束した上は、守るべきだ。
N2|からいうと / からいえば|xét từ góc độ|N|現状からいうと、難しい。
N2|から見ると / から見れば|nhìn từ góc độ|N|私から見ると、彼は天才だ。
N2|からすると / からすれば|đứng từ lập trường|N|親からすると、子供はいつまでも子供だ。
N2|のことだから|vì là... nên chắc chắn|N|彼のことだから、遅刻するだろう。
N2|だけあって|quả đúng là / xứng đáng với|Thể thường|高いだけあって、おいしい。
N2|にこたえて|đáp ứng lại|N|期待にこたえて頑張る。
N1|すら|thậm chí / ngay cả|N|名前すら書けない。
N1|だに|chỉ cần... đã|V-る / N|想像するだに恐ろしい。
N1|たりとも|dù chỉ là (1 phút, 1 người)|N(số lượng)|１分たりとも無駄にできない。
N1|がてら|nhân tiện|N / V-ます|散歩がてら、タバコを買ってくる。
N1|かたがた|nhân tiện (trang trọng)|N|お礼かたがた、ご挨拶に伺います。
N1|かたわら|bên cạnh việc... thì còn|V-る / Nの|彼は会社員のかたわら、小説を書いている。
N1|ところを|trong lúc (nhờ vả, xin lỗi)|V-ている / Aい|お忙しいところを申し訳ありません。
N1|ものを|giá mà... thì (thể hiện sự tiếc nuối)|Thể thường|言えばいいものを、なぜ黙っていたの。
N1|とはいえ|mặc dù nói là... nhưng|N / Thể thường|春とはいえ、まだ寒い。
N1|といえども|dù là... đi chăng nữa|N / Thể thường|子供といえども、許されない。
N1|と思いきや|tưởng là... nhưng|Thể thường|晴れると思いきや、雨が降った。
N1|まじき|không được phép (đạo đức)|V-る|許すまじき行為だ。
N1|べからず / べからざる|cấm / không được|V-る|芝生に入るべからず。
N1|ゆえに|do đó / vì|Nの / Thể thường|貧しさゆえに、犯罪に走る。
N1|んがため(に)|với mục đích để|V-ない|夢を実現せんがため、努力する。
N1|ずにはいられない|không thể không|V-ない|笑わずにはいられない。
N1|を余儀なくされる|bị ép buộc phải|N|退学を余儀なくされた。
N1|を禁じ得ない|không thể kìm nén được|N|涙を禁じ得ない。
N1|にたえない|không thể chịu đựng nổi / vô cùng|V-る / N|見るにたえない。
N1|にかたくない|không khó để|N / V-る|想像に難くない。
`;

let currentId = 1;
const grammarDB = rawData.trim().split('\n').map(line => {
  const [level, pattern, vi, usage, example] = line.split('|');
  return {
    id: `g_${String(currentId++).padStart(3, '0')}`,
    level: level.trim(),
    pattern: pattern.trim(),
    meaning: vi.trim(),
    vi: vi.trim(),
    usage: usage.trim(),
    examples: [example.trim()]
  };
});

const outPath = path.resolve('./src/data/grammar.json');
fs.writeFileSync(outPath, JSON.stringify(grammarDB, null, 2));

const stats = { N5:0, N4:0, N3:0, N2:0, N1:0 };
grammarDB.forEach(g => { if(stats[g.level] !== undefined) stats[g.level]++; });

console.log(`✅ grammar.json generated! Total: ${grammarDB.length} patterns.`);
console.table(stats);

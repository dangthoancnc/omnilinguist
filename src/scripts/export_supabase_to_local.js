import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function fetchAll(tableName) {
  let all = [];
  let page = 0;
  const size = 1000;
  while (true) {
    console.log(`Fetching ${tableName} page ${page}...`);
    const { data, error } = await supabase.from(tableName).select('*').range(page * size, (page + 1) * size - 1);
    if (error) {
      console.error(`Error on ${tableName}:`, error);
      break;
    }
    if (data && data.length > 0) {
      all = all.concat(data);
    }
    if (!data || data.length < size) break;
    page++;
  }
  return all;
}

async function run() {
  console.log('🚀 Đang tải toàn bộ dữ liệu từ Supabase về local file...');
  const vocab = await fetchAll('omni_master_vocab');
  const kanji = await fetchAll('omni_master_kanji');
  const grammar = await fetchAll('omni_master_grammar');

  console.log(`✅ Đã tải: ${vocab.length} vocab, ${kanji.length} kanji, ${grammar.length} grammar từ Supabase!`);

  const output = {
    vocabulary: vocab,
    kanji: kanji,
    grammar: grammar
  };

  fs.writeFileSync('./src/data/jlpt_master_db.json', JSON.stringify(output, null, 2));
  console.log('🎉 Đã ghi đè file src/data/jlpt_master_db.json thành công!');
}

run();

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function check() {
  try {
    const vRes = await supabase.from('omni_master_vocab').select('*', { count: 'exact' });
    console.log('omni_master_vocab:', vRes.count, 'error:', vRes.error?.message);
    
    const kRes = await supabase.from('omni_master_kanji').select('*', { count: 'exact' });
    console.log('omni_master_kanji:', kRes.count, 'error:', kRes.error?.message);

    const gRes = await supabase.from('omni_master_grammar').select('*', { count: 'exact' });
    console.log('omni_master_grammar:', gRes.count, 'error:', gRes.error?.message);
  } catch(e) {
    console.error(e);
  }
}
check();

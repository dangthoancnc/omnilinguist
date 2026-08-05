require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Thiếu VITE_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  const email = 'user@omnilinguist.com';
  const password = 'user123456';

  console.log(`Đang tạo tài khoản thử nghiệm: ${email} / ${password}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true // Tự động xác nhận email
  });

  if (error) {
    if (error.message.includes('already exists')) {
        console.log("Tài khoản đã tồn tại! Bạn có thể dùng luôn.");
    } else {
        console.error("Lỗi khi tạo tài khoản:", error.message);
    }
  } else {
    console.log("✅ Đã tạo tài khoản thành công!");
    console.log("-----------------------------------------");
    console.log("Email:    " + email);
    console.log("Password: " + password);
    console.log("-----------------------------------------");
  }
}

createTestUser();

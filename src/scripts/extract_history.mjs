import fs from 'fs';

const input = fs.readFileSync('C:/Users/遠藤 健一/.gemini/antigravity/brain/c9007acc-1143-4a93-9947-4013f9be91b6/.system_generated/logs/overview.txt', 'utf8');
const lines = input.split('\n').filter(Boolean);
let output = '# 📜 NHẬT KÝ KHÔI PHỤC PHIÊN LÀM VIỆC TRƯỚC (OmniLinguist MVP Offline)\n\n';

lines.forEach(line => {
  try {
    const obj = JSON.parse(line);
    if (obj.type === "USER_INPUT") {
      output += `\n---\n## 👤 USER (${new Date(obj.created_at).toLocaleString('vi-VN')}):\n${obj.content}\n`;
    } else if (obj.type === "PLANNER_RESPONSE") {
      if (obj.content) output += `\n## 🤖 ANTI-GRAVITY:\n${obj.content}\n`;
      if (obj.tool_calls) output += `\n> 🛠️ *Thực thi công cụ: ${obj.tool_calls.map(t=>t.name).join(', ')}*\n`;
    }
  } catch(e) {}
});

fs.writeFileSync('./Session_History_Recovery.md', output);
console.log("Đã xuất file lịch sử thành công: Session_History_Recovery.md");

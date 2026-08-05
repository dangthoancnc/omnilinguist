const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '../node_modules/zlibjs/bin/gunzip.min.js'),
  path.join(__dirname, '../node_modules/zlibjs/bin/inflate.min.js')
];

filesToPatch.forEach(file => {
  if (fs.existsSync(file)) {
    let data = fs.readFileSync(file, 'utf8');
    // Fix "Cannot use 'in' operator to search for 'Zlib' in undefined" in Vite/Rollup
    if (data.includes('aa=this')) {
      data = data.replace('aa=this', "aa=typeof window!=='undefined'?window:typeof global!=='undefined'?global:this");
      fs.writeFileSync(file, data);
      console.log('✅ Patched ' + file);
    }
  }
});

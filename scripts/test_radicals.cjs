const fs = require('fs');
const path = require('path');

const radicals = require('./kanji_radicals.cjs');
console.log('Radicals loaded:', radicals.length);

// Let's verify each radical has valid meanings, on, kun
radicals.forEach((r, i) => {
  if (!r.id) r.id = `k_bushu_${String(i + 1).padStart(3, '0')}`;
});

console.log('Sample radical:', radicals[0]);

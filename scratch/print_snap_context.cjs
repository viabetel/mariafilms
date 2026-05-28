const fs = require('fs');
const path = require('path');

const bundlePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js';

if (!fs.existsSync(bundlePath)) {
  console.log('Bundle not found');
  process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');

const term = 'snap-start';
let idx = content.indexOf(term);
while (idx !== -1) {
  console.log(`\nFound '${term}' at index ${idx}`);
  console.log(content.substring(idx - 150, idx + 250));
  idx = content.indexOf(term, idx + 1);
}

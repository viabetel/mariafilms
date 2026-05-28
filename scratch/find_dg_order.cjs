const fs = require('fs');
const path = require('path');

const bundlePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-DgBRnfWB.js';

if (!fs.existsSync(bundlePath)) {
  console.log('Bundle not found');
  process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');

// Find the createRoot or main render block at the end of the file
const searchStr = 'createRoot';
const idx = content.indexOf(searchStr);
if (idx === -1) {
  console.log('createRoot not found');
  process.exit(1);
}

console.log(`Found createRoot at index ${idx}`);
console.log('Preview around createRoot:');
console.log(content.substring(idx - 1500, idx + 1000));

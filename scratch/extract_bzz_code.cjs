const fs = require('fs');
const path = require('path');

const bundlePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js';
const outPath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\bzz_extracted.js';

if (!fs.existsSync(bundlePath)) {
  console.log('Bundle not found');
  process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');

// We know "tela cheia" is around index 47218. Let's slice from 35000 to 65000.
const startIdx = 35000;
const endIdx = 65000;

const slice = content.substring(startIdx, endIdx);
fs.writeFileSync(outPath, slice, 'utf8');
console.log(`Extracted slice from index ${startIdx} to ${endIdx} to: ${outPath}`);

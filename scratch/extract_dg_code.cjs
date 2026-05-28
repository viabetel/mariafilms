const fs = require('fs');
const path = require('path');

const bundlePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms_deploy_extracted_latest\\assets\\index-DgBRnfWB.js';
const outPath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\dg_extracted.js';

if (!fs.existsSync(bundlePath)) {
  console.log('Bundle not found');
  process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');

// Slice from index 0 to 28000
const slice = content.substring(0, 28000);
fs.writeFileSync(outPath, slice, 'utf8');
console.log(`Extracted slice from index 0 to 28000 to: ${outPath}`);

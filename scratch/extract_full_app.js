const fs = require('fs');
const path = require('path');

const bundlePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js';
const outPath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\App_compiled_full.js';

if (!fs.existsSync(bundlePath)) {
  console.log('Bundle not found');
  process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');
const startIdx = 60400;
const appCode = content.substring(startIdx);

fs.writeFileSync(outPath, appCode, 'utf8');
console.log(`Saved full App compiled code starting at index ${startIdx} to: ${outPath} (${appCode.length} chars)`);

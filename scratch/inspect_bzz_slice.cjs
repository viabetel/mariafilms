const fs = require('fs');

const filePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\bzz_extracted.js';
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

console.log('Inspection of first 13000 chars of bzz_extracted.js:');
// Search for functions or variable declarations that might represent the ShowreelSection
// Find the first 10 occurrences of 'function' in the slice
let idx = 0;
let count = 0;
while (true) {
  const nextFunc = content.indexOf('function', idx);
  if (nextFunc === -1 || nextFunc > 13000) break;
  count++;
  console.log(`Match ${count}: 'function' at index ${nextFunc}`);
  console.log(`  Snippet: ${content.substring(nextFunc, nextFunc + 150).replace(/\r?\n/g, ' ')}`);
  idx = nextFunc + 8;
}

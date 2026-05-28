const fs = require('fs');

const filePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\dg_extracted.js';
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// Find all functions in dg_extracted.js
const regex = /function\s+(\w+)\s*\(/g;
let match;
console.log('Functions found in dg_extracted.js:');
while ((match = regex.exec(content)) !== null) {
  console.log(`- Function Name: ${match[1]} at index ${match.index}`);
  console.log(`  Preview: ${content.substring(match.index, match.index + 250).replace(/\r?\n/g, ' ')}`);
}

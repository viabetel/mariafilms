const fs = require('fs');

const filePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\bzz_extracted.js';
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// Find all occurrences of "function"
const regex = /function\s+(\w+)\s*\(/g;
let match;
console.log('Functions found in bzz_extracted.js:');
while ((match = regex.exec(content)) !== null) {
  console.log(`- Function Name: ${match[1]} at index ${match.index}`);
  // Let's print the first 200 chars of the function
  console.log(`  Preview: ${content.substring(match.index, match.index + 200).replace(/\r?\n/g, ' ')}`);
}

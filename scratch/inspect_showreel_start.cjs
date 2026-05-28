const fs = require('fs');

const filePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\bzz_extracted.js';
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// The term was found at 40425 in formatted-index-BzzfbiKr.js, which corresponds to index 5425 in bzz_extracted.js.
// Let's print from index 3000 to 12500 to see the entire component!
const startIdx = 3000;
const endIdx = 12775; // Right before the EditorialSection (function p) starts!

const componentCode = content.substring(startIdx, endIdx);
fs.writeFileSync('c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\Showreel_compiled.js', componentCode, 'utf8');
console.log(`Saved Showreel compiled code to scratch/Showreel_compiled.js (${componentCode.length} chars)`);

const fs = require('fs');
const path = require('path');

const files = [
  'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js',
  'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-DgBRnfWB.js',
  'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BIcZ2q7P.js'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  console.log(`\n========================================`);
  console.log(`File: ${path.basename(file)}`);
  console.log(`========================================`);
  
  const index = text.indexOf('essência');
  if (index !== -1) {
    // Print 800 chars before and 1200 chars after
    const start = Math.max(0, index - 800);
    const end = Math.min(text.length, index + 1200);
    console.log(text.substring(start, end));
  } else {
    console.log("Could not find 'essência'");
  }
});

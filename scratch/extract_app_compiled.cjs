const fs = require('fs');

const filePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\bzz_extracted.js';
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// App (function g) starts at index 25427
const appCode = content.substring(25427);
fs.writeFileSync('c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\App_compiled.js', appCode, 'utf8');
console.log(`Saved App compiled code to scratch/App_compiled.js (${appCode.length} chars)`);

const fs = require('fs');

const filePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\bzz_extracted.js';
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// Slices based on identified function indices
// ShowreelSection starts around 3000 and ends before function p at 12775
const showreel = content.substring(2900, 12775);
// EditorialSection (function p) starts at 12775 and ends before function h at 18656
const editorial = content.substring(12775, 18656);
// WorkflowSection (function h) starts at 18656 and ends before function g at 25427
const workflow = content.substring(18656, 25427);

fs.writeFileSync('c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\ShowreelSection_compiled.js', showreel, 'utf8');
fs.writeFileSync('c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\EditorialSection_compiled.js', editorial, 'utf8');
fs.writeFileSync('c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\WorkflowSection_compiled.js', workflow, 'utf8');

console.log('Successfully separated compiled sections into files:');
console.log(`- ShowreelSection_compiled.js: ${showreel.length} chars`);
console.log(`- EditorialSection_compiled.js: ${editorial.length} chars`);
console.log(`- WorkflowSection_compiled.js: ${workflow.length} chars`);

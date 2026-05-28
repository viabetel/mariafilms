const fs = require('fs');
const path = require('path');

const bundlePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms_deploy_extracted_latest\\assets\\index-DgBRnfWB.js';
const outDir = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch';

if (!fs.existsSync(bundlePath)) {
  console.log(`Bundle not found: ${bundlePath}`);
  process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');

// Basic formatter
let formatted = '';
let indent = 0;
for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (char === '{') {
    formatted += ' {\n' + '  '.repeat(++indent);
  } else if (char === '}') {
    formatted += '\n' + '  '.repeat(--indent) + '}';
  } else if (char === ';') {
    formatted += ';\n' + '  '.repeat(indent);
  } else {
    formatted += char;
  }
}

formatted = formatted.replace(/\n\s*\n/g, '\n');

const destPath = path.join(outDir, 'formatted-index-DgBRnfWB.js');
fs.writeFileSync(destPath, formatted, 'utf8');
console.log(`Formatted bundle saved to: ${destPath} (${formatted.length} chars)`);

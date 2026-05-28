const fs = require('fs');
const path = require('path');

const bundle1Path = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\dist\\assets\\index-BzzfbiKr.js';
const bundle2Path = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms_deploy_extracted\\assets\\index-BIcZ2q7P.js';
const outDir = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function processBundle(srcPath, outName) {
  if (!fs.existsSync(srcPath)) {
    console.log(`Bundle not found: ${srcPath}`);
    return;
  }
  const content = fs.readFileSync(srcPath, 'utf8');
  
  // A very basic formatter that adds newlines after semicolons and braces to make minified code readable
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
  
  // Clean up excessive double newlines
  formatted = formatted.replace(/\n\s*\n/g, '\n');
  
  const destPath = path.join(outDir, outName);
  fs.writeFileSync(destPath, formatted, 'utf8');
  console.log(`Formatted bundle saved to: ${destPath} (${formatted.length} chars)`);
}

processBundle(bundle1Path, 'formatted-index-BzzfbiKr.js');
processBundle(bundle2Path, 'formatted-index-BIcZ2q7P.js');

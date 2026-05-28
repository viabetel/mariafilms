const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\Nicácio\\Documents\\GitHub';
const keywords = ['briefing', 'avançar', 'voltar', 'deadline'];

function searchFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const kw of keywords) {
      if (content.toLowerCase().includes(kw.toLowerCase())) {
        console.log(`Found keyword '${kw}' in file: ${filePath} (size: ${content.length} chars)`);
      }
    }
  } catch (err) {}
}

function traverse(dir) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.git') {
        traverse(fullPath);
      }
    } else {
      if (item.endsWith('.js')) {
        searchFile(fullPath);
      }
    }
  }
}

console.log('Scanning all JS files for keywords...');
traverse(baseDir);
console.log('Scan complete.');

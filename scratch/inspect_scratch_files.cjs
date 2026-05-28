const fs = require('fs');
const path = require('path');

const scratchDir = 'C:\\Users\\Nicácio\\.gemini\\antigravity\\brain\\b3af024e-21f3-40ba-b561-f333201ffa45\\scratch';

if (!fs.existsSync(scratchDir)) {
  console.log('Scratch dir does not exist');
  process.exit(1);
}

const files = fs.readdirSync(scratchDir);
console.log(`Found ${files.length} files in scratch directory:\n`);

for (const file of files) {
  if (file.endsWith('.txt') || file.endsWith('.json') || file.endsWith('.tsx') || file.endsWith('.js')) {
    const filePath = path.join(scratchDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`File: ${file}`);
    console.log(`  Size: ${content.length} chars (${fs.statSync(filePath).size} bytes)`);
    console.log(`  First 100 chars: ${content.substring(0, 100).replace(/\r?\n/g, ' ')}`);
    console.log(`  Last 100 chars: ${content.substring(content.length - 100).replace(/\r?\n/g, ' ')}`);
    console.log('--------------------------------------------------');
  }
}

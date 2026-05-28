const fs = require('fs');
const path = require('path');

const file1 = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js';

if (!fs.existsSync(file1)) {
  console.log('Bundle 1 not found');
  process.exit(1);
}

const content = fs.readFileSync(file1, 'utf8');
console.log(`Loaded index-BzzfbiKr.js. Total size: ${content.length} chars.`);

const terms = ['format', 'budget', 'deadline', 'email', 'name', 'briefing', 'avançar', 'voltar', 'etapa', 'fase', 'enviar briefing'];

for (const t of terms) {
  let idx = content.indexOf(t);
  if (idx !== -1) {
    console.log(`Found '${t}' at index ${idx}`);
    const start = Math.max(0, idx - 50);
    const end = Math.min(content.length, idx + 150);
    console.log(`  Snippet: ... ${content.substring(start, end).replace(/\r?\n/g, ' ')} ...`);
  } else {
    console.log(`'${t}' NOT found`);
  }
}

const fs = require('fs');
const path = require('path');

const file2 = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BIcZ2q7P.js';

if (!fs.existsSync(file2)) {
  console.log('Bundle 2 not found');
  process.exit(1);
}

const content = fs.readFileSync(file2, 'utf8');
console.log(`Loaded index-BIcZ2q7P.js. Total size: ${content.length} chars.`);

const terms = ['formato', 'orçamento', 'prazo', 'contato', 'nome', 'email', 'avançar', 'voltar', 'briefing', 'enviar'];

for (const t of terms) {
  let idx = content.toLowerCase().indexOf(t.toLowerCase());
  if (idx !== -1) {
    console.log(`Found '${t}' at index ${idx}`);
    const start = Math.max(0, idx - 50);
    const end = Math.min(content.length, idx + 150);
    console.log(`  Snippet: ... ${content.substring(start, end).replace(/\r?\n/g, ' ')} ...`);
  } else {
    console.log(`'${t}' NOT found`);
  }
}

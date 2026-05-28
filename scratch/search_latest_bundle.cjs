const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-DgBRnfWB.js';

if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
console.log(`Loaded file. Size: ${content.length} chars.`);

const terms = ['formata', 'formato', 'orçamento', 'prazo', 'contato', 'nome', 'email', 'avançar', 'voltar', 'briefing', 'enviar', 'glow', 'hover', 'card'];

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

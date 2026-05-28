const fs = require('fs');
const path = require('path');

const file2 = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms_deploy_extracted\\assets\\index-BIcZ2q7P.js';

if (!fs.existsSync(file2)) {
  console.log('Deploy bundle not found');
  process.exit(1);
}

const content = fs.readFileSync(file2, 'utf8');
console.log(`Loaded index-BIcZ2q7P.js. Total size: ${content.length} chars.`);

const terms = ['films', 'contato', 'glow', 'hover', 'form', 'placeholder', 'email', 'name', 'modal', 'question', 'etapa', 'fase', 'enviar', 'mensagem'];

for (const t of terms) {
  let idx = content.indexOf(t);
  if (idx !== -1) {
    console.log(`Found '${t}' at index ${idx}`);
    // Print a tiny snippet
    const start = Math.max(0, idx - 50);
    const end = Math.min(content.length, idx + 150);
    console.log(`  Snippet: ... ${content.substring(start, end).replace(/\r?\n/g, ' ')} ...`);
  } else {
    console.log(`'${t}' NOT found`);
  }
}

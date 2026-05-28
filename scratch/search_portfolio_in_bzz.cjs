const fs = require('fs');

const filePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js';
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const terms = ['trabalhos recentes', 'portfólio selecionado', 'activeProjectId', 'hoveredImage', 'glow'];

for (const t of terms) {
  let idx = content.toLowerCase().indexOf(t.toLowerCase());
  if (idx !== -1) {
    console.log(`Found '${t}' at index ${idx}`);
    const start = Math.max(0, idx - 100);
    const end = Math.min(content.length, idx + 400);
    console.log(`  Snippet: ... ${content.substring(start, end).replace(/\r?\n/g, ' ')} ...`);
  } else {
    console.log(`'${t}' NOT found`);
  }
}

const fs = require('fs');
const files = [
  'scratch/formatted-index-BIcZ2q7P.js',
  'scratch/formatted-index-DgBRnfWB.js',
  'scratch/bzz_extracted.js',
  'scratch/dg_extracted.js'
];

let output = '';
files.forEach(file => {
  if (!fs.existsSync(file)) return;
  const c = fs.readFileSync(file, 'utf8');
  const regex = /['"\`]svg['"\`]/g;
  let match;
  let count = 0;
  output += `========================================\nFILE: ${file}\n========================================\n`;
  while((match = regex.exec(c)) !== null) {
    count++;
    output += `Found SVG #${count} at ${match.index}\n`;
    output += `Snippet: ${c.substring(match.index - 80, match.index + 500)}\n`;
    output += `----------------------------------------\n`;
  }
});

fs.writeFileSync('scratch/all_files_svg_snippets.txt', output, 'utf8');
console.log('Done!');

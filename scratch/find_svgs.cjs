const fs = require('fs');
const file = 'scratch/formatted-index-BzzfbiKr.js';
if(fs.existsSync(file)) {
  const c = fs.readFileSync(file, 'utf8');
  const regex = /['"\`]svg['"\`]/g;
  let match;
  let output = '';
  let count = 0;
  while((match = regex.exec(c)) !== null) {
    count++;
    output += `Found SVG #${count} at ${match.index}\n`;
    output += `Snippet: ${c.substring(match.index - 80, match.index + 500)}\n`;
    output += `========================================\n\n`;
  }
  fs.writeFileSync('scratch/all_svg_snippets.txt', output, 'utf8');
  console.log(`Saved ${count} SVG snippets to scratch/all_svg_snippets.txt`);
} else {
  console.log('File not found');
}

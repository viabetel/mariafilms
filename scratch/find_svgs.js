const fs = require('fs');
const file = 'scratch/formatted-index-BzzfbiKr.js';
if(fs.existsSync(file)) {
  const c = fs.readFileSync(file, 'utf8');
  const regex = /['"]svg['"]/g;
  let match;
  while((match = regex.exec(c)) !== null) {
    console.log('Found SVG at', match.index);
    console.log('Snippet:', c.substring(match.index - 80, match.index + 500));
    console.log('========================================');
  }
} else {
  console.log('File not found');
}

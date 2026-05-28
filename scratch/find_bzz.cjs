const fs = require('fs');
const path = require('path');

const scratchDir = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch';
const files = fs.readdirSync(scratchDir);

for (const file of files) {
  if (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.txt')) {
    const fullPath = path.join(scratchDir, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('BzzfbiKr')) {
        console.log(`Found BzzfbiKr in: ${file}`);
      }
    } catch (e) {}
  }
}

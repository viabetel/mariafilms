const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchDir(filePath);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.html'))) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.toLowerCase().includes('festa')) {
        console.log(`Found in: ${filePath}`);
        // print lines containing "festa"
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes('festa')) {
            console.log(`  L${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir('c:/Users/Nicácio/Documents/GitHub/mariafilms/src');

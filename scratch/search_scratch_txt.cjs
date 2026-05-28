const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Nicácio\\.gemini\\antigravity\\brain\\b3af024e-21f3-40ba-b561-f333201ffa45';

// Recursively find all files in the brain directory
function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const name = path.join(dir, file);
    if (file === '.system_generated') continue; // Skip logs
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.txt') || name.endsWith('.json') || name.endsWith('.md') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.cjs')) {
        files.push(name);
      }
    }
  }
  return files;
}

const allFiles = getFiles(brainDir);
console.log(`Found ${allFiles.length} files to search.`);

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lower = content.toLowerCase();
  
  // Search for keywords like "filme", "camera", "photo", "shutter", "icone" in navigation context
  if ((lower.includes('icon') || lower.includes('svg') || lower.includes('símbolo') || lower.includes('festa')) && (lower.includes('film') || lower.includes('photo') || lower.includes('video') || lower.includes('shutter') || lower.includes('aperture'))) {
    if (lower.includes('portal') || lower.includes('manifest') || lower.includes('dots') || lower.includes('scroll') || lower.includes('snap')) {
      console.log(`\n========================================`);
      console.log(`MATCH in File: ${file}`);
      console.log(`========================================`);
      
      // Let's print out the match lines or snippets
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        const lineLower = line.toLowerCase();
        if (lineLower.includes('film') || lineLower.includes('photo') || lineLower.includes('video') || lineLower.includes('svg') || lineLower.includes('snap') || lineLower.includes('icon') || lineLower.includes('festa')) {
          if (line.length < 500) {
            console.log(`  Line ${i+1}: ${line.trim()}`);
          } else {
            console.log(`  Line ${i+1}: [Long line, length: ${line.length}] ${line.substring(0, 150)}...`);
          }
        }
      });
    }
  }
});

const fs = require('fs');
const path = require('path');

const gitDir = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\.git';

if (!fs.existsSync(gitDir)) {
  console.log('Git directory not found');
  process.exit(1);
}

function traverse(dir) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else {
      const relPath = path.relative(gitDir, fullPath);
      // Read text refs or print info
      if (stat.size < 500 && !fullPath.includes('index') && !fullPath.includes('pack')) {
        const content = fs.readFileSync(fullPath, 'utf8').trim();
        console.log(`Ref File: ${relPath} -> ${content}`);
      } else {
        console.log(`Git File: ${relPath} (${stat.size} bytes)`);
      }
    }
  }
}

console.log('Scanning Git repository metadata:');
traverse(gitDir);

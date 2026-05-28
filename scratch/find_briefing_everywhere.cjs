const fs = require('fs');
const path = require('path');

const dirs = [
  'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms',
  'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms_deploy_extracted'
];

const keywords = ['briefing', 'deadline', 'budget', 'avançar', 'voltar', 'format', 'CinematicPortal'];

function searchDir(dir) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.git' && item !== 'frames') {
        searchDir(fullPath);
      }
    } else {
      if (item.endsWith('.js') || item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.html') || item.endsWith('.css') || item.endsWith('.json') || item.endsWith('.txt')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const kw of keywords) {
            if (content.includes(kw)) {
              console.log(`Found keyword '${kw}' in: ${fullPath} (size: ${content.length} chars)`);
            }
          }
        } catch (err) {}
      }
    }
  }
}

for (const d of dirs) {
  if (fs.existsSync(d)) {
    console.log(`Searching directory: ${d}`);
    searchDir(d);
  }
}

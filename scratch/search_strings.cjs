const fs = require('fs');
const path = require('path');

const file1 = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js';
const file2 = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms_deploy_extracted\\assets\\index-BIcZ2q7P.js';

const searchTerms = [
  { term: 'tela cheia', label: 'Showreel (tela cheia)' },
  { term: 'biografia', label: 'Editorial (biografia)' },
  { term: 'decupagem', label: 'Workflow (decupagem)' },
  { term: 'briefing', label: 'CinematicPortal (briefing)' },
  { term: 'glow', label: 'Portfolio (glow)' },
  { term: 'Maria Eduarda', label: 'Editorial (Maria Eduarda)' }
];

function searchTermsInFile(filePath, label) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n========================================`);
  console.log(`SEARCHING IN ${label} (${path.basename(filePath)})`);
  console.log(`========================================`);
  
  for (const s of searchTerms) {
    let idx = content.indexOf(s.term);
    if (idx !== -1) {
      console.log(`Found string '${s.term}' (${s.label}) at index ${idx}`);
      const start = Math.max(0, idx - 200);
      const end = Math.min(content.length, idx + 800);
      console.log(`Preview around match:`);
      console.log(content.substring(start, end));
      console.log(`----------------------------------------`);
    } else {
      console.log(`String '${s.term}' (${s.label}) NOT found.`);
    }
  }
}

searchTermsInFile(file1, 'Bundle 1 (dist)');
searchTermsInFile(file2, 'Bundle 2 (deploy)');

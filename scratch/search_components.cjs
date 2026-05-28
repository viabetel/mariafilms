const fs = require('fs');
const path = require('path');

const file1 = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js';
const file2 = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BIcZ2q7P.js';

function searchInFile(filePath, label) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n========================================`);
  console.log(`SEARCHING IN ${label} (${path.basename(filePath)})`);
  console.log(`========================================`);
  
  // Search for component names
  const components = ['ShowreelSection', 'EditorialSection', 'WorkflowSection', 'CinematicPortal', 'PortfolioSection', 'ScrollytellingCanvas', 'IntroLoader'];
  
  for (const comp of components) {
    // Find index of the component definition
    let idx = content.indexOf(comp);
    if (idx !== -1) {
      console.log(`Found component '${comp}' at index ${idx}`);
      // Print around the definition (e.g. 500 chars before, 2500 chars after)
      const start = Math.max(0, idx - 100);
      const end = Math.min(content.length, idx + 4000);
      console.log(`\n--- PREVIEW OF ${comp} ---`);
      console.log(content.substring(start, end));
      console.log(`--- END PREVIEW ---`);
    } else {
      console.log(`Component '${comp}' NOT found.`);
    }
  }
}

searchInFile(file1, 'Bundle 1 (dist)');
searchInFile(file2, 'Bundle 2 (deploy)');

const fs = require('fs');
const path = require('path');

const files = [
  'CinematicPortal_git.tsx',
  'CinematicPortal_d2e4d83.tsx',
  'CinematicPortal_09d39d8.tsx'
];

for (const file of files) {
  const filePath = path.join('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const index = content.indexOf('const handleWheel');
    if (index !== -1) {
      console.log(`=== ${file} ===`);
      console.log(content.substring(index, index + 1500));
    } else {
      console.log(`=== ${file} === -> const handleWheel NOT FOUND`);
      // check if there is addEventListener('wheel')
      const wIdx = content.indexOf('wheel');
      if (wIdx !== -1) {
        console.log(`=== ${file} (wheel occurrences) ===`);
        console.log(content.substring(wIdx - 100, wIdx + 500));
      }
    }
  }
}

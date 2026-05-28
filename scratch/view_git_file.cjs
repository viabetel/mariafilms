const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gitExe = 'C:\\Users\\Nicácio\\AppData\\Local\\GitHubDesktop\\app-3.5.11\\resources\\app\\git\\cmd\\git.exe';
const repoDir = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms';
const outPath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\CinematicPortal_git.tsx';

try {
  const content = execSync(`"${gitExe}" show d2e4d83:src/components/CinematicPortal.tsx`, { cwd: repoDir, maxBuffer: 1024 * 1024 * 10 });
  fs.writeFileSync(outPath, content);
  console.log(`Successfully extracted CinematicPortal.tsx to scratch/CinematicPortal_git.tsx (${content.length} bytes)`);
} catch (err) {
  console.error('Error running git show:', err.message);
}

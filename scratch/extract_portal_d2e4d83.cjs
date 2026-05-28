const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gitPath = 'C:\\\\Users\\\\Nicácio\\\\AppData\\\\Local\\\\GitHubDesktop\\\\app-3.5.11\\\\resources\\\\app\\\\git\\\\cmd\\\\git.exe';
const gitCmd = `& "${gitPath}" show d2e4d83:src/components/CinematicPortal.tsx`;

try {
  console.log('Extracting CinematicPortal.tsx from commit d2e4d83...');
  const result = execSync(`PowerShell -Command "${gitCmd}"`, { maxBuffer: 1024 * 1024 * 10 }).toString('utf8');
  const destPath = 'c:\\\\Users\\Nicácio\\\\Documents\\\\GitHub\\\\mariafilms\\\\scratch\\\\CinematicPortal_d2e4d83.tsx';
  fs.writeFileSync(destPath, result, 'utf8');
  console.log(`Saved CinematicPortal.tsx from commit d2e4d83 to: ${destPath} (${result.length} chars)`);
} catch (err) {
  console.error('Error running git show:', err.message);
}

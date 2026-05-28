const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gitPath = 'C:\\\\Users\\\\Nicácio\\\\AppData\\\\Local\\\\GitHubDesktop\\\\app-3.5.11\\\\resources\\\\app\\\\git\\\\cmd\\\\git.exe';
const gitCmd = `& "${gitPath}" show 09c1c47:src/App.tsx`;

try {
  console.log('Extracting App.tsx from commit 09c1c47...');
  const result = execSync(`PowerShell -Command "${gitCmd}"`, { maxBuffer: 1024 * 1024 * 10 }).toString('utf8');
  const destPath = 'c:\\\\Users\\Nicácio\\\\Documents\\\\GitHub\\\\mariafilms\\\\scratch\\\\App_09c1c47.tsx';
  fs.writeFileSync(destPath, result, 'utf8');
  console.log(`Saved App.tsx from commit 09c1c47 to: ${destPath} (${result.length} chars)`);
} catch (err) {
  console.error('Error running git show:', err.message);
}

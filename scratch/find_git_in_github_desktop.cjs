const fs = require('fs');
const path = require('path');

const ghDesktopDir = 'C:\\Users\\Nicácio\\AppData\\Local\\GitHubDesktop';

function searchFile(dir, targetName) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (e) {
      continue;
    }
    if (stat.isDirectory()) {
      const found = searchFile(fullPath, targetName);
      if (found) return found;
    } else {
      if (item.toLowerCase() === targetName.toLowerCase()) {
        return fullPath;
      }
    }
  }
  return null;
}

if (fs.existsSync(ghDesktopDir)) {
  console.log(`Searching in: ${ghDesktopDir}`);
  const gitPath = searchFile(ghDesktopDir, 'git.exe');
  if (gitPath) {
    console.log(`Found git.exe at: ${gitPath}`);
  } else {
    console.log('git.exe not found in GitHubDesktop directory');
  }
} else {
  console.log('GitHubDesktop directory does not exist');
}

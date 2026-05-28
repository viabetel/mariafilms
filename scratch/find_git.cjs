const fs = require('fs');
const path = require('path');

const searchPaths = [
  'C:\\Program Files\\Git\\bin\\git.exe',
  'C:\\Program Files\\Git\\cmd\\git.exe',
  'C:\\Program Files (x86)\\Git\\bin\\git.exe',
  'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Programs\\Git\\bin\\git.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'Programs\\Git\\cmd\\git.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'GitHubDesktop\\app-*\\resources\\app\\git\\cmd\\git.exe'),
  path.join(process.env.LOCALAPPDATA || '', 'GitHubDesktop\\app-*\\resources\\app\\git\\bin\\git.exe')
];

// Let's also do a fast directory traversal in common places
const commonDirs = [
  'C:\\Program Files',
  'C:\\Program Files (x86)',
  process.env.LOCALAPPDATA || '',
  process.env.APPDATA || ''
];

function findGit() {
  // Check direct paths first
  for (const p of searchPaths) {
    if (p.includes('*')) {
      // Handle wildcards
      const base = p.split('*')[0];
      const rest = p.split('*')[1];
      if (fs.existsSync(base)) {
        const subdirs = fs.readdirSync(base);
        for (const sd of subdirs) {
          const full = path.join(base, sd, rest);
          if (fs.existsSync(full)) {
            console.log(`Found git at: ${full}`);
            return full;
          }
        }
      }
    } else {
      if (fs.existsSync(p)) {
        console.log(`Found git at: ${p}`);
        return p;
      }
    }
  }

  console.log('Git not found in standard paths. Searching common directories...');
  
  // Recursively search common directories (limit depth to 3)
  for (const base of commonDirs) {
    if (!fs.existsSync(base)) continue;
    try {
      const level1 = fs.readdirSync(base);
      for (const l1 of level1) {
        const p1 = path.join(base, l1);
        try {
          if (fs.statSync(p1).isDirectory()) {
            if (l1.toLowerCase().includes('git')) {
              console.log(`Found Git-related directory: ${p1}`);
            }
            const level2 = fs.readdirSync(p1);
            for (const l2 of level2) {
              const p2 = path.join(p1, l2);
              if (l2.toLowerCase() === 'git.exe') {
                console.log(`Found git: ${p2}`);
                return p2;
              }
              try {
                if (fs.statSync(p2).isDirectory()) {
                  const level3 = fs.readdirSync(p2);
                  for (const l3 of level3) {
                    if (l3.toLowerCase() === 'git.exe') {
                      const p3 = path.join(p2, l3);
                      console.log(`Found git: ${p3}`);
                      return p3;
                    }
                  }
                }
              } catch (e) {}
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }
  
  console.log('Git executable not found.');
  return null;
}

findGit();

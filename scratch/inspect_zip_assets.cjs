const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const zip1 = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms_deploy.zip';
const zip2 = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\deploy.zip';

function searchZip(zipPath) {
  console.log(`\n========================================`);
  console.log(`Searching inside ZIP: ${zipPath}`);
  console.log(`========================================`);
  if (!fs.existsSync(zipPath)) {
    console.log('Zip file not found');
    return;
  }
  
  const tmpDir = path.join('c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch', path.basename(zipPath, '.zip') + '_inspect');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  
  try {
    // Extract assets/*.js files
    execSync(`PowerShell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tmpDir}' -Force"`);
    console.log(`Extracted to: ${tmpDir}`);
    
    // Scan all extracted JS files
    const assetsDir = path.join(tmpDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          const filePath = path.join(assetsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          console.log(`Found JS file: ${file} (size: ${content.length} chars)`);
          const keywords = ['briefing', 'avançar', 'voltar', 'deadline', 'budget', 'format', 'CinematicPortal'];
          for (const kw of keywords) {
            const count = (content.match(new RegExp(kw, 'gi')) || []).length;
            if (count > 0) {
              console.log(`  Keyword '${kw}' matches: ${count}`);
            }
          }
        }
      }
    } else {
      console.log('No assets folder found in zip');
    }
  } catch (err) {
    console.error('Error during search:', err.message);
  }
}

searchZip(zip1);
searchZip(zip2);

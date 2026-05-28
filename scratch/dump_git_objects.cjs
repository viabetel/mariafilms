const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const gitObjectsDir = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\.git\\objects';

if (!fs.existsSync(gitObjectsDir)) {
  console.error('Git objects directory not found at', gitObjectsDir);
  process.exit(1);
}

console.log('Scanning Git objects in:', gitObjectsDir);

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'info' && file !== 'pack') {
        scanDir(filePath);
      }
    } else {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const decompressed = zlib.inflateSync(fileBuffer);
        const contentStr = decompressed.toString('utf8');
        
        if (contentStr.startsWith('blob ')) {
          const nullByteIdx = contentStr.indexOf('\0');
          const fileContent = contentStr.substring(nullByteIdx + 1);
          
          if (fileContent.includes('WorkflowSection') || fileContent.includes('ShowreelSection') || fileContent.includes('EditorialSection') || fileContent.includes('handleScrollSnap') || fileContent.includes('camera-step-1')) {
            console.log(`\n========================================`);
            console.log(`Found matching Git Object file: ${filePath}`);
            console.log(`Content length: ${fileContent.length}`);
            
            console.log(`Preview:`);
            console.log(fileContent.substring(0, 300));
            
            let outName = '';
            if (fileContent.includes('export function ShowreelSection') && fileContent.includes('handleScrollSnap')) {
              outName = 'ShowreelSection_snap.tsx';
            } else if (fileContent.includes('export function ShowreelSection')) {
              outName = 'ShowreelSection_git.tsx';
            } else if (fileContent.includes('export function EditorialSection')) {
              outName = 'EditorialSection_git.tsx';
            } else if (fileContent.includes('export function WorkflowSection')) {
              outName = 'WorkflowSection_git.tsx';
            } else if (fileContent.includes('function App()') || fileContent.includes('export default App')) {
              outName = 'App_git.tsx';
            } else if (fileContent.includes('export function CinematicPortal')) {
              outName = 'CinematicPortal_git.tsx';
            } else if (fileContent.includes('export function PortfolioSection')) {
              outName = 'PortfolioSection_git.tsx';
            }
            
            if (outName) {
              const outPath = path.join('c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch', outName);
              fs.writeFileSync(outPath, fileContent, 'utf8');
              console.log(`Saved object content to scratch/${outName}`);
            }
          }
        }
      } catch (err) {
        // Ignore errors
      }
    }
  }
}

scanDir(gitObjectsDir);
console.log('\nGit object scan finished.');

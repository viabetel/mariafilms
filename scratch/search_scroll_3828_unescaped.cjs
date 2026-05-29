const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_3828_code_unescaped.txt', 'utf8');

const lines = content.split('\n');
console.log('Total lines:', lines.length);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('wheel') || lines[i].includes('scroll') || lines[i].includes('portalLock') || lines[i].includes('handleWheel')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}

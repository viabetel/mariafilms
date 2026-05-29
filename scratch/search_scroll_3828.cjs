const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_3828_code.txt', 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('wheel') || lines[i].includes('scroll') || lines[i].includes('portalLock')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}

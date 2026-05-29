const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_3828_code.txt', 'utf8');
const unescaped = content
  .replace(/\\n/g, '\n')
  .replace(/\\"/g, '"')
  .replace(/\\'/g, "'");

fs.writeFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_3828_code_unescaped.txt', unescaped, 'utf8');
console.log('Wrote unescaped file.');

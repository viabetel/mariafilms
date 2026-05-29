const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_5500_target.txt', 'utf8');
const unescaped = content
  .replace(/\\n/g, '\n')
  .replace(/\\"/g, '"')
  .replace(/\\'/g, "'");

fs.writeFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\original_handle_wheel_5500.txt', unescaped, 'utf8');
console.log('Wrote unescaped file.');

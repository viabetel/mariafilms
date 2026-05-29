const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\original_handle_wheel.txt', 'utf8');
// Replace escaped newlines with actual newlines
const unescaped = content
  .replace(/\\n/g, '\n')
  .replace(/\\"/g, '"')
  .replace(/\\'/g, "'");

fs.writeFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\original_handle_wheel_unescaped.txt', unescaped, 'utf8');
console.log('Wrote unescaped file.');

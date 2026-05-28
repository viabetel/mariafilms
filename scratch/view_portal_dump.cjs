const fs = require('fs');

const dumpPath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\portal_steps_dump.json';
const content = fs.readFileSync(dumpPath);
let text = '';
if (content[0] === 0xFF && content[1] === 0xFE) {
  text = content.toString('utf16le');
} else {
  text = content.toString('utf8');
}

console.log(`Length of text: ${text.length}`);
const lines = text.split('\n');
console.log(`Total lines: ${lines.length}`);
console.log('First 40 lines:');
console.log(lines.slice(0, 40).join('\n'));

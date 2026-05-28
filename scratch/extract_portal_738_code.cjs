const fs = require('fs');
const path = require('path');

const dumpPath = 'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_738_dump.json';
const data = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
let code = data.tool_calls[0].args.CodeContent;

if (typeof code === 'string' && code.startsWith('"')) {
  try {
    code = JSON.parse(code);
  } catch (e) {
    // If it fails, try other ways or leave as is
  }
}

fs.writeFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\CinematicPortal_738.tsx', code, 'utf8');
console.log('Saved properly formatted code to scratch/CinematicPortal_738.tsx');

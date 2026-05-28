const fs = require('fs');
const path = require('path');

const jsonPath = 'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_1050_args.json';
if (!fs.existsSync(jsonPath)) {
  console.log('JSON file not found:', jsonPath);
  process.exit(1);
}

try {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let code = data.ReplacementContent;
  
  if (typeof code === 'string' && code.startsWith('"')) {
    code = JSON.parse(code);
  }
  
  fs.writeFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\CinematicPortal_1050_replacement.txt', code, 'utf8');
  console.log('Successfully wrote step 1050 replacement content to scratch/CinematicPortal_1050_replacement.txt');
} catch (err) {
  console.error('Error parsing JSON:', err.message);
}

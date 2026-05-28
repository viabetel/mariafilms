const fs = require('fs');

const jsonPath = 'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_1050_args.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const code = data.ReplacementContent;

fs.writeFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\CinematicPortal_1050_replacement.tsx', code, 'utf8');
console.log('Successfully wrote CinematicPortal_1050_replacement.tsx');

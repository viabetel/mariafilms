const fs = require('fs');

const filePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\CinematicPortal_git.tsx';
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
console.log(`Loaded CinematicPortal_git.tsx. Size: ${content.length} chars.`);

const terms = ['formStep', 'formData', 'briefing', 'avançar', 'voltar', 'budget', 'deadline', 'format'];

for (const t of terms) {
  console.log(`Contains '${t}'? ${content.includes(t)}`);
}

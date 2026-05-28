const fs = require('fs');
const path = require('path');

const tasksDir = 'C:\\Users\\Nicácio\\.gemini\\antigravity\\brain\\b3af024e-21f3-40ba-b561-f333201ffa45\\.system_generated\\tasks';
const keywords = ['briefing', 'deadline', 'budget', 'avançar', 'voltar'];

if (fs.existsSync(tasksDir)) {
  const files = fs.readdirSync(tasksDir);
  for (const file of files) {
    if (file.endsWith('.log')) {
      const filePath = path.join(tasksDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      for (const kw of keywords) {
        if (content.toLowerCase().includes(kw.toLowerCase())) {
          console.log(`Found keyword '${kw}' in task log: ${file} (size: ${content.length} chars)`);
          console.log(content);
          console.log('========================================');
        }
      }
    }
  }
} else {
  console.log('Tasks directory does not exist');
}

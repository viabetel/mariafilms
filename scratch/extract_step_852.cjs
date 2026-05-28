const fs = require('fs');
const path = require('path');
const readline = require('readline');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const logPath = path.join(userProfile, '.gemini', 'antigravity', 'brain', 'b3af024e-21f3-40ba-b561-f333201ffa45', '.system_generated', 'logs', 'transcript.jsonl');

const rl = readline.createInterface({
  input: fs.createReadStream(logPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.step_index === 852) {
      console.log(`FOUND STEP 852`);
      fs.writeFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_852_dump.json', JSON.stringify(data, null, 2), 'utf8');
      console.log('Saved tool call to scratch/step_852_dump.json');
    }
  } catch (err) {}
});

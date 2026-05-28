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
    if (data.step_index === 2340) {
      console.log(`FOUND STEP 2340`);
      console.log(`Type: ${data.type}`);
      console.log(`Tool calls:`, JSON.stringify(data.tool_calls, null, 2));
      fs.writeFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_2340_dump.json', JSON.stringify(data, null, 2), 'utf8');
      console.log('Saved to scratch/step_2340_dump.json');
    }
  } catch (err) {}
});

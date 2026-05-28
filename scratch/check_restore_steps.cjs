const fs = require('fs');
const path = require('path');
const readline = require('readline');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const logPath = path.join(userProfile, '.gemini', 'antigravity', 'brain', 'b3af024e-21f3-40ba-b561-f333201ffa45', '.system_generated', 'logs', 'transcript.jsonl');

const rl = readline.createInterface({
  input: fs.createReadStream(logPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

const steps = [1481, 1483, 1485, 1487, 1489, 1491, 1497, 1499];

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (steps.includes(data.step_index)) {
      console.log(`Step ${data.step_index} | Type: ${data.type} | Status: ${data.status} | Content Length: ${data.content ? data.content.length : 0}`);
      if (data.content) {
        console.log(`  Start: ${data.content.substring(0, 150).replace(/\r?\n/g, ' ')}`);
        console.log(`  End: ${data.content.substring(data.content.length - 150).replace(/\r?\n/g, ' ')}`);
      }
    }
  } catch (err) {}
});

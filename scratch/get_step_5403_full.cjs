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
    if (data.step_index === 5403) {
      if (data.tool_calls) {
        for (const tc of data.tool_calls) {
          fs.writeFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\original_handle_wheel.txt', tc.args.TargetContent, 'utf8');
          console.log('Successfully wrote C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\original_handle_wheel.txt');
        }
      }
    }
  } catch (err) {}
});

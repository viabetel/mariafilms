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
    if (data.step_index === 5401) {
      console.log('Step 5401 tool calls:');
      if (data.tool_calls) {
        for (const tc of data.tool_calls) {
          console.log('Tool Name:', tc.name);
          console.log('TargetContent:', tc.args.TargetContent);
          console.log('ReplacementContent:', tc.args.ReplacementContent);
        }
      }
    }
  } catch (err) {}
});

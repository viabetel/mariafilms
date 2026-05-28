const fs = require('fs');
const path = require('path');
const readline = require('readline');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const logPath = path.join(userProfile, '.gemini', 'antigravity', 'brain', 'b3af024e-21f3-40ba-b561-f333201ffa45', '.system_generated', 'logs', 'transcript.jsonl');

const rl = readline.createInterface({
  input: fs.createReadStream(logPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

const targetSteps = [1272, 1433, 1743, 1871, 2092];

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (targetSteps.includes(data.step_index)) {
      console.log(`\n========================================`);
      console.log(`FOUND STEP ${data.step_index} (${data.type})`);
      console.log(`========================================`);
      if (data.tool_calls) {
        for (const tc of data.tool_calls) {
          if (tc.args && (tc.args.TargetFile || '').includes('CinematicPortal.tsx')) {
            console.log(JSON.stringify(tc, null, 2));
          }
        }
      }
    }
  } catch (err) {}
});

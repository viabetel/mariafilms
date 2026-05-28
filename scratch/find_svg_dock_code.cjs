const fs = require('fs');
const path = require('path');
const readline = require('readline');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const logPath = path.join(userProfile, '.gemini', 'antigravity', 'brain', 'b3af024e-21f3-40ba-b561-f333201ffa45', '.system_generated', 'logs', 'transcript.jsonl');

const rl = readline.createInterface({
  input: fs.createReadStream(logPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

console.log('Searching transcript for step 1032-1058 changes...');

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.step_index >= 1032 && data.step_index <= 1058) {
      console.log(`\n========================================`);
      console.log(`STEP ${data.step_index} | Type: ${data.type}`);
      if (data.tool_calls) {
        for (const tc of data.tool_calls) {
          console.log(`Tool call: ${tc.name} for Target: ${tc.args.TargetFile || tc.args.Target}`);
          if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
            const outPath = `C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_${data.step_index}_args.json`;
            fs.writeFileSync(outPath, JSON.stringify(tc.args, null, 2), 'utf8');
            console.log(`  Saved arguments to ${outPath}`);
          }
        }
      }
    }
  } catch (err) {}
});

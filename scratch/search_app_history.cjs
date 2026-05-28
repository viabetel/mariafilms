const fs = require('fs');
const path = require('path');
const readline = require('readline');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const logPath = path.join(userProfile, '.gemini', 'antigravity', 'brain', 'b3af024e-21f3-40ba-b561-f333201ffa45', '.system_generated', 'logs', 'transcript.jsonl');

const rl = readline.createInterface({
  input: fs.createReadStream(logPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

console.log('App.tsx Edit History:');

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (line.includes('App.tsx') && (line.includes('write_to_file') || line.includes('replace_file_content') || line.includes('multi_replace_file_content'))) {
      if (data.tool_calls) {
        for (const tc of data.tool_calls) {
          const args = tc.args || {};
          const targetFile = args.TargetFile || '';
          if (targetFile.includes('App.tsx')) {
            console.log(`Step ${data.step_index} (${tc.name}): Description: ${args.Description || 'None'}`);
          }
        }
      }
    }
  } catch (err) {}
});

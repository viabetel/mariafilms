const fs = require('fs');
const path = require('path');
const readline = require('readline');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const logPath = path.join(userProfile, '.gemini', 'antigravity', 'brain', 'b3af024e-21f3-40ba-b561-f333201ffa45', '.system_generated', 'logs', 'transcript.jsonl');

const rl = readline.createInterface({
  input: fs.createReadStream(logPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

let out = [];

rl.on('line', (line) => {
  if (line.includes('mariafilms') && (line.includes('write_to_file') || line.includes('replace_file_content') || line.includes('multi_replace_file_content'))) {
    try {
      const data = JSON.parse(line);
      if (data.tool_calls) {
        for (const call of data.tool_calls) {
          const args = call.args || {};
          const targetFile = args.TargetFile || '';
          if (targetFile.includes('mariafilms')) {
            out.push(`Step ${data.step_index}: ${call.name} -> ${path.basename(targetFile)} | Description: ${args.Description || 'None'}`);
          }
        }
      }
    } catch (err) {}
  }
});

rl.on('close', () => {
  fs.writeFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\all_writes.txt', out.join('\n'), 'utf8');
  console.log('Wrote all_writes.txt');
});

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
    if (data.step_index === 1272) {
      console.log(`Step 1272 found in log!`);
      console.log(`Line length: ${line.length} characters.`);
      console.log(`Does it contain "<truncated" or "truncated "? ${line.includes('truncated')}`);
      // Print first 500 chars and last 500 chars of the line
      console.log(`Start of line: ${line.substring(0, 500)}`);
      console.log(`End of line: ${line.substring(line.length - 500)}`);
    }
  } catch (err) {}
});

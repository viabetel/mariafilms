const fs = require('fs');
const path = require('path');
const readline = require('readline');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const logPath = path.join(userProfile, '.gemini', 'antigravity', 'brain', 'b3af024e-21f3-40ba-b561-f333201ffa45', '.system_generated', 'logs', 'transcript.jsonl');

const rl = readline.createInterface({
  input: fs.createReadStream(logPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

let longestLength = 0;
let longestStep = -1;
let longestName = '';
let longestArgs = null;

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.tool_calls) {
      for (const tc of data.tool_calls) {
        const args = tc.args || {};
        const targetFile = args.TargetFile || args.Target || '';
        if (targetFile.includes('App.tsx')) {
          let codeContent = args.CodeContent || args.ReplacementContent || '';
          if (codeContent.length > longestLength) {
            longestLength = codeContent.length;
            longestStep = data.step_index;
            longestName = tc.name;
            longestArgs = args;
          }
        }
      }
    }
  } catch (err) {}
});

rl.on('close', () => {
  console.log(`Longest App.tsx modification found in Step ${longestStep} (${longestName}) with length ${longestLength} characters.`);
  if (longestStep !== -1) {
    fs.writeFileSync('C:\\Users\\Nicácio\\.gemini\\antigravity\\brain\\b3af024e-21f3-40ba-b561-f333201ffa45\\scratch\\longest_app_args.json', JSON.stringify(longestArgs, null, 2), 'utf8');
    console.log('Saved arguments to scratch/longest_app_args.json');
  }
});

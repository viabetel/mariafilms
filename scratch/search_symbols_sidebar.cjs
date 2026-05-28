const fs = require('fs');
const path = require('path');
const readline = require('readline');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const logPath = path.join(userProfile, '.gemini', 'antigravity', 'brain', 'b3af024e-21f3-40ba-b561-f333201ffa45', '.system_generated', 'logs', 'transcript.jsonl');

const rl = readline.createInterface({
  input: fs.createReadStream(logPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

console.log('Searching transcript for sidebar indicators, symbols, or lateral icons...');

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    let text = '';
    if (data.content) text += data.content + ' ';
    if (data.tool_calls) text += JSON.stringify(data.tool_calls) + ' ';

    const lower = text.toLowerCase();
    if (lower.includes('ícone') || lower.includes('lateral') || lower.includes('símbolo') || lower.includes('sidebar') || lower.includes('dots')) {
      if (lower.includes('portal') || lower.includes('cinematic') || lower.includes('seção')) {
        console.log(`\n========================================`);
        console.log(`[MATCH] STEP ${data.step_index} | Type: ${data.type}`);
        if (data.content) console.log(`Content snippet: ${data.content.substring(0, 300)}`);
        if (data.tool_calls) {
          for (const tc of data.tool_calls) {
            console.log(`Tool call: ${tc.name}`);
            if (tc.args.Description) console.log(`  Description: ${tc.args.Description}`);
            if (tc.args.Instruction) console.log(`  Instruction: ${tc.args.Instruction}`);
          }
        }
      }
    }
  } catch (err) {}
});

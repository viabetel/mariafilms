const fs = require('fs');
const path = require('path');
const readline = require('readline');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const logPath = path.join(userProfile, '.gemini', 'antigravity', 'brain', 'b3af024e-21f3-40ba-b561-f333201ffa45', '.system_generated', 'logs', 'transcript.jsonl');

const rl = readline.createInterface({
  input: fs.createReadStream(logPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

console.log('Searching transcript for lucide-react imports or custom SVG icons in components...');

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    let text = '';
    if (data.content) text += data.content + ' ';
    if (data.tool_calls) text += JSON.stringify(data.tool_calls) + ' ';

    const lower = text.toLowerCase();
    
    // Look for Lucide icons or svg symbols in components
    if (lower.includes('lucide-react') || lower.includes('lucide') || (lower.includes('<svg') && (lower.includes('film') || lower.includes('camera') || lower.includes('play') || lower.includes('video') || lower.includes('shutter') || lower.includes('aperture')))) {
      if (lower.includes('cinematicportal') || lower.includes('app.tsx') || lower.includes('showreel') || lower.includes('portfolio')) {
        console.log(`\n========================================`);
        console.log(`[MATCH] STEP ${data.step_index} | Type: ${data.type}`);
        if (data.tool_calls) {
          for (const tc of data.tool_calls) {
            console.log(`Tool call: ${tc.name} for Target: ${tc.args.TargetFile || tc.args.Target}`);
            if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
              const outPath = `C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\svg_step_${data.step_index}_args.json`;
              fs.writeFileSync(outPath, JSON.stringify(tc.args, null, 2), 'utf8');
              console.log(`  Saved arguments to ${outPath}`);
            }
          }
        }
      }
    }
  } catch (err) {}
});

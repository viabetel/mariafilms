const fs = require('fs');
const path = require('path');
const readline = require('readline');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const logPath = path.join(userProfile, '.gemini', 'antigravity', 'brain', 'b3af024e-21f3-40ba-b561-f333201ffa45', '.system_generated', 'logs', 'transcript.jsonl');

if (!fs.existsSync(logPath)) {
  console.log('Log path not found:', logPath);
  process.exit(1);
}

const rl = readline.createInterface({
  input: fs.createReadStream(logPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

console.log('Searching transcript for CinematicPortal files containing SVG symbols or custom scroll animations...');

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    let text = '';
    if (data.content) text += data.content + ' ';
    if (data.tool_calls) text += JSON.stringify(data.tool_calls) + ' ';

    // We are looking for tool calls that edit CinematicPortal.tsx or write it
    if (data.tool_calls) {
      for (const tc of data.tool_calls) {
        if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
          const args = tc.args || {};
          const target = args.TargetFile || '';
          if (target.includes('CinematicPortal.tsx')) {
            const contentToCheck = args.CodeContent || args.ReplacementContent || '';
            const chunks = args.ReplacementChunks || [];
            
            // Check if there are SVG symbols or scroll indicators/hooks inside
            let hasKeywords = false;
            let checkText = contentToCheck;
            chunks.forEach(chunk => {
              checkText += ' ' + (chunk.ReplacementContent || '');
            });
            
            const lower = checkText.toLowerCase();
            if (lower.includes('svg') || lower.includes('snap') || lower.includes('scroll') || lower.includes('icon') || lower.includes('symbol')) {
              console.log(`\n========================================`);
              console.log(`[MATCH] STEP ${data.step_index} | Type: ${data.type}`);
              console.log(`Target: ${target}`);
              console.log(`Description: ${args.Description}`);
              console.log(`Instruction: ${args.Instruction}`);
              
              // Search for SVGs or Scroll indicators and dump snippets
              if (lower.includes('<svg') || lower.includes('icon') || lower.includes('snap')) {
                console.log(`Contains SVG, icon or snap keywords! Length: ${checkText.length}`);
                
                // Let's write the entire tool call arguments to a file so we can view it
                const outPath = `C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\match_step_${data.step_index}_portal.json`;
                fs.writeFileSync(outPath, JSON.stringify(args, null, 2), 'utf8');
                console.log(`Saved full tool call args to ${outPath}`);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error parsing line:', err.message);
  }
});

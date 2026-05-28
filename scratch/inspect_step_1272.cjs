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
    if (data.step_index === 1272 || data.step_index === 1273) {
      console.log(`\n========================================`);
      console.log(`STEP ${data.step_index} | Source: ${data.source} | Type: ${data.type}`);
      console.log(`========================================`);
      
      if (data.content) {
        console.log(`Content length: ${data.content.length}`);
        console.log(data.content.substring(0, 1000));
      }
      if (data.tool_calls) {
        console.log('Tool Calls:');
        for (const tc of data.tool_calls) {
          console.log(`  Name: ${tc.name}`);
          console.log(`  Args keys:`, Object.keys(tc.args || {}));
          console.log(`  Target file:`, tc.args.TargetFile || tc.args.Target);
          if (tc.args.ReplacementContent) {
            console.log(`  Replacement length: ${tc.args.ReplacementContent.length}`);
            fs.writeFileSync(`C:\\Users\\Nicácio\\.gemini\\antigravity\\brain\\b3af024e-21f3-40ba-b561-f333201ffa45\\scratch\\step_${data.step_index}_replacement.txt`, tc.args.ReplacementContent, 'utf8');
            console.log(`  Wrote replacement content to scratch/step_${data.step_index}_replacement.txt`);
          }
          if (tc.args.ReplacementChunks) {
            console.log(`  Chunks found: ${tc.args.ReplacementChunks.length}`);
            tc.args.ReplacementChunks.forEach((chunk, i) => {
              console.log(`  Chunk ${i} keys:`, Object.keys(chunk));
              console.log(`  StartLine: ${chunk.StartLine}, EndLine: ${chunk.EndLine}`);
              console.log(`  TargetContent length: ${chunk.TargetContent.length}`);
              console.log(`  ReplacementContent length: ${chunk.ReplacementContent.length}`);
              fs.writeFileSync(`C:\\Users\\Nicácio\\.gemini\\antigravity\\brain\\b3af024e-21f3-40ba-b561-f333201ffa45\\scratch\\step_${data.step_index}_chunk_${i}_replacement.txt`, chunk.ReplacementContent, 'utf8');
              console.log(`  Wrote chunk ${i} replacement to scratch/step_${data.step_index}_chunk_${i}_replacement.txt`);
            });
          }
        }
      }
    }
  } catch (err) {}
});

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const brainDir = 'C:\\Users\\Nicácio\\.gemini\\antigravity\\brain';
const folders = fs.readdirSync(brainDir).filter(f => fs.statSync(path.join(brainDir, f)).isDirectory() && f !== 'tempmediaStorage');

console.log(`Scanning transcripts in ${folders.length} folders...`);

async function searchLog(folder) {
  const logPath = path.join(brainDir, folder, '.system_generated', 'logs', 'transcript.jsonl');
  if (!fs.existsSync(logPath)) return;
  
  const fileStream = fs.createReadStream(logPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    try {
      const data = JSON.parse(line);
      let text = '';
      if (data.content) text += data.content + ' ';
      if (data.tool_calls) text += JSON.stringify(data.tool_calls) + ' ';
      
      const lower = text.toLowerCase();
      // Look for specific combinations
      if (lower.includes('briefing') && lower.includes('deadline') && (lower.includes('budget') || lower.includes('avançar'))) {
        console.log(`[FOUND BRIEFING] Folder: ${folder} | Step: ${data.step_index} | Type: ${data.type}`);
        if (data.tool_calls) {
          for (const tc of data.tool_calls) {
            if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
              console.log(`  Tool call: ${tc.name} for target: ${tc.args.TargetFile || tc.args.Target}`);
              console.log(`  Content length: ${tc.args.CodeContent ? tc.args.CodeContent.length : (tc.args.ReplacementContent ? tc.args.ReplacementContent.length : 0)}`);
            }
          }
        }
      }
      if (lower.includes('transparent') && lower.includes('maria_portrait') && (lower.includes('transparent background') || lower.includes('fundo transparente'))) {
        console.log(`[FOUND TRANS-IMG] Folder: ${folder} | Step: ${data.step_index} | Type: ${data.type}`);
      }
    } catch (e) {}
  }
}

async function run() {
  for (const folder of folders) {
    await searchLog(folder);
  }
  console.log('Scan complete.');
}

run();

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const brainDir = 'C:\\Users\\Nicácio\\.gemini\\antigravity\\brain';
const folders = fs.readdirSync(brainDir).filter(f => fs.statSync(path.join(brainDir, f)).isDirectory() && f !== 'tempmediaStorage');

console.log(`Scanning transcripts in ${folders.length} folders for SVG sidebar icon keywords...`);

async function searchLog(folder) {
  const logPath = path.join(brainDir, folder, '.system_generated', 'logs', 'transcript.jsonl');
  if (!fs.existsSync(logPath)) return;
  
  const fileStream = fs.createReadStream(logPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      let text = '';
      if (data.content) text += data.content + ' ';
      if (data.tool_calls) text += JSON.stringify(data.tool_calls) + ' ';
      
      const lower = text.toLowerCase();
      if ((lower.includes('film') || lower.includes('shutter') || lower.includes('sound') || lower.includes('clapper') || lower.includes('dock')) && 
          (lower.includes('dock') || lower.includes('indicator') || lower.includes('dots') || lower.includes('sidebar') || lower.includes('nav')) &&
          (lower.includes('svg') || lower.includes('<path'))) {
        console.log(`[MATCH] Folder: ${folder} | Step: ${data.step_index} | Type: ${data.type}`);
        if (data.tool_calls) {
          for (const tc of data.tool_calls) {
            if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
              console.log(`  Tool call: ${tc.name} for target: ${tc.args.TargetFile || tc.args.Target}`);
              const args = tc.args || {};
              const code = args.CodeContent || args.ReplacementContent || '';
              console.log(`  Content length: ${code.length}`);
              // If it contains paths like <path d="..." write it to a dump file
              if (code.includes('<path') || JSON.stringify(args.ReplacementChunks || []).includes('<path')) {
                const dumpName = `scratch/svg_found_${folder}_step_${data.step_index}.json`;
                fs.writeFileSync(path.join('c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms', dumpName), JSON.stringify(args, null, 2), 'utf8');
                console.log(`  -> Dumped tool args to ${dumpName}`);
              }
            }
          }
        }
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

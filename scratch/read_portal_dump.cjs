const fs = require('fs');
const path = require('path');

const dumpPath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\portal_steps_dump.json';

if (!fs.existsSync(dumpPath)) {
  console.log('Dump file not found');
  process.exit(1);
}

let content = fs.readFileSync(dumpPath);
let text = '';
if (content[0] === 0xFF && content[1] === 0xFE) {
  text = content.toString('utf16le');
} else if (content[0] === 0xFE && content[1] === 0xFF) {
  text = content.toString('utf16be');
} else {
  text = content.toString('utf8');
}

const blocks = text.split(/={40}/);
console.log(`Found ${blocks.length} blocks in dump file.`);

for (const block of blocks) {
  if (block.includes('FOUND STEP')) {
    const headerLine = block.split('\n')[1] || '';
    console.log(`\nBlock Header: ${headerLine.trim()}`);
    
    // Find the first '{' and last '}'
    const startIdx = block.indexOf('{');
    const endIdx = block.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = block.substring(startIdx, endIdx + 1);
      try {
        const parsed = JSON.parse(jsonStr);
        console.log(`Successfully parsed JSON for step! Name: ${parsed.name}`);
        if (parsed.args) {
          const argsKeys = Object.keys(parsed.args);
          console.log(`  Args: ${argsKeys.join(', ')}`);
          if (parsed.args.TargetFile) console.log(`  Target: ${parsed.args.TargetFile}`);
          if (parsed.args.Description) console.log(`  Description: ${parsed.args.Description}`);
          
          // Let's write the step args to a separate file so we can view them easily
          const stepMatch = headerLine.match(/FOUND STEP (\d+)/);
          if (stepMatch) {
            const stepNum = stepMatch[1];
            const outPath = `c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_${stepNum}_args.json`;
            fs.writeFileSync(outPath, JSON.stringify(parsed.args, null, 2), 'utf8');
            console.log(`  Saved arguments to ${outPath}`);
          }
        }
      } catch (err) {
        console.log(`  Failed to parse JSON: ${err.message}`);
        // Let's print the first 200 and last 200 chars of the jsonStr
        console.log(`  jsonStr length: ${jsonStr.length}`);
        console.log(`  Start: ${jsonStr.substring(0, 200)}`);
        console.log(`  End: ${jsonStr.substring(jsonStr.length - 200)}`);
      }
    }
  }
}

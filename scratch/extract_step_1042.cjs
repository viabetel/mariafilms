const fs = require('fs');
const path = require('path');

const snapPath = 'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_1042_args.json';
const data = JSON.parse(fs.readFileSync(snapPath, 'utf8'));

// The ReplacementChunks is a JSON string inside the JSON
let chunks = data.ReplacementChunks;
if (typeof chunks === 'string') {
  chunks = JSON.parse(chunks);
}

fs.writeFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_1042_chunks.json', JSON.stringify(chunks, null, 2), 'utf8');
console.log('Saved chunks to scratch/step_1042_chunks.json');

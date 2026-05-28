const fs = require('fs');
const path = require('path');

const files = [
  'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js',
  'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-DgBRnfWB.js',
  'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BIcZ2q7P.js'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  
  // Find where the dots/icons array is mapped. It usually looks like [0,1,2,3].map
  // or contains names of stages like 'essência' or 'ritmo'.
  // Let's search for "essência" (or represented with unicode) or "contato" or "esculpir"
  // Let's print out the exact array mapping code if it exists.
  const regex = /\[\s*0\s*,\s*1\s*,\s*2\s*,\s*3\s*\]\.map/g;
  let match;
  console.log(`\n========================================`);
  console.log(`Scanning ${path.basename(file)}:`);
  
  // Let's search for "esculp" and output the mapping code around it
  let index = text.indexOf('esculp');
  while (index !== -1) {
    const start = Math.max(0, index - 500);
    const end = Math.min(text.length, index + 1500);
    const snippet = text.substring(start, end);
    if (snippet.includes('.map')) {
      console.log(`Found mapping around 'esculp' at index ${index}:`);
      console.log(snippet);
      console.log(`----------------------------------------`);
    }
    index = text.indexOf('esculp', index + 1);
  }
});

const fs = require('fs');

const bundlePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js';
if (!fs.existsSync(bundlePath)) {
  console.log('Bundle not found');
  process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');
const term = 'showreel';

let idx = content.toLowerCase().indexOf(term);
if (idx !== -1) {
  console.log(`Found '${term}' at index ${idx}`);
  console.log(`Snippet: ${content.substring(idx - 100, idx + 400).replace(/\r?\n/g, ' ')}`);
} else {
  console.log(`'${term}' NOT found in the bundle.`);
}

const fs = require('fs');
const path = require('path');

const bundlePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js';

if (!fs.existsSync(bundlePath)) {
  console.log('Bundle not found');
  process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');

const searchTerms = ['snap', 'scroll-snap', 'snap-start', 'snap-always'];

for (const term of searchTerms) {
  let count = 0;
  let idx = content.indexOf(term);
  while (idx !== -1) {
    count++;
    idx = content.indexOf(term, idx + 1);
  }
  console.log(`Term '${term}' count in bundle: ${count}`);
}

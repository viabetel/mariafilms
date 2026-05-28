const fs = require('fs');

const bundlePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js';
if (!fs.existsSync(bundlePath)) {
  console.log('Bundle not found');
  process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');

// The JSX was found around index 40425. The component state must be defined earlier.
// Let's print from index 35000 to 38500!
const slice = content.substring(34500, 38500);
fs.writeFileSync('c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\Showreel_start.js', slice, 'utf8');
console.log(`Saved Showreel start to scratch/Showreel_start.js (${slice.length} chars)`);

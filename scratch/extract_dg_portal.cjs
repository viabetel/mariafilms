const fs = require('fs');

const filePath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\dg_extracted.js';
if (!fs.existsSync(filePath)) {
  console.log('File not found');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// Slice PortfolioSection (function l) from index 6576 to 9815
const portfolio = content.substring(6576, 9815);
// Slice CinematicPortal (function u) from index 9815 to 22840
const portal = content.substring(9815, 22840);

fs.writeFileSync('c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\PortfolioSection_compiled.js', portfolio, 'utf8');
fs.writeFileSync('c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\CinematicPortal_compiled.js', portal, 'utf8');

console.log('Successfully separated compiled sections from dg_extracted.js:');
console.log(`- PortfolioSection_compiled.js: ${portfolio.length} chars`);
console.log(`- CinematicPortal_compiled.js: ${portal.length} chars`);

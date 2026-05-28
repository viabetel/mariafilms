const fs = require('fs');
const path = require('path');

const files = [
  'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BzzfbiKr.js',
  'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-DgBRnfWB.js',
  'C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\formatted-index-BIcZ2q7P.js'
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('File does not exist:', file);
    return;
  }
  console.log(`\n========================================`);
  console.log(`File: ${path.basename(file)}`);
  console.log(`========================================`);
  
  const text = fs.readFileSync(file, 'utf8');
  
  // Search for the dots navigation code: we know it contains "essência" (or "essncia") and "esculpir"
  // Let's search for "esculpir" in the file and print 2000 characters around it!
  const index = text.indexOf('esculpir');
  if (index !== -1) {
    console.log(`Found 'esculpir' at index ${index}`);
    const snippet = text.substring(Math.max(0, index - 800), Math.min(text.length, index + 2500));
    console.log('Snippet:');
    console.log(snippet);
  } else {
    // Try the encoded version with bad character representation
    const altIndex = text.indexOf('esculp');
    if (altIndex !== -1) {
      console.log(`Found 'esculp' at index ${altIndex}`);
      const snippet = text.substring(Math.max(0, altIndex - 800), Math.min(text.length, altIndex + 2500));
      console.log('Snippet:');
      console.log(snippet);
    } else {
      console.log("Could not find 'esculpir' or 'esculp'");
    }
  }
});

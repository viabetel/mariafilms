const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\scratch\\step_3828_code.txt', 'utf8');

const startIndex = content.indexOf('const handleWheel');
if (startIndex !== -1) {
  const slice = content.substring(startIndex, startIndex + 3000);
  console.log('Found handleWheel in step 3828:\n', slice);
} else {
  console.log('handleWheel not found in step 3828');
}

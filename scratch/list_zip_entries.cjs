const { execSync } = require('child_process');
const fs = require('fs');

const zipPath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\deploy.zip';

if (!fs.existsSync(zipPath)) {
  console.log('Zip file not found');
  process.exit(1);
}

try {
  // Use PowerShell to list zip contents
  console.log('Listing zip entries using PowerShell...');
  const cmd = `PowerShell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${zipPath}').Entries | Select-Object -Property FullName, Length"`;
  const result = execSync(cmd, { maxBuffer: 1024 * 1024 * 5 }).toString('utf8');
  console.log(result);
} catch (err) {
  console.error('Error listing zip entries:', err.message);
}

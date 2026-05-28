import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const videoPath = path.resolve('camera 360.mp4');
const framesDir = path.resolve('public/frames');

console.log('ffmpeg binary located at:', ffmpeg.path);
console.log('input video path:', videoPath);
console.log('output frames directory:', framesDir);

// ensure frames directory exists and is empty
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
} else {
  console.log('cleaning existing frames...');
  const files = fs.readdirSync(framesDir);
  for (const file of files) {
    fs.unlinkSync(path.join(framesDir, file));
  }
}

// run ffmpeg to extract frames at 8 fps (approx. 250 frames for a 32s video)
// -qscale:v 2 ensures high quality JPEG compression
const cmd = `"${ffmpeg.path}" -i "${videoPath}" -vf "fps=8" -qscale:v 2 "${path.join(framesDir, 'frame_%03d.jpg')}"`;

console.log('executing command:', cmd);

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error('error extracting frames via ffmpeg:', err);
    console.error(stderr);
    process.exit(1);
  }
  
  const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg'));
  console.log(`success! extracted ${files.length} frames.`);
});

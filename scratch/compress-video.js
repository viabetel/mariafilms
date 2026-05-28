import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ffmpegPath = ffmpeg.path;
const rootDir = path.resolve();
const publicDir = path.join(rootDir, 'public');

console.log('Using FFmpeg from:', ffmpegPath);
console.log('Root directory:', rootDir);

function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject({ err, stderr });
      } else {
        resolve(stdout);
      }
    });
  });
}

async function compressMainVideo() {
  // Read the original camera 360.mp4 from root dir (not locked by server)
  const inputVideo = path.join(rootDir, 'camera 360.mp4');
  const outputVideo = path.join(publicDir, 'camera_360_compressed.mp4');
  
  console.log(`\n--- Compressing Showreel Video (From Root to Public) ---`);
  console.log(`Input: ${inputVideo}`);
  console.log(`Output: ${outputVideo}`);
  
  if (!fs.existsSync(inputVideo)) {
    console.error(`Error: input video does not exist at ${inputVideo}`);
    return;
  }

  // Compress using libx264, crf 26, AAC audio
  const cmd = `"${ffmpegPath}" -y -i "${inputVideo}" -c:v libx264 -crf 26 -preset fast -c:a aac -b:a 128k "${outputVideo}"`;
  
  try {
    const originalSize = fs.statSync(inputVideo).size;
    console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('Running compression command...');
    await runCmd(cmd);
    
    const newSize = fs.statSync(outputVideo).size;
    console.log(`Compressed size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Compression ratio: ${((1 - newSize / originalSize) * 100).toFixed(1)}% space saved`);
    console.log('Successfully compressed and saved to public/camera_360_compressed.mp4!');
  } catch (error) {
    console.error('Failed to compress video:', error);
  }
}

compressMainVideo();

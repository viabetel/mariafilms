import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ffmpegPath = ffmpeg.path;
const rootDir = path.resolve();
const publicDir = path.join(rootDir, 'public');

console.log('FFmpeg path:', ffmpegPath);

function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('CMD Error:', stderr);
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function main() {
  // 1. Compress main video
  const inputMain = path.join(rootDir, 'camera 360.mp4');
  const outputMain = path.join(publicDir, 'camera_360_compressed.mp4');
  if (fs.existsSync(inputMain)) {
    console.log('Compressing main video...');
    const cmd = `"${ffmpegPath}" -y -i "${inputMain}" -c:v libx264 -crf 26 -preset fast -c:a aac -b:a 128k "${outputMain}"`;
    await runCmd(cmd);
    console.log('Main video compressed successfully.');
  } else {
    console.log('Main video not found at', inputMain);
  }

  // 2. Compress background video
  const inputBg = path.join(rootDir, 'Efeit Festa.mp4');
  const tempMp4 = path.join(publicDir, 'Efeit Festa_temp.mp4');
  const tempWebm = path.join(publicDir, 'Efeit Festa_temp.webm');
  const finalMp4 = path.join(publicDir, 'Efeit Festa.mp4');
  const finalWebm = path.join(publicDir, 'Efeit Festa.webm');

  if (fs.existsSync(inputBg)) {
    console.log('Compressing background video to MP4...');
    const mp4Cmd = `"${ffmpegPath}" -y -i "${inputBg}" -vf scale=1280:720 -c:v libx264 -crf 28 -preset fast -an "${tempMp4}"`;
    await runCmd(mp4Cmd);
    
    console.log('Compressing background video to WebM...');
    const webmCmd = `"${ffmpegPath}" -y -i "${inputBg}" -vf scale=1280:720 -c:v libvpx-vp9 -crf 38 -b:v 0 -an "${tempWebm}"`;
    await runCmd(webmCmd);

    // Replace original files
    try {
      if (fs.existsSync(tempMp4)) {
        if (fs.existsSync(finalMp4)) {
          fs.unlinkSync(finalMp4);
        }
        fs.renameSync(tempMp4, finalMp4);
      }
      if (fs.existsSync(tempWebm)) {
        if (fs.existsSync(finalWebm)) {
          fs.unlinkSync(finalWebm);
        }
        fs.renameSync(tempWebm, finalWebm);
      }
      console.log('Background videos compressed successfully.');
    } catch (e) {
      console.error('Error replacing background videos (they might be locked, which is fine if they are already optimized):', e);
    }
  } else {
    console.log('Background video not found at', inputBg);
  }
}

main().catch(console.error);

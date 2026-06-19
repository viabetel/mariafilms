// Re-encoda os frames da sequência de câmera de 4K (3840×2160) para 1920px de
// largura. O canvas do CinematicAct desenha em ~1080p, então o 4K só pesava a
// RAM (cada frame virava um bitmap de ~33MB) e encarecia o drawImage (reescala
// 4K→1080 por frame de scroll). Os originais 4K ficam em frames_4k_backup/.
//
// Uso: node scripts/downscale-frames.mjs
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'frames_4k_backup');
const OUT = join(root, 'public', 'frames');
const TARGET_WIDTH = 1920;
const QUALITY = 80;

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith('.webp')).sort();
console.log(`Re-encodando ${files.length} frames → ${TARGET_WIDTH}px / q${QUALITY}...`);

let done = 0;
const CONCURRENCY = 8;
let cursor = 0;

async function worker() {
  while (cursor < files.length) {
    const f = files[cursor++];
    await sharp(join(SRC, f))
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toFile(join(OUT, f));
    done++;
    if (done % 25 === 0 || done === files.length) {
      process.stdout.write(`\r  ${done}/${files.length}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log('\nPronto.');

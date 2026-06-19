// Captura mobile das seções que mudaram, usando o Chrome do sistema.
// Uso: node scripts/shot.mjs
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:5173/';
const OUT = 'scripts/shots';
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
// reduced-motion = sem Lenis: scroll nativo estável pra capturar layout sem brigas de pin
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

console.log('abrindo', URL);
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(6000); // espera o loader pré-carregar os frames e revelar o site

const shot = async (name) => {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot', name);
};
const scrollTo = async (sel) => {
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (el) el.scrollIntoView({ block: 'center' });
  }, sel);
  await sleep(1400);
};

// 1) topo + navbar
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(500);
await shot('01-top');

// 2) menu mobile aberto
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button[aria-label]')].find((x) => /menu/.test(x.getAttribute('aria-label') || ''));
  if (b) b.click();
});
await sleep(700);
await shot('02-menu');
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button[aria-label]')].find((x) => /menu/.test(x.getAttribute('aria-label') || ''));
  if (b) b.click();
});
await sleep(400);

// 3) SocialDepth
await scrollTo('.sd-title');
await shot('03-social');

// 4) Features
await scrollTo('.feat-grid');
await shot('04-features');

// 5) Portfolio (carrossel) — primeiro painel
await scrollTo('#filmes .tw-panel');
await shot('05-portfolio-1');
// desliza o carrossel pro 2º painel pra provar o swipe/snap
await page.evaluate(() => {
  const track = document.querySelector('#filmes .no-scrollbar');
  if (track) track.scrollBy({ left: track.clientWidth, behavior: 'instant' in document.body.style ? 'instant' : 'auto' });
});
await sleep(800);
await shot('06-portfolio-2');

await browser.close();
console.log('ok');

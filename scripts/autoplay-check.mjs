// Verifica funcionalmente que o carrossel de trabalhos anda sozinho no mobile.
import puppeteer from 'puppeteer-core';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(6500); // loader + frames

// leva a seção de trabalhos pra viewport (Lenis usa scroll real)
await page.evaluate(() => {
  const el = document.querySelector('#filmes');
  if (el) window.scrollTo(0, el.offsetTop + 200);
});
await sleep(1500);

const read = () => page.evaluate(() => {
  const t = document.querySelector('#filmes .no-scrollbar');
  return t ? Math.round(t.scrollLeft) : -1;
});

const a = await read();
await sleep(4500);
const b = await read();
await sleep(4500);
const c = await read();
console.log('scrollLeft ao longo do tempo:', a, '->', b, '->', c);
console.log(a !== b || b !== c ? 'OK: o carrossel andou sozinho' : 'NAO ANDOU (verificar)');

await browser.close();

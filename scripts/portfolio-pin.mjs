import puppeteer from 'puppeteer-core';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(6000);
const info = await page.evaluate(() => ({ top: document.querySelector('#filmes').offsetTop, vw: window.innerWidth }));
// vai pro meio do percurso do pin
await page.evaluate((y) => window.scrollTo(0, y), info.top + 1.5 * info.vw);
await sleep(700);
const pin = await page.evaluate(() => {
  const pinEl = document.querySelector('#filmes > div'); // pinRef
  return Math.round(pinEl.getBoundingClientRect().top);
});
console.log('topo do elemento pinado no meio do scroll =', pin, 'px (perto de 0 = pinado)');
await page.screenshot({ path: 'scripts/shots/portfolio-mobile-mid.png' });
console.log('print salvo');
await browser.close();

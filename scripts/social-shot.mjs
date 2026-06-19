// Captura a seção Instagram (SocialDepth) em desktop e mobile.
import puppeteer from 'puppeteer-core';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'scripts/shots';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });

async function grab(name, w, h, mobile) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(6000);
  await page.evaluate(() => { const e = document.querySelector('.sd-title'); if (e) e.scrollIntoView({ block: 'center' }); });
  await sleep(1200);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot', name);
  await page.close();
}

await grab('social-desktop', 1440, 900, false);
await grab('social-mobile', 390, 844, true);
await browser.close();

import puppeteer from 'puppeteer-core';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 820, height: 1100, deviceScaleFactor: 1.5 });
await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(1200);
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /nova proposta/i.test(x.textContent)); if (b) b.click(); });
await sleep(800);
// rola até o bloco de valores da versão mensal (V2)
await page.evaluate(() => { const e = [...document.querySelectorAll('label')].find((x) => /valor mensal/i.test(x.textContent)); if (e) e.scrollIntoView({ block: 'center' }); });
await sleep(500);
await page.screenshot({ path: 'scripts/shots/admin-pricing.png' });
console.log('shot admin-pricing');
await browser.close();

// Captura mobile do /admin e /proposta (telas internas).
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:5173';
const OUT = 'scripts/shots';
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` }).then(() => console.log('shot', n));
const clickText = (txt) => page.evaluate((t) => {
  const el = [...document.querySelectorAll('button,a')].find((x) => x.textContent.trim().toLowerCase().includes(t));
  if (el) el.click();
  return !!el;
}, txt);

// ---------- ADMIN ----------
await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(1500);
await shot('admin-01-top');
await page.evaluate(() => window.scrollTo(0, 520));
await sleep(400);
await shot('admin-02-table');

// editor novo
await page.evaluate(() => window.scrollTo(0, 0));
await clickText('nova proposta');
await sleep(800);
await shot('admin-03-editor-top');
// rolar o modal até os entregáveis/cronograma
await page.evaluate(() => {
  const el = [...document.querySelectorAll('label')].find((x) => /entreg/.test(x.textContent));
  if (el) el.scrollIntoView({ block: 'start' });
});
await sleep(500);
await shot('admin-04-editor-entregaveis');
await page.evaluate(() => {
  const el = [...document.querySelectorAll('label')].find((x) => /cronograma/.test(x.textContent));
  if (el) el.scrollIntoView({ block: 'start' });
});
await sleep(500);
await shot('admin-05-editor-cronograma');
await clickText('cancelar');
await sleep(400);

// detalhe (drawer)
await clickText('detalhe');
await sleep(800);
await shot('admin-06-detail');

// ---------- PROPOSTA ----------
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.goto(`${BASE}/proposta?c=studio-lumen`, { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(2500);
await shot('prop-01-hero');
await page.evaluate(() => { const e = [...document.querySelectorAll('h2')].find((x) => /escolha sua/.test(x.textContent)); if (e) e.scrollIntoView({ block: 'start' }); });
await sleep(900);
await shot('prop-02-planos');
await page.evaluate(() => { const e = [...document.querySelectorAll('h2')].find((x) => /presença constante/.test(x.textContent)); if (e) e.scrollIntoView({ block: 'start' }); });
await sleep(900);
await shot('prop-03-cronograma');
await page.evaluate(() => { const e = document.querySelector('#assinar'); if (e) e.scrollIntoView({ block: 'start' }); });
await sleep(900);
await shot('prop-04-aceite');

await browser.close();
console.log('ok');

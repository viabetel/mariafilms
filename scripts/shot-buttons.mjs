// Captura o drawer de detalhe (botões fortes) com uma proposta criada (semeada).
import puppeteer from 'puppeteer-core';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'scripts/shots';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

// semeia uma proposta criada (editável) antes do app carregar
await page.evaluateOnNewDocument(() => {
  const now = new Date().toISOString();
  localStorage.setItem('mf_proposals', JSON.stringify([
    { token: 'cliente-teste-x1', clienteNome: 'Cliente Teste', intro: '', days: 7, plans: [], status: 'pendente', createdAt: now, archived: false, notes: '', events: [{ type: 'created', at: now }] },
  ]));
});

await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(1500);

// abre o detalhe do cliente teste
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Cliente Teste');
  if (b) b.click();
});
await sleep(800);
// rola o drawer até embaixo (ações)
await page.evaluate(() => {
  const aside = document.querySelector('aside');
  if (aside) aside.scrollTop = aside.scrollHeight;
});
await sleep(500);
await page.screenshot({ path: `${OUT}/admin-07-drawer-acoes.png` });
console.log('ok');
await browser.close();

import puppeteer from 'puppeteer-core';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'scripts/shots';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });

// 1) FORMULÁRIO de aceite com telefone (mobile)
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto('http://localhost:5173/proposta?c=studio-lumen', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(2500);
  await page.evaluate(() => { const e = document.querySelector('#assinar'); if (e) e.scrollIntoView({ block: 'start' }); });
  await sleep(900);
  await page.evaluate(() => window.scrollBy(0, 360));
  await sleep(500);
  await page.screenshot({ path: `${OUT}/prop-aceite-tel.png` });
  console.log('shot prop-aceite-tel');
  await page.close();
}

// 2) DRAWER com signatário + contato (semeia proposta já aceita)
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.evaluateOnNewDocument(() => {
    const now = new Date().toISOString();
    localStorage.setItem('mf_proposals', JSON.stringify([
      { token: 'cliente-aceito-x1', clienteNome: 'Joana Ribeiro', intro: '', days: 7, plans: [], status: 'aguardando_assinatura', createdAt: now, archived: false,
        signer: { nome: 'Joana Ribeiro', documento: '123.456.789-09', email: 'joana@exemplo.com', telefone: '(32) 99888-7766', consentAt: now },
        events: [{ type: 'created', at: now }, { type: 'accepted', at: now }] },
    ]));
  });
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(1500);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Joana Ribeiro'); if (b) b.click(); });
  await sleep(800);
  await page.evaluate(() => { const t = [...document.querySelectorAll('div')].find((x) => x.textContent.trim() === 'dados do signatário'); if (t) t.scrollIntoView({ block: 'start' }); });
  await sleep(500);
  await page.screenshot({ path: `${OUT}/admin-contato.png` });
  console.log('shot admin-contato');
  await page.close();
}
await browser.close();

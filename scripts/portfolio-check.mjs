// Verifica que, no mobile, a seção de trabalhos PRENDE (pin) e o trilho anda
// lateral conforme o scroll vertical desce — igual ao desktop.
import puppeteer from 'puppeteer-core';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
// reduced-motion: desliga o Lenis pra o scroll programático ser fiel (o pin do
// ScrollTrigger funciona do mesmo jeito).
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(6000);

const info = await page.evaluate(() => {
  const sec = document.querySelector('#filmes');
  const panel = document.querySelector('#filmes .tw-panel');
  return { top: sec.offsetTop, panelW: panel.getBoundingClientRect().width, vw: window.innerWidth };
});
console.log('largura do painel =', Math.round(info.panelW), '| viewport =', info.vw, '(igual = ocupa a tela toda)');

const tx = () => page.evaluate(() => {
  const track = document.querySelector('#filmes .flex.h-full');
  const m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
  const sectionPinned = (() => {
    const sec = document.querySelector('#filmes');
    const r = sec.getBoundingClientRect();
    return Math.round(r.top); // ~0 enquanto pinado no topo
  })();
  return { x: Math.round(m.m41), pinnedTop: sectionPinned };
});

const range = 3 * info.vw; // distância de scroll do pin (3 painéis)
const pts = [0, 0.25, 0.5, 0.75, 1];
const out = [];
for (const p of pts) {
  await page.evaluate((y) => window.scrollTo(0, y), info.top + range * p + 4);
  await sleep(500);
  const t = await tx();
  out.push({ p, ...t });
}
console.log('scroll vertical -> translateX do trilho (deve ficar cada vez mais negativo):');
out.forEach((o) => console.log(`  ${Math.round(o.p * 100)}%  x=${o.x}px  topo-da-secao=${o.pinnedTop}px`));
const moved = out[0].x !== out[out.length - 1].x;
const pinned = Math.abs(out[2].pinnedTop) < 30; // no meio, a seção deve estar grudada no topo
console.log(moved ? 'OK: o trilho andou lateral' : 'FALHOU: trilho nao mexeu');
console.log(pinned ? 'OK: a secao ficou pinada (presa no topo)' : 'ATENCAO: nao confirmou o pin');
await browser.close();

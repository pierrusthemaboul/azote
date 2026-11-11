import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const fontReqs = [];
page.on('response', r => { if (r.url().match(/fonts\.(googleapis|gstatic)/)) fontReqs.push(r.status() + ' ' + r.url().slice(0, 110)); });
await page.goto('http://localhost:5200/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const fontTest = await page.evaluate(() => {
  const probe = (family, weight) => {
    const s = document.createElement('span');
    s.textContent = 'Cuisine Sensations Émotions ABCDEFGH';
    s.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-size:100px;font-weight:${weight};font-family:${family}`;
    document.body.appendChild(s);
    const w = s.getBoundingClientRect().width;
    s.remove();
    return Math.round(w * 100) / 100;
  };
  const fallbackName = '__NoSuchFont_xyz__';
  const wMont = probe('Montserrat', 200);
  const wJost = probe('Jost', 200);
  const wMiss = probe(fallbackName, 200);
  const wSegoe = probe('"Segoe UI"', 200);
  const wArial = probe('Arial', 200);
  const loaded = [...document.fonts].map(f => `${f.family} ${f.weight} ${f.status}`);
  const checkMont = document.fonts.check('200 100px Montserrat');
  return { wMont, wJost, wMiss, wSegoe, wArial, loaded, checkMont,
    montIsFallback: Math.abs(wMont - wMiss) < 0.5, montDiffersFromSegoe: Math.abs(wMont - wSegoe) > 0.5, montDiffersFromArial: Math.abs(wMont - wArial) > 0.5 };
});
console.log('RÉQUÊTES GOOGLE FONTS:', JSON.stringify(fontReqs, null, 1));
console.log('TEST DE POLICE:', JSON.stringify(fontTest, null, 1));

// which image lacks alt + count contrast failures precisely on /reserver
const misc = await page.evaluate(() => {
  const noAlt = [...document.images].filter(i => !i.alt).map(i => ({ f: i.currentSrc.split('/').pop(), cls: (i.className||''), parent: (i.parentElement.className||'').slice(0,40), w: Math.round(i.getBoundingClientRect().width) }));
  const smallMagenta = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && getComputedStyle(e).color === 'rgb(217, 79, 158)' && e.textContent.trim()).map(e => ({ t: e.textContent.trim().slice(0,40), size: getComputedStyle(e).fontSize }));
  return { noAlt, magentaSmall: smallMagenta.length, magentaSizes: [...new Set(smallMagenta.map(m => m.size))], sample: smallMagenta.slice(0, 12) };
});
console.log('IMG SANS ALT:', JSON.stringify(misc.noAlt));
console.log('TEXTE MAGENTA:', misc.magentaSmall, 'tailles:', JSON.stringify(misc.magentaSizes));
console.log('échantillon:', JSON.stringify(misc.sample, null, 1));
await b.close();

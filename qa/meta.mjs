import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const w of [375, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:5200/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const res = await page.evaluate(() => {
    const vw = window.innerWidth;
    const r = (e) => { const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), right: +b.right.toFixed(1) }; };
    const items = [...document.querySelectorAll('.hero__meta-item')].map((e, i) => {
      const cs = getComputedStyle(e);
      return { i, ...r(e), brW: cs.borderRightWidth, brC: cs.borderRightColor, bbW: cs.borderBottomWidth,
               txt: e.querySelector('.hero__meta-label')?.textContent };
    });
    const mq = document.querySelector('.marquee');
    const hero = document.querySelector('.hero');
    const meta = document.querySelector('.hero__meta');
    // elements whose right edge is within 2px of the viewport edge
    const edge = [...document.querySelectorAll('*')].filter(e => {
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      const bb = e.getBoundingClientRect(); if (bb.width === 0 || bb.height === 0) return false;
      return Math.abs(bb.right - vw) <= 2 && (cs.borderRightWidth !== '0px' || cs.borderRightStyle !== 'none');
    }).map(e => ({ tag: e.tagName.toLowerCase(), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 45), brW: getComputedStyle(e).borderRightWidth }));
    return { vw, hero: r(hero), meta: r(meta), marquee: r(mq), items, edgeWithRightBorder: edge.slice(0, 8) };
  });
  console.log('=' + '='.repeat(70));
  console.log('viewport', res.vw, ' hero', JSON.stringify(res.hero), ' meta', JSON.stringify(res.meta), ' marquee', JSON.stringify(res.marquee));
  for (const it of res.items) console.log(`  item#${it.i} ${String(it.txt).padEnd(11)} x=${String(it.x).padStart(6)} w=${String(it.w).padStart(6)} right=${String(it.right).padStart(6)} h=${String(it.h).padStart(5)} borderRight=${it.brW} borderBottom=${it.bbW}`);
  console.log('  éléments collés au bord droit AVEC bordure droite :', JSON.stringify(res.edgeWithRightBorder));
  await ctx.close();
}
await b.close();

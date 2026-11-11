import { chromium } from 'playwright-core';

const b = await chromium.launch({ channel: 'chrome', headless: true });

async function probe(label, css) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  if (css) await page.addInitScript((c) => {
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style'); s.textContent = c; document.head.appendChild(s);
    });
  }, css);
  await page.goto('http://localhost:5200/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const bs = getComputedStyle(document.body);
    const before = getComputedStyle(document.body, '::before');
    const hero = document.querySelector('.hero');
    const hs = hero ? getComputedStyle(hero) : null;
    return {
      colorScheme: bs.colorScheme,
      prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      forcedColors: window.matchMedia('(forced-colors: active)').matches,
      bodyBg: bs.backgroundColor,
      htmlBg: getComputedStyle(document.documentElement).backgroundColor,
      beforeOpacity: before.opacity,
      beforeBgColor: before.backgroundColor,
      beforeZ: before.zIndex,
      beforeMask: before.maskImage + '|' + before.webkitMaskImage,
      beforeBgImageLen: (before.backgroundImage || '').length,
      beforeBgImageHead: (before.backgroundImage || '').slice(0, 90),
      heroBg: hs && hs.backgroundColor,
      heroMinH: hs && hs.minHeight,
      scrollY: window.scrollY,
      topElement: (() => { const e = document.elementFromPoint(720, 450); return e ? e.tagName + '.' + (typeof e.className === 'string' ? e.className : '') : null; })(),
      counts: {
        reveal: document.querySelectorAll('[data-reveal]').length,
        zoom: document.querySelectorAll('[data-zoom]').length
      },
      hiddenReveal: [...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).opacity === '0').length,
      imgs: [...document.images].map(i => ({ src: i.currentSrc.split('/').pop(), nw: i.naturalWidth, nh: i.naturalHeight, ow: i.width, oh: i.height }))
    };
  });
  const buf = await page.screenshot();
  const { createCanvas, loadImage } = {}; // no canvas lib; use PIL outside
  // crude luminance: sample via page
  const lum = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 1440; c.height = 900;
    return 'skip';
  });
  const fs = (await import('fs')).default;
  fs.writeFileSync(`probe-${label}.png`, buf);
  console.log('---- ' + label + (css ? ` (css: ${css})` : ''));
  console.log(JSON.stringify(info, null, 1));
  await ctx.close();
}

await probe('normal', null);
await probe('nogra in', 'body::before{display:none !important}');
await probe('noimg', 'img{visibility:hidden !important}');
await b.close();

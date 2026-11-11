import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:5200';
const OUT = path.resolve('shots');
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  { slug: 'home', url: '/' },
  { slug: 'degustation', url: '/degustation' },
  { slug: 'laboratoire', url: '/laboratoire' },
  { slug: 'reserver', url: '/reserver' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
];

const CONTRAST_JS = `
(() => {
  const lum = (c) => {
    const [r,g,b] = c.map(v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); });
    return 0.2126*r + 0.7152*g + 0.0722*b;
  };
  const parse = (s) => {
    const m = s.match(/rgba?\\(([^)]+)\\)/); if(!m) return null;
    const p = m[1].split(',').map(x=>parseFloat(x.trim()));
    return { rgb: p.slice(0,3), a: p.length>3?p[3]:1 };
  };
  const ratio = (a,b) => { const l1=lum(a), l2=lum(b); const hi=Math.max(l1,l2), lo=Math.min(l1,l2); return (hi+0.05)/(lo+0.05); };
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.9) return c.rgb;
      n = n.parentElement;
    }
    const b = parse(getComputedStyle(document.body).backgroundColor);
    return b ? b.rgb : [255,255,255];
  };
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const t = node.textContent.trim();
    if (!t) continue;
    const el = node.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const fg = parse(cs.color); if (!fg) continue;
    if (fg.a < 0.95) continue; // skip translucent text
    const bg = bgOf(el);
    const cr = ratio(fg.rgb, bg);
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight,10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const min = large ? 3.0 : 4.5;
    if (cr < min) {
      out.push({
        text: t.slice(0, 60),
        tag: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').filter(Boolean).slice(0,2).join('.') : ''),
        color: cs.color, bg: 'rgb(' + bg.join(',') + ')',
        size, ratio: Math.round(cr*100)/100, min
      });
    }
  }
  // dedupe by tag+color+ratio
  const seen = new Set(); const ded = [];
  for (const o of out) { const k = o.tag+o.color+o.ratio+o.size; if (seen.has(k)) continue; seen.add(k); ded.push(o); }
  return ded.slice(0, 40);
})()
`;

const OVERFLOW_JS = `
(() => {
  const vw = window.innerWidth;
  const doc = document.documentElement;
  const offenders = [];
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    const overRight = r.right - vw;
    const overLeft = -r.left;
    if (overRight > 2 || overLeft > 2) {
      // ignore decorative elements explicitly allowed to bleed
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === 'string' ? el.className.slice(0, 70) : '',
        left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
        overRight: Math.round(overRight), overLeft: Math.round(overLeft),
        pos: cs.position, overflowX: cs.overflowX
      });
    }
  });
  return {
    viewport: vw,
    docScrollWidth: doc.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    horizontalScroll: doc.scrollWidth > vw + 1,
    offenders: offenders.slice(0, 25),
    offenderCount: offenders.length
  };
})()
`;

const MISC_JS = `
(() => {
  const cs = (sel, prop) => { const e = document.querySelector(sel); return e ? getComputedStyle(e)[prop] : null; };
  const fonts = {};
  ['Fraunces','IBM Plex Mono','IBM Plex Sans'].forEach(f => {
    try { fonts[f] = document.fonts.check('16px "' + f + '"'); } catch(e) { fonts[f] = 'err'; }
  });
  const imgs = [...document.images].map(i => ({ src: i.currentSrc.split('/').pop(), w: i.naturalWidth, h: i.naturalHeight, ok: i.naturalWidth > 0, alt: i.alt }));
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const h1 = document.querySelector('h1');
  const accentEls = [...document.querySelectorAll('*')].filter(e => getComputedStyle(e).color === 'rgb(142, 47, 31)').length;
  return {
    title: document.title,
    bodyBg,
    htmlBg: getComputedStyle(document.documentElement).backgroundColor,
    bodyFont: getComputedStyle(document.body).fontFamily,
    rootFontSize: getComputedStyle(document.documentElement).fontSize,
    fontsLoaded: fonts,
    h1: h1 ? { text: h1.textContent.trim().slice(0,80), font: getComputedStyle(h1).fontFamily, size: getComputedStyle(h1).fontSize, weight: getComputedStyle(h1).fontWeight, transform: getComputedStyle(h1).textTransform } : null,
    imgCount: imgs.length,
    imgBroken: imgs.filter(i => !i.ok).length,
    imgs: imgs.slice(0,14),
    accentColorUsageCount: accentEls,
    navLinks: [...document.querySelectorAll('nav a')].map(a => a.textContent.trim().replace(/\\s+/g,' ').slice(0,40)),
    dottedLeaderEls: [...document.querySelectorAll('*')].filter(e => { const s = getComputedStyle(e); return s.borderBottomStyle === 'dotted' || (s.backgroundImage||'').includes('radial') || (s.backgroundImage||'').includes('repeating'); }).length,
    docHeight: document.documentElement.scrollHeight
  };
})()
`;

async function triggerScroll(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(h / 8);
  for (let y = 0; y <= h; y += step) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(180);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = {};

for (const vp of VIEWPORTS) {
  for (const p of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.name === 'mobile' ? 2 : 1 });
    const page = await ctx.newPage();
    const consoleErrors = [];
    const failedReq = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
    page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + String(e).slice(0, 200)));
    page.on('requestfailed', r => failedReq.push(r.url().slice(0, 120) + ' :: ' + (r.failure()?.errorText || '')));
    page.on('response', r => { if (r.status() >= 400) failedReq.push(r.status() + ' ' + r.url().slice(0, 120)); });

    await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200);

    const key = `${p.slug}__${vp.name}`;
    const misc = await page.evaluate(MISC_JS);
    const overflow = await page.evaluate(OVERFLOW_JS);
    const contrast = await page.evaluate(CONTRAST_JS);

    // top viewport shot
    await page.screenshot({ path: path.join(OUT, `${key}__top.png`) });

    await triggerScroll(page);

    // full page shot (after reveals triggered)
    await page.screenshot({ path: path.join(OUT, `${key}__full.png`), fullPage: true });

    // thirds
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = vp.height;
    const positions = { mid: Math.round((H - vh) / 2), bottom: Math.max(0, H - vh) };
    for (const [name, y] of Object.entries(positions)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(450);
      await page.screenshot({ path: path.join(OUT, `${key}__${name}.png`) });
    }

    const overflowAfter = await page.evaluate(OVERFLOW_JS);

    report[key] = { url: p.url, viewport: vp, docHeight: H, misc, overflowAtTop: overflow, overflowAfterScroll: overflowAfter, contrastIssues: contrast, consoleErrors: [...new Set(consoleErrors)].slice(0,15), failedRequests: [...new Set(failedReq)].slice(0,15) };
    console.log(`done ${key}  h=${H}  hscroll=${overflow.horizontalScroll}  offenders=${overflow.offenderCount}  contrast=${contrast.length}  cerr=${consoleErrors.length}  broken=${misc.imgBroken}/${misc.imgCount}`);
    await ctx.close();
  }
}

await browser.close();
fs.writeFileSync(path.resolve('report.json'), JSON.stringify(report, null, 2));
console.log('\nreport.json written');

import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:5200';
const OUT = path.resolve('final');
fs.mkdirSync(OUT, { recursive: true });

const HERO_JS = `(() => {
  const h1 = document.querySelector('h1');
  const liner = el => el ? [...el.querySelectorAll('*')].filter(c => c.children.length === 0 && c.textContent.trim()).map(c => ({ txt: c.textContent.trim().slice(0,30), color: getComputedStyle(c).color, size: getComputedStyle(c).fontSize })) : [];
  const hero = document.querySelector('[class*=hero]');
  let heroBox = null, heroImg = null, heroImgStyle = null;
  if (hero) {
    const r = hero.getBoundingClientRect();
    heroBox = { h: Math.round(r.height), w: Math.round(r.width), vh: window.innerHeight, vw: window.innerWidth, equalsViewport: Math.abs(r.height - window.innerHeight) < 3 && Math.abs(r.width - window.innerWidth) < 3, cls: (hero.className||'').slice(0,60) };
    const im = hero.querySelector('img');
    if (im) { const ir = im.getBoundingClientRect(); const cs = getComputedStyle(im); heroImg = { src: im.currentSrc.split('/').pop(), covered: Math.abs(ir.height - r.height) < 6 && Math.abs(ir.width - r.width) < 6, h: Math.round(ir.height), w: Math.round(ir.width), fit: cs.objectFit }; }
    const bgEl = [...hero.querySelectorAll('*')].find(e => { const b = getComputedStyle(e).backgroundImage; return b && b !== 'none'; });
    heroImgStyle = bgEl ? getComputedStyle(bgEl).backgroundImage.slice(0, 140) : null;
  }
  const bodyTxt = document.body.innerText;
  const counters = [...document.querySelectorAll('*')].filter(e => /^0?\\d\\s*[\\/·—]\\s*0?\\d{1,2}$/.test(e.textContent.trim()) && e.children.length === 0).map(e => e.textContent.trim());
  const h1html = h1 ? h1.innerHTML.replace(/\\s+/g,' ').slice(0, 400) : null;
  return { heroBox, heroImg, heroImgStyle, h1: h1 ? { text: h1.textContent.trim().replace(/\\s+/g,'|'), html: h1html, children: liner(h1), lines: h1.getClientRects().length, size: getComputedStyle(h1).fontSize } : null, counters, hasMagentaLine: h1 ? liner(h1).filter(c => c.color === 'rgb(217, 79, 158)').length : 0, metaBar: (document.querySelector('[class*=meta]')||{}).textContent };
})()`;

const ALPHA_CONTRAST_JS = `(() => {
  const lum = c => { const [r,g,b] = c.map(v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*r+0.7152*g+0.0722*b; };
  const parse = s => { const m = s.match(/rgba?\\(([^)]+)\\)/); if(!m) return null; const p = m[1].split(',').map(x=>parseFloat(x.trim())); return { rgb: p.slice(0,3), a: p.length>3?p[3]:1 }; };
  const over = (fg, bg) => fg.rgb.map((v,i) => v*fg.a + bg.rgb[i]*(1-fg.a));
  const ratio = (a,b) => { const l1=lum(a), l2=lum(b), hi=Math.max(l1,l2), lo=Math.min(l1,l2); return (hi+0.05)/(lo+0.05); };
  const chain = el => { let n = el; while (n && n !== document.documentElement) { const cs = getComputedStyle(n); const c = parse(cs.backgroundColor); if (c && c.a > 0.9) return { rgb: c.rgb, img: cs.backgroundImage !== 'none' }; n = n.parentElement; } const b = parse(getComputedStyle(document.body).backgroundColor); return b ? { rgb: b.rgb, img:false } : { rgb:[255,255,255], img:false }; };
  const out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    const t = n.textContent.trim(); if (!t || t.length < 2) continue;
    const el = n.parentElement; if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.display==='none'||cs.visibility==='hidden') continue;
    const r = el.getBoundingClientRect(); if (r.width===0||r.height===0) continue;
    const fg = parse(cs.color); if (!fg) continue;
    // effective opacity from ancestors
    let op = 1, a = el; while (a && a !== document.body) { op *= parseFloat(getComputedStyle(a).opacity); a = a.parentElement; }
    const bg = chain(el);
    const fgEff = { rgb: fg.rgb, a: fg.a * op };
    const composited = over(fgEff, bg);
    const cr = ratio(composited, bg.rgb);
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight,10);
    const min = (size >= 24 || (size >= 18.66 && weight >= 700)) ? 3.0 : 4.5;
    if (cr < min || bg.img) out.push({ text: t.slice(0,45), cls: (typeof el.className==='string'?el.className:'').split(' ').slice(0,2).join('.'), color: cs.color, effAlpha: Math.round(fgEff.a*100)/100, size, weight, ratio: Math.round(cr*100)/100, min, overImage: bg.img });
  }
  const seen = new Set(); const ded = [];
  for (const o of out) { const k = o.cls+o.color+o.ratio+o.size+o.overImage; if (seen.has(k)) continue; seen.add(k); ded.push(o); }
  return ded.slice(0, 30);
})()`;

const ANIM_JS = `(() => {
  const els = [...document.querySelectorAll('[data-reveal],[data-zoom],[class*=reveal],[class*=Reveal]')];
  const stuck = [], hidden = [];
  const h = window.innerHeight;
  els.forEach(el => {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    const op = parseFloat(cs.opacity); const tf = cs.transform;
    const inView = r.top < h * 0.95 && r.bottom > 0;
    if (op < 0.9 || (tf && tf !== 'none' && !tf.startsWith('matrix(1, 0, 0, 1, 0, 0)'))) {
      const rec = { cls: (typeof el.className==='string'?el.className:'').slice(0,40), op: Math.round(op*100)/100, tf: tf.slice(0,40), inView, top: Math.round(r.top) };
      if (inView) hidden.push(rec); else stuck.push(rec);
    }
  });
  return { total: els.length, hiddenInView: hidden.length, inViewDetails: hidden.slice(0,8), offscreenAnimated: stuck.length };
})()`;

const A11Y_JS = `(() => {
  const inputs = [...document.querySelectorAll('input,select,textarea')].map(i => ({
    type: i.type, id: i.id || null, name: i.name || null,
    hasLabelFor: !!(i.id && document.querySelector('label[for="'+i.id+'"]')),
    wrappingLabel: !!i.closest('label'),
    ariaLabel: i.getAttribute('aria-label'), ariaLabelledby: i.getAttribute('aria-labelledby'),
    placeholder: i.placeholder || null, autocomplete: i.getAttribute('autocomplete') || null,
    required: i.required, inputmode: i.getAttribute('inputmode') || null
  }));
  const tap = [...document.querySelectorAll('a,button,input,select,[role=button]')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width>0 && r.height>0 && cs.display!=='none'; })
    .map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), txt: e.textContent.trim().slice(0,25), w: Math.round(r.width), h: Math.round(r.height) }; })
    .filter(e => e.h < 44 || e.w < 44);
  const imgsNoAlt = [...document.images].filter(i => !i.alt).length;
  const linksNoText = [...document.querySelectorAll('a')].filter(a => !a.textContent.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]')).length;
  return { inputs, smallTapTargets: tap.slice(0, 14), smallTapCount: tap.length, imgsNoAlt, linksNoText,
    h1Count: document.querySelectorAll('h1').length, landmarks: { header: !!document.querySelector('header'), main: !!document.querySelector('main'), footer: !!document.querySelector('footer'), nav: !!document.querySelector('nav') },
    skipLink: !!document.querySelector('a[href^="#"][class*=skip], a[href="#main"]'), reducedMotionCSS: [...document.styleSheets].some(ss => { try { return [...ss.cssRules].some(r => r.conditionText && r.conditionText.includes('reduced-motion')); } catch(e) { return false; } }) };
})()`;

const PERF_JS = `(() => {
  const res = performance.getEntriesByType('resource');
  const by = {};
  res.forEach(r => { const t = r.initiatorType; by[t] = by[t] || { n: 0, bytes: 0 }; by[t].n++; by[t].bytes += r.transferSize || 0; });
  const imgs = res.filter(r => r.name.match(/\\.(jpg|jpeg|png|webp|avif)$/i)).map(r => ({ f: r.name.split('/').pop(), kb: Math.round((r.transferSize||0)/1024), t: Math.round(r.duration) })).sort((a,b) => b.kb - a.kb);
  const fonts = res.filter(r => r.name.match(/\\.(woff2?|ttf)$/i)).map(r => ({ f: r.name.split('/').pop().slice(0,50), kb: Math.round((r.transferSize||0)/1024) }));
  const nav = performance.getEntriesByType('navigation')[0];
  return { by, totalKB: Math.round(res.reduce((s,r) => s + (r.transferSize||0), 0)/1024), imgCount: imgs.length, imgs: imgs.slice(0,10), fonts, domContentLoaded: Math.round(nav.domContentLoadedEventEnd), loadEvent: Math.round(nav.loadEventEnd) };
})()`;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const out = {};

const probe = async (url, vp = { width: 1440, height: 900 }) => {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  const before = await page.evaluate(ANIM_JS);
  // scroll fully to trigger every reveal + lazy image
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= H; y += Math.round(vp.height * 0.6)) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(200); }
  await page.waitForTimeout(1200);
  const after = await page.evaluate(ANIM_JS);
  const imgsAfter = await page.evaluate(() => [...document.images].map(i => ({ f: i.currentSrc.split('/').pop() || '(vide)', nat: i.naturalWidth + 'x' + i.naturalHeight, ok: i.naturalWidth > 0 })));
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600);
  const data = {
    hero: await page.evaluate(HERO_JS),
    alphaContrast: await page.evaluate(ALPHA_CONTRAST_JS),
    anim: { before, after },
    a11y: await page.evaluate(A11Y_JS),
    perf: await page.evaluate(PERF_JS),
    imgsAfter,
  };
  await ctx.close();
  return data;
};

out.home = await probe('/');
out.degustation = await probe('/degustation');
out.reserver = await probe('/reserver');
out.laboratoire = await probe('/laboratoire');
out.homeMobile = await probe('/', { width: 375, height: 812 });
out.reserverMobile = await probe('/reserver', { width: 375, height: 812 });

await browser.close();
fs.writeFileSync(path.resolve('probe2-report.json'), JSON.stringify(out, null, 2));
console.log('probe2-report.json written');

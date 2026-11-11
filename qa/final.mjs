import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:5200';
const OUT = path.resolve('final');
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  { slug: 'home', url: '/' },
  { slug: 'degustation', url: '/degustation' },
  { slug: 'laboratoire', url: '/laboratoire' },
  { slug: 'reserver', url: '/reserver' },
];

const VPS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
];

// ---- audit JS blocks -------------------------------------------------------
const TYPO_JS = `(() => {
  const out = { headings: [], fonts: {}, sizes: {}, bodyFont: getComputedStyle(document.body).fontFamily };
  for (const f of ['Montserrat','Jost','Inter','Poppins']) {
    try { out.fonts[f] = document.fonts.check('16px "'+f+'"'); } catch(e) { out.fonts[f] = 'err'; }
  }
  const seen = new Set();
  document.querySelectorAll('h1,h2,h3,h4,h5,[class*=title],[class*=Title],[class*=eyebrow],[class*=label],[class*=Label]').forEach(el => {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (r.width === 0 || cs.display === 'none') return;
    const t = el.textContent.trim().replace(/\\s+/g,' ');
    if (!t) return;
    const k = el.tagName + t.slice(0,30) + cs.fontSize;
    if (seen.has(k)) return; seen.add(k);
    const fs_ = cs.fontSize;
    out.sizes[fs_] = (out.sizes[fs_] || 0) + 1;
    out.headings.push({ tag: el.tagName.toLowerCase(), cls: (typeof el.className==='string'?el.className:'').split(' ').slice(0,2).join('.'), text: t.slice(0,70), size: fs_, weight: cs.fontWeight, family: cs.fontFamily.split(',')[0].replace(/"/g,''), transform: cs.textTransform, ls: cs.letterSpacing, lh: cs.lineHeight, color: cs.color });
  });
  return out;
})()`;

const SPEC_JS = `(() => {
  const cls = (s) => typeof s === 'string' ? s : '';
  const all = [...document.querySelectorAll('*')];
  const pillOutline = all.filter(e => { const s = getComputedStyle(e); const br = parseFloat(s.borderTopLeftRadius)||0; return br >= 90 && parseFloat(s.borderTopWidth) >= 1 && (s.backgroundColor==='rgba(0, 0, 0, 0)'||s.backgroundColor==='transparent'); }).length;
  const magenta = 'rgb(217, 79, 158)';
  const magentaEls = all.filter(e => { const s = getComputedStyle(e); return s.color===magenta || s.backgroundColor===magenta || s.borderTopColor===magenta; });
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  // cream sections: any large element with cream bg
  const cream = all.filter(e => getComputedStyle(e).backgroundColor === 'rgb(236, 231, 219)' && e.getBoundingClientRect().height > 200).length;
  // pagination 01 / 03
  const pag = document.body.innerText.match(/0\\d\\s*\\/\\s*0\\d/);
  // images
  const imgs = [...document.images].map(i => ({ file: i.currentSrc.split('/').pop(), nat: i.naturalWidth+'x'+i.naturalHeight, rendered: Math.round(i.getBoundingClientRect().width)+'x'+Math.round(i.getBoundingClientRect().height), alt: i.alt, ok: i.naturalWidth>0, loading: i.loading }));
  const svgInline = document.querySelectorAll('svg').length;
  // 3-col photo grid heuristic
  const grids = all.filter(e => { const s = getComputedStyle(e); return s.display==='grid' && s.gridTemplateColumns.split(' ').length >= 3; }).length;
  return {
    title: document.title, lang: document.documentElement.lang,
    bodyBg, bodyColor: getComputedStyle(document.body).color,
    magentaUsage: magentaEls.length, pillOutlineCount: pillOutline, creamSections: cream,
    pagination01: pag ? pag[0] : null, svgInline, threeColGrids: grids,
    imgCount: imgs.length, imgBroken: imgs.filter(i=>!i.ok).length, imgs,
    links: [...document.querySelectorAll('a')].map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim().replace(/\\s+/g,' ').slice(0,45) })),
    buttons: [...document.querySelectorAll('button, .btn, [class*=cta]')].map(b => ({ text: b.textContent.trim().replace(/\\s+/g,' ').slice(0,45), tag: b.tagName.toLowerCase() })).slice(0,20),
    docHeight: document.documentElement.scrollHeight
  };
})()`;

const OVERFLOW_JS = `(() => {
  const vw = window.innerWidth; const offenders = [];
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.display==='none'||cs.visibility==='hidden') return;
    const r = el.getBoundingClientRect();
    if (r.width===0 && r.height===0) return;
    const oR = r.right - vw, oL = -r.left;
    if (oR > 2 || oL > 2) offenders.push({ tag: el.tagName.toLowerCase(), cls: (typeof el.className==='string'?el.className:'').slice(0,60), w: Math.round(r.width), oR: Math.round(oR), oL: Math.round(oL), pos: cs.position, ox: cs.overflowX, txt: el.textContent.trim().slice(0,30) });
  });
  return { viewport: vw, scrollWidth: document.documentElement.scrollWidth, horizontalScroll: document.documentElement.scrollWidth > vw+1, count: offenders.length, offenders: offenders.slice(0,12) };
})()`;

const CONTRAST_JS = `(() => {
  const lum = c => { const [r,g,b] = c.map(v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*r+0.7152*g+0.0722*b; };
  const parse = s => { const m = s.match(/rgba?\\(([^)]+)\\)/); if(!m) return null; const p = m[1].split(',').map(x=>parseFloat(x.trim())); return { rgb: p.slice(0,3), a: p.length>3?p[3]:1 }; };
  const ratio = (a,b) => { const l1=lum(a), l2=lum(b), hi=Math.max(l1,l2), lo=Math.min(l1,l2); return (hi+0.05)/(lo+0.05); };
  const avg = el => { // average colour of background including image -> sample via a 1px canvas of the screenshot is not available; use painted bg colour chain
    let n = el;
    while (n && n !== document.documentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a>0.9) return { rgb: c.rgb, img: hasBgImage(n) }; n = n.parentElement; }
    const b = parse(getComputedStyle(document.body).backgroundColor); return b ? { rgb: b.rgb, img: false } : { rgb:[255,255,255], img:false };
  };
  const hasBgImage = el => { const b = getComputedStyle(el).backgroundImage; return !!b && b !== 'none'; };
  const out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    const t = n.textContent.trim(); if (!t) continue;
    const el = n.parentElement; if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity) < 0.95) continue;
    const r = el.getBoundingClientRect(); if (r.width===0||r.height===0) continue;
    const fg = parse(cs.color); if (!fg || fg.a < 0.95) continue;
    const bg = avg(el);
    if (bg.img) continue; // text over image: flag separately
    const cr = ratio(fg.rgb, bg.rgb);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight,10) >= 700;
    const min = (size>=24 || (size>=18.66 && bold)) ? 3.0 : 4.5;
    if (cr < min) out.push({ text: t.slice(0,50), tag: el.tagName.toLowerCase()+'.'+(typeof el.className==='string'?cs.cssText:'') , cls: (typeof el.className==='string'?el.className:'').split(' ').slice(0,2).join('.'), color: cs.color, bg: 'rgb('+bg.rgb.join(',')+')', size, ratio: Math.round(cr*100)/100, min });
  }
  const seen = new Set(); const ded = [];
  for (const o of out) { const k = o.tag+o.color+o.ratio+o.size; if (seen.has(k)) continue; seen.add(k); ded.push(o); }
  return ded.slice(0,25);
})()`;

// average luminance + magenta ratio of each <img>, drawn on canvas
const IMGSTAT_JS = `(async () => {
  const res = [];
  for (const img of [...document.images]) {
    try {
      const w = Math.min(64, img.naturalWidth), h = Math.max(1, Math.round(w * img.naturalHeight / img.naturalWidth));
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
      const d = ctx.getImageData(0,0,w,h).data;
      let sum = 0, mag = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2];
        sum += 0.2126*r + 0.7152*g + 0.0722*b; n++;
        if (r > 90 && b > 70 && r - g > 40 && b - g > 20) mag++;
      }
      res.push({ file: img.currentSrc.split('/').pop(), meanLum: Math.round(sum/n), meanLumPct: Math.round(sum/n/255*100), magentaPct: Math.round(mag/n*100) });
    } catch(e) { res.push({ file: img.currentSrc.split('/').pop(), err: String(e).slice(0,80) }); }
  }
  return res;
})()`;

// ---- runner ---------------------------------------------------------------
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = {};
const allLinks = new Set();

for (const vp of VPS) {
  for (const p of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const consoleMsgs = [], failed = [];
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push(m.type()+': '+m.text().slice(0,180)); });
    page.on('pageerror', e => consoleMsgs.push('PAGEERROR: '+String(e).slice(0,180)));
    page.on('requestfailed', r => failed.push('FAIL '+r.url().slice(0,110)+' :: '+(r.failure()?.errorText||'')));
    page.on('response', r => { if (r.status() >= 400) failed.push(r.status()+' '+r.url().slice(0,110)); });

    await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    const key = `${p.slug}__${vp.name}`;
    const spec = await page.evaluate(SPEC_JS);
    const typo = vp.name === 'desktop' ? await page.evaluate(TYPO_JS) : null;
    const overflow = await page.evaluate(OVERFLOW_JS);
    const contrast = vp.name === 'desktop' ? await page.evaluate(CONTRAST_JS) : [];
    const imgstat = await page.evaluate(IMGSTAT_JS);
    spec.links.forEach(l => { if (l.href && !l.href.startsWith('http') && !l.href.startsWith('#') && !l.href.startsWith('mailto') && !l.href.startsWith('tel')) allLinks.add(l.href); });

    await page.screenshot({ path: path.join(OUT, `${key}__top.png`) });

    // scroll through to trigger reveals
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= H; y += Math.round(vp.height * 0.7)) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(160); }
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, `${key}__full.png`), fullPage: true });
    for (const [nm, y] of Object.entries({ mid: Math.round((H - vp.height) / 2), bottom: Math.max(0, H - vp.height) })) {
      await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(450);
      await page.screenshot({ path: path.join(OUT, `${key}__${nm}.png`) });
    }
    const overflowAfter = await page.evaluate(OVERFLOW_JS);

    report[key] = { url: p.url, vp, docHeight: H, spec, typo, overflowTop: overflow, overflowAfter, contrast, imgstat,
      console: [...new Set(consoleMsgs)].slice(0, 12), failedReq: [...new Set(failed)].slice(0, 12) };
    console.log(`${key} h=${H} hscroll=${overflowAfter.horizontalScroll} off=${overflowAfter.count} contr=${contrast.length} cerr=${consoleMsgs.length} broken=${spec.imgBroken}/${spec.imgCount} mag=${spec.magentaUsage} cream=${spec.creamSections} pag=${spec.pagination01}`);
    await ctx.close();
  }
}

// ---- dead link check -------------------------------------------------------
const links = {};
for (const href of allLinks) {
  const code = await fetch(BASE + href, { redirect: 'manual' }).then(r => r.status).catch(e => 'ERR ' + e.message);
  links[href] = code;
}

// ---- interaction tests (desktop home + reserver) ---------------------------
const inter = {};
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0,150)));
  // burger on mobile viewport
  const m = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mp = await m.newPage();
  await mp.goto(BASE + '/', { waitUntil: 'networkidle' }); await mp.waitForTimeout(800);
  const burgerSel = await mp.evaluate(() => { const b = [...document.querySelectorAll('button,[role=button],.burger,[class*=burger],[class*=menu-toggle]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<120;}); return b.map(e=>({cls:e.className,aria:e.getAttribute('aria-label'),txt:e.textContent.trim().slice(0,20)})); });
  let burgerWorks = 'no-button-found';
  if (burgerSel.length) {
    await mp.click('button:visible, [class*=burger]:visible', { timeout: 3000 }).catch(()=>{});
    await mp.waitForTimeout(600);
    const openState = await mp.evaluate(() => {
      const overlays = [...document.querySelectorAll('*')].filter(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return r.height > window.innerHeight*0.5 && r.width > window.innerWidth*0.8 && (cs.position==='fixed'||cs.position==='absolute') && cs.display!=='none' && parseFloat(cs.opacity)>0.5 && e.querySelectorAll('a').length>1; });
      return { overlays: overlays.length, visibleNavLinks: [...document.querySelectorAll('a')].filter(a=>{const r=a.getBoundingClientRect();return r.width>0&&r.height>0&&r.top>=0&&r.top<window.innerHeight;}).length };
    });
    burgerWorks = openState;
    await mp.screenshot({ path: path.join(OUT, 'mobile__burger-open.png') });
  }
  inter.burger = { candidates: burgerSel, result: burgerWorks };
  await m.close();

  // reservation form
  await page.goto(BASE + '/reserver', { waitUntil: 'networkidle' }); await page.waitForTimeout(900);
  const formInfo = await page.evaluate(() => {
    const f = document.querySelector('form');
    if (!f) return { hasForm: false };
    return { hasForm: true, inputs: [...f.querySelectorAll('input,select,textarea')].map(i=>({name:i.name||i.id,type:i.type,required:i.required,label:(document.querySelector('label[for="'+i.id+'"]')||{}).textContent?.trim().slice(0,40)})), submit: [...f.querySelectorAll('button,[type=submit]')].map(b=>b.textContent.trim().slice(0,40)) };
  });
  let emptySubmit = null;
  if (formInfo.hasForm) {
    // try empty submit
    await page.evaluate(() => { const f = document.querySelector('form'); f.querySelector('[type=submit],button')?.click(); });
    await page.waitForTimeout(700);
    emptySubmit = await page.evaluate(() => ({ invalidCount: document.querySelectorAll(':invalid').length, bodyText: document.body.innerText.slice(0,0) , shownErrors: [...document.querySelectorAll('[class*=error],[class*=Error],[role=alert]')].map(e=>e.textContent.trim().slice(0,80)).slice(0,5) }));
    await page.screenshot({ path: path.join(OUT, 'reserver__empty-submit.png') });
    // fill valid
    const filled = await page.evaluate(() => {
      const f = document.querySelector('form'); let n = 0;
      f.querySelectorAll('input,select,textarea').forEach(i => {
        if (i.type==='text'||i.type==='email'||i.type==='tel') { i.value = i.type==='email'?'test@test.fr':i.type==='tel'?'0612345678':'Jean Test'; n++; }
        else if (i.type==='date') { i.value='2026-10-15'; n++; }
        else if (i.type==='number') { i.value='2'; n++; }
        else if (i.tagName==='SELECT') { i.selectedIndex = 1; n++; }
        i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true}));
      });
      return n;
    });
    await page.waitForTimeout(400);
    await page.evaluate(() => { document.querySelector('form').querySelector('[type=submit],button')?.click(); });
    await page.waitForTimeout(1200);
    const afterValid = await page.evaluate(() => ({ invalidCount: document.querySelectorAll(':invalid').length, alerts: [...document.querySelectorAll('[role=alert],[class*=success],[class*=confirm],[class*=message]')].map(e=>e.textContent.trim().slice(0,120)).slice(0,4), formStillVisible: !!document.querySelector('form'), dialog: !!document.querySelector('dialog,[class*=modal]') }));
    await page.screenshot({ path: path.join(OUT, 'reserver__valid-submit.png') });
    inter.form = { formInfo, filled, emptySubmit, afterValid, pageErrors: errs };
  } else inter.form = formInfo;

  // accordion on reserver
  await page.goto(BASE + '/reserver', { waitUntil: 'networkidle' }); await page.waitForTimeout(700);
  const faqBefore = await page.evaluate(() => [...document.querySelectorAll('[class*=accor] button, details, [class*=faq] button')].map(e=>({ tag:e.tagName.toLowerCase(), open: e.tagName==='DETAILS'?e.open:e.getAttribute('aria-expanded'), h: Math.round(e.getBoundingClientRect().height) })).slice(0,8));
  await page.evaluate(() => { const b = document.querySelector('[class*=accor] button, details summary, [class*=faq] button'); b && b.click(); });
  await page.waitForTimeout(700);
  const faqAfter = await page.evaluate(() => [...document.querySelectorAll('[class*=accor] button, details, [class*=faq] button')].map(e=>({ open: e.tagName==='DETAILS'?e.open:e.getAttribute('aria-expanded') })).slice(0,8));
  inter.faq = { faqBefore, faqAfter };
  await page.screenshot({ path: path.join(OUT, 'reserver__faq-open.png') });

  // nav links click-through (desktop)
  const navFlow = [];
  for (const p of PAGES) {
    await page.goto(BASE + p.url, { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
    navFlow.push({ url: p.url, ok: (await page.title()) !== '' });
  }
  inter.navFlow = navFlow;
  await ctx.close();
}

// ---- 404 ------------------------------------------------------------------
const notFound = await (async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/page-inexistante', { waitUntil: 'networkidle' }); await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'notfound__desktop.png') });
  const t = await page.evaluate(() => ({ text: document.body.innerText.slice(0, 300), title: document.title }));
  await ctx.close(); return t;
})();

await browser.close();
fs.writeFileSync(path.resolve('final-report.json'), JSON.stringify({ report, links, inter, notFound }, null, 2));
console.log('\n--- links ---'); console.log(JSON.stringify(links));
console.log('\n--- inter ---'); console.log(JSON.stringify(inter, null, 1).slice(0, 3000));
console.log('\n--- 404 ---'); console.log(notFound.text.replace(/\n+/g, ' | ').slice(0, 300));
console.log('\nfinal-report.json written');

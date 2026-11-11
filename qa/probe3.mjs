import { chromium } from 'playwright-core';
const BASE = 'http://localhost:5200';
const b = await chromium.launch({ channel: 'chrome', headless: true });

const CENSUS = `(() => {
  const lum = c => { const [r,g,bb] = c.map(v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*r+0.7152*g+0.0722*bb; };
  const parse = s => { const m = s.match(/rgba?\\(([^)]+)\\)/); if(!m) return null; const p = m[1].split(',').map(x=>parseFloat(x.trim())); return { rgb: p.slice(0,3), a: p.length>3?p[3]:1 }; };
  const ratio = (a,bb) => { const l1=lum(a), l2=lum(bb), hi=Math.max(l1,l2), lo=Math.min(l1,l2); return (hi+0.05)/(lo+0.05); };
  const chain = el => { let n = el; while (n && n !== document.documentElement) { const cs = getComputedStyle(n); const c = parse(cs.backgroundColor); if (c && c.a > 0.9) return c.rgb; n = n.parentElement; } return parse(getComputedStyle(document.body).backgroundColor).rgb; };
  const texts = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    const t = n.textContent.trim(); if (!t || t.length < 3) continue;
    const el = n.parentElement; if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.display==='none'||cs.visibility==='hidden') continue;
    const r = el.getBoundingClientRect(); if (r.width===0||r.height===0) continue;
    const size = parseFloat(cs.fontSize);
    const bg = chain(el);
    const fg = parse(cs.color);
    let op = 1, a = el; while (a && a !== document.body) { op *= parseFloat(getComputedStyle(a).opacity); a = a.parentElement; }
    const fgEff = fg.rgb.map((v,i) => v * (fg.a*op) + bg[i] * (1 - fg.a*op));
    texts.push({ t: t.slice(0,42), size, weight: cs.fontWeight, color: cs.color, bg: 'rgb('+bg.join(',')+')', ratio: Math.round(ratio(fgEff, bg)*100)/100, cls: (typeof el.className==='string'?el.className:'').split(' ').slice(0,2).join('.') });
  }
  const tiny = texts.filter(x => x.size < 12.5).length;
  const thin = texts.filter(x => parseInt(x.weight,10) <= 300).length;
  const lowC = texts.filter(x => x.ratio < 4.5).length;
  const para = texts.filter(x => x.t.length > 60 && x.size >= 12.5).slice(0, 8);
  return { count: texts.length, tiny, thin, lowContrast: lowC, paragraphs: para,
    smallest: [...texts].sort((a,b) => a.size - b.size).slice(0, 8),
    worst: [...texts].sort((a,b) => a.ratio - b.ratio).slice(0, 6) };
})()`;

const MISC = `(() => {
  const txt = document.body.innerText;
  const tel = [...document.querySelectorAll('a[href^="tel:"],a[href^="mailto:"]')].map(a => a.getAttribute('href'));
  const fictif = (txt.match(/[^\\n]*fictif[^\\n]*/gi) || []).slice(0, 4);
  const counters = (txt.match(/\\b0?[1-7]\\s*\\/\\s*0?[1-7]\\b/g) || []);
  const priceHits = (txt.match(/\\d+\\s?€/g) || []).slice(0, 6);
  const hours = (txt.match(/\\b\\d{1,2}h\\d{2}\\b/g) || []);
  const phone = (txt.match(/0\\d[\\s.]?\\d{2}[\\s.]?\\d{2}[\\s.]?\\d{2}[\\s.]?\\d{2}/g) || []);
  const heroCta = [...document.querySelectorAll('[class*=hero] a, [class*=hero] button')].map(e => { const cs = getComputedStyle(e); return { txt: e.textContent.trim().slice(0,40), cls: (typeof e.className==='string'?e.className:''), border: cs.borderTopWidth+' '+cs.borderTopStyle, radius: cs.borderTopLeftRadius, bg: cs.backgroundColor, pad: cs.padding, size: cs.fontSize+'/'+cs.fontWeight+' ls '+cs.letterSpacing }; });
  const navCta = [...document.querySelectorAll('nav a')].map(e => { const cs = getComputedStyle(e); return { txt: e.textContent.trim().slice(0,30), border: cs.borderTopWidth+' '+cs.borderTopStyle+' '+cs.borderTopColor, radius: cs.borderTopLeftRadius, bg: cs.backgroundColor, h: Math.round(e.getBoundingClientRect().height) }; });
  const sides = [...document.querySelectorAll('*')].filter(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return (cs.position==='absolute'||cs.position==='fixed') && r.height > 100 && r.width < 90 && (r.left < 120 || r.right > innerWidth - 120); }).map(e => ({ cls: (typeof e.className==='string'?e.className:'').slice(0,40), w: Math.round(e.getBoundingClientRect().width), left: Math.round(e.getBoundingClientRect().left), txt: e.textContent.trim().slice(0,30) }));
  return { tel, fictif, counters, priceHits, hoursCount: hours.length, hoursSample: hours.slice(0,6), phone, heroCta, navCta, sideRail: sides };
})()`;

const FORM_A11Y = `(() => {
  const inputs = [...document.querySelectorAll('form input, form select, form textarea')].map(i => {
    const lbl = i.closest('label');
    const cs = getComputedStyle(i);
    return { type: i.type, name: i.name || null, id: i.id || null, text: i.type==='radio'||i.type==='checkbox' ? (lbl?lbl.textContent.trim().slice(0,50):null) : null,
      inLabel: !!lbl, labelText: (lbl ? lbl.textContent.trim().slice(0,60) : null), ariaInvalid: i.getAttribute('aria-invalid'), ariaDescribedby: i.getAttribute('aria-describedby'),
      borderColor: cs.borderTopColor, bg: cs.backgroundColor, h: Math.round(i.getBoundingClientRect().height) };
  });
  const labelSpans = [...document.querySelectorAll('[class*=resv__label]')].map(s => { const cs = getComputedStyle(s); const lb = s.closest('label'); return { txt: s.textContent.trim().slice(0,30), color: cs.color, size: cs.fontSize, weight: cs.fontWeight, inLabel: !!lb, labelBg: lb ? getComputedStyle(lb).backgroundColor : null }; });
  const errText = [...document.querySelectorAll('[class*=error],[class*=err],[role=alert]')].map(e => e.textContent.trim().slice(0,60));
  return { inputs, labelSpans, errText };
})()`;

const out = {};
for (const [name, url] of [['home', '/'], ['degustation', '/degustation'], ['laboratoire', '/laboratoire'], ['reserver', '/reserver'], ['notfound', '/page-inexistante']]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  out[name] = { census: await page.evaluate(CENSUS), misc: await page.evaluate(MISC) };
  if (name === 'reserver') out[name].form = await page.evaluate(FORM_A11Y);
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(out, null, 1));

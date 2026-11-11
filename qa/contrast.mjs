import { chromium } from 'playwright-core';
import fs from 'fs';

const BASE = 'http://localhost:5200';
const PAGES = ['/', '/degustation', '/laboratoire', '/reserver'];

// Contrast check INCLUDING translucent text (composites alpha over nearest opaque bg)
const JS = `
(() => {
  const lum = (c) => { const [r,g,b]=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);}); return 0.2126*r+0.7152*g+0.0722*b; };
  const parse = (s) => { const m=s.match(/rgba?\\(([^)]+)\\)/); if(!m) return null; const p=m[1].split(',').map(x=>parseFloat(x.trim())); return {rgb:p.slice(0,3), a:p.length>3?p[3]:1}; };
  const over = (fg,bg) => fg.map((v,i)=> v*fg.a + bg[i]*(1-fg.a));
  const ratio = (a,b) => { const l1=lum(a),l2=lum(b); const hi=Math.max(l1,l2),lo=Math.min(l1,l2); return (hi+0.05)/(lo+0.05); };
  const bgOf = (el) => { let n=el; while(n&&n!==document.documentElement){ const c=parse(getComputedStyle(n).backgroundColor); if(c&&c.a>0.9) return c.rgb; n=n.parentElement; } const b=parse(getComputedStyle(document.body).backgroundColor); return b?b.rgb:[255,255,255]; };
  const res=[]; const seen=new Set();
  const walker=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let node;
  while((node=walker.nextNode())){
    const t=node.textContent.trim(); if(!t) continue;
    const el=node.parentElement; if(!el) continue;
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity)<0.9) continue;
    const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) continue;
    const fg=parse(cs.color); if(!fg) continue;
    const bg=bgOf(el);
    const eff=fg.a<0.999?over(fg.rgb,bg):fg.rgb;
    const cr=ratio(eff,bg);
    const size=parseFloat(cs.fontSize); const bold=parseInt(cs.fontWeight,10)>=700;
    const large=size>=24||(size>=18.66&&bold);
    const min=large?3.0:4.5;
    const key=el.tagName+cs.color+cs.fontSize+Math.round(cr*10);
    if(cr<min && !seen.has(key)){ seen.add(key); res.push({text:t.slice(0,50),tag:el.tagName.toLowerCase(),cls:(typeof el.className==='string'?el.className:'').slice(0,40),color:cs.color,alpha:fg.a,bg:'rgb('+bg.join(',')+')',size,weight:cs.fontWeight,ratio:Math.round(cr*100)/100,min}); }
  }
  return res.sort((a,b)=>a.ratio-b.ratio).slice(0,30);
})()
`;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const url of PAGES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h; y += 500) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(90); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const res = await page.evaluate(JS);
  console.log('===== ' + url + ' -> ' + res.length + ' textes sous le seuil AA');
  for (const r of res) console.log('   ratio', r.ratio, '(min', r.min + ')', r.tag + '.' + r.cls, r.color, 'a=' + r.alpha, 'bg=' + r.bg, r.size + 'px/' + r.weight, '::', JSON.stringify(r.text));
  await ctx.close();
}
await browser.close();

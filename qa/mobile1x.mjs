import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
const BASE='http://localhost:5200';
const OUT=path.resolve('shots1x'); fs.mkdirSync(OUT,{recursive:true});
const PAGES=[['home','/'],['degustation','/degustation'],['laboratoire','/laboratoire'],['reserver','/reserver']];
const b=await chromium.launch({channel:'chrome',headless:true});
for(const [slug,url] of PAGES){
  const ctx=await b.newContext({viewport:{width:375,height:812},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(BASE+url,{waitUntil:'networkidle'}); await page.waitForTimeout(1000);
  const h=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<=h;y+=300){await page.evaluate(v=>window.scrollTo(0,v),y);await page.waitForTimeout(120);}
  await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(500);
  const H=await page.evaluate(()=>document.documentElement.scrollHeight);
  const vh=812;
  const positions={top:0, mid:Math.round((H-vh)/2), bottom:Math.max(0,H-vh)};
  for(const [n,y] of Object.entries(positions)){
    await page.evaluate(v=>window.scrollTo(0,v),y); await page.waitForTimeout(420);
    await page.screenshot({path:path.join(OUT,`${slug}__mobile1x__${n}.png`)});
  }
  console.log(slug,'H=',H);
  await ctx.close();
}
await b.close();

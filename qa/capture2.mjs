import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:5200';
const OUT = path.resolve('shots2');
fs.mkdirSync(OUT, { recursive: true });
const PAGES = [['home', '/'], ['degustation', '/degustation'], ['laboratoire', '/laboratoire'], ['reserver', '/reserver']];

const b = await chromium.launch({ channel: 'chrome', headless: true });
const report = {};
for (const [slug, url] of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // neutralise smooth scrolling so scrollTo is instantaneous & deterministic
  await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({ path: path.join(OUT, `${slug}__top.png`) });
  for (let y = 200; y < H; y += 300) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, `${slug}__full.png`), fullPage: true });
  const vh = 900;
  const pos = { mid: Math.round((H - vh) / 2), bottom: Math.max(0, H - vh) };
  for (const [n, y] of Object.entries(pos)) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(500);
    const real = await page.evaluate(() => window.scrollY);
    await page.screenshot({ path: path.join(OUT, `${slug}__${n}.png`) });
    console.log(slug, n, 'demandé', y, 'réel', real);
  }
  report[slug] = H;
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(report));

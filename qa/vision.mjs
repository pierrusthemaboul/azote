import fs from 'fs';
import path from 'path';

const cfg = fs.readFileSync(path.join(process.env.USERPROFILE, 'AppData/Local/hermes/config.yaml'), 'utf8');
// extract auxiliary.vision block
const av = cfg.split(/^auxiliary:/m)[1];
const block = av.split(/^  [a-z_]+:/m)[0];
const vis = av.slice(0, av.search(/^  [a-z_]+:/m));
const keyMatch = av.match(/^\s{4}api_key:\s*["']?([^"'\r\n]+)/m);
const apiKey = keyMatch ? keyMatch[1].trim() : null;
if (!apiKey) { console.error('clé vision introuvable'); process.exit(1); }
const MODEL = process.env.VIS_MODEL || 'google/gemini-2.5-flash';
const URL = 'https://openrouter.ai/api/v1/chat/completions';

const DIR = path.resolve('final');
const SHOTS = (process.env.SHOTS || 'home__desktop__top,home__desktop__mid,home__desktop__bottom,degustation__desktop__top,degustation__desktop__mid,degustation__desktop__bottom,laboratoire__desktop__top,laboratoire__desktop__mid,laboratoire__desktop__bottom,reserver__desktop__top,reserver__desktop__mid,reserver__desktop__bottom,home__mobile__top,home__mobile__mid,reserver__mobile__top,reserver__mobile__mid,mobile__burger-open,reserver__valid-submit').split(',');

const content = [];
for (const s of SHOTS) {
  const p = path.join(DIR, s + '.png');
  if (!fs.existsSync(p)) { console.error('manquant:', p); continue; }
  content.push({ type: 'text', text: `— Capture : ${s} (${s.includes('mobile') ? 'mobile 375px' : 'desktop 1440px'})` });
  content.push({ type: 'image_url', image_url: { url: 'data:image/png;base64,' + fs.readFileSync(p).toString('base64') } });
}
content.push({ type: 'text', text: process.env.QUESTION || 'Décris ce que tu vois.' });

const body = {
  model: MODEL,
  temperature: 0.4,
  max_tokens: 2600,
  messages: [
    { role: 'system', content: process.env.SYSTEM || "Tu es un directeur artistique senior spécialisé en sites de restaurants gastronomiques. Tu analyses des captures d'écran avec un œil critique et précis. Tu réponds en français, de façon structurée et concrète, en citant ce que tu observes réellement dans les images." },
    { role: 'user', content },
  ],
};

const r = await fetch(URL, { method: 'POST', headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:5200', 'X-Title': 'AZOTE QA' }, body: JSON.stringify(body) });
const j = await r.json();
if (!r.ok) { console.error('ERREUR', r.status, JSON.stringify(j).slice(0, 600)); process.exit(1); }
console.log('### MODELE:', MODEL, '| tokens:', JSON.stringify(j.usage));
console.log(j.choices[0].message.content);

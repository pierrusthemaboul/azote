import fs from 'fs';
import path from 'path';

const cfg = fs.readFileSync(path.join(process.env.USERPROFILE, 'AppData/Local/hermes/config.yaml'), 'utf8');
const av = cfg.split(/^auxiliary:/m)[1];
const keyMatch = av.match(/^\s{4}api_key:\s*["']?([^"'\r\n]+)/m);
const apiKey = keyMatch[1].trim();
const MODEL = 'google/gemini-2.5-flash';
const URL = 'https://openrouter.ai/api/v1/chat/completions';
const DIR = path.resolve('final');

const SPEC = `DIRECTION ARTISTIQUE VISÉE (spec de référence) :
- Gastronomie moléculaire nocturne. Noir profond #0a0a0c + magenta #d94f9e en accent + sections crème #ece7db en respiration.
- Sans-serif TRÈS fine en capitales à fort tracking (Montserrat 200-300). Titres multi-lignes avec UNE ligne en magenta. Pas de sérif.
- Nav : wordmark fin capitales espacées, CTA « RÉSERVER UNE TABLE » en bouton pill outline.
- Hero : photo plein écran sombre (cloche + fumée), titre géant 3 lignes caps fines, CTA « DÉCOUVRIR L'EXPÉRIENCE », pagination verticale « 01 / 03 » sur le côté.
- Section crème : label, titre caps fin, paragraphe, lien « EN SAVOIR PLUS → » magenta, photo sombre à droite.
- Grille 3 photos sombres en bas de page, chacune label + phrase + flèche cercle.
Pages : / (accueil), /degustation (7 séquences), /laboratoire (techniques + cheffe), /reserver (formulaire + FAQ).`;

function imgs(list) {
  const c = [];
  for (const [name, label] of list) {
    const p = path.join(DIR, name + '.png');
    if (!fs.existsSync(p)) { console.error('manquant: ' + p); continue; }
    c.push({ type: 'text', text: `— Capture ${label}` });
    c.push({ type: 'image_url', image_url: { url: 'data:image/png;base64,' + fs.readFileSync(p).toString('base64') } });
  }
  return c;
}

async function ask(system, question, list) {
  const content = [...imgs(list), { type: 'text', text: question }];
  const body = { model: MODEL, temperature: 0.35, max_tokens: 2200, messages: [{ role: 'system', content: system }, { role: 'user', content }] };
  const r = await fetch(URL, { method: 'POST', headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:5200', 'X-Title': 'AZOTE QA' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) { return 'ERREUR ' + r.status + ' ' + JSON.stringify(j).slice(0, 400); }
  return j.choices[0].message.content + `\n[tokens ${j.usage.total_tokens} · coût ${j.usage.cost}$]`;
}

const DESIGNER = "Tu es professeur de design d'interface et directeur artistique senior, spécialisé en sites de restaurants gastronomiques haut de gamme. Tu notes avec exigence et tu t'appuies uniquement sur ce que tu observes dans les captures. Tu réponds en français, structuré, concis, sans flatterie.";

const DESKTOP_SHOTS = [
  ['home__desktop__top', 'ACCUEIL — haut de page (hero plein écran)'],
  ['home__desktop__mid', 'ACCUEIL — milieu (section crème philosophie)'],
  ['home__desktop__bottom', 'ACCUEIL — bas (grille de 3 photos + footer)'],
  ['degustation__desktop__top', 'MENU — haut (en-tête + bandeau photo)'],
  ['degustation__desktop__mid', 'MENU — milieu (liste des séquences)'],
  ['degustation__desktop__bottom', 'MENU — bas (accords + transition page suivante)'],
  ['laboratoire__desktop__top', 'LABORATOIRE — haut'],
  ['laboratoire__desktop__mid', 'LABORATOIRE — milieu (techniques)'],
  ['laboratoire__desktop__bottom', 'LABORATOIRE — bas (portrait cheffe, section crème)'],
  ['reserver__desktop__top', 'RÉSERVER — haut (formulaire)'],
  ['reserver__desktop__mid', 'RÉSERVER — milieu'],
  ['reserver__desktop__bottom', 'RÉSERVER — bas (FAQ + footer)'],
];

const q1 = `${SPEC}

Évalue ce site comme un professeur de web design. Traite précisément :
1. TYPOGRAPHIE : qualité des choix, échelle des corps, graisses, interlettrage, lisibilité réelle des petits textes, cohérence entre les pages.
2. HIÉRARCHIE VISUELLE : le regard est-il bien guidé ? Les niveaux de titres se distinguent-ils ? Y a-t-il des inversions de hiérarchie ?
3. COHÉRENCE : la direction (noir/magenta/crème, thin caps) est-elle tenue d'une page à l'autre ? Repère les ruptures.
4. RYTHME / ESPACEMENT / resp. : densité, alternance des blocs, blancs tournants, alignements.
5. QUALITÉ PERÇUE : est-ce que ça a l'air cher et maîtrisé, ou démo amateur ? Cite les détails qui trahissent.
6. Fidélité à la spec : les éléments signature demandés sont-ils là ? Signale ce qui manque.
Termine par une liste de 3 DÉFAUTS les plus visibles, du plus grave au moins grave, chacun avec la page concernée.`;

const q2 = `Tu es un restaurateur français (gastronomie, ~40 couverts, addition moyenne 120 €). Tu reçois ce lien comme démo d'un site vitrine qu'on veut te vendre. ${SPEC}

Réponds franchement :
1. ÉMOTION : en 3 secondes sur l'accueil, quelle impression ? Ça te ressemble, ça te flatte, ou ça te met mal à l'aise ?
2. CRÉDIBILITÉ : y a-t-il des détails qui font « faux » ou invérifiable (adresse, téléphone, chef, prix, horaires) ? Est-ce qu'un client pourrait douter que ce restaurant existe ?
3. ENVIE DE RÉSERVER : le chemin vers la réservation est-il évident et rapide ? Qu'est-ce qui freine ?
4. INFOS PRATIQUES : un client trouve-t-il vite adresse, horaires, prix du menu, contact, accès, parking, allergies ?
5. Est-ce que tu paierais ~2 000 € pour ça ? À quelle condition ?
Termine par les 3 améliorations qui augmenteraient le plus le nombre de réservations.`;

const q3 = `Captures MOBILE 375px (accueil haut, accueil milieu, réservation haut, réservation milieu, menu burger ouvert, confirmation de réservation). ${SPEC}

Évalue l'expérience mobile : lisibilité, tailles de texte, confort de lecture, respiration, taille des zones tactiles, comportement du hero, qualité de la navigation burger, et le formulaire. Signale ce qui, sur un téléphone réel, serait désagréable ou cassé. Termine par 3 défauts mobiles par ordre d'importance.`;

const MOBILE_SHOTS = [
  ['home__mobile__top', 'ACCUEIL MOBILE — hero'],
  ['home__mobile__mid', 'ACCUEIL MOBILE — section crème'],
  ['home__mobile__bottom', 'ACCUEIL MOBILE — grille + footer'],
  ['reserver__mobile__top', 'RÉSERVER MOBILE — formulaire'],
  ['reserver__mobile__mid', 'RÉSERVER MOBILE — FAQ'],
  ['mobile__burger-open', 'MOBILE — menu burger ouvert'],
  ['reserver__valid-submit', 'RÉSERVER — écran de confirmation après envoi'],
];

const outs = [];
outs.push(['A. CRITIQUE DESIGN (desktop)', await ask(DESIGNER, q1, DESKTOP_SHOTS)]);
outs.push(['B. REGARD RESTAURATEUR (desktop)', await ask(DESIGNER, q2, DESKTOP_SHOTS)]);
outs.push(['C. AUDIT MOBILE 375px', await ask(DESIGNER, q3, MOBILE_SHOTS)]);

for (const [t, c] of outs) { console.log('\n\n' + '='.repeat(78) + '\n### ' + t + '\n' + '='.repeat(78)); console.log(c); }
fs.writeFileSync('vision-output.md', outs.map(([t, c]) => '## ' + t + '\n\n' + c).join('\n\n'));

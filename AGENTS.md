# AZOTE — site de démonstration

Restaurant fictif de cuisine moléculaire, ultra haut de gamme. Direction artistique v2 issue de la maquette Flow « NEXUS » fournie par Pierre (`reference/style-spec.md`) : **noir profond + magenta rim light, sans-serif très fine en capitales, sections crème en respiration** — photographie sombre au premier plan.

## Identité

- Noir ~ #0a0a0c / crème ~ #ece7db en alternance, accent magenta ~ #d94f9e
- Titres : sans-serif extra-fine capitales espacées (Montserrat/Jost 200-300), une ligne magenta
- Signature : hero photo plein écran, titre 3 lignes, grille de photos sombres, boutons pill outline
- Les photos portent le design — ne pas coder sans les vraies images

## Structure

- `src/data/content.ts` : nav, hero, marquee, salle, menuPreview, stats, footer
- `src/data/pages.ts` : dégustation (7 séquences), laboratoire (techniques, méthode, chef), réservation (services, infos, FAQ)
- Routes : `/`, `/degustation`, `/laboratoire`, `/reserver`, 404
- Composants : NavBar (liens numérotés + burger), HeroScene (gravure centrée + méta bar), MarqueeTicker, SequenceList (pointillés), AccordionList, ReservationForm, ContextNext, FooterSection

## État

- 16 visuels Flow importés dans `site/public/images/` (noms propres : hero-cloche, salle-magenta… — script `import-images.ps1`). Tous utilisés sauf réserve.
- Site complet en v2 sombre/magenta : home (hero plein écran + philo crème + grille), degustation (bandeau + vignettes par séquence), laboratoire (paillasse + bandeau + chef), reserver (diptyque + formulaire)
- Contenu rédigé par Hermes (`content-draft.md`) intégré dans `src/data/`
- Dev server : port 5200 (`npm run dev -- --port 5200 --strictPort`)
- Build : `npm run build` (vue-tsc + vite) — vert

## Fiabilisation portfolio (passée)

- Réservation : `mailto:labo@azote.example` pré-rempli — honnête, pas de faux code de confirmation. Upgrade possible : Web3Forms/Formspree (tier gratuit).
- SEO : `<title>`/meta par route (`router.ts` meta + afterEach), OG + JSON-LD `Restaurant` dans `index.html`, `public/robots.txt`, `sitemap.xml`, `_redirects` (SPA), `favicon.svg`, fonts Google en `<link>` + preconnect.
- Accessibilité : accordéons à IDs uniques, focus-visible sur radios/services, messages d'erreur formulaire, date min en heure locale (pas UTC).
- Piège CSS : `--accent-2` n'existe plus — accents = `--accent` (magenta).

## Hermes

`.hermes` local, peer `pierre-azote`. Usage optimal validé : **revue de code ciblée** (fichier:ligne, ~90 s) + rédaction de contenu (~40 s). NE PAS lui demander d'audits visuels multi-pages avec screenshots → timeout 300 s.

## À faire

- Optimiser les JPEG (~200-500 Ko chacun) : WebP + srcset
- Avis/presse fictifs, carte d'accès, prix visible plus tôt (idées client)
- QA responsive + retouche avec Pierre

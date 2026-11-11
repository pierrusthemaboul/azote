export interface NavLink {
  label: string
  href: string
}

export interface GridCard {
  image: string
  label: string
  text: string
  to: string
}

export interface SiteContent {
  title: string
  nav: NavLink[]
  hero: {
    brand: string
    lines: string[]
    accentLine: number
    sub: string
    cta: string
    ctaTo: string
    image: string
    pager: string
  }
  quote: string
  philosophie: {
    kicker: string
    title: string
    body: string
    link: string
    to: string
    image: string
    alt: string
  }
  grid: GridCard[]
  footer: {
    tagline: string
    links: NavLink[]
    address: string
  }
}

export const content: SiteContent = {
  title: 'AZOTE — Cuisine moléculaire · Lyon',
  nav: [
    { label: 'Le concept', href: '/laboratoire' },
    { label: 'Le menu', href: '/degustation' },
    { label: 'Réserver', href: '/reserver' },
  ],
  hero: {
    brand: 'AZOTE',
    lines: ['Cuisine', 'Sensations', 'Émotions'],
    accentLine: 1,
    sub: 'Une cuisine moléculaire où la précision rencontre la créativité pour éveiller tous les sens.',
    cta: "Découvrir l'expérience",
    ctaTo: '/degustation',
    image: '/images/hero-cloche.jpg',
    pager: '01 — 03',
  },
  quote: "Une olive qui n'est pas une olive : c'est tout le programme.",
  philosophie: {
    kicker: 'Notre philosophie',
    title: 'Une autre façon de dîner.',
    body: "Ce que nous cherchons tient dans une seconde : celle où le convive se trompe. Une olive qui n'en est pas une. Un chaud servi froid. Une glace née sous vos yeux, en soixante secondes. Sept séquences, douze couverts, deux heures trente, et une seule consigne : rester curieux.",
    link: 'En savoir plus',
    to: '/laboratoire',
    image: '/images/salle-magenta.jpg',
    alt: "La salle d'AZOTE la nuit, panneaux lumineux magenta, tables dressées",
  },
  grid: [
    {
      image: '/images/plat-sphere.jpg',
      label: 'Le menu',
      text: 'Des créations uniques entre tradition et innovation.',
      to: '/degustation',
    },
    {
      image: '/images/mains-dressage.jpg',
      label: 'Le chef',
      text: 'Une vision, une exigence, une passion sans limite.',
      to: '/laboratoire',
    },
    {
      image: '/images/verre-vin.jpg',
      label: 'La carte des vins',
      text: "Une sélection d'exception pour sublimer chaque instant.",
      to: '/degustation',
    },
  ],
  footer: {
    tagline: 'La science à table.',
    links: [
      { label: 'Le concept', href: '/laboratoire' },
      { label: 'Le menu', href: '/degustation' },
      { label: 'Réserver', href: '/reserver' },
    ],
    address: '14 rue des Capucins, 69001 Lyon — restaurant fictif, site de démonstration',
  },
}

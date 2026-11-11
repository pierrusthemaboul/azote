export interface PageLink {
  label: string
  to: string
}

export interface Sequence {
  number: string
  name: string
  technique: string
  description: string
  image?: string
}

export interface Technique {
  index: string
  name: string
  temp: string
  body: string
}

export interface AccordionItemData {
  title: string
  body: string
}

export interface PagesData {
  degustation: {
    title: string
    kicker: string
    intro: string
    heroImage: string
    sequences: Sequence[]
    pairing: { title: string; body: string; image: string }
    price: { amount: string; note: string }
    next: PageLink
  }
  laboratoire: {
    title: string
    kicker: string
    intro: string
    heroImage: string
    techniques: Technique[]
    method: { step: string; title: string; body: string }[]
    bandImage: string
    chef: { name: string; role: string; body: string; image: string }
    next: PageLink
  }
  reserver: {
    title: string
    kicker: string
    intro: string
    images: { src: string; alt: string }[]
    services: { time: string; note: string }[]
    infos: AccordionItemData[]
    faq: AccordionItemData[]
    next: PageLink
  }
}

export const pages: PagesData = {
  degustation: {
    title: 'Le menu',
    kicker: 'Menu · 7 séquences',
    intro:
      "Un seul menu, sept séquences, aveugle. Chaque assiette est une expérience contrôlée : texture trompeuse, température inversée, arôme isolé. On ne choisit pas — on reste curieux.",
    heroImage: '/images/dessert-fumee.jpg',
    sequences: [
      {
        number: '01',
        name: "Sphère d'olive",
        technique: 'sphérification',
        description:
          "Une olive verte sans peau ni noyau : une membrane si fine qu'on ne la sent pas céder, puis le liquide tiède qui envahit la bouche d'un coup. Servie à la main, à la première minute.",
        image: '/images/plat-sphere.jpg',
      },
      {
        number: '02',
        name: 'Huître, concombre, air de mer',
        technique: "émulsion d'air",
        description:
          "L'huître arrive décoquillée sous une écume de concombre qui sent le large. On la gobe d'un geste : l'air se dissipe avant la mâche, il ne reste que l'iode et le froid.",
        image: '/images/caviar-macro.jpg',
      },
      {
        number: '03',
        name: 'Foie gras râpé minute',
        technique: 'azote liquide',
        description:
          'Plongé à −196 °C, puis râpé à la seconde sur une brioche brûlée. La poudre est d’abord glacée et craquante, puis elle redevient crème sur la langue. Le foie gras fond deux fois.',
        image: '/images/azote-vapeur.jpg',
      },
      {
        number: '04',
        name: 'Le cordon-bleu déconstruit',
        technique: 'déconstruction',
        description:
          'Poularde fermière, jambon affiné en copeau translucide, comté en fumée, panure en poudre de mie torréfiée. Tous les codes du plat d’enfance, aucun de ses gestes.',
      },
      {
        number: '05',
        name: 'Pomme de terre, jus de 72 heures',
        technique: 'cryo-concentration',
        description:
          'Une pomme de terre vapeur servie entière, un jus de poulet concentré trois jours par le froid, quelques grains d’oseille. Rien à cacher : la matière est mise à nu, et elle suffit.',
        image: '/images/plat-extra.jpg',
      },
      {
        number: '06',
        name: 'Saint-Jacques, noir de seiche',
        technique: 'encre de seiche',
        description:
          'Coquille snackée, risotto noir d’encre, crème de charbon végétal. L’assiette la plus sombre du service — et la plus douce en bouche, presque lactée.',
        image: '/images/plat-plongee.jpg',
      },
      {
        number: '07',
        name: 'Glace minute citron-basilic',
        technique: 'azote liquide, en salle',
        description:
          'Préparée devant vous en soixante secondes, dans un bol de cuivre. Elle n’a pas eu le temps de cristalliser : la texture la plus fine qu’une glace puisse atteindre, et elle disparaît en dix secondes.',
        image: '/images/dessert-fumee.jpg',
      },
    ],
    pairing: {
      title: 'Accords non évidents',
      body: "Nos accords ne cherchent pas la dégustation parallèle, mais la friction utile : vins nature élevés sans soufre ajouté, saké junmai servi à 12 °C, jus de fermentation maison — poire, céleri, verjus. Cinq verres versés à la main, ajustés à chaque séquence. Version entièrement sans alcool, servie avec la même attention.",
      image: '/images/cocktail-noir.jpg',
    },
    price: {
      amount: '145 €',
      note: 'par convive · accords +85 € · service compris',
    },
    next: { label: 'Le laboratoire', to: '/laboratoire' },
  },

  laboratoire: {
    title: 'Le laboratoire',
    kicker: 'Méthode · instruments',
    intro:
      "Derrière la passe : des éprouvettes, un siphon, un bain d'azote. La science n'est pas le sujet du repas — elle en est l'outillage. Précis, mesuré, silencieux.",
    heroImage: '/images/ingredients-etale.jpg',
    techniques: [
      {
        index: 'T.01',
        name: 'Sphérification',
        temp: 'Alginate + calcium',
        body: 'Enfermer un liquide dans une pellicule d’alginate qui cède sous la langue, sans qu’on ait senti la paroi.',
      },
      {
        index: 'T.02',
        name: 'Azote liquide',
        temp: '−196 °C',
        body: 'Figer en quelques secondes, sans cristaux perceptibles. C’est ainsi que naît, en salle, la glace minute servie devant vous.',
      },
      {
        index: 'T.03',
        name: 'Émulsions d’air',
        temp: 'Lécithine',
        body: 'Une écume qui porte un arôme et le libère en se dissipant : on goûte avec le nez avant la bouche.',
      },
      {
        index: 'T.04',
        name: 'Cryo-concentration',
        temp: '72 h au froid',
        body: 'Concentrer un jus par le froid, sans cuisson : l’eau part en glace, le goût reste entier, presque trop.',
      },
      {
        index: 'T.05',
        name: 'Déconstruction',
        temp: 'Composants séparés',
        body: 'Démonter un plat classique et servir ses composants côte à côte : le convive recompose la bouchée lui-même.',
      },
      {
        index: 'T.06',
        name: 'Encres & pigments',
        temp: 'Seiche · charbon · suie',
        body: 'Du noir qui colore l’assiette et n’amertume jamais : encre de seiche, charbon végétal, suie de poireau.',
      },
    ],
    method: [
      {
        step: '01',
        title: 'Hypothèse',
        body: 'Chaque plat commence par une question : « et si la soupe était solide ? et si le chaud était froid ? »',
      },
      {
        step: '02',
        title: 'Protocole',
        body: 'La question devient essai : doses au gramme, températures au dixième, résultats consignés dans le cahier du labo.',
      },
      {
        step: '03',
        title: 'Dégustation-test',
        body: "L'équipe goûte, note, casse. Un plat n'entre en carte que s'il provoque la surprise — jamais s'il est seulement correct.",
      },
      {
        step: '04',
        title: 'Mise en carte',
        body: 'Le plat validé rejoint une séquence. Il en sort dès que la saison — ou une meilleure idée — le réclame.',
      },
    ],
    bandImage: '/images/bar-comptoir.jpg',
    chef: {
      name: 'Élise Moreau',
      role: 'Cheffe & fondatrice',
      body: "Élise Moreau a passé cinq ans derrière un comptoir de pharmacie avant d'entrer en cuisine, s'arrêtant toujours à la dose près. Formée chez deux maisons étoilées, elle ouvre AZOTE pour appliquer à l'assiette ce que la paillasse lui a appris : une précision qui ne s'entend pas. Elle dresse elle-même les sept séquences, chaque soir.",
      image: '/images/cuisine-silhouette.jpg',
    },
    next: { label: 'Réserver une table', to: '/reserver' },
  },

  reserver: {
    title: 'Réserver',
    kicker: '12 couverts · 2 services',
    intro:
      'Douze couverts par service, un menu unique, pas de carte. La réservation se confirme en ligne — votre expérience commence ici.',
    images: [
      {
        src: '/images/porte-exterieur.jpg',
        alt: 'La porte noire d’AZOTE la nuit, petit panneau magenta',
      },
      {
        src: '/images/table-detail.jpg',
        alt: 'Détail de table : couverts noirs, lin plié, flamme',
      },
    ],
    services: [
      { time: '19:30', note: 'Service I — dégustation complète' },
      { time: '21:15', note: 'Service II — dégustation complète' },
    ],
    infos: [
      {
        title: 'Adresse',
        body: '14 rue des Capucins, 69001 Lyon. Métro Hôtel de Ville, puis 4 minutes à pied. Pas de vitrine : cherchez la porte noire au panneau magenta.',
      },
      {
        title: 'Horaires',
        body: 'Du mercredi au samedi, deux services : 19h30 et 21h15. Fermé dimanche, lundi et mardi (jours de laboratoire).',
      },
      {
        title: 'Durée & rythme',
        body: 'Compter 2 h 30 pour les sept séquences. L’expérience démarre à l’heure : le service est chorégraphié, pas d’entrée retardée.',
      },
      {
        title: 'Tarif',
        body: '145 € par convive, service compris. Accords en option : +85 €.',
      },
      {
        title: 'Dress code',
        body: 'Libre. La seule étiquette qu’on respecte ici est sur les éprouvettes.',
      },
    ],
    faq: [
      {
        title: 'Y a-t-il un menu unique ?',
        body: 'Oui, et il est aveugle. Sept séquences imposées, pas de carte, pas d’alternative à la découpe. La surprise fait partie du protocole.',
      },
      {
        title: 'Allergies, régimes, option végétale ?',
        body: 'À signaler à la réservation. Le menu végétal est pensé à part entière, pas comme une version diminuée. Nous adaptons aussi sans gluten et sans lactose.',
      },
      {
        title: 'Les enfants sont-ils acceptés ?',
        body: 'Nous les accueillons à partir de 12 ans. Deux heures trente de service, dont une partie en silence relatif : l’expérience demande de l’attention.',
      },
      {
        title: 'Peut-on offrir une expérience ?',
        body: 'Oui. Les cartes « séquence offerte » se retirent sur place ou s’envoient par courriel, valables un an, sans mention de prix.',
      },
      {
        title: 'Annulation ?',
        body: 'Sans frais jusqu’à 48 h avant le service. Au-delà, l’acompte de 50 € par couvert reste acquis — douze chaises seulement, chacune compte.',
      },
      {
        title: 'Privatiser la salle ?',
        body: 'Douze couverts, un menu, un seul service : la salle se privatise du mercredi au samedi sur demande écrite à labo@azote.example.',
      },
    ],
    next: { label: "Retour à l'accueil", to: '/' },
  },
}

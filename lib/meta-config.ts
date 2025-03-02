export const defaultMetadata = {
  title: {
    default: 'KnowLedger - Plateforme de formation en ligne',
    template: '%s | KnowLedger'
  },
  description: 'KnowLedger est une plateforme de formation en ligne proposant des articles, vidéos et formations pour développer vos compétences.',
  keywords: ['formation', 'apprentissage', 'développement', 'compétences', 'vidéos', 'articles', 'tutoriels'],
  authors: [{ name: 'KnowLedger Team' }],
  creator: 'KnowLedger',
  publisher: 'KnowLedger',
  robots: {
    index: true,
    follow: true
  }
}

export const routeMetadata = {
  '/': {
    title: 'Accueil',
    description: 'Découvrez KnowLedger, votre plateforme de formation en ligne. Articles, vidéos et formations pour développer vos compétences.'
  },
  '/articles': {
    title: 'Articles',
    description: 'Explorez notre collection d\'articles sur divers sujets pour approfondir vos connaissances.'
  },
  '/videos': {
    title: 'Vidéos',
    description: 'Regardez nos vidéos pédagogiques pour apprendre de manière interactive et engageante.'
  },
  '/formations': {
    title: 'Formations',
    description: 'Accédez à nos formations complètes pour maîtriser de nouvelles compétences.'
  },
  '/about': {
    title: 'À propos',
    description: 'Découvrez qui nous sommes et notre mission de partage des connaissances.'
  },
  '/contact': {
    title: 'Contact',
    description: 'Contactez-nous pour toute question ou suggestion concernant nos services.'
  },
  '/formatorquery': {
    title: 'Devenir Formateur',
    description: 'Rejoignez notre équipe de formateurs et partagez vos connaissances avec notre communauté.'
  },
  '/premium': {
    title: 'Premium',
    description: 'Découvrez nos offres premium pour un accès illimité à tout notre contenu.'
  }
} 
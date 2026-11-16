import { services, servicePath } from './content/services';

export const SITE_URL = 'https://bkntech.fr';
export const INDEX_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const publicPaths = [
  '/', '/services', ...services.map(servicePath), '/contact', '/portfolio',
  ...['software', 'website', 'mobile', 'ai-agent', 'gaming'].map(category => `/portfolio/section/${category}`),
  '/mentions-legales', '/politique-de-confidentialite',
];
export const redirectPaths = { '/game': '/portfolio/section/gaming', '/devlog': '/portfolio/section/gaming', '/dkp': 'https://dkp95.fr', '/dkp95': 'https://dkp95.fr', '/dkprenovation': 'https://dkp95.fr' };

const pageCopy = {
  '/': [
    ['BKN Tech | Sites web, applications et intelligence artificielle', 'Studio de développement à Paris : sites web sur mesure, applications mobiles et solutions IA. Découvrez nos réalisations et contactez BKN Tech pour votre projet.'],
    ['BKN Tech | Websites, mobile applications and AI development', 'Paris development studio for custom websites, mobile apps and AI solutions. Explore our work and contact BKN Tech about your project.'],
  ],
  '/services': [
    ['Développement web, mobile, IA et jeux vidéo | BKN Tech', 'Découvrez les expertises BKN Tech : création de sites web, applications iOS et Android, assistants IA et développement Unity. Parlons de votre projet.'],
    ['Web, mobile, AI and game development services | BKN Tech', 'Explore BKN Tech’s expertise: custom websites, iOS and Android apps, AI assistants and Unity development. Discuss your project with our studio.'],
  ],
  '/contact': [
    ['Contacter BKN Tech | Discuter de votre projet et demander un devis', 'Contactez BKN Tech pour votre site web, application mobile, solution IA ou projet de jeu vidéo. contact@bkntech.fr · +33 6 61 20 14 18 · Paris.'],
    ['Contact BKN Tech | Discuss your project and request a quote', 'Contact BKN Tech about your website, mobile application, AI solution or game project. contact@bkntech.fr · +33 6 61 20 14 18 · Paris, France.'],
  ],
  '/portfolio': [
    ['Portfolio web, mobile et IA : nos réalisations | BKN Tech', 'Explorez les réalisations et projets BKN Tech : sites web, applications mobiles, agents IA et notre jeu coopératif Vacuum Protocol.'],
    ['Web, mobile and AI development portfolio | BKN Tech', 'Explore BKN Tech’s projects: websites, mobile applications, AI agents and our cooperative game Vacuum Protocol.'],
  ],
  '/mentions-legales': [
    ['Mentions légales | BKN Tech', 'Informations sur BKN Tech, société éditrice du site bkntech.fr, coordonnées et hébergement.'],
    ['Legal notice | BKN Tech', 'Information about BKN Tech, publisher of bkntech.fr, company contact details and hosting.'],
  ],
  '/politique-de-confidentialite': [
    ['Politique de confidentialité | BKN Tech', 'Traitement des données personnelles et utilisation du formulaire de contact sur le site BKN Tech.'],
    ['Privacy policy | BKN Tech', 'Personal data handling and use of the contact form on the BKN Tech website.'],
  ],
};
const categoryCopy = {
  software: ['Nos logiciels : B-Board et outils SaaS | BKN Tech', 'Our software: B-Board and SaaS tools | BKN Tech'],
  website: ['Sites web et applications web : projets | BKN Tech', 'Website and web application projects | BKN Tech'],
  mobile: ['Applications mobiles iOS et Android : projets | BKN Tech', 'iOS and Android application projects | BKN Tech'],
  'ai-agent': ['Agents IA et automatisation : projets | BKN Tech', 'AI agents and automation projects | BKN Tech'],
  gaming: ['Vacuum Protocol : jeu coopératif Unity et devlog | BKN Tech', 'Vacuum Protocol: cooperative Unity game and devlog | BKN Tech'],
};
const categoryDescriptions = {
  software: ['Découvrez les logiciels conçus et exploités par BKN Tech, dont B-Board, le Kanban pour équipes et agents IA connecté par MCP.', 'Explore the software built and run by BKN Tech, including B-Board, the Kanban for teams and AI agents connected through MCP.'],
  website: ['Découvrez nos projets de sites et applications web, dont le site DKP Rénovation avec son parcours de demande de devis.', 'Explore our website and web application projects, including DKP Rénovation and its quote request journey.'],
  mobile: ['Découvrez les projets mobiles du studio BKN Tech et contactez-nous pour discuter de votre application iOS et Android.', 'Explore BKN Tech’s mobile projects and contact our studio to discuss your iOS and Android application.'],
  'ai-agent': ['Découvrez nos projets d’agents IA, d’assistants connectés à une base de connaissances et d’automatisation métier.', 'Explore our AI agents, knowledge-base assistants and business automation projects.'],
  gaming: ['Suivez le développement de Vacuum Protocol, le jeu coopératif sous Unity de BKN Tech : gameplay, interfaces, multijoueur, captures et vidéos.', 'Follow development of Vacuum Protocol, BKN Tech’s cooperative Unity game: gameplay, interfaces, multiplayer, screenshots and videos.'],
};

export function getSeo(pathname, language = 'fr') {
  const path = pathname.replace(/\/+$/, '') || '/';
  const lang = language.startsWith('en') ? 'en' : 'fr';
  const index = lang === 'fr' ? 0 : 1;
  const service = services.find(item => servicePath(item) === path);
  const category = path.startsWith('/portfolio/section/') ? path.split('/').pop() : null;
  const known = publicPaths.includes(path);
  let [title, description] = pageCopy[path]?.[index] || (service
    ? [service[lang].title, service[lang].description]
    : categoryCopy[category] ? [categoryCopy[category][index], categoryDescriptions[category][index]]
      : [lang === 'fr' ? 'Page introuvable | BKN Tech' : 'Page not found | BKN Tech', pageCopy['/'][index][1]]);
  if (path === '/portfolio/admin') title = 'Administration | BKN Tech';
  if (path === '/portfolio/admin/promo') title = 'Codes promo | Administration BKN Tech';
  if (path === '/b-ledger/offre') title = 'Offre de lancement B-Ledger | BKN Tech';
  if (path.startsWith('/offre/')) title = 'Offre promotionnelle | BKN Tech';
  if (path.startsWith('/code/')) title = 'Votre code promo | BKN Tech'; // jamais le code dans le titre (historique, onglets partagés)
  const url = `${SITE_URL}${path}`;
  const organization = {
    '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'BKN Tech',
    url: `${SITE_URL}/`, logo: `${SITE_URL}/BknLogo.svg`,
    email: 'contact@bkntech.fr', telephone: '+33661201418',
    address: { '@type': 'PostalAddress', streetAddress: '47 rue Vivienne', postalCode: '75002', addressLocality: 'Paris', addressCountry: 'FR' },
  };
  const graph = known ? [organization, {
    '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: 'BKN Tech', publisher: { '@id': organization['@id'] },
  }, {
    '@type': path === '/contact' ? 'ContactPage' : path === '/services' || path.startsWith('/portfolio') ? 'CollectionPage' : 'WebPage',
    '@id': `${url}#webpage`, url, name: title, description, inLanguage: lang,
    isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': organization['@id'] },
  }] : [];
  if (service) graph.push({
    '@type': 'Service', '@id': `${url}#service`, name: service[lang].name,
    description, url, provider: { '@id': organization['@id'] },
    mainEntityOfPage: { '@id': `${url}#webpage` },
  });
  if (known && path !== '/') {
    const crumbs = [{ name: lang === 'fr' ? 'Accueil' : 'Home', item: `${SITE_URL}/` }];
    if (service) crumbs.push({ name: 'Services', item: `${SITE_URL}/services` });
    else if (category) crumbs.push({ name: 'Portfolio', item: `${SITE_URL}/portfolio` });
    crumbs.push({ name: service?.[lang].name || title.split(' | ')[0], item: url });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb })) });
  }
  return { title, description, url, lang, robots: known ? INDEX_ROBOTS : 'noindex, follow', structuredData: { '@context': 'https://schema.org', '@graph': graph } };
}

// Escape both HTML attributes and JSON script content, including future CMS text.
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const serializeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function renderSeoTags(seo) {
  const meta = (key, value, property = false) => `<meta ${property ? 'property' : 'name'}="${key}" content="${escapeHtml(value)}" />`;
  return [
    `<title>${escapeHtml(seo.title)}</title>`, meta('description', seo.description), meta('robots', seo.robots),
    `<link rel="canonical" href="${escapeHtml(seo.url)}" />`,
    meta('og:type', 'website', true), meta('og:site_name', 'BKN Tech', true),
    meta('og:title', seo.title, true), meta('og:description', seo.description, true), meta('og:url', seo.url, true),
    meta('og:locale', seo.lang === 'fr' ? 'fr_FR' : 'en_GB', true),
    meta('og:image', `${SITE_URL}/og-bkn-tech.png`, true), meta('og:image:width', '1200', true), meta('og:image:height', '630', true),
    meta('og:image:alt', 'BKN Tech — Web · Mobile · IA · Unity', true),
    meta('twitter:card', 'summary_large_image'), meta('twitter:title', seo.title), meta('twitter:description', seo.description), meta('twitter:image', `${SITE_URL}/og-bkn-tech.png`),
    `<script id="seo-structured-data" type="application/ld+json">${serializeJson(seo.structuredData)}</script>`,
  ].join('\n  ');
}

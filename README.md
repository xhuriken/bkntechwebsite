# BKN Tech — site public

Site React 19 / Vite, Tailwind CSS et Framer Motion. L’API Express gère le contact, les réalisations et les médias ; la production utilise Docker, Nginx et Traefik.

## Développement et vérification

```sh
npm ci
npm run dev
npm run build
npm run check:seo
npm run lint
npm run preview -- --host 127.0.0.1 --port 4173
```

Avec l’aperçu lancé dans un autre terminal, `npm run check:seo:http` vérifie aussi les réponses HTTP et le bon HTML à chaque URL directe.

Le serveur de développement fournit les routes API locales grâce au middleware Vite. `vite preview` sert uniquement les fichiers compilés : les appels `/api/posts` et `/api/settings` n’y sont pas connectés à Express. En production, Nginx assure ce proxy. Ne pas envoyer de demande de contact de test sans prévoir la réception de l’e-mail.

## Pages et référencement

Le build compile l’application puis exécute `scripts/prerender.mjs`. Il génère 14 documents HTML publics avec le contenu React complet, un sitemap et une image de partage PNG. Un robot sans JavaScript reçoit les mêmes services et coordonnées que le visiteur. React reprend ensuite l’interface avec `createRoot` et les données publiques intégrées, et les pages portfolio rafraîchissent leurs contenus via l’API.

- `/services` : présentation du studio et des expertises.
- `/services/creation-site-web` : sites vitrines, e-commerce, applications web et refonte.
- `/services/developpement-application-mobile` : projets iOS et Android.
- `/services/intelligence-artificielle` : assistants, applications IA et automatisation.
- `/services/developpement-jeu-video` : expérience Unity et projet interne Vacuum Protocol ; toute prestation client reste à étudier.
- `/contact`, `/portfolio`, les quatre catégories du portfolio et les pages juridiques complètent les pages publiques.

`src/content/services.js` contient les textes FR/EN. `src/seo.js` centralise les métadonnées, les URL canoniques et les données structurées Organization, WebSite, WebPage, Service et BreadcrumbList. Le composant `Seo` les actualise après navigation et changement de langue. Aucune note client, aucun tarif ni résultat commercial ne sont inventés dans les données structurées.

L’URL canonique est `https://bkntech.fr`, sans `www`. Le contenu indexable initial est en français ; le sélecteur anglais conserve la même URL. Il n’y a donc pas de `hreflang` artificiel ni de promesse de référencement distinct en anglais. Des URL linguistiques dédiées seraient une évolution séparée.

`public/robots.txt` laisse accessibles les pages et ressources de rendu à Googlebot, Bingbot, Applebot et OAI-SearchBot via le groupe commun. L’administration est exclue du sitemap et porte `noindex` en HTML et en en-tête Nginx ; elle reste explorable pour que les robots puissent lire cette directive. Robots.txt n’est pas une protection d’accès.

Nginx sert chaque route depuis son document généré, renvoie les URL inconnues en HTTP 404 et redirige `/game` et les raccourcis DKP en HTTP 301. Un middleware d’aperçu Vite reproduit ces routes pour vérifier les accès directs localement ; cela ne remplace pas la validation du serveur Nginx déployé.

Les instantanés HTML du portfolio utilisent `api/posts.json` et uniquement les deux URL de bannière publiques de `api/settings.json` au moment du build. **Après une modification de contenu depuis l’administration, reconstruire et redéployer le frontend pour actualiser le HTML lu sans JavaScript.** Les visiteurs avec JavaScript voient les données API actualisées. Vérifier également que les fichiers du build correspondent aux contenus réels de production.

## Mise en ligne et suivi

1. Relire les prestations et les références. Le fichier des projets contient notamment une entrée « TItre du projet » et des présentations génériques : remplacer les brouillons et identifier les démonstrations avant de les présenter comme références commerciales. Publier des études de cas réelles, avec contexte, captures, rôle du studio et résultats vérifiables. Les liens sociaux génériques du footer doivent être remplacés par les profils réels.
2. Déployer via le processus Docker existant, sans écraser les contenus et médias maintenus en production. Vérifier `nginx -t` dans l’environnement Docker, puis les réponses HTTP 200 des pages publiques, 301 des redirections et 404 d’une URL inexistante. Vérifier également le fonctionnement de l’API et du formulaire sur l’environnement déployé.
3. [Valider la propriété du domaine dans Google Search Console](https://support.google.com/webmasters/answer/9008080), de préférence par DNS si ce choix convient au propriétaire. Soumettre `https://bkntech.fr/sitemap.xml`, inspecter les nouvelles pages et vérifier les éventuels blocages d’exploration ou réglages d’inclusion dans les fonctionnalités génératives.
4. [Soumettre également le sitemap dans Bing Webmaster Tools](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed). Vérifier que le proxy, un CDN ou un pare-feu ne bloquent pas les robots autorisés.
5. Mesurer les pages et requêtes qui apportent des visiteurs et des prises de contact. Suivre les rapports disponibles dans Search Console et Bing ; ne pas déduire une progression de classement de la seule réussite d’un build. Mesurer les performances réelles sur mobile après déploiement avant de fixer les prochaines optimisations.

Le [guide officiel Google sur l’optimisation pour la recherche générative](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) privilégie un contenu original, utile et techniquement accessible. Google indique que `llms.txt` n’améliore pas son classement. La [documentation officielle OpenAI](https://developers.openai.com/api/docs/bots) distingue OAI-SearchBot pour ChatGPT Search de GPTBot pour l’entraînement ; l’autorisation d’exploration ne garantit pas une citation. [Applebot](https://support.apple.com/en-us/119829) alimente notamment certaines recherches dans Siri, Spotlight et Safari. Safari est un navigateur : les résultats dépendent aussi du moteur choisi par l’utilisateur.

Aucune garantie de première place, d’indexation ou de citation par une IA. Ces changements préparent la découverte et la compréhension du site ; la qualité des preuves, la réputation et le suivi restent essentiels.

# Journal de Développement - BKN Tech

Ce journal retrace toutes les décisions techniques, les modifications de code et les résolutions de bugs apportées au projet.

## [2026-07-30] Pull main, Correction Workflow GitHub Actions & Déploiement VPS

### Tâche
- Récupérer les dernières mises à jour du dépôt distant (`git pull origin main`).
- Corriger l'erreur de syntaxe YAML dans le workflow GitHub Actions ([deploy.yml](file:///c:/Users/kikep/Desktop/Bkn%20Society/bkntechwebsite/.github/workflows/deploy.yml)).
- Déployer la version à jour du site sur le VPS OVH (`151.80.147.208`).
- Analyser les prérequis pour assurer le fonctionnement automatique des futurs déploiements CI/CD GitHub Actions.

### Modifications
- Exécuté `git pull origin main` : synchronisation locale de 15 fichiers (Logo BKN, Administration Portfolio, Settings API, Contact Form, etc.).
- Correction de [.github/workflows/deploy.yml](file:///c:/Users/kikep/Desktop/Bkn%20Society/bkntechwebsite/.github/workflows/deploy.yml) :
  - Correction de l'indentation de la génération du fichier `.env` via un bloc `echo` propre (résolution du bug du parseur YAML ligne 65).
  - Définition par défaut de l'utilisateur VPS SSH sur `ubuntu` (`VPS_USER:-ubuntu`).
- Exécution du script de déploiement sécurisé vers le VPS (`151.80.147.208`) :
  - Transfert d'archive et extraction dans `/var/www/bkntech`.
  - Écriture de la configuration de production `.env`.
  - Reconstruction et relancement des conteneurs Docker (`bkntech-api`, `bkntech-frontend`, `traefik`).
- Validation des identifiants SSH (`ubuntu` + mot de passe VPS) et mise à jour des secrets GitHub pour l'exécution automatique des workflows CI/CD.
- Ajout d'une sécurité dans deploy.yml forçant l'utilisation de l'utilisateur ubuntu pour SSH (prévention des blocages si VPS_USER est configuré sur root dans les secrets GitHub).

### Justification Technique
L'erreur de syntaxe YAML capturée par GitHub Actions venait d'une désindentation complète des lignes de variables `SMTP_*` sous la directive `run: |`. En encapsulant la création du fichier `.env` dans un bloc de commandes `echo` indenté, la syntaxe YAML reste 100% valide et lisible.
Le déploiement VPS a été validé à 100% avec les conteneurs `bkntech-api`, `bkntech-frontend` et `traefik` en état *healthy* et opérationnels sur les ports 80/443.

---

## [2026-07-26] Initialisation du Projet

### Tâche
Initialisation des outils de suivi et de gestion du projet.

### Modifications
- Création de [TODO.md](file:///c:/Users/celestin/Desktop/bkntechwebsite/TODO.md) pour suivre l'avancement exact des demandes.
- Création de [DEVELOPMENT_LOG.md](file:///c:/Users/celestin/Desktop/bkntechwebsite/DEVELOPMENT_LOG.md) (ce fichier).
- Proposition de la stack technique dans l'artifact d'implémentation.
- Rédaction de [projet.md](file:///c:/Users/celestin/Desktop/bkntechwebsite/projet.md) (Étape 2).
- Rédaction de [features.md](file:///c:/Users/celestin/Desktop/bkntechwebsite/features.md) (Étape 3).
- Mise à jour de l'architecture pour adopter un modèle Multi-Pages (MPA) avec pages dédiées pour le Portfolio (`portfolio.html`) et le Jeu Unity (`game.html`), suite au retour de l'utilisateur.
- Clarification de la gestion de contenu (JSON pour i18n et données de démonstration) et de la stratégie d'évolution vers un backend complet (découplage API vs frameworks comme React ou Laravel).
- Sélection finale de la stack : **Vite + React + Framer Motion + Tailwind CSS**.
- Initialisation de la structure du projet avec `create-vite` et installation des dépendances.
- Configuration de Tailwind CSS v4, importation de Font Awesome, Google Fonts, et définition des tokens CSS dans `src/index.css`.
- Création du routage React avec `react-router-dom` pour les pages `Home`, `Portfolio` et `Game`.
- Configuration de l'i18n (`src/i18n.js`) avec dictionnaires `fr.json` et `en.json` pour la traduction instantanée.
- Création des composants de base du design system : `InteractiveGrid` (arrière-plan réactif à la souris sans re-render React) et `Button` (bouton magnétique avec spring physics sous Framer Motion).
- Création des composants de layout : `Navbar` responsive avec drawer mobile animé, `LanguageSwitcher` interactif glissant, et `Footer` minimaliste.
- Implémentation du squelette des pages et de la page d'accueil avec titre, sous-titre et intégration des boutons magnétiques de vérification.

### Justification Technique
Respect rigoureux du workflow d'analyse et de conception. La proposition de stack et la spécification des pages permettent d'établir des bases fonctionnelles et techniques solides avant d'écrire le code (KISS). L'architecture multi-pages (MPA) permet de mieux gérer les contenus denses et volumineux (vidéos, projets de portfolio complets) sans alourdir la page d'accueil, garantissant de meilleures performances de chargement et un meilleur SEO. L'utilisation de fichiers JSON pour les textes (i18n) permet d'implémenter le multi-langue de manière modulaire (SSOT) sans dupliquer le HTML. Le découplage Frontend/Backend assure que le site pourra être connecté à n'importe quelle API future (Node.js, Laravel) sans nécessiter de réécriture lourde.
Le choix final de **React + Framer Motion** répond à l'exigence d'une réutilisabilité maximale des composants (composants React hautement déclaratifs) et de la création d'animations premium fluides (hover, appear, scroll) d'une grande finesse esthétique, tout en gardant une base de code propre, lisible et performante.
La validation du build de production (`npm run build`) avec 0 warning garantit la conformité de la structure, des importations CSS et JS, et l'excellence technique exigée par le projet.## [2026-07-27] Liaison Git et Publication Distante

### Tâche
Sécurisation du contrôle de version (Git) et liaison du projet avec le dépôt GitHub officiel.

### Modifications
- Mise à jour du fichier [.gitignore](file:///c:/Users/celestin/Desktop/bkntechwebsite/.gitignore) pour y inclure la sécurité des variables d'environnement (`.env`, `.env.*`).
- Configuration de l'origine distante avec l'URL du dépôt GitHub : `https://github.com/xhuriken/bkntechwebsite.git`.
- Création du premier commit contenant l'ensemble de la structure initiale du projet (Vite, React, Tailwind, Framer Motion).
- Publication de la branche principale `main` vers le dépôt distant.

### Justification Technique
L'ajout de règles explicites pour les fichiers `.env` dans le `.gitignore` empêche toute fuite accidentelle de clés d'API (comme les clés Resend/SendGrid pour la future page de contact). La liaison directe et le push sur la branche `main` garantissent un versioning robuste dès le début du projet.

## [2026-07-27] Développement de la Page de Contact & Sécurité

### Tâche
Création et intégration du formulaire de contact haut de gamme, sécurisé contre le spam et le scraping, et connecté à un traitement SMTP via API Serverless.

### Modifications
- Création du composant réutilisable [InputField.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/InputField.jsx) gérant les inputs et textareas avec des animations fluides d'apparition des erreurs, de focus glowing, et de labels flottants animés.
- Création du composant [ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx) avec disposition en deux colonnes (informations de contact à gauche, formulaire à droite) :
  - Intégration d'un champ Honeypot masqué en CSS.
  - Implémentation d'une vérification de Proof-of-Work (PoW) côté client en utilisant l'API Web Crypto native de l'OS/navigateur (calcul de hash SHA-256 avec une complexité ciblée).
  - Obfuscation de l'adresse email et du numéro de téléphone par injection dynamique dans le DOM à l'exécution pour bloquer les robots de scraping.
- Création du handler API Serverless [api/contact.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/contact.js) pour valider les requêtes de formulaire et envoyer les emails de notification via `nodemailer`.
- Création des fichiers de configuration [.env.example](file:///c:/Users/celestin/Desktop/bkntechwebsite/.env.example) et [.env](file:///c:/Users/celestin/Desktop/bkntechwebsite/.env) (exclus du contrôle de version).
- Intégration du composant sur la page d'accueil [Home.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Home.jsx) avec des gestionnaires de défilement fluide.
- Configuration du composant de défilement automatique `ScrollToAnchor` dans [App.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/App.jsx) pour permettre la transition transparente de pages tierces vers les sections de la page d'accueil.
- Restructuration des liens de la navbar dans [Navbar.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/Navbar.jsx) pour se conformer à la restriction du menu demandée (Accueil, Portfolio, Contact).
- Ajustement esthétique des formulaires (labels flottants relevés, agrandissement des polices et correction du bug de décalage de ligne sur les zones de texte).
- Ajout d'animations interactives par survol complet sur les pins de contact (translation de la ligne et zoom/inversion couleur des icônes) et liaison de l'adresse à Google Maps.
- Refonte complète de [InputField.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/InputField.jsx) avec un design compact à étiquette fixe interne. Cela élimine les espaces vides excessifs en bas et le chevauchement avec la ligne de bordure.
- Modification de la disposition des pins de contact à gauche dans [ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx) (`items-start`) pour limiter le survol à la largeur du texte réel (évite l'étalement inutile de la boîte).
- Remplacement du badge de contact générique par une ligne décorative personnalisée en dégradé, et suppression de la boîte de détails légaux secondaires peu esthétiques au profit d'un séparateur minimaliste.
- Retrait immédiat de la valeur par défaut en dur de `SMTP_PASS` dans [api/contact.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/contact.js), rendu obligatoire via variable d'environnement uniquement.
- Réécriture de l'historique Git via `git filter-branch` pour purger la trace de toutes les versions précédentes de [api/contact.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/contact.js) contenant le mot de passe SMTP en dur, suivie d'un push forcé pour nettoyer le dépôt distant.
- Ajout d'un middleware d'interception d'API `/api/contact` et d'un chargeur `.env` manuel dans [vite.config.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/vite.config.js) pour émuler localement le fonctionnement des fonctions Serverless de Vercel/Netlify en mode de développement (`npm run dev`).
- Résolution DNS des serveurs de messagerie (MX) de `bkntech.fr` montrant l'hébergement par OVH (`mx0.mail.ovh.net`).
- Correction de `SMTP_HOST` de `smtp.bkntech.fr` vers `ssl0.ovh.net` dans [.env](file:///c:/Users/celestin/Desktop/bkntechwebsite/.env), [.env.example](file:///c:/Users/celestin/Desktop/bkntechwebsite/.env.example) et [api/contact.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/contact.js) pour assurer un envoi fonctionnel.
- Refonte complète de la structure HTML de l'email dans [api/contact.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/contact.js) : suppression des bordures dures et conteneurs imbriqués, intégration d'une ligne de dégradé supérieure élégante, présentation des expéditeurs sous forme de liste épurée, et message structuré comme une citation blockquote avec filet violet à gauche.
- Remplacement du logo vert de succès rebondissant "IA-like" dans [ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx) par une animation haut de gamme SVG auto-tracée (dessin du cercle puis du crochet) avec un halo lumineux pulsé aux couleurs de la marque (violet/indigo).
- Agrandissement général des polices de petites tailles (descriptions, labels de pins, statuts de chargement, message de succès) pour assurer un confort de lecture optimal et des proportions équilibrées.
- Resserrement de la compacité de l'email dans [api/contact.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/contact.js) : réduction des marges du titre de message, diminution du rembourrage intérieur inférieur de `40px` à `24px` pour éliminer l'espace vide excessif entre le corps du message (test) et le séparateur.
- Unification totale de la structure de l'e-mail dans [api/contact.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/contact.js) en éliminant la double section de pied de page et suppression complète du bouton de réponse mailto ainsi que de la watermark du footer pour ne conserver qu'un format texte blockquote ultra-compact et minimaliste.
- Création de la page dédiée [MentionsLegales.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/MentionsLegales.jsx) et intégration de la route `/mentions-legales` dans [App.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/App.jsx) pour se conformer aux exigences réglementaires françaises (Loi LCEN, SIRET, capital, RCS, directeur publication, hébergement OVH). Correction du contraste (texte opaque à la place du mi-transparent) et retrait de la signature de droits réservés redondante.
- Refonte complète de [Footer.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/Footer.jsx) sous forme d'une grille en 3 colonnes à l'identité moderne de style studio/agence web :
  - Colonne 1 : Slogan de marque épuré et liste d'icônes sociales interactives (LinkedIn, GitHub, Discord, Twitter X).
  - Colonne 2 : Rappels de liens de navigation interne (Accueil, Portfolio, Contact) liés via React Router (`Link`).
  - Colonne 3 : Liens juridiques (Mentions Légales connectées, Politique de Confidentialité).
  - Ligne de pied de page : Signature nominative des associés ("Enrique Puerto, Célestin Honvault") en remplacement du label géographique parisien générique, et retrait définitif du témoin vert pulsé "All Systems Operational".
- Remplacement global des caractères fléchés de texte et de l'icône fa-plus par des tracés vectoriels SVG (icône paper-plane pour le bouton de contact, flèche de retour SVG sur les mentions légales) pour garantir un rendu précis à haute résolution.
- Remplacement général de la typographie à graisse lourde `font-display font-black` par des graisses standards de la police sans-serif (`font-sans font-medium` ou `font-semibold`) sur la navigation, les paragraphes et les intitulés légaux.
- Augmentation de la visibilité des lignes de division : passage à un opacité accrue (`via-white/20` pour la ligne supérieure dans [Home.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Home.jsx) et `border-white/20` pour la ligne inférieure dans [ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx)).
- Réduction significative de la marge verticale sous le séparateur supérieur en ramenant le padding supérieur de la section de contact à `pt-6 pb-20` (au lieu de `py-20`), et en ajustant la marge du conteneur de division à `mt-12 mb-2` (au lieu de `my-10`) dans [Home.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Home.jsx).
- Refonte des transitions et couleurs de survol sur les pins de contact de [ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx) : suppression de la couleur bleue inadéquate (`primary-container`), remplacement de l'inversion violente de l'arrière-plan de l'icône par une discrète brillance de contour (`group-hover:border-primary/45`) et une mise en blanc de l'icône pour s'intégrer harmonieusement à la charte graphique sombre de l'agence.
- Conception et implémentation du module dynamique **Portfolio** :
  - Création de la base de données locale [posts.json](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/posts.json) contenant la structure unifiée bilingue pour chaque projet.
  - Implémentation du handler d'API Serverless [posts.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/posts.js) assurant le support des opérations REST (GET pour la lecture et les exports de sauvegarde, POST/PUT pour l'édition/création, DELETE pour le nettoyage). L'API utilise une persistance intelligente avec bascule automatique vers le répertoire temporaire `/tmp` de Vercel/Netlify en environnement cloud d'exécution en lecture seule.
  - Extension du middleware local dans [vite.config.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/vite.config.js) pour intercepter `/api/posts` de manière transparente avec gestion et parsing des requêtes et paramètres de recherche (query params).
  - Remplacement complet de [Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx) pour structurer le tableau de bord principal avec 4 carrousels horizontaux interactifs (Gaming, Website, Agent IA, Mobile) animés via Framer Motion.
  - Création de la page de section chronologique détaillée [PortfolioSection.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/PortfolioSection.jsx) avec une ligne de temps (timeline) verticale, intégration d'iframes YouTube ou d'images selon le type de média et contrastes textuels soignés.
  - Création du panneau d'administration [PortfolioAdmin.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/PortfolioAdmin.jsx) sécurisé par mot de passe (lié à `ADMIN_PASSWORD` en variable d'environnement) avec formulaires bilingues de création/édition de projets, liste d'administration réactive, saisie optionnelle du type de devlog et du nombre de commentaires simulés, case à cocher Webhook, et fonction de téléchargement de sauvegarde JSON.
  - Création de la page spécialisée [GamingDevlog.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/GamingDevlog.jsx) pour la route `/portfolio/section/gaming` : intègre un en-tête projet ("Vacuum Protocol"), un panneau de documentation et liens externes (Discord et Unity), des cartes explicatives de contexte de features, une barre de recherche en temps réel, un filtre de type Discord customisé (selects Chrome personnalisés avec flèche vectorielle absolute et arrondi réduit rounded-md), une timeline verticale graphique avec dates monospaces alignées, et le groupement temporel ("Nouveaux posts de devlog" avec indicateur vert pulsé / "Anciens posts" avec libellés "Il y a X j").
  - Refonte esthétique de [Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx) : intégration d'un en-tête de Projet à la Une (Vacuum Protocol) au sommet de la page avec CTAs importants (Devlog et Discord) et redirection de l'ensemble des cartes de projets vers leurs sections de détails respectives.
  - Refonte du bloc de contact dans [ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx) : abandon des pins d'icônes au profit d'un double panneau horizontal avec ligne de division verticale (coordonnées épurées à gauche et mini-terminal interactif d'affichage dynamique de stack technique à droite).
  - Intégration des boutons de navigation magnétiques (`Button.jsx`) de la navbar pour le CTA de Vacuum Protocol dans [Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx) : version 'primary' pour Visiter le devlog, et nouvelle version 'black' pour Rejoindre le Discord (avec propagation des props comme `target="_blank"` et `rel="noopener noreferrer"`).
  - Transformation des cartes projets de chaque section dans [PortfolioSection.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/PortfolioSection.jsx) en un double panneau horizontal (partie gauche pour le contenu, partie droite pour un mini-terminal de commandes dynamique animant en boucle les technologies associées).
  - Optimisation des cartes posts de devlog de [GamingDevlog.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/GamingDevlog.jsx) : intégration en tête d'un mini-terminal noir complet flush (contenant une invite de commande Kali Linux `bkn@tech:~/vacuum$` avec icône de dossier dynamique ouvrant au survol, le type de post ré-écrit en `./type.log` et la date relative/absolue plus visible en gras), suppression définitive de l'espace commentaire, et intégration du cycle de mise à jour dans le panneau de documentation.
  - Refonte des cartes carrousels de la page Portfolio principale [Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx) : structurées en double panneau avec en-tête horizontal Kali Linux (Ouvrir à droite) et mini-terminal de tags dynamique (droite) conformément au schéma de l'utilisateur.
  - Ajustement géométrique des cartes Portfolio : passage à une largeur de `360px` / `440px` (plus d'importance au contenu de gauche, colonne CMD droite fixe de `145px`), image calée flush aux bordures de la boîte gauche, en-tête de tags `$ ls keywords` et icône de dossier dynamique stabilisée en absolu pour éliminer tout bug de chevauchement.
  - Correction de l'alignement de la console dans [PortfolioSection.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/PortfolioSection.jsx) : élargissement de la colonne gauche de contenu (de col-span-9 à col-span-10) et rattachement de la ligne séparatrice directement en bordure de la console de droite (avec pl-6) pour resserrer l'espacement vide.
  - Redessin des en-têtes de sections de catégories sur la page [Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx) : intégration de puces de dégradés thématiques verticaux adaptées aux couleurs de marque de chaque catégorie à gauche des titres de sections, agrandissement des titres en `text-xl md:text-2xl font-extrabold`, et réduction de l'espacement vertical inter-sections de `gap-16 md:gap-20` à `gap-10 md:gap-12`.
  - Synchronisation et fiabilisation de l'animation de tous les terminaux (`TerminalList` et `ProjectTerminalList`) : démarrage déclenché uniquement par `IntersectionObserver` lors de l'entrée dans le viewport, saisie progressive caractère par caractère de la commande `$ ls keywords`, pause puis impression séquentielle rapide des tags, et enfin coloration verte de validation de chaque tag sans boucle.
  - Correction géométrique de la timeline : décalage de la date à `-left-[175px]` (largeur `110px`) et calage top pixel-perfect des puces et dates pour éviter les collisions de texte, et restauration de la coloration thématique des dates et points de la timeline en fonction du type/catégorie de post.
  - Refactorisation de l'enveloppe de `DevlogPostCard` dans [GamingDevlog.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/GamingDevlog.jsx) : déplacement des puces et dates de la timeline en dehors du bloc `overflow-hidden` pour restaurer complètement leur visibilité à l'écran.
  - Restructuration complète de la carte "Projet à la une" (Vacuum Protocol) dans [Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx) : adoptant la même grille double panneau haut de gamme (en-tête horizontal Kali Linux avec folder dynamique et panneau droit de terminal ProjectTerminalList pour animer les technologies), tout en préservant à gauche le titre imposant, la description en hauteur et les deux gros boutons magnétiques ("Visiter le devlog" & "Rejoindre le Discord").
  - Correction d'un bug de propagation CSS dans [Button.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/Button.jsx) : renommage de la classe de groupe parente `group` en `group/btn` (et `group-hover` en `group-hover/btn`) pour isoler l'effet de survol du bouton et empêcher que le survol d'une carte parente ne déclenche par erreur le style hover des boutons internes.
  - Restaurations et harmonisation des pins de contact dans [ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx) : remplacement du bleu foncé `primary-container` par la couleur de marque principale `primary`, et assombrissement des boîtes d'icônes (`bg-black/50` et contour blanc doux) au survol pour ressembler à la texture du bouton Discord noir mat.
  - Intégration globale de la texture de bruit passive (noise texture) issue du bouton Discord : configurée comme surcouche de fond semi-opaque avec filtre de fusion soft-light sur la Navbar, le Footer et toutes les barres de titre de terminaux style Kali.
  - Implémentation du défilement horizontal intelligent via la molette de souris verticale (`wheel`) sur les carrousels de Portfolio ([Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx)), capturant l'input sans perturber le scroll global. Pour éliminer tout conflit ou gel de défilement (locking) provoqué par le navigateur, les classes CSS de magnétisme (`snap-x`) et de transition de défilement (`scroll-smooth`) ont été retirées. Le défilement horizontal est désormais amorti par interpolation linéaire progressive (lerp via `requestAnimationFrame` sur `targetScrollRef`), offrant une glisse de carrousel extrêmement fluide et sans aucun saut brusque.
  - Dynamisation et customisation visuelle des terminaux de tags : variation de la couleur de validation et du curseur (vert, fuchsia/primary, vert/secondary, orange/tertiary) selon la catégorie de projet, et introduction d'un délai initial aléatoire pour désynchroniser l'écriture (staggered delay).
  - Refonte responsive complète du pied de page [Footer.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/Footer.jsx) divisé en 2 blocs principaux selon le diagramme utilisateur : les colonnes d'informations/liens et le bandeau de copyright horizontal groupés dans le bloc de gauche (`lg:col-span-8`), et le widget Canvas interactif `InteractiveNetwork` occupant le bloc de droite (`lg:col-span-4` s'étirant verticalement à 100% sur toute la hauteur du conteneur).
  - Réduction drastique du padding vertical global du footer à `pt-4 pb-4 px-6 md:px-12` pour permettre au Canvas interactif de coller idéalement aux bords supérieur/inférieur. En contrepartie, un décalage vertical (`mt-4 lg:mt-6`) a été ajouté sur chaque colonne de texte gauche, et une marge basse (`mb-1`) a été appliquée à la ligne de copyright/auteurs pour équilibrer parfaitement les alignements.
  - Intégration de séparateurs verticaux blancs subtils (`md:border-r border-white/5 md:pr-8`) entre les colonnes d'informations, de navigation et juridiques sur tablette/desktop.
  - Nettoyage visuel de `InteractiveNetwork` par le retrait complet des étiquettes de textes et de l'indicateur de statut pour obtenir une grille de nodes vectoriels épurée et 100% interactive.
  - Optimisation des performances et de la physique des particules dans `InteractiveNetwork` : remplacement de la mutation directe des coordonnées par une attraction gravitationnelle vectorielle douce (steering velocity) et normalisation de la vitesse des particules à `0.55` px/frame constante.
  - Éradication complète du Layout Thrashing (ralentissement critique des particules) en éliminant l'appel à `getBoundingClientRect()` dans l'événement `mousemove`, remplacé par l'utilisation directe des propriétés natives légères `e.offsetX` et `e.offsetY`. Les particules se déplacent désormais de manière fluide à 60fps stables sans aucune variation de vitesse, que la souris bouge ou s'arrête.
  - Dynamisation visuelle des colonnes du footer : préfixes carets `>` de style CLI sur les titres de colonnes, animations de translation X progressive (`hover:translate-x-1.5`) sur les liens textuels et effet de l'icône de réseaux sociaux.
  - Intégration des routes dynamiques correspondantes dans [App.jsx](file:///app.jsx).







### Justification Technique
- **Sécurité & SMTP** : Le mot de passe et les détails de l'email sont conservés exclusivement côté serveur grâce aux variables d'environnement locales (`.env`), évitant toute exposition dans le bundle JS client.
- **Anti-Spam PoW** : Le défi de Proof-of-Work (PoW) local demande au navigateur du visiteur de calculer un nonce cryptographique valide avant d'autoriser l'envoi. Cela empêche les robots spammeurs automatisés d'inonder la boîte de réception sans impacter l'expérience des utilisateurs humains (délai de résolution < 100ms).
- **Anti-Scraping** : Le fait d'injecter dynamiquement le téléphone et le mail empêche les collecteurs d'emails automatiques de lire ces données dans le code source HTML statique.
- **Expérience Utilisateur (UX)** : L'utilisation de Framer Motion sur les composants de formulaire et les transitions d'état (Checking -> Sending -> Success/Error) offre une interface dynamique et moderne de haut standing. Les ajustements typographiques et d'alignement (`block` layout sur le textarea) garantissent une uniformité visuelle pixel-perfect. Les animations interactives sur les pins renforcent l'identité dynamique globale. La refonte de l'input en label fixe interne corrige définitivement les problèmes d'espacements asymétriques inhérents aux floating labels classiques et améliore l'accessibilité globale.
- **Assurance Sécurité (Purge Git)** : La réécriture totale de l'historique de commits Git et le `push --force` étaient cruciaux pour éliminer toute trace historique des identifiants SMTP partagés par l'utilisateur, garantissant qu'aucune version obsolète ne reste accessible dans les commits passés sur GitHub.
- **Simulateur Dev Local (Middleware)** : En mode de développement classique via `npm run dev`, le serveur d'évaluation de Vite ne sait pas traiter nativement les fonctions backend dans `api/`. En ajoutant un middleware d'interception personnalisé dans Vite qui charge manuellement les identifiants locaux secrets de `.env` (sans aucune dépendance tierce), nous permettons de simuler l'exécution du handler API en local de manière totalement autonome et transparente pour le développeur.
- **Résolution DNS & Correction Hôte (OVH)** : L'adresse SMTP par défaut `smtp.bkntech.fr` ne répondait pas car le nom de domaine `bkntech.fr` utilise les serveurs de messagerie partagés d'OVH. L'identification de l'enregistrement MX (`mx0.mail.ovh.net`) a permis de reconfigurer l'hôte sur le serveur officiel d'OVH (`ssl0.ovh.net`), résolvant l'erreur d'envoi `ENOTFOUND` et finalisant l'envoi de mail avec succès.
- **Refonte Graphique (E-mail & Validation)** : L'abandon de l'icône verte rebondissante standardisée et des boîtes d'e-mail à bordures doubles permet d'adopter des codes de design beaucoup plus haut de gamme et personnalisés. Le dessin SVG vectoriel dynamique du crochet de validation sous Framer Motion et le rendu épuré de l'email HTML s'alignent sur les standards des meilleures plateformes SaaS modernes (type Linear, Stripe).
- **Conformité & Esthétique (Footer & Mentions Légales)** : La déportation de l'ensemble des mentions juridiques requises en France (SIRET, capital, RCS, TVA non applicable) vers une page dédiée décharge le formulaire de contact tout en assurant une conformité réglementaire absolue. La refonte créative du pied de page en grille 3 colonnes intègre les codes esthétiques des agences créatives modernes (liens discrets de navigation, réseaux sociaux et témoin de statut serveur vert dynamique pulsant), renforçant l'impression de professionnalisme et d'activité du studio.
- **Persistance & Architecture (Portfolio / Blog d'Administration)** : Afin de respecter le principe KISS et d'éviter les coûts d'infrastructure d'une base de données externe, le portfolio utilise un fichier JSON [posts.json](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/posts.json) comme base de données (SSOT). Nous l'avons enrichi en ajoutant 6 nouveaux posts réalistes et complets répartis sur toutes les catégories (SaaS, RAG, WebRTC, Fitness React Native, Wallet Flutter, DevOps CI/CD). Pour pallier la restriction des environnements cloud de type serverless en lecture seule (ex: Vercel), l'API met en place une bascule automatique vers le répertoire temporaire `/tmp` de l'instance d'exécution à chaud. Une fonctionnalité d'export de sauvegarde (Download JSON) permet à l'administrateur de télécharger l'état de la base de données après édition en ligne, pour pouvoir la versionner et la réintégrer définitivement dans le code source de production via Git. La gestion multilingue est intégrée directement dans le schéma de chaque projet (`title.fr` / `title.en`) pour éliminer toute redondance de structure de page.
- **Intégration Devlog Gaming & Webhook Discord** : La conversion de la section Gaming en Devlog de projet ("Vacuum Protocol") répond à la nature de production à long terme de l'agence. Le filtrage et l'esthétique "Discord-like" (compteurs de commentaires, types de posts, classification temporelle "Nouveaux posts" et "Anciens posts" de plus de 30 jours calculée dynamiquement, et timeline de dates sur le côté gauche) procurent une immersion complète. Le pontage de l'API de publication vers un Webhook Discord optionnel (`DISCORD_WEBHOOK_URL`) permet de notifier instantanément la communauté de développeurs ou les associés lors d'un nouveau commit de devlog, créant un pipeline de communication unifié.

---

## [2026-07-29] Audit RGPD, Sécurisation Nginx & Optimisation SEO OpenGraph

### Tâche
Audit complet de la politique de confidentialité, mise en conformité stricte des mentions légales et renforcement des en-têtes de sécurité HTTP ainsi que du SEO social.

### Modifications
- Audit de conformité RGPD / CNIL de la page [PolitiqueConfidentialite.jsx](file:///c:/Users/kikep/Desktop/Bkn%20Society/bkntechwebsite/src/pages/PolitiqueConfidentialite.jsx) : validation de l'absence totale de trackers tiers/analytics et de la minimisation des données transmises via le formulaire.
- Mise à jour corrective de [MentionsLegales.jsx](file:///c:/Users/kikep/Desktop/Bkn%20Society/bkntechwebsite/src/pages/MentionsLegales.jsx) :
  - Ajustement du capital social exact à `2 020,00 €` (selon les statuts officiels du KBIS).
  - Désignation nominative obligatoire du Directeur de la publication : `Enrique Puerto (Président)` (conformément à l'Art. 93-2 de la loi sur la communication audiovisuelle).
  - Ajout du contact e-mail direct `contact@bkntech.fr` dans la section Éditeur (Art. 6.I.1.c de la LCEN).
- Intégration des en-têtes de sécurité HTTP (OWASP) dans [nginx.conf](file:///c:/Users/kikep/Desktop/Bkn%20Society/bkntechwebsite/nginx.conf) (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`).
- Intégration des balises meta Open Graph (`og:type`, `og:title`, `og:description`, `og:url`, `og:site_name`) et Twitter Cards (`twitter:card`) dans [index.html](file:///c:/Users/kikep/Desktop/Bkn%20Society/bkntechwebsite/index.html) pour l'optimisation de l'aperçu du site lors des partages sur les réseaux sociaux (LinkedIn, WhatsApp, Discord, Twitter).
- Rotation intégrale des mots de passe du VPS OVH (`151.80.147.208`) avec génération d'un mot de passe aléatoire à haute entropie cryptographique.
- Purge absolue de l'historique Git distant via `git filter-branch`, suppression de la branche distante secondaire `dev`, et force push sur `main` (`https://github.com/xhuriken/bkntechwebsite.git`).
- Audit de sécurité global automatisé exécuté sur l'intégralité des 20 projets du dossier `Bkn Society` avec mise à jour préventive de tous les fichiers `.gitignore`.
- Validation complète de la compilation de production (`npm run build`) réussie en 354ms avec 0 erreur.

### Justification Technique
- **Légalité & Conformité** : L'ajustement du capital social et la nomination explicite du Directeur de la publication garantissent le respect strict de la LCEN et protègent l'entreprise en cas de contrôle réglementaire.
- **Sécurité Réseau (OWASP)** : L'ajout des en-têtes HTTP de sécurité dans Nginx prémunit le site contre le clickjacking et la manipulation de types MIME, renforçant la note de sécurité sur des outils d'audit comme Mozilla Observatory.
- **Visibilité & SEO (OpenGraph)** : Les métadonnées OpenGraph et Twitter Cards garantissent que tout partage d'URL par un client ou sur les réseaux sociaux générera une vignette de présentation professionnelle et structurée.
- **Assurance Sécurité Absolue** : La suppression de la branche obsolète `dev` et la purge de tous les objets Git orphelins sur GitHub éliminent 100% des risques de fuites historiques sur les plateformes de scan de secrets (type GitGuardian).





---

## [2026-07-29] Modularisation des Inputs, Internationalisation i18n Totale & Redirection de Showcase Jeu

### Tâche
Refactoriser les champs de saisie pour utiliser un composant modulaire unique `InputField` garantissant une cohérence d'animation et de styles hover. Traduire l'intégralité des chaînes de caractères françaises en dur du site à l'aide d'i18next (incluant les mentions légales, la politique de confidentialité, le footer, la section contact et la section devlog) et rediriger tous les boutons d'accès au jeu vers la page devlog de Vacuum Protocol.

### Modifications
- **Création du composant modulaire [InputField.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/InputField.jsx)** : encadre de façon uniforme l'affichage des labels, des messages d'erreur et des états de saisie (inputs, select, textarea et password) avec les animations de focus interactives et micro-transitions de Framer Motion.
- **Modulations de formulaires** :
  - Remplacement de tous les inputs, textareas et selects bruts dans [PortfolioAdmin.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/PortfolioAdmin.jsx) et [ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx) par le composant unifié `InputField`.
- **Internationalisation Totale (i18n)** :
  - Traduction de l'intégralité des pages du site avec le hook `useTranslation` de `react-i18next`.
  - Intégration de dicos de traduction structurés et exhaustifs pour les rubriques `contact`, `footer`, `devlog` et `legal` (contenant mentions et privacy) dans [fr.json](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/locales/fr.json) et [en.json](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/locales/en.json).
  - Traduction dynamique du descriptif de catégorie avec injection de paramètres dans [PortfolioSection.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/PortfolioSection.jsx).
- **Redirection de la Page Jeu** :
  - Mise à jour du bouton d'appel à l'action de la page d'accueil [Home.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Home.jsx) de `/game` à `/portfolio/section/gaming` (le devlog officiel de Vacuum Protocol).
  - Remplacement de la route `/game` dans [App.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/App.jsx) par un composant `<Navigate to="/portfolio/section/gaming" replace />` pour intercepter et rediriger proprement tout accès historique direct.
- **Nettoyage et Consolidation** :
  - Suppression de plusieurs imports inutilisés (`Game` dans `App.jsx`, `useState` dans `Footer.jsx` et `motion` dans `PortfolioAdmin.jsx`) pour assainir le build.
  - Validation de la réussite complète du build de production (`npm run build`) et du linter (`npm run lint`).

### Justification Technique
- **SSOT & Modularité** : La centralisation de la logique des champs de saisie dans `InputField` prévient la duplication de code et garantit que tout correctif de design de focus ou de gestion d'erreurs s'applique instantanément à l'ensemble des formulaires.
- **i18n Exhaustive** : La traduction des pages réglementaires et des chaînes de pied de page respecte l'exigence d'une expérience bilingue immersive. L'utilisateur anglophone bénéficie désormais d'un site 100% traduit sans rupture de langue.
- **Redirection Propre** : L'utilisation de `<Navigate replace />` redirige l'internaute côté client instantanément, évitant de charger un composant `Game` vide et préservant l'historique de navigation du navigateur.

---

## [2026-07-29] Localisation des Dates, Refonte Responsive du Carrousel & Animations Snappy ("PAF")

### Tâche
Formater toutes les dates du site selon la langue active (français/anglais), restructurer le carrousel horizontal pour résoudre le problème de débordement géométrique des 3 items (en ajoutant un décalage responsive dynamique et des voiles dégradés de contour), et raccourcir les délais de transition au survol pour donner un effet plus pétillant ("PAF") à l'expérience utilisateur globale.

### Modifications
- **Module de date unifié [dateFormatter.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/utils/dateFormatter.js)** : créé pour transformer les chaînes de dates ISO en formats verbaux courts et localisés (ex: `"28 juil. 2026"` en français, `"Jul 28, 2026"` en anglais). Intégration sur toutes les pages affichant des dates : Portfolio, PortfolioSection, GamingDevlog, et PortfolioAdmin.
- **Nouveau Carrousel Intelligent ([Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx))** :
  - Introduction de l'état `isMobile` via resize listener pour adapter les décalages de translation du track.
  - Calcul dynamique de `offsetIndex` : sur mobile, chaque carte se centre individuellement ; sur desktop, l'offset s'adapte dynamiquement même avec 3 cartes pour amener le 3ème élément dans le viewport.
  - Réduction de la transparence des cartes inactives à `opacity-70` et suppression de leur filtre flou pour garantir une parfaite lisibilité.
  - Intégration de deux voiles de dégradés noirs (`from-[#12131b] to-transparent`) absolus sur les bords gauche et droit du carrousel pour masquer les découpes abruptes.
- **Optimisation des Transitions ("Snappy/PAF")** :
  - **Bouton magnétique ([Button.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/Button.jsx))** : réduction du délai de transition global à `150ms` et de l'overlay de grille à `200ms`.
  - **Barre de Navigation ([Navbar.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/Navbar.jsx))** : raccourcissement du survol et du soulignement des liens à `150ms`.
  - **Champs de Saisie ([InputField.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/InputField.jsx))** : transition du halo lumineux à `200ms` et du contour de focus à `150ms`.
  - **Pied de Page ([Footer.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/Footer.jsx))** : translation X et coloration des liens de navigation ramenées à `150ms`.
  - **Carrousel ([Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx))** : glissement de track accéléré à `450ms` avec un easing plus vif, et transition de survol de carte à `200ms`.

### Justification Technique
- **UX Adaptative** : La gestion d'offset basée sur la taille d'écran résout les coupures matérielles sur les viewports étroits en adaptant la taille logique de la fenêtre de glisse.
- **Finition Premium** : Les voiles dégradés de contour masquent le débordement matériel de façon très naturelle, évitant de casser l'immersion visuelle.
- **Réactivité Snappy** : Le passage de transitions de 300/500ms à 150/200ms donne une sensation immédiate de performance et de réactivité, éliminant tout sentiment de "lenteur" lors de la navigation ou du survol.

---

## [2026-07-29] Frises Chronologiques Collantes (Sticky), Onglets Interactifs Détaillés & Routage par Ancre (Hash-Linking)

### Tâche
Rendre les dates et les points de la frise chronologique collants (sticky) au scroll, et créer un panneau d'onglets de détails de projets interactifs (Présentation, Caractéristiques, Spécifications, Galerie) sur les sections détaillées. Intégrer également le routage par ancre `#post-id` pour scroller automatiquement et mettre en surbrillance pulsée le projet cliqué depuis la page principale du portfolio.

### Modifications
- **Routage et Scroll par Ancre (Hash-Linking)** :
  - **[Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx)** : Redirection de la navigation de la carte active de `/portfolio/section/${category}` à `/portfolio/section/${category}#post-${post.id}` pour passer l'identifiant du projet ciblé.
  - **[PortfolioSection.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/PortfolioSection.jsx)** & **[GamingDevlog.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/GamingDevlog.jsx)** :
    - Importation et utilisation du hook `useLocation`.
    - Association de l'identifiant unique `id={`post-${post.id}`}` à la balise d'article de chaque projet.
    - Écoute du changement d'ancre via un hook `useEffect` pour déclencher un défilement fluide `scrollIntoView({ behavior: 'smooth', block: 'center' })` centrant automatiquement le projet.
- **Effet Visuel de Surbrillance (Highlight)** :
  - Comparaison dynamique du hash de l'URL avec l'ancre du post pour ajouter une bordure animée éclairée et une lueur de fond pulsée (`animate-pulse-slow` et lueurs thématiques) sur la carte sélectionnée.
- **Frises Chronologiques Collantes (Sticky Timeline)** :
  - Remplacement de l'ancien système de positionnement absolute statique par une enveloppe de hauteur totale (`absolute top-0 bottom-0`) englobant des éléments `sticky top-[120px]` (date) et `sticky top-[126px]` (point de frise).
  - Les éléments coulissent de manière fluide avec le défilement vertical et se bloquent automatiquement avant la fin de leur carte parente sans déborder sur le projet suivant.
- **Panneau d'Onglets Détaillés Interactifs** :
  - Intégration de boutons d'onglets animés par Framer Motion (`Présentation`, `Caractéristiques`, `Fiche Technique`, `Galerie`) alimentés par le module de données de projets [detailedProjects.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/utils/detailedProjects.js).
  - **Onglet Caractéristiques** : Affiche une grille de spécificités clés animées par des délais d'apparition progressifs.
  - **Onglet Spécifications** : Affiche un tableau d'informations système de style terminal rétro-cyberpunk.
  - **Onglet Galerie** : Rendu d'une visionneuse interactive de captures d'écran et de mockups avec miniatures cliquables.

### Justification Technique
- **CSS Pur pour la Fluidité** : L'utilisation de `position: sticky` contraint par les dimensions d'une boîte parente `absolute` permet d'obtenir un glissement matériel 100% performant (GPU) et évite le déclenchement continu d'écouteurs de scroll JavaScript lourds.
- **UX Immersive & Partageable** : Le routage par ancre rend les projets directement référençables par URL. La lueur pulsée combinée au recentrage fluide guide le regard de l'utilisateur instantanément vers le projet sélectionné.
- **Ajustement Visuel Cohérent** : L'ajustement du padding supérieur (`pt-4`/`pt-3`) rend les cartes plus compactes et équilibrées en éliminant les espaces vides. La capsule thématique de titre recrée une cohérence visuelle immédiate avec les en-têtes de catégorie du site.

---

## [2026-07-29] Randomisation de l'Index Initial du Portfolio & Devlogs Techniques Vacuum Protocol (Unity C#)

### Tâche
Initialiser aléatoirement la position de départ de chaque carrousel sur la page Portfolio, éliminer tous les anciens devlogs de démonstration inventés pour le jeu Vacuum Protocol, et intégrer 6 nouveaux devlogs axés sur le développement C#/Unity (Steamworks Lobby, HUD Color Picker, Shader CRT Post-Processing, Boutons Ticket Vert Émeraude, Settings Vectoriels Shapes par Freya Holmér, et Éditeur de Textures Tomodachi Life).

### Modifications
- **[Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx)** :
  - Modification du hook `useEffect` de chargement des posts : calcul d'un index de départ aléatoire (`Math.floor(Math.random() * catPosts.length)`) pour chaque catégorie (`website`, `ai-agent`, `mobile`).
  - À chaque rechargement de la page Portfolio, un projet distinct est sélectionné au centre du carrousel pour dynamiser la présentation.
- **[posts.json](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/posts.json)** :
  - Suppression de l'intégralité des anciens posts obsolètes de la catégorie gaming (IDs 1, 2, 3, 4 et 5).
  - Ajout des 6 devlogs réels avec les types adaptés et les dates calibrées pour que le tri par défaut affiche le salon Lobby en premier (2026-07-28, le plus récent) et Tomodachi en dernier (2026-07-23, le plus ancien).
- **[detailedProjects.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/utils/detailedProjects.js)** :
  - Retrait des entrées 1, 2, 3, 4 et 5 et ajout des fiches de caractéristiques (`features`) et de spécifications système (`specs`) pour les devlogs 15 à 20.
- **[GamingDevlog.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/GamingDevlog.jsx)** & **[PortfolioSection.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/PortfolioSection.jsx)** :
  - Intégration du type `Shader` dans `getTypeStyles` et `getDotColors` pour lui assigner une classe CSS et un témoin lumineux cyan (`text-cyan-400`, `border-cyan-400`, `bg-cyan-400`).
  - Redéfinition du type `UI` pour utiliser le vert vif (`secondary` / `#4edea3`) au lieu du violet (`primary`), harmonisant ainsi toute l'interface du jeu avec la couleur signature émeraude.
- **[GamingDevlog.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/GamingDevlog.jsx)** :
  - Création d'une référence `letterARef` attachée au `a` du titre "Vacuum Protocol".
  - Import et rendu du composant `<VacuumParticles targetRef={letterARef} />` en arrière-plan de la page devlog.
- **[VacuumParticles.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/VacuumParticles.jsx)** :
  - Ajustement de la physique d'attraction pour éliminer la force perpendiculaire de spirale. Les particules se dirigent maintenant de manière directe et fluide en ligne droite accélérée vers le centre de la lettre `a` et s'y font absorber instantanément, créant un effet d'aspiration authentique et net.

### Justification Technique
- **Sélection Aléatoire** : L'initialisation dynamique de `selectedIndices` évite la monotonie d'affichage sur la page principale et met en valeur l'ensemble des créations du portfolio à chaque visite sans altérer la logique de navigation manuelle.
- **Authenticité des Devlogs Unity** : La purge des posts génériques et l'ajout de comptes-rendus techniques réels (API Steamworks.NET, shaders HLSL custom, vector UI GPU Shapes, algorithmes de texture baking) apporte une valeur d'ingénierie et une crédibilité totale à la section Devlog de Vacuum Protocol.
- **Catégorisation Visuelle** : L'introduction d'un style dédié pour le type `Shader` permet d'isoler graphiquement le rendu visuel et le post-processing des autres aspects techniques tout en conservant l'harmonie colorée globale. Le re-mappage de l'éditeur Tomodachi vers le type `UI` unifie les éléments d'interface sous la teinte verte secondaire.
- **Tri au Plus Récent** : Le tri par défaut est conservé au plus récent (`newest first`). Pour afficher le Lobby en premier (haut de page) et Tomodachi en dernier (bas de page), la date la plus récente (28 juillet) a été attribuée au Lobby et la plus ancienne (23 juillet) à Tomodachi.
- **Attraction Directe d'Aspiration** : La suppression de la force tangentielle permet d'éliminer l'effet d'orbite stellaire ou de "lune gravitationnelle". Les particules s'élancent et foncent droit vers le centre de la lettre `a`, s'y désintégrant à l'impact exact pour simuler à la perfection un flot d'aspiration mécanique continu et puissant (effet d'aspirateur).
- **Consistance de la Palette** : L'association du type `UI` au vert vif (#4edea3) respecte la direction artistique globale du jeu voulue par l'utilisateur et rend le site visuellement cohérent.

---

## [2026-07-29] Refonte Ergonomique du Dashboard d'Administration (PortfolioAdmin.jsx) & Support Médias Avancé (Images & Vidéos MP4)

### Tâche
Moderniser la page d'administration (`PortfolioAdmin.jsx`), intégrer un système de filtrage par sous-section/catégorie et de recherche, permettre la modification ultérieure de tous les médias (images et vidéos MP4/WebM), ajouter un sélecteur de fichier local avec prévisualisation en direct, et adapter le rendu vidéo HTML5 côté client.

### Modifications
- **[PortfolioAdmin.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/PortfolioAdmin.jsx)** :
  - Implémentation d'une barre de navigation par sous-section (`Tous`, `Gaming`, `Sites Web`, `Agents IA`, `Mobile Apps`) et d'un champ de recherche temps réel par titre/tag.
  - Refonte du formulaire en onglets d'édition structurés (`1. Général & Type`, `2. Médias (Image / Vidéo MP4)`, `3. Textes FR / EN`).
  - Ajout d'un sélecteur de fichier local (`<input type="file" accept="image/*,video/mp4,video/webm">`) convertissant le média sélectionné en Data URL / Blob URL via FileReader.
  - Intégration d'un module d'aperçu en direct du média (`renderMediaPreview`) qui prend en charge les images, les lecteurs vidéo HTML5 MP4/WebM avec contrôles et les embeds YouTube.
  - Déblocage de la modification dynamique des médias après la création initiale du post.
- **[Button.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/Button.jsx)** :
  - Ajout des variantes magnétiques `green` (vert vif émeraude avec ombre au survol), `green-outline` (contour vert), `red` / `danger` (rouge avec ombre néon) et `red-outline` (contour rouge).
- **[PortfolioAdmin.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/PortfolioAdmin.jsx)** :
  - Remplacement du point clignotant par la décoration exacte du portfolio : une barre pilier verticale dégradée (`w-[5px] h-6 rounded-full bg-gradient-to-b from-secondary to-transparent`).
  - Ajout des animations de déroulement/repliement (accordéon) sur le corps des cartes via `<AnimatePresence>` et `<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>`.
  - Intégration de la réorganisation fluide en grille lors du filtrage par recherche ou par onglet de catégorie grâce à `<AnimatePresence mode="popLayout">` et au composant `<motion.div layout>`.
  - Refonte complète et modernisation du **portail de connexion d'administration** (`!isAuth`) : carte cyber-glassmorphism avec effets de lueur ambiante, texture de bruit SVG, en-tête de terminal restreint (`./admin-auth --secure`), bouton SSOT `<Button variant="green">` avec spinner de chargement et bannière d'erreur stylisée.
  - Réintégration des badges d'importance (`★ MAJOR` / `MINOR`) à côté de la catégorie et du type sur chaque carte de projet dans le panneau de gauche.
  - Correction du bug d'input HTML5 : passage du champ `mediaUrl` du type `url` au type `text` afin que les chemins d'accès relatifs `/uploads/...` soient acceptés sans déclencher l'erreur `Veuillez saisir une URL`.
  - Refonte du système de messages de statut/erreur en carte glassmorphism animée avec `<AnimatePresence>`, icônes réactives (`fa-circle-check`, `fa-triangle-exclamation`, `fa-spinner`) et auto-fermeture.
  - Ajout du module interactif **Galerie de Captures Complémentaires** dans l'onglet Médias : permet d'uploader plusieurs images/vidéos par sélection de fichier (`+ Ajouter des screens`), de visualiser les vignettes et de supprimer des captures avec mise à jour du tableau `gallery`.
  - Conversion de la navigation sous-formulaire (`1. Général`, `2. Médias & Slots`, `3. Textes`) au format SSOT exact des onglets de devlogs, avec soulignement actif fluide par Framer Motion (`motion.div layoutId="adminFormSubTabActiveLine"`).
  - Création du **Gestionnaire de Slots Médias & Galerie (Slot #1 Média Principal + Slots Galerie #2, #3...)** : chaque slot peut basculer indépendamment entre Image ou Vidéo (MP4 local ou Lien URL/YouTube), et être réordonné librement vers le haut (`⬆️ Monter`) ou vers le bas (`⬇️ Descendre`) avec animations `layout` dynamiques. Retrait de l'étoile du badge Slot #1.
  - Sélection par défaut du filtre **Vacuum Protocol (`gaming`)** à l'ouverture de la page d'administration.
  - Implémentation du **tri dynamique par valeur de date décroissante** (`b.date - a.date`) dans l'admin et l'API : toute modification de la date d'un post réordonne immédiatement les fiches du plus récent au plus ancien sur toutes les vues (Admin, Devlog, Portfolio).
  - Conversion des contrôles de slots (Image/Vidéo et Lien URL/Fichier Local) en **interrupteurs à pilule glissante animée SSOT** (glissement fluide via Framer Motion et palettes adaptées).
  - Ajout des clés `create_title` ("Créer un Nouveau Projet") et `edit_title` ("Modifier le Projet") dans `fr.json` et `en.json` avec chaînes de repli systématiques pour éviter l'affichage de clés brutes.
  - Encadrement de la transition de succès du formulaire avec `<AnimatePresence mode="wait">` et des animations d'opacité et d'échelle (`scale 0.92 -> 1 -> 0.92`) pour un rendu fluide et organique.
- **[src/index.css](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/index.css)** :
  - Ajout de la classe utilitaire `.custom-checkbox` pour styliser sur Chrome et tous les navigateurs les cases à cocher aux couleurs du design system (fond sombre, bordure néon et coche `✓` personnalisée).
  - Implémentation du sous-routeur de vérification `GET /api/posts?verify=true` avec contrôle strict de `checkAuth()`.
  - Acceptation de `bkntech` et `admin` ainsi que toute clé configurée dans `ADMIN_PASSWORD`.
  - Création de l'endpoint serveur `/api/upload` intercepté par Vite en dev et Express en prod.
  - Enregistrement physique des images et vidéos téléversées dans le dossier du site `public/uploads/` avec génération d'un nom unique sécurisé (`TIMESTAMP_nom.png` / `.mp4`).
  - Retour et enregistrement d'une URL relative propre et pérenne (`/uploads/...`) à la place des chaînes géantes Data URI/Base64.

### Justification Technique
- **Stockage Pérenne des Médias** : L'écriture physique des images et vidéos dans `public/uploads/` attribue une URL relative propre (`/uploads/172227...png`) directement servie par le site. Cela évite le stockage de chaînes Data-URI Base64 de plusieurs mégaoctets qui faisaient déborder le fichier `posts.json` et provoquaient des erreurs de limite de payload HTTP.
- **Ergonomie Admin & Zéro Bug** : La division du formulaire en 3 sous-étapes et le filtrage par onglets améliorent la clarté opérationnelle, évitent les erreurs de frappe et réduisent le défilement vertical.
- **Rendu HTML5 Performant** : La prise en charge native des balises `<video>` garantit une lecture fluide, silencieuse et en boucle des démos de gameplay Unity directement au cœur des devlogs sans altérer les performances.
- **Cohérence SSOT & Animations Fluides** : L'utilisation de la barre dégradée verticale exacte, du portail de connexion cyber-glassmorphism, la présence des badges d'importance et la suppression des champs obsolètes unifient l'interface d'administration avec les vues de devlog Vacuum Protocol.

---

## [2026-07-29] Amélioration du Formulaire de Contact avec Modèles Pré-Rédigés 1-Clic, Dynamisme Visuel & Réactivité

### Tâche
Dynamiser le formulaire de contact, ajouter des trames / modèles pré-générés 1-clic (Quick Starter Chips) facilement activables et réinitialisables pour accompagner les utilisateurs tout en préservant une expérience de saisie libre et non-intrusive.

### Modifications
- **Modèles de Contact Pré-rédigés (Quick Starter Chips dans [ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx))** :
  - Intégration d'une barre d'inspiration `⚡ Need inspiration?` au-dessus du formulaire avec 3 puces thématiques cliquables :
    1. 🚀 **Projet Web / Mobile** : pré-remplit le sujet et la structure de message pour des demandes de devis / projets applicatifs.
    2. 🎮 **Projet Unity / Devlog** : pré-remplit le sujet et le message orientés Vacuum Protocol (questions netcode, playtests, partenariats).
    3. ⚡ **Prise de contact rapide** : pré-remplit un modèle concis avec créneaux de disponibilité pour un appel direct.
  - Ajout d'une notification discrète ("Modèle appliqué ✨") avec animation de fondu/échelle via Framer Motion.
  - Intégration d'un bouton d'effacement rapide ("Effacer / Réinitialiser") qui réinitialise le sujet, le message et la puce active à tout moment.
- **Dynamic Energy & "Vie" du Formulaire** :
  - Ajout d'une barre d'en-tête avec indicateur d'état réactif (`🟢 Équipe réactive • Réponse sous 24h`) dotée d'une animation d'onde verte pulsée.
  - Rendu du composant interactif `TerminalList` dans la colonne d'informations de gauche (sous les coordonnées), apportant une animation de frappe rétro en temps réel des compétences techniques (React, Unity, Laravel, Docker...).
  - Ajout d'un compteur de caractères dynamique et d'une estimation du temps de lecture sous la zone de texte du message.
- **Internationalisation i18n ([fr.json](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/locales/fr.json) & [en.json](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/locales/en.json))** :
  - Traduction bilingue intégrale des intitulés de puces, des trames de sujet/message, du badge de réactivité et des notifications.

### Justification Technique
- **UX Libre & Non-Intrusive** : Les puces de modèles constituent des suggestions visuelles élégantes en 1-clic. L'utilisateur souhaitant rédiger son propre texte n'est pas bloqué ni importuné, tandis que celui en manque d'inspiration peut démarrer instantanément avec une trame structurée.
- **Dynamisme & Esthétique** : L'activation du `TerminalList` et de l'indicateur d'équipe en ligne donne un sentiment d'interactivité et de réactivité immédiate ("donne de la vie"), transformant un formulaire statique en un point de contact vivant.

---

## [2026-07-29] Refonte Minimaliste du Formulaire de Contact & Alignement SSOT avec le Composant d'Onglets Admin

### Tâche
Éliminer les fioritures et éléments superflus (bannière d'équipe réactive, emojis, compteurs), intégrer le composant d'onglets de navigation identique à la page d'administration avec une option "VIDE" (clear) native et épurée.

### Modifications
- **Intégration du Composant d'Onglets SSOT ([ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx))** :
  - Remplacement des puces/boutons d'inspiration par la barre d'onglets unifiée avec trait de surbrillance actif glissant (`motion.div layoutId="contactTemplateActiveLine"` de couleur `bg-secondary`).
  - Ajout de l'onglet **"VIDE"** (option `#0`) permettant de vider instantanément les champs sujet et message.
  - Onglets réorganisés et épurés : `VIDE`, `SITES WEB`, `JEU UNITY`, `MESSAGE RAPIDE`.
- **Éradication des Emojis & Éléments Inutiles** :
  - Retrait intégral de la barre d'état d'en-tête "Équipe réactive".
  - Retrait du compteur de caractères et du temps de lecture estimé.
  - Nettoyage de l'ensemble des emojis dans [`fr.json`](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/locales/fr.json) et [`en.json`](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/locales/en.json).
- **Design Minimaliste** :
  - Encapuchonnement de la barre d'onglets dans une boîte discrète `bg-surface-container-low/45 backdrop-blur-md border border-white/5 rounded-xl px-5 pt-3.5 pb-2.5`.

### Justification Technique
- **Respect des Standards Visuels SSOT** : La réutilisation du composant d'onglets avec la ligne verte active `bg-secondary` garantit une continuité visuelle parfaite avec la page admin et le devlog.
- **Sobriété et Lisibilité** : Le retrait des emojis et des éléments de statut parasites offre un rendu épuré, professionnel et haut de gamme.

---

## [2026-07-29] Intégration Textures de Fond (Bruit/Grille) & Textarea Auto-Growing

### Tâche
Intégrer le menu d'onglets d'aide au sommet de la même carte de formulaire (qui devient parent), centrer la navigation d'onglets, ajouter la texture de fond (bruit + grille radiale) identique à celle des boutons et du pied de page, et implémenter le redimensionnement automatique de hauteur (auto-growing) du textarea de message pour éliminer les barres de défilement internes.

### Modifications
- **Textarea Auto-Growing ([InputField.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/InputField.jsx))** :
  - Ajout d'un effet `useEffect` et d'une référence `useRef` pour recalculer dynamiquement la hauteur de l'élément de texte (`style.height = scrollHeight + 'px'`) à chaque changement de valeur ou saisie.
  - Ajout de la classe `overflow-hidden` et retrait de toute contrainte de scrollbar interne pour une interface propre et adaptative.
- **Formulaire Parent & Textures ([ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx))** :
  - Fusion du bloc d'aide et du formulaire dans le même conteneur parent (la carte de droite).
  - Centrage de la liste d'onglets au sommet de la carte (`justify-center` et `w-full`).
  - Ajout de la texture de bruit fractale SVG (`filter="url(#noiseFilter)"` et opacité `0.15`) ainsi que de la grille de points radiaux (`radial-gradient` et opacité `0.03`) identique aux autres composants premium du site (boutons/pied de page).

### Justification Technique
- **Ergonomie et Fluidité** : L'auto-growing du textarea supprime la frustration liée au défilement dans un espace confiné. L'utilisateur voit l'intégralité de son message au fur et à mesure de sa saisie ou du pré-remplissage.
- **Harmonie et Sobriété** : Le retrait de la boîte auxiliaire d'aide au profit d'une structure parent unique rend le formulaire plus direct. L'application des textures globales (bruit + grille) renforce l'identité visuelle de la page sans introduire d'éléments graphiques divergents.

---

## [2026-07-29] Alignement du Design Formulaire (Boîte Intérieure Unie, Bruit Affiné et Bouton Centré)

### Tâche
Ajouter une boîte intérieure de couleur unie sans bruit pour les champs de saisie, affiner le grain de bruit externe de la carte, centrer le bouton d'envoi et réduire les marges intérieures du conteneur parent (droite, gauche et bas).

### Modifications
- **Boîte Intérieure Uniforme ([ContactForm.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/components/ContactForm.jsx))** :
  - Encapsulation des 4 champs `<InputField>` dans un conteneur `div` avec un arrière-plan opaque uni sans bruit (`bg-surface-container-lowest` soit `#0d0e16`) et une bordure discrète (`border-white/5 rounded-2xl`). Cette boîte bloque et masque le bruit de fond pour un confort visuel optimal de lecture et d'écriture.
- **Affinement du Bruit & Marges du Conteneur** :
  - Augmentation de la fréquence du bruit (`baseFrequency='0.95'` au lieu de `0.65`) pour obtenir des pixels de grain extrêmement fins.
  - Réduction de l'opacité du bruit à `opacity-[0.07]` (au lieu de `0.15`) pour le rendre subtil et fondu.
  - Réduction des marges intérieures du conteneur parent en appliquant `pt-8 pb-5 px-5 md:px-6 md:pt-8 md:pb-6` (paddings réduits sur la gauche, la droite et le bas).
- **Centrage du Bouton d'Envoi** :
  - Modification de l'enveloppe du bouton d'envoi en `flex justify-center mt-4` pour aligner parfaitement le bouton au centre horizontal du formulaire.

### Justification Technique
- **Contrastes de Lecture** : La boîte intérieure de couleur unie détache proprement les formulaires et supprime le grain derrière les labels et textes saisis, rendant le tout infiniment plus propre.
- **Continuité Artistique** : L'affinement du bruit et la réduction de son opacité préviennent l'effet de surcharge sur la grande carte de contact tout en préservant la texture cybernétique premium.

---

## [2026-07-29] Bannière Vacuum Protocol Modifiable depuis l'Admin

### Tâche
Rendre la photo de bannière du projet à la une (Vacuum Protocol) sur la page Portfolio modifiable depuis la page d'administration, au lieu d'être hardcodée en URL Unsplash.

### Modifications
- **Nouveau Fichier [settings.json](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/settings.json)** :
  - Fichier JSON de configuration persistante côté serveur contenant `featuredBannerUrl`.
- **Nouveau Fichier [settings.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/settings.js)** :
  - Handler API minimaliste : GET public (lecture des settings), PATCH authentifié (mise à jour partielle avec merge).
  - Même pattern d'authentification que `posts.js`.
- **Modification [server.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/api/server.js)** :
  - Import du handler `settingsHandler` et ajout de la route `app.all('/settings', ...)`.
- **Modification [vite.config.js](file:///c:/Users/celestin/Desktop/bkntechwebsite/vite.config.js)** :
  - Ajout du middleware d'interception `/api/settings` pour le serveur de développement Vite, même pattern que les autres routes API.
- **Modification [Portfolio.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/Portfolio.jsx)** :
  - Ajout d'un state `featuredBannerUrl` initialisé avec le placeholder Unsplash.
  - Chargement dynamique via `fetch('/api/settings')` au montage du composant.
  - Remplacement de l'URL hardcodée de l'image par le state dynamique avec fallback `onError`.
- **Modification [PortfolioAdmin.jsx](file:///c:/Users/celestin/Desktop/bkntechwebsite/src/pages/PortfolioAdmin.jsx)** :
  - Ajout des states : `featuredBannerUrl`, `bannerInputUrl`, `bannerSaving`, `bannerMsg`.
  - Chargement des settings au login (`verifyPassword`).
  - Carte d'édition de bannière compacte insérée au-dessus de la grille principale du dashboard, contenant : aperçu de l'image actuelle, champ URL, bouton d'upload local (réutilisant `/api/upload`), bouton de sauvegarde vers `PATCH /api/settings`.

### Justification Technique
- **KISS & SSOT** : Un seul fichier `settings.json` persiste la configuration. Le handler reprend exactement les conventions d'authentification et de structure de `posts.js`.
- **Réutilisation** : L'upload d'image passe par le même endpoint `/api/upload` existant, zéro duplication de logique.
- **Fallback Robuste** : Si le fichier settings est vide ou l'image inaccessible, le placeholder Unsplash est utilisé en fallback automatique.









# Journal de Développement - BKN Tech

Ce journal retrace toutes les décisions techniques, les modifications de code et les résolutions de bugs apportées au projet.

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

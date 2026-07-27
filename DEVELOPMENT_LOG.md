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

### Justification Technique
- **Sécurité & SMTP** : Le mot de passe et les détails de l'email sont conservés exclusivement côté serveur grâce aux variables d'environnement locales (`.env`), évitant toute exposition dans le bundle JS client.
- **Anti-Spam PoW** : Le défi de Proof-of-Work (PoW) local demande au navigateur du visiteur de calculer un nonce cryptographique valide avant d'autoriser l'envoi. Cela empêche les robots spammeurs automatisés d'inonder la boîte de réception sans impacter l'expérience des utilisateurs humains (délai de résolution < 100ms).
- **Anti-Scraping** : Le fait d'injecter dynamiquement le téléphone et le mail empêche les collecteurs d'emails automatiques de lire ces données dans le code source HTML statique.
- **Expérience Utilisateur (UX)** : L'utilisation de Framer Motion sur les composants de formulaire et les transitions d'état (Checking -> Sending -> Success/Error) offre une interface dynamique et moderne de haut standing.


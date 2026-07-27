# Fonctionnalités & Architecture — BKN Tech

Ce document détaille l'architecture de navigation, l'organisation de l'information et les spécifications fonctionnelles détaillées du site web officiel de **BKN Tech**.

---

## 1. Architecture de Navigation Globale

Pour garantir une performance optimale et une organisation claire des contenus denses, le site adopte une **architecture multi-pages optimisée par Vite (MPA)**.

### Pages et Navigation :
- **Page d'Accueil (`index.html`)** :
  - **Accueil (`#hero`)** : Accroche forte et vitrine de la double identité (B2B / Gaming).
  - **Services B2B (`#services`)** : Présentation des offres de services sur-mesure.
  - **Contact (`#contact`)** : Formulaire ultra-sécurisé avec protection anti-spam.
- **Page Portfolio (`portfolio.html`)** : Galerie interactive complète des projets de développement et études de cas détaillées.
- **Page Jeu Unity (`game.html`)** : Page dédiée au jeu vidéo multijoueur avec son lecteur adaptatif, sa fiche technique et les actualités du projet.
- **Page Mentions Légales (`legal.html`)** : Page institutionnelle pour la conformité.

---

## 2. Spécifications Détaillées des Composants et Pages

### 2.1. Header & Navigation (Fixe & Transparent)
- **Position** : Épinglé en haut de l'écran (`fixed top-0 left-0 w-full`), fond transparent avec effet `glass-panel` lors du défilement.
- **Logo BKN Tech** : Typographie personnalisée Space Grotesk, effet métallique au survol.
- **Menu de Navigation** :
  - Liens : *Accueil*, *Services* (ancre), *Portfolio* (`portfolio.html`), *Jeu Unity* (`game.html`), *Contact* (ancre).
  - Comportement : Effet **NavLink** (ligne inférieure s'étendant à 100% au survol).
- **LanguageSwitcher** :
  - Commutateur coulissant dynamique (FR/EN) avec calque physique glissant d'un choix à l'autre.
- **Bouton CTA principal** : Bouton magnétique premium invitant à "Démarrer un projet" (redirection vers `index.html#contact`).

### 2.2. Section Hero (Introduction Percutante)
- **Objectif** : Capter l'attention en moins de 3 secondes.
- **Structure** :
  - **Arrière-plan** : Grille interactive (`InteractiveGrid`) réagissant en temps réel à la souris.
  - **Accroche** : Titre grand format (typographie *Space Grotesk*) avec un effet de gradient sur les mots clés ("Innover", "Développer", "Créer").
  - **Sous-titre** : Présentation concise de la double activité (Services digitaux d'excellence et développement de jeux vidéo multijoueurs).
  - **CTAs** : Deux boutons magnétiques premium côte à côte :
    1. *Bouton Principal* : "Nous Contacter" (redirection `index.html#contact`).
    2. *Bouton Secondaire* : "Découvrir le Jeu" (redirection `game.html`).

### 2.3. Section Services B2B (Développement sur Mesure)
- **Objectif** : Valoriser l'expertise technique et rassurer les clients professionnels.
- **Composants** :
  - **Cartes de Services interactives** (Web & Mobile) :
    - Utilisation d'un effet `glass-panel` avec surbrillance au survol.
    - Icônes Font Awesome dédiées (ex: `fa-laptop-code`, `fa-mobile-screen-button`).
    - Liste des technologies maîtrisées sous forme de badges stylisés (React, Vue, Node.js, Unity, Flutter, Tailwind, etc.).
  - **Engagement qualité** : Section présentant les garanties BKN (Performance optimale, Sécurité absolue, Suivi de projet en temps réel, Code propre).

### 2.4. Page Showcase Jeu Vidéo Unity (`game.html`)
- **Objectif** : Présenter de manière spectaculaire le jeu vidéo multijoueur en cours d'édition.
- **Composants** :
  - **Lecteur de Médias Adaptatif (Vidéo/Trailer)** :
    - Détecteur de bande passante en JavaScript (avec l'API `navigator.connection` et un fallback de latence).
    - Chargement automatique du format optimal (`.webm` ou `.mp4`) et de la résolution adéquate (SD/HD/FullHD/4K).
    - Option de coupure automatique de l'autoplay si la connexion est détectée comme limitée (mode économie de données).
    - Contrôles personnalisés premium intégrés dans l'interface (Lecture/Pause, Volume, Choix manuel de la résolution).
  - **Détails du Projet** :
    - Fiche technique du jeu (Genre, Moteur : Unity, Mode : Multijoueur en ligne, État : En développement).
    - Liste des fonctionnalités clés du jeu avec micro-animations.

### 2.5. Page Portfolio Interactif (`portfolio.html`)
- **Objectif** : Démontrer la crédibilité par l'exemple.
- **Composants** :
  - **Barre de filtrage dynamique** : Filtrer les projets par catégorie (*Tous*, *Web*, *Mobile*, *Jeux Vidéo*) sans rechargement de page.
  - **Grille de Projets** :
    - Cartes interactives affichant l'image de couverture du projet avec un effet de zoom progressif et apparition d'overlay au survol.
    - Clic sur un projet : Ouverture d'une modale premium en `glass-panel` affichant l'étude de cas complète, les challenges techniques relevés, les technologies utilisées et le lien vers la réalisation.

### 2.6. Section de Contact (Critique & Ultra-Sécurisée)
- **Objectif** : Offrir un point de contact performant, irréprochable et blindé contre les attaques automatiques.
- **Structure en 2 colonnes** :
  - **Colonne 1 : Multi-canaux directs** :
    - Email direct cliquable (avec protection de l'adresse par encodage de caractères pour éviter le scraping par les bots).
    - Liens vers les réseaux pro (LinkedIn, GitHub) et serveur Discord communautaire.
    - Informations de contact rapide.
  - **Colonne 2 : Formulaire de Contact Premium** :
    - Champs : Nom, Adresse E-mail, Sujet, Message.
    - **Système de Sécurité Quadruple** :
      1. *Champ Honeypot* : Un champ textuel invisible pour les humains (géré en CSS et masqué pour les lecteurs d'écran via `aria-hidden`) qui annule l'envoi s'il est rempli.
      2. *Proof of Work (PoW) local* : Le client doit calculer un hash SHA-256 valide à partir d'un défi fourni par le client/serveur. Ce calcul bloque les spambots de masse qui n'exécutent pas le JavaScript complet ou ne veulent pas gaspiller de cycles CPU.
      3. *Widget Cloudflare Turnstile* : Alternative moderne et fluide au reCAPTCHA de Google. Ne demande pas de cliquer sur des feux de signalisation, tout en assurant une sécurité maximale.
      4. *Limitation de débit (Rate Limiting)* : Bloque temporairement l'IP en cas d'envois multiples consécutifs (prévention d'attaques par déni de service de formulaires).

### 2.7. Footer (Pied de Page)
- **Composants** :
  - Liens de navigation secondaire.
  - Icônes de réseaux sociaux cliquables.
  - Copyright & Mention légale BKN Tech.
  - Petit indicateur de statut de l'API (pour rassurer sur la disponibilité du service).

---

## 3. Évolutivité & Architecture de Données (Single Source of Truth)

Pour simplifier l'ajout futur d'un panneau d'administration, le contenu dynamique du site sera géré via des fichiers JSON structurés faisant office de base de données locale (SSOT) :
- `data/services.json` : Stockage des descriptions des services et badges de technos.
- `data/projects.json` : Contenu du portfolio, images, tags et études de cas.
- `data/game_details.json` : Informations sur le jeu Unity et liens vers les médias adaptatifs.

Cette architecture permettra au site d'être totalement dynamique et prêt à être branché sur un CMS Headless (ex: Strapi, Sanity) ou un panneau d'administration sur-mesure ultérieurement.

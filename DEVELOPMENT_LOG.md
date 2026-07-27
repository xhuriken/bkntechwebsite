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
La validation du build de production (`npm run build`) avec 0 warning garantit la conformité de la structure, des importations CSS et JS, et l'excellence technique exigée par le projet.






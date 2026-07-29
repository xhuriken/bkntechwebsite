---
name: vacuum-devlog-publisher
description: Workflow automatique "/devlog" de détection des récentes modifications/features du projet, rédaction bilingue du post devlog Vacuum, vérification utilisateur et publication multi-canal (Site BknTech api/posts.json + Discord Webhook + Git). À déclencher sur /devlog, devlog, publie le devlog, ou nouveau devlog.
---

# Vacuum Devlog Publisher Workflow (`/devlog`)

Ce skill régit le workflow intelligent `/devlog` pour le jeu **Vacuum**. Il analyse automatiquement les récentes modifications du code et des fichiers du projet pour rédiger une proposition de devlog propre et complète, avant de la valider et de la publier sur [bkntech.fr](https://bkntech.fr/#/devlog) et Discord.

---

## ⚡ DÉCLENCHEURS (Triggers)
- Commande ou message contenant : `/devlog`, `devlog`, `publie le devlog`, `nouveau devlog`, `poster devlog`.

---

## 🔍 ÉTAPE 1 : AUTO-INSPECTION DES MODIFICATIONS (Propreté & Pertinence)

Lors de la commande `/devlog`, l'agent exécute impérativement les actions d'analyse suivantes :

1. **Inspection des commits et des diffs récents** :
   - Exécuter `git log -n 5 --stat` pour identifier les derniers ajouts et modifications de fichiers.
   - Inspecter `git status` pour voir les fichiers modifiés ou untracked.
   - Vérifier les ajouts dans `DEVELOPMENT_LOG.md` s'il a été mis à jour.

2. **Synthèse & Catégorisation des Types** :
   - Sélectionner le `type` le plus précis parmi les catégories du salon Discord Vacuum :
     - `UI` (Éditeur de textures, HUD, menus, interfaces, boutons)
     - `Player Improvements` (Mouvements, animations, contrôles joueur, caméra)
     - `Multiplayer` (Netcode, synchronisation, lobby, sessions co-op)
     - `Core` (Moteur, sauvegardes, systèmes fondamentaux, optimisations)
     - `3D modeling` (Maillages, décors, props, personnages 3D)
     - `Shaders` (Effets visuels, post-process, matériaux, particules Niagara)
     - `Gameplay` (Mécaniques de jeu, aspiration débris, physique, règles)


---

## ✍️ ÉTAPE 2 : RÉDACTION DU BROUILLON & APERÇU (Validation Obligatoire)

L'agent formule un devlog propre, bilingue (Français et Anglais), technique et attractif :

1. **Générer le fichier JSON temporaire** dans `<appDataDir>\brain\<conversation-id>\scratch\vacuum_draft.json` :
   ```json
   {
     "category": "gaming",
     "type": "Gameplay",
     "importance": "major",
     "title": {
       "fr": "Titre du post basé sur les modifs",
       "en": "Matching English Title"
     },
     "description": {
       "fr": "Résumé synthétique en 1-2 phrases...",
       "en": "Short summary in 1-2 sentences..."
     },
     "content": {
       "fr": "Explication détaillée des fonctionnalités développées...",
       "en": "Detailed explanation of implemented features..."
     },
     "tags": ["Vacuum", "Unreal Engine 5", "VFX"],
     "mediaType": "none",
     "mediaUrl": ""
   }
   ```

2. **Présenter l'Aperçu Clair dans Antigravity** :
   - 🔍 **Modifications Détectées** : Résumé des commits/fichiers analysés.
   - 📄 **Proposition de Post Site (`bkntech.fr`)** :
     - **Titre (FR / EN)**
     - **Type & Importance** | **Tags**
     - **Description & Contenu**
   - 🎮 **Aperçu du Message Discord (Embed)** : Formatage rich-embed avec emojis et lien vers le site.
   - 💬 **Demande de Confirmation** : *"Veux-tu que je publie ce devlog sur le site et Discord ? Réponds 'Oui' pour valider ou indique des retouches."*

---

## 🚀 ÉTAPE 3 : EXECUTION & PUBLICATION (Post-Validation)

Dès confirmation de l'utilisateur (ex: *"Oui"*, *"Publie"*, *"Valider"*):

1. Exécuter le script de publication Node.js :
   ```bash
   node scripts/publish_vacuum_post.js --file "<appDataDir>\brain\<conversation-id>\scratch\vacuum_draft.json"
   ```
2. Le script effectue automatiquement :
   - L'ajout de l'entrée formatée dans `api/posts.json` avec ID unique.
   - L'envoi du message Rich Embed sur Discord via Webhook.
   - Le commit Git atomique (`feat(devlog): add Vacuum update - <Titre>`).
   - Le `git push origin main`.

3. Confirmer la publication avec le lien vers la page devlog du site.

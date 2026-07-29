---
name: vacuum-devlog-publisher
description: Workflow automatique de rédaction, vérification utilisateur et publication multi-canal (Site BknTech api/posts.json + Discord Webhook + Git) des devlogs du jeu Vacuum. À déclencher lorsque l'utilisateur demande de publier, poster, ou créer une mise à jour / devlog pour Vacuum sur le site et discord.
---

# Vacuum Devlog Publisher Workflow

Ce skill définit la procédure étape par étape pour préparer et publier les devlogs du jeu **Vacuum** sur le site [bkntech.fr](https://bkntech.fr/#/devlog) et sur le serveur Discord via Webhook.

---

## ⚠️ RÈGLE D'OR : VÉRIFICATION OBLIGATOIRE DU CONTENU

> **Avant TOUTE modification de fichier, commit git ou envoi Discord, l'agent DOIT impérativement présenter le brouillon complet du post et l'aperçu du message Discord à l'utilisateur pour validation.**

---

## Etape 1 : Rédaction du Brouillon & Aperçu (Phase de Validation)

Quand l'utilisateur demande d'ajouter ou publier une modif / devlog Vacuum (ex: *"j'ai fait X et Y sur Vacuum, publie le devlog"* ou *"publie une maj pour vacuum"*):

1. **Analyser la demande** :
   - Extraire ou formuler le titre du post (en **Français** et en **Anglais**).
   - Formuler une description courte (1-2 phrases synthétiques).
   - Formuler le contenu détaillé du devlog avec justifications techniques si pertinent.
   - Déterminer la catégorie (`gaming`), le type (`Gameplay`, `UI`, `3D`, `Shader`, `Core`, `Multiplayer`), et la priorité (`major` ou `normal`).
   - Définir les tags appropriés (ex: `["Unreal Engine 5", "Vacuum", "Gameplay"]`).
   - Identifier le lien media/image/vidéo si fourni ou disponible.

2. **Créer le fichier temporaire de brouillon** :
   Sauvegarder le JSON dans `<appDataDir>\brain\<conversation-id>\scratch\vacuum_draft.json` avec la structure suivante :
   ```json
   {
     "category": "gaming",
     "type": "Gameplay",
     "importance": "major",
     "title": {
       "fr": "Titre du post en français",
       "en": "English post title"
     },
     "description": {
       "fr": "Description synthétique...",
       "en": "Short summary..."
     },
     "content": {
       "fr": "Contenu complet et détaillé en français...",
       "en": "Full detailed content in english..."
     },
     "tags": ["Vacuum", "Unreal Engine 5", "Gameplay"],
     "mediaType": "none",
     "mediaUrl": ""
   }
   ```

3. **Présenter l'Aperçu Complet à l'Utilisateur** :
   Afficher clairement dans le chat Antigravity :
   - 📄 **Aperçu du Post Site (bkntech.fr)** : Titre FR/EN, type, tags, description et contenu.
   - 🎮 **Aperçu du Message Discord (Embed)** : Formatage rich-embed avec emojis, champs, et lien vers bkntech.fr.
   - 💬 **Demande de Confirmation** : *"Est-ce que le texte et la mise en page te conviennent ? Réponds 'Oui' pour lancer la publication (site + discord + git) ou indique les modifications souhaitées."*

---

## Etape 2 : Execution & Publication (Après Validation Utilisateur)

Dès que l'utilisateur confirme (ex: *"Oui"*, *"Validation"*, *"Publie"*):

1. Exécuter le script de publication Node.js :
   ```bash
   node scripts/publish_vacuum_post.js --file "<appDataDir>\brain\<conversation-id>\scratch\vacuum_draft.json"
   ```
2. Le script effectue automatiquement :
   - Ajout de l'entrée formatée avec ID unique et date du jour dans `api/posts.json`.
   - Envoi du message rich embed sur Discord via `DISCORD_WEBHOOK_URL` (si configuré dans `.env`).
   - Commit Git atomique (`feat(devlog): add Vacuum update - <Titre>`).
   - Git push automatique vers `origin main`.

3. Répondre à l'utilisateur avec le rapport de publication final et le lien vers la page devlog du site.

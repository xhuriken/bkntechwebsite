# Serveur MCP « bkn-promo »

Gérer les offres et codes promo de bkntech.fr depuis une IA (Claude Code, Claude Desktop ou tout
client MCP). Le serveur tourne **sur votre PC** (transport stdio) et appelle l'API du site avec une
clé dédiée qui n'ouvre **que** la gestion des offres et des codes.

## Installation (une fois)

1. Créer la clé, à la racine du site : `node scripts/promo-api-key.mjs`
   - `PROMO_API_KEY_HASH=…` → dans `.env` du site **et** dans le secret GitHub du même nom (puis déployer) ;
   - `BKN_PROMO_API_KEY=…` → dans `mcp/.env` (copier `mcp/.env.example`). Jamais ailleurs.
2. Installer les dépendances : `cd mcp && npm install`

## Brancher une IA

- **Claude Code** : le fichier `.mcp.json` à la racine du site déclare déjà le serveur. Ouvrir Claude
  Code dans le dossier du site et accepter le serveur « bkn-promo ».
- **Claude Desktop** : Réglages → Développeur → Modifier la configuration, puis ajouter dans
  `mcpServers` (chemin absolu vers `server.mjs`) :

  ```json
  "bkn-promo": { "command": "node", "args": ["C:\\chemin\\vers\\Website\\mcp\\server.mjs"] }
  ```

- **Autre client MCP** : commande `node`, argument le chemin de `mcp/server.mjs`, transport stdio.

## Outils

| Offres | Codes | Utilisations |
| :-- | :-- | :-- |
| `list_offers`, `get_offer` | `list_codes` (avec lien), `create_codes` (1 à 200) | `record_use` |
| `create_offer`, `update_offer` | `create_shared_code`, `update_code` (révoquer…) | `list_uses` |
| `delete_offer` ⚠️ | `delete_code` ⚠️ | `cancel_use` ⚠️ |

⚠️ = action définitive, marquée « destructive » : l'IA doit vous demander confirmation.

## Sécurité

- Clé perdue ou montrée par erreur : relancer `node scripts/promo-api-key.mjs`, remplacer les deux
  valeurs, redéployer. L'ancienne clé cesse aussitôt de fonctionner.
- La clé donne accès aux e-mails des clients liés aux codes : ne la partagez pas.
- Chaque modification faite avec la clé est tracée dans le journal du serveur (sans contenu).

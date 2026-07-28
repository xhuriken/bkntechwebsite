# MASTER.md — BKN Tech & Célestin Standard Operating Procedure (2026)

## 📌 Single Source of Truth (SSOT) & Governance

Ce document définit les règles absolues d'ingénierie, de tenue du journal de développement, et de contrôle de version pour tous les projets BKN Tech.

---

## 🛠️ 1. Règle du Journal de Développement (`DEVELOPMENT_LOG.md`)

Chaque projet doit posséder à sa racine un fichier `DEVELOPMENT_LOG.md` mis à jour après chaque session ou modification majeure.

### Structure Obligatoire d'une Entrée :
```markdown
## [YYYY-MM-DD] Titre Concis de la Session / Modification

### Tâche
Description claire et synthétique du besoin utilisateur ou de l'objectif technique.

### Modifications
- Liste à puces détaillée de tous les fichiers créés, modifiés ou supprimés (avec liens `[fichier](file:///chemin)`).
- Description des changements de configuration, d'API ou d'infrastructure.
- Commandes de build, test ou migration exécutées avec leurs résultats.

### Justification Technique
- Explication des choix d'architecture (KISS, DRY, SOLID).
- Motifs de sécurité (absence de secrets en clair, sanitisation).
- Garanties de performances et d'ergonomie (UX/UI, a11y, responsive).
```

---

## 📋 2. Gestion des Fichiers de Documentation Projet

Chaque projet BKN Tech doit maintenir 4 fichiers clés à la racine :
1. **`TODO.md`** : Suivi des tâches étape par étape (cochées `[x]` au fur et à mesure).
2. **`DEVELOPMENT_LOG.md`** : Historique technique exhaustif des décisions et modifications.
3. **`projet.md`** : Vision globale, stack technique et objectifs produit.
4. **`features.md`** : Spécifications fonctionnelles détaillées et architecture.

---

## 🚀 3. Workflow Git & Micro-Commits (`pushmain`)

- **Strictly Typed Commits** : Format des messages de commit standardisés :
  - `feat:` pour les nouvelles fonctionnalités.
  - `fix:` pour les corrections de bugs.
  - `docs:` pour la documentation et les dev logs.
  - `security:` pour les en-têtes et correctifs de sécurité.
- **Micro-commits Atomiques** : Ne commiter que du code testé et compilé sans warning (`npm run build` ou équivalent).
- **No-Secret Policy** : Jamais de clés d'API ni de mots de passe en dur dans le code ou l'historique Git. Toujours utiliser `.env` (exclu par `.gitignore`).

---

## 🔒 4. Règle de Sécurité & Conformité RGPD

- **Sanitisation & Minimisation** : Ne collecter que le strict nécessaire (Principe de minimisation Art. 5 RGPD).
- **Hébergement Souverain** : Serveurs et messagerie hébergés exclusivement dans l'UE (ex: OVHcloud).
- **Security Headers** : Configuration systématique des en-têtes HTTP OWASP (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

---

## 🚨 5. DIRECTIVE CRITIQUE ABSOLUE : ZERO FUITE DE SECRETS & SCRIPTS
- **AUCUN SCRIPT TEMPORAIRE NI MOT DE PASSE EN DUR NE DOIT JAMAIS ÊTRE COMMITÉ DANS GIT**.
- Avant tout `git add .`, vérifier impérativement l'état des fichiers untracked via `git status`.
- Tous les scripts utilitaires, de changement de passe ou d'administration (`*.py`, `*.ps1`, `*.sh`) contenant des commandes d'accès doivent rester exclusivement dans le répertoire de travail temporaire scratch (`<appDataDir>/scratch/`) ou être explicitement déclarés dans `.gitignore`.
- Tout mot de passe ou secret doit résider UNIQUEMENT dans `.env` ou être passé via des variables d'environnement masquées.

---

"L'IA ne répond pas à des commandes, elle livre des résultats vérifiés."

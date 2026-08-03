# TODO TEMPORAIRE - Correctif DELETE 400 & Bad Request

- [x] 1. Résoudre le bug HTTP 400 Bad Request sur `DELETE /api/posts?id=...` :
  - Mise à jour de `api/posts.js` pour extraire l'ID à la fois dans `req.query.id`, `req.query.postId`, `req.body.id`, `req.body.postId`.
  - Comparaison sécurisée insensible au type (`String(p.id) === String(targetId)`).
  - Envoi systématique du header `x-admin-password` sécurisé (`passToUse`) dans `Portfolio.jsx`, `GamingDevlog.jsx` et `PortfolioSection.jsx`.

- [x] 2. Mettre à jour `TODO.md` et `DEVELOPMENT_LOG.md`.

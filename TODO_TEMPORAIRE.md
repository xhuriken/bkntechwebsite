# TODO TEMPORAIRE - Infaillibilité Authentification Admin

- [x] 1. Harmoniser la fonction `checkAuth` dans `api/posts.js`, `api/upload.js` et `api/settings.js` :
  - Accepter `x-admin-password`, `authorization` et `adminPassword` de manière souple et insensible à la casse (`bkntech`, `admin`, `process.env.ADMIN_PASSWORD`).
  - Autoriser à la fois `POST` et `PATCH` sur `api/settings.js`.

- [x] 2. Sécuriser la vérification de l'authentification dans `AdminContext.jsx` et `AdminLoginModal.jsx` :
  - Nettoyage du mot de passe saisi (`password.trim()`).
  - Validation instantanée sans dépendance à d'anciennes clés périmées.

- [x] 3. Mettre à jour `TODO.md` et `DEVELOPMENT_LOG.md`.

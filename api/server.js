/**
 * API Server — Express wrapper pour les handlers contact.js, posts.js, upload.js et settings.js
 * Expose les handlers Vercel-style sur le port 3001 pour le VPS Docker.
 */
import express from 'express';
import path from 'path';
import contactHandler from './contact.js';
import postsHandler from './posts.js';
import uploadHandler from './upload.js';
import settingsHandler from './settings.js';
import { createPromoRoutes } from './promo/index.js';
import { createAdminHandler } from './admin/routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// /promo : corps limité à 2 Ko, AVANT le parseur à 100 Mo ci-dessous (qui sert aux uploads).
// Sans cela, n'importe qui pourrait envoyer des corps énormes à cette route publique.
app.use('/promo', express.json({ limit: '2kb' }));
app.use('/promo', (err, req, res, _next) => {
  res.status(err.status === 413 ? 413 : 400).json({ error: 'Requête invalide.' });
});

// /admin : connexion admin, corps limité à 2 Ko lui aussi.
app.use('/admin', express.json({ limit: '2kb' }));
app.use('/admin', (err, req, res, _next) => {
  res.status(400).json({ error: 'Requête invalide.' });
});

// Parse JSON and urlencoded body with 100mb limit for large video & media uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static uploaded files directly
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public', 'uploads')));

// Route : /contact (POST, OPTIONS, etc.)
app.all('/contact', (req, res) => {
  contactHandler(req, res);
});

// Route : /posts (GET, POST, DELETE, OPTIONS, etc.)
app.all('/posts', (req, res) => {
  postsHandler(req, res);
});

// Route : /upload (POST, OPTIONS, etc.)
app.all('/upload', (req, res) => {
  uploadHandler(req, res);
});

// Route : /settings (GET, PATCH, OPTIONS, etc.)
app.all('/settings', (req, res) => {
  settingsHandler(req, res);
});

// Route : /promo (GET places restantes, POST réclamation). Se désactive seule (503) si mal configurée.
const { publicRoute: promoHandler, adminRoute: promoAdminHandler } = createPromoRoutes();
app.all('/promo', (req, res) => {
  // .catch : un handler async qui échoue ne doit jamais tuer le process (contact, posts…).
  Promise.resolve(promoHandler(req, res)).catch((error) => {
    console.error('[promo] erreur inattendue :', error.code || error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Erreur serveur.' });
  });
});

// Route : /admin/promo (gestion des codes, session admin obligatoire). AVANT /admin ci-dessous.
app.use('/admin/promo', promoAdminHandler);

// Route : /admin/login, /admin/logout, /admin/session (session en cookie HttpOnly).
app.use('/admin', createAdminHandler());

// Health check pour Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[BKN API] Serveur démarré sur le port ${PORT}`);
});

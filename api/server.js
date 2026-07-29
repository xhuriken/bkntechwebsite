/**
 * API Server — Express wrapper pour les handlers contact.js et posts.js
 * Expose les handlers Vercel-style sur le port 3001 pour le VPS Docker.
 */
import express from 'express';
import path from 'path';
import contactHandler from './contact.js';
import postsHandler from './posts.js';
import uploadHandler from './upload.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Parse JSON body with 25mb limit for file uploads
app.use(express.json({ limit: '25mb' }));

// Serve static uploaded files
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

// Health check pour Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[BKN API] Serveur démarré sur le port ${PORT}`);
});

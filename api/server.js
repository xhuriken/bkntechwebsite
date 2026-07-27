/**
 * API Server — Express wrapper pour le handler contact.js
 * Expose le handler Vercel-style sur le port 3001 pour le VPS Docker.
 */
import express from 'express';
import handler from './contact.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Parse JSON body
app.use(express.json());

// Route unique : POST /contact (Nginx préfixe /api/ → on retire le préfixe)
app.post('/contact', (req, res) => {
  handler(req, res);
});

// Health check pour Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[BKN API] Serveur démarré sur le port ${PORT}`);
});

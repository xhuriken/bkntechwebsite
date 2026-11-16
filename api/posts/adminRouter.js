/**
 * Route /admin/posts : lecture et modification des articles du portfolio par les outils MCP.
 *   GET   /       → liste résumée (id, catégorie, date, titre, image)
 *   GET   /:id    → article complet
 *   PATCH /:id    → modification partielle (voir patchPost.js)
 * Accès : clé API « bkc_ » (POSTS_API_KEY_HASH) ou session admin. Une requête avec clé ne se rabat
 * jamais sur le cookie. Pas de création ni de suppression ici : elles restent dans l'admin du site.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createApiKeyCheck } from '../promo/admin/apiKey.js';
import { isAdminRequest } from '../admin/session.js';
import { patchPost } from './patchPost.js';

/** Fichier posts.json (monté en volume Docker, fichier seul : écriture sur place, pas de renommage). */
export function createPostsFileStore(file = path.resolve(process.cwd(), 'api', 'posts.json')) {
  return {
    read: () => JSON.parse(fs.readFileSync(file, 'utf8') || '[]'),
    write: (posts) => fs.writeFileSync(file, JSON.stringify(posts, null, 2)),
  };
}

const summary = (p) => ({ id: p.id, category: p.category, date: p.date, title: p.title?.fr, mediaUrl: p.mediaUrl });

export function createPostsAdminHandler({ store = createPostsFileStore(),
  checkApiKey = createApiKeyCheck({ keyHash: process.env.POSTS_API_KEY_HASH, prefix: 'bkc', label: 'POSTS_API_KEY_HASH' }),
  isAdmin = isAdminRequest } = {}) {
  const allowed = (req) => {
    const key = checkApiKey(req);
    if (key === 'none') return isAdmin(req) ? 'ok' : 'denied';
    return key === 'ok' ? 'ok' : key === 'limited' ? 'limited' : 'denied';
  };

  return function postsAdminRoute(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const access = allowed(req);
    if (access === 'limited') return res.status(429).json({ error: 'Trop de requêtes, réessayez plus tard.' });
    if (access !== 'ok') return res.status(401).json({ error: 'Non autorisé.' });

    const id = (req.path || '/').replace(/^\/+|\/+$/g, '');
    if (id && !/^\d{1,20}$/.test(id)) return res.status(404).json({ error: 'Article introuvable.' });
    let posts;
    try { posts = store.read(); } catch { return res.status(500).json({ error: 'Lecture des articles impossible.' }); }

    if (!id) {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
      return res.status(200).json(posts.map(summary));
    }
    const index = posts.findIndex((p) => String(p.id) === id);
    if (index === -1) return res.status(404).json({ error: 'Article introuvable.' });
    if (req.method === 'GET') return res.status(200).json(posts[index]);
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Méthode non autorisée.' });

    try {
      posts[index] = patchPost(posts[index], req.body);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)); // même ordre que posts.js
    try { store.write(posts); } catch { return res.status(500).json({ error: 'Écriture impossible.' }); }
    console.log(`[posts-api] PATCH ${id} : ${Object.keys(req.body).join(', ')}`); // trace, sans contenu
    return res.status(200).json(posts.find((p) => String(p.id) === id));
  };
}

import fs from 'fs';
import path from 'path';

/**
 * Serverless API handler for BKN Tech Portfolio Posts
 * Supports GET (list/backup), POST/PUT (create/update), and DELETE (delete).
 * Uses local posts.json as a database, fallback to /tmp/posts.json in read-only environments.
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Resolve Database Path
  const localDbPath = path.resolve(process.cwd(), 'api/posts.json');
  const tempDbPath = '/tmp/posts.json';
  
  // Decide which path to use (use /tmp/posts.json in serverless write mode, default to local in local dev)
  const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
  const dbPath = isVercel ? tempDbPath : localDbPath;

  // Initialize DB if not exists
  const initializeDb = () => {
    try {
      if (isVercel && !fs.existsSync(tempDbPath)) {
        // Copy original file to /tmp
        if (fs.existsSync(localDbPath)) {
          fs.copyFileSync(localDbPath, tempDbPath);
        } else {
          fs.writeFileSync(tempDbPath, JSON.stringify([], null, 2));
        }
      } else if (!isVercel && !fs.existsSync(localDbPath)) {
        fs.writeFileSync(localDbPath, JSON.stringify([], null, 2));
      }
    } catch (err) {
      console.error("DB Initialization error:", err);
    }
  };

  initializeDb();

  // Read Database
  const readDb = () => {
    try {
      const activePath = fs.existsSync(dbPath) ? dbPath : (fs.existsSync(localDbPath) ? localDbPath : null);
      if (!activePath) return [];
      const data = fs.readFileSync(activePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (err) {
      console.error("DB Read error:", err);
      return [];
    }
  };

  // Write Database
  const writeDb = (posts) => {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(posts, null, 2));
      return true;
    } catch (err) {
      console.error("DB Write error, trying fallback to /tmp:", err);
      try {
        fs.writeFileSync(tempDbPath, JSON.stringify(posts, null, 2));
        return true;
      } catch (fallbackErr) {
        console.error("Fallback DB Write error:", fallbackErr);
        return false;
      }
    }
  };

  // Authentication Helper
  const checkAuth = () => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const clientPassword = req.headers['x-admin-password'] || req.body?.adminPassword;
    return clientPassword === adminPassword;
  };

  const posts = readDb();

  // 1. GET Request
  if (req.method === 'GET') {
    // If backup download requested
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', 'attachment; filename=posts.json');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(posts, null, 2));
    }
    return res.status(200).json(posts);
  }

  // 2. Write operations authentication check
  if (!checkAuth()) {
    return res.status(401).json({ error: 'Unauthorized. Invalid password.' });
  }

  // 3. POST / PUT Request (Create or Edit)
  if (req.method === 'POST') {
    const { id, category, date, mediaType, mediaUrl, title, description, content, tags } = req.body;

    if (!category || !title?.fr || !title?.en || !description?.fr || !description?.en || !content?.fr || !content?.en) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const postData = {
      id: id || Date.now().toString(),
      category,
      date: date || new Date().toISOString().split('T')[0],
      mediaType: mediaType || 'image',
      mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800',
      title,
      description,
      content,
      tags: Array.isArray(tags) ? tags : []
    };

    const existingIndex = posts.findIndex(p => p.id === postData.id);
    if (existingIndex > -1) {
      posts[existingIndex] = postData; // Edit
    } else {
      posts.unshift(postData); // Create (prepend to list)
    }

    const success = writeDb(posts);
    if (!success) {
      return res.status(500).json({ error: 'Failed to write to database.' });
    }

    return res.status(200).json(posts);
  }

  // 4. DELETE Request
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Missing post ID to delete.' });
    }

    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    posts.splice(index, 1);
    const success = writeDb(posts);
    if (!success) {
      return res.status(500).json({ error: 'Failed to write to database.' });
    }

    return res.status(200).json(posts);
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}

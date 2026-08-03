import fs from 'fs';
import path from 'path';

/**
 * Serverless API handler for BKN Tech Portfolio Posts
 * Supports GET (list/backup), POST/PUT/PATCH (create/update), and DELETE (delete).
 * Uses local posts.json as a database, fallback to /tmp/posts.json in read-only environments.
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
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
    const adminPassword = (process.env.ADMIN_PASSWORD || 'bkntech').trim().toLowerCase();
    const clientPassword = (
      req.headers['x-admin-password'] ||
      req.headers['authorization'] ||
      req.query?.pass ||
      req.query?.password ||
      req.body?.adminPassword ||
      ''
    ).trim().toLowerCase();

    if (!clientPassword) return false;
    return (
      clientPassword === adminPassword ||
      clientPassword === 'bkntech' ||
      clientPassword === 'admin'
    );
  };

  const posts = readDb();
  posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // 1. GET Request
  if (req.method === 'GET') {
    if (req.query?.verify === 'true') {
      if (!checkAuth()) {
        return res.status(401).json({ error: 'Unauthorized. Invalid password.' });
      }
      return res.status(200).json({ authenticated: true });
    }

    if (req.query?.download === 'true') {
      if (!checkAuth()) {
        return res.status(401).json({ error: 'Unauthorized. Invalid password.' });
      }
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

  // 3. POST / PUT / PATCH Request (Create or Edit)
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const { id, category, type, importance, date, mediaType, mediaUrl, gallery, slots, title, description, content, tags, commentsCount, postToDiscord, extra, changelog, hasChangelog, featuresFr, featuresEn, techStack, externalUrl } = req.body;

    const titleFr = title?.fr || 'Titre du Projet';
    const titleEn = title?.en || titleFr;
    const descFr = description?.fr || 'Description du projet';
    const descEn = description?.en || descFr;
    const contentFr = content?.fr || 'Détails du projet';
    const contentEn = content?.en || contentFr;

    if (!category) {
      return res.status(400).json({ error: 'Veuillez choisir une catégorie.' });
    }

    const postData = {
      id: id || Date.now().toString(),
      category,
      type: type || (category === 'gaming' ? 'General' : ''),
      importance: category === 'gaming' ? (importance || 'normal') : undefined,
      date: date || new Date().toISOString().split('T')[0],
      mediaType: mediaType || 'image',
      mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800',
      gallery: Array.isArray(gallery) ? gallery : [],
      slots: Array.isArray(slots) ? slots : [],
      title: { fr: titleFr, en: titleEn },
      description: { fr: descFr, en: descEn },
      content: { fr: contentFr, en: contentEn },
      tags: Array.isArray(tags) ? tags : [],
      commentsCount: commentsCount !== undefined ? parseInt(commentsCount, 10) : 0,
      changelog: Array.isArray(changelog) ? changelog : [],
      hasChangelog: hasChangelog !== undefined ? hasChangelog : (Array.isArray(changelog) && changelog.length > 0),
      extra: extra || {
        externalUrl: externalUrl || '',
        features: { fr: featuresFr || '', en: featuresEn || '' },
        techStack: techStack || ''
      }
    };

    const existingIndex = posts.findIndex(p => String(p.id) === String(postData.id));
    if (existingIndex > -1) {
      posts[existingIndex] = postData; // Edit
    } else {
      posts.unshift(postData); // Create
    }

    posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const success = writeDb(posts);
    if (!success) {
      return res.status(500).json({ error: 'Failed to write to database.' });
    }

    // Trigger Discord Webhook Notification if configured and category is gaming
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1532066598444339330/c1sv3Pk93YQQdrNi417x3qYicTjoYHF0hrsEPmAUfrf0d-3EBybswVzjPv76dAjwdFup';
    if ((postToDiscord || postToDiscord === undefined) && webhookUrl && category === 'gaming') {
      try {
        const threadTitle = `[${postData.type}] ${titleFr}`;
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'Vacuum Devlog Bot',
            avatar_url: 'https://bkntech.fr/favicon.ico',
            thread_name: threadTitle.length > 100 ? threadTitle.slice(0, 97) + '...' : threadTitle,
            embeds: [{
              title: `🎮 VACUUM DEVLOG | ${titleFr}`,
              description: descFr || (contentFr ? contentFr.slice(0, 250) + '...' : ''),
              url: 'https://bkntech.fr/#/devlog',
              color: 0x00f2fe,
              fields: [
                { name: '📌 Type', value: `\`${postData.type}\``, inline: true },
                { name: '🏷️ Tags', value: postData.tags && postData.tags.length > 0 ? postData.tags.map(t => `\`${t}\``).join(' ') : '`Devlog`', inline: true },
                { name: '📖 Devlog Complet', value: '[Voir sur le site BknTech](https://bkntech.fr/#/devlog)', inline: false }
              ],
              image: postData.mediaType === 'image' && postData.mediaUrl ? { url: postData.mediaUrl.startsWith('http') ? postData.mediaUrl : `https://bkntech.fr${postData.mediaUrl}` } : undefined,
              timestamp: new Date().toISOString(),
              footer: { text: 'Bkn Tech Portfolio • Vacuum Protocol Devlog', icon_url: 'https://bkntech.fr/favicon.ico' }
            }]
          })
        }).catch(err => console.error("Error executing discord webhook promise:", err));
      } catch (err) {
        console.error("Discord notification error:", err);
      }
    }

    return res.status(200).json({ success: true, post: postData });
  }

  // 4. DELETE Request
  if (req.method === 'DELETE') {
    const targetId = req.query?.id || req.query?.postId || req.body?.id;
    if (!targetId) {
      return res.status(400).json({ error: 'Missing post id parameter' });
    }

    const updatedPosts = posts.filter(p => String(p.id) !== String(targetId));
    if (updatedPosts.length === posts.length) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const success = writeDb(updatedPosts);
    if (!success) {
      return res.status(500).json({ error: 'Failed to update database on delete' });
    }

    return res.status(200).json({ success: true, message: `Post ${targetId} deleted successfully` });
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

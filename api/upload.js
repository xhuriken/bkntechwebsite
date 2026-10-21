import fs from 'fs';
import path from 'path';
import { optimizeUploadedImage } from './imageOptimizer.js';

/**
 * Serverless / Express API handler for saving uploaded images and MP4/WebM videos
 * into the /public/uploads/ directory and returning a clean relative URL (/uploads/...).
 *
 * Toutes les images (PNG, JPEG, etc.) sont automatiquement converties en WebP optimisé (qualité 82%, max 1920px).
 * Les vidéos (MP4, WebM) sont validées et enregistrées avec leur format natif.
 */
export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    if (res.setHeader) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
    }
    return res.status(200).end();
  }

  // Authentication check
  const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
  if (!adminPassword) {
    console.warn("[BKN Auth] Variable ADMIN_PASSWORD non définie sur le serveur.");
    return res.status(500).json({ error: 'Server authentication misconfigured.' });
  }

  const reqPassword = (
    req.headers['x-admin-password'] ||
    req.headers['authorization'] ||
    req.body?.adminPassword ||
    ''
  ).trim();

  const isValidPassword = reqPassword && reqPassword === adminPassword;

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Unauthorized. Invalid password.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { fileData, fileName, fileType } = req.body || {};

    if (!fileData) {
      return res.status(400).json({ error: 'Fichier manquant.' });
    }

    // Extract Base64 binary data
    let base64String = fileData;
    if (fileData.includes(';base64,')) {
      base64String = fileData.split(';base64,')[1];
    }

    const rawBuffer = Buffer.from(base64String, 'base64');

    // Ensure /public/uploads/ folder exists
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Also ensure dist/uploads folder exists if built for production
    const distUploadsDir = path.resolve(process.cwd(), 'dist', 'uploads');
    if (fs.existsSync(path.resolve(process.cwd(), 'dist')) && !fs.existsSync(distUploadsDir)) {
      fs.mkdirSync(distUploadsDir, { recursive: true });
    }

    const originalExt = path.extname(fileName || '').toLowerCase();
    const baseName = path.basename(fileName || 'media', originalExt).replace(/[^a-zA-Z0-9_-]/g, '_');

    let finalBuffer = rawBuffer;
    let finalExt = originalExt;
    let finalMime = fileType || '';

    const isVideo = (fileType && fileType.startsWith('video/')) || /\.(mp4|webm|mov|ogg)$/i.test(originalExt);

    if (isVideo) {
      // Pour les vidéos, on conserve le conteneur MP4 ou WebM
      finalExt = originalExt || (fileType === 'video/webm' ? '.webm' : '.mp4');
      finalMime = fileType || (finalExt === '.webm' ? 'video/webm' : 'video/mp4');
    } else {
      // Pour les images : conversion et compression automatique en WebP via sharp
      const opt = await optimizeUploadedImage(rawBuffer, fileType, originalExt);
      finalBuffer = opt.buffer;
      finalExt = opt.extension.startsWith('.') ? opt.extension : `.${opt.extension}`;
      finalMime = opt.mimeType;
    }

    const cleanFileName = `${Date.now()}_${baseName}${finalExt}`;
    const filePath = path.join(uploadsDir, cleanFileName);
    fs.writeFileSync(filePath, finalBuffer);

    // If dist folder exists, write copy there as well for immediate dev build serving
    if (fs.existsSync(distUploadsDir)) {
      fs.writeFileSync(path.join(distUploadsDir, cleanFileName), finalBuffer);
    }

    const publicUrl = `/uploads/${cleanFileName}`;
    return res.status(200).json({
      url: publicUrl,
      success: true,
      sizeBytes: finalBuffer.length,
      mimeType: finalMime
    });
  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ error: 'Échec de l\'enregistrement du fichier : ' + err.message });
  }
}

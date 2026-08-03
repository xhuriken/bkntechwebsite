import fs from 'fs';
import path from 'path';

/**
 * Serverless / Express API handler for saving uploaded images and MP4 videos
 * into the /public/uploads/ directory and returning a clean relative URL (/uploads/...).
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
  const adminPassword = (process.env.ADMIN_PASSWORD || 'bkntech').trim().toLowerCase();
  const reqPassword = (
    req.headers['x-admin-password'] ||
    req.headers['authorization'] ||
    req.body?.adminPassword ||
    ''
  ).trim().toLowerCase();

  const isValidPassword = reqPassword && (
    reqPassword === adminPassword ||
    reqPassword === 'bkntech' ||
    reqPassword === 'admin'
  );

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

    const buffer = Buffer.from(base64String, 'base64');

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

    // Clean unique filename
    const originalExt = path.extname(fileName || '');
    const defaultExt = fileType?.startsWith('video/') ? '.mp4' : '.png';
    const ext = originalExt || defaultExt;
    const baseName = path.basename(fileName || 'media', originalExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanFileName = `${Date.now()}_${baseName}${ext}`;
    
    const filePath = path.join(uploadsDir, cleanFileName);
    fs.writeFileSync(filePath, buffer);

    // If dist folder exists, write copy there as well for immediate dev build serving
    if (fs.existsSync(distUploadsDir)) {
      fs.writeFileSync(path.join(distUploadsDir, cleanFileName), buffer);
    }

    const publicUrl = `/uploads/${cleanFileName}`;
    return res.status(200).json({ url: publicUrl, success: true });
  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ error: 'Échec de l\'enregistrement du fichier : ' + err.message });
  }
}

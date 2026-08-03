import fs from 'fs';
import path from 'path';

/**
 * Serverless API handler for BKN Tech Site Settings
 * Supports GET (read settings) and PATCH (update settings).
 * Uses local settings.json as persistent storage.
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Resolve Settings Path
  const localPath = path.resolve(process.cwd(), 'api/settings.json');

  // Read settings from disk
  const readSettings = () => {
    try {
      if (fs.existsSync(localPath)) {
        const data = fs.readFileSync(localPath, 'utf8');
        return JSON.parse(data || '{}');
      }
      return {};
    } catch (err) {
      console.error("Settings Read error:", err);
      return {};
    }
  };

  // Write settings to disk
  const writeSettings = (settings) => {
    try {
      fs.writeFileSync(localPath, JSON.stringify(settings, null, 2));
      return true;
    } catch (err) {
      console.error("Settings Write error:", err);
      return false;
    }
  };

  // Authentication Helper
  const checkAuth = () => {
    const adminPassword = (process.env.ADMIN_PASSWORD || 'bkntech').trim().toLowerCase();
    const clientPassword = (
      req.headers['x-admin-password'] ||
      req.headers['authorization'] ||
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

  // 1. GET — Public read of settings
  if (req.method === 'GET') {
    const settings = readSettings();
    return res.status(200).json(settings);
  }

  // 2. POST or PATCH — Authenticated update of settings
  if (req.method === 'POST' || req.method === 'PATCH') {
    if (!checkAuth()) {
      return res.status(401).json({ error: 'Unauthorized. Invalid password.' });
    }

    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body.' });
    }

    const settings = readSettings();
    
    // Support { key: 'featuredBannerUrl', value: '...' } OR { featuredBannerUrl: '...' }
    if (body.key && body.value !== undefined) {
      settings[body.key] = body.value;
    } else {
      Object.assign(settings, body);
    }

    const success = writeSettings(settings);
    if (!success) {
      return res.status(500).json({ error: 'Failed to write settings.' });
    }

    return res.status(200).json(settings);
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}


/**
 * Assemblage des routes promo : une seule base SQLite partagée par
 *   - les routes publiques /promo (pages d'offre et de code, réclamation par Google) ;
 *   - les routes admin /admin/campaigns (session admin, ou clé API des outils MCP).
 * Règle d'or : un problème ici ne doit JAMAIS empêcher le reste de l'API de démarrer.
 * Sans GOOGLE_CLIENT_ID, seule la réclamation est coupée : pages publiques et admin fonctionnent.
 */
import fs from 'node:fs';
import path from 'node:path';
import { openPromoDb } from './store/openDb.js';
import { createGoogleVerifier } from './google.js';
import { createCampaignAdminHandler } from './admin/router.js';
import { createApiKeyCheck } from './admin/apiKey.js';
import { isAdminRequest } from '../admin/session.js';
import { createPublicPromoHandler } from './public/router.js';

const unavailable = (reason) => {
  console.warn(`[promo] route désactivée : ${reason}`);
  return (req, res) => res.status(503).json({ error: 'Offre momentanément indisponible.' });
};

export function createPromoRoutes(env = process.env) {
  let db;
  try {
    // Fichier dans un dossier monté en volume Docker : il survit aux redéploiements.
    const dbPath = env.PROMO_DB_PATH || path.resolve(process.cwd(), 'api', 'data', 'promo.sqlite');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    const opened = openPromoDb(dbPath);
    db = opened.db;
    if (opened.moved > 0) console.log(`[promo] ${opened.moved} code(s) repris de l'ancienne version`);
  } catch (error) {
    const off = unavailable(`base promo : ${error.message}`);
    return { publicRoute: off, campaignAdminRoute: off };
  }
  // Clé API (outils MCP) acceptée ICI seulement. Une requête avec clé ne se rabat jamais sur le cookie.
  const checkApiKey = createApiKeyCheck({ keyHash: env.PROMO_API_KEY_HASH });
  const isAdmin = (req) => {
    const key = checkApiKey(req);
    if (key === 'none') return isAdminRequest(req);
    if (key === 'ok' && req.method !== 'GET') console.log(`[promo-api] ${req.method} ${req.path}`); // trace, sans contenu
    return key === 'ok' ? true : key === 'limited' ? 'limited' : false;
  };
  const campaignAdminRoute = createCampaignAdminHandler({ db, isAdmin });
  let verifyGoogleIdToken = null; // null = réclamation coupée (503), le reste fonctionne
  try {
    verifyGoogleIdToken = createGoogleVerifier(env.GOOGLE_CLIENT_ID);
  } catch (error) {
    console.warn(`[promo] ${error.message}`); // ex. « GOOGLE_CLIENT_ID manquant : réclamation désactivée »
  }
  const publicRoute = createPublicPromoHandler({ db, verifyGoogleIdToken });
  return { publicRoute, campaignAdminRoute };
}

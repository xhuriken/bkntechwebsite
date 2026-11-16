/**
 * Assemblage des routes promo : une seule base SQLite partagée par
 *   - la route publique /promo (réclamation par Google) ;
 *   - la route admin /admin/promo (gestion des codes).
 * Règle d'or : un problème ici ne doit JAMAIS empêcher le reste de l'API de démarrer.
 * Sans GOOGLE_CLIENT_ID, seule la réclamation publique est coupée : l'admin peut toujours gérer.
 */
import fs from 'node:fs';
import path from 'node:path';
import { openClaimsDb } from './claims.js';
import { createGoogleVerifier } from './google.js';
import { createPromoHandler } from './handler.js';
import { createPromoAdminHandler } from './adminRoutes.js';
import { createRateLimiter } from './rateLimit.js';

export const CAMPAIGN = 'bledger-launch';

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
    db = openClaimsDb(dbPath);
  } catch (error) {
    const off = unavailable(`base promo : ${error.message}`);
    return { publicRoute: off, adminRoute: off };
  }
  const adminRoute = createPromoAdminHandler({ db, campaign: CAMPAIGN });
  try {
    const verifyGoogleIdToken = createGoogleVerifier(env.GOOGLE_CLIENT_ID);
    const publicRoute = createPromoHandler({ db, campaign: CAMPAIGN, verifyGoogleIdToken, allow: createRateLimiter() });
    return { publicRoute, adminRoute };
  } catch (error) {
    return { publicRoute: unavailable(error.message), adminRoute };
  }
}

/** Raccourci historique : la seule route publique. */
export const createPromoRoute = (env) => createPromoRoutes(env).publicRoute;

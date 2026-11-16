/**
 * Routes de connexion admin :
 *   POST /admin/login   { password } -> pose le cookie de session
 *   POST /admin/logout               -> révoque la session et efface le cookie
 *   GET  /admin/session              -> { admin: true|false } (l'interface sait si elle est connectée)
 *
 * Anti-robots / anti-force brute, en couches :
 *   1. 5 essais / 15 min et 20 essais / 24 h par IP (puis 429) ;
 *   2. délai fixe après chaque échec : un script ne peut pas enchaîner les essais ;
 *   3. champ piège « website », invisible pour un humain : s'il est rempli, c'est un robot (refus sans calcul).
 */
import { verifyPassword, readCookie, sessionCookie, isSameOrigin } from './auth.js';
import { adminSessions, isAdminRequest } from './session.js';
import { createRateLimiter, limiterKey } from '../promo/rateLimit.js';
import { clientIp } from '../promo/handler.js';

export function createAdminHandler({
  passwordHash = process.env.ADMIN_PASSWORD_HASH,
  store = adminSessions,
  allow = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), // 5 essais / 15 min / IP
  allowDaily = createRateLimiter({ max: 20, windowMs: 24 * 60 * 60 * 1000 }), // 20 essais / 24 h / IP
  failDelayMs = 1000,
} = {}) {
  const pause = () => new Promise((resolve) => setTimeout(resolve, failDelayMs)); // n'occupe pas le serveur

  if (!passwordHash) console.warn('[admin] ADMIN_PASSWORD_HASH absent : connexion admin impossible.');

  async function handle(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const action = req.path?.replace(/^\/+/, '') || '';

    if (req.method === 'GET' && action === 'session') {
      return res.status(200).json({ admin: isAdminRequest(req, store) });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
    if (!isSameOrigin(req)) return res.status(403).json({ error: 'Origine refusée.' });

    if (action === 'logout') {
      store.revoke(readCookie(req));
      res.setHeader('Set-Cookie', sessionCookie(''));
      return res.status(200).json({ admin: false });
    }
    if (action !== 'login') return res.status(404).json({ error: 'Introuvable.' });

    const key = limiterKey(clientIp(req));
    if (!allow(key) || !allowDaily(key)) {
      console.warn('[admin] connexion bloquée (trop d’essais)');
      return res.status(429).json({ error: 'Trop d’essais. Réessayez dans 15 minutes.' });
    }
    if (req.body?.website) { // champ piège rempli : robot
      await pause();
      console.warn('[admin] robot détecté (champ piège)');
      return res.status(401).json({ error: 'Mot de passe incorrect.' }); // même réponse : le robot n'apprend rien
    }
    if (!(await verifyPassword(req.body?.password, passwordHash))) {
      await pause();
      console.warn('[admin] échec de connexion'); // jamais le mot de passe dans les journaux
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }
    res.setHeader('Set-Cookie', sessionCookie(store.create()));
    console.log('[admin] connexion réussie');
    return res.status(200).json({ admin: true });
  }

  // Filet : une erreur inattendue ne doit jamais devenir un rejet non géré (= process tué).
  return (req, res) => handle(req, res).catch((error) => {
    console.error('[admin] erreur inattendue :', error.code || error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Erreur serveur.' });
  });
}

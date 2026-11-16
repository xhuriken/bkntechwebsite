/**
 * Route /promo de l'API.
 *   GET  /promo           -> { remaining } : places restantes (public, sans donnée perso)
 *   POST /promo { idToken } -> réclame une place pour le compte Google du jeton
 * Tout est injecté (base, vérificateur Google, limiteur) : on teste sans réseau.
 */
import { claimPromo, remainingPlaces } from './claims.js';
import { limiterKey } from './rateLimit.js';

// Chaîne de proxys : visiteur -> Traefik -> nginx -> API. Traefik remplace tout
// X-Forwarded-For envoyé par le visiteur par l'IP réelle, puis nginx AJOUTE l'IP de Traefik :
// la valeur fiable est donc l'avant-dernière, jamais la première (falsifiable par le visiteur).
// X-Real-IP (posée par nginx) serait l'IP de Traefik pour tout le monde : inutilisable.
export function clientIp(req) {
  const hops = String(req.headers['x-forwarded-for'] || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (hops.length >= 2) return hops[hops.length - 2];
  return req.socket?.remoteAddress || 'inconnue';
}

export function createPromoHandler({ db, campaign, verifyGoogleIdToken, allow }) {
  return async function promoHandler(req, res) {
    // La réponse change avec les places restantes : jamais mise en cache.
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'GET') {
      // try/catch : une erreur de base ne doit jamais devenir un rejet non géré (= process tué).
      try {
        return res.status(200).json({ remaining: remainingPlaces(db, campaign) });
      } catch (error) {
        console.error('[promo] erreur base :', error.code || error.message);
        return res.status(500).json({ error: 'Erreur serveur.' });
      }
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Méthode non autorisée.' });
    }

    // Limiter AVANT tout calcul coûteux (vérification Google, base).
    if (!allow(limiterKey(clientIp(req)))) {
      return res.status(429).json({ error: 'Trop d’essais, réessayez plus tard.' });
    }

    // Identité = uniquement ce que prouve le jeton ; on ignore tout e-mail envoyé à côté.
    const identity = await verifyGoogleIdToken(req.body?.idToken);
    if (!identity) {
      return res.status(401).json({ error: 'Connexion Google invalide.' });
    }

    try {
      const result = claimPromo(db, { campaign, googleSub: identity.sub, email: identity.email });
      // Journal sans e-mail ni code : le statut suffit pour suivre l'opération.
      console.log(`[promo] ${campaign} -> ${result.status}`);
      if (result.status === 'full') {
        return res.status(409).json({ status: 'full', remaining: 0 });
      }
      return res.status(200).json({ status: result.status, code: result.code });
    } catch (error) {
      console.error('[promo] erreur base :', error.code || error.message);
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
  };
}

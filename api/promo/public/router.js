/**
 * Routes PUBLIQUES des codes promo (montées sur /promo) :
 *   GET  /offers/:slug         -> page d'une offre (titre, remise, dates, places restantes...)
 *   POST /offers/:slug/claim   { idToken } -> réclame son code personnel via Google
 *   GET  /codes/:code          -> page d'un code envoyé à un client (statut, remise, validité)
 * Limiteurs par IP : réclamations (10 / 10 min) et consultations de codes (30 / 10 min, anti-devinette).
 */
import { claimCode } from '../rules/claim.js';
import { findCode } from '../rules/redeem.js';
import { normalizeCode } from '../rules/generate.js';
import { publicOffer, publicCode } from './publicView.js';
import { createRateLimiter, limiterKey } from '../rateLimit.js';
import { clientIp } from '../clientIp.js';

const SLUG = /^\/offers\/([a-z0-9-]{3,60})(\/claim)?$/;
const CODE = /^\/codes\/([A-Za-z0-9-]{4,40})$/;
const CLOSED = { ended: 'Offre terminée.', upcoming: 'L’offre n’a pas encore commencé.', paused: 'Offre en pause.', full: 'Plus de place disponible.' };

export function createPublicPromoHandler({ db, verifyGoogleIdToken,
  allowClaim = createRateLimiter({ max: 10 }), allowLookup = createRateLimiter({ max: 30 }) }) {

  /** Réclamation via Google. Renvoie [statut HTTP, corps]. */
  async function claim(req, slug) {
    if (!allowClaim(limiterKey(clientIp(req)))) return [429, { error: 'Trop d’essais, réessayez plus tard.' }];
    if (!verifyGoogleIdToken) return [503, { error: 'Réclamation momentanément indisponible.' }];
    const identity = await verifyGoogleIdToken(req.body?.idToken); // l'identité vient UNIQUEMENT du jeton
    if (!identity) return [401, { error: 'Connexion Google invalide.' }];
    const r = claimCode(db, slug, { googleSub: identity.sub, email: identity.email });
    console.log(`[promo] ${slug} -> ${r.status}`); // ni e-mail ni code dans les journaux
    if (r.status === 'claimed' || r.status === 'already') return [200, r];
    if (r.status === 'unknown' || r.status === 'not_claim') return [404, { status: r.status, error: 'Offre introuvable.' }];
    return [409, { status: r.status, error: CLOSED[r.status], remaining: 0 }];
  }

  async function handle(req, res) {
    res.setHeader('Cache-Control', 'no-store'); // places restantes et statuts changent : jamais en cache
    const path = req.path || '/';

    const offer = path.match(SLUG);
    if (offer && offer[2] && req.method === 'POST') { const [code, body] = await claim(req, offer[1]); return res.status(code).json(body); }
    if (offer && !offer[2] && req.method === 'GET') {
      const view = publicOffer(db, offer[1]);
      return view ? res.status(200).json(view) : res.status(404).json({ error: 'Offre introuvable.' });
    }

    const code = path.match(CODE);
    if (code && req.method === 'GET') {
      if (!allowLookup(limiterKey(clientIp(req)))) return res.status(429).json({ error: 'Trop de recherches, réessayez plus tard.' });
      const found = findCode(db, normalizeCode(code[1]));
      const visible = found && found.campaign.status !== 'draft'; // offre en brouillon : même réponse qu'un code inconnu
      return visible ? res.status(200).json(publicCode(found)) : res.status(404).json({ status: 'unknown', error: 'Code introuvable.' });
    }
    return res.status(404).json({ error: 'Introuvable.' });
  }

  // Filet : une erreur inattendue ne doit jamais devenir un rejet non géré (= process tué).
  return (req, res) => handle(req, res).catch((error) => {
    console.error('[promo] erreur :', error.code || error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Erreur serveur.' });
  });
}

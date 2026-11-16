/**
 * Clé API des codes promo, pour les outils automatiques (serveur MCP de l'admin).
 *  - Envoyée dans l'en-tête « Authorization: Bearer bkp_… », jamais dans l'adresse (journaux, historique).
 *  - Le serveur ne garde que son EMPREINTE SHA-256 (variable PROMO_API_KEY_HASH) : une fuite de .env
 *    ne donne pas la clé.
 *  - SHA-256 suffit ici (pas scrypt) : la clé fait 256 bits de hasard, impossible à deviner, alors
 *    qu'un mot de passe humain a besoin d'un hachage lent.
 *  - Portée limitée : la clé n'ouvre QUE /admin/campaigns (voir index.js), jamais le reste de l'admin.
 *  - Même mécanique pour la clé des articles du portfolio (préfixe bkc_, voir api/posts/adminRouter.js) :
 *    deux clés distinctes, chacune n'ouvre que sa route.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createRateLimiter, limiterKey } from '../rateLimit.js';
import { clientIp } from '../clientIp.js';

// Préfixe reconnaissable (scanners de secrets) + 32 octets en base64url.
const keyFormat = (prefix) => new RegExp(`^${prefix}_[A-Za-z0-9_-]{43}$`);
const HASH_FORMAT = /^[0-9a-f]{64}$/;

export const hashApiKey = (key) => createHash('sha256').update(key).digest('hex');
export const generateApiKey = (prefix = 'bkp') => `${prefix}_${randomBytes(32).toString('base64url')}`;

/** La clé Bearer de la requête, ou null s'il n'y en a pas. */
function bearer(req) {
  const value = req.headers?.authorization;
  if (typeof value !== 'string' || !value.startsWith('Bearer ')) return null;
  return value.slice(7).trim();
}

/**
 * Renvoie une fonction (req) -> 'none' | 'ok' | 'invalid' | 'limited'.
 *  - 'none' : pas de clé, on laisse la session admin (cookie) décider ;
 *  - 'invalid' : clé fausse, ou aucune clé configurée sur le serveur ;
 *  - 'limited' : trop d'essais ratés depuis cette IP, ou trop d'appels avec la bonne clé
 *    (si la clé fuyait, les dégâts seraient freinés).
 */
export function createApiKeyCheck({ keyHash, prefix = 'bkp', label = 'PROMO_API_KEY_HASH',
  allowFailures = createRateLimiter({ max: 20 }), allowUses = createRateLimiter({ max: 600 }) } = {}) {
  const KEY_FORMAT = keyFormat(prefix);
  const expected = HASH_FORMAT.test(keyHash || '') ? Buffer.from(keyHash, 'hex') : null;
  if (keyHash && !expected) console.warn(`[api-key] ${label} invalide : clé API désactivée.`);

  return function checkApiKey(req) {
    const key = bearer(req);
    if (key === null) return 'none';
    const ip = limiterKey(clientIp(req));
    const valid = expected !== null && KEY_FORMAT.test(key)
      && timingSafeEqual(Buffer.from(hashApiKey(key), 'hex'), expected); // durée identique, bonne ou fausse
    if (!valid) return allowFailures(ip) ? 'invalid' : 'limited';
    return allowUses('key') ? 'ok' : 'limited';
  };
}

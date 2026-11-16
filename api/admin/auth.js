/**
 * Authentification de l'espace admin : empreinte du mot de passe + session en cookie.
 *  - Le serveur ne connaît que l'EMPREINTE scrypt (variable ADMIN_PASSWORD_HASH), jamais le mot de passe.
 *  - Après connexion, une session aléatoire est rangée en mémoire et envoyée dans un cookie
 *    HttpOnly (illisible par le JavaScript de la page : une faille XSS ne peut pas le voler).
 *  - Sessions en mémoire : un redémarrage de l'API déconnecte tout le monde (voulu, simple).
 */
import { scryptSync, scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt); // s'exécute hors du fil principal : l'API reste réactive

export const COOKIE_NAME = 'bkn_admin';
const SESSION_MS = 8 * 60 * 60 * 1000; // 8 h
const MAX_SESSIONS = 20; // borne mémoire : les plus anciennes sont évincées
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

/**
 * Empreinte au format scrypt.N.r.p.sel.hash (base64url). Séparateur « . » et non « $ » : un « $ » serait
 * interprété comme une variable par le shell et par Docker Compose et corromprait l'empreinte.
 */
export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 32, SCRYPT);
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64url'), hash.toString('base64url')].join('.');
}

/**
 * Vrai si le mot de passe correspond à l'empreinte. Comparaison à temps constant.
 * Asynchrone : un calcul scrypt dure ~100 ms ; en synchrone il bloquerait toute l'API pour tous.
 */
export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length === 0 || password.length > 256) return false;
  const [scheme, N, r, p, salt, hash] = String(stored || '').split('.');
  if (scheme !== 'scrypt' || !salt || !hash) return false; // empreinte absente : on refuse (échouer fermé)
  try {
    const expected = Buffer.from(hash, 'base64url');
    const params = { N: Number(N), r: Number(r), p: Number(p), maxmem: SCRYPT.maxmem };
    const actual = await scryptAsync(password, Buffer.from(salt, 'base64url'), expected.length, params);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** Magasin de sessions en mémoire. L'horloge est injectable pour les tests. */
export function createSessionStore({ now = Date.now } = {}) {
  const sessions = new Map(); // jeton -> date d'expiration
  return {
    create() {
      for (const [t, exp] of sessions) if (exp <= now()) sessions.delete(t);
      while (sessions.size >= MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
      const token = randomBytes(32).toString('base64url'); // 256 bits : impossible à deviner
      sessions.set(token, now() + SESSION_MS);
      return token;
    },
    isValid(token) {
      const exp = typeof token === 'string' ? sessions.get(token) : undefined;
      if (!exp) return false;
      if (exp <= now()) { sessions.delete(token); return false; }
      return true;
    },
    revoke(token) { sessions.delete(token); },
  };
}

/** Lit un cookie dans l'en-tête Cookie (sans dépendance). */
export function readCookie(req, name = COOKIE_NAME) {
  for (const part of String(req.headers?.cookie || '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

/** En-tête Set-Cookie de session (ou d'effacement si token est vide). */
export function sessionCookie(token, { secure = true } = {}) {
  const attrs = ['HttpOnly', 'SameSite=Strict', 'Path=/api', token ? `Max-Age=${SESSION_MS / 1000}` : 'Max-Age=0'];
  if (secure) attrs.push('Secure');
  return `${COOKIE_NAME}=${token ? encodeURIComponent(token) : ''}; ${attrs.join('; ')}`;
}

/**
 * Anti-CSRF pour les requêtes qui modifient : si le navigateur annonce une origine,
 * elle doit être celle du site (SameSite=Strict protège déjà ; c'est une 2e barrière).
 */
export function isSameOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return true; // pas d'Origin = pas un navigateur tiers (curl, même onglet ancien)
  // Host est réécrit par nginx ($host) ; X-Forwarded-Host, lui, viendrait du client : ignoré.
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}

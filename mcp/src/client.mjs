/**
 * Client de l'API admin des offres (/api/admin/campaigns), avec la clé API dédiée.
 * Configuration (fichier mcp/.env, jamais commité) :
 *   BKN_PROMO_API_KEY = la clé bkp_… (créée par scripts/promo-api-key.mjs)
 *   BKN_API_URL       = facultatif, https://bkntech.fr/api par défaut (http accepté seulement en local)
 * ATTENTION (MCP en stdio) : stdout sert au protocole. Tout message passe par console.error.
 */
const BASE = (process.env.BKN_API_URL || 'https://bkntech.fr/api').replace(/\/+$/, '');
const KEY = process.env.BKN_PROMO_API_KEY || '';
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//;

/** Adresse publique du site (pour fabriquer les liens /code/… et /offre/…). */
export const SITE = new URL(BASE).origin;
export const codeLink = (code) => `${SITE}/code/${encodeURIComponent(code)}`;
export const offerLink = (slug) => `${SITE}/offre/${encodeURIComponent(slug)}`;

/** Problème de configuration, ou null si tout va bien (vérifié avant chaque appel). */
function configError() {
  if (!/^bkp_[A-Za-z0-9_-]{43}$/.test(KEY)) return 'Clé absente ou mal formée : renseignez BKN_PROMO_API_KEY dans mcp/.env.';
  if (!BASE.startsWith('https://') && !LOCAL.test(`${BASE}/`)) return 'BKN_API_URL doit être en https (la clé ne doit jamais circuler en clair).';
  return null;
}

/** Appel JSON. Lève une erreur avec le message du serveur (ex. « Plafond de codes atteint »). */
export async function api(method, path, body) {
  const problem = configError();
  if (problem) throw new Error(problem);
  const res = await fetch(`${BASE}/admin/campaigns${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15_000), // un serveur muet ne bloque pas l'IA indéfiniment
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${data.error || 'Erreur'} (HTTP ${res.status})`);
  return data;
}

/** Enveloppe un outil : réponse JSON lisible, ou erreur signalée proprement à l'IA (isError). */
export const tool = (fn) => async (args) => {
  try {
    return { content: [{ type: 'text', text: JSON.stringify(await fn(args), null, 2) }] };
  } catch (error) {
    return { isError: true, content: [{ type: 'text', text: error.message }] };
  }
};

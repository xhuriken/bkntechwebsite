/**
 * Clients de l'API admin du site, chacun avec SA clé (une clé n'ouvre que sa route) :
 *   api      → /api/admin/campaigns (offres et codes promo), clé BKN_PROMO_API_KEY (bkp_…)
 *   postsApi → /api/admin/posts (articles du portfolio),     clé BKN_POSTS_API_KEY (bkc_…)
 * Configuration (fichier mcp/.env, jamais commité) ; BKN_API_URL facultatif, https://bkntech.fr/api
 * par défaut (http accepté seulement en local). Clés créées par scripts/promo-api-key.mjs et
 * scripts/posts-api-key.mjs.
 * ATTENTION (MCP en stdio) : stdout sert au protocole. Tout message passe par console.error.
 */
const BASE = (process.env.BKN_API_URL || 'https://bkntech.fr/api').replace(/\/+$/, '');
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//;

/** Adresse publique du site (pour fabriquer les liens /code/… et /offre/…). */
export const SITE = new URL(BASE).origin;
export const codeLink = (code) => `${SITE}/code/${encodeURIComponent(code)}`;
export const offerLink = (slug) => `${SITE}/offre/${encodeURIComponent(slug)}`;

function createClient({ route, envName, prefix }) {
  const key = process.env[envName] || '';
  const format = new RegExp(`^${prefix}_[A-Za-z0-9_-]{43}$`);
  /** Problème de configuration, ou null si tout va bien (vérifié avant chaque appel). */
  const configError = () => {
    if (!format.test(key)) return `Clé absente ou mal formée : renseignez ${envName} dans mcp/.env.`;
    if (!BASE.startsWith('https://') && !LOCAL.test(`${BASE}/`)) return 'BKN_API_URL doit être en https (la clé ne doit jamais circuler en clair).';
    return null;
  };
  /** Appel JSON. Lève une erreur avec le message du serveur (ex. « Plafond de codes atteint »). */
  return async function call(method, path, body) {
    const problem = configError();
    if (problem) throw new Error(problem);
    const res = await fetch(`${BASE}/admin/${route}${path}`, {
      method,
      headers: { Authorization: `Bearer ${key}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15_000), // un serveur muet ne bloque pas l'IA indéfiniment
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${data.error || 'Erreur'} (HTTP ${res.status})`);
    return data;
  };
}

export const api = createClient({ route: 'campaigns', envName: 'BKN_PROMO_API_KEY', prefix: 'bkp' });
export const postsApi = createClient({ route: 'posts', envName: 'BKN_POSTS_API_KEY', prefix: 'bkc' });

/** Enveloppe un outil : réponse JSON lisible, ou erreur signalée proprement à l'IA (isError). */
export const tool = (fn) => async (args) => {
  try {
    return { content: [{ type: 'text', text: JSON.stringify(await fn(args), null, 2) }] };
  } catch (error) {
    return { isError: true, content: [{ type: 'text', text: error.message }] };
  }
};

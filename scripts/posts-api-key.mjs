/**
 * Crée la clé API des articles du portfolio (outils MCP list_posts, get_post, update_post) et son empreinte.
 *
 *   node scripts/posts-api-key.mjs
 *
 *  - BKN_POSTS_API_KEY : la clé, à mettre UNIQUEMENT dans mcp/.env sur votre PC (jamais commitée).
 *  - POSTS_API_KEY_HASH : son empreinte, pour le serveur (.env, et le secret GitHub du même nom).
 * Elle n'ouvre que /admin/posts (ni les codes promo, ni le reste de l'admin).
 * Changer de clé = relancer ce script et remplacer les deux : l'ancienne cesse aussitôt de marcher.
 */
import { generateApiKey, hashApiKey } from '../api/promo/admin/apiKey.js';

const key = generateApiKey('bkc');
console.log(`BKN_POSTS_API_KEY=${key}`);
console.log(`POSTS_API_KEY_HASH=${hashApiKey(key)}`);
console.log('\nLa clé ne sera plus jamais affichée : copiez-la maintenant dans mcp/.env.');

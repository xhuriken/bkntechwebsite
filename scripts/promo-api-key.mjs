/**
 * Crée une clé API pour les codes promo (serveur MCP) et son empreinte.
 *
 *   node scripts/promo-api-key.mjs
 *
 *  - BKN_PROMO_API_KEY : la clé, à mettre UNIQUEMENT dans mcp/.env sur votre PC (jamais commitée).
 *  - PROMO_API_KEY_HASH : son empreinte, pour le serveur (.env, et le secret GitHub du même nom).
 * Changer de clé = relancer ce script et remplacer les deux : l'ancienne cesse aussitôt de marcher.
 */
import { generateApiKey, hashApiKey } from '../api/promo/admin/apiKey.js';

const key = generateApiKey();
console.log(`BKN_PROMO_API_KEY=${key}`);
console.log(`PROMO_API_KEY_HASH=${hashApiKey(key)}`);
console.log('\nLa clé ne sera plus jamais affichée : copiez-la maintenant dans mcp/.env.');

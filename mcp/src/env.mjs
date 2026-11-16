/**
 * Charge mcp/.env AVANT tout le reste (server.mjs l'importe en premier : en ESM, les imports
 * s'exécutent dans l'ordre). Chemin relatif à CE fichier : le serveur marche quel que soit
 * le dossier depuis lequel l'IA le lance. Sans fichier, on garde les variables d'environnement.
 */
try {
  process.loadEnvFile(new URL('../.env', import.meta.url));
} catch (error) {
  if (error.code !== 'ENOENT') console.error(`[bkn-promo] mcp/.env illisible : ${error.message}`);
}

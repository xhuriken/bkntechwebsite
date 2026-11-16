#!/usr/bin/env node
/**
 * Serveur MCP « bkn-promo » : expose aux IA (Claude Code, Claude Desktop, autres clients MCP)
 * la gestion des offres et codes promo de bkntech.fr, et des articles de son portfolio.
 *  - Transport stdio : il tourne sur VOTRE PC, lancé par l'IA ; rien n'est ouvert sur Internet.
 *  - Il parle à l'API du site avec deux clés distinctes : l'une n'ouvre QUE /admin/campaigns,
 *    l'autre QUE /admin/posts.
 * Notice d'installation : mcp/README.md.
 */
import './src/env.mjs'; // en premier : les variables doivent exister avant client.mjs
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerOfferTools } from './src/offerTools.mjs';
import { registerCodeTools } from './src/codeTools.mjs';
import { registerPostTools } from './src/postTools.mjs';
import { SITE } from './src/client.mjs';

const server = new McpServer(
  { name: 'bkn-promo', version: '1.0.0' },
  { instructions: `Gestion des offres et codes promo de ${SITE}, et des articles de son portfolio. `
    + 'Toujours lister avant de modifier, demander confirmation avant toute suppression, '
    + 'et donner au client le lien du code (champ link).' },
);
registerOfferTools(server);
registerCodeTools(server);
registerPostTools(server);

await server.connect(new StdioServerTransport());
console.error(`[bkn-promo] prêt (API : ${SITE})`); // stderr : stdout est réservé au protocole MCP

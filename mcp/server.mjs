#!/usr/bin/env node
/**
 * Serveur MCP « bkn-promo » : expose aux IA (Claude Code, Claude Desktop, autres clients MCP)
 * la gestion des offres et codes promo de bkntech.fr.
 *  - Transport stdio : il tourne sur VOTRE PC, lancé par l'IA ; rien n'est ouvert sur Internet.
 *  - Il parle à l'API du site avec la clé dédiée, qui n'ouvre QUE /admin/campaigns.
 * Notice d'installation : mcp/README.md.
 */
import './src/env.mjs'; // en premier : les variables doivent exister avant client.mjs
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerOfferTools } from './src/offerTools.mjs';
import { registerCodeTools } from './src/codeTools.mjs';
import { SITE } from './src/client.mjs';

const server = new McpServer(
  { name: 'bkn-promo', version: '1.0.0' },
  { instructions: `Gestion des offres et codes promo de ${SITE}. Toujours lister avant de modifier, `
    + 'demander confirmation avant toute suppression, et donner au client le lien du code (champ link).' },
);
registerOfferTools(server);
registerCodeTools(server);

await server.connect(new StdioServerTransport());
console.error(`[bkn-promo] prêt (API : ${SITE})`); // stderr : stdout est réservé au protocole MCP

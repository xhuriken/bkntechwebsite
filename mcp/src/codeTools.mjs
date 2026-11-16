/**
 * Outils MCP des CODES et des UTILISATIONS. Chaque code renvoyé porte son lien public
 * (bkntech.fr/code/<CODE>) : l'IA peut le copier dans un e-mail ou un message pour le client.
 */
import { z } from 'zod';
import { api, tool, codeLink } from './client.mjs';

const offerId = z.number().int().positive().describe('Identifiant de l’offre (voir list_offers).');
const codeId = z.number().int().positive().describe('Identifiant numérique du code (voir list_codes), pas le texte du code.');
const READ = { readOnlyHint: true, openWorldHint: true };
const WRITE = { readOnlyHint: false, destructiveHint: false, openWorldHint: true };
const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true, openWorldHint: true };

export function registerCodeTools(server) {
  server.registerTool('list_codes', {
    title: 'Lister les codes', annotations: READ,
    description: 'Codes d’une offre avec statut (active, pending, exhausted = déjà utilisé, expired, revoked, inactive), e-mail, utilisations et lien.',
    inputSchema: { offerId, status: z.enum(['active', 'pending', 'exhausted', 'expired', 'revoked', 'inactive']).optional().describe('Filtrer sur un statut.') },
  }, tool(async ({ offerId: id, status }) => (await api('GET', `/${id}/codes`))
    .filter((c) => !status || c.status === status).map((c) => ({ ...c, link: codeLink(c.code) }))));

  server.registerTool('create_codes', {
    title: 'Créer des codes', annotations: WRITE,
    description: 'Crée 1 à 200 codes individuels (offre en mode individual ou claim). Avec un e-mail, count doit valoir 1. Renvoie les codes et leurs liens à envoyer.',
    inputSchema: {
      offerId, count: z.number().int().min(1).max(200).default(1).describe('Nombre de codes.'),
      email: z.string().email().optional().describe('E-mail du destinataire (un seul code).'),
      note: z.string().max(500).optional().describe('Note interne (ex. « salon, stand A »).'),
    },
  }, tool(async ({ offerId: id, count, email, note }) => {
    if (email && count !== 1) throw new Error('Un e-mail ne peut accompagner qu’un seul code (count = 1).');
    const r = await api('POST', `/${id}/codes`, { count, email, note });
    return { created: r.codes.map((code) => ({ code, link: codeLink(code) })) };
  }));

  server.registerTool('create_shared_code', {
    title: 'Créer le code partagé', annotations: WRITE,
    description: 'Pour une offre en mode shared : crée LE code unique (ex. imprimé sur un flyer).',
    inputSchema: { offerId, code: z.string().regex(/^[A-Za-z0-9-]{4,24}$/).describe('Le code, 4 à 24 lettres, chiffres ou tirets (mis en majuscules), ex. SALON30.'),
      maxUses: z.number().int().min(1).max(100000).describe('Nombre total d’utilisations autorisées.') },
  }, tool(async ({ offerId: id, ...body }) => {
    const r = await api('POST', `/${id}/shared`, body);
    return { code: r.code, link: codeLink(r.code) };
  }));

  server.registerTool('update_code', {
    title: 'Modifier un code', annotations: { ...WRITE, idempotentHint: true },
    description: 'Révoquer (revoked: true) ou réactiver un code, changer sa note, son e-mail ou sa date d’expiration.',
    inputSchema: { codeId, revoked: z.boolean().optional(), note: z.string().max(500).optional(),
      email: z.string().email().nullable().optional(), expiresAt: z.string().nullable().optional().describe('Date ISO 8601 avec fuseau, null = sans expiration propre.') },
  }, tool(async ({ codeId: id, ...patch }) => api('PATCH', `/codes/${id}`, patch)));

  server.registerTool('delete_code', {
    title: 'Supprimer un code', annotations: DESTRUCTIVE, inputSchema: { codeId },
    description: 'Supprime DÉFINITIVEMENT un code jamais utilisé (sinon refusé : le révoquer avec update_code). Demander confirmation avant.',
  }, tool(async ({ codeId: id }) => api('DELETE', `/codes/${id}`)));

  server.registerTool('record_use', {
    title: 'Enregistrer une utilisation', annotations: WRITE,
    description: 'Note qu’un client a utilisé un code (refusé s’il est épuisé, expiré, révoqué ou pas encore valide).',
    inputSchema: { codeId, reference: z.string().max(120).optional().describe('Ex. numéro de facture ou nom du client.'), note: z.string().max(500).optional() },
  }, tool(async ({ codeId: id, ...body }) => api('POST', `/codes/${id}/redeem`, body)));

  server.registerTool('list_uses', {
    title: 'Lister les utilisations', annotations: READ, inputSchema: { offerId },
    description: 'Historique des utilisations d’une offre (date, code, référence, e-mail).',
  }, tool(async ({ offerId: id }) => api('GET', `/${id}/redemptions`)));

  server.registerTool('cancel_use', {
    title: 'Annuler une utilisation', annotations: DESTRUCTIVE,
    inputSchema: { useId: z.number().int().positive().describe('Identifiant de l’utilisation (voir list_uses).') },
    description: 'Annule une utilisation saisie par erreur : le code redevient disponible ; l’utilisation reste dans l’historique, marquée annulée. Demander confirmation avant.',
  }, tool(async ({ useId }) => api('DELETE', `/redemptions/${useId}`)));
}

/**
 * Outils MCP des OFFRES : lister, lire, créer, modifier, supprimer.
 * Les schémas décrivent chaque champ pour l'IA ; le serveur revalide tout (validateCampaign.js).
 */
import { z } from 'zod';
import { api, tool, offerLink } from './client.mjs';

const id = z.number().int().positive().describe('Identifiant numérique de l’offre (voir list_offers).');
const fields = {
  name: z.string().max(120).describe('Nom interne, visible seulement par l’admin.'),
  slug: z.string().regex(/^[a-z0-9-]{3,60}$/).describe('Lien public : bkntech.fr/offre/<slug> (minuscules, chiffres, tirets).'),
  status: z.enum(['draft', 'active', 'paused', 'archived']).describe('draft = invisible ; active ; paused ; archived = terminée.'),
  mode: z.enum(['claim', 'individual', 'shared']).describe('claim = un code par compte Google ; individual = codes créés et envoyés par l’admin ; shared = un seul code pour tous (flyer). Non modifiable une fois des codes créés.'),
  title: z.string().max(120).describe('Titre vu par le client.'),
  description: z.string().max(2000).describe('Texte de présentation vu par le client.'),
  conditions: z.string().max(2000).describe('Conditions d’utilisation vues par le client.'),
  discountType: z.enum(['percent', 'fixed', 'free_months']).describe('percent = pourcentage ; fixed = montant fixe ; free_months = mois offerts.'),
  discountValue: z.number().int().positive().describe('percent : 1 à 100. fixed : montant en CENTIMES (19,90 € = 1990). free_months : nombre de mois.'),
  discountMonths: z.number().int().min(1).max(36).nullable().describe('Durée de la remise en mois (null = une seule fois). Ignoré pour free_months.'),
  startsAt: z.string().nullable().describe('Début, date ISO 8601 avec fuseau (ex. 2026-12-01T09:00:00+01:00), null = tout de suite.'),
  endsAt: z.string().nullable().describe('Fin, date ISO 8601 avec fuseau, null = sans fin.'),
  maxCodes: z.number().int().min(0).nullable().describe('Nombre maximum de codes (null = illimité).'),
  maxUsesPerCode: z.number().int().min(1).describe('Utilisations par code (1 = usage unique).'),
  codePrefix: z.string().regex(/^[A-Za-z0-9]{2,12}$/).describe('Préfixe des codes générés (ex. SALON → SALON-7K3M-Q9TX).'),
};
/** Les champs, tous facultatifs sauf ceux de `required`. */
const schema = (required = []) =>
  Object.fromEntries(Object.entries(fields).map(([k, s]) => [k, required.includes(k) ? s : s.optional()]));
const withLink = (offer) => ({ ...offer, publicLink: offerLink(offer.slug) });
const READ = { readOnlyHint: true, openWorldHint: true };

export function registerOfferTools(server) {
  server.registerTool('list_offers', {
    title: 'Lister les offres', annotations: READ,
    description: 'Liste toutes les offres promo avec leurs chiffres : codes créés, utilisations, places restantes.',
  }, tool(async () => (await api('GET', '/')).map(withLink)));

  server.registerTool('get_offer', {
    title: 'Lire une offre', annotations: READ, inputSchema: { offerId: id },
    description: 'Détail complet d’une offre.',
  }, tool(async ({ offerId }) => withLink(await api('GET', `/${offerId}`))));

  server.registerTool('create_offer', {
    title: 'Créer une offre', annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    description: 'Crée une offre. Conseil : status « draft » d’abord, vérifier, puis passer en « active » avec update_offer.',
    inputSchema: schema(['name', 'slug', 'mode', 'discountType', 'discountValue']),
  }, tool(async (args) => withLink(await api('POST', '/', args))));

  server.registerTool('update_offer', {
    title: 'Modifier une offre', annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    description: 'Modifie seulement les champs fournis ; les autres gardent leur valeur actuelle.',
    inputSchema: { offerId: id, ...schema() },
  }, tool(async ({ offerId, ...changes }) => {
    const current = await api('GET', `/${offerId}`); // l'API attend l'offre complète : on fusionne
    return withLink(await api('PUT', `/${offerId}`, { ...current, ...changes }));
  }));

  server.registerTool('delete_offer', {
    title: 'Supprimer une offre', annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    inputSchema: { offerId: id },
    description: 'Supprime DÉFINITIVEMENT une offre sans aucun code (sinon refusé : l’archiver avec update_offer). Demander confirmation à l’utilisateur avant.',
  }, tool(async ({ offerId }) => api('DELETE', `/${offerId}`)));
}

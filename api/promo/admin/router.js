/**
 * Routes admin des offres (montées sur /admin/campaigns). Chaque requête passe d'abord par
 * isAdminRequest (session + même origine si modification). Les ids sont des entiers uniquement.
 */
import { isAdminRequest } from '../../admin/session.js';
import { validateCampaign } from './validateCampaign.js';
import { listCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign } from './campaigns.js';
import { listCodes, updateCode, deleteCode, listRedemptions, cancelRedemption, codesToCsv } from './codesAdmin.js';
import { createCodes, createSharedCode } from '../rules/generate.js';
import { redeemCode } from '../rules/redeem.js';

const ID = '(\\d{1,10})';
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const ok = (res, code, body) => res.status(code).json(body);
const MESSAGES = {
  unknown: [404, 'Introuvable.'], taken: [409, 'Ce lien ou ce code est déjà utilisé.'],
  locked: [409, 'Le mode ne peut plus changer : l’offre a déjà des codes.'],
  has_codes: [409, 'Cette offre a des codes : archivez-la plutôt que de la supprimer.'],
  used: [409, 'Ce code a déjà servi : révoquez-le plutôt que de le supprimer.'],
  full: [409, 'Plafond de codes atteint : augmentez le nombre maximum.'], exists: [409, 'Cette offre a déjà son code partagé.'],
  invalid: [400, 'Données invalides.'],
  // Refus d'une utilisation (rules/status.js) : un message clair pour l'admin comme pour l'IA.
  exhausted: [409, 'Ce code a déjà atteint son nombre d’utilisations.'], expired: [409, 'Ce code est expiré.'],
  revoked: [409, 'Ce code est révoqué.'], pending: [409, 'Ce code n’est pas encore valide.'],
  inactive: [409, 'L’offre de ce code n’est pas active.'],
};
const fail = (res, status) => { const [code, error] = MESSAGES[status] || [409, `Refusé (${status}).`]; return ok(res, code, { error, status }); };

/** Table des routes : [méthode, chemin, action(db, params, body, res)]. */
const ROUTES = [
  ['GET', '/', (db, p, b, res) => ok(res, 200, listCampaigns(db))],
  ['POST', '/', (db, p, b, res) => {
    const v = validateCampaign(b);
    if (!v.ok) return ok(res, 400, { error: v.error });
    const r = createCampaign(db, v.values);
    return r.status === 'created' ? ok(res, 201, r.campaign) : fail(res, r.status);
  }],
  ['GET', `/${ID}`, (db, [id], b, res) => { const c = getCampaign(db, id); return c ? ok(res, 200, c) : fail(res, 'unknown'); }],
  ['PUT', `/${ID}`, (db, [id], b, res) => {
    const v = validateCampaign(b);
    if (!v.ok) return ok(res, 400, { error: v.error });
    const r = updateCampaign(db, id, v.values);
    return r.status === 'updated' ? ok(res, 200, r.campaign) : fail(res, r.status);
  }],
  ['DELETE', `/${ID}`, (db, [id], b, res) => { const s = deleteCampaign(db, id); return s === 'deleted' ? ok(res, 200, { ok: true }) : fail(res, s); }],
  ['GET', `/${ID}/codes`, (db, [id], b, res) => { const c = listCodes(db, id); return c ? ok(res, 200, c) : fail(res, 'unknown'); }],
  ['POST', `/${ID}/codes`, (db, [id], b, res) => {
    const email = b.email ? String(b.email).trim().toLowerCase() : null;
    if (email && !EMAIL.test(email)) return ok(res, 400, { error: 'E-mail invalide.' });
    const r = createCodes(db, id, { count: b.count ?? 1, email, note: typeof b.note === 'string' ? b.note.slice(0, 500) : '' });
    return r.status === 'created' ? ok(res, 201, r) : fail(res, r.status);
  }],
  ['POST', `/${ID}/shared`, (db, [id], b, res) => {
    const r = createSharedCode(db, id, { code: b.code, maxUses: b.maxUses });
    return r.status === 'created' ? ok(res, 201, r) : fail(res, r.status);
  }],
  ['GET', `/${ID}/redemptions`, (db, [id], b, res) => ok(res, 200, listRedemptions(db, id))],
  ['GET', `/${ID}/export.csv`, (db, [id], b, res) => {
    const codes = listCodes(db, id);
    if (!codes) return fail(res, 'unknown');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="codes-offre-${id}.csv"`);
    return res.status(200).send('﻿' + codesToCsv(codes)); // BOM : accents corrects dans Excel
  }],
  ['PATCH', `/codes/${ID}`, (db, [id], b, res) => {
    const s = updateCode(db, id, b);
    return s === 'updated' ? ok(res, 200, { ok: true }) : s === 'unknown' ? fail(res, s) : ok(res, 400, { error: s });
  }],
  ['DELETE', `/codes/${ID}`, (db, [id], b, res) => { const s = deleteCode(db, id); return s === 'deleted' ? ok(res, 200, { ok: true }) : fail(res, s); }],
  ['POST', `/codes/${ID}/redeem`, (db, [id], b, res) => {
    const row = db.prepare('SELECT code FROM promo_codes WHERE id = ?').get(id);
    if (!row) return fail(res, 'unknown');
    const r = redeemCode(db, row.code, { reference: b.reference ?? '', note: b.note ?? '' });
    return r.status === 'ok' ? ok(res, 201, r) : fail(res, r.status);
  }],
  ['DELETE', `/redemptions/${ID}`, (db, [id], b, res) => (cancelRedemption(db, id) ? ok(res, 200, { ok: true }) : fail(res, 'unknown'))],
].map(([method, pattern, action]) => ({ method, regex: new RegExp(`^${pattern}$`), action }));

export function createCampaignAdminHandler({ db, isAdmin = isAdminRequest }) {
  return function campaignAdminHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store'); // des e-mails : jamais en cache
    const access = isAdmin(req); // true | false | 'limited' (clé API trop sollicitée)
    if (access === 'limited') return ok(res, 429, { error: 'Trop de requêtes, réessayez plus tard.' });
    if (access !== true) return ok(res, 401, { error: 'Session admin ou clé API valide requise.' });
    const path = req.path || '/';
    for (const route of ROUTES) {
      const match = req.method === route.method && path.match(route.regex);
      if (!match) continue;
      try {
        return route.action(db, match.slice(1).map(Number), req.body || {}, res);
      } catch (error) {
        console.error('[campaigns-admin] erreur :', error.code || error.message); // jamais d'e-mail dans les journaux
        return ok(res, 500, { error: 'Erreur serveur.' });
      }
    }
    return ok(res, 404, { error: 'Introuvable.' });
  };
}

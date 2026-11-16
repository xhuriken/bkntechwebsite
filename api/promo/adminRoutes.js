/**
 * Routes de gestion des codes promo, réservées à l'admin (montées sur /admin/promo) :
 *   GET    /                 -> { claims, settings, remaining }
 *   GET    /export.csv       -> fichier CSV
 *   POST   /codes            { email }        -> crée un code manuel
 *   PATCH  /codes/:id        { used: bool }   -> marque utilisé / actif
 *   DELETE /codes/:id                         -> supprime (libère la place)
 *   PUT    /settings         { max, open }    -> places et ouverture
 * Chaque requête passe d'abord par isAdminRequest : session valide + même origine si modification.
 */
import { isAdminRequest } from '../admin/session.js';
import { saveSettings } from './schema.js';
import { listClaims, createManualClaim, setUsed, deleteClaim, claimsToCsv } from './manage.js';

export function createPromoAdminHandler({ db, campaign, isAdmin = isAdminRequest }) {
  return function promoAdminHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store'); // des e-mails : jamais en cache
    if (!isAdmin(req)) return res.status(401).json({ error: 'Session admin requise.' });

    const path = req.path || '/';
    const codeMatch = path.match(/^\/codes\/(\d{1,10})$/); // id entier uniquement
    const id = codeMatch ? Number(codeMatch[1]) : null;
    const body = req.body || {};
    try {
      if (req.method === 'GET' && path === '/') return res.status(200).json(listClaims(db, campaign));
      if (req.method === 'GET' && path === '/export.csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="codes-promo.csv"');
        return res.status(200).send('﻿' + claimsToCsv(listClaims(db, campaign).claims)); // BOM : accents OK dans Excel
      }
      if (req.method === 'POST' && path === '/codes') {
        const r = createManualClaim(db, campaign, body.email);
        if (r.status === 'invalid') return res.status(400).json({ error: 'E-mail invalide.' });
        if (r.status === 'full') return res.status(409).json({ error: 'Plus de place : augmentez le nombre de places.' });
        console.log(`[promo-admin] code manuel créé (${campaign})`); // sans e-mail ni code
        return res.status(201).json({ code: r.code });
      }
      if (req.method === 'PATCH' && id !== null) {
        if (typeof body.used !== 'boolean') return res.status(400).json({ error: 'Champ « used » attendu.' });
        return setUsed(db, campaign, id, body.used)
          ? res.status(200).json({ ok: true })
          : res.status(404).json({ error: 'Code introuvable.' });
      }
      if (req.method === 'DELETE' && id !== null) {
        if (!deleteClaim(db, campaign, id)) return res.status(404).json({ error: 'Code introuvable.' });
        console.log(`[promo-admin] code supprimé (${campaign})`);
        return res.status(200).json({ ok: true });
      }
      if (req.method === 'PUT' && path === '/settings') {
        try {
          return res.status(200).json(saveSettings(db, campaign, { max: body.max, open: body.open }));
        } catch (error) {
          // Seules nos erreurs de validation (schema.js) sont montrées ; une erreur de base reste interne.
          if (error instanceof RangeError || error instanceof TypeError) return res.status(400).json({ error: error.message });
          throw error;
        }
      }
      return res.status(404).json({ error: 'Introuvable.' });
    } catch (error) {
      console.error('[promo-admin] erreur base :', error.code || error.message);
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
  };
}

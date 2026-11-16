/**
 * État public d'une offre et réclamation d'un code personnel (mode « claim », via Google).
 * Généralise l'ancienne offre de lancement à TOUTE offre en mode réclamation.
 */
import { randomCode } from './generate.js';

const time = (iso) => (iso ? Date.parse(iso) : null);

/**
 * État d'une offre vue du public : draft | ended | upcoming | paused | full | open.
 * (archivée ou date de fin passée = ended ; brouillon = invisible pour le public)
 */
export function campaignState(campaign, codesCount, now = Date.now()) {
  if (campaign.status === 'draft') return 'draft';
  if (campaign.status === 'archived') return 'ended';
  const end = time(campaign.ends_at);
  if (end !== null && now >= end) return 'ended';
  const start = time(campaign.starts_at);
  if (start !== null && now < start) return 'upcoming';
  if (campaign.status === 'paused') return 'paused';
  if (campaign.max_codes !== null && codesCount >= campaign.max_codes) return 'full';
  return 'open';
}

export const countCodes = (db, campaignId) =>
  db.prepare('SELECT COUNT(*) AS n FROM promo_codes WHERE campaign_id = ?').get(campaignId).n;

/**
 * Réclame un code pour un compte Google. Renvoie :
 *   { status: 'claimed', code }   nouveau code personnel ;
 *   { status: 'already', code }   ce compte a déjà son code : on le lui redonne (même offre fermée) ;
 *   { status: 'unknown' }         offre inexistante ou en brouillon ;
 *   { status: 'not_claim' }       offre qui ne se réclame pas (code partagé ou codes individuels) ;
 *   { status: <état> }            offre fermée : ended | upcoming | paused | full.
 * BEGIN IMMEDIATE : verrou d'écriture AVANT de compter (pas de dépassement en parallèle).
 */
export function claimCode(db, slug, { googleSub, email }, now = Date.now()) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const campaign = db.prepare('SELECT * FROM promo_campaigns WHERE slug = ?').get(slug);
    const done = (result) => { db.exec('COMMIT'); return result; };
    if (!campaign || campaign.status === 'draft') return done({ status: 'unknown' });
    if (campaign.mode !== 'claim') return done({ status: 'not_claim' });
    const existing = db.prepare('SELECT code FROM promo_codes WHERE campaign_id = ? AND google_sub = ?').get(campaign.id, googleSub);
    if (existing) return done({ status: 'already', code: existing.code });
    const state = campaignState(campaign, countCodes(db, campaign.id), now);
    if (state !== 'open') return done({ status: state });
    for (let attempt = 0; ; attempt++) { // collision de code (quasi impossible) : on en tire un autre
      const code = randomCode(campaign.code_prefix);
      try {
        db.prepare(
          `INSERT INTO promo_codes (campaign_id, code, email, google_sub, source, max_uses, created_at)
           VALUES (?, ?, ?, ?, 'claim', ?, ?)`,
        ).run(campaign.id, code, email, googleSub, campaign.max_uses_per_code, new Date(now).toISOString());
        return done({ status: 'claimed', code });
      } catch (error) {
        if (attempt >= 5 || !/UNIQUE.*promo_codes\.code/.test(error.message)) throw error;
      }
    }
  } catch (error) {
    db.exec('ROLLBACK'); // échouer fermé : rien n'est écrit à moitié
    throw error;
  }
}

/**
 * Recherche et utilisation d'un code. C'est LE point où un code « se consomme » :
 * le contrôle et l'écriture se font dans la même transaction verrouillée, donc deux utilisations
 * simultanées d'un code à usage unique ne peuvent pas passer toutes les deux.
 */
import { codeStatus } from './status.js';
import { normalizeCode } from './generate.js';

const FIND = `SELECT c.*, (SELECT COUNT(*) FROM promo_redemptions r WHERE r.code_id = c.id AND r.cancelled_at IS NULL) AS uses
              FROM promo_codes c WHERE c.code = ?`;

/** Code + offre + nombre d'utilisations + statut calculé, ou null si le code n'existe pas. */
export function findCode(db, raw, now = Date.now()) {
  const row = db.prepare(FIND).get(normalizeCode(raw));
  if (!row) return null;
  const { uses, ...code } = row;
  const campaign = db.prepare('SELECT * FROM promo_campaigns WHERE id = ?').get(code.campaign_id);
  return { code, campaign, uses, status: codeStatus({ code, campaign, uses }, now) };
}

/**
 * Enregistre une utilisation. Renvoie { status: 'ok', usesLeft } si accepté,
 * sinon { status } avec la raison : unknown | revoked | exhausted | expired | pending | inactive.
 */
export function redeemCode(db, raw, { reference = '', note = '' } = {}, now = Date.now()) {
  if (String(reference).length > 120 || String(note).length > 500) return { status: 'invalid' };
  db.exec('BEGIN IMMEDIATE');
  try {
    const found = findCode(db, raw, now);
    if (!found) { db.exec('COMMIT'); return { status: 'unknown' }; }
    if (found.status !== 'active') { db.exec('COMMIT'); return { status: found.status }; }
    db.prepare('INSERT INTO promo_redemptions (code_id, used_at, reference, note) VALUES (?, ?, ?, ?)')
      .run(found.code.id, new Date(now).toISOString(), String(reference), String(note));
    db.exec('COMMIT');
    return { status: 'ok', usesLeft: found.code.max_uses - found.uses - 1 };
  } catch (error) {
    db.exec('ROLLBACK'); // échouer fermé : rien n'est écrit à moitié
    throw error;
  }
}

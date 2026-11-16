/**
 * Gestion des codes promo par l'admin (la protection d'accès est faite dans adminRoutes.js).
 * Toutes les requêtes sont préparées (`?`) : aucune donnée n'est collée dans le SQL.
 */
import { randomUUID } from 'node:crypto';
import { generateCode, remainingPlaces } from './claims.js';
import { getSettings } from './schema.js';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

/** Tous les codes, du plus récent au plus ancien, avec les réglages et le compte de places. */
export function listClaims(db, campaign) {
  const claims = db
    .prepare(
      `SELECT id, email, code, status, source, claimed_at AS claimedAt, used_at AS usedAt
       FROM promo_claims WHERE campaign = ? ORDER BY id DESC`,
    )
    .all(campaign);
  return { claims, settings: getSettings(db, campaign), remaining: remainingPlaces(db, campaign) };
}

/** Code créé à la main (client sans compte Google). Refusé si les places sont prises. */
export function createManualClaim(db, campaign, email) {
  const clean = String(email ?? '').trim().toLowerCase();
  if (!EMAIL.test(clean)) return { status: 'invalid' };
  db.exec('BEGIN IMMEDIATE'); // même verrou que la réclamation publique : pas de dépassement
  try {
    if (remainingPlaces(db, campaign) === 0) { db.exec('COMMIT'); return { status: 'full' }; }
    const code = generateCode();
    db.prepare(
      `INSERT INTO promo_claims (campaign, google_sub, email, code, claimed_at, source)
       VALUES (?, ?, ?, ?, ?, 'manual')`,
    ).run(campaign, `manual:${randomUUID()}`, clean, code, new Date().toISOString());
    db.exec('COMMIT');
    return { status: 'created', code };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

/** Marque un code utilisé (ou le remet à actif). Renvoie false si l'id n'existe pas. */
export function setUsed(db, campaign, id, used) {
  const r = db
    .prepare('UPDATE promo_claims SET status = ?, used_at = ? WHERE id = ? AND campaign = ?')
    .run(used ? 'used' : 'active', used ? new Date().toISOString() : null, id, campaign);
  return r.changes === 1;
}

/** Supprime un code : la place est libérée (la personne pourra de nouveau réclamer). */
export function deleteClaim(db, campaign, id) {
  return db.prepare('DELETE FROM promo_claims WHERE id = ? AND campaign = ?').run(id, campaign).changes === 1;
}

/** Export CSV. Une cellule qui commence par = + - @ serait lue comme une formule par Excel : on la neutralise. */
export function claimsToCsv(claims) {
  const cell = (v) => {
    const s = String(v ?? '');
    return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replaceAll('"', '""')}"`;
  };
  const rows = claims.map((c) => [c.code, c.email, c.status, c.source, c.claimedAt, c.usedAt].map(cell).join(','));
  return ['code,email,statut,origine,reclame_le,utilise_le', ...rows].join('\r\n');
}

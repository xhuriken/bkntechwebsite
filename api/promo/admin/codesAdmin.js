/**
 * Codes et utilisations côté admin : liste avec statut calculé, révocation, modification,
 * suppression (si jamais utilisé), historique, annulation d'une utilisation, export CSV.
 */
import { codeStatus } from '../rules/status.js';

const CODES = `SELECT k.*, (SELECT COUNT(*) FROM promo_redemptions r WHERE r.code_id = k.id AND r.cancelled_at IS NULL) AS uses
               FROM promo_codes k WHERE k.campaign_id = ? ORDER BY k.id DESC`;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

export function listCodes(db, campaign, now = Date.now()) {
  const raw = db.prepare('SELECT * FROM promo_campaigns WHERE id = ?').get(campaign);
  if (!raw) return null;
  return db.prepare(CODES).all(campaign).map(({ uses, ...k }) => ({
    id: k.id, code: k.code, email: k.email, firstName: k.first_name, lastName: k.last_name, source: k.source, note: k.note,
    maxUses: k.max_uses, uses, expiresAt: k.expires_at, revokedAt: k.revoked_at, createdAt: k.created_at,
    status: codeStatus({ code: k, campaign: raw, uses }, now),
  }));
}

/**
 * Modifie un code : { revoked?: bool, note?: string, email?: string|null, expiresAt?: iso|null }.
 * Renvoie 'updated' | 'unknown' | message d'erreur de validation.
 */
export function updateCode(db, id, patch, now = new Date().toISOString()) {
  const code = db.prepare('SELECT * FROM promo_codes WHERE id = ?').get(id);
  if (!code) return 'unknown';
  const next = { revoked_at: code.revoked_at, note: code.note, email: code.email, expires_at: code.expires_at };
  if ('revoked' in patch) {
    if (typeof patch.revoked !== 'boolean') return 'Champ « revoked » : vrai ou faux.';
    next.revoked_at = patch.revoked ? (code.revoked_at || now) : null;
  }
  if ('note' in patch) {
    if (typeof patch.note !== 'string' || patch.note.length > 500) return 'Note : 500 caractères maximum.';
    next.note = patch.note.trim();
  }
  if ('email' in patch) {
    const e = patch.email === null || patch.email === '' ? null : String(patch.email).trim().toLowerCase();
    if (e !== null && !EMAIL.test(e)) return 'E-mail invalide.';
    next.email = e;
  }
  if ('expiresAt' in patch) {
    const t = patch.expiresAt ? Date.parse(patch.expiresAt) : null;
    if (Number.isNaN(t)) return 'Date d’expiration invalide.';
    next.expires_at = t === null ? null : new Date(t).toISOString();
  }
  db.prepare('UPDATE promo_codes SET revoked_at = ?, note = ?, email = ?, expires_at = ? WHERE id = ?')
    .run(next.revoked_at, next.note, next.email, next.expires_at, id);
  return 'updated';
}

/** 'deleted' | 'unknown' | 'used' (un code déjà utilisé se révoque, il ne se supprime pas). */
export function deleteCode(db, id) {
  const row = db.prepare('SELECT (SELECT COUNT(*) FROM promo_redemptions WHERE code_id = ?) AS uses, id FROM promo_codes WHERE id = ?').get(id, id);
  if (!row) return 'unknown';
  if (row.uses > 0) return 'used';
  db.prepare('DELETE FROM promo_codes WHERE id = ?').run(id);
  return 'deleted';
}

export const listRedemptions = (db, campaign) => db.prepare(
  `SELECT r.id, r.used_at AS usedAt, r.cancelled_at AS cancelledAt, r.reference, r.note, k.code, k.email
   FROM promo_redemptions r JOIN promo_codes k ON k.id = r.code_id
   WHERE k.campaign_id = ? ORDER BY r.id DESC`,
).all(campaign);

/** Annule une utilisation saisie par erreur : le code redevient disponible, la ligne reste (historique). */
export const cancelRedemption = (db, id, now = new Date().toISOString()) => db
  .prepare('UPDATE promo_redemptions SET cancelled_at = ? WHERE id = ? AND cancelled_at IS NULL').run(now, id).changes === 1;

/** CSV des codes. Une cellule commençant par = + - @ serait une formule Excel : neutralisée. */
export function codesToCsv(codes) {
  const cell = (v) => {
    const s = String(v ?? '');
    return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replaceAll('"', '""')}"`;
  };
  const rows = codes.map((c) => [c.code, c.firstName, c.lastName, c.email, c.status, `${c.uses}/${c.maxUses}`, c.source, c.createdAt, c.expiresAt, c.note].map(cell).join(','));
  return ['code,prenom,nom,email,statut,utilisations,origine,cree_le,expire_le,note', ...rows].join('\r\n');
}

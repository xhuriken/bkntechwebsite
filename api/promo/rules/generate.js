/**
 * Création de codes : un code, un lot (jusqu'à 200) ou le code partagé d'une offre.
 * Chaque création est une transaction : tout est créé, ou rien.
 */
import { randomInt } from 'node:crypto';

// Pas de 0/O, 1/I/L : le code se recopie sans erreur depuis un écran ou un papier.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const MAX_BATCH = 200;
const SHARED_CODE = /^[A-Z0-9-]{4,24}$/;

/** Code aléatoire, ex. BLEDGER-7K3P-Q9XA (31^8 ≈ 850 milliards de possibilités par préfixe). */
export function randomCode(prefix) {
  const block = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  return `${prefix}-${block()}-${block()}`;
}

/** Forme canonique d'un code saisi : majuscules, sans espaces. Sert à TOUTE recherche de code. */
export const normalizeCode = (raw) => String(raw ?? '').replace(/\s+/g, '').toUpperCase();

const INSERT = `INSERT INTO promo_codes (campaign_id, code, email, source, max_uses, note, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)`;

/** Crée `count` codes individuels. Renvoie { status: 'created', codes } | 'unknown' | 'invalid' | 'full'. */
export function createCodes(db, campaignId, { count = 1, email = null, note = '' } = {}, now = new Date().toISOString()) {
  if (!Number.isInteger(count) || count < 1 || count > MAX_BATCH) return { status: 'invalid' };
  db.exec('BEGIN IMMEDIATE'); // verrou d'écriture AVANT de compter : pas de dépassement en parallèle
  try {
    const campaign = db.prepare('SELECT * FROM promo_campaigns WHERE id = ?').get(campaignId);
    if (!campaign) { db.exec('COMMIT'); return { status: 'unknown' }; }
    if (campaign.mode === 'shared') { db.exec('COMMIT'); return { status: 'invalid' }; } // voir createSharedCode
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM promo_codes WHERE campaign_id = ?').get(campaignId);
    if (campaign.max_codes !== null && n + count > campaign.max_codes) {
      db.exec('COMMIT');
      return { status: 'full', remaining: Math.max(0, campaign.max_codes - n) };
    }
    const codes = [];
    for (let i = 0; i < count; i++) {
      for (let attempt = 0; ; attempt++) { // collision (quasi impossible) : on retire un autre code
        const code = randomCode(campaign.code_prefix);
        try {
          db.prepare(INSERT).run(campaignId, code, email, count === 1 ? 'manual' : 'batch', campaign.max_uses_per_code, note, now);
          codes.push(code);
          break;
        } catch (error) {
          if (attempt >= 5 || !/UNIQUE/.test(error.message)) throw error;
        }
      }
    }
    db.exec('COMMIT');
    return { status: 'created', codes };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

/** Code partagé lisible (ex. LANCEMENT50) pour une offre en mode « shared » : un seul par offre. */
export function createSharedCode(db, campaignId, { code, maxUses }, now = new Date().toISOString()) {
  const clean = normalizeCode(code);
  if (!SHARED_CODE.test(clean) || !Number.isInteger(maxUses) || maxUses < 1 || maxUses > 100000) return { status: 'invalid' };
  db.exec('BEGIN IMMEDIATE');
  try {
    const campaign = db.prepare('SELECT mode FROM promo_campaigns WHERE id = ?').get(campaignId);
    if (!campaign || campaign.mode !== 'shared') { db.exec('COMMIT'); return { status: 'invalid' }; }
    if (db.prepare('SELECT 1 FROM promo_codes WHERE campaign_id = ?').get(campaignId)) { db.exec('COMMIT'); return { status: 'exists' }; }
    try {
      db.prepare(INSERT).run(campaignId, clean, null, 'shared', maxUses, '', now);
    } catch (error) {
      if (/UNIQUE/.test(error.message)) { db.exec('COMMIT'); return { status: 'taken' }; } // code déjà pris ailleurs
      throw error;
    }
    db.exec('COMMIT');
    return { status: 'created', code: clean };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

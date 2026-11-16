/**
 * Réclamations du code promo de lancement B-Ledger (-50 % × 3 mois, 10 premiers).
 * Stockage SQLite intégré à Node 22 (node:sqlite) : aucune dépendance à installer.
 * Règles garanties ici, côté serveur :
 *   - au plus MAX_CLAIMS réclamations par campagne ;
 *   - une seule réclamation par compte Google (identifiant stable « sub ») ;
 *   - chaque personne reçoit son propre code, qu'elle peut revoir plus tard.
 */
import { DatabaseSync } from 'node:sqlite';
import { randomInt } from 'node:crypto';
import { migrate, getSettings } from './schema.js';

export const MAX_CLAIMS = 10;

// Pas de 0/O, 1/I/L : le code se recopie sans erreur depuis un écran ou un papier.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Ouvre (ou crée) la base et la table des réclamations. */
export function openClaimsDb(filePath) {
  const db = new DatabaseSync(filePath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS promo_claims (
      id         INTEGER PRIMARY KEY,
      campaign   TEXT NOT NULL,
      google_sub TEXT NOT NULL,
      email      TEXT NOT NULL,
      code       TEXT NOT NULL UNIQUE,
      claimed_at TEXT NOT NULL,
      UNIQUE (campaign, google_sub)
    );
  `);
  migrate(db); // colonnes de gestion admin + réglages (voir schema.js)
  return db;
}

/** Code perso, ex. BLEDGER-7K3P-Q9XA (31^8 ≈ 850 milliards de possibilités). */
export function generateCode() {
  const pick = () => ALPHABET[randomInt(ALPHABET.length)];
  const block = () => Array.from({ length: 4 }, pick).join('');
  return `BLEDGER-${block()}-${block()}`;
}

/**
 * Places restantes (jamais négatif). Sans `max` explicite, on lit les réglages de l'admin ;
 * offre fermée = 0 place. Les codes « utilisés » comptent : la place est prise.
 */
export function remainingPlaces(db, campaign, max) {
  const settings = getSettings(db, campaign);
  if (max === undefined && !settings.open) return 0;
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM promo_claims WHERE campaign = ?').get(campaign);
  return Math.max(0, (max ?? settings.max) - n);
}

/**
 * Réclame une place. Renvoie :
 *   { status: 'claimed', code }  première réclamation acceptée ;
 *   { status: 'already', code }  ce compte a déjà réclamé : on lui redonne SON code ;
 *   { status: 'full' }           les places sont toutes prises.
 * BEGIN IMMEDIATE prend le verrou d'écriture AVANT de compter : deux réclamations
 * simultanées ne peuvent pas lire toutes les deux « 9 places prises » et passer.
 */
export function claimPromo(db, { campaign, googleSub, email }, max) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const existing = db
      .prepare('SELECT code FROM promo_claims WHERE campaign = ? AND google_sub = ?')
      .get(campaign, googleSub);
    if (existing) {
      db.exec('COMMIT');
      return { status: 'already', code: existing.code };
    }
    if (remainingPlaces(db, campaign, max) === 0) {
      db.exec('COMMIT');
      return { status: 'full' };
    }
    const code = generateCode();
    db.prepare(
      `INSERT INTO promo_claims (campaign, google_sub, email, code, claimed_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(campaign, googleSub, email, code, new Date().toISOString());
    db.exec('COMMIT');
    return { status: 'claimed', code };
  } catch (error) {
    db.exec('ROLLBACK'); // échouer fermé : rien n'est écrit à moitié
    throw error;
  }
}

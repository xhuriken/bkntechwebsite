/**
 * POUR LES TESTS : fabrique une base au format de l'ANCIENNE version (celle encore en production
 * avant la reprise), avec 3 codes dont 1 manuel déjà utilisé, et l'offre fermée à 12 places.
 * Les tables sont écrites à la main, telles qu'elles existent en production : le code qui les
 * créait a été retiré, la reprise (migrateLegacy) doit marcher sans lui.
 */
import { DatabaseSync } from 'node:sqlite';

export const LEGACY_CODES = ['BLEDGER-AAAA-AAAA', 'BLEDGER-BBBB-BBBB', 'BLEDGER-CCCC-CCCC'];

export function createLegacyDb(filePath) {
  const db = new DatabaseSync(filePath);
  db.exec(`
    CREATE TABLE promo_claims (
      id INTEGER PRIMARY KEY, campaign TEXT NOT NULL, google_sub TEXT NOT NULL, email TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE, claimed_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active', used_at TEXT, source TEXT NOT NULL DEFAULT 'google',
      UNIQUE (campaign, google_sub)
    );
    CREATE TABLE promo_settings (campaign TEXT PRIMARY KEY, max_places INTEGER NOT NULL, is_open INTEGER NOT NULL DEFAULT 1);
    INSERT INTO promo_settings VALUES ('bledger-launch', 12, 0);
  `);
  const add = db.prepare(`INSERT INTO promo_claims (campaign, google_sub, email, code, claimed_at, status, used_at, source)
    VALUES ('bledger-launch', ?, ?, ?, '2026-11-10T10:00:00.000Z', ?, ?, ?)`);
  add.run('g-1', 'a@exemple.fr', LEGACY_CODES[0], 'active', null, 'google');
  add.run('g-2', 'b@exemple.fr', LEGACY_CODES[1], 'active', null, 'google');
  add.run('manual:1b2c', 'manuel@exemple.fr', LEGACY_CODES[2], 'used', '2026-11-12T15:00:00.000Z', 'manual');
  db.close();
}

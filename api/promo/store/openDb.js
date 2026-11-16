/**
 * Ouvre la base des codes promo (SQLite intégré à Node 22, aucune dépendance) :
 *  - WAL : les lectures ne bloquent pas l'écriture en cours ;
 *  - busy_timeout : en cas de verrou, on attend 5 s au lieu d'échouer tout de suite ;
 *  - createTables : structure offres -> codes -> utilisations (+ clés étrangères activées) ;
 *  - migrateLegacy : reprend une seule fois les données de l'ancienne version, si elles existent.
 * Les anciennes tables (promo_claims, promo_settings) ne sont plus jamais créées ni modifiées :
 * elles restent seulement comme sauvegarde dans une base déjà en production.
 */
import { DatabaseSync } from 'node:sqlite';
import { createTables } from './tables.js';
import { migrateLegacy } from './migrateLegacy.js';

/** Renvoie { db, moved } : moved = nombre d'anciens codes repris à cette ouverture. */
export function openPromoDb(filePath) {
  const db = new DatabaseSync(filePath);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  createTables(db);
  return { db, moved: migrateLegacy(db) };
}

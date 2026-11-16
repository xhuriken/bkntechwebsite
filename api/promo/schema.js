/**
 * Évolution de la base promo pour la gestion par l'admin.
 *  - promo_claims gagne : statut (active | used), date d'utilisation, origine (google | manual).
 *  - promo_settings : nombre de places et offre ouverte/fermée, modifiables sans redéployer.
 * Migration idempotente : on n'ajoute une colonne que si elle manque (une base déjà en
 * production, créée avant cette version, continue de marcher sans perte).
 */
export const DEFAULT_MAX = 10;

export function migrate(db) {
  const have = new Set(db.prepare('PRAGMA table_info(promo_claims)').all().map((c) => c.name));
  const add = (name, ddl) => { if (!have.has(name)) db.exec(`ALTER TABLE promo_claims ADD COLUMN ${name} ${ddl}`); };
  add('status', "TEXT NOT NULL DEFAULT 'active'");
  add('used_at', 'TEXT');
  add('source', "TEXT NOT NULL DEFAULT 'google'");
  db.exec(`
    CREATE TABLE IF NOT EXISTS promo_settings (
      campaign   TEXT PRIMARY KEY,
      max_places INTEGER NOT NULL,
      is_open    INTEGER NOT NULL DEFAULT 1
    );
  `);
}

/** Réglages de la campagne (valeurs par défaut si jamais modifiés). */
export function getSettings(db, campaign) {
  const row = db.prepare('SELECT max_places, is_open FROM promo_settings WHERE campaign = ?').get(campaign);
  return row ? { max: row.max_places, open: row.is_open === 1 } : { max: DEFAULT_MAX, open: true };
}

/** Modifie les réglages : places entières entre 0 et 1000, ouverture booléenne. */
export function saveSettings(db, campaign, { max, open }) {
  if (!Number.isInteger(max) || max < 0 || max > 1000) throw new RangeError('Nombre de places invalide.');
  if (typeof open !== 'boolean') throw new TypeError('Ouverture invalide.');
  db.prepare(
    `INSERT INTO promo_settings (campaign, max_places, is_open) VALUES (?, ?, ?)
     ON CONFLICT(campaign) DO UPDATE SET max_places = excluded.max_places, is_open = excluded.is_open`,
  ).run(campaign, max, open ? 1 : 0);
  return getSettings(db, campaign);
}

/**
 * Reprise de l'ancienne version (une seule offre codée en dur : tables promo_claims et
 * promo_settings) vers la nouvelle structure offres -> codes -> utilisations.
 *  - Une seule fois : un repère « legacy_migrated » est écrit dans promo_meta avec les données.
 *    Sans lui, supprimer toutes les offres ferait revenir les anciens codes au redémarrage.
 *  - Tout ou rien : une transaction ; en cas d'erreur, la base reste comme avant.
 *  - Les anciennes tables ne sont PAS supprimées : elles restent comme sauvegarde.
 */
export const LEGACY_CAMPAIGN = 'bledger-launch';
export const LAUNCH_SLUG = 'lancement-b-ledger'; // /b-ledger/offre pointera vers cette offre

const hasTable = (db, name) =>
  Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name));

/** Renvoie le nombre de codes repris (0 si rien à reprendre ou déjà fait). */
export function migrateLegacy(db, now = new Date().toISOString()) {
  if (db.prepare("SELECT 1 FROM promo_meta WHERE key = 'legacy_migrated'").get()) return 0; // déjà fait
  if (!hasTable(db, 'promo_claims')) return 0; // installation neuve : rien à reprendre
  const markDone = () => db.prepare("INSERT OR IGNORE INTO promo_meta (key, value) VALUES ('legacy_migrated', ?)").run(now);
  if (db.prepare('SELECT COUNT(*) AS n FROM promo_campaigns').get().n > 0) { markDone(); return 0; } // offres déjà là

  const settings = hasTable(db, 'promo_settings')
    ? db.prepare('SELECT max_places, is_open FROM promo_settings WHERE campaign = ?').get(LEGACY_CAMPAIGN)
    : undefined;
  const claims = db.prepare('SELECT * FROM promo_claims WHERE campaign = ? ORDER BY id').all(LEGACY_CAMPAIGN);

  const places = settings ? settings.max_places : 10; // le texte public suit le vrai nombre de places
  db.exec('BEGIN IMMEDIATE');
  try {
    const { lastInsertRowid: campaignId } = db.prepare(
      `INSERT INTO promo_campaigns (slug, name, status, mode, title, description, conditions,
         discount_type, discount_value, discount_months, max_codes, max_uses_per_code,
         code_prefix, created_at, updated_at)
       VALUES (?, ?, ?, 'claim', ?, ?, ?, 'percent', 50, 3, ?, 1, 'BLEDGER', ?, ?)`,
    ).run(
      LAUNCH_SLUG,
      'Lancement B-Ledger',
      settings && settings.is_open === 0 ? 'paused' : 'active',
      'B-Ledger : -50 % pendant 3 mois',
      `Sur l’offre Solo à 29 €/mois, réservée aux ${places} premiers.`,
      'Un code par compte Google. À utiliser lors de votre abonnement B-Ledger Solo.',
      places,
      now,
      now,
    );

    const insertCode = db.prepare(
      `INSERT INTO promo_codes (campaign_id, code, email, google_sub, source, max_uses, created_at)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
    );
    const insertUse = db.prepare(
      `INSERT INTO promo_redemptions (code_id, used_at, note) VALUES (?, ?, 'Repris de l’ancienne version')`,
    );
    for (const c of claims) {
      const manual = c.source === 'manual'; // ancien identifiant « manual:uuid » : pas un vrai compte Google
      const { lastInsertRowid: codeId } = insertCode.run(
        campaignId, c.code, c.email, manual ? null : c.google_sub, manual ? 'manual' : 'claim', c.claimed_at,
      );
      if (c.status === 'used') insertUse.run(codeId, c.used_at || now); // « utilisé » devient une utilisation datée
    }
    markDone(); // dans la même transaction : données et repère arrivent ensemble, ou rien
    db.exec('COMMIT');
    return claims.length;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

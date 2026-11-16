/**
 * Offres côté admin : lister (avec statistiques), lire, créer, modifier, supprimer.
 * Les valeurs arrivent déjà validées (validateCampaign.js) ; requêtes toujours préparées.
 */
const COLUMNS = ['slug', 'name', 'status', 'mode', 'title', 'description', 'conditions', 'discount_type',
  'discount_value', 'discount_months', 'starts_at', 'ends_at', 'max_codes', 'max_uses_per_code', 'code_prefix'];

const STATS = `
  (SELECT COUNT(*) FROM promo_codes k WHERE k.campaign_id = c.id) AS codes,
  (SELECT COUNT(*) FROM promo_redemptions r JOIN promo_codes k ON k.id = r.code_id WHERE k.campaign_id = c.id AND r.cancelled_at IS NULL) AS uses`;

/** Ligne SQL (snake_case) -> objet JSON pour l'interface (camelCase). */
export function campaignToApi(row) {
  return {
    id: row.id, slug: row.slug, name: row.name, status: row.status, mode: row.mode,
    title: row.title, description: row.description, conditions: row.conditions,
    discountType: row.discount_type, discountValue: row.discount_value, discountMonths: row.discount_months,
    startsAt: row.starts_at, endsAt: row.ends_at, maxCodes: row.max_codes, maxUsesPerCode: row.max_uses_per_code,
    codePrefix: row.code_prefix, createdAt: row.created_at, updatedAt: row.updated_at,
    codes: row.codes ?? 0, uses: row.uses ?? 0,
    remaining: row.max_codes === null ? null : Math.max(0, row.max_codes - (row.codes ?? 0)),
  };
}

export const listCampaigns = (db) =>
  db.prepare(`SELECT c.*, ${STATS} FROM promo_campaigns c ORDER BY c.id DESC`).all().map(campaignToApi);

export function getCampaign(db, id) {
  const row = db.prepare(`SELECT c.*, ${STATS} FROM promo_campaigns c WHERE c.id = ?`).get(id);
  return row ? campaignToApi(row) : null;
}

/** Renvoie { status: 'created', campaign } | 'taken' (lien déjà utilisé). */
export function createCampaign(db, values, now = new Date().toISOString()) {
  try {
    const { lastInsertRowid } = db.prepare(
      `INSERT INTO promo_campaigns (${COLUMNS.join(', ')}, created_at, updated_at)
       VALUES (${COLUMNS.map(() => '?').join(', ')}, ?, ?)`,
    ).run(...COLUMNS.map((k) => values[k]), now, now);
    return { status: 'created', campaign: getCampaign(db, lastInsertRowid) };
  } catch (error) {
    if (/UNIQUE.*slug/.test(error.message)) return { status: 'taken' };
    throw error;
  }
}

/** Renvoie { status: 'updated', campaign } | 'unknown' | 'taken' | 'locked' (mode changé alors que des codes existent). */
export function updateCampaign(db, id, values, now = new Date().toISOString()) {
  const current = getCampaign(db, id);
  if (!current) return { status: 'unknown' };
  if (current.codes > 0 && values.mode !== current.mode) return { status: 'locked' };
  try {
    db.prepare(`UPDATE promo_campaigns SET ${COLUMNS.map((k) => `${k} = ?`).join(', ')}, updated_at = ? WHERE id = ?`)
      .run(...COLUMNS.map((k) => values[k]), now, id);
    return { status: 'updated', campaign: getCampaign(db, id) };
  } catch (error) {
    if (/UNIQUE.*slug/.test(error.message)) return { status: 'taken' };
    throw error;
  }
}

/** Suppression seulement si l'offre n'a aucun code (sinon : l'archiver). 'deleted' | 'unknown' | 'has_codes'. */
export function deleteCampaign(db, id) {
  const current = getCampaign(db, id);
  if (!current) return 'unknown';
  if (current.codes > 0) return 'has_codes';
  db.prepare('DELETE FROM promo_campaigns WHERE id = ?').run(id);
  return 'deleted';
}

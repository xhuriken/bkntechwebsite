/**
 * Validation d'une offre envoyée par l'admin (JSON en camelCase) -> valeurs prêtes pour la base.
 * Les contraintes CHECK de la base restent une 2e barrière ; ici on renvoie un message clair.
 * Renvoie { ok: true, values } ou { ok: false, error }.
 */
const ENUMS = {
  status: ['draft', 'active', 'paused', 'archived'],
  mode: ['claim', 'shared', 'individual'],
  discountType: ['percent', 'fixed', 'free_months'],
};
const MAX_VALUE = { percent: 100, fixed: 1_000_000, free_months: 36 }; // %, centimes (10 000 €), mois

const text = (v, max, label, { required = false } = {}) => {
  const s = typeof v === 'string' ? v.trim() : v == null ? '' : null;
  if (s === null || s.length > max || (required && !s)) throw new Error(`${label} : texte de 1 à ${max} caractères.`);
  return s;
};
const int = (v, min, max, label, { nullable = false } = {}) => {
  if (nullable && (v === null || v === undefined || v === '')) return null;
  if (!Number.isInteger(v) || v < min || v > max) throw new Error(`${label} : nombre entier de ${min} à ${max}.`);
  return v;
};
const date = (v, label) => {
  if (v === null || v === undefined || v === '') return null;
  const t = typeof v === 'string' ? Date.parse(v) : NaN;
  if (Number.isNaN(t)) throw new Error(`${label} : date invalide.`);
  return new Date(t).toISOString(); // toujours stockée en UTC, au même format : comparaisons fiables
};
const oneOf = (v, key, label) => {
  if (!ENUMS[key].includes(v)) throw new Error(`${label} : valeur inconnue.`);
  return v;
};

export function validateCampaign(input) {
  try {
    const b = input && typeof input === 'object' ? input : {};
    const slug = text(b.slug, 60, 'Lien', { required: true }).toLowerCase();
    if (!/^[a-z0-9-]{3,60}$/.test(slug)) throw new Error('Lien : 3 à 60 caractères, minuscules, chiffres et tirets.');
    const discountType = oneOf(b.discountType, 'discountType', 'Type de remise');
    const values = {
      slug,
      name: text(b.name, 120, 'Nom interne', { required: true }),
      status: oneOf(b.status ?? 'draft', 'status', 'Statut'),
      mode: oneOf(b.mode, 'mode', 'Mode de distribution'),
      title: text(b.title, 120, 'Titre'),
      description: text(b.description, 2000, 'Description'),
      conditions: text(b.conditions, 2000, 'Conditions'),
      discount_type: discountType,
      discount_value: int(b.discountValue, 1, MAX_VALUE[discountType], 'Valeur de la remise'),
      discount_months: int(b.discountMonths, 1, 36, 'Durée de la remise (mois)', { nullable: true }),
      starts_at: date(b.startsAt, 'Début'),
      ends_at: date(b.endsAt, 'Fin'),
      max_codes: int(b.maxCodes, 0, 100_000, 'Nombre de codes maximum', { nullable: true }),
      max_uses_per_code: int(b.maxUsesPerCode ?? 1, 1, 100_000, 'Utilisations par code'),
      code_prefix: text(b.codePrefix ?? 'BLEDGER', 12, 'Préfixe', { required: true }).toUpperCase(),
    };
    if (!/^[A-Z0-9]{2,12}$/.test(values.code_prefix)) throw new Error('Préfixe : 2 à 12 lettres ou chiffres.');
    if (values.starts_at && values.ends_at && values.ends_at <= values.starts_at) throw new Error('La fin doit être après le début.');
    return { ok: true, values };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Statut d'un code : CALCULÉ, jamais stocké. Il ne peut donc pas devenir faux
 * (un code expire tout seul à la date prévue, sans tâche planifiée).
 *
 * Ordre de priorité (le premier qui s'applique gagne) :
 *   revoked    révoqué à la main par l'admin
 *   exhausted  toutes les utilisations sont consommées (usage unique : 1 utilisation)
 *   expired    date de fin dépassée (celle du code OU celle de l'offre : la plus proche)
 *   pending    la période de l'offre n'a pas commencé
 *   inactive   l'offre n'est pas « active » (brouillon, en pause, archivée)
 *   active     utilisable
 * L'horloge est injectable (now) pour tester sans attendre.
 */
export const STATUSES = ['revoked', 'exhausted', 'expired', 'pending', 'inactive', 'active'];

const time = (iso) => (iso ? Date.parse(iso) : null);

export function codeStatus({ code, campaign, uses }, now = Date.now()) {
  if (code.revoked_at) return 'revoked';
  if (uses >= code.max_uses) return 'exhausted';
  const ends = [time(code.expires_at), time(campaign.ends_at)].filter((t) => t !== null);
  if (ends.length > 0 && now >= Math.min(...ends)) return 'expired';
  const start = time(campaign.starts_at);
  if (start !== null && now < start) return 'pending';
  if (campaign.status !== 'active') return 'inactive';
  return 'active';
}

/** Libellés pour l'interface (les messages publics seront volontairement plus vagues, lot 4). */
export const STATUS_LABELS = {
  revoked: 'Révoqué', exhausted: 'Épuisé', expired: 'Expiré',
  pending: 'Pas encore valable', inactive: 'Offre inactive', active: 'Valable',
};

/**
 * Libellés et formats des codes promo, partagés par l'admin et les pages publiques.
 * Rappel : une remise « fixed » est stockée en CENTIMES (entier exact, pas d'arrondi flottant).
 */
export const STATUS_LABELS = { draft: 'Brouillon', active: 'Active', paused: 'En pause', archived: 'Archivée' };
export const MODE_LABELS = {
  claim: 'Réclamation Google (un code par compte)',
  individual: 'Codes individuels (créés et envoyés par vous)',
  shared: 'Code partagé (le même pour tous, ex. flyer)',
};
export const STATE_LABELS = {
  open: 'Ouverte', upcoming: 'Bientôt', paused: 'En pause', full: 'Complète', ended: 'Terminée',
};

const euros = (cents) =>
  (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: cents % 100 ? 2 : 0 });

/** Ex. « -50 % pendant 3 mois », « -20 € », « 2 mois offerts ». */
export function discountText({ type, value, months } = {}) {
  if (!value) return '';
  if (type === 'free_months') return `${value} mois offert${value > 1 ? 's' : ''}`;
  const amount = type === 'fixed' ? `-${euros(value)}` : `-${value} %`;
  return months ? `${amount} pendant ${months} mois` : amount;
}

/** Date lisible en français, ou '' si absente. */
export const dateText = (iso) =>
  (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) : '');

/** ISO (UTC) -> valeur d'un <input type="datetime-local"> (heure locale du navigateur). */
export function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Valeur d'un <input type="datetime-local"> -> ISO avec fuseau (le serveur la remet en UTC). */
export const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null);

/** Statut d'un code (calculé par le serveur) : libellé et couleur du badge. */
export const CODE_STATUS = {
  active: ['Actif', 'border-secondary/40 text-secondary bg-secondary/10'],
  pending: ['À venir', 'border-primary/40 text-primary bg-primary/10'],
  exhausted: ['Utilisé', 'border-white/20 text-on-surface-variant bg-white/5'],
  expired: ['Expiré', 'border-tertiary/40 text-tertiary bg-tertiary/10'],
  revoked: ['Révoqué', 'border-red-500/40 text-red-400 bg-red-500/10'],
  inactive: ['Offre inactive', 'border-white/15 text-on-surface-variant'],
};

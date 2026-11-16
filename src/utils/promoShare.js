/**
 * Liens à partager. Un code se partage par un lien (/code/<CODE>, page du lot 7) ou par un e-mail
 * préparé : « mailto: » ouvre le logiciel de messagerie de l'admin, le serveur n'envoie rien
 * (donc aucun service d'e-mail, aucun e-mail stocké ailleurs que dans la base).
 */
import { discountText } from './promoFormat';

export const codeLink = (code) => `${window.location.origin}/code/${encodeURIComponent(code)}`;
export const offerLink = (slug) => `${window.location.origin}/offre/${encodeURIComponent(slug)}`;

/** Lien mailto: avec objet et corps déjà rédigés (encodés : accents, retours à la ligne, &). */
export function mailtoHref(email, code, campaign) {
  const discount = discountText({ type: campaign.discountType, value: campaign.discountValue, months: campaign.discountMonths });
  const subject = `Votre code ${campaign.title || campaign.name}`;
  const body = [
    'Bonjour,', '',
    `Voici votre code promotionnel : ${code}`,
    discount ? `Avantage : ${discount}` : undefined, '',
    `Tous les détails : ${codeLink(code)}`, '',
    'Cordialement,',
  ].filter((l) => l !== undefined).join('\r\n'); // sans remise connue, la ligne saute
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Conversions du formulaire d'offre (pure logique, sans affichage) :
 *   offre de l'API -> champs du formulaire -> corps envoyé à l'API, et -> aperçu public.
 * Les champs du formulaire sont des TEXTES (ce que contiennent les <input>) ; on convertit à la fin.
 */
import { toLocalInput, fromLocalInput } from '../../../utils/promoFormat';

export const EMPTY_FORM = {
  name: '', slug: '', status: 'draft', mode: 'individual', title: '', description: '', conditions: '',
  discountType: 'percent', discountValue: '', discountMonths: '', startsAt: '', endsAt: '',
  maxCodes: '', maxUsesPerCode: '1', codePrefix: 'BLEDGER',
};

const str = (v) => (v === null || v === undefined ? '' : String(v));

/** « Offre Salon 2026 ! » -> « offre-salon-2026 » (proposition de lien, modifiable). */
export const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

/** Offre de l'API -> champs. Une remise fixe arrive en centimes, on l'affiche en euros. */
export function toForm(c) {
  if (!c) return { ...EMPTY_FORM };
  return {
    name: c.name, slug: c.slug, status: c.status, mode: c.mode, title: c.title, description: c.description,
    conditions: c.conditions, discountType: c.discountType,
    discountValue: str(c.discountType === 'fixed' ? c.discountValue / 100 : c.discountValue),
    discountMonths: str(c.discountMonths), startsAt: toLocalInput(c.startsAt), endsAt: toLocalInput(c.endsAt),
    maxCodes: str(c.maxCodes), maxUsesPerCode: str(c.maxUsesPerCode), codePrefix: c.codePrefix,
  };
}

const num = (v) => (v === '' ? null : Number(v)); // '' = champ vide = « pas de limite »

/** Champs -> corps de la requête. Le serveur revalide TOUT (ceci n'est qu'une mise en forme). */
export function toPayload(f) {
  const value = num(f.discountValue);
  return {
    ...f,
    discountValue: f.discountType === 'fixed' && value !== null ? Math.round(value * 100) : value,
    discountMonths: f.discountType === 'free_months' ? null : num(f.discountMonths),
    startsAt: fromLocalInput(f.startsAt), endsAt: fromLocalInput(f.endsAt),
    maxCodes: num(f.maxCodes), maxUsesPerCode: num(f.maxUsesPerCode) ?? 1,
  };
}

/** État vu du public, calculé comme le serveur (rules/claim.js) pour un aperçu fidèle. */
function previewState(f, codes, now = Date.now()) {
  if (f.status === 'archived') return 'ended';
  if (f.endsAt && now >= Date.parse(f.endsAt)) return 'ended';
  if (f.startsAt && now < Date.parse(f.startsAt)) return 'upcoming';
  if (f.status === 'paused') return 'paused';
  if (f.maxCodes !== '' && codes >= Number(f.maxCodes)) return 'full';
  return 'open';
}

/** Champs -> forme de l'API publique, pour <OfferCard>. */
export function toPreview(f, codes = 0) {
  const p = toPayload(f);
  const claim = f.mode === 'claim' && p.maxCodes !== null;
  return {
    title: f.title, description: f.description, conditions: f.conditions,
    discount: { type: p.discountType, value: p.discountValue, months: p.discountMonths },
    startsAt: p.startsAt, endsAt: p.endsAt, state: previewState(f, codes),
    total: claim ? p.maxCodes : null, remaining: claim ? Math.max(0, p.maxCodes - codes) : null,
    sharedCode: f.mode === 'shared' ? 'VOTRE-CODE' : null,
  };
}

/**
 * Ce que le PUBLIC a le droit de voir. Liste blanche de champs : jamais d'e-mail, d'identifiant
 * Google, de note interne, de nom interne ni de nombre d'utilisations des autres.
 */
import { campaignState, countCodes } from '../rules/claim.js';

const discount = (c) => ({ type: c.discount_type, value: c.discount_value, months: c.discount_months });

/** Offre publique, ou null si elle n'existe pas ou est en brouillon (même réponse : rien ne fuit). */
export function publicOffer(db, slug, now = Date.now()) {
  const c = db.prepare('SELECT * FROM promo_campaigns WHERE slug = ?').get(slug);
  if (!c) return null;
  const codes = countCodes(db, c.id);
  const state = campaignState(c, codes, now);
  if (state === 'draft') return null;
  const shared = c.mode === 'shared' && state === 'open'
    ? db.prepare('SELECT code FROM promo_codes WHERE campaign_id = ? AND revoked_at IS NULL').get(c.id)
    : undefined;
  return {
    slug: c.slug, title: c.title, description: c.description, conditions: c.conditions, mode: c.mode,
    discount: discount(c), startsAt: c.starts_at, endsAt: c.ends_at, state,
    total: c.mode === 'claim' ? c.max_codes : null,                       // ex. « sur 10 »
    remaining: c.mode === 'claim' && c.max_codes !== null ? Math.max(0, c.max_codes - codes) : null,
    sharedCode: shared?.code ?? null,                                    // code du flyer, visible si l'offre est ouverte
  };
}

/**
 * Statut public d'un code : active | upcoming | used | expired | unavailable.
 * « unavailable » regroupe révoqué et offre inactive : le public n'a pas à savoir pourquoi.
 */
const PUBLIC_STATUS = { active: 'active', pending: 'upcoming', exhausted: 'used', expired: 'expired', revoked: 'unavailable', inactive: 'unavailable' };

export function publicCode(found) {
  const { code, campaign, uses, status } = found;
  const ends = [code.expires_at, campaign.ends_at].filter(Boolean).sort();
  return {
    code: code.code,
    status: PUBLIC_STATUS[status],
    usesLeft: code.max_uses > 1 ? Math.max(0, code.max_uses - uses) : null, // utile pour un code multi-usage
    validFrom: campaign.starts_at,
    validUntil: ends[0] ?? null,                                           // la date de fin la plus proche
    offer: { slug: campaign.slug, title: campaign.title, conditions: campaign.conditions, discount: discount(campaign) },
  };
}

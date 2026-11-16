import React from 'react';
import { discountText, dateText, STATE_LABELS } from '../../utils/promoFormat';

/**
 * Carte d'une offre telle que le PUBLIC la voit. Reçoit la même forme que l'API publique
 * (GET /api/promo/offers/:slug) : l'aperçu de l'admin et la vraie page affichent donc la même chose.
 * Tout est rendu en texte React (jamais de HTML brut) : pas d'injection possible via la description.
 */
export default function OfferCard({ offer, children, headingLevel = 2 }) {
  const { title, description, conditions, discount, startsAt, endsAt, state, total, remaining, sharedCode } = offer;
  const open = state === 'open';
  const Title = headingLevel === 1 ? 'h1' : 'h2'; // h1 sur la page publique, h2 dans l'aperçu admin
  return (
    <article className="bg-surface-container-low/80 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <span className={`text-[10px] uppercase tracking-[0.15em] border rounded-full px-3 py-1 ${open ? 'border-secondary/40 text-secondary' : 'border-white/15 text-on-surface-variant'}`}>
          {STATE_LABELS[state] ?? state}
        </span>
        {remaining !== null && remaining !== undefined && (
          <span className="text-xs text-on-surface-variant">
            {remaining} place{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}{total ? ` sur ${total}` : ''}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl md:text-4xl font-extrabold text-primary leading-tight">{discountText(discount) || '—'}</p>
        <Title className="text-xl font-bold text-on-surface mt-2">{title || 'Titre de l’offre'}</Title>
      </div>
      {description && <p className="text-sm text-on-surface/90 whitespace-pre-line">{description}</p>}
      {sharedCode && (
        <p className="text-sm text-on-surface-variant">
          Code à saisir : <span className="font-mono font-bold text-secondary tracking-wider">{sharedCode}</span>
        </p>
      )}
      {(startsAt || endsAt) && (
        <p className="text-xs text-on-surface-variant">
          {startsAt && <>Dès le {dateText(startsAt)}. </>}
          {endsAt && <>Jusqu’au {dateText(endsAt)}.</>}
        </p>
      )}
      {children}
      {conditions && (
        <p className="text-[11px] text-on-surface-variant/80 border-t border-white/5 pt-4 whitespace-pre-line">{conditions}</p>
      )}
    </article>
  );
}

import React from 'react';
import { STATUS_LABELS, discountText } from '../../../utils/promoFormat';

const BADGE = {
  draft: 'border-white/15 text-on-surface-variant',
  active: 'border-secondary/40 text-secondary bg-secondary/10',
  paused: 'border-tertiary/40 text-tertiary bg-tertiary/10',
  archived: 'border-white/10 text-on-surface-variant/70',
};
const MODE_SHORT = { claim: 'Réclamation Google', individual: 'Codes individuels', shared: 'Code partagé' };

/** Une statistique : chiffre en grand, libellé dessous. */
const Stat = ({ value, label }) => (
  <div className="min-w-0">
    <p className="text-lg font-extrabold text-on-surface leading-tight">{value}</p>
    <p className="text-[11px] text-on-surface-variant">{label}</p>
  </div>
);

/** Liste des offres : une carte par offre, avec ses chiffres et le bouton Modifier. */
export default function CampaignList({ campaigns, onEdit }) {
  if (campaigns.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant py-12 text-center border border-dashed border-white/10 rounded-2xl">
        Aucune offre pour l’instant. Créez la première avec « Nouvelle offre ».
      </p>
    );
  }
  return (
    // minmax(0,1fr) + min-w-0 : un long lien est tronqué au lieu d'élargir la carte (débordement mobile)
    <ul className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 gap-4">
      {campaigns.map((c) => (
        <li key={c.id} className="min-w-0 bg-surface-container-low/60 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-on-surface truncate">{c.name}</h3>
              <p className="text-xs text-on-surface-variant truncate">/offre/{c.slug}</p>
            </div>
            <span className={`shrink-0 text-[10px] uppercase tracking-wider border rounded-full px-2.5 py-1 ${BADGE[c.status]}`}>
              {STATUS_LABELS[c.status]}
            </span>
          </div>
          <p className="text-sm text-on-surface">
            <span className="font-semibold text-primary">
              {discountText({ type: c.discountType, value: c.discountValue, months: c.discountMonths })}
            </span>
            <span className="text-on-surface-variant"> · {MODE_SHORT[c.mode]}</span>
          </p>
          <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
            <Stat value={c.codes} label="Codes" />
            <Stat value={c.uses} label="Utilisations" />
            <Stat value={c.remaining ?? '∞'} label="Places restantes" />
          </div>
          <button
            type="button" onClick={() => onEdit(c)}
            className="self-start inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
          >
            <i className="fa-solid fa-pen" aria-hidden="true"></i> Modifier
          </button>
        </li>
      ))}
    </ul>
  );
}

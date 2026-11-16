import React from 'react';
import { dateText } from '../../../utils/promoFormat';

/** Historique des utilisations (saisies à la main : une future clé API de B-Ledger pourra les saisir seule). */
export default function UsesList({ uses, busy, onCancel }) {
  if (uses.length === 0) return <p className="text-sm text-on-surface-variant py-8 text-center">Aucune utilisation enregistrée.</p>;
  return (
    <ul className="flex flex-col gap-2">
      {uses.map((u) => (
        <li key={u.id} className={`border border-white/10 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 min-w-0 ${u.cancelledAt ? 'opacity-60' : ''}`}>
          <div className="min-w-0">
            <p className={`font-mono font-bold text-on-surface break-all ${u.cancelledAt ? 'line-through' : ''}`}>{u.code}</p>
            <p className="text-xs text-on-surface-variant break-words">
              {dateText(u.usedAt)}{u.reference && ` · ${u.reference}`}{u.email && ` · ${u.email}`}
            </p>
          </div>
          {u.cancelledAt
            ? <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Annulée le {dateText(u.cancelledAt)}</span>
            : <button type="button" disabled={busy} onClick={() => onCancel(u)}
                className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-full border border-white/10 text-red-400 hover:border-red-400/50 disabled:opacity-40">Annuler</button>}
        </li>
      ))}
    </ul>
  );
}

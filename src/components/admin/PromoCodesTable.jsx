import React, { useMemo, useState } from 'react';

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');
const FILTERS = [['all', 'Tous'], ['active', 'Actifs'], ['used', 'Utilisés']];

/** Liste des codes avec recherche, filtre et actions (utilisé / actif, supprimer, copier). */
export default function PromoCodesTable({ claims, busy, onSetUsed, onDelete }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return claims.filter((c) => (filter === 'all' || c.status === filter)
      && (!q || c.email.includes(q) || c.code.toLowerCase().includes(q)));
  }, [claims, query, filter]);

  if (claims.length === 0) {
    return <p className="text-sm text-on-surface-variant py-10 text-center">Aucun code pour l'instant.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un e-mail ou un code" aria-label="Rechercher un code"
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/60"
        />
        <div className="flex gap-2" role="group" aria-label="Filtrer par statut">
          {FILTERS.map(([key, label]) => (
            <button key={key} type="button" onClick={() => setFilter(key)} aria-pressed={filter === key}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors focus-visible:outline focus-visible:outline-primary ${filter === key ? 'bg-primary/15 border-primary/50 text-primary' : 'border-white/10 text-on-surface-variant hover:text-on-surface'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {visible.map((c) => (
          <li key={c.id} className="grid grid-cols-1 md:grid-cols-[1.2fr_1.4fr_auto] gap-3 items-center bg-black/25 border border-white/5 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <button type="button" title="Copier le code" onClick={() => navigator.clipboard?.writeText(c.code)}
                className="font-mono text-sm text-on-surface tracking-wider hover:text-primary truncate">{c.code}</button>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${c.status === 'used' ? 'bg-white/10 text-on-surface-variant' : 'bg-secondary/15 text-secondary'}`}>
                {c.status === 'used' ? 'Utilisé' : 'Actif'}
              </span>
            </div>
            <div className="min-w-0 text-xs text-on-surface-variant">
              <p className="text-sm text-on-surface truncate">{c.email}</p>
              <p>{c.source === 'manual' ? 'Créé à la main' : 'Google'} · {fmt(c.claimedAt)}{c.usedAt ? ` · utilisé le ${fmt(c.usedAt)}` : ''}</p>
            </div>
            <div className="flex gap-2 md:justify-end">
              <button type="button" disabled={busy} onClick={() => onSetUsed(c.id, c.status !== 'used')}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-on-surface hover:border-secondary/60 disabled:opacity-40">
                {c.status === 'used' ? 'Remettre actif' : 'Marquer utilisé'}
              </button>
              <button type="button" disabled={busy} onClick={() => onDelete(c)} aria-label={`Supprimer le code ${c.code}`}
                className="px-3 py-1.5 rounded-lg text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-40">
                <i className="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p className="text-sm text-on-surface-variant text-center py-4">Aucun résultat.</p>}
    </div>
  );
}

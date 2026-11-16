import React, { useState } from 'react';
import Button from '../../Button';

const input = 'w-full mt-1 bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/60 disabled:opacity-50';

/** Création de codes : un par un ou en lot (offre « codes individuels »), ou le code unique d'un flyer (offre « partagée »). */
export default function NewCodesForm({ mode, hasCodes, busy, onCreate, onCreateShared }) {
  const [f, setF] = useState({ count: '1', email: '', note: '', code: '', maxUses: '100' });
  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.value }));

  if (mode === 'claim') {
    return <p className="text-sm text-on-surface-variant">Les codes de cette offre sont créés par les clients eux-mêmes (connexion Google). Pour en créer à la main, passez l’offre en « codes individuels » (possible tant qu’elle n’a aucun code).</p>;
  }
  if (mode === 'shared') {
    if (hasCodes) return <p className="text-sm text-on-surface-variant">Le code partagé est créé. Pour en changer, supprimez-le (tant qu’il n’a pas servi) puis recréez-le.</p>;
    return (
      <form className="grid sm:grid-cols-3 gap-3 items-end" onSubmit={(e) => { e.preventDefault(); onCreateShared({ code: f.code, maxUses: Number(f.maxUses) }); }}>
        <label className="text-xs text-on-surface-variant">Le code du flyer
          <input className={`${input} font-mono uppercase`} value={f.code} onChange={set('code')} required maxLength={32} placeholder="SALON30" /></label>
        <label className="text-xs text-on-surface-variant">Utilisations au total
          <input className={input} type="number" min="1" max="100000" required value={f.maxUses} onChange={set('maxUses')} /></label>
        <Button type="submit" variant="green" disabled={busy}>Créer le code</Button>
      </form>
    );
  }
  const single = f.count === '1';
  return (
    <form className="grid sm:grid-cols-2 gap-3" onSubmit={async (e) => {
      e.preventDefault();
      if (await onCreate({ count: Number(f.count), email: single ? f.email : '', note: f.note })) setF((o) => ({ ...o, email: '', note: '' }));
    }}>
      <label className="text-xs text-on-surface-variant">Nombre de codes (1 à 200)
        <input className={input} type="number" min="1" max="200" required value={f.count} onChange={set('count')} /></label>
      <label className="text-xs text-on-surface-variant">E-mail du destinataire {single ? '(facultatif)' : '— pas pour un lot'}
        <input className={input} type="email" disabled={!single} value={single ? f.email : ''} onChange={set('email')} placeholder="client@exemple.fr" /></label>
      <label className="text-xs text-on-surface-variant sm:col-span-2">Note interne (ex. « stand A »)
        <input className={input} maxLength={500} value={f.note} onChange={set('note')} /></label>
      <div className="sm:col-span-2"><Button type="submit" variant="green" disabled={busy}>{single ? 'Créer le code' : 'Créer le lot'}</Button></div>
    </form>
  );
}

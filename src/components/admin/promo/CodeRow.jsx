import React, { useState } from 'react';
import { CODE_STATUS, dateText } from '../../../utils/promoFormat';
import { codeLink, mailtoHref } from '../../../utils/promoShare';

const btn = 'text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-full border border-white/10 text-on-surface hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40';

/** Une ligne de la liste : le code, son statut et ses actions (copier, envoyer, utiliser, révoquer, supprimer). */
export default function CodeRow({ c, campaign, busy, actions }) {
  const [copied, setCopied] = useState(false);
  const [ref, setRef] = useState(null); // null = saisie fermée, sinon le texte de la référence
  const [label, style] = CODE_STATUS[c.status] ?? [c.status, ''];

  const copy = async () => {
    try { await navigator.clipboard.writeText(codeLink(c.code)); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { window.prompt('Copiez ce lien :', codeLink(c.code)); } // navigateur sans accès au presse-papiers
  };
  const redeem = async (e) => { e.preventDefault(); if (await actions.redeem(c.id, { reference: ref })) setRef(null); };

  return (
    <li className="border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5 min-w-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-mono font-bold text-on-surface tracking-wide break-all">{c.code}</span>
        <span className={`text-[10px] uppercase tracking-wider border rounded-full px-2.5 py-0.5 ${style}`}>{label}</span>
        <span className="text-xs text-on-surface-variant">{c.uses}/{c.maxUses} utilisation{c.maxUses > 1 ? 's' : ''}</span>
      </div>
      <p className="text-xs text-on-surface-variant break-words">
        {c.email || 'Sans e-mail'}{c.note && ` · ${c.note}`}{c.expiresAt && ` · expire le ${dateText(c.expiresAt)}`}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={copy}>{copied ? 'Lien copié ✓' : 'Copier le lien'}</button>
        {c.email && <a className={btn} href={mailtoHref(c.email, c.code, campaign)}>Envoyer par e-mail</a>}
        {c.status === 'active' && <button type="button" className={btn} disabled={busy} onClick={() => setRef('')}>Enregistrer une utilisation</button>}
        {c.status === 'revoked'
          ? <button type="button" className={btn} disabled={busy} onClick={() => actions.revoke(c.id, false)}>Réactiver</button>
          : <button type="button" className={btn} disabled={busy} onClick={() => actions.revoke(c.id, true)}>Révoquer</button>}
        {c.uses === 0 && <button type="button" className={`${btn} text-red-400`} disabled={busy} onClick={() => actions.confirmRemove(c)}>Supprimer</button>}
      </div>
      {ref !== null && (
        <form onSubmit={redeem} className="flex flex-wrap gap-2">
          <input autoFocus value={ref} onChange={(e) => setRef(e.target.value)} maxLength={200} aria-label="Référence de l’utilisation"
            placeholder="Référence (n° de facture, client…)" className="flex-1 min-w-[12rem] bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/60" />
          <button type="submit" className={btn} disabled={busy}>Valider</button>
          <button type="button" className={btn} onClick={() => setRef(null)}>Annuler</button>
        </form>
      )}
    </li>
  );
}

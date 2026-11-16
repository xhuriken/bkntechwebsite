import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import useOfferCodes from '../../../hooks/useOfferCodes';
import { offerLink } from '../../../utils/promoShare';
import CampaignEditor from './CampaignEditor';
import NewCodesForm from './NewCodesForm';
import CodeRow from './CodeRow';
import UsesList from './UsesList';

const TABS = [['settings', 'Réglages'], ['codes', 'Codes'], ['uses', 'Utilisations']];
const card = 'bg-surface-container-low/60 border border-white/10 rounded-2xl p-5 md:p-6';

/** Une offre existante : trois onglets (réglages, codes, utilisations) partageant les mêmes données. */
export default function OfferWorkspace({ campaign, busy, onSave, onDelete, onCancel, onChanged }) {
  const { openConfirmModal } = useAdmin();
  const [tab, setTab] = useState('settings');
  const o = useOfferCodes(campaign.id, onChanged);

  const actions = {
    revoke: o.revoke, redeem: o.redeem,
    confirmRemove: (c) => openConfirmModal({
      title: 'Supprimer ce code ?', message: `${c.code} sera supprimé définitivement (il n’a jamais servi).`,
      onConfirm: () => o.remove(c.id),
    }),
  };
  const cancelUse = (u) => openConfirmModal({
    title: 'Annuler cette utilisation ?', message: `${u.code} redeviendra disponible.`, onConfirm: () => o.cancelUse(u.id),
  });
  const copyOffer = () => navigator.clipboard?.writeText(offerLink(campaign.slug)).catch(() => {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sections de l’offre">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full border transition-colors ${tab === key ? 'bg-primary text-black border-primary' : 'border-white/10 text-on-surface hover:border-primary/50'}`}>
            {label}{key === 'codes' && o.codes ? ` (${o.codes.length})` : ''}{key === 'uses' && o.uses ? ` (${o.uses.length})` : ''}
          </button>
        ))}
      </div>
      {tab !== 'settings' && o.message && (
        <p role="status" className={`text-sm px-4 py-3 rounded-xl border ${o.message.type === 'error' ? 'bg-red-950/40 border-red-800/50 text-red-400' : 'bg-secondary/10 border-secondary/30 text-secondary'}`}>{o.message.text}</p>
      )}
      {/* masqué (pas démonté) : changer d'onglet ne perd pas les modifications non enregistrées */}
      <div hidden={tab !== 'settings'}>
        <CampaignEditor campaign={campaign} busy={busy} onSave={onSave} onDelete={onDelete} onCancel={onCancel} />
      </div>
      {tab === 'codes' && (
        <div className="flex flex-col gap-6">
          <section className={`${card} flex flex-wrap items-center gap-3`}>
            <p className="text-xs text-on-surface-variant">Page publique de l’offre</p>
            <code className="text-sm text-secondary break-all">{offerLink(campaign.slug)}</code>
            <button type="button" onClick={copyOffer} className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-full border border-white/10 text-on-surface hover:border-primary/50">Copier</button>
            <a href={`/api/admin/campaigns/${campaign.id}/export.csv`} download className="sm:ml-auto text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-full border border-secondary/30 text-secondary hover:bg-secondary/10">Exporter en CSV</a>
          </section>
          <section className={card}>
            <h2 className="font-bold uppercase text-sm text-on-surface mb-4">Créer des codes</h2>
            <NewCodesForm mode={campaign.mode} hasCodes={(o.codes?.length ?? 0) > 0} busy={o.busy} onCreate={o.create} onCreateShared={o.createShared} />
          </section>
          <section className={card}>
            <h2 className="font-bold uppercase text-sm text-on-surface mb-4">Codes de l’offre</h2>
            {!o.codes ? <p className="text-sm text-on-surface-variant" role="status">Chargement…</p>
              : o.codes.length === 0 ? <p className="text-sm text-on-surface-variant py-8 text-center">Aucun code pour l’instant.</p>
              : <ul className="flex flex-col gap-3">{o.codes.map((c) => <CodeRow key={c.id} c={c} campaign={campaign} busy={o.busy} actions={actions} />)}</ul>}
          </section>
        </div>
      )}
      {tab === 'uses' && (
        <section className={card}>
          <h2 className="font-bold uppercase text-sm text-on-surface mb-4">Utilisations enregistrées</h2>
          {o.uses ? <UsesList uses={o.uses} busy={o.busy} onCancel={cancelUse} /> : <p className="text-sm text-on-surface-variant" role="status">Chargement…</p>}
        </section>
      )}
    </div>
  );
}

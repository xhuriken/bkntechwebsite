import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import useCampaignsAdmin, { adminRequest } from '../hooks/useCampaignsAdmin';
import CampaignList from '../components/admin/promo/CampaignList';
import CampaignEditor from '../components/admin/promo/CampaignEditor';
import OfferWorkspace from '../components/admin/promo/OfferWorkspace';
import Button from '../components/Button';

const NEW = 'new';

/** Espace admin « Codes promo » : liste des offres, puis éditeur d'une offre (création ou modification). */
export default function AdminPromo() {
  const { isAdmin, setIsLoginModalOpen, openConfirmModal } = useAdmin();
  const { campaigns, message, busy, setMessage, save, remove } = useCampaignsAdmin(isAdmin);
  const [editing, setEditing] = useState(null); // null = liste, NEW = création, sinon l'offre ouverte
  const messageRef = useRef(null);
  useEffect(() => { // le bouton Enregistrer est en bas : on ramène le message (succès ou erreur) sous les yeux
    if (message) messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [message]);

  const open = (campaign) => { setMessage(null); editingId.current = campaign && campaign !== NEW ? campaign.id : null; setEditing(campaign); window.scrollTo({ top: 0 }); };
  const onSave = async (values) => {
    const saved = await save(editing === NEW ? null : editing.id, values);
    if (saved) { editingId.current = saved.id; setEditing(saved); } // reste sur l'offre, avec les valeurs relues du serveur
  };
  const editingId = useRef(null); // id de l'offre ouverte (lu par refreshEditing sans le recréer)
  const refreshEditing = useCallback(async () => { // compteurs et verrou du mode relus après un changement de codes
    try { if (editingId.current) setEditing(await adminRequest(`/${editingId.current}`)); }
    catch { /* la liste se rechargera au retour */ }
  }, []);
  const onDelete = (c) => openConfirmModal({
    title: 'Supprimer cette offre ?',
    message: `« ${c.name} » sera supprimée définitivement. Elle n’a encore aucun code.`,
    onConfirm: async () => { if (await remove(c.id)) setEditing(null); },
  });

  const title = editing === NEW ? 'Nouvelle offre' : editing ? editing.name : 'Codes promo';
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-8 relative z-10">
      {editing ? (
        <button type="button" onClick={() => open(null)}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface hover:text-primary mb-6">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Toutes les offres
        </button>
      ) : (
        <Link to="/portfolio/admin" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface hover:text-primary mb-6">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Administration
        </Link>
      )}
      <div className="border-b border-white/5 pb-6 mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div className="min-w-0">
          <h1 className="font-extrabold text-3xl md:text-5xl uppercase tracking-tight text-on-surface mb-2 break-words">{title}</h1>
          <p className="text-on-surface/80 text-sm">
            {editing ? 'Contenu, remise, période de validité et limites. L’aperçu se met à jour en direct.'
              : 'Vos offres promotionnelles : contenu, période, nombre de codes, utilisations.'}
          </p>
        </div>
        {isAdmin && !editing && <Button variant="primary" onClick={() => open(NEW)}>Nouvelle offre</Button>}
      </div>

      {message && (
        <p ref={messageRef} role="status" className={`mb-6 text-sm px-4 py-3 rounded-xl border ${message.type === 'error' ? 'bg-red-950/40 border-red-800/50 text-red-400' : 'bg-secondary/10 border-secondary/30 text-secondary'}`}>
          {message.text}
        </p>
      )}
      {!isAdmin ? (
        <div className="bg-surface-container-low/60 border border-white/10 rounded-2xl p-6 text-center flex flex-col items-center gap-4 max-w-md mx-auto">
          <p className="text-sm text-on-surface-variant">Cet espace est réservé à l’administrateur.</p>
          <Button variant="primary" onClick={() => setIsLoginModalOpen(true)}>Se connecter</Button>
        </div>
      ) : !campaigns ? (
        <p className="text-center text-sm text-on-surface-variant" role="status">Chargement…</p>
      ) : editing ? (
        editing === NEW
          ? <CampaignEditor key={NEW} campaign={null} busy={busy} onSave={onSave} onDelete={onDelete} onCancel={() => open(null)} />
          : <OfferWorkspace key={editing.id} campaign={editing} busy={busy} onSave={onSave} onDelete={onDelete}
              onCancel={() => open(null)} onChanged={refreshEditing} />
      ) : (
        <CampaignList campaigns={campaigns} onEdit={open} />
      )}
    </div>
  );
}

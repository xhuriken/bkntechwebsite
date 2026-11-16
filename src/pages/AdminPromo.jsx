import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import usePromoAdmin from '../hooks/usePromoAdmin';
import PromoCodesTable from '../components/admin/PromoCodesTable';
import Button from '../components/Button';

const card = 'bg-surface-container-low/60 border border-white/10 rounded-2xl p-5 md:p-6';
const field = 'bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/60';

/** Espace admin « Codes promo » : réglages de l'offre, création manuelle, liste et export. */
export default function AdminPromo() {
  const { isAdmin, setIsLoginModalOpen, openConfirmModal } = useAdmin();
  const { data, message, busy, createCode, setUsed, deleteCode, saveSettings } = usePromoAdmin(isAdmin);
  const [email, setEmail] = useState('');
  const [max, setMax] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => { // recopie les réglages du serveur dans le formulaire
    if (data) { setMax(String(data.settings.max)); setOpen(data.settings.open); }
  }, [data]);

  const used = data?.claims.filter((c) => c.status === 'used').length ?? 0;
  const confirmDelete = (c) => openConfirmModal({
    title: 'Supprimer ce code ?',
    message: `${c.code} (${c.email}) sera supprimé et la place libérée. Action définitive.`,
    onConfirm: () => deleteCode(c.id),
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-12 py-8 relative z-10">
      <Link to="/portfolio/admin" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface hover:text-primary mb-6">
        <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Administration
      </Link>
      <div className="border-b border-white/5 pb-6 mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="font-extrabold text-3xl md:text-5xl uppercase tracking-tight text-on-surface mb-2">Codes promo</h1>
          <p className="text-on-surface/80 text-sm">Offre de lancement B-Ledger : places, codes distribués, utilisation.</p>
        </div>
        {isAdmin && (
          // Vrai lien <a download> (pas un lien du routeur) : le navigateur télécharge le fichier.
          <a href="/api/admin/promo/export.csv" download
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-secondary/30 text-secondary text-[10px] uppercase tracking-[0.15em] hover:bg-secondary/10 transition-colors">
            <i className="fa-solid fa-download" aria-hidden="true"></i> Exporter CSV
          </a>
        )}
      </div>

      {!isAdmin ? (
        <div className={`${card} text-center flex flex-col items-center gap-4 max-w-md mx-auto`}>
          <p className="text-sm text-on-surface-variant">Cet espace est réservé à l’administrateur.</p>
          <Button variant="primary" onClick={() => setIsLoginModalOpen(true)}>Se connecter</Button>
        </div>
      ) : !data ? (
        <p className="text-center text-sm text-on-surface-variant" role="status">Chargement…</p>
      ) : (
        <div className="flex flex-col gap-6">
          {message && (
            <p role="status" className={`text-sm px-4 py-3 rounded-xl border ${message.type === 'error' ? 'bg-red-950/40 border-red-800/50 text-red-400' : 'bg-secondary/10 border-secondary/30 text-secondary'}`}>
              {message.text}
            </p>
          )}
          <div className="grid grid-cols-3 gap-3">
            {[['Distribués', data.claims.length], ['Utilisés', used], ['Places restantes', data.remaining]].map(([label, n]) => (
              <div key={label} className={`${card} !p-4`}>
                <p className="text-2xl font-extrabold text-on-surface">{n}</p>
                <p className="text-xs text-on-surface-variant">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <form className={`${card} flex flex-col gap-3`} onSubmit={(e) => { e.preventDefault(); saveSettings(Number(max), open); }}>
              <h2 className="font-bold uppercase text-sm text-on-surface">Réglages de l’offre</h2>
              <label className="text-xs text-on-surface-variant">Nombre de places
                <input type="number" min="0" max="1000" required value={max} onChange={(e) => setMax(e.target.value)} className={`${field} w-full mt-1`} />
              </label>
              <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} className="accent-secondary w-4 h-4" />
                Offre ouverte aux nouvelles réclamations
              </label>
              <Button type="submit" variant="green" disabled={busy}>Enregistrer</Button>
            </form>
            <form className={`${card} flex flex-col gap-3`} onSubmit={async (e) => { e.preventDefault(); if (await createCode(email)) setEmail(''); }}>
              <h2 className="font-bold uppercase text-sm text-on-surface">Créer un code à la main</h2>
              <label className="text-xs text-on-surface-variant">E-mail du client
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@exemple.fr" className={`${field} w-full mt-1`} />
              </label>
              <p className="text-xs text-on-surface-variant">Pour un client sans compte Google. Compte dans les places.</p>
              <Button type="submit" variant="primary" disabled={busy}>Créer le code</Button>
            </form>
          </div>
          <section className={card}>
            <h2 className="font-bold uppercase text-sm text-on-surface mb-4">Codes distribués</h2>
            <PromoCodesTable claims={data.claims} busy={busy} onSetUsed={setUsed} onDelete={confirmDelete} />
          </section>
        </div>
      )}
    </div>
  );
}

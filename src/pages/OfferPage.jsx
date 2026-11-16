import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import usePublicOffer from '../hooks/usePublicOffer';
import OfferCard from '../components/promo/OfferCard';
import ClaimZone from '../components/promo/ClaimZone';

const wrap = 'w-full max-w-xl mx-auto px-4 sm:px-6 py-12 relative z-10';

/** Pour une offre à codes individuels : saisir le code reçu pour ouvrir sa page. */
function CodeLookup() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  return (
    <form className="flex flex-col sm:flex-row gap-2 border-t border-white/5 pt-5"
      onSubmit={(e) => { e.preventDefault(); if (code.trim()) navigate(`/code/${encodeURIComponent(code.trim().toUpperCase())}`); }}>
      <label className="sr-only" htmlFor="code-recu">Votre code</label>
      <input id="code-recu" value={code} onChange={(e) => setCode(e.target.value)} maxLength={40} placeholder="Vous avez reçu un code ? Saisissez-le"
        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-primary/60" />
      <button type="submit" className="px-5 py-2.5 rounded-full bg-primary text-black text-[11px] font-semibold uppercase tracking-[0.15em]">Vérifier</button>
    </form>
  );
}

/**
 * Page publique d'une offre : /offre/<lien>. L'ancienne adresse /b-ledger/offre (QR codes déjà
 * imprimés) affiche la même page avec le lien de l'offre de lancement, passé en `slug`.
 */
export default function OfferPage({ slug: fixedSlug }) {
  const params = useParams();
  const slug = fixedSlug ?? params.slug;
  const { offer, claim, submit } = usePublicOffer(slug);

  if (offer === undefined) return <p className="text-center text-sm text-on-surface-variant py-16" role="status">Chargement de l’offre…</p>;
  if (offer === null) {
    return (
      <div className={`${wrap} text-center flex flex-col gap-4`}>
        <h1 className="text-3xl font-extrabold text-on-surface">Offre introuvable</h1>
        <p className="text-sm text-on-surface-variant">Ce lien ne correspond à aucune offre en cours.</p>
        <Link to="/" className="text-primary underline underline-offset-4 text-sm">Retour à l’accueil</Link>
      </div>
    );
  }
  return (
    <div className={wrap}>
      <OfferCard offer={offer} headingLevel={1}>
        {offer.mode === 'claim' && <ClaimZone offer={offer} claim={claim} onCredential={submit} />}
        {offer.mode === 'individual' && <CodeLookup />}
      </OfferCard>
    </div>
  );
}

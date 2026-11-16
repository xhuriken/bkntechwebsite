import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CopyCode from '../components/promo/CopyCode';
import { discountText, dateText } from '../utils/promoFormat';

// Statut public (le serveur regroupe « révoqué » et « offre inactive » en « unavailable »).
const STATUS = {
  active: ['Valide', 'border-secondary/40 text-secondary', 'Ce code est valide : utilisez-le lors de votre abonnement.'],
  upcoming: ['Bientôt valide', 'border-primary/40 text-primary', 'Ce code sera utilisable à partir de la date indiquée.'],
  used: ['Déjà utilisé', 'border-white/20 text-on-surface-variant', 'Ce code a déjà été utilisé.'],
  expired: ['Expiré', 'border-tertiary/40 text-tertiary', 'La période de validité de ce code est terminée.'],
  unavailable: ['Indisponible', 'border-red-500/40 text-red-400', 'Ce code n’est plus utilisable. Contactez-nous si vous pensez qu’il s’agit d’une erreur.'],
};

/**
 * Page publique d'un code : /code/<CODE> (le lien envoyé au client). Elle montre seulement le code,
 * son statut et l'offre : jamais l'e-mail ni la note. Le serveur limite les consultations (anti-devinette).
 */
export default function CodePage() {
  const { code } = useParams();
  const [data, setData] = useState(undefined); // undefined = chargement, null = introuvable
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setData(undefined); setError(null);
    fetch(`/api/promo/codes/${encodeURIComponent(code)}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.ok) return setData(await res.json());
        if (res.status === 429) setError('Trop de recherches. Réessayez dans quelques minutes.');
        setData(null);
      })
      .catch((e) => { if (e.name !== 'AbortError') { setError('Une erreur est survenue. Réessayez dans un instant.'); setData(null); } });
    return () => controller.abort();
  }, [code]);

  const wrap = 'w-full max-w-xl mx-auto px-4 sm:px-6 py-12 relative z-10';
  if (data === undefined) return <p className="text-center text-sm text-on-surface-variant py-16" role="status">Vérification du code…</p>;
  if (data === null) {
    return (
      <div className={`${wrap} text-center flex flex-col gap-4`}>
        <h1 className="text-3xl font-extrabold text-on-surface">{error ? 'Vérification impossible' : 'Code introuvable'}</h1>
        <p className="text-sm text-on-surface-variant">{error || 'Vérifiez l’orthographe du code : lettres, chiffres et tirets.'}</p>
        <Link to="/" className="text-primary underline underline-offset-4 text-sm">Retour à l’accueil</Link>
      </div>
    );
  }
  const [label, style, help] = STATUS[data.status] ?? STATUS.unavailable;
  return (
    <div className={wrap}>
      <article className="bg-surface-container-low/80 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center gap-5 text-center">
        <span className={`text-[10px] uppercase tracking-[0.15em] border rounded-full px-3 py-1 ${style}`}>{label}</span>
        <h1 className="sr-only">Votre code promotionnel</h1>
        <CopyCode code={data.code} />
        <p className="text-sm text-on-surface/90">{help}</p>
        <div className="w-full border-t border-white/5 pt-5 flex flex-col gap-2">
          <p className="text-2xl font-extrabold text-primary">{discountText(data.offer.discount)}</p>
          <p className="font-bold text-on-surface">{data.offer.title}</p>
          {data.usesLeft !== null && <p className="text-xs text-on-surface-variant">{data.usesLeft} utilisation{data.usesLeft > 1 ? 's' : ''} restante{data.usesLeft > 1 ? 's' : ''}</p>}
          {(data.validFrom || data.validUntil) && (
            <p className="text-xs text-on-surface-variant">
              {data.validFrom && <>Dès le {dateText(data.validFrom)}. </>}{data.validUntil && <>Jusqu’au {dateText(data.validUntil)}.</>}
            </p>
          )}
          {data.offer.conditions && <p className="text-[11px] text-on-surface-variant/80 whitespace-pre-line mt-2">{data.offer.conditions}</p>}
        </div>
      </article>
    </div>
  );
}

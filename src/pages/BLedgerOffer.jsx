import { useState } from 'react';
import GoogleSignInButton from '../components/GoogleSignInButton';
import useOfferClaim from '../hooks/useOfferClaim';

// Identifiant client public (pas un secret) : fourni au build par VITE_GOOGLE_CLIENT_ID.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const MESSAGES = {
  full: 'Les 10 places sont déjà prises. Merci pour votre intérêt !',
  invalid: 'La connexion Google n’a pas pu être vérifiée. Réessayez.',
  toomany: 'Trop d’essais. Patientez quelques minutes avant de recommencer.',
  error: 'Une erreur est survenue. Réessayez dans un instant.',
};

function CodeCard({ code, already }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard?.writeText(code).then(() => setCopied(true)).catch(() => {});
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-on-surface-variant">{already ? 'Vous avez déjà réclamé l’offre. Voici votre code :' : 'C’est réservé ! Voici votre code personnel :'}</p>
      <p className="font-mono text-2xl md:text-3xl tracking-widest text-secondary select-all">{code}</p>
      <button type="button" onClick={copy} className="font-mono text-sm text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        {copied ? 'Code copié' : 'Copier le code'}
      </button>
      <p className="text-sm text-on-surface-variant">À utiliser lors de votre abonnement B-Ledger Solo. Conservez-le : en vous reconnectant ici, vous le retrouverez.</p>
    </div>
  );
}

export default function BLedgerOffer() {
  const { remaining, state, claim } = useOfferClaim();
  const hasCode = state.status === 'claimed' || state.status === 'already';
  const closed = remaining === 0 && !hasCode;
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-16 text-center z-10 relative">
      <div className="rounded-2xl border border-white/10 bg-surface-container-low/60 backdrop-blur-xl p-8 md:p-12 shadow-2xl">
        <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">B-Ledger : -50 % pendant 3 mois</h1>
        <p className="text-on-surface-variant text-lg mb-2">Sur l’offre Solo à 29 €/mois, réservée aux 10 premiers.</p>
        {remaining !== null && !hasCode && (
          <p className="font-mono text-sm text-tertiary mb-8">{remaining > 0 ? `${remaining} place${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''} sur 10` : 'Complet'}</p>
        )}
        <div aria-live="polite" className="flex flex-col items-center gap-4 mt-8">
          {hasCode && <CodeCard code={state.code} already={state.status === 'already'} />}
          {!hasCode && (closed || state.status === 'full') && <p>{MESSAGES.full}</p>}
          {!hasCode && !closed && state.status !== 'full' && (CLIENT_ID
            ? <GoogleSignInButton clientId={CLIENT_ID} onCredential={claim} disabled={state.status === 'loading'} />
            : <p role="alert" className="text-sm text-red-400">L’offre n’est pas disponible pour le moment.</p>)}
          {state.status === 'loading' && <p className="font-mono text-sm">Réservation en cours…</p>}
          {MESSAGES[state.status] && state.status !== 'full' && <p role="alert" className="text-sm text-red-400">{MESSAGES[state.status]}</p>}
        </div>
        {!hasCode && <p className="mt-8 text-xs text-on-surface-variant">Nous gardons uniquement votre identifiant Google, votre e-mail et la date de réservation, pour attribuer le code et éviter les doublons.</p>}
      </div>
    </div>
  );
}

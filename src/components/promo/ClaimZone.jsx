import React from 'react';
import { Link } from 'react-router-dom';
import GoogleSignInButton from '../GoogleSignInButton';
import CopyCode from './CopyCode';

// Identifiant client public (pas un secret) : fourni au build par VITE_GOOGLE_CLIENT_ID.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const MESSAGES = {
  full: 'Toutes les places sont prises. Merci pour votre intérêt !',
  ended: 'Cette offre est terminée.',
  upcoming: 'Cette offre n’a pas encore commencé : revenez à la date indiquée.',
  paused: 'Cette offre est momentanément en pause.',
  invalid: 'La connexion Google n’a pas pu être vérifiée. Réessayez.',
  toomany: 'Trop d’essais. Patientez quelques minutes avant de recommencer.',
  unavailable: 'La réservation est momentanément indisponible.',
  unknown: 'Cette offre n’existe plus.',
  error: 'Une erreur est survenue. Réessayez dans un instant.',
};

/** Zone de réclamation d'une offre « un code par compte Google ». */
export default function ClaimZone({ offer, claim, onCredential }) {
  const hasCode = claim.status === 'claimed' || claim.status === 'already';
  const closed = offer.state !== 'open';
  return (
    <div aria-live="polite" className="flex flex-col items-center gap-4 text-center border-t border-white/5 pt-5">
      {hasCode && (
        <>
          <p className="text-sm text-on-surface-variant">
            {claim.status === 'already' ? 'Vous avez déjà réclamé cette offre. Voici votre code :' : 'C’est réservé ! Voici votre code personnel :'}
          </p>
          <CopyCode code={claim.code} />
          <p className="text-xs text-on-surface-variant">
            Conservez-le : en vous reconnectant ici, vous le retrouverez.{' '}
            <Link to={`/code/${claim.code}`} className="text-primary underline underline-offset-4">Voir la page du code</Link>
          </p>
        </>
      )}
      {!hasCode && closed && <p className="text-sm">{MESSAGES[offer.state]}</p>}
      {!hasCode && !closed && (CLIENT_ID
        ? <GoogleSignInButton clientId={CLIENT_ID} onCredential={onCredential} disabled={claim.status === 'loading'} />
        : <p role="alert" className="text-sm text-red-400">{MESSAGES.unavailable}</p>)}
      {claim.status === 'loading' && <p className="font-mono text-sm">Réservation en cours…</p>}
      {MESSAGES[claim.status] && claim.status !== offer.state && <p role="alert" className="text-sm text-red-400">{MESSAGES[claim.status]}</p>}
      {!hasCode && !closed && (
        <p className="text-[11px] text-on-surface-variant max-w-md">
          Nous gardons uniquement votre identifiant Google, vos prénom et nom, votre e-mail et la date de réservation, pour attribuer le code, savoir à qui il appartient et éviter les doublons.{' '}
          <Link to="/politique-de-confidentialite" className="underline underline-offset-2">En savoir plus</Link>
        </p>
      )}
    </div>
  );
}

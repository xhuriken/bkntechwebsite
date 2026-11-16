/**
 * Vérification côté serveur du jeton d'identité Google (« ID token »).
 * Le navigateur reçoit ce jeton après « Se connecter avec Google » et nous l'envoie.
 * On ne croit JAMAIS ce que dit le navigateur : seule la signature de Google fait foi.
 * Bibliothèque officielle de Google : elle contrôle la signature (clés publiques
 * de Google), l'émetteur (accounts.google.com), le destinataire (notre client ID)
 * et la date d'expiration.
 */
import { OAuth2Client } from 'google-auth-library';

// Un vrai jeton Google fait ~1 000 caractères : au-delà, c'est une tentative d'abus.
const MAX_TOKEN_LENGTH = 4096;

// Nom venant de Google : on retire les caractères de contrôle et on borne la longueur (100).
const cleanName = (v) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 100) : '');

/**
 * Fabrique la fonction de vérification.
 * @param {string} clientId  ID client OAuth (variable GOOGLE_CLIENT_ID).
 * @param {object} client    Injectable pour les tests ; par défaut le vrai client Google.
 * @returns {(idToken: unknown) => Promise<{ sub, email, firstName, lastName } | null>}
 */
export function createGoogleVerifier(clientId, client = new OAuth2Client()) {
  // Échouer fermé : sans client ID, la fonction refuse de démarrer.
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID manquant : réclamation désactivée');

  return async function verifyGoogleIdToken(idToken) {
    if (typeof idToken !== 'string' || idToken.length > MAX_TOKEN_LENGTH) return null;
    try {
      // audience : refuse un jeton émis pour UN AUTRE site (sinon n'importe quel
      // site utilisant Google Sign-In pourrait rejouer ses jetons chez nous).
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      const payload = ticket.getPayload();
      // E-mail non vérifié par Google : on ne peut pas savoir à qui il appartient.
      if (!payload?.sub || !payload.email || payload.email_verified !== true) return null;
      // Prénom et nom du compte (champs « given_name » / « family_name » du jeton signé) ;
      // certains comptes n'ont qu'un nom complet (« name ») : il va alors dans le prénom.
      let firstName = cleanName(payload.given_name);
      const lastName = cleanName(payload.family_name);
      if (!firstName && !lastName) firstName = cleanName(payload.name);
      return { sub: payload.sub, email: payload.email.toLowerCase(), firstName, lastName };
    } catch {
      // Signature fausse, jeton expiré, mauvais destinataire… : simple refus,
      // sans renvoyer le détail de l'erreur à l'appelant.
      return null;
    }
  };
}

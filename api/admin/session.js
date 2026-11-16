/**
 * Point unique de contrôle « est-ce l'admin ? », partagé par toutes les routes protégées
 * (posts, settings, upload, réclamations promo). Une seule instance de sessions pour l'API.
 */
import { createSessionStore, readCookie, isSameOrigin } from './auth.js';

export const adminSessions = createSessionStore();

/**
 * Vrai si la requête porte une session admin valide.
 * Pour une requête qui MODIFIE (tout sauf GET/HEAD), l'origine doit aussi être le site.
 */
export function isAdminRequest(req, store = adminSessions) {
  if (!store.isValid(readCookie(req))) return false;
  const readOnly = req.method === 'GET' || req.method === 'HEAD';
  return readOnly || isSameOrigin(req);
}

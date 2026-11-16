import { useCallback, useEffect, useState } from 'react';
import { adminRequest } from './useCampaignsAdmin';

/**
 * Codes et utilisations d'UNE offre. Toutes les règles (plafond, usage unique, e-mail valide)
 * sont vérifiées par le serveur ; ici on lance l'action, on affiche son message, on recharge.
 * `onChanged` prévient la page (les compteurs de l'offre ont bougé).
 */
export default function useOfferCodes(id, onChanged) {
  const [codes, setCodes] = useState(null);
  const [uses, setUses] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      const [c, u] = await Promise.all([adminRequest(`/${id}/codes`), adminRequest(`/${id}/redemptions`)]);
      setCodes(c); setUses(u);
    } catch (error) { setMessage({ type: 'error', text: error.message }); }
  }, [id]);
  useEffect(() => { reload(); }, [reload]);

  const run = useCallback(async (path, options, ok) => {
    setBusy(true); setMessage(null);
    try {
      const result = await adminRequest(path, options);
      setMessage({ type: 'success', text: typeof ok === 'function' ? ok(result) : ok });
      await reload(); onChanged?.();
      return result;
    } catch (error) { setMessage({ type: 'error', text: error.message }); return null; }
    finally { setBusy(false); }
  }, [reload, onChanged]);

  const send = (method, path, body, ok) => run(path, { method, body }, ok);
  return {
    codes, uses, message, busy, setMessage,
    create: (body) => send('POST', `/${id}/codes`, body, (r) => `${r.codes.length} code(s) créé(s).`),
    createShared: (body) => send('POST', `/${id}/shared`, body, (r) => `Code partagé créé : ${r.code}`),
    revoke: (codeId, revoked) => send('PATCH', `/codes/${codeId}`, { revoked }, revoked ? 'Code révoqué.' : 'Code réactivé.'),
    remove: (codeId) => send('DELETE', `/codes/${codeId}`, undefined, 'Code supprimé.'),
    redeem: (codeId, body) => send('POST', `/codes/${codeId}/redeem`, body, 'Utilisation enregistrée.'),
    cancelUse: (useId) => send('DELETE', `/redemptions/${useId}`, undefined, 'Utilisation annulée : le code redevient disponible.'),
  };
}

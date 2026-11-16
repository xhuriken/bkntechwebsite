import { useCallback, useEffect, useState } from 'react';

const BASE = '/api/admin/promo';

/** Appel JSON vers l'API admin (le cookie de session part tout seul : même origine). */
async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

/**
 * État et actions de l'espace « Codes promo ».
 * Toutes les règles (places, e-mail valide, droits) sont vérifiées par le serveur :
 * ici on affiche seulement ses réponses.
 */
export default function usePromoAdmin(enabled) {
  const [data, setData] = useState(null); // { claims, settings, remaining }
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      setData(await request('/'));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }, []);

  useEffect(() => {
    if (enabled) reload();
    else setData(null);
  }, [enabled, reload]);

  /** Lance une action, affiche le résultat puis recharge la liste. */
  const run = useCallback(async (action, successText) => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await action();
      setMessage({ type: 'success', text: typeof successText === 'function' ? successText(result) : successText });
      await reload();
      return true;
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      return false;
    } finally {
      setBusy(false);
    }
  }, [reload]);

  return {
    data, message, busy,
    createCode: (email) => run(() => request('/codes', { method: 'POST', body: { email } }), (r) => `Code créé : ${r.code}`),
    setUsed: (id, used) => run(() => request(`/codes/${id}`, { method: 'PATCH', body: { used } }), used ? 'Code marqué utilisé.' : 'Code remis à actif.'),
    deleteCode: (id) => run(() => request(`/codes/${id}`, { method: 'DELETE' }), 'Code supprimé, place libérée.'),
    saveSettings: (max, open) => run(() => request('/settings', { method: 'PUT', body: { max, open } }), 'Réglages enregistrés.'),
  };
}

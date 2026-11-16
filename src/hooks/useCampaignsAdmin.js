import { useCallback, useEffect, useState } from 'react';

const BASE = '/api/admin/campaigns';

/** Appel JSON vers l'API admin (le cookie de session part tout seul : même origine). */
export async function adminRequest(path, { method = 'GET', body } = {}) {
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
 * Liste des offres et actions de base (créer, modifier, supprimer).
 * Les règles (lien unique, dates, mode verrouillé, droits) sont vérifiées par le serveur :
 * l'interface affiche ses réponses, elle ne décide de rien.
 */
export default function useCampaignsAdmin(enabled) {
  const [campaigns, setCampaigns] = useState(null);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      setCampaigns(await adminRequest('/'));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }, []);

  useEffect(() => {
    if (enabled) reload();
    else setCampaigns(null);
  }, [enabled, reload]);

  /** Lance une action, affiche le résultat, recharge la liste ; renvoie le résultat ou null. */
  const run = useCallback(async (action, successText) => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await action();
      setMessage({ type: 'success', text: successText });
      await reload();
      return result;
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      return null;
    } finally {
      setBusy(false);
    }
  }, [reload]);

  return {
    campaigns, message, busy, setMessage,
    save: (id, values) => (id
      ? run(() => adminRequest(`/${id}`, { method: 'PUT', body: values }), 'Offre enregistrée.')
      : run(() => adminRequest('/', { method: 'POST', body: values }), 'Offre créée.')),
    remove: (id) => run(() => adminRequest(`/${id}`, { method: 'DELETE' }), 'Offre supprimée.'),
  };
}

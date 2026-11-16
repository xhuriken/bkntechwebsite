import { useCallback, useEffect, useState } from 'react';

// Réponse HTTP de la réclamation -> état de l'écran (« claimed » et « already » arrivent avec un code).
const FAILURES = { 401: 'invalid', 404: 'unknown', 429: 'toomany', 503: 'unavailable' };

/**
 * Lit une offre publique (/api/promo/offers/:slug) et envoie la réclamation Google.
 * offer : undefined = chargement, null = introuvable (ou brouillon : même réponse), sinon l'offre.
 */
export default function usePublicOffer(slug) {
  const [offer, setOffer] = useState(undefined);
  const [claim, setClaim] = useState({ status: 'idle', code: null });

  const load = useCallback(async (signal) => {
    try {
      const res = await fetch(`/api/promo/offers/${encodeURIComponent(slug)}`, { signal });
      setOffer(res.ok ? await res.json() : null);
    } catch (error) {
      if (error.name !== 'AbortError') setOffer(null);
    }
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();
    setOffer(undefined);
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  /** Le jeton Google part au serveur, qui le vérifie : l'identité ne vient jamais du navigateur. */
  const submit = useCallback(async (idToken) => {
    setClaim({ status: 'loading', code: null });
    try {
      const res = await fetch(`/api/promo/offers/${encodeURIComponent(slug)}/claim`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setClaim({ status: data.status, code: data.code });
      else setClaim({ status: res.status === 409 ? data.status || 'full' : FAILURES[res.status] || 'error', code: null });
      if (res.ok || res.status === 409) load(); // places restantes à jour
    } catch {
      setClaim({ status: 'error', code: null });
    }
  }, [slug, load]);

  return { offer, claim, submit };
}

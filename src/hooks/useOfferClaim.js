import { useCallback, useEffect, useState } from 'react';

// Statut -> état de l'écran. Les statuts 'claimed' et 'already' arrivent avec un code.
const FAILURES = { 401: 'invalid', 429: 'toomany' };

/** Lit les places restantes et envoie la réclamation au serveur (/api/promo). */
export default function useOfferClaim() {
  const [remaining, setRemaining] = useState(null); // null = pas encore connu
  const [state, setState] = useState({ status: 'idle', code: null });

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/promo', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setRemaining(Number.isInteger(data.remaining) ? data.remaining : null))
      .catch(() => {}); // pas bloquant : le compteur reste simplement masqué
    return () => controller.abort();
  }, []);

  const claim = useCallback(async (idToken) => {
    setState({ status: 'loading', code: null });
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return setState({ status: data.status, code: data.code });
      if (res.status === 409) { setRemaining(0); return setState({ status: 'full', code: null }); }
      setState({ status: FAILURES[res.status] || 'error', code: null });
    } catch {
      setState({ status: 'error', code: null });
    }
  }, []);

  return { remaining, state, claim };
}

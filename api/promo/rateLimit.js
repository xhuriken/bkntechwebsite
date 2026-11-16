/**
 * Limiteur de débit minimal : au plus `max` essais par `windowMs` et par clé (l'adresse IP).
 * Gardé en mémoire : suffisant pour une seule instance d'API (c'est notre cas).
 * L'horloge est injectable pour tester sans attendre.
 */

/**
 * Clé de limitation. Un abonné IPv6 reçoit un bloc /64 entier (des milliards d'adresses) :
 * limiter par adresse complète se contournerait en changeant d'adresse à chaque essai.
 */
export function limiterKey(ip) {
  if (!ip.includes(':') || ip.includes('.')) return ip; // IPv4 (ou IPv4 « mappée »)
  const [head, tail = ''] = ip.split('::');
  const groups = head.split(':').filter(Boolean);
  const after = tail.split(':').filter(Boolean);
  while (groups.length + after.length < 8 && ip.includes('::')) groups.push('0');
  return [...groups, ...after].slice(0, 4).map((g) => g.toLowerCase().replace(/^0+(?=.)/, '')).join(':') + '::/64';
}

export function createRateLimiter({ max = 10, windowMs = 10 * 60 * 1000, now = Date.now } = {}) {
  const hits = new Map(); // clé -> { count, resetAt }
  let lastSweep = 0;

  return function allow(key) {
    const t = now();
    // Ménage au plus une fois par fenêtre (pas à chaque requête : coût O(n) évité).
    if (t - lastSweep >= windowMs) {
      lastSweep = t;
      for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
    }
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= t) {
      hits.set(key, { count: 1, resetAt: t + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= max;
  };
}

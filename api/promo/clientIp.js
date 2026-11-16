/**
 * IP réelle du visiteur, pour les limiteurs de débit.
 * Chaîne de proxys : visiteur -> Traefik -> nginx -> API. Traefik remplace tout X-Forwarded-For
 * envoyé par le visiteur par l'IP réelle, puis nginx AJOUTE l'IP de Traefik : la valeur fiable
 * est donc l'avant-dernière, jamais la première (falsifiable par le visiteur).
 * X-Real-IP (posée par nginx) serait l'IP de Traefik pour tout le monde : inutilisable.
 */
export function clientIp(req) {
  const hops = String(req.headers?.['x-forwarded-for'] || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (hops.length >= 2) return hops[hops.length - 2];
  return req.socket?.remoteAddress || 'inconnue';
}

/**
 * Modification PARTIELLE d'un article du portfolio (outils MCP) : seuls les champs envoyés changent,
 * tout le reste de l'article (date, commentaires, changelog, extra…) est conservé tel quel.
 * Liste blanche stricte : un champ inconnu est refusé, pas ignoré (une faute de frappe se voit).
 */
export const CATEGORIES = ['software', 'website', 'ai-agent', 'mobile', 'gaming'];
const LIMITS = { title: 200, description: 1000, content: 20000 };
// Média : une page du site (/portfolio/…, /uploads/…) ou une adresse https. Jamais javascript:, data:…
const MEDIA_URL = /^(\/(portfolio|uploads)\/[\w./-]+|https:\/\/[^\s"'<>]+)$/;

function text(value, max, name) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${name} : texte de 1 à ${max} caractères.`);
  return value;
}
function bilingual(value, max, name) {
  if (!value || typeof value !== 'object') throw new Error(`${name} : objet { fr, en } attendu.`);
  const extra = Object.keys(value).filter((k) => k !== 'fr' && k !== 'en');
  if (extra.length) throw new Error(`${name} : seules les clés fr et en sont acceptées.`);
  return { ...(value.fr !== undefined && { fr: text(value.fr, max, `${name}.fr`) }),
    ...(value.en !== undefined && { en: text(value.en, max, `${name}.en`) }) };
}
function mediaUrl(value, name) {
  if (typeof value !== 'string' || value.length > 500 || !MEDIA_URL.test(value)) {
    throw new Error(`${name} : chemin /portfolio/… ou /uploads/…, ou adresse https.`);
  }
  return value;
}

const RULES = {
  category: (v) => { if (!CATEGORIES.includes(v)) throw new Error(`category : ${CATEGORIES.join(', ')}.`); return v; },
  type: (v) => text(v, 80, 'type'),
  date: (v) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) throw new Error('date : AAAA-MM-JJ.'); return v; },
  mediaType: (v) => { if (!['image', 'video', 'none'].includes(v)) throw new Error('mediaType : image, video ou none.'); return v; },
  mediaUrl: (v) => mediaUrl(v, 'mediaUrl'),
  slots: (v) => {
    if (!Array.isArray(v) || v.length > 12) throw new Error('slots : liste de 0 à 12 médias.');
    return v.map((s, i) => {
      if (!s || !['image', 'video'].includes(s.type)) throw new Error(`slots[${i}].type : image ou video.`);
      return { type: s.type, url: mediaUrl(s.url, `slots[${i}].url`) };
    });
  },
  tags: (v) => {
    if (!Array.isArray(v) || v.length > 15) throw new Error('tags : liste de 0 à 15 mots.');
    return v.map((t, i) => text(t, 40, `tags[${i}]`));
  },
  title: (v) => bilingual(v, LIMITS.title, 'title'),
  description: (v) => bilingual(v, LIMITS.description, 'description'),
  content: (v) => bilingual(v, LIMITS.content, 'content'),
};
const BILINGUAL = ['title', 'description', 'content'];

/** Renvoie le nouvel article, ou lève une erreur lisible (message renvoyé tel quel à l'IA). */
export function patchPost(post, changes) {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) throw new Error('Corps JSON attendu.');
  const keys = Object.keys(changes);
  if (!keys.length) throw new Error('Aucun champ à modifier.');
  const unknown = keys.filter((k) => !RULES[k]);
  if (unknown.length) throw new Error(`Champ(s) non modifiable(s) : ${unknown.join(', ')}.`);
  const next = { ...post };
  for (const key of keys) {
    const value = RULES[key](changes[key]);
    next[key] = BILINGUAL.includes(key) ? { ...post[key], ...value } : value; // fr seul : en conservé
  }
  return next;
}

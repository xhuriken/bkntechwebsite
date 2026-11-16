/**
 * Outils MCP des ARTICLES du portfolio : lister, lire, modifier (partiellement).
 * Pas de création ni de suppression : elles restent dans l'admin du site.
 * Les schémas guident l'IA ; le serveur revalide tout (api/posts/patchPost.js).
 */
import { z } from 'zod';
import { postsApi, tool, SITE } from './client.mjs';

const postId = z.string().regex(/^\d{1,20}$/).describe('Identifiant de l’article (voir list_posts).');
const bilingual = (max) => z.object({ fr: z.string().max(max).optional(), en: z.string().max(max).optional() })
  .describe('Texte en français (fr) et/ou anglais (en) ; une langue absente est conservée.');
const media = z.string().max(500).describe('Chemin d’un fichier du site (/portfolio/… ou /uploads/…) ou adresse https.');
const fields = {
  category: z.enum(['software', 'website', 'ai-agent', 'mobile', 'gaming'])
    .describe('software = Logiciels ; website = Sites web ; ai-agent = Agents IA ; mobile = Applications mobiles ; gaming = devlog du jeu.'),
  type: z.string().max(80).describe('Petit libellé du projet (ex. « Logiciel SaaS & MCP »).'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Date affichée, AAAA-MM-JJ (sert aussi au tri).'),
  mediaType: z.enum(['image', 'video', 'none']).describe('Type du média principal.'),
  mediaUrl: media,
  slots: z.array(z.object({ type: z.enum(['image', 'video']), url: media })).max(12)
    .describe('Galerie complète (remplace l’ancienne) : 2 médias ou plus pour afficher l’onglet Galerie.'),
  tags: z.array(z.string().max(40)).max(15).describe('Mots-clés affichés (remplace la liste).'),
  title: bilingual(200), description: bilingual(1000), content: bilingual(20000),
};
const sectionLink = (category) => `${SITE}/portfolio/section/${category}`;
const READ = { readOnlyHint: true, openWorldHint: true };

export function registerPostTools(server) {
  server.registerTool('list_posts', {
    title: 'Lister les articles du portfolio', annotations: READ,
    description: 'Liste les articles du portfolio de bkntech.fr : id, catégorie, date, titre, image principale.',
  }, tool(async () => postsApi('GET', '/')));

  server.registerTool('get_post', {
    title: 'Lire un article', annotations: READ, inputSchema: { postId },
    description: 'Article complet (textes fr/en, médias, tags…), à lire avant de le modifier.',
  }, tool(async ({ postId: id }) => postsApi('GET', `/${id}`)));

  server.registerTool('update_post', {
    title: 'Modifier un article',
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    description: 'Modifie seulement les champs fournis ; le reste de l’article est conservé. '
      + 'Les médias doivent déjà exister sur le site. Renvoie l’article modifié et le lien de sa section.',
    inputSchema: { postId, ...Object.fromEntries(Object.entries(fields).map(([k, s]) => [k, s.optional()])) },
  }, tool(async ({ postId: id, ...changes }) => {
    const post = await postsApi('PATCH', `/${id}`, changes);
    return { ...post, sectionLink: sectionLink(post.category) };
  }));
}

/** Tests de /admin/posts : accès par clé dédiée, modification partielle, liste blanche, rien d'autre. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPostsAdminHandler } from './adminRouter.js';
import { createApiKeyCheck, generateApiKey, hashApiKey } from '../promo/admin/apiKey.js';

const KEY = generateApiKey('bkc');
const POST = { id: '42', category: 'website', date: '2026-08-28', mediaUrl: 'https://img.test/a.jpg', commentsCount: 3,
  title: { fr: 'Ancien', en: 'Old' }, description: { fr: 'd', en: 'd' }, content: { fr: 'c', en: 'c' }, extra: { techStack: 'Next' } };

function setup({ isAdmin = () => false } = {}) {
  let saved = [structuredClone(POST)];
  const store = { read: () => structuredClone(saved), write: (p) => { saved = p; } };
  const route = createPostsAdminHandler({ store, isAdmin,
    checkApiKey: createApiKeyCheck({ keyHash: hashApiKey(KEY), prefix: 'bkc' }) });
  const call = (method, path, body, key = KEY) => {
    const out = {};
    const res = { setHeader() {}, status: (c) => ((out.status = c), res), json: (b) => ((out.body = b), res) };
    route({ method, path, body, headers: key ? { authorization: `Bearer ${key}` } : {}, socket: { remoteAddress: '203.0.113.9' } }, res);
    return out;
  };
  return { call, saved: () => saved };
}

test('sans clé ni session : refusé ; clé promo (bkp_) : refusée ; session admin : acceptée', () => {
  assert.equal(setup().call('GET', '/', undefined, null).status, 401);
  assert.equal(setup().call('GET', '/', undefined, generateApiKey('bkp')).status, 401);
  assert.equal(setup({ isAdmin: () => true }).call('GET', '/', undefined, null).status, 200);
});

test('une clé fausse ne se rabat jamais sur la session admin', () => {
  assert.equal(setup({ isAdmin: () => true }).call('GET', '/', undefined, generateApiKey('bkc')).status, 401);
});

test('liste résumée et article complet', () => {
  const { call } = setup();
  assert.deepEqual(call('GET', '/').body, [{ id: '42', category: 'website', date: '2026-08-28', title: 'Ancien', mediaUrl: POST.mediaUrl }]);
  assert.equal(call('GET', '/42').body.extra.techStack, 'Next');
  assert.equal(call('GET', '/99').status, 404);
  assert.equal(call('GET', '/../etc').status, 404);
});

test('modification partielle : le reste de l’article est conservé, fr seul garde en', () => {
  const { call, saved } = setup();
  const slots = [{ type: 'image', url: '/portfolio/bboard/tableau.webp' }];
  const r = call('PATCH', '/42', { category: 'software', mediaType: 'image', mediaUrl: '/portfolio/bboard/tableau.webp', slots, title: { fr: 'Nouveau' } });
  assert.equal(r.status, 200);
  const [post] = saved();
  assert.deepEqual([post.category, post.title.fr, post.title.en, post.commentsCount, post.extra.techStack], ['software', 'Nouveau', 'Old', 3, 'Next']);
  assert.deepEqual(post.slots, slots);
});

test('liste blanche : champ inconnu, catégorie, URL dangereuse ou méthode refusés, rien n’est écrit', () => {
  const { call, saved } = setup();
  for (const body of [{ id: '7' }, { commentsCount: 0 }, { category: 'autre' }, { mediaUrl: 'javascript:alert(1)' },
    { slots: [{ type: 'image', url: 'data:text/html,x' }] }, { title: { fr: 'x', de: 'y' } }, {}, null]) {
    assert.equal(call('PATCH', '/42', body).status, 400, JSON.stringify(body));
  }
  assert.equal(call('DELETE', '/42').status, 405);
  assert.equal(call('POST', '/', { title: { fr: 'x' } }).status, 405);
  assert.deepEqual(saved(), [POST]);
});

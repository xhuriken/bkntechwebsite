/** Tests des routes publiques : réclamation, pages d'offre et de code, rien de privé ne sort. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createTables } from '../store/tables.js';
import { createCampaignAdminHandler } from '../admin/router.js';
import { createPublicPromoHandler } from './router.js';
import { createRateLimiter } from '../rateLimit.js';

const OFFER = { slug: 'salon', name: 'Interne salon', mode: 'claim', status: 'active', title: 'Offre salon',
  discountType: 'percent', discountValue: 30, discountMonths: 2, maxCodes: 2, maxUsesPerCode: 1, codePrefix: 'SALON' };

function setup(opts = {}) {
  const db = new DatabaseSync(':memory:'); createTables(db);
  const admin = createCampaignAdminHandler({ db, isAdmin: () => true });
  const verify = async (t) => (t?.startsWith('ok-') ? { sub: t, email: `${t}@mail.test` } : null); // faux Google
  const route = createPublicPromoHandler({ db, verifyGoogleIdToken: verify, ...opts });
  const res = (out) => { const r = { headersSent: false, setHeader() {}, status: (c) => ((out.status = c), r),
    json: (b) => ((out.body = b), r), send: (b) => ((out.body = b), r) }; return r; };
  const call = async (method, path, body) => {
    const out = {};
    await route({ method, path, body, headers: {}, socket: { remoteAddress: '203.0.113.7' } }, res(out));
    return out;
  };
  const adminCall = (method, path, body) => { const out = {}; admin({ method, path, body, headers: {} }, res(out)); return out; };
  return { db, call, adminCall };
}

test('réclamation : un code par compte, le même rendu ensuite, puis complet', async () => {
  const { call, adminCall } = setup();
  adminCall('POST', '/', OFFER);
  assert.equal((await call('POST', '/offers/salon/claim', { idToken: 'faux' })).status, 401);
  const a = await call('POST', '/offers/salon/claim', { idToken: 'ok-a' });
  assert.deepEqual([a.status, a.body.status], [200, 'claimed']);
  assert.match(a.body.code, /^SALON-/);
  assert.equal((await call('POST', '/offers/salon/claim', { idToken: 'ok-a' })).body.code, a.body.code);
  await call('POST', '/offers/salon/claim', { idToken: 'ok-b' });
  const c = await call('POST', '/offers/salon/claim', { idToken: 'ok-c' });
  assert.deepEqual([c.status, c.body.status], [409, 'full']);
  assert.equal((await call('POST', '/offers/salon/claim', { idToken: 'ok-a' })).body.status, 'already'); // même complet
});

test('qui a réclamé : prénom, nom et e-mail visibles dans l’admin, jamais sur la page publique', async () => {
  const verify = async () => ({ sub: 'g-ana', email: 'ana@mail.test', firstName: 'Ana', lastName: 'Martin' });
  const { call, adminCall } = setup({ verifyGoogleIdToken: verify });
  const id = adminCall('POST', '/', OFFER).body.id;
  const { code } = (await call('POST', '/offers/salon/claim', { idToken: 'x' })).body;
  const [row] = adminCall('GET', `/${id}/codes`).body;
  assert.deepEqual([row.firstName, row.lastName, row.email, row.source], ['Ana', 'Martin', 'ana@mail.test', 'claim']);
  assert.match(adminCall('GET', `/${id}/export.csv`).body, /prenom,nom,email[\s\S]*"Ana","Martin","ana@mail.test"/);
  const page = JSON.stringify((await call('GET', `/codes/${code}`)).body);
  assert.ok(!/Ana|Martin|ana@/.test(page)); // la page d'un code ne dit pas à qui il appartient
});

test('offres qui ne se réclament pas, brouillon invisible, dates respectées', async () => {
  const { call, adminCall } = setup();
  adminCall('POST', '/', { ...OFFER, slug: 'flyer', mode: 'shared' });
  adminCall('POST', '/', { ...OFFER, slug: 'secret', status: 'draft' });
  adminCall('POST', '/', { ...OFFER, slug: 'bientot', startsAt: '2099-01-01T00:00:00Z' });
  assert.equal((await call('POST', '/offers/flyer/claim', { idToken: 'ok-a' })).body.status, 'not_claim');
  assert.equal((await call('GET', '/offers/secret')).status, 404);
  assert.equal((await call('POST', '/offers/secret/claim', { idToken: 'ok-a' })).status, 404);
  assert.equal((await call('GET', '/offers/bientot')).body.state, 'upcoming');
  assert.equal((await call('POST', '/offers/bientot/claim', { idToken: 'ok-a' })).body.status, 'upcoming');
});

test('page d’offre et page de code : liste blanche, jamais d’e-mail ni de note', async () => {
  const { call, adminCall } = setup();
  const id = adminCall('POST', '/', { ...OFFER, mode: 'individual' }).body.id;
  const [code] = adminCall('POST', `/${id}/codes`, { email: 'client@mail.test', note: 'VIP' }).body.codes;
  const offer = await call('GET', '/offers/salon');
  const page = await call('GET', `/codes/${code.toLowerCase()}`); // saisie en minuscules acceptée
  assert.deepEqual([page.status, page.body.status, page.body.offer.title], [200, 'active', 'Offre salon']);
  for (const body of [offer.body, page.body]) {
    const text = JSON.stringify(body);
    assert.ok(!/mail\.test|VIP|Interne|google|email|note/i.test(text), text);
  }
  assert.equal((await call('GET', '/codes/SALON-INCONNU')).status, 404);
  assert.equal((await call('GET', '/codes/<script>')).status, 404); // format refusé avant la base
});

test('consultation de codes limitée (anti-devinette) ; l’ancienne API /promo n’existe plus', async () => {
  const { call } = setup({ allowLookup: createRateLimiter({ max: 2 }) });
  await call('GET', '/codes/AAAA-1111'); await call('GET', '/codes/AAAA-2222');
  assert.equal((await call('GET', '/codes/AAAA-3333')).status, 429);
  assert.equal((await call('GET', '/')).status, 404);
  assert.equal((await call('POST', '/', { idToken: 'ok-a' })).status, 404);
});

test('sans vérificateur Google : la réclamation répond 503, les pages restent ouvertes', async () => {
  const { call, adminCall } = setup({ verifyGoogleIdToken: null });
  adminCall('POST', '/', OFFER);
  assert.equal((await call('POST', '/offers/salon/claim', { idToken: 'ok-a' })).status, 503);
  assert.equal((await call('GET', '/offers/salon')).body.remaining, 2);
});

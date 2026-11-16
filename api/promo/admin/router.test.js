/** Tests des routes admin des offres : accès, validation, parcours complet, règles d'intégrité. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createTables } from '../store/tables.js';
import { createCampaignAdminHandler } from './router.js';
import { validateCampaign } from './validateCampaign.js';
import { createSessionStore, COOKIE_NAME } from '../../admin/auth.js';
import { isAdminRequest } from '../../admin/session.js';

const OFFER = { slug: 'salon-2026', name: 'Salon artisans', mode: 'individual', status: 'active', title: 'Offre salon',
  discountType: 'percent', discountValue: 30, discountMonths: 2, maxCodes: 3, maxUsesPerCode: 1, codePrefix: 'salon' };

function setup() {
  const db = new DatabaseSync(':memory:'); createTables(db);
  const store = createSessionStore();
  const cookie = `${COOKIE_NAME}=${store.create()}`;
  const handler = createCampaignAdminHandler({ db, isAdmin: (req) => isAdminRequest(req, store) });
  const call = (method, p, body, { withCookie = true, origin = 'https://bkntech.fr' } = {}) => {
    const out = { headers: {} };
    const res = { setHeader: (k, v) => (out.headers[k] = v), status: (c) => ((out.status = c), res),
      json: (b) => ((out.body = b), res), send: (b) => ((out.body = b), res) };
    handler({ method, path: p, body, headers: { host: 'bkntech.fr', origin, cookie: withCookie ? cookie : undefined } }, res);
    return out;
  };
  return { db, call };
}

test('validation : messages clairs, valeurs normalisées', () => {
  assert.equal(validateCampaign({ ...OFFER, slug: 'Mon Offre!' }).ok, false);
  assert.match(validateCampaign({ ...OFFER, discountValue: 120 }).error, /Valeur de la remise/);
  assert.match(validateCampaign({ ...OFFER, startsAt: '2026-12-10', endsAt: '2026-12-01' }).error, /après le début/);
  assert.match(validateCampaign({ ...OFFER, startsAt: 'demain' }).error, /Début/);
  assert.equal(validateCampaign(null).ok, false);
  const v = validateCampaign({ ...OFFER, slug: 'SALON-2026', startsAt: '2026-12-01T09:00:00+01:00' }).values;
  assert.deepEqual([v.slug, v.code_prefix, v.starts_at], ['salon-2026', 'SALON', '2026-12-01T08:00:00.000Z']);
});

test('sans session ou depuis un autre site : 401, rien n’est créé', () => {
  const { db, call } = setup();
  assert.equal(call('GET', '/', undefined, { withCookie: false }).status, 401);
  assert.equal(call('POST', '/', OFFER, { origin: 'https://pirate.example' }).status, 401);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM promo_campaigns').get().n, 0);
});

test('parcours complet : offre, lot de codes, révocation, utilisation, annulation, export', () => {
  const { call } = setup();
  const created = call('POST', '/', OFFER);
  assert.equal(created.status, 201);
  const id = created.body.id;
  assert.equal(call('POST', '/', OFFER).status, 409); // même lien : refusé
  const batch = call('POST', `/${id}/codes`, { count: 2, note: 'stand A' });
  assert.equal(batch.status, 201);
  assert.ok(batch.body.codes.every((c) => c.startsWith('SALON-')));
  assert.equal(call('POST', `/${id}/codes`, { count: 2 }).status, 409);                  // plafond de 3
  assert.equal(call('POST', `/${id}/codes`, { email: 'pas-un-mail' }).status, 400);
  const codes = call('GET', `/${id}/codes`).body;
  assert.deepEqual(codes.map((c) => c.status), ['active', 'active']);
  const [a, b] = codes;
  assert.equal(call('POST', `/codes/${a.id}/redeem`, { reference: 'FAC-12' }).status, 201);
  assert.equal(call('POST', `/codes/${a.id}/redeem`, {}).status, 409);                   // usage unique
  assert.equal(call('DELETE', `/codes/${a.id}`).status, 409);                            // déjà servi
  assert.equal(call('PATCH', `/codes/${b.id}`, { revoked: true, note: 'erreur' }).status, 200);
  assert.equal(call('GET', `/${id}/codes`).body.find((c) => c.id === b.id).status, 'revoked');
  const uses = call('GET', `/${id}/redemptions`).body;
  assert.deepEqual([uses.length, uses[0].reference], [1, 'FAC-12']);
  assert.equal(call('DELETE', `/redemptions/${uses[0].id}`).status, 200);                // annulée
  assert.equal(call('GET', `/${id}/codes`).body.find((c) => c.id === a.id).status, 'active');
  const csv = call('GET', `/${id}/export.csv`);
  assert.match(csv.headers['Content-Disposition'], /attachment/);
  assert.ok(csv.body.includes(a.code));
  assert.equal(call('GET', '/').body[0].codes, 2);
});

test('intégrité : mode verrouillé, suppression d’offre avec codes refusée, code partagé', () => {
  const { call } = setup();
  const id = call('POST', '/', OFFER).body.id;
  call('POST', `/${id}/codes`, {});
  assert.equal(call('PUT', `/${id}`, { ...OFFER, mode: 'shared' }).status, 409);
  assert.equal(call('PUT', `/${id}`, { ...OFFER, title: 'Nouveau titre' }).body.title, 'Nouveau titre');
  assert.equal(call('DELETE', `/${id}`).status, 409);
  const shared = call('POST', '/', { ...OFFER, slug: 'flyer', mode: 'shared' }).body.id;
  assert.equal(call('POST', `/${shared}/shared`, { code: 'flyer30', maxUses: 50 }).body.code, 'FLYER30');
  assert.equal(call('POST', `/${shared}/shared`, { code: 'AUTRE', maxUses: 5 }).status, 409);
  const empty = call('POST', '/', { ...OFFER, slug: 'vide' }).body.id;
  assert.equal(call('DELETE', `/${empty}`).status, 200);
});

test('entrées piégées : id non numérique, champs invalides, route inconnue', () => {
  const { call } = setup();
  assert.equal(call('GET', '/1 OR 1=1').status, 404);
  assert.equal(call('PATCH', '/codes/abc', {}).status, 404);
  assert.equal(call('GET', '/999').status, 404);
  assert.equal(call('PATCH', '/codes/1', { revoked: 'oui' }).status, 404); // code inexistant
  assert.equal(call('POST', '/', { ...OFFER, discountType: 'gratuit' }).status, 400);
  assert.equal(call('DELETE', '/').status, 404);
});

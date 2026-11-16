/** Tests des routes admin des codes promo : accès refusé sans session, chaque action, erreurs. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openClaimsDb, claimPromo } from './claims.js';
import { createPromoAdminHandler } from './adminRoutes.js';
import { createSessionStore, COOKIE_NAME } from '../admin/auth.js';
import { isAdminRequest } from '../admin/session.js';

const C = 'bledger-launch';

function setup() {
  const db = openClaimsDb(path.join(mkdtempSync(path.join(tmpdir(), 'promo-')), 'p.sqlite'));
  const store = createSessionStore();
  const cookie = `${COOKIE_NAME}=${store.create()}`;
  const handler = createPromoAdminHandler({ db, campaign: C, isAdmin: (req) => isAdminRequest(req, store) });
  const call = (method, p, { body, withCookie = true, origin = 'https://bkntech.fr' } = {}) => {
    const out = { headers: {} };
    const res = {
      setHeader: (k, v) => (out.headers[k] = v),
      status: (c) => ((out.status = c), res),
      json: (b) => ((out.body = b), res),
      send: (b) => ((out.body = b), res),
    };
    const headers = { host: 'bkntech.fr', origin, cookie: withCookie ? cookie : undefined };
    handler({ method, path: p, body, headers }, res);
    return out;
  };
  return { db, call };
}

test('sans session : 401 partout, aucune donnée renvoyée', () => {
  const { db, call } = setup();
  claimPromo(db, { campaign: C, googleSub: 's1', email: 'secret@example.com' });
  for (const [m, p] of [['GET', '/'], ['GET', '/export.csv'], ['POST', '/codes'], ['DELETE', '/codes/1'], ['PUT', '/settings']]) {
    const r = call(m, p, { withCookie: false, body: { email: 'a@b.fr', max: 50, open: true } });
    assert.equal(r.status, 401, `${m} ${p}`);
    assert.ok(!JSON.stringify(r.body).includes('secret@'));
  }
});

test('modification depuis un autre site, même avec le cookie : 401 (anti-CSRF)', () => {
  const { call } = setup();
  assert.equal(call('PUT', '/settings', { body: { max: 999, open: true }, origin: 'https://pirate.example' }).status, 401);
  assert.equal(call('POST', '/codes', { body: { email: 'a@b.fr' }, origin: 'https://pirate.example' }).status, 401);
});

test('parcours complet : créer, lister, marquer utilisé, exporter, supprimer', () => {
  const { call } = setup();
  const created = call('POST', '/codes', { body: { email: 'client@exemple.fr' } });
  assert.equal(created.status, 201);
  const list = call('GET', '/');
  assert.equal(list.body.claims.length, 1);
  assert.equal(list.body.remaining, 9);
  assert.equal(list.headers['Cache-Control'], 'no-store');
  const id = list.body.claims[0].id;
  assert.equal(call('PATCH', `/codes/${id}`, { body: { used: true } }).status, 200);
  assert.equal(call('GET', '/').body.claims[0].status, 'used');
  const csv = call('GET', '/export.csv');
  assert.match(csv.headers['Content-Disposition'], /attachment/);
  assert.ok(csv.body.includes(created.body.code));
  assert.equal(call('DELETE', `/codes/${id}`).status, 200);
  assert.equal(call('DELETE', `/codes/${id}`).status, 404);
});

test('réglages et entrées invalides : 400, id piégé : 404', () => {
  const { call } = setup();
  assert.deepEqual(call('PUT', '/settings', { body: { max: 15, open: false } }).body, { max: 15, open: false });
  assert.equal(call('GET', '/').body.remaining, 0); // offre fermée
  assert.equal(call('PUT', '/settings', { body: { max: -3, open: true } }).status, 400);
  assert.equal(call('POST', '/codes', { body: { email: 'nimporte quoi' } }).status, 400);
  assert.equal(call('PATCH', '/codes/1', { body: { used: 'oui' } }).status, 400);
  assert.equal(call('DELETE', '/codes/1 OR 1=1').status, 404);
  assert.equal(call('DELETE', '/codes/-1').status, 404);
});

test('places pleines : la création manuelle répond 409', () => {
  const { call } = setup();
  call('PUT', '/settings', { body: { max: 1, open: true } });
  assert.equal(call('POST', '/codes', { body: { email: 'a@exemple.fr' } }).status, 201);
  assert.equal(call('POST', '/codes', { body: { email: 'b@exemple.fr' } }).status, 409);
});

test('erreur de base sur les réglages : 500 générique, aucun détail interne dans la réponse', () => {
  const brokenDb = { prepare() { throw new Error('SQLITE_CORRUPT /var/www/secret/promo.sqlite'); }, exec() {} };
  const handler = createPromoAdminHandler({ db: brokenDb, campaign: C, isAdmin: () => true });
  const out = {};
  const res = { setHeader() {}, status: (c) => ((out.status = c), res), json: (b) => ((out.body = b), res) };
  const log = console.error; console.error = () => {};
  try { handler({ method: 'PUT', path: '/settings', body: { max: 5, open: true } }, res); } finally { console.error = log; }
  assert.equal(out.status, 500);
  assert.ok(!JSON.stringify(out.body).includes('SQLITE'));
});

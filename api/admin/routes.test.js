/** Tests des routes de connexion admin et du contrôle partagé isAdminRequest. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, createSessionStore, COOKIE_NAME } from './auth.js';
import { isAdminRequest } from './session.js';
import { createAdminHandler } from './routes.js';
import { createRateLimiter } from '../promo/rateLimit.js';

const HASH = hashPassword('Secret-De-Test-123');

function setup({ max = 100 } = {}) { // failDelayMs: 0 -> tests rapides
  const store = createSessionStore();
  const handler = createAdminHandler({ passwordHash: HASH, store, allow: createRateLimiter({ max }), failDelayMs: 0 });
  const call = async (method, action, { body, cookie, origin = 'https://bkntech.fr' } = {}) => {
    const out = { headers: {} };
    const res = {
      setHeader: (k, v) => (out.headers[k] = v),
      status: (c) => ((out.status = c), res),
      json: (b) => ((out.body = b), res),
    };
    const headers = { host: 'bkntech.fr', origin, cookie, 'x-forwarded-for': '203.0.113.9, 172.18.0.2' };
    await handler({ method, path: `/${action}`, body, headers }, res);
    return out;
  };
  const tokenOf = (out) => decodeURIComponent(out.headers['Set-Cookie'].match(/bkn_admin=([^;]*)/)[1]);
  return { store, call, tokenOf };
}

test('bon mot de passe : 200 et cookie HttpOnly ; la session est alors reconnue', async () => {
  const { store, call, tokenOf } = setup();
  const r = await call('POST', 'login', { body: { password: 'Secret-De-Test-123' } });
  assert.equal(r.status, 200);
  assert.match(r.headers['Set-Cookie'], /HttpOnly; SameSite=Strict; Path=\/api/);
  const cookie = `${COOKIE_NAME}=${tokenOf(r)}`;
  assert.deepEqual((await call('GET', 'session', { cookie })).body, { admin: true });
  assert.equal(isAdminRequest({ method: 'DELETE', headers: { cookie, host: 'bkntech.fr' } }, store), true);
});

test('mauvais mot de passe ou corps vide : 401, aucun cookie', async () => {
  const { call } = setup();
  for (const body of [{ password: 'faux' }, {}, undefined]) {
    const r = await call('POST', 'login', { body });
    assert.equal(r.status, 401);
    assert.equal(r.headers['Set-Cookie'], undefined);
  }
});

test('force brute : le 6e essai en 15 min reçoit 429, même avec le bon mot de passe', async () => {
  const { call } = setup({ max: 5 });
  for (let i = 0; i < 5; i++) await call('POST', 'login', { body: { password: 'faux' } });
  assert.equal((await call('POST', 'login', { body: { password: 'Secret-De-Test-123' } })).status, 429);
});

test('connexion depuis un autre site : 403', async () => {
  const { call } = setup();
  const r = await call('POST', 'login', { body: { password: 'Secret-De-Test-123' }, origin: 'https://pirate.example' });
  assert.equal(r.status, 403);
});

test('déconnexion : la session est révoquée et le cookie effacé', async () => {
  const { call, tokenOf } = setup();
  const cookie = `${COOKIE_NAME}=${tokenOf(await call('POST', 'login', { body: { password: 'Secret-De-Test-123' } }))}`;
  const out = await call('POST', 'logout', { cookie });
  assert.match(out.headers['Set-Cookie'], /Max-Age=0/);
  assert.deepEqual((await call('GET', 'session', { cookie })).body, { admin: false });
});

test('isAdminRequest : sans cookie, cookie inventé, ou modification depuis un autre site = refus', async () => {
  const store = createSessionStore();
  const token = store.create();
  const req = (method, cookie, origin) => ({ method, headers: { host: 'bkntech.fr', cookie, origin } });
  assert.equal(isAdminRequest(req('GET'), store), false);
  assert.equal(isAdminRequest(req('GET', `${COOKIE_NAME}=invente`), store), false);
  assert.equal(isAdminRequest(req('POST', `${COOKIE_NAME}=${token}`, 'https://pirate.example'), store), false);
  assert.equal(isAdminRequest(req('GET', `${COOKIE_NAME}=${token}`, 'https://pirate.example'), store), true);
});

test('sans empreinte configurée, aucune connexion possible', async () => {
  const handler = createAdminHandler({ passwordHash: '', store: createSessionStore() });
  const out = {};
  const res = { setHeader() {}, status: (c) => ((out.status = c), res), json: () => res };
  await handler({ method: 'POST', path: '/login', body: { password: '' }, headers: { host: 'x' } }, res);
  assert.equal(out.status, 401);
});

test('champ piège rempli (robot) : 401 même avec le bon mot de passe, aucun cookie', async () => {
  const { call } = setup();
  const r = await call('POST', 'login', { body: { password: 'Secret-De-Test-123', website: 'http://spam.example' } });
  assert.equal(r.status, 401);
  assert.equal(r.headers['Set-Cookie'], undefined);
});

test('limite sur 24 h : au-delà de 20 essais, 429 même après la fenêtre de 15 min', async () => {
  let t = 0;
  const handler = createAdminHandler({
    passwordHash: HASH, store: createSessionStore(), failDelayMs: 0,
    allow: createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000, now: () => t }),
    allowDaily: createRateLimiter({ max: 20, windowMs: 24 * 60 * 60 * 1000, now: () => t }),
  });
  const out = {};
  const res = { setHeader() {}, status: (c) => ((out.status = c), res), json: () => res };
  const login = (password) => handler({ method: 'POST', path: '/login', body: { password }, headers: { host: 'x' } }, res);
  for (let round = 0; round < 4; round++) { // 4 x 5 essais, en changeant de fenêtre de 15 min
    for (let i = 0; i < 5; i++) await login('faux');
    t += 16 * 60 * 1000;
  }
  await login('Secret-De-Test-123');
  assert.equal(out.status, 429);
});

test('échec : la réponse est volontairement retardée', async () => {
  const handler = createAdminHandler({ passwordHash: HASH, store: createSessionStore(), failDelayMs: 150 });
  const res = { setHeader() {}, status: () => res, json: () => res };
  const start = Date.now();
  await handler({ method: 'POST', path: '/login', body: { password: 'faux' }, headers: { host: 'x' } }, res);
  assert.ok(Date.now() - start >= 140);
});

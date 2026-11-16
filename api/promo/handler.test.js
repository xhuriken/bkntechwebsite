/**
 * Tests de la route /promo : fausses requêtes/réponses, faux Google, vraie base SQLite.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openClaimsDb } from './claims.js';
import { createPromoHandler, clientIp } from './handler.js';
import { createRateLimiter, limiterKey } from './rateLimit.js';

const CAMPAIGN = 'bledger-launch';

// Faux Google : le jeton « sub-N » devient l'identité N ; tout le reste est refusé.
const fakeVerify = async (token) =>
  typeof token === 'string' && token.startsWith('sub-')
    ? { sub: token, email: `${token}@example.com` }
    : null;

function setup(limiter = createRateLimiter({ max: 100 })) {
  const db = openClaimsDb(path.join(mkdtempSync(path.join(tmpdir(), 'promo-')), 'p.sqlite'));
  const handler = createPromoHandler({
    db, campaign: CAMPAIGN, verifyGoogleIdToken: fakeVerify, allow: limiter,
  });
  // Envoie une requête et renvoie { status, body, headers }.
  const call = async (method, body, ip = '1.1.1.1') => {
    const out = { headers: {} };
    const res = {
      setHeader: (k, v) => (out.headers[k] = v),
      status: (code) => ((out.status = code), res),
      json: (data) => ((out.body = data), res),
    };
    await handler({ method, body, headers: { 'x-forwarded-for': `${ip}, 172.18.0.2` } }, res);
    return out;
  };
  return { call, db };
}

test('GET renvoie les places restantes, sans mise en cache', async () => {
  const { call } = setup();
  const r = await call('GET');
  assert.deepEqual([r.status, r.body, r.headers['Cache-Control']], [200, { remaining: 10 }, 'no-store']);
});

test('POST avec un jeton valide renvoie un code ; refaire renvoie le même', async () => {
  const { call } = setup();
  const first = await call('POST', { idToken: 'sub-1' });
  const again = await call('POST', { idToken: 'sub-1' });
  assert.equal(first.status, 200);
  assert.equal(first.body.status, 'claimed');
  assert.match(first.body.code, /^BLEDGER-/);
  assert.deepEqual(again.body, { status: 'already', code: first.body.code });
});

test('jeton absent, faux ou corps vide : 401, aucune place consommée', async () => {
  const { call } = setup();
  for (const body of [undefined, {}, { idToken: 'nimporte' }, { idToken: 42 }]) {
    assert.equal((await call('POST', body)).status, 401);
  }
  assert.equal((await call('GET')).body.remaining, 10);
});

test('le 11e compte reçoit 409 « full »', async () => {
  const { call } = setup();
  for (let i = 1; i <= 10; i++) await call('POST', { idToken: `sub-${i}` });
  const r = await call('POST', { idToken: 'sub-11' });
  assert.deepEqual([r.status, r.body], [409, { status: 'full', remaining: 0 }]);
});

test('un e-mail envoyé dans le corps est ignoré (seul le jeton compte)', async () => {
  const { call } = setup();
  const r = await call('POST', { idToken: 'sub-1', email: 'autre@example.com', sub: 'sub-9' });
  const again = await call('POST', { idToken: 'sub-1' });
  assert.equal(again.body.status, 'already');
  assert.equal(r.body.code, again.body.code);
});

test('autre méthode : 405', async () => {
  const { call } = setup();
  assert.equal((await call('DELETE')).status, 405);
});

test('trop d’essais depuis la même IP : 429, mais pas pour une autre IP', async () => {
  const { call } = setup(createRateLimiter({ max: 3 }));
  const statuses = [];
  for (let i = 0; i < 5; i++) statuses.push((await call('POST', { idToken: 'faux' }, '9.9.9.9')).status);
  assert.deepEqual(statuses, [401, 401, 401, 429, 429]);
  assert.equal((await call('POST', { idToken: 'faux' }, '8.8.8.8')).status, 401);
});

test('le limiteur repart à zéro après la fenêtre de temps', () => {
  let t = 0;
  const allow = createRateLimiter({ max: 2, windowMs: 1000, now: () => t });
  assert.deepEqual([allow('a'), allow('a'), allow('a')], [true, true, false]);
  t = 1001;
  assert.equal(allow('a'), true);
});

test('IP du visiteur : avant-dernier maillon, une fausse IP envoyée par le visiteur est ignorée', () => {
  const ip = (xff) => clientIp({ headers: { 'x-forwarded-for': xff }, socket: { remoteAddress: '10.0.0.9' } });
  assert.equal(ip('203.0.113.7, 172.18.0.2'), '203.0.113.7');
  assert.equal(ip('1.2.3.4, 203.0.113.7, 172.18.0.2'), '203.0.113.7'); // 1.2.3.4 = fausse IP
  assert.equal(ip(''), '10.0.0.9'); // pas de proxy : connexion directe
});

test('une erreur de base sur GET donne 500, sans planter', async () => {
  const { call, db } = setup();
  db.exec('DROP TABLE promo_claims');
  const r = await call('GET');
  assert.deepEqual([r.status, r.body], [500, { error: 'Erreur serveur.' }]);
});

test('IPv6 : toutes les adresses d’un même /64 partagent la même clé', () => {
  assert.equal(limiterKey('2001:db8:1:2:aaaa::1'), limiterKey('2001:DB8:1:2:bbbb:cccc:dddd:eeee'));
  assert.notEqual(limiterKey('2001:db8:1:2::1'), limiterKey('2001:db8:1:3::1'));
  assert.equal(limiterKey('203.0.113.7'), '203.0.113.7');
});

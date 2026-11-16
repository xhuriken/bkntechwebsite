/** Tests de l'authentification admin (`npm run test:api`). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword, verifyPassword, createSessionStore, readCookie, sessionCookie, isSameOrigin, COOKIE_NAME,
} from './auth.js';

const stored = hashPassword('Bon-Mot-De-Passe-42');

test('l’empreinte ne contient pas le mot de passe et change à chaque fois (sel aléatoire)', () => {
  assert.match(stored, /^scrypt\.32768\.8\.1\.[\w-]+\.[\w-]+$/);
  assert.ok(!stored.includes('Bon-Mot-De-Passe-42'));
  assert.notEqual(hashPassword('Bon-Mot-De-Passe-42'), stored);
});

test('bon mot de passe accepté, mauvais refusé', async () => {
  assert.equal(await verifyPassword('Bon-Mot-De-Passe-42', stored), true);
  assert.equal(await verifyPassword('bon-mot-de-passe-42', stored), false);
  assert.equal(await verifyPassword('', stored), false);
});

test('empreinte absente ou abîmée, entrée bizarre : refus sans exception', async () => {
  for (const bad of [undefined, '', 'texte', 'scrypt.1.1.1..', 'bcrypt.x.y', 'scrypt$32768$8$1$a$b']) {
    assert.equal(await verifyPassword('Bon-Mot-De-Passe-42', bad), false);
  }
  assert.equal(await verifyPassword(42, stored), false);
  assert.equal(await verifyPassword('x'.repeat(300), stored), false);
});

test('session : valide après création, invalide après révocation ou expiration', () => {
  let t = 0;
  const store = createSessionStore({ now: () => t });
  const a = store.create();
  assert.equal(store.isValid(a), true);
  assert.equal(store.isValid('jeton-invente'), false);
  assert.equal(store.isValid(undefined), false);
  store.revoke(a);
  assert.equal(store.isValid(a), false);
  const b = store.create();
  t = 8 * 60 * 60 * 1000 + 1; // 8 h plus tard
  assert.equal(store.isValid(b), false);
});

test('session : deux jetons ne sont jamais identiques, nombre de sessions borné', () => {
  const store = createSessionStore();
  const tokens = Array.from({ length: 25 }, () => store.create());
  assert.equal(new Set(tokens).size, 25);
  assert.equal(store.isValid(tokens[0]), false); // évincée (20 max)
  assert.equal(store.isValid(tokens[24]), true);
});

test('cookie : lecture et attributs de sécurité', () => {
  assert.equal(readCookie({ headers: { cookie: `a=1; ${COOKIE_NAME}=abc%2D1; b=2` } }), 'abc-1');
  assert.equal(readCookie({ headers: {} }), undefined);
  const set = sessionCookie('abc');
  for (const attr of ['HttpOnly', 'SameSite=Strict', 'Path=/api', 'Secure', 'Max-Age=28800']) assert.ok(set.includes(attr));
  assert.ok(sessionCookie('').includes('Max-Age=0'));
});

test('origine : même site accepté, site tiers refusé, X-Forwarded-Host ignoré', () => {
  const req = (origin, extra = {}) => ({ headers: { host: 'bkntech.fr', origin, ...extra } });
  assert.equal(isSameOrigin(req('https://bkntech.fr')), true);
  assert.equal(isSameOrigin(req(undefined)), true);
  assert.equal(isSameOrigin(req('https://pirate.example')), false);
  assert.equal(isSameOrigin(req('https://pirate.example', { 'x-forwarded-host': 'pirate.example' })), false);
  assert.equal(isSameOrigin(req('pas une url')), false);
});

test('vérification asynchrone : l’API reste réactive pendant le calcul scrypt', async () => {
  let ticks = 0;
  const timer = setInterval(() => ticks++, 5);
  await verifyPassword('mauvais-mot-de-passe', stored); // ~100 ms de calcul
  clearInterval(timer);
  assert.ok(ticks >= 3, `le fil principal a été bloqué (ticks=${ticks})`); // en synchrone : 0
});

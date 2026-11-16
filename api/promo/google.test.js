/**
 * Tests de la vérification du jeton Google (`npm run test:api`).
 * Un faux client remplace Google pour les cas métier ; le vrai client est
 * utilisé une fois pour prouver qu'un jeton fabriqué à la main est refusé.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGoogleVerifier } from './google.js';

const CLIENT_ID = 'test-client.apps.googleusercontent.com';

// Faux client : renvoie le contenu donné, ou lève une erreur comme le vrai.
const fakeClient = (payloadOrError) => ({
  calls: [],
  async verifyIdToken(options) {
    this.calls.push(options);
    if (payloadOrError instanceof Error) throw payloadOrError;
    return { getPayload: () => payloadOrError };
  },
});

test('sans GOOGLE_CLIENT_ID, la vérification refuse de démarrer', () => {
  assert.throws(() => createGoogleVerifier(''), /GOOGLE_CLIENT_ID manquant/);
});

test('un jeton valide donne le sub, l’e-mail en minuscules, le prénom et le nom', async () => {
  const client = fakeClient({ sub: '123', email: 'Ana@Example.com', email_verified: true, given_name: 'Ana', family_name: 'Martin' });
  const verify = createGoogleVerifier(CLIENT_ID, client);
  assert.deepEqual(await verify('jeton'), { sub: '123', email: 'ana@example.com', firstName: 'Ana', lastName: 'Martin' });
  assert.equal(client.calls[0].audience, CLIENT_ID); // notre site, pas un autre
});

test('nom : nettoyé, borné, et repli sur le nom complet', async () => {
  const one = (payload) => createGoogleVerifier(CLIENT_ID, fakeClient({ sub: '1', email: 'a@b.fr', email_verified: true, ...payload }))('jeton');
  assert.deepEqual(await one({ name: 'Studio Ana' }), { sub: '1', email: 'a@b.fr', firstName: 'Studio Ana', lastName: '' });
  const r = await one({ given_name: ' Ana\u0000\n ', family_name: 'X'.repeat(300) });
  assert.deepEqual([r.firstName, r.lastName.length], ['Ana', 100]); // contrôle retiré, 100 caractères max
  assert.deepEqual(await one({}), { sub: '1', email: 'a@b.fr', firstName: '', lastName: '' });
});

test('un e-mail non vérifié par Google est refusé', async () => {
  const client = fakeClient({ sub: '123', email: 'a@example.com', email_verified: false });
  assert.equal(await createGoogleVerifier(CLIENT_ID, client)('jeton'), null);
});

test('un jeton rejeté par Google (signature, expiration…) donne un refus', async () => {
  const client = fakeClient(new Error('Token used too late'));
  assert.equal(await createGoogleVerifier(CLIENT_ID, client)('jeton'), null);
});

test('entrée absente, mauvais type ou trop longue : refus sans appeler Google', async () => {
  const client = fakeClient({ sub: '1', email: 'a@example.com', email_verified: true });
  const verify = createGoogleVerifier(CLIENT_ID, client);
  for (const bad of [undefined, 42, { token: 'x' }, 'x'.repeat(5000)]) {
    assert.equal(await verify(bad), null);
  }
  assert.equal(client.calls.length, 0);
});

test('vrai client Google : un jeton fabriqué à la main est refusé', async () => {
  const forged = [{ alg: 'none' }, { sub: 'pirate', email: 'p@example.com', email_verified: true }]
    .map((part) => Buffer.from(JSON.stringify(part)).toString('base64url'))
    .join('.') + '.';
  assert.equal(await createGoogleVerifier(CLIENT_ID)(forged), null);
});

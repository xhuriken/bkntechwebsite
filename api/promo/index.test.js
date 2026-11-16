/** Tests de l'assemblage : la route promo ne doit jamais faire tomber le reste de l'API. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createPromoRoute } from './index.js';

const call = async (route, method = 'GET') => {
  const out = {};
  const res = { setHeader() {}, status: (c) => ((out.status = c), res), json: (b) => ((out.body = b), res) };
  await route({ method, headers: {}, body: {} }, res);
  return out;
};

test('sans GOOGLE_CLIENT_ID : pas de plantage, la route répond 503', async () => {
  const route = createPromoRoute({});
  assert.equal((await call(route)).status, 503);
});

test('base impossible à ouvrir : pas de plantage, la route répond 503', async () => {
  const route = createPromoRoute({ GOOGLE_CLIENT_ID: 'x.apps.googleusercontent.com', PROMO_DB_PATH: '\0/interdit' });
  assert.equal((await call(route)).status, 503);
});

test('configuration complète : la route répond avec les 10 places', async () => {
  const dbPath = path.join(mkdtempSync(path.join(tmpdir(), 'promo-')), 'sous', 'dossier', 'p.sqlite');
  const route = createPromoRoute({ GOOGLE_CLIENT_ID: 'x.apps.googleusercontent.com', PROMO_DB_PATH: dbPath });
  const r = await call(route);
  assert.deepEqual([r.status, r.body], [200, { remaining: 10 }]);
});

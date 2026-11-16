/** Tests de l'assemblage : la partie promo ne doit jamais faire tomber le reste de l'API. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createPromoRoutes } from './index.js';
import { createLegacyDb } from './store/legacyFixture.js';

const call = async (route, method = 'GET', p = '/') => {
  const out = {};
  const res = { headersSent: false, setHeader() {}, status: (c) => ((out.status = c), res), json: (b) => ((out.body = b), res) };
  await route({ method, path: p, headers: {}, body: {}, socket: {} }, res);
  return out;
};
const dbPath = () => path.join(mkdtempSync(path.join(tmpdir(), 'promo-')), 'sous', 'dossier', 'p.sqlite');
const GOOGLE = 'x.apps.googleusercontent.com';

test('sans GOOGLE_CLIENT_ID : pages publiques OK, seule la réclamation répond 503', async () => {
  const { publicRoute } = createPromoRoutes({ PROMO_DB_PATH: dbPath() });
  assert.equal((await call(publicRoute, 'GET', '/offers/inconnue')).status, 404); // la route répond
  assert.equal((await call(publicRoute, 'POST', '/offers/inconnue/claim')).status, 503);
});

test('base impossible à ouvrir : pas de plantage, toutes les routes promo répondent 503', async () => {
  const routes = createPromoRoutes({ GOOGLE_CLIENT_ID: GOOGLE, PROMO_DB_PATH: '\0/interdit' });
  for (const r of [routes.publicRoute, routes.campaignAdminRoute]) assert.equal((await call(r)).status, 503);
});

test('installation neuve : aucune offre (l’admin crée la première)', async () => {
  const { publicRoute } = createPromoRoutes({ GOOGLE_CLIENT_ID: GOOGLE, PROMO_DB_PATH: dbPath() });
  assert.equal((await call(publicRoute, 'GET', '/offers/lancement-b-ledger')).status, 404);
});

test('base de production de l’ancienne version : offre de lancement et codes repris au démarrage', async () => {
  const file = dbPath();
  mkdirSync(path.dirname(file), { recursive: true });
  createLegacyDb(file);
  const { publicRoute } = createPromoRoutes({ GOOGLE_CLIENT_ID: GOOGLE, PROMO_DB_PATH: file });
  const offer = await call(publicRoute, 'GET', '/offers/lancement-b-ledger');
  assert.deepEqual([offer.status, offer.body.state, offer.body.total, offer.body.remaining], [200, 'paused', 12, 9]);
  assert.match(offer.body.description, /aux 12 premiers/); // le texte suit le vrai nombre de places
  assert.equal((await call(publicRoute, 'GET', '/codes/BLEDGER-CCCC-CCCC')).body.status, 'used');
});

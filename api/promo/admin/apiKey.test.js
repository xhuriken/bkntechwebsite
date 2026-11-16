/** Tests de la clé API : format, vérification, limiteurs, et PORTÉE (seulement /admin/campaigns). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { generateApiKey, hashApiKey, createApiKeyCheck } from './apiKey.js';
import { createRateLimiter } from '../rateLimit.js';
import { createPromoRoutes } from '../index.js';
import { isAdminRequest } from '../../admin/session.js';

const KEY = generateApiKey();
const req = (authorization, extra = {}) => ({ method: 'GET', path: '/', headers: { authorization }, socket: { remoteAddress: '203.0.113.9' }, ...extra });

test('format : préfixe reconnaissable, 256 bits, empreinte SHA-256 stable', () => {
  assert.match(KEY, /^bkp_[A-Za-z0-9_-]{43}$/);
  assert.notEqual(generateApiKey(), KEY);
  assert.match(hashApiKey(KEY), /^[0-9a-f]{64}$/);
  assert.equal(hashApiKey(KEY), hashApiKey(KEY));
});

test('vérification : sans clé, bonne clé, fausse clé, clé mal formée, serveur sans empreinte', () => {
  const check = createApiKeyCheck({ keyHash: hashApiKey(KEY) });
  assert.equal(check(req(undefined)), 'none');
  assert.equal(check(req(`Bearer ${KEY}`)), 'ok');
  assert.equal(check(req(`Bearer ${generateApiKey()}`)), 'invalid');
  assert.equal(check(req('Bearer abc')), 'invalid');
  assert.equal(check(req(`Basic ${KEY}`)), 'none'); // autre schéma : ignoré, donc pas d'accès par clé
  assert.equal(createApiKeyCheck({ keyHash: '' })(req(`Bearer ${KEY}`)), 'invalid');
  assert.equal(createApiKeyCheck({ keyHash: 'pas-une-empreinte' })(req(`Bearer ${KEY}`)), 'invalid');
});

test('limiteurs : essais ratés par IP, et usage de la bonne clé', () => {
  const check = createApiKeyCheck({ keyHash: hashApiKey(KEY),
    allowFailures: createRateLimiter({ max: 2 }), allowUses: createRateLimiter({ max: 3 }) });
  const wrong = req(`Bearer ${generateApiKey()}`);
  assert.deepEqual([check(wrong), check(wrong), check(wrong)], ['invalid', 'invalid', 'limited']);
  const good = req(`Bearer ${KEY}`);
  assert.deepEqual([check(good), check(good), check(good), check(good)], ['ok', 'ok', 'ok', 'limited']);
});

test('portée : la clé ouvre /admin/campaigns, mais ni l’ancien admin promo ni la session admin', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'promo-key-'));
  const routes = createPromoRoutes({ PROMO_DB_PATH: path.join(dir, 'p.sqlite'), PROMO_API_KEY_HASH: hashApiKey(KEY) });
  const call = async (route, r) => {
    const out = {};
    const res = { headersSent: false, setHeader() {}, status: (c) => ((out.status = c), res), json: (b) => ((out.body = b), res) };
    await route(r, res);
    return out;
  };
  const list = await call(routes.campaignAdminRoute, req(`Bearer ${KEY}`));
  assert.equal(list.status, 200);
  assert.deepEqual(list.body, []); // installation neuve : aucune offre
  const created = await call(routes.campaignAdminRoute, req(`Bearer ${KEY}`, { method: 'POST', body: {
    slug: 'via-mcp', name: 'Créée par l’outil', mode: 'individual', discountType: 'percent', discountValue: 10 } }));
  assert.equal(created.status, 201); // sans cookie ni Origin : une clé ne peut pas venir d'une attaque CSRF
  assert.equal((await call(routes.campaignAdminRoute, req(`Bearer ${generateApiKey()}`))).status, 401);
  assert.equal(routes.adminRoute, undefined); // l'ancien /admin/promo n'existe plus
  assert.equal(isAdminRequest(req(`Bearer ${KEY}`)), false); // posts, réglages, upload : session obligatoire
});

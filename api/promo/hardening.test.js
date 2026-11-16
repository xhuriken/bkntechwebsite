/** Tests des corrections de la revue de sécurité (lot 8b) : chaque test rejoue le scénario signalé. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createTables } from './store/tables.js';
import { openPromoDb } from './store/openDb.js';
import { createLegacyDb } from './store/legacyFixture.js';
import { createCampaignAdminHandler } from './admin/router.js';
import { createPublicPromoHandler } from './public/router.js';

const res = (out) => { const r = { headersSent: false, setHeader() {}, status: (c) => ((out.status = c), r),
  json: (b) => ((out.body = b), r), send: (b) => ((out.body = b), r) }; return r; };

function setup() {
  const db = new DatabaseSync(':memory:'); createTables(db);
  const admin = createCampaignAdminHandler({ db, isAdmin: () => true });
  const pub = createPublicPromoHandler({ db, verifyGoogleIdToken: async () => null });
  const adminCall = (method, p, body) => { const out = {}; admin({ method, path: p, body, headers: {} }, res(out)); return out; };
  const pubCall = async (p) => { const out = {}; await pub({ method: 'GET', path: p, headers: {}, socket: {} }, res(out)); return out; };
  const id = adminCall('POST', '/', { slug: 'secret', name: 'Avant lancement', mode: 'shared', status: 'draft',
    title: 'Offre secrète', discountType: 'percent', discountValue: 90 }).body.id;
  return { db, adminCall, pubCall, id };
}

test('code partagé deviné sur une offre en brouillon : 404, rien ne fuit (titre, remise)', async () => {
  const { adminCall, pubCall, id } = setup();
  assert.equal(adminCall('POST', `/${id}/shared`, { code: 'NOEL', maxUses: 100 }).status, 201);
  const draft = await pubCall('/codes/NOEL');
  assert.deepEqual([draft.status, draft.body.offer], [404, undefined]);
  adminCall('PUT', `/${id}`, { ...adminCall('GET', `/${id}`).body, status: 'active' });
  assert.equal((await pubCall('/codes/NOEL')).body.offer.title, 'Offre secrète'); // publiée : visible
});

test('annuler une utilisation : le code redevient libre, la ligne reste dans l’historique', async () => {
  const { db, adminCall, id } = setup();
  adminCall('PUT', `/${id}`, { ...adminCall('GET', `/${id}`).body, status: 'active', mode: 'individual' });
  adminCall('POST', `/${id}/codes`, { count: 1 });
  const codeId = db.prepare('SELECT id FROM promo_codes').get().id;
  assert.equal(adminCall('POST', `/codes/${codeId}/redeem`, { reference: 'F-1' }).status, 201);
  assert.equal(adminCall('POST', `/codes/${codeId}/redeem`).status, 409); // usage unique : déjà utilisé
  const useId = adminCall('GET', `/${id}/redemptions`).body[0].id;
  assert.equal(adminCall('DELETE', `/redemptions/${useId}`).status, 200);
  assert.equal(adminCall('DELETE', `/redemptions/${useId}`).status, 404); // pas deux fois
  const [use] = adminCall('GET', `/${id}/redemptions`).body;
  assert.match(use.cancelledAt, /^\d{4}-/); // toujours là, marquée annulée
  assert.equal(adminCall('POST', `/codes/${codeId}/redeem`).status, 201); // le code sert à nouveau
  assert.equal(adminCall('DELETE', `/codes/${codeId}`).status, 409); // un code avec historique ne s'efface pas
});

test('reprise de l’ancienne version : une seule fois, même si l’admin supprime toutes les offres', () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'promo-meta-')), 'p.sqlite');
  createLegacyDb(file);
  const first = openPromoDb(file);
  assert.equal(first.moved, 3);
  first.db.exec('DELETE FROM promo_redemptions; DELETE FROM promo_codes; DELETE FROM promo_campaigns;');
  first.db.close();
  const again = openPromoDb(file); // redémarrage du serveur
  assert.equal(again.moved, 0);
  assert.equal(again.db.prepare('SELECT COUNT(*) AS n FROM promo_codes').get().n, 0); // les codes ne reviennent pas
  again.db.close();
});

test('base créée avant la colonne cancelled_at : ajoutée au démarrage, sans perte', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE promo_redemptions (id INTEGER PRIMARY KEY, code_id INTEGER NOT NULL, used_at TEXT NOT NULL,
    reference TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '');
    INSERT INTO promo_redemptions (code_id, used_at) VALUES (1, '2026-11-15T10:00:00.000Z');`);
  createTables(db);
  const row = db.prepare('SELECT used_at, cancelled_at FROM promo_redemptions').get();
  assert.deepEqual({ ...row }, { used_at: '2026-11-15T10:00:00.000Z', cancelled_at: null });
});

test('base de production sans prénom/nom : colonnes ajoutées, codes existants intacts', () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'promo-names-')), 'p.sqlite');
  createLegacyDb(file);
  const old = openPromoDb(file).db; // base v2 telle qu'elle était déployée
  old.exec('ALTER TABLE promo_codes DROP COLUMN first_name; ALTER TABLE promo_codes DROP COLUMN last_name;');
  old.close();
  const { db } = openPromoDb(file); // redémarrage avec la nouvelle version
  const rows = db.prepare('SELECT code, first_name, last_name FROM promo_codes ORDER BY id').all();
  assert.deepEqual(rows.map((r) => [r.first_name, r.last_name]), [[null, null], [null, null], [null, null]]);
  assert.equal(rows.length, 3);
  db.close();
});

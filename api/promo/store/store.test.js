/** Tests de la structure v2 (offres -> codes -> utilisations) et de la reprise de l'ancienne version. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createTables } from './tables.js';
import { migrateLegacy, LAUNCH_SLUG } from './migrateLegacy.js';
import { openPromoDb } from './openDb.js';
import { createLegacyDb, LEGACY_CODES } from './legacyFixture.js';

const NOW = '2026-11-16T10:00:00.000Z';
const fresh = () => { const db = new DatabaseSync(':memory:'); createTables(db); return db; };
const addCampaign = (db, over = {}) => {
  const c = { slug: 'test-offre', name: 'Test', mode: 'individual', discount_type: 'percent', discount_value: 20, ...over };
  return db.prepare(
    `INSERT INTO promo_campaigns (slug, name, mode, discount_type, discount_value, starts_at, ends_at,
       code_prefix, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(c.slug, c.name, c.mode, c.discount_type, c.discount_value, c.starts_at ?? null, c.ends_at ?? null,
    c.code_prefix ?? 'BLEDGER', c.status ?? 'draft', NOW, NOW).lastInsertRowid;
};
const addCode = (db, campaignId, code, googleSub = null) => db.prepare(
  `INSERT INTO promo_codes (campaign_id, code, google_sub, source, created_at) VALUES (?, ?, ?, 'manual', ?)`,
).run(campaignId, code, googleSub, NOW).lastInsertRowid;

test('installation neuve : tables créées, rien à reprendre', () => {
  const db = fresh();
  assert.equal(migrateLegacy(db), 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM promo_campaigns').get().n, 0);
});

test('la base refuse les offres incohérentes', () => {
  const db = fresh();
  const bad = [
    { slug: 'Pas Bon' }, { slug: 'a' }, { slug: '<script>' },          // lien public invalide
    { discount_value: 150 }, { discount_value: 0 },                      // 150 % ou remise nulle
    { discount_type: 'gratuit' }, { mode: 'autre' }, { status: 'supprime' },
    { starts_at: '2026-12-01', ends_at: '2026-11-01' },                  // fin avant début
    { code_prefix: 'bledger' }, { name: '' },
  ];
  for (const over of bad) assert.throws(() => addCampaign(db, over), /CHECK/, JSON.stringify(over));
  addCampaign(db);
  assert.throws(() => addCampaign(db), /UNIQUE/); // deux offres ne peuvent pas avoir le même lien
});

test('codes : offre inexistante refusée, un seul code par compte Google et par offre', () => {
  const db = fresh();
  const id = addCampaign(db);
  assert.throws(() => addCode(db, 999, 'X-1'), /FOREIGN KEY/);
  addCode(db, id, 'X-1', 'sub-1');
  assert.throws(() => addCode(db, id, 'X-2', 'sub-1'), /UNIQUE/);
  addCode(db, id, 'X-3'); addCode(db, id, 'X-4'); // sans compte Google : autant qu'on veut
  assert.throws(() => addCode(db, id, 'X-3'), /UNIQUE/); // deux fois le même code : impossible
});

test('historique protégé : ni code utilisé ni offre avec des codes ne peuvent être supprimés', () => {
  const db = fresh();
  const id = addCampaign(db);
  const codeId = addCode(db, id, 'X-1');
  db.prepare('INSERT INTO promo_redemptions (code_id, used_at) VALUES (?, ?)').run(codeId, NOW);
  assert.throws(() => db.prepare('DELETE FROM promo_codes WHERE id = ?').run(codeId), /FOREIGN KEY/);
  assert.throws(() => db.prepare('DELETE FROM promo_campaigns WHERE id = ?').run(id), /FOREIGN KEY/);
});

test('reprise de l’ancienne version : offre, codes et utilisations conservés, une seule fois', () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'promo-')), 'p.sqlite');
  createLegacyDb(file); // base au format de l'ancienne version, comme en production
  const { db, moved } = openPromoDb(file);
  assert.equal(moved, 3);
  const oldCodes = [...LEGACY_CODES].sort();

  const campaign = db.prepare('SELECT * FROM promo_campaigns').get();
  assert.equal(campaign.slug, LAUNCH_SLUG);
  assert.deepEqual([campaign.status, campaign.max_codes, campaign.discount_value, campaign.discount_months], ['paused', 12, 50, 3]);
  const codes = db.prepare('SELECT code, google_sub, source FROM promo_codes ORDER BY code').all();
  assert.deepEqual(codes.map((c) => c.code), oldCodes);
  const manual = codes.find((c) => c.source === 'manual');
  assert.equal(manual.google_sub, null); // l'ancien faux identifiant « manual:… » n'est pas recopié
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM promo_redemptions').get().n, 1);

  assert.equal(migrateLegacy(db, NOW), 0); // relancée au démarrage suivant : ne duplique rien
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM promo_codes').get().n, 3);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM promo_claims').get().n, 3); // anciennes tables gardées
});

/** Tests des règles métier : statut calculé, génération, utilisation (usage unique, dates, limites). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createTables } from '../store/tables.js';
import { codeStatus } from './status.js';
import { createCodes, createSharedCode, randomCode, normalizeCode, MAX_BATCH } from './generate.js';
import { findCode, redeemCode } from './redeem.js';

const T0 = Date.parse('2026-11-16T10:00:00Z');
const day = (n) => new Date(T0 + n * 86400000).toISOString();
const fresh = () => { const db = new DatabaseSync(':memory:'); createTables(db); return db; };
const campaign = (db, over = {}) => {
  const c = { slug: `o-${Math.random().toString(36).slice(2, 8)}`, mode: 'individual', status: 'active', max_uses_per_code: 1,
    starts_at: null, ends_at: null, max_codes: null, code_prefix: 'BLEDGER', ...over };
  return Number(db.prepare(
    `INSERT INTO promo_campaigns (slug, name, status, mode, discount_type, discount_value, starts_at, ends_at,
       max_codes, max_uses_per_code, code_prefix, created_at, updated_at)
     VALUES (?, 'T', ?, ?, 'percent', 20, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(c.slug, c.status, c.mode, c.starts_at, c.ends_at, c.max_codes, c.max_uses_per_code, c.code_prefix, day(0), day(0)).lastInsertRowid);
};

test('statut : chaque cas, et la priorité entre eux', () => {
  const c = { status: 'active', starts_at: day(-1), ends_at: day(10) };
  const k = { max_uses: 1, revoked_at: null, expires_at: null };
  const s = (over = {}, camp = {}, uses = 0, now = T0) => codeStatus({ code: { ...k, ...over }, campaign: { ...c, ...camp }, uses }, now);
  assert.equal(s(), 'active');
  assert.equal(s({}, {}, 1), 'exhausted');                              // usage unique consommé
  assert.equal(s({ max_uses: 3 }, {}, 2), 'active');                    // usage multiple : encore 1
  assert.equal(s({ revoked_at: day(0) }, {}, 1), 'revoked');            // révoqué prime sur épuisé
  assert.equal(s({}, { ends_at: day(0) }), 'expired');                  // fin = date exacte : expiré
  assert.equal(s({ expires_at: day(-0.5) }), 'expired');                // le code expire avant l'offre
  assert.equal(s({ expires_at: day(30) }, { ends_at: day(-0.5) }), 'expired'); // l'offre finit avant le code
  assert.equal(s({}, { starts_at: day(1) }), 'pending');
  for (const status of ['draft', 'paused', 'archived']) assert.equal(s({}, { status }), 'inactive');
  assert.equal(s({}, { status: 'paused' }, 1), 'exhausted');            // un code utilisé reste « épuisé »
});

test('génération : format, préfixe, normalisation', () => {
  assert.match(randomCode('SALON'), /^SALON-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
  assert.equal(normalizeCode('  bledger-ab12 cd '), 'BLEDGER-AB12CD');
  assert.equal(normalizeCode(null), '');
});

test('lot de codes : créés d’un coup, uniques, limite max_codes respectée', () => {
  const db = fresh();
  const id = campaign(db, { max_codes: 5, code_prefix: 'SALON' });
  assert.deepEqual(createCodes(db, id, { count: 0 }), { status: 'invalid' });
  assert.deepEqual(createCodes(db, id, { count: MAX_BATCH + 1 }), { status: 'invalid' });
  assert.deepEqual(createCodes(db, 999, { count: 1 }), { status: 'unknown' });
  const r = createCodes(db, id, { count: 3, note: 'salon' });
  assert.equal(r.status, 'created');
  assert.equal(new Set(r.codes).size, 3);
  assert.ok(r.codes.every((c) => c.startsWith('SALON-')));
  assert.deepEqual(createCodes(db, id, { count: 3 }), { status: 'full', remaining: 2 }); // tout ou rien
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM promo_codes').get().n, 3);          // rien d'ajouté
  assert.equal(createCodes(db, id, { count: 2 }).status, 'created');
});

test('code partagé : un seul par offre, forme contrôlée, doublon refusé', () => {
  const db = fresh();
  const shared = campaign(db, { mode: 'shared' });
  assert.equal(createSharedCode(db, shared, { code: 'ab', maxUses: 10 }).status, 'invalid');
  assert.equal(createSharedCode(db, shared, { code: 'LANCE<>', maxUses: 10 }).status, 'invalid');
  assert.equal(createSharedCode(db, shared, { code: 'lancement50', maxUses: 0 }).status, 'invalid');
  assert.deepEqual(createSharedCode(db, shared, { code: 'lancement50', maxUses: 100 }), { status: 'created', code: 'LANCEMENT50' });
  assert.equal(createSharedCode(db, shared, { code: 'AUTRE50', maxUses: 100 }).status, 'exists');
  const other = campaign(db, { mode: 'shared' });
  assert.equal(createSharedCode(db, other, { code: 'LANCEMENT50', maxUses: 5 }).status, 'taken');
  assert.equal(createCodes(db, shared, { count: 1 }).status, 'invalid'); // pas de codes individuels en mode partagé
});

test('utilisation : usage unique consommé une seule fois, usage multiple jusqu’à la limite', () => {
  const db = fresh();
  const single = createCodes(db, campaign(db), { count: 1 }).codes[0];
  assert.deepEqual(redeemCode(db, single.toLowerCase(), { reference: 'FAC-1' }, T0), { status: 'ok', usesLeft: 0 });
  assert.equal(redeemCode(db, single, {}, T0).status, 'exhausted');
  const multi = createCodes(db, campaign(db, { max_uses_per_code: 3 }), { count: 1 }).codes[0];
  assert.deepEqual([1, 2, 3].map(() => redeemCode(db, multi, {}, T0).status), ['ok', 'ok', 'ok']);
  assert.equal(redeemCode(db, multi, {}, T0).status, 'exhausted');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM promo_redemptions').get().n, 4); // 1 + 3, jamais plus
  assert.equal(db.prepare("SELECT reference FROM promo_redemptions WHERE reference <> ''").get().reference, 'FAC-1');
});

test('utilisation refusée : inconnu, hors période, offre en pause, révoqué, entrées trop longues', () => {
  const db = fresh();
  const id = campaign(db, { starts_at: day(1), ends_at: day(5) });
  const [code] = createCodes(db, id, { count: 1 }).codes;
  assert.equal(redeemCode(db, 'INCONNU-0000', {}, T0).status, 'unknown');
  assert.equal(redeemCode(db, code, {}, T0).status, 'pending');
  assert.equal(redeemCode(db, code, {}, Date.parse(day(6))).status, 'expired');
  db.prepare("UPDATE promo_campaigns SET status = 'paused' WHERE id = ?").run(id);
  assert.equal(redeemCode(db, code, {}, Date.parse(day(2))).status, 'inactive');
  db.prepare("UPDATE promo_campaigns SET status = 'active' WHERE id = ?").run(id);
  db.prepare('UPDATE promo_codes SET revoked_at = ?').run(day(0));
  assert.equal(redeemCode(db, code, {}, Date.parse(day(2))).status, 'revoked');
  assert.equal(redeemCode(db, code, { reference: 'x'.repeat(121) }, T0).status, 'invalid');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM promo_redemptions').get().n, 0); // aucun refus n'a écrit
  assert.equal(findCode(db, code, T0).status, 'revoked');
});

test('deux utilisations simultanées d’un code à usage unique : une seule passe', () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'promo-')), 'p.sqlite');
  const a = new DatabaseSync(file); a.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;'); createTables(a);
  const b = new DatabaseSync(file); b.exec('PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;');
  const [code] = createCodes(a, campaign(a), { count: 1 }).codes;
  const results = [redeemCode(a, code, {}, T0).status, redeemCode(b, code, {}, T0).status];
  assert.deepEqual(results.sort(), ['exhausted', 'ok']);
  assert.equal(a.prepare('SELECT COUNT(*) AS n FROM promo_redemptions').get().n, 1);
});

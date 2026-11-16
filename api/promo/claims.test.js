/**
 * Tests des réclamations (node:test, intégré à Node : `npm run test:api`).
 * Chaque test travaille sur une base neuve dans un dossier temporaire.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openClaimsDb, claimPromo, remainingPlaces, generateCode } from './claims.js';

const CAMPAIGN = 'bledger-launch';
const freshDbPath = () => path.join(mkdtempSync(path.join(tmpdir(), 'promo-')), 'promo.sqlite');
const user = (i) => ({ campaign: CAMPAIGN, googleSub: `sub-${i}`, email: `u${i}@example.com` });

test('le code a le bon format, sans caractères ambigus', () => {
  assert.match(generateCode(), /^BLEDGER-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
});

test('les 10 premiers obtiennent chacun un code différent, le 11e est refusé', () => {
  const db = openClaimsDb(freshDbPath());
  const codes = new Set();
  for (let i = 1; i <= 10; i++) {
    const result = claimPromo(db, user(i));
    assert.equal(result.status, 'claimed');
    codes.add(result.code);
  }
  assert.equal(codes.size, 10);
  assert.deepEqual(claimPromo(db, user(11)), { status: 'full' });
  assert.equal(remainingPlaces(db, CAMPAIGN), 0);
});

test('un même compte Google ne prend pas deux places et retrouve son code', () => {
  const db = openClaimsDb(freshDbPath());
  const first = claimPromo(db, user(1));
  const again = claimPromo(db, user(1));
  assert.deepEqual(again, { status: 'already', code: first.code });
  assert.equal(remainingPlaces(db, CAMPAIGN), 9);
});

test('un ancien inscrit retrouve son code même quand tout est complet', () => {
  const db = openClaimsDb(freshDbPath());
  const mine = claimPromo(db, user(1));
  for (let i = 2; i <= 10; i++) claimPromo(db, user(i));
  assert.deepEqual(claimPromo(db, user(1)), { status: 'already', code: mine.code });
});

test('deux connexions qui alternent ne dépassent jamais le plafond', () => {
  const file = freshDbPath();
  const a = openClaimsDb(file);
  const b = openClaimsDb(file); // comme deux processus API sur le même fichier
  const statuses = [];
  for (let i = 1; i <= 14; i++) statuses.push(claimPromo(i % 2 ? a : b, user(i)).status);
  assert.equal(statuses.filter((s) => s === 'claimed').length, 10);
  assert.equal(remainingPlaces(a, CAMPAIGN), 0);
});

test('la base refuse elle-même un doublon de compte (contrainte UNIQUE)', () => {
  const db = openClaimsDb(freshDbPath());
  const insert = db.prepare(
    `INSERT INTO promo_claims (campaign, google_sub, email, code, claimed_at)
     VALUES (?, 'sub-x', 'x@example.com', ?, '2026-11-16')`,
  );
  insert.run(CAMPAIGN, 'BLEDGER-AAAA-AAAA');
  assert.throws(() => insert.run(CAMPAIGN, 'BLEDGER-BBBB-BBBB'), /UNIQUE/);
});

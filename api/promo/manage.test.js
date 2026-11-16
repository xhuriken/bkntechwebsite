/** Tests de la gestion admin des codes promo (`npm run test:api`). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { openClaimsDb, claimPromo, remainingPlaces } from './claims.js';
import { saveSettings } from './schema.js';
import { listClaims, createManualClaim, setUsed, deleteClaim, claimsToCsv } from './manage.js';

const C = 'bledger-launch';
const fresh = () => openClaimsDb(path.join(mkdtempSync(path.join(tmpdir(), 'promo-')), 'p.sqlite'));
const google = (i) => ({ campaign: C, googleSub: `s${i}`, email: `u${i}@example.com` });

test('une ancienne base (sans colonnes de gestion) est migrée sans perdre de code', () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'promo-')), 'old.sqlite');
  const old = new DatabaseSync(file);
  old.exec(`CREATE TABLE promo_claims (id INTEGER PRIMARY KEY, campaign TEXT NOT NULL, google_sub TEXT NOT NULL,
    email TEXT NOT NULL, code TEXT NOT NULL UNIQUE, claimed_at TEXT NOT NULL, UNIQUE (campaign, google_sub));
    INSERT INTO promo_claims VALUES (1,'${C}','s','a@b.fr','BLEDGER-AAAA-BBBB','2026-11-01');`);
  old.close();
  const db = openClaimsDb(file);
  const { claims } = listClaims(db, C);
  assert.equal(claims[0].code, 'BLEDGER-AAAA-BBBB');
  assert.equal(claims[0].status, 'active');
  assert.equal(claims[0].source, 'google');
});

test('réglages : plus de places, offre fermée, valeurs absurdes refusées', () => {
  const db = fresh();
  saveSettings(db, C, { max: 12, open: true });
  for (let i = 1; i <= 11; i++) claimPromo(db, google(i));
  assert.equal(remainingPlaces(db, C), 1);
  saveSettings(db, C, { max: 12, open: false });
  assert.equal(remainingPlaces(db, C), 0);
  assert.equal(claimPromo(db, google(99)).status, 'full');
  assert.equal(claimPromo(db, google(1)).status, 'already'); // qui a déjà son code le retrouve
  for (const max of [-1, 1001, 1.5, '5', NaN]) assert.throws(() => saveSettings(db, C, { max, open: true }));
  assert.throws(() => saveSettings(db, C, { max: 5, open: 'oui' }));
});

test('code manuel : créé, compté dans les places, refusé si e-mail invalide ou places pleines', () => {
  const db = fresh();
  assert.equal(createManualClaim(db, C, 'pas un mail').status, 'invalid');
  const r = createManualClaim(db, C, '  Client@Exemple.FR ');
  assert.equal(r.status, 'created');
  assert.match(r.code, /^BLEDGER-/);
  assert.equal(listClaims(db, C).claims[0].email, 'client@exemple.fr');
  assert.equal(listClaims(db, C).claims[0].source, 'manual');
  for (let i = 1; i <= 9; i++) claimPromo(db, google(i));
  assert.equal(createManualClaim(db, C, 'autre@exemple.fr').status, 'full');
});

test('marquer utilisé / actif, supprimer libère la place, id inconnu = false', () => {
  const db = fresh();
  const { code } = claimPromo(db, google(1));
  const id = listClaims(db, C).claims[0].id;
  assert.equal(setUsed(db, C, id, true), true);
  assert.equal(listClaims(db, C).claims[0].status, 'used');
  assert.ok(listClaims(db, C).claims[0].usedAt);
  assert.equal(setUsed(db, C, id, false), true);
  assert.equal(listClaims(db, C).claims[0].usedAt, null);
  assert.equal(setUsed(db, C, 9999, true), false);
  assert.equal(setUsed(db, 'autre-campagne', id, true), false);
  assert.equal(remainingPlaces(db, C), 9);
  assert.equal(deleteClaim(db, C, id), true);
  assert.equal(remainingPlaces(db, C), 10);
  assert.equal(deleteClaim(db, C, id), false);
  assert.notEqual(claimPromo(db, google(1)).code, code); // il peut réclamer à nouveau, nouveau code
});

test('CSV : guillemets protégés, formules Excel neutralisées', () => {
  const csv = claimsToCsv([{ code: 'C1', email: '=HYPERLINK("x")', status: 'active', source: 'google', claimedAt: 'd', usedAt: null }]);
  assert.match(csv.split('\r\n')[0], /^code,email,statut/);
  assert.ok(csv.includes(`"'=HYPERLINK(""x"")"`));
});

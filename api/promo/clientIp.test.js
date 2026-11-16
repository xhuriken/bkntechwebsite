/** IP du visiteur : la fausse IP qu'un visiteur ajoute lui-même doit être ignorée. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clientIp } from './clientIp.js';

test('IP du visiteur : avant-dernier maillon, une fausse IP envoyée par le visiteur est ignorée', () => {
  const ip = (xff) => clientIp({ headers: { 'x-forwarded-for': xff }, socket: { remoteAddress: '10.0.0.9' } });
  assert.equal(ip('203.0.113.7, 172.18.0.2'), '203.0.113.7');
  assert.equal(ip('1.2.3.4, 203.0.113.7, 172.18.0.2'), '203.0.113.7'); // 1.2.3.4 = fausse IP
  assert.equal(ip(''), '10.0.0.9'); // pas de proxy : connexion directe
  assert.equal(clientIp({ headers: {} }), 'inconnue');
});

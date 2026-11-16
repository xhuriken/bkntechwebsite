/**
 * Génère l'empreinte du mot de passe admin (variable ADMIN_PASSWORD_HASH).
 *
 *   node scripts/admin-password.mjs            -> crée un mot de passe fort ALÉATOIRE + son empreinte
 *   ADMIN_NEW_PASSWORD='...' node scripts/admin-password.mjs  -> empreinte d'un mot de passe choisi
 *
 * Le mot de passe n'est affiché que pour être noté dans un gestionnaire de mots de passe ;
 * seule l'empreinte va dans .env et dans le secret GitHub (le serveur ne connaît jamais le mot de passe).
 */
import { randomInt } from 'node:crypto';
import { hashPassword } from '../api/admin/auth.js';

// Pas de 0/O, 1/I/L : se recopie sans erreur. 4 blocs de 5 = 20 caractères, environ 99 bits.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const block = () => Array.from({ length: 5 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
const generated = [block(), block(), block(), block()].join('-');

const chosen = process.env.ADMIN_NEW_PASSWORD;
if (chosen !== undefined && (chosen.length < 12 || chosen.length > 256)) {
  console.error('Mot de passe refusé : entre 12 et 256 caractères.');
  process.exit(1);
}
const password = chosen ?? generated;

if (chosen === undefined) console.log(`MOT_DE_PASSE=${password}`);
console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);

import React from 'react';

/**
 * Champ piège anti-robots. Invisible et inaccessible pour un humain (hors écran, hors tabulation,
 * masqué aux lecteurs d'écran) ; un robot qui remplit tous les champs le remplit aussi,
 * et le serveur refuse alors la connexion sans même calculer le mot de passe.
 */
export default function HoneypotField({ value, onChange }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        Site web
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

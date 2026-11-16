import { useEffect, useRef, useState } from 'react';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

// Charge le script officiel de Google une seule fois, même si le composant se remonte.
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    const script = existing || Object.assign(document.createElement('script'), { src: GIS_SRC, async: true });
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', reject, { once: true });
    if (!existing) document.head.append(script);
  });
}

/**
 * Bouton « Se connecter avec Google ». Google nous rend un jeton d'identité (credential)
 * que l'on envoie à NOTRE serveur : c'est lui qui le vérifie, jamais le navigateur.
 */
export default function GoogleSignInButton({ clientId, onCredential, disabled }) {
  const holder = useRef(null);
  const callback = useRef(onCredential);
  const [failed, setFailed] = useState(false);
  callback.current = onCredential; // toujours la dernière version, sans réinitialiser Google

  useEffect(() => {
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !holder.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => callback.current(credential),
        });
        window.google.accounts.id.renderButton(holder.current, {
          theme: 'filled_black', size: 'large', shape: 'pill', locale: 'fr',
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => { cancelled = true; };
  }, [clientId]);

  if (failed) {
    return <p role="alert" className="font-mono text-sm text-red-400">Impossible de charger la connexion Google. Vérifiez votre réseau ou votre bloqueur de publicités.</p>;
  }
  return <div ref={holder} aria-busy={disabled} className={`min-h-[44px] ${disabled ? 'pointer-events-none opacity-50' : ''}`} />;
}

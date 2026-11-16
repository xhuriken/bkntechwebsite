import React, { useState } from 'react';

/** Un code en grand, sélectionnable, avec un bouton « Copier ». */
export default function CopyCode({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard?.writeText(code)
    .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })
    .catch(() => {}); // sans presse-papiers : le code reste sélectionnable (select-all)
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-mono text-2xl md:text-3xl font-bold tracking-widest text-secondary select-all break-all">{code}</p>
      <button type="button" onClick={copy}
        className="font-mono text-sm text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded">
        {copied ? 'Code copié ✓' : 'Copier le code'}
      </button>
    </div>
  );
}

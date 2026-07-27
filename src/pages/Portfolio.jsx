import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Portfolio Page Component
 * Placeholder page for showcases (nearly empty, to be developed later).
 */
export default function Portfolio() {
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] px-6 text-center z-10">
      <h1 className="font-display font-black text-3xl md:text-5xl uppercase tracking-widest mb-4">
        {t('nav.portfolio')}
      </h1>
      <p className="text-on-surface-variant max-w-md text-xs tracking-widest font-light uppercase">
        Page Portfolio en cours de développement
      </p>
    </div>
  );
}

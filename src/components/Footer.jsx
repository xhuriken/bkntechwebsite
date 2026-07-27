import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Footer Component
 * Standard minimal footer containing legal links and copyright information.
 */
export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full py-8 px-6 md:px-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-on-surface-variant text-[10px] uppercase tracking-wider font-display font-black z-10 mt-auto bg-surface-container-lowest/50 backdrop-blur-sm">
      <div>
        {t('footer.copyright')}
      </div>
      <div className="flex gap-6 mt-4 md:mt-0">
        <a href="#" className="hover:text-primary transition-colors">
          Mentions Légales
        </a>
      </div>
    </footer>
  );
}

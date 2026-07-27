import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * LanguageSwitcher Component
 * Sliding transition toggle between French (FR) and English (EN) using react-i18next.
 */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'fr';

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative flex items-center p-1 bg-surface-container-low/50 rounded-xl border border-white/5 backdrop-blur-md">
      {/* Sliding physical layout indicator */}
      <div 
        className="absolute inset-y-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-primary rounded-lg shadow-[0_0_20px_rgba(190,194,255,0.25)]"
        style={{
          transform: currentLang === 'fr' ? 'translateX(0px)' : 'translateX(36px)',
          width: '32px'
        }}
      />
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => changeLanguage('fr')}
          className={`relative z-10 w-8 h-7 flex items-center justify-center text-[10px] font-black transition-colors duration-300 cursor-pointer focus:outline-none ${
            currentLang === 'fr' ? 'text-surface' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-label="Changer de langue en Français"
        >
          FR
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`relative z-10 w-8 h-7 flex items-center justify-center text-[10px] font-black transition-colors duration-300 cursor-pointer focus:outline-none ${
            currentLang === 'en' ? 'text-surface' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-label="Switch language to English"
        >
          EN
        </button>
      </div>
    </div>
  );
}

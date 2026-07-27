import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';

/**
 * Home Page Component
 * Renders the main Hero section of BKN Tech with title, description, and interactive magnetic buttons.
 */
export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[75vh] px-6 text-center z-10">
      {/* Premium Hero Title */}
      <h1 className="font-display font-black text-4xl md:text-7xl uppercase tracking-tight max-w-4xl leading-[1.1] mb-6">
        <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
          {t('hero.title_part1')}
        </span>
        <br />
        <span className="text-on-surface">
          {t('hero.title_part2')}
        </span>
      </h1>
      
      {/* Concise Pitch */}
      <p className="text-on-surface-variant max-w-2xl text-xs md:text-sm tracking-wide font-light leading-relaxed mb-10">
        {t('hero.description')}
      </p>

      {/* Hero CTA Actions */}
      <div className="flex flex-wrap gap-6 justify-center">
        {/* Magnetic Primary CTA for testing */}
        <Button variant="primary">
          <i className="fa-solid fa-paper-plane text-xs"></i>
          {t('hero.cta_contact')}
        </Button>
        
        {/* Secondary CTA */}
        <Button variant="secondary">
          <i className="fa-solid fa-gamepad text-xs"></i>
          {t('hero.cta_game')}
        </Button>
      </div>
    </div>
  );
}

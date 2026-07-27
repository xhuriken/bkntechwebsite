import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import ContactForm from '../components/ContactForm';

/**
 * Home Page Component
 * Renders the Hero section and integrates the bottom contact section with smooth scrolling.
 */
export default function Home() {
  const { t } = useTranslation();

  const handleContactScroll = (e) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center min-h-[75vh] px-6 text-center z-10 w-full max-w-4xl mx-auto">
        {/* Premium Hero Title */}
        <h1 className="font-display font-black text-4xl md:text-7xl uppercase tracking-tight leading-[1.1] mb-6">
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
          {/* Scroll to contact */}
          <Button variant="primary" onClick={handleContactScroll}>
            <i className="fa-solid fa-paper-plane text-xs"></i>
            {t('hero.cta_contact')}
          </Button>
          
          {/* Link to game */}
          <Button variant="secondary" href="/game">
            <i className="fa-solid fa-gamepad text-xs"></i>
            {t('hero.cta_game')}
          </Button>
        </div>
      </div>

      {/* Decorative divider */}
      <div className="w-full max-w-7xl px-6 md:px-12 mx-auto my-10">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Contact Form Section */}
      <ContactForm />
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * Navbar Component
 * Fully responsive sticky header featuring navigation links, dynamic mobile menu,
 * custom language switcher, and magnetic CTA button.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.portfolio'), path: '/portfolio' },
    { name: t('nav.game'), path: '/game' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
      {/* Brand Identity / Logo */}
      <Link to="/" className="font-display font-black text-xs tracking-[0.2em] text-on-surface hover:text-primary transition-colors uppercase">
        BKN Tech
      </Link>

      {/* Desktop Links (Hidden on mobile) */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative py-1 font-display font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300 ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              } group/link`}
            >
              {link.name}
              {/* Responsive underline hover/active effect */}
              <div 
                className={`absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 ${
                  isActive ? 'w-full' : 'w-0 group-hover/link:w-full'
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Desktop Utilities */}
      <div className="hidden md:flex items-center gap-4">
        <LanguageSwitcher />
        <Button variant="primary">
          <i className="fa-solid fa-plus text-xs"></i>
          {t('nav.cta')}
        </Button>
      </div>

      {/* Mobile Drawer Trigger (Hamburger Button) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex flex-col justify-center items-center w-6 h-6 gap-1.5 z-50 relative cursor-pointer focus:outline-none"
        aria-label="Menu principal"
      >
        <span className={`w-6 h-0.5 bg-on-surface transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
        <span className={`w-6 h-0.5 bg-on-surface transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`w-6 h-0.5 bg-on-surface transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
      </button>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-full bg-surface-container-low/95 border-b border-white/5 backdrop-blur-xl p-8 flex flex-col items-center gap-6 md:hidden shadow-2xl z-40"
          >
            <div className="flex flex-col items-center gap-4 w-full">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`py-2 font-display font-black text-xs uppercase tracking-[0.3em] transition-all duration-300 ${
                      isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
            <div className="h-px w-full bg-white/5" />
            
            <div className="flex flex-col items-center gap-4 w-full">
              <LanguageSwitcher />
              <Button variant="primary" onClick={() => setIsOpen(false)} className="w-full max-w-[200px]">
                <i className="fa-solid fa-plus text-xs"></i>
                {t('nav.cta')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

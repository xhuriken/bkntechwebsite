import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/**
 * Footer Component
 * Premium multi-column footer containing brand tagline, interactive links,
 * social connections, and legal copyright.
 */
export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-surface-container-lowest/30 backdrop-blur-md border-t border-white/5 pt-16 pb-8 px-6 md:px-12 z-10 relative mt-auto overflow-hidden">
      {/* Passive Noise Texture background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundBlendMode: 'soft-light'
        }}
      />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
        
        {/* Column 1: Identity & Socials */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <span className="font-sans font-extrabold tracking-[0.2em] text-sm text-primary uppercase select-none">
            Bkn Tech
          </span>
          <p className="text-xs font-sans font-normal text-on-surface-variant leading-relaxed max-w-sm">
            Ingénierie de plateformes sur mesure & développement de jeux multijoueurs. Excellence technique & esthétique.
          </p>
          {/* Social Icons list */}
          <div className="flex gap-4 mt-2">
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:scale-105 transition-all duration-300 group"
              aria-label="LinkedIn"
            >
              <i className="fa-brands fa-linkedin-in text-xs group-hover:scale-110 transition-transform"></i>
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:scale-105 transition-all duration-300 group"
              aria-label="GitHub"
            >
              <i className="fa-brands fa-github text-xs group-hover:scale-110 transition-transform"></i>
            </a>
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:scale-105 transition-all duration-300 group"
              aria-label="Discord"
            >
              <i className="fa-brands fa-discord text-xs group-hover:scale-110 transition-transform"></i>
            </a>
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:scale-105 transition-all duration-300 group"
              aria-label="Twitter X"
            >
              <i className="fa-brands fa-x-twitter text-xs group-hover:scale-110 transition-transform"></i>
            </a>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <span className="font-sans font-semibold tracking-wider text-[11px] uppercase text-primary/80 select-none">
            Navigation
          </span>
          <ul className="flex flex-col gap-2.5 font-sans font-medium text-xs text-on-surface-variant">
            <li>
              <Link to="/#home" className="hover:text-primary transition-colors">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/portfolio" className="hover:text-primary transition-colors">
                Portfolio
              </Link>
            </li>
            <li>
              <Link to="/#contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal Links */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <span className="font-sans font-semibold tracking-wider text-[11px] uppercase text-primary/80 select-none">
            Juridique
          </span>
          <ul className="flex flex-col gap-2.5 font-sans font-medium text-xs text-on-surface-variant">
            <li>
              <Link to="/mentions-legales" className="hover:text-primary transition-colors">
                Mentions Légales
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">
                Politique de Confidentialité
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-on-surface-variant/40 text-[10px] uppercase tracking-wider font-sans font-medium">
        <div>
          BKN TECH &copy; {new Date().getFullYear()} &mdash; TOUS DROITS RÉSERVÉS.
        </div>
        <div className="flex items-center gap-1.5 text-on-surface-variant/60 font-sans font-semibold normal-case">
          Enrique Puerto, Célestin Honvault
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/**
 * Footer Component
 * Premium multi-column footer containing brand tagline, interactive links,
 * social connections, and a real-time status indicator.
 */
export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-surface-container-lowest/30 backdrop-blur-md border-t border-white/5 pt-16 pb-8 px-6 md:px-12 z-10 relative mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
        
        {/* Column 1: Identity & Socials */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <span className="font-display font-black tracking-[0.25em] text-sm text-primary uppercase select-none">
            Bkn Tech
          </span>
          <p className="text-[10px] font-display font-black tracking-widest text-on-surface-variant/80 uppercase leading-relaxed max-w-sm">
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
          <span className="font-display font-black tracking-widest text-[9px] uppercase text-primary/80 select-none">
            Navigation
          </span>
          <ul className="flex flex-col gap-2.5 font-display font-black text-[10px] uppercase tracking-wider text-on-surface-variant">
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

        {/* Column 3: Legal & Live status */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <span className="font-display font-black tracking-widest text-[9px] uppercase text-primary/80 select-none">
            Juridique & Statut
          </span>
          <ul className="flex flex-col gap-2.5 font-display font-black text-[10px] uppercase tracking-wider text-on-surface-variant">
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
          
          {/* Creative Live Status Indicator */}
          <div className="flex items-center gap-2.5 mt-2 bg-surface rounded-xl border border-white/5 py-2 px-3 w-fit select-none">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            <span className="text-[8px] font-display font-black tracking-widest text-green-400 uppercase">
              All Systems Operational
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-on-surface-variant/40 text-[9px] uppercase tracking-wider font-display font-black">
        <div>
          BKN TECH &copy; {new Date().getFullYear()} &mdash; TOUS DROITS RÉSERVÉS.
        </div>
        <div className="flex items-center gap-1.5">
          <span>CONÇU & CONSTRUIT À PARIS</span>
          <span className="text-primary font-sans">&hearts;</span>
        </div>
      </div>
    </footer>
  );
}

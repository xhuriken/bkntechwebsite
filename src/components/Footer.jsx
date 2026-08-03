import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import InteractiveNetwork from './InteractiveNetwork';
import { useAdmin } from '../context/AdminContext';

export default function Footer() {
  const { t } = useTranslation();
  const { isAdmin, setIsLoginModalOpen, logout } = useAdmin();
  const [isFlashbang, setIsFlashbang] = useState(false);


  return (
    <>
      {/* FLASHBANG FULLSCREEN OVERLAY (Stays until lightbulb is clicked again) */}
      {isFlashbang && (
        <div
          className="fixed inset-0 bg-white z-[99998] pointer-events-auto cursor-default animate-in fade-in duration-75"
        />
      )}

      <footer className={`w-full border-t border-white/5 pt-4 pb-4 px-6 md:px-12 relative mt-auto overflow-hidden transition-colors duration-300 ${
        isFlashbang ? 'z-[99999] bg-white text-black' : 'z-10 bg-surface-container-lowest/30 backdrop-blur-md'
      }`}>
        {/* Passive Noise Texture background */}
        <div 
          className={`absolute inset-0 opacity-15 pointer-events-none transition-opacity duration-300 ${isFlashbang ? 'opacity-0' : 'opacity-15'}`} 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundBlendMode: 'soft-light'
          }}
        />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-1 items-stretch">
          
          {/* Part 1: Info, Links & Copyright (Left) - col-span-8 */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-8 pb-1">
            
            {/* Row 1: Columns */}
            <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch transition-opacity duration-300 ${isFlashbang ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              {/* Column 1: Identity & Socials */}
              <div className="md:col-span-6 flex flex-col gap-4 md:border-r border-white/5 md:pr-8 mt-4 lg:mt-6">
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-bold text-xs select-none">&gt;</span>
                  <span className="font-sans font-extrabold tracking-[0.2em] text-sm text-primary uppercase select-none">
                    Bkn Tech
                  </span>
                </div>
                <p className="text-xs font-sans font-normal text-on-surface-variant leading-relaxed max-w-sm">
                  {t('footer.description')}
                </p>
                {/* Social Icons list */}
                <div className="flex gap-4 mt-2">
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_12px_rgba(190,194,255,0.15)] hover:scale-110 transition-all duration-300 group"
                    aria-label="LinkedIn"
                  >
                    <i className="fa-brands fa-linkedin-in text-xs group-hover:scale-110 transition-transform"></i>
                  </a>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_12px_rgba(190,194,255,0.15)] hover:scale-110 transition-all duration-300 group"
                    aria-label="GitHub"
                  >
                    <i className="fa-brands fa-github text-xs group-hover:scale-110 transition-transform"></i>
                  </a>
                  <a 
                    href="https://discord.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_12px_rgba(190,194,255,0.15)] hover:scale-110 transition-all duration-300 group"
                    aria-label="Discord"
                  >
                    <i className="fa-brands fa-discord text-xs group-hover:scale-110 transition-transform"></i>
                  </a>
                  <a 
                    href="https://x.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_12px_rgba(190,194,255,0.15)] hover:scale-110 transition-all duration-300 group"
                    aria-label="Twitter X"
                  >
                    <i className="fa-brands fa-x-twitter text-xs group-hover:scale-110 transition-transform"></i>
                  </a>
                </div>
              </div>

              {/* Column 2: Navigation Links */}
              <div className="md:col-span-3 flex flex-col gap-4 md:border-r border-white/5 md:pr-8 mt-4 lg:mt-6">
                <div className="flex items-center gap-1.5 select-none">
                  <span className="text-primary/75 font-semibold text-[9px]">&gt;</span>
                  <span className="font-sans font-semibold tracking-wider text-[11px] uppercase text-primary/80">
                    {t('footer.navigation')}
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5 font-sans font-medium text-xs text-on-surface-variant">
                  <li>
                    <Link to="/#home" className="hover:text-primary hover:translate-x-1.5 transition-all duration-150 flex items-center gap-1">
                      {t('nav.home')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/portfolio" className="hover:text-primary hover:translate-x-1.5 transition-all duration-150 flex items-center gap-1">
                      {t('nav.portfolio')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/#contact" className="hover:text-primary hover:translate-x-1.5 transition-all duration-150 flex items-center gap-1">
                      {t('nav.contact')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Legal Links */}
              <div className="md:col-span-3 flex flex-col gap-4 md:pl-2 mt-4 lg:mt-6">
                <div className="flex items-center gap-1.5 select-none">
                  <span className="text-primary/75 font-semibold text-[9px]">&gt;</span>
                  <span className="font-sans font-semibold tracking-wider text-[11px] uppercase text-primary/80">
                    {t('footer.juridique')}
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5 font-sans font-medium text-xs text-on-surface-variant">
                  <li>
                    <Link to="/mentions-legales" className="hover:text-primary hover:translate-x-1.5 transition-all duration-150 flex items-center gap-1">
                      {t('footer.mentions_legales')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/politique-de-confidentialite" className="hover:text-primary hover:translate-x-1.5 transition-all duration-150 flex items-center gap-1">
                      {t('footer.politique_confidentialite')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Row 2: Bottom copyright / authors inside Part 1 */}
            <div className={`pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-wider font-sans font-medium mb-1 transition-colors duration-300 ${
              isFlashbang ? 'border-t border-black/10' : 'border-t border-white/5 text-on-surface-variant/40'
            }`}>
              <div className={`transition-opacity duration-300 ${isFlashbang ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                BKN TECH &copy; {new Date().getFullYear()} &mdash; {t('footer.rights')}
              </div>

              <div className="flex items-center gap-4 font-sans font-semibold normal-case">
                <span className={`transition-opacity duration-300 ${isFlashbang ? 'opacity-0 pointer-events-none' : 'text-on-surface-variant/60'}`}>
                  Enrique Puerto, Célestin Honvault
                </span>

                {/* Admin Auth Toggle in Footer */}
                {!isFlashbang && (
                  isAdmin ? (
                    <div className="flex items-center gap-3 font-mono text-[10px] lowercase">
                      <span className="text-green-400 font-bold">
                        Admin
                      </span>

                      <button
                        type="button"
                        onClick={logout}
                        className="inline-flex items-center gap-1 text-red-400/80 hover:text-red-400 hover:underline transition-colors cursor-pointer"
                        title="Se déconnecter de l'administration"
                      >
                        <i className="fa-solid fa-right-from-bracket text-[9px]"></i>
                        <span>[Déconnexion]</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsLoginModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer"
                      title="Espace Administrateur"
                    >
                      <i className="fa-solid fa-lock text-[9px]"></i>
                      <span>Admin</span>
                    </button>
                  )
                )}

                {/* Ultra-Minimal Discrete Lightbulb Easter Egg Button (Stays at exact footer position) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlashbang(prev => !prev);
                  }}
                  title={isFlashbang ? "Éteindre le Flashbang" : "Flashbang !"}
                  aria-label="Flashbang Easter Egg"
                  className={`transition-all duration-300 cursor-pointer p-1 rounded-md inline-flex items-center justify-center ${
                    isFlashbang
                      ? 'text-black hover:scale-140'
                      : 'text-white/20 hover:text-white hover:scale-130'
                  }`}
                >
                  <i className={`fa-solid fa-lightbulb ${isFlashbang ? 'text-base text-black' : 'text-[11px]'}`} />
                </button>
              </div>

            </div>

          </div>

          {/* Part 2: Interactive Cyberpunk Vector Node Canvas (Right) - col-span-4 */}
          <div className={`lg:col-span-4 flex transition-opacity duration-300 ${isFlashbang ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <InteractiveNetwork />
          </div>

        </div>
      </footer>
    </>
  );
}

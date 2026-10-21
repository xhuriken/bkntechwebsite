import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from './Button';

/**
 * EmptyCategoryState Component
 * Displays a premium, immersive empty state for categories that are currently in development.
 * Offers contextual messaging and a direct CTA to get in touch.
 */
export default function EmptyCategoryState({ category, isAdmin = false, onOpenCreate = null }) {
  const { t } = useTranslation();

  // Normalize key for translation lookup
  const normalizedKey = category === 'ai-agent' ? 'ai_agent' : (category || 'default');
  
  // Translation lookups with fallbacks
  const badge = t(`portfolio.empty_state.${normalizedKey}.badge`, {
    defaultValue: t('portfolio.empty_state.default.badge', 'Prochainement')
  });
  const title = t(`portfolio.empty_state.${normalizedKey}.title`, {
    defaultValue: t('portfolio.empty_state.default.title', 'Projets en cours de finalisation')
  });
  const desc = t(`portfolio.empty_state.${normalizedKey}.desc`, {
    defaultValue: t('portfolio.empty_state.default.desc', 'De nouvelles réalisations sur mesure pour cette catégorie sont actuellement en développement.')
  });
  const cta = t(`portfolio.empty_state.${normalizedKey}.cta`, {
    defaultValue: t('portfolio.empty_state.default.cta', 'Parler de votre projet')
  });

  // Themed visual configurations per category
  const getThemeConfig = () => {
    switch (category) {
      case 'ai-agent':
        return {
          glow: 'from-tertiary/15 via-tertiary/5 to-transparent',
          badgeBg: 'bg-tertiary/10 text-tertiary border-tertiary/20',
          dotBg: 'bg-tertiary',
          accentBorder: 'border-tertiary/20',
          icon: (
            <svg className="w-8 h-8 text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="4" y="4" width="16" height="16" rx="3" />
              <circle cx="9" cy="9" r="1.5" fill="currentColor" />
              <circle cx="15" cy="9" r="1.5" fill="currentColor" />
              <path d="M8 15h8" strokeLinecap="round" />
              <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" strokeLinecap="round" />
            </svg>
          )
        };
      case 'mobile':
        return {
          glow: 'from-primary/15 via-primary/5 to-transparent',
          badgeBg: 'bg-primary/10 text-primary border-primary/20',
          dotBg: 'bg-primary',
          accentBorder: 'border-primary/20',
          icon: (
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <path d="M12 18h.01" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M9 5h6" strokeLinecap="round" />
            </svg>
          )
        };
      case 'website':
        return {
          glow: 'from-secondary/15 via-secondary/5 to-transparent',
          badgeBg: 'bg-secondary/10 text-secondary border-secondary/20',
          dotBg: 'bg-secondary',
          accentBorder: 'border-secondary/20',
          icon: (
            <svg className="w-8 h-8 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          )
        };
      default:
        return {
          glow: 'from-white/10 via-white/5 to-transparent',
          badgeBg: 'bg-white/10 text-white border-white/20',
          dotBg: 'bg-white',
          accentBorder: 'border-white/10',
          icon: (
            <svg className="w-8 h-8 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        };
    }
  };

  const theme = getThemeConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full rounded-2xl border border-white/10 bg-surface-container-low/40 backdrop-blur-xl p-8 sm:p-12 overflow-hidden text-center flex flex-col items-center justify-center my-4"
    >
      {/* Background Radial Glow */}
      <div 
        className={`absolute inset-0 bg-gradient-radial ${theme.glow} pointer-events-none opacity-60`} 
      />

      {/* Decorative Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Icon Badge */}
      <div className="relative mb-5 flex items-center justify-center w-16 h-16 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
        {theme.icon}
      </div>

      {/* Pulsing Status Pill */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold border ${theme.badgeBg} mb-4 relative z-10`}>
        <span className={`w-2 h-2 rounded-full ${theme.dotBg} animate-pulse`} />
        <span>{badge}</span>
      </div>

      {/* Title */}
      <h3 className="relative z-10 font-sans font-extrabold text-xl sm:text-2xl text-on-surface uppercase tracking-tight max-w-xl mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="relative z-10 text-on-surface-variant/90 text-sm sm:text-[15px] font-normal leading-relaxed max-w-xl mb-8">
        {desc}
      </p>

      {/* Actions */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
        <Link to="/contact">
          <Button variant="primary">
            <span>{cta}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Button>
        </Link>

        {isAdmin && onOpenCreate && (
          <Button 
            variant="outline" 
            onClick={onOpenCreate}
            className="border-dashed border-white/20 hover:border-primary/60 text-xs font-mono"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>{t('portfolio.empty_state.admin_create', '+ Créer un projet')}</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}

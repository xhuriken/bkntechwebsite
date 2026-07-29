import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * PolitiqueConfidentialite Page Component
 * Complete Privacy Policy document compliant with GDPR (RGPD) & CNIL guidelines.
 */
export default function PolitiqueConfidentialite() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto px-6 py-12 md:py-20 z-10 relative"
    >
      {/* Back button */}
      <motion.div variants={itemVariants} className="mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors group"
        >
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('legal.back_home')}
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="border-b border-white/5 pb-6 mb-10">
        <h1 className="font-sans font-extrabold text-3xl md:text-5xl uppercase tracking-tight mb-4">
          {t('legal.privacy.title_part1')} <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('legal.privacy.title_part2')}</span>
        </h1>
        <p className="text-on-surface/80 text-sm font-normal tracking-wide uppercase">
          {t('legal.privacy.subtitle')}
        </p>
      </motion.div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-8">
        {/* Section 1 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            {t('legal.privacy.sec1_title')}
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            {t('legal.privacy.sec1_body')}<br />
            <strong className="text-on-surface font-semibold">Bkn Tech (SAS)</strong><br />
            47 rue Vivienne, 75002 Paris, France<br />
            SIREN : 104 054 150<br />
            {t('legal.privacy.sec1_contact')}{' '}
            <a href="mailto:contact@bkntech.fr" className="text-secondary hover:underline font-medium">
              contact@bkntech.fr
            </a>
          </div>
        </motion.section>

        {/* Section 2 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            {t('legal.privacy.sec2_title')}
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            {t('legal.privacy.sec2_body')}
            <ul className="list-disc list-inside mt-2 space-y-1 text-on-surface/90 text-xs">
              <li>{t('legal.privacy.sec2_li1')}</li>
              <li>{t('legal.privacy.sec2_li2')}</li>
              <li>{t('legal.privacy.sec2_li3')}</li>
            </ul>
            <p className="mt-2 text-xs text-on-surface/80">
              {t('legal.privacy.sec2_purpose')}
            </p>
          </div>
        </motion.section>

        {/* Section 3 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            {t('legal.privacy.sec3_title')}
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            {t('legal.privacy.sec3_body')}
            <ul className="list-disc list-inside mt-2 space-y-1 text-on-surface/90 text-xs">
              <li>{t('legal.privacy.sec3_li1')}</li>
              <li>{t('legal.privacy.sec3_li2')}</li>
            </ul>
          </div>
        </motion.section>

        {/* Section 4 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            {t('legal.privacy.sec4_title')}
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            {t('legal.privacy.sec4_body')}<br />
            <span className="text-xs text-on-surface/80 mt-1 block">
              {t('legal.privacy.sec4_sub')}
            </span>
          </div>
        </motion.section>

        {/* Section 5 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3 md:col-span-2 border-t border-white/5 pt-6">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            {t('legal.privacy.sec5_title')}
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            {t('legal.privacy.sec5_body')}
          </div>
        </motion.section>

        {/* Section 6 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3 md:col-span-2 border-t border-white/5 pt-6">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            {t('legal.privacy.sec6_title')}
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed space-y-3">
            <p>
              {t('legal.privacy.sec6_body')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface/90">
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <strong className="text-on-surface block mb-1">{t('legal.privacy.sec6_card1_title')}</strong>
                {t('legal.privacy.sec6_card1_desc')}
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <strong className="text-on-surface block mb-1">{t('legal.privacy.sec6_card2_title')}</strong>
                {t('legal.privacy.sec6_card2_desc')}
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <strong className="text-on-surface block mb-1">{t('legal.privacy.sec6_card3_title')}</strong>
                {t('legal.privacy.sec6_card3_desc')}
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <strong className="text-on-surface block mb-1">{t('legal.privacy.sec6_card4_title')}</strong>
                {t('legal.privacy.sec6_card4_desc')}
              </div>
            </div>
            <p className="text-xs text-on-surface/80 pt-2">
              {t('legal.privacy.sec6_footer1')}{' '}
              <a href="mailto:contact@bkntech.fr" className="text-secondary hover:underline font-semibold">
                contact@bkntech.fr
              </a>.<br />
              {t('legal.privacy.sec6_footer2')}{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
                www.cnil.fr
              </a>.
            </p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * MentionsLegales Page Component
 * Contains regulatory legal notice for BKN Tech (SAS, SIRET, RCS, VAT, Publishing & Hosting details).
 */
export default function MentionsLegales() {
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
          {t('legal.mentions.title_part1')} <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('legal.mentions.title_part2')}</span>
        </h1>
        <p className="text-on-surface/80 text-sm font-normal tracking-wide uppercase">
          {t('legal.mentions.subtitle')}
        </p>
      </motion.div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-8">
        {/* Section 1 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            {t('legal.mentions.sec1_title')}
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed whitespace-pre-line">
            <strong className="text-on-surface font-semibold">Bkn Tech</strong> (SAS)<br />
            {t('legal.mentions.sec1_body')}
            <a href="mailto:contact@bkntech.fr" className="text-secondary hover:underline font-medium">
              contact@bkntech.fr
            </a>
          </div>
        </motion.section>

        {/* Section 2 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            {t('legal.mentions.sec2_title')}
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            SIRET : <span className="text-on-surface font-medium">104 054 150 00016</span><br />
            SIREN : <span className="text-on-surface font-medium">104 054 150</span><br />
            RCS : Paris B 104 054 150<br />
            TVA intracommunautaire : FR69104054150<br />
            <span className="text-[11px] italic opacity-85 text-on-surface-variant">{t('legal.mentions.sec2_body_vat')}</span>
          </div>
        </motion.section>

        {/* Section 3 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            {t('legal.mentions.sec3_title')}
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            {t('legal.mentions.sec3_body')}<br />
            <strong className="text-on-surface font-semibold">OVH SAS</strong><br />
            2 rue Kellermann<br />
            59100 Roubaix, France<br />
            <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline text-xs font-medium">
              https://www.ovhcloud.com
            </a>
          </div>
        </motion.section>

        {/* Section 4 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            {t('legal.mentions.sec4_title')}
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            {t('legal.mentions.sec4_body')}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

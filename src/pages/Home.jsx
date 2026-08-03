import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import ContactForm from '../components/ContactForm';

/**
 * Modern & Authentic Home Page Component
 * Showcases BKN Tech's identity, core B2B services (Web, Mobile, AI), 
 * and side game development studio (Vacuum Protocol) with rich animations.
 */
export default function Home() {
  const { t } = useTranslation();

  const handleScrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      {/* ==================================================================== */}
      {/* HERO SECTION */}
      {/* ==================================================================== */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-6 text-center z-10 w-full max-w-5xl mx-auto pt-8 pb-16">
        
        {/* Glowing Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider bg-surface-container-high/80 border border-primary/30 text-primary mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(190,194,255,0.12)] group hover:border-primary/60 transition-all duration-300 cursor-default"
        >
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_var(--color-secondary)]"></span>
          <span>{t('hero.badge')}</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight leading-[1.1] mb-8"
        >
          <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent block pb-1">
            {t('hero.title_part1')}
          </span>
          <span className="text-on-surface block mt-1">
            {t('hero.title_part2')}
          </span>
        </motion.h1>

        {/* Authentic & Human Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-on-surface-variant max-w-3xl text-sm sm:text-base md:text-lg font-normal leading-relaxed mb-10"
        >
          {t('hero.description')}
        </motion.p>

        {/* Hero CTA Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap gap-4 justify-center items-center"
        >
          <Button variant="primary" onClick={handleScrollTo('contact')}>
            <i className="fa-solid fa-paper-plane text-xs"></i>
            {t('hero.cta_contact')}
          </Button>

          <Button variant="secondary" onClick={handleScrollTo('services-overview')}>
            <i className="fa-solid fa-layer-group text-xs"></i>
            {t('hero.cta_services')}
          </Button>

          <Button variant="tertiary" href="/portfolio/section/gaming">
            <i className="fa-solid fa-gamepad text-xs"></i>
            {t('hero.cta_game')}
          </Button>
        </motion.div>

        {/* Authentic Metrics Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-16 p-4 rounded-2xl bg-surface-container-low/50 border border-white/5 backdrop-blur-md"
        >
          <div className="flex flex-col items-center p-3 text-center">
            <span className="font-display font-bold text-2xl text-primary mb-0.5">3 Axes</span>
            <span className="text-xs text-on-surface-variant/80 font-mono">Web • Mobile • IA Métier</span>
          </div>
          <div className="flex flex-col items-center p-3 text-center sm:border-x border-white/10">
            <span className="font-display font-bold text-2xl text-secondary mb-0.5">100% Clean</span>
            <span className="text-xs text-on-surface-variant/80 font-mono">Zéro dette • ROI Garanti</span>
          </div>
          <div className="flex flex-col items-center p-3 text-center">
            <span className="font-display font-bold text-2xl text-tertiary mb-0.5">Vacuum Protocol</span>
            <span className="text-xs text-on-surface-variant/80 font-mono">Studio Unity • Devlog public</span>
          </div>
        </motion.div>
      </section>

      {/* Decorative Gradient Line */}
      <div className="w-full max-w-6xl px-6 mx-auto my-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* ==================================================================== */}
      {/* WHO WE ARE / PHILOSOPHY SECTION */}
      {/* ==================================================================== */}
      <section id="about" className="py-16 px-6 w-full max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-secondary mb-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
            {t('about.badge')}
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-on-surface tracking-tight mb-4">
            {t('about.title')}
          </h2>
          <p className="text-on-surface-variant max-w-2xl text-sm sm:text-base leading-relaxed">
            {t('about.description')}
          </p>
        </div>

        {/* 3 Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <motion.div 
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-surface-container-low/60 border border-white/5 hover:border-primary/40 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl mb-5 group-hover:scale-110 transition-transform duration-300">
              <i className="fa-solid fa-code"></i>
            </div>
            <h3 className="font-display font-semibold text-lg text-on-surface mb-2">
              {t('about.pillars.tech.title')}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {t('about.pillars.tech.desc')}
            </p>
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/15 transition-all duration-500" />
          </motion.div>

          {/* Pillar 2 */}
          <motion.div 
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-surface-container-low/60 border border-white/5 hover:border-secondary/40 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary text-xl mb-5 group-hover:scale-110 transition-transform duration-300">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h3 className="font-display font-semibold text-lg text-on-surface mb-2">
              {t('about.pillars.roi.title')}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {t('about.pillars.roi.desc')}
            </p>
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-secondary/15 transition-all duration-500" />
          </motion.div>

          {/* Pillar 3 */}
          <motion.div 
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-surface-container-low/60 border border-white/5 hover:border-tertiary/40 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary text-xl mb-5 group-hover:scale-110 transition-transform duration-300">
              <i className="fa-solid fa-hammer"></i>
            </div>
            <h3 className="font-display font-semibold text-lg text-on-surface mb-2">
              {t('about.pillars.craft.title')}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {t('about.pillars.craft.desc')}
            </p>
            <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-tertiary/15 transition-all duration-500" />
          </motion.div>
        </div>
      </section>

      {/* Decorative Gradient Line */}
      <div className="w-full max-w-6xl px-6 mx-auto my-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* ==================================================================== */}
      {/* CORE B2B SERVICES SECTION */}
      {/* ==================================================================== */}
      <section id="services-overview" className="py-16 px-6 w-full max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-primary mb-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            {t('services_home.badge')}
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-on-surface tracking-tight mb-3">
            {t('services_home.title')}
          </h2>
          <p className="text-on-surface-variant max-w-2xl text-sm sm:text-base leading-relaxed">
            {t('services_home.subtitle')}
          </p>
        </div>

        {/* Services Showcase Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Service 1: Web & Cloud */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl bg-surface-container-low/70 border border-primary/20 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group shadow-xl backdrop-blur-md"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
                  {t('services_home.web.tag')}
                </span>
                <i className="fa-solid fa-laptop-code text-2xl text-primary/80 group-hover:scale-110 transition-transform"></i>
              </div>

              <h3 className="font-display font-bold text-xl text-on-surface mb-3">
                {t('services_home.web.title')}
              </h3>

              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
                {t('services_home.web.desc')}
              </p>

              {/* Feature List */}
              <ul className="space-y-2.5 mb-8">
                {t('services_home.web.features', { returnObjects: true })?.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface/90">
                    <i className="fa-solid fa-check text-primary text-[10px] mt-1"></i>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              to="/portfolio/section/website" 
              className="inline-flex items-center justify-between w-full p-3 rounded-xl bg-surface-container-high/60 border border-white/10 hover:border-primary/40 text-xs font-mono text-primary font-medium transition-all group/btn"
            >
              <span>{t('portfolio.explore')}</span>
              <i className="fa-solid fa-arrow-right text-[10px] group-hover/btn:translate-x-1 transition-transform"></i>
            </Link>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />
          </motion.div>

          {/* Service 2: Mobile Engineering */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl bg-surface-container-low/70 border border-secondary/20 hover:border-secondary/50 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group shadow-xl backdrop-blur-md"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono uppercase tracking-wider text-secondary bg-secondary/10 border border-secondary/30 px-3 py-1 rounded-full">
                  {t('services_home.mobile.tag')}
                </span>
                <i className="fa-solid fa-mobile-screen-button text-2xl text-secondary/80 group-hover:scale-110 transition-transform"></i>
              </div>

              <h3 className="font-display font-bold text-xl text-on-surface mb-3">
                {t('services_home.mobile.title')}
              </h3>

              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
                {t('services_home.mobile.desc')}
              </p>

              {/* Feature List */}
              <ul className="space-y-2.5 mb-8">
                {t('services_home.mobile.features', { returnObjects: true })?.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface/90">
                    <i className="fa-solid fa-check text-secondary text-[10px] mt-1"></i>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              to="/portfolio/section/mobile" 
              className="inline-flex items-center justify-between w-full p-3 rounded-xl bg-surface-container-high/60 border border-white/10 hover:border-secondary/40 text-xs font-mono text-secondary font-medium transition-all group/btn"
            >
              <span>{t('portfolio.explore')}</span>
              <i className="fa-solid fa-arrow-right text-[10px] group-hover/btn:translate-x-1 transition-transform"></i>
            </Link>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-secondary/20 transition-all duration-500" />
          </motion.div>

          {/* Service 3: AI & Sovereign Systems */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl bg-surface-container-low/70 border border-tertiary/20 hover:border-tertiary/50 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group shadow-xl backdrop-blur-md"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono uppercase tracking-wider text-tertiary bg-tertiary/10 border border-tertiary/30 px-3 py-1 rounded-full">
                  {t('services_home.ai.tag')}
                </span>
                <i className="fa-solid fa-robot text-2xl text-tertiary/80 group-hover:scale-110 transition-transform"></i>
              </div>

              <h3 className="font-display font-bold text-xl text-on-surface mb-3">
                {t('services_home.ai.title')}
              </h3>

              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
                {t('services_home.ai.desc')}
              </p>

              {/* Feature List */}
              <ul className="space-y-2.5 mb-8">
                {t('services_home.ai.features', { returnObjects: true })?.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface/90">
                    <i className="fa-solid fa-check text-tertiary text-[10px] mt-1"></i>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              to="/portfolio/section/ai-agent" 
              className="inline-flex items-center justify-between w-full p-3 rounded-xl bg-surface-container-high/60 border border-white/10 hover:border-tertiary/40 text-xs font-mono text-tertiary font-medium transition-all group/btn"
            >
              <span>{t('portfolio.explore')}</span>
              <i className="fa-solid fa-arrow-right text-[10px] group-hover/btn:translate-x-1 transition-transform"></i>
            </Link>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-tertiary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-tertiary/20 transition-all duration-500" />
          </motion.div>

        </div>
      </section>

      {/* Decorative Gradient Line */}
      <div className="w-full max-w-6xl px-6 mx-auto my-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* ==================================================================== */}
      {/* SIDE GAME STUDIO SHOWCASE (VACUUM PROTOCOL) */}
      {/* ==================================================================== */}
      <section id="gaming-showcase" className="py-16 px-6 w-full max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-surface-container-low/90 via-surface-container/90 to-surface-container-low/90 border border-secondary/30 shadow-[0_0_40px_rgba(78,222,163,0.08)] overflow-hidden"
        >
          {/* Top Gaming Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-secondary/10 border border-secondary/30 text-secondary">
              <i className="fa-solid fa-gamepad text-xs"></i>
              <span>{t('game_home.badge')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span>Steam Early Access</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Main Information Column */}
            <div className="lg:col-span-7 text-left space-y-6">
              <h2 className="font-display font-black text-3xl sm:text-5xl text-on-surface tracking-tight uppercase leading-tight">
                {t('game_home.title')}
              </h2>
              
              <p className="text-secondary font-mono text-sm sm:text-base font-medium">
                {t('game_home.subtitle')}
              </p>

              <p className="text-on-surface-variant text-xs sm:text-sm sm:leading-relaxed leading-relaxed">
                {t('game_home.desc')}
              </p>

              {/* Game Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-surface-container-high/40 border border-white/5">
                  <div className="flex items-center gap-2 text-secondary text-sm font-semibold mb-1">
                    <i className="fa-solid fa-network-wired text-xs"></i>
                    <span>{t('game_home.netcode_title')}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant/80">
                    {t('game_home.netcode_desc')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-high/40 border border-white/5">
                  <div className="flex items-center gap-2 text-tertiary text-sm font-semibold mb-1">
                    <i className="fa-solid fa-cubes text-xs"></i>
                    <span>{t('game_home.graphics_title')}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant/80">
                    {t('game_home.graphics_desc')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button variant="secondary" href="/portfolio/section/gaming">
                  <i className="fa-solid fa-book-open text-xs"></i>
                  {t('game_home.graphics_cta')}
                </Button>

                <a 
                  href="https://discord.gg/bkntech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs sm:text-sm font-semibold transition-all duration-200"
                >
                  <i className="fa-brands fa-discord text-sm"></i>
                  <span>{t('game_home.discord_cta')}</span>
                </a>
              </div>
            </div>

            {/* Visual Media / Banner Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 group shadow-2xl bg-surface-container-lowest">
                {/* Decorative image or logo showcase */}
                <div className="aspect-video w-full flex items-center justify-center p-8 bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(78,222,163,0.15),transparent_70%)]" />
                  
                  <div className="flex flex-col items-center text-center z-10 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary text-3xl shadow-[0_0_20px_rgba(78,222,163,0.2)] group-hover:scale-110 transition-transform duration-300">
                      <i className="fa-solid fa-ghost"></i>
                    </div>
                    <span className="font-display font-black text-2xl tracking-wider text-on-surface uppercase">
                      VACUUM PROTOCOL
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-secondary uppercase bg-secondary/10 px-2.5 py-0.5 rounded border border-secondary/20">
                      Co-op Ghost Hunting • Unity URP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      </section>

      {/* Decorative Divider */}
      <div className="w-full max-w-7xl px-6 md:px-12 mx-auto mt-12 mb-2">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* ==================================================================== */}
      {/* CONTACT FORM SECTION */}
      {/* ==================================================================== */}
      <ContactForm />
    </div>
  );
}

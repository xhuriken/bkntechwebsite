import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import ContactForm from '../components/ContactForm';
import { useImageLightbox } from '../context/ImageLightboxContext';

/**
 * Helper component for passive Fine Noise Texture background
 */
function NoiseTextureOverlay() {
  return (
    <div
      className="absolute inset-0 opacity-8 pointer-events-none z-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundBlendMode: 'soft-light'
      }}
    />
  );
}

/**
 * Clean Terminal command tag typing effect list
 */
function HomeTerminalList({ tags = [], category = 'gaming' }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [typedCommand, setTypedCommand] = useState("");
  const [showTagsCount, setShowTagsCount] = useState(0);
  const [coloredTagsCount, setColoredTagsCount] = useState(0);
  const commandText = "dir tags";

  const randomDelay = useRef(Math.floor(Math.random() * 300) + 100);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !tags || tags.length === 0) return;

    let timeoutId;

    const typeCommand = (charIndex) => {
      if (charIndex <= commandText.length) {
        setTypedCommand(commandText.slice(0, charIndex));
        timeoutId = setTimeout(() => typeCommand(charIndex + 1), 60);
      } else {
        timeoutId = setTimeout(() => startOutputtingTags(1), 250);
      }
    };

    const startOutputtingTags = (count) => {
      if (count <= tags.length) {
        setShowTagsCount(count);
        timeoutId = setTimeout(() => startOutputtingTags(count + 1), 140);
      } else {
        timeoutId = setTimeout(() => colorTags(1), 200);
      }
    };

    const colorTags = (count) => {
      if (count <= tags.length) {
        setColoredTagsCount(count);
        timeoutId = setTimeout(() => colorTags(count + 1), 100);
      }
    };

    const initialDelayTimeout = setTimeout(() => {
      typeCommand(0);
    }, randomDelay.current);

    return () => {
      clearTimeout(initialDelayTimeout);
      clearTimeout(timeoutId);
    };
  }, [isVisible, tags]);

  if (!tags || tags.length === 0) return null;

  const getTagColorClass = () => {
    const c = category ? category.toLowerCase() : '';
    if (c === 'website') return 'text-secondary font-bold';
    if (c === 'ai-agent') return 'text-tertiary font-bold';
    if (c === 'mobile') return 'text-primary font-bold';
    return 'text-green-400 font-bold';
  };

  return (
    <div ref={ref} className="font-mono text-[9px] flex flex-col justify-start h-full select-none leading-relaxed">
      <div className="text-on-surface-variant/40 mb-1 flex items-center gap-1">
        <span className="text-primary">&gt;</span>
        <span>{typedCommand}</span>
        {typedCommand.length < commandText.length && (
          <span className="inline-block w-1.5 h-3 bg-primary animate-pulse ml-0.5" />
        )}
      </div>

      <div className="flex flex-col gap-1 mt-1">
        {tags.slice(0, showTagsCount).map((tag, i) => {
          const isColored = i < coloredTagsCount;
          return (
            <div key={i} className="flex items-center gap-1">
              <span className="text-on-surface-variant/30 text-[8px]">•</span>
              <span className={`transition-colors duration-200 uppercase tracking-wider ${isColored ? getTagColorClass() : 'text-on-surface-variant/70'}`}>
                {tag}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Animation variants
 */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: custom * 0.12, ease: [0.16, 1, 0.3, 1] }
  })
};

/**
 * Authentic & Dynamic Home Page Component
 */
export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { openLightbox } = useImageLightbox();
  const [featuredBannerUrl, setFeaturedBannerUrl] = useState('/BknLogo.svg');

  const isEn = i18n.language?.startsWith('en');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(settings => {
        if (settings.featuredBannerUrl) {
          setFeaturedBannerUrl(settings.featuredBannerUrl);
        }
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  const handleScrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      {/* ==================================================================== */}
      {/* HERO SECTION */}
      {/* ==================================================================== */}
      <section className="relative flex flex-col items-center justify-center min-h-[78vh] px-6 text-center z-10 w-full max-w-5xl mx-auto pt-8 pb-12">
        
        {/* Innovative Cyber Header Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8 group cursor-default"
        >
          <div className="relative flex items-center gap-3 px-5 py-2 bg-gradient-to-r from-surface-container-high/90 via-surface-container-low/90 to-surface-container-high/90 border-x border-primary/40 backdrop-blur-xl shadow-[0_0_20px_rgba(190,194,255,0.1)]">
            <span className="text-primary font-mono font-bold text-xs select-none">[</span>
            <div className="flex items-center gap-2">
              <span className="text-secondary font-mono font-bold text-xs">&lt;/&gt;</span>
              <span className="font-mono text-xs uppercase tracking-widest text-on-surface font-semibold">
                Studio Dev Web, Mobile & IA
              </span>
            </div>
            <span className="text-primary font-mono font-bold text-xs select-none">]</span>
          </div>
          {/* Subtle horizontal laser line decoration */}
          <div className="absolute -bottom-1 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
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

        {/* Studio Pitch */}
        <motion.p 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-on-surface-variant max-w-3xl text-sm sm:text-base md:text-lg font-normal leading-relaxed mb-10"
        >
          {t('hero.description')}
        </motion.p>

        {/* Hero Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap gap-4 justify-center items-center"
        >
          <Button variant="primary" onClick={handleScrollTo('contact')}>
            <i className="fa-solid fa-paper-plane text-xs"></i>
            {t('hero.cta_contact')}
          </Button>

          <Button variant="secondary" onClick={handleScrollTo('services-overview')}>
            <i className="fa-solid fa-cubes text-xs"></i>
            {t('hero.cta_services')}
          </Button>

          <Button variant="tertiary" href="/portfolio/section/gaming">
            <i className="fa-solid fa-gamepad text-xs"></i>
            {t('hero.cta_game')}
          </Button>
        </motion.div>

        {/* Key Features Bar - Height Centered Blocks */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-14 p-4 rounded-2xl bg-surface-container-low/70 border border-white/5 backdrop-blur-md relative overflow-hidden shadow-xl items-stretch"
        >
          <NoiseTextureOverlay />
          
          {/* Column 1 - Perfectly Centered */}
          <div className="flex flex-col items-center justify-center p-3 text-center z-10 min-h-[85px]">
            <span className="font-display font-black text-xl sm:text-2xl text-primary leading-tight mb-1">
              100% Sur-Mesure
            </span>
            <span className="text-xs text-on-surface-variant font-mono leading-tight">
              Conception & code sans template
            </span>
          </div>

          {/* Column 2 - Perfectly Centered */}
          <div className="flex flex-col items-center justify-center p-3 text-center sm:border-x border-white/10 z-10 min-h-[85px]">
            <span className="font-display font-black text-xl sm:text-2xl text-secondary leading-tight mb-1">
              Fullstack & Mobile
            </span>
            <span className="text-xs text-on-surface-variant font-mono leading-tight">
              Web, Apps & Assistants IA
            </span>
          </div>

          {/* Column 3 - Perfectly Centered */}
          <div className="flex flex-col items-center justify-center p-3 text-center z-10 min-h-[85px]">
            <span className="font-display font-black text-xl sm:text-2xl text-tertiary leading-tight mb-1">
              Studio & Projets
            </span>
            <span className="text-xs text-on-surface-variant font-mono leading-tight">
              Services B2B & Jeu vidéo Unity
            </span>
          </div>
        </motion.div>
      </section>

      {/* Visible Section Divider */}
      <div className="w-full max-w-6xl px-6 mx-auto my-8">
        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {/* ==================================================================== */}
      {/* WHO WE ARE / ENRIQUE & CÉLESTIN (Icon Left & Title Right Layout) */}
      {/* ==================================================================== */}
      <section id="about" className="py-12 px-6 w-full max-w-6xl mx-auto relative z-10">
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          custom={0}
          className="w-full rounded-2xl overflow-hidden bg-surface-container-low/80 border border-white/10 backdrop-blur-xl shadow-2xl relative"
        >
          <NoiseTextureOverlay />
          
          {/* Header Bar */}
          <div className="w-full bg-black/60 border-b border-white/5 px-6 py-3 flex items-center justify-between font-mono text-[11px] text-on-surface select-none relative z-10">
            <div className="flex items-center gap-2 text-primary font-bold">
              <i className="fa-solid fa-user-group text-xs text-secondary"></i>
              <span>{isEn ? 'C:/AboutUs' : 'C:/QuiSommesNous'}</span>
            </div>
            <span className="text-secondary font-mono font-bold text-[10px] uppercase tracking-wider">
              {t('about.tag')}
            </span>
          </div>

          <div className="p-8 sm:p-12 relative z-10 space-y-10">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-on-surface tracking-tight uppercase">
                {t('about.title')}
              </h2>
              <p className="text-secondary font-mono text-sm sm:text-base font-semibold">
                {t('about.subtitle')}
              </p>
              <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed font-normal">
                {t('about.description')}
              </p>
            </div>

            {/* 3 Pillars Grid with Icon on the Left & Title on the Right */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pillar 1 */}
              <motion.div 
                custom={1}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="p-6 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between relative overflow-hidden group shadow-lg"
              >
                <div className="space-y-4">
                  {/* Icon Left + Title Right */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-code"></i>
                    </div>
                    <h3 className="font-display font-bold text-lg text-on-surface leading-snug">
                      {t('about.pillars.tech.title')}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {t('about.pillars.tech.desc')}
                  </p>
                </div>
              </motion.div>

              {/* Pillar 2 */}
              <motion.div 
                custom={2}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="p-6 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between relative overflow-hidden group shadow-lg"
              >
                <div className="space-y-4">
                  {/* Icon Left + Title Right */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <h3 className="font-display font-bold text-lg text-on-surface leading-snug">
                      {t('about.pillars.roi.title')}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {t('about.pillars.roi.desc')}
                  </p>
                </div>
              </motion.div>

              {/* Pillar 3 */}
              <motion.div 
                custom={3}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="p-6 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between relative overflow-hidden group shadow-lg"
              >
                <div className="space-y-4">
                  {/* Icon Left + Title Right */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-gamepad"></i>
                    </div>
                    <h3 className="font-display font-bold text-lg text-on-surface leading-snug">
                      {t('about.pillars.craft.title')}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {t('about.pillars.craft.desc')}
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* Visible Section Divider */}
      <div className="w-full max-w-6xl px-6 mx-auto my-8">
        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {/* ==================================================================== */}
      {/* B2B SERVICES SHOWCASE */}
      {/* ==================================================================== */}
      <section id="services-overview" className="py-12 px-6 w-full max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          custom={0}
          className="flex flex-col items-center text-center mb-12"
        >
          <h2 className="font-display font-black text-3xl sm:text-5xl text-on-surface tracking-tight uppercase mb-3">
            {t('services_home.title')}
          </h2>
          <p className="text-on-surface-variant max-w-2xl text-sm sm:text-base leading-relaxed font-normal">
            {t('services_home.subtitle')}
          </p>
        </motion.div>

        {/* 3 B2B Cards Grid - Portfolio Category Themed Colors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Web Sur-Mesure (Secondary Green Theme) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            custom={1}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="rounded-2xl overflow-hidden bg-surface-container-low/70 border border-white/10 backdrop-blur-xl flex flex-col justify-between group shadow-xl relative"
          >
            <NoiseTextureOverlay />
            
            {/* Header Path */}
            <div className="w-full bg-black/60 border-b border-white/5 px-4 py-2.5 flex items-center justify-between font-mono text-[11px] text-secondary select-none relative z-10">
              <div className="flex items-center gap-2 font-bold">
                <span className="w-1.5 h-4 rounded-full bg-secondary"></span>
                <span>{t('services_home.web.path')}</span>
              </div>
              <span className="uppercase text-[9px] font-semibold text-on-surface-variant/70">{t('services_home.web.tag')}</span>
            </div>

            <div className="p-6 flex flex-col justify-between flex-grow relative z-10 space-y-6">
              <div className="space-y-4">
                {/* Header with Icon Left & Title Right */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary text-2xl flex-shrink-0 group-hover:rotate-6 transition-transform">
                    <i className="fa-solid fa-laptop-code"></i>
                  </div>
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-on-surface leading-snug">
                    {t('services_home.web.title')}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {t('services_home.web.desc')}
                </p>

                <ul className="space-y-2 pt-2">
                  {t('services_home.web.features', { returnObjects: true })?.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-on-surface/90">
                      <i className="fa-solid fa-check text-secondary text-[10px] mt-1"></i>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                variant="secondary"
                onClick={() => navigate('/portfolio/section/website')}
              >
                <span>{t('portfolio.explore')}</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Button>
            </div>
          </motion.div>

          {/* Card 2: Mobile iOS & Android (Primary Purple/Blue Theme) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            custom={2}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="rounded-2xl overflow-hidden bg-surface-container-low/70 border border-white/10 backdrop-blur-xl flex flex-col justify-between group shadow-xl relative"
          >
            <NoiseTextureOverlay />
            
            {/* Header Path */}
            <div className="w-full bg-black/60 border-b border-white/5 px-4 py-2.5 flex items-center justify-between font-mono text-[11px] text-primary select-none relative z-10">
              <div className="flex items-center gap-2 font-bold">
                <span className="w-1.5 h-4 rounded-full bg-primary"></span>
                <span>{t('services_home.mobile.path')}</span>
              </div>
              <span className="uppercase text-[9px] font-semibold text-on-surface-variant/70">{t('services_home.mobile.tag')}</span>
            </div>

            <div className="p-6 flex flex-col justify-between flex-grow relative z-10 space-y-6">
              <div className="space-y-4">
                {/* Header with Icon Left & Title Right */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl flex-shrink-0 group-hover:rotate-6 transition-transform">
                    <i className="fa-solid fa-mobile-screen-button"></i>
                  </div>
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-on-surface leading-snug">
                    {t('services_home.mobile.title')}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {t('services_home.mobile.desc')}
                </p>

                <ul className="space-y-2 pt-2">
                  {t('services_home.mobile.features', { returnObjects: true })?.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-on-surface/90">
                      <i className="fa-solid fa-check text-primary text-[10px] mt-1"></i>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                variant="primary"
                onClick={() => navigate('/portfolio/section/mobile')}
              >
                <span>{t('portfolio.explore')}</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Button>
            </div>
          </motion.div>

          {/* Card 3: IA & Automatisations (Tertiary Amber/Orange Theme) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            custom={3}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="rounded-2xl overflow-hidden bg-surface-container-low/70 border border-white/10 backdrop-blur-xl flex flex-col justify-between group shadow-xl relative"
          >
            <NoiseTextureOverlay />
            
            {/* Header Path */}
            <div className="w-full bg-black/60 border-b border-white/5 px-4 py-2.5 flex items-center justify-between font-mono text-[11px] text-tertiary select-none relative z-10">
              <div className="flex items-center gap-2 font-bold">
                <span className="w-1.5 h-4 rounded-full bg-tertiary"></span>
                <span>{t('services_home.ai.path')}</span>
              </div>
              <span className="uppercase text-[9px] font-semibold text-on-surface-variant/70">{t('services_home.ai.tag')}</span>
            </div>

            <div className="p-6 flex flex-col justify-between flex-grow relative z-10 space-y-6">
              <div className="space-y-4">
                {/* Header with Icon Left & Title Right */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary text-2xl flex-shrink-0 group-hover:rotate-6 transition-transform">
                    <i className="fa-solid fa-robot"></i>
                  </div>
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-on-surface leading-snug">
                    {t('services_home.ai.title')}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {t('services_home.ai.desc')}
                </p>

                <ul className="space-y-2 pt-2">
                  {t('services_home.ai.features', { returnObjects: true })?.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-on-surface/90">
                      <i className="fa-solid fa-check text-tertiary text-[10px] mt-1"></i>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                variant="tertiary"
                onClick={() => navigate('/portfolio/section/ai-agent')}
              >
                <span>{t('portfolio.explore')}</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Button>
            </div>
          </motion.div>

        </div>
      </section>



      {/* Visible Section Divider */}
      <div className="w-full max-w-6xl px-6 mx-auto my-8">
        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {/* ==================================================================== */}
      {/* VACUUM PROTOCOL FEATURED CARD */}
      {/* ==================================================================== */}
      <section id="gaming-showcase" className="py-12 px-6 w-full max-w-6xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          custom={0}
          className="w-full bg-surface-container-low/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 relative shadow-2xl"
        >
          {/* Ambient background glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none" />

          {/* Header Path */}
          <div className="w-full bg-black/60 border-b border-white/5 px-6 py-3 flex items-center justify-between font-mono text-[11px] text-green-400 select-none relative overflow-hidden">
            <NoiseTextureOverlay />
            <div className="flex items-center gap-2 overflow-hidden relative z-10 font-bold">
              <span className="w-1.5 h-4 rounded-full bg-green-400"></span>
              <span>{t('game_home.path')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-primary group-hover:text-white transition-colors relative z-10">
              <span>{t('portfolio.featured_title')}</span>
            </div>
          </div>

          {/* Body Split */}
          <div className="flex flex-col md:flex-row items-stretch flex-grow">
            {/* Left Column - Image flush & Text details & CTAs */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex flex-col md:flex-row items-stretch gap-6 p-6">
                {/* Cinematic Banner Image/Thumbnail (Banner 1) */}
                <div className="md:w-1/2 aspect-video overflow-hidden rounded-xl border border-white/5 relative bg-black/40 flex-shrink-0">
                  <img
                    src={featuredBannerUrl}
                    alt="Vacuum Protocol"
                    className="w-full h-full object-cover hover:scale-102 transition-transform duration-700 cursor-zoom-in"
                    onClick={() => openLightbox(featuredBannerUrl, "Vacuum Protocol")}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/notfound.gif';
                    }}
                  />
                </div>

                {/* Padded Text details & CTAs */}
                <div className="md:w-1/2 flex flex-col justify-between gap-6">
                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-[9px] text-on-surface-variant/60 font-bold uppercase tracking-wider">
                      {t('portfolio.production_active')}
                    </span>

                    <h2 className="font-sans font-extrabold text-2xl md:text-3xl uppercase tracking-tight text-on-surface group-hover:text-primary transition-colors">
                      Vacuum Protocol
                    </h2>

                    <p className="text-xs md:text-sm font-sans font-normal text-on-surface-variant/90 leading-relaxed">
                      {t('portfolio.featured_desc')}
                    </p>
                  </div>

                  {/* Standardized BKN Site Buttons */}
                  <div className="flex flex-wrap gap-4 mt-auto">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/portfolio/section/gaming')}
                    >
                      <span>{t('portfolio.featured_devlog_btn')}</span>
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Button>

                    <Button
                      variant="black"
                      href="https://discord.gg/bkntech"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa-brands fa-discord text-[11px] text-[#5865F2]"></i>
                      <span>{t('portfolio.featured_discord_btn')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Fixed cmd terminal column) */}
            <div className="w-full md:w-[155px] flex-shrink-0 p-6 pt-5.5 flex flex-col justify-between bg-black/35 border-t md:border-t-0 md:border-l border-white/5">
              <HomeTerminalList tags={['unity', 'c#', 'mirror_netcode', '3d_physics']} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Visible Section Divider */}
      <div className="w-full max-w-7xl px-6 md:px-12 mx-auto mt-10 mb-2">
        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {/* ==================================================================== */}
      {/* CONTACT FORM SECTION */}
      {/* ==================================================================== */}
      <ContactForm />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';

/**
 * Helper to extract YouTube video ID
 */
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * A dynamic typing effect terminal list of technologies inside portfolio cards
 */
function ProjectTerminalList({ tags = [] }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [typedCommand, setTypedCommand] = useState("");
  const [showTagsCount, setShowTagsCount] = useState(0);
  const [coloredTagsCount, setColoredTagsCount] = useState(0);
  const commandText = "ls keywords";

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
        timeoutId = setTimeout(() => typeCommand(charIndex + 1), 70);
      } else {
        timeoutId = setTimeout(() => startOutputtingTags(1), 300);
      }
    };

    const startOutputtingTags = (count) => {
      if (count <= tags.length) {
        setShowTagsCount(count);
        timeoutId = setTimeout(() => startOutputtingTags(count + 1), 160);
      } else {
        timeoutId = setTimeout(() => colorTags(1), 250);
      }
    };

    const colorTags = (count) => {
      if (count <= tags.length) {
        setColoredTagsCount(count);
        timeoutId = setTimeout(() => colorTags(count + 1), 120);
      }
    };

    typeCommand(0);

    return () => clearTimeout(timeoutId);
  }, [isVisible, tags]);

  if (!tags || tags.length === 0) return null;

  return (
    <div ref={ref} className="flex flex-col gap-2 flex-grow justify-between min-h-[110px] w-full font-mono text-[9px] select-none text-left">
      <div className="flex flex-col gap-1.5">
        {/* Terminal Command Header */}
        <div className="text-[8px] font-mono text-on-surface-variant/40 border-b border-white/5 pb-1 mb-1.5 flex items-center gap-1.5 h-4">
          <span className="text-white/20">$</span>
          <span>{typedCommand}</span>
          {typedCommand.length < commandText.length && isVisible && (
            <span className="w-1 h-2.5 bg-primary/70 animate-pulse" />
          )}
        </div>

        {/* Tags outputs */}
        <div className="flex flex-col gap-1">
          {tags.slice(0, showTagsCount).map((tag, idx) => {
            const isColored = idx < coloredTagsCount;
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-white/20">&gt;</span>
                <span className={isColored ? "text-green-400 font-bold transition-all duration-300" : "text-white/50"}>
                  {tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bottom prompt indicator */}
      <div className="flex items-center gap-1 text-white/30 text-[8px] mt-2">
        <span>$</span>
        {coloredTagsCount === tags.length && (
          <span className="w-1.5 h-2.5 bg-green-400 animate-pulse" />
        )}
      </div>
    </div>
  );
}

/**
 * Portfolio Main Page Component
 * Displays 4 interactive project carousels (Gaming, Website, Agent IA, Mobile)
 * dynamically loaded from the serverless posts API.
 */
export default function Portfolio() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentLang = i18n.language || 'fr';

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Exclude gaming category as it is featured separately on top
          const rest = data.filter(p => p.category !== 'gaming');
          setPosts(rest);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const categories = [
    { key: 'website', title: t('portfolio.categories.website'), color: 'from-secondary/20 to-transparent' },
    { key: 'ai-agent', title: t('portfolio.categories.ai-agent'), color: 'from-tertiary/20 to-transparent' },
    { key: 'mobile', title: t('portfolio.categories.mobile'), color: 'from-primary/20 to-transparent' }
  ];

  const getMediaThumbnail = (post) => {
    if (post.mediaType === 'video') {
      const ytId = getYouTubeId(post.mediaUrl);
      if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
    }
    return post.mediaUrl || 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-10 z-10 relative">
      
      {/* Portfolio Header with Admin portal link */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6 mb-12">
        <div>
          <h1 className="font-sans font-extrabold text-3xl md:text-5xl uppercase tracking-tight mb-3">
            {t('portfolio.title')}
          </h1>
          <p className="text-on-surface/85 text-sm font-normal tracking-wide max-w-xl">
            {t('portfolio.subtitle')}
          </p>
        </div>
        <Link 
          to="/portfolio/admin" 
          className="w-10 h-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all duration-300 group"
          title={t('portfolio.admin.title')}
        >
          <svg className="w-4 h-4 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-on-surface-variant/80 font-sans font-medium text-sm">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement du portfolio...
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-16 md:gap-20"
        >
          {/* Projet à la une : Vacuum Protocol */}
          <motion.div 
            variants={sectionVariants}
            className="w-full bg-surface-container-low/40 backdrop-blur-md border border-white/5 hover:border-primary/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-stretch relative overflow-hidden transition-all duration-300"
          >
            {/* Ambient background decorative glow */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full filter blur-[80px] pointer-events-none" />

            {/* Left side: Cinematic Banner Image/Thumbnail */}
            <div className="md:w-1/2 aspect-video overflow-hidden rounded-xl border border-white/5 relative bg-black/40 flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800" 
                alt="Vacuum Protocol" 
                className="w-full h-full object-cover hover:scale-102 transition-transform duration-700" 
              />
              <div className="absolute top-3 left-3 bg-primary text-black font-sans font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg">
                Projet à la une
              </div>
            </div>

            {/* Right side: Information and CTAs */}
            <div className="md:w-1/2 flex flex-col justify-between gap-6 py-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary">
                    Unity Game Development
                  </span>
                  <span className="text-[10px] text-on-surface-variant/40">•</span>
                  <span className="text-[10px] font-sans text-on-surface-variant/60">
                    Production active
                  </span>
                </div>

                <h2 className="font-sans font-extrabold text-2xl md:text-3xl uppercase tracking-tight text-on-surface">
                  Vacuum Protocol
                </h2>

                <p className="text-xs md:text-sm font-sans font-normal text-on-surface-variant leading-relaxed">
                  Un jeu de tir tactique multijoueur compétitif en 3D développé sous Unity HDRP. Explorez notre cycle de développement à long terme, nos optimisations netcode et nos avancées d'intégration de gameplay.
                </p>

                {/* Terminal line for tags */}
                <div className="w-full max-w-md font-mono text-[9px] bg-black/40 border border-white/5 rounded-lg p-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-green-400 select-none mt-1">
                  <span className="text-white/20">$</span>
                  <span className="text-on-surface-variant/50">ls keywords:</span>
                  <span className="text-white font-bold">unity</span>
                  <span className="text-white/20">•</span>
                  <span className="text-white font-bold">c#</span>
                  <span className="text-white/20">•</span>
                  <span className="text-white font-bold">mirror_netcode</span>
                  <span className="text-white/20">•</span>
                  <span className="text-white font-bold">3d_physics</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mt-auto">
                <Button 
                  variant="primary"
                  onClick={() => navigate('/portfolio/section/gaming')}
                >
                  <span>Visiter le Devlog</span>
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
                  <span>Rejoindre le Discord</span>
                </Button>
              </div>
            </div>
          </motion.div>

          {categories.map((cat) => {
            const catPosts = posts.filter(p => p.category === cat.key);
            
            return (
              <motion.section 
                key={cat.key} 
                variants={sectionVariants}
                className="flex flex-col gap-6"
              >
                {/* Section Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h2 className="font-sans font-bold text-lg md:text-xl uppercase tracking-wider text-primary">
                    {cat.title}
                  </h2>
                  <Link 
                    to={`/portfolio/section/${cat.key}`}
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors group"
                  >
                    {t('portfolio.explore')}
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>

                {/* Carousels display */}
                {catPosts.length === 0 ? (
                  <div className="bg-surface-container-low/30 backdrop-blur-sm border border-white/5 rounded-2xl py-12 px-6 text-center text-xs font-sans font-medium text-on-surface-variant/70 uppercase tracking-wide">
                    {t('portfolio.no_projects')}
                  </div>
                ) : (
                  <div className="relative">
                    {/* Carousel Scroll Wrapper */}
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x snap-mandatory scroll-smooth -mx-6 px-6 md:mx-0 md:px-0">
                      {catPosts.map((post) => (
                        <Link 
                          to={`/portfolio/section/${post.category}`}
                          key={post.id}
                          className="snap-start flex-shrink-0 w-[360px] sm:w-[440px] bg-surface-container-low/45 backdrop-blur-md border border-white/5 hover:border-primary/20 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                        >
                          {/* Terminal Header */}
                          <div className="w-full bg-black/60 border-b border-white/5 px-4 py-2 flex items-center justify-between font-mono text-[9px] text-green-400 select-none">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="relative w-3.5 h-3.5 flex items-center justify-center text-primary mr-1.5 flex-shrink-0">
                                <i className="fa-regular fa-folder absolute transition-all duration-200 group-hover:opacity-0 group-hover:scale-90"></i>
                                <i className="fa-regular fa-folder-open absolute transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"></i>
                              </span>
                              <span className="text-[8px] uppercase tracking-wider text-on-surface-variant/40">~/{post.category}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[8px] font-sans font-bold uppercase tracking-wider text-primary group-hover:text-white transition-colors">
                              <span>Ouvrir</span>
                              <svg className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                              </svg>
                            </div>
                          </div>

                          {/* Body Split */}
                          <div className="flex flex-row items-stretch flex-grow">
                            {/* Left Column (flex-grow) - Image flush & Text details */}
                            <div className="flex-1 flex flex-col justify-between overflow-hidden">
                              {/* Image/Video preview (flush to borders) */}
                              <div className="relative aspect-video overflow-hidden bg-black/40 border-b border-white/5 w-full flex-shrink-0">
                                <img 
                                  src={getMediaThumbnail(post)} 
                                  alt={post.title[currentLang] || post.title['fr']}
                                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                  loading="lazy"
                                />
                                {post.mediaType === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                    <div className="w-8 h-8 rounded-full bg-primary/95 text-black flex items-center justify-center shadow-lg">
                                      <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Padded Text details */}
                              <div className="p-4 flex flex-col gap-2 flex-grow justify-start">
                                {/* Date */}
                                <span className="font-mono text-[9px] text-on-surface-variant/60 font-bold">
                                  {post.date}
                                </span>

                                {/* Text details */}
                                <div className="flex flex-col gap-1.5">
                                  <h3 className="font-sans font-extrabold text-xs sm:text-sm uppercase tracking-tight text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                                    {post.title[currentLang] || post.title['fr']}
                                  </h3>
                                  <p className="text-[11px] font-sans font-normal text-on-surface-variant/90 leading-relaxed line-clamp-3">
                                    {post.description[currentLang] || post.description['fr']}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Right Column (Fixed cmd column: 130px on mobile, 145px on small and up) */}
                            <div className="w-[130px] sm:w-[145px] flex-shrink-0 p-4 pt-3.5 flex flex-col justify-between bg-black/35 border-l border-white/5">
                              <ProjectTerminalList tags={post.tags} />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </motion.section>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

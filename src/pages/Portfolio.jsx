import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { formatLocaleDate } from '../utils/dateFormatter';
import VacuumParticles from '../components/VacuumParticles';
import { useImageLightbox } from '../context/ImageLightboxContext';
import { useAdmin } from '../context/AdminContext';


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
/**
 * A dynamic typing effect terminal list of technologies inside portfolio cards
 */
function ProjectTerminalList({ tags = [], category = 'gaming' }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [typedCommand, setTypedCommand] = useState("");
  const [showTagsCount, setShowTagsCount] = useState(0);
  const [coloredTagsCount, setColoredTagsCount] = useState(0);
  const commandText = "ls keywords";

  // Stagger typing launch randomly between 150ms and 550ms to prevent synchronized screen drops
  const randomDelay = useRef(Math.floor(Math.random() * 400) + 150);

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

    // Staggered trigger delay
    const initialDelayTimeout = setTimeout(() => {
      typeCommand(0);
    }, randomDelay.current);

    return () => {
      clearTimeout(initialDelayTimeout);
      clearTimeout(timeoutId);
    };
  }, [isVisible, tags]);

  if (!tags || tags.length === 0) return null;

  // Determine tag validation text and cursor color theme by category
  const getTagColorClass = () => {
    const c = category ? category.toLowerCase() : '';
    if (c === 'website') return 'text-secondary font-bold'; // Green-accent `#4edea3`
    if (c === 'ai-agent') return 'text-tertiary font-bold'; // Orange-accent `#ffb95f`
    if (c === 'mobile') return 'text-primary font-bold'; // Purple-accent `#bec2ff`
    return 'text-green-400 font-bold'; // Gaming
  };

  const getCursorColorClass = () => {
    const c = category ? category.toLowerCase() : '';
    if (c === 'website') return 'bg-secondary';
    if (c === 'ai-agent') return 'bg-tertiary';
    if (c === 'mobile') return 'bg-primary';
    return 'bg-green-400';
  };

  const colorClass = getTagColorClass();
  const cursorClass = getCursorColorClass();

  return (
    <div ref={ref} className="flex flex-col gap-2 flex-grow justify-between min-h-[110px] w-full font-mono text-[9px] select-none text-left">
      <div className="flex flex-col gap-1.5">
        {/* Terminal Command Header */}
        <div className="text-[8px] font-mono text-on-surface-variant/40 border-b border-white/5 pb-1 mb-1.5 flex items-center gap-1.5 h-4">
          <span className="text-white/20">$</span>
          <span>{typedCommand}</span>
          {typedCommand.length < commandText.length && isVisible && (
            <span className={`w-1 h-2.5 ${cursorClass}/70 animate-pulse`} />
          )}
        </div>

        {/* Tags outputs */}
        <div className="flex flex-col gap-1">
          {tags.slice(0, showTagsCount).map((tag, idx) => {
            const isColored = idx < coloredTagsCount;
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-white/20">&gt;</span>
                <span className={isColored ? `${colorClass} transition-all duration-300` : "text-white/50"}>
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
          <span className={`w-1.5 h-2.5 ${cursorClass} animate-pulse`} />
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
  const { openLightbox } = useImageLightbox();
  const { isAdmin, openCreatePost, openEditPost, openBannerModal, openConfirmModal, adminPassword, dataRefreshCounter, triggerRefresh } = useAdmin();

  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndices, setSelectedIndices] = useState({ website: 0, 'ai-agent': 0, mobile: 0 });
  const currentLang = i18n.language || 'fr';
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [featuredBannerUrl, setFeaturedBannerUrl] = useState('/BknLogo.svg');
  const letterORef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Exclude gaming category as it is featured separately on top
          const rest = data.filter(p => p.category !== 'gaming');
          setPosts(rest);

          // Calculate random starting index for each category
          const initialIndices = {};
          const catKeys = ['website', 'ai-agent', 'mobile'];
          catKeys.forEach(catKey => {
            const catPosts = rest.filter(p => p.category === catKey);
            if (catPosts.length > 0) {
              initialIndices[catKey] = Math.floor(Math.random() * catPosts.length);
            } else {
              initialIndices[catKey] = 0;
            }
          });
          setSelectedIndices(initialIndices);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch site settings for featured banner URL
    fetch('/api/settings')
      .then(res => res.json())
      .then(settings => {
        if (settings.featuredBannerUrl) {
          setFeaturedBannerUrl(settings.featuredBannerUrl);
        }
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, [dataRefreshCounter]);


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
    return post.mediaUrl || '/BknLogo.svg';
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
      <VacuumParticles targetRef={letterORef} />

      {/* Portfolio Header with Admin portal link */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6 mb-12">
        <div>
          <h1 className="font-sans font-extrabold text-3xl md:text-5xl uppercase tracking-tight mb-3">
            PORTF<span ref={letterORef} className="relative inline-block text-primary">O</span>LIO
          </h1>
          <p className="text-on-surface/85 text-sm font-normal tracking-wide max-w-xl">
            {t('portfolio.subtitle')}
          </p>
        </div>
        <div>
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => openCreatePost('website')}
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>{t('portfolio.admin.create_btn') || '+ Nouveau Projet'}</span>
            </Button>
          )}
        </div>

      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-on-surface-variant/80 font-sans font-medium text-sm">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('portfolio.loading')}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-10 md:gap-12"
        >
          {/* Projet à la une : Vacuum Protocol */}
          <motion.div
            variants={sectionVariants}
            className="w-full bg-surface-container-low/40 backdrop-blur-md border border-white/5 hover:border-primary/10 rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 relative"
          >
            {/* Ambient background decorative glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none" />

            {/* Terminal Header */}
            <div className="w-full bg-black/60 border-b border-white/5 px-6 py-3 flex items-center justify-between font-mono text-[10px] text-green-400 select-none relative overflow-hidden">
              {/* Passive Noise Texture background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundBlendMode: 'soft-light'
                }}
              />
              <div className="flex items-center gap-2 overflow-hidden relative z-10 font-mono font-bold text-green-400 text-[11px]">
                <span className="w-1.5 h-4 rounded-full bg-green-400"></span>
                <span>C:/VacuumProtocol</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-sans font-bold uppercase tracking-wider text-primary group-hover:text-white transition-colors relative z-10">
                <span>{t('portfolio.featured_title')}</span>
              </div>
            </div>

            {/* Body Split */}
            <div className="flex flex-col md:flex-row items-stretch flex-grow">
              {/* Left Column (flex-grow) - Image flush & Text details & CTAs */}
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex flex-col md:flex-row items-stretch gap-6 p-6">
                  {/* Cinematic Banner Image/Thumbnail */}
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
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openBannerModal('featured');
                        }}
                        className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 border border-primary/40 text-primary font-mono text-[10px] font-bold uppercase backdrop-blur-md hover:bg-primary hover:text-black transition-all cursor-pointer z-20"
                      >
                        <i className="fa-solid fa-pen text-[9px] mr-1"></i>
                        Modifier Bannière
                      </button>
                    )}
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

                    {/* CTA Buttons */}
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

              {/* Right Column (Fixed cmd column) */}
              <div className="w-full md:w-[155px] flex-shrink-0 p-6 pt-5.5 flex flex-col justify-between bg-black/35 border-t md:border-t-0 md:border-l border-white/5">
                <ProjectTerminalList tags={['unity', 'c#', 'mirror_netcode', '3d_physics']} />
              </div>
            </div>
          </motion.div>

          {categories.map((cat) => {
            const catPosts = posts.filter(p => p.category === cat.key);

            // Map category key to its specific brand color gradient
            const getCategoryGradient = (catKey) => {
              if (catKey === 'website') return 'from-secondary to-transparent';
              if (catKey === 'ai-agent') return 'from-tertiary to-transparent';
              return 'from-primary to-transparent';
            };

            return (
              <motion.section
                key={cat.key}
                variants={sectionVariants}
                className="flex flex-col gap-5"
              >
                {/* Section Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    {/* Animated vertical brand-colored gradient pill */}
                    <span className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${getCategoryGradient(cat.key)}`} />
                    <h2 className="font-sans font-extrabold text-xl md:text-2xl uppercase tracking-tight text-on-surface">
                      {cat.title}
                    </h2>
                  </div>
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
                ) : (() => {
                  const selectedIndex = selectedIndices[cat.key] || 0;
                  const N = catPosts.length;
                  const offsetIndex = isMobile
                    ? selectedIndex
                    : (N <= 3
                      ? (selectedIndex === 2 ? 1 : 0)
                      : Math.min(Math.max(0, selectedIndex - 2), N - 3)
                    );

                  const getCategoryTheme = (catKey) => {
                    if (catKey === 'website') return { bg: 'bg-secondary', text: 'text-secondary', shadow: 'rgba(78, 222, 163, 0.15)', shadowHover: 'rgba(78, 222, 163, 0.4)', activeBorder: 'border-secondary/40' };
                    if (catKey === 'ai-agent') return { bg: 'bg-tertiary', text: 'text-tertiary', shadow: 'rgba(255, 185, 95, 0.15)', shadowHover: 'rgba(255, 185, 95, 0.4)', activeBorder: 'border-tertiary/40' };
                    return { bg: 'bg-primary', text: 'text-primary', shadow: 'rgba(190, 194, 255, 0.15)', shadowHover: 'rgba(190, 194, 255, 0.4)', activeBorder: 'border-primary/40' };
                  };
                  const theme = getCategoryTheme(cat.key);

                  return (
                    <div className="relative overflow-hidden w-full px-1 py-4 -mx-1">
                      {/* Gradient overlay fades for soft overflow masking */}
                      <div className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#12131b] to-transparent pointer-events-none z-20 transition-opacity duration-300 ${offsetIndex > 0 ? 'opacity-100' : 'opacity-0'}`} />
                      <div className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#12131b] to-transparent pointer-events-none z-20 transition-opacity duration-300 ${isMobile
                        ? (offsetIndex < N - 1 ? 'opacity-100' : 'opacity-0')
                        : (N <= 3
                          ? (offsetIndex < 1 ? 'opacity-100' : 'opacity-0')
                          : (offsetIndex < N - 3 ? 'opacity-100' : 'opacity-0')
                        )
                        }`} />

                      {/* Style block for responsive variable support in our CSS transitions */}
                      <style dangerouslySetInnerHTML={{
                        __html: `
                        .carousel-track-${cat.key} {
                          --card-width: 360px;
                          --gap: 24px;
                          transform: translateX(calc(-1 * var(--offset-index, 0) * (var(--card-width) + var(--gap))));
                          transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1);
                        }
                        @media (min-width: 640px) {
                          .carousel-track-${cat.key} {
                            --card-width: 440px;
                          }
                        }
                      `}} />

                      {/* Carousel Track Container */}
                      <div
                        className={`flex gap-6 carousel-track-${cat.key}`}
                        style={{ '--offset-index': offsetIndex }}
                      >
                        {catPosts.map((post, idx) => {
                          const isActive = idx === selectedIndex;

                          return (
                            <div
                              key={post.id}
                              onClick={() => setSelectedIndices(prev => ({ ...prev, [cat.key]: idx }))}
                              className={`flex-shrink-0 w-[360px] sm:w-[440px] rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group cursor-pointer border ${isActive
                                ? `opacity-100 scale-100 border-white/10 bg-surface-container-low/80 shadow-[0_0_30px_${theme.shadow}]`
                                : 'opacity-70 hover:opacity-95 scale-[0.98] border-white/5 bg-surface-container-low/20'
                                }`}
                            >
                              <Link
                                to={`/portfolio/section/${post.category}#post-${post.id}`}
                                onClick={(e) => {
                                  // Prevent navigating if this wasn't the active card
                                  if (!isActive) {
                                    e.preventDefault();
                                  }
                                }}
                                className="flex flex-col h-full w-full"
                              >
                                {/* Terminal Header */}
                                <div className="w-full bg-black/60 border-b border-white/5 px-4 py-2 flex items-center justify-between font-mono text-[9px] text-green-400 select-none relative overflow-hidden">
                                  {/* Passive Noise Texture background */}
                                  <div
                                    className="absolute inset-0 opacity-15 pointer-events-none"
                                    style={{
                                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                      backgroundBlendMode: 'soft-light'
                                    }}
                                  />
                                  <div className="flex items-center gap-1.5 overflow-hidden relative z-10 font-mono font-bold text-[10px] text-on-surface">
                                    <span className={`w-1.5 h-3.5 rounded-full ${theme.bg}`}></span>
                                    <span>C:/{post.category === 'website' ? 'Web' : post.category === 'ai-agent' ? 'IA' : 'Mobile'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[8px] font-sans font-bold uppercase tracking-wider text-primary group-hover:text-white transition-colors relative z-10">
                                    <span>{t('portfolio.open')}</span>
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

                                      {isAdmin && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              openEditPost(post);
                                            }}
                                            className="px-2 py-1 rounded-md bg-black/90 border border-primary/50 text-primary font-mono text-[9px] font-bold uppercase hover:bg-primary hover:text-black transition-all cursor-pointer shadow-lg"
                                            title="Modifier ce projet"
                                          >
                                            <i className="fa-solid fa-pen text-[8px] mr-1"></i>
                                            Modifier
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              openConfirmModal({
                                                title: 'Suppression de Projet',
                                                message: `Êtes-vous sûr de vouloir supprimer définitivement "${post.title?.fr || 'ce projet'}" ? Cette action est irréversible.`,
                                                onConfirm: async () => {
                                                  try {
                                                    await fetch(`/api/posts?id=${post.id}`, {
                                                      method: 'DELETE',
                                                      headers: { 'x-admin-password': adminPassword }
                                                    });
                                                    triggerRefresh();
                                                  } catch (err) {
                                                    console.error('Delete failed:', err);
                                                  }
                                                }
                                              });
                                            }}
                                            className="px-2 py-1 rounded-md bg-black/90 border border-red-500/50 text-red-400 font-mono text-[9px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-lg"
                                            title="Supprimer ce projet"
                                          >
                                            <i className="fa-solid fa-trash text-[8px]"></i>
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Padded Text details */}
                                    <div className="p-4 flex flex-col gap-2 flex-grow justify-start">
                                      {/* Date */}
                                      <span className="font-mono text-[9px] text-on-surface-variant/60 font-bold">
                                        {formatLocaleDate(post.date, currentLang)}
                                      </span>

                                      {/* Text details */}
                                      <div className="flex flex-col gap-1.5">
                                        <h3 className="font-sans font-extrabold text-sm sm:text-base uppercase tracking-tight text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                                          {post.title[currentLang] || post.title['fr']}
                                        </h3>
                                        <p className="text-xs sm:text-[13px] font-sans font-normal text-on-surface-variant/90 leading-relaxed line-clamp-3">
                                          {post.description[currentLang] || post.description['fr']}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Column (Fixed cmd column: 130px on mobile, 145px on small and up) */}
                                  <div className="w-[130px] sm:w-[145px] flex-shrink-0 p-4 pt-3.5 flex flex-col justify-between bg-black/35 border-l border-white/5">
                                    <ProjectTerminalList tags={post.tags} category={post.category} />
                                  </div>
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination indicators at bottom */}
                      <div className="flex items-center justify-center gap-2 mt-6">
                        {catPosts.map((_, idx) => {
                          const isActive = idx === selectedIndex;

                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedIndices(prev => ({ ...prev, [cat.key]: idx }))}
                              className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${isActive
                                ? `w-6 ${theme.bg}`
                                : 'w-1.5 bg-white/20 hover:bg-white/40'
                                }`}
                              style={isActive ? { boxShadow: `0 0 8px ${theme.shadowHover}` } : {}}
                              aria-label={`Go to slide ${idx + 1}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </motion.section>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

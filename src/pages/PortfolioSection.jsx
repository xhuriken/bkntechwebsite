import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatLocaleDate } from '../utils/dateFormatter';
import { detailedProjects } from '../utils/detailedProjects';

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
 * Helper to check if a URL is a native video (.mp4, .webm, data:video)
 */
function isNativeVideoUrl(url = '') {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.startsWith('data:video') || lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.includes('.mp4?') || lower.includes('.webm?');
}

/**
 * Helper to get themed dot & date colors based on post type or category
 */
const getDotColors = (type = '', category = '') => {
  const t = type ? type.toLowerCase() : '';
  if (t.includes('ui')) return { border: 'border-secondary', bg: 'bg-secondary', text: 'text-secondary' };
  if (t.includes('player') || t.includes('joueur') || t.includes('amélioration')) return { border: 'border-secondary', bg: 'bg-secondary', text: 'text-secondary' };
  if (t.includes('multiplayer') || t.includes('netcode') || t.includes('reseau')) return { border: 'border-tertiary', bg: 'bg-tertiary', text: 'text-tertiary' };
  if (t.includes('core')) return { border: 'border-orange-400', bg: 'bg-orange-400', text: 'text-orange-400' };
  if (t.includes('modeling') || t.includes('3d')) return { border: 'border-pink-400', bg: 'bg-pink-400', text: 'text-pink-400' };
  if (t.includes('shader')) return { border: 'border-cyan-400', bg: 'bg-cyan-400', text: 'text-cyan-400' };
  
  // Fallback based on category
  if (category === 'website') return { border: 'border-secondary', bg: 'bg-secondary', text: 'text-secondary' };
  if (category === 'ai-agent') return { border: 'border-tertiary', bg: 'bg-tertiary', text: 'text-tertiary' };
  return { border: 'border-primary', bg: 'bg-primary', text: 'text-primary' };
};

/**
 * A dynamic typing effect terminal list of technologies inside project cards
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
 * PortfolioSection Page Component
 * Renders all projects of a specific category in an elegant,
 * chronological chronological vertical feed with rich multimedia embedding.
 */
export default function PortfolioSection() {
  const { category } = useParams();
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState({});
  const [galleryActiveImages, setGalleryActiveImages] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const location = useLocation();
  const currentLang = i18n.language || 'fr';

  // Toggle the expanded state of a post card
  const toggleExpanded = (postId) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter by category and sort by date descending
          const filtered = data
            .filter(p => p.category === category)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          setPosts(filtered);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [category]);

  useEffect(() => {
    if (loading || posts.length === 0) return;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#post-')) {
      const targetId = hash.slice(1);
      // Extract post ID from element ID (e.g., "post-42" -> "42")
      const postId = targetId.replace('post-', '');
      // Auto-expand the targeted card so content is visible
      setExpandedPosts(prev => ({ ...prev, [postId]: true }));
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);
    }
  }, [posts, loading, location.hash]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-10 z-10 relative">
      
      {/* Navigation Header */}
      <div className="mb-8">
        <Link 
          to="/portfolio" 
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors group"
        >
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('portfolio.back')}
        </Link>
      </div>

      <div className="flex justify-between items-end border-b border-white/5 pb-6 mb-12">
        <div>
          <h1 className="font-sans font-extrabold text-3xl md:text-5xl uppercase tracking-tight mb-3">
            {t(`portfolio.categories.${category}`)}
          </h1>
          <p className="text-on-surface/80 text-sm font-normal tracking-wide max-w-xl">
            {t('portfolio.section_desc', { cat: t(`portfolio.categories.${category}`) })}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-on-surface-variant/80 font-sans font-medium text-sm">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('portfolio.section_loading')}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-surface-container-low/30 backdrop-blur-sm border border-white/5 rounded-2xl py-16 px-6 text-center text-xs font-sans font-semibold text-on-surface-variant/70 uppercase tracking-wide">
          {t('portfolio.no_projects')}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative ml-4 md:ml-32 pl-8 md:pl-12 flex flex-col gap-16 md:gap-24"
        >
          {/* Self-drawing vertical timeline border */}
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute left-0 top-0 w-px bg-gradient-to-b from-white/15 via-white/5 to-transparent origin-top"
          />
          {posts.map((post) => {
            const ytId = post.mediaType === 'video' ? getYouTubeId(post.mediaUrl) : null;
            const dotColors = getDotColors(post.type, post.category);
            const isExpanded = !!expandedPosts[post.id];

            return (
              <motion.article 
                key={post.id} 
                id={`post-${post.id}`}
                variants={itemVariants}
                layout
                className="relative w-full group flex flex-col"
              >
                {/* Sticky Dot Wrapper (Desktop & Mobile) - Slides down its thread line */}
                <div className="absolute left-0 top-0 bottom-0 -ml-[39px] md:-ml-[57px] w-4 pointer-events-none z-10">
                  <div className={`sticky top-[126px] w-4 h-4 rounded-full bg-surface border-2 ${dotColors.border} flex items-center justify-center`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${dotColors.bg} animate-pulse`} />
                  </div>
                </div>

                {/* Sticky Date Wrapper (Desktop only) - Slides along the card timeline */}
                <div className="hidden md:block absolute left-0 top-0 bottom-0 -ml-[175px] w-[110px] pointer-events-none z-10">
                  <div className={`sticky top-[120px] w-full text-right font-mono text-[10px] tracking-wide font-bold transition-colors duration-150 ${dotColors.text}`}>
                    {formatLocaleDate(post.date, currentLang)}
                  </div>
                </div>

                {/* Inner Card Wrapper with overflow-hidden */}
                <div className={`w-full bg-surface-container-low/25 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
                  isExpanded ? 'border-white/10' : 'border-white/5 hover:border-white/10'
                }`}>

                {/* Compact Header Row – always visible, click to expand */}
                <button
                  onClick={() => toggleExpanded(post.id)}
                  className="w-full text-left pt-4 md:pt-5 px-6 md:px-8 pb-4 flex items-center justify-between gap-4 group/header cursor-pointer"
                >
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    {/* Mobile Date */}
                    <span className={`md:hidden font-mono text-[10px] font-bold ${dotColors.text}`}>
                      {formatLocaleDate(post.date, currentLang)}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1 h-5 rounded-full bg-gradient-to-b ${
                        category === 'website' ? 'from-secondary to-transparent' :
                        category === 'ai-agent' ? 'from-tertiary to-transparent' :
                        'from-primary to-transparent'
                      } flex-shrink-0`} />
                      <h2 className="font-sans font-extrabold text-lg md:text-xl text-on-surface leading-snug truncate group-hover/header:text-primary transition-colors duration-150">
                        {post.title[currentLang] || post.title['fr']}
                      </h2>
                    </div>
                    {/* Tags row */}
                    {post.tags && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 4).map((tag, i) => (
                          <span key={i} className="text-[9px] font-mono font-semibold uppercase tracking-wide px-2 py-0.5 rounded border border-white/10 bg-white/[0.04] text-on-surface-variant/70">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Expand / Collapse Arrow */}
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`text-on-surface-variant/40 group-hover/header:text-primary flex-shrink-0 transition-colors`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.span>
                </button>

                {/* Expandable Body */}
                {isExpanded && (
                  <motion.div
                    key="body"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 md:px-8 pb-6 md:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      {/* Left Panel: Content & Media */}
                      <div className="lg:col-span-10 flex flex-col gap-4">
                        {/* Detailed Tab Navigation */}
                        {(() => {
                          const extra = detailedProjects[post.id];
                          const currentTab = activeTabs[post.id] || 'overview';
                          const hasTabs = !!extra;

                          if (!hasTabs) {
                            return (
                              <>
                                <div className="w-full overflow-hidden bg-black/20 rounded-2xl border border-white/5">
                                  {post.mediaType === 'video' && ytId ? (
                                    <div className="aspect-video w-full">
                                      <iframe 
                                        src={`https://www.youtube.com/embed/${ytId}`} 
                                        className="w-full h-full border-none bg-black"
                                        title={post.title[currentLang] || post.title['fr']}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    </div>
                                  ) : (
                                    <img 
                                      src={post.mediaUrl || '/BknLogo.svg'} 
                                      alt={post.title[currentLang] || post.title['fr']}
                                      className="w-full max-h-[480px] object-cover"
                                      loading="lazy"
                                    />
                                  )}
                                </div>
                                <div className="text-on-surface/90 text-sm font-normal leading-relaxed whitespace-pre-wrap max-w-3xl">
                                  {post.content[currentLang] || post.content['fr']}
                                </div>
                              </>
                            );
                          }

                          return (
                            <div className="flex flex-col gap-5">
                              {/* Tab buttons */}
                              <div className="flex border-b border-white/5 pb-2 gap-4 overflow-x-auto select-none scrollbar-none">
                                {['overview', 'features', 'specs', 'gallery'].map((tabKey) => {
                                  const isActive = currentTab === tabKey;
                                  if (tabKey === 'gallery' && (!extra.gallery || extra.gallery.length === 0)) return null;
                                  if (tabKey === 'specs' && (!extra.specs || extra.specs.length === 0)) return null;
                                  if (tabKey === 'features' && (!extra.features || !extra.features[currentLang])) return null;

                                  return (
                                    <button
                                      key={tabKey}
                                      onClick={() => setActiveTabs(prev => ({ ...prev, [post.id]: tabKey }))}
                                      className={`text-[10px] md:text-xs font-sans font-bold uppercase tracking-wider pb-1.5 transition-all duration-150 relative cursor-pointer focus:outline-none ${
                                        isActive ? 'text-primary font-black' : 'text-on-surface-variant/60 hover:text-on-surface'
                                      }`}
                                    >
                                      {t(`portfolio.tabs.${tabKey}`)}
                                      {isActive && (
                                        <motion.div 
                                          layoutId={`activeTabBorder-${post.id}`}
                                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                        />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Tab Content */}
                              <div className="w-full min-h-[220px]">
                                {currentTab === 'overview' && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col gap-4"
                                  >
                                    <div className="w-full overflow-hidden bg-black/20 rounded-2xl border border-white/5">
                                      {ytId ? (
                                        <div className="aspect-video w-full">
                                          <iframe 
                                            src={`https://www.youtube.com/embed/${ytId}`} 
                                            className="w-full h-full border-none bg-black"
                                            title={post.title[currentLang] || post.title['fr']}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        </div>
                                      ) : (post.mediaType === 'video' || isNativeVideoUrl(post.mediaUrl)) ? (
                                        <div className="w-full bg-black flex justify-center">
                                          <video
                                            src={post.mediaUrl}
                                            controls
                                            playsInline
                                            autoPlay
                                            loop
                                            muted
                                            className="w-full max-h-[480px] object-contain"
                                          />
                                        </div>
                                      ) : (
                                        <img 
                                          src={post.mediaUrl || '/BknLogo.svg'} 
                                          alt={post.title[currentLang] || post.title['fr']}
                                          className="w-full max-h-[480px] object-cover"
                                          loading="lazy"
                                        />
                                      )}
                                    </div>
                                    <div className="text-on-surface/90 text-sm font-normal leading-relaxed whitespace-pre-wrap max-w-3xl">
                                      {post.content[currentLang] || post.content['fr']}
                                    </div>
                                  </motion.div>
                                )}

                                {currentTab === 'features' && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(extra.features[currentLang] || []).map((feature, idx) => (
                                      <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        className="p-4 bg-surface-container-low/40 border border-white/5 rounded-xl hover:border-primary/20 transition-all duration-150 flex flex-col gap-1.5"
                                      >
                                        <span className="font-mono text-[10px] text-primary/80 font-bold uppercase tracking-wide">&gt; {feature.title}</span>
                                        <p className="text-xs font-sans font-normal text-on-surface-variant/90 leading-relaxed">{feature.desc}</p>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}

                                {currentTab === 'specs' && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.25 }}
                                    className="bg-black/50 border border-white/5 rounded-xl p-5 font-mono text-[11px] text-on-surface-variant/90 max-w-2xl flex flex-col gap-3 shadow-inner"
                                  >
                                    <div className="text-[9px] text-white/30 border-b border-white/5 pb-2 uppercase tracking-widest font-sans font-bold">
                                      System Tech Stack Specifications
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                      {(extra.specs || []).map((spec, idx) => (
                                        <div key={idx} className="flex justify-between items-center gap-4 border-b border-white/[0.02] pb-1.5 last:border-b-0">
                                          <span className="text-[10px] uppercase text-white/40">{spec.label[currentLang] || spec.label['fr']}</span>
                                          <span className="text-secondary font-bold text-[11px] text-right">{spec.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}

                                {currentTab === 'gallery' && (() => {
                                  // Deduplicate gallery images by base path
                                  const seen = new Set();
                                  const galleryImgs = [post.mediaUrl, ...extra.gallery].filter(img => {
                                    if (!img) return false;
                                    const base = img.split('?')[0];
                                    if (seen.has(base)) return false;
                                    seen.add(base);
                                    return true;
                                  });
                                  const activeImg = galleryActiveImages[post.id] || galleryImgs[0];
                                  return (
                                    <motion.div 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="flex flex-col gap-4"
                                    >
                                      <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                                        <img src={activeImg} alt="Gallery preview" className="w-full h-full object-cover transition-transform duration-500" />
                                      </div>
                                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {galleryImgs.map((img, idx) => {
                                          const isSelected = activeImg === img;
                                          return (
                                            <button
                                              key={idx}
                                              onClick={() => setGalleryActiveImages(prev => ({ ...prev, [post.id]: img }))}
                                              className={`aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 ${
                                                isSelected ? 'border-primary shadow-[0_0_10px_rgba(190,194,255,0.3)] scale-[1.02]' : 'border-white/5 opacity-60 hover:opacity-100'
                                              }`}
                                            >
                                              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Right Panel: Mini Terminal */}
                      <div className="lg:col-span-2 flex flex-col justify-stretch min-h-[160px] lg:border-l lg:border-white/10 lg:pl-6">
                        <div className="flex-grow flex flex-col bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-green-400 select-none shadow-inner justify-between h-full">
                          <ProjectTerminalList tags={post.tags} category={post.category} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

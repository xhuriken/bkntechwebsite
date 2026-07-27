import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
 * Portfolio Main Page Component
 * Displays 4 interactive project carousels (Gaming, Website, Agent IA, Mobile)
 * dynamically loaded from the serverless posts API.
 */
export default function Portfolio() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentLang = i18n.language || 'fr';

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load portfolio posts:", err);
        setLoading(false);
      });
  }, []);

  const categories = [
    { key: 'gaming', title: t('portfolio.categories.gaming'), color: 'from-primary/20 to-transparent' },
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
                        <div 
                          key={post.id}
                          className="snap-start flex-shrink-0 w-[290px] sm:w-[350px] bg-surface-container-low/45 backdrop-blur-md border border-white/5 hover:border-primary/20 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                        >
                          {/* Image/Video banner preview */}
                          <div className="relative aspect-video overflow-hidden bg-black/40">
                            <img 
                              src={getMediaThumbnail(post)} 
                              alt={post.title[currentLang] || post.title['fr']}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            {/* Play icon overlay for videos */}
                            {post.mediaType === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                <div className="w-12 h-12 rounded-full bg-primary/95 text-black flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                                  <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Content Body */}
                          <div className="p-5 flex flex-col flex-grow gap-3">
                            <div className="flex justify-between items-center text-[10px] font-sans font-semibold text-on-surface-variant/80 uppercase tracking-wider">
                              <span>{post.date}</span>
                            </div>
                            <h3 className="font-sans font-bold text-sm text-on-surface leading-snug group-hover:text-primary transition-colors">
                              {post.title[currentLang] || post.title['fr']}
                            </h3>
                            <p className="text-xs font-sans font-normal text-on-surface-variant leading-relaxed line-clamp-3">
                              {post.description[currentLang] || post.description['fr']}
                            </p>
                            {/* Tags list */}
                            <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                              {post.tags.slice(0, 3).map((tag, idx) => (
                                <span 
                                  key={idx}
                                  className="text-[9px] font-sans font-semibold px-2 py-0.5 bg-surface border border-white/5 rounded-full text-on-surface-variant/80 uppercase tracking-wide"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-[9px] font-sans font-semibold px-2 py-0.5 text-primary uppercase tracking-wide">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
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

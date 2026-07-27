import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
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
 * PortfolioSection Page Component
 * Renders all projects of a specific category in an elegant,
 * chronological chronological vertical feed with rich multimedia embedding.
 */
export default function PortfolioSection() {
  const { category } = useParams();
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentLang = i18n.language || 'fr';

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
        console.error("Failed to load section posts:", err);
        setLoading(false);
      });
  }, [category]);

  const getCategoryTitle = () => {
    switch (category) {
      case 'gaming': return t('portfolio.categories.gaming');
      case 'website': return t('portfolio.categories.website');
      case 'ai-agent': return t('portfolio.categories.ai-agent');
      case 'mobile': return t('portfolio.categories.mobile');
      default: return category;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 md:px-12 py-10 z-10 relative">
      
      {/* Return link */}
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

      {/* Header */}
      <div className="border-b border-white/5 pb-6 mb-12">
        <h1 className="font-sans font-extrabold text-3xl md:text-5xl uppercase tracking-tight mb-3">
          Section <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{getCategoryTitle()}</span>
        </h1>
        <p className="text-on-surface/80 text-sm font-normal tracking-wide">
          Tous nos projets de la catégorie {getCategoryTitle()} classés par ordre chronologique.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-on-surface-variant/80 font-sans font-medium text-sm">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement de la section...
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
          className="relative border-l border-white/5 ml-4 md:ml-32 pl-8 md:pl-12 flex flex-col gap-16 md:gap-24"
        >
          {posts.map((post) => {
            const ytId = post.mediaType === 'video' ? getYouTubeId(post.mediaUrl) : null;

            return (
              <motion.article 
                key={post.id} 
                variants={itemVariants}
                className="relative flex flex-col gap-6"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[39px] md:-left-[57px] top-1.5 w-4 h-4 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>

                {/* Timeline Date (hidden on mobile, positioned left of vertical line on desktop) */}
                <div className="hidden md:block absolute -left-[180px] top-1.5 w-[120px] text-right font-sans font-semibold text-[11px] uppercase tracking-wider text-on-surface-variant/80">
                  {post.date}
                </div>

                {/* Mobile Date (visible only on mobile) */}
                <div className="md:hidden font-sans font-semibold text-[10px] uppercase tracking-wider text-primary">
                  {post.date}
                </div>

                {/* Title */}
                <h2 className="font-sans font-extrabold text-xl md:text-2xl text-on-surface leading-snug">
                  {post.title[currentLang] || post.title['fr']}
                </h2>

                {/* Rich Media Container */}
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
                      src={post.mediaUrl || 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800'} 
                      alt={post.title[currentLang] || post.title['fr']}
                      className="w-full max-h-[480px] object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Content description */}
                <div className="text-on-surface/90 text-sm font-normal leading-relaxed space-y-4 whitespace-pre-wrap max-w-3xl">
                  {post.content[currentLang] || post.content['fr']}
                </div>

                {/* Tag chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] font-sans font-semibold px-3 py-1 bg-surface-container-low border border-white/5 rounded-full text-on-surface-variant uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

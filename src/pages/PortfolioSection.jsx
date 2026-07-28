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
 * A dynamic typing effect terminal list of technologies inside project cards
 */
function ProjectTerminalList({ tags = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!tags || tags.length === 0) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % (tags.length + 3)); // +3 to pause at the end before loop reset
    }, 900);
    return () => clearInterval(interval);
  }, [tags]);

  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 font-mono text-[9px] text-green-400">
      {tags.slice(0, index + 1).map((tag, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <span className="text-white/20">&gt;</span>
          <span className={idx === index ? "text-white font-bold" : ""}>
            {tag}
            {idx === index && <span className="animate-pulse">_</span>}
          </span>
        </div>
      ))}
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
        console.error(err);
        setLoading(false);
      });
  }, [category]);

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
            Découvrez nos réalisations en {t(`portfolio.categories.${category}`)}. Projets menés de bout en bout avec rigueur et souci du détail.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-on-surface-variant/80 font-sans font-medium text-sm">
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
                className="relative w-full bg-surface-container-low/25 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-300 flex flex-col gap-6 group"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[39px] md:-left-[57px] top-7 w-4 h-4 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>

                {/* Timeline Date (hidden on mobile, positioned left of vertical line on desktop) */}
                <div className="hidden md:block absolute -left-[160px] top-6 w-[100px] text-right font-mono text-[10px] tracking-wide text-on-surface/90 font-bold">
                  {post.date}
                </div>

                {/* Mobile Date (visible only on mobile) */}
                <div className="md:hidden font-mono text-[10px] text-primary font-bold">
                  {post.date}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Left Panel: Content & Media */}
                  <div className="lg:col-span-9 flex flex-col gap-5">
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
                    <div className="text-on-surface/90 text-sm font-normal leading-relaxed whitespace-pre-wrap max-w-3xl">
                      {post.content[currentLang] || post.content['fr']}
                    </div>
                  </div>

                  {/* Vertical Divider Line */}
                  <div className="hidden lg:block lg:col-span-1 justify-self-center w-px h-full bg-gradient-to-b from-white/10 via-white/20 to-transparent" />

                  {/* Right Panel: Mini Terminal cmd long and thin */}
                  <div className="lg:col-span-2 flex flex-col justify-stretch min-h-[160px]">
                    <div className="flex-grow flex flex-col bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-green-400 select-none shadow-inner justify-between h-full">
                      <div className="flex flex-col gap-2">
                        {/* Terminal Header */}
                        <div className="flex items-center gap-1.5 text-on-surface-variant/40 border-b border-white/5 pb-2 mb-1.5">
                          <span className="text-[10px] text-primary flex items-center">
                            <i className="fa-regular fa-folder group-hover:hidden"></i>
                            <i className="fa-regular fa-folder-open hidden group-hover:inline"></i>
                          </span>
                          <span className="text-[8px] uppercase tracking-wider font-mono">tags.log</span>
                        </div>
                        
                        {/* Dynamic Terminal Stack List */}
                        <ProjectTerminalList tags={post.tags} />
                      </div>
                      
                      <div className="flex items-center gap-1 mt-2 text-white/40 text-[9px]">
                        <span>$</span>
                        <span className="w-1 h-2.5 bg-green-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

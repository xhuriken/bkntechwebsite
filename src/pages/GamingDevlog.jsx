import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
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
 * Helper to compute relative date string
 */
function getRelativeDateString(dateStr, currentLang) {
  const date = new Date(dateStr);
  const now = new Date();
  
  // Set times to midnight to calculate pure day difference
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowMidnight - dateMidnight;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return currentLang === 'fr' ? "Planifié" : "Scheduled";
  }
  if (diffDays === 0) {
    return currentLang === 'fr' ? "Aujourd'hui" : "Today";
  }
  if (diffDays === 1) {
    return currentLang === 'fr' ? "Hier" : "Yesterday";
  }
  if (diffDays < 30) {
    return currentLang === 'fr' ? `Il y a ${diffDays} j` : `${diffDays}d ago`;
  }
  return currentLang === 'fr' ? "Il y a plus de 30 j" : "More than 30 days ago";
}

/**
 * Get visual classes for different devlog types
 */
function getTypeStyles(type = '') {
  const t = type.toLowerCase();
  if (t.includes('ui')) {
    return 'text-primary border-primary/35 bg-primary/[0.08] shadow-[0_0_8px_rgba(190,194,255,0.05)]';
  }
  if (t.includes('player') || t.includes('joueur') || t.includes('améliorations')) {
    return 'text-secondary border-secondary/35 bg-secondary/[0.08] shadow-[0_0_8px_rgba(78,222,163,0.05)]';
  }
  if (t.includes('multiplayer') || t.includes('multijoueur') || t.includes('reseau') || t.includes('netcode')) {
    return 'text-tertiary border-tertiary/35 bg-tertiary/[0.08] shadow-[0_0_8px_rgba(255,185,95,0.05)]';
  }
  if (t.includes('core') || t.includes('systeme') || t.includes('gameplay')) {
    return 'text-orange-400 border-orange-400/35 bg-orange-400/[0.08] shadow-[0_0_8px_rgba(251,146,60,0.05)]';
  }
  if (t.includes('modeling') || t.includes('modelisation') || t.includes('3d')) {
    return 'text-pink-400 border-pink-400/35 bg-pink-400/[0.08] shadow-[0_0_8px_rgba(244,114,182,0.05)]';
  }
  return 'text-on-surface-variant/80 border-white/10 bg-white/[0.04]';
}

export default function GamingDevlog() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'fr';
  const location = useLocation();

  // API posts loading
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filters states
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

  // Load devlog posts
  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter to 'gaming' category only
          const gamingPosts = data.filter(p => p.category === 'gaming');
          setPosts(gamingPosts);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load devlog posts:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || posts.length === 0) return;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#post-')) {
      const targetId = hash.slice(1);
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }
  }, [posts, loading, location.hash]);

  // Extract unique devlog types for the filter dropdown
  const uniqueTypes = ['all', ...new Set(posts.map(p => p.type).filter(Boolean))];

  // Filtering & Sorting logic
  const filteredPosts = posts
    .filter(post => {
      // 1. Search Query Filter (Title, Desc, or content)
      const query = search.toLowerCase();
      const titleMatch = (post.title[currentLang] || post.title['fr'] || '').toLowerCase().includes(query);
      const descMatch = (post.description[currentLang] || post.description['fr'] || '').toLowerCase().includes(query);
      const typeMatch = (post.type || '').toLowerCase().includes(query);
      const searchMatch = titleMatch || descMatch || typeMatch;

      // 2. Type Filter dropdown
      const typeDropdownMatch = selectedType === 'all' || post.type === selectedType;

      return searchMatch && typeDropdownMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Split filtered posts into "Nouveaux" (< 30 days) and "Anciens" (>= 30 days)
  const isRecent = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 30;
  };

  const recentPosts = filteredPosts.filter(p => isRecent(p.date));
  const oldPosts = filteredPosts.filter(p => !isRecent(p.date));

  // Layout animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 md:px-12 py-10 z-10 relative">
      
      {/* Return button */}
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

      {/* Devlog Game Header */}
      <div className="bg-surface-container-low/45 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="max-w-xl">
          <h1 className="font-sans font-extrabold text-3xl md:text-4xl uppercase tracking-tight mb-3 text-on-surface">
            Vacuum Protocol
          </h1>
          <p className="text-on-surface/80 text-sm font-normal leading-relaxed">
            {t('devlog.description')}
          </p>
        </div>

        {/* Documentation Links Panel */}
        <div className="flex flex-col gap-2.5 w-full md:w-auto min-w-[200px] bg-black/20 border border-white/5 rounded-xl p-4">
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-on-surface-variant/65">
            {t('devlog.docs_title')}
          </span>
          <a 
            href="https://unity.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between text-xs font-sans font-medium text-on-surface hover:text-primary transition-colors py-1 group"
          >
            <span>{t('devlog.doc_unity')}</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
          <a 
            href="https://discord.gg/bkntech" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between text-xs font-sans font-medium text-on-surface hover:text-primary transition-colors py-1 group"
          >
            <span className="flex items-center gap-1.5">
              <i className="fa-brands fa-discord text-primary text-xs"></i>
              {t('devlog.join_discord')}
            </span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
          <div className="border-t border-white/5 my-1" />
          <div className="flex flex-col gap-1 text-[9px] font-mono text-on-surface-variant/60">
            <div>{t('devlog.version')} : v0.0.6</div>
            <div>{t('devlog.updates')} : {t('devlog.frequent')}</div>
          </div>
        </div>
      </div>

      {/* Feature Context Explanation Containers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-low/30 border border-white/5 rounded-xl p-5 hover:border-primary/10 transition-colors">
          <h3 className="font-sans font-bold text-sm text-primary uppercase tracking-wider mb-2">
            {t('devlog.features.netcode.title')}
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {t('devlog.features.netcode.desc')}
          </p>
        </div>
        <div className="bg-surface-container-low/30 border border-white/5 rounded-xl p-5 hover:border-secondary/10 transition-colors">
          <h3 className="font-sans font-bold text-sm text-secondary uppercase tracking-wider mb-2">
            {t('devlog.features.physics.title')}
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {t('devlog.features.physics.desc')}
          </p>
        </div>
        <div className="bg-surface-container-low/30 border border-white/5 rounded-xl p-5 hover:border-tertiary/10 transition-colors">
          <h3 className="font-sans font-bold text-sm text-tertiary uppercase tracking-wider mb-2">
            {t('devlog.features.graphics.title')}
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {t('devlog.features.graphics.desc')}
          </p>
        </div>
      </div>

      {/* Search & Sort Panel */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-white/5 pb-6 mb-12">
        {/* Search Bar */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-on-surface-variant/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text"
            placeholder={t('devlog.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low/60 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Filter and Sort Dropdowns */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Trier et afficher */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant/75">
              {t('devlog.filter_category')} :
            </span>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none bg-surface-container-low/60 border border-white/10 rounded-md pl-3 pr-8 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer transition-colors"
              >
                <option value="all">{t('devlog.types.all')}</option>
                {uniqueTypes.filter(t => t !== 'all').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-on-surface-variant/60">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant/75">
              {t('devlog.sort_by')} :
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-surface-container-low/60 border border-white/10 rounded-md pl-3 pr-8 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer transition-colors"
              >
                <option value="newest">{t('devlog.sort_newest')}</option>
                <option value="oldest">{t('devlog.sort_oldest')}</option>
              </select>
              <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-on-surface-variant/60">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-on-surface-variant/80 font-sans font-medium text-sm">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('devlog.loading')}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-surface-container-low/30 backdrop-blur-sm border border-white/5 rounded-2xl py-16 px-6 text-center text-xs font-sans font-semibold text-on-surface-variant/70 uppercase tracking-wide">
          {t('devlog.no_updates')}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          
           {/* Recent Posts Section (if matching) */}
          {recentPosts.length > 0 && (
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-3 border-b border-primary/20 pb-2.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <h2 className="text-xs md:text-sm font-sans font-bold uppercase tracking-widest text-primary">
                  {t('devlog.recent_title')}
                </h2>
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative ml-4 md:ml-32 pl-8 md:pl-12 flex flex-col gap-8"
              >
                {/* Self-drawing vertical timeline border */}
                <motion.div 
                  initial={{ height: 0 }}
                  whileInView={{ height: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                  className="absolute left-0 top-0 w-px bg-gradient-to-b from-white/15 via-white/5 to-transparent origin-top"
                />
                {recentPosts.map((post) => (
                  <DevlogPostCard key={post.id} post={post} currentLang={currentLang} />
                ))}
              </motion.div>
            </div>
          )}

          {/* Ancient Posts Section (if matching) */}
          {oldPosts.length > 0 && (
            <div className="flex flex-col gap-8 mt-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-2.5">
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <h2 className="text-xs md:text-sm font-sans font-bold uppercase tracking-widest text-on-surface-variant/60">
                  {t('devlog.older_title')}
                </h2>
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative ml-4 md:ml-32 pl-8 md:pl-12 flex flex-col gap-8"
              >
                {/* Self-drawing vertical timeline border */}
                <motion.div 
                  initial={{ height: 0 }}
                  whileInView={{ height: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                  className="absolute left-0 top-0 w-px bg-gradient-to-b from-white/15 via-white/5 to-transparent origin-top"
                />
                {oldPosts.map((post) => (
                  <DevlogPostCard key={post.id} post={post} currentLang={currentLang} />
                ))}
              </motion.div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

/**
 * Devlog Post Card component (Discord-like look but with beautiful timeline on the left)
 */
function DevlogPostCard({ post, currentLang }) {
  const ytId = post.mediaType === 'video' ? getYouTubeId(post.mediaUrl) : null;
  const relativeDate = getRelativeDateString(post.date, currentLang);
  const typeStyle = getTypeStyles(post.type);
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('overview');
  const [galleryActiveImg, setGalleryActiveImg] = useState(post.mediaUrl || '');

  // Determine dot border, bg, and text color based on category/type
  const getDotColors = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('ui')) return { border: 'border-primary', bg: 'bg-primary', text: 'text-primary' };
    if (t.includes('player') || t.includes('joueur') || t.includes('amélioration')) return { border: 'border-secondary', bg: 'bg-secondary', text: 'text-secondary' };
    if (t.includes('multiplayer') || t.includes('netcode') || t.includes('reseau')) return { border: 'border-tertiary', bg: 'bg-tertiary', text: 'text-tertiary' };
    if (t.includes('core')) return { border: 'border-orange-400', bg: 'bg-orange-400', text: 'text-orange-400' };
    if (t.includes('modeling') || t.includes('3d')) return { border: 'border-pink-400', bg: 'bg-pink-400', text: 'text-pink-400' };
    return { border: 'border-white/20', bg: 'bg-white/40', text: 'text-on-surface-variant/70' };
  };

  const dotColors = getDotColors(post.type);
  const extra = detailedProjects[post.id];
  const hasTabs = !!extra;

  return (
    <motion.article 
      key={post.id}
      id={`post-${post.id}`}
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
      }}
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

      {/* Card Wrapper (maintains overflow-hidden and hover styling) */}
      <div className="w-full bg-surface-container-low/40 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col">
        {/* Terminal Header - Full Width, Flush, No Margins */}
        <div className="w-full bg-black/60 border-b border-white/5 px-4 py-2 flex items-center justify-between font-mono text-[9px] text-green-400 select-none relative overflow-hidden">
          {/* Passive Noise Texture background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundBlendMode: 'soft-light'
            }}
          />
          <div className="flex items-center gap-1.5 relative z-10">
            {/* Sexy Folder Open/Close Icon with group-hover dynamic toggle */}
            <span className="relative w-3.5 h-3.5 flex items-center justify-center text-primary mr-1.5 flex-shrink-0">
              <i className="fa-regular fa-folder absolute transition-all duration-200 group-hover:opacity-0 group-hover:scale-90"></i>
              <i className="fa-regular fa-folder-open absolute transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"></i>
            </span>
            <span className="text-on-surface-variant/40">bkn@tech:~/vacuum$</span>
            {post.type && (
              <span className={`px-1.5 py-0.5 rounded border border-white/5 bg-white/[0.02] ${typeStyle} lowercase font-bold`}>
                ./{post.type.replace(/\s+/g, '_')}.log
              </span>
            )}
          </div>
          
          {/* Date on Right (Absolute & Relative) */}
          <div className="flex items-center gap-2 text-on-surface-variant/70 font-semibold relative z-10">
            <span className="md:hidden text-on-surface-variant/90 font-bold">{formatLocaleDate(post.date, currentLang)}</span>
            <span className="hidden md:inline text-on-surface-variant/30">•</span>
            <span className="text-on-surface font-bold">{relativeDate}</span>
          </div>
        </div>

        {/* Card Content - Inner Padding */}
        <div className="pt-3 md:pt-4 pb-5 md:pb-6 px-5 md:px-6 flex flex-col gap-4">
          {/* Post Text Description */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {/* Animated vertical brand-colored gradient pill */}
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-transparent flex-shrink-0" />
              <h3 className="font-sans font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                {post.title[currentLang] || post.title['fr']}
              </h3>
            </div>
            {post.description && (
              <p className="text-xs text-on-surface-variant leading-relaxed italic">
                {post.description[currentLang] || post.description['fr']}
              </p>
            )}
          </div>

          {/* Tab buttons if detailed projects exists */}
          {hasTabs && (
            <div className="flex border-b border-white/5 pb-2 gap-4 overflow-x-auto select-none scrollbar-none">
              {['overview', 'features', 'specs', 'gallery'].map((tabKey) => {
                const isActive = activeTab === tabKey;
                if (tabKey === 'gallery' && (!extra.gallery || extra.gallery.length === 0)) return null;
                if (tabKey === 'specs' && (!extra.specs || extra.specs.length === 0)) return null;
                if (tabKey === 'features' && (!extra.features || !extra.features[currentLang])) return null;

                return (
                  <button
                    key={tabKey}
                    onClick={() => {
                      setActiveTab(tabKey);
                      if (tabKey === 'gallery' && extra.gallery?.length > 0) {
                        setGalleryActiveImg(post.mediaUrl || extra.gallery[0]);
                      }
                    }}
                    className={`text-[10px] md:text-xs font-sans font-bold uppercase tracking-wider pb-1.5 transition-all duration-150 relative cursor-pointer focus:outline-none ${
                      isActive ? 'text-primary font-black' : 'text-on-surface-variant/60 hover:text-on-surface'
                    }`}
                  >
                    {t(`portfolio.tabs.${tabKey}`)}
                    {isActive && (
                      <motion.div 
                        layoutId={`activeTabBorderDevlog-${post.id}`}
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Dynamic Tab Panel content */}
          <div className="w-full min-h-[160px]">
            {(!hasTabs || activeTab === 'overview') && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                {/* Media Embedding */}
                {post.mediaUrl && (
                  <div className="w-full max-w-xl overflow-hidden rounded-xl bg-black/10 border border-white/5">
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
                        src={post.mediaUrl} 
                        alt={post.title[currentLang] || post.title['fr']}
                        className="w-full max-h-[300px] object-cover group-hover:scale-[1.01] transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                  </div>
                )}

                {/* Long Detailed Content */}
                {post.content && (
                  <div className="text-xs font-sans font-normal text-on-surface/90 leading-relaxed whitespace-pre-wrap">
                    {post.content[currentLang] || post.content['fr']}
                  </div>
                )}
              </motion.div>
            )}

            {hasTabs && activeTab === 'features' && (
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
                    <p className="text-xs sm:text-[13px] font-sans font-normal text-on-surface-variant/90 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {hasTabs && activeTab === 'specs' && (
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

            {hasTabs && activeTab === 'gallery' && (() => {
              const activeImg = galleryActiveImg || post.mediaUrl || extra.gallery[0];
              return (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-4"
                >
                  <div className="w-full aspect-video max-w-xl rounded-2xl overflow-hidden border border-white/10 bg-black/40 relative group/gal">
                    <img 
                      src={activeImg} 
                      alt="Gallery preview" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/gal:scale-102"
                    />
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-xl">
                    {[post.mediaUrl, ...extra.gallery].filter(Boolean).map((img, idx) => {
                      const isSelected = activeImg === img;
                      return (
                        <button
                          key={idx}
                          onClick={() => setGalleryActiveImg(img)}
                          className={`aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 ${
                            isSelected ? 'border-primary shadow-[0_0_10px_rgba(190,194,255,0.3)] scale-[1.02]' : 'border-white/5 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

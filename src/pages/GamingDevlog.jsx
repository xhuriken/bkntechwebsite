import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatLocaleDate } from '../utils/dateFormatter';
import { detailedProjects } from '../utils/detailedProjects';
import VacuumParticles from '../components/VacuumParticles';
import { useImageLightbox } from '../context/ImageLightboxContext';
import PatchNoteList from '../components/PatchNoteList';
import MediaViewer from '../components/MediaViewer';

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
    return 'text-secondary border-secondary/35 bg-secondary/[0.08] shadow-[0_0_8px_rgba(78,222,163,0.05)]';
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
  if (t.includes('shader')) {
    return 'text-cyan-400 border-cyan-400/35 bg-cyan-400/[0.08] shadow-[0_0_8px_rgba(34,211,238,0.05)]';
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
  const [devlogBannerUrl, setDevlogBannerUrl] = useState('');
  
  // Search and filters states
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

  // Load devlog posts and site settings
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

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.devlogBannerUrl) {
          setDevlogBannerUrl(data.devlogBannerUrl);
        }
      })
      .catch(err => console.error("Failed to load settings:", err));
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
  const letterARef = useRef(null);

  const isRecent = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
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
      {/* Vacuum suction particles backdrop */}
      <VacuumParticles targetRef={letterARef} />

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

      {/* Devlog Game Header Container */}
      <div className="bg-surface-container-low/45 backdrop-blur-md border border-white/5 rounded-2xl p-3 md:p-4 pb-6 md:pb-8 flex flex-col gap-6 mb-12">
        {/* 2nd Vacuum Banner (Low height & wide) */}
        {devlogBannerUrl && (
          <div className="w-full h-28 md:h-36 overflow-hidden rounded-xl border border-white/10 relative group bg-black/40">
            <img
              src={devlogBannerUrl}
              alt="Vacuum Protocol Header Banner"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/BknLogo.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/90 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full px-3 md:px-4">
        <div className="max-w-xl flex flex-col gap-3">
          <h1 className="font-sans font-extrabold text-3xl md:text-4xl uppercase tracking-tight text-on-surface">
            V<span ref={letterARef} className="relative inline-block text-primary">a</span>cuum Protocol
          </h1>
          <p className="text-on-surface/80 text-sm font-normal leading-relaxed">
            {t('devlog.description')}
          </p>
          {/* Discord CTA callout */}
          <a
            href="https://discord.gg/bkntech"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-2 text-xs font-sans font-semibold text-primary hover:text-primary/80 transition-colors group"
          >
            <i className="fa-brands fa-discord text-sm" />
            <span>{t('devlog.discord_cta')}</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        </div>

        {/* Quick Info Panel */}
        <div className="flex flex-col gap-2.5 w-full md:w-auto min-w-[200px] bg-black/20 border border-white/5 rounded-xl p-4">
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-on-surface-variant/65">
            {t('devlog.docs_title')}
          </span>
          <a 
            href="https://store.steampowered.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between text-xs font-sans font-medium text-on-surface hover:text-primary transition-colors py-1 group"
          >
            <span className="flex items-center gap-1.5">
              <i className="fa-brands fa-steam text-on-surface-variant/60 text-xs" />
              Steam — Early Access
            </span>
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
              <i className="fa-brands fa-discord text-primary text-xs" />
              {t('devlog.join_discord')}
            </span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
          <div className="border-t border-white/5 my-1" />
          <div className="flex flex-col gap-1 text-[9px] font-mono text-on-surface-variant/60">
            <div>{t('devlog.version')} : v0.0.6</div>
            <div>Engine : Unity URP + Mirror</div>
            <div>{t('devlog.updates')} : {t('devlog.frequent')}</div>
          </div>
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
  const { t } = useTranslation();
  const { openLightbox } = useImageLightbox();
  const relativeDate = getRelativeDateString(post.date, currentLang);
  const typeStyle = getTypeStyles(post.type);

  // Extract all media slots (images or videos)
  const extra = detailedProjects[post.id];
  const allMediaSlots = Array.isArray(post.slots) && post.slots.length > 0
    ? post.slots.filter(s => s.url && s.url.trim())
    : [
        ...(post.mediaUrl ? [{ type: post.mediaType || 'image', url: post.mediaUrl }] : []),
        ...(Array.isArray(post.gallery) ? post.gallery.map(g => ({
          type: isNativeVideoUrl(g) || getYouTubeId(g) ? 'video' : 'image',
          url: g
        })) : []),
        ...(extra?.gallery ? extra.gallery.map(g => ({
          type: isNativeVideoUrl(g) || getYouTubeId(g) ? 'video' : 'image',
          url: g
        })) : [])
      ];

  // Remove duplicates by base URL
  const uniqueSlots = [];
  const seenUrls = new Set();
  for (const s of allMediaSlots) {
    const base = (s.url || '').split('?')[0];
    if (base && !seenUrls.has(base)) {
      seenUrls.add(base);
      uniqueSlots.push(s);
    }
  }

  const hasMultipleMedia = uniqueSlots.length > 1;
  const hasChangelog = !!(post.hasChangelog || (Array.isArray(post.changelog) && post.changelog.length > 0));
  const isMajor = post.importance === 'major';
  const isMinor = post.importance === 'minor';

  // Default selected gallery item: 2nd item if minor & multiple media (as per user spec), else 1st
  const [selectedGallerySlot, setSelectedGallerySlot] = useState(() => {
    return (hasMultipleMedia && isMinor && uniqueSlots.length > 1) ? uniqueSlots[1] : (uniqueSlots[0] || null);
  });

  const [activeTab, setActiveTab] = useState('overview');

  // Determine dot border, bg, and text color based on category/type
  const getDotColors = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('ui')) return { border: 'border-secondary', bg: 'bg-secondary', text: 'text-secondary' };
    if (t.includes('player') || t.includes('joueur') || t.includes('amélioration') || t.includes('améliorations')) return { border: 'border-secondary', bg: 'bg-secondary', text: 'text-secondary' };
    if (t.includes('multiplayer') || t.includes('multijoueur') || t.includes('netcode') || t.includes('reseau')) return { border: 'border-tertiary', bg: 'bg-tertiary', text: 'text-tertiary' };
    if (t.includes('core') || t.includes('systeme') || t.includes('gameplay')) return { border: 'border-orange-400', bg: 'bg-orange-400', text: 'text-orange-400' };
    if (t.includes('modeling') || t.includes('modelisation') || t.includes('3d')) return { border: 'border-pink-400', bg: 'bg-pink-400', text: 'text-pink-400' };
    if (t.includes('shader')) return { border: 'border-cyan-400', bg: 'bg-cyan-400', text: 'text-cyan-400' };
    return { border: 'border-white/20', bg: 'bg-white/40', text: 'text-on-surface-variant/70' };
  };

  const dotColors = getDotColors(post.type);
  const [isExpanded, setIsExpanded] = useState(isMajor);

  // Helper to render media item (video or image)
  const renderMediaItem = (slot, customClass = "w-full max-h-[360px] object-contain") => {
    if (!slot || !slot.url) return null;
    const slotYtId = getYouTubeId(slot.url);
    if (slot.type === 'video' || slotYtId || isNativeVideoUrl(slot.url)) {
      if (slotYtId) {
        return (
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${slotYtId}`}
              className="w-full h-full border-none bg-black"
              title={post.title[currentLang] || post.title['fr']}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <div className="w-full bg-black flex justify-center">
          <video
            src={slot.url}
            controls
            playsInline
            autoPlay={false}
            muted
            className={customClass}
          />
        </div>
      );
    }
    return (
      <img
        src={slot.url}
        alt={post.title[currentLang] || post.title['fr']}
        className={`${customClass} cursor-zoom-in hover:opacity-95 transition-opacity`}
        onClick={() => openLightbox(slot.url, post.title[currentLang] || post.title['fr'])}
        loading="lazy"
      />
    );
  };

  // Compute available tabs
  const availableTabs = ['overview'];
  if (hasChangelog) availableTabs.push('changelog');
  if (hasMultipleMedia && isMinor) availableTabs.push('gallery');
  if (extra?.features && extra.features[currentLang]) availableTabs.push('features');
  if (extra?.specs) availableTabs.push('specs');

  return (
    <motion.article 
      key={post.id}
      id={`post-${post.id}`}
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
      }}
      className={`relative w-full group flex flex-col ${
        isMinor ? 'opacity-85' : ''
      }`}
    >
      {/* Sticky Dot Wrapper (Desktop & Mobile) */}
      <div className="absolute left-0 top-0 bottom-0 -ml-[39px] md:-ml-[57px] w-4 pointer-events-none z-10">
        <div className={`sticky top-[126px] w-4 h-4 rounded-full bg-surface border-2 ${dotColors.border} flex items-center justify-center`}>
          <div className={`w-1.5 h-1.5 rounded-full ${dotColors.bg} animate-pulse`} />
        </div>
      </div>

      {/* Sticky Date Wrapper (Desktop only) */}
      <div className="hidden md:block absolute left-0 top-0 bottom-0 -ml-[175px] w-[110px] pointer-events-none z-10">
        <div className={`sticky top-[120px] w-full text-right font-mono text-[10px] tracking-wide font-bold transition-colors duration-150 ${dotColors.text}`}>
          {formatLocaleDate(post.date, currentLang)}
        </div>
      </div>

      {/* Card Wrapper */}
      <div className={`w-full backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
        isMajor
          ? 'bg-surface-container-low/60 border-primary/20 shadow-[0_0_24px_rgba(190,194,255,0.08)]'
          : isMinor
            ? 'bg-surface-container-low/25 border-white/5 hover:border-white/10'
            : 'bg-surface-container-low/40 border-white/5 hover:border-white/10'
      }`}>
        {/* Terminal Header */}
        <div className="w-full bg-black/60 border-b border-white/5 px-4 py-2 flex items-center justify-between font-mono text-[9px] text-green-400 select-none relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundBlendMode: 'soft-light'
            }}
          />
          <div className="flex items-center gap-1.5 relative z-10">
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
          
          <div className="flex items-center gap-2 text-on-surface-variant/70 font-semibold relative z-10">
            {post.importance === 'major' && (
              <span className="px-1.5 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-widest">
                ★ MAJOR
              </span>
            )}
            {post.importance === 'minor' && (
              <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.03] text-on-surface-variant/40 text-[8px] font-bold uppercase tracking-widest">
                MINOR
              </span>
            )}
            <span className="md:hidden text-on-surface-variant/90 font-bold">{formatLocaleDate(post.date, currentLang)}</span>
            <span className="hidden md:inline text-on-surface-variant/30">•</span>
            <span className="text-on-surface font-bold">{relativeDate}</span>
          </div>
        </div>

        {/* Compact Header — click to expand */}
        <button
          onClick={() => setIsExpanded(p => !p)}
          className={`w-full text-left flex items-center gap-3 cursor-pointer group/hdr ${
            isMajor
              ? 'px-5 md:px-6 pt-4 md:pt-5 pb-4'
              : 'px-5 md:px-6 pt-3 md:pt-4 pb-3'
          }`}
        >
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-1 rounded-full bg-gradient-to-b from-primary to-transparent flex-shrink-0 ${
                isMajor ? 'h-6' : 'h-4'
              }`} />
              <h3 className={`font-sans font-bold text-on-surface group-hover/hdr:text-primary transition-colors truncate ${
                isMajor ? 'text-base md:text-lg' : isMinor ? 'text-xs' : 'text-sm'
              }`}>
                {post.title[currentLang] || post.title['fr']}
              </h3>
            </div>
            {post.description && (
              <p className={`text-on-surface-variant/70 leading-relaxed italic line-clamp-1 ${
                isMajor ? 'text-xs' : 'text-[11px]'
              }`}>
                {post.description[currentLang] || post.description['fr']}
              </p>
            )}
            {post.tags && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, isMajor ? 6 : 4).map((tag, i) => (
                  <span key={i} className="text-[9px] font-mono font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.04] text-on-surface-variant/70">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-on-surface-variant/40 group-hover/hdr:text-primary flex-shrink-0 transition-colors"
          >
            <svg className={isMajor ? 'w-5 h-5' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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
            <div className="px-5 md:px-6 pb-5 md:pb-6 flex flex-col gap-4">
              {/* Tab Navigation buttons if more than 1 tab available */}
              {availableTabs.length > 1 && (
                <div className="flex border-b border-white/5 pb-2 gap-4 overflow-x-auto select-none scrollbar-none">
                  {availableTabs.map((tabKey) => {
                    const isActive = activeTab === tabKey;
                    return (
                      <button
                        key={tabKey}
                        onClick={() => {
                          setActiveTab(tabKey);
                          if (tabKey === 'gallery' && uniqueSlots.length > 1) {
                            // On entering gallery tab, select 2nd item if minor (user rule)
                            setSelectedGallerySlot(uniqueSlots[1]);
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

              {/* Tab Content */}
              <div className="w-full">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-4"
                  >
                    {/* 1st Media item */}
                    {uniqueSlots.length > 0 && (
                      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-black/20 border border-white/5">
                        {renderMediaItem(uniqueSlots[0], "w-full max-h-[360px] object-contain")}
                      </div>
                    )}

                    {/* Text content */}
                    {post.content && (
                      <div className="text-xs font-sans font-normal text-on-surface/90 leading-relaxed whitespace-pre-wrap">
                        {post.content[currentLang] || post.content['fr']}
                      </div>
                    )}

                    {/* For MAJOR posts with MULTIPLE media: Render remaining media below text */}
                    {hasMultipleMedia && isMajor && (
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/50 border-b border-white/5 pb-1 flex items-center gap-2">
                          <i className="fa-solid fa-photo-film text-primary text-[10px]" />
                          <span>Galerie & Captures Complémentaires ({uniqueSlots.length - 1})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {uniqueSlots.slice(1).map((slot, idx) => (
                            <div key={idx} className="w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow-md">
                              {renderMediaItem(slot, "w-full h-44 object-cover")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* PATCH NOTE TAB */}
                {activeTab === 'changelog' && hasChangelog && (
                  <PatchNoteList
                    changelog={post.changelog}
                    currentLang={currentLang}
                  />
                )}

                {/* GALLERY TAB (For MINOR posts with MULTIPLE media) */}
                {activeTab === 'gallery' && hasMultipleMedia && isMinor && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                    {/* Main Preview */}
                    <div className="w-full max-w-xl rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-inner">
                      {renderMediaItem(selectedGallerySlot || uniqueSlots[0], "w-full max-h-[380px] object-contain")}
                    </div>
                    
                    {/* Thumbnails strip (supports video & image) */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-xl">
                      {uniqueSlots.map((slot, idx) => {
                        const isSelected = selectedGallerySlot?.url === slot.url;
                        const slotYtId = getYouTubeId(slot.url);
                        const isVid = slot.type === 'video' || slotYtId || isNativeVideoUrl(slot.url);
                        const thumbUrl = slotYtId ? `https://img.youtube.com/vi/${slotYtId}/mqdefault.jpg` : slot.url;

                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedGallerySlot(slot)}
                            className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all duration-150 group/thumb ${
                              isSelected ? 'border-primary shadow-[0_0_12px_rgba(190,194,255,0.4)] scale-[1.03]' : 'border-white/10 opacity-60 hover:opacity-100'
                            }`}
                          >
                            {isVid ? (
                              <div className="w-full h-full bg-black relative flex items-center justify-center">
                                {slotYtId ? (
                                  <img src={thumbUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                  <video src={slot.url} className="w-full h-full object-cover opacity-70" muted />
                                )}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-primary/90 text-black flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                                    <i className="fa-solid fa-play text-[9px] ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <img src={slot.url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* FEATURES TAB */}
                {activeTab === 'features' && extra?.features && (
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

                {/* SPECS TAB */}
                {activeTab === 'specs' && extra?.specs && (
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
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}

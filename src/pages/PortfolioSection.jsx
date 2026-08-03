import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatLocaleDate } from '../utils/dateFormatter';
import { detailedProjects } from '../utils/detailedProjects';
import { useImageLightbox } from '../context/ImageLightboxContext';
import Button from '../components/Button';
import { useAdmin } from '../context/AdminContext';
import ProjectCard from '../components/ProjectCard';



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
  const { openLightbox } = useImageLightbox();
  const { isAdmin, openCreatePost, openEditPost, openConfirmModal, adminPassword, dataRefreshCounter, triggerRefresh } = useAdmin();

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
  }, [category, dataRefreshCounter]);


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
        <div>
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => openCreatePost(category)}
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>+ Nouveau Projet</span>
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
          {posts.map((post) => (
            <ProjectCard
              key={post.id}
              post={post}
              onEdit={openEditPost}
              openLightbox={openLightbox}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

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
    return 'text-primary border-primary/20 bg-primary/5';
  }
  if (t.includes('player') || t.includes('joueur') || t.includes('améliorations')) {
    return 'text-secondary border-secondary/20 bg-secondary/5';
  }
  if (t.includes('multiplayer') || t.includes('multijoueur') || t.includes('reseau') || t.includes('netcode')) {
    return 'text-tertiary border-tertiary/20 bg-tertiary/5';
  }
  if (t.includes('core') || t.includes('systeme') || t.includes('gameplay')) {
    return 'text-orange-400 border-orange-400/20 bg-orange-400/5';
  }
  if (t.includes('modeling') || t.includes('modelisation') || t.includes('3d')) {
    return 'text-pink-400 border-pink-400/20 bg-pink-400/5';
  }
  return 'text-on-surface-variant/80 border-white/5 bg-white/[0.02]';
}

export default function GamingDevlog() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'fr';

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
          <div className="flex items-center gap-3 mb-2">
            <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-primary px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/5">
              Unity Devlog
            </span>
            <span className="text-[10px] font-sans font-medium text-on-surface-variant/60">
              Mise à jour régulière
            </span>
          </div>
          <h1 className="font-sans font-extrabold text-3xl md:text-4xl uppercase tracking-tight mb-3 text-on-surface">
            Vacuum Protocol
          </h1>
          <p className="text-on-surface/80 text-sm font-normal leading-relaxed">
            Notre projet phare de jeu de tir tactique multijoueur en arène 3D. Ce devlog documente notre cycle de production à long terme, nos expérimentations physiques et nos optimisations netcode.
          </p>
        </div>

        {/* Documentation Links Panel */}
        <div className="flex flex-col gap-2.5 w-full md:w-auto min-w-[200px] bg-black/20 border border-white/5 rounded-xl p-4">
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-on-surface-variant/65">
            Documentation & Liens
          </span>
          <a 
            href="https://unity.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between text-xs font-sans font-medium text-on-surface hover:text-primary transition-colors py-1 group"
          >
            <span>Documentation Unity</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
          <a 
            href="https://github.com/xhuriken/bkntechwebsite" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between text-xs font-sans font-medium text-on-surface hover:text-primary transition-colors py-1 group"
          >
            <span>Dépôt Source BKN</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
          <div className="border-t border-white/5 my-1" />
          <span className="text-[10px] font-sans text-on-surface-variant/50">
            Version Active : v0.4.2-alpha
          </span>
        </div>
      </div>

      {/* Feature Context Explanation Containers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-low/30 border border-white/5 rounded-xl p-5 hover:border-primary/10 transition-colors">
          <h3 className="font-sans font-bold text-sm text-primary uppercase tracking-wider mb-2">
            Netcode Réseau
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Utilisation d'une topologie serveur faisant autorité avec prédiction locale, réconciliation client et compensation du lag. Latence compensée jusqu'à 250ms de ping.
          </p>
        </div>
        <div className="bg-surface-container-low/30 border border-white/5 rounded-xl p-5 hover:border-secondary/10 transition-colors">
          <h3 className="font-sans font-bold text-sm text-secondary uppercase tracking-wider mb-2">
            Physique & Mouvement
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Moteur de déplacement basé sur la physique rigide d'Unity (Rigidbody) avec contrôleur personnalisé à haute vélocité, gestion des pentes et friction dynamique.
          </p>
        </div>
        <div className="bg-surface-container-low/30 border border-white/5 rounded-xl p-5 hover:border-tertiary/10 transition-colors">
          <h3 className="font-sans font-bold text-sm text-tertiary uppercase tracking-wider mb-2">
            Rendu Graphique (HDRP)
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Pipeline HDRP (High Definition Render Pipeline) pour un rendu visuel photoréaliste de type cyberpunk. Volumétrie de brouillard avancée et reflets ray-tracés.
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
            placeholder={currentLang === 'fr' ? "Rechercher dans le devlog..." : "Search in devlog..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low/60 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Filter and Sort Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Trier et afficher */}
          <div className="relative flex items-center gap-2">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
              Filtrer par :
            </span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-surface-container-low/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="all">{currentLang === 'fr' ? "Tous les types" : "All Types"}</option>
              {uniqueTypes.filter(t => t !== 'all').map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="relative flex items-center gap-2">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
              Tri :
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container-low/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="newest">{currentLang === 'fr' ? "Plus récents" : "Newest"}</option>
              <option value="oldest">{currentLang === 'fr' ? "Plus anciens" : "Oldest"}</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-on-surface-variant/80 font-sans font-medium text-sm">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement du devlog...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-surface-container-low/30 backdrop-blur-sm border border-white/5 rounded-2xl py-16 px-6 text-center text-xs font-sans font-semibold text-on-surface-variant/70 uppercase tracking-wide">
          Aucun post de devlog trouvé.
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          
          {/* Recent Posts Section (if matching) */}
          {recentPosts.length > 0 && (
            <div className="flex flex-col gap-8">
              <h2 className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-primary border-b border-primary/20 pb-2">
                Nouveaux posts
              </h2>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative border-l border-white/5 ml-4 md:ml-32 pl-8 md:pl-12 flex flex-col gap-8"
              >
                {recentPosts.map((post) => (
                  <DevlogPostCard key={post.id} post={post} currentLang={currentLang} />
                ))}
              </motion.div>
            </div>
          )}

          {/* Ancient Posts Section (if matching) */}
          {oldPosts.length > 0 && (
            <div className="flex flex-col gap-8 mt-4">
              <h2 className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-on-surface-variant/60 border-b border-white/5 pb-2">
                Anciens posts
              </h2>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative border-l border-white/5 ml-4 md:ml-32 pl-8 md:pl-12 flex flex-col gap-8"
              >
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

  return (
    <motion.article 
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
      }}
      className="relative w-full bg-surface-container-low/40 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col gap-4 group"
    >
      {/* Timeline Dot */}
      <div className="absolute -left-[39px] md:-left-[57px] top-7 w-4 h-4 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      </div>

      {/* Timeline Date (Desktop only) */}
      <div className="hidden md:block absolute -left-[180px] top-6 w-[120px] text-right font-sans font-bold text-[10px] uppercase tracking-wider text-on-surface-variant/70">
        {post.date}
      </div>

      {/* Card Header (Discord category look) */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          {post.type && (
            <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${typeStyle}`}>
              {post.type}
            </span>
          )}
          <span className="text-[10px] font-sans font-semibold text-primary">
            {post.category === 'gaming' ? '@vacuum_protocol' : ''}
          </span>
        </div>
        
        {/* Date on Mobile */}
        <span className="md:hidden text-[9px] font-sans font-medium text-on-surface-variant/50">
          {post.date}
        </span>
      </div>

      {/* Post Text Description */}
      <div className="flex flex-col gap-2">
        <h3 className="font-sans font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
          {post.title[currentLang] || post.title['fr']}
        </h3>
        {post.description && (
          <p className="text-xs text-on-surface-variant leading-relaxed italic">
            {post.description[currentLang] || post.description['fr']}
          </p>
        )}
      </div>

      {/* Media Embedding (if present) */}
      {post.mediaUrl && (
        <div className="w-full max-w-xl overflow-hidden rounded-xl bg-black/10 border border-white/5 mt-1">
          {post.mediaType === 'video' && ytId ? (
            <div className="aspect-video w-full">
              <iframe 
                src={`https://www.youtube.com/embed/${ytId}`} 
                className="w-full h-full border-none bg-black"
                title={post.title[currentLang] || post.title['fr']}
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
        <div className="text-xs font-sans font-normal text-on-surface/90 leading-relaxed whitespace-pre-wrap mt-1">
          {post.content[currentLang] || post.content['fr']}
        </div>
      )}

      {/* Card Footer (Discord-like stats) */}
      <div className="flex items-center gap-4 text-[11px] font-sans text-on-surface-variant/75 pt-2 border-t border-white/5">
        {/* Comment count */}
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-1.923 2.47 9 9 0 003.47-.78c.557-.14 1.137.09 1.58.53.513.509 1.11.83 1.763.83z" />
          </svg>
          <span className="font-bold">{post.commentsCount || 0}</span>
        </div>
        
        {/* Relative time indicator */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-on-surface-variant/40">•</span>
          <span>{relativeDate}</span>
        </div>
      </div>

    </motion.article>
  );
}

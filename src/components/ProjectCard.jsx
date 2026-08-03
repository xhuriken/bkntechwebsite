import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '../context/AdminContext';
import { formatLocaleDate } from '../utils/dateFormatter';
import { detailedProjects } from '../utils/detailedProjects';
import BrandPill from './BrandPill';
import Button from './Button';

export default function ProjectCard({ post, onEdit, openLightbox }) {
  const { t, i18n } = useTranslation();
  const { isAdmin, openConfirmModal, triggerRefresh } = useAdmin();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'features' | 'specs' | 'gallery'
  const [activeGalleryImg, setActiveGalleryImg] = useState(null);

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'fr';

  const title = post.title?.[currentLang] || post.title?.fr || 'Sans titre';
  const desc = post.description?.[currentLang] || post.description?.fr || '';
  const content = post.content?.[currentLang] || post.content?.fr || '';
  const mediaUrl = post.mediaUrl || post.slots?.[0]?.url || '/BknLogo.svg';
  const mediaType = post.mediaType || post.slots?.[0]?.type || 'image';

  // Robust extra JSON parsing if string
  let parsedExtra = post.extra;
  if (typeof post.extra === 'string') {
    try {
      parsedExtra = JSON.parse(post.extra);
    } catch {
      parsedExtra = {};
    }
  }

  // Universal external URL resolution with protocol prefixing
  const rawExternalUrl = parsedExtra?.externalUrl || post.externalUrl || post.url || '';
  const externalUrl = rawExternalUrl
    ? (rawExternalUrl.startsWith('http://') || rawExternalUrl.startsWith('https://') ? rawExternalUrl : `https://${rawExternalUrl}`)
    : '';

  // Features parsing: support structured featuresList or fallback string/array
  const extraDetailed = detailedProjects[post.id];
  const rawFeatures = parsedExtra?.featuresList || parsedExtra?.features?.[currentLang] || parsedExtra?.features?.fr || post.featuresFr || extraDetailed?.features?.[currentLang] || [];

  const parsedFeatures = Array.isArray(rawFeatures)
    ? rawFeatures
    : typeof rawFeatures === 'string'
    ? rawFeatures.split(/\r?\n/).map(line => {
        const parts = line.split(':');
        if (parts.length > 1) {
          return { title: parts[0].replace(/^[\s•\-\*]+/, '').trim(), desc: parts.slice(1).join(':').trim() };
        }
        return { title: '', desc: line.replace(/^[\s•\-\*]+/, '').trim() };
      }).filter(f => f.title || f.desc)
    : [];

  // Tech stack / Specs parsing: match Screen #1 bottom layout
  const rawSpecs = parsedExtra?.specsList || parsedExtra?.specs || extraDetailed?.specs || [];
  let specsArray = [];

  if (Array.isArray(rawSpecs) && rawSpecs.length > 0) {
    specsArray = rawSpecs;
  } else {
    const techText = parsedExtra?.techStack || post.techStack || '';
    if (techText) {
      specsArray = techText.split('|').map(s => {
        const parts = s.split(':');
        return {
          label: (parts[0] || 'TECH').trim().toUpperCase(),
          value: (parts[1] || parts[0]).trim()
        };
      });
    }
  }

  // Gallery items extraction
  const galleryItems = post.slots && post.slots.length > 1
    ? post.slots
    : extraDetailed?.gallery
    ? extraDetailed.gallery.map(url => ({ type: 'image', url }))
    : [];

  // YouTube helper
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = getYouTubeId(mediaUrl);
  const isNativeVideo = mediaType === 'video' || (mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm')));

  // Extract first line of description for collapsed preview
  const firstLineDesc = desc
    ? desc.split('\n')[0]
    : content
    ? content.split('\n')[0]
    : '';

  return (
    <article
      id={`post-${post.id}`}
      className="relative w-full group flex flex-col"
    >
      {/* Sticky Dot Wrapper (Timeline dot) */}
      <div className="absolute left-0 top-0 bottom-0 -ml-[39px] md:-ml-[57px] w-4 pointer-events-none z-10">
        <div className="sticky top-[126px] w-4 h-4 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>

      {/* Sticky Date Wrapper (Timeline date) */}
      <div className="hidden md:block absolute left-0 top-0 bottom-0 -ml-[175px] w-[110px] pointer-events-none z-10">
        <div className="sticky top-[120px] w-full text-right font-mono text-[10px] tracking-wide font-bold transition-colors duration-150 text-primary">
          {formatLocaleDate(post.date, currentLang)}
        </div>
      </div>

      {/* Main Card Container */}
      <div className="w-full bg-surface-container-low/40 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl hover:border-white/20 transition-all duration-300 flex flex-col relative">
        {/* Terminal Header Bar with Expand Arrow in Top-Right */}
        <div className="w-full bg-black/70 border-b border-white/10 px-4 py-2.5 flex items-center justify-between font-mono text-[9px] text-green-400 select-none relative z-20 overflow-hidden">
          {/* Background noise texture */}
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
            <span className="text-on-surface-variant/40">bkn@tech:~/portfolio$</span>
            <span className="px-1.5 py-0.5 rounded border border-white/5 bg-white/[0.02] text-primary lowercase font-bold">
              ./{(post.type || 'projet').replace(/\s+/g, '_')}.log
            </span>
          </div>

          {/* Right Header Controls: Admin Buttons + Expand Arrow */}
          <div className="flex items-center gap-2 text-on-surface-variant/70 font-semibold relative z-10">
            {isAdmin && (
              <div className="flex items-center gap-1.5 mr-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onEdit(post)}
                  className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-black font-mono text-[9px] font-bold uppercase transition-colors cursor-pointer"
                  title="Modifier ce projet"
                >
                  <i className="fa-solid fa-pen text-[8px] mr-1"></i>
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openConfirmModal({
                      title: 'Suppression de Projet',
                      message: `Êtes-vous sûr de vouloir supprimer définitivement "${title}" ?`,
                      onConfirm: async () => {
                        try {
                          const passToUse = localStorage.getItem('bkn_admin_pass') || 'bkntech';
                          await fetch(`/api/posts?id=${post.id}`, {
                            method: 'DELETE',
                            headers: { 'x-admin-password': passToUse }
                          });
                          triggerRefresh();
                        } catch (err) {
                          console.error('Delete failed:', err);
                        }
                      }
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white font-mono text-[9px] font-bold uppercase transition-colors cursor-pointer"
                  title="Supprimer ce projet"
                >
                  <i className="fa-solid fa-trash text-[8px]"></i>
                </button>
              </div>
            )}

            <span className="md:hidden text-on-surface-variant/90 font-bold mr-1">{formatLocaleDate(post.date, currentLang)}</span>

            {/* Expand Arrow Button in Top Right */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
              title={isExpanded ? 'Replier la carte' : 'Déplier le projet'}
            >
              <motion.i
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="fa-solid fa-chevron-down text-xs"
              />
            </button>
          </div>
        </div>

        {/* Header Area with Smooth Layout Animation */}
        <motion.div
          layout
          onClick={() => setIsExpanded(!isExpanded)}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full relative cursor-pointer group/card select-none flex flex-col justify-end p-6 md:p-8 ${
            !isExpanded ? 'min-h-[220px] md:min-h-[250px]' : ''
          }`}
        >
          {/* Smooth Fade Transition Background Media Image when Collapsed */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0 overflow-hidden pointer-events-none z-0"
              >
                <img
                  src={mediaUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                />
                {/* Dark Gradient Overlay + Soft Blur Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 backdrop-blur-[2px]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text Content Area with Reusable BrandPill only on Title */}
          <div className="relative z-10 flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              {/* Reusable BrandPill component matching Screen #2 */}
              <BrandPill category={post.category} />
              <h3 className="font-sans font-extrabold text-lg md:text-2xl text-white group-hover/card:text-primary transition-colors leading-tight drop-shadow-md">
                {title}
              </h3>
            </div>

            {/* Tags Badge Row - Flush with edge (No left indent) */}
            {post.tags && (
              <div className="flex flex-wrap items-center gap-1.5 my-0.5">
                {post.tags.slice(0, 5).map((tag, idx) => (
                  <span key={idx} className="text-[9px] font-mono font-semibold uppercase tracking-wide px-2 py-0.5 rounded border border-white/20 bg-black/50 text-white/90 backdrop-blur-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* First Line Short Description - Flush with edge (No left indent) */}
            <p className="text-xs md:text-sm text-on-surface-variant/90 font-sans leading-relaxed line-clamp-2 drop-shadow-sm max-w-3xl">
              {firstLineDesc}
            </p>
          </div>
        </motion.div>

        {/* Expandable Body with Ultra-Smooth Height & Content Fade Animation */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="content-body"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-white/10 bg-black/40"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="p-6 md:p-8 space-y-6"
              >
                {/* Fixed Navigation Tab Bar */}
                <div className="flex items-center gap-4 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none select-none">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={`text-xs font-mono font-bold uppercase tracking-wider pb-1 relative transition-colors cursor-pointer ${
                      activeTab === 'overview' ? 'text-primary font-black' : 'text-on-surface-variant/60 hover:text-white'
                    }`}
                  >
                    Aperçu & Média
                    {activeTab === 'overview' && (
                      <motion.div
                        layoutId={`activeTabBorder-${post.id}`}
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(190,194,255,0.8)]"
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      />
                    )}
                  </button>

                  {parsedFeatures.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('features')}
                      className={`text-xs font-mono font-bold uppercase tracking-wider pb-1 relative transition-colors cursor-pointer ${
                        activeTab === 'features' ? 'text-primary font-black' : 'text-on-surface-variant/60 hover:text-white'
                      }`}
                    >
                      Caractéristiques ({parsedFeatures.length})
                      {activeTab === 'features' && (
                        <motion.div
                          layoutId={`activeTabBorder-${post.id}`}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(190,194,255,0.8)]"
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                        />
                      )}
                    </button>
                  )}

                  {specsArray.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('specs')}
                      className={`text-xs font-mono font-bold uppercase tracking-wider pb-1 relative transition-colors cursor-pointer ${
                        activeTab === 'specs' ? 'text-primary font-black' : 'text-on-surface-variant/60 hover:text-white'
                      }`}
                    >
                      Fiche Technique ({specsArray.length})
                      {activeTab === 'specs' && (
                        <motion.div
                          layoutId={`activeTabBorder-${post.id}`}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(190,194,255,0.8)]"
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                        />
                      )}
                    </button>
                  )}

                  {galleryItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('gallery')}
                      className={`text-xs font-mono font-bold uppercase tracking-wider pb-1 relative transition-colors cursor-pointer ${
                        activeTab === 'gallery' ? 'text-primary font-black' : 'text-on-surface-variant/60 hover:text-white'
                      }`}
                    >
                      Galerie ({galleryItems.length})
                      {activeTab === 'gallery' && (
                        <motion.div
                          layoutId={`activeTabBorder-${post.id}`}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(190,194,255,0.8)]"
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                        />
                      )}
                    </button>
                  )}
                </div>

                {/* Tab Content Area */}
                <div className="w-full">
                  <AnimatePresence mode="wait">
                    {/* TAB 1: OVERVIEW & LARGE MEDIA */}
                    {activeTab === 'overview' && (
                      <motion.div
                        key="tab-overview"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="space-y-6"
                      >
                        {/* Large Media Display */}
                        <div className="w-full overflow-hidden bg-black/60 rounded-2xl border border-white/10 shadow-2xl">
                          {ytId ? (
                            <div className="aspect-video w-full">
                              <iframe
                                src={`https://www.youtube.com/embed/${ytId}`}
                                className="w-full h-full border-none bg-black"
                                title={title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          ) : isNativeVideo ? (
                            <video
                              src={mediaUrl}
                              controls
                              playsInline
                              autoPlay
                              loop
                              muted
                              className="w-full max-h-[520px] object-contain bg-black"
                            />
                          ) : (
                            <img
                              src={mediaUrl}
                              alt={title}
                              className="w-full max-h-[520px] object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                              onClick={() => openLightbox && openLightbox(mediaUrl, title)}
                            />
                          )}
                        </div>

                        {/* Deep Context & Full Content */}
                        {content && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                              <i className="fa-solid fa-align-left text-xs"></i>
                              <span>Contexte & Présentation Approfondie</span>
                            </h4>
                            <div className="text-on-surface/90 text-sm font-sans font-normal leading-relaxed whitespace-pre-wrap max-w-4xl">
                              {content}
                            </div>
                          </div>
                        )}

                        {/* External Link using Official BKN Tech React Button Component */}
                        {externalUrl && (
                          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4">
                            <Button
                              variant="green"
                              href={externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="!py-3 !px-6 text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_25px_rgba(78,222,163,0.35)]"
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-sm" />
                              <span>{currentLang === 'fr' ? 'Visiter le site en direct' : 'Visit Live Project'}</span>
                            </Button>
                            <span className="text-xs font-mono text-on-surface-variant/60">
                              {externalUrl.replace(/^https?:\/\//, '')}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* TAB 2: FEATURES — Minimalist & High Contrast Card Grid */}
                    {activeTab === 'features' && (
                      <motion.div
                        key="tab-features"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {parsedFeatures.map((feat, idx) => {
                            const isObject = typeof feat === 'object';
                            const featureTitle = isObject ? (feat.title || `Option #${idx + 1}`) : `Option #${idx + 1}`;
                            const featureDesc = isObject ? (feat.desc || feat.description || '') : feat;
                            const formattedIdx = String(idx + 1).padStart(2, '0');

                            return (
                              <div
                                key={idx}
                                className="group/feat relative p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/[0.08] hover:border-secondary/50 transition-all duration-300 shadow-md flex flex-col justify-between overflow-hidden"
                              >
                                {/* Top Glow Bar on Hover */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/0 to-transparent group-hover/feat:via-secondary/60 transition-all duration-500" />

                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.8)] flex-shrink-0" />
                                    <h4 className="font-sans font-bold text-sm text-white group-hover/feat:text-secondary transition-colors truncate">
                                      {featureTitle}
                                    </h4>
                                  </div>
                                  <span className="font-mono text-[10px] font-black text-secondary/40 group-hover/feat:text-secondary transition-colors select-none">
                                    0{idx + 1}
                                  </span>
                                </div>

                                {featureDesc && (
                                  <p className="text-xs text-on-surface-variant/80 font-sans leading-relaxed mt-2 pl-3.5 border-l border-white/5 group-hover/feat:border-secondary/20 transition-colors">
                                    {featureDesc}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Official BKN React Button in Features */}
                        {externalUrl && (
                          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4">
                            <Button
                              variant="green"
                              href={externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="!py-3 !px-6 text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_25px_rgba(78,222,163,0.35)]"
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-sm" />
                              <span>{currentLang === 'fr' ? 'Visiter le site en direct' : 'Visit Live Project'}</span>
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* TAB 3: SPECS / TECH STACK — Minimalist High-Tech Spec Sheet Grid */}
                    {activeTab === 'specs' && (
                      <motion.div
                        key="tab-specs"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                          {specsArray.map((spec, idx) => {
                            const labelText = typeof spec.label === 'object' ? (spec.label[currentLang] || spec.label.fr) : spec.label;
                            return (
                              <div
                                key={idx}
                                className="group/spec relative p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/[0.08] hover:border-tertiary/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-md"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-on-surface-variant/50 font-mono text-[9px] uppercase font-bold tracking-widest block truncate group-hover/spec:text-tertiary/70 transition-colors">
                                    {labelText}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-tertiary/40 group-hover/spec:bg-tertiary group-hover/spec:shadow-[0_0_8px_rgba(190,194,255,0.8)] transition-all" />
                                </div>
                                <span className="text-white font-mono font-extrabold text-xs md:text-sm block truncate mt-2 group-hover/spec:text-tertiary transition-colors">
                                  {spec.value}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}


                    {/* TAB 4: GALLERY */}
                    {activeTab === 'gallery' && (
                      <motion.div
                        key="tab-gallery"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="space-y-4"
                      >
                        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                          <img
                            src={activeGalleryImg || galleryItems[0]?.url || mediaUrl}
                            alt={`${title} gallery`}
                            className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                            onClick={() => openLightbox && openLightbox(activeGalleryImg || galleryItems[0]?.url || mediaUrl, title)}
                          />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {galleryItems.map((item, idx) => {
                            const isSelected = (activeGalleryImg || galleryItems[0]?.url) === item.url;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveGalleryImg(item.url)}
                                className={`aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all ${
                                  isSelected ? 'border-primary shadow-[0_0_12px_rgba(190,194,255,0.4)] scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={item.url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}

import React from 'react';
import { useImageLightbox } from '../context/ImageLightboxContext';

/**
 * Helper function to extract YouTube Embed URL
 */
export function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
  }
  return url;
}

/**
 * Helper function to check if URL is a video source (native or YouTube)
 */
export function isVideoUrl(url, explicitType) {
  if (explicitType === 'video') return true;
  if (explicitType === 'image') return false;
  if (!url) return false;

  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    /\.(mp4|webm|ogg|mov)$/i.test(cleanUrl) ||
    (url.includes('cdn.discordapp.com') && /\.(mp4|webm)/i.test(cleanUrl))
  );
}

/**
 * Universal MediaViewer Component
 * Handles unadulterated rendering for YouTube embeds, native HTML5 video player,
 * and zoomable lightbox images.
 */
export default function MediaViewer({
  src,
  alt = 'Media content',
  mediaType, // 'video' | 'image' | undefined (auto-detect)
  className = '',
  aspectRatio = 'aspect-video',
  autoPlay = false,
  controls = true,
  caption,
  enableLightbox = true,
  onClick
}) {
  const { openLightbox } = useImageLightbox();

  if (!src) return null;

  const isVideo = isVideoUrl(src, mediaType);
  const isYouTube = isVideo && (src.includes('youtube.com') || src.includes('youtu.be'));

  if (isYouTube) {
    const embedUrl = getYouTubeEmbedUrl(src);
    return (
      <div className={`w-full ${aspectRatio} rounded-xl overflow-hidden bg-black/80 border border-white/10 ${className}`}>
        <iframe
          src={embedUrl}
          title={alt}
          className="w-full h-full border-0 block"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isVideo) {
    const isWebm = src.toLowerCase().includes('.webm');
    return (
      <div className={`w-full ${aspectRatio} rounded-xl overflow-hidden bg-black/80 border border-white/10 ${className}`}>
        <video
          src={src}
          controls={controls}
          autoPlay={autoPlay}
          muted={autoPlay}
          playsInline
          preload="metadata"
          className="w-full h-full object-contain block bg-black"
        >
          <source src={src} type={isWebm ? 'video/webm' : 'video/mp4'} />
          Votre navigateur ne prend pas en charge la lecture de vidéos.
        </video>
      </div>
    );
  }

  // Standard Image with Lightbox Zoom capability
  const handleImageClick = (e) => {
    if (onClick) onClick(e);
    if (enableLightbox) {
      openLightbox(src, caption || alt);
    }
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        onClick={handleImageClick}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/notfound.gif';
        }}
        className={`w-full h-full object-cover block ${enableLightbox ? 'cursor-zoom-in hover:scale-[1.02] transition-transform duration-300' : ''}`}
        loading="lazy"
      />
    </div>
  );
}

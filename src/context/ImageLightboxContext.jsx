import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageLightboxContext = createContext({
  openLightbox: () => {},
  closeLightbox: () => {}
});

export function ImageLightboxProvider({ children }) {
  const [lightboxState, setLightboxState] = useState({ isOpen: false, src: '', alt: '' });

  const openLightbox = (src, alt = '') => {
    if (!src) return;
    setLightboxState({ isOpen: true, src, alt });
  };

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, src: '', alt: '' });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxState.isOpen) {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxState.isOpen]);

  return (
    <ImageLightboxContext.Provider value={{ openLightbox, closeLightbox }}>
      {children}
      <AnimatePresence>
        {lightboxState.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 select-none cursor-zoom-out"
          >
            {/* Top Control Bar */}
            <div className="absolute top-4 right-4 md:top-6 md:right-8 z-10 flex items-center gap-3">
              <span className="text-[10px] font-mono text-white/40 hidden sm:inline">[ ECHAP pour fermer ]</span>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
                title="Fermer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Image Preview Box */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[92vw] max-h-[85vh] flex flex-col items-center justify-center rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-black/60 cursor-default"
            >
              <img
                src={lightboxState.src}
                alt={lightboxState.alt || 'Agrandissement image'}
                className="max-w-full max-h-[80vh] w-auto h-auto object-contain select-none"
              />
              {lightboxState.alt && (
                <div className="w-full bg-black/80 border-t border-white/5 px-4 py-2 text-center text-xs font-mono text-on-surface-variant/80 truncate">
                  {lightboxState.alt}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ImageLightboxContext.Provider>
  );
}

export function useImageLightbox() {
  return useContext(ImageLightboxContext);
}

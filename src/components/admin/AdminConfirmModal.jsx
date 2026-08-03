import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../context/AdminContext';
import Button from '../Button';

export default function AdminConfirmModal() {
  const { t } = useTranslation();
  const { confirmModalState, closeConfirmModal } = useAdmin();

  // Escape Key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && confirmModalState) {
        closeConfirmModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmModalState, closeConfirmModal]);

  if (!confirmModalState) return null;

  const { title, message, onConfirm } = confirmModalState;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    closeConfirmModal();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto select-none"
        onClick={closeConfirmModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-surface-container-low/95 backdrop-blur-xl border border-red-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] relative"
        >
          {/* Header */}
          <div className="bg-black/60 border-b border-red-500/20 px-6 py-4 flex items-center justify-between font-mono text-xs text-red-400">
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-triangle-exclamation text-red-400 text-sm"></i>
              <span className="font-bold uppercase tracking-wider">{title || 'Confirmation Requise'}</span>
            </div>
            {/* Enlarged Close Button */}
            <button
              onClick={closeConfirmModal}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white transition-all cursor-pointer"
              title="Fermer (Échap)"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <p className="text-sm font-sans text-on-surface/90 leading-relaxed font-medium">
              {message || 'Êtes-vous sûr de vouloir effectuer cette action ?'}
            </p>

            {/* Official BKN Button Styles */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                variant="black"
                onClick={closeConfirmModal}
                type="button"
              >
                Annuler
              </Button>

              <Button
                variant="red"
                onClick={handleConfirm}
                type="button"
              >
                <i className="fa-solid fa-trash text-xs" />
                <span>Confirmer la Suppression</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

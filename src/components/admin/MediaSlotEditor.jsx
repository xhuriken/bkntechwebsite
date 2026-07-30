import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button';

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
 * MediaSlotEditor Admin Sub-Component
 * Rich Media Slots Manager with sliding pill toggles (Image/Video, URL/Local File),
 * ordering controls, and live video/image previews.
 */
export default function MediaSlotEditor({
  slots = [],
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot,
  onMoveSlotUp,
  onMoveSlotDown,
  onFileUpload
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/5 pb-3">
        <div>
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-secondary" />
            <span>Slots Médias & Ordre d'Affichage ({slots.length})</span>
          </h3>
          <p className="text-[11px] font-sans text-on-surface-variant/60 mt-0.5">
            Le <strong className="text-secondary font-semibold">Slot #1</strong> est le média principal (couverture). Les slots suivants (#2, #3...) composent la galerie.
          </p>
        </div>
        <Button
          variant="green"
          type="button"
          onClick={onAddSlot}
          className="!py-2 !px-3 text-xs flex-shrink-0"
        >
          <i className="fa-solid fa-plus mr-1.5 text-xs" />
          Ajouter un Slot Média
        </Button>
      </div>

      {/* Slots List Container */}
      <AnimatePresence mode="popLayout">
        {slots.length === 0 ? (
          <div className="text-xs font-sans text-on-surface-variant/50 italic py-8 text-center bg-black/20 border border-dashed border-white/10 rounded-2xl">
            Aucun slot média configuré. Cliquez sur "Ajouter un Slot Média" pour commencer.
          </div>
        ) : (
          slots.map((slot, index) => {
            const isPrimary = index === 0;
            const ytId = slot.type === 'video' ? getYouTubeId(slot.url) : null;

            return (
              <motion.div
                key={slot.id || index}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-4 bg-surface-container-low/40 backdrop-blur-md relative ${
                  isPrimary
                    ? 'border-secondary/50 bg-secondary/[0.04] shadow-[0_0_20px_rgba(78,222,163,0.08)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Card Header: Slot Badge & Action Buttons */}
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5 select-none">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-sans font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isPrimary
                        ? 'bg-secondary/20 text-secondary border-secondary/40 shadow-[0_0_10px_rgba(78,222,163,0.3)]'
                        : 'bg-white/5 text-on-surface-variant/70 border-white/10'
                    }`}>
                      {isPrimary ? 'SLOT #1 — MÉDIA PRINCIPAL (COUVERTURE)' : `SLOT #${index + 1}`}
                    </span>
                  </div>

                  {/* Reorder & Remove Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onMoveSlotUp(index)}
                      className="px-2 py-1 bg-white/5 hover:bg-white/15 disabled:opacity-20 rounded-lg text-xs text-on-surface transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                      title="Monter dans l'ordre"
                    >
                      <i className="fa-solid fa-arrow-up text-[10px]" />
                      <span className="text-[9px] font-mono">Monter</span>
                    </button>
                    <button
                      type="button"
                      disabled={index === slots.length - 1}
                      onClick={() => onMoveSlotDown(index)}
                      className="px-2 py-1 bg-white/5 hover:bg-white/15 disabled:opacity-20 rounded-lg text-xs text-on-surface transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                      title="Descendre dans l'ordre"
                    >
                      <i className="fa-solid fa-arrow-down text-[10px]" />
                      <span className="text-[9px] font-mono">Descendre</span>
                    </button>
                    {slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveSlot(index)}
                        className="px-2 py-1 bg-red-950/40 hover:bg-red-600/80 border border-red-800/40 text-red-300 hover:text-white rounded-lg text-xs transition-all cursor-pointer ml-1"
                        title="Supprimer ce slot"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Slot Type & Source Mode Switcher Bar (SSOT Sliding Pill Toggles) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Type Switcher: Image or Video */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant/70">
                      Type de Média
                    </label>
                    <div className="relative flex items-center p-1 bg-black/50 rounded-xl border border-white/10 select-none">
                      <motion.div
                        className={`absolute inset-y-1 rounded-lg shadow-md ${
                          slot.type === 'image'
                            ? 'bg-secondary text-surface shadow-[0_0_12px_rgba(78,222,163,0.35)]'
                            : 'bg-primary text-surface shadow-[0_0_12px_rgba(190,194,255,0.35)]'
                        }`}
                        animate={{
                          left: slot.type === 'image' ? '4px' : '50%',
                          width: 'calc(50% - 4px)'
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                      <button
                        type="button"
                        onClick={() => onUpdateSlot(index, 'type', 'image')}
                        className={`relative z-10 flex-1 py-1.5 text-xs font-sans font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus:outline-none ${
                          slot.type === 'image' ? 'text-surface' : 'text-on-surface-variant/70 hover:text-on-surface'
                        }`}
                      >
                        <i className="fa-solid fa-image text-xs" />
                        <span>Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateSlot(index, 'type', 'video')}
                        className={`relative z-10 flex-1 py-1.5 text-xs font-sans font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus:outline-none ${
                          slot.type === 'video' ? 'text-surface' : 'text-on-surface-variant/70 hover:text-on-surface'
                        }`}
                      >
                        <i className="fa-solid fa-video text-xs" />
                        <span>Vidéo</span>
                      </button>
                    </div>
                  </div>

                  {/* Source Mode Switcher: Link URL vs Local File */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant/70">
                      Source du Média
                    </label>
                    <div className="relative flex items-center p-1 bg-black/50 rounded-xl border border-white/10 select-none">
                      <motion.div
                        className="absolute inset-y-1 rounded-lg bg-white/20 shadow-md"
                        animate={{
                          left: slot.sourceType !== 'local' ? '4px' : '50%',
                          width: 'calc(50% - 4px)'
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                      <button
                        type="button"
                        onClick={() => onUpdateSlot(index, 'sourceType', 'url')}
                        className={`relative z-10 flex-1 py-1.5 text-xs font-sans font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus:outline-none ${
                          slot.sourceType !== 'local' ? 'text-on-surface' : 'text-on-surface-variant/70 hover:text-on-surface'
                        }`}
                      >
                        <i className="fa-solid fa-link text-xs" />
                        <span>Lien / URL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateSlot(index, 'sourceType', 'local')}
                        className={`relative z-10 flex-1 py-1.5 text-xs font-sans font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus:outline-none ${
                          slot.sourceType === 'local' ? 'text-on-surface' : 'text-on-surface-variant/70 hover:text-on-surface'
                        }`}
                      >
                        <i className="fa-solid fa-cloud-arrow-up text-xs" />
                        <span>Fichier Local</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Slot Input Area: URL vs File Upload */}
                {slot.sourceType === 'local' ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-sans font-semibold text-on-surface-variant">
                      Téléverser un fichier local ({slot.type === 'video' ? 'Vidéo MP4 / WebM' : 'Image JPG / PNG / WebP'})
                    </label>
                    <input
                      type="file"
                      accept={slot.type === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                      onChange={(e) => onFileUpload(e, index)}
                      className="hidden"
                      id={`slot-file-input-${index}`}
                    />
                    <label
                      htmlFor={`slot-file-input-${index}`}
                      className="w-full bg-white/5 hover:bg-white/10 border border-dashed border-secondary/40 hover:border-secondary rounded-xl px-4 py-3 text-xs font-sans font-bold text-secondary flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <i className="fa-solid fa-cloud-arrow-up text-sm" />
                      <span>
                        {slot.url
                          ? `Fichier chargé : ${slot.url}`
                          : `Parcourir et charger ${slot.type === 'video' ? 'une Vidéo MP4' : 'une Image'}`}
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-sans font-semibold text-on-surface-variant">
                      Lien URL du Média ({slot.type === 'video' ? 'YouTube / Lien MP4 direct' : 'URL d\'image ou /uploads/...'})
                    </label>
                    <input
                      type="text"
                      value={slot.url || ''}
                      onChange={(e) => onUpdateSlot(index, 'url', e.target.value)}
                      placeholder={
                        slot.type === 'video'
                          ? 'https://youtube.com/watch?v=... ou /uploads/video.mp4'
                          : 'https://images.unsplash.com/... ou /uploads/image.png'
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-sans text-on-surface focus:outline-none focus:border-secondary/60 transition-colors"
                    />
                  </div>
                )}

                {/* Live Slot Preview Box */}
                {slot.url && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                      <i className="fa-solid fa-eye text-xs" />
                      <span>Aperçu en direct du Slot #{index + 1}</span>
                    </span>
                    <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/60 aspect-video max-h-48 relative flex items-center justify-center">
                      {slot.type === 'video' ? (
                        ytId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            className="w-full h-full border-none"
                            title={`Preview Slot ${index + 1}`}
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={slot.url}
                            controls
                            playsInline
                            muted
                            className="w-full h-full object-contain bg-black"
                          />
                        )
                      ) : (
                        <img
                          src={slot.url}
                          alt={`Preview Slot ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/BknLogo.svg';
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}

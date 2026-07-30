import React from 'react';

/**
 * MediaSlotEditor Admin Sub-Component
 * Manages media slots (video/image URLs, file uploads, ordering) in the project admin form.
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
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/5 pb-3">
        <div>
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-secondary" />
            <span>Slots Médias & Ordre d'Affichage ({slots.length})</span>
          </h3>
          <p className="text-[11px] font-sans text-on-surface-variant/70 mt-0.5">
            Organisez la séquence d'affichage des images et vidéos pour ce post.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddSlot}
          className="px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary text-xs font-sans font-semibold hover:bg-secondary/20 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-plus text-[10px]" />
          <span>Ajouter un Slot Média</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {slots.length === 0 ? (
          <div className="text-xs font-sans text-on-surface-variant/50 italic py-6 text-center bg-black/20 border border-dashed border-white/10 rounded-xl">
            Aucun slot média configuré. Cliquez sur "Ajouter un Slot Média" pour commencer.
          </div>
        ) : (
          slots.map((slot, idx) => (
            <div
              key={slot.id || idx}
              className="flex flex-col gap-3 bg-surface-container-low/40 border border-white/5 rounded-xl p-3.5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <span className="text-xs font-mono font-bold text-secondary flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-[10px]">
                    #{idx + 1}
                  </span>
                  <span>Slot #{idx + 1}</span>
                </span>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveSlotUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Monter"
                  >
                    <i className="fa-solid fa-arrow-up text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSlotDown(idx)}
                    disabled={idx === slots.length - 1}
                    className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Descendre"
                  >
                    <i className="fa-solid fa-arrow-down text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveSlot(idx)}
                    className="p-1.5 text-red-400/60 hover:text-red-400 cursor-pointer ml-1"
                    title="Supprimer le slot"
                  >
                    <i className="fa-solid fa-trash text-xs" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Type Select */}
                <div className="sm:col-span-3">
                  <select
                    value={slot.type || 'image'}
                    onChange={(e) => onUpdateSlot(idx, 'type', e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-sans text-on-surface focus:border-secondary focus:outline-none cursor-pointer"
                  >
                    <option value="image" className="bg-neutral-900">Image</option>
                    <option value="video" className="bg-neutral-900">Vidéo (MP4 / YouTube)</option>
                  </select>
                </div>

                {/* Source Type Toggle */}
                <div className="sm:col-span-3">
                  <select
                    value={slot.sourceType || 'url'}
                    onChange={(e) => onUpdateSlot(idx, 'sourceType', e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-sans text-on-surface focus:border-secondary focus:outline-none cursor-pointer"
                  >
                    <option value="url" className="bg-neutral-900">Lien URL externe</option>
                    <option value="file" className="bg-neutral-900">Téléverser un fichier</option>
                  </select>
                </div>

                {/* Input or File Upload */}
                <div className="sm:col-span-6 flex items-center gap-2">
                  {slot.sourceType === 'file' ? (
                    <label className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-sans text-on-surface hover:bg-white/5 transition-colors cursor-pointer select-none text-center truncate">
                      {slot.url ? 'Fichier prêt (cliquez pour remplacer)' : 'Choisir un fichier...'}
                      <input
                        type="file"
                        accept={slot.type === 'video' ? 'video/*' : 'image/*'}
                        onChange={(e) => onFileUpload(e, idx)}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <input
                      type="text"
                      value={slot.url || ''}
                      onChange={(e) => onUpdateSlot(idx, 'url', e.target.value)}
                      placeholder={slot.type === 'video' ? 'URL YouTube ou vidéo MP4...' : 'URL de l\'image (ex: /uploads/...)'}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-sans text-on-surface placeholder:text-white/20 focus:border-secondary focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

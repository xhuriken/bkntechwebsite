import React from 'react';

/**
 * PatchNoteEditor Admin Sub-Component
 * Manages Patch Note items (category select, text input, re-ordering, delete, add).
 */
export default function PatchNoteEditor({
  hasChangelog = false,
  changelog = [],
  onToggleHasChangelog,
  onAddChangelogItem,
  onUpdateChangelogItem,
  onRemoveChangelogItem,
  onMoveChangelogItemUp,
  onMoveChangelogItemDown
}) {
  return (
    <div className="flex flex-col gap-3 mt-1 bg-surface-container-low/20 border border-white/5 rounded-xl p-3.5">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <span className="text-xs font-sans font-semibold text-on-surface flex items-center gap-2">
          <i className="fa-solid fa-list-check text-primary text-xs" />
          <span>Éléments du Patch Note ({changelog.length})</span>
        </span>
        <button
          type="button"
          onClick={onAddChangelogItem}
          className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-sans font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-plus text-[10px]" />
          <span>Ajouter une ligne</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {changelog.length === 0 ? (
          <div className="text-xs font-sans text-on-surface-variant/50 italic py-2 text-center">
            Aucune ligne. Cliquez sur "Ajouter une ligne" ci-dessus.
          </div>
        ) : (
          changelog.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 bg-black/30 border border-white/5 rounded-lg p-2 flex-wrap sm:flex-nowrap">
              {/* Category Select */}
              <select
                value={item.type || 'fix'}
                onChange={(e) => onUpdateChangelogItem(idx, 'type', e.target.value)}
                className="bg-black/60 border border-white/10 rounded-md px-2.5 py-1.5 text-xs font-sans font-semibold text-on-surface focus:border-primary focus:outline-none cursor-pointer flex-shrink-0"
              >
                <option value="content" className="bg-neutral-900 text-green-400 font-semibold">Nouveau Contenu</option>
                <option value="system" className="bg-neutral-900 text-cyan-400 font-semibold">Nouveaux Systèmes</option>
                <option value="balance" className="bg-neutral-900 text-amber-400 font-semibold">Équilibrage</option>
                <option value="improvement" className="bg-neutral-900 text-primary font-semibold">Améliorations</option>
                <option value="fix" className="bg-neutral-900 text-red-400 font-semibold">Corrections de Bugs</option>
              </select>

              {/* Text Input */}
              <input
                type="text"
                value={typeof item.text === 'object' ? (item.text.fr || '') : item.text}
                onChange={(e) => onUpdateChangelogItem(idx, 'text', e.target.value)}
                placeholder="Ex: Correction de la fuite de mémoire du HUD..."
                className="flex-1 min-w-[200px] bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-xs font-sans text-on-surface placeholder:text-white/20 focus:border-primary focus:outline-none"
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onMoveChangelogItemUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                  title="Monter"
                >
                  <i className="fa-solid fa-arrow-up text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveChangelogItemDown(idx)}
                  disabled={idx === changelog.length - 1}
                  className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                  title="Descendre"
                >
                  <i className="fa-solid fa-arrow-down text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveChangelogItem(idx)}
                  className="p-1.5 text-red-400/60 hover:text-red-400 cursor-pointer ml-1"
                  title="Supprimer"
                >
                  <i className="fa-solid fa-trash text-xs" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

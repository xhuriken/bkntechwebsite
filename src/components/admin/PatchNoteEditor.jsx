import React from 'react';

/**
 * PatchNoteEditor Admin Sub-Component
 * Manages Patch Note items (category select, text input, re-ordering, delete, add).
 */
export default function PatchNoteEditor({
  hasChangelog = false,
  changelog = [],
  changelogs = [],
  onChange,
  onToggleHasChangelog,
  onAddChangelogItem,
  onUpdateChangelogItem,
  onRemoveChangelogItem,
  onMoveChangelogItemUp,
  onMoveChangelogItemDown
}) {
  // Normalize items array
  const items = Array.isArray(changelog) && changelog.length > 0
    ? changelog
    : Array.isArray(changelogs)
    ? changelogs
    : [];

  const handleAdd = () => {
    if (typeof onAddChangelogItem === 'function') {
      onAddChangelogItem();
    } else if (typeof onChange === 'function') {
      onChange([...items, { type: 'fix', text: '' }]);
    }
  };

  const handleUpdate = (idx, field, value) => {
    if (typeof onUpdateChangelogItem === 'function') {
      onUpdateChangelogItem(idx, field, value);
    } else if (typeof onChange === 'function') {
      const newItems = [...items];
      newItems[idx] = { ...newItems[idx], [field]: value };
      onChange(newItems);
    }
  };

  const handleRemove = (idx) => {
    if (typeof onRemoveChangelogItem === 'function') {
      onRemoveChangelogItem(idx);
    } else if (typeof onChange === 'function') {
      onChange(items.filter((_, i) => i !== idx));
    }
  };

  const handleMoveUp = (idx) => {
    if (idx <= 0) return;
    if (typeof onMoveChangelogItemUp === 'function') {
      onMoveChangelogItemUp(idx);
    } else if (typeof onChange === 'function') {
      const newItems = [...items];
      const temp = newItems[idx - 1];
      newItems[idx - 1] = newItems[idx];
      newItems[idx] = temp;
      onChange(newItems);
    }
  };

  const handleMoveDown = (idx) => {
    if (idx >= items.length - 1) return;
    if (typeof onMoveChangelogItemDown === 'function') {
      onMoveChangelogItemDown(idx);
    } else if (typeof onChange === 'function') {
      const newItems = [...items];
      const temp = newItems[idx + 1];
      newItems[idx + 1] = newItems[idx];
      newItems[idx] = temp;
      onChange(newItems);
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-1 bg-surface-container-low/20 border border-white/5 rounded-xl p-3.5">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <span className="text-xs font-sans font-semibold text-on-surface flex items-center gap-2">
          <i className="fa-solid fa-list-check text-primary text-xs" />
          <span>Éléments du Patch Note ({items.length})</span>
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-sans font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-plus text-[10px]" />
          <span>Ajouter une ligne</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="text-xs font-sans text-on-surface-variant/50 italic py-2 text-center">
            Aucune ligne. Cliquez sur "Ajouter une ligne" ci-dessus.
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 bg-black/30 border border-white/5 rounded-lg p-2 flex-wrap sm:flex-nowrap">
              {/* Category Select */}
              <select
                value={item.type || 'fix'}
                onChange={(e) => handleUpdate(idx, 'type', e.target.value)}
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
                value={typeof item.text === 'object' ? (item.text.fr || '') : (item.text || '')}
                onChange={(e) => handleUpdate(idx, 'text', e.target.value)}
                placeholder="Ex: Correction de la fuite de mémoire du HUD..."
                className="bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-xs font-sans text-on-surface placeholder-on-surface-variant/40 focus:border-primary focus:outline-none flex-grow min-w-[200px]"
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveUp(idx)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-on-surface transition-colors cursor-pointer text-xs"
                  title="Monter"
                >
                  <i className="fa-solid fa-chevron-up text-[10px]" />
                </button>
                <button
                  type="button"
                  disabled={idx === items.length - 1}
                  onClick={() => handleMoveDown(idx)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-on-surface transition-colors cursor-pointer text-xs"
                  title="Descendre"
                >
                  <i className="fa-solid fa-chevron-down text-[10px]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer text-xs"
                  title="Supprimer"
                >
                  <i className="fa-solid fa-xmark text-[10px]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

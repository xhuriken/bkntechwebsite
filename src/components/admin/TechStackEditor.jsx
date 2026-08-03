import React from 'react';

/**
 * TechStackEditor Sub-Component
 * Structured editor for Tech Stack Specs (Label + Value) to match Screen #1 bottom layout.
 */
export default function TechStackEditor({
  specs = [],
  onChange
}) {
  const items = Array.isArray(specs) ? specs : [];

  const handleAdd = () => {
    onChange([...items, { label: '', value: '' }]);
  };

  const handleUpdate = (index, field, val) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: val };
    onChange(newItems);
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3 mt-1 bg-surface-container-low/20 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <span className="text-xs font-sans font-bold text-tertiary flex items-center gap-2">
          <i className="fa-solid fa-layer-group text-tertiary text-xs" />
          <span>Fiche Technique / Spécifications ({items.length})</span>
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-1.5 rounded-lg bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs font-sans font-bold hover:bg-tertiary/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-plus text-[10px]" />
          <span>Ajouter une Spécification</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="text-xs font-sans text-on-surface-variant/50 italic py-4 text-center bg-black/20 rounded-xl border border-dashed border-white/5">
            Aucune spécification technique configurée. Cliquez sur "Ajouter une Spécification".
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-2.5">
              <input
                type="text"
                value={typeof item.label === 'object' ? (item.label.fr || '') : (item.label || '')}
                onChange={(e) => handleUpdate(idx, 'label', e.target.value)}
                placeholder="Intitulé (ex: FRAMEWORK)"
                className="w-1/3 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono uppercase text-on-surface-variant/70 focus:border-tertiary focus:outline-none"
              />
              <input
                type="text"
                value={item.value || ''}
                onChange={(e) => handleUpdate(idx, 'value', e.target.value)}
                placeholder="Valeur (ex: React & Vite)"
                className="w-2/3 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-tertiary focus:border-tertiary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs cursor-pointer ml-1"
                title="Supprimer"
              >
                <i className="fa-solid fa-trash-can text-[10px]" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

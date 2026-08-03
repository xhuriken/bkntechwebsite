import React from 'react';

/**
 * FeaturesEditor Sub-Component
 * Structured editor for project features (Title + Description) with re-ordering and delete buttons.
 */
export default function FeaturesEditor({
  features = [],
  onChange
}) {
  const items = Array.isArray(features) ? features : [];

  const handleAdd = () => {
    onChange([...items, { title: '', desc: '' }]);
  };

  const handleUpdate = (index, field, value) => {
    const newItems = [...items];
    const item = newItems[index];
    if (typeof item === 'string') {
      newItems[index] = { title: field === 'title' ? value : item, desc: field === 'desc' ? value : '' };
    } else {
      newItems[index] = { ...item, [field]: value };
    }
    onChange(newItems);
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    onChange(newItems);
  };

  const handleMoveDown = (index) => {
    if (index >= items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    onChange(newItems);
  };

  return (
    <div className="flex flex-col gap-3 mt-1 bg-surface-container-low/20 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <span className="text-xs font-sans font-bold text-primary flex items-center gap-2">
          <i className="fa-solid fa-list-check text-secondary text-xs" />
          <span>Liste des Caractéristiques ({items.length})</span>
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-sans font-bold hover:bg-primary/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-plus text-[10px]" />
          <span>Ajouter une Caractéristique</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="text-xs font-sans text-on-surface-variant/50 italic py-4 text-center bg-black/20 rounded-xl border border-dashed border-white/5">
            Aucune caractéristique enregistrée. Cliquez sur "Ajouter une Caractéristique" ci-dessus.
          </div>
        ) : (
          items.map((item, idx) => {
            const isObj = typeof item === 'object';
            const itemTitle = isObj ? (item.title || '') : `Option #${idx + 1}`;
            const itemDesc = isObj ? (item.desc || item.description || '') : item;

            return (
              <div key={idx} className="flex flex-col gap-2 bg-black/40 border border-white/10 rounded-xl p-3 relative group">
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    <i className="fa-solid fa-check text-xs" />
                    <span>Caractéristique #{idx + 1}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-on-surface text-xs cursor-pointer"
                      title="Monter"
                    >
                      <i className="fa-solid fa-chevron-up text-[10px]" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-on-surface text-xs cursor-pointer"
                      title="Descendre"
                    >
                      <i className="fa-solid fa-chevron-down text-[10px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs cursor-pointer ml-1"
                      title="Supprimer"
                    >
                      <i className="fa-solid fa-trash-can text-[10px]" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={itemTitle}
                    onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                    placeholder="Titre (ex: Dashboard Temps Réel)"
                    className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-primary placeholder-on-surface-variant/40 focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    value={itemDesc}
                    onChange={(e) => handleUpdate(idx, 'desc', e.target.value)}
                    placeholder="Description (ex: Métriques & Export PDF en direct)"
                    className="md:col-span-2 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-sans text-on-surface placeholder-on-surface-variant/40 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

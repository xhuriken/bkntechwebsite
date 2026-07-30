import React from 'react';
import { motion } from 'framer-motion';

/**
 * Patch Note Category Configurations
 */
export const CATEGORY_CONFIG = {
  content: { label: { fr: 'Nouveau Contenu', en: 'New Content' }, icon: 'fa-box-open', color: 'text-green-400' },
  system: { label: { fr: 'Nouveaux Systèmes', en: 'New Systems' }, icon: 'fa-microchip', color: 'text-cyan-400' },
  balance: { label: { fr: 'Équilibrage', en: 'Game Balance' }, icon: 'fa-scale-balanced', color: 'text-amber-400' },
  improvement: { label: { fr: 'Améliorations', en: 'Improvements' }, icon: 'fa-sliders', color: 'text-primary' },
  fix: { label: { fr: 'Corrections de Bugs', en: 'Bugfixes' }, icon: 'fa-bug-slash', color: 'text-red-400' },
  // Backward compatibility aliases
  add: { label: { fr: 'Nouveau Contenu', en: 'New Content' }, icon: 'fa-box-open', color: 'text-green-400' },
  remove: { label: { fr: 'Suppressions', en: 'Removals' }, icon: 'fa-trash-can', color: 'text-red-400' },
  wip: { label: { fr: 'En Cours', en: 'Work in Progress' }, icon: 'fa-bolt', color: 'text-amber-400' }
};

/**
 * Universal PatchNoteList Component
 * Groups patch note items by game dev canonical categories and renders
 * modern BKN Tech glass typography with glowing gradient dividers and interactive accent bars.
 */
export default function PatchNoteList({
  changelog = [],
  currentLang = 'fr',
  className = ''
}) {
  if (!changelog || changelog.length === 0) return null;

  const grouped = {};
  const canonicalOrder = ['content', 'add', 'system', 'balance', 'improvement', 'fix', 'remove', 'wip'];

  changelog.forEach((item) => {
    const key = item.type || 'fix';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => (canonicalOrder.indexOf(a) >= 0 ? canonicalOrder.indexOf(a) : 99) - (canonicalOrder.indexOf(b) >= 0 ? canonicalOrder.indexOf(b) : 99)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col gap-6 pt-1 ${className}`}
    >
      {sortedCategories.map((catKey) => {
        const items = grouped[catKey];
        const cfg = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.fix;
        const catTitle = cfg.label[currentLang] || cfg.label['fr'];

        return (
          <div key={catKey} className="flex flex-col gap-1.5">
            {/* Minimal Category Header with Glowing Gradient Separator */}
            <div className="flex items-center gap-2.5 text-[11px] font-sans font-bold uppercase tracking-widest text-on-surface-variant/90 select-none pb-1">
              <i className={`fa-solid ${cfg.icon} ${cfg.color} text-xs opacity-90`} />
              <span className="text-on-surface">{catTitle}</span>
              <span className="text-[10px] font-mono text-white/30">({items.length})</span>
              <span className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent ml-2" />
            </div>

            {/* Clean Glass Minimalist List Items */}
            <div className="flex flex-col gap-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="group/line relative flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-all duration-200 cursor-default"
                >
                  {/* Glowing Vertical Accent Bar */}
                  <span className={`w-0.5 h-3.5 rounded-full bg-white/20 group-hover/line:${cfg.color} group-hover/line:shadow-[0_0_8px_currentColor] group-hover/line:scale-y-125 transition-all duration-200 mt-1 flex-shrink-0 origin-center`} />

                  {/* Text Line */}
                  <p className="text-xs font-sans font-normal text-on-surface-variant/80 group-hover/line:text-on-surface group-hover/line:translate-x-1 transition-all duration-200 flex-1 leading-relaxed">
                    {typeof item.text === 'object' ? (item.text[currentLang] || item.text['fr']) : item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

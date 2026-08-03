import React from 'react';

/**
 * BrandPill Component
 * Official vertical gradient pill decoration for category titles.
 */
export default function BrandPill({ category = 'website', className = 'w-1.5 h-6' }) {
  const getCategoryGradient = (catKey) => {
    if (catKey === 'website' || catKey === 'sites') return 'from-secondary via-secondary/80 to-transparent shadow-[0_0_12px_rgba(78,222,163,0.5)]';
    if (catKey === 'ai-agent' || catKey === 'ai') return 'from-tertiary via-tertiary/80 to-transparent shadow-[0_0_12px_rgba(190,194,255,0.5)]';
    return 'from-primary via-primary/80 to-transparent shadow-[0_0_12px_rgba(190,194,255,0.5)]';
  };

  return (
    <span
      className={`${className} rounded-full bg-gradient-to-b ${getCategoryGradient(category)} flex-shrink-0`}
    />
  );
}

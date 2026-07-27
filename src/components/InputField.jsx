import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable animated InputField Component
 * Features smooth floating label animations, glowing interactive focus states,
 * custom error messages, and support for text, email, and textarea types.
 */
export default function InputField({ 
  label, 
  name, 
  type = 'text', 
  value = '', 
  onChange, 
  required = false, 
  error,
  rows = 4 
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value && value.length > 0;
  const isFloating = isFocused || isFilled;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className="relative w-full flex flex-col group mb-5">
      {/* Background glowing halo centered behind the input */}
      <div 
        className={`absolute inset-0 bg-primary/5 rounded-xl blur-md transition-opacity duration-500 pointer-events-none ${
          isFocused ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative w-full">
        {/* Render Textarea or Standard Input based on type */}
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            onFocus={handleFocus}
            onBlur={handleBlur}
            rows={rows}
            className={`
              block w-full bg-surface-container-low/45 backdrop-blur-md border rounded-xl px-4 pt-6 pb-3 
              text-sm text-on-surface font-sans transition-all duration-300 focus:outline-none resize-none
              ${error 
                ? 'border-red-500/40 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/20' 
                : 'border-white/5 group-hover:border-primary/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/10'
              }
            `}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`
              block w-full bg-surface-container-low/45 backdrop-blur-md border rounded-xl px-4 pt-6 pb-3 
              text-sm text-on-surface font-sans transition-all duration-300 focus:outline-none
              ${error 
                ? 'border-red-500/40 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/20' 
                : 'border-white/5 group-hover:border-primary/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/10'
              }
            `}
          />
        )}

        {/* Floating Label (position adjusted to float above the border line) */}
        <motion.label
          htmlFor={name}
          initial={false}
          animate={{
            y: isFloating ? -24 : 15,
            scale: isFloating ? 0.8 : 1,
            color: error 
              ? '#f87171' 
              : isFocused 
                ? 'var(--primary)' 
                : 'var(--on-surface-variant)'
          }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="absolute left-4 top-0 origin-left pointer-events-none font-display font-black text-xs uppercase tracking-[0.2em] select-none"
        >
          {label} {required && <span className="text-primary/70">*</span>}
        </motion.label>

        {/* Interactive underline expanding outward on focus */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`absolute bottom-0 left-4 right-4 h-[1px] origin-center ${
            error ? 'bg-red-500/75' : 'bg-primary/75'
          }`}
        />
      </div>

      {/* Validation Error Message Drawer */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: error ? 1 : 0,
          height: error ? 'auto' : 0
        }}
        className="text-[10px] font-display font-black uppercase tracking-wider text-red-400 mt-1.5 px-4 overflow-hidden"
      >
        {error}
      </motion.div>
    </div>
  );
}

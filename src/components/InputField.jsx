import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable animated InputField Component
 * Features a compact inner-label design, glowing focus states,
 * and unified alignment for both text inputs and textareas.
 */
export default function InputField({ 
  label, 
  name, 
  type = 'text', 
  value = '', 
  onChange, 
  required = false, 
  error,
  rows = 4,
  placeholder,
  min,
  max,
  children
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full flex flex-col mb-5">
      {/* Background glowing halo centered behind the input */}
      <div 
        className={`absolute inset-0 bg-primary/5 rounded-xl blur-md transition-opacity duration-500 pointer-events-none ${
          isFocused ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Input Box Wrapper */}
      <div 
        className={`
          relative w-full bg-surface-container-low/45 backdrop-blur-md border rounded-xl px-4 py-2.5 
          transition-all duration-300 flex flex-col gap-1 cursor-text
          ${error 
            ? 'border-red-500/40 focus-within:border-red-500/70 focus-within:ring-1 focus-within:ring-red-500/20' 
            : 'border-white/5 hover:border-primary/20 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/10'
          }
        `}
        onClick={() => document.getElementById(name)?.focus()}
      >
        {/* Small Fixed Label */}
        <label 
          htmlFor={name}
          className={`
            font-sans font-semibold text-[10px] uppercase tracking-wider select-none transition-colors duration-300
            ${error ? 'text-red-400' : isFocused ? 'text-primary' : 'text-on-surface-variant/80'}
          `}
        >
          {label} {required && <span className="text-primary/70">*</span>}
        </label>

        {/* Input Control */}
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={rows}
            placeholder={placeholder}
            className="block w-full bg-transparent text-sm text-on-surface font-sans focus:outline-none resize-none pt-0.5 leading-relaxed"
          />
        ) : type === 'select' ? (
          <div className="relative w-full">
            <select
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              required={required}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="block w-full bg-transparent text-sm text-on-surface font-sans focus:outline-none pt-0.5 cursor-pointer appearance-none pr-8"
            >
              {children}
            </select>
            <div className="absolute right-0 bottom-1 pointer-events-none text-on-surface-variant/60 text-[10px]">
              <i className="fa-solid fa-chevron-down"></i>
            </div>
          </div>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            min={min}
            max={max}
            className="block w-full bg-transparent text-sm text-on-surface font-sans focus:outline-none pt-0.5"
          />
        )}

        {/* Focus underline animation */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`absolute bottom-0 left-4 right-4 h-[1px] origin-center ${
            error ? 'bg-red-500/75' : 'bg-primary/75'
          }`}
        />
      </div>

      {/* Validation Error Message */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: error ? 1 : 0,
          height: error ? 'auto' : 0
        }}
        className="text-[10px] font-sans font-semibold uppercase tracking-wider text-red-400 mt-1.5 px-4 overflow-hidden"
      >
        {error}
      </motion.div>
    </div>
  );
}

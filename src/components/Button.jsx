import React, { useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

/**
 * Button Component with premium magnetic attraction hover effect.
 * Can be rendered as a button or an anchor tag if href is provided.
 */
export default function Button({ children, className = '', variant = 'primary', onClick, type = 'button', href, ...props }) {
  const ref = useRef(null);
  
  // Motion values for magnetic coordinates
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring physics setup for smooth elastic attraction
  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Background pattern shift coordinates
  const txX = useMotionValue(0);
  const txY = useMotionValue(0);
  const springTxX = useSpring(txX, springConfig);
  const springTxY = useSpring(txY, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Attract towards mouse (factor 0.08 for realistic premium feel)
    const pullX = (e.clientX - centerX) * 0.08;
    const pullY = (e.clientY - centerY) * 0.08;

    // Opposite grid shift
    const shiftX = (e.clientX - centerX) * -0.12;
    const shiftY = (e.clientY - centerY) * -0.12;

    x.set(pullX);
    y.set(pullY);
    txX.set(shiftX);
    txY.set(shiftY);
  };

  const handleMouseLeave = () => {
    // Reset positions on leave
    x.set(0);
    y.set(0);
    txX.set(0);
    txY.set(0);
  };

  const baseClasses = `
    inline-flex items-center justify-center font-display font-black 
    transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none 
    relative overflow-hidden group/btn active:scale-95 border uppercase 
    tracking-[0.15em] select-none rounded-[100px] hover:rounded-none 
    px-6 py-2.5 text-[10px] cursor-pointer z-10
  `;

  const variants = {
    primary: 'bg-primary text-black border-primary/25 hover:border-primary shadow-[0_0_20px_rgba(190,194,255,0.2)] hover:shadow-[0_0_40px_rgba(190,194,255,0.4)]',
    secondary: 'bg-transparent text-primary border-primary/25 hover:border-primary hover:bg-primary/5',
    black: 'bg-black/90 text-white border-white/10 hover:border-white/30 hover:bg-black shadow-[0_0_20px_rgba(0,0,0,0.4)]',
  };

  const selectedVariantClass = variants[variant] || variants.primary;

  const innerContent = (
    <>
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundBlendMode: 'soft-light'
        }}
      />
      
      {/* Hover Grid Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-30 transition-all duration-500 pointer-events-none overflow-hidden rounded-[inherit]">
        <motion.div 
          className="absolute inset-[-100%]"
          style={{
            x: springTxX,
            y: springTxY,
            scale: 1.2,
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '16px 16px'
          }}
        />
      </div>

      <span className="relative z-10 flex items-center gap-3">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <motion.a
        ref={ref}
        href={href}
        style={{ x: springX, y: springY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={`${baseClasses} ${selectedVariantClass} ${className}`}
        {...props}
      >
        {innerContent}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`${baseClasses} ${selectedVariantClass} ${className}`}
      {...props}
    >
      {innerContent}
    </motion.button>
  );
}

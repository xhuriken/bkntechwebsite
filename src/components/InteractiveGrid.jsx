import React, { useEffect, useRef } from 'react';

/**
 * InteractiveGrid Component
 * Renders an interactive background grid that reacts to the user's mouse position.
 */
export default function InteractiveGrid() {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Static background dots pattern */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Interactive responsive grid */}
      <svg className="absolute inset-0 w-full h-full text-primary" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="lens-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" />
            <circle cx="0" cy="0" r="2" fill="currentColor" fillOpacity="0.6" />
          </pattern>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#lens-grid)"
          style={{
            maskImage: 'radial-gradient(circle 250px at var(--mouse-x, -500px) var(--mouse-y, -500px), black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle 250px at var(--mouse-x, -500px) var(--mouse-y, -500px), black 0%, transparent 100%)',
          }}
        />
      </svg>

      {/* Ambient glowing radial halo under the mouse */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: 'radial-gradient(circle 500px at var(--mouse-x, -500px) var(--mouse-y, -500px), rgba(190, 194, 255, 0.08), transparent 100%)',
        }}
      />
    </div>
  );
}

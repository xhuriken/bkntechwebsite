import React, { useEffect, useRef } from 'react';

/**
 * InteractiveGrid Component
 * Ultra-high-performance interactive background grid.
 * The SVG grid lines remain 100% static and anchored to the page background.
 * Mouse spotlight uses native SVG attribute updates (<circle cx cy>) throttled via requestAnimationFrame
 * with smooth lerp to ensure zero mouse lag, zero grid disconnection, and 100% exact visual fidelity.
 */
export default function InteractiveGrid() {
  const maskCircleRef = useRef(null);
  const haloRef = useRef(null);
  const targetPos = useRef({ x: -1000, y: -1000 });
  const currentPos = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    const updatePosition = () => {
      // Smooth lerp for buttery tracking
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;

      currentPos.current.x += dx * 0.25;
      currentPos.current.y += dy * 0.25;

      const x = currentPos.current.x;
      const y = currentPos.current.y;

      if (maskCircleRef.current) {
        maskCircleRef.current.setAttribute('cx', x);
        maskCircleRef.current.setAttribute('cy', y);
      }

      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${x - 250}px, ${y - 250}px, 0)`;
      }

      animFrameRef.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animFrameRef.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Static background dots pattern (32px x 32px) */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Static full-screen SVG Grid with Native SVG Mask */}
      <svg className="absolute inset-0 w-full h-full text-primary" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Grid pattern 64x64 anchored statically to page */}
          <pattern id="lens-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" />
            <circle cx="0" cy="0" r="2" fill="currentColor" fillOpacity="0.6" />
          </pattern>

          {/* Radial Gradient for Spotlight Fade */}
          <radialGradient id="spotlight-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Native SVG Mask containing moving circle */}
          <mask id="spotlight-mask">
            <circle
              ref={maskCircleRef}
              cx="-1000"
              cy="-1000"
              r="250"
              fill="url(#spotlight-gradient)"
            />
          </mask>
        </defs>

        {/* Static full-screen rectangle filled with lens-grid, masked by spotlight-mask */}
        <rect
          width="100%"
          height="100%"
          fill="url(#lens-grid)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Ambient glowing radial halo under the mouse (GPU translate3d) */}
      <div
        ref={haloRef}
        className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none will-change-transform opacity-15"
        style={{
          transform: 'translate3d(-1000px, -1000px, 0)',
          background: 'radial-gradient(circle at 50% 50%, rgba(190, 194, 255, 0.4), transparent 70%)',
        }}
      />
    </div>
  );
}

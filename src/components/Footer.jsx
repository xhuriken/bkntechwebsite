import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/**
 * An interactive, abstract particle-network canvas widget
 * Reacts to mouse pointer coordinates to attract nodes and draw connections.
 */
function InteractiveNetwork() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, active: false, isDragging: false });
  const shockwavesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Refined minimal color palette (Primary Lavender + Secondary Green accent)
    const colors = [
      'rgba(190, 194, 255, 0.95)', // Primary Lavender
      'rgba(190, 194, 255, 0.75)', // Primary Soft
      'rgba(78, 222, 163, 0.95)',  // Secondary Green accent
    ];

    // 32 persistent particles that remain permanently
    const numParticles = 32;
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 1.5 + 1.2,
        color: colors[i % colors.length],
        alpha: 0 // Smooth fade-in on start
      });
    }

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handleMouseDown = (e) => {
      const pos = getMousePos(e);
      mouseRef.current.active = true;
      mouseRef.current.isDragging = true;
      mouseRef.current.x = pos.x;
      mouseRef.current.y = pos.y;
    };

    const handleMouseMove = (e) => {
      const pos = getMousePos(e);
      mouseRef.current.x = pos.x;
      mouseRef.current.y = pos.y;
      mouseRef.current.active = true;
    };

    const handleMouseUp = () => {
      if (mouseRef.current.isDragging && mouseRef.current.x !== null) {
        const releaseX = mouseRef.current.x;
        const releaseY = mouseRef.current.y;

        // Shockwave expansion ring on release
        shockwavesRef.current.push({
          x: releaseX,
          y: releaseY,
          radius: 8,
          maxRadius: 150,
          opacity: 0.85,
          color: 'rgba(78, 222, 163, 1)'
        });

        // OUTWARD EXPLOSION RELEASE IMPULSE
        // Particles caught in the drag field blast outward away from release point
        const blastRadius = 140;
        particles.forEach((p) => {
          const dx = p.x - releaseX;
          const dy = p.y - releaseY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < blastRadius) {
            const force = (blastRadius - dist) / blastRadius;
            p.vx += (dx / dist) * (force * 8 + 3);
            p.vy += (dy / dist) * (force * 8 + 3);
          }
        });
      }
      mouseRef.current.isDragging = false;
    };

    const handleMouseLeave = () => {
      if (mouseRef.current.isDragging) {
        handleMouseUp();
      }
      mouseRef.current.active = false;
      mouseRef.current.isDragging = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        handleMouseDown(e);
      }
    };
    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        handleMouseMove(e);
      }
    };
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleMouseUp);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Cyberpunk subtle backdrop grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const mouse = mouseRef.current;

      // Update & Draw Release Shockwave Rings
      shockwavesRef.current = shockwavesRef.current.filter((wave) => {
        wave.radius += 4;
        wave.opacity *= 0.93;

        ctx.save();
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(78, 222, 163, ${wave.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        return wave.opacity > 0.02 && wave.radius < wave.maxRadius;
      });

      // Attraction Field Indicator when dragging (Zone de capture 110px)
      const attractRadius = 110;
      if (mouse.active && mouse.isDragging) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, attractRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(78, 222, 163, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(78, 222, 163, 0.9)';
        ctx.fill();
        ctx.restore();
      }

      // Update & Render Particles
      particles.forEach((p) => {
        // Smooth initial fade-in
        if (p.alpha < 1) p.alpha = Math.min(1, p.alpha + 0.04);

        // Smooth steering attraction when holding drag ONLY for particles within capture radius
        if (mouse.active && mouse.isDragging) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist < attractRadius) {
            // Steering force toward drag cursor while preserving velocity
            const pull = ((attractRadius - dist) / attractRadius) * 0.45;
            p.vx += (dx / dist) * pull;
            p.vy += (dy / dist) * pull;
          }
        }

        // Natural momentum friction / damping
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Ensure ambient movement speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const minSpeed = 0.35;
        if (speed < minSpeed) {
          p.vx = (p.vx / (speed || 1)) * minSpeed;
          p.vy = (p.vy / (speed || 1)) * minSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;

        // ELASTIC WALL COLLISIONS (Particules sensibles aux collisions avec les murs!)
        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx = Math.abs(p.vx) * 0.85;
        } else if (p.x + p.radius > width) {
          p.x = width - p.radius;
          p.vx = -Math.abs(p.vx) * 0.85;
        }

        if (p.y - p.radius < 0) {
          p.y = p.radius;
          p.vy = Math.abs(p.vy) * 0.85;
        } else if (p.y + p.radius > height) {
          p.y = height - p.radius;
          p.vy = -Math.abs(p.vy) * 0.85;
        }

        // Render Particle Node
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace('0.95)', `${p.alpha * 0.95})`).replace('0.75)', `${p.alpha * 0.75})`);
        ctx.fill();
        ctx.restore();
      });

      // Inter-particle network connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) {
            const alpha = ((60 - dist) / 60) * 0.2 * particles[i].alpha * particles[j].alpha;
            ctx.strokeStyle = `rgba(190, 194, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Smooth Laser tether to drag cursor
      if (mouse.active && mouse.isDragging) {
        particles.forEach((p) => {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = ((120 - dist) / 120) * 0.35 * p.alpha;
            ctx.strokeStyle = `rgba(78, 222, 163, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleMouseUp);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[180px] flex flex-col flex-grow bg-black/50 border border-white/10 rounded-xl overflow-hidden relative cursor-crosshair group select-none shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <canvas ref={canvasRef} className="w-full h-full block flex-grow" />
      <div className="absolute bottom-2 right-3 text-[9px] font-mono text-white/30 pointer-events-none group-hover:text-primary/70 transition-colors">
        [ MAINTENIR & DRAG: SUIVI ] &bull; [ RELÂCHER: EXPLOSION ]
      </div>
    </div>
  );
}

/**
 * Footer Component
 * Premium multi-column footer containing brand tagline, interactive links,
 * social connections, and legal copyright.
 */
export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-surface-container-lowest/30 backdrop-blur-md border-t border-white/5 pt-4 pb-4 px-6 md:px-12 z-10 relative mt-auto overflow-hidden">
      {/* Passive Noise Texture background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundBlendMode: 'soft-light'
        }}
      />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-1 items-stretch">
        
        {/* Part 1: Info, Links & Copyright (Left) - col-span-8 */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-8 pb-1">
          
          {/* Row 1: Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {/* Column 1: Identity & Socials */}
            <div className="md:col-span-6 flex flex-col gap-4 md:border-r border-white/5 md:pr-8 mt-4 lg:mt-6">
              <div className="flex items-center gap-1.5">
                <span className="text-primary font-bold text-xs select-none">&gt;</span>
                <span className="font-sans font-extrabold tracking-[0.2em] text-sm text-primary uppercase select-none">
                  Bkn Tech
                </span>
              </div>
              <p className="text-xs font-sans font-normal text-on-surface-variant leading-relaxed max-w-sm">
                {t('footer.description')}
              </p>
              {/* Social Icons list */}
              <div className="flex gap-4 mt-2">
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_12px_rgba(190,194,255,0.15)] hover:scale-110 transition-all duration-300 group"
                  aria-label="LinkedIn"
                >
                  <i className="fa-brands fa-linkedin-in text-xs group-hover:scale-110 transition-transform"></i>
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_12px_rgba(190,194,255,0.15)] hover:scale-110 transition-all duration-300 group"
                  aria-label="GitHub"
                >
                  <i className="fa-brands fa-github text-xs group-hover:scale-110 transition-transform"></i>
                </a>
                <a 
                  href="https://discord.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_12px_rgba(190,194,255,0.15)] hover:scale-110 transition-all duration-300 group"
                  aria-label="Discord"
                >
                  <i className="fa-brands fa-discord text-xs group-hover:scale-110 transition-transform"></i>
                </a>
                <a 
                  href="https://x.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_12px_rgba(190,194,255,0.15)] hover:scale-110 transition-all duration-300 group"
                  aria-label="Twitter X"
                >
                  <i className="fa-brands fa-x-twitter text-xs group-hover:scale-110 transition-transform"></i>
                </a>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="md:col-span-3 flex flex-col gap-4 md:border-r border-white/5 md:pr-8 mt-4 lg:mt-6">
              <div className="flex items-center gap-1.5 select-none">
                <span className="text-primary/75 font-semibold text-[9px]">&gt;</span>
                <span className="font-sans font-semibold tracking-wider text-[11px] uppercase text-primary/80">
                  {t('footer.navigation')}
                </span>
              </div>
              <ul className="flex flex-col gap-2.5 font-sans font-medium text-xs text-on-surface-variant">
                <li>
                  <Link to="/#home" className="hover:text-primary hover:translate-x-1.5 transition-all duration-150 flex items-center gap-1">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link to="/portfolio" className="hover:text-primary hover:translate-x-1.5 transition-all duration-150 flex items-center gap-1">
                    {t('nav.portfolio')}
                  </Link>
                </li>
                <li>
                  <Link to="/#contact" className="hover:text-primary hover:translate-x-1.5 transition-all duration-150 flex items-center gap-1">
                    {t('nav.contact')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal Links */}
            <div className="md:col-span-3 flex flex-col gap-4 md:pl-2 mt-4 lg:mt-6">
              <div className="flex items-center gap-1.5 select-none">
                <span className="text-primary/75 font-semibold text-[9px]">&gt;</span>
                <span className="font-sans font-semibold tracking-wider text-[11px] uppercase text-primary/80">
                  {t('footer.juridique')}
                </span>
              </div>
              <ul className="flex flex-col gap-2.5 font-sans font-medium text-xs text-on-surface-variant">
                <li>
                  <Link to="/mentions-legales" className="hover:text-primary hover:translate-x-1.5 transition-all duration-150 flex items-center gap-1">
                    {t('footer.mentions_legales')}
                  </Link>
                </li>
                <li>
                  <Link to="/politique-de-confidentialite" className="hover:text-primary hover:translate-x-1.5 transition-all duration-150 flex items-center gap-1">
                    {t('footer.politique_confidentialite')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Row 2: Bottom copyright / authors inside Part 1 */}
          <div className="pt-6 pb-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-on-surface-variant/40 text-[10px] uppercase tracking-wider font-sans font-medium mb-1">
            <div>
              BKN TECH &copy; {new Date().getFullYear()} &mdash; {t('footer.rights')}
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant/60 font-sans font-semibold normal-case">
              Enrique Puerto, Célestin Honvault
            </div>
          </div>

        </div>

        {/* Part 2: Interactive Cyberpunk Vector Node Canvas (Right) - col-span-4 */}
        <div className="lg:col-span-4 flex">
          <InteractiveNetwork />
        </div>

      </div>
    </footer>
  );
}

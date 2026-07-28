import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/**
 * An interactive, abstract particle-network canvas widget
 * Reacts to mouse pointer coordinates to attract nodes and draw connections.
 */
function InteractiveNetwork() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, active: false });

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

    const numParticles = 25;
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.8
      });
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Cyberpunk grid backdrop lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 20;
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
      
      // Update & Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 80) {
            const force = (80 - dist) / 80;
            p.x += (dx / dist) * force * 0.7;
            p.y += (dy / dist) * force * 0.7;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(190, 194, 255, 0.25)'; // primary color faded
        ctx.fill();
      });

      // Connections between particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < numParticles; i++) {
        for (let j = i + 1; j < numParticles; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 50) {
            const alpha = ((50 - dist) / 50) * 0.12;
            ctx.strokeStyle = `rgba(190, 194, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Connection to mouse
      if (mouse.active) {
        particles.forEach((p) => {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 75) {
            const alpha = ((75 - dist) / 75) * 0.2;
            ctx.strokeStyle = `rgba(78, 222, 163, ${alpha})`; // secondary color (green) accent
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
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[95px] md:h-[105px] bg-black/45 border border-white/5 rounded-xl overflow-hidden relative cursor-crosshair">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-2 left-3 font-mono text-[7px] uppercase tracking-wider text-on-surface-variant/40 pointer-events-none select-none">
        Interactive Node Grid v1.0.3
      </div>
      <div className="absolute bottom-2 right-3 font-mono text-[7px] uppercase tracking-wider text-on-surface-variant/30 pointer-events-none select-none flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-secondary animate-pulse" />
        Active
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
    <footer className="w-full bg-surface-container-lowest/30 backdrop-blur-md border-t border-white/5 pt-16 pb-8 px-6 md:px-12 z-10 relative mt-auto overflow-hidden">
      {/* Passive Noise Texture background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundBlendMode: 'soft-light'
        }}
      />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
        
        {/* Column 1: Identity & Socials */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-primary font-bold text-xs select-none">&gt;</span>
            <span className="font-sans font-extrabold tracking-[0.2em] text-sm text-primary uppercase select-none">
              Bkn Tech
            </span>
          </div>
          <p className="text-xs font-sans font-normal text-on-surface-variant leading-relaxed max-w-sm">
            Ingénierie de plateformes sur mesure & développement de jeux multijoueurs. Excellence technique & esthétique.
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
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 select-none">
            <span className="text-primary/75 font-semibold text-[9px]">&gt;</span>
            <span className="font-sans font-semibold tracking-wider text-[11px] uppercase text-primary/80">
              Navigation
            </span>
          </div>
          <ul className="flex flex-col gap-2.5 font-sans font-medium text-xs text-on-surface-variant">
            <li>
              <Link to="/#home" className="hover:text-primary hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/portfolio" className="hover:text-primary hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1">
                Portfolio
              </Link>
            </li>
            <li>
              <Link to="/#contact" className="hover:text-primary hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal Links */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 select-none">
            <span className="text-primary/75 font-semibold text-[9px]">&gt;</span>
            <span className="font-sans font-semibold tracking-wider text-[11px] uppercase text-primary/80">
              Juridique
            </span>
          </div>
          <ul className="flex flex-col gap-2.5 font-sans font-medium text-xs text-on-surface-variant">
            <li>
              <Link to="/mentions-legales" className="hover:text-primary hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1">
                Mentions Légales
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-primary hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1">
                Politique de Confidentialité
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Interactive Cyberpunk Vector Node Canvas */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <InteractiveNetwork />
        </div>

      </div>

      {/* Bottom Row */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-on-surface-variant/40 text-[10px] uppercase tracking-wider font-sans font-medium">
        <div>
          BKN TECH &copy; {new Date().getFullYear()} &mdash; TOUS DROITS RÉSERVÉS.
        </div>
        <div className="flex items-center gap-1.5 text-on-surface-variant/60 font-sans font-semibold normal-case">
          Enrique Puerto, Célestin Honvault
        </div>
      </div>
    </footer>
  );
}

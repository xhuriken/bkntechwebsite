import React, { useEffect, useRef } from 'react';

/**
 * InteractiveNetwork Canvas Component
 * Minimalist, tactile 2D interactive particle network with elastic wall collisions,
 * smooth drag steering attraction within 110px radius, and explosion blast impulse on release.
 */
export default function InteractiveNetwork({ className = '' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, active: false, isDragging: false });
  const shockwavesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

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
    <div ref={containerRef} className={`w-full h-full min-h-[180px] flex flex-col flex-grow bg-black/50 border border-white/10 rounded-xl overflow-hidden relative cursor-crosshair group select-none shadow-[0_0_20px_rgba(0,0,0,0.5)] ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block flex-grow" />
      <div className="absolute bottom-2 right-3 text-[9px] font-mono text-white/30 pointer-events-none group-hover:text-primary/70 transition-colors">
        [ MAINTENIR & DRAG: SUIVI ] &bull; [ RELÂCHER: EXPLOSION ]
      </div>
    </div>
  );
}

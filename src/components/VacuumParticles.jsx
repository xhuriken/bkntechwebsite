import React, { useEffect, useRef } from "react";

/**
 * VacuumParticles
 * Canvas-based particle system. Particles spawn at the screen edges (bias toward
 * bottom and corners) with slight noise and are slowly attracted
 * toward a DOM ref target (the "A" in "Vacuum Protocol").
 *
 * @param {React.RefObject} targetRef  - ref attached to the DOM element acting as suction point
 */
export default function VacuumParticles({ targetRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];
    let frameCount = 0;

    // ─── Resize ────────────────────────────────────────────────────────────
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ─── Target position (viewport-relative) ─────────────────────────────
    const getTarget = () => {
      if (targetRef && targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
      return { x: canvas.width / 2, y: canvas.height * 0.25 };
    };

    // ─── Spawn helpers ─────────────────────────────────────────────────────
    const randomEdge = () => {
      const r = Math.random();
      const w = canvas.width;
      const h = canvas.height;

      if (r < 0.50) {
        // Bottom edge — full width
        return { x: Math.random() * w, y: h + 8 + Math.random() * 6 };
      } else if (r < 0.70) {
        // Left edge
        return { x: -8 - Math.random() * 6, y: Math.random() * h };
      } else if (r < 0.90) {
        // Right edge
        return { x: w + 8 + Math.random() * 6, y: Math.random() * h };
      } else {
        // Top edge
        return { x: Math.random() * w, y: -8 - Math.random() * 6 };
      }
    };

    const spawnParticle = () => {
      const { x, y } = randomEdge();
      const size = Math.random() * 4 + 0.4;
      const baseOpacity = Math.random() * 0.35 + 0.08;

      const rng = Math.random();
      let colorBase;
      if (rng < 0.55) colorBase = "240, 240, 255";
      else if (rng < 0.82) colorBase = "190, 194, 255";
      else colorBase = "78,  222, 163";

      return {
        x, y,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size,
        baseOpacity,
        colorBase,
        noiseAngle: Math.random() * Math.PI * 2,
        noiseSpeed: Math.random() * 0.18 + 0.06,
      };
    };

    // ─── Animation constants ───────────────────────────────────────────────
    const MAX_PARTICLES = 300; // Plus de particules pour un effet plus dense
    const SPAWN_EVERY = 4; // Spawn plus rapide pour maintenir un flux continu
    const ATTRACT_BASE = 0.005;
    const ATTRACT_NEAR = 0.5;
    const NOISE_STRENGTH = 0.02;
    const DAMPING = 0.98;
    const VANISH_RADIUS = 4; // Disparition ultra-proche du centre
    const FADE_START_DIST = 25; // Commence à s'estomper uniquement à l'impact

    // ─── Main loop ────────────────────────────────────────────────────────
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const target = getTarget();
      frameCount++;

      if (frameCount % SPAWN_EVERY === 0 && particles.length < MAX_PARTICLES) {
        particles.push(spawnParticle());
      }

      particles = particles.filter(p => {
        // Noise walk
        p.noiseAngle += (Math.random() - 0.5) * p.noiseSpeed;
        p.vx += Math.cos(p.noiseAngle) * NOISE_STRENGTH;
        p.vy += Math.sin(p.noiseAngle) * NOISE_STRENGTH;

        // Attraction toward target
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;

        // Force d'aspiration exponentielle : plus la particule est proche, plus elle accélère
        const proximity = Math.max(0, 1 - dist / 800);
        const attractForce = ATTRACT_BASE + (proximity * ATTRACT_NEAR) + (10 / (dist + 5));
        p.vx += (dx / dist) * attractForce;
        p.vy += (dy / dist) * attractForce;

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Position update
        p.x += p.vx;
        p.y += p.vy;

        // Remove if absorbed
        if (dist < VANISH_RADIUS) return false;

        // Opacity fade-out approaching target (uniquement très proche)
        const fadeFactor = Math.min(dist / FADE_START_DIST, 1);
        const opacity = p.baseOpacity * fadeFactor;
        if (opacity < 0.002) return false;

        // Draw core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorBase}, ${opacity})`;
        ctx.fill();

        // Draw soft outer halo (10x faster than shadowBlur)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorBase}, ${opacity * 0.25})`;
        ctx.fill();

        return true;
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

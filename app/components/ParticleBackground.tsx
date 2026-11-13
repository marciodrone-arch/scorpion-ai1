'use client';

import { useEffect, useRef } from 'react';

type Particle = { x: number; y: number; vx: number; vy: number; radius: number; phase: number };

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let width = 0;
    let height = 0;
    let motionScale = reducedMotion.matches ? 0.5 : 1;
    let particles: Particle[] = [];

    const createParticles = () => {
      const area = width * height;
      const count = Math.max(55, Math.min(125, Math.round(area / 10500)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        // Gentle, continuous drift; still moves when the OS requests reduced motion.
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.35 + 0.85,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      createParticles();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const time = performance.now() * 0.00035;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx * motionScale;
        p.y += p.vy * motionScale;
        if (p.x < -8 || p.x > width + 8) p.vx *= -1;
        if (p.y < -8 || p.y > height + 8) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 145) {
            const alpha = (1 - distance / 145) * 0.22;
            context.beginPath();
            context.strokeStyle = 'rgba(56, 189, 248, ' + alpha + ')';
            context.lineWidth = 0.85;
            context.moveTo(p.x, p.y);
            context.lineTo(q.x, q.y);
            context.stroke();
          }
        }

        const pulse = 0.78 + Math.sin(time + p.phase) * 0.22;
        context.beginPath();
        context.fillStyle = 'rgba(125, 230, 255, ' + (0.72 * pulse) + ')';
        context.shadowColor = 'rgba(34, 211, 238, 0.9)';
        context.shadowBlur = 11;
        context.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
        context.fill();
      }
      context.shadowBlur = 0;
      frame = window.requestAnimationFrame(draw);
    };

    const updateMotion = () => {
      // Reduce the drift for accessibility, but do not freeze the background.
      motionScale = reducedMotion.matches ? 0.5 : 1;
    };

    resize();
    frame = window.requestAnimationFrame(draw);
    reducedMotion.addEventListener('change', updateMotion);
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      reducedMotion.removeEventListener('change', updateMotion);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 18% 24%, rgba(8,145,178,0.13), transparent 42%), radial-gradient(ellipse at 82% 72%, rgba(37,99,235,0.12), transparent 46%)',
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] opacity-100"
      />
    </>
  );
}

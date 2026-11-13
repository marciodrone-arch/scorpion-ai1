'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let running = !reducedMotion.matches;

    const createParticles = () => {
      const area = width * height;
      const count = Math.max(24, Math.min(68, Math.round(area / 24000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.25 + 0.55,
      }));
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      createParticles();
      if (!running) draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];
        if (running) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < -4 || particle.x > width + 4) particle.vx *= -1;
          if (particle.y < -4 || particle.y > height + 4) particle.vy *= -1;
        }

        for (let j = i + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 112) {
            context.beginPath();
            context.strokeStyle = `rgba(56, 189, 248, ${(1 - distance / 112) * 0.12})`;
            context.lineWidth = 0.7;
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }

        context.beginPath();
        context.fillStyle = 'rgba(103, 232, 249, 0.42)';
        context.shadowColor = 'rgba(34, 211, 238, 0.45)';
        context.shadowBlur = 7;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      context.shadowBlur = 0;
      if (running) animationFrame = window.requestAnimationFrame(draw);
    };

    const handleMotionPreference = () => {
      running = !reducedMotion.matches;
      window.cancelAnimationFrame(animationFrame);
      if (running) animationFrame = window.requestAnimationFrame(draw);
      else draw();
    };

    resize();
    if (running) animationFrame = window.requestAnimationFrame(draw);
    reducedMotion.addEventListener('change', handleMotionPreference);
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      reducedMotion.removeEventListener('change', handleMotionPreference);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-80"
    />
  );
}

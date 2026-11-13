'use client';

import type { CSSProperties } from 'react';

const PARTICLE_COUNT = 48;

export default function ParticleBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 18% 24%, rgba(8,145,178,0.13), transparent 42%), radial-gradient(ellipse at 82% 72%, rgba(37,99,235,0.12), transparent 46%)' }} />
      {Array.from({ length: PARTICLE_COUNT }, (_, index) => {
        const x = ((index * 47 + 11) % 97) + 1;
        const y = ((index * 29 + 7) % 93) + 2;
        const size = index % 7 === 0 ? 3 : index % 3 === 0 ? 2.4 : 1.7;
        const duration = 19 + (index % 13) * 2.1;
        const delay = -((index * 3) % 31);
        const driftX = index % 2 === 0 ? '34px' : `${-34 + (index % 5) * 5}px`;
        const driftY = index % 3 === 0 ? '-42px' : `${30 - (index % 4) * 8}px`;
        const style = {
          left: `${x}%`, top: `${y}%`, width: `${size}px`, height: `${size}px`,
          animationDuration: `${duration}s`, animationDelay: `${delay}s`,
          '--drift-x': driftX, '--drift-y': driftY,
        } as CSSProperties;
        return <span key={index} className="scorpion-particle" style={style} />;
      })}
    </div>
  );
}
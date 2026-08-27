import React from 'react';
import { clsx } from 'clsx';

export const FlowerOfLifeLogo = ({ className, animate = false }: { className?: string; animate?: boolean }) => {
  const r = 16;
  const sqrt3 = Math.sqrt(3);
  const centers = [
    [0, 0],
    // Ring 1
    [0, -r], [r * sqrt3/2, -r/2], [r * sqrt3/2, r/2], [0, r], [-r * sqrt3/2, r/2], [-r * sqrt3/2, -r/2],
    // Ring 2
    [0, -2*r], [r * sqrt3, -r], [r * sqrt3, r], [0, 2*r], [-r * sqrt3, r], [-r * sqrt3, -r],
    [r * sqrt3/2, -1.5*r], [r * sqrt3, 0], [r * sqrt3/2, 1.5*r], [-r * sqrt3/2, 1.5*r], [-r * sqrt3, 0], [-r * sqrt3/2, -1.5*r]
  ];

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={clsx(className, animate && "animate-[spin_20s_linear_infinite]")}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE57F" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#AA771C" />
        </linearGradient>
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComponentTransfer in="blur" result="glow">
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="circleClip">
          <circle cx="0" cy="0" r={r * 2} />
        </clipPath>
      </defs>
      
      <g transform="translate(50, 50)" filter="url(#goldGlow)">
        {/* Outer boundary circles */}
        <circle cx="0" cy="0" r={r * 2} stroke="url(#goldGradient)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r={r * 2 + 2} stroke="url(#goldGradient)" strokeWidth="0.5" />
        
        {/* Inner intersecting circles */}
        <g clipPath="url(#circleClip)">
          {centers.map((c, i) => (
            <circle key={i} cx={c[0]} cy={c[1]} r={r} stroke="url(#goldGradient)" strokeWidth="0.75" />
          ))}
        </g>
      </g>
    </svg>
  );
};

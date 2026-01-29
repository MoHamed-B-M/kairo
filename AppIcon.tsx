import React from 'react';

interface AppIconProps {
  size?: number;
  className?: string;
}

const AppIcon: React.FC<AppIconProps> = ({ size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
         {/* Soft shadow for 3D elevation */}
         <filter id="icon-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="8" result="offsetblur" />
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.15"/>
            </feComponentTransfer>
            <feMerge> 
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/> 
            </feMerge>
        </filter>
        
        {/* Subtle surface gradient */}
        <linearGradient id="icon-surface" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
             <stop offset="0%" stopColor="var(--wove-light)" stopOpacity="0.5" />
             <stop offset="100%" stopColor="var(--wove-bg)" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Decorative Background Shape (Rotated for dynamic feel) */}
      <rect 
        x="25" y="25" width="60" height="60" rx="18" 
        transform="rotate(-12 55 55)" 
        fill="var(--wove-text)" 
        opacity="0.08"
      />

      {/* Main Container Shape (Squircle) */}
      <g filter="url(#icon-shadow)">
        <rect 
            x="15" y="15" width="70" height="70" rx="20" 
            fill="var(--wove-bg)"
            className="transition-colors duration-300"
        />
        {/* Inner Gradient Overlay */}
        <rect 
            x="15" y="15" width="70" height="70" rx="20" 
            fill="url(#icon-surface)"
        />
        {/* Border Ring */}
        <rect 
            x="15" y="15" width="70" height="70" rx="20" 
            stroke="var(--wove-dim)" 
            strokeWidth="1"
            strokeOpacity="0.3"
        />
      </g>

      {/* Central Graphic: The Timer Concept */}
      <g transform="translate(50 50)">
          {/* Outer Ring Track */}
          <circle cx="0" cy="0" r="18" stroke="var(--wove-dim)" strokeWidth="4" strokeOpacity="0.3" />
          
          {/* Active Progress Arc */}
          <path 
            d="M0 -18 A 18 18 0 0 1 12.7 12.7" 
            stroke="var(--wove-text)" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />
          
          {/* Center Dot */}
          <circle cx="0" cy="0" r="3" fill="var(--wove-text)" />
      </g>
      
      {/* Specular Highlight (Glossy feel) */}
      <path 
        d="M25 25 Q 50 20 75 25" 
        stroke="white" 
        strokeWidth="2" 
        strokeOpacity="0.3" 
        fill="none"
        transform="translate(0 5)"
      />

    </svg>
  );
};

export default AppIcon;
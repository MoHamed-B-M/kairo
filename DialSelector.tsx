import React, { useRef, useEffect, useState } from 'react';
import { FocusMode } from '../types';
import { DIAL_RADIUS, ITEM_ANGLE_GAP } from '../constants';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/sound';

interface DialSelectorProps {
  items: FocusMode[];
  activeIndex: number;
  onChange: (index: number) => void;
  onSelect: () => void;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

const DialSelector: React.FC<DialSelectorProps> = ({ items, activeIndex, onChange, onSelect, soundEnabled, hapticsEnabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedAnim, setSelectedAnim] = useState<number | null>(null);
  
  // Touch state for mobile swipe gestures
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  // Handle Wheel/Trackpad scroll
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (Math.abs(e.deltaY) > 10 || Math.abs(e.deltaX) > 10) {
      const direction = (e.deltaY + e.deltaX) > 0 ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(items.length - 1, activeIndex + direction));
      if (nextIndex !== activeIndex) {
        onChange(nextIndex);
        triggerHaptic('selection', hapticsEnabled);
        playSound('tick', soundEnabled);
      }
    }
  };
  
  // Handle Touch Events (Mobile Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const deltaX = touchStartRef.current.x - e.touches[0].clientX;
    const deltaY = touchStartRef.current.y - e.touches[0].clientY;
    
    // Threshold for gesture (30px)
    // Positive deltaY (Swipe UP) matches Scroll DOWN (Next Item) logic naturally
    if (Math.abs(deltaY) > 30 || Math.abs(deltaX) > 30) {
        const direction = (deltaY + deltaX) > 0 ? 1 : -1;
        const nextIndex = Math.max(0, Math.min(items.length - 1, activeIndex + direction));
        
        if (nextIndex !== activeIndex) {
            onChange(nextIndex);
            triggerHaptic('selection', hapticsEnabled);
            playSound('tick', soundEnabled);
            // Reset start to current to allow continuous dragging
            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const handleSelect = (index: number) => {
      setSelectedAnim(index);
      setTimeout(() => setSelectedAnim(null), 400); // Reset animation state
      onSelect();
      triggerHaptic('medium', hapticsEnabled);
  };

  const formatDurationDisplay = (mode: FocusMode) => {
      if (mode.durationSeconds && mode.durationSeconds < 60) {
          return `${mode.durationSeconds} Seconds`;
      }
      const m = mode.minutes;
      return `${Number.isInteger(m) ? m : parseFloat(m.toFixed(1))} Minutes`;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Passive false is important for preventing default scroll on the dial
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [activeIndex, items.length, onChange, soundEnabled, hapticsEnabled]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center select-none -ml-80 md:ml-12 outline-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* The visible "Arc" line - Simplified as a large circle border */}
      <div 
        className="absolute border border-wove-dim rounded-full pointer-events-none transition-transform duration-500 ease-out animate-pulse"
        style={{
            width: `${DIAL_RADIUS * 2}px`,
            height: `${DIAL_RADIUS * 2}px`,
            left: `-${DIAL_RADIUS * 1.2}px`, // Push it off screen to create the arc
            top: '50%',
            marginTop: `-${DIAL_RADIUS}px`,
            animationDuration: '4s'
        }}
      >
          {/* Active Segment Indicator (Visual arc on the ring) */}
           <div 
            className="absolute right-0 top-1/2 -mt-8 w-1 h-16 bg-wove-text rounded-l-full transition-all duration-300"
            style={{
                transform: `translate(2px, 0)`,
                boxShadow: '0 0 20px rgba(0,0,0,0.1)'
            }}
           />
      </div>

      {/* The Active Indicator Dot (Center reference) */}
      <div 
        className="absolute w-3 h-3 bg-wove-text rounded-full z-10 shadow-lg animate-pulse"
        style={{
            left: `${DIAL_RADIUS * 0.8 - 5}px`, // Align with the arc edge visually
            animationDuration: '3s'
        }}
      />

      {/* Items */}
      {items.map((item, index) => {
        // Calculate relative index to center
        const relativeIndex = index - activeIndex;
        // Calculate angle. 0 is center right. 
        const angle = relativeIndex * ITEM_ANGLE_GAP;
        
        // Visibility Optimization
        if (Math.abs(angle) > 90) return null;

        // Calculate visual properties
        const isActive = index === activeIndex;
        const opacity = Math.max(0.1, 1 - Math.abs(relativeIndex) * 0.3);
        const scale = isActive ? 1.5 : 1 - Math.abs(relativeIndex) * 0.1;
        const isSelectedAnim = selectedAnim === index;
        
        return (
            <div
                key={item.id}
                className={`absolute flex items-center transition-all duration-300 ease-out cursor-pointer group ${isSelectedAnim ? 'scale-[1.8]' : ''}`}
                style={{
                    transformOrigin: `${-DIAL_RADIUS * 0.8}px center`, // Pivot around the virtual center
                    left: `${DIAL_RADIUS * 0.8}px`, // Start at the indicator
                    transform: `rotate(${angle}deg) translate(20px)`, // Rotate and push out slightly
                    opacity: opacity,
                    zIndex: isActive ? 20 : 10
                }}
                onClick={() => {
                    onChange(index);
                    triggerHaptic('selection', hapticsEnabled);
                    playSound('tick', soundEnabled);
                    if (isActive) {
                        handleSelect(index);
                    }
                }}
            >
                <span 
                    className={`font-display font-bold text-6xl tracking-tighter transition-all duration-300 hover:scale-105 ${isActive ? 'text-wove-text' : 'text-wove-dim'}`}
                    style={{ 
                        transform: `scale(${scale})`,
                        textShadow: isSelectedAnim ? '0 0 20px var(--wove-text)' : 'none',
                        filter: isSelectedAnim ? 'brightness(1.2)' : 'none'
                    }}
                >
                    {item.label}
                </span>

                {/* Description Text - Only visible for active */}
                <div 
                    className={`ml-12 max-w-[200px] transition-all duration-500 delay-100 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
                >
                    <h3 className="font-medium text-wove-text text-lg leading-tight mb-1">
                        {formatDurationDisplay(item)}
                    </h3>
                    <p className="text-sm text-wove-dim leading-snug">
                        {item.description}
                    </p>
                    
                    {isActive && (
                         <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(index);
                            }}
                            className="mt-4 px-6 py-2 border border-wove-text rounded-full text-xs uppercase tracking-widest hover:bg-wove-text hover:text-white transition-colors"
                         >
                            Start
                         </button>
                    )}
                </div>
            </div>
        );
      })}
    </div>
  );
};

export default DialSelector;
import React from 'react';

const Sparkles: React.FC = () => {
  // Generate random particles
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    animationDelay: Math.random() * 1,
    animationDuration: 1 + Math.random() * 2,
    size: 2 + Math.random() * 6,
    color: ['#FFD700', '#FFA500', '#FFFFFF', 'var(--wove-text)'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <style>{`
            @keyframes float-up {
                0% { transform: translateY(0) scale(0); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(-100px) scale(1); opacity: 0; }
            }
            @keyframes twinkle {
                0%, 100% { opacity: 0; transform: scale(0.5); }
                50% { opacity: 1; transform: scale(1.2); }
            }
        `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `twinkle ${p.animationDuration}s infinite ease-in-out ${p.animationDelay}s, float-up ${p.animationDuration * 2}s infinite linear ${p.animationDelay}s`
          }}
        />
      ))}
    </div>
  );
};

export default Sparkles;
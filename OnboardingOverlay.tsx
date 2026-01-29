import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, MousePointer2, Activity, Settings, Check, ListTodo } from 'lucide-react';

const STEPS = [
  {
    title: "Welcome to KAIRO",
    description: "A minimalist timer designed to help you achieve flow state.",
    icon: <Activity className="w-8 h-8 text-wove-text" />,
  },
  {
    title: "The Dial",
    description: "Scroll with your mouse or swipe on mobile to select your focus duration.",
    icon: <MousePointer2 className="w-8 h-8 text-wove-text" />,
  },
  {
    title: "Customize",
    description: "Access settings to toggle ambient sounds, themes, and AI insights.",
    icon: <Settings className="w-8 h-8 text-wove-text" />,
  },
  {
    title: "Task Management",
    description: "Keep track of your goals. Access your task list from the bottom right corner.",
    icon: <ListTodo className="w-8 h-8 text-wove-text" />,
  }
];

interface OnboardingOverlayProps {
    onComplete: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenOnboarding = localStorage.getItem('wove-onboarding-complete');
    if (!hasSeenOnboarding) {
      // Small delay for entrance animation
      setTimeout(() => setIsVisible(true), 500);
    }
    return () => setMounted(false);
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('wove-onboarding-complete', 'true');
    // Call callback after animation duration roughly
    setTimeout(() => onComplete(), 300);
  };

  if (!isVisible || !mounted) return null;

  const step = STEPS[currentStep];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0 pointer-events-none h-[100dvh] w-screen">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl transition-opacity pointer-events-auto" onClick={handleClose} />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-wove-bg border border-wove-dim/10 rounded-2xl shadow-2xl p-6 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-500 mb-8 sm:mb-0">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-wove-dim hover:text-wove-text transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div key={currentStep} className="p-4 bg-wove-dim/10 rounded-full animate-in zoom-in duration-300">
            {step.icon}
          </div>
          
          <div className="space-y-2 min-h-[100px]">
            <h2 className="font-display font-bold text-2xl text-wove-text">{step.title}</h2>
            <p className="text-wove-dim text-sm leading-relaxed">{step.description}</p>
          </div>

          <div className="flex items-center justify-between w-full pt-4">
             {/* Pagination Dots */}
            <div className="flex gap-2">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-wove-text' : 'w-1.5 bg-wove-dim/30'}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-wove-text text-wove-bg px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
              {currentStep === STEPS.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OnboardingOverlay;
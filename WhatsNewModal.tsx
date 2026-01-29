import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Zap, ArrowRight, Eye, MessageSquare, Music } from 'lucide-react';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 h-[100dvh] w-screen">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-xl transition-all duration-500" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-wove-bg w-full max-w-sm rounded-2xl shadow-2xl border border-wove-dim/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 flex flex-col">
        
        <div className="p-6 pb-4">
            <div className="w-12 h-12 rounded-full bg-wove-text/5 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-wove-text" />
            </div>
            
            <h2 className="text-2xl font-display font-bold text-wove-text mb-2">What's New</h2>
            <p className="text-wove-dim text-sm">We've updated KAIRO with community requested features.</p>
        </div>

        <div className="px-6 space-y-4">
             <div className="flex items-start gap-3">
                <div className="mt-1 p-1 rounded-md bg-wove-dim/10">
                    <Music size={14} className="text-wove-text" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-wove-text">Better Ambient Sound</h3>
                    <p className="text-xs text-wove-dim leading-relaxed">Ambient tracks are now louder and more reliable across different devices.</p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <div className="mt-1 p-1 rounded-md bg-wove-dim/10">
                    <MessageSquare size={14} className="text-wove-text" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-wove-text">Feedback Channel</h3>
                    <p className="text-xs text-wove-dim leading-relaxed">You can now send feedback and suggestions directly from the settings menu.</p>
                </div>
            </div>

             <div className="flex items-start gap-3">
                <div className="mt-1 p-1 rounded-md bg-wove-dim/10">
                    <Zap size={14} className="text-wove-text" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-wove-text">Performance</h3>
                    <p className="text-xs text-wove-dim leading-relaxed">Improved responsiveness and resolved audio playback issues.</p>
                </div>
            </div>
        </div>

        <div className="p-6 mt-4">
            <button 
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-wove-text text-wove-bg py-3 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
            >
                Got it <ArrowRight size={16} />
            </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default WhatsNewModal;
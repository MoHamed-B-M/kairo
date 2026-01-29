import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FocusMode, PersistedSession, TimerType, AmbientSoundType } from '../types';
import { Sun, Moon, X, Sparkles as SparklesIcon, Brain, FastForward, Loader2, ArrowRight } from 'lucide-react';
import { generateFocusTip, generateSessionInsight } from '../services/geminiService';
import { playSound, stopAlarm, playAmbientTrack, stopAmbientTrack } from '../utils/sound';
import { sendNotification } from '../utils/notifications';
import { triggerHaptic } from '../utils/haptics';
import Sparkles from './Sparkles';

interface TimerViewProps {
  mode: FocusMode;
  timerType: TimerType;
  sessionCount: number;
  onExit: () => void;
  onSkip?: () => void;
  onSwitchMode?: () => void;
  onComplete: () => void;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  ambientSound: AmbientSoundType;
  showAiTips: boolean;
  notificationsEnabled: boolean;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const TimerView: React.FC<TimerViewProps> = ({ 
    mode, 
    timerType,
    sessionCount,
    onExit, 
    onSkip,
    onSwitchMode,
    onComplete, 
    soundEnabled, 
    hapticsEnabled,
    ambientSound,
    showAiTips, 
    notificationsEnabled,
    toggleTheme,
    isDarkMode
}) => {
  // Use durationSeconds if available, otherwise calculate from minutes
  const totalDuration = mode.durationSeconds ?? mode.minutes * 60;
  
  // Initialize state
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedSessionStr = localStorage.getItem('wove-session');
    if (savedSessionStr) {
        try {
            const session: PersistedSession = JSON.parse(savedSessionStr);
            if (session.modeId === mode.id) {
                if (session.isPaused) {
                    return session.timeLeft;
                } else if (session.endTime) {
                    const now = Date.now();
                    const remaining = Math.ceil((session.endTime - now) / 1000);
                    return remaining > 0 ? remaining : 0;
                }
            }
        } catch(e) {}
    }
    return totalDuration;
  });

  const [isPaused, setIsPaused] = useState(() => {
      const savedSessionStr = localStorage.getItem('wove-session');
      if (savedSessionStr) {
          try {
              const session: PersistedSession = JSON.parse(savedSessionStr);
              if (session.modeId === mode.id) return session.isPaused;
          } catch(e) {}
      }
      return false; // Default running
  });

  const [aiTip, setAiTip] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);
  
  // New State for Post-Session Insight
  const [insight, setInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  
  const initialRun = useRef(true);
  const workerRef = useRef<Worker | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // Initial setup: Start sound and Worker Cleanup
  useEffect(() => {
    if (initialRun.current) {
        const savedSessionStr = localStorage.getItem('wove-session');
        if (!savedSessionStr) {
            playSound('start', soundEnabled);
        }
        initialRun.current = false;
    }
    
    // Cleanup function strictly for unmounting
    return () => {
        stopAlarm();
        stopAmbientTrack();
        if (workerRef.current) {
            workerRef.current.terminate();
        }
    };
  }, []); // Run once on mount/unmount

  // Ambient Sound Management
  useEffect(() => {
      if (!isPaused && !isCompleted && ambientSound !== 'OFF') {
          playAmbientTrack(ambientSound);
      } else {
          stopAmbientTrack();
      }
  }, [isPaused, isCompleted, ambientSound]);

  // AI Tip
  useEffect(() => {
    if (!showAiTips) return;
    generateFocusTip(mode.minutes).then(setAiTip);
  }, []);

  // Session Persistence Effect
  useEffect(() => {
      if (isCompleted) {
          localStorage.removeItem('wove-session');
          return;
      }
      const session: PersistedSession = {
          modeId: mode.id,
          timerType: timerType,
          endTime: endTimeRef.current,
          timeLeft: timeLeft,
          totalDuration: totalDuration,
          isPaused: isPaused,
          lastUpdated: Date.now(),
          sessionCount: sessionCount
      };
      localStorage.setItem('wove-session', JSON.stringify(session));
  }, [timeLeft, isPaused, isCompleted, mode.id, timerType, totalDuration, sessionCount]);

  // Web Worker and Timer Logic
  useEffect(() => {
    if (isCompleted) return;

    const workerCode = `
      let intervalId;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          intervalId = setInterval(() => self.postMessage('tick'), 1000);
        } else if (e.data === 'stop') {
          clearInterval(intervalId);
        }
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    workerRef.current.onmessage = () => {
      if (endTimeRef.current) {
          const now = Date.now();
          const remaining = Math.ceil((endTimeRef.current - now) / 1000);
          
          if (remaining <= 0) {
              setTimeLeft(0);
              handleComplete();
          } else {
              setTimeLeft(remaining);
          }
      }
    };

    if (!isPaused) {
        if (!endTimeRef.current) {
             endTimeRef.current = Date.now() + timeLeft * 1000;
        }
        workerRef.current.postMessage('start');
    }

    return () => {
        workerRef.current?.terminate();
    };
  }, [isPaused, isCompleted]); 

  const handleComplete = () => {
      setIsCompleted(true);
      if (workerRef.current) workerRef.current.postMessage('stop');
      localStorage.removeItem('wove-session');
      triggerHaptic('success', hapticsEnabled);
      playSound('complete', soundEnabled);
      stopAmbientTrack();
      
      if (notificationsEnabled) {
          const formattedTime = mode.durationSeconds ? 
              `${Math.floor(mode.durationSeconds / 60)}m ${mode.durationSeconds % 60}s` :
              `${mode.minutes} minute`;
          sendNotification("KAIRO", `Your ${formattedTime} session is complete.`);
      }
  };

  const handleTogglePause = () => {
    if (isPaused) {
        setIsPaused(false);
        triggerHaptic('medium', hapticsEnabled);
        playSound('start', soundEnabled);
        endTimeRef.current = null;
    } else {
        setIsPaused(true);
        triggerHaptic('medium', hapticsEnabled);
        playSound('pause', soundEnabled);
        if (workerRef.current) workerRef.current.postMessage('stop');
        endTimeRef.current = null; 
    }
  };

  const handleReset = () => {
    if (workerRef.current) workerRef.current.postMessage('stop');
    setTimeLeft(totalDuration);
    setIsPaused(true);
    setIsCompleted(false);
    triggerHaptic('warning', hapticsEnabled);
    stopAlarm();
    stopAmbientTrack();
    localStorage.removeItem('wove-session');
    endTimeRef.current = null;
    playSound('reset', soundEnabled);
  };

  const handleExit = () => {
      stopAlarm();
      stopAmbientTrack();
      localStorage.removeItem('wove-session');
      onExit();
  };

  const handleSkipBreak = () => {
    stopAlarm();
    stopAmbientTrack();
    localStorage.removeItem('wove-session');
    if (onSkip) {
        triggerHaptic('medium', hapticsEnabled);
        onSkip();
    }
  };
  
  const handleContinue = async () => {
      // 1. Stop audio immediately
      stopAlarm();
      
      // 2. Generate Insight
      setIsGeneratingInsight(true);
      const mins = mode.durationSeconds ? mode.durationSeconds / 60 : mode.minutes;
      
      const insightText = await generateSessionInsight(mins, timerType);
      
      setInsight(insightText);
      setIsGeneratingInsight(false);
  };
  
  const handleFinalClose = () => {
      localStorage.removeItem('wove-session');
      onComplete();
  }

  const handleModeSwitch = (type: TimerType) => {
      if (type !== timerType && onSwitchMode) {
          triggerHaptic('soft', hapticsEnabled);
          onSwitchMode();
      }
  };

  const handleThemeToggle = () => {
      triggerHaptic('soft', hapticsEnabled);
      toggleTheme();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
      if (isPaused) return "Paused";
      if (timerType === 'FOCUS') return "Time to focus!";
      return "Break time!";
  };

  // Define styling based on Light/Dark mode
  const cardBg = isDarkMode ? 'bg-black' : 'bg-white';
  const cardText = isDarkMode ? 'text-white' : 'text-gray-900';
  const pillBg = isDarkMode ? 'bg-zinc-800' : 'bg-gray-100';
  const pillActiveBg = isDarkMode ? 'bg-white' : 'bg-white';
  const pillActiveText = isDarkMode ? 'text-black' : 'text-black';
  const pillInactiveText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  
  const buttonBg = isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-100 hover:bg-gray-200';
  const buttonText = isDarkMode ? 'text-white' : 'text-gray-900';

  if (isCompleted) {
    return (
        <div className="fixed inset-0 bg-wove-bg z-50 flex items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden">
             <Sparkles />
             
             {/* Dynamic Card Content */}
             <div 
                className="w-full max-w-[340px] aspect-square rounded-[2.5rem] shadow-2xl flex flex-col justify-between p-8 relative z-20 transition-all duration-700 animate-in zoom-in-95 bg-gradient-to-br from-orange-100 via-rose-200 to-purple-200 dark:from-purple-900 dark:via-rose-900 dark:to-orange-900"
            >
                {insight ? (
                    // Insight View
                     <>
                        <div className="flex items-center gap-2 opacity-60 animate-in fade-in slide-in-from-bottom-2">
                             <SparklesIcon size={18} className="text-gray-800 dark:text-white" />
                             <span className="text-sm font-medium tracking-wide text-gray-800 dark:text-white">Insight</span>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-start justify-center animate-in fade-in zoom-in-95 duration-500 delay-100">
                             <p className="text-2xl font-display font-medium leading-tight text-gray-900 dark:text-white tracking-tight">
                                "{insight}"
                             </p>
                        </div>

                        <button 
                            onClick={handleFinalClose}
                            className="w-full h-14 bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-gray-900 dark:text-white font-medium text-lg hover:bg-white/40 transition-colors shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-200"
                        >
                            Done <ArrowRight size={18} className="ml-2" />
                        </button>
                    </>
                ) : (
                    // Initial Mood Check View
                    <>
                        {/* Top Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 opacity-60">
                                <Brain size={18} className="text-gray-800 dark:text-white" />
                                <span className="text-sm font-medium tracking-wide text-gray-800 dark:text-white">State of Mind</span>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col items-start justify-center">
                            <h2 className="text-4xl font-display font-bold leading-tight text-gray-900 dark:text-white mb-2 tracking-tight">
                                How you feel<br/>right now?
                            </h2>
                        </div>

                        {/* Bottom Action */}
                        <button 
                            onClick={handleContinue}
                            disabled={isGeneratingInsight}
                            className="w-full h-14 bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-gray-900 dark:text-white font-medium text-lg hover:bg-white/40 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isGeneratingInsight ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={20} /> Generating...
                                </span>
                            ) : (
                                "Log Session"
                            )}
                        </button>
                    </>
                )}
            </div>

            {/* Exit Button outside (only in first view to allow hard exit) */}
            {!insight && (
                <button 
                    onClick={handleExit} 
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-wove-dim/20 transition-colors z-10"
                >
                    <X className="w-6 h-6 text-wove-text" />
                </button>
            )}
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-wove-bg z-50 flex items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden">
      
      <style>{`
          @keyframes tick-fade {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(0.97); opacity: 0.6; }
          }
          .animate-tick {
              animation: tick-fade 0.9s ease-out forwards;
          }
      `}</style>

      {/* Exit Button (Outside Card) */}
      <button 
        onClick={handleExit} 
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-wove-dim/20 transition-colors z-10"
      >
        <X className="w-6 h-6 text-wove-text" />
      </button>

      {/* Standard Widget Card */}
      <div 
        className={`${cardBg} ${cardText} w-full max-w-[340px] aspect-square rounded-[2.5rem] shadow-2xl flex flex-col justify-between p-8 relative z-20 transition-colors duration-500`}
        style={{ boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
      >
        
        {/* Top Row */}
        <div className="flex justify-between items-center">
            {/* Focus/Rest Switch */}
            <div className={`${pillBg} rounded-full p-1.5 flex items-center transition-colors duration-500`}>
                <button 
                    onClick={() => handleModeSwitch('FOCUS')}
                    className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${timerType === 'FOCUS' ? `${pillActiveBg} ${pillActiveText} shadow-sm` : pillInactiveText}`}
                >
                    Focus
                </button>
                <button 
                    onClick={() => handleModeSwitch('BREAK')}
                    className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${timerType === 'BREAK' ? `${pillActiveBg} ${pillActiveText} shadow-sm` : pillInactiveText}`}
                >
                    Rest
                </button>
            </div>

            {/* Theme Toggle */}
            <button 
                onClick={handleThemeToggle}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
                {isDarkMode ? <Moon size={20} className="fill-current" /> : <Sun size={20} />}
            </button>
        </div>

        {/* Center Timer */}
        <div className="flex flex-col items-center justify-center flex-1 py-8">
            {/* Animation Wrapper for smooth transitions between modes */}
            <div 
                key={mode.id} 
                className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300"
            >
                {timerType === 'FOCUS' && (
                    <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
                        Session #{sessionCount}
                    </div>
                )}
                <div 
                    key={timeLeft}
                    className="font-display font-bold text-7xl tracking-tighter leading-none mb-4 tabular-nums animate-tick cursor-default select-none"
                >
                    {formatTime(timeLeft)}
                </div>
                <div className={`text-sm font-medium uppercase tracking-wide opacity-60 flex items-center gap-2`}>
                {getStatusText()}
                {ambientSound !== 'OFF' && !isPaused && (
                    <span className="flex gap-0.5 h-2 items-end">
                        <span className={`w-0.5 ${isDarkMode ? 'bg-white' : 'bg-black'} h-full animate-bounce`}></span>
                        <span className={`w-0.5 ${isDarkMode ? 'bg-white' : 'bg-black'} h-2/3 animate-bounce delay-75`}></span>
                        <span className={`w-0.5 ${isDarkMode ? 'bg-white' : 'bg-black'} h-1/2 animate-bounce delay-150`}></span>
                    </span>
                )}
                </div>
            </div>

            {/* Subtle AI Tip */}
            {showAiTips && !isPaused && (
                <div className="mt-4 text-[10px] text-center max-w-[200px] opacity-40 leading-tight animate-in fade-in duration-700">
                    {aiTip}
                </div>
            )}
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-center gap-4">
                <button 
                    onClick={handleTogglePause}
                    className={`${buttonBg} ${buttonText} px-8 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 min-w-[100px]`}
                >
                    {isPaused ? 'Start' : 'Pause'}
                </button>
                <button 
                    onClick={handleReset}
                    className={`${buttonBg} ${buttonText} px-8 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 min-w-[100px]`}
                >
                    Reset
                </button>
            </div>
            
            {/* Skip Break Button */}
            {timerType === 'BREAK' && onSkip && (
                <button 
                    onClick={handleSkipBreak}
                    className={`flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-black'} transition-colors py-1`}
                >
                    <FastForward size={14} /> Skip Break
                </button>
            )}
        </div>

        {/* Footer Credit (Inside Card) */}
        <div className="absolute bottom-3 w-full text-center left-0 opacity-20 text-[10px] pointer-events-none font-medium">
            from Hama
        </div>
      </div>

    </div>
  );
};

export default TimerView;
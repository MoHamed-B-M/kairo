import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Settings, Coffee, Brain } from 'lucide-react';
import DialSelector from './components/DialSelector';
import TimerView from './components/TimerView';
import SettingsModal from './components/SettingsModal';
import TaskList from './components/TaskList';
import OnboardingOverlay from './components/OnboardingOverlay';
import WhatsNewModal from './components/WhatsNewModal';
import AppIcon from './components/AppIcon';
import { FOCUS_MODES, BREAK_MODES, DEFAULT_SETTINGS, DARK_COLORS, LIGHT_COLORS } from './constants';
import { TimerState, AppSettings, SessionLog, TimerType, Task, PersistedSession } from './types';

export function App() {
  const [activeIndex, setActiveIndex] = useState(2); // Start at index 2 (Label 03)
  const [timerState, setTimerState] = useState<TimerState>(TimerState.IDLE);
  const [timerType, setTimerType] = useState<TimerType>('FOCUS');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  
  // Initialize settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('wove-settings');
    if (saved) {
      try { 
          // Merge with default to ensure new keys exist
          return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }; 
      } catch (e) { console.error(e); }
    }
    return DEFAULT_SETTINGS;
  });

  // Initialize history
  const [history, setHistory] = useState<SessionLog[]>(() => {
      const saved = localStorage.getItem('wove-history');
      if (saved) {
          try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
      return [];
  });

  // Initialize tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
      const saved = localStorage.getItem('wove-tasks');
      if (saved) {
          try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
      return [];
  });

  // Version Control for What's New
  const APP_VERSION = '1.4'; // Update version to force new features modal
  const checkWhatsNew = () => {
      const lastVersion = localStorage.getItem('wove-version');
      if (lastVersion !== APP_VERSION) {
          setTimeout(() => setShowWhatsNew(true), 1000);
      }
  };

  const closeWhatsNew = () => {
      setShowWhatsNew(false);
      localStorage.setItem('wove-version', APP_VERSION);
  };

  // Check on mount if we should show What's New (if onboarding is already done)
  useEffect(() => {
      const onboardingDone = localStorage.getItem('wove-onboarding-complete');
      if (onboardingDone) {
          checkWhatsNew();
      }
  }, []);

  // Calculate session count for today (Focus sessions only)
  const sessionCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    // Count completed focus sessions today + 1 for the current session
    const completedToday = history.filter(s => 
        s.timestamp >= todayTimestamp && s.type === 'FOCUS'
    ).length;
    
    return completedToday + 1;
  }, [history]);

  // Build the list of available modes, injecting custom modes if they exist
  const currentModes = useMemo(() => {
      if (timerType === 'BREAK') {
        let modes = [...BREAK_MODES];
        if (settings.customBreakDurationSeconds && settings.customBreakDurationSeconds > 0) {
            const totalSeconds = settings.customBreakDurationSeconds;
            const mins = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;
            const label = 'C';
            
            // Prepend Custom Break Mode
            modes = [{
                id: 998,
                label: label,
                minutes: totalSeconds / 60,
                durationSeconds: totalSeconds,
                description: `Custom Break: ${mins}m ${secs}s.`
            }, ...modes];
        }
        return modes;
      }
      
      let modes = [...FOCUS_MODES];
      if (settings.customDurationSeconds && settings.customDurationSeconds > 0) {
          const totalSeconds = settings.customDurationSeconds;
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;
          const label = 'C';
          
          // Prepend Custom Focus Mode (Above number 1)
          modes = [{
              id: 999,
              label: label,
              minutes: totalSeconds / 60, 
              durationSeconds: totalSeconds,
              description: `Custom ${mins}m ${secs}s session. Your personalized flow.`
          }, ...modes];
      }
      return modes;
  }, [timerType, settings.customDurationSeconds, settings.customBreakDurationSeconds]);

  // Restore Session Logic - Run once on mount
  useEffect(() => {
      const savedSessionStr = localStorage.getItem('wove-session');
      if (savedSessionStr) {
          try {
              const session: PersistedSession = JSON.parse(savedSessionStr);
              // Valid session logic: 
              // If paused, it's always valid.
              // If running, endTime must be in future (or very recently passed, handled by TimerView)
              
              // Find the mode
              let restoredModeIndex = -1;
              
              // Check current modes based on saved type
              // Note: We need to temporarily construct the correct mode list to find index
              // But strictly we just need to set state so the TimerView mounts with correct Props
              
              setTimerType(session.timerType);
              
              // Find index in the mode list corresponding to session.timerType
              // This is tricky because `currentModes` depends on `timerType` state which might not be updated yet in this render cycle
              // So we manually check against constants + settings
              let targetModes = session.timerType === 'FOCUS' ? FOCUS_MODES : BREAK_MODES;
              // (Simplification: ignoring custom mode matching for index restoration perfectly, defaulting to ID check)
              
              const idx = targetModes.findIndex(m => m.id === session.modeId);
              if (idx !== -1) {
                  setActiveIndex(idx);
                  setTimerState(session.isPaused ? TimerState.PAUSED : TimerState.RUNNING);
              } else if (session.modeId === 999 || session.modeId === 998) {
                  // Custom modes
                  setActiveIndex(0); // Custom is usually first
                  setTimerState(session.isPaused ? TimerState.PAUSED : TimerState.RUNNING);
              }

          } catch (e) {
              console.error("Failed to restore session", e);
              localStorage.removeItem('wove-session');
          }
      }
  }, []); // Empty dependency array ensures this runs once on mount

  // Apply theme colors
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--wove-bg', settings.colors.bg);
    root.style.setProperty('--wove-text', settings.colors.text);
    root.style.setProperty('--wove-dim', settings.colors.dim);
    root.style.setProperty('--wove-light', settings.colors.light);
  }, [settings.colors]);

  // Persist state
  useEffect(() => localStorage.setItem('wove-settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('wove-history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('wove-tasks', JSON.stringify(tasks)), [tasks]);

  const toggleTheme = () => {
    const isDark = !settings.darkMode;
    setSettings({
        ...settings,
        darkMode: isDark,
        colors: isDark ? DARK_COLORS : LIGHT_COLORS
    });
  };

  const handleStartTimer = () => {
    setTimerState(TimerState.RUNNING);
  };

  const handleExitTimer = () => {
    setTimerState(TimerState.IDLE);
    // Reset to Focus mode if exiting prematurely
    if (timerType === 'BREAK') {
        setTimerType('FOCUS');
        setActiveIndex(2);
    }
  };

  const handleSkipBreak = () => {
    setTimerState(TimerState.IDLE);
    setTimerType('FOCUS');
    // Default to Standard Pomodoro (usually index 2 if no custom, index 3 if custom)
    const standardIndex = currentModes.findIndex(m => m.label === '03');
    setActiveIndex(standardIndex > -1 ? standardIndex : 2);
  };

  const handleSwitchMode = () => {
      // Clear persistence for the current session to avoid state conflicts
      localStorage.removeItem('wove-session');

      if (timerType === 'FOCUS') {
          setTimerType('BREAK');
          setActiveIndex(0); // Default to first break
      } else {
          setTimerType('FOCUS');
          // Default to Standard Pomodoro (usually index 2 if no custom, index 3 if custom)
          let index = 2; // Default 03
          if (settings.customDurationSeconds > 0) index = 3;
          setActiveIndex(index);
      }
      
      // Keep timer running/re-init in new mode
      setTimerState(TimerState.RUNNING);
  };

  // Adjust activeIndex if custom mode is added/removed to keep the same item selected if possible
  // This helps when switching modes or updating settings
  useEffect(() => {
      // Ensure activeIndex is valid
      if (activeIndex >= currentModes.length) {
          setActiveIndex(0);
      }
  }, [currentModes.length, activeIndex]);
  
  const handleTimerComplete = () => {
    const currentMode = currentModes[activeIndex] || currentModes[0];
    
    // Log Session (store precise duration)
    // If durationSeconds is present, calculate minutes as float (e.g. 1.5 for 90s)
    const exactMinutes = currentMode.durationSeconds 
        ? currentMode.durationSeconds / 60 
        : currentMode.minutes;

    const newLog: SessionLog = {
        id: Date.now().toString(),
        duration: exactMinutes,
        timestamp: Date.now(),
        modeLabel: currentMode.label,
        type: timerType
    };
    setHistory(prev => [...prev, newLog]);

    // Switch Modes
    if (timerType === 'FOCUS') {
        setTimerType('BREAK');
        setActiveIndex(0); // Default to shortest break or custom break if first
    } else {
        setTimerType('FOCUS');
        // Default to Standard Pomodoro (usually index 2 if no custom, index 3 if custom)
        // A simple heuristic: if custom exists (id 999), standard is index 3. Else index 2.
        const standardIndex = currentModes.findIndex(m => m.label === '03');
        setActiveIndex(standardIndex > -1 ? standardIndex : 2);
    }

    // Auto-start logic
    if (settings.autoStartTimer) {
        setTimerState(TimerState.RUNNING);
    } else {
        setTimerState(TimerState.IDLE);
    }
  };

  // Task Handlers
  const addTask = (text: string, tag?: TimerType) => {
      const newTask: Task = { 
          id: Date.now().toString(), 
          text, 
          completed: false,
          tag: tag || timerType // Use passed tag or fallback to current mode
      };
      setTasks(prev => [...prev, newTask]);
  };
  const toggleTask = (id: string) => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };
  const deleteTask = (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
  };
  const clearCompletedTasks = () => {
      setTasks(prev => prev.filter(t => !t.completed));
  };
  const cycleTaskTag = (id: string) => {
      setTasks(prev => prev.map(t => {
          if (t.id !== id) return t;
          const newTag = t.tag === 'FOCUS' ? 'BREAK' : 'FOCUS';
          return { ...t, tag: newTag };
      }));
  };

  const activeTaskCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="relative w-full h-screen bg-wove-bg overflow-hidden flex flex-col font-sans transition-colors duration-300">
      
      <OnboardingOverlay onComplete={checkWhatsNew} />
      <WhatsNewModal isOpen={showWhatsNew} onClose={closeWhatsNew} />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-40 pointer-events-none">
        <div className="pointer-events-auto cursor-pointer flex items-center gap-3 group" onClick={() => {
             // Quick toggle for testing/utility if in idle
             if (timerState === TimerState.IDLE) {
                 setTimerType(prev => prev === 'FOCUS' ? 'BREAK' : 'FOCUS');
                 setActiveIndex(0);
             }
        }}>
            <AppIcon size={36} className="text-wove-text group-hover:scale-105 transition-transform duration-300" />
            <h1 className="font-display font-bold text-2xl tracking-widest text-wove-text">KAIRO</h1>
            {timerType === 'BREAK' && (
                <span className="text-xs bg-wove-text text-wove-bg px-2 py-1 rounded-full font-bold uppercase tracking-widest animate-in fade-in">Break</span>
            )}
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-wove-dim/20 rounded-full transition-colors text-wove-text"
                aria-label="Settings"
            >
                <Settings className="w-6 h-6" strokeWidth={1.5} />
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex items-center justify-center">
        {timerState === TimerState.IDLE && (
            <div className="w-full h-full relative animate-in fade-in duration-500 flex items-center justify-center">
                {/* Mode Indicator Background Text */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <span className="font-display font-bold text-[20vw] text-wove-text truncate">
                        {timerType}
                    </span>
                </div>
                
                <DialSelector 
                    items={currentModes}
                    activeIndex={Math.min(activeIndex, currentModes.length - 1)} // Safety check if modes list shrinks
                    onChange={setActiveIndex}
                    onSelect={handleStartTimer}
                    soundEnabled={settings.soundEnabled}
                    hapticsEnabled={settings.hapticsEnabled}
                />
            </div>
        )}

        {timerState !== TimerState.IDLE && (
            <TimerView 
                key={`${timerType}-${currentModes[activeIndex]?.id}`} // Force remount if mode changes significantly
                mode={currentModes[activeIndex] || currentModes[0]} // Fallback safety
                timerType={timerType}
                sessionCount={sessionCount}
                onExit={handleExitTimer}
                onSkip={handleSkipBreak}
                onSwitchMode={handleSwitchMode}
                onComplete={handleTimerComplete}
                soundEnabled={settings.soundEnabled}
                hapticsEnabled={settings.hapticsEnabled}
                ambientSound={settings.ambientSound}
                showAiTips={settings.showAiTips}
                notificationsEnabled={settings.notificationsEnabled}
                toggleTheme={toggleTheme}
                isDarkMode={settings.darkMode}
            />
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full p-8 flex justify-between items-end text-xs text-wove-dim z-30 pointer-events-none">
         <div className="flex flex-col gap-1 pointer-events-auto">
             <button onClick={() => {
                 setTimerType('FOCUS');
                 setActiveIndex(2);
                 setTimerState(TimerState.IDLE);
             }} className={`flex items-center gap-2 hover:text-wove-text transition-colors ${timerType === 'FOCUS' ? 'text-wove-text font-bold' : ''}`}>
                 <Brain size={14} /> Focus
             </button>
             <button onClick={() => {
                 setTimerType('BREAK');
                 setActiveIndex(0);
                 setTimerState(TimerState.IDLE);
             }} className={`flex items-center gap-2 hover:text-wove-text transition-colors ${timerType === 'BREAK' ? 'text-wove-text font-bold' : ''}`}>
                 <Coffee size={14} /> Break
             </button>
         </div>
         <div className="flex gap-4 items-center">
             {activeTaskCount > 0 && (
                 <span className="hidden sm:inline font-medium text-wove-text animate-in fade-in">
                     {activeTaskCount} Active Task{activeTaskCount !== 1 ? 's' : ''}
                 </span>
             )}
             <div>
                <span>Made by <span className="text-wove-text font-medium">Hama</span></span>
             </div>
         </div>
      </footer>

      {/* Task List (Floating) */}
      <TaskList 
        tasks={tasks}
        onAddTask={addTask}
        onDeleteTask={deleteTask}
        onToggleTask={toggleTask}
        onClearCompleted={clearCompletedTasks}
        onCycleTag={cycleTaskTag}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        history={history}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
}
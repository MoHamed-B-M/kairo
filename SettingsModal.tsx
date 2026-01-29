import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Volume2, VolumeX, RotateCcw, History, Palette, Sparkles, Brain, Bell, BellOff, Moon, Sun, Clock, Zap, ZapOff, Coffee, Music, Smartphone, Vibrate, Waves, MessageSquare, Send } from 'lucide-react';
import { AppSettings, ThemeColors, SessionLog, AmbientSoundType } from '../types';
import { DEFAULT_SETTINGS, DARK_COLORS, LIGHT_COLORS, THEMES } from '../constants';
import { requestNotificationPermission } from '../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  history: SessionLog[];
  onClearHistory: () => void;
}

const Tooltip = ({ text, children }: { text: string; children?: React.ReactNode }) => (
  <div className="group relative flex items-center">
    {children}
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-[10px] text-wove-bg bg-wove-text rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-wove-text"></div>
    </div>
  </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  history,
  onClearHistory
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'history' | 'feedback'>('general');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Feedback Form State
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleThemeSelect = (theme: typeof THEMES[0]) => {
      onUpdateSettings({
          ...settings,
          colors: theme.colors,
          darkMode: theme.type === 'dark'
      });
  };

  const toggleSound = () => {
    onUpdateSettings({
      ...settings,
      soundEnabled: !settings.soundEnabled,
    });
  };

  const toggleHaptics = () => {
    onUpdateSettings({
      ...settings,
      hapticsEnabled: !settings.hapticsEnabled,
    });
  };

  const handleAmbientChange = (type: AmbientSoundType) => {
      onUpdateSettings({
          ...settings,
          ambientSound: type
      });
  };
  
  const toggleAiTips = () => {
    onUpdateSettings({
      ...settings,
      showAiTips: !settings.showAiTips,
    });
  };

  const toggleNotifications = async () => {
    const newState = !settings.notificationsEnabled;
    if (newState) {
        const granted = await requestNotificationPermission();
        if (granted) {
            onUpdateSettings({ ...settings, notificationsEnabled: true });
        } else {
            alert("Permission denied. Please enable notifications in your browser settings.");
        }
    } else {
        onUpdateSettings({ ...settings, notificationsEnabled: false });
    }
  };

  const toggleAutoStart = () => {
      onUpdateSettings({
          ...settings,
          autoStartTimer: !settings.autoStartTimer,
      });
  };

  const toggleDarkMode = () => {
      const isDark = !settings.darkMode;
      onUpdateSettings({
          ...settings,
          darkMode: isDark,
          colors: isDark ? DARK_COLORS : LIGHT_COLORS
      });
  };

  // Helper to handle custom time changes
  const updateCustomTime = (type: 'FOCUS' | 'BREAK', minutes: number, seconds: number) => {
      const totalSeconds = (minutes * 60) + seconds;
      if (type === 'FOCUS') {
          onUpdateSettings({ ...settings, customDurationSeconds: totalSeconds });
      } else {
          onUpdateSettings({ ...settings, customBreakDurationSeconds: totalSeconds });
      }
  };

  const handleFeedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('sending');
    const formData = new FormData(e.currentTarget);
    
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData as any).toString(),
    })
    .then(() => {
        setFormStatus('success');
        setTimeout(() => setFormStatus('idle'), 3000);
        (e.target as HTMLFormElement).reset();
    })
    .catch((error) => {
        console.error(error);
        setFormStatus('error');
    });
  };

  const customFocusMinutes = Math.floor((settings.customDurationSeconds || 0) / 60);
  const customFocusSeconds = (settings.customDurationSeconds || 0) % 60;

  const customBreakMinutes = Math.floor((settings.customBreakDurationSeconds || 0) / 60);
  const customBreakSeconds = (settings.customBreakDurationSeconds || 0) % 60;

  const resetDefaults = () => {
    onUpdateSettings(DEFAULT_SETTINGS);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ToggleSwitch = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${active ? 'bg-wove-text' : 'bg-wove-dim'}`}
        aria-pressed={active}
        style={{ opacity: active ? 1 : 0.4 }} 
    >
        <div className={`w-4 h-4 rounded-full bg-wove-bg shadow-sm transform transition-transform duration-200 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 h-[100dvh] w-screen">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-xl transition-all duration-300" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-wove-bg w-full max-w-md rounded-2xl shadow-2xl border border-wove-dim/20 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-wove-dim/10 bg-wove-bg sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setActiveTab('general')}
                className={`pb-1 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'general' ? 'text-wove-text border-b-2 border-wove-text' : 'text-wove-dim hover:text-wove-text'}`}
            >
                Settings
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`pb-1 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'history' ? 'text-wove-text border-b-2 border-wove-text' : 'text-wove-dim hover:text-wove-text'}`}
            >
                History
            </button>
            <button 
                onClick={() => setActiveTab('feedback')}
                className={`pb-1 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'feedback' ? 'text-wove-text border-b-2 border-wove-text' : 'text-wove-dim hover:text-wove-text'}`}
            >
                Feedback
            </button>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors text-wove-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 overflow-y-auto no-scrollbar">
          
          {activeTab === 'general' && (
            <>
                {/* Visuals Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-wove-dim">
                        <Palette size={16} />
                        <h3 className="text-sm uppercase tracking-widest font-bold">Visuals</h3>
                    </div>
                    
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between pl-6">
                        <div className="flex items-center gap-3 text-wove-text">
                            <Tooltip text="Switch between Light and Dark themes">
                                {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                            </Tooltip>
                            <span className="font-medium">Theme Mode</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-wove-dim uppercase font-bold tracking-wider">{settings.darkMode ? 'Dark' : 'Light'}</span>
                            <ToggleSwitch active={settings.darkMode} onClick={toggleDarkMode} />
                        </div>
                    </div>

                    <div className="pl-6 pt-2 border-t border-wove-dim/10">
                         <div className="text-xs text-wove-dim mb-3 uppercase tracking-wide">Select Theme</div>
                         <div className="grid grid-cols-4 gap-4">
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => handleThemeSelect(theme)}
                                    className="flex flex-col items-center gap-2 group"
                                    title={theme.label}
                                >
                                    <div 
                                        className={`w-10 h-10 rounded-full border shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 ${settings.colors.bg === theme.colors.bg && settings.colors.text === theme.colors.text ? 'ring-2 ring-wove-text ring-offset-2 ring-offset-wove-bg' : 'border-wove-dim/20'}`}
                                        style={{ backgroundColor: theme.colors.bg }}
                                    >
                                        <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: theme.colors.text }} 
                                        />
                                    </div>
                                    <span className="text-[9px] text-wove-dim font-bold uppercase tracking-wider text-center leading-none">{theme.label}</span>
                                </button>
                            ))}
                         </div>
                    </div>
                </div>

                {/* Preference Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-wove-dim">
                         <Brain size={16} />
                         <h3 className="text-sm uppercase tracking-widest font-bold">Preferences</h3>
                    </div>

                    {/* Auto-Start Toggle */}
                    <div className="flex items-center justify-between pl-6">
                        <div className="flex items-center gap-3 text-wove-text">
                            <Tooltip text="Automatically start next timer">
                                {settings.autoStartTimer ? <Zap size={20} /> : <ZapOff size={20} />}
                            </Tooltip>
                            <span className="font-medium">Auto-start Timer</span>
                        </div>
                        <ToggleSwitch active={settings.autoStartTimer} onClick={toggleAutoStart} />
                    </div>

                    {/* Custom Focus Timer */}
                     <div className="flex flex-col pl-6 gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-wove-text">
                                <Tooltip text="Set duration for custom focus mode">
                                    <Clock size={20} />
                                </Tooltip>
                                <span className="font-medium">Custom Focus</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-center">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="180"
                                        value={customFocusMinutes}
                                        onChange={(e) => updateCustomTime('FOCUS', Math.max(0, parseInt(e.target.value) || 0), customFocusSeconds)}
                                        className="w-14 bg-wove-dim/10 border-none rounded px-2 py-1 text-center font-mono text-wove-text focus:ring-1 focus:ring-wove-text"
                                        placeholder="Min"
                                    />
                                    <span className="text-[10px] text-wove-dim">min</span>
                                </div>
                                <span className="text-wove-text mb-4">:</span>
                                <div className="flex flex-col items-center">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={customFocusSeconds}
                                        onChange={(e) => updateCustomTime('FOCUS', customFocusMinutes, Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                        className="w-14 bg-wove-dim/10 border-none rounded px-2 py-1 text-center font-mono text-wove-text focus:ring-1 focus:ring-wove-text"
                                        placeholder="Sec"
                                    />
                                    <span className="text-[10px] text-wove-dim">sec</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Custom Break Timer */}
                    <div className="flex flex-col pl-6 gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-wove-text">
                                <Tooltip text="Set duration for custom break mode">
                                    <Coffee size={20} />
                                </Tooltip>
                                <span className="font-medium">Custom Break</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-center">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="60"
                                        value={customBreakMinutes}
                                        onChange={(e) => updateCustomTime('BREAK', Math.max(0, parseInt(e.target.value) || 0), customBreakSeconds)}
                                        className="w-14 bg-wove-dim/10 border-none rounded px-2 py-1 text-center font-mono text-wove-text focus:ring-1 focus:ring-wove-text"
                                        placeholder="Min"
                                    />
                                    <span className="text-[10px] text-wove-dim">min</span>
                                </div>
                                <span className="text-wove-text mb-4">:</span>
                                <div className="flex flex-col items-center">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={customBreakSeconds}
                                        onChange={(e) => updateCustomTime('BREAK', customBreakMinutes, Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                        className="w-14 bg-wove-dim/10 border-none rounded px-2 py-1 text-center font-mono text-wove-text focus:ring-1 focus:ring-wove-text"
                                        placeholder="Sec"
                                    />
                                    <span className="text-[10px] text-wove-dim">sec</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Sound Settings */}
                    <div className="flex flex-col gap-4 pl-6 pt-2 border-t border-wove-dim/10">
                        {/* SFX */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-wove-text">
                                <Tooltip text="Enable sound effects (UI, Alarms)">
                                    {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                </Tooltip>
                                <span className="font-medium">Sound Effects</span>
                            </div>
                            <ToggleSwitch active={settings.soundEnabled} onClick={toggleSound} />
                        </div>

                         {/* Haptics */}
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-wove-text">
                                <Tooltip text="Enable vibration feedback">
                                    {settings.hapticsEnabled ? <Vibrate size={20} /> : <Smartphone size={20} />}
                                </Tooltip>
                                <span className="font-medium">Haptic Feedback</span>
                            </div>
                            <ToggleSwitch active={settings.hapticsEnabled} onClick={toggleHaptics} />
                        </div>

                         {/* Ambient Music Toggle Grid */}
                         <div className="space-y-3">
                            <div className="flex items-center gap-3 text-wove-text">
                                <Tooltip text="Play generative ambient music for focus">
                                    <Music size={20} />
                                </Tooltip>
                                <span className="font-medium">Ambient Music</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'OFF', label: 'Off', icon: VolumeX },
                                    { id: 'DEEP_SPACE', label: 'Deep Space', icon: Sparkles },
                                    { id: 'SERENE_FLOW', label: 'Serene Flow', icon: Waves }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAmbientChange(option.id as AmbientSoundType)}
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                                            settings.ambientSound === option.id
                                                ? 'bg-wove-text text-wove-bg border-wove-text shadow-sm scale-[1.02]'
                                                : 'bg-transparent text-wove-dim border-wove-dim/10 hover:border-wove-text/30 hover:bg-wove-dim/5'
                                        }`}
                                    >
                                        <option.icon size={18} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between pl-6">
                        <div className="flex items-center gap-3 text-wove-text">
                            <Tooltip text="Enable desktop notifications">
                                {settings.notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                            </Tooltip>
                            <span className="font-medium">Push Notifications</span>
                        </div>
                        <ToggleSwitch active={settings.notificationsEnabled} onClick={toggleNotifications} />
                    </div>

                     {/* AI Tips Toggle */}
                     <div className="flex items-center justify-between pl-6">
                        <div className="flex items-center gap-3 text-wove-text">
                            <Tooltip text="Show AI-generated zen tips">
                                <Sparkles size={20} />
                            </Tooltip>
                            <span className="font-medium">AI Focus Insights</span>
                        </div>
                        <ToggleSwitch active={settings.showAiTips} onClick={toggleAiTips} />
                    </div>
                </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-wove-dim">
                        <History size={16} />
                        <h3 className="text-sm uppercase tracking-widest font-bold">Recent Sessions</h3>
                    </div>
                    {history.length > 0 && (
                        isConfirmingClear ? (
                            <div className="flex items-center gap-2 animate-in fade-in duration-200">
                                <span className="text-xs text-red-500 font-medium">Are you sure?</span>
                                <button 
                                    onClick={() => setIsConfirmingClear(false)} 
                                    className="text-xs text-wove-dim hover:text-wove-text px-2 py-1"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => { onClearHistory(); setIsConfirmingClear(false); }} 
                                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 font-bold"
                                >
                                    Yes, Clear
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setIsConfirmingClear(true)} className="text-xs text-red-400 hover:text-red-500 font-medium">
                                Clear History
                            </button>
                        )
                    )}
                 </div>
                 
                 <div className="space-y-3">
                    {history.length === 0 ? (
                        <p className="text-center text-wove-dim text-sm py-8 italic">No completed sessions yet.</p>
                    ) : (
                        history.slice().reverse().map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-3 bg-wove-dim/5 rounded-lg border border-wove-dim/10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${session.type === 'FOCUS' ? 'bg-wove-text' : 'bg-green-500'}`} />
                                        <span className="font-display font-bold text-wove-text">{session.modeLabel}</span>
                                        <span className="text-xs text-wove-dim uppercase tracking-wider">{session.type}</span>
                                    </div>
                                    <span className="text-xs text-wove-dim block mt-1">{formatDate(session.timestamp)}</span>
                                </div>
                                <span className="font-mono font-medium text-wove-text">
                                    {Math.floor(session.duration)}m {Math.round((session.duration % 1) * 60) > 0 ? `${Math.round((session.duration % 1) * 60)}s` : ''}
                                </span>
                            </div>
                        ))
                    )}
                 </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
                 <div className="flex items-center gap-2 text-wove-dim mb-4">
                        <MessageSquare size={16} />
                        <h3 className="text-sm uppercase tracking-widest font-bold">Send Feedback</h3>
                 </div>
                 
                 <form 
                    name="contact" 
                    method="post" 
                    data-netlify="true" 
                    onSubmit={handleFeedbackSubmit}
                    className="space-y-4"
                >
                    <input type="hidden" name="form-name" value="contact" />
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-wove-text uppercase tracking-wide">Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            required
                            className="w-full bg-wove-dim/5 border border-wove-dim/20 rounded-lg p-3 text-wove-text focus:outline-none focus:border-wove-text transition-colors"
                            placeholder="Your name"
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-wove-text uppercase tracking-wide">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            required
                            className="w-full bg-wove-dim/5 border border-wove-dim/20 rounded-lg p-3 text-wove-text focus:outline-none focus:border-wove-text transition-colors"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-wove-text uppercase tracking-wide">Message</label>
                        <textarea 
                            name="message" 
                            required
                            rows={4}
                            className="w-full bg-wove-dim/5 border border-wove-dim/20 rounded-lg p-3 text-wove-text focus:outline-none focus:border-wove-text transition-colors resize-none"
                            placeholder="Tell us what you think..."
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={formStatus === 'sending' || formStatus === 'success'}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                            formStatus === 'success' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-wove-text text-wove-bg hover:scale-[1.02]'
                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                        {formStatus === 'sending' ? (
                            'Sending...'
                        ) : formStatus === 'success' ? (
                            'Sent Successfully!'
                        ) : (
                            <>Send Feedback <Send size={16} /></>
                        )}
                    </button>
                    
                    {formStatus === 'error' && (
                        <p className="text-center text-xs text-red-500 mt-2">
                            Something went wrong. Please try again.
                        </p>
                    )}
                 </form>
            </div>
          )}

        </div>

        {/* Footer */}
        {activeTab === 'general' && (
            <div className="p-6 bg-wove-dim/5 border-t border-wove-dim/10 flex justify-end">
                <button 
                    onClick={resetDefaults}
                    className="flex items-center gap-2 text-sm text-wove-dim hover:text-wove-text transition-colors"
                >
                    <RotateCcw size={14} />
                    <span>Reset Defaults</span>
                </button>
            </div>
        )}

      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;
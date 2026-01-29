
export interface FocusMode {
  id: number;
  label: string;
  minutes: number;
  durationSeconds?: number; // Optional exact duration in seconds, takes precedence over minutes * 60
  description: string;
}

export enum TimerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export type TimerType = 'FOCUS' | 'BREAK';

export interface DialProps {
  items: FocusMode[];
  activeIndex: number;
  onChange: (index: number) => void;
  onSelect: () => void;
}

export interface ThemeColors {
  bg: string;
  text: string;
  dim: string;
  light: string;
}

export type AmbientSoundType = 'OFF' | 'DEEP_SPACE' | 'SERENE_FLOW';

export interface AppSettings {
  colors: ThemeColors;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  ambientSound: AmbientSoundType;
  showAiTips: boolean;
  notificationsEnabled: boolean;
  autoStartTimer: boolean;
  customDurationSeconds: number; // 0 means disabled. Focus timer.
  customBreakDurationSeconds: number; // 0 means disabled. Break timer.
  darkMode: boolean;
}

export interface SessionLog {
  id: string;
  duration: number;
  timestamp: number;
  modeLabel: string;
  type: TimerType;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  tag?: TimerType; // 'FOCUS' or 'BREAK'
}

export interface PersistedSession {
    modeId: number;
    timerType: TimerType;
    endTime: number | null; // If running, this is the target time
    timeLeft: number; // If paused, this is the remaining time
    totalDuration: number; // Required for progress calculation
    isPaused: boolean;
    lastUpdated: number;
    sessionCount: number;
}

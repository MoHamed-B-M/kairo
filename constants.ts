import { FocusMode, AppSettings, ThemeColors } from './types';

export const FOCUS_MODES: FocusMode[] = [
  { id: 1, label: '01', minutes: 5, description: 'Quick reset. A short breath to center yourself.' },
  { id: 2, label: '02', minutes: 10, description: 'Check emails. Clear the clutter before diving deep.' },
  { id: 3, label: '03', minutes: 25, description: 'Standard Pomodoro. Deep focus with high intensity.' },
  { id: 4, label: '04', minutes: 45, description: 'Deep Work. Extended period for complex problem solving.' },
  { id: 5, label: '05', minutes: 60, description: 'Power Hour. Uninterrupted flow state.' },
  { id: 6, label: '06', minutes: 90, description: 'Ultradian Rhythm. The maximum natural attention span.' },
];

export const BREAK_MODES: FocusMode[] = [
  { id: 101, label: 'B1', minutes: 5, description: 'Short Break. Stretch and hydrate.' },
  { id: 102, label: 'B2', minutes: 15, description: 'Long Break. Walk around or meditate.' },
  { id: 103, label: 'B3', minutes: 30, description: 'Meal Break. Refuel and disconnect.' },
];

export const DIAL_RADIUS = 390; // Increased from 360 to 390
export const ITEM_ANGLE_GAP = 20; // Degrees between items

export const LIGHT_COLORS: ThemeColors = {
    bg: '#F2F2F2',
    text: '#1A1A1A',
    dim: '#A0A0A0',
    light: '#E0E0E0',
};

export const DARK_COLORS: ThemeColors = {
    bg: '#121212',
    text: '#E0E0E0',
    dim: '#555555',
    light: '#2A2A2A',
};

export const THEMES = [
  {
    id: 'kairo_light',
    label: 'Kairo',
    type: 'light',
    colors: {
      bg: '#F2F2F2',
      text: '#1A1A1A',
      dim: '#A0A0A0',
      light: '#E0E0E0',
    }
  },
  {
    id: 'kairo_dark',
    label: 'Dark',
    type: 'dark',
    colors: {
      bg: '#121212',
      text: '#E0E0E0',
      dim: '#555555',
      light: '#2A2A2A',
    }
  },
  {
    id: 'nothing_light',
    label: 'Glyph',
    type: 'light',
    colors: {
      bg: '#FFFFFF',
      text: '#000000',
      dim: '#9ca3af',
      light: '#e5e7eb',
    }
  },
  {
    id: 'nothing_dark',
    label: 'Void',
    type: 'dark',
    colors: {
      bg: '#000000',
      text: '#FFFFFF',
      dim: '#525252',
      light: '#262626',
    }
  },
  {
    id: 'oneplus_light',
    label: 'Oxygen',
    type: 'light',
    colors: {
      bg: '#F5F5F5',
      text: '#D90025',
      dim: '#9CA3AF',
      light: '#FFFFFF',
    }
  },
   {
    id: 'oneplus_dark',
    label: 'Carbon',
    type: 'dark',
    colors: {
      bg: '#050505',
      text: '#D90025',
      dim: '#404040',
      light: '#171717',
    }
  },
  {
      id: 'midnight',
      label: 'Midnight',
      type: 'dark',
      colors: {
          bg: '#0F172A',
          text: '#38BDF8',
          dim: '#334155',
          light: '#1E293B'
      }
  },
  {
      id: 'forest',
      label: 'Forest',
      type: 'light',
      colors: {
          bg: '#F1F8F6',
          text: '#166534',
          dim: '#86EFAC',
          light: '#DCFCE7'
      }
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  colors: LIGHT_COLORS,
  soundEnabled: true,
  hapticsEnabled: true,
  ambientSound: 'OFF',
  showAiTips: true,
  notificationsEnabled: false,
  autoStartTimer: false,
  customDurationSeconds: 0,
  customBreakDurationSeconds: 0,
  darkMode: false,
};
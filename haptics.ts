
export type HapticType = 'selection' | 'success' | 'warning' | 'soft' | 'medium' | 'heavy';

export const triggerHaptic = (type: HapticType = 'selection', enabled: boolean) => {
  if (!enabled) return;
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'selection': // Dial movement, light tick
        navigator.vibrate(10);
        break;
      case 'soft': // UI toggles
        navigator.vibrate(15);
        break;
      case 'medium': // Start/Stop
        navigator.vibrate(30);
        break;
      case 'heavy': // Impact
        navigator.vibrate(50);
        break;
      case 'success': // Completion
        navigator.vibrate([50, 75, 50]);
        break;
      case 'warning': // Reset/Delete
        navigator.vibrate([20, 50, 20]);
        break;
    }
  } catch (e) {
    // Ignore errors on devices that don't support specific patterns
  }
};

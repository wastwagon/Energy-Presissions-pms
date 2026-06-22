/** Light tap feedback on supported mobile browsers (iOS 18+ Safari, Android Chrome). */
export function hapticTap(pattern: number | number[] = 10): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Vibration API unavailable or blocked
  }
}

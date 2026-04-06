/**
 * Client-side ballpark DC kWp / panel count — same math as the public solar estimate page.
 * Indicative only; not a quote.
 */
export function ballparkSizingFromMonthlyKwh(
  monthlyKwh: number,
  peakSunHours: number,
  performanceRatio: number
): { dailyKwh: number; kWp: number; panelsApprox: number } | null {
  if (
    !Number.isFinite(monthlyKwh) ||
    monthlyKwh <= 0 ||
    !Number.isFinite(peakSunHours) ||
    peakSunHours <= 0 ||
    !Number.isFinite(performanceRatio) ||
    performanceRatio <= 0
  ) {
    return null;
  }
  const dailyKwh = monthlyKwh / 30;
  const kWp = dailyKwh / (peakSunHours * performanceRatio);
  const panelsApprox = Math.max(1, Math.round((kWp * 1000) / 555));
  return { dailyKwh, kWp, panelsApprox };
}

/** Uses implied monthly kWh = daily × 30 (same convention as the bill/kWh estimator). */
export function ballparkSizingFromDailyKwh(
  dailyKwh: number,
  peakSunHours: number,
  performanceRatio: number
): { dailyKwh: number; kWp: number; panelsApprox: number } | null {
  if (!Number.isFinite(dailyKwh) || dailyKwh <= 0) return null;
  return ballparkSizingFromMonthlyKwh(dailyKwh * 30, peakSunHours, performanceRatio);
}

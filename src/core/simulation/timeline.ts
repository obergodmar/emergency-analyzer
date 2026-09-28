import type { SimulationResult } from './types';

export function timeline(result: SimulationResult, progress: number) {
  const fraction = Math.max(0, Math.min(1, progress));
  const elapsed = fraction * result.periodDays * 86400;
  const available = result.periodDays * 86400 - result.startDeathsSeconds;
  const mortalityProgress =
    available > 0
      ? Math.max(0, (elapsed - result.startDeathsSeconds) / available)
      : fraction === 1
        ? 1
        : 0;

  return {
    deaths: Math.round(result.deaths * mortalityProgress),
    victims: Math.round(result.victims * fraction),
    days: elapsed / 86400,
    radius: result.zones[2].radiusKm * fraction,
  };
}

import type { SimulationReport } from '@/core/simulation/types';

const key = 'ea-tab-reports';
export function tabReports(): SimulationReport[] {
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? '[]') as SimulationReport[];
  } catch {
    return [];
  }
}
export function cacheReport(report: SimulationReport) {
  // Storage failure must be visible: otherwise the result page would silently lose the report.
  sessionStorage.setItem(
    key,
    JSON.stringify([report, ...tabReports().filter((r) => r.id !== report.id)].slice(0, 200)),
  );
}
export function removeTabReport(id: string) {
  sessionStorage.setItem(key, JSON.stringify(tabReports().filter((r) => r.id !== id)));
}

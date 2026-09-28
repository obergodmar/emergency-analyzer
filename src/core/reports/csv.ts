import { catalog, label, lookup, type Locale } from '../catalog';
import type { SimulationReport } from '../simulation/types';

export function csvCell(value: string | number) {
  const text = String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;

  return `"${safe.replaceAll('"', '""')}"`;
}

export function reportsCsv(reports: SimulationReport[], locale: Locale) {
  const rows: (string | number)[][] = [
    locale === 'ru'
      ? [
          'ID',
          'Дата',
          'Сценарий',
          'Страна',
          'Погибшие',
          'Пострадавшие',
          'Радиус, км',
          'Модель',
          'Данные',
        ]
      : ['ID', 'Date', 'Scenario', 'Country', 'Deaths', 'Affected', 'Radius, km', 'Model', 'Data'],
  ];

  for (const r of reports)
    rows.push([
      r.id,
      r.createdAt,
      label(lookup(catalog.disastertype, r.input.type), locale),
      label(lookup(catalog.countries, r.input.countryId), locale),
      r.result.deaths,
      r.result.victims,
      r.result.zones[2].radiusKm,
      r.result.modelVersion,
      r.result.dataVersion,
    ]);

  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

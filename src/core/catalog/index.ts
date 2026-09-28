import historical from './historical.json' with { type: 'json' };

export const catalog = historical;
export type CatalogName = keyof typeof catalog;
export type Locale = 'ru' | 'en';
export type Named = { id: number; name_ru: string | null; name_en: string | null };
export const label = (item: Named, locale: Locale) =>
  item[`name_${locale}`] ?? (locale === 'ru' ? 'Метеорит' : 'Meteorite');
export function lookup<T extends { id: number }>(items: readonly T[], id: number): T {
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown catalog ID: ${id}`);
  return item;
}

export const dataVersion = 'legacy-2020';

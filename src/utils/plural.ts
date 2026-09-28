import type { Locale } from '@/core/catalog';
export function plural(
  value: number,
  locale: Locale,
  ru: readonly [string, string, string],
  en: readonly [string, string],
) {
  const n = Math.abs(Math.trunc(value));
  if (locale === 'en') return en[n === 1 ? 0 : 1];
  return ru[
    n % 100 >= 11 && n % 100 <= 14 ? 2 : n % 10 === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 ? 1 : 2
  ];
}

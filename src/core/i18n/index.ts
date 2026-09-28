import ru from './ru.json' with { type: 'json' };
import en from './en.json' with { type: 'json' };
import type { Locale } from '../catalog';

export function translate(
  locale: Locale,
  key: string,
  values: Record<string, string | number> = {},
) {
  let value: unknown = locale === 'ru' ? ru : en;
  for (const part of key.split('.')) {
    if (typeof value !== 'object' || value === null) return key;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === 'string'
    ? value.replace(/\{\{(.*?)\}\}/g, (_, name: string) => String(values[name] ?? ''))
    : key;
}

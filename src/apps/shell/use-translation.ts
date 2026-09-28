'use client';

import { translate } from '@/core/i18n';
import { usePreferences } from './preferences';

export function useTranslation() {
  const { locale } = usePreferences();

  return (key: string, values?: Record<string, string | number>) => translate(locale, key, values);
}

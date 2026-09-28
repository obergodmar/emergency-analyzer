'use client';
import { plural } from '@/utils/plural';
import { useDraft } from './draft-provider';
import { useTranslation } from '@/apps/shell/use-translation';
import { usePreferences } from '@/apps/shell/preferences';
import ui from '@/components/ui/ui.module.css';
import styles from './settings.module.css';
export function VirusConfig() {
  const { draft, setDraft } = useDraft();
  const t = useTranslation();
  const { locale } = usePreferences();
  const days = plural(draft.incubation, locale, ['день', 'дня', 'дней'], ['day', 'days']);
  return (
    <>
      <input
        className={ui.input}
        maxLength={14}
        placeholder={t('settings.virus.placeholder')}
        aria-label={t('settings.virus.placeholder')}
        value={draft.virusName}
        onChange={(e) => setDraft((d) => ({ ...d, virusName: e.target.value }))}
      />
      {(
        [
          {
            key: 'incubation',
            title: 'incubate',
            min: 1,
            max: 30,
            step: 1,
            value: `${draft.incubation} ${days}`,
          },
          {
            key: 'contagiousness',
            title: 'cont',
            min: 0.1,
            max: 1,
            step: 0.1,
            value: draft.contagiousness,
          },
        ] as const
      ).map((r) => (
        <label key={r.key} className={styles.range}>
          <span>
            <span>{t(`settings.virus.${r.title}`)}</span>
            <span>{r.value}</span>
          </span>
          <input
            type="range"
            min={r.min}
            max={r.max}
            step={r.step}
            value={draft[r.key]}
            onChange={(e) => setDraft((d) => ({ ...d, [r.key]: Number(e.target.value) }))}
          />
        </label>
      ))}
    </>
  );
}

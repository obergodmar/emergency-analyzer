'use client';
import Link from 'next/link';
import { useCurrentReport } from '@/apps/reports/current-report';
import { useDemoEvents } from './use-demo-events';
import { VscDebugStart, VscSettingsGear, VscReferences, VscReport } from '@/components/ui/icons';
import { WorldMap } from '@/components/world-map';
import { MenuItem } from '@/components/ui/menu-item';
import { Notification } from '@/components/ui/notification';
import { useTranslation } from './use-translation';
import { usePreferences } from './preferences';
import { catalog, label } from '@/core/catalog';

import notifications from '@/core/i18n/notifications.json';
import ui from '@/components/ui/ui.module.css';
import styles from './overview.module.css';
const routes = [
  ['start', VscDebugStart],
  ['settings', VscSettingsGear],
  ['references', VscReferences],
  ['reports', VscReport],
] as const;
export function Overview() {
  const t = useTranslation();
  const { locale } = usePreferences();
  const id = useCurrentReport();
  const feed = useDemoEvents();
  return (
    <>
      <div className={`${styles.map} ${feed.visible ? styles.visible : ''}`}>
        <WorldMap
          values={Object.fromEntries(feed.entries.map((e) => [e.country, e.value]))}
          texts={Object.fromEntries(feed.entries.map((e) => [e.country, e.text[locale]]))}
        />
      </div>
      <div className={`${ui.centered} ${styles.center}`}>
        <nav className={ui.container} aria-label="Emergency Analyzer">
          <Notification mode="notification" label={locale === 'ru' ? 'Обновления' : 'Updates'}>
            <div className={styles.changelog}>{notifications[locale]}</div>
          </Notification>
          <h1 className={`${ui.title} ${styles.title}`}>Emergency Analyzer</h1>
          {routes.map(([route, Icon], i) => (
            <Link
              key={route}
              href={route === 'start' && id ? `/start?id=${id}` : `/${route}`}
              aria-disabled={i === 0 && !id}
              tabIndex={i === 0 && !id ? -1 : undefined}
              className={`${styles.link} ${i === 0 && !id ? styles.disabled : ''} ${i === 1 && !id ? styles.highlight : ''}`}
            >
              <MenuItem
                title={t(`menu.${route}`)}
                description={t(`menu.description.${route}`)}
                icon={<Icon />}
              />
            </Link>
          ))}
        </nav>
      </div>
      <aside
        className={`${styles.logs} ${feed.visible ? styles.visible : ''}`}
        aria-label={t('log.title')}
      >
        <h2>{t('log.title')}</h2>
        {feed.logs.map((entry, i) => (
          <p key={i}>
            <span>[{entry.date}]</span>
            <span>
              (
              {label(
                catalog.countries.find((c) => c.code.toUpperCase() === entry.country) ?? {
                  id: 0,
                  name_ru: entry.country,
                  name_en: entry.country,
                },
                locale,
              )}
              ): {entry.text[locale]}
            </span>
          </p>
        ))}
      </aside>
    </>
  );
}

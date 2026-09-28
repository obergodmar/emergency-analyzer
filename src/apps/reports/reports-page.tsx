'use client';

import { setCurrentReport } from '@/apps/reports/current-report';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { catalog, label, lookup } from '@/core/catalog';
import type { SimulationReport } from '@/core/simulation/types';
import { reportsCsv } from '@/core/reports/csv';
import { downloadFile } from '@/utils/download';
import { usePreferences } from '@/apps/shell/preferences';
import { useTranslation } from '@/apps/shell/use-translation';
import { TopMenu } from '@/components/ui/top-menu';
import { IconButton } from '@/components/ui/icon-button';
import { ProgressBar } from '@/components/ui/loading';
import { tabReports } from './storage';
import ui from '@/components/ui/ui.module.css';
import styles from './reports.module.css';

const columns = [
  'settings.disaster.name.value',
  'reports.result.virus',
  'reports.result.virusProps',
  'settings.disaster.Atomic bomb.value',
  'settings.disaster.power.value',
  'settings.disaster.duration.value',
  'settings.disaster.scale.value',
  'settings.disaster.country.value',
  'settings.disaster.region.value',
  'reports.result.deaths',
  'reports.result.victims',
];

export function ReportsPage() {
  const { locale, t: localize } = usePreferences();
  const t = useTranslation();
  const router = useRouter();
  const [reports, setReports] = useState<SimulationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/simulations', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();

        return response.json();
      })
      .then((data) => setReports(data.persistent ? data.reports : tabReports()))
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      {loading && <ProgressBar />}
      <div className={ui.scroll}>
        <div className={`${ui.column} ${styles.column}`}>
          <TopMenu fixed>
            <h1 className={`${ui.title} ${ui.smallTitle}`}>{t('menu.reports')}</h1>
            <IconButton
              icon="download"
              label={localize('Скачать отчёты', 'Download reports')}
              disabled={!reports.length}
              onClick={() =>
                downloadFile(
                  reportsCsv(reports, locale),
                  'emergency-analyzer.csv',
                  'text/csv;charset=utf-8',
                )
              }
            />
          </TopMenu>
          {error && (
            <p role="alert" className={ui.error}>
              {localize('Не удалось загрузить отчёты.', 'Unable to load reports.')}
            </p>
          )}
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th colSpan={9}>{t('reports.result.disaster')}</th>
                  <th colSpan={2}>{t('reports.result.title')}</th>
                  <th aria-hidden="true" />
                  <th aria-hidden="true" />
                </tr>
                <tr>
                  {[...columns, 'reports.result.date', 'reports.result.start'].map((key) => (
                    <th key={key}>{t(key)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const input = report.input;
                  const cells = [
                    label(lookup(catalog.disastertype, input.type), locale),
                    input.type === 2 ? input.virus?.name : '-',
                    input.type === 2
                      ? t('reports.result.virusMeasure', {
                          inc: input.virus!.incubationDays,
                          cont: input.virus!.contagiousness,
                        })
                      : '-',
                    input.type === 1
                      ? label(lookup(catalog.atomicbomb, input.bombId), locale)
                      : '-',
                    label(lookup(catalog.lvl, input.strength), locale),
                    label(lookup(catalog.duration, input.duration), locale),
                    label(lookup(catalog.scale, input.scale), locale),
                    label(lookup(catalog.countries, input.countryId), locale),
                    input.regionId === null
                      ? '-'
                      : label(lookup(catalog.regions, input.regionId), locale),
                    report.result.deaths.toLocaleString(locale),
                    report.result.victims.toLocaleString(locale),
                    new Date(report.createdAt).toLocaleString(locale),
                  ];

                  return (
                    <tr key={report.id}>
                      {cells.map((value, i) => (
                        <td key={i}>{value}</td>
                      ))}
                      <td>
                        <IconButton
                          icon="reportsPlay"
                          label={t('reports.result.start')}
                          onClick={() => {
                            setCurrentReport(report.id);
                            router.push(`/start?id=${report.id}`);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

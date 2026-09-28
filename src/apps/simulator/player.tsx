'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { SimulationReport } from '@/core/simulation/types';
import { plural } from '@/utils/plural';
import { timeline } from '@/core/simulation/timeline';
import { usePreferences } from '@/apps/shell/preferences';
import { useTranslation } from '@/apps/shell/use-translation';
import { useCurrentReport } from '@/apps/reports/current-report';
import { tabReports } from '@/apps/reports/storage';
import { TopMenu } from '@/components/ui/top-menu';
import { IconButton } from '@/components/ui/icon-button';
import { MenuItem } from '@/components/ui/menu-item';
import { Notification } from '@/components/ui/notification';
import { Loading } from '@/components/ui/loading';
import { SimulationMap } from './simulation-map';
import { usePlayback } from './use-playback';
import ui from '@/components/ui/ui.module.css';
import styles from './player.module.css';

function Playback({ report }: { report: SimulationReport }) {
  const { t: localize, locale } = usePreferences();
  const t = useTranslation();
  const playback = usePlayback();
  const [focusRequest, setFocusRequest] = useState(0);

  const state = timeline(report.result, playback.progress);
  const done = playback.progress === 1;

  return (
    <>
      <SimulationMap
        result={report.result}
        progress={playback.progress}
        focusRequest={focusRequest}
      />
      <TopMenu>
        <h1 className={`${ui.title} ${ui.smallTitle} ${ui.notMobile}`}>{t('start.simulation')}</h1>
        <div className={ui.buttonGroup}>
          <IconButton
            icon="play"
            label={localize('Воспроизвести', 'Play')}
            disabled={done}
            onClick={() => {
              setFocusRequest((request) => request + 1);
              playback.play();
            }}
          />
          <IconButton
            icon="forward"
            label={localize('К результату', 'Show result')}
            disabled={done}
            onClick={() => {
              setFocusRequest((request) => request + 1);
              playback.finish();
            }}
          />
          <IconButton
            icon="pause"
            label={localize('Пауза', 'Pause')}
            disabled={done}
            onClick={playback.pause}
          />
          <IconButton
            icon="stop"
            label={localize('Сбросить', 'Reset')}
            attention={done}
            onClick={playback.reset}
          />
        </div>
      </TopMenu>
      <div className={styles.middle}>
        <div className={ui.container}>
          <div className={styles.result}>
            <MenuItem
              title={t('start.info.deaths', { deaths: state.deaths.toLocaleString(locale) })}
            />
            <Notification mode="error" label={localize('О результатах', 'About results')}>
              <div className={styles.notice}>
                {t('start.notification.text')}
                <br />
                <br />
                {report.result.crossesRegion && (
                  <>
                    {t('start.notification.status')}
                    <br />
                    {t('start.notification.victim', {
                      victimOnRegion: report.result.victimsOnRegion.toLocaleString(locale),
                    })}
                    <br />
                    {t('start.notification.deaths', {
                      deathsOnRegion: report.result.deathsOnRegion.toLocaleString(locale),
                    })}
                  </>
                )}
              </div>
            </Notification>
          </div>
          <div className={styles.result}>
            <MenuItem
              title={t('start.info.victim', { victim: state.victims.toLocaleString(locale) })}
            />
          </div>
          <div className={styles.result}>
            <MenuItem
              title={
                <span className={styles.time}>
                  <span>
                    {t('start.info.time', {
                      time: `${Math.floor(state.days * 1440).toLocaleString(locale)} ${plural(Math.floor(state.days * 1440), locale, ['минута', 'минуты', 'минут'], ['minute', 'minutes'])}`,
                    })}
                  </span>
                  <span>
                    {Math.floor(state.days).toLocaleString(locale)}
                    {plural(
                      Math.floor(state.days),
                      locale,
                      ['день', 'дня', 'дней'],
                      ['day', 'days'],
                    )}
                  </span>
                </span>
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ReportPlayer({ id }: { id: string | null }) {
  const { t } = usePreferences();
  const [report, setReport] = useState<SimulationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      const cached = tabReports().find((r) => r.id === id);

      if (cached) return cached;

      if (!id) return null;

      const response = await fetch(`/api/simulations/${encodeURIComponent(id)}`);

      if (!response.ok) throw new Error();

      return (await response.json()).report as SimulationReport;
    }

    load()
      .then((value) => {
        if (active) setReport(value);
      })
      .catch(() => {
        if (active) setError('unavailable');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);
  if (loading) return <Loading />;

  if (!report)
    return (
      <div className={styles.empty}>
        <h1>{t('Сценарий не найден', 'Scenario not found')}</h1>
        <p>
          {error
            ? t(
                'Отчёт недоступен или принадлежит другой сессии.',
                'The report is unavailable or belongs to another session.',
              )
            : t(
                'Сначала настройте и рассчитайте сценарий.',
                'Configure and calculate a scenario first.',
              )}
        </p>
        <Link className={ui.textButton} href="/settings">
          {t('Создать сценарий', 'Create scenario')}
        </Link>
      </div>
    );

  return <Playback key={report.id} report={report} />;
}

export function Player() {
  const current = useCurrentReport();
  const id = useSearchParams().get('id') ?? current;

  return <ReportPlayer key={id} id={id} />;
}

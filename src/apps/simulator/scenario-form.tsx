'use client';

import { setCurrentReport } from '@/apps/reports/current-report';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GiBleedingHeart,
  GiSettingsKnobs,
  GiBandaged,
  GiAbstract096,
  GiTreasureMap,
  GiMeteorImpact,
  GiMaterialsScience,
} from '@/components/ui/icons';
import { MdDataUsage } from '@/components/ui/icons';
import { FaMapMarkedAlt, FaSave } from '@/components/ui/icons';
import { catalog } from '@/core/catalog';
import { emptyDraft, toSimulationInput } from '@/core/settings/draft';
import { inputSchema } from '@/core/simulation/schema';
import { useTranslation } from '@/apps/shell/use-translation';
import { usePreferences } from '@/apps/shell/preferences';
import { cacheReport } from '@/apps/reports/storage';
import { TopMenu } from '@/components/ui/top-menu';
import { MenuItem } from '@/components/ui/menu-item';
import { ProgressBar } from '@/components/ui/loading';
import { useDraft } from './draft-provider';
import { Selection } from './selection';
import { VirusConfig } from './virus-config';
import { SettingsDescriptions } from './settings-descriptions';
import ui from '@/components/ui/ui.module.css';
import styles from './settings.module.css';

export function ScenarioForm() {
  const { draft: d, setDraft } = useDraft();
  const t = useTranslation();
  const { t: localize } = usePreferences();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const patch = (p: Partial<typeof d>) => setDraft((v) => ({ ...v, ...p }));
  const regions = catalog.regions.filter((r) => r.country === d.country);
  const featureKey = d.type === 1 ? 'Atomic bomb' : d.type === 2 ? 'Virus' : 'Asteroid';
  const featureItems =
    d.type === 1 ? catalog.atomicbomb : d.type === 2 ? catalog.classvirus : catalog.typespaceobject;
  const featureReady =
    d.type === 1
      ? d.feature !== null
      : d.type === 2
        ? d.feature !== null && !!d.virusName.trim() && d.symptoms.length > 0
        : d.type === 5
          ? d.feature !== null && d.material !== null && (d.feature === 3 || d.spaceObject !== null)
          : true;
  const ready =
    d.type &&
    d.strength &&
    d.duration &&
    d.scale &&
    d.country &&
    (!regions.length || d.region) &&
    featureReady;

  async function submit() {
    setBusy(true);
    setError('');
    try {
      const input = inputSchema.parse(toSimulationInput(d));
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error();

      const { report, persistent } = await response.json();

      if (!persistent) cacheReport(report);

      setCurrentReport(report.id);
      router.push(`/start?id=${report.id}`);
    } catch {
      setError(
        localize(
          'Не удалось рассчитать сценарий. Повторите попытку.',
          'Unable to calculate the scenario. Please try again.',
        ),
      );
      setBusy(false);
    }
  }

  const props = (key: string) => ({
    title: t(`settings.disaster.${key}.value`),
    placeholder: t(`settings.disaster.${key}.description`),
  });

  return (
    <>
      {busy && <ProgressBar />}
      <div className={ui.scroll}>
        <div className={`${ui.column} ${styles.column}`}>
          <TopMenu fixed>
            <h1 className={`${ui.title} ${ui.smallTitle}`}>{t('settings.title')}</h1>
          </TopMenu>
          <div className={`${ui.container} ${styles.menu}`}>
            <Selection
              {...props('name')}
              items={catalog.disastertype}
              value={d.type}
              onChange={(type) =>
                patch({ ...emptyDraft, type, country: d.country, region: d.region })
              }
              icon={<GiBleedingHeart />}
            />
            {d.type && (
              <>
                {[1, 2, 5].includes(d.type) && (
                  <Selection
                    {...props(featureKey)}
                    items={featureItems}
                    value={d.feature}
                    onChange={(feature) =>
                      patch({
                        feature,
                        spaceObject: null,
                        symptoms: catalog.symptoms
                          .filter((s) => s.idclass === feature)
                          .map((s) => s.id),
                      })
                    }
                    icon={<MdDataUsage />}
                    noDescription
                  />
                )}
                {d.type === 5 && d.feature !== null && (
                  <>
                    {d.feature !== 3 && (
                      <Selection
                        {...props(`Asteroid.spaceObject.${d.feature === 1 ? 'Comet' : 'Asteroid'}`)}
                        items={catalog.spaceobject.filter((x) => x.type === d.feature)}
                        value={d.spaceObject}
                        onChange={(spaceObject) => patch({ spaceObject })}
                        icon={<GiMeteorImpact />}
                      />
                    )}
                    <Selection
                      {...props('Asteroid.spaceObject.material')}
                      items={catalog.material}
                      value={d.material}
                      onChange={(material) => patch({ material })}
                      icon={<GiMaterialsScience />}
                    />
                  </>
                )}
                {d.type === 2 && d.feature !== null && <VirusConfig />}
                <Selection
                  {...props('power')}
                  items={catalog.lvl}
                  value={d.strength}
                  onChange={(strength) => patch({ strength })}
                  icon={<GiSettingsKnobs />}
                />
                {d.strength && (
                  <Selection
                    {...props('duration')}
                    items={catalog.duration}
                    value={d.duration}
                    onChange={(duration) => patch({ duration })}
                    icon={<GiBandaged />}
                  />
                )}
                {d.duration && (
                  <Selection
                    {...props('scale')}
                    items={catalog.scale}
                    value={d.scale}
                    onChange={(scale) => patch({ scale })}
                    icon={<GiAbstract096 />}
                  />
                )}
                <Selection
                  {...props('country')}
                  items={catalog.countries}
                  value={d.country}
                  onChange={(country) => patch({ country, region: null })}
                  icon={<GiTreasureMap />}
                />
                {regions.length > 0 && (
                  <Selection
                    {...props('region')}
                    items={regions}
                    value={d.region}
                    onChange={(region) => patch({ region })}
                    icon={<FaMapMarkedAlt />}
                  />
                )}
              </>
            )}
            {ready && (
              <button disabled={busy} onClick={submit} className={ui.menuButton}>
                <MenuItem
                  title={t('settings.submit.title')}
                  description={t('settings.submit.description')}
                  icon={<FaSave />}
                />
              </button>
            )}
            {error && (
              <p role="alert" className={ui.error}>
                {error}
              </p>
            )}
          </div>
        </div>
        <SettingsDescriptions />
      </div>
    </>
  );
}

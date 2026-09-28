'use client';

import { useState, type ReactNode } from 'react';
import { catalog, label } from '@/core/catalog';
import { useDraft } from './draft-provider';
import { usePreferences } from '@/apps/shell/preferences';
import { useTranslation } from '@/apps/shell/use-translation';
import { WorldMap } from '@/components/world-map';
import ui from '@/components/ui/ui.module.css';
import styles from './settings.module.css';

function Description({ children }: { children: ReactNode }) {
  return (
    <section className={styles.description}>
      <div className={ui.container}>
        <div className={styles.descriptionContent}>{children}</div>
      </div>
    </section>
  );
}

function Symptom({ id }: { id: number }) {
  const { draft, setDraft } = useDraft();
  const { locale } = usePreferences();
  const t = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const symptom = catalog.symptoms.find((s) => s.id === id)!;

  return (
    <li>
      <input
        type="checkbox"
        aria-label={label(symptom, locale)}
        checked={draft.symptoms.includes(id)}
        onChange={() =>
          setDraft((d) => ({
            ...d,
            symptoms: d.symptoms.includes(id)
              ? d.symptoms.length > 1
                ? d.symptoms.filter((s) => s !== id)
                : d.symptoms
              : [...d.symptoms, id],
          }))
        }
      />
      <span>{label(symptom, locale)}</span>
      <button className={ui.textButton} onClick={() => setExpanded(!expanded)}>
        {t('settings.disaster.further')}
      </button>
      {expanded && <p>{symptom[`description_${locale}`]}</p>}
    </li>
  );
}

export function SettingsDescriptions() {
  const { draft, setDraft } = useDraft();
  const { locale } = usePreferences();
  const t = useTranslation();

  const type = catalog.disastertype.find((x) => x.id === draft.type);

  if (!type) return null;

  const feature = (
    draft.type === 1
      ? catalog.atomicbomb
      : draft.type === 2
        ? catalog.classvirus
        : catalog.typespaceobject
  ).find((x) => x.id === draft.feature);
  const space = catalog.spaceobject.find((x) => x.id === draft.spaceObject);
  const disaster = catalog.disaster.find((x) => x.type === draft.type && x.lvl === draft.strength);
  const country = catalog.countries.find((x) => x.id === draft.country);
  const symptomIds = catalog.symptoms.filter((s) => s.idclass === draft.feature).map((s) => s.id);

  return (
    <>
      {feature && (
        <Description>
          <h2 className={`${ui.title} ${ui.smallTitle}`}>
            {label(feature, locale)}
            {draft.type === 1
              ? ` - ${catalog.atomicbomb.find((b) => b.id === draft.feature)?.[`class_${locale}`] ?? ''}`
              : ''}
            {space && space.id !== 0 ? ` ${label(space, locale)}` : ''}
          </h2>
          <p>{feature[`description_${locale}`]}</p>
          {space && <p>{space[`description_${locale}`]}</p>}
          {draft.type === 2 && (
            <>
              <div className={styles.symptomHeading}>
                <span>{t('settings.disaster.symptoms')}:</span>
                <button
                  className={ui.textButton}
                  onClick={() => setDraft((d) => ({ ...d, symptoms: symptomIds }))}
                >
                  {t('settings.disaster.selectAllSymptoms')}
                </button>
              </div>
              <ol className={styles.symptoms}>
                {symptomIds.map((id) => (
                  <Symptom id={id} key={id} />
                ))}
              </ol>
            </>
          )}
        </Description>
      )}
      <Description>
        <h2 className={`${ui.title} ${ui.smallTitle}`}>{label(type, locale)}</h2>
        {disaster && (
          <p>
            {disaster[`description_${locale}`]}.{' '}
            {[
              catalog.lvl.find((x) => x.id === draft.strength),
              catalog.duration.find((x) => x.id === draft.duration),
              catalog.scale.find((x) => x.id === draft.scale),
            ]
              .filter((x) => !!x)
              .map((x) => x[`description_${locale}`])
              .join('. ')}
          </p>
        )}
        <WorldMap
          embedded
          selected={country?.code}
          onSelect={(id) => setDraft((d) => ({ ...d, country: id, region: null }))}
        />
      </Description>
    </>
  );
}

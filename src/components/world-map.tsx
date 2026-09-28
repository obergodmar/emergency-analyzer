'use client';

import { geoMercator, geoPath } from 'd3-geo';
import { useState } from 'react';
import countries from '@/core/map/countries.json';
import { catalog, label } from '@/core/catalog';
import { usePreferences } from '@/apps/shell/preferences';
import { useWindowSize } from '@/utils/use-window-size';
import styles from './world-map.module.css';

const path = geoPath(geoMercator());
const shapes = countries.features.map((f) => ({
  code: f.I.split('_')[0].toUpperCase(),
  id: f.I,
  name: f.N,
  path: path({ type: 'MultiPolygon', coordinates: f.C }) ?? '',
}));

export function WorldMap({
  selected,
  onSelect,
  embedded = false,
  values = {},
  texts = {},
}: {
  selected?: string;
  onSelect?: (id: number) => void;
  embedded?: boolean;
  values?: Record<string, number>;
  texts?: Record<string, string>;
}) {
  const { locale, t } = usePreferences();
  const { width, height } = useWindowSize();
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  const scale = (0.7 / 480) * (embedded ? 340 : width);
  const max = Math.max(...Object.values(values), 1);
  const min = Object.keys(values).length ? Math.min(...Object.values(values)) : 0;

  return (
    <div className={embedded ? styles.embedded : styles.world}>
      <svg
        width={embedded ? 530 : width * 2}
        height={embedded ? 320 : height}
        role="img"
        aria-label={t('Карта стран мира', 'World map')}
      >
        <g
          transform={`scale(${scale}) translate(${embedded ? '50,200' : `-200,${width >= height ? width / (height || 1) : height / (width || 1)}`})`}
        >
          {shapes.map((f) => {
            const country = catalog.countries.find((c) => c.code.toUpperCase() === f.code);

            return (
              <path
                key={f.id}
                d={f.path}
                fillOpacity={
                  selected === f.code
                    ? 1
                    : values[f.code]
                      ? 0.2 + (0.6 * (values[f.code] - min)) / (max - min || 1)
                      : 0
                }
                onMouseMove={(e) => {
                  if (!onSelect && !values[f.code]) return;

                  const bounds = e.currentTarget.ownerSVGElement!.getBoundingClientRect();

                  setTip({
                    x: e.clientX - bounds.left,
                    y: e.clientY - bounds.top - 25,
                    text: `${country ? label(country, locale) : f.name} ${texts[f.code] ?? ''}`.trim(),
                  });
                }}
                onMouseLeave={() => setTip(null)}
                onClick={() => country && onSelect?.(country.id)}
              />
            );
          })}
        </g>
        {tip && (
          <g pointerEvents="none" transform={`translate(${tip.x},${tip.y})`}>
            <rect
              x={-tip.text.length * 4 - 8}
              y={-17}
              width={tip.text.length * 8 + 16}
              height={27}
              rx={4}
              fill="#151926"
            />
            <text fill="#f7f8f9" fontFamily="sans-serif" fontSize={14} textAnchor="middle">
              {tip.text}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

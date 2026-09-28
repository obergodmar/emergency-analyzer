'use client';
import { useEffect, useRef, useState } from 'react';
import type { Map as MapboxMap, GeoJSONSource } from 'mapbox-gl';
import { WorldMap } from '@/components/world-map';
import { circleCoordinates } from '@/utils/geo';
import type { SimulationResult } from '@/core/simulation/types';
import { usePreferences } from '@/apps/shell/preferences';

const colors = ['#e63946', '#e5989b', '#ffb4a2'];
const zoneFeature = (
  result: SimulationResult,
  i: number,
  fraction: number,
): GeoJSON.Feature<GeoJSON.Polygon> => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      circleCoordinates(result.latitude, result.longitude, result.zones[i].radiusKm * fraction),
    ],
  },
});
export function SimulationMap({
  result,
  progress,
  focusRequest,
}: {
  result: SimulationResult;
  progress: number;
  focusRequest: number;
}) {
  const { t, dark, locale } = usePreferences();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const progressRef = useRef(progress);
  const [readyMap, setReadyMap] = useState<MapboxMap | null>(null);
  const localeRef = useRef(locale);
  const [failed, setFailed] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !container.current) return;
    let cancelled = false;
    let instance: MapboxMap | null = null;
    setReadyMap(null);
    setFailed(false);
    import('mapbox-gl')
      .then(({ default: mapbox }) => {
        if (cancelled) return;
        instance = new mapbox.Map({
          container: container.current!,
          accessToken: token,
          style: `mapbox://styles/mapbox/${dark ? 'dark-v10' : 'light-v10'}`,
          center: [5, 34],
          zoom: 3,
        });
        map.current = instance;

        instance.on('error', () => setFailed(true));
        instance.on('load', () => {
          if (!instance || cancelled) return;
          setFailed(false);
          if (instance.getLayer('country-label'))
            instance.setLayoutProperty('country-label', 'text-field', [
              'get',
              `name_${localeRef.current}`,
            ]);
          [0, 1, 2].forEach((i) => {
            instance!.addSource(`zone-${i}`, {
              type: 'geojson',
              data: zoneFeature(result, i, progressRef.current),
            });
            instance!.addLayer({
              id: `zone-${i}`,
              type: 'fill',
              source: `zone-${i}`,
              paint: { 'fill-color': colors[i], 'fill-opacity': [0.6, 0.4, 0.2][i] },
            });
          });
          setReadyMap(instance);
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      instance?.remove();
      map.current = null;
    };
  }, [token, result, dark]);
  useEffect(() => {
    progressRef.current = progress;
    result.zones.forEach((_, i) => {
      (map.current?.getSource(`zone-${i}`) as GeoJSONSource | undefined)?.setData(
        zoneFeature(result, i, progress),
      );
    });
  }, [progress, result]);
  useEffect(() => {
    // Source updates during playback can make isStyleLoaded() temporarily false.
    // Camera movement depends on an explicit request and the initial load instead.
    if (focusRequest > 0 && readyMap && readyMap === map.current) {
      readyMap.flyTo({
        center: [result.longitude, result.latitude],
        zoom: 9,
        bearing: 0,
        speed: 1,
        curve: 1,
        easing: (t) => t,
        essential: true,
      });
    }
  }, [focusRequest, readyMap, result]);
  useEffect(() => {
    localeRef.current = locale;
    if (map.current?.isStyleLoaded() && map.current.getLayer('country-label'))
      map.current.setLayoutProperty('country-label', 'text-field', ['get', `name_${locale}`]);
  }, [locale]);
  return (
    <div className="simulation-map">
      <div className="mapbox-container" ref={container} hidden={!token || failed} />
      {(!token || failed) && (
        <>
          <WorldMap />
          <p className="map-unavailable">
            {failed
              ? t('Mapbox недоступен.', 'Mapbox is unavailable.')
              : t('Токен Mapbox не настроен.', 'Mapbox token is not configured.')}
          </p>
        </>
      )}
    </div>
  );
}

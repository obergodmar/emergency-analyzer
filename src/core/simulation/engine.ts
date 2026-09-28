import { catalog, dataVersion, lookup } from '../catalog';
import { distanceKm } from '../../utils/geo';
import { area, calculateDamage, historicalWorld } from './damage';
import { calculateRadii } from './radii';
import { inputSchema, type SimulationInput } from './schema';
import type { SimulationResult, Triple } from './types';

export function simulate(raw: SimulationInput): SimulationResult {
  const input = inputSchema.parse(raw);
  const location =
    input.regionId === null
      ? lookup(catalog.countries, input.countryId)
      : lookup(catalog.regions, input.regionId);
  const density = Math.max(0, location.density);
  const regionArea =
    'scale' in location ? location.scale : density > 0 ? location.population / density : 0;
  const { radii, period, delay } = calculateRadii(input);
  const { deaths, victims } = calculateDamage(input, radii, regionArea, density);
  // Allocate each building's finite capacity once, to its containing zone.
  for (const building of input.buildings) {
    const distance = distanceKm(
      location.latitude,
      location.longitude,
      building.latitude,
      building.longitude,
    );
    const zone = radii.findIndex((radius) => distance <= radius);
    if (zone < 0 || (input.type !== 2 && distance < radii[0] * 0.1)) continue;
    const capacity = Math.min(
      building.capacity,
      lookup(catalog.buildingtype, building.type).capacity,
    );
    if (input.type === 2 && building.type !== 1) continue;
    const saved = Math.min(deaths[zone], Math.trunc(capacity * (building.type === 2 ? 1 : 0.5)));
    deaths[zone] -= saved;
    victims[zone] = Math.max(0, victims[zone] - Math.max(0, capacity - saved));
  }
  const crossesRegion = area(radii[2]) > regionArea;
  const limit = crossesRegion ? historicalWorld.population : location.population;
  const cap = (values: Triple): Triple => {
    let left = limit;
    return values.map((value) => {
      const n = Math.max(0, Math.min(left, Math.trunc(value)));
      left -= n;
      return n;
    }) as Triple;
  };
  const d = cap(deaths),
    v = cap(victims);
  const local = (values: Triple) =>
    Math.min(
      location.population,
      Math.trunc(
        values.reduce((sum, n, i) => {
          const outer = area(radii[i]),
            inner = i ? area(radii[i - 1]) : 0;
          return (
            sum +
            n *
              (outer === inner
                ? 0
                : Math.max(0, Math.min(outer, regionArea) - Math.min(inner, regionArea)) /
                  (outer - inner))
          );
        }, 0),
      ),
    );
  return {
    zones: radii.map((radiusKm, i) => ({
      radiusKm,
      deaths: d[i],
      victims: v[i],
    })) as SimulationResult['zones'],
    deaths: d.reduce((a, b) => a + b, 0),
    victims: v.reduce((a, b) => a + b, 0),
    deathsOnRegion: local(d),
    victimsOnRegion: local(v),
    crossesRegion,
    latitude: location.latitude,
    longitude: location.longitude,
    periodDays: period,
    startDeathsSeconds: delay,
    population: location.population,
    modelVersion: 'legacy-corrected-v2',
    dataVersion,
  };
}

import { catalog, lookup } from '../catalog';
import { chemicalModel } from './chemical';
import type { SimulationInput } from './schema';
import type { Triple } from './types';

export const area = (radius: number) => 3.14 * radius ** 2;
export const historicalWorld = { population: 7830458560, density: 30 };
export function calculateDamage(
  input: SimulationInput,
  radii: Triple,
  regionArea: number,
  density: number,
) {
  if (input.type === 2) {
    const v = input.virus!;
    const r = 1 + v.contagiousness * input.strength;
    const exponent = r * input.duration - Math.log(Math.max(Number.MIN_VALUE, area(radii[2])));
    // Stable logistic derivative avoids Infinity/Infinity for large inputs.
    const e = Math.exp(-Math.abs(exponent));
    const victims = Math.min(
      historicalWorld.population,
      Math.trunc((r * area(radii[2]) * density * e) / (1 + e) ** 2),
    );
    const mortality =
      v.symptomIds.reduce((sum, id) => sum + lookup(catalog.symptoms, id).mortality, 0) /
      v.symptomIds.length;
    const k = -0.2408 + 0.9087 * mortality - 0.00215 * v.incubationDays + 0.09389 * input.strength;
    const deaths = Math.trunc(victims * (k < 0 ? 0.00087 : k > 1 ? 0.9999 : k));
    const split = (n: number, a: number, b: number): Triple => [
      Math.trunc(n * a),
      Math.trunc(n * b),
      n - Math.trunc(n * a) - Math.trunc(n * b),
    ];
    return { deaths: split(deaths, 0.1, 0.6), victims: split(victims, 0.1, 0.3) };
  }
  const isMeteor = input.type === 5 && lookup(catalog.spaceobject, input.spaceObjectId).type === 3;
  const ratios: Record<number, { deaths: Triple; victims: Triple; corrections: [number, number] }> =
    {
      1: { deaths: [0.98, 0.5, 0.05], victims: [0.02, 0.4, 0.45], corrections: [3, 2] },
      3: { deaths: [0.13, 0.01, 0.0001], victims: [0.43, 0.25, 0.11], corrections: [7, 5] },
      4: { deaths: [0.11, 0.036, 0.0017], victims: [0.51, 0.275, 0.142], corrections: [7, 4] },
      5: isMeteor
        ? { deaths: [0.2, 0.07, 0.015], victims: [0.8, 0.33, 0.143], corrections: [5, 6] }
        : { deaths: [1, 0.7, 0.35], victims: [0, 0.3, 0.65], corrections: [3, 3] },
      6: {
        deaths: [0, 0, 0],
        victims: input.type === 6 ? chemicalModel(input).victims : [0, 0, 0],
        corrections: [6, 5],
      },
    };
  const ratio = ratios[input.type];
  const exposed = radii.map((radius, i) => {
    const outer = area(radius),
      inner = i ? area(radii[i - 1]) : 0;
    const localArea = Math.max(0, Math.min(outer, regionArea) - Math.min(inner, regionArea));
    return localArea * density + Math.max(0, outer - inner - localArea) * historicalWorld.density;
  });
  const estimate = (values: Triple, correction: number) =>
    exposed.map((n, i) =>
      Math.trunc(n * values[i] * Math.exp(Math.trunc(input.strength / correction))),
    ) as Triple;
  return {
    deaths:
      input.type === 6
        ? (chemicalModel(input).deaths.map(Math.trunc) as Triple)
        : estimate(ratio.deaths, ratio.corrections[0]),
    victims: estimate(ratio.victims, ratio.corrections[1]),
  };
}

import tables from './chemical-tables.json' with { type: 'json' };
import type { SimulationInput } from './schema';
import type { Triple } from './types';

export function chemicalModel(input: SimulationInput) {
  const c = input.chemical!;
  const { weight, windSpeed: wind, substanceId: substance, temperature } = c;
  let stability = 2;
  if (wind < 2) {
    if (c.daypart === 1 || c.daypart === 4) stability = c.atmospheric < 3 ? 1 : 2;
    if (c.daypart === 2) stability = c.atmospheric === 2 ? 1 : 2;
    if (c.daypart === 3) stability = c.atmospheric === 1 ? 3 : 2;
  } else if (wind <= 4) {
    if (c.daypart === 1) stability = c.atmospheric < 3 ? 1 : 2;
    if (c.daypart === 2 || c.daypart === 4) stability = c.atmospheric === 2 ? 1 : 2;
  }
  const period = Math.trunc(6 / input.duration);
  const floorIndex = (values: number[], value: number) =>
    Math.max(
      0,
      values.findLastIndex((v) => v <= value),
    );
  // Legacy tables have seven temperature/wind columns. Use bounded lookup indices.
  const tempIndex = floorIndex([-30, -20, -10, 0, 10, 20, 30], temperature);
  const windIndex = floorIndex([1, 2, 3, 4, 5, 6, 7], wind);
  const tempRow =
    substance === 3
      ? 0
      : substance === 1
        ? 1
        : [2, 7].includes(substance)
          ? 2
          : substance === 4
            ? 4
            : 3;
  const massIndex = floorIndex([1, 5, 10, 25, 50, 75, 100, 500, 1000], weight);
  const depth =
    tables.g_t[(stability - 1) * 7 + substance - 1][massIndex] *
    tables.k_t[tempRow][tempIndex] *
    tables.k_v[stability - 1][windIndex];
  const width = [0.03, 0.15, 0.8][stability - 1];
  const factors = tables.F[substance - 1];
  const windFactor = [1, 1.3, 1.67, 2, 2.34, 2.67, 3, 3.34, 3.67, 4][wind - 1];
  const q =
    (1 - factors[0]) *
    factors[1] *
    factors[temperature <= -20 ? 2 : temperature >= 20 ? 4 : 3] *
    windFactor *
    period ** 0.8 *
    weight;
  const qIndex = [0.1, 0.5, 1, 3, 5, 10, 20, 30, 50, 70, 100, 500].findIndex((max) => q <= max);
  const secondaryDepth = q <= 0 ? 0 : tables.depth_Q[wind - 1][qIndex === -1 ? 11 : qIndex];
  const radii: Triple = [
    (6 * Math.sqrt(weight)) / 1000,
    (Math.sqrt(0.5 * depth * width) / 3.14) * input.duration,
    (Math.sqrt(0.00872 * secondaryDepth ** 2) / 3.14) * input.duration,
  ];
  const maskIndex = [0, 20, 40, 50, 70, 90, 100].indexOf(c.masks);
  const victims: Triple = [
    [0.95, 0.75, 0.5, 0.5, 0.35, 0.18, 0.075][maskIndex],
    [0.5, 0.4, 0.3, 0.27, 0.18, 0.09, 0.04][maskIndex],
    [0.15, 0.275, 0.35, 0.55][
      [1, 2].includes(substance)
        ? 3
        : [3, 4].includes(substance)
          ? 1
          : [5, 6].includes(substance)
            ? 0
            : 3
    ],
  ];
  const coefficient = [0.5, 0.2, 0.12, 0.05, 0.02][
    [1, 2].includes(substance)
      ? 0
      : substance === 3
        ? 3
        : substance === 4
          ? 2
          : [5, 7].includes(substance)
            ? 1
            : 4
  ];
  const deaths: Triple = [
    weight * coefficient * input.strength,
    (weight * coefficient) / (4.173 / input.strength),
    (weight * coefficient) / (8.126 / input.strength),
  ];
  return { radii, period, victims, deaths };
}

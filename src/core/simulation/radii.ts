import { catalog, lookup } from '../catalog';
import { chemicalModel } from './chemical';
import type { SimulationInput } from './schema';
import type { Triple } from './types';

export function calculateRadii(input: SimulationInput): {
  radii: Triple;
  period: number;
  delay: number;
} {
  const { strength: s, duration: d, scale } = input;
  let radii: Triple;
  let period: number;
  let delay = 0;

  switch (input.type) {
    case 1: {
      const b = lookup(catalog.atomicbomb, input.bombId);
      const cls = b.class_en === 'Extra large' ? 1 : b.class_en === 'Unreal' ? 2 : 0;
      const first = [
        2.4202 * b.charge ** 0.3422,
        6.116 * b.charge ** 0.2629,
        15.1641 * b.charge ** 0.3109,
      ];
      const second = [
        -1.47945 +
          0.0387 * b.charge +
          0.0665 * b.weight +
          0.3407 * b.length +
          0.9292 * b.diameter +
          0.9489 * cls,
        -0.78845 +
          0.1499 * b.charge +
          0.1091 * b.weight +
          0.53129 * b.length +
          1.0636 * b.diameter +
          1.8253 * cls,
        -2.0313 +
          0.4556 * b.charge +
          0.3067 * b.weight +
          0.5965 * b.length +
          4.5387 * b.diameter +
          7.106 * cls,
      ];

      radii = first.map((r, i) =>
        s === 1 ? (r * 5) / 6 : s === 3 ? (second[i] * 4) / 3 : (r + second[i]) / 2,
      ) as Triple;
      period = Math.trunc(21 / d);
      break;
    }

    case 2: {
      const v = input.virus!;
      const r = v.incubationDays * v.contagiousness * s * scale * d;

      radii = [r * 0.05, r * 0.65, r * 1.21];
      period =
        Math.trunc((Math.trunc((Math.trunc(93 / d) * 3) / scale) * s) / 2) + v.incubationDays;
      delay = v.incubationDays * 86400;
      break;
    }

    case 3: {
      const r = scale * s * d;

      radii = [r * 0.1, r * 0.5, r * 0.7];
      period = Math.trunc(30 / d);
      delay = 86400 / d;
      break;
    }

    case 4: {
      const r = scale * s * 1.618;

      radii = [r * 0.3, r * 0.7, r];
      period = Math.trunc(30 / d);
      delay = 43200 / d;
      break;
    }

    case 5: {
      const object = lookup(catalog.spaceobject, input.spaceObjectId);

      if (object.type === 3) {
        const r = scale * s * lookup(catalog.typespaceobject, 3).coefficient;

        radii = [r * 0.271, r * 0.6243, r * 0.9426];
        period = Math.trunc(5 / d);
      } else {
        const r =
          object.size! *
          (1 - (0.15 * lookup(catalog.material, input.materialId).coefficient) / (s * scale * d));

        radii = [
          r,
          Math.min(6370, r * 2.1762 * r ** 0.8638),
          Math.min(6370, r * Math.exp(2.4525 + 0.0612 * r)),
        ];
        period = Math.trunc(3 / d);
      }

      break;
    }

    case 6: {
      const model = chemicalModel(input);

      radii = model.radii;
      period = model.period;
      delay = 3540 / d;
      break;
    }

    default:
      throw new Error('Unsupported scenario');
  }

  // Nested zones must remain finite, nonnegative and ordered, including broken legacy regressions.
  radii = radii.map((r, i, all) =>
    Math.min(6370, Math.max(0, ...all.slice(0, i + 1).map((n) => (Number.isFinite(n) ? n : 6370)))),
  ) as Triple;

  return { radii, period: Math.max(1, period), delay: Math.trunc(delay) };
}

import { describe, expect, it } from 'vitest';
import { catalog } from '../../src/core/catalog';
import { defaultInput, inputSchema } from '../../src/core/simulation/schema';
import { simulate } from '../../src/core/simulation/engine';
import { calculateRadii } from '../../src/core/simulation/radii';
import { timeline } from '../../src/core/simulation/timeline';
import { circleCoordinates, distanceKm } from '../../src/utils/geo';

describe('historical simulation models', () => {
  it('preserves known flood and earthquake radius formulas', () => {
    expect(calculateRadii({ ...defaultInput, type: 3 })).toEqual({
      radii: [0.8, 4, 5.6],
      period: 15,
      delay: 43200,
    });
    const earthquake = calculateRadii({ ...defaultInput, type: 4 });
    expect(earthquake.radii[0]).toBeCloseTo(1.9416, 8);
    expect(earthquake.radii[1]).toBeCloseTo(4.5304, 8);
    expect(earthquake.radii[2]).toBeCloseTo(6.472, 8);
    expect(earthquake.delay).toBe(21600);
  });
  it('preserves the low-strength historical bomb power-law fixture', () => {
    const bomb = catalog.atomicbomb.find((b) => b.id === 1)!;
    const { radii } = calculateRadii({ ...defaultInput, type: 1, strength: 1 });
    expect(radii[0]).toBeCloseTo((2.4202 * bomb.charge ** 0.3422 * 5) / 6, 8);
    expect(radii[1]).toBeCloseTo((6.116 * bomb.charge ** 0.2629 * 5) / 6, 8);
    expect(radii[2]).toBeCloseTo((15.1641 * bomb.charge ** 0.3109 * 5) / 6, 8);
  });
  it('keeps all six models finite and zone totals consistent over all intensity/speed/scale combinations', () => {
    for (let type = 1; type <= 6; type++)
      for (let strength = 1; strength <= 3; strength++)
        for (let duration = 1; duration <= 3; duration++)
          for (let scale = 1; scale <= 3; scale++) {
            const result = simulate({ ...defaultInput, type, strength, duration, scale });
            expect(result.deaths).toBe(result.zones.reduce((sum, z) => sum + z.deaths, 0));
            expect(result.victims).toBe(result.zones.reduce((sum, z) => sum + z.victims, 0));
            expect(result.deathsOnRegion).toBeLessThanOrEqual(result.population);
            expect(result.victimsOnRegion).toBeLessThanOrEqual(result.population);
            let previous = 0;
            for (const zone of result.zones) {
              expect(Number.isFinite(zone.radiusKm)).toBe(true);
              expect(zone.radiusKm).toBeGreaterThanOrEqual(previous);
              previous = zone.radiusKm;
              expect(Number.isSafeInteger(zone.deaths)).toBe(true);
              expect(zone.deaths).toBeGreaterThanOrEqual(0);
              expect(Number.isSafeInteger(zone.victims)).toBe(true);
              expect(zone.victims).toBeGreaterThanOrEqual(0);
            }
            expect(timeline(result, 1).deaths).toBe(result.deaths);
            expect(timeline(result, 1).victims).toBe(result.victims);
          }
  });
  it('handles every imported country and region without NaN', () => {
    for (const country of catalog.countries)
      expect(Number.isFinite(simulate({ ...defaultInput, countryId: country.id }).deaths)).toBe(
        true,
      );
    for (const region of catalog.regions)
      expect(
        Number.isFinite(
          simulate({ ...defaultInput, countryId: region.country, regionId: region.id }).victims,
        ),
      ).toBe(true);
  });
  it('handles every bomb and space object, including negative legacy regressions', () => {
    for (const b of catalog.atomicbomb)
      for (const strength of [1, 2, 3])
        expect(
          simulate({ ...defaultInput, type: 1, bombId: b.id, strength }).zones[0].radiusKm,
        ).toBeGreaterThanOrEqual(0);
    for (const object of catalog.spaceobject)
      for (const material of catalog.material)
        expect(
          Number.isFinite(
            simulate({
              ...defaultInput,
              type: 5,
              spaceObjectId: object.id,
              materialId: material.id,
            }).victims,
          ),
        ).toBe(true);
  });
  it('covers chemical lookup boundaries that crashed or selected invalid indices in Java', () => {
    for (let substanceId = 1; substanceId <= 7; substanceId++)
      for (let windSpeed = 1; windSpeed <= 10; windSpeed++)
        for (const temperature of [-30, -20, 0, 20, 40]) {
          const result = simulate({
            ...defaultInput,
            type: 6,
            chemical: {
              ...defaultInput.chemical!,
              substanceId,
              windSpeed,
              temperature,
              weight: 1000,
            },
          });
          expect(Number.isFinite(result.zones[2].radiusKm)).toBe(true);
          expect(result.victims).toBeGreaterThanOrEqual(0);
        }
  });
  it('is deterministic and does not mutate submitted parameters', () => {
    const input = structuredClone(defaultInput),
      original = structuredClone(input);
    expect(simulate(input)).toEqual(simulate(input));
    expect(input).toEqual(original);
  });
  it('only applies facilities within impact zones and never produces negative damage', () => {
    const base = simulate(defaultInput);
    const far = simulate({
      ...defaultInput,
      buildings: [{ type: 2, capacity: 1000000, latitude: -80, longitude: -170 }],
    });
    expect(far).toEqual(base);
    const near = simulate({
      ...defaultInput,
      buildings: [
        { type: 2, capacity: 1000000, latitude: base.latitude + 0.03, longitude: base.longitude },
      ],
    });
    expect(near.deaths).toBeLessThanOrEqual(base.deaths);
    expect(near.victims).toBeLessThanOrEqual(base.victims);
  });
});
describe('validation and animation', () => {
  it('rejects malformed inputs and unrelated regions', () => {
    for (const patch of [
      { type: 0 },
      { strength: 4 },
      { countryId: 999999 },
      { scale: NaN },
      { type: 2, virus: undefined },
      { type: 2, virus: { ...defaultInput.virus!, symptomIds: [] } },
      { type: 6, chemical: { ...defaultInput.chemical!, windSpeed: 0 } },
    ])
      expect(inputSchema.safeParse({ ...defaultInput, ...patch }).success).toBe(false);
    const region = catalog.regions.find((r) => r.country !== defaultInput.countryId)!;
    expect(inputSchema.safeParse({ ...defaultInput, regionId: region.id }).success).toBe(false);
  });
  it('delays mortality and reaches exact final totals for viruses', () => {
    const result = simulate({ ...defaultInput, type: 2 });
    expect(timeline(result, 0).deaths).toBe(0);
    expect(
      timeline(result, (result.startDeathsSeconds / (result.periodDays * 86400)) * 0.5).deaths,
    ).toBe(0);
    expect(timeline(result, 1).deaths).toBe(result.deaths);
    expect(timeline(result, 1).victims).toBe(result.victims);
  });
  it('uses geographic distance and produces closed circles', () => {
    expect(distanceKm(0, 0, 0, 1)).toBeCloseTo(111.195, 2);
    expect(distanceKm(50, 20, 50, 20)).toBe(0);
    const circle = circleCoordinates(55, 37, 10);
    expect(circle[0][0]).toBeCloseTo(circle.at(-1)![0], 8);
    expect(circle[0][1]).toBeCloseTo(circle.at(-1)![1], 8);
    expect(distanceKm(55, 37, circle[20][1], circle[20][0])).toBeCloseTo(10, 6);
  });
});

it('does not require chemical parameters for other disaster types', () => {
  const { chemical: _chemical, ...input } = defaultInput;
  expect(() => simulate(input)).not.toThrow();
});

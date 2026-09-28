import { z } from 'zod';
import { catalog } from '../catalog';

const id = z.number().int().nonnegative();
const level = z.number().int().min(1).max(3);
const building = z
  .object({
    type: level,
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    capacity: z.number().int().min(0).max(1000000),
  })
  .strict();

export const inputSchema = z
  .object({
    type: z.number().int().min(1).max(6),
    strength: level,
    duration: level,
    scale: level,
    countryId: id,
    regionId: id.nullable().default(null),
    bombId: id.default(1),
    spaceObjectId: id.default(0),
    materialId: id.default(3),
    virus: z
      .object({
        name: z.string().trim().min(1).max(80),
        classId: id,
        incubationDays: z.number().int().min(1).max(60),
        contagiousness: z.number().min(0.1).max(20),
        symptomIds: z.array(id).min(1).max(60),
      })
      .strict()
      .optional(),
    chemical: z
      .object({
        substanceId: z.number().int().min(1).max(7),
        weight: z.number().min(1).max(1000),
        windSpeed: z.number().int().min(1).max(10),
        temperature: z.number().min(-30).max(40),
        masks: z.union([
          z.literal(0),
          z.literal(20),
          z.literal(40),
          z.literal(50),
          z.literal(70),
          z.literal(90),
          z.literal(100),
        ]),
        daypart: z.number().int().min(1).max(4),
        atmospheric: level,
      })
      .strict()
      .optional(),
    buildings: z.array(building).max(50).default([]),
  })
  .strict()
  .superRefine((value, ctx) => {
    const check = (valid: boolean, path: string, message: string) => {
      if (!valid) ctx.addIssue({ code: 'custom', path: [path], message });
    };

    check(
      catalog.countries.some((c) => c.id === value.countryId),
      'countryId',
      'Unknown country',
    );
    check(
      value.regionId === null ||
        catalog.regions.some((r) => r.id === value.regionId && r.country === value.countryId),
      'regionId',
      'Region must belong to country',
    );
    if (value.type === 1)
      check(
        catalog.atomicbomb.some((b) => b.id === value.bombId),
        'bombId',
        'Unknown bomb',
      );

    if (value.type === 5) {
      check(
        catalog.spaceobject.some((s) => s.id === value.spaceObjectId),
        'spaceObjectId',
        'Unknown space object',
      );
      check(
        catalog.material.some((m) => m.id === value.materialId),
        'materialId',
        'Unknown material',
      );
    }

    if (value.type === 2) {
      check(Boolean(value.virus), 'virus', 'Virus settings required');
      if (value.virus) {
        const virus = value.virus;

        check(
          catalog.classvirus.some((c) => c.id === virus.classId),
          'virus',
          'Unknown virus class',
        );
        check(
          new Set(virus.symptomIds).size === virus.symptomIds.length &&
            virus.symptomIds.every((id) =>
              catalog.symptoms.some((s) => s.id === id && s.idclass === virus.classId),
            ),
          'virus',
          'Invalid symptoms for class',
        );
      }
    }

    if (value.type === 6) check(Boolean(value.chemical), 'chemical', 'Chemical settings required');
  });

export type SimulationInput = z.infer<typeof inputSchema>;
export type Building = z.infer<typeof building>;

export const defaultInput: SimulationInput = {
  type: 4,
  strength: 2,
  duration: 2,
  scale: 2,
  countryId: 185,
  regionId: null,
  bombId: 1,
  spaceObjectId: 0,
  materialId: 3,
  buildings: [],
  virus: {
    name: 'Scenario',
    classId: 1,
    incubationDays: 7,
    contagiousness: 2,
    symptomIds: catalog.symptoms.filter((s) => s.idclass === 1).map((s) => s.id),
  },
  chemical: {
    substanceId: 3,
    weight: 10,
    windSpeed: 2,
    temperature: 20,
    masks: 0,
    daypart: 3,
    atmospheric: 1,
  },
};

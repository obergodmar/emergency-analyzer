import { defaultInput, type SimulationInput } from '@/core/simulation/schema';
export type Draft = {
  type: number | null;
  feature: number | null;
  spaceObject: number | null;
  material: number | null;
  strength: number | null;
  duration: number | null;
  scale: number | null;
  country: number | null;
  region: number | null;
  virusName: string;
  incubation: number;
  contagiousness: number;
  symptoms: number[];
};
export const emptyDraft: Draft = {
  type: null,
  feature: null,
  spaceObject: null,
  material: null,
  strength: null,
  duration: null,
  scale: null,
  country: null,
  region: null,
  virusName: '',
  incubation: 1,
  contagiousness: 0.1,
  symptoms: [],
};
export function toSimulationInput(draft: Draft): SimulationInput {
  return {
    ...defaultInput,
    type: draft.type!,
    strength: draft.strength!,
    duration: draft.duration!,
    scale: draft.scale!,
    countryId: draft.country!,
    regionId: draft.region,
    bombId: draft.type === 1 ? draft.feature! : defaultInput.bombId,
    spaceObjectId: draft.spaceObject ?? 0,
    materialId: draft.material ?? 3,
    virus:
      draft.type === 2
        ? {
            name: draft.virusName,
            classId: draft.feature!,
            incubationDays: draft.incubation,
            contagiousness: draft.contagiousness,
            symptomIds: draft.symptoms,
          }
        : undefined,
  };
}

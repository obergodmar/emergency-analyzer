import type { SimulationInput } from './schema';

export type Triple = [number, number, number];
export type Zone = { radiusKm: number; deaths: number; victims: number };

export type SimulationResult = {
  zones: [Zone, Zone, Zone];
  deaths: number;
  victims: number;
  deathsOnRegion: number;
  victimsOnRegion: number;
  crossesRegion: boolean;
  latitude: number;
  longitude: number;
  periodDays: number;
  startDeathsSeconds: number;
  population: number;
  modelVersion: string;
  dataVersion: string;
};

export type SimulationReport = {
  id: string;
  createdAt: string;
  input: SimulationInput;
  result: SimulationResult;
};

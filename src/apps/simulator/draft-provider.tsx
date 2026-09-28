'use client';
import {
  createContext,
  useContext,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';
import { z } from 'zod';
import { emptyDraft, type Draft } from '@/core/settings/draft';
const key = 'ea-settings';
const initial = JSON.stringify(emptyDraft);
let memory = initial;
const id = z.number().int().nonnegative().nullable();
const schema = z.object({
  type: id,
  feature: id,
  spaceObject: id,
  material: id,
  strength: id,
  duration: id,
  scale: id,
  country: id,
  region: id,
  virusName: z.string().max(14),
  incubation: z.number().int().min(1).max(30),
  contagiousness: z.number().min(0.1).max(1),
  symptoms: z.array(z.number().int().nonnegative()).max(60),
});
function read() {
  try {
    return sessionStorage.getItem(key) ?? memory;
  } catch {
    return memory;
  }
}
function parse(value: string): Draft {
  try {
    const parsed = schema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : emptyDraft;
  } catch {
    return emptyDraft;
  }
}
function subscribe(callback: () => void) {
  window.addEventListener(key, callback);
  return () => window.removeEventListener(key, callback);
}
const Context = createContext<{ draft: Draft; setDraft: Dispatch<SetStateAction<Draft>> } | null>(
  null,
);
export function DraftProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(subscribe, read, () => initial);
  const draft = parse(stored);
  const setDraft: Dispatch<SetStateAction<Draft>> = (next) => {
    memory = JSON.stringify(typeof next === 'function' ? next(parse(read())) : next);
    try {
      sessionStorage.setItem(key, memory);
    } catch {
      /* Keep the draft in memory when storage is unavailable. */
    }
    window.dispatchEvent(new Event(key));
  };
  return <Context.Provider value={{ draft, setDraft }}>{children}</Context.Provider>;
}
export function useDraft() {
  const value = useContext(Context);
  if (!value) throw new Error('DraftProvider required');
  return value;
}

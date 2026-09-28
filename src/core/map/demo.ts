import geometry from './countries.json';
import events from '@/core/catalog/events.json';
export type DemoEntry = {
  country: string;
  value: number;
  text: { ru: string; en: string };
  date: string;
};
export function demoEntries(): DemoEntry[] {
  const year = 1950 + Math.floor(Math.random() * 60);
  return Array.from({ length: 20 + Math.floor(Math.random() * 65) }, () => {
    const country =
      geometry.features[Math.floor(Math.random() * geometry.features.length)].I.split(
        '_',
      )[0].toUpperCase();
    const event = events[Math.floor(Math.random() * events.length)];
    const variant = (1 + Math.floor(Math.random() * 3)) as 1 | 2 | 3;
    const number = String(1 + Math.floor(Math.random() * 25000));
    return {
      country,
      value: Math.floor(Math.random() * 10000000),
      text: {
        ru: event[`log${variant}_ru`].replace('{{}}', number),
        en: event[`log${variant}_en`].replace('{{}}', number),
      },
      date: `${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}.${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}.${year}`,
    };
  });
}

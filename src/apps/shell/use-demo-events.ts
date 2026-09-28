'use client';

import { useEffect, useState } from 'react';
import { demoEntries, type DemoEntry } from '@/core/map/demo';

export function useDemoEvents() {
  const [feed, setFeed] = useState<{ entries: DemoEntry[]; logs: DemoEntry[]; visible: boolean }>({
    entries: [],
    logs: [],
    visible: false,
  });

  useEffect(() => {
    let refresh: ReturnType<typeof setTimeout>;
    const update = () => {
      setFeed((f) => ({ ...f, visible: false }));
      refresh = setTimeout(() => {
        const entries = demoEntries();

        setFeed({
          entries,
          logs: entries.slice(0, 1 + Math.floor(Math.random() * 9)),
          visible: true,
        });
      }, 1000);
    };

    const start = setTimeout(update, 0);
    const interval = setInterval(update, 5000);

    return () => {
      clearTimeout(start);
      clearTimeout(refresh);
      clearInterval(interval);
    };
  }, []);

  return feed;
}

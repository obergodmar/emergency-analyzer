'use client';

import { useEffect, useState } from 'react';

export function usePlayback() {
  const [state, setState] = useState({ progress: 0, playing: false });

  useEffect(() => {
    if (!state.playing) return;

    let frame: number;
    let previous: number | null = null;
    const tick = (now: number) => {
      if (previous !== null) {
        const delta = (now - previous) / 20000;

        setState((current) => {
          const progress = Math.min(1, current.progress + delta);

          return { progress, playing: progress < 1 };
        });
      }

      previous = now;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [state.playing]);

  return {
    ...state,
    play: () => setState((s) => ({ progress: s.progress >= 1 ? 0 : s.progress, playing: true })),
    pause: () => setState((s) => ({ ...s, playing: false })),
    reset: () => setState({ progress: 0, playing: false }),
    finish: () => setState({ progress: 1, playing: false }),
    seek: (progress: number) => setState({ progress, playing: false }),
  };
}

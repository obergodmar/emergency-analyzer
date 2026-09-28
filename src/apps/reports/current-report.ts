'use client';

import { useSyncExternalStore } from 'react';

const event = 'ea-current-report';

function subscribe(callback: () => void) {
  window.addEventListener(event, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(event, callback);
    window.removeEventListener('storage', callback);
  };
}

function read() {
  try {
    return sessionStorage.getItem(event);
  } catch {
    return null;
  }
}

export function useCurrentReport() {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function setCurrentReport(id: string) {
  sessionStorage.setItem(event, id);
  window.dispatchEvent(new Event(event));
}

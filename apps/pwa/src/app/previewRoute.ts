import { useSyncExternalStore } from 'react';

export type Exercise = 'push-up' | 'jumping-jack' | 'auto';
export type PreviewScreen = 'normal' | 'workout' | 'active' | 'summary';
export type Activity = 'idle' | 'walking';

export interface PreviewRoute {
  screen: PreviewScreen;
  exercise: Exercise;
  activity: Activity;
}

export function parsePreviewRoute(hash: string): PreviewRoute {
  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  const params = new URLSearchParams(query);
  const candidate = params.get('exercise');
  const exercise: Exercise = candidate === 'jumping-jack' || candidate === 'auto' ? candidate : 'push-up';
  const screen: PreviewScreen = path === '/workout' ? 'workout'
    : path === '/active' ? 'active'
    : path === '/summary' ? 'summary'
    : 'normal';
  return {
    screen,
    exercise,
    activity: screen === 'normal' && params.get('activity') === 'walking' ? 'walking' : 'idle',
  };
}

export function previewHref(screen: PreviewScreen, exercise: Exercise = 'push-up'): string {
  return screen === 'normal' ? '#/' : `#/${screen}?exercise=${exercise}`;
}

const subscribe = (callback: () => void) => {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
};
const getSnapshot = () => window.location.hash;

// Hash links preserve direct links and browser history without server-side routes.
export function usePreviewRoute(): PreviewRoute {
  return parsePreviewRoute(useSyncExternalStore(subscribe, getSnapshot, () => '#/'));
}

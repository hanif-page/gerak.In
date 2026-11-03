import { describe, expect, it } from 'vitest';
import { parsePreviewRoute, previewHref } from './previewRoute';

describe('static preview routes', () => {
  it.each(['', '#/', '#/unknown', '#main-content'])('uses idle normal mode for %s', (hash) => {
    expect(parsePreviewRoute(hash)).toEqual({ screen: 'normal', exercise: 'push-up', activity: 'idle' });
  });

  it('reads the walking variant without requiring server routing', () => {
    expect(parsePreviewRoute('#/normal?activity=walking').activity).toBe('walking');
  });

  it.each(['workout', 'active', 'summary'] as const)('round-trips %s and every exercise', (screen) => {
    for (const exercise of ['push-up', 'jumping-jack', 'auto'] as const) {
      expect(parsePreviewRoute(previewHref(screen, exercise))).toEqual({ screen, exercise, activity: 'idle' });
    }
  });

  it('uses safe defaults for unsupported query values', () => {
    expect(parsePreviewRoute('#/active?exercise=unknown&activity=walking')).toEqual({ screen: 'active', exercise: 'push-up', activity: 'idle' });
    expect(parsePreviewRoute('#/normal?activity=running').activity).toBe('idle');
  });
});

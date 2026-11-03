import { useEffect, useRef } from 'react';
import { previewHref, usePreviewRoute } from '../../app/previewRoute';
import { PreviewNotice, useBrowserOnline } from '../../components/PreviewNotice';
import { ActiveWorkout } from '../workouts/ActiveWorkout';
import { WorkoutSetup } from '../workouts/WorkoutSetup';
import { WorkoutSummary } from '../workouts/WorkoutSummary';
import { NormalActivity } from './NormalActivity';

export function Dashboard() {
  const route = usePreviewRoute();
  const online = useBrowserOnline();
  const main = useRef<HTMLElement>(null);
  const isTracker = route.screen === 'normal' || route.screen === 'workout';

  useEffect(() => {
    document.title = route.screen === 'summary' ? 'gerak.In — Workout Summary'
      : route.screen === 'active' ? 'gerak.In — Workout Preview'
      : route.screen === 'workout' ? 'gerak.In — Workout Setup'
      : 'gerak.In — Tracker';
    main.current?.focus();
  }, [route.screen]);

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        main.current?.focus();
      }}>Skip to tracker</a>
      <div className="app-shell">
        <header className="brand-bar" aria-label="gerak.In">
          <a className="brand" href="#/" aria-label="gerak.In home">gerak.In</a>
          <span className="brand-tagline">EDGE AI FITNESS</span>
        </header>

        <main id="main-content" className={`dashboard screen-${route.screen}`} ref={main} tabIndex={-1} aria-describedby="preview-description">
          {isTracker && (
            <>
              <div className="tracker-heading">
                <h1>Tracker</h1>
                <span className="connection-badge" role="status">
                  <span className="connection-dot" aria-hidden="true" />
                  {online ? 'Not connected' : 'Offline'}
                </span>
              </div>
              <nav className="mode-selector" aria-label="Tracking mode">
                <a className={`mode-option${route.screen === 'normal' ? ' is-selected' : ''}`} href={previewHref('normal')} aria-current={route.screen === 'normal' ? 'page' : undefined}>Normal Mode</a>
                <a className={`mode-option${route.screen === 'workout' ? ' is-selected' : ''}`} href={previewHref('workout', route.exercise)} aria-current={route.screen === 'workout' ? 'page' : undefined}>Workout Mode</a>
              </nav>
            </>
          )}
          {route.screen === 'normal' && <NormalActivity activity={route.activity} />}
          {route.screen === 'workout' && <WorkoutSetup exercise={route.exercise} />}
          {route.screen === 'active' && <ActiveWorkout exercise={route.exercise} />}
          {route.screen === 'summary' && <WorkoutSummary exercise={route.exercise} />}
        </main>

        <div className="preview-area"><PreviewNotice online={online} /></div>
        <footer className="app-footer">Made for movement. Built on the edge.</footer>
      </div>
    </>
  );
}

import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdate() {
  const [error, setError] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ onRegisterError: () => setError(true) });

  if (error) {
    return <p className="pwa-notice" role="status">Offline setup unavailable. You can still use the app online.</p>;
  }
  if (!needRefresh) return null;

  return (
    <aside className="pwa-notice" aria-label="Application update">
      <p role="status">A new version of gerak.In is ready.</p>
      <div className="notice-actions">
        <button type="button" onClick={() => void updateServiceWorker(true).catch(() => setError(true))}>Update</button>
        <button type="button" onClick={() => setNeedRefresh(false)}>Later</button>
      </div>
    </aside>
  );
}

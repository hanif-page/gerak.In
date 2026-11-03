import { useEffect, useState } from 'react';

export function useBrowserOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

export function PreviewNotice({ online }: { online: boolean }) {
  return (
    <aside className="preview-note" aria-label="Preview information">
      <span className="preview-label">DESIGN PREVIEW</span>
      <p id="preview-description">Sample data only. No wearable or server is connected. Nothing is recorded or saved.</p>
      {!online && <p className="offline-message" role="status">You're offline. This is a cached interface, not live tracking.</p>}
    </aside>
  );
}

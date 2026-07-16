import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 정적 셸 오프라인 캐시 (실패해도 앱은 정상)
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base =
      (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
    try {
      const swUrl = new URL('sw.js', `${window.location.origin}${base}`).href;
      navigator.serviceWorker.register(swUrl, { scope: base }).catch(() => undefined);
    } catch {
      /* optional */
    }
  });
}

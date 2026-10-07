import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Mount React immediately
const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

// Safely register Service Worker only in standalone top-level windows in production
try {
  let isTop = false;
  try {
    isTop = window.self === window.top;
  } catch {
    isTop = false;
  }

  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    isTop &&
    import.meta.env.PROD
  ) {
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        try {
          registerSW({ immediate: false });
        } catch {
          // SW skipped
        }
      })
      .catch(() => {});
  }
} catch {
  // SW skipped
}


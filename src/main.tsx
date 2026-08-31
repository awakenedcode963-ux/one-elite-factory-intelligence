import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { InvestigationView } from '../apps/fi-ui/src/index.js';
import './index.css';

const APP_MODE = import.meta.env.VITE_APP_MODE || 'QMS';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {APP_MODE === 'AGENT' ? <InvestigationView /> : <App />}
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import './styles/tokens.css';
import FitForgeApp from './App';
import { AuthGate } from './AuthGate';

// Convex est optionnel : sans VITE_CONVEX_URL, l'app tourne en mode 100%
// localStorage (sans compte). Avec, on passe par l'authentification.
const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {convex ? (
      <ConvexAuthProvider client={convex}>
        <AuthGate />
      </ConvexAuthProvider>
    ) : (
      <FitForgeApp />
    )}
  </StrictMode>,
);

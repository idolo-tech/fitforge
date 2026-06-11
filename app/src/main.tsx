import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import './styles/tokens.css';
import FitForgeApp from './App';

// Convex est optionnel : tant que VITE_CONVEX_URL n'est pas défini
// (avant `npx convex dev`), l'app tourne en mode 100% localStorage.
const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

const app = <FitForgeApp />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {convex ? <ConvexProvider client={convex}>{app}</ConvexProvider> : app}
  </StrictMode>,
);

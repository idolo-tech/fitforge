import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import FitForgeApp from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FitForgeApp />
  </StrictMode>,
);

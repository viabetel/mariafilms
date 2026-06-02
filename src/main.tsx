import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Roteamento mínimo por pathname (sem router): /proposta abre a proposta do
// cliente; /admin abre o painel da Maria; qualquer outra rota abre o site.
// Ambos são lazy (não pesam o site principal).
const path = window.location.pathname.replace(/\/+$/, '');
const isProposal = path.endsWith('/proposta');
const isAdmin = path.endsWith('/admin');

const ProposalDossier = lazy(() =>
  import('./proposal/ProposalDossier.tsx').then((m) => ({ default: m.ProposalDossier })),
);
const AdminPanel = lazy(() =>
  import('./proposal/AdminPanel.tsx').then((m) => ({ default: m.AdminPanel })),
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isProposal ? (
      <Suspense fallback={<div style={{ background: '#f4f1ea', height: '100vh' }} />}>
        <ProposalDossier />
      </Suspense>
    ) : isAdmin ? (
      <Suspense fallback={<div style={{ background: '#f4f1ea', height: '100vh' }} />}>
        <AdminPanel />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)

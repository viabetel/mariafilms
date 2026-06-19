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
// Lab de motion (prova de conceito AE) — só na hash #ae-lab, não pesa o site.
const isLab = window.location.hash === '#ae-lab';

// Fraunces só é usada nas telas de proposta/admin (.proposal-doc). Carregamos
// a fonte apenas nessas rotas — o site principal não baixa essa família à toa.
if (isProposal || isAdmin) {
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href =
    'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap';
  document.head.appendChild(l);
}

const ProposalDossier = lazy(() =>
  import('./proposal/ProposalDossier.tsx').then((m) => ({ default: m.ProposalDossier })),
);
const AdminPanel = lazy(() =>
  import('./proposal/AdminPanel.tsx').then((m) => ({ default: m.AdminPanel })),
);
const AdminGate = lazy(() =>
  import('./proposal/AdminGate.tsx').then((m) => ({ default: m.AdminGate })),
);
const AeLab = lazy(() =>
  import('./lab/AeLab.tsx').then((m) => ({ default: m.AeLab })),
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isLab ? (
      <Suspense fallback={<div style={{ background: '#060606', height: '100vh' }} />}>
        <AeLab />
      </Suspense>
    ) : isProposal ? (
      <Suspense fallback={<div style={{ background: '#f4f1ea', height: '100vh' }} />}>
        <ProposalDossier />
      </Suspense>
    ) : isAdmin ? (
      <Suspense fallback={<div style={{ background: '#f4f1ea', height: '100vh' }} />}>
        <AdminGate>
          <AdminPanel />
        </AdminGate>
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)

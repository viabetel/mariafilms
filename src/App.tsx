import { useState } from 'react';
import { SmoothScroll } from './components/SmoothScroll';
import { IntroLoader } from './components/IntroLoader';
import { Navbar } from './components/Navbar';
import { CinematicAct } from './components/CinematicAct';
import { TransitionBridge } from './components/TransitionBridge';
import { SocialDepth } from './components/SocialDepth';
import { Features } from './components/Features';
import { EssenceSection } from './components/EssenceSection';
import { Portfolio } from './components/Portfolio';
import { Editorial } from './components/Editorial';
import { Services } from './components/Services';
import { Contact } from './components/Contact';

function App() {
  const [ready, setReady] = useState(false);

  return (
    <div className="film-grain vignette">
      {!ready && <IntroLoader onComplete={() => setReady(true)} />}

      <SmoothScroll>
        <Navbar />

        {/* Ato central: hero + manifesto numa única tomada de câmera */}
        <CinematicAct />

        {/* Ponte: o corte final se fragmenta em reels */}
        <TransitionBridge />

        {/* Prova social em camadas de profundidade */}
        <SocialDepth />

        {/* Diferenciais: features com hover-expand + reflexo no fundo */}
        <Features />

        {/* Essência: câmera afastando + vídeo de fundo brilhando, frases renovando */}
        <EssenceSection />

        {/* Portfólio de filmes (travelling horizontal pinado) */}
        <Portfolio />

        {/* Sobre Maria Eduarda */}
        <Editorial />

        {/* Serviços */}
        <Services />

        {/* Contato + footer */}
        <Contact />
      </SmoothScroll>
    </div>
  );
}

export default App;

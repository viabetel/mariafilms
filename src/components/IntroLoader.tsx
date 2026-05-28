import { useEffect, useState } from 'react';

interface IntroLoaderProps {
  onComplete: () => void;
}

export function IntroLoader({ onComplete }: IntroLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let current = 0;
    let timeoutId: number;

    // Salto inicial para dar sensação imediata de atividade
    setProgress(15);
    current = 15;

    const tick = () => {
      let step = 1;
      let nextDelay = 30;

      // Algoritmo não-linear acelerado
      if (current < 50) {
        // Salta rápido no começo
        step = Math.floor(Math.random() * 6) + 4;
        nextDelay = Math.floor(Math.random() * 30) + 20;
      } else if (current < 80) {
        // Passo normal
        step = Math.floor(Math.random() * 3) + 1;
        nextDelay = Math.floor(Math.random() * 60) + 40;
      } else if (current < 96) {
        // Desacelera para simular buffering final dos arquivos pesados
        step = Math.random() > 0.5 ? 1 : 0;
        nextDelay = Math.floor(Math.random() * 100) + 60;
      } else if (current < 100) {
        // Passo final cadenciado
        step = 1;
        nextDelay = 150;
      }

      current = Math.min(100, current + step);
      setProgress(current);

      if (current < 100) {
        timeoutId = setTimeout(tick, nextDelay) as unknown as number;
      }
    };

    timeoutId = setTimeout(tick, 150) as unknown as number;

    // Acelera instantaneamente para 100 quando a página terminar de carregar por completo
    const handleLoad = () => {
      current = 100;
      setProgress(100);
    };

    if (document.readyState === 'complete') {
      const ffTimeout = setTimeout(() => {
        setProgress(100);
      }, 1000); // Se já estiver carregado, segura 1s para o usuário ver o loader e encerra
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(ffTimeout);
      };
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const fadeTimeout = setTimeout(() => {
        setIsFadingOut(true);
        const completeTimeout = setTimeout(() => {
          onComplete();
        }, 600);
        return () => clearTimeout(completeTimeout);
      }, 300);
      return () => clearTimeout(fadeTimeout);
    }
  }, [progress, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white transition-all duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Video com efeito de partículas de luz (Efeito Festa) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-screen z-0 pointer-events-none"
        src="/Efeit Festa.webm"
      />

      {/* Vinheta radial de contraste escuro para direcionar foco no centro */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 90%)'
        }}
      />

      {/* HUD Canto Superior Esquerdo: REC indicador piscante */}
      <div className="absolute top-8 left-8 flex items-center gap-2 text-white/70 font-display-tech text-[10px] tracking-[0.25em] z-20 select-none">
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#dc2626]" />
        <span className="font-semibold">REC</span>
      </div>

      {/* HUD Canto Superior Direito: Metadados técnicos do vídeo */}
      <div className="absolute top-8 right-8 flex flex-col items-end text-white/40 font-display-tech text-[9px] tracking-wider z-20 select-none">
        <span>4K RAW // H.265</span>
        <span className="text-[#ff007f] font-semibold mt-0.5">24.00 FPS</span>
      </div>

      {/* HUD Canto Inferior Esquerdo: Shutter / ISO / Temperatura */}
      <div className="absolute bottom-8 left-8 flex flex-col items-start text-white/40 font-display-tech text-[9px] tracking-wider z-20 select-none">
        <span>SHUTTER 1/48</span>
        <span>ISO 800</span>
        <span>WB 5600K</span>
      </div>

      {/* HUD Canto Inferior Direito: Bateria e Medidores de Áudio VU Animados */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3.5 z-20 select-none">
        {/* Equalizador VU ativo em tempo real */}
        <div className="flex items-end gap-[3px] h-4 text-white/30">
          <div className="w-[2px] bg-white/30 rounded-full animate-soundbar" style={{ height: '30%', animationDelay: '0.1s' }} />
          <div className="w-[2px] bg-white/30 rounded-full animate-soundbar" style={{ height: '60%', animationDelay: '0.3s' }} />
          <div className="w-[2px] bg-white/30 rounded-full animate-soundbar" style={{ height: '40%', animationDelay: '0.2s' }} />
          <div className="w-[2px] bg-[#ff007f] rounded-full animate-soundbar shadow-[0_0_4px_#ff007f]" style={{ height: '80%', animationDelay: '0.4s' }} />
          <div className="w-[2px] bg-[#ff007f] rounded-full animate-soundbar shadow-[0_0_4px_#ff007f]" style={{ height: '50%', animationDelay: '0.0s' }} />
        </div>

        {/* Célula de Bateria */}
        <div className="flex items-center gap-1.5 text-white/30 font-display-tech text-[9px]">
          <span>BAT 98%</span>
          <div className="w-5 h-2.5 border border-white/20 rounded-[2px] p-[1.5px] flex items-center">
            <div className="h-full bg-white/40 rounded-[0.5px] w-[90%]" />
          </div>
        </div>
      </div>

      {/* HUD Marcadores de Enquadramento */}
      <div className="absolute top-6 left-6 w-5 h-5 border-t border-l border-white/10 z-20 pointer-events-none" />
      <div className="absolute top-6 right-6 w-5 h-5 border-t border-r border-white/10 z-20 pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-5 h-5 border-b border-l border-white/10 z-20 pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-5 h-5 border-b border-r border-white/10 z-20 pointer-events-none" />

      {/* Bloco Central: Tipografia Premium & Progresso */}
      <div className="flex flex-col items-center gap-3 z-20 text-center px-6">
        {/* Título de Marca em Instrument Serif Italic */}
        <h2 className="font-serif-editorial italic text-4xl md:text-5xl text-white/90 tracking-wide select-none">
          maria films
        </h2>
        
        {/* Tagline secundária */}
        <span className="text-[9px] tracking-[0.4em] text-neutral-500 uppercase font-display-tech font-semibold select-none">
          iniciando experiência
        </span>

        {/* Contador Limpo e Gigante sem Zeros Triplos */}
        <div className="flex items-start my-2">
          <span className="font-display-tech font-extrabold text-[15vw] md:text-[8vw] leading-none text-white tracking-tighter">
            {progress}
          </span>
          <span className="text-xl md:text-2xl font-light text-[#ff007f] font-display-tech select-none -translate-y-1 block ml-0.5">
            %
          </span>
        </div>

        {/* Barra de Progresso ultrafina em rosa choque */}
        <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden mt-1 relative">
          <div
            className="h-full bg-gradient-to-r from-[#ff007f]/50 to-[#ff007f] transition-all duration-300 ease-out shadow-[0_0_10px_#ff007f]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}


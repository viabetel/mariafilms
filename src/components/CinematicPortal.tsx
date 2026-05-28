import { useRef } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

export function CinematicPortal() {
  const portalRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(portalRef);

  // Map progress to clip-path circle radius (in vw)
  // Starts at 12vw, expands to 150vw after progress passes 0.15
  const radius = progress < 0.15 
    ? 12 
    : 12 + Math.pow((progress - 0.15) / 0.85, 1.8) * 138;

  // Map progress to lens scale and rotation
  const lensScale = progress < 0.15 
    ? 1 
    : 1 + Math.pow((progress - 0.15) / 0.85, 1.8) * 11.5;
  const lensRotate = progress * 480;

  // Cinematic text animation helpers
  // Step 1: "a essência da cena / está na verdade / do movimento" (centered at 0.28)
  const getStep1Style = () => {
    const center = 0.28;
    const range = 0.15;
    const diff = progress - center;
    const isActive = Math.abs(diff) < range && progress < 0.82;
    const opacity = isActive ? 1 - Math.pow(Math.abs(diff) / range, 2) : 0;
    const blur = isActive ? Math.abs(diff) * 40 : 20;

    return {
      opacity,
      display: isActive ? 'flex' : 'none',
      filter: `blur(${blur}px)`,
    };
  };

  // Step 2: "cada corte é um / instante esculpido / no tempo" (centered at 0.50)
  const getStep2Style = () => {
    const center = 0.50;
    const range = 0.15;
    const diff = progress - center;
    const isActive = Math.abs(diff) < range && progress < 0.82;
    const opacity = isActive ? 1 - Math.pow(Math.abs(diff) / range, 2) : 0;
    const blur = isActive ? Math.abs(diff) * 40 : 20;

    return {
      opacity,
      display: isActive ? 'flex' : 'none',
      filter: `blur(${blur}px)`,
    };
  };

  // Step 3: "direção que dá / alma e ritmo / às imagens" (centered at 0.72)
  const getStep3Style = () => {
    const center = 0.72;
    const range = 0.15;
    const diff = progress - center;
    const isActive = Math.abs(diff) < range && progress < 0.82;
    const opacity = isActive ? 1 - Math.pow(Math.abs(diff) / range, 2) : 0;
    const blur = isActive ? Math.abs(diff) * 40 : 20;

    return {
      opacity,
      display: isActive ? 'flex' : 'none',
      filter: `blur(${blur}px)`,
    };
  };

  // Step 4: Final Manifesto & Expanding CTA Container (appears as video fills screen, stays visible at end)
  const getStep4Style = () => {
    const start = 0.80;
    const isActive = progress > start;
    // Smooth transition from 0 to 1 between progress 0.80 and 0.95
    const opacity = isActive ? Math.min(1, (progress - start) / 0.15) : 0;
    const blur = isActive ? Math.max(0, 15 - ((progress - start) / 0.15) * 15) : 15;
    const translateY = isActive ? Math.max(0, 50 - ((progress - start) / 0.15) * 50) : 50;

    return {
      opacity,
      display: isActive ? 'flex' : 'none',
      filter: `blur(${blur}px)`,
      transform: `translateY(${translateY}px)`,
    };
  };

  return (
    <section ref={portalRef} className="relative h-[250vh] bg-black z-25">
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        {/* Background mechanical lines grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        {/* Video portal masked with circular clip-path */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-75 ease-out"
          style={{
            clipPath: `circle(${radius}vw at 50% 50%)`,
            WebkitClipPath: `circle(${radius}vw at 50% 50%)`,
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-105"
          >
            <source src="/Efeit Festa.webm" type="video/webm" />
            <source src="/Efeit Festa.mp4" type="video/mp4" />
          </video>
          {/* Contrast vignette mask overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none mix-blend-multiply opacity-50" />
        </div>

        {/* Camera Lens HUD Ring overlay (fades out as video fills the screen) */}
        <div 
          className="absolute pointer-events-none w-72 h-72 md:w-96 md:h-96 transition-all duration-75 ease-out text-white/40"
          style={{
            transform: `rotate(${lensRotate}deg) scale(${lensScale})`,
            opacity: progress > 0.85 ? Math.max(0, 1 - (progress - 0.85) * 10) : 1,
          }}
        >
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full" strokeWidth="0.5">
            <circle cx="50" cy="50" r="48" strokeDasharray="1,1.5" />
            <circle cx="50" cy="50" r="45" />
            <circle cx="50" cy="50" r="44" strokeDasharray="3,6" />
            <circle cx="50" cy="50" r="28" />
            <circle cx="50" cy="50" r="27" strokeDasharray="1,1" />
            <path d="M 50 2 L 50 10 M 50 90 L 50 98 M 2 50 L 10 50 M 90 50 L 98 50" />
            <path d="M 50 22 C 55 30 65 35 72 35" />
            <path d="M 72 35 C 75 42 75 52 72 65" />
            <path d="M 72 65 C 65 72 55 77 50 78" />
            <path d="M 50 78 C 45 77 35 72 28 65" />
            <path d="M 28 65 C 25 52 25 42 28 35" />
            <path d="M 28 35 C 35 30 45 22 50 22" />
          </svg>
        </div>

        {/* Kinetic Typography & CTA Overlay Layers */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          
          {/* Step 1: "a essência da cena / está na verdade / do movimento" */}
          <div 
            style={getStep1Style()}
            className="absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out"
          >
            <span className="text-neutral-400/60 text-xs uppercase tracking-[0.3em] mb-4 block font-mono">
              [ manifesto // parte i ]
            </span>
            <div 
              className="text-[6vw] md:text-[5vw] text-white font-extrabold tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{ transform: `translateX(${(0.28 - progress) * 150}px)` }}
            >
              a essência da cena
            </div>
            <div 
              className="text-[9vw] md:text-[7vw] font-black tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.8)',
                color: 'transparent',
                transform: `scale(${1 + Math.abs(progress - 0.28) * 0.5})`,
              }}
            >
              está na verdade
            </div>
            <div 
              className="text-[7vw] md:text-[6vw] text-white font-extrabold tracking-tighter leading-none lowercase transition-transform duration-300"
              style={{ transform: `translateX(${(progress - 0.28) * 150}px)` }}
            >
              do movimento
            </div>
          </div>

          {/* Step 2: "cada corte é um / instante esculpido / no tempo" */}
          <div 
            style={getStep2Style()}
            className="absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out"
          >
            <span className="text-neutral-400/60 text-xs uppercase tracking-[0.3em] mb-4 block font-mono">
              [ manifesto // parte ii ]
            </span>
            <div 
              className="text-[7vw] md:text-[6vw] text-white font-extrabold tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{ transform: `translateX(${(0.50 - progress) * 180}px)` }}
            >
              cada corte é um
            </div>
            <div 
              className="text-[8vw] md:text-[6.5vw] font-black tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.8)',
                color: 'transparent',
                transform: `rotate(${(progress - 0.50) * 15}deg)`,
              }}
            >
              instante esculpido
            </div>
            <div 
              className="text-[9vw] md:text-[7vw] text-white font-extrabold tracking-tighter leading-none lowercase transition-transform duration-300"
              style={{ transform: `translateX(${(progress - 0.50) * 180}px)` }}
            >
              no tempo
            </div>
          </div>

          {/* Step 3: "direção que dá / alma e ritmo / às imagens" */}
          <div 
            style={getStep3Style()}
            className="absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out"
          >
            <span className="text-neutral-400/60 text-xs uppercase tracking-[0.3em] mb-4 block font-mono">
              [ manifesto // parte iii ]
            </span>
            <div 
              className="text-[6vw] md:text-[5vw] text-white font-extrabold tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{ transform: `translateY(${(0.72 - progress) * 100}px)` }}
            >
              direção que dá
            </div>
            <div 
              className="text-[9vw] md:text-[7.5vw] font-black tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.8)',
                color: 'transparent',
                transform: `scale(${1 - Math.abs(progress - 0.72) * 0.2})`,
              }}
            >
              alma e ritmo
            </div>
            <div 
              className="text-[8vw] md:text-[6.5vw] text-white font-extrabold tracking-tighter leading-none lowercase transition-transform duration-300"
              style={{ transform: `translateY(${(progress - 0.72) * 100}px)` }}
            >
              às imagens
            </div>
          </div>

          {/* Step 4: Final Manifesto & Expanding Contact Button (Overlay when video fills background) */}
          <div 
            style={getStep4Style()}
            className="absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out pointer-events-auto"
          >
            <span className="text-neutral-400/60 text-xs uppercase tracking-[0.3em] mb-4 block font-mono">
              [ contato // let's create ]
            </span>
            
            <h2 className="hero-title text-white text-[9vw] md:text-[7vw] font-black tracking-tighter leading-none lowercase mb-1">
              coloque sua visão
            </h2>
            <h2 
              className="hero-title text-[9vw] md:text-[7vw] font-black tracking-tighter leading-none lowercase mb-6"
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.8)',
                color: 'transparent',
              }}
            >
              em movimento
            </h2>

            <p className="max-w-[420px] text-xs md:text-sm text-white/70 mb-8 leading-relaxed lowercase">
              seja para um comercial, documentário ou narrativa autoral. vamos traduzir sua mensagem em imagens inesquecíveis.
            </p>

            {/* Expanding Contact Button on Hover with Hot Pink details */}
            <div className="flex flex-col items-center gap-6 w-full">
              <a 
                href="mailto:contato@mariafilms.com"
                className="group/btn relative flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-normal rounded-full h-14 px-8 w-60 hover:w-72 hover:bg-[#ff007f] hover:border-[#ff007f] hover:text-white transition-all duration-500 ease-in-out shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,0,127,0.4)]"
              >
                <span className="lowercase font-medium tracking-tight">vamos conversar</span>
                <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 delay-100 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </a>

              {/* Social links with hover effects */}
              <div className="flex items-center gap-8 mt-2">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-[#ff007f] transition-colors text-[10px] tracking-widest uppercase font-mono"
                >
                  instagram
                </a>
                <a 
                  href="https://vimeo.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-[#ff007f] transition-colors text-[10px] tracking-widest uppercase font-mono"
                >
                  vimeo
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-[#ff007f] transition-colors text-[10px] tracking-widest uppercase font-mono"
                >
                  youtube
                </a>
              </div>

              {/* Clients & Partners Logotypes row */}
              <div className="mt-12 w-full max-w-md border-t border-white/10 pt-8 opacity-40">
                <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 block mb-4 font-mono">
                  parceiros & clientes
                </span>
                <div className="flex justify-center items-center gap-6 md:gap-8 text-[11px] font-medium tracking-widest text-neutral-300 uppercase font-mono">
                  <span>vogue</span>
                  <span className="text-white/20">•</span>
                  <span>audi</span>
                  <span className="text-white/20">•</span>
                  <span>red bull</span>
                  <span className="text-white/20">•</span>
                  <span>netflix</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* HUD metadata detail */}
        <div 
          className="absolute bottom-10 left-6 md:left-10 flex flex-col gap-1 z-20 font-mono text-[10px] text-neutral-500 uppercase tracking-widest transition-opacity duration-300"
          style={{ opacity: progress > 0.85 ? 0 : 1 }}
        >
          <div>focando // lente criativa</div>
          <div>abertura // {Math.round(radius * 10) / 10}vw</div>
        </div>
      </div>
    </section>
  );
}

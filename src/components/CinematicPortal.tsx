import { useRef, useState, useEffect } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

export function CinematicPortal() {
  const portalRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(portalRef);
  const portalLockRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  // States for progressive briefing questionnaire
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    format: '',
    budget: '',
    deadline: '',
    name: '',
    email: '',
    description: ''
  });

  const resetForm = () => {
    setFormStep(1);
    setFormData({
      format: '',
      budget: '',
      deadline: '',
      name: '',
      email: '',
      description: ''
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Briefing de Projeto - ${formData.name}`);
    const body = encodeURIComponent(
      `olá Maria,\n\n` +
      `envio as respostas do formulário de briefing para iniciarmos nossa conversa:\n\n` +
      `// formato do projeto:\n` +
      `- ${formData.format}\n\n` +
      `// estimativa de orçamento:\n` +
      `- ${formData.budget}\n\n` +
      `// prazo de entrega:\n` +
      `- ${formData.deadline}\n\n` +
      `// detalhes do contato:\n` +
      `- nome: ${formData.name}\n` +
      `- email: ${formData.email}\n\n` +
      `// descrição do projeto:\n` +
      `"${formData.description}"\n\n` +
      `aguardo retorno!`
    );

    window.location.href = `mailto:contato@mariafilms.com?subject=${subject}&body=${body}`;
    setIsFormOpen(false);
    resetForm();
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Smart Active Scroll Jacking & Snapping para o Efeito Festa (CinematicPortal)
  useEffect(() => {
    if (isMobile) return;

    const container = portalRef.current;
    if (!container) return;

    const targets = [0.22, 0.45, 0.68, 0.85];
    const maxStep = targets.length - 1;

    const getClosestStep = (currentProgress: number) => {
      let currentStep = 0;
      let minDiff = Infinity;
      targets.forEach((t, idx) => {
        const diff = Math.abs(t - currentProgress);
        if (diff < minDiff) {
          minDiff = diff;
          currentStep = idx;
        }
      });
      return currentStep;
    };

    const handleWheel = (e: WheelEvent) => {
      if (isFormOpen) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      const currentProgress = -rect.top / totalScrollable;

      if (portalLockRef.current) {
        e.preventDefault();
        return;
      }

      const delta = e.deltaY;
      const currentStep = getClosestStep(currentProgress);

      if (delta > 0) {
        // ROLANDO PARA BAIXO

        // Caso 1: Seção entrando na tela por baixo
        if (rect.top > 2 && rect.top < window.innerHeight * 0.45) {
          e.preventDefault();
          portalLockRef.current = true;
          window.scrollTo({
            top: window.scrollY + rect.top + targets[0] * totalScrollable,
            behavior: 'smooth'
          });
          setTimeout(() => {
            portalLockRef.current = false;
          }, 800);
          return;
        }

        // Caso 2: Totalmente ativo / travado dentro da seção
        if (rect.top <= 2 && rect.bottom >= window.innerHeight - 2) {
          if (currentStep < maxStep) {
            e.preventDefault();
            portalLockRef.current = true;
            const nextStep = currentStep + 1;
            window.scrollTo({
              top: window.scrollY + rect.top + targets[nextStep] * totalScrollable,
              behavior: 'smooth'
            });
            setTimeout(() => {
              portalLockRef.current = false;
            }, 800);
          }
        }
      } else if (delta < 0) {
        // ROLANDO PARA CIMA

        // Caso 1: Seção entrando na tela por cima (usuário vindo de baixo)
        if (rect.bottom < window.innerHeight - 2 && rect.bottom > window.innerHeight * 0.55) {
          e.preventDefault();
          portalLockRef.current = true;
          window.scrollTo({
            top: window.scrollY + rect.top + targets[maxStep] * totalScrollable,
            behavior: 'smooth'
          });
          setTimeout(() => {
            portalLockRef.current = false;
          }, 800);
          return;
        }

        // Caso 2: Totalmente ativo / travado dentro da seção
        if (rect.top <= 2 && rect.bottom >= window.innerHeight - 2) {
          if (currentStep > 0) {
            e.preventDefault();
            portalLockRef.current = true;
            const prevStep = currentStep - 1;
            window.scrollTo({
              top: window.scrollY + rect.top + targets[prevStep] * totalScrollable,
              behavior: 'smooth'
            });
            setTimeout(() => {
              portalLockRef.current = false;
            }, 800);
          }
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isFormOpen) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      const currentProgress = -rect.top / totalScrollable;

      if (portalLockRef.current) {
        e.preventDefault();
        return;
      }

      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY; // positivo = deslizar para cima (scroll para baixo)

      // Sensibilidade mínima para touch (20px) - reduzido de 30px
      if (Math.abs(deltaY) < 20) return;

      const currentStep = getClosestStep(currentProgress);

      if (deltaY > 0) {
        // DESLIZANDO PARA BAIXO (dedo vai para cima)

        // Caso 1: Seção entrando na tela por baixo
        if (rect.top > 2 && rect.top < window.innerHeight * 0.45) {
          e.preventDefault();
          portalLockRef.current = true;
          window.scrollTo({
            top: window.scrollY + rect.top + targets[0] * totalScrollable,
            behavior: 'smooth'
          });
          setTimeout(() => {
            portalLockRef.current = false;
          }, 800);
          return;
        }

        // Caso 2: Totalmente ativo / travado
        if (rect.top <= 2 && rect.bottom >= window.innerHeight - 2) {
          if (currentStep < maxStep) {
            e.preventDefault();
            portalLockRef.current = true;
            const nextStep = currentStep + 1;
            window.scrollTo({
              top: window.scrollY + rect.top + targets[nextStep] * totalScrollable,
              behavior: 'smooth'
            });
            setTimeout(() => {
              portalLockRef.current = false;
            }, 800);
          }
        }
      } else if (deltaY < 0) {
        // DESLIZANDO PARA CIMA (dedo vai para baixo)

        // Caso 1: Seção entrando na tela por cima
        if (rect.bottom < window.innerHeight - 2 && rect.bottom > window.innerHeight * 0.55) {
          e.preventDefault();
          portalLockRef.current = true;
          window.scrollTo({
            top: window.scrollY + rect.top + targets[maxStep] * totalScrollable,
            behavior: 'smooth'
          });
          setTimeout(() => {
            portalLockRef.current = false;
          }, 800);
          return;
        }

        // Caso 2: Totalmente ativo / travado
        if (rect.top <= 2 && rect.bottom >= window.innerHeight - 2) {
          if (currentStep > 0) {
            e.preventDefault();
            portalLockRef.current = true;
            const prevStep = currentStep - 1;
            window.scrollTo({
              top: window.scrollY + rect.top + targets[prevStep] * totalScrollable,
              behavior: 'smooth'
            });
            setTimeout(() => {
              portalLockRef.current = false;
            }, 800);
          }
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isFormOpen, isMobile]);

  // Responsive values for aperture scale and lens rotation based on scroll progress
  const baseAperture = isMobile ? 21 : 12; // Em vw, para casar com a abertura do blueprint no mobile/desktop
  const scaleExponent = isMobile ? 1.2 : 1.8;
  const lensScaleMultiplier = isMobile ? 14 : 11.5;

  const lensScale = progress < 0.12 
    ? 1 
    : 1 + Math.pow((progress - 0.12) / 0.88, scaleExponent) * lensScaleMultiplier;

  // Sincroniza a abertura da máscara com a escala da lente
  const apertureRadius = baseAperture * lensScale;
  const rotationDeg = progress * 480;

  // Helper functions for step styles
  const getStep1Style = () => {
    const range = 0.1;
    const center = 0.22;
    const diff = progress - center;
    const active = Math.abs(diff) < range && progress < 0.82;
    const opacity = active ? 1 - Math.pow(Math.abs(diff) / range, 2) : 0;
    const blur = active ? Math.abs(diff) * 40 : 20;
    return {
      opacity,
      display: active ? 'flex' : 'none',
      filter: isMobile ? 'none' : `blur(${blur}px)`,
    };
  };

  const getStep2Style = () => {
    const range = 0.1;
    const center = 0.45;
    const diff = progress - center;
    const active = Math.abs(diff) < range && progress < 0.82;
    const opacity = active ? 1 - Math.pow(Math.abs(diff) / range, 2) : 0;
    const blur = active ? Math.abs(diff) * 40 : 20;
    return {
      opacity,
      display: active ? 'flex' : 'none',
      filter: isMobile ? 'none' : `blur(${blur}px)`,
    };
  };

  const getStep3Style = () => {
    const range = 0.1;
    const center = 0.68;
    const diff = progress - center;
    const active = Math.abs(diff) < range && progress < 0.82;
    const opacity = active ? 1 - Math.pow(Math.abs(diff) / range, 2) : 0;
    const blur = active ? Math.abs(diff) * 40 : 20;
    return {
      opacity,
      display: active ? 'flex' : 'none',
      filter: isMobile ? 'none' : `blur(${blur}px)`,
    };
  };

  const getStep4Style = () => {
    const start = 0.75;
    const active = progress > start;
    const opacity = active ? Math.min(1, (progress - start) / 0.1) : 0;
    const blur = active ? Math.max(0, 15 - ((progress - start) / 0.1) * 15) : 15;
    const translateY = active ? Math.max(0, 50 - ((progress - start) / 0.1) * 50) : 50;
    return {
      opacity,
      display: active ? 'flex' : 'none',
      filter: isMobile ? 'none' : `blur(${blur}px)`,
      transform: `translateY(${translateY}px)`,
    };
  };

  return (
    <section ref={portalRef} id="contact" className="relative h-[350vh] bg-black z-25">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        {/* Video aperture reveal */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-75 ease-out"
          style={{
            clipPath: `circle(${apertureRadius}vw at 50% 50%)`,
            WebkitClipPath: `circle(${apertureRadius}vw at 50% 50%)`,
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-105"
            src="https://drive.google.com/uc?export=download&id=1Wm2CodoGzSpFAXqjDdKhj1ShoS68hHpz"
          />
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none mix-blend-multiply opacity-50" />
        </div>

        {/* Dynamic camera lens aperture blueprint overlay */}
        <div 
          className="absolute pointer-events-none w-72 h-72 md:w-96 md:h-96 transition-all duration-75 ease-out text-white/40"
          style={{
            ...(isMobile ? { width: '75vw', height: '75vw' } : {}),
            transform: `rotate(${rotationDeg}deg) scale(${lensScale})`,
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
            {/* Shutter blades */}
            <path d="M 50 22 C 55 30 65 35 72 35" />
            <path d="M 72 35 C 75 42 75 52 72 65" />
            <path d="M 72 65 C 65 72 55 77 50 78" />
            <path d="M 50 78 C 45 77 35 72 28 65" />
            <path d="M 28 65 C 25 52 25 42 28 35" />
            <path d="M 28 35 C 35 30 45 22 50 22" />
          </svg>
        </div>

        {/* Text stages container */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          
          {/* Step 1: "a essência do vídeo / está no impacto / do conteúdo" */}
          <div 
            style={getStep1Style()}
            className="absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out"
          >
            <span className="text-neutral-400/60 text-[10px] tracking-[0.35em] uppercase mb-4 block font-display-tech font-semibold">
              [ manifesto // parte i ]
            </span>
            <div 
              className="text-[8vw] md:text-[5vw] text-white font-extrabold tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{ transform: `translateX(${(0.22 - progress) * (isMobile ? 35 : 150)}px)` }}
            >
              a essência da cena
            </div>
            <div 
              className="text-[11vw] md:text-[7vw] font-black tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.8)',
                color: 'transparent',
                transform: `scale(${1 + Math.abs(progress - 0.22) * (isMobile ? 0.25 : 0.5)})`,
              }}
            >
              está na verdade
            </div>
            <div 
              className="text-[9vw] md:text-[6vw] text-white font-extrabold tracking-tighter leading-none lowercase transition-transform duration-300"
              style={{ transform: `translateX(${(progress - 0.22) * (isMobile ? 35 : 150)}px)` }}
            >
              do movimento
            </div>
          </div>

          {/* Step 2: "cada corte é feito / para reter a atenção / do início ao fim" */}
          <div 
            style={getStep2Style()}
            className="absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out"
          >
            <span className="text-neutral-400/60 text-[10px] tracking-[0.35em] uppercase mb-4 block font-display-tech font-semibold">
              [ manifesto // parte ii ]
            </span>
            <div 
              className="text-[9vw] md:text-[6vw] text-white font-extrabold tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{ transform: `translateX(${(0.45 - progress) * (isMobile ? 35 : 180)}px)` }}
            >
              cada corte é um
            </div>
            <div 
              className="text-[11vw] md:text-[6.5vw] font-black tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.8)',
                color: 'transparent',
                transform: `rotate(${(progress - 0.45) * (isMobile ? 4 : 15)}deg)`,
              }}
            >
              instante esculpido
            </div>
            <div 
              className="text-[12vw] md:text-[7vw] text-white font-extrabold tracking-tighter leading-none lowercase transition-transform duration-300"
              style={{ transform: `translateX(${(progress - 0.45) * (isMobile ? 35 : 180)}px)` }}
            >
              no tempo
            </div>
          </div>

          {/* Step 3: "direção que dá / alma e ritmo / às imagens" */}
          <div 
            style={getStep3Style()}
            className="absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out"
          >
            <span className="text-neutral-400/60 text-[10px] tracking-[0.35em] uppercase mb-4 block font-display-tech font-semibold">
              [ manifesto // parte iii ]
            </span>
            <div 
              className="text-[8vw] md:text-[5vw] text-white font-extrabold tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{ transform: `translateY(${(0.68 - progress) * (isMobile ? 25 : 100)}px)` }}
            >
              direção que dá
            </div>
            <div 
              className="text-[12vw] md:text-[7.5vw] font-black tracking-tighter leading-none lowercase mb-2 transition-transform duration-300"
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.8)',
                color: 'transparent',
                transform: `scale(${1 - Math.abs(progress - 0.68) * 0.2})`,
              }}
            >
              alma e ritmo
            </div>
            <div 
              className="text-[10vw] md:text-[6.5vw] text-white font-extrabold tracking-tighter leading-none lowercase transition-transform duration-300"
              style={{ transform: `translateY(${(progress - 0.68) * (isMobile ? 25 : 100)}px)` }}
            >
              às imagens
            </div>
          </div>

          {/* Step 4: Final CTA block */}
          <div 
            style={getStep4Style()}
            className="absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out pointer-events-auto"
          >
            <span className="text-neutral-400/60 text-[10px] tracking-[0.35em] uppercase mb-4 block font-display-tech font-semibold select-none">
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

            {/* Iniciar Briefing Button */}
            <div className="flex flex-col items-center gap-6 w-full">
              <button 
                onClick={() => setIsFormOpen(true)}
                className="group/btn relative flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-normal rounded-full h-14 px-8 w-60 hover:w-72 hover:bg-[#ff007f] hover:border-[#ff007f] hover:text-white transition-all duration-500 ease-in-out shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,0,127,0.4)] cursor-pointer"
              >
                <span className="lowercase font-medium tracking-tight">iniciar briefing</span>
                <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 delay-100 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </button>

              {/* Social links */}
              <div className="flex items-center gap-6 mt-2">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-[#ff007f] transition-all duration-300 hover:scale-110 p-2"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a 
                  href="https://vimeo.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-[#ff007f] transition-all duration-300 hover:scale-110 p-2"
                  aria-label="Vimeo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 6.54c-1.35.53-2.92.83-4.11.83C15.86 7.37 14 9.17 14 11.23c0 2.21 1.95 3.9 4.14 3.9 1.15 0 2.65-.26 3.86-.71V6.54z"/>
                    <path d="M2 11.23c0-2.21 1.95-3.9 4.14-3.9 1.15 0 2.65.26 3.86.71v7.88c-1.35-.53-2.92-.83-4.11-.83C3.86 15.13 2 13.33 2 11.23z"/>
                    <path d="M10 6.54c-1.35.53-2.92.83-4.11.83v7.88c1.35-.53 2.92-.83 4.11-.83V6.54z"/>
                  </svg>
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-[#ff007f] transition-all duration-300 hover:scale-110 p-2"
                  aria-label="YouTube"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>
              </div>

              {/* Partners logo footer */}
              <div className="mt-6 md:mt-12 w-full max-w-md border-t border-white/10 pt-4 md:pt-8 opacity-40 hidden md:block">
                <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 block mb-4 font-display-tech font-semibold">
                  parceiros & clientes
                </span>
                <div className="flex justify-center items-center gap-6 md:gap-8 text-[11px] font-medium tracking-widest text-neutral-300 uppercase font-display-tech">
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

        {/* Interactive SVG Sidebar Navigation Dock */}
        <div className="hidden md:flex absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 flex-col gap-4 z-30 select-none bg-neutral-950/45 backdrop-blur-xl border border-white/5 px-2.5 py-5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {[0, 1, 2, 3].map((idx) => {
            let active = false;
            if (idx === 0) active = progress >= 0.08 && progress < 0.33;
            if (idx === 1) active = progress >= 0.33 && progress < 0.56;
            if (idx === 2) active = progress >= 0.56 && progress < 0.80;
            if (idx === 3) active = progress >= 0.80;
            
            return (
              <div 
                key={idx} 
                className="flex items-center justify-end gap-3 group cursor-pointer pointer-events-auto relative p-1"
                onClick={() => {
                  if (!portalRef.current) return;
                  const rect = portalRef.current.getBoundingClientRect();
                  const totalScrollable = rect.height - window.innerHeight;
                  let targetProgress = 0.22;
                  if (idx === 1) targetProgress = 0.45;
                  if (idx === 2) targetProgress = 0.68;
                  if (idx === 3) targetProgress = 0.85;
                  
                  window.scrollTo({
                    top: window.scrollY + rect.top + targetProgress * totalScrollable,
                    behavior: 'smooth'
                  });
                }}
              >
                {/* Tooltip Label */}
                <span className={`absolute right-10 text-[9px] uppercase tracking-widest text-[#ff007f] font-display-tech bg-black/80 border border-white/5 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${active ? 'border-[#ff007f]/30' : ''}`}>
                  {idx === 0 && 'essência'}
                  {idx === 1 && 'esculpir'}
                  {idx === 2 && 'ritmo'}
                  {idx === 3 && 'contato'}
                </span>

                {/* SVG Icon Button */}
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 hover:scale-110 hover:border-[#ff007f] ${
                    active
                      ? 'bg-[#ff007f]/10 border-[#ff007f] text-[#ff007f] shadow-[0_0_12px_rgba(255,0,127,0.35)]'
                      : 'border-white/10 bg-transparent text-neutral-400 group-hover:text-white group-hover:border-white/20'
                  }`}
                >
                  {idx === 0 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v18M17 3v18M3 7.5h4M3 12h4M3 16.5h4M17 7.5h4M17 12h4M17 16.5h4" />
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                      <circle cx="12" cy="12" r="10" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.31 8 5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" />
                    </svg>
                  )}
                  {idx === 2 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10v4M6 6v12M9 4v16M12 7v10M15 5v14M18 8v8M21 11v2" />
                    </svg>
                  )}
                  {idx === 3 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m22 2-7 20-4-9-9-4Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* HUD metadata detail */}
        <div 
          className="absolute bottom-10 left-6 md:left-10 flex flex-col gap-1 z-20 font-display-tech text-[10px] text-neutral-500 uppercase tracking-widest transition-opacity duration-300"
          style={{ opacity: progress > 0.85 ? 0 : 1 }}
        >
          <div>focando // lente criativa</div>
          <div>abertura // {Math.round(apertureRadius * 10) / 10}vw</div>
        </div>
      </div>

      {/* Progressive Briefing Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 transition-all duration-500 ease-in-out animate-fadeIn pointer-events-auto">
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 md:top-10 md:right-10 z-50 p-3 rounded-full bg-white/5 border border-white/10 hover:border-[#ff007f] hover:bg-[#ff007f] hover:text-white transition-all duration-300 hover:rotate-90 text-neutral-400 group"
            onClick={() => setIsFormOpen(false)}
            aria-label="Fechar formulário"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Card */}
          <div className="relative w-full max-w-xl bg-neutral-950/70 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col gap-8">
            {/* Header / Progress Bar */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between font-display-tech text-[10px] text-neutral-500 uppercase tracking-widest">
                <span>briefing // etapa {formStep} de 4</span>
                <span className="text-[#ff007f] font-bold">{formStep * 25}% completo</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ff007f] transition-all duration-300"
                  style={{ width: `${formStep * 25}%` }}
                />
              </div>
            </div>

            {/* Form Fields according to formStep */}
            <form onSubmit={handleFormSubmit} className="flex-grow flex flex-col gap-6">
              {formStep === 1 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <h3 className="font-serif-editorial italic text-2xl text-white mb-2">qual é o formato do seu projeto?</h3>
                  {[
                    'videomaking institucional',
                    'reels / tik tok / shorts',
                    'campanha comercial',
                    'narrativa / curta-metragem',
                    'outro / projeto híbrido'
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({ ...formData, format: option })}
                      className={`w-full text-left px-6 py-4 rounded-xl border text-xs font-display-tech uppercase tracking-wider transition-all duration-300 ${
                        formData.format === option
                          ? 'border-[#ff007f] bg-[#ff007f]/10 text-white shadow-[0_0_15px_rgba(255,0,127,0.2)]'
                          : 'border-white/5 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {formStep === 2 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <h3 className="font-serif-editorial italic text-2xl text-white mb-2">qual é a estimativa de orçamento?</h3>
                  {[
                    'sob consulta / a definir',
                    'até R$ 3.000',
                    'R$ 3.000 a R$ 10.000',
                    'acima de R$ 10.000'
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({ ...formData, budget: option })}
                      className={`w-full text-left px-6 py-4 rounded-xl border text-xs font-display-tech uppercase tracking-wider transition-all duration-300 ${
                        formData.budget === option
                          ? 'border-[#ff007f] bg-[#ff007f]/10 text-white shadow-[0_0_15px_rgba(255,0,127,0.2)]'
                          : 'border-white/5 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {formStep === 3 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <h3 className="font-serif-editorial italic text-2xl text-white mb-2">qual é o prazo desejado?</h3>
                  {[
                    'urgente (1 a 2 semanas)',
                    'médio prazo (1 mês)',
                    'flexível (2 meses ou mais)'
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({ ...formData, deadline: option })}
                      className={`w-full text-left px-6 py-4 rounded-xl border text-xs font-display-tech uppercase tracking-wider transition-all duration-300 ${
                        formData.deadline === option
                          ? 'border-[#ff007f] bg-[#ff007f]/10 text-white shadow-[0_0_15px_rgba(255,0,127,0.2)]'
                          : 'border-white/5 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {formStep === 4 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <h3 className="font-serif-editorial italic text-2xl text-white mb-2">detalhes de contato</h3>
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="seu nome ou empresa"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-display-tech uppercase tracking-wider placeholder-neutral-600 focus:border-[#ff007f] outline-none transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="seu email de contato"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-display-tech uppercase tracking-wider placeholder-neutral-600 focus:border-[#ff007f] outline-none transition-colors"
                    />
                    <textarea
                      placeholder="conte-nos um pouco sobre a sua ideia..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-display-tech uppercase tracking-wider placeholder-neutral-600 focus:border-[#ff007f] outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              )}
            </form>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              {formStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setFormStep(formStep - 1)}
                  className="px-6 py-2.5 rounded-full border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white transition-all text-[10px] font-display-tech uppercase tracking-wider cursor-pointer"
                >
                  voltar
                </button>
              ) : (
                <div />
              )}

              {/* Forward/Submit Button */}
              {formStep < 4 ? (
                <button
                  type="button"
                  disabled={
                    (formStep === 1 && !formData.format) ||
                    (formStep === 2 && !formData.budget) ||
                    (formStep === 3 && !formData.deadline)
                  }
                  onClick={() => setFormStep(formStep + 1)}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 text-black transition-all text-[10px] font-display-tech font-bold uppercase tracking-wider disabled:cursor-not-allowed cursor-pointer"
                >
                  avançar
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!formData.name || !formData.email}
                  onClick={handleFormSubmit}
                  className="px-8 py-2.5 rounded-full bg-[#ff007f] hover:bg-[#ff007f]/90 disabled:bg-neutral-800 disabled:text-neutral-600 text-white transition-all text-[10px] font-display-tech font-bold uppercase tracking-wider disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,0,127,0.3)] cursor-pointer"
                >
                  enviar briefing
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

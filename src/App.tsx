import { useRef, useState, useEffect } from 'react';
import { useScrollProgress } from './hooks/useScrollProgress';
import { ScrollytellingCanvas } from './components/ScrollytellingCanvas';
import { PortfolioSection } from './components/PortfolioSection';
import { CinematicPortal } from './components/CinematicPortal';
import { IntroLoader } from './components/IntroLoader';
import { ShowreelSection } from './components/ShowreelSection';
import { EditorialSection } from './components/EditorialSection';
import { WorkflowSection } from './components/WorkflowSection';

function App() {
  const scrollytellingRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(scrollytellingRef);
  const scrollytellingLockRef = useRef(false);
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Smart Scroll Jacking & Snapping para o Scrollytelling (Câmera 360)
  useEffect(() => {
    const container = scrollytellingRef.current;
    if (!container) return;

    const targets = [0.08, 0.24, 0.41, 0.58, 0.74, 0.91];
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
      const rect = container.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;

      // Calcular o progresso atual
      const currentProgress = -rect.top / totalScrollable;

      // Se estiver travado por animação anterior, previne o scroll e ignora
      if (scrollytellingLockRef.current) {
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
          scrollytellingLockRef.current = true;
          window.scrollTo({
            top: window.scrollY + rect.top + targets[0] * totalScrollable,
            behavior: 'smooth'
          });
          setTimeout(() => {
            scrollytellingLockRef.current = false;
          }, 800);
          return;
        }

        // Caso 2: Totalmente ativo / travado dentro da seção
        if (rect.top <= 2 && rect.bottom >= window.innerHeight - 2) {
          if (currentStep < maxStep) {
            e.preventDefault();
            scrollytellingLockRef.current = true;
            const nextStep = currentStep + 1;
            window.scrollTo({
              top: window.scrollY + rect.top + targets[nextStep] * totalScrollable,
              behavior: 'smooth'
            });
            setTimeout(() => {
              scrollytellingLockRef.current = false;
            }, 800);
          }
        }
      } else if (delta < 0) {
        // ROLANDO PARA CIMA

        // Caso 1: Seção entrando na tela por cima (usuário vindo de baixo)
        if (rect.bottom < window.innerHeight - 2 && rect.bottom > window.innerHeight * 0.55) {
          e.preventDefault();
          scrollytellingLockRef.current = true;
          window.scrollTo({
            top: window.scrollY + rect.top + targets[maxStep] * totalScrollable,
            behavior: 'smooth'
          });
          setTimeout(() => {
            scrollytellingLockRef.current = false;
          }, 800);
          return;
        }

        // Caso 2: Totalmente ativo / travado dentro da seção
        if (rect.top <= 2 && rect.bottom >= window.innerHeight - 2) {
          if (currentStep > 0) {
            e.preventDefault();
            scrollytellingLockRef.current = true;
            const prevStep = currentStep - 1;
            window.scrollTo({
              top: window.scrollY + rect.top + targets[prevStep] * totalScrollable,
              behavior: 'smooth'
            });
            setTimeout(() => {
              scrollytellingLockRef.current = false;
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
      const rect = container.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      const currentProgress = -rect.top / totalScrollable;

      if (scrollytellingLockRef.current) {
        e.preventDefault();
        return;
      }

      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY; // positivo = deslizar para cima (scroll para baixo)

      // Sensibilidade mínima para touch (20px) - reduzido de 30px para precisar de menos força!
      if (Math.abs(deltaY) < 20) return;

      const currentStep = getClosestStep(currentProgress);

      if (deltaY > 0) {
        // DESLIZANDO PARA BAIXO (dedo vai para cima)
        
        // Caso 1: Seção entrando na tela por baixo
        if (rect.top > 2 && rect.top < window.innerHeight * 0.45) {
          e.preventDefault();
          scrollytellingLockRef.current = true;
          window.scrollTo({
            top: window.scrollY + rect.top + targets[0] * totalScrollable,
            behavior: 'smooth'
          });
          setTimeout(() => {
            scrollytellingLockRef.current = false;
          }, 800);
          return;
        }

        // Caso 2: Totalmente ativo / travado
        if (rect.top <= 2 && rect.bottom >= window.innerHeight - 2) {
          if (currentStep < maxStep) {
            e.preventDefault();
            scrollytellingLockRef.current = true;
            const nextStep = currentStep + 1;
            window.scrollTo({
              top: window.scrollY + rect.top + targets[nextStep] * totalScrollable,
              behavior: 'smooth'
            });
            setTimeout(() => {
              scrollytellingLockRef.current = false;
            }, 800);
          }
        }
      } else if (deltaY < 0) {
        // DESLIZANDO PARA CIMA (dedo vai para baixo)

        // Caso 1: Seção entrando na tela por cima
        if (rect.bottom < window.innerHeight - 2 && rect.bottom > window.innerHeight * 0.55) {
          e.preventDefault();
          scrollytellingLockRef.current = true;
          window.scrollTo({
            top: window.scrollY + rect.top + targets[maxStep] * totalScrollable,
            behavior: 'smooth'
          });
          setTimeout(() => {
            scrollytellingLockRef.current = false;
          }, 800);
          return;
        }

        // Caso 2: Totalmente ativo / travado
        if (rect.top <= 2 && rect.bottom >= window.innerHeight - 2) {
          if (currentStep > 0) {
            e.preventDefault();
            scrollytellingLockRef.current = true;
            const prevStep = currentStep - 1;
            window.scrollTo({
              top: window.scrollY + rect.top + targets[prevStep] * totalScrollable,
              behavior: 'smooth'
            });
            setTimeout(() => {
              scrollytellingLockRef.current = false;
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
  }, []);
  const [loaderComplete, setLoaderComplete] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [logoHover, setLogoHover] = useState(false);
  const [heroBtn1Hover, setHeroBtn1Hover] = useState(false);
  const [heroBtn2Hover, setHeroBtn2Hover] = useState(false);
  const [heroScroll, setHeroScroll] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavbarLight, setIsNavbarLight] = useState(false);

  // Monitor contrast section (#about) to toggle light/dark Navbar
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsNavbarLight(entry.isIntersecting);
    }, {
      rootMargin: '-80px 0px -85% 0px',
      threshold: 0
    });
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      observer.observe(aboutSection);
    }
    return () => {
      if (aboutSection) {
        observer.unobserve(aboutSection);
      }
    };
  }, [loaderComplete]);

  // Track Hero scroll progress (0 to 1)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = window.innerHeight;
      setHeroScroll(Math.min(Math.max(scrollY / height, 0), 1));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Monitor screen width for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Canvas processing to remove dark background from logo image dynamically
  useEffect(() => {
    const img = new Image();
    img.src = '/logo.jpg';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setLogoUrl('/logo.jpg');
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const rVal = data[i];
        const gVal = data[i + 1];
        const bVal = data[i + 2];
        // Convert dark pixels (representing background) to transparent
        if (rVal < 75 && gVal < 75 && bVal < 75) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      setLogoUrl(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      setLogoUrl('/logo.jpg');
    };
  }, []);

  // Helper styling for scrollytelling step transitions
  const getScrollytellingStyle = (stepProgress: number) => {
    const diff = progress - stepProgress;
    const opacity = Math.pow(Math.max(0, Math.min(1, (0.08 - Math.abs(diff)) / 0.05)), 1.5);
    const rotateX = diff * -30;
    const translateY = diff * (isMobile ? 80 : 150);
    return {
      opacity,
      display: opacity > 0 ? 'flex' as const : 'none' as const,
      transform: `translateY(${translateY}px) rotateX(${rotateX}deg)`,
      transformOrigin: 'center center'
    };
  };

  return (
    <>
      {/* Intro Page Loader */}
      {!loaderComplete && (
        <IntroLoader onComplete={() => setLoaderComplete(true)} />
      )}

      {/* Global Navigation Header */}
      <nav className="fixed z-30 px-4 md:px-10 pt-4 md:pt-6 top-0 left-0 right-0 flex items-center justify-between gap-4 pointer-events-none">
        {/* Branding Logo */}
        <div
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
          className={`flex items-center justify-center rounded-full transition-all duration-300 pointer-events-auto border ${
            isMobile ? 'px-4 py-2 min-h-[48px]' : 'px-6 py-3.5 min-h-[72px]'
          }`}
          style={{
            backgroundColor: isNavbarLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: logoHover
              ? 'rgba(255, 0, 127, 0.4)'
              : isNavbarLight
              ? 'rgba(0, 0, 0, 0.12)'
              : 'rgba(255, 255, 255, 0.15)',
            boxShadow: isNavbarLight
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.05)'
              : '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="maria eduarda logo"
              className={`${isMobile ? 'h-8' : 'h-14'} w-auto select-none transition-all duration-300`}
              style={{
                filter: isNavbarLight
                  ? 'invert(1) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))'
                  : 'drop-shadow(0 2px 10px rgba(255,255,255,0.25))'
              }}
            />
          ) : (
            <span className={`text-xs md:text-sm font-normal tracking-tight py-1 px-3 transition-colors duration-300 ${
              isNavbarLight ? 'text-black' : 'text-white'
            }`}>
              maria films
            </span>
          )}
        </div>

        {/* Menu Navigation Links */}
        <div
          className="hidden md:flex items-center gap-1 rounded-full px-4 py-3 border pointer-events-auto transition-all duration-300"
          style={{
            backgroundColor: isNavbarLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: isNavbarLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
            boxShadow: isNavbarLight ? '0 8px 32px 0 rgba(0, 0, 0, 0.05)' : '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
          }}
        >
          <a
            href="#films"
            className={`transition-colors text-base px-6 py-2.5 rounded-full font-medium ${
              isNavbarLight ? 'text-neutral-800 hover:text-[#ff007f]' : 'text-neutral-300 hover:text-[#ff007f]'
            }`}
          >
            filmes
          </a>
          <a
            href="#about"
            className={`transition-colors text-base px-6 py-2.5 rounded-full font-medium ${
              isNavbarLight ? 'text-neutral-800 hover:text-[#ff007f]' : 'text-neutral-300 hover:text-[#ff007f]'
            }`}
          >
            sobre
          </a>
          <a
            href="#services"
            className={`transition-colors text-base px-6 py-2.5 rounded-full font-medium ${
              isNavbarLight ? 'text-neutral-800 hover:text-[#ff007f]' : 'text-neutral-300 hover:text-[#ff007f]'
            }`}
          >
            serviços
          </a>
          <a
            href="#contact"
            className={`transition-colors text-base px-6 py-2.5 rounded-full font-medium ${
              isNavbarLight ? 'text-neutral-800 hover:text-[#ff007f]' : 'text-neutral-300 hover:text-[#ff007f]'
            }`}
          >
            contato
          </a>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          className={`rounded-full font-medium transition-all duration-300 pointer-events-auto border hover:scale-102 ${
            isMobile ? 'px-5 py-2.5 text-xs' : 'px-8 py-4 text-base'
          }`}
          style={{
            backgroundColor: btnHover
              ? 'rgba(255, 0, 127, 0.2)'
              : isNavbarLight
              ? 'rgba(255, 255, 255, 0.65)'
              : 'rgba(255, 255, 255, 0.06)',
            color: btnHover ? '#ffffff' : isNavbarLight ? '#171717' : '#ffffff',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: btnHover
              ? '#ff007f'
              : isNavbarLight
              ? 'rgba(0, 0, 0, 0.12)'
              : 'rgba(255, 255, 255, 0.15)',
            boxShadow: btnHover
              ? '0 0 25px rgba(255, 0, 127, 0.4)'
              : isNavbarLight
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.05)'
              : '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
          }}
        >
          vamos conversar
        </button>
      </nav>

      {/* Hero Section Container */}
      <div className="relative w-full h-screen bg-black z-10">
        {heroScroll < 1 && (
          <section
            className="fixed inset-0 w-full h-screen overflow-hidden bg-black flex items-center pt-24 pb-12"
            style={{
              pointerEvents: heroScroll >= 0.85 ? 'none' : 'auto'
            }}
          >
            {/* Camera Object Background */}
            <div
              className="absolute inset-y-0 right-0 w-full md:w-[50%] h-full flex items-center justify-center md:justify-end pointer-events-none z-0"
              style={{
                opacity: (isMobile ? 0.35 : 0.9 - heroScroll * 1.5) * (1 - heroScroll),
                transform: `scale(${1 - heroScroll * 0.05}) translateY(${heroScroll * (isMobile ? 15 : 30)}px)`,
                transition: 'opacity 0.05s ease-out, transform 0.05s ease-out'
              }}
            >
              <img
                src="/hero_camera.webp"
                alt="Canon EOS-1 Ds"
                className="w-full max-w-[450px] md:max-w-none md:h-[72vh] md:w-auto object-contain opacity-70 md:opacity-90 transition-opacity duration-700"
                style={{
                  mixBlendMode: 'screen',
                  filter: 'contrast(1.1) brightness(0.95)',
                  maxHeight: '100%',
                  maxWidth: '100%'
                }}
              />
            </div>

            {/* Typography & Stats Overlay */}
            <div
              className="relative z-10 container mx-auto px-6 md:px-12 w-full flex flex-col md:flex-row items-center gap-12 min-h-[80vh]"
              style={{
                opacity: 1 - heroScroll * 2,
                transform: `translateY(-${heroScroll * (isMobile ? 40 : 80)}px)`,
                transition: 'opacity 0.05s ease-out, transform 0.05s ease-out'
              }}
            >
              <div className="w-full md:w-[60%] flex flex-col gap-8 items-start text-left pointer-events-auto">
                {/* Director Header Badge */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/12 bg-neutral-900 flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <img
                      src="/maria_portrait.png"
                      alt="Maria Eduarda"
                      className="w-full h-full object-cover object-[center_20%]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] tracking-[0.25em] text-neutral-300 uppercase font-semibold font-display-tech">
                        maria films
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#ff007f] shadow-[0_0_6px_#ff007f] animate-pulse" />
                    </div>
                    <span className="text-[8px] text-neutral-500 uppercase font-display-tech tracking-widest mt-0.5">
                      direção por maria eduarda
                    </span>
                  </div>
                </div>

                {/* Slogan */}
                <div className="flex flex-col select-none tracking-tight leading-[0.82] gap-1">
                  <span className="font-serif-editorial italic text-[11vw] md:text-[6vw] font-light text-neutral-400 lowercase leading-[0.9]">
                    esculpindo
                  </span>
                  <span className="font-display-tech font-extrabold text-[13vw] md:text-[7.5vw] uppercase tracking-tighter text-white leading-[0.82]">
                    o tempo.
                  </span>
                </div>

                {/* Glass Card Description */}
                <div
                  className="w-full max-w-md border rounded-2xl p-6 md:p-8 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    borderColor: 'rgba(255, 255, 255, 0.07)',
                    boxShadow: '0 16px 45px 0 rgba(0, 0, 0, 0.6)'
                  }}
                >
                  <p className="text-xs md:text-[13px] text-neutral-400 leading-relaxed lowercase mb-6">
                    transformamos visões brutas em narrativas cinematográficas de alto impacto. esculpimos cada corte com rigor estético, ritmo cirúrgico e ressonância emocional.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3.5 w-full">
                    {/* View portfolio CTA */}
                    <a
                      href="#films"
                      onMouseEnter={() => setHeroBtn1Hover(true)}
                      onMouseLeave={() => setHeroBtn1Hover(false)}
                      className="flex-1 flex items-center justify-between border rounded-full h-12 pl-5 pr-1.5 transition-all duration-300 text-[10px] uppercase tracking-wider font-semibold font-display-tech relative group overflow-hidden"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: heroBtn1Hover ? 'rgba(255, 0, 127, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        boxShadow: heroBtn1Hover ? '0 0 25px rgba(255, 0, 127, 0.25)' : 'none',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)'
                      }}
                    >
                      <span>ver portfólio</span>
                      <div
                        className="w-8 h-8 rounded-full bg-[#ff007f] flex items-center justify-center transition-all duration-300"
                        style={{
                          transform: heroBtn1Hover ? 'translateX(2px)' : 'none'
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          className="w-3.5 h-3.5 text-white"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </a>

                    {/* Start project briefing CTA */}
                    <a
                      href="#contact"
                      onMouseEnter={() => setHeroBtn2Hover(true)}
                      onMouseLeave={() => setHeroBtn2Hover(false)}
                      className="flex-1 flex items-center justify-center border rounded-full h-12 px-5 transition-all duration-300 text-[10px] uppercase tracking-wider font-semibold font-display-tech"
                      style={{
                        backgroundColor: heroBtn2Hover ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                        borderColor: heroBtn2Hover ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)'
                      }}
                    >
                      <span>iniciar projeto</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="hidden md:block w-full md:w-[40%] pointer-events-none" />
            </div>

            {/* Real-time stats footer HUD */}
            <div
              className="absolute bottom-6 left-0 right-0 z-10 w-full px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 pointer-events-none"
              style={{
                opacity: 1 - heroScroll * 2.5,
                transition: 'opacity 0.05s ease-out'
              }}
            >
              {/* Mobile stats panel */}
              <div className="md:hidden grid grid-cols-3 gap-2 w-full border-t border-white/5 pt-4 pointer-events-auto">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white leading-none font-display-tech">+85</span>
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-1 font-display-tech">filmes</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white leading-none font-display-tech">+45m</span>
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-1 font-display-tech">views</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-[#ff007f] leading-none font-display-tech">+12</span>
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-1 font-display-tech">prêmios</span>
                </div>
              </div>

              {/* Desktop Left Stat */}
              <div className="hidden md:flex flex-col items-start pointer-events-auto group/stat cursor-default">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-display-tech tracking-tight text-white transition-all duration-300 group-hover/stat:text-[#ff007f]">
                    +85
                  </span>
                  <span className="h-px w-8 bg-white/10" />
                  <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-display-tech">
                    filmes finalizados
                  </span>
                </div>
              </div>

              {/* Desktop Center Scroll indicator */}
              <div className="hidden md:flex flex-col items-center gap-1.5 opacity-40">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-display-tech">scroll</span>
                <div className="w-4 h-7 border border-white/20 rounded-full flex justify-center p-1">
                  <div className="w-1 h-1.5 bg-white rounded-full animate-bounce" />
                </div>
              </div>

              {/* Desktop Right Stat */}
              <div className="hidden md:flex flex-col items-end pointer-events-auto group/stat cursor-default">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-display-tech">
                    visualizações geradas
                  </span>
                  <span className="h-px w-8 bg-white/10" />
                  <span className="text-2xl font-bold font-display-tech tracking-tight text-white transition-all duration-300 group-hover/stat:text-[#ff007f]">
                    +45m
                  </span>
                </div>
              </div>
            </div>

            {/* Black background fade at bottom */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black z-10" />
          </section>
        )}
      </div>

      {/* Showreel Section */}
      <ShowreelSection />

      {/* Scrollytelling / Manifesto Canvas Section */}
      <section ref={scrollytellingRef} className="relative h-[600vh] bg-black z-20 -mt-[250vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-black">
          <ScrollytellingCanvas scrollProgress={progress} frameCount={130} />
          
          {/* Manifesto Typography Overlays */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" style={{ perspective: '1200px' }}>
            <div className="absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6" style={getScrollytellingStyle(0.08)}>
              <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold">
                01 // visão
              </span>
              <h2 className="hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase">
                concepção criativa
              </h2>
              <p className="max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase">
                desenhando profundidade visual antes mesmo da câmera ligar. cada frame é imaginado e planejado como uma obra de arte única.
              </p>
            </div>

            <div className="absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6" style={getScrollytellingStyle(0.24)}>
              <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold">
                02 // roteiro
              </span>
              <h2 className="hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase">
                desenvolvimento
              </h2>
              <p className="max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase">
                estruturando narrativas envolventes. transformamos ideias soltas em arcos dramáticos consistentes e de alta ressonância emocional.
              </p>
            </div>

            <div className="absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6" style={getScrollytellingStyle(0.41)}>
              <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold">
                03 // produção
              </span>
              <h2 className="hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase">
                direção criativa
              </h2>
              <p className="max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase">
                traduzindo ideias conceituais em narrativas de tela impactantes. direção completa de atores e orquestração de toda a equipe no set.
              </p>
            </div>

            <div className="absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6" style={getScrollytellingStyle(0.58)}>
              <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold">
                04 // luz
              </span>
              <h2 className="hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase">
                fotografia
              </h2>
              <p className="max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase">
                esculpindo ambientes através de iluminação precisa e composição geométrica. equipamentos de cinema que garantem textura orgânica.
              </p>
            </div>

            <div className="absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6" style={getScrollytellingStyle(0.74)}>
              <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold">
                05 // montagem
              </span>
              <h2 className="hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase">
                ritmo e corte
              </h2>
              <p className="max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase">
                onde o filme realmente nasce. costuramos as cenas com precisão cirúrgica para ditar o tempo da narrativa e segurar a atenção.
              </p>
            </div>

            <div className="absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6" style={getScrollytellingStyle(0.91)}>
              <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold">
                06 // execução
              </span>
              <h2 className="hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase">
                pós-produção
              </h2>
              <p className="max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase">
                colorização meticulosa (color grading) e design de som imersivo (sound design). lapidamos sequências brutas em peças perfeitas.
              </p>
            </div>
          </div>

          {/* Real-time scroll indicator watermark at the bottom */}
          <div className="absolute bottom-8 left-6 md:left-10 z-20 font-display-tech text-[10px] text-neutral-500 uppercase tracking-widest flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>camera-control // active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff007f] animate-pulse" />
            </div>
            <span className="h-3 w-px bg-white/10" />
            <span className="text-white/80">
              {progress < 0.28 && 'lente // 24mm f/1.4'}
              {progress >= 0.28 && progress < 0.68 && 'lente // 50mm f/1.2'}
              {progress >= 0.68 && 'lente // 85mm f/1.4'}
            </span>
          </div>

          {/* Bottom HUD progress bar */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20">
            <span className="text-[10px] text-neutral-500 tracking-wider font-display-tech">01</span>
            <div className="h-[2px] w-24 bg-neutral-900 relative rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-[#ff007f] transition-all duration-75"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-500 tracking-wider font-display-tech">06</span>
            <span className="text-[10px] text-neutral-400 font-display-tech tracking-widest ml-1 opacity-80">
              ({Math.round(progress * 100)}%)
            </span>
          </div>

          {/* Interactive SVG Sidebar Navigation Dock */}
          <div className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-30 select-none bg-neutral-950/45 backdrop-blur-xl border border-white/5 px-2.5 py-5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              let active = false;
              // Active ranges for the 6 steps
              if (idx === 0) active = progress >= 0.0 && progress < 0.16;
              if (idx === 1) active = progress >= 0.16 && progress < 0.32;
              if (idx === 2) active = progress >= 0.32 && progress < 0.50;
              if (idx === 3) active = progress >= 0.50 && progress < 0.66;
              if (idx === 4) active = progress >= 0.66 && progress < 0.82;
              if (idx === 5) active = progress >= 0.82;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-end gap-3 group cursor-pointer pointer-events-auto relative p-1"
                  onClick={() => {
                    if (!scrollytellingRef.current) return;
                    const rect = scrollytellingRef.current.getBoundingClientRect();
                    const totalScrollable = rect.height - window.innerHeight;
                    const targets = [0.08, 0.24, 0.41, 0.58, 0.74, 0.91];
                    const targetProgress = targets[idx];

                    window.scrollTo({
                      top: window.scrollY + rect.top + targetProgress * totalScrollable,
                      behavior: 'smooth'
                    });
                  }}
                >
                  {/* Tooltip Label */}
                  <span className={`absolute right-10 text-[9px] uppercase tracking-widest text-[#ff007f] font-display-tech bg-black/80 border border-white/5 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${active ? 'border-[#ff007f]/30' : ''}`}>
                    {idx === 0 && 'visão'}
                    {idx === 1 && 'roteiro'}
                    {idx === 2 && 'produção'}
                    {idx === 3 && 'luz'}
                    {idx === 4 && 'montagem'}
                    {idx === 5 && 'execução'}
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                    {idx === 1 && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    )}
                    {idx === 2 && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    )}
                    {idx === 3 && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25V4.5m0 15v2.25m6.75-11.25h-2.25m-9 0H3.75m14.801-4.801-1.59 1.59m-8.422 8.422-1.59 1.59m11.602 0-1.59-1.59m-8.422-8.422-1.59-1.59" />
                      </svg>
                    )}
                    {idx === 4 && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                        <circle cx="6" cy="6" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <line x1="20" y1="4" x2="8.12" y2="15.88" />
                        <line x1="14.47" y1="14.48" x2="20" y2="20" />
                        <line x1="8.12" y1="8.12" x2="12" y2="12" />
                      </svg>
                    )}
                    {idx === 5 && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <WorkflowSection />

      {/* Editorial Section */}
      <EditorialSection />

      {/* Portfolio Section */}
      <PortfolioSection />

      {/* Cinematic Portal Form & Footer */}
      <CinematicPortal />
    </>
  );
}

export default App;

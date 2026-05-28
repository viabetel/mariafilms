import { useRef, useState, useEffect } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

// Floating cinema words that scatter on the white background
const FLOATING_WORDS = [
  { text: 'cinema', x: 12, y: 18, size: 'text-3xl md:text-5xl', weight: 'font-black', rotate: -12 },
  { text: 'narrativa', x: 72, y: 14, size: 'text-xl md:text-3xl', weight: 'font-bold', rotate: 8 },
  { text: 'luz', x: 85, y: 38, size: 'text-4xl md:text-6xl', weight: 'font-black', rotate: -5 },
  { text: 'corte', x: 8, y: 55, size: 'text-2xl md:text-4xl', weight: 'font-extrabold', rotate: 15 },
  { text: 'câmera', x: 78, y: 72, size: 'text-xl md:text-3xl', weight: 'font-bold', rotate: -8 },
  { text: 'direção', x: 22, y: 78, size: 'text-3xl md:text-5xl', weight: 'font-black', rotate: 6 },
  { text: 'frame', x: 55, y: 85, size: 'text-lg md:text-2xl', weight: 'font-semibold', rotate: -18 },
  { text: 'som', x: 42, y: 12, size: 'text-2xl md:text-4xl', weight: 'font-extrabold', rotate: 10 },
  { text: 'emoção', x: 88, y: 55, size: 'text-lg md:text-2xl', weight: 'font-bold', rotate: -3 },
  { text: 'ritmo', x: 5, y: 35, size: 'text-xl md:text-3xl', weight: 'font-extrabold', rotate: -22 },
  { text: 'montagem', x: 60, y: 28, size: 'text-lg md:text-2xl', weight: 'font-semibold', rotate: 14 },
  { text: 'foco', x: 35, y: 65, size: 'text-2xl md:text-4xl', weight: 'font-black', rotate: -7 },
  { text: 'cor', x: 18, y: 45, size: 'text-xl md:text-3xl', weight: 'font-bold', rotate: 20 },
  { text: 'textura', x: 68, y: 48, size: 'text-lg md:text-xl', weight: 'font-semibold', rotate: -15 },
  { text: 'história', x: 48, y: 42, size: 'text-xl md:text-3xl', weight: 'font-bold', rotate: 5 },
];

// Floating SVG icons
const FLOATING_ICONS = [
  // Camera
  { x: 30, y: 22, rotate: 12, icon: 'M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z' },
  // Play
  { x: 65, y: 60, rotate: -8, icon: 'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z' },
  // Film
  { x: 15, y: 68, rotate: 25, icon: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m1.5-2.625c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5m1.5 0A1.125 1.125 0 0 1 18 15.75' },
  // Star
  { x: 82, y: 25, rotate: -15, icon: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z' },
  // Eye
  { x: 45, y: 75, rotate: 6, icon: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
  // Sparkle
  { x: 92, y: 80, rotate: 30, icon: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z' },
];

export function CinematicPortal() {
  const portalRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(portalRef);
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

  // Lens expansion: starts at 5vw, fills screen (~80vw diagonal) at progress ~0.65
  const lensRadius = 5 + Math.pow(Math.min(1, progress / 0.60), 2.2) * 85;
  // After lens fills screen, we're fully black — show the CTA
  const isFilled = lensRadius > 78;
  const ctaOpacity = isFilled ? Math.min(1, (lensRadius - 78) / 10) : 0;

  // Lens SVG overlay rotation
  const lensRotation = progress * 360;
  const lensScale = 0.8 + Math.pow(Math.min(1, progress / 0.60), 1.5) * 10;

  return (
    <section ref={portalRef} id="contact" className="relative h-[400vh] z-25">
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* Layer 1: White background with floating words & icons */}
        <div className="absolute inset-0 bg-white">
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

          {/* Floating cinema words — scatter outward as lens expands */}
          {FLOATING_WORDS.map((word, i) => {
            // Calculate scatter direction (away from center)
            const dx = word.x - 50;
            const dy = word.y - 50;
            const scatter = Math.pow(Math.min(1, progress / 0.55), 1.5);
            const scatterX = dx * scatter * 2.5;
            const scatterY = dy * scatter * 2.5;
            const wordOpacity = Math.max(0, 1 - scatter * 1.2);
            const wordScale = 1 - scatter * 0.3;

            return (
              <div
                key={i}
                className={`absolute ${word.size} ${word.weight} text-black/[0.06] uppercase tracking-tighter select-none pointer-events-none will-change-transform`}
                style={{
                  left: `${word.x}%`,
                  top: `${word.y}%`,
                  transform: `translate(-50%, -50%) translate(${scatterX}vw, ${scatterY}vh) rotate(${word.rotate + progress * 20}deg) scale(${wordScale})`,
                  opacity: wordOpacity,
                }}
              >
                {word.text}
              </div>
            );
          })}

          {/* Floating SVG icons */}
          {FLOATING_ICONS.map((ic, i) => {
            const dx = ic.x - 50;
            const dy = ic.y - 50;
            const scatter = Math.pow(Math.min(1, progress / 0.55), 1.5);
            const scatterX = dx * scatter * 2.5;
            const scatterY = dy * scatter * 2.5;
            const iconOpacity = Math.max(0, 0.08 - scatter * 0.1);

            return (
              <svg
                key={`icon-${i}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1"
                stroke="currentColor"
                className="absolute w-8 h-8 md:w-12 md:h-12 text-black pointer-events-none select-none will-change-transform"
                style={{
                  left: `${ic.x}%`,
                  top: `${ic.y}%`,
                  transform: `translate(-50%, -50%) translate(${scatterX}vw, ${scatterY}vh) rotate(${ic.rotate + progress * 30}deg)`,
                  opacity: iconOpacity,
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={ic.icon} />
              </svg>
            );
          })}
        </div>

        {/* Layer 2: Black circle (the lens) expanding from center — clip-path on a black div */}
        <div
          className="absolute inset-0 bg-black will-change-transform"
          style={{
            clipPath: `circle(${lensRadius}vw at 50% 50%)`,
            WebkitClipPath: `circle(${lensRadius}vw at 50% 50%)`,
          }}
        >
          {/* Video background inside lens */}
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110">
            <source src="/Efeit Festa.webm" type="video/webm" />
            <source src="/Efeit Festa.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />
        </div>

        {/* Layer 3: Lens aperture SVG overlay — rotates and scales with scroll */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: Math.max(0, 1 - Math.pow(Math.min(1, progress / 0.50), 1.5) * 1.3),
          }}
        >
          <div
            className="w-48 h-48 md:w-72 md:h-72 text-neutral-400"
            style={{
              transform: `rotate(${lensRotation}deg) scale(${lensScale})`,
            }}
          >
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full" strokeWidth="0.4">
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
        </div>

        {/* Layer 4: HUD metadata — visible during lens phase */}
        <div
          className="absolute bottom-10 left-6 md:left-10 flex flex-col gap-1 z-20 font-display-tech text-[10px] uppercase tracking-widest pointer-events-none"
          style={{
            opacity: Math.max(0, 1 - progress * 2.5),
            color: lensRadius < 30 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)',
            transition: 'color 0.5s ease',
          }}
        >
          <div>focando // lente criativa</div>
          <div>abertura // {Math.round(lensRadius * 10) / 10}vw</div>
        </div>

        {/* Layer 5: CTA content — fades in after lens fills screen */}
        <div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          style={{
            opacity: ctaOpacity,
          }}
        >
          <div className="flex flex-col items-center text-center px-6 pointer-events-auto">
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
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-[#ff007f] transition-all duration-300 hover:scale-110 p-2" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="https://vimeo.com" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-[#ff007f] transition-all duration-300 hover:scale-110 p-2" aria-label="Vimeo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 6.54c-1.35.53-2.92.83-4.11.83C15.86 7.37 14 9.17 14 11.23c0 2.21 1.95 3.9 4.14 3.9 1.15 0 2.65-.26 3.86-.71V6.54z"/>
                    <path d="M2 11.23c0-2.21 1.95-3.9 4.14-3.9 1.15 0 2.65.26 3.86.71v7.88c-1.35-.53-2.92-.83-4.11-.83C3.86 15.13 2 13.33 2 11.23z"/>
                    <path d="M10 6.54c-1.35.53-2.92.83-4.11.83v7.88c1.35-.53 2.92-.83 4.11-.83V6.54z"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-[#ff007f] transition-all duration-300 hover:scale-110 p-2" aria-label="YouTube">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>
              </div>

              {/* Partners */}
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

            {/* Form Fields */}
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

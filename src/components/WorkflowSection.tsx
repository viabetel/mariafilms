import { useRef, useEffect, useState } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

interface WorkflowStep {
  num: string;
  phase: string;
  title: string;
  subtitle: string;
  description: string;
  specs: string[];
  icon: React.ReactNode;
}

const steps: WorkflowStep[] = [
  {
    num: '01',
    phase: 'planejamento //',
    title: 'roteiro & ganchos',
    subtitle: 'a estratégia do primeiro segundo',
    description: 'antes de iniciar as gravações, desenhamos a estratégia do conteúdo. estruturamos roteiros dinâmicos focados nos primeiros 3 segundos (hooks de atenção) e organizamos a grade de ideias para tiktok, reels e youtube shorts.',
    specs: ['roteirização', 'estratégia de gancho', 'análise de concorrência', 'decupagem de roteiro'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-[#ff007f]/40 group-hover:text-[#ff007f] transition-colors duration-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    )
  },
  {
    num: '02',
    phase: 'captação //',
    title: 'videomaking dinâmico',
    subtitle: 'imagens que geram engajamento',
    description: 'gravamos com equipamentos ágeis e portáteis de alta performance. focamos na captação de iluminação prática, enquadramentos modernos e transições orgânicas em câmera, garantindo que o material bruto seja dinâmico e otimizado para o consumo em tela vertical.',
    specs: ['luz prática', 'transições em câmera', 'framing vertical (mobile)', 'áudio direcional'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-[#ff007f]/40 group-hover:text-[#ff007f] transition-colors duration-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    )
  },
  {
    num: '03',
    phase: 'lapidação //',
    title: 'edição & retenção',
    subtitle: 'o ritmo acelerado que magnetiza',
    description: 'na edição de vídeo, construímos a retenção da audiência. aplicamos cortes precisos no ritmo da música, efeitos sonoros (SFX) comerciais, legendas dinâmicas sincronizadas e um color grading vibrante para destacar a marca nas redes sociais.',
    specs: ['cortes de ritmo', 'legendas dinâmicas', 'sound design comercial', 'color grading ativo'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-[#ff007f]/40 group-hover:text-[#ff007f] transition-colors duration-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
      </svg>
    )
  }
];

export function WorkflowSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(containerRef);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isStickyDisabled, setIsStickyDisabled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Disable sticky behavior if viewport height is too small (< 720px) or on mobile (< 768px width)
      setIsStickyDisabled(window.innerHeight < 720 || window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (progress >= 0.33 && progress < 0.66) {
      setActiveIndex(1);
    } else if (progress >= 0.66) {
      setActiveIndex(2);
    } else {
      setActiveIndex(0);
    }
  }, [progress]);

  // Calculate neon pink progress line height (prefilled dynamically)
  const linePercentage = Math.min(100, Math.max(0, progress * 100));

  return (
    <section 
      ref={containerRef} 
      id="services" 
      className={`relative bg-black text-white z-20 ${
        isStickyDisabled ? 'h-auto py-16 md:py-24' : 'h-auto md:h-[250vh]'
      }`}
    >
      <div 
        className={`relative w-full flex flex-col justify-center px-6 md:px-16 max-w-6xl mx-auto py-16 md:py-0 overflow-visible ${
          isStickyDisabled ? 'h-auto' : 'md:sticky md:top-0 md:h-screen md:overflow-hidden'
        }`}
      >
        
        {/* Section Header */}
        <div className="flex flex-col gap-2 mb-6 md:mb-8 select-none">
          <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] font-display-tech font-semibold">
            processo criativo //
          </span>
          <h2 className="font-display-tech text-white font-medium text-[8vw] md:text-[4vw] leading-tight tracking-tighter lowercase">
            como criamos valor
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 max-w-md lowercase font-sans leading-relaxed mt-2">
            nosso processo é otimizado para transformar ideias brutas em vídeos de alta retenção e impacto visual.
          </p>
        </div>

        {/* Timeline container */}
        <div className="relative flex flex-col md:flex-row gap-6 md:gap-5 lg:gap-8 pl-8 md:pl-0 md:pt-8">
          
          {/* Vertical line indicator (mobile only) */}
          <div className="absolute left-[3px] top-4 bottom-4 w-[2px] bg-white/10 rounded-full md:hidden">
            <div 
              className="w-full bg-[#ff007f] rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(255,0,127,0.8)]"
              style={{ height: `${linePercentage}%` }}
            />
          </div>

          {/* Horizontal line indicator (desktop only) */}
          <div className="hidden md:block absolute left-0 right-0 top-0 h-[2px] bg-white/10 rounded-full">
            <div 
              className="h-full bg-[#ff007f] rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(255,0,127,0.8)]"
              style={{ width: `${linePercentage}%` }}
            />
          </div>

          {/* Workflow Steps list */}
          {steps.map((step, idx) => {
            const isActive = idx === activeIndex || isStickyDisabled;

            return (
              <div 
                key={step.num}
                className="relative flex flex-col gap-4 md:gap-5 items-start transition-all duration-500 group flex-1 w-full"
              >
                {/* Timeline node */}
                <div 
                  className={`absolute -left-[33px] md:left-1/2 md:-translate-x-1/2 top-1.5 md:-top-[6px] w-3 h-3 rounded-full border-2 transition-all duration-500 flex items-center justify-center z-10 ${
                    isActive 
                      ? 'bg-[#ff007f] border-[#ff007f] scale-125 shadow-[0_0_8px_#ff007f]' 
                      : 'bg-black border-white/20'
                  }`}
                />

                {/* Step Info */}
                <div className="w-full flex flex-col gap-1 md:gap-1.5 md:text-center md:items-center">
                  <div className="flex items-center gap-3 md:justify-center">
                    <span className="text-[10px] tracking-wider text-[#ff007f] font-display-tech font-semibold uppercase">
                      {step.phase}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-display-tech">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-display-tech text-white text-xl md:text-2xl font-semibold tracking-tight leading-snug lowercase">
                    {step.title}
                  </h3>
                  <span className="text-[10px] font-sans font-light italic text-neutral-400 lowercase">
                    {step.subtitle}
                  </span>
                </div>

                {/* Description Card */}
                <div 
                  className={`w-full p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden group-hover:border-white/10 flex-grow md:min-h-[200px] ${
                    isActive 
                      ? 'border-[#ff007f]/45 bg-[#0a0a0a]/80 shadow-[0_0_30px_rgba(255,0,127,0.12)] ring-1 ring-[#ff007f]/10' 
                      : 'border-white/5 bg-[#0a0a0a]/30'
                  }`}
                >
                  {/* Card Header visual HUD */}
                  <div className="flex justify-between items-center mb-4">
                    {/* Visual accent bar */}
                    <div className="absolute top-0 left-0 w-[2px] h-0 bg-[#ff007f] transition-all duration-500 group-hover:h-full" />
                    
                    {/* Active Status Glow Dot */}
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                      isActive ? 'bg-[#ff007f] shadow-[0_0_8px_#ff007f] animate-pulse' : 'bg-white/10'
                    }`} />

                    {/* SVG Icon */}
                    <div className={`transition-all duration-500 ${
                      isActive ? 'opacity-100 scale-110' : 'opacity-30 scale-95 group-hover:opacity-100 group-hover:scale-105'
                    }`}>
                      {step.icon}
                    </div>
                  </div>
                  
                  <p className="text-xs md:text-[13px] text-neutral-400 leading-relaxed lowercase mb-4">
                    {step.description}
                  </p>

                  {/* Technical Specs list */}
                  <div className="flex flex-wrap gap-2">
                    {step.specs.map((spec) => (
                      <span 
                        key={spec} 
                        className="text-[8px] md:text-[9px] font-display-tech uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-neutral-500 lowercase hover:border-white/10 hover:text-white transition-colors duration-300"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

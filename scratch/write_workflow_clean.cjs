const fs = require('fs');

const outPath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\src\\components\\WorkflowSection.tsx';

const code = `import { useRef, useEffect, useState } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

interface WorkflowStep {
  num: string;
  phase: string;
  title: string;
  subtitle: string;
  description: string;
  specs: string[];
}

const steps: WorkflowStep[] = [
  {
    num: '01',
    phase: 'planejamento //',
    title: 'roteiro & ganchos',
    subtitle: 'a estratégia do primeiro segundo',
    description: 'antes de iniciar as gravações, desenhamos a estratégia do conteúdo. estruturamos roteiros dinâmicos focados nos primeiros 3 segundos (hooks de atenção) e organizamos a grade de ideias para tiktok, reels e youtube shorts.',
    specs: ['roteirização', 'estratégia de gancho', 'análise de concorrência', 'decupagem de roteiro'],
  },
  {
    num: '02',
    phase: 'captação //',
    title: 'videomaking dinâmico',
    subtitle: 'imagens que geram engajamento',
    description: 'gravamos com equipamentos ágeis e portáteis de alta performance. focamos na captação de iluminação prática, enquadramentos modernos e transições orgânicas em câmera, garantindo que o material bruto seja dinâmico e otimizado para o consumo em tela vertical.',
    specs: ['luz prática', 'transições em câmera', 'framing vertical (mobile)', 'áudio direcional'],
  },
  {
    num: '03',
    phase: 'lapidação //',
    title: 'edição & retenção',
    subtitle: 'o ritmo acelerado que magnetiza',
    description: 'na edição de vídeo, construímos a retenção da audiência. aplicamos cortes precisos no ritmo da música, efeitos sonoros (SFX) comerciais, legendas dinâmicas sincronizadas e um color grading vibrante para destacar a marca nas redes sociais.',
    specs: ['cortes de ritmo', 'legendas dinâmicas', 'sound design comercial', 'color grading ativo'],
  }
];

export function WorkflowSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(containerRef);
  const [activeIndex, setActiveIndex] = useState(0);

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
      className="relative h-[250vh] bg-black text-white z-20"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center px-6 md:px-16 max-w-6xl mx-auto overflow-hidden">
        
        {/* Section Header */}
        <div className="flex flex-col gap-2 mb-12 md:mb-16 select-none">
          <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] font-display-tech font-semibold">
            processo criativo //
          </span>
          <h2 className="hero-title text-white font-medium text-[8vw] md:text-[5vw] leading-none lowercase">
            como criamos valor
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 max-w-md lowercase font-sans leading-relaxed mt-2">
            nosso processo é otimizado para transformar ideias brutas em vídeos de alta retenção e impacto visual.
          </p>
        </div>

        {/* Timeline container */}
        <div className="relative flex flex-col gap-8 md:gap-12 pl-8 md:pl-12">
          
          {/* Vertical line indicator */}
          <div className="absolute left-[3px] top-4 bottom-4 w-[2px] bg-white/10 rounded-full">
            <div 
              className="w-full bg-[#ff007f] rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(255,0,127,0.8)]"
              style={{ height: \`\${linePercentage}%\` }}
            />
          </div>

          {/* Workflow Steps list */}
          {steps.map((step, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div 
                key={step.num}
                className="relative flex flex-col md:flex-row gap-4 md:gap-8 items-start transition-all duration-500 group"
              >
                {/* Timeline node */}
                <div 
                  className={\`absolute -left-[33px] md:-left-[41px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-500 flex items-center justify-center \${
                    isActive 
                      ? 'bg-[#ff007f] border-[#ff007f] scale-110 shadow-[0_0_8px_#ff007f]' 
                      : 'bg-black border-white/20'
                  }\`}
                />

                {/* Step Info */}
                <div className="w-full md:w-[45%] flex flex-col gap-1.5 md:gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] tracking-wider text-[#ff007f] font-display-tech font-semibold uppercase">
                      {step.phase}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-display-tech">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="hero-title text-white text-xl md:text-2xl font-medium tracking-tight leading-none lowercase">
                    {step.title}
                  </h3>
                  <span className="text-[10px] font-sans font-light italic text-neutral-400 lowercase">
                    {step.subtitle}
                  </span>
                </div>

                {/* Description Card */}
                <div 
                  className={\`w-full md:w-[50%] p-5 md:p-6 rounded-2xl border bg-white/[0.01] backdrop-blur-xl border-white/5 transition-all duration-500 relative overflow-hidden group-hover:border-white/10 \${
                    isActive ? 'border-[#ff007f]/25 bg-white/[0.02] shadow-[0_12px_40px_rgba(0,0,0,0.4)]' : ''
                  }\`}
                >
                  {/* Visual accent bar */}
                  <div className="absolute top-0 left-0 w-[2px] h-0 bg-[#ff007f] transition-all duration-500 group-hover:h-full" />
                  
                  <p className="text-xs md:text-[13px] text-neutral-400 leading-relaxed lowercase mb-6">
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
`;

fs.writeFileSync(outPath, code, 'utf8');
console.log(`WorkflowSection.tsx written successfully to ${outPath}`);

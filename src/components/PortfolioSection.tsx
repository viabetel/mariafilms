import { useState } from 'react';

interface ProjectItem {
  id: string;
  num: string;
  category: string;
  title: string;
  description: string;
  image: string;
  details: string[];
}

const projects: ProjectItem[] = [
  {
    id: 'social-media',
    num: '01 // social media',
    category: 'reels & tiktok',
    title: 'reels & shorts',
    description: 'criação de vídeos dinâmicos de alta retenção, ganchos rápidos e edições rítmicas para marcas de moda e estilo.',
    image: '/portfolio_1.webp',
    details: ['estratégia: engajamento', 'edição: dinâmica', 'formato: 9:16 vertical', 'views: +5m'],
  },
  {
    id: 'commercial',
    num: '02 // publicidade',
    category: 'campanhas de marca',
    title: 'filmes comerciais',
    description: 'videomaking de impacto para campanhas publicitárias premium, agregando sofisticação estética e conversão de marca.',
    image: '/portfolio_2.webp',
    details: ['clientes: vogue, audi', 'captação: ágil', 'formato: híbrido', 'ano: 2026'],
  },
  {
    id: 'documentary',
    num: '03 // documentário',
    category: 'histórias reais',
    title: 'mini-docs',
    description: 'contando narrativas expressivas através de pequenos documentários focados na textura orgânica da luz e no fator humano.',
    image: '/portfolio_3.webp',
    details: ['foco: humanizado', 'direção: maria eduarda', 'formato: cinema', 'status: autoral'],
  },
  {
    id: 'institutional',
    num: '04 // corporativo',
    category: 'cultura de empresa',
    title: 'institucionais',
    description: 'vídeos corporativos modernos que conectam a essência da equipe com a visão estratégica dos fundadores.',
    image: '/portfolio_4.webp',
    details: ['ano: 2026', 'áudio: som direto', 'equipamento: raw', 'produção: ágil'],
  },
  {
    id: 'lifestyle',
    num: '05 // estilo de vida',
    category: 'moda & cotidiano',
    title: 'lifestyle films',
    description: 'filmes focados em ritmo urbano, luz prática de fim de tarde e cortes dinâmicos expressando comportamento.',
    image: '/portfolio_5.webp',
    details: ['luz: natural', 'estilo: contemporâneo', 'ritmo: musical', 'grade: fashion'],
  },
  {
    id: 'experimental',
    num: '06 // experimental',
    category: 'narrativa artística',
    title: 'filmes autorais',
    description: 'curta-metragens e experimentos visuais autorais focados em composição geométrica e luz de alto contraste.',
    image: '/portfolio_6.webp',
    details: ['direção: maria eduarda', 'som: imersivo', 'estética: cinema noir', 'ano: 2025'],
  }
];

export function PortfolioSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="films" className="relative bg-black w-full py-16 md:py-24 px-4 md:px-10 flex flex-col gap-8 md:gap-12 z-20 overflow-hidden">
      {/* Dynamic Ambient Background Glow Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {projects.map((project) => (
          <img
            key={project.id}
            src={project.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
            style={{
              opacity: hoveredId === project.id ? 0.72 : 0,
              filter: 'blur(100px) saturate(2.4) scale(1.2)',
            }}
          />
        ))}
        {/* Dynamic dark overlay for text readability */}
        <div 
          className="absolute inset-0 transition-opacity duration-700 bg-black"
          style={{
            opacity: hoveredId ? 0.32 : 0.75
          }}
        />
      </div>

      {/* Header Container */}
      <div className="relative z-10 flex flex-col gap-2 select-none">
        <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] font-display-tech font-semibold">
          portfólio selecionado //
        </span>
        <h2 className="hero-title text-white font-medium text-[8vw] md:text-[5vw] leading-none lowercase">
          trabalhos recentes
        </h2>
      </div>

      {/* Accordion Cards Grid */}
      <div className="relative z-10 flex flex-col md:flex-row md:h-[60vh] gap-3 md:gap-4 w-full">
        {projects.map((project) => (
          <div
            key={project.id}
            onMouseEnter={() => setHoveredId(project.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group flex-1 min-h-[150px] md:min-h-0 h-full overflow-hidden relative rounded-2xl transition-all duration-700 ease-in-out cursor-pointer hover:flex-[3.5] md:hover:flex-[5.0] bg-neutral-900 border border-white/5"
          >
            {/* Project Cover Image */}
            <img
              src={project.image}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40 transition-all duration-700 ease-in-out grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-65"
            />
            {/* Card gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent pointer-events-none" />

            {/* Content Container */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
              {/* Top part: Number and Hover Icon */}
              <div className="flex justify-between items-start">
                <span className="text-white/30 text-[9px] font-normal tracking-wider uppercase font-display-tech">
                  {project.num}
                </span>
                <div className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 border border-white/20 p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-[#ff007f] hover:text-white hover:border-[#ff007f] hover:shadow-[0_0_15px_rgba(255,127,0,0.4)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4 fill-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z"
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom part: Labels and Expanding Descriptions */}
              <div className="flex flex-col gap-1 text-left">
                <span className="text-neutral-400 text-[9px] uppercase tracking-widest font-display-tech">
                  {project.category}
                </span>
                <h3 className="hero-title text-white text-xl md:text-2xl font-medium tracking-tight leading-none lowercase">
                  {project.title}
                </h3>
                
                {/* Expanding Description */}
                <p className="text-neutral-400 text-xs max-w-md mt-2 leading-relaxed opacity-100 md:opacity-0 max-h-16 md:max-h-0 overflow-hidden transition-all duration-500 ease-in-out md:group-hover:opacity-100 md:group-hover:max-h-16 lowercase">
                  {project.description}
                </p>

                {/* Meta details revealed on hover */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 opacity-70 md:opacity-0 max-h-12 md:max-h-0 overflow-hidden transition-all duration-700 ease-in-out md:group-hover:opacity-70 md:group-hover:max-h-12 text-[9px] font-display-tech text-neutral-400 border-t border-white/10 pt-2">
                  {project.details.map((detail, idx) => (
                    <span key={idx} className="lowercase">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

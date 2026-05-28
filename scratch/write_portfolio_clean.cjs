const fs = require('fs');

const outPath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\src\\components\\PortfolioSection.tsx';

const code = `import { useState } from 'react';

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
    description: 'criação de vídeos dinâmicos focados em alta retenção, ganchos de atenção rápidos e edições rítmicas para marcas de moda e creators.',
    image: '/cinematic_narrative.webp',
    details: ['estratégia: engajamento', 'edição: dinâmica', 'formato: 9:16 vertical', 'views: +5m'],
  },
  {
    id: 'commercial',
    num: '02 // marcas',
    category: 'publicidade',
    title: 'vídeos comerciais',
    description: 'videomaking de impacto para campanhas publicitárias de posicionamento de produtos, agregando valor estético e conversão comercial.',
    image: '/commercial_films.webp',
    details: ['clientes: vogue, audi', 'captação: ágil', 'formato: híbrido', 'ano: 2026'],
  },
  {
    id: 'institutional',
    num: '03 // institucional',
    category: 'corporativo',
    title: 'vídeos institucionais',
    description: 'contando histórias reais de empresas e fundadores através de mini-documentários expressivos com visual sofisticado e som direto impecável.',
    image: '/documentary_stories.webp',
    details: ['ano: 2025', 'direção: maria eduarda', 'formato: curta-metragem', 'status: premiado'],
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
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
            style={{
              opacity: hoveredId === project.id ? 0.38 : 0,
              filter: 'blur(80px)',
            }}
          />
        ))}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 transition-opacity duration-500" />
      </div>

      {/* Header Container */}
      <div className="relative z-10 flex flex-col gap-2 select-none">
        <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] font-display-tech font-semibold">
          portfólio selecionado
        </span>
        <h2 className="hero-title text-white font-medium text-[8vw] md:text-[5vw] leading-none lowercase">
          trabalhos recentes
        </h2>
      </div>

      {/* Accordion Cards Grid */}
      <div className="relative z-10 flex flex-col md:flex-row md:h-[65vh] gap-3 md:gap-4 w-full">
        {projects.map((project) => (
          <div
            key={project.id}
            onMouseEnter={() => setHoveredId(project.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group flex-1 min-h-[220px] md:min-h-0 h-full overflow-hidden relative rounded-2xl transition-all duration-700 ease-in-out cursor-pointer hover:flex-[4.0] md:hover:flex-[6.0] bg-neutral-900 border border-white/5"
          >
            {/* Project Cover Image */}
            <img
              src={project.image}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40 transition-all duration-700 ease-in-out grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-60"
            />
            {/* Card gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

            {/* Content Container */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              {/* Top part: Number and Hover Icon */}
              <div className="flex justify-between items-start">
                <span className="text-white/30 text-[10px] font-normal tracking-wider uppercase font-display-tech">
                  {project.num}
                </span>
                <div className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 border border-white/20 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-[#ff007f] hover:text-white hover:border-[#ff007f] hover:shadow-[0_0_15px_rgba(255,0,127,0.4)]">
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
              <div className="flex flex-col gap-1">
                <span className="text-neutral-400 text-[10px] uppercase tracking-widest font-display-tech">
                  {project.category}
                </span>
                <h3 className="hero-title text-white text-2xl md:text-3xl font-medium tracking-tight leading-none lowercase">
                  {project.title}
                </h3>
                
                {/* Expanding Description */}
                <p className="text-neutral-400 text-xs md:text-sm max-w-md mt-2 leading-relaxed opacity-100 md:opacity-0 max-h-20 md:max-h-0 overflow-hidden transition-all duration-500 ease-in-out md:group-hover:opacity-100 md:group-hover:max-h-20 lowercase">
                  {project.description}
                </p>

                {/* Meta details revealed on hover */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 opacity-70 md:opacity-0 max-h-16 md:max-h-0 overflow-hidden transition-all duration-700 ease-in-out md:group-hover:opacity-70 md:group-hover:max-h-16 text-[10px] font-display-tech text-neutral-400 border-t border-white/10 pt-2">
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
`;

fs.writeFileSync(outPath, code, 'utf8');
console.log(`PortfolioSection.tsx written successfully to ${outPath}`);
